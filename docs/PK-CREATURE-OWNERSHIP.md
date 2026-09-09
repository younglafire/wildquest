# Creature Ownership Contract

## Status

This document fixes the vertical-slice ownership design. VS-11 through VS-14
implement, generate, and test the contract. The deployed program does not
contain a Creature account yet.

## Identity

One Creature represents one exact catalogue entry owned by one wallet. The
numeric key is named `catalogue_id` across the identification response, planned
Creature account, and planned battle instructions.

- `catalogue_id` is one of the reserved `u64` values `1001` through `1006`.
- `catalogue_id` matches the numeric `species.id` column in Supabase.
- `species_slug` is the readable text key currently stored in
  `species.species_id`.

## PDA

The program derives a Creature PDA from:

```text
[b"creature", owner.as_ref(), catalogue_id.to_le_bytes().as_ref()]
```

The future Rust constant is `CREATURE_SEED` with value `b"creature"`. The
canonical bump is stored in the Creature account.

For one program ID, owner, and catalogue ID, these seeds derive one address.
The capture instruction will initialize that address once. A second attempt for
the same owner and catalogue ID reaches the existing account and fails before a
second Creature can be created.

The PDA enforces one Creature per exact catalogue entry per wallet. Photo hash,
capture time, model confidence, breed family, and species slug are not PDA
seeds.

## Planned account

The Creature account contains:

```rust
pub struct Creature {
    pub owner: Pubkey,
    pub catalogue_id: u64,
    pub proof_hash: [u8; 32],
    pub captured_at: i64,
    pub balance_version: u16,
    pub bump: u8,
}
```

`proof_hash` links the account to the approved capture. `balance_version` binds
the Creature to a compatible versioned SpeciesConfig. Battle stats live in
SpeciesConfig rather than being copied into every Creature account.

V1 Creature accounts are permanent and non-transferable. V1 exposes no handler
that changes `owner` or closes a Creature account. This lifecycle preserves the
one-per-species rule after capture.

## Capture invariants

The later `capture_creature()` handler must enforce all of these conditions in one
transaction:

- The owner signs the transaction.
- The capture authority signs the same transaction and matches
  `game_config.capture_authority`.
- The GameConfig PDA uses the canonical seed and accepted balance version.
- `catalogue_id` is one of the six version-one catalogue IDs.
- The SpeciesConfig PDA matches `catalogue_id`, is active, and uses the accepted
  balance version.
- The Creature PDA uses the canonical seeds and bump.

The server signs only after local model validation and duplicate reservation.
The program treats the capture-authority signature as approval of the owner,
catalogue ID, proof hash, and balance version encoded in the transaction.

An invalid condition fails the transaction without creating the Creature or
changing Player data.

## Team invariants

A valid V1 team references exactly three Creature accounts. The match program
checks that:

- every Creature account is owned by the WildQuest program;
- every stored `owner` equals the player wallet;
- the three Creature PDAs are distinct;
- the three `catalogue_id` values are distinct;
- every referenced SpeciesConfig is active and compatible with the match battle
  version;
- the Match account stores the visible Creature order supplied by the player.

Client-side checks may explain an invalid selection, but only the Solana program
enforces ownership and team validity.

## Historical discoveries

Discovery accounts remain readable history. Their PDA contains a proof hash
instead of the catalogue ID, so one wallet may have several Discovery accounts
for the same species. The battle program never treats a Discovery account as a
Creature account.

No automatic migration creates Creatures from historical discoveries. A player
must complete the future Creature capture flow for each battle creature.

## Delivery boundary

VS-02 and VS-03 approve the rule, terminology, seeds, fields, and invariants in
this document. VS-11 through VS-14 remain open until the repository contains the
Creature account, seed constant, capture instruction handler, generated client,
and passing LiteSVM enforcement tests.
