/**
 * The Lexica voice, shared by every Studio prompt (new cards and archetype
 * variants), plus the soft "cliche" rule.
 *
 * Learners are 18–30 and often weak in English, so example sentences are
 * plain and concrete: a dictionary-style sentence in a situation they recognise,
 * where the meaning can be guessed from context. Jokes were tried and dropped:
 * they are hard to get right in bulk and read as cringe when they miss.
 */

/** How to write a clear, everyday example sentence. */
export const VOICE_RULES = `Giọng văn: tiếng Việt tự nhiên, rõ ràng, ấm áp, như một ví dụ trong từ điển dành cho người học.
Nguyên tắc:
- Một tình huống đời thường cụ thể (học, làm, nhà cửa, ăn uống, đi lại, gia đình, bạn bè, điện thoại, mạng xã hội) để người đọc đoán được nghĩa từ ngữ cảnh.
- Không tiếng lóng, không teencode, không đùa, không emoji, không dấu chấm than liên tiếp.
- Từ tiếng Anh nằm đúng chỗ, viết HOA đúng một lần, dùng dạng gốc hoặc biến thể có quy tắc (-s, -ed, -ing, -ly).
- Đa dạng tình huống: không lặp lại cùng một bối cảnh (ví dụ luôn là sếp, lương hay crush).
Tránh: giọng sách giáo khoa khô khan, giọng phụ huynh răn dạy, câu chỉ định nghĩa mà không có tình huống, lời khen tự sướng, câu tự giải thích.`;

/** Situation angles; each sentence slot gets a different one so a batch is varied. */
export const ANGLES = [
  'tình huống học tập',
  'tình huống công việc',
  'sinh hoạt ở nhà hoặc phòng trọ',
  'ăn uống và mua sắm',
  'đi lại và du lịch',
  'quan hệ gia đình hoặc bạn bè',
  'điện thoại và mạng xã hội',
  'cảm xúc của một người trong ngày',
] as const;

/** Good and bad examples, with why. Lengths fit the 60–140 character rule. */
export const VOICE_EXAMPLES = `Câu TỐT (học cách làm, đừng chép chủ đề):
- [tình huống học tập] Phần ngữ pháp trong đề này khá DIFFICULT, nên em ôn lại từ đầu trước buổi thi.
- [tình huống công việc] Dự án còn ở giai đoạn đầu, nên nhóm chưa có con số PRELIMINARY nào để báo cáo.
- [sinh hoạt ở nhà hoặc phòng trọ] Căn phòng nhỏ nhưng ánh sáng rất ADEQUATE cho việc đọc sách buổi tối.
- [ăn uống và mua sắm] Quán cà phê này có VARIOUS lựa chọn đồ uống, từ trà đến sinh tố và cà phê đá.
- [đi lại và du lịch] Chuyến bay bị DELAYED vài tiếng, nên cả nhóm phải chờ ở sân bay suốt buổi tối.
- [quan hệ gia đình hoặc bạn bè] Bạn ấy luôn giữ lời hứa, nên mọi người đều RELIABLE khi nhờ việc.
- [điện thoại và mạng xã hội] Tin tức lan trên mạng rất nhanh, nhưng không phải lúc nào cũng ACCURATE.
- [cảm xúc của một người trong ngày] Sau buổi thuyết trình, anh ấy vẫn ANXIOUS vì chưa biết mọi người phản hồi thế nào.
Câu DỞ (đừng viết kiểu này):
- "Deadline dí tới mông mà sếp còn bắt họp, việc ABUNDANT vãi luôn ông nội." → tiếng lóng, chủ đề sáo, không có chi tiết.
- "Tôi rất ABUNDANT vì tôi muốn có nhiều tiền." → đúng nghĩa nhưng không có tình huống, đọc như câu định nghĩa.
- "Haha nhìn mặt nó ABUNDANT mà cười xỉu, ai đọc cũng phải cười." → đùa cợt, giải thích cái buồn cười.`;

/** Assigns angles to slots in turn, starting at an offset so batches differ. */
export function angleFor(slot: number, offset = 0): string {
  return ANGLES[(slot + offset) % ANGLES.length];
}

/** Phrases that make a sentence read as slang-heavy, jokey or preachy (soft rule "cliche"). */
export const CLICHES = [
  'haha',
  'hihi',
  'cười xỉu',
  'ai đọc cũng',
  'thật sự rất',
  'vãi',
  'ông nội',
  'toang',
  'trầm cảm',
] as const;
const CLICHE_OPENINGS = ['mấy cái', 'đừng có'] as const;

const hasPhrase = (text: string, phrase: string) =>
  new RegExp(`(^|[^\\p{L}])${phrase}($|[^\\p{L}])`, 'u').test(text);

/** Clichés found in a sentence; empty when it is clean. */
export function clicheHits(scenario: string): string[] {
  const t = scenario.toLowerCase().normalize('NFC').replace(/\s+/g, ' ').trim();
  const hits: string[] = CLICHES.filter((c) => hasPhrase(t, c));
  for (const o of CLICHE_OPENINGS)
    if (t.startsWith(o)) hits.push(`mở đầu "${o}"`);
  return hits;
}
