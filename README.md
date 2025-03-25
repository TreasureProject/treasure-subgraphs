# treasure-subgraphs

Collection of subgraphs used by [Treasure](https://treasure.lol) to power its various projects' data needs.

## Subgraphs

### bridgeworld (deprecated)

General inventory, metadata, and feature support for [Bridgeworld](https://bridgeworld.treasure.lol)

### bridgeworld-approvals (deprecated)

Approvals of NFTs and tokens related to [Bridgeworld](https://bridgeworld.treasure.lol)

### bridgeworld-corruption (deprecated)

Corruption balances and removals for [Bridgeworld](https://bridgeworld.treasure.lol)

### bridgeworld-kote (deprecated)

[Knights of the Ether](https://knightsoftheether.com) metadata for Harvesters in [Bridgeworld](https://bridgeworld.treasure.lol)

### bridgeworld-recruits (deprecated)

[Bridgeworld](https://bridgeworld.treasure.lol) Recruit ascension configuration and attempts

### governance-staking

Tracking MAGIC deposited for [TreasureDAO Governance Staking](https://governance-staking.treasure.lol) (gMAGIC)

### magicswap (deprecated)

Exchange data for [Magicswap](https://magicswap.lol)

### ride

Exchange data for [Ride](https://ride.wtf)

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

- Create a PR pointing to the `master` branch
- Run the [Deploy workflow](https://github.com/TreasureProject/treasure-subgraphs/actions/workflows/deploy.yaml) with the following config options:
  - `Environment`: Development
  - `Subgraph`: Name of the subgraph to build, from the list above
  - `Custom subgraph name` (optional): Custom value to override the name of the subgraph deployed to the remote environment. Defaults to `<subgraph>-dev` for Arbitrum Sepolia and `<subgraph>-<chain>-dev` for others.
  - `Subgraph version`: Version number in semvar notation (`vX.X.X`) not already used in the remote environment.
- If deploying to Goldsky, log into the dashboard and create a `live` tag on the new version once it's synced.

### Production

- Merge your PR to the `master` branch
- Run the [Deploy workflow](https://github.com/TreasureProject/treasure-subgraphs/actions/workflows/deploy.yaml) with the following config options:
  - `Environment`: Production
  - `Subgraph`: Name of the subgraph to build, from the list above
  - `Custom subgraph name` (optional): Custom value to override the name of the subgraph deployed to the remote environment. Defaults to `<subgraph>` for Arbitrum Sepolia and `<subgraph>-<chain>` for others.
  - `Subgraph version`: Version number in semvar notation (`vX.X.X`) not already used in the remote environment.
- If deploying to Goldsky, log into the dashboard and create a `live` tag on the new version once it's synced.
