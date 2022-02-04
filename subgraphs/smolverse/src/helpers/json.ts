import { JSONValue, TypedMap } from "@graphprotocol/graph-ts";

export function getJsonStringValue(json: TypedMap<string, JSONValue>, attribute: string): string | null {
  const value = json.get(attribute);
  return value ? value.toString() : null;
}
