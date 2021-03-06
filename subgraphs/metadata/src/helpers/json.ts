import {
  JSONValue,
  JSONValueKind,
  TypedMap,
  ipfs,
  json,
  log,
} from "@graphprotocol/graph-ts";

export type JSON = TypedMap<string, JSONValue>;

const MAX_RETRIES = 2;

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
    .replace("https://gateway.pinata.cloud/ipfs/", "")
    .replace("https://treasure-marketplace.mypinata.cloud/ipfs/", "")
    .replace("https://thelostdonkeys.mypinata.cloud/ipfs/", "")
    .replace("https://treasuredao.mypinata.cloud/ipfs/", "");

  // Exit out of IPFS fetch if we did not parse its hash
  if (normalizedPath.indexOf("Q") != 0) {
    return null;
  }

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
