'use client'

import { useCallback, useRef } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVoiceInput } from '@/hooks/use-voice-input'

interface VoiceMicButtonProps {
  onTranscript: (text: string) => void
  onFinalTranscript?: (text: string) => void
  disabled?: boolean
  language?: string
  className?: string
}

export function VoiceMicButton({
  onTranscript,
  onFinalTranscript,
  disabled,
  language = 'en-IN',
  className,
}: VoiceMicButtonProps) {
  const isHoldingRef = useRef(false)

  const { state, isSupported, start, stop } = useVoiceInput({
    onInterimTranscript: onTranscript,
    onFinalTranscript: onFinalTranscript ?? onTranscript,
    language,
  })

  const handleMouseDown = useCallback(() => {
    if (disabled || !isSupported) return
    isHoldingRef.current = true
    start()
  }, [disabled, isSupported, start])

  const handleMouseUp = useCallback(() => {
    if (!isHoldingRef.current) return
    isHoldingRef.current = false
    stop()
  }, [stop])

  const handleClick = useCallback(() => {
    if (disabled || !isSupported) return
    if (state === 'listening') {
      stop()
    } else {
      start()
    }
  }, [disabled, isSupported, state, start, stop])

  if (!isSupported) return null

  const isListening = state === 'listening'
  const isProcessing = state === 'processing'

  return (
    <button
      type="button"
      title={isListening ? 'Stop listening (click or hold)' : 'Speak your message'}
      aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
      disabled={disabled || isProcessing}
      className={cn(
        'flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-150 shrink-0',
        isListening
          ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-200'
          : 'bg-gray-100 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600',
        (disabled || isProcessing) && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {isProcessing ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isListening ? (
        <MicOff className="h-3.5 w-3.5" />
      ) : (
        <Mic className="h-3.5 w-3.5" />
      )}
    </button>
  )
}
