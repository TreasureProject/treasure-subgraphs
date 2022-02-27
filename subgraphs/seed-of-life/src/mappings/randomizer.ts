import { ClaimLifeform, Lifeform, Random, Seeded } from "../../generated/schema";
import {
    RandomRequest,
    RandomSeeded,
} from "../../generated/Randomizer/Randomizer";
import { log, store } from "@graphprotocol/graph-ts";
import { RandomHelpers } from "../helpers/RandomHelpers";

export function handleRandomRequest(event: RandomRequest): void {
    const params = event.params;

    const random = RandomHelpers.getOrCreateRandom(params._requestId);
    const seeded = RandomHelpers.getOrCreateSeeded(params._commitId);

    seeded._randomIds = seeded._randomIds.concat([random.id]);
    seeded.save();
}

export function handleRandomSeeded(event: RandomSeeded): void {
    const params = event.params;

    const seededId = RandomHelpers.getSeededId(params._commitId);
    const seeded = Seeded.load(seededId);

    if (!seeded) {
        log.error("[Randomizer] Unknown seeded: {}", [seededId]);
        return;
    }

    const randomIds = seeded._randomIds;
    for (let index = 0; index < randomIds.length; index++) {
        const randomId = randomIds[index];
        const random = Random.load(randomId);
        if (!random) {
            log.error("[Randomizer] Unknown random: {}", [randomId]);
            continue;
        }

        // Shared randomizer
        if (random._claimLifeformId) {
            const claimLifeform = ClaimLifeform.load(random._claimLifeformId as string)!;
            claimLifeform.claimStatus = "READY";
            claimLifeform.save();
        } else if (random._lifeformId) {
            const lifeform = Lifeform.load(random._lifeformId as string)!;
            lifeform.isReadyToRevealClass = true;
            lifeform.save();
        }

        store.remove("Random", randomId);
    }

    store.remove("Seeded", seededId);
}
