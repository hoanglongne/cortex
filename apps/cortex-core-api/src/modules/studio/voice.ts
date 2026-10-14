/**
 * The Lexica voice, shared by every Studio prompt (new cards and archetype
 * variants), plus the clichés the soft "cliche" rule flags.
 *
 * Why the old sentences felt flat: the few-shot examples leaned on the same
 * slang ("vãi", "ông nội", "deadline tới mông") and the same targets (sếp,
 * lương), so the model copied them. In the core deck "vãi" appears in 36
 * sentences, "sếp" in 34, and 31 open with "Mấy cái…". Funny without being
 * forced comes from a specific detail and a small turn at the end, not from
 * slang.
 */

/** How to be funny without trying too hard. */
export const VOICE_RULES = `Giọng văn: như kể chuyện với bạn thân, tỉnh, hơi tự giễu. Buồn cười vì ĐÚNG quá, không phải vì cố pha trò.
Bí quyết:
- Cụ thể hơn chung chung: một chi tiết thật (giờ giấc, con số, món đồ, câu nói) đáng giá hơn mọi từ lóng.
- Một cú lật nhỏ ở cuối câu: dựng tình huống bình thường rồi kết bằng điều không ngờ nhưng ai cũng gật gù.
- Không giải thích cái buồn cười, không tự khen câu mình hài, không emoji, không "haha".
- Từ tiếng Anh nằm đúng chỗ đắt nhất của câu, đọc xong là đoán được nghĩa.
- Đổi chủ đề liên tục: gia đình, nhóm bạn, đồ ăn, xe buýt, phòng trọ, thú cưng, mạng xã hội, đi chợ, thời tiết, sức khoẻ... chứ không chỉ công sở.
Tránh (nghe gượng hoặc sáo): "vãi", "ông nội", "toang", "trầm cảm", "deadline tới mông/dí", "luôn á", "thật sự rất", teencode, meme đã cũ; mở đầu bằng "Mấy cái" hoặc "Đừng có"; lôi sếp, người yêu cũ, crush hay lương ra làm trò khi không cần.`;

/** Ways a sentence can be funny; each slot gets a different one so a batch is varied. */
export const ANGLES = [
  'kỳ vọng và thực tế',
  'leo thang phi lý (bắt đầu nhỏ, kết thúc to)',
  'so sánh bất ngờ',
  'quan sát chuyện nhỏ ai cũng gặp',
  'nói giảm, kể tỉnh bơ',
  'đoạn chat hai câu',
  'độc thoại trong đầu',
  'tự giễu',
] as const;

/** Good and bad examples, with why. Lengths fit the 40–160 character rule. */
export const VOICE_EXAMPLES = `Câu TỐT (học cách làm, đừng chép chủ đề):
- [kỳ vọng và thực tế] Kế hoạch sống FRUGAL của tôi kéo dài đúng tới lúc app giao đồ ăn gửi mã giảm 15 nghìn.
- [leo thang phi lý] Định PROCRASTINATE năm phút, ngẩng lên đã biết cách nuôi ốc mượn hồn và lịch sử cái muỗng nhựa.
- [so sánh bất ngờ] Tin nhắn "ok" không dấu chấm của mẹ còn AMBIGUOUS hơn đề văn: có thể là đồng ý, có thể là sắp có chuyện.
- [quan sát chuyện nhỏ] Mặc áo trắng đi ăn thì chuyện một giọt nước lèo bún bò tìm tới nó là INEVITABLE.
- [nói giảm] Số cân tôi lên sau Tết được cả nhà đánh giá là NEGLIGIBLE, trừ cái quần jean.
- [đoạn chat hai câu] "Đi lẩu không?" "Thôi tao tiết kiệm." "Tao bao." Một tiếng "ờ" RELUCTANT kéo dài đúng hai giây.
Câu DỞ (đừng viết kiểu này):
- "Deadline dí tới mông mà sếp còn bắt họp, việc ABUNDANT vãi luôn ông nội." → nhồi lóng, chủ đề sáo, không có chi tiết.
- "Tôi rất FRUGAL vì tôi muốn tiết kiệm tiền để mua nhà." → đúng nghĩa nhưng không có gì bất ngờ, đọc như sách giáo khoa.
- "Haha nhìn cái mặt FRUGAL của nó mà cười xỉu, ai đọc cũng phải cười." → tự khen hài, giải thích cái buồn cười.`;

/** Assigns angles to slots in turn, starting at an offset so batches differ. */
export function angleFor(slot: number, offset = 0): string {
  return ANGLES[(slot + offset) % ANGLES.length];
}

/** Phrases that make a sentence read forced or stale (soft rule "cliche"). */
export const CLICHES = [
  'vãi',
  'ông nội',
  'toang',
  'trầm cảm',
  'tới mông',
  'luôn á',
  'thật sự rất',
  'cười xỉu',
  'haha',
] as const;
const CLICHE_OPENINGS = ['mấy cái', 'đừng có'] as const;

/** Clichés found in a sentence; empty when it is clean. */
export function clicheHits(scenario: string): string[] {
  const t = scenario.toLowerCase().normalize('NFC').replace(/\s+/g, ' ').trim();
  const hits: string[] = CLICHES.filter((c) =>
    new RegExp(`(^|[^\\p{L}])${c}($|[^\\p{L}])`, 'u').test(t),
  );
  for (const o of CLICHE_OPENINGS)
    if (t.startsWith(o)) hits.push(`mở đầu "${o}"`);
  return hits;
}
