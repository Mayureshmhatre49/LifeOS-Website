'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, FolderArchive, Upload, Trash2, Download, FileText, AlertCircle,
} from 'lucide-react'
import type { AuraChildProfile } from '@/types/aura'
import { AuraChildSwitcher, getStoredChildId, storeSelectedChildId } from '@/components/aura/AuraChildSwitcher'
import { cn } from '@/lib/utils'

type DocType = 'iep' | '504' | 'evaluation' | 'medical' | 'vaccination' | 'other'

interface AuraDocument {
  id: string
  user_id: string
  child_id: string | null
  name: string
  doc_type: DocType
  storage_path: string
  mime_type: string | null
  size_bytes: number | null
  notes: string | null
  created_at: string
}

const DOC_TYPE_LABELS: Record<DocType, { label: string; bg: string; color: string }> = {
  iep:         { label: 'IEP',           bg: 'bg-violet-50 border-violet-200', color: 'text-violet-700' },
  '504':       { label: '504 Plan',      bg: 'bg-purple-50 border-purple-200', color: 'text-purple-700' },
  evaluation:  { label: 'Evaluation',    bg: 'bg-indigo-50 border-indigo-200', color: 'text-indigo-700' },
  medical:     { label: 'Medical',       bg: 'bg-rose-50 border-rose-200',     color: 'text-rose-700' },
  vaccination: { label: 'Vaccination',   bg: 'bg-amber-50 border-amber-200',   color: 'text-amber-700' },
  other:       { label: 'Other',         bg: 'bg-gray-50 border-gray-200',     color: 'text-gray-700' },
}

export default function AuraDocumentsPage() {
  const [profiles, setProfiles] = useState<AuraChildProfile[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [docs, setDocs] = useState<AuraDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [docType, setDocType] = useState<DocType>('other')
  const [docName, setDocName] = useState('')

  useEffect(() => {
    fetch('/api/family/aura/profiles')
      .then(r => r.json())
      .then(({ profiles }) => {
        const list: AuraChildProfile[] = profiles ?? []
        setProfiles(list)
        const stored = getStoredChildId()
        const valid = stored && list.some(c => c.id === stored)
        setSelectedId(valid ? stored : (list[0]?.id ?? null))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/aura/documents')
      .then(r => r.json())
      .then(({ documents }) => setDocs(documents ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleSelect(id: string) {
    setSelectedId(id)
    storeSelectedChildId(id)
  }

  function onFilePicked(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    setDocName(file.name)
    setError(null)
  }

  async function handleUpload() {
    if (!pendingFile) return
    setError(null); setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', pendingFile)
      fd.append('doc_type', docType)
      if (selectedId) fd.append('child_id', selectedId)
      if (docName.trim()) fd.append('name', docName.trim())
      const res = await fetch('/api/aura/documents', { method: 'POST', body: fd })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error ?? 'Upload failed')
        return
      }
      const { document: doc } = await res.json()
      setDocs(prev => [doc, ...prev])
      setPendingFile(null); setDocName(''); setDocType('other')
      if (fileInputRef.current) fileInputRef.current.value = ''
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this document permanently?')) return
    await fetch(`/api/aura/documents?id=${id}`, { method: 'DELETE' })
    setDocs(prev => prev.filter(d => d.id !== id))
  }

  const filtered = selectedId
    ? docs.filter(d => d.child_id === selectedId || d.child_id === null)
    : docs

  // Group by doc_type
  const grouped = (() => {
    const map = new Map<DocType, AuraDocument[]>()
    for (const d of filtered) {
      const list = map.get(d.doc_type) ?? []
      list.push(d)
      map.set(d.doc_type, list)
    }
    return [...map.entries()]
  })()

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/aura" className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-4 w-4 text-gray-500" />
        </Link>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <FolderArchive className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Document Vault</h1>
        </div>
      </div>

      {profiles.length > 0 && (
        <AuraChildSwitcher children={profiles} selectedId={selectedId} onSelect={handleSelect} />
      )}

      {/* Upload */}
      <div className="rounded-2xl bg-white border border-indigo-100 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-indigo-500" />
          <p className="text-sm font-bold text-gray-800">Upload</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          onChange={onFilePicked}
          accept=".pdf,.png,.jpg,.jpeg,.heic,.doc,.docx"
          className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
        />

        {pendingFile && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-gray-500">Document type</label>
                <select value={docType} onChange={e => setDocType(e.target.value as DocType)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                  {(Object.entries(DOC_TYPE_LABELS) as [DocType, typeof DOC_TYPE_LABELS[DocType]][]).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500">Display name</label>
                <input value={docName} onChange={e => setDocName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
              </div>
            </div>

            <p className="text-[11px] text-gray-500">
              {pendingFile.name} · {(pendingFile.size / 1024).toFixed(0)} KB
            </p>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 flex items-start gap-2">
                <AlertCircle className="h-3.5 w-3.5 text-red-600 mt-0.5" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={handleUpload} disabled={uploading} className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40">
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
              <button onClick={() => { setPendingFile(null); setError(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500">
                Cancel
              </button>
            </div>
          </>
        )}

        <p className="text-[10px] text-gray-400">
          Max 10 MB · PDFs, images, Word docs · Stored privately in your account
        </p>
      </div>

      {/* Documents list */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <div className="animate-spin h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
          <FileText className="h-5 w-5 mx-auto text-gray-400 mb-1" />
          <p className="text-sm text-gray-500">No documents yet.</p>
          <p className="text-xs text-gray-400 mt-1">Upload IEP PDFs, evaluation reports, vaccination cards, etc.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(([type, list]) => {
            const cfg = DOC_TYPE_LABELS[type]
            return (
              <div key={type} className="space-y-1.5">
                <p className={cn('text-[10px] font-bold uppercase tracking-wider px-1', cfg.color)}>
                  {cfg.label} ({list.length})
                </p>
                {list.map(doc => (
                  <DocRow key={doc.id} doc={doc} cfg={cfg} onDelete={() => handleDelete(doc.id)} />
                ))}
              </div>
            )
          })}
        </div>
      )}

      <p className="text-[11px] text-gray-400 leading-relaxed text-center">
        Files are encrypted in Supabase Storage and only accessible to you. Delete any time.
      </p>
    </div>
  )
}

function DocRow({ doc, cfg, onDelete }: {
  doc: AuraDocument
  cfg: { label: string; bg: string; color: string }
  onDelete: () => void
}) {
  const sizeKB = doc.size_bytes ? Math.round(doc.size_bytes / 1024) : 0
  return (
    <div className={cn('rounded-2xl border p-3 flex items-center gap-3', cfg.bg)}>
      <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shrink-0">
        <FileText className={cn('h-4 w-4', cfg.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{doc.name}</p>
        <p className="text-[10px] text-gray-500 mt-0.5">
          {sizeKB > 0 && `${sizeKB} KB · `}
          {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        {doc.notes && <p className="text-[11px] text-gray-500 mt-0.5 truncate">{doc.notes}</p>}
      </div>
      <a
        href={`/api/aura/documents/${doc.id}/download`}
        className="p-1.5 rounded-lg text-indigo-500 hover:text-indigo-700 hover:bg-white"
        title="Download"
      >
        <Download className="h-4 w-4" />
      </a>
      <button onClick={onDelete} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}
