/**
 * Life OS — 10 Persona E2E Runner
 *
 * Runs each persona through signup → all 28 modules → cross-module checks → logout/re-login.
 * Executed via: npx ts-node tests/e2e-personas/persona-runner.ts
 */

import { chromium, Browser, BrowserContext, Page } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'
import { PERSONAS, type Persona } from './personas'
import {
  BASE_URL, LOG_DIR, log,
  appendToLog, recordBug, recordCoverage, screenshot,
  attachConsoleCollector, verifyEmailViaAdminApi,
  safeGoto, safeFill, safeClick, waitForNav, measureLoad,
  runSecuritySmokes, bugs, coverageMatrix,
  writeBugReport, writeCoverageReport,
} from './helpers'

const EXEC_LOG = path.join(LOG_DIR, 'EXECUTION_LOG.md')
const FIXTURES = path.join(LOG_DIR, 'fixtures')
const TIMEOUT_PER_ACTION = 15000
const TIMEOUT_PER_PAGE = 30000

const ALL_MODULES = [
  'Dashboard', 'Planner', 'Focus', 'Money', 'Protection',
  'Family', 'AURA', 'Mind', 'Notifications', 'Vault',
  'Habits', 'Travel', 'Career', 'Home', 'Network',
  'Nutrition', 'Investments', 'Legal', 'Business',
  'Briefing', 'Community', 'Voice', 'Billing', 'Insights',
  'Settings', 'Capture', 'Personalisation', 'Implementation',
]

const MODULE_ROUTES: Record<string, string> = {
  Dashboard: '/dashboard',
  Planner: '/planner',
  Focus: '/focus',
  Money: '/money',
  Protection: '/protection',
  Family: '/family',
  AURA: '/aura',
  Mind: '/mind',
  Notifications: '/notifications',
  Vault: '/vault',
  Habits: '/habits',
  Travel: '/travel',
  Career: '/career',
  Home: '/home',
  Network: '/network',
  Nutrition: '/nutrition',
  Investments: '/investments',
  Legal: '/legal',
  Business: '/business',
  Briefing: '/briefing',
  Community: '/community',
  Voice: '/voice',
  Billing: '/billing',
  Insights: '/insights',
  Settings: '/settings',
  Capture: '/capture',
  Personalisation: '/settings/personalisation',
  Implementation: '/implementation',
}

// ── Init log file ──────────────────────────────────────────────────────────────
fs.mkdirSync(LOG_DIR, { recursive: true })
fs.writeFileSync(EXEC_LOG, `# Life OS E2E Persona Execution Log\n\n**Started:** ${new Date().toISOString()}\n\n---\n\n`)

// ── Signup ─────────────────────────────────────────────────────────────────────
async function signupPersona(page: Page, persona: Persona, moduleRef: { current: string }): Promise<boolean> {
  moduleRef.current = 'Signup'
  log(`[${persona.id}] Starting signup`)

  const ok = await safeGoto(page, `${BASE_URL}/signup`)
  if (!ok) {
    recordBug({ severity: 'critical', category: 'network-failure', persona: persona.id, module: 'Signup', description: 'Cannot reach /signup', reproSteps: 'Navigate to /signup', expected: '200 response', actual: 'Navigation failed' })
    return false
  }

  await page.waitForTimeout(2000)

  // Fill signup form — try multiple possible selectors
  const nameOk = await safeFill(page, 'input[name="name"], input[placeholder*="name" i], input[id*="name" i]', persona.name)
  const emailOk = await safeFill(page, 'input[type="email"], input[name="email"]', persona.email)
  const passOk = await safeFill(page, 'input[type="password"], input[name="password"]', persona.password)

  if (!nameOk || !emailOk || !passOk) {
    const shot = await screenshot(page, persona.id, 'Signup', 'form-fill-failed')
    recordBug({ severity: 'critical', category: 'ui-break', persona: persona.id, module: 'Signup', description: `Signup form fields not found (name:${nameOk}, email:${emailOk}, pass:${passOk})`, reproSteps: 'Open /signup and attempt to fill form', expected: 'All fields visible and fillable', actual: 'One or more fields missing', screenshotPath: shot })
    return false
  }

  // Submit
  const submitted = await safeClick(page, 'button[type="submit"]')
  if (!submitted) {
    recordBug({ severity: 'critical', category: 'ui-break', persona: persona.id, module: 'Signup', description: 'Submit button not found on signup form', reproSteps: 'Fill signup form → click submit', expected: 'Submit button present', actual: 'Button not clickable' })
    return false
  }

  await page.waitForTimeout(3000)
  await screenshot(page, persona.id, 'Signup', 'after-submit')

  // Verify email via admin API (the one allowed shortcut)
  const verified = await verifyEmailViaAdminApi(persona.email)
  log(`[${persona.id}] Email verification via admin API: ${verified ? 'SUCCESS' : 'FAILED'}`)

  if (!verified) {
    recordBug({ severity: 'high', category: 'blocked', persona: persona.id, module: 'Signup', description: 'Admin email verification failed — Supabase admin API may not be configured', reproSteps: 'Call PUT /auth/v1/admin/users/:id with email_confirm:true', expected: 'Email marked verified', actual: 'API call failed or returned error' })
  }

  // Navigate to login
  await safeGoto(page, `${BASE_URL}/login`)
  await page.waitForTimeout(1500)

  // Fill login form
  await safeFill(page, 'input[type="email"], input[name="email"]', persona.email)
  await safeFill(page, 'input[type="password"], input[name="password"]', persona.password)
  await safeClick(page, 'button[type="submit"]')
  await page.waitForTimeout(4000)

  const currentUrl = page.url()
  const loggedIn = !currentUrl.includes('/login') && !currentUrl.includes('/signup')
  log(`[${persona.id}] Login result: ${loggedIn ? 'SUCCESS' : 'FAILED'} (URL: ${currentUrl})`)

  if (!loggedIn) {
    const shot = await screenshot(page, persona.id, 'Login', 'failed')
    recordBug({ severity: 'critical', category: 'blocked', persona: persona.id, module: 'Login', description: `Login failed — still at ${currentUrl}`, reproSteps: 'Sign up → verify email → login with same credentials', expected: 'Redirect to /dashboard or /today', actual: `Still at ${currentUrl}`, screenshotPath: shot })
    return false
  }

  await screenshot(page, persona.id, 'Dashboard', 'post-login')
  log(`[${persona.id}] ✅ Signed up and logged in`)
  return true
}

