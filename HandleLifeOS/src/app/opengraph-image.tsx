import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Life OS — AI for Everyday Life'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #eef2ff 0%, #ffffff 50%, #f5f3ff 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: '800',
              color: 'white',
            }}
          >
            L
          </div>
          <span style={{ fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>Life OS</span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: '800',
            color: '#111827',
            lineHeight: 1.1,
            maxWidth: '780px',
            marginBottom: '24px',
          }}
        >
          AI for Every Life{' '}
          <span style={{ color: '#4f46e5' }}>Decision</span>
        </div>

        {/* Subline */}
        <div
          style={{
            fontSize: '26px',
            color: '#6b7280',
            maxWidth: '700px',
            lineHeight: 1.4,
            marginBottom: '48px',
          }}
        >
          EMI calculator · Scam checker · Daily planner · Budget tracker — built for India
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['🧮 EMI Calc', '🛡️ Scam Check', '📅 Planner', '💰 Budget', '👨‍👩‍👧 Family'].map((tag) => (
            <div
              key={tag}
              style={{
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '999px',
                padding: '10px 22px',
                fontSize: '20px',
                color: '#374151',
                fontWeight: '600',
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Domain badge */}
        <div
          style={{
            position: 'absolute',
            bottom: '48px',
            right: '80px',
            fontSize: '20px',
            color: '#9ca3af',
            fontWeight: '500',
          }}
        >
          lifeos.app
        </div>
      </div>
    ),
    { ...size }
  )
}
