# WQ-REASSESS-01 Phase 0

## Purpose

Technical + Product Reassessment for WildQuest before any further product expansion.

This phase is **read / audit / score / decide only**. It must not change production behavior.

## Locked baseline

- Repository: `younglafire/wildquest`
- Baseline branch: `main`
- Baseline commit: `ced38c48ab6e66832fb9090587a636cbbda72810`
- Assessment branch: `reassessment/wq-reassess-01-p0`
- Source-code change allowed in Phase 0: **NO**
- Deploy / migration / Codama regeneration / Devnet mutation: **NO**

## Phase objectives

1. Establish exact implementation truth from the locked baseline.
2. Map implemented evidence to the 9 UniHackFest scoring bands.
3. Audit novelty and overlap against BioSnap, Gotcha, Wildcard Dex, WilderTag, and other verified analogues.
4. Separate commodity mechanics from defensible WildQuest capabilities.
5. Record technical/product findings and blockers.
6. Produce a `GO`, `PIVOT_REQUIRED`, or `KILL` decision before further feature work.

## Documents

- `WQ-P0-BASELINE.md` — exact implementation matrix and technical truth.
- `WQ-P0-UNIHACKFEST-SCORECARD.md` — 100-point competition mapping.
- `WQ-P0-NOVELTY-AUDIT.md` — competitor/mechanic overlap and differentiation analysis.
- `WQ-P0-FINDINGS.md` — controlled findings register.
- `WQ-P0-DECISION.md` — final keep / de-emphasize / cut / pivot decision.

## Phase controls

During Phase 0 do not modify:

- `app/`
- `programs/`
- `supabase/`
- `models/`
- `scripts/`
- generated Solana client output
- deployment state

A defect found during reassessment is recorded as a finding; it is not fixed in this phase.

## Initial known review targets

The reassessment must independently verify, not merely assume, the current status of:

- Devnet program/client program-ID alignment.
- AI-to-onchain trust boundary and backend attestation gap.
- wallet ownership proof at the identification API boundary.
- current ResNet/ImageNet domain limits.
- discovery/collection/quest implementation and live-state evidence.
- novelty of photo → AI identification → collection/progression mechanics.
- strength of the current problem statement, customer, GTM, and digital-asset role.

## Exit gate

Phase 0 closes only when all five assessment artifacts are completed and the final decision explicitly states:

```text
CURRENT_WILDQUEST = GO | PIVOT_REQUIRED | KILL
PIVOT_DEPTH = NONE | MINOR | MECHANIC | MAJOR
SOURCE_CODE_CHANGED = NO
NEXT_PHASE = <explicit phase or HOLD>
```