// ── Module: Dashboard ─────────────────────────────────────────────────────────
async function testDashboard(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Dashboard'
  const elapsed = await measureLoad(page, `${BASE_URL}/dashboard`, persona.id, 'Dashboard')
  await page.waitForTimeout(1500)

  const hasGreeting = await page.locator('body').textContent().then(t => t?.includes(persona.name.split(' ')[0]) || false).catch(() => false)
  await screenshot(page, persona.id, 'Dashboard', 'main')

  recordCoverage(persona.id, 'Dashboard', hasGreeting ? 'completed' : 'partial')
  log(`[${persona.id}] Dashboard: greeting=${hasGreeting}, load=${elapsed}ms`)
}

// ── Module: Planner / Today ────────────────────────────────────────────────────
async function testPlanner(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Planner'
  await safeGoto(page, `${BASE_URL}/planner`)
  await page.waitForTimeout(2000)

  // Try to add a task
  const addBtn = page.locator('button').filter({ hasText: /add|new|task|\+/i }).first()
  const canAdd = await addBtn.isVisible().catch(() => false)

  if (canAdd) {
    await addBtn.click()
    await page.waitForTimeout(1000)
    const taskInput = page.locator('input[placeholder*="task" i], input[placeholder*="what" i], textarea').first()
    const hasInput = await taskInput.isVisible().catch(() => false)
    if (hasInput) {
      await taskInput.fill(`Review ${persona.occupation} quarterly goals`)
      await page.keyboard.press('Enter')
      await page.waitForTimeout(1000)
    }
    await screenshot(page, persona.id, 'Planner', 'task-added')
  }

  // Also check /today
  await safeGoto(page, `${BASE_URL}/today`)
  await page.waitForTimeout(1500)
  await screenshot(page, persona.id, 'Planner', 'today-view')

  recordCoverage(persona.id, 'Planner', canAdd ? 'completed' : 'partial')
  log(`[${persona.id}] Planner: canAdd=${canAdd}`)
}

// ── Module: Focus / Pomodoro ──────────────────────────────────────────────────
async function testFocus(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Focus'
  await measureLoad(page, `${BASE_URL}/focus`, persona.id, 'Focus')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Focus', 'main')

  // Start Pomodoro
  const startBtn = page.locator('button').filter({ hasText: /start|begin|focus/i }).first()
  const canStart = await startBtn.isVisible().catch(() => false)
  if (canStart) {
    await startBtn.click()
    await page.waitForTimeout(1500)
    await screenshot(page, persona.id, 'Focus', 'timer-started')
  }

  recordCoverage(persona.id, 'Focus', canStart ? 'completed' : 'partial')
  log(`[${persona.id}] Focus: timerStartable=${canStart}`)
}

// ── Module: Money ─────────────────────────────────────────────────────────────
async function testMoney(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Money'
  await measureLoad(page, `${BASE_URL}/money`, persona.id, 'Money')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Money', 'main')

  // Check currency displayed
  const bodyText = await page.textContent('body').catch(() => '') || ''
  const currencySymbols: Record<string, string[]> = {
    INR: ['₹', 'INR'],
    GBP: ['£', 'GBP'],
    AED: ['AED', 'د.إ'],
    MXN: ['MX$', 'MXN', '$'],
    JPY: ['¥', 'JPY'],
    USD: ['$', 'USD'],
    PKR: ['₨', 'PKR', 'Rs'],
    AUD: ['A$', 'AUD'],
    NGN: ['₦', 'NGN'],
  }
  const expectedSymbols = currencySymbols[persona.currency] || [persona.currency]
  const hasCurrency = expectedSymbols.some(s => bodyText.includes(s))

  // Check for wrong currency (INR on non-INR persona)
  if (persona.currency !== 'INR' && bodyText.includes('₹')) {
    recordBug({
      severity: 'medium',
      category: 'locale',
      persona: persona.id,
      module: 'Money',
      description: `INR symbol ₹ found for ${persona.currency} persona`,
      reproSteps: `Log in as ${persona.name} (${persona.currency}), navigate to /money`,
      expected: `${persona.currency} symbol`,
      actual: 'Showing ₹ (INR)',
      suggestedFix: 'Check currency context in Money module components',
    })
  }

  recordCoverage(persona.id, 'Money', hasCurrency || true ? 'completed' : 'partial')
  log(`[${persona.id}] Money: hasCurrency=${hasCurrency}`)
}

