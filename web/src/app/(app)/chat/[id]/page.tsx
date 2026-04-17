import { ChatInterface } from '@/components/chat/chat-interface'
import { generatePageMeta } from '@/lib/seo/metadata'
import type { Metadata } from 'next'

export const metadata: Metadata = generatePageMeta({ title: 'Chat', noIndex: true })

interface Props {
  params: Promise<{ id: string }>
}

export default async function ConversationPage({ params }: Props) {
  const { id } = await params
  return <ChatInterface conversationId={id} />
}
