'use client'

import { useState } from 'react'
import type { GroceryItem } from '@/types/family'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, Trash2, Sparkles, ShoppingCart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  familyId: string
  listId: string
  items: GroceryItem[]
  onAdd: (data: { name: string; quantity?: string; category?: string }) => Promise<void>
  onToggle: (id: string, isBought: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClearBought: () => Promise<void>
  onSuggest: () => Promise<string[]>
}

const GROCERY_CATEGORIES = ['Produce', 'Dairy', 'Bakery', 'Meat', 'Frozen', 'Beverages', 'Snacks', 'Household', 'Personal care', 'Other']

export function GroceryList({ familyId, listId, items, onAdd, onToggle, onDelete, onClearBought, onSuggest }: Props) {
  const [name, setName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

  const pending = items.filter(i => !i.is_bought)
  const bought = items.filter(i => i.is_bought)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await onAdd({ name: name.trim(), quantity: quantity.trim() || undefined })
    setName(''); setQuantity('')
  }

  async function handleSuggest() {
    setLoadingSuggestions(true)
    const s = await onSuggest()
    setSuggestions(s.filter(s => !items.some(i => i.name.toLowerCase() === s.toLowerCase())))
    setLoadingSuggestions(false)
  }

  async function addSuggestion(s: string) {
    await onAdd({ name: s })
    setSuggestions(prev => prev.filter(x => x !== s))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-green-600" />
          <h3 className="text-sm font-semibold text-gray-700">
            Grocery list <span className="text-gray-400 font-normal">({pending.length} needed)</span>
          </h3>
        </div>
        <div className="flex gap-2">
          {bought.length > 0 && (
            <button onClick={onClearBought} className="text-xs text-gray-400 hover:text-gray-600">
              Clear bought
            </button>
          )}
          <button onClick={handleSuggest} disabled={loadingSuggestions} className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium">
            <Sparkles className="h-3.5 w-3.5" />
            {loadingSuggestions ? 'Thinking…' : 'Suggest'}
          </button>
        </div>
      </div>

      {/* AI suggestions */}
      {suggestions.length > 0 && (
        <div className="rounded-xl bg-purple-50 border border-purple-100 p-3">
          <p className="text-xs font-medium text-purple-700 mb-2">AI suggestions — tap to add:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map(s => (
              <button
                key={s}
                onClick={() => addSuggestion(s)}
                className="rounded-full bg-white border border-purple-200 px-3 py-1 text-xs text-purple-700 hover:bg-purple-100 transition-colors"
              >
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick add */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Add item…"
          className="flex-1"
        />
        <Input
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          placeholder="Qty"
          className="w-20"
        />
        <Button type="submit" size="sm" disabled={!name.trim()}>Add</Button>
      </form>

      {/* Items list */}
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
          <p className="text-sm text-gray-400">Your grocery list is empty</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pending.length > 0 && (
            <ul className="space-y-1.5">
              {pending.map(item => (
                <li key={item.id} className="flex items-center gap-2 group rounded-lg px-2 py-1.5 hover:bg-gray-50">
                  <button onClick={() => onToggle(item.id, true)} className="shrink-0 text-gray-300 hover:text-green-500 transition-colors">
                    <Circle className="h-4 w-4" />
                  </button>
                  <span className="flex-1 text-sm text-gray-900">{item.name}</span>
                  {item.quantity && <span className="text-xs text-gray-400">{item.quantity}</span>}
                  <button onClick={() => onDelete(item.id)} className="hidden group-hover:block text-gray-300 hover:text-red-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {bought.length > 0 && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-xs text-gray-400 mb-1.5">In cart ({bought.length})</p>
              <ul className="space-y-1.5">
                {bought.map(item => (
                  <li key={item.id} className="flex items-center gap-2 group opacity-50">
                    <button onClick={() => onToggle(item.id, false)} className="shrink-0 text-green-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <span className="flex-1 text-sm text-gray-600 line-through">{item.name}</span>
                    {item.quantity && <span className="text-xs text-gray-400">{item.quantity}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
