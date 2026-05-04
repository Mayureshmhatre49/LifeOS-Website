'use client'

import { useState, useCallback, useRef } from 'react'

const MARKDOWN_PATTERNS: [RegExp, string][] = [
  [/#{1,6}\s+/g, ''],
  [/\*{2}([^*]+)\*{2}/g, '$1'],
  [/\*([^*]+)\*/g, '$1'],
  [/_([^_]+)_/g, '$1'],
  [/`{3}[\s\S]*?`{3}/g, ''],
  [/`([^`]+)`/g, '$1'],
  [/\[([^\]]+)\]\([^)]+\)/g, '$1'],
  [/^[-*+]\s+/gm, ''],
  [/^\d+\.\s+/gm, ''],
  [/\n{3,}/g, '\n\n'],
]

function stripMarkdown(text: string): string {
  return MARKDOWN_PATTERNS.reduce(
    (t, [pattern, replacement]) => t.replace(pattern, replacement),
    text
  ).trim()
}

export interface UseVoiceOutputReturn {
  speak: (text: string, options?: SpeakOptions) => void
  stop: () => void
  isSpeaking: boolean
  isSupported: boolean
  voices: SpeechSynthesisVoice[]
  usingCloudTts: boolean
}

export interface SpeakOptions {
  rate?: number
  pitch?: number
  lang?: string
  voiceUri?: string
}

async function fetchCloudTts(text: string, lang: string): Promise<ArrayBuffer | null> {
  try {
    const res = await fetch('/api/voice/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: text.slice(0, 800), lang }),
    })

    if (!res.ok) return null

    const contentType = res.headers.get('Content-Type') ?? ''
    if (contentType.includes('audio/mpeg')) {
      return await res.arrayBuffer()
    }

    // Server signaled fallback
    return null
  } catch {
    return null
  }
}

export function useVoiceOutput(): UseVoiceOutputReturn {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [usingCloudTts, setUsingCloudTts] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])

  const isBrowserTtsSupported = typeof window !== 'undefined' && 'speechSynthesis' in window
  const isSupported = true // Always "supported" since cloud TTS is always available

  // Load browser voices on mount
  if (isBrowserTtsSupported && voices.length === 0) {
    const loadVoices = () => setVoices(window.speechSynthesis.getVoices())
    loadVoices()
    window.speechSynthesis.onvoiceschanged = loadVoices
  }

  const stop = useCallback(() => {
    // Stop cloud audio if playing
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    // Stop browser TTS if playing
    if (isBrowserTtsSupported) {
      window.speechSynthesis.cancel()
    }
    setIsSpeaking(false)
    setUsingCloudTts(false)
  }, [isBrowserTtsSupported])

  const speak = useCallback(async (text: string, options: SpeakOptions = {}) => {
    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }
    if (isBrowserTtsSupported) {
      window.speechSynthesis.cancel()
    }

    const cleaned = stripMarkdown(text)
    if (!cleaned) return

    const lang = options.lang ?? 'en-IN'

    setIsSpeaking(true)

    // ── Try Cloud TTS (ElevenLabs) first ────────────────────────────────────
    const audioBuffer = await fetchCloudTts(cleaned, lang)

    if (audioBuffer && audioBuffer.byteLength > 0) {
      setUsingCloudTts(true)
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' })
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audioRef.current = audio

      audio.onended = () => {
        setIsSpeaking(false)
        setUsingCloudTts(false)
        URL.revokeObjectURL(url)
        audioRef.current = null
      }
      audio.onerror = () => {
        setIsSpeaking(false)
        setUsingCloudTts(false)
        URL.revokeObjectURL(url)
        audioRef.current = null
      }

      audio.play().catch(() => {
        setIsSpeaking(false)
        setUsingCloudTts(false)
      })
      return
    }

    // ── Fallback to Browser Web Speech API ───────────────────────────────────
    setUsingCloudTts(false)

    if (!isBrowserTtsSupported) {
      setIsSpeaking(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(cleaned)
    utterance.rate = options.rate ?? 0.95
    utterance.pitch = options.pitch ?? 1.0
    utterance.lang = lang

    if (options.voiceUri) {
      const voice = window.speechSynthesis.getVoices().find((v) => v.voiceURI === options.voiceUri)
      if (voice) utterance.voice = voice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => {
      setIsSpeaking(false)
      utteranceRef.current = null
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
      utteranceRef.current = null
    }

    utteranceRef.current = utterance
    window.speechSynthesis.speak(utterance)
  }, [isBrowserTtsSupported])

  return { speak, stop, isSpeaking, isSupported, voices, usingCloudTts }
}
