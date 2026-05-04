'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowDownCircle, ArrowUpCircle, ArrowLeftRight, Trash2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MoneyNavBar } from '@/components/money/MoneyNavBar'
import { AddTransactionButton } from '@/components/money/AddTransactionButton'
import { EXPENSE_CATEGORY_LABELS, INCOME_CATEGORY_LABELS } from '@/types/money'
import type { Transaction, TransactionType } from '@/types/money'

const TYPE_ICON = {
  expense:  { icon: ArrowDownCircle, color: 'text-rose-500',    bg: 'bg-rose-50'    },
  income:   { icon: ArrowUpCircle,   color: 'text-emerald-500', bg: 'bg-emerald-50' },
  transfer: { icon: ArrowLeftRight,  color: 'text-indigo-500',  bg: 'bg-indigo-50'  },
}

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function categoryLabel(cat: string, type: TransactionType) {
  if (type === 'income') return INCOME_CATEGORY_LABELS[cat] ?? cat
  return EXPENSE_CATEGORY_LABELS[cat as keyof typeof EXPENSE_CATEGORY_LABELS] ?? cat
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TransactionType | 'all'>('all')
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ limit: '100' })
    if (filter !== 'all') params.set('type', filter)
    const res = await fetch(`/api/money/transactions?${params}`)
    const data = await res.json()
    setTransactions(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [filter])

  useEffect(() => { load() }, [load])

  async function deleteItem(id: string) {
    await fetch(`/api/money/transactions/${id}`, { method: 'DELETE' })
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const filtered = transactions.filter(t => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      t.category.includes(q) ||
      t.merchant?.toLowerCase().includes(q) ||
      t.notes?.toLowerCase().includes(q)
    )
  })

  const incomeTotal  = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenseTotal = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Transactions</h1>
        <AddTransactionButton />
      </div>

      <MoneyNavBar />

      {/* Summary row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3 text-center">
          <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">Income</p>
          <p className="text-lg font-black text-emerald-700 mt-0.5">{fmt(incomeTotal)}</p>
        </div>
        <div className="rounded-2xl bg-rose-50 border border-rose-100 p-3 text-center">
          <p className="text-[10px] font-semibold text-rose-600 uppercase tracking-wider">Expenses</p>
          <p className="text-lg font-black text-rose-700 mt-0.5">{fmt(expenseTotal)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search transactions…"
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-200 bg-white/80 text-xs focus:outline-none focus:border-indigo-300"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'expense', 'income', 'transfer'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-xl px-2.5 py-2 text-[11px] font-semibold transition-colors',
                filter === f ? 'bg-gray-800 text-white' : 'bg-white/80 border border-gray-200 text-gray-500',
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-16 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white/60 p-8 text-center">
          <p className="text-2xl mb-2">📋</p>
          <p className="text-sm font-semibold text-gray-700">No transactions yet</p>
          <p className="text-xs text-gray-400 mt-1">Tap Add to log your first transaction.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {filtered.map(txn => {
            const meta = TYPE_ICON[txn.type]
            const Icon = meta.icon
            return (
              <div
                key={txn.id}
                className="flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur border border-white/60 shadow-sm px-4 py-3"
              >
                <div className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0', meta.bg)}>
                  <Icon className={cn('h-4.5 w-4.5', meta.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {txn.merchant || categoryLabel(txn.category, txn.type)}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {categoryLabel(txn.category, txn.type)} · {txn.txn_date}
                    {txn.payment_mode && ` · ${txn.payment_mode.toUpperCase()}`}
                  </p>
                </div>
                <p className={cn(
                  'text-sm font-bold shrink-0',
                  txn.type === 'income' ? 'text-emerald-600' : txn.type === 'expense' ? 'text-rose-600' : 'text-indigo-600',
                )}>
                  {txn.type === 'income' ? '+' : txn.type === 'expense' ? '-' : ''}{fmt(txn.amount)}
                </p>
                <button
                  onClick={() => deleteItem(txn.id)}
                  className="h-6 w-6 flex items-center justify-center rounded-lg text-gray-300 hover:text-rose-500 hover:bg-rose-50 transition-colors shrink-0"
                >
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
