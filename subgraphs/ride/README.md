# ride-nft-subgraph

This subgraph indexes Ride meme token presales on Sepolia. It tracks presale events, transactions, and alt pair approvals.

## Environment Variables

derived from .env.example

```bash
ALCHEMY_DEPLOY_KEY=your_key_here
SUBGRAPH_NAME_SEPOLIA=ride-dex-sepolia
SUBGRAPH_NAME_MAINNET=ride-dex
VERSION_LABEL=0.0.0
```

## Deploying

```bash
npm i
npm run deploy:[network]
```
