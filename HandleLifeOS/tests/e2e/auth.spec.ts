import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('login page loads and shows key elements', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveTitle(/Life OS|Login|Sign in/i)
    // Should have email input
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
    // Should have password input
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible()
  })

  test('signup page is accessible', async ({ page }) => {
    await page.goto('/signup')
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
  })

  test('unauthenticated user is redirected from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/)
  })

  test('unauthenticated user is redirected from /habits to /login', async ({ page }) => {
    await page.goto('/habits')
    await expect(page).toHaveURL(/login/)
  })

  test('forgot-password page loads', async ({ page }) => {
    await page.goto('/forgot-password')
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible()
  })

  test('invalid login shows error state', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[type="email"], input[name="email"]', 'nobody@nowhere.com')
    await page.fill('input[type="password"], input[name="password"]', 'WrongPassword1!')
    await page.click('button[type="submit"]')
    // Should either show error message or stay on login page
    await expect(page).toHaveURL(/login/)
  })
})
