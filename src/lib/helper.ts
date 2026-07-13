export function titleFormat(title: string) {
  const formatted = title.toLocaleLowerCase().replaceAll(" ", "-");

  return formatted;
}
