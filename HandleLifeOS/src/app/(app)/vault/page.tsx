'use client'

import { useState, useEffect, useRef } from 'react'
import {
  FolderArchive, Upload, Trash2, Download, FileText, AlertCircle, Plus,
  CreditCard, Scale, Stethoscope, Wallet, GraduationCap, Shield, Car, Home, Receipt, Box, Calendar, Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type Category = 'id' | 'legal' | 'medical' | 'financial' | 'education' | 'insurance' | 'vehicle' | 'property' | 'tax' | 'other'

interface VaultDoc {
  id: string
  user_id: string
  name: string
  category: Category
  storage_path: string
  mime_type: string | null
  size_bytes: number | null
  expires_at: string | null
  notes: string | null
  tags: string[]
  created_at: string
}

const CATEGORIES: { id: Category; label: string; icon: typeof CreditCard; color: string; bg: string }[] = [
  { id: 'id',         label: 'ID & Identity',  icon: CreditCard,    color: 'text-violet-700',  bg: 'bg-violet-50 border-violet-200'  },
  { id: 'legal',      label: 'Legal',          icon: Scale,         color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200'    },
  { id: 'medical',    label: 'Medical',        icon: Stethoscope,   color: 'text-rose-700',    bg: 'bg-rose-50 border-rose-200'      },
  { id: 'financial',  label: 'Financial',      icon: Wallet,        color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200'},
  { id: 'education',  label: 'Education',      icon: GraduationCap, color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200'      },
  { id: 'insurance',  label: 'Insurance',      icon: Shield,        color: 'text-indigo-700',  bg: 'bg-indigo-50 border-indigo-200'  },
  { id: 'vehicle',    label: 'Vehicle',        icon: Car,           color: 'text-sky-700',     bg: 'bg-sky-50 border-sky-200'        },
  { id: 'property',   label: 'Property',       icon: Home,          color: 'text-teal-700',    bg: 'bg-teal-50 border-teal-200'      },
  { id: 'tax',        label: 'Tax',            icon: Receipt,       color: 'text-purple-700',  bg: 'bg-purple-50 border-purple-200'  },
  { id: 'other',      label: 'Other',          icon: Box,           color: 'text-gray-700',    bg: 'bg-gray-50 border-gray-200'      },
]

function catCfg(c: Category) { return CATEGORIES.find(x => x.id === c) ?? CATEGORIES[CATEGORIES.length - 1] }

export default function VaultPage() {
  const [docs, setDocs] = useState<VaultDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCat, setActiveCat] = useState<Category | 'all'>('all')
  const [search, setSearch] = useState('')

  // Upload form
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [docName, setDocName] = useState('')
  const [docCategory, setDocCategory] = useState<Category>('other')
  const [docExpires, setDocExpires] = useState('')
  const [docNotes, setDocNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/vault')
      .then(r => r.json())
      .then(({ documents }) => setDocs(documents ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setPendingFile(f); setDocName(f.name); setError(null)
  }

  async function upload() {
    if (!pendingFile) return
    setError(null); setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', pendingFile)
      fd.append('category', docCategory)
      if (docName.trim()) fd.append('name', docName.trim())
      if (docExpires) fd.append('expires_at', docExpires)
      if (docNotes.trim()) fd.append('notes', docNotes.trim())
      const res = await fetch('/api/vault', { method: 'POST', body: fd })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        setError(j.error ?? 'Upload failed'); return
      }
      const { document: doc } = await res.json()
      setDocs(prev => [doc, ...prev])
      setPendingFile(null); setDocName(''); setDocCategory('other'); setDocExpires(''); setDocNotes('')
      if (fileRef.current) fileRef.current.value = ''
    } finally {
      setUploading(false)
    }
  }

  async function del(id: string) {
    if (!confirm('Delete this document?')) return
    await fetch(`/api/vault?id=${id}`, { method: 'DELETE' })
    setDocs(prev => prev.filter(d => d.id !== id))
  }

  // Filter
  const filtered = docs.filter(d => {
    if (activeCat !== 'all' && d.category !== activeCat) return false
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Counts per category
  const counts = CATEGORIES.reduce((acc, c) => { acc[c.id] = docs.filter(d => d.category === c.id).length; return acc }, {} as Record<Category, number>)

  // Expiring soon
  const now = new Date()
  const in30 = new Date(); in30.setDate(now.getDate() + 30)
  const expiring = docs.filter(d => d.expires_at && new Date(d.expires_at) >= now && new Date(d.expires_at) <= in30)
  const expired  = docs.filter(d => d.expires_at && new Date(d.expires_at) < now)

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-3xl mx-auto space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
            <FolderArchive className="h-4 w-4 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Document Vault</h1>
        </div>
        <p className="text-sm text-gray-400 ml-10">Encrypted at rest · accessible only to you</p>
      </div>

      {/* Expiring alerts */}
      {(expiring.length > 0 || expired.length > 0) && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800 space-y-0.5">
            {expired.length > 0 && <p><strong>{expired.length} document{expired.length === 1 ? '' : 's'} expired</strong></p>}
            {expiring.length > 0 && <p>{expiring.length} expiring in next 30 days — check renewals</p>}
          </div>
        </div>
      )}

      {/* Upload */}
      <div className="rounded-2xl bg-white border border-indigo-100 shadow-sm p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4 text-indigo-500" />
          <p className="text-sm font-bold text-gray-800">Upload</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          data-testid="vault-file-input"
          onChange={onPick}
          accept=".pdf,.png,.jpg,.jpeg,.heic,.doc,.docx,.xls,.xlsx,.txt"
          className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200"
        />
        {pendingFile && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-gray-500">Category</label>
                <select value={docCategory} onChange={e => setDocCategory(e.target.value as Category)} className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                  {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500">Display name</label>
                <input value={docName} onChange={e => setDocName(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-gray-500">Expires (optional)</label>
                <input type="date" value={docExpires} onChange={e => setDocExpires(e.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500">Notes</label>
                <input value={docNotes} onChange={e => setDocNotes(e.target.value)} placeholder="Optional context" className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
              </div>
            </div>
            <p className="text-[11px] text-gray-500">{pendingFile.name} · {Math.round(pendingFile.size / 1024)} KB</p>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button onClick={upload} disabled={uploading} className="flex-1 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40">
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
              <button onClick={() => { setPendingFile(null); setError(null); if (fileRef.current) fileRef.current.value = '' }} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500">Cancel</button>
            </div>
          </>
        )}
        <p className="text-[10px] text-gray-400">Max 25 MB · PDFs, images, Word, Excel · Stored privately in your account</p>
      </div>

      {/* Search + filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search documents…"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCat('all')}
            className={cn('shrink-0 px-3 py-1 rounded-full border text-xs font-semibold',
              activeCat === 'all' ? 'bg-indigo-100 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-500')}
          >
            All ({docs.length})
          </button>
          {CATEGORIES.map(c => counts[c.id] === 0 ? null : (
            <button key={c.id} onClick={() => setActiveCat(c.id)} className={cn(
              'shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold',
              activeCat === c.id ? cn(c.bg, c.color, 'border-current') : 'bg-white border-gray-200 text-gray-500',
            )}>
              <c.icon className="h-3 w-3" />
              {c.label} ({counts[c.id]})
            </button>
          ))}
        </div>
      </div>

      {/* Doc list */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
          <FileText className="h-5 w-5 mx-auto text-gray-400 mb-1" />
          <p className="text-sm text-gray-500">{docs.length === 0 ? 'No documents yet' : 'No matches'}</p>
          <p className="text-xs text-gray-400 mt-1">Upload IDs, contracts, medical records, tax filings, insurance…</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(d => {
            const cfg = catCfg(d.category)
            const expSoon = d.expires_at && new Date(d.expires_at) <= in30
            const isExpired = d.expires_at && new Date(d.expires_at) < now
            const sizeKB = d.size_bytes ? Math.round(d.size_bytes / 1024) : 0
            return (
              <div key={d.id} className={cn('rounded-2xl border p-3 flex items-center gap-3', cfg.bg)}>
                <div className="h-9 w-9 rounded-xl bg-white flex items-center justify-center shrink-0">
                  <cfg.icon className={cn('h-4 w-4', cfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{d.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    {sizeKB > 0 && `${sizeKB} KB · `}
                    {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    {d.expires_at && (
                      <span className={cn('ml-2 inline-flex items-center gap-1 text-[10px] font-bold',
                        isExpired ? 'text-red-700' : expSoon ? 'text-amber-700' : 'text-gray-500')}>
                        <Calendar className="h-2.5 w-2.5" />
                        {isExpired ? 'Expired' : expSoon ? 'Expiring' : 'Expires'} {new Date(d.expires_at + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </p>
                  {d.notes && <p className="text-[11px] text-gray-500 mt-0.5 truncate">{d.notes}</p>}
                </div>
                <a href={`/api/vault/${d.id}/download`} className="p-1.5 rounded-lg text-indigo-500 hover:text-indigo-700 hover:bg-white" title="Download">
                  <Download className="h-4 w-4" />
                </a>
                <button onClick={() => del(d.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
