'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Apple, Plus, Trash2, Check, X, ShoppingBasket,
  Flame, Beef, Wheat, Droplet, Sparkles, Heart, ChefHat,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/components/ui/toast'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
type Tab = 'today' | 'plan' | 'recipes' | 'grocery'

interface Recipe {
  id: string; user_id: string; name: string; cuisine: string | null;
  meal_type: MealType | 'dessert' | 'drink' | null;
  prep_min: number; cook_min: number; servings: number;
  ingredients: { item: string; qty?: number; unit?: string; category?: string }[];
  steps: string[];
  calories: number | null; protein_g: number | null; carbs_g: number | null; fat_g: number | null;
  tags: string[]; image_emoji: string | null; notes: string | null;
  is_favorite: boolean; created_at: string; updated_at: string;
}

interface MealPlan {
  id: string; user_id: string; date: string; meal_type: MealType;
  recipe_id: string | null; name_override: string | null;
  servings: number; notes: string | null; is_done: boolean; created_at: string;
}

interface FoodLog {
  id: string; user_id: string; date: string; meal_type: MealType;
  food_name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number;
  qty: number; qty_unit: string; recipe_id: string | null; notes: string | null; logged_at: string;
}

interface GroceryItem {
  id: string; user_id: string; name: string; category: string | null;
  qty: number | null; unit: string | null; is_bought: boolean;
  recipe_id: string | null; notes: string | null; created_at: string;
}

interface NutritionTarget {
  user_id: string; daily_calories: number; protein_g: number; carbs_g: number; fat_g: number;
  diet_type: string; allergies: string[]; created_at: string; updated_at: string;
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_EMOJI: Record<MealType, string> = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snack: '🍎' }

