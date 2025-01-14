import {
  MemeMade,
  Buy,
  Sell,
  GraduationReady,
  Graduation,
  PairCoinApproved,
} from '../generated/Presale/Presale';
import { MemePresale, AltPair, Vault, Account, Pair } from '../generated/schema';
import { Address, BigInt, DataSourceTemplate, log } from '@graphprotocol/graph-ts';
import {
  BIGINT_ZERO,
  BIGINT_ONE,
  ADDRESS_ZERO,
  EVENT_BUY,
  EVENT_SELL,
  EVENT_GRADUATE,
  BASE_TOKEN_SYMBOL,
  WETH_ADDRESS,
  MAGICSWAP_ROUTER,
  //EVENT_MEMEMADE,
  //DEFAULT_TOKEN_ID,
} from './constants';
import {
  getOrCreateAccount,
  createTransaction,
  COLLECTION,
  pepe_collection,
  updateMetrics
  //updateMetrics,
  //updateTransactionArrays,
} from './utils';
import { OwnershipTransferred } from '../generated/PepeUSD/ERC1155'

import { Magicswap, Swap } from '../generated/templates/Pool/Magicswap';

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  const hardcodedPresales: COLLECTION[] = [
    pepe_collection,
  ]

  
  for (let i = 0; i < hardcodedPresales.length; i++) {
    const collection = hardcodedPresales[i];

    let presale = MemePresale.load(collection.address.toLowerCase())
    if(!presale){
      presale = new MemePresale(collection.address.toLowerCase())
  
      //metadata
      presale.name = collection.name;
      presale.symbol = collection.symbol;
      presale.uri = collection.data.uri;
      presale.creator = ADDRESS_ZERO.toHexString();
  
      // Token economics
      presale.presalePrice = BIGINT_ZERO;
      presale.baseTokenRaised = BIGINT_ZERO;
      presale.targetBaseTokenToRaise = BIGINT_ZERO;
      presale.baseTokenRaised = BIGINT_ZERO;
      presale.returnForOne = BIGINT_ONE;
      presale.totalsupply = BigInt.fromString(collection.supply);
      presale.amounttolp = BIGINT_ZERO;
      presale.amounttosell = BIGINT_ZERO;
      presale.lastPrice = BigInt.fromI32(10000);
      presale.lpAddress = Address.fromString(collection.lpAddress.toLowerCase());
  
      //setup swap pool
      const vault = new Vault(collection.lpAddress.toLowerCase())
      vault.collectionId = Address.fromString(presale.id);

      vault.createdAt = event.block.timestamp;
      vault.updatedAt = event.block.timestamp;

      vault.save();

      //create Pool for Swaps | MagicSwap, can be ERC20 / vault?
      DataSourceTemplate.create('Pool', [vault.id])

      // Pair info
      presale.paircoin = Address.fromString(WETH_ADDRESS);
      presale.pairSymbol = BASE_TOKEN_SYMBOL;
      presale.isPairERC1155 = false;
  
      // Timestamps
      presale.createdAt = event.block.timestamp;
      presale.createdAtBlock = event.block.number;
      presale.updatedAt = event.block.timestamp;
      presale.updatedAtBlock = event.block.number;
      presale.graduatedAt = event.block.timestamp;
  
      // Metrics
      presale.totalBuyCount = BIGINT_ZERO;
      presale.totalSellCount = BIGINT_ZERO;
      presale.uniqueBuyerCount = BIGINT_ZERO;
      presale.uniqueSellerCount = BIGINT_ZERO;
      presale.marketCap = BIGINT_ZERO;
  
      //make featured
      presale.graduated = true;
      presale.readyToGraduate = false;
  
      presale.save();

      log.info("hardcode saved: {}", [presale.name.toString()]);
    }
  }
}

export function handleMemeMade(event: MemeMade): void {
  log.debug('Processing MemeMade event. Creator: {}, Name: {}', [
    event.transaction.from.toHexString(),
    event.params.name,
  ]);

  const presaleId = event.params.presaleinfo.memecoin.toHexString();
  let presale = new MemePresale(presaleId);

  // Basic token info
  presale.name = event.params.name;
  presale.symbol = event.params.symbol;
  presale.uri = event.params.uri;
  presale.totalsupply = event.params.amount;

  // Presale status
  presale.graduated = event.params.presaleinfo.graduated;
  presale.readyToGraduate = event.params.presaleinfo.readyToGraduate;
  presale.creator = event.transaction.from.toHexString();

  // Token economics
  presale.targetBaseTokenToRaise = event.params.presaleinfo.targetBaseTokenToRaise;
  presale.presalePrice = event.params.presaleinfo.presalePrice;
  presale.returnForOne = event.params.presaleinfo.returnForOne;
  presale.baseTokenRaised = BIGINT_ZERO;
  presale.amounttolp = event.params.presaleinfo.amounttolp;
  presale.amounttosell = event.params.presaleinfo.amounttosell;
  presale.lastPrice = event.params.presaleinfo.presalePrice;

  // Pair info
  presale.paircoin = event.params.presaleinfo.paircoin;
  presale.pairSymbol =
    event.params.presaleinfo.paircoin == ADDRESS_ZERO ? BASE_TOKEN_SYMBOL : 'UNKNOWN';
  presale.isPairERC1155 = event.params.presaleinfo.paircoin != ADDRESS_ZERO;

  // Metrics
  presale.totalBuyCount = BIGINT_ZERO;
  presale.totalSellCount = BIGINT_ZERO;
  presale.uniqueBuyerCount = BIGINT_ZERO;
  presale.uniqueSellerCount = BIGINT_ZERO;
  presale.marketCap = BIGINT_ZERO;

  // Timestamps
  presale.createdAt = event.block.timestamp;
  presale.updatedAt = event.block.timestamp;
  presale.createdAtBlock = event.block.number;
  presale.updatedAtBlock = event.block.number;

  presale.save();

  // Create or update creator account
  let creatorAccount = getOrCreateAccount(event.transaction.from);
  creatorAccount.save();

  log.info('MemeMade event processed successfully. Presale ID: {}', [presaleId]);
}

