export function titleFormat(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function toCamelCase(title: string): string {
  return title
    .trim()
    .replace(/[^a-zA-Z0-9\s\-_]/g, "")
    .split(/[\s\-_]+/)
    .filter(Boolean)
    .map((word, i) =>
      i === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");
}
