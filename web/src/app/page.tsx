import { ChatWindow } from '@/components/chat/chat-window'

export default function Home() {
  return (
    <main className="flex flex-col h-screen bg-white dark:bg-gray-950">
      <header className="shrink-0 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
          L
        </div>
        <div>
          <h1 className="font-semibold text-gray-900 dark:text-white text-sm">Life OS</h1>
          <p className="text-xs text-gray-500">Your personal AI assistant</p>
        </div>
      </header>
      <div className="flex-1 overflow-hidden">
        <ChatWindow />
      </div>
    </main>
  )
}
