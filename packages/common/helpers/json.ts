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

export function normalizeIpfsPath(path: string): string | null {
  const pathParts = path.replace("ipfs://", "").split("/ipfs/");
  const normalizedPath = pathParts[pathParts.length - 1];
  return normalizedPath.indexOf("Q") === 0 ? normalizedPath : null;
}

export function getIpfsJson(path: string, retries: i32 = 0): JSON | null {
  const normalizedPath = normalizeIpfsPath(path);

  if (!normalizedPath) {
    log.warning("[json] Unrecognized IPFS path: {}", [path]);
    return null;
  }

  const data = ipfs.cat(normalizedPath as string);
  if (!data) {
    if (retries > MAX_RETRIES) {
      log.error("[json] IPFS data not found, max retries: {}", [
        normalizedPath as string,
      ]);

      return null;
    }

    log.warning("[json] IPFS data not found, retry: {}", [
      normalizedPath as string,
    ]);
    return getIpfsJson(normalizedPath as string, retries + 1);
  }

  return json.fromBytes(data).toObject();
}
