import { Address } from "@graphprotocol/graph-ts";

import {
  BuySell,
  Graduation,
  MemeMade,
} from "../generated/Meme Presale/MemePresale";
import { MemePresale } from "../generated/schema";

const getOrCreateMemePresale = (memecoin: Address): MemePresale => {
  let memePresale = MemePresale.load(memecoin);
  if (!memePresale) {
    memePresale = new MemePresale(memecoin);
  }

  return memePresale;
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
  memePresale.totalsupply = params.presaleinfo.totalsupply;
  memePresale.graduated = params.presaleinfo.graduated;
  memePresale.pairCoin = params.presaleinfo.paircoin;

  memePresale.save();
}

export function handleBuySell(event: BuySell): void {
  const params = event.params;
  const memePresale = getOrCreateMemePresale(params.presaleinfo.memecoin);

  memePresale.updatedAtBlock = event.block.number;

  memePresale.targetMagicToRaise = params.presaleinfo.targetMagicToRaise;
  memePresale.presalePrice = params.presaleinfo.presalePrice;
  memePresale.magicRaised = params.presaleinfo.magicRaised;
  memePresale.totalsupply = params.presaleinfo.totalsupply;
  memePresale.graduated = params.presaleinfo.graduated;
  memePresale.pairCoin = params.presaleinfo.paircoin;

  memePresale.save();
}

export function handleGraduation(event: Graduation): void {
  const params = event.params;
  const memePresale = getOrCreateMemePresale(params.presaleinfo.memecoin);

  memePresale.updatedAtBlock = event.block.number;

  memePresale.targetMagicToRaise = params.presaleinfo.targetMagicToRaise;
  memePresale.presalePrice = params.presaleinfo.presalePrice;
  memePresale.magicRaised = params.presaleinfo.magicRaised;
  memePresale.totalsupply = params.presaleinfo.totalsupply;
  memePresale.graduated = params.presaleinfo.graduated;
  memePresale.pairCoin = params.presaleinfo.paircoin;

  memePresale.save();
}
