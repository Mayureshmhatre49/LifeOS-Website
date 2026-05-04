import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { validateUpload, sanitizeFilename } from '@/lib/security/file-upload'

const BUCKET = 'vault-documents'
const MAX_BYTES = 10 * 1024 * 1024 // 10MB (matches storage bucket cap)
const CATEGORIES = ['id','legal','medical','financial','education','insurance','vehicle','property','tax','other'] as const

const categorySchema = z.enum(CATEGORIES)

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ documents: [] })

  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const db = getSupabaseAdmin()
  let q = db.from('vault_documents').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
  if (category) q = q.eq('category', category)
  const { data } = await q
  return NextResponse.json({ documents: data ?? [] })
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })

  const file = form.get('file')
  const categoryRaw = String(form.get('category') ?? '')
  const userName = form.get('name') ? String(form.get('name')) : null
  const expiresAt = form.get('expires_at') ? String(form.get('expires_at')) : null
  const notes = form.get('notes') ? String(form.get('notes')) : null

  if (!(file instanceof File)) return NextResponse.json({ error: 'Missing file' }, { status: 400 })

  const cat = categorySchema.safeParse(categoryRaw)
  if (!cat.success) return NextResponse.json({ error: 'Invalid category' }, { status: 400 })

  // Server-side magic-byte validation + filename sanitization
  const validation = await validateUpload(file, { maxBytes: MAX_BYTES })
  if (!validation.ok) {
    return NextResponse.json({ error: validation.reason ?? 'File rejected' }, { status: 400 })
  }

  const userId = session.user.id
  const docId = crypto.randomUUID()
  const storagePath = `${userId}/${docId}.${validation.ext}`

  // Validate optional fields
  const safeUserName = userName ? sanitizeFilename(userName) : null
  const expiresAtParsed = expiresAt && /^\d{4}-\d{2}-\d{2}$/.test(expiresAt) ? expiresAt : null
  const safeNotes = notes ? String(notes).slice(0, 5000) : null

  const db = getSupabaseAdmin()
  const buf = Buffer.from(await file.arrayBuffer())

  const { error: upErr } = await db.storage.from(BUCKET).upload(storagePath, buf, {
    contentType: validation.detectedMime!,  // Use sniffed type, not client-claimed
    upsert: false,
  })
  if (upErr) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const { data, error } = await db.from('vault_documents').insert({
    id: docId, user_id: userId,
    name: safeUserName || validation.safeName!,
    category: cat.data,
    storage_path: storagePath,
    mime_type: validation.detectedMime!,
    size_bytes: file.size,
    expires_at: expiresAtParsed,
    notes: safeNotes,
  }).select().single()

  if (error) {
    await db.storage.from(BUCKET).remove([storagePath]).catch(() => {})
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ document: data }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const db = getSupabaseAdmin()
  const { data: doc } = await db.from('vault_documents').select('storage_path').eq('id', id).eq('user_id', session.user.id).maybeSingle()
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db.storage.from(BUCKET).remove([doc.storage_path]).catch(() => {})
  await db.from('vault_documents').delete().eq('id', id).eq('user_id', session.user.id)
  return NextResponse.json({ ok: true })
}
