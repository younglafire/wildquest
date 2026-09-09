# WildQuest PK Vertical Slice — Day 5

## Demo loop

1. Connect demo wallet A on Devnet.
2. Capture an enabled animal and approve **Own this Creature**. The API supplies
   a capture-authority signature; the wallet remains the fee payer and owner.
3. Open **Battle**, choose three different owned Creatures in slot order, and
   create a match with the fixed 0.01 SOL stake.
4. Connect demo wallet B, choose its three-Creature team, and join the open
   match with the same stake.
5. The join instruction resolves the deterministic battle and pays the winner
   or refunds both players on a tie in the same transaction.
6. Show the confirmed result and exact Devnet Explorer transaction.

## One-time Devnet setup

```bash
npm run setup:pk-demo
```

The setup is idempotent. It initializes the GameConfig PDA account, the six
versioned SpeciesConfig PDA accounts, and six demo Creature accounts for each
of two ignored local demo keypairs.

## Reliability run

```bash
npm run test:pk-devnet -- --runs 10
```

The runner creates and settles ten unique matches using two pre-funded wallets.
It fails unless at least 9 of 10 matches settle successfully.

On 2026-09-09 the deployed program passed **10/10** consecutive matches, then
passed a further **2/2** run with explicit winner-credit and loser-debit balance
assertions. The real ResNet endpoint also returned a valid capture-authorized
Monarch Butterfly response for catalogue ID `1006`. A fresh wallet then ran a
real Golden Retriever image through ResNet, received the two-signature capture
transaction, and created its Creature account on Devnet in transaction
`3WhEsyS3qc6sgGaZpXrdhRP7ArFsyJjMKHNpcfdyzCpKMU22Z89wmDKPX7ZP81kU98rjJgFwc8mnLxmVnRAb6iYq`.

## Known limitations

- Devnet SOL has no monetary value; this prototype does not support mainnet.
- The capture authority is a trusted offchain service. Production requires
  managed key custody, authentication, rate limiting, and monitoring.
- Match stake, rules, and six creature stats are frozen in the onchain
  GameConfig and SpeciesConfig accounts for this vertical slice.
- A match resolves immediately when player B joins. There are no turns,
  upgrades, items, breeding, internal currency, matchmaking service, or random
  combat.
- Open matches are globally readable. The prototype lobby polls Devnet and does
  not paginate or index historical matches.
- Local demo Creature accounts are test fixtures. Real ownership is created
  only by the capture flow and is limited to one Creature PDA account per
  wallet and catalogue ID.
- Capture authorizations use a recent blockhash. The player should approve the
  ownership transaction immediately; an explicit same-reservation reissue flow
  is a post-slice reliability improvement.
