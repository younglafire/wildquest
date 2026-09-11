# WildQuest

[![standard-readme compliant](https://img.shields.io/badge/readme%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

WildQuest Solana dApp with an Anchor program and generated client

WildQuest is a deterministic creature-battle vertical slice. A local ResNet-50
model identifies one of 40 exact creatures, each wallet can own one Creature
per catalogue ID, and ordered teams battle for a fixed Devnet SOL stake.

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

The playable loop is: connect a Wallet Standard compatible wallet, identify
one of 40 exact ImageNet classes, approve creation of its Creature account,
build an ordered three-Creature team, and open or join a deterministic 0.01 SOL
Devnet Match. The result can be replayed from the same onchain rules; the
recorded winner signs a separate transaction to claim the 0.02 SOL pot. Ties
refund both stakes during resolution.

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

### Local Supabase with Docker

Install Docker Desktop and make sure it is running. The Supabase CLI manages
the local PostgreSQL, API, and Studio containers from `supabase/config.toml`;
do not create a second hand-written Compose stack for them.

```sh
npm run supabase:start
npm run supabase:status
npm run supabase:reset
```

Use the local API URL and publishable/anon key printed by
`npm run supabase:status` in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<local-publishable-or-anon-key>
```

Stop the containers when they are no longer needed:

```sh
npm run supabase:stop
```

Each developer gets the same schema and seed data from the committed
`supabase/migrations/` and `supabase/seed.sql`. Do not put `.env.local`, wallet
keypairs, or the capture-authority key in Docker images or Git. The capture
flow still uses the shared Devnet capture authority configured separately.

The generated client is committed, so application development does not require
code generation. Run `npm run setup` only after selecting and synchronizing the
intended program ID because that command rebuilds the IDL and replaces the
generated client.

Fill `.env.local` with the RPC and Supabase values for your own environment.
Creature authorization additionally requires a dedicated Devnet capture
authority encoded as `CAPTURE_AUTHORITY_SECRET_KEY_BASE64`. Never reuse the
program deployment authority for this server role. The checked-in
`.env.example` contains names and placeholders only.

For local development, a teammate can instead receive the shared
`.wildquest-keys/capture-authority.json` file through a secure channel. It is
ignored by Git on purpose. The key must be the same public key stored in the
Devnet `GameConfig.capture_authority`; generating a new keypair locally will
not authorize captures until an admin reinitializes the Devnet configuration.
The path can be changed with `WQ_CAPTURE_AUTHORITY_KEYPAIR_PATH`. Restart
`npm run dev` after adding the key.

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
- `/capture` for photo selection and exact 40-creature identification;
- `/collection` for all 40 battle cards and wallet-owned Creature accounts;
- `/match/[matchAddress]` for a shareable battlefield, replay, and signed receipts;
- `/collection/[speciesId]` for species facts and an unrewarded practice quiz;
- `/profile` for wallet and Player Passport data;
- `/discovery/confirmed` for confirmation status and the Explorer link.

Gameplay routes return a disconnected visitor to the landing page and preserve
the requested route. Desktop navigation lives in the header; mobile navigation
uses the fixed bottom bar.

## Player Journey

The Home screen derives progression from confirmed Player and Discovery
accounts. Level follows `1 + floor(total_xp / 100)`.

The current battle-slice capture flow has three visible stages:

- **Select** accepts one JPEG, PNG, or WebP file no larger than 4,000,000 bytes.
- **Verify** sends the photo and connected wallet address to `/api/identify`.
- **Result** reveals a battle card with the catalogue identity, onchain HP,
  Damage, Defense, Speed, Shield, confidence, and balance version.

Pending identification metadata lives in session storage. Photo bytes never
enter browser storage. `capture_creature()` requires both the wallet and server
capture authority signatures and creates the one-per-wallet/species Creature
account.

Collection and team selection render the same Creature card component with the
same SpeciesConfig stats. An owner may release a card through
`release_creature`; the account rent returns to that owner and the species can
be captured again. The UI prevents release while the card is referenced by an
open or claimable Match.

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

The program exposes the legacy Player, Discovery, and Quest handlers plus the
battle-slice `initialize_game_config`, `initialize_species_config`,
`capture_creature`, `open_match`, `join_match`, `claim_match_payout`, and
`cancel_match` handlers. `release_creature` lets an owner close one Creature
account. The administrator-only `admin_close_match` and `admin_close_creature`
handlers support a safe Devnet prototype reset without changing the program ID.
The earlier Counter instructions remain as scaffold functionality.

- **Player PDA** uses `["player", wallet]` and stores wallet, XP, level,
  discovery count, and badge count.
- **Discovery PDA** uses `["discovery", wallet, proof_hash]` and stores the
  Player wallet, catalogue species ID, timestamp, grade, rarity, and proof.
- **Quest PDA** uses `["quest", quest_id_le_bytes]` and stores its targets and
  XP reward.
- **QuestCompletion PDA** uses `["quest_completion", quest_pda, wallet]` and
  prevents the same wallet from claiming one quest twice.
- **GameConfig PDA** uses `["game_config"]` and stores the capture authority,
  balance version, rules version, and fixed stake.
- **SpeciesConfig PDA** uses
  `["species_config", catalogue_id_le, balance_version_le]` and stores the
  static battle stats.
- **Creature PDA** uses `["creature", wallet, catalogue_id_le]`, enforcing one
  owned Creature for each exact catalogue ID.
- **Match PDA** uses `["match", creator, match_id_le]` and stores both ordered
  teams, stake, lifecycle status, winner, and timestamps.

A Match moves from `Open` to `Claimable` when combat has a winner. The winner
must sign `claim_match_payout` to receive both stakes and move it to `Settled`.
A tie is refunded immediately and becomes `Settled`; an unmatched creator can
cancel and recover the opening stake.

Opening or joining a Match routes both wallets to the same battlefield address.
Each browser subscribes to that Match account at confirmed commitment and uses
its `settled_at` timestamp as the shared animation clock. Battle progress is
derived from time, so the live view has no pause, skip, or replay controls.
Confirmed polling covers temporary WebSocket disconnects.

`discover_species` derives XP from the validated grade code inside the program:
Bronze awards 50 XP, Silver 75 XP, and Gold 100 XP. It updates Player
progression and creates the Discovery account atomically.

## Capture Identification

Microsoft ResNet-50 runs through Transformers.js and quantized ONNX weights.
Remote model loading is disabled. The Next.js function bundles the local model,
`onnxruntime-node`, and Sharp.

The endpoint rejects confidence below `0.70`. It accepts 40 exact ImageNet
classes defined in `app/lib/vision/mapping.ts`. The roster includes familiar
dogs and cats, domestic and wetland animals, birds, insects, and butterflies
seen in Vietnam or kept there as companion animals. It does not aggregate broad
dog, cat, or butterfly labels. The catalogue row must carry the same model
class and have `capture_enabled=true`; otherwise the request fails closed.

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

### Program ID

The Rust program, Anchor configuration, generated IDL, Codama client, PDA
helpers, and browser transactions use the newer deployed Devnet program:
`3WwKscJzw5CapS5Y1Pq2ebjdGxfCEcVs6Z6dJNuxVzqF`.

The older Devnet program
`DzUrGjvWMzp8m3Vs6jb8F7xfoh96W5Jmad9GBLgCAgvo` remains relevant only to
historical Discovery accounts and the dated WQ-28/WQ-29 results. New game state
must derive addresses under the current program ID.

The five-day battle scope, fixed creature roster, account contracts, and Day 1
baseline are recorded in:

- [`docs/PK-V1-RULES.md`](docs/PK-V1-RULES.md)
- [`docs/PK-VERTICAL-SLICE-ARCHITECTURE.md`](docs/PK-VERTICAL-SLICE-ARCHITECTURE.md)
- [`docs/PK-VERTICAL-SLICE-BASELINE.md`](docs/PK-VERTICAL-SLICE-BASELINE.md)
- [`docs/PK-VERTICAL-SLICE-DAY2.md`](docs/PK-VERTICAL-SLICE-DAY2.md)
- [`docs/PK-VERTICAL-SLICE-DAY3.md`](docs/PK-VERTICAL-SLICE-DAY3.md)
- [`docs/PK-VERTICAL-SLICE-DAY4.md`](docs/PK-VERTICAL-SLICE-DAY4.md)
- [`docs/PK-VERTICAL-SLICE-DAY5.md`](docs/PK-VERTICAL-SLICE-DAY5.md)

Initialize the 40 SpeciesConfig accounts without granting any Creature
ownership:

```bash
npm run setup:pk-config
```

For automated demo wallets, create full 40-card rosters and run the two-wallet
battle reliability check:

```bash
npm run setup:pk-demo
npm run test:pk-devnet -- --runs 10
```

To reset only the Devnet battle state, deploy the matching program build and
run:

```sh
npm run reset:pk-devnet
```

The command closes every Match before closing every Creature. Open stakes return
to their creators, decided unclaimed pots go to their recorded winners, and
account rent returns to the account payer. Player, Discovery, GameConfig, and
SpeciesConfig accounts remain because they do not grant Creature ownership.

This prototype is Devnet-only. The 40 creature stats, 0.01 SOL stake, and
deterministic battle rules are fixed for the vertical slice; see the Day 5 note
for the complete demo flow and known limitations.

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
new columns or database functions. Configure the required values from
`.env.example` in the hosting provider. Keep both the Supabase key and capture
authority keypair in a server-only secret store.

After deploying the battle-slice program, initialize `GameConfig`, the 40
`SpeciesConfig` accounts, and two funded demo-wallet rosters with:

```sh
WQ_ADMIN_KEYPAIR_PATH=/absolute/path/to/admin.json \
WQ_CAPTURE_AUTHORITY_KEYPAIR_PATH=/absolute/path/to/capture-authority.json \
WQ_DEMO_WALLET_A_KEYPAIR_PATH=/absolute/path/to/wallet-a.json \
WQ_DEMO_WALLET_B_KEYPAIR_PATH=/absolute/path/to/wallet-b.json \
  npm run setup:pk-demo
```

The script is idempotent: it verifies existing accounts and creates only the
missing ones. It submits Devnet transactions and therefore must not be run
against production keys.

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

A successful response contains the exact catalogue identity and ImageNet class,
display content, confidence, balance version, original-image SHA-256 proof, and
a short-lived capture transaction already signed by the server capture
authority. The connected owner wallet must add its signature before submission.
Common failure codes include `LOW_CONFIDENCE`, `UNSUPPORTED_SPECIES`,
`CAPTURE_INELIGIBLE`, `CAPTURE_AUTHORIZATION_UNAVAILABLE`, `DUPLICATE_IMAGE`,
`INVALID_IMAGE`, and `DUPLICATE_CHECK_UNAVAILABLE`.

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
