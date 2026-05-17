import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'
import { validateUpload, sanitizeFilename } from '@/lib/security/file-upload'

const BUCKET = 'vault-documents'
const MAX_BYTES = 20 * 1024 * 1024 // 20 MB for property docs

const DOC_CATEGORIES = [
  'sale_deed','agreement_to_sale','lease','society_share','mutation',
  'tax_receipt','encumbrance','na_order','survey_map','oc_cc',
  'title_report','poa','loan_agreement','insurance','deposit_receipt',
  'rent_receipt','structural_drawing','electrical_drawing','plumbing_layout',
  'hvac','solar','dg','appliance_manual','warranty','other',
] as const

async function assertPropertyOwner(propertyId: string, userId: string): Promise<boolean> {
  if (!isSupabaseConfigured()) return false
  const { data } = await getSupabaseAdmin()
    .from('properties')
    .select('id')
    .eq('id', propertyId)
    .eq('user_id', userId)
    .maybeSingle()
  return !!data
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ documents: [] })

  const { id } = await params
  if (!await assertPropertyOwner(id, session.user.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const docId = new URL(req.url).searchParams.get('docId')
  if (docId) {
    const db = getSupabaseAdmin()
    const { data: doc } = await db
      .from('property_documents')
      .select('storage_path')
      .eq('id', docId)
      .eq('property_id', id)
      .eq('user_id', session.user.id)
      .maybeSingle()
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const { data: signed } = await db.storage.from(BUCKET).createSignedUrl(doc.storage_path, 300)
    return NextResponse.json({ url: signed?.signedUrl })
  }

  const { data } = await getSupabaseAdmin()
    .from('property_documents')
    .select('*')
    .eq('property_id', id)
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ documents: data ?? [] })
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { id } = await params
  if (!await assertPropertyOwner(id, session.user.id)) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const form = await req.formData().catch(() => null)
  if (!form) return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })

  const file      = form.get('file')
  const category  = String(form.get('category') ?? 'other')
  const userName  = form.get('name') ? String(form.get('name')) : null
  const expiresAt = form.get('expires_at') ? String(form.get('expires_at')) : null
  const notes     = form.get('notes') ? String(form.get('notes')) : null

  if (!(file instanceof File)) return NextResponse.json({ error: 'Missing file' }, { status: 400 })
  if (!DOC_CATEGORIES.includes(category as typeof DOC_CATEGORIES[number])) {
    return NextResponse.json({ error: 'Invalid category' }, { status: 400 })
  }

  const validation = await validateUpload(file, { maxBytes: MAX_BYTES })
  if (!validation.ok) return NextResponse.json({ error: validation.reason ?? 'File rejected' }, { status: 400 })

  const userId  = session.user.id
  const docId   = crypto.randomUUID()
  const storagePath = `${userId}/${docId}.${validation.ext}`

  const safeUserName   = userName ? sanitizeFilename(userName) : null
  const expiresAtSafe  = expiresAt && /^\d{4}-\d{2}-\d{2}$/.test(expiresAt) ? expiresAt : null
  const safeNotes      = notes ? String(notes).slice(0, 5000) : null

  const db  = getSupabaseAdmin()
  const buf = Buffer.from(await file.arrayBuffer())

  const { error: upErr } = await db.storage.from(BUCKET).upload(storagePath, buf, {
    contentType: validation.detectedMime!,
    upsert: false,
  })
  if (upErr) return NextResponse.json({ error: 'Upload failed' }, { status: 500 })

  const { data, error } = await db
    .from('property_documents')
    .insert({
      id: docId,
      user_id: userId,
      property_id: id,
      name: safeUserName || validation.safeName!,
      category,
      storage_path: storagePath,
      mime_type: validation.detectedMime!,
      size_bytes: file.size,
      expires_at: expiresAtSafe,
      notes: safeNotes,
    })
    .select()
    .single()

  if (error) {
    await db.storage.from(BUCKET).remove([storagePath])
    return NextResponse.json({ error: 'Database operation failed' }, { status: 500 })
  }

  return NextResponse.json({ document: data }, { status: 201 })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { id } = await params
  const docId = new URL(req.url).searchParams.get('docId')
  if (!docId) return NextResponse.json({ error: 'Missing docId' }, { status: 400 })

  const db = getSupabaseAdmin()
  const { data: doc } = await db
    .from('property_documents')
    .select('storage_path')
    .eq('id', docId)
    .eq('property_id', id)
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

  await Promise.all([
    db.storage.from(BUCKET).remove([doc.storage_path]),
    db.from('property_documents').delete().eq('id', docId).eq('user_id', session.user.id),
  ])

  return NextResponse.json({ ok: true })
}

