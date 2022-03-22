import {
  assert,
  clearStore,
  createMockedFunction,
  newMockEvent,
  test,
} from "matchstick-as";

import {
  Address,
  BigDecimal,
  Bytes,
  ethereum,
  json,
} from "@graphprotocol/graph-ts";

import { Transfer } from "../../generated/Peek-A-Boo/ERC721";
// import { SMOL_BODIES_ADDRESS } from "@treasure/constants";
import { Attribute, Collection, Token } from "../../generated/schema";
import { encode } from "../../src/helpers/base64";
import { updateTokenMetadata } from "../../src/helpers/metadata";
import { handleTransfer } from "../../src/mapping";
// import { createTransferEvent } from "../smol-bodies/utils";
import {
  ATTRIBUTE_ENTITY_TYPE,
  TOKEN_ENTITY_TYPE,
  USER_ADDRESS,
} from "../utils";

export const PEEK_A_BOO_ADDRESS = Address.fromString(
  "0x461950b159366edcd2bcbee8126d973ac4929999"
);

export const createTransferEvent = (
  from: string,
  to: string,
  tokenId: i32
): Transfer => {
  const event = changetype<Transfer>(newMockEvent());
  event.address = PEEK_A_BOO_ADDRESS;
  event.parameters = [
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString(from))
    ),
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString(to))
    ),
    new ethereum.EventParam("tokenId", ethereum.Value.fromI32(tokenId)),
  ];

  return event;
};

const mockTokenData = json
  .fromBytes(
    Bytes.fromUTF8(`
    {
      "name": "#1",
      "description": "Smol Bodies",
      "image": "test-image",
      "video": "test-video",
      "attributes": [
        {
          "trait_type": "Gender",
          "value": "male"
        },
        {
          "trait_type": "Swol Size",
          "value": 0
        }
      ]
    }
  `)
  )
  .toObject();

createMockedFunction(
  PEEK_A_BOO_ADDRESS,
  "tokenURI",
  "tokenURI(uint256):(string)"
)
  .withArgs([ethereum.Value.fromI32(1)])
  .returns([
    ethereum.Value.fromString(
      `data:application/json;base64,{\"name\": \"Ghost #1\", \"description\": \"Ghosts have come out to haunt the metaverse as the night awakes, Busters scramble to purge these ghosts and claim the bounties. Ghosts are accumulating $BOO, amassing it to grow their haunted grounds. All the metadata and images are generated and stored 100% on-chain. No IPFS. NO API. With the help of Oracles we remove exploits regarding randomness that would otherwise ruin the project. The project is built on the Ethereum blockchain.\", \"image\": \"data:image/svg+xml;base64,<svg width=\"100%\" height=\"100%\" viewBox=\"0 0 100 100\"><svg id=\"a80919ec-26a3-4f1a-9607-3a849e049eb0\" data-name=\"Background\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 63.969 63.969\"><g id=\"f0b224ba-3153-4e51-a916-c3efa08650c8\" data-name=\"Orange\"><rect width=\"63.969\" height=\"63.969\" style=\"fill:#ffca99\"/></g></svg><svg id=\"e6c306d7-3f55-4f51-9b81-3afa8fc191ca\" data-name=\"Back\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 63.969 63.969\"><g id=\"be2e2347-f50d-49d5-a306-c8e172d3cb29\" data-name=\"Bat Wings Pink\"><path d=\"M44.4,28.062a4.964,4.964,0,0,0,3.383-1.606,5.064,5.064,0,0,0,1.128-4.135.929.929,0,0,0,.513.513c.7.215,1.457-1.016,2.05-1.367,1.162-.687,2.673-1.278,6.63.034a2.375,2.375,0,0,0-.41,4.613,3.175,3.175,0,0,0-2.255,5.092A4.446,4.446,0,0,0,49.25,33.12a3.159,3.159,0,0,0-1.4-2.255,3.2,3.2,0,0,0-2.836-.205Z\" style=\"fill:#ffc4ec;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px\"/><path d=\"M49.284,23.073c1.035,0,2.575-.389,4.017.137a10.667,10.667,0,0,1,4.017,2.982\" style=\"fill:#ffc4ec;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px\"/><path d=\"M49.284,23.073a10.258,10.258,0,0,1,3.007,2.358,10.483,10.483,0,0,1,2.426,5.3\" style=\"fill:#ffc4ec;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px\"/><path d=\"M49.25,23.209a9.134,9.134,0,0,1,.2,9.558\" style=\"fill:#ffc4ec;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px\"/></g></svg><svg id=\"b65bed23-e66b-48d3-8bd4-ffc84fb2fde1\" data-name=\"BodyColor\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 63.969 63.969\"><g id=\"a846b17b-0ecb-4901-95fc-8b63882b629b\" data-name=\"Green\"><path d=\"M28.316,11.638c-5.74,1.079-9.513,5.912-10.924,10.047-1.1,3.212-.615,6.105-.483,9.389.364,9,.974,9.118.8,13.754-.148,3.97-2.517,6.91-1.727,7.963,1.064,1.419,4.367.867,7.113-1.009,1.974-1.349,4.76-4.047,7.678-3.817,2.216.175,2.9,1.9,5.484,2.194,3.482.4,4.168-2.446,7.458-3.071,1.881-.357,3.37.84,6.01.647a2.654,2.654,0,0,0,2.292-1.217c1.169-1.532-1.876-3.992-3.894-8.862-2.821-6.808-1.755-6.69-4.365-14.478-1.583-4.721-3.674-8.722-7.941-10.7A12.46,12.46,0,0,0,28.316,11.638Z\" style=\"fill:#d1ffea;stroke:#000;stroke-miterlimit:10;stroke-width:0.8px\"/></g></svg><svg id=\"fa4f26dc-5b9c-44f2-bd18-335e2e72f571\" data-name=\"Clothes\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 63.969 63.969\"><g id=\"e51b960e-87d1-4c6c-a030-93b4fbfe096d\" data-name=\"Cape Pink\"><path d=\"M17.2,34.222a63.608,63.608,0,0,0,9.773-.554A64.253,64.253,0,0,0,45.3,28.322\" style=\"fill:none;stroke:#000;stroke-linecap:round;stroke-miterlimit:10;stroke-width:0.65px\"/><path d=\"M45.3,28.322c1.062,2.759,2.454,3.859,3.567,4.344,2.879,1.253,6.041-.678,7.172.845.588.792,0,1.675.877,3.188a5.062,5.062,0,0,0,.972,1.2c.258.236.346.724.039.892a9.417,9.417,0,0,0-3.7,3.99c-.155.29-.627.139-.706-.18a4.516,4.516,0,0,0-1.558-2.588c-1.36-1.025-2.745-.5-3.892-.952-1.483-.584-2.931-2.941-2.766-10.737\" style=\"fill:#ffc4ec;stroke:#000;stroke-linecap:round;stroke-miterlimit:10;stroke-width:0.65px\"/><path d=\"M26.973,33.669l-1.206,1.149a.249.249,0,0,0-.005.356c.346.346.743.53,1.008.425.387-.154.628-.978.2-1.929\" style=\"fill:none;stroke:#000;stroke-linecap:round;stroke-miterlimit:10;stroke-width:0.65px\"/><path d=\"M27.192,33.717c-.051.065-.278.447.642,1.535a.32.32,0,0,0,.389.078c.318-.161.757-.451.77-.7C29.025,34.062,27.411,33.437,27.192,33.717Z\" style=\"fill:none;stroke:#000;stroke-linecap:round;stroke-miterlimit:10;stroke-width:0.65px\"/></g></svg><svg id=\"e33c19d2-8f0e-4729-9097-41afb4c945c5\" data-name=\"Hat\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 63.969 63.969\"><g id=\"ecd09d2e-3c7f-475f-968f-b8e350f2c0e7\" data-name=\"Beanie Pink\"><path d=\"M32.607,10.428A2.717,2.717,0,0,1,31.855,8C32.11,7.151,33,6.312,33.6,6.533c.4.147.537.721.581.957a3.114,3.114,0,0,1,.957-.957c1.168-.732,3.106-.786,3.657.205a2.309,2.309,0,0,1-.273,2.016c.062-.026.689-.277,1.025,0,.353.291.361,1.145-.308,1.88.118-.006.442-.009.547.171.169.29-.619,1.073-.672,1.128\" style=\"fill:#fff390;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px\"/><path d=\"M18.368,16.148A17.361,17.361,0,0,1,27.139,10.7c1.509-.374,7.9-1.955,12.439,2.05a11.38,11.38,0,0,1,3.349,5.536\" style=\"fill:#ffc4ec;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px\"/><path d=\"M16.477,23.141a33.4,33.4,0,0,1,10.81-2.916,34.4,34.4,0,0,1,16.9,2.677c.18-.808.934-2.677-.137-4.089a4,4,0,0,0-1.777-1.276c-5.894-2.357-13.305-2.369-13.305-2.369-9.7-.016-11.111,1.03-11.847,1.777-1.031,1.046-2.755,3.543-1.914,5.24C15.444,22.651,16.171,22.951,16.477,23.141Z\" style=\"fill:#fff390;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px\"/><path d=\"M22.56,15.52a6.607,6.607,0,0,0,.335,5.416\" style=\"fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px\"/><path d=\"M30.248,15.207a9.557,9.557,0,0,0,.411,4.687\" style=\"fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px\"/><path d=\"M37.964,16.228a4.671,4.671,0,0,1,.521,2.471,4.019,4.019,0,0,1-.547,1.948\" style=\"fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px\"/><path d=\"M17.535,16.588a4.473,4.473,0,0,0-1.229,3.364,4.376,4.376,0,0,0,1.279,2.715\" style=\"fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px\"/></g></svg><svg id=\"ea5bd4d0-554e-450d-b53c-6a27204c920c\" data-name=\"Face\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 63.969 63.969\"><g id=\"ba143566-7b57-4a9a-940a-57f49cdee299\" data-name=\"Neutral\"><circle cx=\"14.124\" cy=\"26.763\" r=\"0.987\"/><circle cx=\"33.669\" cy=\"24.443\" r=\"0.987\"/><line x1=\"21.808\" y1=\"26.9\" x2=\"25.055\" y2=\"26.49\" style=\"fill:none;stroke:#000;stroke-linecap:round;stroke-miterlimit:10;stroke-width:0.7000000000000001px\"/></g></svg><svg id=\"f8d514d7-813b-44b2-9497-27d1a4801c55\" data-name=\"Hands\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 63.969 63.969\"><g id=\"a319116f-0337-4ad0-bedb-d195dc804a80\" data-name=\"Cup Purple\"><path d=\"M31.156,35.176a2.257,2.257,0,0,1,1.987-.376,2.081,2.081,0,0,1,1.152,2c.027,1.308-1.285,2.671-3.537,3.1l-.008-1.322a2.436,2.436,0,0,0,2.218-1.394c.114-.362.144-.969-.178-1.188-.342-.232-1.051-.011-1.642.691Q31.151,35.932,31.156,35.176Z\" style=\"fill:#deb7ff;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.55px\"/><path d=\"M22.56,35.87a9.817,9.817,0,0,0,.762,3.817A3.916,3.916,0,0,0,27.78,42.3c3.346-.443,3.746-2.345,3.976-3.55a9.984,9.984,0,0,0-.408-4.114\" style=\"fill:#deb7ff;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.6000000000000001px\"/><ellipse cx=\"26.966\" cy=\"35.236\" rx=\"4.459\" ry=\"0.932\" transform=\"translate(-4.392 3.845) rotate(-7.543)\" style=\"fill:#fff390;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.6000000000000001px\"/><path d=\"M21.136,41.554c1.259-.681,2.017-1.539,1.856-1.962-.167-.439-1.388-.586-2.94-.131\" style=\"fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px\"/><path d=\"M36.6,37.167c-1.308,0-2.421.245-2.54.733-.134.55,1.073,1.231,2.911,1.917\" style=\"fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px\"/><path d=\"M24.266,39.378a3.232,3.232,0,0,0,2.8,1.877\" style=\"fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.6000000000000001px\"/></g></svg></svg>\", \"attributes\":[{\"trait_type\":\"Background\",\"value\":\"Background Orange\"},{\"trait_type\":\"Back\",\"value\":\"Back Bat Wings Pink\"},{\"trait_type\":\"BodyColor\",\"value\":\"BodyColor Green\"},{\"trait_type\":\"Clothes\",\"value\":\"Clothes Cape Pink\"},{\"trait_type\":\"Hat\",\"value\":\"Hat Beanie Pink\"},{\"trait_type\":\"Face\",\"value\":\"Face Neutral\"},{\"trait_type\":\"Hands\",\"value\":\"Hands Cup Purple\"},{\"trait_type\":\"Tier\",\"value\":\"0\"},{\"trait_type\":\"Level\",\"value\":\"1\"}{\"trait_type\":\"Type\",\"value\":\"Ghost\"}]}`
    ),
  ]);

