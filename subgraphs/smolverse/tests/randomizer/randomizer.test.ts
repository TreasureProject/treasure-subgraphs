import { BigInt } from "@graphprotocol/graph-ts";
import { SMOL_BRAINS_ADDRESS } from "@treasure/constants";
import { assert, clearStore, test } from "matchstick-as";
import { Random, Seeded } from "../../generated/schema";
import { getFarmId, getRandomId, getSeededId } from "../../src/helpers/ids";
import { handleRandomRequest, handleRandomSeeded } from "../../src/mappings/randomizer";
import { handleSmolStaked, handleStartClaiming } from "../../src/mappings/smol-farm";
import { createSmolStakedEvent, createStartClaimingEvent } from "../smol-farm/utils";
import { createRandomRequestEvent, createRandomSeededEvent } from "./utils";

const CLAIM_ENTITY_TYPE = "Claim";
const RANDOM_ENTITY_TYPE = "Random";
const SEEDED_ENTITY_TYPE = "Seeded";
const USER_ADDRESS = "0x461950b159366edcd2bcbee8126d973ac49238e0";

test("random and seeded are created", () => {
  clearStore();
  
  const requestId = 1234;
  const commitId = 9876;

  const randomRequestEvent = createRandomRequestEvent(requestId, commitId);
  handleRandomRequest(randomRequestEvent);

  // Assert random was created
  const randomId = getRandomId(BigInt.fromI32(requestId));
  const random = Random.load(randomId);
  assert.assertNotNull(random);

  // Assert seeded was created with random
  const seededId = getSeededId(BigInt.fromI32(commitId));
  assert.fieldEquals(SEEDED_ENTITY_TYPE, seededId, "_randomIds", `[${randomId}]`)

  const newRequestId = 5678;
  const newRandomRequestEvent = createRandomRequestEvent(newRequestId, commitId);
  handleRandomRequest(newRandomRequestEvent);

  // Assert random was added to existing seeded
  const newRandomId = getRandomId(BigInt.fromI32(newRequestId));
  assert.fieldEquals(SEEDED_ENTITY_TYPE, seededId, "_randomIds", `[${randomId}, ${newRandomId}]`);
});

test("random request is seeded and claim marked revealable", () => {
  clearStore();

  const tokenId = 1;
  const requestId = 1234;
  const commitId = 9876;

  const smolStakedEvent = createSmolStakedEvent(USER_ADDRESS, tokenId, 1644190714);
  handleSmolStaked(smolStakedEvent);

  const randomRequestEvent = createRandomRequestEvent(requestId, commitId);
  handleRandomRequest(randomRequestEvent);

  const startClaimingEvent = createStartClaimingEvent(USER_ADDRESS, tokenId, requestId);
  handleStartClaiming(startClaimingEvent);

  // Assert claim was created with starting status
  const claimId = [
    SMOL_BRAINS_ADDRESS.toHexString(),
    BigInt.fromI32(tokenId).toHexString(),
    getFarmId(smolStakedEvent.address),
    getRandomId(BigInt.fromI32(requestId)),
  ].join("-");
  assert.fieldEquals(CLAIM_ENTITY_TYPE, claimId, "status", "Started");

  const randomSeededEvent = createRandomSeededEvent(commitId);
  handleRandomSeeded(randomSeededEvent);

  // Assert claim is now revealable
  assert.fieldEquals(CLAIM_ENTITY_TYPE, claimId, "status", "Revealable");

  // Assert seeded was deleted
  const seeded = Seeded.load(getSeededId(BigInt.fromI32(commitId)));
  assert.assertNull(seeded);
});
