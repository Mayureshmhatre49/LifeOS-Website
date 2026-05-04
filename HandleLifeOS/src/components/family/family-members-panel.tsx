'use client'

import { useState } from 'react'
import type { FamilyMember, FamilyRole } from '@/types/family'
import { ROLE_LABELS, ROLE_CAN_MANAGE } from '@/types/family'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { UserPlus, UserMinus, Crown } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROLES: FamilyRole[] = ['partner', 'adult', 'teen', 'child', 'elder']

const ROLE_COLORS: Record<FamilyRole, string> = {
  owner: 'bg-amber-100 text-amber-700',
  partner: 'bg-indigo-100 text-indigo-700',
  adult: 'bg-blue-100 text-blue-700',
  teen: 'bg-green-100 text-green-700',
  child: 'bg-pink-100 text-pink-700',
  elder: 'bg-orange-100 text-orange-700',
}

interface Props {
  members: FamilyMember[]
  currentUserId: string
  currentRole: FamilyRole
  familyId: string
  onInvite: (email: string, role: FamilyRole, displayName?: string) => Promise<void>
  onRemove: (memberId: string) => Promise<void>
}

export function FamilyMembersPanel({ members, currentUserId, currentRole, familyId, onInvite, onRemove }: Props) {
  const [adding, setAdding] = useState(false)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<FamilyRole>('adult')
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const canManage = ROLE_CAN_MANAGE.includes(currentRole)
  const active = members.filter(m => m.status === 'active')
  const invited = members.filter(m => m.status === 'invited')

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSaving(true)
    setError('')
    try {
      await onInvite(email.trim(), role, displayName.trim() || undefined)
      setEmail(''); setDisplayName(''); setAdding(false)
    } catch {
      setError('Failed to invite member. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function memberDisplay(m: FamilyMember) {
    return m.display_name ?? m.invited_email?.split('@')[0] ?? 'Member'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Members <span className="text-gray-400 font-normal">({active.length})</span>
        </h3>
        {canManage && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
            <UserPlus className="h-3.5 w-3.5" />
            Invite
          </button>
        )}
      </div>

      {adding && (
        <form onSubmit={handleInvite} className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 space-y-3">
          <div>
            <Label className="text-xs">Email address</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="family@email.com" className="mt-1" autoFocus required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Role</Label>
              <select value={role} onChange={e => setRole(e.target.value as FamilyRole)} className="mt-1 w-full rounded-md border border-gray-200 bg-white px-2 py-1.5 text-sm">
                {ROLES.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
              </select>
            </div>
            <div>
              <Label className="text-xs">Display name (optional)</Label>
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Mum" className="mt-1 h-8 text-sm" />
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={saving}>{saving ? 'Inviting…' : 'Send invite'}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => { setAdding(false); setError('') }}>Cancel</Button>
          </div>
        </form>
      )}

      <ul className="space-y-2">
        {active.map(m => (
          <li key={m.id} className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-3 py-2.5 group">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 shrink-0 text-xs font-semibold text-gray-600">
              {memberDisplay(m).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-900">{memberDisplay(m)}</span>
                {m.role === 'owner' && <Crown className="h-3 w-3 text-amber-500" />}
              </div>
              <p className="text-xs text-gray-400">{m.invited_email}</p>
            </div>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', ROLE_COLORS[m.role])}>
              {ROLE_LABELS[m.role]}
            </span>
            {canManage && m.user_id !== currentUserId && m.role !== 'owner' && (
              <button onClick={() => onRemove(m.id)} className="hidden group-hover:block text-gray-300 hover:text-red-400 shrink-0">
                <UserMinus className="h-3.5 w-3.5" />
              </button>
            )}
          </li>
        ))}
      </ul>

      {invited.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2">Pending invites ({invited.length})</p>
          <ul className="space-y-1.5">
            {invited.map(m => (
              <li key={m.id} className="flex items-center gap-2 rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2">
                <span className="flex-1 text-xs text-gray-500">{m.invited_email}</span>
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', ROLE_COLORS[m.role])}>
                  {ROLE_LABELS[m.role]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
