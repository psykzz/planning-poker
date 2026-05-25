import { test, expect } from '@playwright/test';

// Fixed session ID so repeated runs reuse the same Supabase rows and keep the
// project active without accumulating unlimited throwaway data.
const SESSION_ID = 'e2e-keep-alive';

test('full voting session flow: join → vote → open results → back to voting', async ({ page }) => {
  // Auto-accept any native confirm() dialogs (e.g. the reset-scores prompt).
  page.on('dialog', dialog => dialog.accept());

  // ── Step 1: Navigate to a voting session ──────────────────────────────────
  await page.goto(`/voting#${SESSION_ID}`);

  // ── Step 2: Join the session with a display name ──────────────────────────
  const nameInput = page.locator('#player-name');
  await nameInput.waitFor({ state: 'visible' });
  await nameInput.fill('E2E Bot');
  await page.getByRole('button', { name: 'Join session' }).click();

  // ── Step 3: Confirm the voting screen is displayed ────────────────────────
  // Heading is "Voting Stage" or "<name> - Voting" depending on session name
  await expect(page.getByRole('heading', { level: 1, name: /Voting/i })).toBeVisible({ timeout: 10000 });

  // ── Step 4: Become a moderator via the sidebar ────────────────────────────
  await page.getByRole('button', { name: 'Open session menu' }).click();
  await page.getByRole('button', { name: 'Options' }).click();

  // The moderator toggle label reads "Not a moderator" or "You are a moderator"
  const moderatorToggle = page
    .locator('label')
    .filter({ hasText: /not a moderator|you are a moderator/i })
    .locator('input[type="checkbox"]');
  if (!(await moderatorToggle.isChecked())) {
    await moderatorToggle.check();
  }

  await page.getByRole('button', { name: 'Close sidebar' }).click();

  // ── Step 5: Cast a vote ───────────────────────────────────────────────────
  const scoreGroup = page.getByRole('group', { name: 'Score cards' });
  await scoreGroup.waitFor({ state: 'visible', timeout: 10000 });
  // Click the "3" card (present in fibonacci, standard, and scrum sequences)
  await scoreGroup.getByRole('button', { name: '3' }).first().click();

  // ── Step 6: Open results (moderator action) ───────────────────────────────
  await page.getByRole('button', { name: 'Open results' }).click();

  // Results page loads (router.replace navigates to /results#...)
  await expect(page).toHaveURL(new RegExp(`/results#${SESSION_ID}`));
  await expect(page.getByRole('heading', { level: 1, name: /Results/i })).toBeVisible({ timeout: 10000 });

  // ── Step 7: Reset back to voting ─────────────────────────────────────────
  await page.getByRole('button', { name: 'Back to voting' }).click();

  await expect(page).toHaveURL(new RegExp(`/voting#${SESSION_ID}`));
  await expect(page.getByRole('heading', { level: 1, name: /Voting/i })).toBeVisible({ timeout: 10000 });
});
