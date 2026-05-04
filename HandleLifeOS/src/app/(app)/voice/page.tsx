import { VoiceInterface } from '@/components/voice/voice-interface'

export const metadata = {
  title: 'Voice Mode — Life OS',
  description: 'Hands-free access to Life OS via voice.',
}

export default function VoicePage() {
  return <VoiceInterface className="h-full" />
}
