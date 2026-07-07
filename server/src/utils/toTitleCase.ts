export function toTitleCase(text: string) {
  return text
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(" ");
}