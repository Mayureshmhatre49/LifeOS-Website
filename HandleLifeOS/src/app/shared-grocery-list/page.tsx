import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMeta } from '@/lib/seo/metadata'

export const metadata: Metadata = generatePageMeta({
  title: 'Shared Grocery List App — Family Shopping Made Easy',
  description: 'A collaborative grocery list your whole family can add to. AI suggests items you may have forgotten. Works on every device.',
  keywords: ['shared grocery list', 'family grocery list app', 'collaborative shopping list', 'shared shopping list', 'grocery list app india', 'sabzi list app', 'family shopping list'],
  path: '/shared-grocery-list',
})

export default function SharedGroceryListPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-sm font-medium text-green-700 mb-6">
            🛒 Shared Grocery List
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-5">
            Everyone adds.<br />No one forgets.
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed">
            Your family's shared grocery list. Anyone can add items from their phone. AI suggests what you might have forgotten. Mark items as bought in real time.
          </p>
          <div className="mt-8">
            <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white hover:bg-indigo-700 transition-colors">
              Create your list free
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 mb-16 max-w-sm mx-auto">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">This week's groceries</p>
          {[
            { name: 'Milk 2L', added: 'Added by Priya', bought: false },
            { name: 'Bread', added: 'Added by Raj', bought: true },
            { name: 'Eggs (12)', added: 'Added by Priya', bought: false },
            { name: 'Tomatoes 1kg', added: 'Added by Mum', bought: false },
            { name: 'Rice 5kg', added: 'Added by Raj', bought: true },
          ].map(item => (
            <div key={item.name} className={`flex items-center gap-3 py-2 border-b border-gray-100 last:border-0 ${item.bought ? 'opacity-40' : ''}`}>
              <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${item.bought ? 'bg-green-400 border-green-400' : 'border-gray-300'}`} />
              <div className="flex-1">
                <p className={`text-sm font-medium text-gray-900 ${item.bought ? 'line-through' : ''}`}>{item.name}</p>
                <p className="text-xs text-gray-400">{item.added}</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-400 mt-3 text-center">AI suggested: yogurt, onions, cooking oil</p>
        </div>

        <div className="text-center rounded-3xl bg-green-600 px-8 py-12 text-white">
          <h2 className="text-2xl font-bold mb-3">No more "you forgot the milk"</h2>
          <p className="text-green-200 mb-6">A shared list everyone can see and add to. Free forever.</p>
          <Link href="/signup" className="inline-flex items-center justify-center rounded-2xl bg-white px-6 py-3 text-base font-semibold text-green-700 hover:bg-green-50 transition-colors">
            Start your family list
          </Link>
        </div>
      </div>
    </main>
  )
}
