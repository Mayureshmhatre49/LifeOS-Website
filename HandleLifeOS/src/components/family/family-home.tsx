'use client'

import { useState, useEffect, useCallback } from 'react'
import type {
  Family,
  FamilyMember,
  SharedTask,
  FamilyEvent,
  GroceryItem,
  GroceryList,
  ElderProfile,
  ChildProfile,
  SharedTaskCategory,
  FamilyEventType,
  FamilyRole,
} from '@/types/family'
import { ROLE_CAN_MANAGE } from '@/types/family'
import { FamilySetup } from './family-setup'
import { SharedTaskBoard } from './shared-task-board'
import { GroceryList as GroceryListPanel } from './grocery-list'
import { FamilyCalendarStrip } from './family-calendar-strip'
import { AskFamilyAI } from './ask-family-ai'
import { FamilyMembersPanel } from './family-members-panel'
import { ElderCards, ChildCards } from './elder-child-cards'
import { Users, Home, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function FamilyHome({ userId, defaultTab = 'home' }: { userId: string; defaultTab?: 'home' | 'tasks' | 'grocery' | 'members' }) {
  const [family, setFamily] = useState<Family | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [tasks, setTasks] = useState<SharedTask[]>([])
  const [events, setEvents] = useState<FamilyEvent[]>([])
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null)
  const [groceryItems, setGroceryItems] = useState<GroceryItem[]>([])
  const [elders, setElders] = useState<ElderProfile[]>([])
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'home' | 'tasks' | 'grocery' | 'members'>(defaultTab)

  const userMembership = members.find(m => m.user_id === userId && m.status === 'active')
  const userRole = userMembership?.role ?? 'adult'
  const canManage = ROLE_CAN_MANAGE.includes(userRole)

  const load = useCallback(async (fId: string) => {
    const [mRes, tRes, eRes, gRes, elRes, chRes] = await Promise.all([
      fetch(`/api/family/members?family_id=${fId}`).then(r => r.json()),
      fetch(`/api/family/tasks?family_id=${fId}`).then(r => r.json()),
      fetch(`/api/family/events?family_id=${fId}`).then(r => r.json()),
      fetch(`/api/family/grocery?family_id=${fId}`).then(r => r.json()),
      fetch(`/api/family/elders?family_id=${fId}`).then(r => r.json()),
      fetch(`/api/family/children?family_id=${fId}`).then(r => r.json()),
    ])
    setMembers(mRes.members ?? [])
    setTasks(tRes.tasks ?? [])
    setEvents(eRes.events ?? [])
    setGroceryList(gRes.list ?? null)
    setGroceryItems(gRes.items ?? [])
    setElders(elRes.elders ?? [])
    setChildren(chRes.children ?? [])
  }, [])

  useEffect(() => {
    async function init() {
      const res = await fetch('/api/family').then(r => r.json())
      const families: Family[] = res.families ?? []
      if (families.length > 0) {
        setFamily(families[0])
        await load(families[0].id)
      }
      setLoading(false)
    }
    init()
  }, [load])

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent" /></div>
  }

  if (!family) {
    return <FamilySetup onCreated={async (id, name) => { setFamily({ id, name, created_by: userId, created_at: '', updated_at: '' }); await load(id) }} />
  }

  async function handleAddTask(data: { title: string; category?: SharedTaskCategory; assigned_to?: string; due_date?: string }) {
    const res = await fetch('/api/family/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ family_id: family!.id, ...data }) })
    const json = await res.json()
    if (json.task) setTasks(prev => [json.task, ...prev])
  }

  async function handleToggleTask(id: string, status: 'pending' | 'done') {
    const res = await fetch(`/api/family/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ family_id: family!.id, status }) })
    const json = await res.json()
    if (json.task) setTasks(prev => prev.map(t => t.id === id ? json.task : t))
  }

  async function handleDeleteTask(id: string) {
    await fetch(`/api/family/tasks/${id}?family_id=${family!.id}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  async function handleAddEvent(data: { title: string; event_type?: FamilyEventType; start_date: string; notes?: string }) {
    const res = await fetch('/api/family/events', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ family_id: family!.id, ...data }) })
    const json = await res.json()
    if (json.event) setEvents(prev => [...prev, json.event].sort((a, b) => a.start_date.localeCompare(b.start_date)))
  }

  async function handleDeleteEvent(id: string) {
    await fetch(`/api/family/events/${id}?family_id=${family!.id}`, { method: 'DELETE' })
    setEvents(prev => prev.filter(e => e.id !== id))
  }

  async function handleAddGrocery(data: { name: string; quantity?: string; category?: string }) {
    const res = await fetch('/api/family/grocery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ family_id: family!.id, ...data }) })
    const json = await res.json()
    if (json.item) setGroceryItems(prev => [...prev, json.item])
  }

  async function handleToggleGrocery(id: string, isBought: boolean) {
    const res = await fetch(`/api/family/grocery/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ family_id: family!.id, is_bought: isBought }) })
    const json = await res.json()
    if (json.item) setGroceryItems(prev => prev.map(i => i.id === id ? json.item : i))
  }

  async function handleDeleteGrocery(id: string) {
    await fetch(`/api/family/grocery/${id}?family_id=${family!.id}`, { method: 'DELETE' })
    setGroceryItems(prev => prev.filter(i => i.id !== id))
  }

  async function handleClearBought() {
    if (!groceryList) return
    await fetch(`/api/family/grocery/clear`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ family_id: family!.id, list_id: groceryList.id }) })
    setGroceryItems(prev => prev.filter(i => !i.is_bought))
  }

  async function handleSuggestGroceries(): Promise<string[]> {
    const res = await fetch('/api/family/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'suggest_groceries', family_id: family!.id }) })
    const json = await res.json()
    return json.suggestions ?? []
  }

  async function handleInvite(email: string, role: FamilyRole, displayName?: string) {
    const res = await fetch('/api/family/members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ family_id: family!.id, invited_email: email, role, display_name: displayName }) })
    const json = await res.json()
    if (json.member) setMembers(prev => [...prev, json.member])
  }

  async function handleRemoveMember(memberId: string) {
    await fetch(`/api/family/members/${memberId}?family_id=${family!.id}`, { method: 'DELETE' })
    setMembers(prev => prev.filter(m => m.id !== memberId))
  }

  async function handleAddElder(data: { full_name: string; medicines?: string[]; conditions?: string; emergency_contact?: string }) {
    const res = await fetch('/api/family/elders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ family_id: family!.id, ...data }) })
    const json = await res.json()
    if (json.elder) setElders(prev => [...prev, json.elder])
  }

  async function handleDeleteElder(id: string) {
    await fetch(`/api/family/elders/${id}`, { method: 'DELETE' })
    setElders(prev => prev.filter(e => e.id !== id))
  }

  async function handleAddChild(data: { full_name: string; age?: number; school_name?: string; class_grade?: string }) {
    const res = await fetch('/api/family/children', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ family_id: family!.id, ...data }) })
    const json = await res.json()
    if (json.child) setChildren(prev => [...prev, json.child])
  }

  async function handleDeleteChild(id: string) {
    await fetch(`/api/family/children/${id}`, { method: 'DELETE' })
    setChildren(prev => prev.filter(c => c.id !== id))
  }

  async function handleAI(action: string, extra?: string) {
    const body: Record<string, unknown> = { action, family_id: family!.id }
    if (action === 'mental_load') body.message = extra
    if (action === 'checklist') body.context = extra
    const res = await fetch('/api/family/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const json = await res.json()
    return json.result ?? null
  }

  const TABS = [
    { id: 'home', label: 'Home', icon: <Home className="h-4 w-4" /> },
    { id: 'tasks', label: 'Tasks', icon: null },
    { id: 'grocery', label: 'Grocery', icon: null },
    { id: 'members', label: 'Members', icon: <Users className="h-4 w-4" /> },
  ] as const

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{family.name}</h2>
        <p className="text-xs text-gray-400">{members.filter(m => m.status === 'active').length} members · Your role: {userRole}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Home tab */}
      {activeTab === 'home' && (
        <div className="space-y-6">
          {/* AURA — child development hub */}
          <Link
            href="/aura"
            className="block rounded-2xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-purple-600 text-white p-4 shadow-md shadow-pink-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">AURA</p>
                  <span className="text-[9px] font-bold bg-white/25 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Child Dev</span>
                </div>
                <p className="text-[11px] text-white/85 mt-0.5">Milestones · Neuroadaptive alerts · AI parenting guidance</p>
              </div>
              <ArrowRight className="h-4 w-4 text-white/80 shrink-0" />
            </div>
          </Link>

          <AskFamilyAI familyId={family.id} onSubmit={handleAI} />
          <SharedTaskBoard
            tasks={tasks.slice(0, 5)}
            members={members}
            familyId={family.id}
            userId={userId}
            onAdd={handleAddTask}
            onToggle={handleToggleTask}
            onDelete={handleDeleteTask}
          />
          <FamilyCalendarStrip events={events} familyId={family.id} onAdd={handleAddEvent} onDelete={handleDeleteEvent} />
          {(elders.length > 0 || canManage) && (
            <ElderCards elders={elders} canManage={canManage} onAdd={handleAddElder} onDelete={handleDeleteElder} />
          )}
          {(children.length > 0 || canManage) && (
            <ChildCards children={children} canManage={canManage} onAdd={handleAddChild} onDelete={handleDeleteChild} />
          )}
        </div>
      )}

      {/* Tasks tab */}
      {activeTab === 'tasks' && (
        <SharedTaskBoard
          tasks={tasks}
          members={members}
          familyId={family.id}
          userId={userId}
          onAdd={handleAddTask}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
        />
      )}

      {/* Grocery tab */}
      {activeTab === 'grocery' && (
        <GroceryListPanel
          familyId={family.id}
          listId={groceryList?.id ?? ''}
          items={groceryItems}
          onAdd={handleAddGrocery}
          onToggle={handleToggleGrocery}
          onDelete={handleDeleteGrocery}
          onClearBought={handleClearBought}
          onSuggest={handleSuggestGroceries}
        />
      )}

      {/* Members tab */}
      {activeTab === 'members' && (
        <FamilyMembersPanel
          members={members}
          currentUserId={userId}
          currentRole={userRole}
          familyId={family.id}
          onInvite={handleInvite}
          onRemove={handleRemoveMember}
        />
      )}
    </div>
  )
}
