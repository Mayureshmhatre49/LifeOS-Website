'use client'

import { Component, type ReactNode } from 'react'
import { VoiceInterface } from '@/components/voice/voice-interface'
import { Mic, RefreshCw } from 'lucide-react'

class VoiceErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
          <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center">
            <Mic className="h-6 w-6 text-rose-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">Voice unavailable</p>
            <p className="text-xs text-gray-500 mt-1">Could not connect to the voice service. Check your network and try again.</p>
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export function VoicePageClient() {
  return (
    <VoiceErrorBoundary>
      <VoiceInterface className="h-full" />
    </VoiceErrorBoundary>
  )
}
