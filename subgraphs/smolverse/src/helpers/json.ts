import {
  ipfs,
  json,
  JSONValue,
  JSONValueKind,
  log,
  TypedMap,
} from "@graphprotocol/graph-ts";

const MAX_RETRIES = 2;

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

export function getIpfsJson(path: string, retries: i32 = 0): JSON | null {
  const normalizedPath = path
    .replace("ipfs://", "")
    .replace("https://treasure-marketplace.mypinata.cloud/ipfs/", "");
  const data = ipfs.cat(normalizedPath);
  if (!data) {
    if (retries > MAX_RETRIES) {
      log.error("[json] IPFS data not found, max retries: {}", [
        normalizedPath,
      ]);
      return null;
    }

    log.warning("[json] IPFS data not found, retry: {}", [normalizedPath]);
    return getIpfsJson(path, retries + 1);
  }

  return json.fromBytes(data).toObject();
}
