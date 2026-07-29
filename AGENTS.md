# AGENTS.md

## Overview

Planning Poker is a Next.js 16 and React 19 application backed directly by
Supabase. Sessions are identified by a URL hash, and the client synchronizes
users, votes, options, and round history through Supabase Realtime.

## Repository layout

- `pages/`: Next.js routes and application entry points.
- `src/components/`: UI components and their colocated CSS modules.
- `src/hooks/`: session, rounds, theme, and URL-hash state.
- `src/api/`: browser-side Supabase API helpers.
- `src/utils/`: client-side utilities, including score statistics and user
  storage.
- `supabase/schema.sql`: database schema, policies, and Realtime setup.
- `e2e/`: Playwright end-to-end tests.

Refer to `CONTEXT.md` for domain terminology, lifecycle rules, and known
technical debt before changing voting or session behavior.

## Development

Use Node.js 24 to match CI.

```sh
npm ci
npm run dev
```

Available validation commands:

```sh
npm run lint
npm run build
npm run test:e2e
```

Playwright tests require a local Chromium browser. Install it with
`npx playwright install chromium` when needed.

## Change guidelines

- Use JavaScript/JSX and ESM syntax; follow Prettier settings in `.prettierrc`.
- Keep component styles colocated in CSS modules.
- Preserve the session invariants documented in `CONTEXT.md`, particularly
  voting-stage restrictions and active-user filtering.
- Update `supabase/schema.sql` when application changes require database,
  policy, or Realtime subscription changes.
- Run lint and build checks before submitting application changes. Add or
  update Playwright coverage for user-visible flows when applicable.
