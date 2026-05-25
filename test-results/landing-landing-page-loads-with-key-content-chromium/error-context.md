# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: landing.spec.js >> landing page loads with key content
- Location: e2e/landing.spec.js:3:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('landing page loads with key content', async ({ page }) => {
> 4  |   await page.goto('/');
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  5  | 
  6  |   await expect(page).toHaveTitle('Planning Poker');
  7  |   await expect(page.getByRole('heading', { name: 'Planning Poker for agile teams' })).toBeVisible();
  8  |   await expect(page.getByLabel('Session ID')).toBeVisible();
  9  |   await expect(page.getByRole('button', { name: 'Start' })).toBeVisible();
  10 | });
  11 | 
  12 | test('landing page shows how-it-works steps', async ({ page }) => {
  13 |   await page.goto('/');
  14 | 
  15 |   await expect(page.getByText('Create a session')).toBeVisible();
  16 |   await expect(page.getByText('Everyone joins')).toBeVisible();
  17 |   await expect(page.getByText('Vote and reveal')).toBeVisible();
  18 | });
  19 | 
```