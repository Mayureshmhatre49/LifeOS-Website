const KEY_PREFIX = 'lok_live_'
const KEY_BYTES = 24   // 24 random bytes → 32-char base64url → readable key

/**
 * Generates a new API key pair.
 * Returns the raw key (shown once) and its SHA-256 hash (stored in DB).
 */
export async function generateApiKey(): Promise<{ raw: string; hash: string; prefix: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(KEY_BYTES))
  const b64 = Buffer.from(bytes).toString('base64url')
  const raw = KEY_PREFIX + b64
  const prefix = raw.slice(0, 16)   // "lok_live_XXXXXXX" — safe to show in UI

  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(raw))
  const hash = Buffer.from(hashBuffer).toString('hex')

  return { raw, hash, prefix }
}

/**
 * Hashes a raw key for DB lookup.
 */
export async function hashApiKey(raw: string): Promise<string> {
  const encoder = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(raw))
  return Buffer.from(hashBuffer).toString('hex')
}

/**
 * Extracts the Bearer token from an Authorization header.
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7).trim() || null
}

/**
 * Checks whether a raw key looks like a Life OS API key.
 */
export function isLifeOSKey(raw: string): boolean {
  return raw.startsWith(KEY_PREFIX) && raw.length > KEY_PREFIX.length + 8
}
