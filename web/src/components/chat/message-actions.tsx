'use client'

import { useState } from 'react'
import { Copy, Check, RotateCcw } from 'lucide-react'

interface MessageActionsProps {
  content: string
  isLast?: boolean
  onRegenerate?: () => void
}

export function MessageActions({ content, isLast, onRegenerate }: MessageActionsProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard not available */
    }
  }

  return (
    <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        title={copied ? 'Copied!' : 'Copy response'}
        aria-label={copied ? 'Copied' : 'Copy response'}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>

      {isLast && onRegenerate && (
        <button
          onClick={onRegenerate}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          title="Regenerate response"
          aria-label="Regenerate response"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Regenerate</span>
        </button>
      )}
    </div>
  )
}
