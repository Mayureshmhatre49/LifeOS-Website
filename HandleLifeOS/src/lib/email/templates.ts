// Shared email HTML shell
function shell(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1e293b; }
    .wrap { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 40px; }
    .header h1 { margin: 0; color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
    .header p { margin: 4px 0 0; color: rgba(255,255,255,.75); font-size: 13px; }
    .body { padding: 36px 40px; }
    .body p { margin: 0 0 16px; line-height: 1.6; font-size: 15px; }
    .body p:last-child { margin-bottom: 0; }
    .btn { display: inline-block; margin: 24px 0; padding: 14px 28px; background: #4f46e5; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-size: 15px; font-weight: 600; }
    .code { display: inline-block; margin: 20px 0; padding: 16px 28px; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #4f46e5; font-family: 'Courier New', monospace; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
    .small { font-size: 13px; color: #64748b; }
    .footer { background: #f8fafc; padding: 20px 40px; border-top: 1px solid #e2e8f0; }
    .footer p { margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5; }
    .footer a { color: #64748b; }
    .alert { background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 12px 16px; margin: 16px 0; font-size: 14px; }
    .alert-danger { background: #fee2e2; border-color: #f87171; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>Life OS</h1>
      <p>Your AI-powered life assistant</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>You received this email because you have an account with Life OS.<br />
      <a href="https://lifeos.app/settings/notifications">Manage email preferences</a> · <a href="https://lifeos.app/legal/privacy">Privacy Policy</a></p>
    </div>
  </div>
</body>
</html>`
}

// ── Welcome ───────────────────────────────────────────────────────────────────
export function welcomeTemplate(name: string): { subject: string; html: string } {
  const firstName = name.split(' ')[0]
  return {
    subject: 'Welcome to Life OS — your AI-powered life assistant 🎉',
    html: shell(
      'Welcome to Life OS',
      `<p>Hi ${firstName},</p>
      <p>Welcome to <strong>Life OS</strong> — the AI assistant built to help you plan smarter, focus better, protect your money, and manage your family with ease.</p>
      <p>Here's what you can do right now:</p>
      <ul style="margin:0 0 16px;padding-left:20px;line-height:1.8">
        <li>Chat with your AI assistant</li>
        <li>Plan your day with the Daily Planner</li>
        <li>Use Focus Timer and Pomodoro tools</li>
        <li>Check if something is a scam</li>
        <li>Calculate EMI or compare loans</li>
      </ul>
      <a href="https://lifeos.app/chat" class="btn">Start chatting →</a>
      <hr class="divider" />
      <p class="small">Need help? Reply to this email or visit our <a href="https://lifeos.app/help">Help Centre</a>.</p>`
    ),
  }
}

// ── Password Reset ────────────────────────────────────────────────────────────
export function passwordResetTemplate(
  name: string,
  resetUrl: string
): { subject: string; html: string } {
  const firstName = name.split(' ')[0]
  return {
    subject: 'Reset your Life OS password',
    html: shell(
      'Reset Password',
      `<p>Hi ${firstName},</p>
      <p>We received a request to reset the password for your Life OS account. Click the button below to choose a new password:</p>
      <a href="${resetUrl}" class="btn">Reset my password →</a>
      <p class="small">This link expires in <strong>1 hour</strong>. If you didn't request a password reset, you can safely ignore this email — your account remains secure.</p>
      <hr class="divider" />
      <div class="alert alert-danger">
        <strong>Security tip:</strong> Life OS will never ask for your password by email or phone.
      </div>`
    ),
  }
}

// ── Email Verification ────────────────────────────────────────────────────────
export function emailVerifyTemplate(
  name: string,
  verifyUrl: string
): { subject: string; html: string } {
  const firstName = name.split(' ')[0]
  return {
    subject: 'Verify your Life OS email address',
    html: shell(
      'Verify Email',
      `<p>Hi ${firstName},</p>
      <p>Thanks for signing up for Life OS! Please verify your email address to activate your account and unlock all features.</p>
      <a href="${verifyUrl}" class="btn">Verify email address →</a>
      <p class="small">This link expires in <strong>24 hours</strong>. If you didn't create an account, please ignore this email.</p>`
    ),
  }
}

// ── OTP (WhatsApp fallback via email) ─────────────────────────────────────────
export function otpTemplate(
  name: string,
  otp: string,
  purpose: string
): { subject: string; html: string } {
  const firstName = name.split(' ')[0]
  return {
    subject: `Your Life OS verification code: ${otp}`,
    html: shell(
      'Verification Code',
      `<p>Hi ${firstName},</p>
      <p>Your one-time verification code for <strong>${purpose}</strong> is:</p>
      <div style="text-align:center">
        <div class="code">${otp}</div>
      </div>
      <p class="small">This code expires in <strong>10 minutes</strong> and can only be used once. Never share this code with anyone.</p>
      <hr class="divider" />
      <div class="alert">
        <strong>Didn't request this?</strong> Secure your account immediately by <a href="https://lifeos.app/login">signing in</a> and changing your password.
      </div>`
    ),
  }
}

// ── Billing Receipt ───────────────────────────────────────────────────────────
export function billingReceiptTemplate(params: {
  name: string
  plan: string
  amount: string
  currency: string
  invoiceId: string
  date: string
  nextBillingDate: string
}): { subject: string; html: string } {
  const firstName = params.name.split(' ')[0]
  return {
    subject: `Life OS — Payment receipt #${params.invoiceId}`,
    html: shell(
      'Payment Receipt',
      `<p>Hi ${firstName},</p>
      <p>Thank you for your payment. Here's your receipt:</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;font-size:14px">
        <tr style="border-bottom:1px solid #e2e8f0">
          <td style="padding:10px 0;color:#64748b">Plan</td>
          <td style="padding:10px 0;text-align:right;font-weight:600">${params.plan}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0">
          <td style="padding:10px 0;color:#64748b">Amount</td>
          <td style="padding:10px 0;text-align:right;font-weight:600">${params.currency} ${params.amount}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0">
          <td style="padding:10px 0;color:#64748b">Invoice ID</td>
          <td style="padding:10px 0;text-align:right">#${params.invoiceId}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0">
          <td style="padding:10px 0;color:#64748b">Date</td>
          <td style="padding:10px 0;text-align:right">${params.date}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#64748b">Next billing</td>
          <td style="padding:10px 0;text-align:right">${params.nextBillingDate}</td>
        </tr>
      </table>
      <a href="https://lifeos.app/settings/billing" class="btn">View billing →</a>
      <hr class="divider" />
      <p class="small">For billing questions, reply to this email or visit <a href="https://lifeos.app/help">Help Centre</a>.</p>`
    ),
  }
}

// ── Security Alert ────────────────────────────────────────────────────────────
export function securityAlertTemplate(params: {
  name: string
  event: string
  ip: string
  device: string
  time: string
  actionUrl: string
}): { subject: string; html: string } {
  const firstName = params.name.split(' ')[0]
  return {
    subject: `Security alert — ${params.event} on your Life OS account`,
    html: shell(
      'Security Alert',
      `<p>Hi ${firstName},</p>
      <p>We detected a <strong>${params.event}</strong> on your Life OS account.</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px">
        <tr style="border-bottom:1px solid #e2e8f0">
          <td style="padding:10px 0;color:#64748b">Event</td>
          <td style="padding:10px 0;font-weight:600">${params.event}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0">
          <td style="padding:10px 0;color:#64748b">Time</td>
          <td style="padding:10px 0">${params.time}</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0">
          <td style="padding:10px 0;color:#64748b">IP address</td>
          <td style="padding:10px 0">${params.ip}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#64748b">Device</td>
          <td style="padding:10px 0">${params.device}</td>
        </tr>
      </table>
      <p>If this was you, no action is needed. If you don't recognise this activity, secure your account immediately:</p>
      <a href="${params.actionUrl}" class="btn" style="background:#dc2626">Secure my account →</a>
      <hr class="divider" />
      <div class="alert alert-danger">
        <strong>Important:</strong> Never share your password or OTP codes with anyone claiming to be from Life OS support.
      </div>`
    ),
  }
}
