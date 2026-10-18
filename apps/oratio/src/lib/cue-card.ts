/**
 * IELTS Part 2 cue cards are stored as one sentence:
 * "Describe a person you admire. You should say: who this person is, how you
 * know them, what qualities they have, and explain why you admire them."
 * This splits it into the task and its bullet points for display.
 */
export function parseCueCard(text: string): { task: string; points: string[] } {
  const m = text.match(/^(.*?)\s*You should say:\s*(.*)$/i);
  if (!m) return { task: text.trim(), points: [] };

  const task = m[1].trim();
  let rest = m[2].trim().replace(/\.$/, "");
  let last: string | null = null;
  const and = rest.search(/,?\s+and\s+(explain|say|describe)\b/i);
  if (and >= 0) {
    last = rest.slice(and).replace(/^,?\s+and\s+/i, "");
    rest = rest.slice(0, and);
  }
  const points = rest.split(/,\s*/).map((p) => p.trim()).filter(Boolean);
  if (last) points.push(last.trim());
  return { task, points: points.map((p) => p.charAt(0).toUpperCase() + p.slice(1)) };
}
