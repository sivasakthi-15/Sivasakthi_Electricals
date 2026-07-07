const ALWAYS_UPPER = [
  "PVC",
  "UPVC",
  "CPVC",
  "HDPE",
  "GI",
  "LED",
  "MCB",
  "RCCB",
  "ELCB",
  "RCC",
  "ISI",
  "ISI",
];

export function formatName(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((word) => {
      const upper = word.toUpperCase();

      if (ALWAYS_UPPER.includes(upper)) {
        return upper;
      }

      return (
        word.charAt(0).toUpperCase() +
        word.slice(1).toLowerCase()
      );
    })
    .join(" ");
}