# Vertical Slice Day 4 Matches

## Battle rules

`resolve_battle()` is a pure integer function shared by every Match. It applies
the version-one rules from `PK-V1-RULES.md`: speed order, simultaneous equal-
speed attacks, shield-first damage, a minimum of one damage, sequential team
slots, and the 50-round remaining-power comparison.

The Match creator cannot provide a battle result. `join_match()` loads all six
SpeciesConfig accounts and computes the winner inside the program.

## Match lifecycle

`open_match()` derives the Match PDA from the Match seed, creator address, and
little-endian Match ID. It checks three distinct version-one Creature accounts
owned by the creator and transfers exactly 10,000,000 lamports into the Match
account.

`join_match()` requires a different opponent wallet and three distinct
Creature accounts owned by that wallet. The instruction deposits the second
stake, resolves combat, records both ordered teams, and settles in one atomic
transaction:

- the winner receives 20,000,000 lamports;
- a tie refunds 10,000,000 lamports to each wallet;
- the Match account retains only its rent after settlement.

`cancel_match()` accepts only the creator of an Open Match. It refunds the
creator stake and records the Cancelled status. Settled and Cancelled matches
cannot be joined, settled, or refunded again.

## Join account order

The generated `join_match` instruction contains four fixed accounts: opponent,
creator, GameConfig, and Match. The client must append these 13 read-only
remaining accounts in this exact order:

1. Three creator Creature accounts in the stored team order.
2. Three opponent Creature accounts in the selected team order.
3. Three creator SpeciesConfig accounts in matching order.
4. Three opponent SpeciesConfig accounts in matching order.
5. The System Program.

The program validates each account owner, discriminator, PDA, catalogue ID,
balance version, team owner, and position before accepting the second stake.
Keeping these read-only accounts outside Anchor's fixed account struct also
keeps the generated account parser below Solana's stack limit.

## Verification

Rust unit tests cover speed priority, simultaneous attacks, shield absorption,
minimum damage, and the 50-round ratio rule. LiteSVM creates GameConfig,
SpeciesConfig, Creature, and Match state only through instruction handlers.
The tests cover winner payout, tie refunds, invalid teams, foreign Creature
accounts, replay rejection, creator-only cancellation, and escrow returning to
the Match account's rent balance.
