import { JSONValue, JSONValueKind, TypedMap } from "@graphprotocol/graph-ts";

export type JSON = TypedMap<string, JSONValue>;

export function getJsonStringValue(
  json: JSON,
  attribute: string
): string | null {
  const valueData = json.get(attribute);
  if (!valueData) {
    return null;
  }

  return valueData.kind === JSONValueKind.NUMBER
    ? valueData.toI64().toString()
    : valueData.toString();
}
