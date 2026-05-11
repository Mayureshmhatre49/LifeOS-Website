# Life OS E2E Coverage Report

**Generated:** 2026-05-09  
**Personas tested:** 1 fully executed / 10 attempted  
**Modules covered (Fatima):** 22/28 reached · 14/28 fully completed · 8/28 partial · 2 skipped by design  

> **Coverage blocker:** Signup rate limit (3/hour/IP) prevented 7/10 personas from being created.
> Priya and James signed up successfully but could not log in (email verification failure).
> Only Fatima (persona 3) reached a logged-in state and exercised all modules.

---

## Module × Persona Coverage Matrix

| Module | priya | james | fatima | carlos | yuki | sarah | abdullah | emma | rajesh | nina | **Module %** |
|--------|-------|-------|--------|--------|------|-------|----------|------|--------|------|-------------|
| Dashboard | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0% full |
| Planner | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0% full |
| Focus | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0% full |
| Money | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 10% |
| Protection | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 10% |
| Family | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 10% |
| AURA | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 10% |
| Mind | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0% full |
| Notifications | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 10% |
| Vault | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0% full |
| Habits | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0% full |
| Travel | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0% full |
| Career | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 10% |
| Home | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 10% |
| Network | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 10% |
| Nutrition | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 10% |
| Investments | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 10% |
| Legal | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 10% |
| Business | ❌ | ❌ | ➖ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0% |
| Briefing | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 10% |
| Community | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 10% |
| Voice | ❌ | ❌ | ⚠️🐛 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0% full |
| Billing | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 10% |
| Insights | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 10% |
| Settings | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0% full |
| Capture | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0% full |
| Personalisation | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0% full |
| Implementation | ❌ | ❌ | ⚠️🔒 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | 0% full |

**Legend:** ✅ Completed · ⚠️ Partial · ❌ Blocked/not reached · ➖ Skipped by design · 🐛 Bug found · 🔒 Security concern

---

## Per-Persona Coverage Summary

| Persona | Modules reached | % Complete | Status |
|---------|----------------|-----------|--------|
| Priya Sharma | 0 | 0% | ❌ Blocked — email verify failed → login failed |
| James Mitchell | 0 | 0% | ❌ Blocked — email verify failed → login failed |
| **Fatima Al-Rashid** | **28/28** | **57%** | ⚠️ Partial — email gate active, buttons undetectable |
| Carlos Rodriguez | 0 | 0% | ❌ Blocked — HTTP 429 at signup |
| Yuki Tanaka | 0 | 0% | ❌ Blocked — HTTP 429 at signup |
| Sarah Johnson | 0 | 0% | ❌ Blocked — HTTP 429 at signup |
| Abdullah Khan | 0 | 0% | ❌ Blocked — HTTP 429 at signup |
| Emma Wilson | 0 | 0% | ❌ Blocked — HTTP 429 at signup |
| Rajesh Patel | 0 | 0% | ❌ Blocked — HTTP 429 at signup |
| Nina Okonkwo | 0 | 0% | ❌ Blocked — HTTP 429 at signup |

---

## Coverage by Module Category

### ✅ Fully Exercised (by Fatima)
Money, Protection, Family, AURA, Notifications, Career, Home, Network, Nutrition, Investments, Legal, Briefing, Community, Billing, Insights — **15 modules**

### ⚠️ Partially Exercised (page loaded but primary interactions failed)
Dashboard (no greeting), Planner (no add button), Focus (no timer start), Mind (no mood button), Vault (no file input), Habits (no add button), Travel (no new trip button), Voice (ClientFetchError), Settings (no toggles), Capture (no pill), Personalisation (no personality buttons), Implementation (no PIN gate) — **12 modules**

### ➖ Skipped by Design
Business (Fatima is not a business persona) — **1 module**

---

## What Remains Untested

### Cross-Locale (untested for 9/10 personas)
- INR symbol bleed on GBP/AED/MXN/JPY/USD/PKR/AUD/NGN pages
- Date format differences (DD/MM vs MM/DD)
- Number formatting (1,000 vs 1.000 vs ١٬٠٠٠)
- Gujarati (gu-IN) script rendering for Rajesh

### Cross-Module Interactions (not triggered)
- Budget overspend → Money warning + notification fire
- Task complete → habit streak update
- Meal plan → grocery list auto-generation
- Chat referencing nutrition + pantry data

### User-Specific Scenarios (untested)
- Emma: eating disorder recovery sensitivity in Nutrition/Mind
- Rajesh: large-text + high-contrast accessibility mode
- Abdullah: Ramadan-aware notification scheduling
- Carlos: multi-client Business + GST calculator
- Sarah: adoption-planning workflow in AURA
- Nina: freelance invoice + AURA child module combo

### Security (partially tested)
- Cross-persona document access in Vault (only 1 persona active)
- API user_id spoofing (`?user_id=other-id`)
- Memory injection persistence check

---

## Path to Full Coverage

To reach 80%+ persona × module coverage:

1. **Pre-seed 10 accounts** via Supabase admin API before the test run (bypasses signup rate limit)
2. **Fix email verification** in test harness (use `generateLink` API)
3. **Add `data-testid` attributes** to 12 components identified above
4. **Add hidden `<input type="file">`** to Vault uploader
5. **Fix ERR_SSL_PROTOCOL_ERROR** so re-login works cleanly

Estimated effort: 2 days of test infrastructure work → enables full 10-persona × 28-module matrix.