export function handleBuy(event: Buy): void {
  log.debug('Processing Buy event. Buyer: {}, MemeCoin: {}, Amount: {}', [
    event.params.buyer.toHexString(),
    event.params.memeCoinAddress.toHexString(),
    event.params.amountNFT.toString(),
  ]);

  const presaleId = event.params.memeCoinAddress.toHexString();
  let presale = MemePresale.load(presaleId);
  if (!presale) {
    log.error('Presale not found in Buy event: {}', [presaleId]);
    return;
  }

  let account = getOrCreateAccount(event.params.buyer);

  // Update presale metrics
  presale.baseTokenRaised = presale.baseTokenRaised.plus(event.params.amountBaseToken);
  presale.totalBuyCount = presale.totalBuyCount.plus(BIGINT_ONE);

  // Check for unique buyer
  if (!presale.creator.includes(event.params.buyer.toHexString())) {
    let buyTransactions = account.buyTransactions;
    if (!buyTransactions.includes(presaleId)) {
      presale.uniqueBuyerCount = presale.uniqueBuyerCount.plus(BIGINT_ONE);
    }
  }

  let accountId = event.params.buyer

  // Create transaction
  createTransaction(
    event,
    EVENT_BUY,
    event.params.buyer,
    event.params.memeCoinAddress,
    event.params.amountNFT,
    event.params.amountBaseToken,
    presaleId,
    accountId
  );

  presale.save();

  updateMetrics(presale, event);
}

export function handleSell(event: Sell): void {
  log.debug('Processing Sell event. Seller: {}, Amount: {}', [
    event.params.seller.toHexString(),
    event.params.amountNFT.toString(),
  ]);

  const presaleId = event.params.memeCoinAddress.toHexString();
  let presale = MemePresale.load(presaleId);
  if (!presale) {
    log.error('Presale not found in Sell event: {}', [presaleId]);
    return;
  }

  let account = getOrCreateAccount(event.params.seller);

  // Update presale metrics
  presale.baseTokenRaised = presale.baseTokenRaised.minus(event.params.amountBaseToken);
  presale.totalSellCount = presale.totalSellCount.plus(BIGINT_ONE);

  // Check for unique seller
  let sellTransactions = account.sellTransactions;
  if (!sellTransactions.includes(presaleId)) {
    presale.uniqueSellerCount = presale.uniqueSellerCount.plus(BIGINT_ONE);
  }
  let accountId = event.params.seller

  // Create transaction
  createTransaction(
    event,
    EVENT_SELL,
    event.params.seller,
    event.address,
    event.params.amountNFT,
    event.params.amountBaseToken,
    presaleId,
    accountId
  );

  presale.save();
  updateMetrics(presale, event);
}

export function handleGraduationReady(event: GraduationReady): void {
  const presaleId = event.params.memeCoinAddress.toHexString();
  log.debug('Looking for presale with ID: {}', [presaleId]);

  let presale = MemePresale.load(presaleId);
  if (!presale) {
    log.error('Presale not found in GraduationReady event: {}', [presaleId]);
    return;
  }

  presale.readyToGraduate = true;
  presale.updatedAt = event.block.timestamp;
  presale.updatedAtBlock = event.block.number;
  presale.save();

  log.info('GraduationReady event processed. Presale: {}', [presaleId]);
}

export function handleGraduation(event: Graduation): void {
  const presaleId = event.params.presaleinfo.memecoin.toHexString()//event.address.toHexString();
  
  let presale = MemePresale.load(presaleId);
  if (!presale) {
    log.error('Presale not found in Graduation event: {}', [presaleId]);
    return;
  }

  //@TODO: create Template on lpAddress
  const lpAddress = event.params.lpaddress

  presale.graduated = true;
  presale.lpAddress = lpAddress;

  presale.updatedAt = event.block.timestamp;
  presale.updatedAtBlock = event.block.number;
  presale.graduatedAt = event.block.timestamp;

  const vault = new Vault(lpAddress.toHexString())
  vault.collectionId = Address.fromString(presale.id);

  vault.createdAt = event.block.timestamp;
  vault.updatedAt = event.block.timestamp;

  vault.save();

  //create Pool for Swaps | MagicSwap, can be ERC20 / vault?
  DataSourceTemplate.create('Pool', [vault.id])

  const accountId = event.transaction.from
  // Create graduation transaction
  createTransaction(
    event,
    EVENT_GRADUATE,
    event.transaction.from,
    event.params.lpaddress,
    BIGINT_ZERO,
    BIGINT_ZERO,
    presaleId,
    accountId
  );

  presale.save();
  log.info('Graduation event processed. Account: {} Presale: {}, LP: {}', [
    accountId.toHexString(),
    presaleId,
    event.params.lpaddress.toHexString(),
  ]);
}

