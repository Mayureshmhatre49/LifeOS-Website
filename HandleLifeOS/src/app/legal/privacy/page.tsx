import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Life OS',
  description: 'How Life OS collects, uses, and protects your personal information.',
}

const EFFECTIVE_DATE = '1 May 2026'
const CONTACT_EMAIL = 'privacy@lifeos.app'

export default function PrivacyPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Privacy Policy</h1>
      <p className="lead text-gray-500">Effective date: {EFFECTIVE_DATE}</p>

      <h2>1. Who we are</h2>
      <p>
        Life OS (&ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) provides an AI-powered personal assistant platform at <strong>lifeos.app</strong>. We are committed to protecting your privacy and handling your data transparently.
      </p>
      <p>For privacy questions, contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>

      <h2>2. Data we collect</h2>
      <h3>2a. Account data</h3>
      <p>When you create an account: name, email address, and a hashed password (we never store your raw password).</p>

      <h3>2b. Chat and assistant data</h3>
      <p>Messages you send to your AI assistant and the responses it generates. We use this to provide the service and, with your consent, to personalise future responses.</p>

      <h3>2c. Usage and device data</h3>
      <p>IP address, browser type, pages visited, and timestamps — collected automatically to secure the service, detect abuse, and improve performance.</p>

      <h3>2d. Financial data</h3>
      <p>When you subscribe, payment is processed by Razorpay. We store only your plan tier and billing dates — never your card number or CVV.</p>

      <h2>3. How we use your data</h2>
      <ul>
        <li>Provide, maintain, and improve the Life OS service</li>
        <li>Authenticate your account and prevent unauthorised access</li>
        <li>Send transactional emails (receipts, password resets, security alerts)</li>
        <li>Detect and prevent fraud, abuse, and security threats</li>
        <li>Comply with legal obligations</li>
      </ul>
      <p>We do <strong>not</strong> sell your personal data to third parties.</p>

      <h2>4. AI and your conversations</h2>
      <p>Your messages are sent to our AI provider (Anthropic or OpenAI) to generate responses. Both providers are contractually bound not to use your data to train their general models without your consent. We retain conversation history in your account so you can access it later; you can delete any conversation at any time.</p>

      <h2>5. Data sharing</h2>
      <p>We share data only with:</p>
      <ul>
        <li><strong>Supabase</strong> — database and auth infrastructure (EU region)</li>
        <li><strong>Anthropic / OpenAI</strong> — AI inference only</li>
        <li><strong>Razorpay</strong> — payment processing (India)</li>
        <li><strong>Resend</strong> — transactional email delivery</li>
        <li><strong>Law enforcement</strong> — when legally required</li>
      </ul>

      <h2>6. Your rights (GDPR / DPDP Act 2023)</h2>
      <p>You have the right to:</p>
      <ul>
        <li><strong>Access</strong> a copy of your personal data</li>
        <li><strong>Correct</strong> inaccurate data</li>
        <li><strong>Delete</strong> your account and all associated data</li>
        <li><strong>Portability</strong> — export your data in a machine-readable format</li>
        <li><strong>Withdraw consent</strong> at any time</li>
      </ul>
      <p>To exercise these rights, visit <strong>Settings → Account</strong> or email <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We will respond within 30 days.</p>

      <h2>7. Data retention</h2>
      <p>We retain your account data while your account is active. After deletion, personal data is purged within 30 days; anonymised usage statistics may be retained for analytics.</p>

      <h2>8. Security</h2>
      <p>We use bcrypt password hashing, TLS in transit, row-level security in our database, and rate limiting on all endpoints. Security events are logged and reviewed. No system is perfectly secure — please use a strong, unique password.</p>

      <h2>9. Cookies</h2>
      <p>See our <a href="/legal/cookies">Cookie Policy</a> for details. We use only essential session cookies by default.</p>

      <h2>10. Children</h2>
      <p>Life OS is not directed at children under 13. We do not knowingly collect data from children. If you believe a child has created an account, email us and we will delete it promptly.</p>

      <h2>11. Changes</h2>
      <p>We may update this policy. We will notify you by email or in-app notice 14 days before material changes take effect. Continued use after that date constitutes acceptance.</p>

      <h2>12. Contact</h2>
      <p>Email: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a><br />Response time: within 5 business days.</p>
    </article>
  )
}
