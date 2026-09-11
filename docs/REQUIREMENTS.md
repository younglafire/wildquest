# WildQuest Development Requirements

This repository uses `package.json`, `package-lock.json`, `Cargo.toml`, and
`Cargo.lock` as its executable dependency manifests. A Python
`requirements.txt` would not install any part of WildQuest.

## Landing page and game UI

Required software:

- Node.js 20.19.0 or newer
- npm 10 or newer
- a Wallet Standard compatible browser wallet configured for Solana Devnet

Install the exact JavaScript dependency tree recorded by this branch:

```sh
npm ci
```

The 3D landing page requires the direct `three` runtime dependency, its
development-only TypeScript declarations, and the tracked
`public/models/dog.glb` model. Run `npm ci` whenever a checkout changes either
JavaScript manifest. Switching branches does not update `node_modules`.

Start and verify the UI:

```sh
npm run dev
npx tsc --noEmit
npm run lint
npm run build
```

## Identification API

The identification route also requires:

- the tracked `models/Xenova/resnet-50/config.json` file;
- the tracked `models/Xenova/resnet-50/preprocessor_config.json` file;
- the tracked `models/Xenova/resnet-50/onnx/model_quantized.onnx` file;
- a Supabase project with every migration in `supabase/migrations` applied;
- all variables listed in `.env.example`.

Copy the environment template and provide values for the selected Supabase
project:

```sh
cp .env.example .env.local
```

`SUPABASE_SECRET_KEY` is server-only. Never expose it through a
`NEXT_PUBLIC_` variable, source control, screenshots, logs, or chat.

Apply the remote database migrations:

```sh
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase db push
```

The local classifier does not require a Gemini or Hugging Face API key. Remote
model loading is disabled.

## Solana program development

Required software:

- Rust 1.89.0 with `rustfmt`, `clippy`, and `rust-analyzer`, installed from
  `rust-toolchain.toml`;
- Anchor CLI 1.1.2;
- Agave CLI 3.x;
- Solana Devnet SOL for deployment or browser transaction testing.

Build the program, regenerate the IDL and Codama client, and run LiteSVM tests:

```sh
npm run setup
npm run anchor-test
```

`npm run setup` regenerates `app/generated/wildquest`. Run it only when the
Rust program and generated client are intended to use the same program ID.

## Devnet integration loop

The end-to-end script requires a dedicated funded Devnet keypair and all
identification API requirements:

```sh
WQ_E2E_KEYPAIR_PATH=/absolute/path/to/devnet-test-keypair.json \
  npm run test:devnet
```

The default RPC URLs target Devnet. Override `NEXT_PUBLIC_RPC_URL` and
`NEXT_PUBLIC_RPC_WS_URL` together when using another cluster.

## Branch checklist

Before pushing a branch, confirm:

- all imported npm packages are direct dependencies or development
  dependencies in `package.json`;
- `package-lock.json` was updated with the same npm operation;
- runtime assets and model files are tracked by Git;
- new environment-variable names have placeholders in `.env.example`;
- generated Solana clients match the program ID and IDL when the program
  changed;
- `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run format:check`,
  and `npm run build` pass;
- `npm run anchor-test` passes when onchain code changed.