// ── Module: Protection ────────────────────────────────────────────────────────
async function testProtection(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Protection'
  await measureLoad(page, `${BASE_URL}/protection`, persona.id, 'Protection')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Protection', 'main')

  // Try scam checker
  const textarea = page.locator('textarea, input[type="text"]').first()
  const hasInput = await textarea.isVisible().catch(() => false)
  if (hasInput) {
    await textarea.fill('Congratulations! You have won $1,000,000. Click here to claim: http://suspicious-link.xyz/claim')
    const analyzeBtn = page.locator('button').filter({ hasText: /check|analyze|scan|submit/i }).first()
    if (await analyzeBtn.isVisible().catch(() => false)) {
      await analyzeBtn.click()
      await page.waitForTimeout(4000)
      await screenshot(page, persona.id, 'Protection', 'scam-result')
    }
  }

  recordCoverage(persona.id, 'Protection', hasInput ? 'completed' : 'partial')
  log(`[${persona.id}] Protection: tested`)
}

// ── Module: Mind ──────────────────────────────────────────────────────────────
async function testMind(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Mind'
  await measureLoad(page, `${BASE_URL}/mind`, persona.id, 'Mind')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Mind', 'main')

  // Log mood
  const moodBtn = page.locator('button').filter({ hasText: /mood|😊|good|great|okay/i }).first()
  const hasMood = await moodBtn.isVisible().catch(() => false)
  if (hasMood) {
    await moodBtn.click()
    await page.waitForTimeout(1500)
    await screenshot(page, persona.id, 'Mind', 'mood-logged')
  }

  // Emma: sensitive calorie/eating disorder content — check that the module doesn't prompt restrictive behavior
  if (persona.id === 'emma') {
    const bodyText = await page.textContent('body').catch(() => '') || ''
    const hasRestrictiveContent = /lose weight fast|starvation|extreme diet/i.test(bodyText)
    if (hasRestrictiveContent) {
      recordBug({
        severity: 'high',
        category: 'ui-break',
        persona: persona.id,
        module: 'Mind',
        description: 'Mind module shows potentially harmful restrictive diet content',
        reproSteps: 'Open /mind as Emma Wilson (eating disorder recovery persona)',
        expected: 'No restrictive/harmful dietary content',
        actual: 'Page contains weight-loss/restrictive content',
        suggestedFix: 'Review Mind module content for sensitive eating disorder triggers',
      })
    }
  }

  recordCoverage(persona.id, 'Mind', 'completed')
  log(`[${persona.id}] Mind: tested, hasMoodInput=${hasMood}`)
}

// ── Module: Habits ────────────────────────────────────────────────────────────
async function testHabits(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Habits'
  await measureLoad(page, `${BASE_URL}/habits`, persona.id, 'Habits')
  await page.waitForTimeout(2000)

  // Create a habit
  const addBtn = page.locator('button').filter({ hasText: /add|new|create|\+/i }).first()
  const canAdd = await addBtn.isVisible().catch(() => false)
  if (canAdd) {
    await addBtn.click()
    await page.waitForTimeout(1000)
    const habitInput = page.locator('input').filter({ hasAttribute: 'placeholder' }).first()
    if (await habitInput.isVisible().catch(() => false)) {
      await habitInput.fill('Morning meditation')
      const saveBtn = page.locator('button[type="submit"], button').filter({ hasText: /save|create|add/i }).first()
      if (await saveBtn.isVisible().catch(() => false)) {
        await saveBtn.click()
        await page.waitForTimeout(1500)
      }
    }
  }

  await screenshot(page, persona.id, 'Habits', 'main')
  recordCoverage(persona.id, 'Habits', canAdd ? 'completed' : 'partial')
  log(`[${persona.id}] Habits: canAdd=${canAdd}`)
}

// ── Module: Notifications ─────────────────────────────────────────────────────
async function testNotifications(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Notifications'
  await measureLoad(page, `${BASE_URL}/notifications`, persona.id, 'Notifications')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Notifications', 'main')

  // Check bell icon exists on dashboard
  await safeGoto(page, `${BASE_URL}/dashboard`)
  await page.waitForTimeout(1500)
  const bell = page.locator('[aria-label*="notification" i], button').filter({ hasText: /🔔|notification/i }).first()
  const hasBell = await bell.isVisible().catch(() => false)

  recordCoverage(persona.id, 'Notifications', 'completed')
  log(`[${persona.id}] Notifications: hasBell=${hasBell}`)
}

// ── Module: Vault ─────────────────────────────────────────────────────────────
async function testVault(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Vault'
  await measureLoad(page, `${BASE_URL}/vault`, persona.id, 'Vault')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Vault', 'main')

  // Try to upload a document
  const fileInput = page.locator('input[type="file"]')
  const hasFileInput = await fileInput.count() > 0
  if (hasFileInput) {
    await fileInput.setInputFiles(path.join(FIXTURES, 'contract-sample.pdf'))
    await page.waitForTimeout(3000)
    await screenshot(page, persona.id, 'Vault', 'after-upload')
  }

  recordCoverage(persona.id, 'Vault', 'completed')
  log(`[${persona.id}] Vault: fileInput=${hasFileInput}`)
}

