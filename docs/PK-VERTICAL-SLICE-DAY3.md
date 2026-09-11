# Vertical Slice Day 3 Creature Ownership

## Implemented accounts

- `GameConfig` stores the admin, capture authority, balance version, rules
  version, fixed stake, and bump at `["game_config"]`.
- Six `SpeciesConfig` accounts store the approved model class and static stats
  at `["species_config", catalogue_id_le, balance_version_le]`.
- `Creature` stores owner, catalogue ID, proof hash, capture timestamp, balance
  version, and bump at `["creature", owner, catalogue_id_le]`.

The Creature address excludes the photo proof. Initializing the same wallet and
catalogue ID twice therefore reaches the same address and fails.

## Capture authorization

`capture_creature()` requires both the owner wallet and the capture authority
configured in `GameConfig` to sign. It also requires the exact active
`SpeciesConfig`, rejects an all-zero proof, and stores balance version `1`.

The server reads a dedicated 64-byte keypair from
`CAPTURE_AUTHORITY_SECRET_KEY_BASE64`, fetches a confirmed Devnet blockhash,
builds the generated capture instruction, partially signs it, and returns its
wire transaction. The owner signature is intentionally missing. Blockhash
expiry limits the lifetime of the authorization without adding a client-chosen
timestamp to the instruction.

Never use the program deployment authority as the hosted capture authority.
Generate and fund a dedicated Devnet-only keypair, configure its public key in
`GameConfig`, and keep its secret only in the server secret store.

## Verification

LiteSVM covers the 40 stat records, valid capture, one-per-species rejection,
wrong capture authority, wrong owner-derived PDA, zero proof, unsupported
catalogue ID, unauthorized config initialization, and rollback. Codama output
contains the three new account codecs, PDA helpers, and instruction builders.

A read-only Devnet check fetched a blockhash and produced a partially signed
transaction without submitting it. `npm run setup:pk-demo` is the idempotent
operator command for initializing `GameConfig`, all 40 `SpeciesConfig`
accounts, and 40 Creatures for each of two funded demo wallets after program
deployment. Deployment and running that state-changing setup remain explicit
environment operations rather than repository-only verification.
