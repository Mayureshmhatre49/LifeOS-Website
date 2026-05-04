import { getSupabaseAdmin, isSupabaseConfigured } from './client'
import type { Subscription, UsageRecord, PlanId, SubscriptionStatus, PaymentProvider, BillingInterval } from '@/types/billing'

export async function getActiveSubscription(userId: string): Promise<Subscription | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return (data as Subscription) ?? null
}

export async function getSubscriptionByProvider(
  provider: PaymentProvider,
  providerSubscriptionId: string
): Promise<Subscription | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('subscriptions')
    .select('*')
    .eq('provider', provider)
    .eq('provider_subscription_id', providerSubscriptionId)
    .single()
  return (data as Subscription) ?? null
}

export async function createSubscription(params: {
  userId: string
  planId: PlanId
  status: SubscriptionStatus
  interval: BillingInterval
  provider: PaymentProvider
  providerSubscriptionId?: string
  providerCustomerId?: string
  currentPeriodStart: string
  currentPeriodEnd: string
}): Promise<Subscription> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('subscriptions')
    .insert({
      user_id: params.userId,
      plan_id: params.planId,
      status: params.status,
      interval: params.interval,
      provider: params.provider,
      provider_subscription_id: params.providerSubscriptionId,
      provider_customer_id: params.providerCustomerId,
      current_period_start: params.currentPeriodStart,
      current_period_end: params.currentPeriodEnd,
      cancel_at_period_end: false,
    })
    .select()
    .single()
  if (error) throw error
  return data as Subscription
}

export async function updateSubscription(
  id: string,
  updates: Partial<{
    status: SubscriptionStatus
    planId: PlanId
    currentPeriodEnd: string
    cancelAtPeriodEnd: boolean
  }>
): Promise<void> {
  const db = getSupabaseAdmin()
  const mapped: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (updates.status !== undefined) mapped.status = updates.status
  if (updates.planId !== undefined) mapped.plan_id = updates.planId
  if (updates.currentPeriodEnd !== undefined) mapped.current_period_end = updates.currentPeriodEnd
  if (updates.cancelAtPeriodEnd !== undefined) mapped.cancel_at_period_end = updates.cancelAtPeriodEnd
  await db.from('subscriptions').update(mapped).eq('id', id)
}

export async function cancelSubscription(userId: string): Promise<void> {
  if (!isSupabaseConfigured()) return
  const db = getSupabaseAdmin()
  await db
    .from('subscriptions')
    .update({ cancel_at_period_end: true, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
}

export async function getUsageRecord(userId: string, month: string): Promise<UsageRecord | null> {
  if (!isSupabaseConfigured()) return null
  const db = getSupabaseAdmin()
  const { data } = await db
    .from('usage_records')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .single()
  return (data as UsageRecord) ?? null
}

export async function upsertUsageRecord(userId: string, month: string): Promise<UsageRecord> {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from('usage_records')
    .upsert(
      { user_id: userId, month, ai_requests: 0, whatsapp_messages: 0 },
      { onConflict: 'user_id,month', ignoreDuplicates: true }
    )
    .select()
    .single()
  if (error) throw error
  return data as UsageRecord
}