test("base64", () => {
  const expected =
    "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48c3ZnIGlkPSJhODA5MTllYy0yNmEzLTRmMWEtOTYwNy0zYTg0OWUwNDllYjAiIGRhdGEtbmFtZT0iQmFja2dyb3VuZCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNjMuOTY5IDYzLjk2OSI+PGcgaWQ9ImYwYjIyNGJhLTMxNTMtNGU1MS1hOTE2LWMzZWZhMDg2NTBjOCIgZGF0YS1uYW1lPSJPcmFuZ2UiPjxyZWN0IHdpZHRoPSI2My45NjkiIGhlaWdodD0iNjMuOTY5IiBzdHlsZT0iZmlsbDojZmZjYTk5Ii8+PC9nPjwvc3ZnPjxzdmcgaWQ9ImU2YzMwNmQ3LTNmNTUtNGY1MS05YjgxLTNhZmE4ZmMxOTFjYSIgZGF0YS1uYW1lPSJCYWNrIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2My45NjkgNjMuOTY5Ij48ZyBpZD0iYmUyZTIzNDctZjUwZC00OWQ1LWEzMDYtYzhlMTcyZDNjYjI5IiBkYXRhLW5hbWU9IkJhdCBXaW5ncyBQaW5rIj48cGF0aCBkPSJNNDQuNCwyOC4wNjJhNC45NjQsNC45NjQsMCwwLDAsMy4zODMtMS42MDYsNS4wNjQsNS4wNjQsMCwwLDAsMS4xMjgtNC4xMzUuOTI5LjkyOSwwLDAsMCwuNTEzLjUxM2MuNy4yMTUsMS40NTctMS4wMTYsMi4wNS0xLjM2NywxLjE2Mi0uNjg3LDIuNjczLTEuMjc4LDYuNjMuMDM0YTIuMzc1LDIuMzc1LDAsMCwwLS40MSw0LjYxMywzLjE3NSwzLjE3NSwwLDAsMC0yLjI1NSw1LjA5MkE0LjQ0Niw0LjQ0NiwwLDAsMCw0OS4yNSwzMy4xMmEzLjE1OSwzLjE1OSwwLDAsMC0xLjQtMi4yNTUsMy4yLDMuMiwwLDAsMC0yLjgzNi0uMjA1WiIgc3R5bGU9ImZpbGw6I2ZmYzRlYztzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjAuNjVweCIvPjxwYXRoIGQ9Ik00OS4yODQsMjMuMDczYzEuMDM1LDAsMi41NzUtLjM4OSw0LjAxNy4xMzdhMTAuNjY3LDEwLjY2NywwLDAsMSw0LjAxNywyLjk4MiIgc3R5bGU9ImZpbGw6I2ZmYzRlYztzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjAuNjVweCIvPjxwYXRoIGQ9Ik00OS4yODQsMjMuMDczYTEwLjI1OCwxMC4yNTgsMCwwLDEsMy4wMDcsMi4zNTgsMTAuNDgzLDEwLjQ4MywwLDAsMSwyLjQyNiw1LjMiIHN0eWxlPSJmaWxsOiNmZmM0ZWM7c3Ryb2tlOiMwMDA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDowLjY1cHgiLz48cGF0aCBkPSJNNDkuMjUsMjMuMjA5YTkuMTM0LDkuMTM0LDAsMCwxLC4yLDkuNTU4IiBzdHlsZT0iZmlsbDojZmZjNGVjO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PC9nPjwvc3ZnPjxzdmcgaWQ9ImI2NWJlZDIzLWU2NmItNDhkMy04YmQ0LWZmYzg0ZmIyZmRlMSIgZGF0YS1uYW1lPSJCb2R5Q29sb3IiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDYzLjk2OSA2My45NjkiPjxnIGlkPSJhODQ2YjE3Yi0wZWNiLTQ5MDEtOTVmYy04YjYzODgyYjYyOWIiIGRhdGEtbmFtZT0iR3JlZW4iPjxwYXRoIGQ9Ik0yOC4zMTYsMTEuNjM4Yy01Ljc0LDEuMDc5LTkuNTEzLDUuOTEyLTEwLjkyNCwxMC4wNDctMS4xLDMuMjEyLS42MTUsNi4xMDUtLjQ4Myw5LjM4OS4zNjQsOSwuOTc0LDkuMTE4LjgsMTMuNzU0LS4xNDgsMy45Ny0yLjUxNyw2LjkxLTEuNzI3LDcuOTYzLDEuMDY0LDEuNDE5LDQuMzY3Ljg2Nyw3LjExMy0xLjAwOSwxLjk3NC0xLjM0OSw0Ljc2LTQuMDQ3LDcuNjc4LTMuODE3LDIuMjE2LjE3NSwyLjksMS45LDUuNDg0LDIuMTk0LDMuNDgyLjQsNC4xNjgtMi40NDYsNy40NTgtMy4wNzEsMS44ODEtLjM1NywzLjM3Ljg0LDYuMDEuNjQ3YTIuNjU0LDIuNjU0LDAsMCwwLDIuMjkyLTEuMjE3YzEuMTY5LTEuNTMyLTEuODc2LTMuOTkyLTMuODk0LTguODYyLTIuODIxLTYuODA4LTEuNzU1LTYuNjktNC4zNjUtMTQuNDc4LTEuNTgzLTQuNzIxLTMuNjc0LTguNzIyLTcuOTQxLTEwLjdBMTIuNDYsMTIuNDYsMCwwLDAsMjguMzE2LDExLjYzOFoiIHN0eWxlPSJmaWxsOiNkMWZmZWE7c3Ryb2tlOiMwMDA7c3Ryb2tlLW1pdGVybGltaXQ6MTA7c3Ryb2tlLXdpZHRoOjAuOHB4Ii8+PC9nPjwvc3ZnPjxzdmcgaWQ9ImZhNGYyNmRjLTViOWMtNDRmMi1iZDE4LTMzNWUyZTcyZjU3MSIgZGF0YS1uYW1lPSJDbG90aGVzIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2My45NjkgNjMuOTY5Ij48ZyBpZD0iZTUxYjk2MGUtODdkMS00YzZjLWEwMzAtOTNiNGZiZmUwOTZkIiBkYXRhLW5hbWU9IkNhcGUgUGluayI+PHBhdGggZD0iTTE3LjIsMzQuMjIyYTYzLjYwOCw2My42MDgsMCwwLDAsOS43NzMtLjU1NEE2NC4yNTMsNjQuMjUzLDAsMCwwLDQ1LjMsMjguMzIyIiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjEwO3N0cm9rZS13aWR0aDowLjY1cHgiLz48cGF0aCBkPSJNNDUuMywyOC4zMjJjMS4wNjIsMi43NTksMi40NTQsMy44NTksMy41NjcsNC4zNDQsMi44NzksMS4yNTMsNi4wNDEtLjY3OCw3LjE3Mi44NDUuNTg4Ljc5MiwwLDEuNjc1Ljg3NywzLjE4OGE1LjA2Miw1LjA2MiwwLDAsMCwuOTcyLDEuMmMuMjU4LjIzNi4zNDYuNzI0LjAzOS44OTJhOS40MTcsOS40MTcsMCwwLDAtMy43LDMuOTljLS4xNTUuMjktLjYyNy4xMzktLjcwNi0uMThhNC41MTYsNC41MTYsMCwwLDAtMS41NTgtMi41ODhjLTEuMzYtMS4wMjUtMi43NDUtLjUtMy44OTItLjk1Mi0xLjQ4My0uNTg0LTIuOTMxLTIuOTQxLTIuNzY2LTEwLjczNyIgc3R5bGU9ImZpbGw6I2ZmYzRlYztzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTI2Ljk3MywzMy42NjlsLTEuMjA2LDEuMTQ5YS4yNDkuMjQ5LDAsMCwwLS4wMDUuMzU2Yy4zNDYuMzQ2Ljc0My41MywxLjAwOC40MjUuMzg3LS4xNTQuNjI4LS45NzguMi0xLjkyOSIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTI3LjE5MiwzMy43MTdjLS4wNTEuMDY1LS4yNzguNDQ3LjY0MiwxLjUzNWEuMzIuMzIsMCwwLDAsLjM4OS4wNzhjLjMxOC0uMTYxLjc1Ny0uNDUxLjc3LS43QzI5LjAyNSwzNC4wNjIsMjcuNDExLDMzLjQzNywyNy4xOTIsMzMuNzE3WiIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PC9nPjwvc3ZnPjxzdmcgaWQ9ImUzM2MxOWQyLThmMGUtNDcyOS05MDk3LTQxYWZiNGM5NDVjNSIgZGF0YS1uYW1lPSJIYXQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDYzLjk2OSA2My45NjkiPjxnIGlkPSJlY2QwOWQyZS0zYzdmLTQ3NWYtOTY4Zi1iOGUzNTBmMmMwZTciIGRhdGEtbmFtZT0iQmVhbmllIFBpbmsiPjxwYXRoIGQ9Ik0zMi42MDcsMTAuNDI4QTIuNzE3LDIuNzE3LDAsMCwxLDMxLjg1NSw4QzMyLjExLDcuMTUxLDMzLDYuMzEyLDMzLjYsNi41MzNjLjQuMTQ3LjUzNy43MjEuNTgxLjk1N2EzLjExNCwzLjExNCwwLDAsMSwuOTU3LS45NTdjMS4xNjgtLjczMiwzLjEwNi0uNzg2LDMuNjU3LjIwNWEyLjMwOSwyLjMwOSwwLDAsMS0uMjczLDIuMDE2Yy4wNjItLjAyNi42ODktLjI3NywxLjAyNSwwLC4zNTMuMjkxLjM2MSwxLjE0NS0uMzA4LDEuODguMTE4LS4wMDYuNDQyLS4wMDkuNTQ3LjE3MS4xNjkuMjktLjYxOSwxLjA3My0uNjcyLDEuMTI4IiBzdHlsZT0iZmlsbDojZmZmMzkwO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTE4LjM2OCwxNi4xNDhBMTcuMzYxLDE3LjM2MSwwLDAsMSwyNy4xMzksMTAuN2MxLjUwOS0uMzc0LDcuOS0xLjk1NSwxMi40MzksMi4wNWExMS4zOCwxMS4zOCwwLDAsMSwzLjM0OSw1LjUzNiIgc3R5bGU9ImZpbGw6I2ZmYzRlYztzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjAuNjVweCIvPjxwYXRoIGQ9Ik0xNi40NzcsMjMuMTQxYTMzLjQsMzMuNCwwLDAsMSwxMC44MS0yLjkxNiwzNC40LDM0LjQsMCwwLDEsMTYuOSwyLjY3N2MuMTgtLjgwOC45MzQtMi42NzctLjEzNy00LjA4OWE0LDQsMCwwLDAtMS43NzctMS4yNzZjLTUuODk0LTIuMzU3LTEzLjMwNS0yLjM2OS0xMy4zMDUtMi4zNjktOS43LS4wMTYtMTEuMTExLDEuMDMtMTEuODQ3LDEuNzc3LTEuMDMxLDEuMDQ2LTIuNzU1LDMuNTQzLTEuOTE0LDUuMjRDMTUuNDQ0LDIyLjY1MSwxNi4xNzEsMjIuOTUxLDE2LjQ3NywyMy4xNDFaIiBzdHlsZT0iZmlsbDojZmZmMzkwO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTIyLjU2LDE1LjUyYTYuNjA3LDYuNjA3LDAsMCwwLC4zMzUsNS40MTYiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDowLjY1cHgiLz48cGF0aCBkPSJNMzAuMjQ4LDE1LjIwN2E5LjU1Nyw5LjU1NywwLDAsMCwuNDExLDQuNjg3IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTM3Ljk2NCwxNi4yMjhhNC42NzEsNC42NzEsMCwwLDEsLjUyMSwyLjQ3MSw0LjAxOSw0LjAxOSwwLDAsMS0uNTQ3LDEuOTQ4IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTE3LjUzNSwxNi41ODhhNC40NzMsNC40NzMsMCwwLDAtMS4yMjksMy4zNjQsNC4zNzYsNC4zNzYsMCwwLDAsMS4yNzksMi43MTUiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDowLjY1cHgiLz48L2c+PC9zdmc+PHN2ZyBpZD0iZWE1YmQ0ZDAtNTU0ZS00NTBkLWI1M2MtNmEyNzIwNGM5MjBjIiBkYXRhLW5hbWU9IkZhY2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDYzLjk2OSA2My45NjkiPjxnIGlkPSJiYTE0MzU2Ni03YjU3LTRhOWEtOTQwYS01N2Y0OWNkZWUyOTkiIGRhdGEtbmFtZT0iTmV1dHJhbCI+PGNpcmNsZSBjeD0iMTQuMTI0IiBjeT0iMjYuNzYzIiByPSIwLjk4NyIvPjxjaXJjbGUgY3g9IjMzLjY2OSIgY3k9IjI0LjQ0MyIgcj0iMC45ODciLz48bGluZSB4MT0iMjEuODA4IiB5MT0iMjYuOSIgeDI9IjI1LjA1NSIgeTI9IjI2LjQ5IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjEwO3N0cm9rZS13aWR0aDowLjcwMDAwMDAwMDAwMDAwMDFweCIvPjwvZz48L3N2Zz48c3ZnIGlkPSJmOGQ1MTRkNy04MTNiLTQ0YjItOTQ5Ny0yN2QxYTQ4MDFjNTUiIGRhdGEtbmFtZT0iSGFuZHMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDYzLjk2OSA2My45NjkiPjxnIGlkPSJhMzE5MTE2Zi0wMzM3LTRhZDAtYmVkYi1kMTk1ZGM4MDRhODAiIGRhdGEtbmFtZT0iQ3VwIFB1cnBsZSI+PHBhdGggZD0iTTMxLjE1NiwzNS4xNzZhMi4yNTcsMi4yNTcsMCwwLDEsMS45ODctLjM3NiwyLjA4MSwyLjA4MSwwLDAsMSwxLjE1MiwyYy4wMjcsMS4zMDgtMS4yODUsMi42NzEtMy41MzcsMy4xbC0uMDA4LTEuMzIyYTIuNDM2LDIuNDM2LDAsMCwwLDIuMjE4LTEuMzk0Yy4xMTQtLjM2Mi4xNDQtLjk2OS0uMTc4LTEuMTg4LS4zNDItLjIzMi0xLjA1MS0uMDExLTEuNjQyLjY5MVEzMS4xNTEsMzUuOTMyLDMxLjE1NiwzNS4xNzZaIiBzdHlsZT0iZmlsbDojZGViN2ZmO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC41NXB4Ii8+PHBhdGggZD0iTTIyLjU2LDM1Ljg3YTkuODE3LDkuODE3LDAsMCwwLC43NjIsMy44MTdBMy45MTYsMy45MTYsMCwwLDAsMjcuNzgsNDIuM2MzLjM0Ni0uNDQzLDMuNzQ2LTIuMzQ1LDMuOTc2LTMuNTVhOS45ODQsOS45ODQsMCwwLDAtLjQwOC00LjExNCIgc3R5bGU9ImZpbGw6I2RlYjdmZjtzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjAuNjAwMDAwMDAwMDAwMDAwMXB4Ii8+PGVsbGlwc2UgY3g9IjI2Ljk2NiIgY3k9IjM1LjIzNiIgcng9IjQuNDU5IiByeT0iMC45MzIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC00LjM5MiAzLjg0NSkgcm90YXRlKC03LjU0MykiIHN0eWxlPSJmaWxsOiNmZmYzOTA7c3Ryb2tlOiMwMDA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDowLjYwMDAwMDAwMDAwMDAwMDFweCIvPjxwYXRoIGQ9Ik0yMS4xMzYsNDEuNTU0YzEuMjU5LS42ODEsMi4wMTctMS41MzksMS44NTYtMS45NjItLjE2Ny0uNDM5LTEuMzg4LS41ODYtMi45NC0uMTMxIiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTM2LjYsMzcuMTY3Yy0xLjMwOCwwLTIuNDIxLjI0NS0yLjU0LjczMy0uMTM0LjU1LDEuMDczLDEuMjMxLDIuOTExLDEuOTE3IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTI0LjI2NiwzOS4zNzhhMy4yMzIsMy4yMzIsMCwwLDAsMi44LDEuODc3IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojZmZmO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42MDAwMDAwMDAwMDAwMDAxcHgiLz48L2c+PC9zdmc+PC9zdmc+";
  const actual = encode(
    Bytes.fromUTF8(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100"><svg id="a80919ec-26a3-4f1a-9607-3a849e049eb0" data-name="Background" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.969 63.969"><g id="f0b224ba-3153-4e51-a916-c3efa08650c8" data-name="Orange"><rect width="63.969" height="63.969" style="fill:#ffca99"/></g></svg><svg id="e6c306d7-3f55-4f51-9b81-3afa8fc191ca" data-name="Back" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.969 63.969"><g id="be2e2347-f50d-49d5-a306-c8e172d3cb29" data-name="Bat Wings Pink"><path d="M44.4,28.062a4.964,4.964,0,0,0,3.383-1.606,5.064,5.064,0,0,0,1.128-4.135.929.929,0,0,0,.513.513c.7.215,1.457-1.016,2.05-1.367,1.162-.687,2.673-1.278,6.63.034a2.375,2.375,0,0,0-.41,4.613,3.175,3.175,0,0,0-2.255,5.092A4.446,4.446,0,0,0,49.25,33.12a3.159,3.159,0,0,0-1.4-2.255,3.2,3.2,0,0,0-2.836-.205Z" style="fill:#ffc4ec;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px"/><path d="M49.284,23.073c1.035,0,2.575-.389,4.017.137a10.667,10.667,0,0,1,4.017,2.982" style="fill:#ffc4ec;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px"/><path d="M49.284,23.073a10.258,10.258,0,0,1,3.007,2.358,10.483,10.483,0,0,1,2.426,5.3" style="fill:#ffc4ec;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px"/><path d="M49.25,23.209a9.134,9.134,0,0,1,.2,9.558" style="fill:#ffc4ec;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px"/></g></svg><svg id="b65bed23-e66b-48d3-8bd4-ffc84fb2fde1" data-name="BodyColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.969 63.969"><g id="a846b17b-0ecb-4901-95fc-8b63882b629b" data-name="Green"><path d="M28.316,11.638c-5.74,1.079-9.513,5.912-10.924,10.047-1.1,3.212-.615,6.105-.483,9.389.364,9,.974,9.118.8,13.754-.148,3.97-2.517,6.91-1.727,7.963,1.064,1.419,4.367.867,7.113-1.009,1.974-1.349,4.76-4.047,7.678-3.817,2.216.175,2.9,1.9,5.484,2.194,3.482.4,4.168-2.446,7.458-3.071,1.881-.357,3.37.84,6.01.647a2.654,2.654,0,0,0,2.292-1.217c1.169-1.532-1.876-3.992-3.894-8.862-2.821-6.808-1.755-6.69-4.365-14.478-1.583-4.721-3.674-8.722-7.941-10.7A12.46,12.46,0,0,0,28.316,11.638Z" style="fill:#d1ffea;stroke:#000;stroke-miterlimit:10;stroke-width:0.8px"/></g></svg><svg id="fa4f26dc-5b9c-44f2-bd18-335e2e72f571" data-name="Clothes" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.969 63.969"><g id="e51b960e-87d1-4c6c-a030-93b4fbfe096d" data-name="Cape Pink"><path d="M17.2,34.222a63.608,63.608,0,0,0,9.773-.554A64.253,64.253,0,0,0,45.3,28.322" style="fill:none;stroke:#000;stroke-linecap:round;stroke-miterlimit:10;stroke-width:0.65px"/><path d="M45.3,28.322c1.062,2.759,2.454,3.859,3.567,4.344,2.879,1.253,6.041-.678,7.172.845.588.792,0,1.675.877,3.188a5.062,5.062,0,0,0,.972,1.2c.258.236.346.724.039.892a9.417,9.417,0,0,0-3.7,3.99c-.155.29-.627.139-.706-.18a4.516,4.516,0,0,0-1.558-2.588c-1.36-1.025-2.745-.5-3.892-.952-1.483-.584-2.931-2.941-2.766-10.737" style="fill:#ffc4ec;stroke:#000;stroke-linecap:round;stroke-miterlimit:10;stroke-width:0.65px"/><path d="M26.973,33.669l-1.206,1.149a.249.249,0,0,0-.005.356c.346.346.743.53,1.008.425.387-.154.628-.978.2-1.929" style="fill:none;stroke:#000;stroke-linecap:round;stroke-miterlimit:10;stroke-width:0.65px"/><path d="M27.192,33.717c-.051.065-.278.447.642,1.535a.32.32,0,0,0,.389.078c.318-.161.757-.451.77-.7C29.025,34.062,27.411,33.437,27.192,33.717Z" style="fill:none;stroke:#000;stroke-linecap:round;stroke-miterlimit:10;stroke-width:0.65px"/></g></svg><svg id="e33c19d2-8f0e-4729-9097-41afb4c945c5" data-name="Hat" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.969 63.969"><g id="ecd09d2e-3c7f-475f-968f-b8e350f2c0e7" data-name="Beanie Pink"><path d="M32.607,10.428A2.717,2.717,0,0,1,31.855,8C32.11,7.151,33,6.312,33.6,6.533c.4.147.537.721.581.957a3.114,3.114,0,0,1,.957-.957c1.168-.732,3.106-.786,3.657.205a2.309,2.309,0,0,1-.273,2.016c.062-.026.689-.277,1.025,0,.353.291.361,1.145-.308,1.88.118-.006.442-.009.547.171.169.29-.619,1.073-.672,1.128" style="fill:#fff390;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px"/><path d="M18.368,16.148A17.361,17.361,0,0,1,27.139,10.7c1.509-.374,7.9-1.955,12.439,2.05a11.38,11.38,0,0,1,3.349,5.536" style="fill:#ffc4ec;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px"/><path d="M16.477,23.141a33.4,33.4,0,0,1,10.81-2.916,34.4,34.4,0,0,1,16.9,2.677c.18-.808.934-2.677-.137-4.089a4,4,0,0,0-1.777-1.276c-5.894-2.357-13.305-2.369-13.305-2.369-9.7-.016-11.111,1.03-11.847,1.777-1.031,1.046-2.755,3.543-1.914,5.24C15.444,22.651,16.171,22.951,16.477,23.141Z" style="fill:#fff390;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px"/><path d="M22.56,15.52a6.607,6.607,0,0,0,.335,5.416" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px"/><path d="M30.248,15.207a9.557,9.557,0,0,0,.411,4.687" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px"/><path d="M37.964,16.228a4.671,4.671,0,0,1,.521,2.471,4.019,4.019,0,0,1-.547,1.948" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px"/><path d="M17.535,16.588a4.473,4.473,0,0,0-1.229,3.364,4.376,4.376,0,0,0,1.279,2.715" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px"/></g></svg><svg id="ea5bd4d0-554e-450d-b53c-6a27204c920c" data-name="Face" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.969 63.969"><g id="ba143566-7b57-4a9a-940a-57f49cdee299" data-name="Neutral"><circle cx="14.124" cy="26.763" r="0.987"/><circle cx="33.669" cy="24.443" r="0.987"/><line x1="21.808" y1="26.9" x2="25.055" y2="26.49" style="fill:none;stroke:#000;stroke-linecap:round;stroke-miterlimit:10;stroke-width:0.7000000000000001px"/></g></svg><svg id="f8d514d7-813b-44b2-9497-27d1a4801c55" data-name="Hands" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 63.969 63.969"><g id="a319116f-0337-4ad0-bedb-d195dc804a80" data-name="Cup Purple"><path d="M31.156,35.176a2.257,2.257,0,0,1,1.987-.376,2.081,2.081,0,0,1,1.152,2c.027,1.308-1.285,2.671-3.537,3.1l-.008-1.322a2.436,2.436,0,0,0,2.218-1.394c.114-.362.144-.969-.178-1.188-.342-.232-1.051-.011-1.642.691Q31.151,35.932,31.156,35.176Z" style="fill:#deb7ff;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.55px"/><path d="M22.56,35.87a9.817,9.817,0,0,0,.762,3.817A3.916,3.916,0,0,0,27.78,42.3c3.346-.443,3.746-2.345,3.976-3.55a9.984,9.984,0,0,0-.408-4.114" style="fill:#deb7ff;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.6000000000000001px"/><ellipse cx="26.966" cy="35.236" rx="4.459" ry="0.932" transform="translate(-4.392 3.845) rotate(-7.543)" style="fill:#fff390;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.6000000000000001px"/><path d="M21.136,41.554c1.259-.681,2.017-1.539,1.856-1.962-.167-.439-1.388-.586-2.94-.131" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px"/><path d="M36.6,37.167c-1.308,0-2.421.245-2.54.733-.134.55,1.073,1.231,2.911,1.917" style="fill:none;stroke:#000;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.65px"/><path d="M24.266,39.378a3.232,3.232,0,0,0,2.8,1.877" style="fill:none;stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:0.6000000000000001px"/></g></svg></svg>`
    )
  );

  assert.stringEquals(expected, actual);
});

