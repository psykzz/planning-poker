<p align="center">
  <a href="https://psykzz.github.io/planning-poker">
  </a>
</p>
<h1 align="center">
  Planning Poker
</h1>

A planning poker application built with Next.js and React.

_Have an idea you want to suggest? Pull requests are welcome._

## Quick Start

1. Clone and install dependencies.

```shell
git clone <url> .
npm install
```

2. Start local development.

```shell
npm run dev
```

3. Open `http://localhost:3000/`.

## Scripts

- `npm run dev`: start Next.js in development mode
- `npm run build`: production build
- `npm run start`: run the production server from a completed build
- `npm run lint`: run ESLint
- `npm run format`: run Prettier across source and docs

## Build And CI

Local production check:

```shell
npm run lint
npm run build
```

GitHub Actions build workflow is in [.github/workflows/deploy.yml](.github/workflows/deploy.yml) and currently runs:

1. `npm ci --prefer-offline --no-audit`
2. `npm run lint`
3. `npm run build`

## Deployment Variants

Routing behavior is configured in [next.config.mjs](next.config.mjs):

- Root deployment (default): do not set `DEPLOY_TARGET`
- Subpath deployment: set `DEPLOY_TARGET=<subpath>`

Example for GitHub Pages style hosting:

```shell
DEPLOY_TARGET=planning-poker npm run build
```

This applies both `basePath` and `assetPrefix` to `/<DEPLOY_TARGET>`.

### Netlify

The repo includes [netlify.toml](netlify.toml) with the Essential Next.js plugin.

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

If deploying under a subpath, set `DEPLOY_TARGET` in Netlify build environment variables.

## Supabase Schema Bootstrap

The app reads and writes directly to Supabase from the browser. It expects these public tables:

- `users`: session members and their `last_presence`
- `scores`: one score per user per session
- `options`: per-session settings (point sequence, stage, moderators, confirmations)
- `rounds`: historical snapshots saved when returning from results to voting

To recreate schema and policies, run [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL editor.

The script will:

- recreate `users`, `scores`, `options`, and `rounds`
- create `created_at` and `updated_at` timestamps and update triggers
- apply keys/indexes needed by upsert and session filters
- enable RLS with permissive anon/authenticated policies
- add realtime publication for `scores`, `options`, and `rounds`

## Runtime Notes

### Session Routing

- Session id comes from URL hash (`/voting#abc1234`)
- Without a hash, app generates or redirects to a valid voting route
- `results` and `options` routes require both hash session and a locally stored user for that session

### Local User Storage

User storage is session-aware in [src/utils/userStorage.js](src/utils/userStorage.js):

- stores a preferred name profile
- stores per-session user memberships keyed by session hash
- avoids one session identity overwriting another session identity

### Realtime Synchronization

Session state and rounds state use guarded refreshes in [src/hooks/useSessionState.js](src/hooks/useSessionState.js) and [src/hooks/useRounds.js](src/hooks/useRounds.js):

- subscriptions trigger canonical refetches
- stale async responses are ignored when session/request token no longer matches
- roster updates subscribe to `users` events for faster convergence

## Troubleshooting

### `npm run dev` exits unexpectedly

1. Confirm Node version matches CI expectation (`node-version: '24'` in workflow).
2. Reinstall dependencies: `npm ci`.
3. Run lint/build to surface issues quickly:

```shell
npm run lint
npm run build
```

### Session opens but user list or scores seem stale

1. Verify all clients are in the same hash session id.
2. Confirm Supabase realtime includes `scores`, `options`, and `rounds` tables.
3. Confirm `users` rows are being updated with recent `last_presence`.
4. Refresh page to force a full state bootstrap.

### Options or stage do not propagate

1. Confirm `options` table exists and RLS allows read/write.
2. Confirm key names in table include expected values (`stage`, `point_sequence`, `confirm`, `moderators`).
3. Check browser console for Supabase channel errors.

## Project structure

```text
.
├── pages
├── src
├── static
├── supabase
├── eslint.config.js
├── next.config.mjs
├── netlify.toml
├── package-lock.json
├── package.json
└── README.md
```

- `pages`: Next.js pages and API routes
- `src`: application components and client-side API helpers
- `static`: static assets
- `supabase`: SQL schema for the backing database
