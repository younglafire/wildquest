# Vertical Slice Day 1 Baseline

## The program identity is fixed

The battle vertical slice uses Devnet program ID
`3WwKscJzw5CapS5Y1Pq2ebjdGxfCEcVs6Z6dJNuxVzqF`.

The decision was verified on 2026-09-09 in the following repository locations:

- `programs/wildquest/src/lib.rs` uses the address in `declare_id!`.
- `Anchor.toml` uses the address for localnet and Devnet.
- `target/idl/wildquest.json` uses the address in its top-level `address` field.
- `app/generated/wildquest/programs/wildquest.ts` exports the address as `WILDQUEST_PROGRAM_ADDRESS`.
- every generated PDA helper defaults to that program address.
- Program upgrades target that existing address directly and use the configured
  upgrade authority. A generated local deploy keypair is not the program's
  identity for an upgrade.
- the game footer displays that address.

A read-only Devnet query on 2026-09-09 confirmed that both historical addresses are deployed:

- `3WwKscJzw5CapS5Y1Pq2ebjdGxfCEcVs6Z6dJNuxVzqF` was last deployed in slot `492474218` and had program data length `251104` bytes.
- `DzUrGjvWMzp8m3Vs6jb8F7xfoh96W5Jmad9GBLgCAgvo` was last deployed in slot `492354940` and had program data length `194488` bytes.

The `3WwK...a641` deployment is newer and matches the Rust program, IDL, deploy keypair, and local tests. The older `DzUr...Agvo` address remains historical Discovery state. The battle slice does not derive new addresses under it.

No program was deployed and no SOL was spent during this Day 1 task.

## The starting checks were recorded

The unmodified branch was checked before the program-address alignment:

- `npm test` initially could not create Vite's temporary config inside the restricted execution sandbox. The same command passed after repository write permission was enabled.
- `npx tsc --noEmit` passed.
- `npm run lint` passed.
- `npm run format:check` found 13 existing frontend files that needed Prettier formatting.
- `npm run build` passed and produced the expected App Router pages and API routes.
- `npm run anchor-test` passed 5 Rust unit tests and 12 LiteSVM integration tests.

The format-only frontend differences were normalized so the final repository check could distinguish Day 1 errors from inherited branch formatting.

## The final checks are green

After aligning the program address, regenerating the Codama client, and formatting the touched files:

- `npm run codama:js` passed.
- `npm test` passed 173 tests across 20 test files; 8 tests and 1 file remained intentionally skipped.
- `npx tsc --noEmit` passed.
- `npm run lint` passed.
- `npm run format:check` passed.
- `npm run build` passed.
- `npm run anchor-test` passed 5 Rust unit tests and 12 LiteSVM integration tests.
- `git diff --check` passed.

The Anchor build emitted its existing crate-type and undefined-symbol warnings. LiteSVM loaded the produced program and every integration test passed. These warnings did not change the test result.

## Day 1 acceptance is complete

- VS-01 has a timed demonstration and a hard cut list in `PK-V1-RULES.md`.
- VS-02 has 40 reserved numeric catalogue IDs, exact model classes, static stats, and balance version `1`.
- VS-03 has one source-of-truth map plus API, signer, PDA, account, and handler contracts in `PK-VERTICAL-SLICE-ARCHITECTURE.md`.
- VS-04 has a recorded frontend, API, Rust, LiteSVM, and production-build baseline with one program ID.

The Day 1 documents are approved inputs for Day 2 and Day 3. They do not claim that Creature, SpeciesConfig, GameConfig, or Match accounts are implemented yet.
