import {
  assert,
  clearStore,
  createMockedFunction,
  logStore,
  newMockEvent,
  test,
} from "matchstick-as";

import {
  Address,
  BigDecimal,
  BigInt,
  Bytes,
  ethereum,
  json,
} from "@graphprotocol/graph-ts";

import { Transfer } from "../generated/Tales of Elleria/ERC721";
import { Attribute, Collection, Token } from "../generated/schema";
import { handleTransfer } from "../src/mappings/tales-of-elleria";
import {
  ATTRIBUTE_ENTITY_TYPE,
  TOKEN_ENTITY_TYPE,
  USER_ADDRESS,
} from "./utils";

export const TALES_OF_ELLERIA_ADDRESS = Address.fromString(
  "0x461950b159366edcd2bcbee8126d973ac4929999"
);

export const createTransferEvent = (
  from: string,
  to: string,
  tokenId: i32
): Transfer => {
  const event = changetype<Transfer>(newMockEvent());
  event.address = TALES_OF_ELLERIA_ADDRESS;
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

// const mockTokenData = json
//   .fromBytes(
//     Bytes.fromUTF8(`
//     {
//       "name": "#1",
//       "description": "Smol Bodies",
//       "image": "test-image",
//       "video": "test-video",
//       "attributes": [
//         {
//           "trait_type": "Gender",
//           "value": "male"
//         },
//         {
//           "trait_type": "Swol Size",
//           "value": 0
//         }
//       ]
//     }
//   `)
//   )
//   .toObject();

createMockedFunction(
  TALES_OF_ELLERIA_ADDRESS,
  "tokenURI",
  "tokenURI(uint256):(string)"
)
  .withArgs([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(1))])
  .returns([
    ethereum.Value.fromString(
      "1;https://ipfs.moralis.io:2053/ipfs/Qmaz7KeBF4sEHZbdQ1pfuBG9qWhsxF2xMJ72CbdW1Tbcr1;84;94;75;25;25;5;308;2;Assassin;1;0;1648214189;0"
    ),
  ]);

