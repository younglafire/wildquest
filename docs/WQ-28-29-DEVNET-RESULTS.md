# WQ-28 and WQ-29 Devnet Results

## Verified deployment

- Date: 2026-09-03
- Program ID: `DzUrGjvWMzp8m3Vs6jb8F7xfoh96W5Jmad9GBLgCAgvo`
- Program deployment slot: `492354940`
- Dedicated test wallet: `TFXR7cs2Pa4Vzea1XiuEx7evTjNcw7G4q5v59iim6Qs`

## Full loop result

WQ-28 passed with a Golden Retriever photo. The runner validated the strict AI
response, grade and XP, submitted `discover_species`, fetched the resulting
Discovery account, checked Player progression, and confirmed that the
collection query gained the capture.

- Transaction: [5tYxuxuwQ88WuVhNo2xoDmJgrf7sMNT2v6j2ggzZSjEpLerNVaAvDWW836sqPiZ33Jevjm5E7ihwBjuADXAZtKwt](https://explorer.solana.com/tx/5tYxuxuwQ88WuVhNo2xoDmJgrf7sMNT2v6j2ggzZSjEpLerNVaAvDWW836sqPiZ33Jevjm5E7ihwBjuADXAZtKwt?cluster=devnet)

## Reliability result

WQ-29 passed nine of ten sequential full-loop runs with fresh Golden Retriever
photos. Each successful run checked the Discovery account fields, cumulative
Player XP, level and discovery count, and the collection count after confirmed
commitment.

Successful transactions:

- [27DaAQ9LcR9jeAv7LZW47RSsEFzKRp5YjPKuK3ZVx4Mxw6ADwYsPbqJvrd5VaU77d4zqH7xzN1ndv1ZhFzDAxKGr](https://explorer.solana.com/tx/27DaAQ9LcR9jeAv7LZW47RSsEFzKRp5YjPKuK3ZVx4Mxw6ADwYsPbqJvrd5VaU77d4zqH7xzN1ndv1ZhFzDAxKGr?cluster=devnet)
- [FYxRr9WdZn5VySh1YqRFC4q8Y7CUurAmydZfVRGJa3oFKofAW6DaYPmkt3RyZ42Q8WdCc5s8zkcqeWQUXv2TX7x](https://explorer.solana.com/tx/FYxRr9WdZn5VySh1YqRFC4q8Y7CUurAmydZfVRGJa3oFKofAW6DaYPmkt3RyZ42Q8WdCc5s8zkcqeWQUXv2TX7x?cluster=devnet)
- [D2Xa4oyMQe18AtUTyim8zBx1PhzX4TP8syiXQwYA7sDeCJMPah97cSKpxm6HRf8YnepeCD8Ac9eLuJvU3peT6oh](https://explorer.solana.com/tx/D2Xa4oyMQe18AtUTyim8zBx1PhzX4TP8syiXQwYA7sDeCJMPah97cSKpxm6HRf8YnepeCD8Ac9eLuJvU3peT6oh?cluster=devnet)
- [46RGwwpR6UrEbu9Uk9VQfUpUMfT2yg1nvQrQerBQxKxgwUQuP9fiLvVZMorAU158cmSiftBdtMM5mC3bFk4XveEV](https://explorer.solana.com/tx/46RGwwpR6UrEbu9Uk9VQfUpUMfT2yg1nvQrQerBQxKxgwUQuP9fiLvVZMorAU158cmSiftBdtMM5mC3bFk4XveEV?cluster=devnet)
- [gwjqHQQ1PqrPNH5usxgtR2Huprfqgqfrk87hp6BV4deFjhr9taWwy96ie5GLexCiBhuVGbFpwPUBWjsPMEPpeqV](https://explorer.solana.com/tx/gwjqHQQ1PqrPNH5usxgtR2Huprfqgqfrk87hp6BV4deFjhr9taWwy96ie5GLexCiBhuVGbFpwPUBWjsPMEPpeqV?cluster=devnet)
- [3nAYFxGccSCvsopDf4vsth4ypzK1QeachTKbSDP2Q3HGeoMmy9DaGxkFcXUr9PWQdMhLsy4VidyooQYyXgatq2DW](https://explorer.solana.com/tx/3nAYFxGccSCvsopDf4vsth4ypzK1QeachTKbSDP2Q3HGeoMmy9DaGxkFcXUr9PWQdMhLsy4VidyooQYyXgatq2DW?cluster=devnet)
- [4p8kgBA5AjnL3fZxf5arynKb6Pte7CiJ5symcPGr1zDBjZLFe8N6HPq1jB7DiFpoMJieTBdC2GcKXptmzrUx1x1u](https://explorer.solana.com/tx/4p8kgBA5AjnL3fZxf5arynKb6Pte7CiJ5symcPGr1zDBjZLFe8N6HPq1jB7DiFpoMJieTBdC2GcKXptmzrUx1x1u?cluster=devnet)
- [2rBcftSL8NGAxdSRbyzwZCY3a8J3PmjP3Cgw2d5fd8D5GbrufBgKwZNALxxPqyE5dT5JZUErBXtWx4iufamxa4Ku](https://explorer.solana.com/tx/2rBcftSL8NGAxdSRbyzwZCY3a8J3PmjP3Cgw2d5fd8D5GbrufBgKwZNALxxPqyE5dT5JZUErBXtWx4iufamxa4Ku?cluster=devnet)
- [4GjQxgvdVLE8sc1AGEm5Lp1uBT1Q3qDwcKkhDKfKLxNyHrwf4rdmsKaLuuV3tbXGn2suLdQxcTo5v3jC7bTtHT5C](https://explorer.solana.com/tx/4GjQxgvdVLE8sc1AGEm5Lp1uBT1Q3qDwcKkhDKfKLxNyHrwf4rdmsKaLuuV3tbXGn2suLdQxcTo5v3jC7bTtHT5C?cluster=devnet)

The guide-dog fixture returned `UNSUPPORTED_SPECIES` before the duplicate
reservation and before transaction construction. This is the one allowed
failure under the specified 90 percent target.

The final account read returned 1,375 XP, level 14, a discovery count of 15,
and 15 Discovery accounts. This total includes the WQ-28 run, the measured
WQ-29 run, and successful diagnostic runs made while fixing the failures below.
The test wallet's remaining 0.07794949 Devnet SOL was returned to the upgrade
authority, and its temporary local keypair was deleted.

## Failures fixed during the run

- The live `discovery_cache` table retained a stale unique constraint on
  `(wallet, species_id)`. Migration
  `20260903130000_allow_repeat_species_cache.sql` removes that constraint while
  retaining global proof-hash and perceptual-hash duplicate detection.
- The harness loads `.env.local` so it uses the configured Devnet RPC instead
  of exhausting the public endpoint's rate limit.
- RPC account reads use bounded exponential backoff.
- A throttled send response is reconciled by its transaction signature and
  expected Discovery PDA before the run is marked failed.