test("token attributes are set", () => {
  clearStore();

  const address = PEEK_A_BOO_ADDRESS.toHexString();
  const transferEvent = createTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );
  handleTransfer(transferEvent);

  const id = `${address}-0x1`;
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Ghost #1");
  // assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "description", "Smol Bodies");
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "image",
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48c3ZnIGlkPSJhODA5MTllYy0yNmEzLTRmMWEtOTYwNy0zYTg0OWUwNDllYjAiIGRhdGEtbmFtZT0iQmFja2dyb3VuZCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNjMuOTY5IDYzLjk2OSI+PGcgaWQ9ImYwYjIyNGJhLTMxNTMtNGU1MS1hOTE2LWMzZWZhMDg2NTBjOCIgZGF0YS1uYW1lPSJPcmFuZ2UiPjxyZWN0IHdpZHRoPSI2My45NjkiIGhlaWdodD0iNjMuOTY5IiBzdHlsZT0iZmlsbDojZmZjYTk5Ii8+PC9nPjwvc3ZnPjxzdmcgaWQ9ImU2YzMwNmQ3LTNmNTUtNGY1MS05YjgxLTNhZmE4ZmMxOTFjYSIgZGF0YS1uYW1lPSJCYWNrIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2My45NjkgNjMuOTY5Ij48ZyBpZD0iYmUyZTIzNDctZjUwZC00OWQ1LWEzMDYtYzhlMTcyZDNjYjI5IiBkYXRhLW5hbWU9IkJhdCBXaW5ncyBQaW5rIj48cGF0aCBkPSJNNDQuNCwyOC4wNjJhNC45NjQsNC45NjQsMCwwLDAsMy4zODMtMS42MDYsNS4wNjQsNS4wNjQsMCwwLDAsMS4xMjgtNC4xMzUuOTI5LjkyOSwwLDAsMCwuNTEzLjUxM2MuNy4yMTUsMS40NTctMS4wMTYsMi4wNS0xLjM2NywxLjE2Mi0uNjg3LDIuNjczLTEuMjc4LDYuNjMuMDM0YTIuMzc1LDIuMzc1LDAsMCwwLS40MSw0LjYxMywzLjE3NSwzLjE3NSwwLDAsMC0yLjI1NSw1LjA5MkE0LjQ0Niw0LjQ0NiwwLDAsMCw0OS4yNSwzMy4xMmEzLjE1OSwzLjE1OSwwLDAsMC0xLjQtMi4yNTUsMy4yLDMuMiwwLDAsMC0yLjgzNi0uMjA1WiIgc3R5bGU9ImZpbGw6I2ZmYzRlYztzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjAuNjVweCIvPjxwYXRoIGQ9Ik00OS4yODQsMjMuMDczYzEuMDM1LDAsMi41NzUtLjM4OSw0LjAxNy4xMzdhMTAuNjY3LDEwLjY2NywwLDAsMSw0LjAxNywyLjk4MiIgc3R5bGU9ImZpbGw6I2ZmYzRlYztzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjAuNjVweCIvPjxwYXRoIGQ9Ik00OS4yODQsMjMuMDczYTEwLjI1OCwxMC4yNTgsMCwwLDEsMy4wMDcsMi4zNTgsMTAuNDgzLDEwLjQ4MywwLDAsMSwyLjQyNiw1LjMiIHN0eWxlPSJmaWxsOiNmZmM0ZWM7c3Ryb2tlOiMwMDA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDowLjY1cHgiLz48cGF0aCBkPSJNNDkuMjUsMjMuMjA5YTkuMTM0LDkuMTM0LDAsMCwxLC4yLDkuNTU4IiBzdHlsZT0iZmlsbDojZmZjNGVjO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PC9nPjwvc3ZnPjxzdmcgaWQ9ImI2NWJlZDIzLWU2NmItNDhkMy04YmQ0LWZmYzg0ZmIyZmRlMSIgZGF0YS1uYW1lPSJCb2R5Q29sb3IiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDYzLjk2OSA2My45NjkiPjxnIGlkPSJhODQ2YjE3Yi0wZWNiLTQ5MDEtOTVmYy04YjYzODgyYjYyOWIiIGRhdGEtbmFtZT0iR3JlZW4iPjxwYXRoIGQ9Ik0yOC4zMTYsMTEuNjM4Yy01Ljc0LDEuMDc5LTkuNTEzLDUuOTEyLTEwLjkyNCwxMC4wNDctMS4xLDMuMjEyLS42MTUsNi4xMDUtLjQ4Myw5LjM4OS4zNjQsOSwuOTc0LDkuMTE4LjgsMTMuNzU0LS4xNDgsMy45Ny0yLjUxNyw2LjkxLTEuNzI3LDcuOTYzLDEuMDY0LDEuNDE5LDQuMzY3Ljg2Nyw3LjExMy0xLjAwOSwxLjk3NC0xLjM0OSw0Ljc2LTQuMDQ3LDcuNjc4LTMuODE3LDIuMjE2LjE3NSwyLjksMS45LDUuNDg0LDIuMTk0LDMuNDgyLjQsNC4xNjgtMi40NDYsNy40NTgtMy4wNzEsMS44ODEtLjM1NywzLjM3Ljg0LDYuMDEuNjQ3YTIuNjU0LDIuNjU0LDAsMCwwLDIuMjkyLTEuMjE3YzEuMTY5LTEuNTMyLTEuODc2LTMuOTkyLTMuODk0LTguODYyLTIuODIxLTYuODA4LTEuNzU1LTYuNjktNC4zNjUtMTQuNDc4LTEuNTgzLTQuNzIxLTMuNjc0LTguNzIyLTcuOTQxLTEwLjdBMTIuNDYsMTIuNDYsMCwwLDAsMjguMzE2LDExLjYzOFoiIHN0eWxlPSJmaWxsOiNkMWZmZWE7c3Ryb2tlOiMwMDA7c3Ryb2tlLW1pdGVybGltaXQ6MTA7c3Ryb2tlLXdpZHRoOjAuOHB4Ii8+PC9nPjwvc3ZnPjxzdmcgaWQ9ImZhNGYyNmRjLTViOWMtNDRmMi1iZDE4LTMzNWUyZTcyZjU3MSIgZGF0YS1uYW1lPSJDbG90aGVzIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2My45NjkgNjMuOTY5Ij48ZyBpZD0iZTUxYjk2MGUtODdkMS00YzZjLWEwMzAtOTNiNGZiZmUwOTZkIiBkYXRhLW5hbWU9IkNhcGUgUGluayI+PHBhdGggZD0iTTE3LjIsMzQuMjIyYTYzLjYwOCw2My42MDgsMCwwLDAsOS43NzMtLjU1NEE2NC4yNTMsNjQuMjUzLDAsMCwwLDQ1LjMsMjguMzIyIiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjEwO3N0cm9rZS13aWR0aDowLjY1cHgiLz48cGF0aCBkPSJNNDUuMywyOC4zMjJjMS4wNjIsMi43NTksMi40NTQsMy44NTksMy41NjcsNC4zNDQsMi44NzksMS4yNTMsNi4wNDEtLjY3OCw3LjE3Mi44NDUuNTg4Ljc5MiwwLDEuNjc1Ljg3NywzLjE4OGE1LjA2Miw1LjA2MiwwLDAsMCwuOTcyLDEuMmMuMjU4LjIzNi4zNDYuNzI0LjAzOS44OTJhOS40MTcsOS40MTcsMCwwLDAtMy43LDMuOTljLS4xNTUuMjktLjYyNy4xMzktLjcwNi0uMThhNC41MTYsNC41MTYsMCwwLDAtMS41NTgtMi41ODhjLTEuMzYtMS4wMjUtMi43NDUtLjUtMy44OTItLjk1Mi0xLjQ4My0uNTg0LTIuOTMxLTIuOTQxLTIuNzY2LTEwLjczNyIgc3R5bGU9ImZpbGw6I2ZmYzRlYztzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTI2Ljk3MywzMy42NjlsLTEuMjA2LDEuMTQ5YS4yNDkuMjQ5LDAsMCwwLS4wMDUuMzU2Yy4zNDYuMzQ2Ljc0My41MywxLjAwOC40MjUuMzg3LS4xNTQuNjI4LS45NzguMi0xLjkyOSIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTI3LjE5MiwzMy43MTdjLS4wNTEuMDY1LS4yNzguNDQ3LjY0MiwxLjUzNWEuMzIuMzIsMCwwLDAsLjM4OS4wNzhjLjMxOC0uMTYxLjc1Ny0uNDUxLjc3LS43QzI5LjAyNSwzNC4wNjIsMjcuNDExLDMzLjQzNywyNy4xOTIsMzMuNzE3WiIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PC9nPjwvc3ZnPjxzdmcgaWQ9ImUzM2MxOWQyLThmMGUtNDcyOS05MDk3LTQxYWZiNGM5NDVjNSIgZGF0YS1uYW1lPSJIYXQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDYzLjk2OSA2My45NjkiPjxnIGlkPSJlY2QwOWQyZS0zYzdmLTQ3NWYtOTY4Zi1iOGUzNTBmMmMwZTciIGRhdGEtbmFtZT0iQmVhbmllIFBpbmsiPjxwYXRoIGQ9Ik0zMi42MDcsMTAuNDI4QTIuNzE3LDIuNzE3LDAsMCwxLDMxLjg1NSw4QzMyLjExLDcuMTUxLDMzLDYuMzEyLDMzLjYsNi41MzNjLjQuMTQ3LjUzNy43MjEuNTgxLjk1N2EzLjExNCwzLjExNCwwLDAsMSwuOTU3LS45NTdjMS4xNjgtLjczMiwzLjEwNi0uNzg2LDMuNjU3LjIwNWEyLjMwOSwyLjMwOSwwLDAsMS0uMjczLDIuMDE2Yy4wNjItLjAyNi42ODktLjI3NywxLjAyNSwwLC4zNTMuMjkxLjM2MSwxLjE0NS0uMzA4LDEuODguMTE4LS4wMDYuNDQyLS4wMDkuNTQ3LjE3MS4xNjkuMjktLjYxOSwxLjA3My0uNjcyLDEuMTI4IiBzdHlsZT0iZmlsbDojZmZmMzkwO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTE4LjM2OCwxNi4xNDhBMTcuMzYxLDE3LjM2MSwwLDAsMSwyNy4xMzksMTAuN2MxLjUwOS0uMzc0LDcuOS0xLjk1NSwxMi40MzksMi4wNWExMS4zOCwxMS4zOCwwLDAsMSwzLjM0OSw1LjUzNiIgc3R5bGU9ImZpbGw6I2ZmYzRlYztzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjAuNjVweCIvPjxwYXRoIGQ9Ik0xNi40NzcsMjMuMTQxYTMzLjQsMzMuNCwwLDAsMSwxMC44MS0yLjkxNiwzNC40LDM0LjQsMCwwLDEsMTYuOSwyLjY3N2MuMTgtLjgwOC45MzQtMi42NzctLjEzNy00LjA4OWE0LDQsMCwwLDAtMS43NzctMS4yNzZjLTUuODk0LTIuMzU3LTEzLjMwNS0yLjM2OS0xMy4zMDUtMi4zNjktOS43LS4wMTYtMTEuMTExLDEuMDMtMTEuODQ3LDEuNzc3LTEuMDMxLDEuMDQ2LTIuNzU1LDMuNTQzLTEuOTE0LDUuMjRDMTUuNDQ0LDIyLjY1MSwxNi4xNzEsMjIuOTUxLDE2LjQ3NywyMy4xNDFaIiBzdHlsZT0iZmlsbDojZmZmMzkwO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTIyLjU2LDE1LjUyYTYuNjA3LDYuNjA3LDAsMCwwLC4zMzUsNS40MTYiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDowLjY1cHgiLz48cGF0aCBkPSJNMzAuMjQ4LDE1LjIwN2E5LjU1Nyw5LjU1NywwLDAsMCwuNDExLDQuNjg3IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTM3Ljk2NCwxNi4yMjhhNC42NzEsNC42NzEsMCwwLDEsLjUyMSwyLjQ3MSw0LjAxOSw0LjAxOSwwLDAsMS0uNTQ3LDEuOTQ4IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTE3LjUzNSwxNi41ODhhNC40NzMsNC40NzMsMCwwLDAtMS4yMjksMy4zNjQsNC4zNzYsNC4zNzYsMCwwLDAsMS4yNzksMi43MTUiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDowLjY1cHgiLz48L2c+PC9zdmc+PHN2ZyBpZD0iZWE1YmQ0ZDAtNTU0ZS00NTBkLWI1M2MtNmEyNzIwNGM5MjBjIiBkYXRhLW5hbWU9IkZhY2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDYzLjk2OSA2My45NjkiPjxnIGlkPSJiYTE0MzU2Ni03YjU3LTRhOWEtOTQwYS01N2Y0OWNkZWUyOTkiIGRhdGEtbmFtZT0iTmV1dHJhbCI+PGNpcmNsZSBjeD0iMTQuMTI0IiBjeT0iMjYuNzYzIiByPSIwLjk4NyIvPjxjaXJjbGUgY3g9IjMzLjY2OSIgY3k9IjI0LjQ0MyIgcj0iMC45ODciLz48bGluZSB4MT0iMjEuODA4IiB5MT0iMjYuOSIgeDI9IjI1LjA1NSIgeTI9IjI2LjQ5IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjEwO3N0cm9rZS13aWR0aDowLjcwMDAwMDAwMDAwMDAwMDFweCIvPjwvZz48L3N2Zz48c3ZnIGlkPSJmOGQ1MTRkNy04MTNiLTQ0YjItOTQ5Ny0yN2QxYTQ4MDFjNTUiIGRhdGEtbmFtZT0iSGFuZHMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDYzLjk2OSA2My45NjkiPjxnIGlkPSJhMzE5MTE2Zi0wMzM3LTRhZDAtYmVkYi1kMTk1ZGM4MDRhODAiIGRhdGEtbmFtZT0iQ3VwIFB1cnBsZSI+PHBhdGggZD0iTTMxLjE1NiwzNS4xNzZhMi4yNTcsMi4yNTcsMCwwLDEsMS45ODctLjM3NiwyLjA4MSwyLjA4MSwwLDAsMSwxLjE1MiwyYy4wMjcsMS4zMDgtMS4yODUsMi42NzEtMy41MzcsMy4xbC0uMDA4LTEuMzIyYTIuNDM2LDIuNDM2LDAsMCwwLDIuMjE4LTEuMzk0Yy4xMTQtLjM2Mi4xNDQtLjk2OS0uMTc4LTEuMTg4LS4zNDItLjIzMi0xLjA1MS0uMDExLTEuNjQyLjY5MVEzMS4xNTEsMzUuOTMyLDMxLjE1NiwzNS4xNzZaIiBzdHlsZT0iZmlsbDojZGViN2ZmO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC41NXB4Ii8+PHBhdGggZD0iTTIyLjU2LDM1Ljg3YTkuODE3LDkuODE3LDAsMCwwLC43NjIsMy44MTdBMy45MTYsMy45MTYsMCwwLDAsMjcuNzgsNDIuM2MzLjM0Ni0uNDQzLDMuNzQ2LTIuMzQ1LDMuOTc2LTMuNTVhOS45ODQsOS45ODQsMCwwLDAtLjQwOC00LjExNCIgc3R5bGU9ImZpbGw6I2RlYjdmZjtzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjAuNjAwMDAwMDAwMDAwMDAwMXB4Ii8+PGVsbGlwc2UgY3g9IjI2Ljk2NiIgY3k9IjM1LjIzNiIgcng9IjQuNDU5IiByeT0iMC45MzIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC00LjM5MiAzLjg0NSkgcm90YXRlKC03LjU0MykiIHN0eWxlPSJmaWxsOiNmZmYzOTA7c3Ryb2tlOiMwMDA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDowLjYwMDAwMDAwMDAwMDAwMDFweCIvPjxwYXRoIGQ9Ik0yMS4xMzYsNDEuNTU0YzEuMjU5LS42ODEsMi4wMTctMS41MzksMS44NTYtMS45NjItLjE2Ny0uNDM5LTEuMzg4LS41ODYtMi45NC0uMTMxIiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTM2LjYsMzcuMTY3Yy0xLjMwOCwwLTIuNDIxLjI0NS0yLjU0LjczMy0uMTM0LjU1LDEuMDczLDEuMjMxLDIuOTExLDEuOTE3IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTI0LjI2NiwzOS4zNzhhMy4yMzIsMy4yMzIsMCwwLDAsMi44LDEuODc3IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojZmZmO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42MDAwMDAwMDAwMDAwMDAxcHgiLz48L2c+PC9zdmc+PC9zdmc+"
  );

  return;
  // assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "video", "test-video");

  // const id = `${address}-0x1`;
  const collection = Collection.load(address) as Collection;
  const token = Token.load(id) as Token;
  updateTokenMetadata(collection, token, mockTokenData);

  // Assert token metadata was saved
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Ghost #1");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "description", "Smol Bodies");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "image", "test-image");
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "video", "test-video");

  // Assert related attributes were created
  const attributeId1 = `${address}-gender-male`;
  assert.fieldEquals(
    ATTRIBUTE_ENTITY_TYPE,
    attributeId1,
    "collection",
    address
  );
  assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, attributeId1, "name", "Gender");
  assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, attributeId1, "value", "male");

  const attributeId2 = `${address}-swol-size-0`;
  assert.fieldEquals(
    ATTRIBUTE_ENTITY_TYPE,
    attributeId2,
    "collection",
    address
  );
  assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, attributeId2, "name", "Swol Size");
  assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, attributeId2, "value", "0");

  // Assert attributes were attached to token
  assert.fieldEquals(
    TOKEN_ENTITY_TYPE,
    id,
    "attributes",
    `[${attributeId1}, ${attributeId2}]`
  );
});

