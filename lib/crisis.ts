const CRISIS_KEYWORDS = [
  "suicidal", "suicide", "kill myself", "end my life", "hurt myself",
  "self harm", "self-harm", "not worth living", "end it all", "want to die",
  "rather be dead", "no reason to live", "can't go on",
];

export function hasCrisisKeywords(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}
