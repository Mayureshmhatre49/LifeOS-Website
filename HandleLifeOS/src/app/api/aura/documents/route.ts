import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { z } from 'zod'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { validateUpload, sanitizeFilename } from '@/lib/security/file-upload'

const BUCKET = 'aura-documents'
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

const docTypeSchema = z.enum(['iep', '504', 'evaluation', 'medical', 'vaccination', 'other'])
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Verify the child profile belongs to the requesting user. */
async function assertChildOwnership(childId: string, userId: string): Promise<boolean> {
  const db = getSupabaseAdmin()
  const { data } = await db.from('aura_profiles').select('id').eq('id', childId).eq('user_id', userId).maybeSingle()
  return !!data
}

// List documents for the user, optionally filtered by child_id
export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ documents: [] })

  const { searchParams } = new URL(req.url)
  const childId = searchParams.get('child_id')

  const db = getSupabaseAdmin()
  let q = db.from('aura_documents').select('*').eq('user_id', session.user.id).order('created_at', { ascending: false })
  if (childId) q = q.eq('child_id', childId)
  const { data } = await q
  return NextResponse.json({ documents: data ?? [] })
}

// Upload a document (multipart/form-data: file, child_id?, doc_type, name?)
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })

  const file = form.get('file')
  const docTypeRaw = String(form.get('doc_type') ?? '')
  const childId = form.get('child_id') ? String(form.get('child_id')) : null
  const userName = form.get('name') ? String(form.get('name')) : null

  if (!(file instanceof File)) return NextResponse.json({ error: 'Missing file' }, { status: 400 })

  const docTypeParsed = docTypeSchema.safeParse(docTypeRaw)
  if (!docTypeParsed.success) return NextResponse.json({ error: 'Invalid doc_type' }, { status: 400 })

  // CRITICAL: child_id must reference a profile owned by the user.
  if (childId !== null) {
    if (!UUID_RE.test(childId)) {
      return NextResponse.json({ error: 'Invalid child_id' }, { status: 400 })
    }
    if (!(await assertChildOwnership(childId, session.user.id))) {
      // Don't leak existence of profile — return 404
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
  }

  // Magic-byte validation + filename sanitization
  const validation = await validateUpload(file, { maxBytes: MAX_BYTES })
  if (!validation.ok) {
    return NextResponse.json({ error: validation.reason ?? 'File rejected' }, { status: 400 })
  }

  const userId = session.user.id
  const docId = crypto.randomUUID()
  const storagePath = `${userId}/${docId}.${validation.ext}`
  const safeUserName = userName ? sanitizeFilename(userName) : null

  const db = getSupabaseAdmin()
  const buf = Buffer.from(await file.arrayBuffer())

  const { error: upErr } = await db.storage
    .from(BUCKET)
    .upload(storagePath, buf, { contentType: validation.detectedMime!, upsert: false })
  if (upErr) {
    console.error('[aura/documents upload] storage error')
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }

  const { data, error } = await db
    .from('aura_documents')
    .insert({
      id: docId,
      user_id: userId,
      child_id: childId,
      name: safeUserName || validation.safeName!,
      doc_type: docTypeParsed.data,
      storage_path: storagePath,
      mime_type: validation.detectedMime!,
      size_bytes: file.size,
    })
    .select()
    .single()

  if (error) {
    // best-effort cleanup
    await db.storage.from(BUCKET).remove([storagePath]).catch(() => {})
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ document: data }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const db = getSupabaseAdmin()
  // Find the doc to get its storage path
  const { data: doc } = await db.from('aura_documents').select('storage_path').eq('id', id).eq('user_id', session.user.id).maybeSingle()
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Remove file then row
  await db.storage.from(BUCKET).remove([doc.storage_path]).catch(() => {})
  await db.from('aura_documents').delete().eq('id', id).eq('user_id', session.user.id)

  return NextResponse.json({ ok: true })
}
