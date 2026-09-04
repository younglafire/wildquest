# WQ-P0 Baseline

## Authority

This document records implementation truth for the exact WildQuest baseline locked by `WQ-REASSESS-01 Phase 0`.

- Repository: `younglafire/wildquest`
- Baseline commit: `ced38c48ab6e66832fb9090587a636cbbda72810`
- Assessment status: `IN_PROGRESS`

## Status vocabulary

- `IMPLEMENTED` — code path exists and is supported by repository evidence.
- `VERIFIED_LIVE` — live/Devnet evidence exists for the exact assessed behavior.
- `VERIFIED_HISTORICALLY` — repository records prior live proof, but not necessarily for later commits.
- `PARTIAL` — meaningful code exists but the complete path or live state is incomplete.
- `MOCKED` — user-facing or test behavior is simulated rather than authoritative.
- `NOT_IMPLEMENTED` — no supported implementation found.
- `UNVERIFIED` — insufficient evidence; do not infer completion.

## Implementation matrix

| Capability | Status | Primary evidence | Live evidence | Notes / reassessment action |
|---|---|---|---|---|
| Wallet connection | TBD | | | |
| Player Passport / Player PDA | TBD | | | |
| Photo capture/upload | TBD | | | |
| Local image classification | TBD | | | |
| Confidence threshold | TBD | | | |
| Capture quality grading | TBD | | | |
| XP derivation | TBD | | | |
| SHA-256 proof | TBD | | | |
| Perceptual duplicate gate | TBD | | | |
| Species catalogue | TBD | | | |
| `discover_species` | TBD | | | |
| Discovery PDA | TBD | | | |
| Collection reconstruction | TBD | | | |
| Explorer confirmation | TBD | | | |
| Quest program logic | TBD | | | |
| Quest UI | TBD | | | |
| Quest Devnet deployment | TBD | | | |
| Quest initialization | TBD | | | |
| Badge/progression state | TBD | | | |
| Species facts / practice quiz | TBD | | | |
| Map | TBD | | | |
| Leaderboard | TBD | | | |
| NFT/cNFT | TBD | | | |
| Fungible token | TBD | | | |
| Marketplace | TBD | | | |
| Backend attestation | TBD | | | |
| Wallet ownership proof at identify API | TBD | | | |

## Architecture truth

### Frontend

TBD after exact-path audit.

### AI / vision

TBD after exact-path audit.

### Supabase

TBD after migration/API audit.

### Solana

TBD after Anchor, IDL, generated-client, and deployment-evidence reconciliation.

## Deployment / identity reconciliation

Record and compare:

| Source | Program ID / target | Status |
|---|---|---|
| Rust `declare_id!` | TBD | |
| Anchor/IDL | TBD | |
| generated client | TBD | |
| frontend runtime target | TBD | |
| latest verified Devnet deployment | TBD | |

## Test and evidence inventory

Record deterministic tests, integration tests, Devnet evidence, and whether each proves the exact baseline or only an earlier state.

## Baseline conclusion

```text
BASELINE_RECONCILED = NO
SOURCE_CODE_CHANGED = NO
```
