export function titleFormat(title: string) {
  const formatted = title.toLocaleLowerCase().replaceAll(" ", "-");

  return formatted;
}

export function toCamelCase(title: string): string {
  return title
    .trim()
    .split(/[\s\-_]+/)
    .map((word, i) =>
      i === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join("");
}
