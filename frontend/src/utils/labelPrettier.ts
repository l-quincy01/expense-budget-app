export function prettyLabel(cat: string) {
  return cat
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replaceAll("And", "&")
    .trim();
}
