'use client'

import { useState, useEffect } from 'react'
import { Globe, Check, Loader2 } from 'lucide-react'
import { LANGUAGES, DEFAULT_LANGUAGE } from '@/config/languages'
import { cn } from '@/lib/utils'

export default function LanguagePage() {
  const [current, setCurrent] = useState(DEFAULT_LANGUAGE)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.json())
      .then((p: { preferred_language?: string } | null) => {
        if (p?.preferred_language) setCurrent(p.preferred_language)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSelect(code: string) {
    if (code === current) return
    setSaving(true)
    setSaved(false)
    setCurrent(code)
    try {
      await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferred_language: code }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  const indian = LANGUAGES.filter((l) => l.region === 'india')
  const global = LANGUAGES.filter((l) => l.region === 'global')

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <Globe className="h-5 w-5 text-indigo-600" />
          <h1 className="text-xl font-semibold text-gray-900">Language</h1>
          {saving && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
          {saved && <span className="text-xs text-green-600 font-medium">Saved</span>}
        </div>
        <p className="text-sm text-gray-500">
          Life OS will reply in your selected language across chat, WhatsApp, and voice.
        </p>
      </div>

      <LangGroup title="Indian languages" langs={indian} current={current} onSelect={handleSelect} />
      <LangGroup title="Other languages" langs={global} current={current} onSelect={handleSelect} />
    </div>
  )
}

function LangGroup({
  title,
  langs,
  current,
  onSelect,
}: {
  title: string
  langs: typeof LANGUAGES
  current: string
  onSelect: (code: string) => void
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">{title}</p>
      <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
        {langs.map((lang) => {
          const isSelected = lang.code === current
          return (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors',
                isSelected ? 'bg-indigo-50' : 'bg-white hover:bg-gray-50'
              )}
            >
              <div>
                <span className={cn('font-medium', isSelected ? 'text-indigo-700' : 'text-gray-900')}>
                  {lang.nativeName}
                </span>
                <span className="ml-2 text-gray-400 text-xs">{lang.name}</span>
              </div>
              {isSelected && <Check className="h-4 w-4 text-indigo-600 shrink-0" />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