// test("token attribute percentages are set", () => {
//   clearStore();

//   const address = Address.zero().toHexString();
//   const transferEvent1 = createTransferEvent(
//     Address.zero().toHexString(),
//     USER_ADDRESS,
//     1
//   );
//   transferEvent1.address = Address.zero();
//   handleTransfer(transferEvent1);

//   const transferEvent2 = createTransferEvent(
//     Address.zero().toHexString(),
//     USER_ADDRESS,
//     2
//   );
//   transferEvent2.address = Address.zero();
//   handleTransfer(transferEvent2);

//   const transferEvent3 = createTransferEvent(
//     Address.zero().toHexString(),
//     USER_ADDRESS,
//     3
//   );
//   transferEvent3.address = Address.zero();
//   handleTransfer(transferEvent3);

//   const collection = Collection.load(address) as Collection;
//   const token1 = Token.load(`${address}-0x1`) as Token;
//   const token2 = Token.load(`${address}-0x2`) as Token;
//   const token3 = Token.load(`${address}-0x3`) as Token;

//   updateTokenMetadata(
//     collection,
//     token1,
//     json
//       .fromBytes(
//         Bytes.fromUTF8(`
//       {
//         "name": "#1",
//         "description": "Smol Bodies",
//         "image": "https://gateway.pinata.cloud/ipfs/QmSqwxNFMeFtgdCnjBTTixx46Wi6TH9FtQ5jAp98JnAoeR/2/0.png",
//         "attributes": [
//           {
//             "trait_type": "Gender",
//             "value": "male"
//           },
//           {
//             "trait_type": "Background",
//             "value": "dojo"
//           }
//         ]
//       }
//     `)
//       )
//       .toObject()
//   );

