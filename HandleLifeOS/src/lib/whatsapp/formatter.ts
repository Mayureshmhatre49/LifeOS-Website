/**
 * Converts markdown AI responses to WhatsApp-friendly format.
 *
 * WhatsApp supports limited formatting:
 *   *bold*, _italic_, ~strikethrough~, `monospace`, ```code block```
 *
 * Max message length: 4096 chars. We split if needed.
 */

const MAX_WA_LENGTH = 4000 // leave buffer below 4096

export function markdownToWhatsApp(text: string): string {
  return text
    // Headers → bold line
    .replace(/^#{1,6}\s+(.+)$/gm, '*$1*')
    // Bold **text** or __text__ → *text*
    .replace(/\*{2}([^*\n]+)\*{2}/g, '*$1*')
    .replace(/__([^_\n]+)__/g, '*$1*')
    // Italic *text* (single, not double) → _text_
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '_$1_')
    // Code blocks → ``` (already WhatsApp format)
    // Inline code `text` → `text` (already WhatsApp format)
    // Bullet lists → • item
    .replace(/^[\s-]*[-*+]\s+/gm, '• ')
    // Numbered lists → keep as is
    // Horizontal rules → ─────
    .replace(/^[-─*]{3,}$/gm, '─────')
    // Links → show label only
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Trim multiple blank lines
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export function splitForWhatsApp(text: string): string[] {
  if (text.length <= MAX_WA_LENGTH) return [text]

  const chunks: string[] = []
  const paragraphs = text.split('\n\n')
  let current = ''

  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length > MAX_WA_LENGTH) {
      if (current) chunks.push(current.trim())
      current = para
    } else {
      current = current ? current + '\n\n' + para : para
    }
  }

  if (current) chunks.push(current.trim())
  return chunks
}

export function formatForWhatsApp(text: string): string[] {
  const waText = markdownToWhatsApp(text)
  return splitForWhatsApp(waText)
}

/**
 * Parses the incoming WhatsApp "From" field to a clean phone number.
 * Twilio sends: "whatsapp:+919876543210" → "+919876543210"
 */
export function parseWhatsAppNumber(from: string): string {
  return from.replace(/^whatsapp:/, '').trim()
}
