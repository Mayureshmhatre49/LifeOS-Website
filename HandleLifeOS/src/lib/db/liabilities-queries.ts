import { getSupabaseAdmin } from './client'
import type {
  Liability,
  CreateLiabilityInput,
  UpdateLiabilityInput,
  CategoryBudget,
  CreateCategoryBudgetInput,
} from '@/types/money'

async function withUser(userId: string) {
  const supabase = getSupabaseAdmin()
  await supabase.rpc('set_app_user_id', { uid: userId })
  return supabase
}

// ── Liabilities ───────────────────────────────────────────────────────────────

export async function getLiabilities(userId: string): Promise<Liability[]> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('liabilities')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function createLiability(
  userId: string,
  input: CreateLiabilityInput
): Promise<Liability | null> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('liabilities')
    .insert({ user_id: userId, type: 'other', ...input })
    .select()
    .single()
  return data
}

export async function updateLiability(
  userId: string,
  id: string,
  patch: UpdateLiabilityInput
): Promise<Liability | null> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('liabilities')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()
  return data
}

export async function deleteLiability(userId: string, id: string): Promise<void> {
  const supabase = await withUser(userId)
  await supabase.from('liabilities').delete().eq('id', id).eq('user_id', userId)
}

// Total outstanding across all liabilities
export async function getTotalLiabilities(userId: string): Promise<number> {
  const liabilities = await getLiabilities(userId)
  return liabilities.reduce((sum, l) => sum + Number(l.outstanding), 0)
}

// Total monthly EMI obligations
export async function getTotalMonthlyEMI(userId: string): Promise<number> {
  const liabilities = await getLiabilities(userId)
  return liabilities.reduce((sum, l) => sum + (l.emi ? Number(l.emi) : 0), 0)
}

// ── Category Budgets ──────────────────────────────────────────────────────────

export async function getCategoryBudgets(userId: string): Promise<CategoryBudget[]> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('category_budgets')
    .select('*')
    .eq('user_id', userId)
    .order('category')
  return data ?? []
}

export async function upsertCategoryBudget(
  userId: string,
  input: CreateCategoryBudgetInput
): Promise<CategoryBudget | null> {
  const supabase = await withUser(userId)
  const { data } = await supabase
    .from('category_budgets')
    .upsert(
      { user_id: userId, ...input },
      { onConflict: 'user_id,category' }
    )
    .select()
    .single()
  return data
}

export async function deleteCategoryBudget(userId: string, id: string): Promise<void> {
  const supabase = await withUser(userId)
  await supabase.from('category_budgets').delete().eq('id', id).eq('user_id', userId)
}
