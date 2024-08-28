# treasure-subgraphs

Collection of subgraphs used by [Treasure](https://treasure.lol) to power its various projects' data needs.

## Subgraphs

### bridgeworld

General inventory, metadata, and feature support for [Bridgeworld](https://bridgeworld.treasure.lol)

### bridgeworld-approvals (deprecated)

Approvals of NFTs and tokens related to [Bridgeworld](https://bridgeworld.treasure.lol)

### bridgeworld-corruption

Corruption balances and removals for [Bridgeworld](https://bridgeworld.treasure.lol)

### bridgeworld-kote (deprecated)

[Knights of the Ether](https://knightsoftheether.com) metadata for Harvesters in [Bridgeworld](https://bridgeworld.treasure.lol)

### bridgeworld-recruits

[Bridgeworld](https://bridgeworld.treasure.lol) Recruit ascension configuration and attempts

### governance-staking

Tracking MAGIC deposited for [TreasureDAO Governance Staking](https://governance-staking.treasure.lol) (gMAGIC)

### magicswap

Exchange data for [Magicswap](https://magicswap.lol)

### smol

Data for SMOL Admin and [Transmolgrifier](https://smolverse.lol/transmolgrify)

## Local Development

Check out the repo and install dependencies in the root folder:

```sh
npm install
```

Navigate to a specific subgraph and run code generation:

```sh
cd subgraphs/bridgeworld
npm run generate:dev
```

Run unit tests:

```sh
npm test
```

## Deployment

### Development

Create a PR pointing to the `master` branch and run the [Deploy workflow](https://github.com/TreasureProject/treasure-subgraphs/actions/workflows/deploy.yaml) against the Development environment with the subgraph and branch on which you made your changes.

### Production

Merge your PR to the `master` branch and run the [Deploy workflow](https://github.com/TreasureProject/treasure-subgraphs/actions/workflows/deploy.yaml) with the Production environment and the subgraph to build selected.
