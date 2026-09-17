# WildQuest Battle Vertical Slice

## The demo proves one loop

The five-day build has one player journey:

1. A wallet scans one supported animal.
2. The server identifies one exact catalogue entry and prepares an authorized capture transaction.
3. The wallet signs and creates one Creature for that catalogue ID.
4. The wallet selects three distinct owned Creatures in an ordered team.
5. A second wallet joins the open Match with another ordered team.
6. Both players choose Strike, Guard, or Recharge during each five-second turn.
7. The authoritative server resolves both choices simultaneously and commits the result onchain.
8. The winner signs once to claim the fixed Devnet SOL pot; a draw refunds both stakes.

The demo uses the deployed Devnet program ID
`3WwKscJzw5CapS5Y1Pq2ebjdGxfCEcVs6Z6dJNuxVzqF`.

## The 90-second demo script

- **0 to 10 seconds:** Connect Wallet A. Explain the premise: scan a real animal, own its game Creature, and battle another wallet.
- **10 to 25 seconds:** Upload a Golden Retriever photo from the mobile capture screen. Show the exact model label and catalogue name.
- **25 to 35 seconds:** Select Capture Creature. Wallet A signs a transaction that is already co-signed by the server capture authority.
- **35 to 45 seconds:** Open the collection. Show the Golden Retriever once and explain that its PDA prevents another Golden Retriever for Wallet A.
- **45 to 58 seconds:** Select three owned Creatures in order and open a Match. Wallet A deposits exactly 0.01 Devnet SOL.
- **58 to 70 seconds:** Switch to prefunded Wallet B, select its three Creatures, and join with 0.01 Devnet SOL.
- **70 to 82 seconds:** Replay the deterministic result with HP and Shield bars. The winner signs to claim 0.02 SOL; a tie already refunded both players.
- **82 to 90 seconds:** Open the exact claim transaction on Devnet Explorer and show the final Match and Creature accounts.

The two demo wallets receive their other roster members through a setup script that invokes the real instruction handlers. The setup script does not inject fabricated account data.

## The 40-creature roster is fixed

Every V1 stat uses an unsigned integer. The canonical IDs, ImageNet classes,
and stats live in `programs/wildquest/src/constants.rs`; the matching names,
facts, roles, and artwork live in the Supabase migrations.

- **Catalogue 1001, Chihuahua:** ImageNet class `151`, HP `80`, Attack `55`, Defense `35`, Speed `95`, Shield `35`.
- **Catalogue 1002, Golden Retriever:** ImageNet class `207`, HP `115`, Attack `60`, Defense `55`, Speed `45`, Shield `25`.
- **Catalogue 1003, German Shepherd:** ImageNet class `235`, HP `100`, Attack `72`, Defense `55`, Speed `55`, Shield `18`.
- **Catalogue 1004, Tabby Cat:** ImageNet class `281`, HP `90`, Attack `60`, Defense `40`, Speed `80`, Shield `30`.
- **Catalogue 1005, Persian Cat:** ImageNet class `283`, HP `105`, Attack `55`, Defense `60`, Speed `35`, Shield `45`.
- **Catalogue 1006, Monarch Butterfly:** ImageNet class `323`, HP `75`, Attack `55`, Defense `35`, Speed `100`, Shield `35`.

Catalogue IDs `1001` through `1040` cover 40 exact ImageNet classes. All 40
SpeciesConfig accounts use `balance_version = 1`. Simultaneous turns use
`rules_version = 2`. The numeric catalogue ID crosses the API and Solana
boundary. Each slug remains offchain display and lookup data.

## Combat is deterministic

- A team contains three distinct Creature accounts owned by the same wallet.
- Team order is visible before the second wallet joins.
- Each turn lasts five seconds and both choices resolve from the same pre-turn state.
- Strike costs 2 Mana and deals `max(1, floor((Attack + floor(Speed / 5)) * 100 / (100 + Defense)))` damage.
- Guard costs 1 Mana and reduces incoming damage by that Creature's Shield stat for the turn.
- Recharge restores 3 Mana up to the maximum of 5. It never restores HP or Shield.
- An unusable, invalid, or missing choice becomes Recharge.
- Three consecutive missed choices forfeit the Match.
- A Creature at zero HP is knocked out and the next team slot enters.
- The first team with no living Creature loses.
- Simultaneous final knockouts produce a draw.
- Combat stops after 30 turns. Remaining HP percentage breaks the tie, then total Mana; an exact tie is a draw.

The same teams, order, choices, balance version, and rules version always produce the same result. Combat has no random numbers, critical hits, dodges, or hidden modifiers.

## The stake has one safe prototype path

- Each player stakes exactly `10_000_000` lamports, displayed as 0.01 SOL.
- The Match account records the stake in lamports.
- A winner result becomes `Claimable`; only the recorded winner may sign to receive `20_000_000` lamports.
- A tie refunds `10_000_000` lamports to each player.
- The creator may cancel an open Match before another wallet joins and receives the full stake back.
- The program uses checked arithmetic and verifies lamport conservation on settlement.

The five-day build stays on Devnet. It makes no mainnet or real-money safety claim.

## The hard cut list stays outside five days

- A roster larger than 40 creatures
- Model training or broad breed recognition
- Commit-reveal teams
- Matchmaking, lobby indexing, ratings, and leaderboards
- Platform fees and treasury accounting
- Mainnet deployment or a real-value launch
- Upgrades, levels, items, breeding, abilities, and elemental types
- Internal currency, shops, and rewards unrelated to the stake
- Quizzes, capture grades, XP, badges, and quest rewards in battle calculations
- Creature trading, NFTs, and marketplaces
- Battle audio and deep profile screens
- Geographic maps and location verification

Player XP and the incremental Quest and QuestCompletion accounts remain
separate from battle calculations. The first-battle quest reads a Match account
only to verify participation; battle damage and settlement do not read XP,
level, grade, rarity, quest, or badge fields.

## The architecture contract is separate from presentation

[PK-VERTICAL-SLICE-ARCHITECTURE.md](PK-VERTICAL-SLICE-ARCHITECTURE.md) fixes the API, signer, PDA, and account contracts. [PK-VERTICAL-SLICE-BASELINE.md](PK-VERTICAL-SLICE-BASELINE.md) records the Day 1 build and program identity checks.
