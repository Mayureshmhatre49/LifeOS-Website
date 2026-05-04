import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'API Reference — Life OS',
  description: 'Life OS Public API v1 — integrate AI-powered personal assistance into your apps.',
}

const BASE = 'https://api.lifeos.app'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        {/* Header */}
        <header className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧠</span>
            <h1 className="text-3xl font-bold text-white">Life OS API</h1>
            <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">v1</span>
          </div>
          <p className="text-gray-400 text-lg">
            Embed AI-powered life assistance — chat, scam detection, planning — directly in your apps.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-400">● Live</span>
            <span className="text-gray-500">Base URL: <code className="text-indigo-400">{BASE}</code></span>
          </div>
        </header>

        <hr className="border-gray-800" />

        {/* Auth */}
        <Section title="Authentication">
          <p className="text-gray-400 mb-4">
            All API requests require a bearer token. Generate keys in{' '}
            <a href="/settings/api" className="text-indigo-400 hover:underline">Settings → API Keys</a>.
            API access requires a <strong>Pro or Family</strong> plan.
          </p>
          <CodeBlock>{`Authorization: Bearer lok_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`}</CodeBlock>
        </Section>

        {/* Endpoints */}
        <Section title="Endpoints">

          <EndpointBlock
            method="POST"
            path="/api/v1/chat"
            description="Send a message and receive an AI response. Supports multilingual replies."
          >
            <p className="text-sm text-gray-400 mb-2">Request body</p>
            <CodeBlock>{`{
  "message": "What should I check before buying a used car?",
  "language": "hi-IN",   // optional: BCP-47 code for response language
  "context":  "..."      // optional: system context for your app (max 1000 chars)
}`}</CodeBlock>
            <p className="text-sm text-gray-400 mt-4 mb-2">Response</p>
            <CodeBlock>{`{
  "text":      "यहाँ कुछ महत्वपूर्ण बातें हैं...",
  "model":     "anthropic",
  "requestId": "uuid"
}`}</CodeBlock>
          </EndpointBlock>

          <EndpointBlock
            method="POST"
            path="/api/v1/protect"
            description="Analyse text for scams, suspicious quotes, or risky contracts."
          >
            <p className="text-sm text-gray-400 mb-2">Request body</p>
            <CodeBlock>{`{
  "text": "You have won ₹50 lakh! Click this link to claim now...",
  "type": "scam" // "scam" | "quote" | "contract" | "auto"
}`}</CodeBlock>
            <p className="text-sm text-gray-400 mt-4 mb-2">Response</p>
            <CodeBlock>{`{
  "riskLevel":      "high",
  "summary":        "This is a classic lottery scam.",
  "redFlags":       ["Unsolicited prize claim", "Urgency pressure"],
  "recommendation": "Do not click any links. Block the sender."
}`}</CodeBlock>
          </EndpointBlock>

          <EndpointBlock
            method="GET"
            path="/api/v1/usage"
            description="Get your current month's API usage and quota."
          >
            <p className="text-sm text-gray-400 mb-2">Response</p>
            <CodeBlock>{`{
  "month":      "2026-04",
  "plan":       "pro",
  "aiRequests": { "used": 42, "limit": -1, "exceeded": false },
  "whatsappMessages": { "used": 5, "limit": -1, "exceeded": false }
}`}</CodeBlock>
          </EndpointBlock>
        </Section>

        {/* Errors */}
        <Section title="Error codes">
          <table className="w-full text-sm border border-gray-800 rounded-xl overflow-hidden">
            <thead className="bg-gray-900">
              <tr>
                <th className="text-left px-4 py-2 text-gray-300 font-medium">Status</th>
                <th className="text-left px-4 py-2 text-gray-300 font-medium">Meaning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[
                ['401', 'Missing or invalid API key'],
                ['403', 'Plan does not include API access (upgrade to Pro)'],
                ['400', 'Invalid request body'],
                ['429', 'Monthly quota exceeded'],
                ['500', 'Internal server error — retry after a few seconds'],
              ].map(([status, meaning]) => (
                <tr key={status} className="bg-gray-950">
                  <td className="px-4 py-2 font-mono text-red-400">{status}</td>
                  <td className="px-4 py-2 text-gray-400">{meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Rate limits */}
        <Section title="Rate limits">
          <table className="w-full text-sm border border-gray-800 rounded-xl overflow-hidden">
            <thead className="bg-gray-900">
              <tr>
                <th className="text-left px-4 py-2 text-gray-300 font-medium">Plan</th>
                <th className="text-left px-4 py-2 text-gray-300 font-medium">AI requests / month</th>
                <th className="text-left px-4 py-2 text-gray-300 font-medium">API keys</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[
                ['Free', '50', '—'],
                ['Pro', 'Unlimited', '5'],
                ['Family', 'Unlimited', '5'],
              ].map(([plan, reqs, keys]) => (
                <tr key={plan} className="bg-gray-950">
                  <td className="px-4 py-2 text-gray-300 font-medium">{plan}</td>
                  <td className="px-4 py-2 text-gray-400">{reqs}</td>
                  <td className="px-4 py-2 text-gray-400">{keys}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Quick start */}
        <Section title="Quick start">
          <CodeBlock>{`curl -X POST ${BASE}/api/v1/chat \\
  -H "Authorization: Bearer lok_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Is this WhatsApp message a scam?"}'`}</CodeBlock>
        </Section>

        <hr className="border-gray-800" />
        <footer className="text-center text-sm text-gray-600">
          Life OS API · <a href="/" className="text-indigo-400 hover:underline">Back to app</a>
        </footer>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      {children}
    </section>
  )
}

function EndpointBlock({
  method,
  path,
  description,
  children,
}: {
  method: string
  path: string
  description: string
  children: React.ReactNode
}) {
  const color = method === 'GET' ? 'text-green-400 bg-green-400/10' : 'text-blue-400 bg-blue-400/10'
  return (
    <div className="rounded-xl border border-gray-800 overflow-hidden mb-6">
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-900">
        <span className={`text-xs font-bold px-2 py-0.5 rounded ${color}`}>{method}</span>
        <code className="text-sm text-gray-200">{path}</code>
      </div>
      <div className="px-4 py-3 bg-gray-950 space-y-3">
        <p className="text-sm text-gray-400">{description}</p>
        {children}
      </div>
    </div>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="rounded-xl bg-gray-900 border border-gray-800 px-4 py-3 text-xs text-gray-300 overflow-x-auto leading-relaxed">
      <code>{children}</code>
    </pre>
  )
}