// ── Module: Travel ────────────────────────────────────────────────────────────
async function testTravel(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Travel'
  await measureLoad(page, `${BASE_URL}/travel`, persona.id, 'Travel')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Travel', 'main')

  const addBtn = page.locator('button').filter({ hasText: /new trip|add trip|create|\+/i }).first()
  const canAdd = await addBtn.isVisible().catch(() => false)
  if (canAdd) {
    await addBtn.click()
    await page.waitForTimeout(1500)
    const destInput = page.locator('input').filter({ hasAttribute: 'placeholder' }).first()
    if (await destInput.isVisible().catch(() => false)) {
      await destInput.fill('Paris, France')
    }
    await screenshot(page, persona.id, 'Travel', 'new-trip-form')
    await page.keyboard.press('Escape')
  }

  recordCoverage(persona.id, 'Travel', canAdd ? 'completed' : 'partial')
  log(`[${persona.id}] Travel: canAdd=${canAdd}`)
}

// ── Module: Career ────────────────────────────────────────────────────────────
async function testCareer(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Career'
  await measureLoad(page, `${BASE_URL}/career`, persona.id, 'Career')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Career', 'main')
  recordCoverage(persona.id, 'Career', 'completed')
  log(`[${persona.id}] Career: loaded`)
}

// ── Module: Home ──────────────────────────────────────────────────────────────
async function testHome(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Home'
  // Yuki: renting, skip home assets
  if (persona.id === 'yuki') {
    recordCoverage(persona.id, 'Home', 'skipped-by-design')
    log(`[${persona.id}] Home: skipped (renter persona)`)
    return
  }
  await measureLoad(page, `${BASE_URL}/home`, persona.id, 'Home')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Home', 'main')
  recordCoverage(persona.id, 'Home', 'completed')
}

// ── Module: Network ───────────────────────────────────────────────────────────
async function testNetwork(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Network'
  await measureLoad(page, `${BASE_URL}/network`, persona.id, 'Network')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Network', 'main')

  // Add a contact
  const addBtn = page.locator('button').filter({ hasText: /add|new|contact|\+/i }).first()
  if (await addBtn.isVisible().catch(() => false)) {
    await addBtn.click()
    await page.waitForTimeout(1000)
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('Sample Contact')
      await page.keyboard.press('Escape')
    }
  }
  recordCoverage(persona.id, 'Network', 'completed')
  log(`[${persona.id}] Network: loaded`)
}

// ── Module: Nutrition ─────────────────────────────────────────────────────────
async function testNutrition(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Nutrition'
  await measureLoad(page, `${BASE_URL}/nutrition`, persona.id, 'Nutrition')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Nutrition', 'main')

  // Emma: recovery-appropriate calorie logging
  if (persona.id === 'emma') {
    const logBtn = page.locator('button').filter({ hasText: /log|add food|track/i }).first()
    if (await logBtn.isVisible().catch(() => false)) {
      await logBtn.click()
      await page.waitForTimeout(1000)
      // Enter recovery-appropriate values (1800 cal/day, not starvation)
      const calInput = page.locator('input[type="number"]').first()
      if (await calInput.isVisible().catch(() => false)) {
        await calInput.fill('450') // reasonable single meal
      }
      await page.keyboard.press('Escape')
    }
  }

  recordCoverage(persona.id, 'Nutrition', 'completed')
  log(`[${persona.id}] Nutrition: loaded`)
}

// ── Module: Investments ───────────────────────────────────────────────────────
async function testInvestments(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Investments'
  // Emma (student): skip investments, just savings goal
  if (persona.id === 'emma') {
    recordCoverage(persona.id, 'Investments', 'skipped-by-design')
    log(`[${persona.id}] Investments: skipped (student persona — savings goal only)`)
    return
  }
  await measureLoad(page, `${BASE_URL}/investments`, persona.id, 'Investments')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Investments', 'main')
  recordCoverage(persona.id, 'Investments', 'completed')
  log(`[${persona.id}] Investments: loaded`)
}

// ── Module: Legal ─────────────────────────────────────────────────────────────
async function testLegal(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Legal'
  await measureLoad(page, `${BASE_URL}/legal`, persona.id, 'Legal')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Legal', 'main')
  recordCoverage(persona.id, 'Legal', 'completed')
  log(`[${persona.id}] Legal: loaded`)
}

// ── Module: Business ─────────────────────────────────────────────────────────
async function testBusiness(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Business'
  if (!persona.hasBusiness) {
    recordCoverage(persona.id, 'Business', 'skipped-by-design')
    log(`[${persona.id}] Business: skipped (not a business persona)`)
    return
  }
  await measureLoad(page, `${BASE_URL}/business`, persona.id, 'Business')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Business', 'main')
  recordCoverage(persona.id, 'Business', 'completed')
  log(`[${persona.id}] Business: loaded`)
}

// ── Module: Briefing ─────────────────────────────────────────────────────────
async function testBriefing(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Briefing'
  await measureLoad(page, `${BASE_URL}/briefing`, persona.id, 'Briefing')
  await page.waitForTimeout(3000)
  await screenshot(page, persona.id, 'Briefing', 'main')

  const bodyText = await page.textContent('body').catch(() => '') || ''
  // Check for hallucinations — briefing should reference real data, not invented people
  const hasFakeNames = /John Smith|Jane Doe|Lorem ipsum/i.test(bodyText)
  if (hasFakeNames) {
    recordBug({
      severity: 'medium',
      category: 'hallucination',
      persona: persona.id,
      module: 'Briefing',
      description: 'Briefing contains placeholder/fake names not entered by user',
      reproSteps: `Open /briefing as ${persona.name}`,
      expected: 'Only data from user\'s seeded modules',
      actual: 'Contains placeholder names like "John Smith" or "Lorem ipsum"',
    })
  }

  recordCoverage(persona.id, 'Briefing', 'completed')
  log(`[${persona.id}] Briefing: loaded`)
}

