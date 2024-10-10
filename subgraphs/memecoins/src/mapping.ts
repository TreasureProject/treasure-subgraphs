import { Address } from "@graphprotocol/graph-ts";

import {
  BuySell,
  Graduation,
  MemeMade,
  PairCoinApproved,
} from "../generated/Meme Presale/MemePresale";
import { MemePresale, PairCoin } from "../generated/schema";

const getOrCreateMemePresale = (memecoin: Address): MemePresale => {
  let memePresale = MemePresale.load(memecoin);
  if (!memePresale) {
    memePresale = new MemePresale(memecoin);
  }

  return memePresale;
};

const getOrCreatePairCoin = (pairCoinAddress: Address): PairCoin => {
  let pairCoin = PairCoin.load(pairCoinAddress);
  if (!pairCoin) {
    pairCoin = new PairCoin(pairCoinAddress);
  }

  return pairCoin;
};

export function handleMemeMade(event: MemeMade): void {
  const params = event.params;
  const memePresale = getOrCreateMemePresale(params.presaleinfo.memecoin);

  memePresale.name = params.name;
  memePresale.symbol = params.symbol;
  memePresale.uri = params.uri;
  memePresale.amount = params.amount;
  memePresale.createdAtBlock = event.block.number;
  memePresale.updatedAtBlock = event.block.number;

  memePresale.targetMagicToRaise = params.presaleinfo.targetMagicToRaise;
  memePresale.presalePrice = params.presaleinfo.presalePrice;
  memePresale.magicRaised = params.presaleinfo.magicRaised;
  memePresale.totalSupply = params.presaleinfo.totalsupply;
  memePresale.graduated = params.presaleinfo.graduated;
  memePresale.pairCoin = params.presaleinfo.paircoin;
  memePresale.pairVault = params.presaleinfo.pairvault;
  memePresale.returnForOne = params.presaleinfo.returnForOne;
  memePresale.isERC1155 = params.presaleinfo.is1155;

  memePresale.save();
}

export function handleBuySell(event: BuySell): void {
  const params = event.params;
  const memePresale = getOrCreateMemePresale(params.presaleinfo.memecoin);

  memePresale.updatedAtBlock = event.block.number;

  memePresale.targetMagicToRaise = params.presaleinfo.targetMagicToRaise;
  memePresale.presalePrice = params.presaleinfo.presalePrice;
  memePresale.magicRaised = params.presaleinfo.magicRaised;
  memePresale.totalSupply = params.presaleinfo.totalsupply;
  memePresale.graduated = params.presaleinfo.graduated;
  memePresale.pairCoin = params.presaleinfo.paircoin;
  memePresale.pairVault = params.presaleinfo.pairvault;
  memePresale.returnForOne = params.presaleinfo.returnForOne;
  memePresale.isERC1155 = params.presaleinfo.is1155;

  memePresale.save();
}

export function handleGraduation(event: Graduation): void {
  const params = event.params;
  const memePresale = getOrCreateMemePresale(params.presaleinfo.memecoin);

  memePresale.updatedAtBlock = event.block.number;

  memePresale.targetMagicToRaise = params.presaleinfo.targetMagicToRaise;
  memePresale.presalePrice = params.presaleinfo.presalePrice;
  memePresale.magicRaised = params.presaleinfo.magicRaised;
  memePresale.totalSupply = params.presaleinfo.totalsupply;
  memePresale.graduated = params.presaleinfo.graduated;
  memePresale.pairCoin = params.presaleinfo.paircoin;
  memePresale.pairVault = params.presaleinfo.pairvault;
  memePresale.returnForOne = params.presaleinfo.returnForOne;
  memePresale.isERC1155 = params.presaleinfo.is1155;
  memePresale.lpAddress = params.lpaddress;

  memePresale.save();
}

export function handlePairCoinApproved(event: PairCoinApproved): void {
  const params = event.params;
  const pairCoin = getOrCreatePairCoin(params._collectionAddress);
  pairCoin.lpAddress = params.alt.lpaddress;
  pairCoin.vaultAddress = params.alt.vaultaddress;
  pairCoin.approved = params.alt.approved;
  pairCoin.symbol = params.alt.symbol;

  pairCoin.save();
}
