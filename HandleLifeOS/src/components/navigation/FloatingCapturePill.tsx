'use client'

import { X, Mic, Keyboard, Camera, Sparkles } from 'lucide-react'
import { useEffect } from 'react'

interface Props {
  onClose: () => void
}

export function FloatingCapturePill({ onClose }: Props) {
  // Optional: close on escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <>
      {/* Background overlay to capture clicks outside */}
      <div 
        className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />
      
      {/* The expanded pill */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-50 w-[300px] h-[60px] bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-between px-6 border border-gray-100 animate-in slide-in-from-bottom-6 fade-in duration-200">
        
        {/* Left Actions */}
        <div className="flex items-center gap-5">
          <button className="text-indigo-400 hover:text-indigo-600 transition-colors active:scale-95">
            <Mic className="h-[22px] w-[22px]" strokeWidth={2.5} />
          </button>
          <button className="text-indigo-400 hover:text-indigo-600 transition-colors active:scale-95">
            <Keyboard className="h-[20px] w-[20px]" strokeWidth={2.5} />
          </button>
        </div>

        {/* Center Close Button */}
        <button 
          onClick={onClose}
          className="h-[46px] w-[46px] rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-md shadow-indigo-300/40 text-white hover:scale-105 active:scale-95 transition-all absolute left-1/2 -translate-x-1/2"
        >
          <X className="h-6 w-6" strokeWidth={2.5} />
        </button>

        {/* Right Actions */}
        <div className="flex items-center gap-5">
          <button className="text-indigo-400 hover:text-indigo-600 transition-colors active:scale-95">
            <Camera className="h-[20px] w-[20px]" strokeWidth={2.5} />
          </button>
          <button className="text-indigo-400 hover:text-indigo-600 transition-colors active:scale-95">
            <Sparkles className="h-[20px] w-[20px]" strokeWidth={2.5} />
          </button>
        </div>

      </div>
    </>
  )
}