//   updateTokenMetadata(
//     collection,
//     token2,
//     json
//       .fromBytes(
//         Bytes.fromUTF8(`
//       {
//         "name": "#2",
//         "description": "Smol Bodies",
//         "image": "https://gateway.pinata.cloud/ipfs/QmSqwxNFMeFtgdCnjBTTixx46Wi6TH9FtQ5jAp98JnAoeR/2/0.png",
//         "attributes": [
//           {
//             "trait_type": "Gender",
//             "value": "male"
//           },
//           {
//             "trait_type": "Background",
//             "value": "alley"
//           }
//         ]
//       }
//     `)
//       )
//       .toObject()
//   );

//   updateTokenMetadata(
//     collection,
//     token3,
//     json
//       .fromBytes(
//         Bytes.fromUTF8(`
//       {
//         "name": "#3",
//         "description": "Smol Bodies",
//         "image": "https://gateway.pinata.cloud/ipfs/QmSqwxNFMeFtgdCnjBTTixx46Wi6TH9FtQ5jAp98JnAoeR/3/0.png",
//         "attributes": [
//           {
//             "trait_type": "Gender",
//             "value": "female"
//           },
//           {
//             "trait_type": "Background",
//             "value": "gym"
//           }
//         ]
//       }
//     `)
//       )
//       .toObject()
//   );

