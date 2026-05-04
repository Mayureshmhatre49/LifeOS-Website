import { NextRequest, NextResponse } from 'next/server'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { auth } from '@/auth'

// Indian-accent voices available on ElevenLabs
// These voice IDs should be confirmed with your ElevenLabs account
const VOICE_MAP: Record<string, string> = {
  'en-IN': process.env.ELEVENLABS_VOICE_EN_IN ?? 'pNInz6obpgDQGcFmaJgB', // Adam (neutral, works for Indian EN)
  'hi-IN': process.env.ELEVENLABS_VOICE_HI_IN ?? 'pNInz6obpgDQGcFmaJgB', // Override in env with Hindi voice
  'ta-IN': process.env.ELEVENLABS_VOICE_EN_IN ?? 'pNInz6obpgDQGcFmaJgB',
  'te-IN': process.env.ELEVENLABS_VOICE_EN_IN ?? 'pNInz6obpgDQGcFmaJgB',
  'mr-IN': process.env.ELEVENLABS_VOICE_EN_IN ?? 'pNInz6obpgDQGcFmaJgB',
  'bn-IN': process.env.ELEVENLABS_VOICE_EN_IN ?? 'pNInz6obpgDQGcFmaJgB',
}

export const maxDuration = 30

export async function POST(req: NextRequest) {
  // Must be authenticated — TTS is a paid feature
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) {
    // Signal to client: no cloud TTS, use browser fallback
    return NextResponse.json({ fallback: true }, { status: 200 })
  }

  let text: string
  let lang: string

  try {
    const body = await req.json() as { text: string; lang?: string }
    text = body.text?.slice(0, 1000)?.trim()
    lang = body.lang ?? 'en-IN'
    if (!text) return NextResponse.json({ error: 'text is required' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const voiceId = VOICE_MAP[lang] ?? VOICE_MAP['en-IN']

  try {
    const client = new ElevenLabsClient({ apiKey })

    const audioStream = await client.textToSpeech.convert(voiceId, {
      text,
      modelId: 'eleven_multilingual_v2', // Best model for Indian languages
      voiceSettings: {
        stability: 0.6,
        similarityBoost: 0.8,
        style: 0.2,
        useSpeakerBoost: true,
      },
      outputFormat: 'mp3_44100_128',
    })

    // Collect stream to buffer (ReadableStream → Uint8Array)
    const reader = audioStream.getReader()
    const chunks: Uint8Array[] = []
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) chunks.push(value)
    }
    const buffer = Buffer.concat(chunks)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': String(buffer.length),
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('[TTS ElevenLabs]', err)
    // Signal fallback to browser TTS
    return NextResponse.json({ fallback: true }, { status: 200 })
  }
}
