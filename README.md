# WildQuest

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

WildQuest Solana dApp with an Anchor program and generated client

WildQuest turns real wildlife photos into a game loop. A local ResNet-50 model
identifies supported animals, the backend grades each capture and rejects reused
photos, and the Solana program records discoveries, XP, levels, and quest
rewards. Supabase supplies the species catalogue and duplicate reservation
service.

## Table of Contents

- [Security](#security)
- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Player Journey](#player-journey)
- [Architecture](#architecture)
- [Onchain Accounts](#onchain-accounts)
- [Capture Identification](#capture-identification)
- [Quest Progression](#quest-progression)
- [Testing](#testing)
- [Deployment](#deployment)
- [API](#api)
- [Contributing](#contributing)
- [License](#license)

## Security

- Keep `SUPABASE_SECRET_KEY` server-only. Never give a secret key a
  `NEXT_PUBLIC_` prefix, print it, commit it, or include it in screenshots.
- Rotate any credential that has appeared in chat, terminal output, an issue,
  or source control.
- Uploaded photos are decoded and classified in memory. WildQuest does not
  write them to the filesystem, Supabase Storage, or the database.
- A successful identification permanently reserves its SHA-256 proof and
  perceptual hash before the user submits a Solana transaction. Use a fresh
  photo when retrying an abandoned capture.
- The identify endpoint validates the wallet address but does not prove wallet
  ownership. The public program also has no backend signature check, so a
  direct caller can submit fabricated grade and proof values. Backend
  attestation remains required before production use.

## Background

The MVP supports a short expedition loop:

- connect a Wallet Standard compatible Solana wallet;
- create a Player Passport;
- photograph one of the supported catalogue animals;
- review the AI identification, capture grade, and XP;
- record the Discovery account on Solana Devnet;
- complete the five-target demo quest and claim its reward.

The current classifier recognizes eight catalogue groups: dog, cat, bee,
chicken, butterfly, dragonfly, frog, and ant. It is an ImageNet classifier, not
an open-ended wildlife model. Adding more reliable species requires a labelled
WildQuest dataset and model training.

## Install

### Dependencies

- Node.js 20.19.0 or newer and npm 10 or newer
- Rust 1.89.0, pinned by `rust-toolchain.toml`
- Anchor CLI 1.1.2
- Agave CLI 3.x
- a Supabase project and Supabase CLI access
- a Wallet Standard compatible Solana wallet for browser testing

See [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) for the requirements of
each development workflow and the files that must remain present in a branch.

Install the JavaScript dependencies and create the local environment file:

```sh
npm ci
cp .env.example .env.local
```

Run `npm ci` after checking out or pulling a branch whose `package.json` or
`package-lock.json` changed. Dependencies in `node_modules` are local and are
not transferred by Git.

The generated client is committed, so application development does not require
code generation. Run `npm run setup` only after selecting and synchronizing the
intended program ID because that command rebuilds the IDL and replaces the
generated client.

Fill `.env.local` with the RPC and Supabase values for your own environment.
The checked-in `.env.example` contains names and placeholders only.

Link the Supabase project and apply the migrations:

```sh
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

For a local Supabase stack, `npx supabase db reset` applies migrations and
`supabase/seed.sql`. Do not run a database reset against shared or production
data.

The quantized ONNX model is committed under `models/Xenova/resnet-50`. Its
pinned revision, license, and SHA-256 checksum are recorded in
`models/Xenova/resnet-50/MODEL_SOURCE.md`.

## Usage

Start the Next.js development server:

```sh
npm run dev
```

Open `http://localhost:3000`, select **Start Expedition**, and connect a wallet
configured for Devnet. Wallet connection does not request a transaction. The
Home screen explains the separate transaction that creates the Player
Passport.

The main routes are:

- `/` for landing and wallet connection;
- `/home` for Player level, XP, quest progress, and recent discoveries;
- `/quest` for target progress and `complete_quest` reward claiming;
- `/capture` for photo selection, identification, grading, and recording;
- `/collection` for catalogue and Discovery account aggregation;
- `/collection/[speciesId]` for species facts and an unrewarded practice quiz;
- `/profile` for wallet and Player Passport data;
- `/discovery/confirmed` for confirmation status and the Explorer link.

Gameplay routes return a disconnected visitor to the landing page and preserve
the requested route. Desktop navigation lives in the header; mobile navigation
uses the fixed bottom bar.

## Player Journey

The Home screen derives progression from confirmed Player and Discovery
accounts. Level follows `1 + floor(total_xp / 100)`.

The capture flow has four visible stages:

- **Select** accepts one JPEG, PNG, or WebP file no larger than 4,000,000 bytes.
- **Verify** sends the photo and connected wallet address to `/api/identify`.
- **Review** shows species, confidence, rarity, grade, XP, explanation, and a
  catalogue fact.
- **Record** asks the wallet to sign `discover_species` and waits for confirmed
  commitment before updating the collection.

Pending identification metadata lives in session storage so a rejected wallet
transaction can be retried in the same browser tab. Photo bytes never enter
browser storage.

## Architecture

- `app/` contains the Next.js App Router frontend and Route Handlers.
- `app/lib/vision/` contains upload validation, ResNet inference, quality
  scoring, proof hashing, perceptual hashing, and response validation.
- `app/lib/hooks/use-game-data.ts` joins wallet-scoped Solana accounts with the
  Supabase catalogue for the game screens.
- `programs/wildquest/` contains the Anchor program and LiteSVM tests.
- `app/generated/wildquest/` is Codama output. Do not hand-edit generated files.
- `supabase/migrations/` defines catalogue access, enrichment, quest targets,
  and the atomic duplicate gate.
- `scripts/wq-devnet-loop.ts` exercises the real offchain and onchain loop.

Supabase is authoritative for catalogue content and duplicate reservations.
Solana is authoritative for Player progression, recorded discoveries, quests,
and claimed rewards. The API response connects them through the catalogue's
numeric ID, which becomes the program's `u64` species ID.

## Onchain Accounts

The program currently exposes `initialize_player`, `discover_species`,
`initialize_quest`, and `complete_quest`. The earlier Counter instructions
remain in the program as scaffold functionality.

- **Player PDA** uses `["player", wallet]` and stores wallet, XP, level,
  discovery count, and badge count.
- **Discovery PDA** uses `["discovery", wallet, proof_hash]` and stores the
  Player wallet, catalogue species ID, timestamp, grade, rarity, and proof.
- **Quest PDA** uses `["quest", quest_id_le_bytes]` and stores its targets and
  XP reward.
- **QuestCompletion PDA** uses `["quest_completion", quest_pda, wallet]` and
  prevents the same wallet from claiming one quest twice.

`discover_species` derives XP from the validated grade code inside the program:
Bronze awards 50 XP, Silver 75 XP, and Gold 100 XP. It updates Player
progression and creates the Discovery account atomically.

## Capture Identification

Microsoft ResNet-50 runs through Transformers.js and quantized ONNX weights.
Remote model loading is disabled. The Next.js function bundles the local model,
`onnxruntime-node`, and Sharp.

The endpoint rejects confidence below `0.70`. Confidence establishes the
highest possible grade, while image sharpness, center luminance, and entropy may
downgrade the result. The final response is validated by a strict Zod schema.

Before returning success, the backend creates a 64-bit perceptual hash and
calls the `reserve_discovery_image` Supabase function. A global Hamming distance
of five or less is a duplicate. The database function serializes comparison and
insertion so concurrent copies cannot both succeed.

## Quest Progression

Demo Quest ID `1` targets catalogue IDs `3`, `5`, `8`, `9`, and `11`: bee,
chicken, butterfly, dragonfly, and frog. Completing it awards 100 XP and one
badge.

`complete_quest` receives the five Discovery accounts as read-only remaining
accounts. The program verifies ownership, account type, Player wallet, and all
required species before updating the Player and creating QuestCompletion.

The quest screen stays unavailable until the current program version is
deployed and Quest ID `1` is initialized on that cluster. Quest initialization
is a one-time operator action, not a transaction charged to each player.

### Program IDs

The checked-in browser client targets the deployed Devnet program:
`DzUrGjvWMzp8m3Vs6jb8F7xfoh96W5Jmad9GBLgCAgvo`.

The Rust `declare_id!`, generated IDL, and localnet configuration currently use
`3WwKscJzw5CapS5Y1Pq2ebjdGxfCEcVs6Z6dJNuxVzqF`. This distinction matters when
regenerating the client or deploying quest support. Confirm the intended
program ID before code generation, PDA derivation, or deployment. In
particular, `complete_quest` checks Discovery account ownership and must be
built with the ID of the deployed program.

## Testing

Run deterministic frontend, API, and library tests:

```sh
npm test
npx tsc --noEmit
npm run lint
npm run format:check
npm run build
```

Run the Anchor build and LiteSVM program tests:

```sh
npm run anchor-test
```

Run the bundled real-image classifier fixtures:

```sh
RUN_RESNET_INTEGRATION=1 npx vitest run app/lib/vision/classifier.integration.test.ts
```

Run the Devnet loop with a dedicated funded test wallet:

```sh
WQ_E2E_KEYPAIR_PATH=/absolute/path/to/devnet-test-keypair.json \
  npm run test:devnet
```

Use `npm run test:devnet -- --runs 1` for one WQ-28 loop. The default ten-run
command enforces the WQ-29 90 percent target. Successful runs permanently
consume their image hashes and spend Devnet account rent and transaction fees.
Recorded results and exact Explorer links live in
`docs/WQ-28-29-DEVNET-RESULTS.md`.

## Deployment

Program interface changes require an Anchor build, IDL review, Codama client
generation, program deployment, and frontend deployment from the same reviewed
source state:

```sh
npm run anchor-build
npm run codama:js
```

Do not accept generated program-address changes without checking the target
cluster. Apply Supabase migrations before deploying a frontend that depends on
new columns or database functions. Configure the four environment variables
from `.env.example` in the hosting provider and keep the Supabase secret in a
server-only secret store.

After deploying quest support, initialize Quest ID `1` once and verify its PDA
before enabling quest claiming for users.

## API

### Catalogue

- `GET /api/health/supabase` checks database connectivity.
- `GET /api/species` lists active catalogue species.
- `GET /api/species/[speciesId]` returns one active species by slug.

### Identify

`POST /api/identify` requires exactly one `image` file and one `wallet` string
in `multipart/form-data`:

```sh
curl \
  -F wallet=11111111111111111111111111111111 \
  -F image=@animal.jpg \
  http://localhost:3000/api/identify
```

A successful response contains catalogue identity, display content, confidence,
rarity, grade, awarded XP, and the original-image SHA-256 proof. Common failure
codes include `LOW_CONFIDENCE`, `UNSUPPORTED_SPECIES`, `QUEST_INELIGIBLE`,
`DUPLICATE_IMAGE`, `INVALID_IMAGE`, and `DUPLICATE_CHECK_UNAVAILABLE`.

## Contributing

Questions, bugs, and feature proposals belong in the repository's
[GitHub issues](https://github.com/younglafire/wildquest/issues). Pull requests
are welcome.

Read `AGENTS.md` before changing the project. Keep generated files, migrations,
and program IDs consistent, preserve unrelated working-tree changes, and run
the checks appropriate to the changed subsystem before submitting a pull
request.

## License

UNLICENSED. Copyright 2026 WildQuest contributors. No permission is granted to
copy, modify, or distribute this repository until a license is added.
