import { ipfs, json, JSONValue, log, TypedMap } from "@graphprotocol/graph-ts";
import { Collection } from "../../generated/schema";

export type JSON = TypedMap<string, JSONValue>;

export function getJsonStringValue(json: JSON, attribute: string): string | null {
  const value = json.get(attribute);
  return value ? value.toString() : null;
}

export function getCollectionJson(collection: Collection, path: string): JSON | null {
  const baseUri = collection.baseUri;
  if (!baseUri) {
    log.error("Unknown base URI for collection: {}", [collection.id]);
    return null;
  }

  const ipfsPath = `${(baseUri as string).replace("ipfs://", "")}${path}`;
  const data = ipfs.cat(ipfsPath);
  if (!data) {
    log.error("Missing IPFS data at path: {}", [ipfsPath]);
    return null;
  }

  return json.fromBytes(data).toObject();
}
