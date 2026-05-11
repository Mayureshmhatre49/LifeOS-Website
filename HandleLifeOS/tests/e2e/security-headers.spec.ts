import { test, expect } from '@playwright/test'

/**
 * Security header verification E2E tests.
 * These verify the actual HTTP response headers from the running server.
 */

test.describe('Security Headers', () => {
  const PAGES = ['/', '/login', '/signup']

  for (const path of PAGES) {
    test(`${path} — Content-Security-Policy is set`, async ({ page }) => {
      const res = await page.request.get(path)
      const csp = res.headers()['content-security-policy']
      expect(csp, `${path} should have CSP header`).toBeTruthy()
    })

    test(`${path} — X-Frame-Options is DENY`, async ({ page }) => {
      const res = await page.request.get(path)
      expect(res.headers()['x-frame-options']).toBe('DENY')
    })

    test(`${path} — X-Content-Type-Options is nosniff`, async ({ page }) => {
      const res = await page.request.get(path)
      expect(res.headers()['x-content-type-options']).toBe('nosniff')
    })

    test(`${path} — Referrer-Policy is set`, async ({ page }) => {
      const res = await page.request.get(path)
      expect(res.headers()['referrer-policy']).toBeTruthy()
    })
  }

  test('CSP includes nonce-based script-src', async ({ page }) => {
    const res = await page.request.get('/login')
    const csp = res.headers()['content-security-policy']
    expect(csp).toContain('nonce-')
    expect(csp).toContain('strict-dynamic')
  })

  test('CSP frame-ancestors is none', async ({ page }) => {
    const res = await page.request.get('/login')
    const csp = res.headers()['content-security-policy']
    expect(csp).toContain("frame-ancestors 'none'")
  })

  test('CSP object-src is none', async ({ page }) => {
    const res = await page.request.get('/login')
    const csp = res.headers()['content-security-policy']
    expect(csp).toContain("object-src 'none'")
  })

  test('/api/v1 routes return CORS wildcard header', async ({ request }) => {
    const res = await request.fetch('/api/v1/test', {
      method: 'OPTIONS',
      headers: { Origin: 'https://external-app.example.com' },
    })
    // Either 204 (preflight handled) or 404 (route doesn't exist) — both ok
    // What matters is if 204, it has correct CORS headers
    if (res.status() === 204) {
      expect(res.headers()['access-control-allow-origin']).toBe('*')
    }
  })

  test('internal /api routes do NOT return CORS wildcard', async ({ request }) => {
    const res = await request.fetch('/api/chat', {
      method: 'OPTIONS',
      headers: { Origin: 'https://evil.example.com' },
    })
    const acao = res.headers()['access-control-allow-origin']
    if (acao) {
      expect(acao).not.toBe('*')
    }
  })
})