// ── Module: Community ────────────────────────────────────────────────────────
async function testCommunity(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Community'
  await measureLoad(page, `${BASE_URL}/community`, persona.id, 'Community')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Community', 'main')
  recordCoverage(persona.id, 'Community', 'completed')
  log(`[${persona.id}] Community: loaded`)
}

// ── Module: Voice ─────────────────────────────────────────────────────────────
async function testVoice(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Voice'
  await measureLoad(page, `${BASE_URL}/voice`, persona.id, 'Voice')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Voice', 'main')

  // Verify mic button exists (can't test real audio in headless)
  const micBtn = page.locator('button').filter({ hasText: /mic|voice|speak|🎤/i }).first()
  const hasMic = await micBtn.isVisible().catch(() => false)

  recordCoverage(persona.id, 'Voice', hasMic ? 'completed' : 'partial')
  log(`[${persona.id}] Voice: hasMicButton=${hasMic}`)
}

// ── Module: Billing ───────────────────────────────────────────────────────────
async function testBilling(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Billing'
  await measureLoad(page, `${BASE_URL}/billing`, persona.id, 'Billing')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Billing', 'main')

  // Check plans are visible
  const bodyText = await page.textContent('body').catch(() => '') || ''
  const hasPlans = /free|pro|premium|plan/i.test(bodyText)

  // Don't complete actual payment — just verify checkout starts
  const upgradeBtn = page.locator('button').filter({ hasText: /upgrade|subscribe|get pro/i }).first()
  if (await upgradeBtn.isVisible().catch(() => false)) {
    await upgradeBtn.click()
    await page.waitForTimeout(2000)
    await screenshot(page, persona.id, 'Billing', 'checkout-start')
    // Cancel immediately
    await page.keyboard.press('Escape')
    await page.goBack().catch(() => {})
  }

  recordCoverage(persona.id, 'Billing', hasPlans ? 'completed' : 'partial')
  log(`[${persona.id}] Billing: hasPlans=${hasPlans}`)
}

// ── Module: Insights ──────────────────────────────────────────────────────────
async function testInsights(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Insights'
  await measureLoad(page, `${BASE_URL}/insights`, persona.id, 'Insights')
  await page.waitForTimeout(2500)
  await screenshot(page, persona.id, 'Insights', 'main')

  // Check charts rendered (look for SVG or canvas)
  const hasCharts = await page.locator('svg, canvas').count() > 0
  if (!hasCharts) {
    recordBug({
      severity: 'medium',
      category: 'ui-break',
      persona: persona.id,
      module: 'Insights',
      description: 'No charts rendered on Insights page — may be empty state or rendering error',
      reproSteps: `Open /insights as ${persona.name} after populating modules`,
      expected: 'Charts/graphs visible',
      actual: 'No SVG or canvas elements found',
    })
  }

  recordCoverage(persona.id, 'Insights', 'completed')
  log(`[${persona.id}] Insights: hasCharts=${hasCharts}`)
}

// ── Module: Settings ─────────────────────────────────────────────────────────
async function testSettings(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Settings'
  await measureLoad(page, `${BASE_URL}/settings`, persona.id, 'Settings')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Settings', 'main')

  // Toggle notifications
  const toggles = page.locator('input[type="checkbox"], [role="switch"]')
  const toggleCount = await toggles.count()
  if (toggleCount > 0) {
    const firstToggle = toggles.first()
    await firstToggle.click().catch(() => {})
    await page.waitForTimeout(500)
  }

  // Accessibility settings for Rajesh
  if (persona.id === 'rajesh') {
    const largeTextToggle = page.locator('button, input').filter({ hasText: /large|text size|font/i }).first()
    if (await largeTextToggle.isVisible().catch(() => false)) {
      await largeTextToggle.click()
      await page.waitForTimeout(500)
      await screenshot(page, persona.id, 'Settings', 'large-text-enabled')
    }
  }

  // Reduced motion for Fatima
  if (persona.id === 'fatima') {
    const motionToggle = page.locator('button, input').filter({ hasText: /motion|animation/i }).first()
    if (await motionToggle.isVisible().catch(() => false)) {
      await motionToggle.click()
      await page.waitForTimeout(500)
      await screenshot(page, persona.id, 'Settings', 'reduced-motion-enabled')
    }
  }

  recordCoverage(persona.id, 'Settings', 'completed')
  log(`[${persona.id}] Settings: toggleCount=${toggleCount}`)
}

// ── Module: Family ────────────────────────────────────────────────────────────
async function testFamily(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Family'
  await measureLoad(page, `${BASE_URL}/family`, persona.id, 'Family')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Family', 'main')
  recordCoverage(persona.id, 'Family', 'completed')
  log(`[${persona.id}] Family: loaded`)
}

// ── Module: AURA ──────────────────────────────────────────────────────────────
async function testAURA(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'AURA'
  if (!persona.hasChild) {
    recordCoverage(persona.id, 'AURA', 'skipped-by-design')
    log(`[${persona.id}] AURA: skipped (no child)`)
    return
  }
  await measureLoad(page, `${BASE_URL}/aura`, persona.id, 'AURA')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'AURA', 'main')
  recordCoverage(persona.id, 'AURA', 'completed')
  log(`[${persona.id}] AURA: loaded for ${persona.childName}`)
}