//   // Assert attribute percentages
//   assert.fieldEquals(
//     ATTRIBUTE_ENTITY_TYPE,
//     `${address}-gender-male`,
//     "percentage",
//     "0.6666666666"
//   );
//   assert.fieldEquals(
//     ATTRIBUTE_ENTITY_TYPE,
//     `${address}-gender-female`,
//     "percentage",
//     "0.3333333333"
//   );
//   assert.fieldEquals(
//     ATTRIBUTE_ENTITY_TYPE,
//     `${address}-background-dojo`,
//     "percentage",
//     "0.3333333333"
//   );
//   assert.fieldEquals(
//     ATTRIBUTE_ENTITY_TYPE,
//     `${address}-background-alley`,
//     "percentage",
//     "0.3333333333"
//   );
//   assert.fieldEquals(
//     ATTRIBUTE_ENTITY_TYPE,
//     `${address}-background-gym`,
//     "percentage",
//     "0.3333333333"
//   );
// });

// test("token attribute percentages are not set until threshold is met", () => {
//   clearStore();

//   const transferEvent = createTransferEvent(
//     Address.zero().toHexString(),
//     USER_ADDRESS,
//     1
//   );
//   handleTransfer(transferEvent);

//   const collection = Collection.load(
//     transferEvent.address.toHexString()
//   ) as Collection;
//   const token = Token.load(
//     `${transferEvent.address.toHexString()}-0x1`
//   ) as Token;
//   updateTokenMetadata(collection, token, mockTokenData);

//   // Assert attribute percentages were not updated
//   const attribute = Attribute.load(
//     `${transferEvent.address.toHexString()}-gender-male`
//   ) as Attribute;
//   const percentage = attribute.percentage
//     ? (attribute.percentage as BigDecimal).toString()
//     : "unknown";
//   assert.assertTrue(percentage == "unknown");
// });
