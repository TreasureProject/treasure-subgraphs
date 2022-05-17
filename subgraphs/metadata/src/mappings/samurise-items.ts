import { BigInt, Bytes, json } from "@graphprotocol/graph-ts";

import {
  TransferBatch,
  TransferSingle,
} from "../../generated/SamuRise Items/ERC1155";
import { Collection, Token } from "../../generated/schema";
import { updateTokenMetadata } from "../helpers/metadata";
import { isMint } from "../helpers/utils";
import * as common from "../mapping";

function fetchTokenMetadata(
  collection: Collection,
  token: Token,
  timestamp: BigInt
): void {
  let description = "";
  let name = "";
  let image = token.tokenId.toString();

  switch (token.tokenId.toI32()) {
    case 0:
      name = "Katana";
      image = name.toLowerCase();
      description =
        "The Katana is the primary weapon of the Samurai warrior. Honed and perfected into a mastercraft of short quarters combat, a thousand years of crimson legacy has been written along its mortal edge.";

      break;
    case 1:
      name = "Tachi";
      image = name.toLowerCase();
      description =
        "The Tachi is a single edged curved blade that was crafted by Samurai long before the Katana. It's deeper curvature and longer blade made it a deadly weapon on horseback, and was often worn by warriors of high rank.";

      break;
    case 2:
      name = "Yari";
      image = name.toLowerCase();
      description =
        "Yari is a polearm used by Samurai for slashing and hooking. Although difficult to wield, in the hands of a master, it can pulverize any battlefield armor.";

      break;
    case 3:
      name = "Sensei";
      description =
        "Host the old sensei on your zaisan to improve your dojo. SamuRise who have the sensei's favor may find their dojo can reach otherwise unattainable levels.";

      break;
    case 4:
      name = "Rake";
      description =
        "This rake can be used in the zen garden to produce patterns reminiscent of waves (samon) or rippling water (hōkime). After many repetitions, SamuRise may find their rice farming skills have improved as well.";

      break;
    case 5:
      name = "Zen Garden";
      description =
        "The peace attained in the tranquil zen garden has been known to improve thinking and strengthen consciousness. SamuRise who spend their time in this place may find that quests don't take as long.";

      break;
    case 6:
      name = "Zen Robe";
      description =
        "This comfortable robe is most often worn by Zen Masters during meditation. SamuRise with a peaceful mind have a tendency to perform better while training.";

      break;
    case 7:
      name = "Enlightened Eye";
      description =
        "An opened third eye allows SamuRise to see through the cycles of samsara to the true nature within. This feat of enlightenment provides a window into more efficient methods of material production.";

      break;
  }

  if (name === "") {
    return;
  }

  const bytes = Bytes.fromUTF8(`
    {
      "name": "${name}",
      "description": "${description}",
      "image": "https://storage.googleapis.com/samurise/items/${image}.png"
    }
  `);

  const data = json.fromBytes(bytes).toObject();

  if (data) {
    updateTokenMetadata(collection, token, data, timestamp);
  } else {
    collection._missingMetadataTokens =
      collection._missingMetadataTokens.concat([token.id]);
  }
}

export function handleTransferSingle(event: TransferSingle): void {
  const params = event.params;
  const transfer = new common.TransferEvent(
    event.address,
    params.id,
    isMint(params.from),
    event.block.timestamp
  );

  common.handleTransfer(transfer, fetchTokenMetadata);
}

export function handleTransferBatch(event: TransferBatch): void {
  const params = event.params;
  const ids = params.ids;
  const length = ids.length;

  for (let index = 0; index < length; index++) {
    const id = ids[index];
    const transfer = new common.TransferEvent(
      event.address,
      id,
      isMint(params.from),
      event.block.timestamp
    );

    common.handleTransfer(transfer, fetchTokenMetadata);
  }
}
