import { TransferBatch, TransferSingle } from "../../generated/BalancerCrystal/ERC1155";
import { TransferHelpers } from "../helpers/TransferHelpers";
import { BigInt, log } from "@graphprotocol/graph-ts";

export function handleTransferBatch(event: TransferBatch): void {
    let params = event.params;

    for (let index = 0; index < params.ids.length; index++) {
        let id = params.ids[index];

        TransferHelpers.handleTransfer(
            event.address,
            params.from,
            params.to,
            id,
            nameForId(id),
            params.values[index]);
    }
}

export function handleTransferSingle(event: TransferSingle): void {
    TransferHelpers.handleTransfer(event.address,
        event.params.from,
        event.params.to,
        event.params.id,
        nameForId(event.params.id),
        event.params.value);
}

function nameForId(id: BigInt): string {
    switch (id.toI32()) {
        case 1:
            return "Balancer Crystal";
        default:
            log.error("[BalancerCrystal] Unknown id: {}", [id.toHexString()]);
            return "Unknown";
    }
}