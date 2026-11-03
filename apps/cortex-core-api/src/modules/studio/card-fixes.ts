/**
 * Fixes for cards flagged in "Sức khoẻ nội dung" (issue #62): hide a card for
 * now, or give it a new example sentence. Pure checks, unit tested.
 */

/** Longest sentence a card may carry (same limit as an edit in Studio). */
export const MAX_SCENARIO = 200;

/**
 * The new sentence must still teach the word: Lexica drops a sentence that
 * does not contain it, so a rewrite without the word would change nothing.
 */
export function checkRewrite(word: string, scenario: string): string | null {
  const text = scenario.trim();
  if (text.length === 0) return 'Câu mới đang trống';
  if (text.length > MAX_SCENARIO) return `Câu dài quá ${MAX_SCENARIO} ký tự`;
  if (!text.toLowerCase().includes(word.trim().toLowerCase()))
    return `Câu mới phải chứa từ "${word}"`;
  return null;
}

/** The ids Lexica must not show: cards retired in Studio plus cards hidden for now. */
export function retiredIds(
  retiredCards: readonly string[],
  hidden: readonly string[],
): string[] {
  return [...new Set([...retiredCards, ...hidden])].sort();
}
