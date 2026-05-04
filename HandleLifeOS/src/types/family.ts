export type FamilyRole = 'owner' | 'partner' | 'adult' | 'teen' | 'child' | 'elder'
export type MemberStatus = 'invited' | 'active' | 'removed'
export type SharedTaskStatus = 'pending' | 'in_progress' | 'done'
export type SharedTaskCategory =
  | 'groceries' | 'cleaning' | 'repairs' | 'school' | 'health'
  | 'errands' | 'bills' | 'cooking' | 'childcare' | 'misc'
export type FamilyEventType =
  | 'appointment' | 'school' | 'birthday' | 'travel' | 'chore' | 'reminder' | 'other'

export interface Family {
  id: string
  name: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface FamilyMember {
  id: string
  family_id: string
  user_id?: string
  invited_email?: string
  role: FamilyRole
  status: MemberStatus
  display_name?: string
  invited_by?: string
  joined_at?: string
  created_at: string
}

export interface SharedTask {
  id: string
  family_id: string
  title: string
  category: SharedTaskCategory
  status: SharedTaskStatus
  assigned_to?: string
  due_date?: string
  notes?: string
  created_by: string
  completed_at?: string
  created_at: string
  updated_at: string
}

export interface FamilyEvent {
  id: string
  family_id: string
  title: string
  event_type: FamilyEventType
  start_date: string
  end_date?: string
  all_day: boolean
  notes?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface GroceryList {
  id: string
  family_id: string
  name: string
  is_active: boolean
  created_by: string
  created_at: string
}

export interface GroceryItem {
  id: string
  list_id: string
  family_id: string
  name: string
  quantity?: string
  category?: string
  is_bought: boolean
  added_by?: string
  bought_by?: string
  created_at: string
}

export interface ElderProfile {
  id: string
  family_id: string
  user_id?: string
  full_name: string
  medicines?: string[]
  conditions?: string
  doctor_name?: string
  doctor_contact?: string
  emergency_contact?: string
  notes?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface ChildProfile {
  id: string
  family_id: string
  user_id?: string
  full_name: string
  age?: number
  school_name?: string
  class_grade?: string
  notes?: string
  created_by: string
  created_at: string
  updated_at: string
}

// Input types
export interface CreateFamilyInput {
  name: string
}

export interface InviteMemberInput {
  invited_email: string
  role?: FamilyRole
  display_name?: string
}

export interface CreateSharedTaskInput {
  title: string
  category?: SharedTaskCategory
  assigned_to?: string
  due_date?: string
  notes?: string
}

export interface UpdateSharedTaskInput {
  title?: string
  category?: SharedTaskCategory
  status?: SharedTaskStatus
  assigned_to?: string
  due_date?: string
  notes?: string
}

export interface CreateEventInput {
  title: string
  event_type?: FamilyEventType
  start_date: string
  end_date?: string
  all_day?: boolean
  notes?: string
}

export interface AddGroceryItemInput {
  name: string
  quantity?: string
  category?: string
}

export interface CreateElderProfileInput {
  full_name: string
  medicines?: string[]
  conditions?: string
  doctor_name?: string
  doctor_contact?: string
  emergency_contact?: string
  notes?: string
}

export interface CreateChildProfileInput {
  full_name: string
  age?: number
  school_name?: string
  class_grade?: string
  notes?: string
}

// Aggregated view
export interface FamilyDashboard {
  family: Family
  members: FamilyMember[]
  pendingTasks: SharedTask[]
  upcomingEvents: FamilyEvent[]
  activeGroceryItems: GroceryItem[]
  elders: ElderProfile[]
  children: ChildProfile[]
  userRole: FamilyRole
}

// AI result types
export interface HouseholdPlanResult {
  summary: string
  priorities: string[]
  suggestions: string[]
  disclaimer: string
}

export interface ChoreBalanceResult {
  analysis: string
  assignments: { member: string; tasks: string[] }[]
  tip: string
  disclaimer: string
}

export interface MentalLoadResult {
  check_in: string
  forgotten_items: string[]
  upcoming_flags: string[]
  calm_note: string
  disclaimer: string
}

export interface HouseholdChecklistResult {
  checklist_title: string
  items: string[]
  tip: string
  disclaimer: string
}

// Constants
export const ROLE_LABELS: Record<FamilyRole, string> = {
  owner: 'Owner',
  partner: 'Partner',
  adult: 'Adult',
  teen: 'Teen',
  child: 'Child',
  elder: 'Elder',
}

export const ROLE_CAN_MANAGE: FamilyRole[] = ['owner', 'partner']

export const TASK_CATEGORY_LABELS: Record<SharedTaskCategory, string> = {
  groceries: 'Groceries',
  cleaning: 'Cleaning',
  repairs: 'Repairs',
  school: 'School',
  health: 'Health',
  errands: 'Errands',
  bills: 'Bills',
  cooking: 'Cooking',
  childcare: 'Childcare',
  misc: 'Misc',
}

export const EVENT_TYPE_LABELS: Record<FamilyEventType, string> = {
  appointment: 'Appointment',
  school: 'School',
  birthday: 'Birthday',
  travel: 'Travel',
  chore: 'Chore',
  reminder: 'Reminder',
  other: 'Other',
}

export const EVENT_TYPE_COLORS: Record<FamilyEventType, string> = {
  appointment: '#6366f1',
  school: '#0ea5e9',
  birthday: '#f43f5e',
  travel: '#f97316',
  chore: '#22c55e',
  reminder: '#eab308',
  other: '#94a3b8',
}
