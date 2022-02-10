import * as common from "../mapping";
import { BigInt, log, store } from "@graphprotocol/graph-ts";
import { LEGION_ADDRESS } from "@treasure/constants";
import { LEGION_IPFS, getAddressId, getImageHash } from "../helpers";
import { LegionInfo, Pilgrimage, Token } from "../../generated/schema";
import {
  NoPilgrimagesToFinish,
  PilgrimagesFinished,
  PilgrimagesStarted,
} from "../../generated/Pilgrimage/Pilgrimage";

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
      let token = Token.load(pilgrimage.token);

      if (token) {
        let legacyTokenId = token.tokenId.toI32();

        // 1/1 names don't change
        if ([50, 55, 78, 81, 163].includes(legacyTokenId)) {
          legion.name = token.name;
        }

        if (70 === legacyTokenId) {
          let metadata = LegionInfo.load(`${legion.id}-metadata`);

          if (metadata) {
            legion.image = `${LEGION_IPFS}/${metadata.rarity}%20${metadata.role}.gif`;
          }
        } else {
          legion.image = getImageHash(token.tokenId, token.name)
            .split(" ")
            .join("%20");
        }
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
