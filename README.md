<p align="center">
  <a href="https://psykzz.github.io/planning-poker">
  </a>
</p>
<h1 align="center">
  Planning Poker
</h1>

A planning poker application built with Next.js and React.

_Have an idea you want to suggest? Pull requests are welcome._

## Quick start

1. Clone the repo and install dependencies.

```shell
git clone <url> .
npm install
```

2. Start the development server.

```shell
npm run dev
```

3. Open `http://localhost:3000/`.

## Build and deploy

Build the app:

```shell
npm run build
```

Start the production server:

```shell
npm run start
```

### Netlify deployment

The repo includes a `netlify.toml` that configures Netlify to build with Next.js using the Essential Next.js plugin:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Netlify will automatically install `@netlify/plugin-nextjs` at build time. If you need to deploy under a subpath such as `/planning-poker`, set `DEPLOY_TARGET=planning-poker` for the build.

## Supabase schema

The app reads and writes directly to Supabase from the browser, and expects three public tables:

- `users`: session members and their `last_presence`
- `scores`: one score per user per session
- `options`: per-session settings such as the point sequence

To recreate the schema, run [supabase/schema.sql](supabase/schema.sql) in the Supabase SQL editor. The script:

- recreates the `users`, `scores`, and `options` tables
- adds `created_at` and `updated_at` columns for debugging
- creates the composite keys required by the app's `upsert()` calls
- enables RLS with permissive anon/authenticated policies so the current client continues to work
- adds `scores` and `options` to `supabase_realtime`

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
