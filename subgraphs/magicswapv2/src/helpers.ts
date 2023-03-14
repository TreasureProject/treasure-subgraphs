import { Address, BigInt, log } from "@graphprotocol/graph-ts";

import { ERC20 } from "../generated/UniswapV2Factory/ERC20";
import { Collection, NftVault, Token } from "../generated/schema";
import { ZERO_BD, ZERO_BI } from "./const";
import { exponentToBigDecimal } from "./utils";

export const NFT_TYPES = ["ERC721", "ERC1155"];

export const getOrCreateCollection = (
  address: Address,
  typeIndex: i32
): Collection => {
  let collection = Collection.load(address);
  if (!collection) {
    collection = new Collection(address);
    collection.type = NFT_TYPES[typeIndex];
    collection.save();
  }

  return collection;
};

export const getOrCreateToken = (address: Address): Token => {
  let token = Token.load(address);
  if (!token) {
    token = new Token(address);

    const nftVault = NftVault.load(address);
    if (nftVault) {
      token.nftVault = nftVault.id;
    }

    const contract = ERC20.bind(address);

    const totalSupplyResult = contract.try_totalSupply();
    if (totalSupplyResult.reverted) {
      log.error("Error reading token total supply: {}", [
        address.toHexString(),
      ]);
      token.totalSupply = ZERO_BI;
    } else {
      token.totalSupply = totalSupplyResult.value;
    }

    const decimalsResult = contract.try_decimals();
    if (decimalsResult.reverted) {
      log.error("Error reading token decimals: {}", [address.toHexString()]);
      token.decimals = ZERO_BI;
      token.decimalDivisor = ZERO_BD;
    } else {
      token.decimals = BigInt.fromI32(decimalsResult.value);
      token.decimalDivisor = exponentToBigDecimal(token.decimals);
    }

    token.save();
  }

  return token;
};
