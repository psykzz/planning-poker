# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: session.spec.js >> full voting session flow: join → vote → open results → back to voting
- Location: e2e/session.spec.js:11:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/voting#e2e-keep-alive
Call log:
  - navigating to "http://localhost:3000/voting#e2e-keep-alive", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // The sidebar menu button and close button are only shown on mobile viewports
  4  | // (display: none on desktop via CSS media query max-width: 768px).
  5  | test.use({ viewport: { width: 390, height: 844 } });
  6  | 
  7  | // Fixed session ID so repeated runs reuse the same Supabase rows and keep the
  8  | // project active without accumulating unlimited throwaway data.
  9  | const SESSION_ID = 'e2e-keep-alive';
  10 | 
  11 | test('full voting session flow: join → vote → open results → back to voting', async ({ page }) => {
  12 |   // Auto-accept any native confirm() dialogs (e.g. the reset-scores prompt).
  13 |   page.on('dialog', dialog => dialog.accept());
  14 | 
  15 |   // ── Step 1: Navigate to a voting session ──────────────────────────────────
> 16 |   await page.goto(`/voting#${SESSION_ID}`);
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/voting#e2e-keep-alive
  17 | 
  18 |   // ── Step 2: Join the session with a display name ──────────────────────────
  19 |   const nameInput = page.locator('#player-name');
  20 |   await nameInput.waitFor({ state: 'visible' });
  21 |   await nameInput.fill('E2E Bot');
  22 |   await page.getByRole('button', { name: 'Join session' }).click();
  23 | 
  24 |   // ── Step 3: Confirm the voting screen is displayed ────────────────────────
  25 |   // Heading is "Voting Stage" or "<name> - Voting" depending on session name
  26 |   await expect(page.getByRole('heading', { level: 1, name: /Voting/i })).toBeVisible({ timeout: 10000 });
  27 | 
  28 |   // ── Step 4: Become a moderator via the sidebar ────────────────────────────
  29 |   await page.getByRole('button', { name: 'Open session menu' }).click();
  30 |   await page.getByRole('button', { name: 'Options' }).click();
  31 | 
  32 |   // The moderator toggle label reads "Not a moderator" or "You are a moderator"
  33 |   const moderatorToggle = page
  34 |     .locator('label')
  35 |     .filter({ hasText: /not a moderator|you are a moderator/i })
  36 |     .locator('input[type="checkbox"]');
  37 |   if (!(await moderatorToggle.isChecked())) {
  38 |     await moderatorToggle.check();
  39 |   }
  40 | 
  41 |   await page.getByRole('button', { name: 'Close sidebar' }).click();
  42 | 
  43 |   // ── Step 5: Cast a vote ───────────────────────────────────────────────────
  44 |   const scoreGroup = page.getByRole('group', { name: 'Score cards' });
  45 |   await scoreGroup.waitFor({ state: 'visible', timeout: 10000 });
  46 |   // Click the "3" card (present in fibonacci, standard, and scrum sequences)
  47 |   await scoreGroup.getByRole('button', { name: '3' }).first().click();
  48 | 
  49 |   // ── Step 6: Open results (moderator action) ───────────────────────────────
  50 |   await page.getByRole('button', { name: 'Open results' }).click();
  51 | 
  52 |   // Results page loads (router.replace navigates to /results#...)
  53 |   await expect(page).toHaveURL(new RegExp(`/results#${SESSION_ID}`));
  54 |   await expect(page.getByRole('heading', { level: 1, name: /Results/i })).toBeVisible({ timeout: 10000 });
  55 | 
  56 |   // ── Step 7: Reset back to voting ─────────────────────────────────────────
  57 |   await page.getByRole('button', { name: 'Back to voting' }).click();
  58 | 
  59 |   await expect(page).toHaveURL(new RegExp(`/voting#${SESSION_ID}`));
  60 |   await expect(page.getByRole('heading', { level: 1, name: /Voting/i })).toBeVisible({ timeout: 10000 });
  61 | });
  62 | 
```