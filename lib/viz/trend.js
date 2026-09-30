/**
 * Map raw change direction + trendPreference → semantic tone.
 * up/down are descriptive only; tone encodes whether the change is desirable.
 */

export function resolveTrendTone(changeDirection, trendPreference = "neutral") {
  if (!changeDirection || changeDirection === "flat") return "neutral";
  const pref = trendPreference || "neutral";

  if (pref === "neutral") return "neutral";

  if (pref === "higher_is_better") {
    if (changeDirection === "up") return "positive";
    if (changeDirection === "down") return "negative";
  }

  if (pref === "lower_is_better") {
    if (changeDirection === "down") return "positive";
    if (changeDirection === "up") return "negative";
  }

  return "neutral";
}
