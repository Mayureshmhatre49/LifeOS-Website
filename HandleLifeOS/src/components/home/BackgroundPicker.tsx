'use client'

import {
  createContext, useContext, useState, useEffect,
  useCallback, useRef, type ReactNode,
} from 'react'
import { Palette, X, Check, ImageIcon, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Presets ───────────────────────────────────────────────────────────────────

export type BgPreset = {
  id: string
  name: string
  style: string   // full CSS background value
  dark?: boolean  // true → cards should use dark-aware styling (future)
}

export const BG_PRESETS: BgPreset[] = [
  {
    id: 'aurora',
    name: 'Aurora',
    // Matches the target screenshot — default
    style: 'linear-gradient(135deg, #eef2ff 0%, #ede9fe 30%, #fdf2f8 60%, #fff8f0 85%, #f0f9ff 100%)',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    style: 'linear-gradient(135deg, #faf5ff 0%, #f3e8ff 35%, #e9d5ff 70%, #ddd6fe 100%)',
  },
  {
    id: 'rose-mist',
    name: 'Rose Mist',
    style: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 30%, #fce7f3 65%, #fdf4ff 100%)',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    style: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 35%, #bfdbfe 65%, #e0f2fe 100%)',
  },
  {
    id: 'forest',
    name: 'Forest',
    style: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 35%, #d1fae5 65%, #ecfdf5 100%)',
  },
  {
    id: 'golden',
    name: 'Golden',
    style: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 35%, #fde68a 65%, #fef9c3 100%)',
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    style: 'linear-gradient(135deg, #fff0f3 0%, #ffd6e0 35%, #ffb3c6 65%, #ffecd2 100%)',
  },
  {
    id: 'cherry',
    name: 'Cherry',
    style: 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 35%, #fbcfe8 65%, #f9a8d4 100%)',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    style: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4c1d95 70%, #2d1b69 100%)',
    dark: true,
  },
  {
    id: 'cosmic',
    name: 'Cosmic',
    style: 'linear-gradient(135deg, #0c0a1a 0%, #1a0533 35%, #0d1b4b 65%, #1a2744 100%)',
    dark: true,
  },
  {
    id: 'northern',
    name: 'N. Lights',
    style: 'linear-gradient(135deg, #022c22 0%, #064e3b 35%, #065f46 65%, #134e4a 100%)',
    dark: true,
  },
  {
    id: 'classic',
    name: 'Classic',
    style: '#F8F9FE',
  },
]

// ── Storage ────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'lifeos_bg_v2'

function saveBg(id: string, customUrl?: string) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ id, customUrl })) } catch { /* quota full */ }
}

function loadBg(): { id: string; customUrl?: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* parse error */ }
  return { id: 'aurora' }
}

// ── Context ────────────────────────────────────────────────────────────────────

type BgCtx = {
  bgId: string
  customUrl: string | undefined
  backgroundStyle: string
  isDark: boolean
  pickerOpen: boolean
  setPickerOpen: (v: boolean) => void
  selectPreset: (id: string) => void
  selectCustom: (dataUrl: string) => void
  removeCustom: () => void
}

const BackgroundCtx = createContext<BgCtx>({
  bgId: 'aurora', customUrl: undefined,
  backgroundStyle: BG_PRESETS[0].style,
  isDark: false,
  pickerOpen: false,
  setPickerOpen: () => {},
  selectPreset: () => {},
  selectCustom: () => {},
  removeCustom: () => {},
})

// ── Provider ───────────────────────────────────────────────────────────────────

export function BackgroundProvider({ children }: { children: ReactNode }) {
  const [bgId, setBgId] = useState('aurora')
  const [customUrl, setCustomUrl] = useState<string | undefined>()
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    const saved = loadBg()
    setBgId(saved.id)
    setCustomUrl(saved.customUrl)
  }, [])

  const preset = BG_PRESETS.find(p => p.id === bgId)
  const backgroundStyle =
    bgId === 'custom' && customUrl
      ? `url(${customUrl}) center/cover no-repeat`
      : (preset?.style ?? BG_PRESETS[0].style)
  const isDark = bgId === 'custom' ? false : (preset?.dark ?? false)

  const selectPreset = useCallback((id: string) => {
    setBgId(id); setCustomUrl(undefined); saveBg(id)
  }, [])

  const selectCustom = useCallback((dataUrl: string) => {
    setBgId('custom'); setCustomUrl(dataUrl); saveBg('custom', dataUrl)
  }, [])

  const removeCustom = useCallback(() => {
    setBgId('aurora'); setCustomUrl(undefined); saveBg('aurora')
  }, [])

  return (
    <BackgroundCtx.Provider value={{
      bgId, customUrl, backgroundStyle, isDark,
      pickerOpen, setPickerOpen,
      selectPreset, selectCustom, removeCustom,
    }}>
      {children}
    </BackgroundCtx.Provider>
  )
}

export function useBackground() { return useContext(BackgroundCtx) }

