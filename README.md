# WildQuest

This project is a Solana dApp built around the WildQuest Anchor program in this repository.

## Getting started

```bash
npm install
npm run setup
npm run dev
```

## Supabase species API

WildQuest reads its offchain species catalogue through Next.js Route Handlers.
The browser does not write directly to the `species` table.

1. Copy the Supabase values from `.env.example` into `.env.local`. Keep
   `SUPABASE_SECRET_KEY` server-only; it is required by the duplicate gate and
   must never use the `NEXT_PUBLIC_` prefix.
2. Run `npx supabase db push` to apply every migration, including the duplicate
   reservation function required by `/api/identify`.
3. Apply `supabase/seed.sql` to insert the demo species catalogue.
4. Start the app with `npm run dev`.

Available endpoints:

- `GET /api/health/supabase` checks database connectivity.
- `GET /api/species` lists active species.
- `GET /api/species/common_house_gecko` returns the seeded demo species.
- `POST /api/identify` identifies one uploaded quest image with the bundled
  ResNet-50 model.

The migration intentionally grants public read access only to active species.
Catalogue writes stay restricted to trusted database administration paths. The
`discovery_cache` table is not exposed to anonymous or authenticated browser
roles. The identify route accesses its reservation function with the
server-only Supabase secret.

## Local image identification

`POST /api/identify` accepts exactly one `image` and one `wallet` string in
`multipart/form-data`. The wallet must be a structurally valid Solana address;
WQ-21 does not yet prove wallet ownership. JPEG, PNG, and WebP files are
accepted up to 4,000,000 bytes. Uploaded image bytes are decoded and classified
in memory and are never written to the filesystem, Supabase Storage, the
database, or a remote vision API.

```bash
curl \
  -F wallet=11111111111111111111111111111111 \
  -F image=@animal.jpg \
  http://localhost:3000/api/identify
```

A successful response combines the model result with canonical Supabase
catalogue data and values prepared for the future `discover_species()` call:

```json
{
  "identification": {
    "catalogue_id": "1",
    "species_id": "dog",
    "common_name": "Dog",
    "confidence": 0.984612,
    "explanation": "ResNet-50 matched the ImageNet label \"golden retriever\".",
    "rarity": "Common",
    "rarity_code": 0,
    "base_xp": 50,
    "facts": ["Domestic dogs are descendants of gray wolves."],
    "target_for_quest": true,
    "grade": "Gold",
    "grade_code": 3,
    "awarded_xp": 100,
    "proof_hash": "039058c6f2c0cb492c533b0a4d14ef77cc0f78abccced5287d84a1a2011cfb81"
  }
}
```

The endpoint requires confidence of at least `0.70`. Confidence below `0.80`
earns Bronze, confidence from `0.80` through `0.899999` earns Silver, and
confidence of at least `0.90` earns Gold. Bronze, Silver, and Gold multiply the
catalogue's base XP by `1`, `1.5`, and `2`. The endpoint returns
`422 LOW_CONFIDENCE` below the minimum and `422 QUEST_INELIGIBLE` when the
catalogue row is not a quest target.

`catalogue_id` is a decimal string that can be converted to the program's
`u64` species ID. `rarity_code` uses Common `0`, Uncommon `1`, Rare `2`, Epic
`3`, and Legendary `4`. `grade_code` uses Bronze `1`, Silver `2`, and Gold `3`.
The proof hash is SHA-256 of the original upload bytes and converts to the
program's `[u8; 32]` proof value. Before returning success, the endpoint creates
a 64-bit perceptual hash and atomically reserves it in `discovery_cache`. A
global match within Hamming distance `5`, including one submitted by another
wallet, returns `409 DUPLICATE_IMAGE` with only the match distance. An
unavailable reservation service returns `503 DUPLICATE_CHECK_UNAVAILABLE`, so
no claimable identification is returned when duplicate protection cannot
complete.

A successful response permanently consumes that image for the MVP, even when
the user abandons or fails the later Solana transaction. Supabase stores only
the two hashes and identification metadata, never the uploaded photo. This gate
protects the official offchain app flow; callers can still invoke the public
onchain instruction directly with an arbitrary proof until backend attestation
is implemented.

The local Microsoft ResNet-50 weights support the catalogue IDs `dog`, `cat`,
`bee`, `chicken`, `butterfly`, `dragonfly`, `frog`, and `ant`. The endpoint
returns `422 UNSUPPORTED_SPECIES` when the model's highest raw ImageNet class is
outside that allow-list instead of forcing a match. A JPEG, PNG, or WebP MIME
type is not sufficient by itself: the endpoint decodes the uploaded bytes and
returns `400 INVALID_IMAGE` when they do not contain a readable image. This
ImageNet-1k classifier is suitable for an MVP demonstration, but expanding to
every catalogue animal requires a labelled WildQuest dataset and model
fine-tuning.

The quantized ONNX model's pinned revision, license, and checksum are recorded
in `models/Xenova/resnet-50/MODEL_SOURCE.md`. Run the deterministic unit tests
with `npm test`, or include the bundled real-image fixtures with:

```bash
RUN_RESNET_INTEGRATION=1 npx vitest run app/lib/vision/classifier.integration.test.ts
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