export default function NutritionPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [meals, setMeals] = useState<MealPlan[]>([])
  const [logs, setLogs] = useState<FoodLog[]>([])
  const [groceries, setGroceries] = useState<GroceryItem[]>([])
  const [target, setTarget] = useState<NutritionTarget | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('today')
  const [showRecipeForm, setShowRecipeForm] = useState(false)
  const [showQuickLog, setShowQuickLog] = useState(false)

  async function refresh() {
    const today = new Date().toISOString().slice(0, 10)
    const weekAhead = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)
    const r = await fetch(`/api/nutrition?from=${today}&to=${weekAhead}`).then(r => r.json())
    setRecipes(r.recipes ?? []); setMeals(r.meals ?? []); setLogs(r.logs ?? [])
    setGroceries(r.groceries ?? []); setTarget(r.target ?? null)
  }

  useEffect(() => { refresh().finally(() => setLoading(false)) }, [])

  async function patch(kind: string, id: string, p: Record<string, unknown>) {
    try {
      const res = await fetch('/api/nutrition', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, id, ...p }) })
      if (!res.ok) {
        toast({ kind: 'error', message: 'Could not save change' })
        return
      }
      refresh()
    } catch {
      toast({ kind: 'error', message: 'Network error' })
    }
  }
  async function del(kind: string, id: string) {
    try {
      const res = await fetch(`/api/nutrition?kind=${kind}&id=${id}`, { method: 'DELETE' })
      if (!res.ok) {
        toast({ kind: 'error', message: 'Could not delete' })
        return
      }
      refresh()
    } catch {
      toast({ kind: 'error', message: 'Network error' })
    }
  }
  async function add(kind: string, payload: Record<string, unknown>) {
    try {
      const res = await fetch('/api/nutrition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind, ...payload }) })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        toast({ kind: 'error', message: 'Could not save', description: j.error })
        return
      }
      refresh()
    } catch {
      toast({ kind: 'error', message: 'Network error' })
    }
  }

  // ─── TODAY computations ────────────────────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10)
  const todayLogs = logs.filter(l => l.date === today)
  const todayMeals = meals.filter(m => m.date === today)
  const todayCals = todayLogs.reduce((s, l) => s + (l.calories ?? 0) * l.qty, 0)
  const todayProtein = todayLogs.reduce((s, l) => s + (l.protein_g ?? 0) * l.qty, 0)
  const todayCarbs = todayLogs.reduce((s, l) => s + (l.carbs_g ?? 0) * l.qty, 0)
  const todayFat = todayLogs.reduce((s, l) => s + (l.fat_g ?? 0) * l.qty, 0)
  const targetCals = target?.daily_calories ?? 2000
  const targetProtein = target?.protein_g ?? 80
  const targetCarbs = target?.carbs_g ?? 250
  const targetFat = target?.fat_g ?? 65

  if (loading) return <div className="flex items-center justify-center min-h-[40vh]"><div className="animate-spin h-5 w-5 rounded-full border-2 border-emerald-500 border-t-transparent" /></div>

  return (
    <div className="min-h-full px-4 py-5 md:px-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-md shadow-emerald-200">
              <Apple className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Food & Nutrition</h1>
          </div>
          <p className="text-sm text-gray-400 ml-10">Plan · track · cook smarter</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-2xl bg-gray-100 p-0.5">
        {(['today', 'plan', 'recipes', 'grocery'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            'flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all',
            tab === t ? 'bg-white shadow-sm text-emerald-700' : 'text-gray-500',
          )}>
            {t === 'grocery' ? 'Grocery' : t}
          </button>
        ))}
      </div>

      {tab === 'today' && (
        <>
          {/* Macro rings */}
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Today</p>
              <button onClick={() => setShowQuickLog(true)} className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1">
                <Plus className="h-3 w-3" /> Log food
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              <MacroBlock label="Calories" value={Math.round(todayCals)} target={targetCals} unit="kcal" Icon={Flame} color="orange" />
              <MacroBlock label="Protein" value={Math.round(todayProtein)} target={targetProtein} unit="g" Icon={Beef} color="rose" />
              <MacroBlock label="Carbs" value={Math.round(todayCarbs)} target={targetCarbs} unit="g" Icon={Wheat} color="amber" />
              <MacroBlock label="Fat" value={Math.round(todayFat)} target={targetFat} unit="g" Icon={Droplet} color="sky" />
            </div>
          </div>

          {showQuickLog && <QuickLogForm onAdd={async (p) => { await add('log', p); setShowQuickLog(false) }} onCancel={() => setShowQuickLog(false)} />}

          {/* Today's meals */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Planned today</p>
            {todayMeals.length === 0 ? (
              <div className="rounded-2xl border-2 border-dashed border-gray-200 p-5 text-center">
                <p className="text-sm text-gray-500">Nothing planned for today.</p>
                <button onClick={() => setTab('plan')} className="mt-2 text-xs font-bold text-emerald-700">Plan meals →</button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayMeals.map(m => {
                  const r = recipes.find(x => x.id === m.recipe_id)
                  return (
                    <div key={m.id} className={cn('rounded-2xl bg-white/80 border border-white/60 shadow-sm p-3 flex items-center gap-3', m.is_done && 'opacity-60')}>
                      <button onClick={() => patch('meal', m.id, { is_done: !m.is_done })} className={cn('h-9 w-9 rounded-xl flex items-center justify-center shrink-0 text-xl border-2', m.is_done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-200')}>
                        {m.is_done ? <Check className="h-4 w-4" /> : MEAL_EMOJI[m.meal_type]}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-semibold text-gray-800 truncate', m.is_done && 'line-through')}>
                          {r?.name ?? m.name_override ?? '—'}
                        </p>
                        <p className="text-[11px] text-gray-500 capitalize">{m.meal_type} · {m.servings} serving{m.servings > 1 ? 's' : ''}{r?.calories ? ` · ${Math.round(r.calories * m.servings)} kcal` : ''}</p>
                      </div>
                      <button onClick={() => del('meal', m.id)} className="p-1 text-gray-300 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Recent logs */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Today&apos;s log</p>
            {todayLogs.length === 0 ? (
              <p className="text-xs text-gray-400 italic">Nothing logged yet.</p>
            ) : (
              <div className="space-y-1.5">
                {todayLogs.map(l => (
                  <div key={l.id} className="rounded-xl bg-white/80 border border-white/60 p-2.5 flex items-center gap-3">
                    <span className="text-base">{MEAL_EMOJI[l.meal_type]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{l.food_name}</p>
                      <p className="text-[10px] text-gray-500">
                        {Math.round(l.calories * l.qty)} kcal · {l.qty} {l.qty_unit}
                      </p>
                    </div>
                    <button onClick={() => del('log', l.id)} className="p-1 text-gray-300 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'plan' && <PlanView meals={meals} recipes={recipes} onPatch={patch} onAdd={(p) => add('meal', p)} onDel={(id) => del('meal', id)} />}

      {tab === 'recipes' && (
        <>
          {showRecipeForm
            ? <RecipeForm onSave={async (r) => { await add('recipe', r); setShowRecipeForm(false) }} onCancel={() => setShowRecipeForm(false)} />
            : (
              <button onClick={() => setShowRecipeForm(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 text-emerald-700 text-sm font-semibold hover:bg-emerald-50">
                <Plus className="h-4 w-4" /> Add recipe
              </button>
            )}
          <RecipeList recipes={recipes} onFavorite={(r) => patch('recipe', r.id, { is_favorite: !r.is_favorite })} onDelete={(id) => del('recipe', id)} />
        </>
      )}

      {tab === 'grocery' && (
        <GroceryView
          items={groceries}
          onToggle={(g) => patch('grocery', g.id, { is_bought: !g.is_bought })}
          onAdd={(p) => add('grocery', p)}
          onDel={(id) => del('grocery', id)}
          onGenerate={async () => {
            const today = new Date().toISOString().slice(0, 10)
            const weekAhead = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10)
            await fetch('/api/nutrition/grocery/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ from: today, to: weekAhead }) })
            refresh()
          }}
          onClearBought={async () => {
            for (const g of groceries.filter(x => x.is_bought)) await del('grocery', g.id)
          }}
        />
      )}
    </div>
  )
}

// ─── Macro tile ──────────────────────────────────────────────────────────────
function MacroBlock({ label, value, target, unit, Icon, color }: {
  label: string; value: number; target: number; unit: string;
  Icon: typeof Flame; color: 'orange' | 'rose' | 'amber' | 'sky'
}) {
  const pct = Math.min(100, Math.round((value / Math.max(1, target)) * 100))
  const colors = {
    orange: { ring: 'text-orange-500', fill: 'stroke-orange-500', bg: 'text-orange-700' },
    rose:   { ring: 'text-rose-500',   fill: 'stroke-rose-500',   bg: 'text-rose-700' },
    amber:  { ring: 'text-amber-500',  fill: 'stroke-amber-500',  bg: 'text-amber-700' },
    sky:    { ring: 'text-sky-500',    fill: 'stroke-sky-500',    bg: 'text-sky-700' },
  }[color]
  const r = 18; const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur p-2 text-center">
      <div className="relative h-12 w-12 mx-auto">
        <svg viewBox="0 0 44 44" className="h-12 w-12 -rotate-90">
          <circle cx="22" cy="22" r={r} fill="none" stroke="#e5e7eb" strokeWidth="4" />
          <circle cx="22" cy="22" r={r} fill="none" className={colors.fill} strokeWidth="4" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <Icon className={cn('absolute inset-0 m-auto h-4 w-4', colors.ring)} />
      </div>
      <p className={cn('text-[11px] font-bold mt-1', colors.bg)}>{value}{unit !== 'kcal' && unit}</p>
      <p className="text-[9px] text-gray-400 uppercase tracking-wider">{label}</p>
    </div>
  )
}

// ─── Quick log form ──────────────────────────────────────────────────────────
function QuickLogForm({ onAdd, onCancel }: { onAdd: (p: Record<string, unknown>) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [meal, setMeal] = useState<MealType>('breakfast')
  const [cal, setCal] = useState(0)
  const [protein, setProtein] = useState(0)
  const [carbs, setCarbs] = useState(0)
  const [fat, setFat] = useState(0)
  const [qty, setQty] = useState(1)

  return (
    <div className="rounded-2xl bg-white border border-emerald-100 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-800">Log food</p>
        <button onClick={onCancel} className="text-gray-400 p-1"><X className="h-4 w-4" /></button>
      </div>
      <input value={name} onChange={e => setName(e.target.value)} autoFocus placeholder="What did you eat?" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
      <div className="grid grid-cols-4 gap-1">
        {MEAL_TYPES.map(m => (
          <button key={m} onClick={() => setMeal(m)} className={cn('py-1.5 rounded-lg text-[11px] font-semibold capitalize', meal === m ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-50 text-gray-500')}>{m}</button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        <NumIn label="Cal" value={cal} onChange={setCal} />
        <NumIn label="P (g)" value={protein} onChange={setProtein} />
        <NumIn label="C (g)" value={carbs} onChange={setCarbs} />
        <NumIn label="F (g)" value={fat} onChange={setFat} />
      </div>
      <NumIn label="Servings" value={qty} onChange={setQty} step={0.5} />
      <button onClick={() => name.trim() && onAdd({ food_name: name.trim(), meal_type: meal, calories: cal, protein_g: protein, carbs_g: carbs, fat_g: fat, qty })}
        disabled={!name.trim()}
        className="w-full py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-40">
        Save
      </button>
    </div>
  )
}

function NumIn({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="block">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <input type="number" min={0} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs" />
    </label>
  )
}

// ─── Plan view (week grid) ──────────────────────────────────────────────────
function PlanView({ meals, recipes, onPatch, onAdd, onDel }: {
  meals: MealPlan[]
  recipes: Recipe[]
  onPatch: (kind: string, id: string, p: Record<string, unknown>) => Promise<void>
  onAdd: (p: Record<string, unknown>) => Promise<void>
  onDel: (id: string) => Promise<void>
}) {
  const [adding, setAdding] = useState<{ date: string; meal: MealType } | null>(null)
  const [pickRecipe, setPickRecipe] = useState('')
  const [override, setOverride] = useState('')

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i)
    return d.toISOString().slice(0, 10)
  }), [])

  return (
    <div className="space-y-2">
      {days.map(d => {
        const dayMeals = meals.filter(m => m.date === d)
        const dt = new Date(d + 'T12:00:00')
        const isToday = d === new Date().toISOString().slice(0, 10)
        return (
          <div key={d} className={cn('rounded-2xl border p-3', isToday ? 'bg-emerald-50 border-emerald-200' : 'bg-white/80 border-white/60')}>
            <p className={cn('text-xs font-bold uppercase tracking-wider mb-2', isToday ? 'text-emerald-700' : 'text-gray-500')}>
              {isToday ? 'Today · ' : ''}{dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {MEAL_TYPES.map(mt => {
                const m = dayMeals.find(x => x.meal_type === mt)
                const r = m ? recipes.find(x => x.id === m.recipe_id) : null
                return (
                  <div key={mt} className="rounded-xl bg-white/70 p-2 min-h-[58px]">
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold">{MEAL_EMOJI[mt]} {mt}</p>
                    {m ? (
                      <div className="flex items-start justify-between gap-1 mt-0.5">
                        <p className="text-[12px] font-semibold text-gray-800 truncate flex-1">{r?.name ?? m.name_override ?? '—'}</p>
                        <button onClick={() => onDel(m.id)} className="text-gray-300 hover:text-red-400 shrink-0"><X className="h-3 w-3" /></button>
                      </div>
                    ) : (
                      <button onClick={() => { setAdding({ date: d, meal: mt }); setPickRecipe(''); setOverride('') }} className="text-[11px] text-emerald-600 hover:text-emerald-800 mt-0.5">+ Add</button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {adding && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={() => setAdding(null)}>
          <div className="w-full max-w-md rounded-3xl bg-white p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <p className="text-sm font-bold text-gray-800 capitalize">Add {adding.meal} · {adding.date}</p>
            {recipes.length > 0 && (
              <select value={pickRecipe} onChange={e => setPickRecipe(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">
                <option value="">— From your recipes —</option>
                {recipes.map(r => <option key={r.id} value={r.id}>{r.image_emoji ?? '🍽'} {r.name}</option>)}
              </select>
            )}
            <div className="text-center text-[10px] text-gray-400 uppercase tracking-wider">or</div>
            <input value={override} onChange={e => setOverride(e.target.value)} placeholder="Type a meal name…" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <button onClick={async () => {
                if (!pickRecipe && !override.trim()) return
                await onAdd({ date: adding.date, meal_type: adding.meal, recipe_id: pickRecipe || null, name_override: override.trim() || null, servings: 1 })
                setAdding(null)
              }} className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold">Add</button>
              <button onClick={() => setAdding(null)} className="px-4 py-2 rounded-xl border border-gray-200 text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Recipe list & form ─────────────────────────────────────────────────────
function RecipeList({ recipes, onFavorite, onDelete }: {
  recipes: Recipe[]
  onFavorite: (r: Recipe) => void
  onDelete: (id: string) => void
}) {
  if (recipes.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
        <ChefHat className="h-6 w-6 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">No recipes yet.</p>
        <p className="text-[11px] text-gray-400 mt-1">Build your library to plan meals + auto-generate grocery lists.</p>
      </div>
    )
  }
  return (
    <div className="space-y-2">
      {[...recipes].sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite)).map(r => (
        <div key={r.id} className="rounded-2xl bg-white/80 border border-white/60 shadow-sm p-3">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">{r.image_emoji ?? '🍽️'}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-gray-800 truncate">{r.name}</p>
                <button onClick={() => onFavorite(r)} className={cn('p-1 shrink-0', r.is_favorite ? 'text-rose-500' : 'text-gray-300')}>
                  <Heart className={cn('h-4 w-4', r.is_favorite && 'fill-current')} />
                </button>
              </div>
              <p className="text-[11px] text-gray-500">
                {r.cuisine && `${r.cuisine} · `}{r.servings} serving{r.servings > 1 ? 's' : ''}
                {r.prep_min + r.cook_min > 0 && ` · ${r.prep_min + r.cook_min} min`}
                {r.calories && ` · ${r.calories} kcal`}
              </p>
              {r.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {r.tags.slice(0, 4).map(t => <span key={t} className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded uppercase tracking-wider font-bold">{t}</span>)}
                </div>
              )}
              {r.ingredients.length > 0 && (
                <p className="text-[10px] text-gray-400 mt-1">{r.ingredients.length} ingredients · {r.steps.length} steps</p>
              )}
            </div>
            <button onClick={() => onDelete(r.id)} className="p-1 text-gray-300 hover:text-red-400 shrink-0"><Trash2 className="h-3 w-3" /></button>
          </div>
        </div>
      ))}
    </div>
  )
}

function RecipeForm({ onSave, onCancel }: { onSave: (r: Record<string, unknown>) => Promise<void>; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [emoji, setEmoji] = useState('🍽️')
  const [servings, setServings] = useState(2)
  const [prep, setPrep] = useState(10)
  const [cook, setCook] = useState(20)
  const [calories, setCalories] = useState(0)
  const [protein, setProtein] = useState(0)
  const [carbs, setCarbs] = useState(0)
  const [fat, setFat] = useState(0)
  const [tags, setTags] = useState('')
  const [rawIng, setRawIng] = useState('')
  const [rawSteps, setRawSteps] = useState('')

  function parseIngredients(): { item: string; qty?: number; unit?: string }[] {
    return rawIng.split('\n').map(l => l.trim()).filter(Boolean).map(line => {
      const m = line.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s+(.+)$/)
      if (m) return { qty: parseFloat(m[1]), unit: m[2] ?? '', item: m[3] }
      return { item: line }
    })
  }

  return (
    <div className="rounded-2xl bg-white border border-emerald-100 shadow-sm p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-gray-800">New recipe</p>
        <button onClick={onCancel} className="text-gray-400 p-1"><X className="h-4 w-4" /></button>
      </div>
      <div className="flex gap-2">
        <input value={emoji} onChange={e => setEmoji(e.target.value.slice(0, 4))} className="w-14 text-center text-xl rounded-xl border border-gray-200 bg-gray-50" />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Recipe name" className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <NumIn label="Servings" value={servings} onChange={setServings} />
        <NumIn label="Prep min" value={prep} onChange={setPrep} />
        <NumIn label="Cook min" value={cook} onChange={setCook} />
        <input value={cuisine} onChange={e => setCuisine(e.target.value)} placeholder="Cuisine" className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs" />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <NumIn label="Cal/serv" value={calories} onChange={setCalories} />
        <NumIn label="P (g)" value={protein} onChange={setProtein} />
        <NumIn label="C (g)" value={carbs} onChange={setCarbs} />
        <NumIn label="F (g)" value={fat} onChange={setFat} />
      </div>
      <input value={tags} onChange={e => setTags(e.target.value)} placeholder="tags (comma-separated): veg, gluten-free…" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs" />
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Ingredients (one per line, e.g. &quot;200 g paneer&quot;)</p>
        <textarea value={rawIng} onChange={e => setRawIng(e.target.value)} rows={4} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-mono" />
      </div>
      <div>
        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Steps (one per line)</p>
        <textarea value={rawSteps} onChange={e => setRawSteps(e.target.value)} rows={3} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs" />
      </div>
      <button onClick={() => name.trim() && onSave({
        name: name.trim(), cuisine: cuisine.trim() || null, image_emoji: emoji,
        servings, prep_min: prep, cook_min: cook,
        calories: calories || null, protein_g: protein || null, carbs_g: carbs || null, fat_g: fat || null,
        tags: tags.split(',').map(s => s.trim()).filter(Boolean),
        ingredients: parseIngredients(),
        steps: rawSteps.split('\n').map(s => s.trim()).filter(Boolean),
      })} disabled={!name.trim()} className="w-full py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold disabled:opacity-40">
        Save recipe
      </button>
    </div>
  )
}

// ─── Grocery view ───────────────────────────────────────────────────────────
function GroceryView({ items, onToggle, onAdd, onDel, onGenerate, onClearBought }: {
  items: GroceryItem[]
  onToggle: (g: GroceryItem) => void
  onAdd: (p: Record<string, unknown>) => Promise<void>
  onDel: (id: string) => Promise<void>
  onGenerate: () => Promise<void>
  onClearBought: () => Promise<void>
}) {
  const [name, setName] = useState('')
  const [generating, setGenerating] = useState(false)
  const open = items.filter(g => !g.is_bought)
  const bought = items.filter(g => g.is_bought)

  const grouped = useMemo(() => {
    const map = new Map<string, GroceryItem[]>()
    for (const g of open) {
      const k = g.category || 'Other'
      const arr = map.get(k) ?? []
      arr.push(g); map.set(k, arr)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [open])

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={async () => { setGenerating(true); try { await onGenerate() } finally { setGenerating(false) } }}
          disabled={generating}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white text-xs font-bold shadow disabled:opacity-50"
        >
          <Sparkles className="h-3.5 w-3.5" />
          {generating ? 'Generating…' : 'Auto-fill from week meals'}
        </button>
      </div>

      <div className="rounded-2xl bg-white border border-emerald-100 shadow-sm p-3 flex gap-2">
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && name.trim()) { onAdd({ name: name.trim() }); setName('') } }}
          placeholder="Add item…" className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm" />
        <button onClick={() => { if (name.trim()) { onAdd({ name: name.trim() }); setName('') } }} className="px-3 rounded-xl bg-emerald-600 text-white"><Plus className="h-3.5 w-3.5" /></button>
      </div>

      {open.length === 0 && bought.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
          <ShoppingBasket className="h-6 w-6 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Grocery list is empty.</p>
        </div>
      ) : (
        <>
          {grouped.map(([category, list]) => (
            <div key={category}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">{category}</p>
              <div className="space-y-1">
                {list.map(g => (
                  <div key={g.id} className="rounded-xl bg-white/80 border border-white/60 p-2 flex items-center gap-3">
                    <button onClick={() => onToggle(g)} className="h-5 w-5 rounded border-2 border-gray-200 hover:border-emerald-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{g.name}</p>
                      {(g.qty || g.unit) && <p className="text-[10px] text-gray-400">{g.qty} {g.unit}</p>}
                    </div>
                    <button onClick={() => onDel(g.id)} className="p-1 text-gray-300 hover:text-red-400"><Trash2 className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {bought.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bought ({bought.length})</p>
                <button onClick={onClearBought} className="text-[10px] font-bold text-gray-400 hover:text-red-400">Clear</button>
              </div>
              <div className="space-y-1">
                {bought.map(g => (
                  <div key={g.id} className="rounded-xl bg-gray-50 p-2 flex items-center gap-3 opacity-60">
                    <button onClick={() => onToggle(g)} className="h-5 w-5 rounded bg-emerald-500 border-2 border-emerald-500 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-white" />
                    </button>
                    <p className="flex-1 text-sm text-gray-500 line-through truncate">{g.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </>
  )
}
