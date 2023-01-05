import { Bytes, log } from "@graphprotocol/graph-ts";

import {
  UpgradeAddedToContract,
  UpgradeAddedToContract_upgradeInfoStruct,
  UpgradeInfoChanged,
  UpgradeInfoChanged_upgradeInfoStruct,
  UpgradeSaleStateChanged,
} from "../../generated/SmolChopShop/SmolChopShop";
import { Upgrade } from "../../generated/schema";

function populateUpgradeFields<T>(upgrade: Upgrade, upgradeInfo: T): void {
  if (
    upgradeInfo instanceof UpgradeAddedToContract_upgradeInfoStruct ||
    upgradeInfo instanceof UpgradeInfoChanged_upgradeInfoStruct
  ) {
    upgrade.amountClaimed = upgradeInfo.amountClaimed;
    upgrade.limitedOfferId = upgradeInfo.limitedOfferId;
    upgrade.maxSupply = upgradeInfo.maxSupply;
    upgrade.price = upgradeInfo.price;
    upgrade.subgroupId = upgradeInfo.subgroupId;
    upgrade.forSale = upgradeInfo.forSale;
    upgrade.tradable = upgradeInfo.tradable;
    upgrade.uncappedSupply = upgradeInfo.uncappedSupply;
    upgrade.upgradeType = upgradeInfo.upgradeType;
    upgrade.validSkinId = upgradeInfo.validSkinId;
    upgrade.validVehicleType = upgradeInfo.validVehicleType;
    upgrade.name = upgradeInfo.name;
    upgrade.uri = upgradeInfo.uri;
    upgrade.merkleRoot = upgradeInfo.merkleRoot.toString();
  }
}

export function handleNewUpgrade(event: UpgradeAddedToContract): void {
  const params = event.params;
  const id = Bytes.fromI32(params._upgradeId.toI32());
  const upgrade = new Upgrade(id);

  populateUpgradeFields<UpgradeAddedToContract_upgradeInfoStruct>(
    upgrade,
    params._upgradeInfo
  );

  upgrade.save();
}

export function handleUpgradeUpdate(event: UpgradeInfoChanged): void {
  const params = event.params;
  const id = Bytes.fromI32(params._upgradeId.toI32());
  const upgrade = Upgrade.load(id);

  if (!upgrade) {
    log.error("[smolverse-chop-shop] Updating unknown Upgrade: {}", [
      params._upgradeId.toString(),
    ]);
    return;
  }

  populateUpgradeFields<UpgradeInfoChanged_upgradeInfoStruct>(
    upgrade,
    params._upgradeInfo
  );

  upgrade.save();
}

export function handleUpgradeSaleStateUpdate(
  event: UpgradeSaleStateChanged
): void {
  const params = event.params;
  const id = Bytes.fromI32(params._upgradeId.toI32());
  const upgrade = Upgrade.load(id);

  if (!upgrade) {
    log.error("[smolverse-chop-shop] Updating unknown Upgrade: {}", [
      params._upgradeId.toString(),
    ]);
    return;
  }

  upgrade.forSale = params._added;

  upgrade.save();
}
