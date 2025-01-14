import { log } from "matchstick-as";
import { Pair } from "../../generated/schema";
import { PairCreated } from "../../generated/UniswapFactory/UniswapFactory";

export function handlePairCreated(event: PairCreated): void {

    const pair = new Pair(event.params.pair)
    pair.token0 = event.params.token0
    pair.token1 = event.params.token1

    pair.totalSupply = event.params.param3

    pair.vault = event.address.toHexString()
    pair.save()

    log.info("pair saved from: {}, pair: {}, token0: {}, token1: {}", [event.address.toHexString(), pair.id.toHexString(), pair.token0.toHexString(), pair.token1.toHexString()]);
}

/*
pair saved from: 0x77fa938998e196701c324149f771efd6e980df0a
pair: 0xe74b9169142322e286e197e9fee1bc5166db0110 //vault
token0: 0x331b4584bbfef59bf0d8b756f37b62af1f09dfa3 //erc20
token1: 0x4200000000000000000000000000000000000006 //weth

pair saved from: 0x77fa938998e196701c324149f771efd6e980df0a
pair: 0x9c3cf352a83c35d5775c665a403f9bb0a3decd14 //vault
token0: 0x4200000000000000000000000000000000000006 //weth
token1: 0x54e156f837509e6f169bfcba2e0034a95cb8dd15 //erc20

vault: 0xe74b9169142322e286e197e9fee1bc5166db0110 //vault
sender: 0xb740d5804ea2061432469119cfa40cbb4586dd17 //router
to: 0x4fda5b7e6fb5532afdc813b72fba8c9775b24ea1 //receiver

vault: 0xe74b9169142322e286e197e9fee1bc5166db0110 //vault
sender: 0xb740d5804ea2061432469119cfa40cbb4586dd17 //router
to: 0x47c3b02cdfad3d0d1f135339c7065e182a27b24f //receiver

vault: 0xe74b9169142322e286e197e9fee1bc5166db0110 //vault
sender: 0xb740d5804ea2061432469119cfa40cbb4586dd17 //router
to: 0x4bb55bd1bc535a9b4ac6f6cb8435f7e107a67492
*/