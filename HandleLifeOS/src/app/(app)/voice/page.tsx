import type { Metadata } from 'next'
import { VoicePageClient } from '@/components/voice/VoicePageClient'

export const metadata: Metadata = {
  title: 'Voice Mode — Life OS',
  description: 'Hands-free access to Life OS via voice.',
}

export default function VoicePage() {
  return <VoicePageClient />
}
