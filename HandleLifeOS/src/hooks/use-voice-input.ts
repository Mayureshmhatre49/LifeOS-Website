'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { VoiceInputState } from '@/types/voice'

interface UseVoiceInputOptions {
  onInterimTranscript?: (text: string) => void
  onFinalTranscript: (text: string) => void
  language?: string
  continuous?: boolean
}

export interface UseVoiceInputReturn {
  state: VoiceInputState
  isSupported: boolean
  start: () => void
  stop: () => void
  interimText: string
}

export function useVoiceInput({
  onInterimTranscript,
  onFinalTranscript,
  language = 'en-IN',
  continuous = false,
}: UseVoiceInputOptions): UseVoiceInputReturn {
  const [state, setState] = useState<VoiceInputState>('idle')
  const [isSupported, setIsSupported] = useState(false)
  const [interimText, setInterimText] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    setIsSupported(
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    )
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setState('idle')
    setInterimText('')
  }, [])

  const start = useCallback(() => {
    if (!isSupported) {
      setState('error')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    const recognition: SpeechRecognition = new SR()
    recognition.lang = language
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setState('listening')
      setInterimText('')
    }

    recognition.onend = () => {
      setState('idle')
      setInterimText('')
      recognitionRef.current = null
    }

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error !== 'aborted') setState('error')
      setInterimText('')
      recognitionRef.current = null
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let final = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      if (interim) {
        setInterimText(interim)
        onInterimTranscript?.(interim)
      }

      if (final) {
        setInterimText('')
        onFinalTranscript(final.trim())
      }
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported, language, continuous, onInterimTranscript, onFinalTranscript])

  return { state, isSupported, start, stop, interimText }
}
