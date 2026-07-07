const SPECIAL_WORDS: Record<string, string> = {
  pvc: "PVC",
  upvc: "UPVC",
  cpvc: "CPVC",
  led: "LED",
  mcb: "MCB",
  rccb: "RCCB",
  elcb: "ELCB",
  gi: "GI",
  isi: "ISI",
  ac: "AC",
  dc: "DC",
};

export function formatName(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((word) => {
      const key = word.toLowerCase();

      if (SPECIAL_WORDS[key]) {
        return SPECIAL_WORDS[key];
      }

      return key.charAt(0).toUpperCase() + key.slice(1);
    })
    .join(" ");
}