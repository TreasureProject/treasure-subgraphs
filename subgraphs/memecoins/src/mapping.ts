import { MemeMade } from "../generated/Meme Presale/MemePresale";
import { MemePresale } from "../generated/schema";

export function handleMemeMade(event: MemeMade): void {
  const params = event.params;
  const memePresale = new MemePresale(params.presaleinfo.memecoin);

  memePresale.name = params.name;
  memePresale.symbol = params.symbol;
  memePresale.uri = params.uri;
  memePresale.amount = params.amount;
  memePresale.targetMagicToRaise = params.presaleinfo.targetMagicToRaise;
  memePresale.presalePrice = params.presaleinfo.presalePrice;
  memePresale.magicRaised = params.presaleinfo.magicRaised;
  memePresale.totalsupply = params.presaleinfo.totalsupply;
  memePresale.graduated = params.presaleinfo.graduated;

  memePresale.save();
}
