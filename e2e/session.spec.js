import { test, expect } from '@playwright/test';
import { nanoid } from 'nanoid';

// The sidebar menu button and close button are only shown on mobile viewports
// (display: none on desktop via CSS media query max-width: 768px).
test.use({ viewport: { width: 390, height: 844 } });

const SESSION_ID = 'e2e-keep-alive';

const log = (...args) => {
  console.log('[e2e:session]', ...args);
};

async function logLocatorState(locator, name) {
  const count = await locator.count();
  const visible = count > 0 ? await locator.first().isVisible() : false;
  const enabled = count > 0 ? await locator.first().isEnabled() : false;
  log(`${name} state`, { count, visible, enabled });
}

test('full voting session flow: join → vote → open results → back to voting', async ({ page }) => {
  // Auto-accept any native confirm() dialogs (e.g. the reset-scores prompt).
  page.on('dialog', dialog => dialog.accept());
  page.on('console', msg => log(`[browser:${msg.type()}] ${msg.text()}`));
  page.on('pageerror', error => log('[pageerror]', error.message));
  page.on('requestfailed', request =>
    log('[requestfailed]', request.method(), request.url(), request.failure()?.errorText ?? 'unknown'),
  );
  log('Starting session flow', { sessionId: SESSION_ID });

  // ── Step 1: Navigate to a voting session ──────────────────────────────────
  await page.goto(`/voting#${SESSION_ID}`);
  log('Navigated', { url: page.url() });

  // ── Step 2: Join the session with a display name ──────────────────────────
  const nameInput = page.locator('#player-name');
  const playerName = `e2e-${nanoid(8)}`;
  await logLocatorState(nameInput, 'name input before wait');
  await nameInput.waitFor({ state: 'visible' });
  await nameInput.fill(playerName);
  log('Filled player name', { playerName });
  await page.getByRole('button', { name: 'Join session' }).click();
  log('Clicked join session');

  // ── Step 3: Confirm the voting screen is displayed ────────────────────────
  // Heading is "Voting Stage" or "<name> - Voting" depending on session name
  await expect(page.getByRole('heading', { level: 1, name: /Voting/i })).toBeVisible({ timeout: 10000 });
  log('Voting heading visible', { url: page.url() });

  // ── Step 4: Become a moderator via the sidebar ────────────────────────────
  const openSessionMenuButton = page.getByRole('button', {
    name: 'Open session menu',
  });
  await logLocatorState(openSessionMenuButton, 'open session menu button');
  if (await openSessionMenuButton.isVisible()) {
    log('Open session menu button is visible, clicking it');
    await openSessionMenuButton.click();
  } else {
    log('Open session menu button not visible, continuing without sidebar open');
  }
  await logLocatorState(page.getByRole('button', { name: 'Options' }), 'options button');
  await page.getByRole('button', { name: 'Options' }).click();
  log('Clicked options');

  // The moderator toggle label reads "Not a moderator" or "You are a moderator"
  const moderatorToggle = page
    .locator('label')
    .filter({ hasText: /not a moderator|you are a moderator/i })
    .locator('input[type="checkbox"]');
  await logLocatorState(moderatorToggle, 'moderator toggle');
  await expect(moderatorToggle).toBeVisible({ timeout: 10000 });
  if (!(await moderatorToggle.isChecked())) {
    log('Moderator toggle is unchecked, clicking');
    await moderatorToggle.click();
  } else {
    log('Moderator toggle already checked');
  }
  await expect(moderatorToggle).toBeChecked({ timeout: 10000 });
  log('Moderator toggle confirmed checked');

  const closeSidebarButton = page.getByRole('button', {
    name: 'Close sidebar',
  });
  await logLocatorState(closeSidebarButton, 'close sidebar button');
  if (await closeSidebarButton.isVisible()) {
    await closeSidebarButton.click();
    log('Closed sidebar');
  }

  // ── Step 5: Cast a vote ───────────────────────────────────────────────────
  await expect(page.getByRole('button', { name: 'Open results' })).toBeEnabled({
    timeout: 10000,
  });
  log('Open results button is enabled');

  const scoreGroup = page.getByRole('group', { name: 'Score cards' });
  await scoreGroup.waitFor({ state: 'visible', timeout: 10000 });
  log('Score cards group visible');
  // Click the "3" card (present in fibonacci, standard, and scrum sequences)
  await scoreGroup.getByRole('button', { name: '3' }).first().click();
  log('Clicked score card 3');

  // ── Step 6: Open results (moderator action) ───────────────────────────────
  const openResultsButton = page.getByRole('button', { name: 'Open results' });
  await logLocatorState(openResultsButton, 'open results button');
  await openResultsButton.click();
  log('Clicked open results');

  // Results page loads (router.replace navigates to /results#...)
  await expect
    .poll(() => new URL(page.url()).pathname)
    .toMatch(/^\/results\/?$/);
  await expect
    .poll(() => new URL(page.url()).hash)
    .toBe(`#${SESSION_ID}`);
  await expect(page.getByRole('heading', { level: 1, name: /Results/i })).toBeVisible({ timeout: 10000 });
  log('Results page visible', { url: page.url() });

  // ── Step 7: Reset back to voting ─────────────────────────────────────────
  await page.getByRole('button', { name: 'Back to voting' }).click();
  log('Clicked back to voting');

  await expect
    .poll(() => new URL(page.url()).pathname)
    .toMatch(/^\/voting\/?$/);
  await expect
    .poll(() => new URL(page.url()).hash)
    .toBe(`#${SESSION_ID}`);
  await expect(page.getByRole('heading', { level: 1, name: /Voting/i })).toBeVisible({ timeout: 10000 });
  log('Returned to voting page', { url: page.url() });
});
