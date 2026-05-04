import { getResend, FROM_EMAIL, REPLY_TO, isEmailConfigured } from './client'
import {
  welcomeTemplate,
  passwordResetTemplate,
  emailVerifyTemplate,
  otpTemplate,
  billingReceiptTemplate,
  securityAlertTemplate,
} from './templates'

type SendResult = { success: true; id: string } | { success: false; error: string }

async function send(to: string, subject: string, html: string): Promise<SendResult> {
  if (!isEmailConfigured()) {
    console.warn('[email] RESEND_API_KEY not set — email not sent to', to)
    return { success: false, error: 'Email not configured' }
  }
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to,
      subject,
      html,
    })
    if (error) return { success: false, error: error.message }
    return { success: true, id: data!.id }
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[email] send failed:', msg)
    return { success: false, error: msg }
  }
}

export async function sendWelcomeEmail(to: string, name: string): Promise<SendResult> {
  const { subject, html } = welcomeTemplate(name)
  return send(to, subject, html)
}

export async function sendPasswordResetEmail(
  to: string,
  name: string,
  resetUrl: string
): Promise<SendResult> {
  const { subject, html } = passwordResetTemplate(name, resetUrl)
  return send(to, subject, html)
}

export async function sendVerificationEmail(
  to: string,
  name: string,
  verifyUrl: string
): Promise<SendResult> {
  const { subject, html } = emailVerifyTemplate(name, verifyUrl)
  return send(to, subject, html)
}

export async function sendOtpEmail(
  to: string,
  name: string,
  otp: string,
  purpose = 'verification'
): Promise<SendResult> {
  const { subject, html } = otpTemplate(name, otp, purpose)
  return send(to, subject, html)
}

export async function sendBillingReceiptEmail(
  to: string,
  params: {
    name: string
    plan: string
    amount: string
    currency: string
    invoiceId: string
    date: string
    nextBillingDate: string
  }
): Promise<SendResult> {
  const { subject, html } = billingReceiptTemplate(params)
  return send(to, subject, html)
}

export async function sendSecurityAlertEmail(
  to: string,
  params: {
    name: string
    event: string
    ip: string
    device: string
    time: string
    actionUrl: string
  }
): Promise<SendResult> {
  const { subject, html } = securityAlertTemplate(params)
  return send(to, subject, html)
}