test("token attributes are set", () => {
  clearStore();

  const address = TALES_OF_ELLERIA_ADDRESS.toHexString();
  const transferEvent = createTransferEvent(
    Address.zero().toHexString(),
    USER_ADDRESS,
    1
  );
  handleTransfer(transferEvent);

  const id = `${address}-0x1`;
  assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Hero #1");

  logStore();
  // assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "description", "Smol Bodies");
  // assert.fieldEquals(
  //   TOKEN_ENTITY_TYPE,
  //   id,
  //   "image",
  //   "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48c3ZnIGlkPSJhODA5MTllYy0yNmEzLTRmMWEtOTYwNy0zYTg0OWUwNDllYjAiIGRhdGEtbmFtZT0iQmFja2dyb3VuZCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgNjMuOTY5IDYzLjk2OSI+PGcgaWQ9ImYwYjIyNGJhLTMxNTMtNGU1MS1hOTE2LWMzZWZhMDg2NTBjOCIgZGF0YS1uYW1lPSJPcmFuZ2UiPjxyZWN0IHdpZHRoPSI2My45NjkiIGhlaWdodD0iNjMuOTY5IiBzdHlsZT0iZmlsbDojZmZjYTk5Ii8+PC9nPjwvc3ZnPjxzdmcgaWQ9ImU2YzMwNmQ3LTNmNTUtNGY1MS05YjgxLTNhZmE4ZmMxOTFjYSIgZGF0YS1uYW1lPSJCYWNrIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2My45NjkgNjMuOTY5Ij48ZyBpZD0iYmUyZTIzNDctZjUwZC00OWQ1LWEzMDYtYzhlMTcyZDNjYjI5IiBkYXRhLW5hbWU9IkJhdCBXaW5ncyBQaW5rIj48cGF0aCBkPSJNNDQuNCwyOC4wNjJhNC45NjQsNC45NjQsMCwwLDAsMy4zODMtMS42MDYsNS4wNjQsNS4wNjQsMCwwLDAsMS4xMjgtNC4xMzUuOTI5LjkyOSwwLDAsMCwuNTEzLjUxM2MuNy4yMTUsMS40NTctMS4wMTYsMi4wNS0xLjM2NywxLjE2Mi0uNjg3LDIuNjczLTEuMjc4LDYuNjMuMDM0YTIuMzc1LDIuMzc1LDAsMCwwLS40MSw0LjYxMywzLjE3NSwzLjE3NSwwLDAsMC0yLjI1NSw1LjA5MkE0LjQ0Niw0LjQ0NiwwLDAsMCw0OS4yNSwzMy4xMmEzLjE1OSwzLjE1OSwwLDAsMC0xLjQtMi4yNTUsMy4yLDMuMiwwLDAsMC0yLjgzNi0uMjA1WiIgc3R5bGU9ImZpbGw6I2ZmYzRlYztzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjAuNjVweCIvPjxwYXRoIGQ9Ik00OS4yODQsMjMuMDczYzEuMDM1LDAsMi41NzUtLjM4OSw0LjAxNy4xMzdhMTAuNjY3LDEwLjY2NywwLDAsMSw0LjAxNywyLjk4MiIgc3R5bGU9ImZpbGw6I2ZmYzRlYztzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjAuNjVweCIvPjxwYXRoIGQ9Ik00OS4yODQsMjMuMDczYTEwLjI1OCwxMC4yNTgsMCwwLDEsMy4wMDcsMi4zNTgsMTAuNDgzLDEwLjQ4MywwLDAsMSwyLjQyNiw1LjMiIHN0eWxlPSJmaWxsOiNmZmM0ZWM7c3Ryb2tlOiMwMDA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDowLjY1cHgiLz48cGF0aCBkPSJNNDkuMjUsMjMuMjA5YTkuMTM0LDkuMTM0LDAsMCwxLC4yLDkuNTU4IiBzdHlsZT0iZmlsbDojZmZjNGVjO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PC9nPjwvc3ZnPjxzdmcgaWQ9ImI2NWJlZDIzLWU2NmItNDhkMy04YmQ0LWZmYzg0ZmIyZmRlMSIgZGF0YS1uYW1lPSJCb2R5Q29sb3IiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDYzLjk2OSA2My45NjkiPjxnIGlkPSJhODQ2YjE3Yi0wZWNiLTQ5MDEtOTVmYy04YjYzODgyYjYyOWIiIGRhdGEtbmFtZT0iR3JlZW4iPjxwYXRoIGQ9Ik0yOC4zMTYsMTEuNjM4Yy01Ljc0LDEuMDc5LTkuNTEzLDUuOTEyLTEwLjkyNCwxMC4wNDctMS4xLDMuMjEyLS42MTUsNi4xMDUtLjQ4Myw5LjM4OS4zNjQsOSwuOTc0LDkuMTE4LjgsMTMuNzU0LS4xNDgsMy45Ny0yLjUxNyw2LjkxLTEuNzI3LDcuOTYzLDEuMDY0LDEuNDE5LDQuMzY3Ljg2Nyw3LjExMy0xLjAwOSwxLjk3NC0xLjM0OSw0Ljc2LTQuMDQ3LDcuNjc4LTMuODE3LDIuMjE2LjE3NSwyLjksMS45LDUuNDg0LDIuMTk0LDMuNDgyLjQsNC4xNjgtMi40NDYsNy40NTgtMy4wNzEsMS44ODEtLjM1NywzLjM3Ljg0LDYuMDEuNjQ3YTIuNjU0LDIuNjU0LDAsMCwwLDIuMjkyLTEuMjE3YzEuMTY5LTEuNTMyLTEuODc2LTMuOTkyLTMuODk0LTguODYyLTIuODIxLTYuODA4LTEuNzU1LTYuNjktNC4zNjUtMTQuNDc4LTEuNTgzLTQuNzIxLTMuNjc0LTguNzIyLTcuOTQxLTEwLjdBMTIuNDYsMTIuNDYsMCwwLDAsMjguMzE2LDExLjYzOFoiIHN0eWxlPSJmaWxsOiNkMWZmZWE7c3Ryb2tlOiMwMDA7c3Ryb2tlLW1pdGVybGltaXQ6MTA7c3Ryb2tlLXdpZHRoOjAuOHB4Ii8+PC9nPjwvc3ZnPjxzdmcgaWQ9ImZhNGYyNmRjLTViOWMtNDRmMi1iZDE4LTMzNWUyZTcyZjU3MSIgZGF0YS1uYW1lPSJDbG90aGVzIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2My45NjkgNjMuOTY5Ij48ZyBpZD0iZTUxYjk2MGUtODdkMS00YzZjLWEwMzAtOTNiNGZiZmUwOTZkIiBkYXRhLW5hbWU9IkNhcGUgUGluayI+PHBhdGggZD0iTTE3LjIsMzQuMjIyYTYzLjYwOCw2My42MDgsMCwwLDAsOS43NzMtLjU1NEE2NC4yNTMsNjQuMjUzLDAsMCwwLDQ1LjMsMjguMzIyIiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjEwO3N0cm9rZS13aWR0aDowLjY1cHgiLz48cGF0aCBkPSJNNDUuMywyOC4zMjJjMS4wNjIsMi43NTksMi40NTQsMy44NTksMy41NjcsNC4zNDQsMi44NzksMS4yNTMsNi4wNDEtLjY3OCw3LjE3Mi44NDUuNTg4Ljc5MiwwLDEuNjc1Ljg3NywzLjE4OGE1LjA2Miw1LjA2MiwwLDAsMCwuOTcyLDEuMmMuMjU4LjIzNi4zNDYuNzI0LjAzOS44OTJhOS40MTcsOS40MTcsMCwwLDAtMy43LDMuOTljLS4xNTUuMjktLjYyNy4xMzktLjcwNi0uMThhNC41MTYsNC41MTYsMCwwLDAtMS41NTgtMi41ODhjLTEuMzYtMS4wMjUtMi43NDUtLjUtMy44OTItLjk1Mi0xLjQ4My0uNTg0LTIuOTMxLTIuOTQxLTIuNzY2LTEwLjczNyIgc3R5bGU9ImZpbGw6I2ZmYzRlYztzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTI2Ljk3MywzMy42NjlsLTEuMjA2LDEuMTQ5YS4yNDkuMjQ5LDAsMCwwLS4wMDUuMzU2Yy4zNDYuMzQ2Ljc0My41MywxLjAwOC40MjUuMzg3LS4xNTQuNjI4LS45NzguMi0xLjkyOSIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTI3LjE5MiwzMy43MTdjLS4wNTEuMDY1LS4yNzguNDQ3LjY0MiwxLjUzNWEuMzIuMzIsMCwwLDAsLjM4OS4wNzhjLjMxOC0uMTYxLjc1Ny0uNDUxLjc3LS43QzI5LjAyNSwzNC4wNjIsMjcuNDExLDMzLjQzNywyNy4xOTIsMzMuNzE3WiIgc3R5bGU9ImZpbGw6bm9uZTtzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbWl0ZXJsaW1pdDoxMDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PC9nPjwvc3ZnPjxzdmcgaWQ9ImUzM2MxOWQyLThmMGUtNDcyOS05MDk3LTQxYWZiNGM5NDVjNSIgZGF0YS1uYW1lPSJIYXQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDYzLjk2OSA2My45NjkiPjxnIGlkPSJlY2QwOWQyZS0zYzdmLTQ3NWYtOTY4Zi1iOGUzNTBmMmMwZTciIGRhdGEtbmFtZT0iQmVhbmllIFBpbmsiPjxwYXRoIGQ9Ik0zMi42MDcsMTAuNDI4QTIuNzE3LDIuNzE3LDAsMCwxLDMxLjg1NSw4QzMyLjExLDcuMTUxLDMzLDYuMzEyLDMzLjYsNi41MzNjLjQuMTQ3LjUzNy43MjEuNTgxLjk1N2EzLjExNCwzLjExNCwwLDAsMSwuOTU3LS45NTdjMS4xNjgtLjczMiwzLjEwNi0uNzg2LDMuNjU3LjIwNWEyLjMwOSwyLjMwOSwwLDAsMS0uMjczLDIuMDE2Yy4wNjItLjAyNi42ODktLjI3NywxLjAyNSwwLC4zNTMuMjkxLjM2MSwxLjE0NS0uMzA4LDEuODguMTE4LS4wMDYuNDQyLS4wMDkuNTQ3LjE3MS4xNjkuMjktLjYxOSwxLjA3My0uNjcyLDEuMTI4IiBzdHlsZT0iZmlsbDojZmZmMzkwO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTE4LjM2OCwxNi4xNDhBMTcuMzYxLDE3LjM2MSwwLDAsMSwyNy4xMzksMTAuN2MxLjUwOS0uMzc0LDcuOS0xLjk1NSwxMi40MzksMi4wNWExMS4zOCwxMS4zOCwwLDAsMSwzLjM0OSw1LjUzNiIgc3R5bGU9ImZpbGw6I2ZmYzRlYztzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjAuNjVweCIvPjxwYXRoIGQ9Ik0xNi40NzcsMjMuMTQxYTMzLjQsMzMuNCwwLDAsMSwxMC44MS0yLjkxNiwzNC40LDM0LjQsMCwwLDEsMTYuOSwyLjY3N2MuMTgtLjgwOC45MzQtMi42NzctLjEzNy00LjA4OWE0LDQsMCwwLDAtMS43NzctMS4yNzZjLTUuODk0LTIuMzU3LTEzLjMwNS0yLjM2OS0xMy4zMDUtMi4zNjktOS43LS4wMTYtMTEuMTExLDEuMDMtMTEuODQ3LDEuNzc3LTEuMDMxLDEuMDQ2LTIuNzU1LDMuNTQzLTEuOTE0LDUuMjRDMTUuNDQ0LDIyLjY1MSwxNi4xNzEsMjIuOTUxLDE2LjQ3NywyMy4xNDFaIiBzdHlsZT0iZmlsbDojZmZmMzkwO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTIyLjU2LDE1LjUyYTYuNjA3LDYuNjA3LDAsMCwwLC4zMzUsNS40MTYiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDowLjY1cHgiLz48cGF0aCBkPSJNMzAuMjQ4LDE1LjIwN2E5LjU1Nyw5LjU1NywwLDAsMCwuNDExLDQuNjg3IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTM3Ljk2NCwxNi4yMjhhNC42NzEsNC42NzEsMCwwLDEsLjUyMSwyLjQ3MSw0LjAxOSw0LjAxOSwwLDAsMS0uNTQ3LDEuOTQ4IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTE3LjUzNSwxNi41ODhhNC40NzMsNC40NzMsMCwwLDAtMS4yMjksMy4zNjQsNC4zNzYsNC4zNzYsMCwwLDAsMS4yNzksMi43MTUiIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlOiMwMDA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDowLjY1cHgiLz48L2c+PC9zdmc+PHN2ZyBpZD0iZWE1YmQ0ZDAtNTU0ZS00NTBkLWI1M2MtNmEyNzIwNGM5MjBjIiBkYXRhLW5hbWU9IkZhY2UiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDYzLjk2OSA2My45NjkiPjxnIGlkPSJiYTE0MzU2Ni03YjU3LTRhOWEtOTQwYS01N2Y0OWNkZWUyOTkiIGRhdGEtbmFtZT0iTmV1dHJhbCI+PGNpcmNsZSBjeD0iMTQuMTI0IiBjeT0iMjYuNzYzIiByPSIwLjk4NyIvPjxjaXJjbGUgY3g9IjMzLjY2OSIgY3k9IjI0LjQ0MyIgcj0iMC45ODciLz48bGluZSB4MT0iMjEuODA4IiB5MT0iMjYuOSIgeDI9IjI1LjA1NSIgeTI9IjI2LjQ5IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1taXRlcmxpbWl0OjEwO3N0cm9rZS13aWR0aDowLjcwMDAwMDAwMDAwMDAwMDFweCIvPjwvZz48L3N2Zz48c3ZnIGlkPSJmOGQ1MTRkNy04MTNiLTQ0YjItOTQ5Ny0yN2QxYTQ4MDFjNTUiIGRhdGEtbmFtZT0iSGFuZHMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDYzLjk2OSA2My45NjkiPjxnIGlkPSJhMzE5MTE2Zi0wMzM3LTRhZDAtYmVkYi1kMTk1ZGM4MDRhODAiIGRhdGEtbmFtZT0iQ3VwIFB1cnBsZSI+PHBhdGggZD0iTTMxLjE1NiwzNS4xNzZhMi4yNTcsMi4yNTcsMCwwLDEsMS45ODctLjM3NiwyLjA4MSwyLjA4MSwwLDAsMSwxLjE1MiwyYy4wMjcsMS4zMDgtMS4yODUsMi42NzEtMy41MzcsMy4xbC0uMDA4LTEuMzIyYTIuNDM2LDIuNDM2LDAsMCwwLDIuMjE4LTEuMzk0Yy4xMTQtLjM2Mi4xNDQtLjk2OS0uMTc4LTEuMTg4LS4zNDItLjIzMi0xLjA1MS0uMDExLTEuNjQyLjY5MVEzMS4xNTEsMzUuOTMyLDMxLjE1NiwzNS4xNzZaIiBzdHlsZT0iZmlsbDojZGViN2ZmO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC41NXB4Ii8+PHBhdGggZD0iTTIyLjU2LDM1Ljg3YTkuODE3LDkuODE3LDAsMCwwLC43NjIsMy44MTdBMy45MTYsMy45MTYsMCwwLDAsMjcuNzgsNDIuM2MzLjM0Ni0uNDQzLDMuNzQ2LTIuMzQ1LDMuOTc2LTMuNTVhOS45ODQsOS45ODQsMCwwLDAtLjQwOC00LjExNCIgc3R5bGU9ImZpbGw6I2RlYjdmZjtzdHJva2U6IzAwMDtzdHJva2UtbGluZWNhcDpyb3VuZDtzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlLXdpZHRoOjAuNjAwMDAwMDAwMDAwMDAwMXB4Ii8+PGVsbGlwc2UgY3g9IjI2Ljk2NiIgY3k9IjM1LjIzNiIgcng9IjQuNDU5IiByeT0iMC45MzIiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC00LjM5MiAzLjg0NSkgcm90YXRlKC03LjU0MykiIHN0eWxlPSJmaWxsOiNmZmYzOTA7c3Ryb2tlOiMwMDA7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO3N0cm9rZS13aWR0aDowLjYwMDAwMDAwMDAwMDAwMDFweCIvPjxwYXRoIGQ9Ik0yMS4xMzYsNDEuNTU0YzEuMjU5LS42ODEsMi4wMTctMS41MzksMS44NTYtMS45NjItLjE2Ny0uNDM5LTEuMzg4LS41ODYtMi45NC0uMTMxIiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTM2LjYsMzcuMTY3Yy0xLjMwOCwwLTIuNDIxLjI0NS0yLjU0LjczMy0uMTM0LjU1LDEuMDczLDEuMjMxLDIuOTExLDEuOTE3IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42NXB4Ii8+PHBhdGggZD0iTTI0LjI2NiwzOS4zNzhhMy4yMzIsMy4yMzIsMCwwLDAsMi44LDEuODc3IiBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojZmZmO3N0cm9rZS1saW5lY2FwOnJvdW5kO3N0cm9rZS1saW5lam9pbjpyb3VuZDtzdHJva2Utd2lkdGg6MC42MDAwMDAwMDAwMDAwMDAxcHgiLz48L2c+PC9zdmc+PC9zdmc+"
  // );

  // return;
  // // assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "video", "test-video");

  // // const id = `${address}-0x1`;
  // const collection = Collection.load(address) as Collection;
  // const token = Token.load(id) as Token;
  // // updateTokenMetadata(collection, token, mockTokenData);

  // // Assert token metadata was saved
  // assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "name", "Ghost #1");
  // assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "description", "Smol Bodies");
  // assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "image", "test-image");
  // assert.fieldEquals(TOKEN_ENTITY_TYPE, id, "video", "test-video");

  // // Assert related attributes were created
  // const attributeId1 = `${address}-gender-male`;
  // assert.fieldEquals(
  //   ATTRIBUTE_ENTITY_TYPE,
  //   attributeId1,
  //   "collection",
  //   address
  // );
  // assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, attributeId1, "name", "Gender");
  // assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, attributeId1, "value", "male");

  // const attributeId2 = `${address}-swol-size-0`;
  // assert.fieldEquals(
  //   ATTRIBUTE_ENTITY_TYPE,
  //   attributeId2,
  //   "collection",
  //   address
  // );
  // assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, attributeId2, "name", "Swol Size");
  // assert.fieldEquals(ATTRIBUTE_ENTITY_TYPE, attributeId2, "value", "0");

  // // Assert attributes were attached to token
  // assert.fieldEquals(
  //   TOKEN_ENTITY_TYPE,
  //   id,
  //   "attributes",
  //   `[${attributeId1}, ${attributeId2}]`
  // );
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
