import { Bytes, ByteArray, ethereum, BigInt } from "@graphprotocol/graph-ts";
import {
  assert,
  createMockedFunction,
  newMockEvent,
  test,
} from "matchstick-as/assembly";

const INPUT = Bytes.fromHexString(
  "0x09c2d0110000000000000000000000000000000000000000000000000000000000000002"
  // "0x654cfdff0000000000000000000000000000000000000000000000038bbec7e709c2d0110000000000000000000000000000000000000000000000000000000000000002"
) as Bytes;

const tuplePrefix = ByteArray.fromHexString(
  "0x0000000000000000000000000000000000000000000000000000000000000020"
);

test("decode input", () => {
  let ev = newMockEvent();

  ev.transaction.input = INPUT;

  const functionInput = ev.transaction.input.subarray(4);

  const functionInputAsTuple = new Uint8Array(
    tuplePrefix.length + functionInput.length
  );

  //concat prefix & original input
  functionInputAsTuple.set(tuplePrefix, 0);
  functionInputAsTuple.set(functionInput, tuplePrefix.length);

  const tupleInputBytes = Bytes.fromUint8Array(functionInputAsTuple);

  const decoded = ethereum.decode("(uint256,uint8)", tupleInputBytes);

  if (decoded) {
    const t = decoded.toTuple();
    const amount = t[0].toBigInt();
    const lock = t[1].toBigInt()

    assert.stringEquals(amount.toString(), amount.toString());
  }
});
