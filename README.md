# treasure-subgraphs

Collection of subgraphs used by [Treasure](https://treasure.lol) to power its various projects' data needs.

## Subgraphs

### bridgeworld

General inventory, metadata, and legacy feature support for [Bridgeworld](https://bridgeworld.treasure.lol)

### bridgeworld-approvals

Approvals of NFTs and tokens related to [Bridgeworld](https://bridgeworld.treasure.lol)

### bridgeworld-recruits

[Bridgeworld](https://bridgeworld.treasure.lol) Recruit ascension configuration and attempts

### magic-stats

Time interval-based stats on interactions with the [MAGIC token](https://docs.treasure.lol/getting-started/what-is-magic)

### magicswap-exchange

Fork of [Sushiswap subgraph](https://github.com/sushiswap/subgraphs) for [MagicSwap](https://magicswap.lol)

### migration

L1 to L2 migration of Treasure NFTs

### smol-racing

Gameplay data forh [Smol Racing](https://www.smolverse.lol/racing)

### smolidays

Gameplay data for [Smolidays](https://smolidays.smolverse.lol)

### smoloween

Gameplay data for [Smoloween](https://smoloween.smolverse.lol)

### smolverse

General inventory, metadata, and legacy feature support for [Smolverse](https://smolverse.lol)

### smolverse-inventory

Ownership and staking status for [Smolverse](https://smolverse.lol) NFTs

## Local Development

Check out the repo and install dependencies in the root folder:

```
yarn install
```

Navigate to a specific subgraph and run code generation:

```
cd subgraphs/bridgeworld
yarn prepare:dev
yarn codegen
```

Run unit tests:

```
yarn test
```

## Deployment

### Development

Create a PR pointing to the `master` branch and run the [Deploy workflow](https://github.com/TreasureProject/treasure-subgraphs/actions/workflows/deploy.yaml) against the Development environment with the subgraph and branch on which you made your changes.

### Production

Merge your PR to the `master` branch and run the [Deploy workflow](https://github.com/TreasureProject/treasure-subgraphs/actions/workflows/deploy.yaml) with the Production environment and the subgraph to build selected.
