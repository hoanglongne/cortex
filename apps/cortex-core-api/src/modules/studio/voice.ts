/**
 * The Lexica voice, shared by every Studio prompt (new cards and archetype
 * variants), plus the soft "cliche" rule.
 *
 * Learners are 18–30, so sentences talk like their group chat: current Gen Z
 * slang, used the way people actually text. What made the old deck flat was
 * not slang itself but the same few words everywhere ("vãi" in 36 sentences,
 * "sếp" in 34, 31 opening with "Mấy cái…"). So each sentence slot gets its own
 * slang suggestions from a wide palette, and stuffing is flagged.
 */

/** How to sound like a 20-year-old texting a friend, without cringe. */
export const VOICE_RULES = `Giọng văn: Gen Z nhắn tin trong group chat bạn thân. Tự nhiên, lầy, hơi mỏ hỗn nhưng dễ thương; buồn cười vì quá relate.
Bí quyết:
- Dùng slang giới trẻ đang xài (danh sách gợi ý ở dưới), 1–2 cái mỗi câu, đặt đúng chỗ như người thật nhắn tin. Không nhồi.
- Tình huống cụ thể của tuổi 18–30: group chat, crush, deadline, ví cạn, TikTok, Threads, đi cà phê, săn sale, ở trọ, thi cử, đi làm năm nhất, về quê ăn Tết...
- Một cú chốt ở cuối câu; không giải thích cái buồn cười, không "haha", không emoji.
- Từ tiếng Anh cần học nằm đúng chỗ đắt nhất của câu, đọc xong là đoán được nghĩa. Slang tiếng Anh (flex, vibe, slay...) viết thường, tối đa 1 cái.
- Văn nói được phép: "khum", "nha", "nè", "ủa", "zị", "đồ", "á". Không viết teencode kiểu "j", "dc", "ko".
Tránh: giọng sách giáo khoa hoặc giọng phụ huynh; slang đã cũ nghe quê ("chất như nước cất", "trẻ trâu", "thanh niên nghiêm túc", "hết nước chấm"); câu chỉ có slang mà không có tình huống; mở đầu bằng "Mấy cái" hoặc "Đừng có".`;

/** Current slang, rotated across sentence slots so a batch never leans on one word. */
export const SLANG = [
  'ét o ét',
  'gét gô',
  'flex',
  'chằm zn',
  'u là trời',
  'đỉnh nóc kịch trần',
  'out trình',
  'check var',
  'báo thủ',
  'ô dề',
  'tới công chuyện',
  'xu cà na',
  'hết cứu',
  'red flag',
  'delulu',
  'slay',
  'fomo',
  'khum',
  'ủa alo',
  'kém miếng khó chịu',
  'ra đường tôi nể mỗi bạn',
  'ok mom',
  'manifest',
  'toang',
  'xỉu ngang',
  'hóng biến',
  'ăn cơm chó',
  'thao túng tâm lý',
  'chữa lành',
  'keo lỳ',
  'real',
  'lowkey',
] as const;

/** Ways a sentence can be funny; each slot gets a different one so a batch is varied. */
export const ANGLES = [
  'kỳ vọng và thực tế',
  'leo thang phi lý (bắt đầu nhỏ, kết thúc to)',
  'đoạn chat hai câu',
  'quan sát chuyện nhỏ ai cũng gặp',
  'nói giảm, kể tỉnh bơ',
  'so sánh bất ngờ',
  'độc thoại trong đầu',
  'tự giễu',
] as const;

/** Good and bad examples, with why. Lengths fit the 40–160 character rule. */
export const VOICE_EXAMPLES = `Câu TỐT (học cách làm, đừng chép chủ đề):
- [kỳ vọng và thực tế] Đầu tháng manifest sống FRUGAL, giữa tháng thấy mã freeship là tự thao túng tâm lý bản thân chốt đơn.
- [leo thang phi lý] Định PROCRASTINATE năm phút lướt TikTok, ngẩng lên đã 2 giờ sáng và biết hết drama của một idol mình khum quen.
- [đoạn chat hai câu] Nhắn crush "ngủ chưa" nhận về đúng chữ "ừ", AMBIGUOUS cỡ này là cả group phải check var tới sáng.
- [quan sát chuyện nhỏ] Mặc áo trắng đi ăn bún bò thì vụ dính nước lèo là INEVITABLE, u là trời ngay giữa ngực áo.
- [nói giảm] Ăn Tết xong lên 3 ký, cả nhà bảo NEGLIGIBLE, chỉ có cái quần jean là đang ét o ét.
- [đoạn chat hai câu] "Đi lẩu khum?" "Thôi tiết kiệm." "Tao bao." Đúng ba giây RELUCTANT rồi "gét gô".
Câu DỞ (đừng viết kiểu này):
- "Hôm nay slay flex chằm zn, việc ABUNDANT ét o ét keo lỳ luôn á." → nhồi slang, không có tình huống nào.
- "Tôi rất FRUGAL vì tôi muốn tiết kiệm tiền để mua nhà." → giọng sách giáo khoa, không có gì để cười.
- "Haha nhìn mặt FRUGAL của nó mà cười xỉu, ai đọc cũng phải cười." → tự khen hài, giải thích cái buồn cười.`;

/** Assigns angles to slots in turn, starting at an offset so batches differ. */
export function angleFor(slot: number, offset = 0): string {
  return ANGLES[(slot + offset) % ANGLES.length];
}

/** Three slang suggestions for a slot; consecutive slots never share one. */
export function slangFor(slot: number, offset = 0): string[] {
  const start = (slot + offset) * 3;
  return [0, 1, 2].map((k) => SLANG[(start + k) % SLANG.length]);
}

/** Signs a sentence is trying too hard (soft rule "cliche"). */
export const CLICHES = [
  'haha',
  'hihi',
  'cười xỉu',
  'ai đọc cũng',
  'thật sự rất',
  'chất như nước cất',
  'trẻ trâu',
  'hết nước chấm',
] as const;
const CLICHE_OPENINGS = ['mấy cái', 'đừng có'] as const;
/** More slang than this in one sentence reads as stuffed. */
const MAX_SLANG = 2;

const hasPhrase = (text: string, phrase: string) =>
  new RegExp(`(^|[^\\p{L}])${phrase}($|[^\\p{L}])`, 'u').test(text);

/** Clichés found in a sentence; empty when it is clean. */
export function clicheHits(scenario: string): string[] {
  const t = scenario.toLowerCase().normalize('NFC').replace(/\s+/g, ' ').trim();
  const hits: string[] = CLICHES.filter((c) => hasPhrase(t, c));
  for (const o of CLICHE_OPENINGS)
    if (t.startsWith(o)) hits.push(`mở đầu "${o}"`);
  const slang = SLANG.filter((s) => hasPhrase(t, s));
  if (slang.length > MAX_SLANG) hits.push(`nhồi ${slang.length} slang`);
  return hits;
}
