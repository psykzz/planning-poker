import { test, expect } from '@playwright/test';

test('landing page loads with key content', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('Planning Poker');
  await expect(page.getByRole('heading', { name: 'Planning Poker for agile teams' })).toBeVisible();
  await expect(page.getByLabel('Session ID')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
});

test('landing page shows how-it-works steps', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('Create a session')).toBeVisible();
  await expect(page.getByText('Everyone joins')).toBeVisible();
  await expect(page.getByText('Vote and reveal')).toBeVisible();
});
