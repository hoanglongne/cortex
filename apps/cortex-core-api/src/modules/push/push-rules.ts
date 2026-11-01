/** What to send and when (pure, unit tested). Times are Vietnam time (UTC+7). */

const VN_OFFSET_MS = 7 * 3_600_000;

/** Quiet hours: 22:00 to 08:00 in Vietnam. Gifts and questions wait; a study date does not. */
export function isQuietHour(now: number): boolean {
  const hour = new Date(now + VN_OFFSET_MS).getUTCHours();
  return hour >= 22 || hour < 8;
}

/** "20:30" in Vietnam time. */
export function clockVn(at: string | number): string {
  const d = new Date(
    (typeof at === 'number' ? at : Date.parse(at)) + VN_OFFSET_MS,
  );
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
  tag: string;
}

/** A study date about to start. `other` is the buddy's name. */
export function datePayload(
  id: string,
  other: string | null,
  at: string,
): PushPayload {
  return {
    title: 'Sắp đến giờ học chung',
    body: `${other ?? 'Bạn học'} hẹn học cùng lúc ${clockVn(at)}. Vào học nhé.`,
    url: '/buddy',
    tag: `date-${id}`,
  };
}

/** Gifts from buddies waiting to be opened. */
export function giftsPayload(from: readonly (string | null)[]): PushPayload {
  const names = [...new Set(from.map((n) => n ?? 'Bạn học'))];
  const who =
    names.length === 1
      ? names[0]
      : `${names[0]} và ${names.length - 1} bạn khác`;
  return {
    title: 'Có quà từ vựng',
    body: `${who} tặng bạn ${from.length > 1 ? `${from.length} từ` : 'một từ'}. Mở ra xem nhé.`,
    url: '/buddy',
    tag: 'gifts',
  };
}

/** Buddies asking for a sentence. */
export function asksPayload(from: readonly (string | null)[]): PushPayload {
  const names = [...new Set(from.map((n) => n ?? 'Bạn học'))];
  const who =
    names.length === 1
      ? names[0]
      : `${names[0]} và ${names.length - 1} bạn khác`;
  return {
    title: 'Bạn nhờ đặt câu',
    body: `${who} nhờ bạn đặt một câu với một từ.`,
    url: '/buddy',
    tag: 'asks',
  };
}

/** Groups items by a key. */
export function groupBy<T>(
  items: readonly T[],
  key: (t: T) => string,
): Map<string, T[]> {
  const out = new Map<string, T[]>();
  for (const it of items) {
    const k = key(it);
    out.set(k, [...(out.get(k) ?? []), it]);
  }
  return out;
}
