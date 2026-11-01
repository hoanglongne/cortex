/**
 * Endings (docs/SYNAPSE_PLAN.md S5): each mission closes in one of four ways
 * by how it went (lives left at the end, or no lives left), and the player
 * keeps the ones they have seen. Replaying to see another is the reason to come
 * back to a mission. Pure, unit tested.
 */
import type { Progress } from "./level";

export type EndingTier = "gold" | "silver" | "bronze" | "fail";

export const TIER_LABEL: Record<EndingTier, string> = { gold: "Trọn vẹn", silver: "Vượt qua", bronze: "Sát nút", fail: "Dở dang" };
export const TIERS: EndingTier[] = ["gold", "silver", "bronze", "fail"];

/** How a mission ended: all lives kept, one lost, two lost, or out of lives. */
export function tierOf(lives: number, cleared: boolean): EndingTier {
  if (!cleared || lives <= 0) return "fail";
  return lives >= 3 ? "gold" : lives === 2 ? "silver" : "bronze";
}

type Lines = Record<EndingTier, string>;

/** Written endings per mission. A mission with none uses the general lines. */
const ENDINGS: Record<string, Lines> = {
  "sc-m1": {
    gold: "Tuần đầu trôi qua mà bạn đã có nhóm bạn đầu tiên. Cô chủ nhiệm nhắn riêng: \"Cô thấy em hoà nhập rất nhanh.\"",
    silver: "Có vài lúc ngập ngừng, nhưng cuối tuần bạn vẫn có hai người bạn để cùng đi ăn trưa.",
    bronze: "Tuần đầu khá chật vật. Bạn vẫn còn đứng ở rìa nhóm, nhưng có một người đã nhớ tên bạn.",
    fail: "Tuần đầu qua đi mà bạn vẫn là \"học sinh mới\". Mai vào lại lớp, thử lần nữa nhé.",
  },
  "sc-m2": {
    gold: "Bài nộp đúng hạn, tên bốn người trên bìa. Cô khen cả nhóm làm việc công bằng, và Huy nhắn cảm ơn bạn.",
    silver: "Cả nhóm nộp kịp, có vài chỗ cãi nhau. Điểm tốt và mọi người vẫn còn nói chuyện với nhau.",
    bronze: "Nộp trễ vài giờ và bạn gần như làm hết. Điểm ổn, nhưng nhóm không còn rủ nhau làm lần sau.",
    fail: "Dự án đổ vỡ giữa chừng. Cả nhóm phải làm lại, và bài học là nói thẳng sớm hơn.",
  },
  "sc-m3": {
    gold: "Kì thi xong, bạn bước ra khỏi phòng với đầu óc nhẹ nhõm: điểm do chính bạn làm ra.",
    silver: "Điểm không quá cao nhưng là thật. Bạn biết mình cần ôn đều hơn từ tuần sau.",
    bronze: "Bạn qua kì thi trong hoảng loạn và suýt làm sai điều không nên. Lần sau, chuẩn bị sớm hơn.",
    fail: "Kì thi không như ý. Nhưng bạn rút ra cách học và cách giữ bình tĩnh cho lần sau.",
  },
  "sc-m4": {
    gold: "Ngày hội thành công và cả ban tổ chức được gọi tên. Chủ nhiệm hỏi bạn có muốn làm trưởng ban năm sau không.",
    silver: "Sự kiện diễn ra suôn sẻ dù có trục trặc nhỏ. Mọi người nhớ bạn là người bình tĩnh.",
    bronze: "Chương trình chậm và thiếu vài tiết mục, nhưng khán giả vẫn vỗ tay. Bạn học được cách chuẩn bị dự phòng.",
    fail: "Sự kiện phải rút gọn. Cả ban ngồi lại rút kinh nghiệm, và bạn là người đề xuất làm tốt hơn.",
  },
  "sc-m5": {
    gold: "Cả lớp về đủ, Hà an toàn. Cô nhắn vào nhóm: \"Cảm ơn trưởng nhóm đã giữ bình tĩnh.\"",
    silver: "Chuyến đi có vài trục trặc nhưng mọi người về an toàn và còn kể lại như một kỷ niệm.",
    bronze: "Chuyến đi qua với nhiều lo lắng. Cả lớp về an toàn nhưng bạn thấy mình cần quyết đoán hơn.",
    fail: "Chuyến đi kết thúc trong rối ren. Lần sau bạn sẽ chuẩn bị kế hoạch dự phòng từ sớm.",
  },
  "sc-m6": {
    gold: "Mai và bạn ngồi cùng bàn như xưa, và nhóm bạn mới cũng được mời vào những buổi tụ tập chung.",
    silver: "Tình bạn cũ đã lành, dù còn một chút ngại ngùng. Hai bạn hẹn mỗi tuần một buổi cà phê.",
    bronze: "Hai bạn làm lành nhưng khoảng cách vẫn còn. Cần thời gian để tin nhau lại.",
    fail: "Mai im lặng sau cuộc nói chuyện. Bạn học được rằng nói sớm quan trọng hơn nói hay.",
  },
};

const GENERAL: Lines = {
  gold: "Bạn hoàn thành nhiệm vụ mà không sai lần nào.",
  silver: "Bạn hoàn thành nhiệm vụ, chỉ sai một lần.",
  bronze: "Bạn hoàn thành nhiệm vụ trong gang tấc.",
  fail: "Nhiệm vụ chưa hoàn thành. Thử lại để xem kết cục khác.",
};

export const endingText = (missionId: string | undefined, tier: EndingTier): string => (ENDINGS[missionId ?? ""] ?? GENERAL)[tier];

/** Missions with written endings. */
export const WRITTEN_ENDINGS = Object.keys(ENDINGS);

export const endingKey = (missionId: string, tier: EndingTier) => `${missionId}:${tier}`;

/** The ending was seen: keeps one entry each. */
export const markEnding = (p: Progress, missionId: string | undefined, tier: EndingTier): Progress => {
  if (!missionId) return p;
  const key = endingKey(missionId, tier);
  return p.endings.includes(key) ? p : { ...p, endings: [...p.endings, key] };
};

/** Seen out of all the endings the written missions have. */
export const endingsSeen = (p: Progress): { seen: number; total: number } => ({
  seen: p.endings.filter((k) => WRITTEN_ENDINGS.includes(k.split(":")[0])).length,
  total: WRITTEN_ENDINGS.length * TIERS.length,
});

// ── Chapter of the week ─────────────────────────────────────────────────

/** The Monday of the week of `date` (YYYY-MM-DD, local). */
export function weekKey(date: Date): string {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/**
 * The week's chapter: one of the missions with written scenes, the next one
 * each Monday. A mission the player has cleared comes after those they have not.
 */
export function chapterOfWeek(date: Date, missions: readonly string[], cleared: readonly string[]): string | null {
  if (missions.length === 0) return null;
  const monday = new Date(`${weekKey(date)}T12:00:00`);
  const week = Math.floor(monday.getTime() / (7 * 86_400_000));
  const fresh = missions.filter((m) => !cleared.includes(m));
  const pool = fresh.length > 0 ? fresh : missions;
  return pool[week % pool.length];
}