// ── Background canvas ─────────────────────────────────────────────────────────
// Placed as first child of the dashboard's `relative` div

export function BackgroundCanvas() {
  const { backgroundStyle } = useBackground()
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: -1,
        background: backgroundStyle,
        transition: 'background 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    />
  )
}

// ── Palette trigger button ─────────────────────────────────────────────────────
// Drop this next to the notification bell in GreetingHero

export function BackgroundPickerButton() {
  const { setPickerOpen } = useBackground()
  return (
    <button
      onClick={() => setPickerOpen(true)}
      className="relative rounded-xl p-2.5 bg-white/80 backdrop-blur border border-gray-200 shadow-sm hover:border-indigo-300 hover:bg-indigo-50 transition-all"
      title="Customize background"
      aria-label="Customize background"
    >
      <Palette className="h-4 w-4 text-gray-500" />
    </button>
  )
}

// ── Image compression ─────────────────────────────────────────────────────────

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = (e) => {
      const src = e.target?.result as string
      const img = new window.Image()
      img.onerror = reject
      img.onload = () => {
        const MAX = 1440
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width  = Math.round(img.width  * ratio)
        canvas.height = Math.round(img.height * ratio)
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('no canvas')); return }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  })
}

// ── Picker panel ──────────────────────────────────────────────────────────────

export function BackgroundPickerPanel() {
  const {
    bgId, customUrl, pickerOpen, setPickerOpen,
    selectPreset, selectCustom, removeCustom,
  } = useBackground()

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Only images are supported.'); return }
    setError(null); setUploading(true)
    try {
      const dataUrl = await compressImage(file)
      selectCustom(dataUrl)
    } catch {
      setError('Could not process image. Try a smaller file.')
    } finally {
      setUploading(false)
    }
  }, [selectCustom])

  return (
    <>
      {/* Backdrop */}
      {pickerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setPickerOpen(false)}
        />
      )}

      {/* Slide panel */}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 z-50 w-72 bg-white/96 backdrop-blur-xl shadow-2xl border-l border-gray-100 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]',
          pickerOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Customize Background</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">Pick a style or upload your own</p>
          </div>
          <button
            onClick={() => setPickerOpen(false)}
            className="h-8 w-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Preset grid */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Preset Themes
            </p>
            <div className="grid grid-cols-3 gap-2">
              {BG_PRESETS.map((preset) => {
                const isActive = bgId === preset.id
                return (
                  <button
                    key={preset.id}
                    onClick={() => selectPreset(preset.id)}
                    title={preset.name}
                    className={cn(
                      'group relative rounded-xl overflow-hidden border-2 transition-all duration-200 hover:scale-[1.05] active:scale-[0.97]',
                      isActive
                        ? 'border-indigo-500 shadow-lg shadow-indigo-200/60'
                        : 'border-gray-100 hover:border-indigo-200',
                    )}
                    style={{ aspectRatio: '16/10' }}
                  >
                    {/* Gradient fill */}
                    <div className="absolute inset-0" style={{ background: preset.style }} />

                    {/* Active checkmark */}
                    {isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-indigo-500/20">
                        <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center shadow-md">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Name label */}
                    <p className="absolute bottom-0 inset-x-0 text-center text-[9px] font-bold py-0.5 bg-black/20 text-white backdrop-blur-sm">
                      {preset.name}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* Upload section */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">
              Your Image
            </p>

            {/* Current custom preview */}
            {customUrl && (
              <div className="relative mb-3 rounded-xl overflow-hidden border border-gray-200 shadow-sm" style={{ aspectRatio: '16/9' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={customUrl} alt="Custom background" className="w-full h-full object-cover" />
                {bgId === 'custom' && (
                  <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center shadow">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
                <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-2 py-1.5 bg-black/40 backdrop-blur-sm">
                  <button
                    onClick={() => selectCustom(customUrl)}
                    className="text-[10px] font-semibold text-white"
                  >
                    {bgId === 'custom' ? '✓ Active' : 'Use this'}
                  </button>
                  <button
                    onClick={removeCustom}
                    className="h-5 w-5 flex items-center justify-center rounded-md hover:bg-white/20 transition-colors"
                  >
                    <Trash2 className="h-3 w-3 text-white/80" />
                  </button>
                </div>
              </div>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-3 hover:border-indigo-300 hover:bg-indigo-50/60 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              <div className="h-9 w-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <ImageIcon className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-semibold text-gray-700">
                  {uploading ? 'Processing…' : 'Upload image'}
                </p>
                <p className="text-[10px] text-gray-400">JPG, PNG, WEBP — auto-compressed</p>
              </div>
            </button>

            {error && (
              <p className="mt-2 text-[11px] text-rose-500 text-center">{error}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 shrink-0">
          <p className="text-[10px] text-gray-400 text-center leading-snug">
            Your preference is saved in this browser.
          </p>
        </div>
      </div>
    </>
  )
}
