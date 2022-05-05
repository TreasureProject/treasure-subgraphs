import { BigInt, log, store } from "@graphprotocol/graph-ts";

import { LEGION_ADDRESS } from "@treasure/constants";

import {
  NoPilgrimagesToFinish,
  PilgrimagesFinished,
  PilgrimagesStarted,
} from "../../generated/Pilgrimage/Pilgrimage";
import { LegionInfo, Pilgrimage, Token } from "../../generated/schema";
import { LEGION_IPFS, LEGION_PFP_IPFS, getAddressId } from "../helpers";
import { getLegionImage } from "../helpers/legion";
import * as common from "../mapping";

export function handleNoPilgrimagesToFinish(
  event: NoPilgrimagesToFinish
): void {
  let params = event.params;
  let user = params._user;

  log.info("Nothing to do for {}", [user.toHexString()]);
}

export function handlePilgrimagesFinished(event: PilgrimagesFinished): void {
  let params = event.params;

  let pilgrimageIds = params._finishedPilgrimageIds;
  let tokenIds = params._tokenIds;
  let user = params._user;

  for (let index = 0; index < pilgrimageIds.length; index++) {
    let pilgrimageId = pilgrimageIds[index];
    let tokenId = tokenIds[index];

    let legion = Token.load(getAddressId(LEGION_ADDRESS, tokenId));
    let pilgrimage = Pilgrimage.load(getAddressId(user, pilgrimageId));

    if (legion && pilgrimage) {
      let metadata = LegionInfo.load(`${legion.id}-metadata`);
      let legacyToken = Token.load(pilgrimage.token);
      if (metadata && legacyToken) {
        // 1/1 names don't change
        if ([50, 55, 78, 81, 163].includes(legacyToken.tokenId.toI32())) {
          legion.name = legacyToken.name;
        }

        legion.image = getLegionImage(
          LEGION_IPFS,
          metadata.type,
          metadata.rarity,
          metadata.role,
          tokenId,
          legacyToken.tokenId
        );
        legion.imageAlt = getLegionImage(
          LEGION_PFP_IPFS,
          metadata.type,
          metadata.rarity,
          metadata.role,
          tokenId,
          legacyToken.tokenId
        );
        legion.save();
      }
    }

    if (pilgrimage) {
      store.remove("Pilgrimage", pilgrimage.id);
    }
  }
}

export function handlePilgrimagesStarted(event: PilgrimagesStarted): void {
  let params = event.params;

  let ids = params._ids1155;
  let amounts = params._amounts1155;
  let contract = params._legionContract;
  let pilgrimageIds = params._pilgrimageIds;

  let user = params._user;
  let finishTime = params._finishTime;

  let pilgrimageIndex = 0;

  for (let idIndex = 0; idIndex < ids.length; idIndex++) {
    let tokenId = ids[idIndex];

    for (
      let amountIndex = 0;
      amountIndex < amounts[idIndex].toI32();
      amountIndex++
    ) {
      let amount = BigInt.fromI32(1);
      let pilgrimageId = pilgrimageIds[pilgrimageIndex];
      let id = getAddressId(contract, tokenId);

      let pilgrimage = new Pilgrimage(getAddressId(user, pilgrimageId));

      pilgrimage.endTimestamp = finishTime.times(BigInt.fromI32(1000));
      pilgrimage.pilgrimageId = pilgrimageId;
      pilgrimage.quantity = amount;
      pilgrimage.token = id;
      pilgrimage.user = user.toHexString();

      pilgrimage.save();

      common.handleTransfer(
        contract,
        params._user,
        event.address,
        tokenId,
        amount
      );

      pilgrimageIndex++;
    }
  }
}
