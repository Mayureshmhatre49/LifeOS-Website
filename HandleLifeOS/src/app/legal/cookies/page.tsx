import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — Life OS',
  description: 'How Life OS uses cookies and similar technologies.',
}

export default function CookiesPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1>Cookie Policy</h1>
      <p className="lead text-gray-500">Effective date: 1 May 2026</p>

      <h2>What are cookies?</h2>
      <p>Cookies are small text files placed on your device by websites you visit. They help the site remember your preferences and session state.</p>

      <h2>Cookies we use</h2>

      <h3>Essential cookies (always active)</h3>
      <table>
        <thead>
          <tr><th>Name</th><th>Purpose</th><th>Expires</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>next-auth.session-token</code></td>
            <td>Keeps you signed in securely (JWT)</td>
            <td>30 days</td>
          </tr>
          <tr>
            <td><code>next-auth.csrf-token</code></td>
            <td>Prevents cross-site request forgery</td>
            <td>Session</td>
          </tr>
          <tr>
            <td><code>next-auth.callback-url</code></td>
            <td>Remembers redirect after login</td>
            <td>Session</td>
          </tr>
        </tbody>
      </table>
      <p>These cookies are strictly necessary for the service to function. You cannot opt out of them while using Life OS.</p>

      <h3>Analytics cookies (optional)</h3>
      <p>We currently do not use any third-party analytics or tracking cookies. If we add analytics in future, we will update this policy and ask for your consent.</p>

      <h3>Payment cookies</h3>
      <p>When you pay via Razorpay, Razorpay may set cookies on their checkout domain to process your payment securely. These are governed by <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer">Razorpay&rsquo;s Privacy Policy</a>.</p>

      <h2>Managing cookies</h2>
      <p>You can control cookies through your browser settings. Deleting the session cookie will sign you out. Blocking all cookies will prevent you from using the service.</p>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer">Chrome</a></li>
        <li><a href="https://support.mozilla.org/en-US/kb/enable-and-disable-cookies-website-preferences" target="_blank" rel="noopener noreferrer">Firefox</a></li>
        <li><a href="https://support.apple.com/en-gb/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer">Safari</a></li>
      </ul>

      <h2>Contact</h2>
      <p>Questions? Email <a href="mailto:privacy@lifeos.app">privacy@lifeos.app</a>.</p>
    </article>
  )
}
