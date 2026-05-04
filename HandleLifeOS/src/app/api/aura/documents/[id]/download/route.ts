import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/db/client'

const BUCKET = 'aura-documents'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!isSupabaseConfigured()) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })

  const { id } = await params
  const db = getSupabaseAdmin()
  const { data: doc } = await db
    .from('aura_documents')
    .select('storage_path, mime_type, name')
    .eq('id', id)
    .eq('user_id', session.user.id)
    .maybeSingle()

  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Generate a short-lived signed URL (60s)
  const { data: signed } = await db.storage
    .from(BUCKET)
    .createSignedUrl(doc.storage_path, 60, { download: doc.name })
  if (!signed) return NextResponse.json({ error: 'Could not sign URL' }, { status: 500 })

  return NextResponse.redirect(signed.signedUrl)
}