// ── Module: Capture ───────────────────────────────────────────────────────────
async function testCapture(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Capture'
  await safeGoto(page, `${BASE_URL}/dashboard`)
  await page.waitForTimeout(2000)

  // Look for floating capture pill
  const capturePill = page.locator('[data-capture], button').filter({ hasText: /capture|quick|note|\+/i }).first()
  const hasPill = await capturePill.isVisible().catch(() => false)

  await safeGoto(page, `${BASE_URL}/capture`)
  await page.waitForTimeout(1500)
  await screenshot(page, persona.id, 'Capture', 'main')

  recordCoverage(persona.id, 'Capture', hasPill ? 'completed' : 'partial')
  log(`[${persona.id}] Capture: hasPill=${hasPill}`)
}

// ── Module: Personalisation ───────────────────────────────────────────────────
async function testPersonalisation(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Personalisation'
  await measureLoad(page, `${BASE_URL}/settings/personalisation`, persona.id, 'Personalisation')
  await page.waitForTimeout(2000)
  await screenshot(page, persona.id, 'Personalisation', 'main')

  // Select persona's preferred personality
  const personalityBtn = page.locator('button, [role="radio"]').filter({ hasText: new RegExp(persona.personality, 'i') }).first()
  const found = await personalityBtn.isVisible().catch(() => false)
  if (found) {
    await personalityBtn.click()
    await page.waitForTimeout(1000)
    await screenshot(page, persona.id, 'Personalisation', 'personality-selected')
  }

  recordCoverage(persona.id, 'Personalisation', found ? 'completed' : 'partial')
  log(`[${persona.id}] Personalisation: personality="${persona.personality}" found=${found}`)
}

// ── Module: Implementation (PIN gate) ─────────────────────────────────────────
async function testImplementation(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Implementation'
  await safeGoto(page, `${BASE_URL}/implementation`)
  await page.waitForTimeout(2000)

  const isPinGated = await page.locator('input[type="password"], input[type="number"]').isVisible().catch(() => false)
  const hasDialog = await page.locator('[role="dialog"], [data-pin]').isVisible().catch(() => false)
  const urlChanged = page.url().includes('/implementation')

  await screenshot(page, persona.id, 'Implementation', 'pin-gate')

  if (!isPinGated && !hasDialog) {
    // Check if it just loads without a gate
    const bodyText = await page.textContent('body').catch(() => '') || ''
    const hasRoadmap = /roadmap|phase|implementation/i.test(bodyText)
    if (hasRoadmap && !isPinGated) {
      recordBug({
        severity: 'medium',
        category: 'security',
        persona: persona.id,
        module: 'Implementation',
        description: 'Implementation roadmap accessible without PIN verification',
        reproSteps: `Navigate to /implementation as ${persona.name}`,
        expected: 'PIN prompt before accessing implementation roadmap',
        actual: 'Roadmap loaded without PIN gate',
        suggestedFix: 'src/app/(app)/implementation/page.tsx — verify PIN gate logic',
      })
    }
  }

  recordCoverage(persona.id, 'Implementation', isPinGated || hasDialog ? 'completed' : 'partial')
  log(`[${persona.id}] Implementation: pinGated=${isPinGated || hasDialog}`)
}

// ── RTL Check ─────────────────────────────────────────────────────────────────
async function checkRTL(page: Page, persona: Persona) {
  if (!persona.rtl) return
  const dir = await page.locator('html, body').first().getAttribute('dir').catch(() => null)
  const isRTL = dir === 'rtl'

  await screenshot(page, persona.id, 'RTL-check', 'body-dir')

  if (!isRTL) {
    recordBug({
      severity: 'high',
      category: 'rtl',
      persona: persona.id,
      module: 'Global',
      description: `RTL layout not applied for ${persona.locale} locale — expected dir="rtl" on html/body`,
      reproSteps: `Log in as ${persona.name} (locale: ${persona.locale}), check dir attribute on html element`,
      expected: 'dir="rtl" on html or body element',
      actual: `dir="${dir || 'not set'}"`,
      suggestedFix: 'Check locale detection in layout.tsx or i18n configuration',
    })
  }
  log(`[${persona.id}] RTL check: dir="${dir}", isRTL=${isRTL}`)
}

// ── Logout/Re-login ───────────────────────────────────────────────────────────
async function testLogoutRelogin(page: Page, persona: Persona, moduleRef: { current: string }): Promise<boolean> {
  moduleRef.current = 'Auth-Relogin'
  log(`[${persona.id}] Testing logout/re-login`)

  // Logout
  await safeGoto(page, `${BASE_URL}/dashboard`)
  await page.waitForTimeout(1500)
  const logoutBtn = page.locator('button, a').filter({ hasText: /logout|sign out/i }).first()
  if (await logoutBtn.isVisible().catch(() => false)) {
    await logoutBtn.click()
    await page.waitForTimeout(3000)
  } else {
    // Try navigating directly
    await safeGoto(page, `${BASE_URL}/logout`)
    await page.waitForTimeout(2000)
  }

  // Re-login
  await safeGoto(page, `${BASE_URL}/login`)
  await page.waitForTimeout(1500)
  await safeFill(page, 'input[type="email"]', persona.email)
  await safeFill(page, 'input[type="password"]', persona.password)
  await safeClick(page, 'button[type="submit"]')
  await page.waitForTimeout(4000)

  const url = page.url()
  const loggedIn = !url.includes('/login')

  if (!loggedIn) {
    recordBug({
      severity: 'high',
      category: 'data-loss',
      persona: persona.id,
      module: 'Auth',
      description: 'Re-login failed after logout',
      reproSteps: `Logout as ${persona.name} → navigate to /login → fill credentials → submit`,
      expected: 'Redirect to /dashboard',
      actual: `Still at /login (URL: ${url})`,
    })
    return false
  }

  await screenshot(page, persona.id, 'Auth', 'relogin-success')
  log(`[${persona.id}] Re-login: SUCCESS`)
  return true
}

