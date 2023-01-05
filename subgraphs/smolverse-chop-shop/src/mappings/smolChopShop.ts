import {
  UpgradeAddedToContract,
  UpgradeAddedToContract_upgradeInfoStruct,
} from "../../generated/SmolChopShop/SmolChopShop";
import { Upgrade } from "../../generated/schema";

function populateUpgradeFields(
  upgrade: Upgrade,
  upgradeInfo: UpgradeAddedToContract_upgradeInfoStruct
): void {
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

export function handleNewUpgrade(event: UpgradeAddedToContract): void {
  const params = event.params;
  const upgrade = new Upgrade(params._upgradeId.toString());

  populateUpgradeFields(upgrade, params._upgradeInfo);

  upgrade.save();
}
