# WildQuest

This project is a Solana dApp built around the WildQuest Anchor program in this repository.

## Getting started

```bash
npm install
npm run setup
npm run dev
```

## Supabase species API

WildQuest reads its off-chain species catalogue through Next.js Route Handlers.
The browser does not write directly to the `species` table.

1. Copy the Supabase values from `.env.example` into `.env.local`.
2. Apply `supabase/migrations/20260902040000_complete_species_catalogue.sql`.
3. Apply `supabase/seed.sql` to insert the first demo species.
4. Start the app with `npm run dev`.

Available endpoints:

- `GET /api/health/supabase` checks database connectivity.
- `GET /api/species` lists active species.
- `GET /api/species/common_house_gecko` returns the seeded demo species.

The migration intentionally grants public read access only to active species.
Catalogue writes stay restricted to trusted database administration paths. The
`discovery_cache` table is not exposed to anonymous or authenticated browser
roles; a later verification API must use a server-only Supabase secret.

## What this repo contains

- Next.js app in the root `app/` directory
- Anchor program in `programs/wildquest/`
- Codama-generated client output in `app/generated/wildquest/`
- Local setup and build scripts in the root `package.json`

## Common commands

```bash
npm run anchor-build
npm run anchor-test
npm run codama:js
npm run build
```

## Notes

- The Anchor program is defined at the repo root and does not live under an `anchor/` folder.
- The generated IDL output is under `target/idl/wildquest.json`.
- The client is generated into `app/generated/wildquest` so `codama.json` matches the actual program.