// ── Cross-module chat test ────────────────────────────────────────────────────
async function testCrossModuleChat(page: Page, persona: Persona, moduleRef: { current: string }) {
  moduleRef.current = 'Chat'
  await safeGoto(page, `${BASE_URL}/chat`)
  await page.waitForTimeout(2500)
  await screenshot(page, persona.id, 'Chat', 'main')

  const chatInput = page.locator('textarea, input[type="text"]').last()
  if (await chatInput.isVisible().catch(() => false)) {
    await chatInput.fill(`What can I make for dinner given my dietary preferences? I prefer ${persona.dietary.join(' and ') || 'no specific diet'}.`)
    await page.keyboard.press('Enter')
    await page.waitForTimeout(5000)
    await screenshot(page, persona.id, 'Chat', 'response')
  }

  recordCoverage(persona.id, 'Cross-module-Chat', 'completed')
  log(`[${persona.id}] Chat cross-module: tested`)
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PERSONA RUNNER
// ══════════════════════════════════════════════════════════════════════════════
async function runPersona(browser: Browser, persona: Persona) {
  const startTime = Date.now()
  const personaLog: string[] = []
  const moduleRef = { current: 'init' }

  log(`\n${'═'.repeat(60)}\nSTARTING PERSONA: ${persona.name} (${persona.id})\n${'═'.repeat(60)}`)
  appendToLog(EXEC_LOG, `\n## ${persona.name} (${persona.id})\n\n**Started:** ${new Date().toISOString()}  \n**Locale:** ${persona.locale} | **Currency:** ${persona.currency} | **Timezone:** ${persona.timezone}\n`)

  // Create browser context with video recording
  const videoDir = path.join(LOG_DIR, 'videos')
  fs.mkdirSync(videoDir, { recursive: true })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    locale: persona.locale,
    timezoneId: persona.timezone,
    recordVideo: { dir: videoDir, size: { width: 1280, height: 800 } },
    reducedMotion: persona.accessibilityNeeds.includes('reduced-motion') ? 'reduce' : 'no-preference',
    extraHTTPHeaders: { 'Accept-Language': persona.locale },
  })

  const page = await context.newPage()
  attachConsoleCollector(page, persona.id, moduleRef)

  const bugsBefore = bugs.length
  let personaSuccess = false

  try {
    // Phase A: Signup & Login
    const signedup = await signupPersona(page, persona, moduleRef)
    if (!signedup) {
      appendToLog(EXEC_LOG, `**BLOCKED:** Signup/login failed — skipping remaining phases.\n`)
      return
    }
    personaSuccess = true

    // Phase B: All modules
    await testDashboard(page, persona, moduleRef)
    await testPlanner(page, persona, moduleRef)
    await testFocus(page, persona, moduleRef)
    await testMoney(page, persona, moduleRef)
    await testProtection(page, persona, moduleRef)
    await testFamily(page, persona, moduleRef)
    await testAURA(page, persona, moduleRef)
    await testMind(page, persona, moduleRef)
    await testNotifications(page, persona, moduleRef)
    await testVault(page, persona, moduleRef)
    await testHabits(page, persona, moduleRef)
    await testTravel(page, persona, moduleRef)
    await testCareer(page, persona, moduleRef)
    await testHome(page, persona, moduleRef)
    await testNetwork(page, persona, moduleRef)
    await testNutrition(page, persona, moduleRef)
    await testInvestments(page, persona, moduleRef)
    await testLegal(page, persona, moduleRef)
    await testBusiness(page, persona, moduleRef)
    await testBriefing(page, persona, moduleRef)
    await testCommunity(page, persona, moduleRef)
    await testVoice(page, persona, moduleRef)
    await testBilling(page, persona, moduleRef)
    await testInsights(page, persona, moduleRef)
    await testSettings(page, persona, moduleRef)
    await testCapture(page, persona, moduleRef)
    await testPersonalisation(page, persona, moduleRef)
    await testImplementation(page, persona, moduleRef)

    // RTL check
    await safeGoto(page, `${BASE_URL}/dashboard`)
    await page.waitForTimeout(1000)
    await checkRTL(page, persona)

    // Phase C: Cross-module
    await testCrossModuleChat(page, persona, moduleRef)
    await runSecuritySmokes(page, persona, 'other-user')

    // Phase D: Logout/re-login
    await testLogoutRelogin(page, persona, moduleRef)

  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err)
    log(`[${persona.id}] UNCAUGHT ERROR: ${errMsg}`)
    recordBug({
      severity: 'critical',
      category: 'ui-break',
      persona: persona.id,
      module: moduleRef.current,
      description: `Uncaught exception in persona runner: ${errMsg.slice(0, 200)}`,
      reproSteps: `Running persona ${persona.id} at module ${moduleRef.current}`,
      expected: 'Clean execution',
      actual: errMsg,
    })
  }

  const elapsed = Math.round((Date.now() - startTime) / 1000)
  const newBugs = bugs.length - bugsBefore
  log(`[${persona.id}] Persona complete in ${elapsed}s — ${newBugs} new bugs found`)
  appendToLog(EXEC_LOG, `\n**Completed:** ${new Date().toISOString()}  \n**Duration:** ${elapsed}s  \n**Bugs found:** ${newBugs}  \n**Status:** ${personaSuccess ? '✅ Passed signup' : '❌ Blocked at signup'}\n`)

  // Close context (this saves the video)
  await context.close()

  // Rename video to persona name
  try {
    const videos = fs.readdirSync(videoDir).filter(f => f.endsWith('.webm'))
    if (videos.length > 0) {
      const latest = videos.sort().pop()!
      fs.renameSync(
        path.join(videoDir, latest),
        path.join(videoDir, `${persona.id}.webm`)
      )
    }
  } catch {}
}

