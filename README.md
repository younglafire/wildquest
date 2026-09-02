# WildQuest

This project is a Solana dApp built around the WildQuest Anchor program in this repository.

## Getting started

```bash
npm install
npm run setup
npm run dev
```

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
