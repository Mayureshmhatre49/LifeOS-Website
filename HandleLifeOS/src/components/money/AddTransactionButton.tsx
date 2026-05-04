'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AddTransactionModal } from './AddTransactionModal'
import { useRouter } from 'next/navigation'

export function AddTransactionButton() {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-emerald-200 hover:shadow-emerald-300 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        <Plus className="h-3.5 w-3.5" />
        Add
      </button>
      <AddTransactionModal
        open={open}
        onClose={() => setOpen(false)}
        onSaved={() => router.refresh()}
      />
    </>
  )
}
