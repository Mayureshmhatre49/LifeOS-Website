'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX, RotateCcw, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVoiceInput } from '@/hooks/use-voice-input'
import { useVoiceOutput } from '@/hooks/use-voice-output'
import { Button } from '@/components/ui/button'
import type { VoiceMessage, VoicePreferences } from '@/types/voice'
import { DEFAULT_VOICE_PREFERENCES } from '@/types/voice'
import { getAIResponse, type VoiceHistoryItem } from '@/lib/voice/ai-bridge'

interface VoiceInterfaceProps {
  className?: string
}

const LANGUAGES = [
  { code: 'en-IN', label: 'English (India)' },
  { code: 'hi-IN', label: 'हिंदी' },
  { code: 'ta-IN', label: 'தமிழ்' },
  { code: 'te-IN', label: 'తెలుగు' },
  { code: 'mr-IN', label: 'मराठी' },
  { code: 'bn-IN', label: 'বাংলা' },
  { code: 'gu-IN', label: 'ગુજરાતી' },
  { code: 'kn-IN', label: 'ಕನ್ನಡ' },
]

export function VoiceInterface({ className }: VoiceInterfaceProps) {
  const [messages, setMessages] = useState<VoiceMessage[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [prefs, setPrefs] = useState<VoicePreferences>(DEFAULT_VOICE_PREFERENCES)
  const [interimDisplay, setInterimDisplay] = useState('')
  const [conversationId, setConversationId] = useState<string | undefined>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { speak, stop: stopSpeaking, isSpeaking, isSupported: ttsSupported, usingCloudTts } = useVoiceOutput()

  const handleFinalTranscript = useCallback(
    async (text: string) => {
      if (!text.trim()) return

      const userMsg: VoiceMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, userMsg])
      setInterimDisplay('')
      setIsThinking(true)

      try {
        // Build history from existing messages for conversation context
        const history: VoiceHistoryItem[] = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const response = await getAIResponse(text, history, conversationId)
        setConversationId(response.conversationId)

        const assistantMsg: VoiceMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.text,
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMsg])

        if (prefs.readResponses && ttsSupported) {
          speak(response.text, {
            rate: prefs.speechRate,
            pitch: prefs.speechPitch,
            lang: prefs.outputLanguage,
          })
        }
      } catch {
        const errMsg: VoiceMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'Sorry, I had trouble understanding that. Please try again.',
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, errMsg])
      } finally {
        setIsThinking(false)
      }
    },
    [prefs, ttsSupported, speak, messages, conversationId]
  )

  const { state: inputState, isSupported: sttSupported, start, stop } = useVoiceInput({
    onInterimTranscript: setInterimDisplay,
    onFinalTranscript: handleFinalTranscript,
    language: prefs.inputLanguage,
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const toggleMic = useCallback(() => {
    if (inputState === 'listening') {
      stop()
    } else {
      stopSpeaking()
      start()
    }
  }, [inputState, start, stop, stopSpeaking])

  const clearHistory = useCallback(() => {
    stopSpeaking()
    setMessages([])
    setInterimDisplay('')
    setConversationId(undefined)
  }, [stopSpeaking])

  const isListening = inputState === 'listening'
  const isBusy = isThinking || isSpeaking

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-gray-900">Voice Mode</h1>
            {usingCloudTts && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                <Sparkles className="h-3 w-3" />
                ElevenLabs
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">Hands-free Life OS · {LANGUAGES.find(l => l.code === prefs.inputLanguage)?.label ?? 'English'}</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <select
            value={prefs.inputLanguage}
            onChange={(e) => setPrefs((p) => ({ ...p, inputLanguage: e.target.value, outputLanguage: e.target.value }))}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            aria-label="Voice language"
          >
            {LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" onClick={clearHistory} title="Clear conversation" className="h-8 w-8">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && !interimDisplay && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 pb-16">
            <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center">
              <Mic className="h-8 w-8 text-indigo-400" />
            </div>
            <div>
              <p className="font-medium text-gray-700">Tap the mic to start speaking</p>
              <p className="text-sm text-gray-400 mt-1">Ask Life OS anything — hands-free</p>
            </div>
            {!sttSupported && (
              <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                Your browser does not support voice input. Try Chrome or Edge.
              </p>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex gap-2 max-w-[85%]',
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            )}
          >
            <div
              className={cn(
                'rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              )}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {/* Interim text */}
        {interimDisplay && (
          <div className="flex gap-2 max-w-[85%] ml-auto flex-row-reverse">
            <div className="rounded-2xl rounded-br-sm px-4 py-2.5 text-sm leading-relaxed bg-indigo-200 text-indigo-800 italic">
              {interimDisplay}…
            </div>
          </div>
        )}

        {/* Thinking */}
        {isThinking && (
          <div className="flex gap-2 max-w-[85%]">
            <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-gray-100">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Mic Controls */}
      <div className="flex flex-col items-center gap-3 px-4 py-6 border-t border-gray-100 bg-white">
        {/* Status label */}
        <p className="text-xs text-gray-400 h-4">
          {isListening && 'Listening…'}
          {isThinking && 'Thinking…'}
          {isSpeaking && (usingCloudTts ? 'Speaking (ElevenLabs)…' : 'Speaking…')}
          {!isListening && !isThinking && !isSpeaking && 'Tap to speak'}
        </p>

        {/* Waveform animation while listening */}
        {isListening && (
          <div className="flex items-end gap-0.5 h-8 mb-1">
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="w-1 bg-red-400 rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.sin(i * 0.8) * 12}px`,
                  animationDelay: `${i * 60}ms`,
                  animationDuration: `${600 + (i % 3) * 100}ms`,
                }}
              />
            ))}
          </div>
        )}

        <div className="flex items-center gap-4">
          {/* TTS stop */}
          {isSpeaking && (
            <Button variant="outline" size="icon" onClick={stopSpeaking} className="h-10 w-10 rounded-full">
              <VolumeX className="h-4 w-4" />
            </Button>
          )}

          {/* Main mic button */}
          <button
            id="voice-mic-button"
            onClick={toggleMic}
            disabled={isBusy && !isListening}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
            className={cn(
              'relative flex items-center justify-center h-20 w-20 rounded-full transition-all duration-200 shadow-lg',
              isListening
                ? 'bg-red-500 text-white shadow-red-200 shadow-xl scale-110'
                : isBusy
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-indigo-200'
            )}
          >
            {isListening && (
              <>
                <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-30" />
                <span className="absolute -inset-2 rounded-full bg-red-300 animate-ping opacity-20 [animation-delay:300ms]" />
              </>
            )}
            {isListening ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
          </button>

          {/* TTS toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPrefs((p) => ({ ...p, readResponses: !p.readResponses }))}
            title={prefs.readResponses ? 'Mute responses' : 'Read responses aloud'}
            className="h-10 w-10 rounded-full"
          >
            {prefs.readResponses ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
