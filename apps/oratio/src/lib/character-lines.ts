import type { Mood } from "@/components/ui/character";

/**
 * What Ơ says on the practice tab, picked from the learner's real state.
 * Never invents facts: every line is backed by a value passed in.
 */
export interface LineInput {
  name: string | null;
  examLive: boolean;
  waiting: number;
  sessions: number;
  streak: number;
  /** The latest comment a partner left, if any */
  lastComment: string | null;
  /** Hour of day (0–23), for greetings */
  hour: number;
}

export function practiceLine(s: LineInput): { mood: Mood; text: string } {
  const you = s.name ? `${s.name} ơi` : "Bạn ơi";
  if (s.sessions === 0) {
    return { mood: "nervous", text: `${you}, mình cũng run lắm. Tập một mình vài câu trước nhé, không ai nghe đâu.` };
  }
  if (s.examLive && s.waiting > 0) {
    return { mood: "talk", text: `Giờ thi mở rồi! ${s.waiting} người đang chờ ghép. Vào thử một buổi không?` };
  }
  if (s.lastComment) {
    return { mood: "idle", text: `Lần trước bạn được nhắn: “${s.lastComment}”. Hôm nay thử sửa đúng chỗ đó nhé.` };
  }
  if (s.streak >= 2) {
    return { mood: "happy", text: `Chuỗi ${s.streak} ngày rồi đó! Nói một câu thôi là giữ được chuỗi hôm nay.` };
  }
  if (s.hour < 11) return { mood: "idle", text: "Buổi sáng nói vài câu cho ấm giọng nhé." };
  if (s.hour >= 22) return { mood: "idle", text: "Khuya rồi, tập nhẹ 2–3 câu rồi ngủ nha." };
  return { mood: "idle", text: `${you}, hôm nay mình nói gì nào?` };
}
