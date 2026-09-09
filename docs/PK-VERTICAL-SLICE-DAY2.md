# Vertical Slice Day 2 Capture Candidate

## What is implemented

- Six exact catalogue identities are reserved as IDs `1001` through `1006`.
- Each row has a unique ImageNet class and a separate `capture_enabled` flag.
- ResNet accepts only classes `151`, `207`, `235`, `281`, `283`, and `323`.
- Broad dog, cat, and butterfly probability aggregation has been removed.
- `POST /api/identify` validates that the active catalogue row and winning model
  class agree before returning a result.
- The mobile capture screen selects, previews, submits, retries, clears, and
  displays the exact Creature candidate without persisting image bytes.
- The old Discovery transaction action is hidden so the pivot does not present
  a legacy Discovery account as Creature ownership.

## Response boundary

The existing additive response keeps legacy learning fields temporarily so the
catalogue UI remains compatible. These battle fields are now mandatory:

- `catalogue_id`
- `species_id`
- `common_name`
- `model_class_id`
- `model_label`
- `confidence`
- `proof_hash`
- `balance_version`
- `capture_enabled`

`catalogue_id` is the numeric cross-system identity. `species_id` is only an
offchain slug. `balance_version` is `1` for the fixed six-creature roster.

## Day 3 continuation

VS-07 originally stopped at the identification-candidate boundary. VS-12 now
adds a recent-blockhash transaction co-signed by the configured server capture
authority. The browser does not consume that transaction yet; that UI action
remains part of the final integration day.

No Supabase migration was applied remotely as part of this repository change.
Run the new migration in the intended environment before testing the live API.
