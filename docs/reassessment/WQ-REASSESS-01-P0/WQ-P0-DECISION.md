# WQ-P0 Decision Gate

## Purpose

Final authority for `WQ-REASSESS-01 Phase 0`. This document is completed only after baseline reconciliation, UniHackFest scoring, novelty audit, and findings review.

## Decision options

- `GO` — current product thesis is sufficiently competitive; continue without a core-mechanic pivot.
- `PIVOT_REQUIRED` — preserve useful technical assets but change positioning and/or core mechanic before further feature investment.
- `KILL` — current direction should not receive additional implementation effort.

## Keep / De-emphasize / Cut

### KEEP

TBD from evidence. Candidate capabilities to assess include:

- real-world capture flow;
- local image classification;
- image-quality grading;
- proof hashing and duplicate protection;
- wallet and Devnet transaction UX;
- Player / Discovery state;
- collection reconstructed from confirmed accounts.

### DE-EMPHASIZE

TBD. Evaluate whether rarity, generic XP, badges, cards, and generic collection should remain supporting mechanics rather than the product thesis.

### CUT / DO NOT BUILD

TBD. Explicitly decide on nonessential scope such as tokenomics, marketplace, AR, battle/deck mechanics, generic social feed, or Pokémon-like map expansion unless a winning product thesis requires it.

## Pivot candidates

If `PIVOT_REQUIRED`, compare at minimum:

1. Proof-of-Discovery / verifiable observation.
2. Citizen-science mission network.
3. Proof-of-presence environmental missions.
4. Sponsor-funded discovery / environmental bounties.

These are hypotheses, not pre-approved directions.

## Pivot comparison

| Candidate | Problem strength | Novelty | Solana necessity | AI necessity | Digital asset role | GTM | Demo | Build risk | Existing-code reuse | UniHackFest total |
|---|---|---|---|---|---|---|---|---|---|---|
| Current WildQuest | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Proof-of-Discovery | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Citizen Science Missions | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Environmental Mission Proof | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |
| Sponsored Discovery Bounties | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

## Final gate

Complete exactly once the evidence is sufficient:

```text
WQ_REASSESS_01_P0 = IN_PROGRESS
BASELINE_COMMIT = ced38c48ab6e66832fb9090587a636cbbda72810
CURRENT_WILDQUEST = TBD
PIVOT_DEPTH = TBD
SOURCE_CODE_CHANGED = NO
PRODUCTION_BEHAVIOR_CHANGED = NO
RECOMMENDED_CORE = TBD
NEXT_PHASE = HOLD
```

## Approval note

Phase 0 documentation is assessment authority only. It does not authorize source changes, deployment, database migration, program regeneration, or Devnet mutation.