export function handlePairCoinApproved(event: PairCoinApproved): void {
  log.info('Processing PairCoinApproved event. Collection: {}', [
    event.params._collectionAddress.toHexString(),
  ]);

  const pairId = event.params._collectionAddress.toHexString();
  let pair = new AltPair(pairId);

  pair.lpAddress = event.params.alt.lpaddress;
  pair.vaultAddress = event.params.alt.vaultaddress;
  pair.tokenId = event.params.alt.tokenid;
  pair.symbol = event.params.alt.symbol;
  pair.approved = event.params.alt.approved;
  pair.isERC1155 = true;
  pair.baseTokenValue = BIGINT_ZERO;
  pair.createdAt = event.block.timestamp;
  pair.updatedAt = event.block.timestamp;

  pair.save();
}

export function handleSwap(event: Swap): void {
  const params = event.params
  const vaultAddress = event.address
  
  log.info("vault: {}, sender: {}, to: {}", [vaultAddress.toHexString(), params.sender.toHexString(), params.to.toHexString()])


  const vault = Vault.load(vaultAddress.toHexString())
  if(!vault){
    log.error("Failed to find vault connected to transfer. Vault: {}", [vaultAddress.toHexString()])
    return
  }
  const pair = Pair.load(vaultAddress)
  if (!pair) {
    log.error("Error swapping unknown Pair: {}", [event.address.toHexString()]);
    return;
  }
  
  // Determine if the transaction is a BUY or SELL
  let type: string;
  let tokenAmount: BigInt;
  let baseAmount: BigInt;

  if(pair.token0.equals(Address.fromString(WETH_ADDRESS))){
    if (params.amount0In.gt(BigInt.fromI32(0))) {
      type = "BUY";
      tokenAmount = params.amount1Out
      baseAmount = params.amount0In

    } else {
      type = "SELL";
      tokenAmount = params.amount1In
      baseAmount = params.amount0Out
    }
  } else {
    if (params.amount0In.gt(BigInt.fromI32(0))) {
      type = "SELL";
      tokenAmount = params.amount0In
      baseAmount = params.amount1Out
    } else {
      type = "BUY";
      tokenAmount = params.amount1In
      baseAmount = params.amount0Out
    }
  }
  
  let accountId: string 
  if (!params.to.equals(Address.fromString(MAGICSWAP_ROUTER))) {
    accountId = getOrCreateAccount(params.to).id;
  } else if (!params.sender.equals(Address.fromString(MAGICSWAP_ROUTER))) {
    accountId = getOrCreateAccount(params.sender).id;
  } else {
    accountId = getOrCreateAccount(event.transaction.from).id;
  }

  let account = Account.load(accountId)
  if(!account) {
    log.error("Account {} not found, unable to create tx and token holdings", [accountId])
    return
  }

  const memecoin = MemePresale.load(vault.collectionId.toHexString())
  if(!memecoin) {
    log.error("failed to find memecoin: {}", [vault.collectionId.toHexString()])
    return
  }

  createTransaction(
    event, type,
    type === "BUY"  ? Address.fromString(MAGICSWAP_ROUTER) : Address.fromString(accountId),
    type === "BUY"  ? Address.fromString(accountId) : Address.fromString(MAGICSWAP_ROUTER),
    tokenAmount.div(BigInt.fromI32(10).pow(18)), //token amount
    baseAmount, //base token amount
    vault.collectionId.toHexString(),
    Address.fromString(accountId) // account ID
  )


  log.info('Pool swap inputs/outputs: \n0IN: {} 0OUT: {}\n1IN: {} 1OUT: {}', [
    event.params.amount0In.toString(), 
    event.params.amount0Out.toString(), 
    event.params.amount1In.toString(), 
    event.params.amount1Out.toString()
  ])

  log.debug('Pool swap event processed. TXID: {} Pool: {} SENDER: {} TO: {}', [
    event.transaction.hash.toHexString(),
    vaultAddress.toHexString(),
    event.params.sender.toHexString(),
    event.params.to.toHexString()
  ]);


  const presale = MemePresale.load(vault.collectionId.toHexString());
  if(!presale) {
    log.error("Failed to find MemePresale {}", [vault.collectionId.toHexString()])
    return
  }

  // Update metrics
  log.info("updating metrics for {} - tokens: {} - base token: {}", [presale.name, tokenAmount.toString(), baseAmount.toString()])
  updateMetrics(presale, event);
  log.info("Saved presale with updated marketCap: {}", [presale.marketCap.toString()]);

}