export function stringToSlug(str: string): string {
  return str.toLowerCase().split(" ").join("-");
}