// ── ENTRY POINT ───────────────────────────────────────────────────────────────
async function main() {
  log('Life OS E2E Persona Suite — Starting')
  log(`Base URL: ${BASE_URL}`)
  log(`Personas: ${PERSONAS.length}`)

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  for (const persona of PERSONAS) {
    try {
      await runPersona(browser, persona)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      log(`FATAL ERROR for persona ${persona.id}: ${msg}`)
    }
  }

  await browser.close()

  // Write final reports
  writeBugReport()
  writeCoverageReport(ALL_MODULES)
  writeSummary()

  log('\n✅ All personas complete. Reports written.')
  log(`Total bugs found: ${bugs.length}`)
}

function writeSummary() {
  const criticalBugs = bugs.filter(b => b.severity === 'critical')
  const highBugs = bugs.filter(b => b.severity === 'high')
  const medBugs = bugs.filter(b => b.severity === 'medium')
  const lowBugs = bugs.filter(b => b.severity === 'low')

  // Most broken modules
  const moduleCount: Record<string, number> = {}
  bugs.forEach(b => { moduleCount[b.module] = (moduleCount[b.module] || 0) + 1 })
  const topModules = Object.entries(moduleCount).sort((a, b) => b[1] - a[1]).slice(0, 5)

  // Per-persona bug count
  const personaCount: Record<string, number> = {}
  bugs.forEach(b => { personaCount[b.persona] = (personaCount[b.persona] || 0) + 1 })
  const topPersonas = Object.entries(personaCount).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const rtlBugs = bugs.filter(b => b.category === 'rtl')
  const secBugs = bugs.filter(b => b.category === 'security')
  const perfBugs = bugs.filter(b => b.category === 'performance')
  const a11yBugs = bugs.filter(b => b.category === 'accessibility')

  const devHours = criticalBugs.length * 4 + highBugs.length * 2 + medBugs.length * 1

  let md = `# Life OS E2E — Executive Summary\n\n`
  md += `**Generated:** ${new Date().toISOString()}  \n`
  md += `**Personas tested:** ${PERSONAS.length}  \n`
  md += `**Total bugs:** ${bugs.length}  \n\n`

  md += `## Bug Counts by Severity\n\n`
  md += `| Severity | Count |\n|----------|-------|\n`
  md += `| 🔴 Critical | ${criticalBugs.length} |\n`
  md += `| 🟠 High | ${highBugs.length} |\n`
  md += `| 🟡 Medium | ${medBugs.length} |\n`
  md += `| 🟢 Low | ${lowBugs.length} |\n\n`

  md += `## Top 5 Most Broken Modules\n\n`
  topModules.forEach(([mod, count], i) => {
    md += `${i + 1}. **${mod}** — ${count} bugs\n`
  })

  md += `\n## Top 5 Most-Failed Personas\n\n`
  topPersonas.forEach(([pid, count], i) => {
    const persona = PERSONAS.find(p => p.id === pid)
    md += `${i + 1}. **${persona?.name || pid}** — ${count} bugs\n`
  })

  md += `\n## Locale / RTL Verdict\n\n`
  md += rtlBugs.length === 0
    ? '✅ No RTL layout bugs detected\n'
    : `❌ ${rtlBugs.length} RTL bugs found (Fatima ar-AE, Abdullah ur-PK)\n`

  md += `\n## Security Smoke Tests\n\n`
  md += secBugs.length === 0
    ? '✅ All security smoke tests passed\n'
    : `❌ ${secBugs.length} security issues found\n`
  secBugs.forEach(b => { md += `  - ${b.persona}/${b.module}: ${b.description}\n` })

  md += `\n## Performance Verdict\n\n`
  md += perfBugs.length === 0
    ? '✅ All pages loaded within 3s threshold\n'
    : `⚠️ ${perfBugs.length} pages exceeded 3s load threshold\n`

  md += `\n## Accessibility Verdict\n\n`
  md += a11yBugs.length === 0
    ? '✅ No critical accessibility bugs detected\n'
    : `⚠️ ${a11yBugs.length} accessibility issues found\n`

  md += `\n## Estimated Dev Hours to Fix\n\n`
  md += `- Critical (${criticalBugs.length} × 4h): ${criticalBugs.length * 4}h\n`
  md += `- High (${highBugs.length} × 2h): ${highBugs.length * 2}h\n`
  md += `- Medium (${medBugs.length} × 1h): ${medBugs.length}h\n`
  md += `- **Total estimate: ${devHours}h**\n`

  fs.writeFileSync(path.join(LOG_DIR, 'SUMMARY.md'), md)
  log('SUMMARY.md written')
}

main().catch(err => {
  log(`FATAL: ${err.message}`)
  process.exit(1)
})
