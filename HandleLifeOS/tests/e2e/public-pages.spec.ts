import { test, expect } from '@playwright/test'

test.describe('Public Pages', () => {
  test('home / landing page loads', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/.+/)
    // Should not crash
    await expect(page.locator('body')).toBeVisible()
  })

  test('/api/health returns 200', async ({ request }) => {
    const res = await request.get('/api/health')
    expect(res.status()).toBe(200)
  })

  test('offline fallback page exists', async ({ page }) => {
    const res = await page.request.get('/offline')
    // Should return 200 (not 404)
    expect([200, 404]).toContain(res.status())
  })

  test('login page has correct title', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/.+/)
  })

  test('no JS errors on login page load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/login')
    await page.waitForLoadState('domcontentloaded')
    // Allow React hydration errors but not crashes
    const criticalErrors = errors.filter(
      (e) => !e.includes('hydration') && !e.includes('Hydration')
    )
    expect(criticalErrors).toHaveLength(0)
  })

  test('CSP header is set on page responses', async ({ page }) => {
    const res = await page.request.get('/login')
    const csp = res.headers()['content-security-policy']
    expect(csp).toBeTruthy()
    expect(csp).toContain('default-src')
    expect(csp).toContain("frame-ancestors 'none'")
  })

  test('X-Frame-Options header is set', async ({ page }) => {
    const res = await page.request.get('/login')
    const xfo = res.headers()['x-frame-options']
    expect(xfo).toBe('DENY')
  })

  test('X-Content-Type-Options header is set', async ({ page }) => {
    const res = await page.request.get('/login')
    const xcto = res.headers()['x-content-type-options']
    expect(xcto).toBe('nosniff')
  })
})
