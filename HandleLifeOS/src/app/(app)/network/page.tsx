'use client'

import { useState, useEffect } from 'react'
import {
  UsersRound, Plus, Trash2, Cake, Star, Phone, Mail, X, MessageSquare,
  Calendar, Search, Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Contact {
  id: string
  user_id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  role: string | null
  group_name: string | null
  birthday: string | null
  anniversary: string | null
  how_we_met: string | null
  notes: string | null
  tags: string[]
  follow_up_at: string | null
  last_contact_at: string | null
  strength: number
  archived: boolean
  created_at: string
  updated_at: string
}

const GROUPS = ['family', 'friends', 'work', 'mentor', 'mentee', 'acquaintance', 'other']

export default function NetworkPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [groupFilter, setGroupFilter] = useState<string>('all')
  const [editing, setEditing] = useState<Contact | null>(null)

  // form fields
  const [f, setF] = useState<Partial<Contact>>({})

  useEffect(() => {
    fetch('/api/network').then(r => r.json()).then(({ contacts }) => setContacts(contacts ?? [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  function openNew() { setF({ strength: 3, group_name: 'friends' }); setEditing(null); setShowForm(true) }
  function openEdit(c: Contact) { setF(c); setEditing(c); setShowForm(true) }

  async function save() {
    if (!f.name?.trim()) return
    const body = { ...f, name: f.name.trim() }
    if (editing) {
      const res = await fetch(`/api/network/${editing.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        const { contact } = await res.json()
        setContacts(prev => prev.map(c => c.id === contact.id ? contact : c))
      }
    } else {
      const res = await fetch('/api/network', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (res.ok) {
        const { contact } = await res.json()
        setContacts(prev => [contact, ...prev])
      }
    }
    setShowForm(false); setF({}); setEditing(null)
  }

  async function del(id: string) {
    if (!confirm('Delete this contact?')) return
    await fetch(`/api/network/${id}`, { method: 'DELETE' })
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  // Filter
  const filtered = contacts.filter(c => {
    if (groupFilter !== 'all' && (c.group_name ?? 'other') !== groupFilter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!c.name.toLowerCase().includes(q)
        && !(c.company?.toLowerCase().includes(q) ?? false)
        && !(c.notes?.toLowerCase().includes(q) ?? false)) return false
    }
    return true
  })

  // Birthdays in next 30 days
  const today = new Date()
  const todayMD = `${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const in30 = new Date(today); in30.setDate(today.getDate() + 30)
  const in30MD = `${String(in30.getMonth() + 1).padStart(2, '0')}-${String(in30.getDate()).padStart(2, '0')}`

  const upcomingBirthdays = contacts.filter(c => {
    if (!c.birthday) return false
    const md = c.birthday.slice(5)
    return todayMD <= in30MD ? (md >= todayMD && md <= in30MD) : (md >= todayMD || md <= in30MD)
  }).sort((a, b) => (a.birthday ?? '').slice(5).localeCompare((b.birthday ?? '').slice(5)))

  // Follow-ups
  const followUps = contacts.filter(c => c.follow_up_at && c.follow_up_at >= today.toISOString().slice(0, 10) && c.follow_up_at <= in30.toISOString().slice(0, 10))

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center shadow-md shadow-pink-200">
              <UsersRound className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Network</h1>
          </div>
          <p className="text-sm text-gray-400 ml-10">Stay connected · remember the small things</p>
        </div>
        <button
          onClick={openNew}
          className="px-3 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 flex items-center gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add
        </button>
      </div>

      {/* Upcoming birthdays + follow-ups */}
      {(upcomingBirthdays.length > 0 || followUps.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {upcomingBirthdays.length > 0 && (
            <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Cake className="h-4 w-4 text-pink-600" />
                <p className="text-xs font-bold text-pink-700 uppercase tracking-wider">Birthdays · 30 days</p>
              </div>
              <div className="space-y-1">
                {upcomingBirthdays.slice(0, 5).map(c => (
                  <p key={c.id} className="text-xs text-gray-700">
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-pink-600 ml-2">{new Date(c.birthday + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
          {followUps.length > 0 && (
            <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Follow-ups due</p>
              </div>
              <div className="space-y-1">
                {followUps.slice(0, 5).map(c => (
                  <p key={c.id} className="text-xs text-gray-700">
                    <span className="font-semibold">{c.name}</span>
                    <span className="text-amber-600 ml-2">{new Date(c.follow_up_at + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search + filters */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, company, notes…" className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-white text-sm" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          <button onClick={() => setGroupFilter('all')} className={cn('shrink-0 px-3 py-1 rounded-full border text-xs font-semibold', groupFilter === 'all' ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-white border-gray-200 text-gray-500')}>
            All ({contacts.length})
          </button>
          {GROUPS.map(g => {
            const count = contacts.filter(c => (c.group_name ?? 'other') === g).length
            if (count === 0) return null
            return (
              <button key={g} onClick={() => setGroupFilter(g)} className={cn('shrink-0 px-3 py-1 rounded-full border text-xs font-semibold capitalize', groupFilter === g ? 'bg-rose-100 border-rose-300 text-rose-700' : 'bg-white border-gray-200 text-gray-500')}>
                {g} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Form */}
      {showForm && <ContactForm f={f} setF={setF} onSave={save} onCancel={() => { setShowForm(false); setF({}); setEditing(null) }} editing={!!editing} />}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-5 w-5 rounded-full border-2 border-rose-500 border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
          <UsersRound className="h-5 w-5 mx-auto text-gray-400 mb-1" />
          <p className="text-sm text-gray-500">{contacts.length === 0 ? 'No contacts yet' : 'No matches'}</p>
          <p className="text-xs text-gray-400 mt-1">Track family, friends, mentors — capture birthdays and follow-ups.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => (
            <div key={c.id} className="rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm p-3">
              <div className="flex items-start gap-3">
                <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-bold',
                  'bg-gradient-to-br from-rose-200 to-pink-300 text-rose-800')}>
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-gray-800">{c.name}</p>
                    {c.group_name && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 uppercase">{c.group_name}</span>}
                    <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn('h-2.5 w-2.5', i < c.strength ? 'fill-amber-400 text-amber-400' : 'text-gray-200')} />)}</div>
                  </div>
                  {(c.role || c.company) && <p className="text-[11px] text-gray-500 mt-0.5">{[c.role, c.company].filter(Boolean).join(' · ')}</p>}
                  <div className="flex flex-wrap gap-3 mt-1 text-[11px] text-gray-500">
                    {c.email && <span className="flex items-center gap-1"><Mail className="h-2.5 w-2.5" />{c.email}</span>}
                    {c.phone && <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{c.phone}</span>}
                    {c.birthday && <span className="flex items-center gap-1 text-pink-600"><Cake className="h-2.5 w-2.5" />{new Date(c.birthday + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                    {c.follow_up_at && <span className="flex items-center gap-1 text-amber-600"><Calendar className="h-2.5 w-2.5" />Follow-up {new Date(c.follow_up_at + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                  </div>
                  {c.notes && <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">{c.notes}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 text-[11px]">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => del(c.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ContactForm({ f, setF, onSave, onCancel, editing }: {
  f: Partial<Contact>
  setF: (f: Partial<Contact>) => void
  onSave: () => void
  onCancel: () => void
  editing: boolean
}) {
  const upd = <K extends keyof Contact>(k: K, v: Contact[K] | undefined) => setF({ ...f, [k]: v as never })
  return (
    <div className="rounded-2xl bg-white border border-rose-100 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-800">{editing ? 'Edit contact' : 'New contact'}</p>
        <button onClick={onCancel} className="text-gray-400 p-1"><X className="h-4 w-4" /></button>
      </div>
      <input value={f.name ?? ''} onChange={e => upd('name', e.target.value)} placeholder="Name *" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
      <div className="grid grid-cols-2 gap-2">
        <input value={f.email ?? ''} onChange={e => upd('email', e.target.value)} placeholder="Email" className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
        <input value={f.phone ?? ''} onChange={e => upd('phone', e.target.value)} placeholder="Phone" className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input value={f.company ?? ''} onChange={e => upd('company', e.target.value)} placeholder="Company" className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
        <input value={f.role ?? ''} onChange={e => upd('role', e.target.value)} placeholder="Role" className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <select value={f.group_name ?? 'friends'} onChange={e => upd('group_name', e.target.value)} className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
          {GROUPS.map(g => <option key={g} value={g} className="capitalize">{g}</option>)}
        </select>
        <div>
          <label className="text-[10px] font-semibold text-gray-500">Strength</label>
          <input type="range" min={1} max={5} value={f.strength ?? 3} onChange={e => upd('strength', Number(e.target.value) as Contact['strength'])} className="w-full accent-rose-500" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] font-semibold text-gray-500">Birthday</label>
          <input type="date" value={f.birthday ?? ''} onChange={e => upd('birthday', e.target.value || null)} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="text-[10px] font-semibold text-gray-500">Follow-up</label>
          <input type="date" value={f.follow_up_at ?? ''} onChange={e => upd('follow_up_at', e.target.value || null)} className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
        </div>
      </div>
      <textarea value={f.notes ?? ''} onChange={e => upd('notes', e.target.value)} rows={2} placeholder="Notes — how we met, what they're working on, kids' names…" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm resize-none" />
      <div className="flex gap-2">
        <button onClick={onSave} disabled={!f.name?.trim()} className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-40">
          {editing ? 'Save changes' : 'Add contact'}
        </button>
        <button onClick={onCancel} className="px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-500">Cancel</button>
      </div>
    </div>
  )
}
