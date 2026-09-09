# WildQuest Battle Vertical Slice

## The demo proves one loop

The five-day build has one player journey:

1. A wallet scans one supported animal.
2. The server identifies one exact catalogue entry and prepares an authorized capture transaction.
3. The wallet signs and creates one Creature for that catalogue ID.
4. The wallet selects three distinct owned Creatures in an ordered team.
5. A second wallet joins the open Match with another ordered team.
6. The program runs deterministic combat and settles the fixed Devnet SOL stake.
7. The result screen shows both teams, the outcome, the balance change, and the Explorer transaction.

The demo uses the deployed Devnet program ID
`3WwKscJzw5CapS5Y1Pq2ebjdGxfCEcVs6Z6dJNuxVzqF`.

## The 90-second demo script

- **0 to 10 seconds:** Connect Wallet A. Explain the premise: scan a real animal, own its game Creature, and battle another wallet.
- **10 to 25 seconds:** Upload a Golden Retriever photo from the mobile capture screen. Show the exact model label and catalogue name.
- **25 to 35 seconds:** Select Capture Creature. Wallet A signs a transaction that is already co-signed by the server capture authority.
- **35 to 45 seconds:** Open the collection. Show the Golden Retriever once and explain that its PDA prevents another Golden Retriever for Wallet A.
- **45 to 58 seconds:** Select three owned Creatures in order and open a Match. Wallet A deposits exactly 0.01 Devnet SOL.
- **58 to 70 seconds:** Switch to prefunded Wallet B, select its three Creatures, and join with 0.01 Devnet SOL.
- **70 to 82 seconds:** Show the deterministic result. The winner receives 0.02 SOL, or both wallets receive refunds when the result is a tie.
- **82 to 90 seconds:** Open the exact Devnet Explorer transaction and show the final Match and Creature accounts.

The two demo wallets receive their other roster members through a setup script that invokes the real instruction handlers. The setup script does not inject fabricated account data.

## The six-creature roster is fixed

Every V1 stat uses an unsigned integer. Each creature has 300 total stat points, which makes the first comparison easy to reason about. Equal totals do not prove competitive balance.

- **Catalogue 1001, Chihuahua:** ImageNet class `151`, HP `80`, Attack `55`, Defense `35`, Speed `95`, Shield `35`.
- **Catalogue 1002, Golden Retriever:** ImageNet class `207`, HP `115`, Attack `60`, Defense `55`, Speed `45`, Shield `25`.
- **Catalogue 1003, German Shepherd:** ImageNet class `235`, HP `100`, Attack `72`, Defense `55`, Speed `55`, Shield `18`.
- **Catalogue 1004, Tabby Cat:** ImageNet class `281`, HP `90`, Attack `60`, Defense `40`, Speed `80`, Shield `30`.
- **Catalogue 1005, Persian Cat:** ImageNet class `283`, HP `105`, Attack `55`, Defense `60`, Speed `35`, Shield `45`.
- **Catalogue 1006, Monarch Butterfly:** ImageNet class `323`, HP `75`, Attack `55`, Defense `35`, Speed `100`, Shield `35`.

All six SpeciesConfig accounts use `balance_version = 1`. The first Match rules use `rules_version = 1`.

The catalogue slugs are `chihuahua`, `golden_retriever`, `german_shepherd`, `tabby_cat`, `persian_cat`, and `monarch_butterfly`. The numeric catalogue ID crosses the API and Solana boundary. The slug remains offchain display and lookup data.

## Combat is deterministic

- A team contains three distinct Creature accounts owned by the same wallet.
- Team order is visible before the second wallet joins.
- The active Creature with greater Speed attacks first.
- Equal-Speed attacks use the same pre-attack state and resolve simultaneously.
- Damage is `max(1, floor(Attack * 100 / (100 + Defense)))`.
- Shield absorbs damage before HP.
- A Creature at zero HP is knocked out and the next team slot enters.
- The first team with no living Creature loses.
- Combat stops after 50 rounds. The program compares remaining HP plus Shield as a ratio of the starting total with integer cross-multiplication.
- Equal remaining ratios produce a tie and refund both stakes.

The same teams, order, balance version, and rules version always produce the same result. Combat has no random numbers, critical hits, dodges, hidden modifiers, or client-selected outcomes.

## The stake has one safe prototype path

- Each player stakes exactly `10_000_000` lamports, displayed as 0.01 SOL.
- The Match account records the stake in lamports.
- The winner receives `20_000_000` lamports.
- A tie refunds `10_000_000` lamports to each player.
- The creator may cancel an open Match before another wallet joins and receives the full stake back.
- The program uses checked arithmetic and verifies lamport conservation on settlement.

The five-day build stays on Devnet. It makes no mainnet or real-money safety claim.

## The hard cut list stays outside five days

- A roster larger than six creatures
- Model training or broad breed recognition
- Commit-reveal teams
- Matchmaking, lobby indexing, ratings, and leaderboards
- Platform fees and treasury accounting
- Mainnet deployment or a real-value launch
- Upgrades, levels, items, breeding, abilities, and elemental types
- Internal currency, shops, and rewards unrelated to the stake
- Quizzes, quests, capture grades, XP, badges, and legacy progression in battle calculations
- Creature trading, NFTs, and marketplaces
- Battle animation, audio, and deep profile screens
- Geographic maps and location verification

The existing Player, Discovery, Quest, and QuestCompletion accounts remain readable legacy state. The vertical-slice battle handlers do not read their XP, level, grade, rarity, quest, or badge fields.

## The architecture contract is separate from presentation

[PK-VERTICAL-SLICE-ARCHITECTURE.md](PK-VERTICAL-SLICE-ARCHITECTURE.md) fixes the API, signer, PDA, and account contracts. [PK-VERTICAL-SLICE-BASELINE.md](PK-VERTICAL-SLICE-BASELINE.md) records the Day 1 build and program identity checks.
