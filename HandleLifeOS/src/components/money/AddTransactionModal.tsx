'use client'

import { useState, useRef } from 'react'
import { X, Mic, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EXPENSE_CATEGORY_LABELS, INCOME_CATEGORY_LABELS, PAYMENT_MODE_LABELS } from '@/types/money'
import type { TransactionType, PaymentMode } from '@/types/money'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: () => void
}

const TYPE_TABS: { value: TransactionType; label: string; color: string }[] = [
  { value: 'expense', label: 'Expense', color: 'bg-rose-500' },
  { value: 'income',  label: 'Income',  color: 'bg-emerald-500' },
  { value: 'transfer', label: 'Transfer', color: 'bg-indigo-500' },
]

const QUICK_AMOUNTS = [100, 250, 500, 1000, 2000, 5000]

export function AddTransactionModal({ open, onClose, onSaved }: Props) {
  const [type, setType]         = useState<TransactionType>('expense')
  const [amount, setAmount]     = useState('')
  const [category, setCategory] = useState('food')
  const [merchant, setMerchant] = useState('')
  const [notes, setNotes]       = useState('')
  const [mode, setMode]         = useState<PaymentMode>('upi')
  const [date, setDate]         = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading]   = useState(false)
  const [listening, setListening] = useState(false)
  const notesRef = useRef<HTMLInputElement>(null)

  const categories = type === 'income' ? INCOME_CATEGORY_LABELS : EXPENSE_CATEGORY_LABELS

  function handleVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Ctor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!Ctor) { notesRef.current?.focus(); return }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rec = new Ctor() as any
    rec.lang = 'en-IN'
    rec.onstart = () => setListening(true)
    rec.onend   = () => setListening(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript: string = e.results[0][0].transcript
      // Try to extract amount from voice
      const amtMatch = transcript.match(/(\d[\d,]*)/)?.[1]
      if (amtMatch) setAmount(amtMatch.replace(/,/g, ''))
      setNotes(transcript)
    }
    rec.onerror = () => setListening(false)
    rec.start()
  }

  async function handleSave() {
    if (!amount || Number(amount) <= 0) return
    setLoading(true)
    try {
      await fetch('/api/money/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          type,
          category,
          merchant: merchant || undefined,
          payment_mode: mode,
          txn_date: date,
          notes: notes || undefined,
        }),
      })
      onSaved()
      onClose()
      // Reset
      setAmount(''); setMerchant(''); setNotes(''); setType('expense'); setCategory('food')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[440px]">
        <div className="rounded-t-3xl md:rounded-3xl bg-white shadow-2xl overflow-hidden">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1 md:hidden">
            <div className="h-1 w-10 rounded-full bg-gray-200" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <p className="text-base font-bold text-gray-900">Add Transaction</p>
            <button onClick={onClose} className="h-8 w-8 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-5 pb-6 space-y-4">
            {/* Type tabs */}
            <div className="flex gap-1.5 p-1 bg-gray-100 rounded-xl">
              {TYPE_TABS.map(t => (
                <button
                  key={t.value}
                  onClick={() => { setType(t.value); setCategory(t.value === 'income' ? 'salary' : 'food') }}
                  className={cn(
                    'flex-1 rounded-lg py-1.5 text-xs font-bold transition-all',
                    type === t.value ? `${t.color} text-white shadow-sm` : 'text-gray-500 hover:text-gray-700',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Amount */}
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Amount</label>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-4 py-3 text-lg font-bold text-gray-900 focus:outline-none focus:border-indigo-300 focus:bg-white"
                  />
                </div>
                <button
                  onClick={handleVoice}
                  className={cn(
                    'h-12 w-12 rounded-xl flex items-center justify-center transition-all shrink-0',
                    listening ? 'bg-indigo-600 text-white animate-pulse' : 'bg-gray-100 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600',
                  )}
                >
                  <Mic className="h-4.5 w-4.5" />
                </button>
              </div>
              {/* Quick amounts */}
              <div className="flex gap-1.5 mt-2 flex-wrap">
                {QUICK_AMOUNTS.map(q => (
                  <button
                    key={q}
                    onClick={() => setAmount(String(q))}
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                  >
                    ₹{q.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            {type !== 'transfer' && (
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Category</label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {Object.entries(categories).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setCategory(key)}
                      className={cn(
                        'rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors',
                        category === key
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-700',
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Merchant + Date + Payment mode row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Merchant</label>
                <input
                  type="text"
                  value={merchant}
                  onChange={e => setMerchant(e.target.value)}
                  placeholder="e.g. Swiggy"
                  className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:outline-none focus:border-indigo-300 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:outline-none focus:border-indigo-300 focus:bg-white"
                />
              </div>
            </div>

            {/* Payment mode */}
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Payment Mode</label>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {(Object.entries(PAYMENT_MODE_LABELS) as [PaymentMode, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setMode(key)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors',
                      mode === key
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Notes</label>
              <input
                ref={notesRef}
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Optional note…"
                className="w-full mt-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:outline-none focus:border-indigo-300 focus:bg-white"
              />
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={!amount || Number(amount) <= 0 || loading}
              className={cn(
                'w-full rounded-xl py-3 text-sm font-bold transition-all',
                amount && Number(amount) > 0 && !loading
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200 hover:shadow-emerald-300 active:scale-[0.99]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed',
              )}
            >
              {loading ? 'Saving…' : 'Save Transaction'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
