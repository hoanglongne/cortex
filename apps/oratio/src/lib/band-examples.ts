import type { Criterion } from "@cortex/classroom-oratio";

/**
 * What a band sounds like, in a sentence or two: examples to compare against.
 * Written by the Cortex team to illustrate the public IELTS descriptors; they are
 * not real candidate answers and no teacher has checked them yet.
 */
export interface BandExample {
  band: 4 | 6 | 8;
  /** What was said (English) or, for pronunciation, how it sounds (Vietnamese) */
  sample: string;
  /** Why it is this band, in one line */
  why: string;
}

export const BAND_EXAMPLES: Record<Criterion, BandExample[]> = {
  fluency: [
    { band: 4, sample: "I… um… I like… the weekend. Because… mmm… I can… sleep.", why: "Ngắt quãng nhiều, ý bị đứt." },
    { band: 6, sample: "I usually spend my weekends with my family, and, um, sometimes we go to the countryside because it's quiet.", why: "Nói được dài, thỉnh thoảng ậm ừ nhưng giữ được mạch." },
    { band: 8, sample: "I tend to spend weekends with family; we'll often drive out to the countryside, mostly because it's a good way to switch off after a busy week.", why: "Liền mạch, nối ý tự nhiên, hiếm khi vấp." },
  ],
  vocabulary: [
    { band: 4, sample: "The food is good. The place is good. The people are good.", why: "Chỉ từ đơn giản, lặp một từ." },
    { band: 6, sample: "The food is delicious and the staff are friendly, although it can get quite crowded.", why: "Từ cụ thể hơn, dùng đúng nhưng chưa đa dạng." },
    { band: 8, sample: "The food is exceptional, and the staff are remarkably attentive, though the place gets overwhelmingly busy at weekends.", why: "Từ chính xác, ít gặp, đa dạng và đúng sắc thái." },
  ],
  grammar: [
    { band: 4, sample: "Yesterday I go to market and buy many thing. It very cheap.", why: "Lỗi thì và thiếu động từ ở nhiều câu, chỉ câu ngắn." },
    { band: 6, sample: "Yesterday I went to the market and I buy many things because it was cheap.", why: "Có câu dài, còn vài lỗi nhưng hiểu ngay." },
    { band: 8, sample: "Had I known it would be so cheap, I would have brought a bigger bag.", why: "Cấu trúc phức tạp, hầu như không lỗi." },
  ],
  pronunciation: [
    { band: 4, sample: "Nhiều từ nghe không ra, âm cuối bị nuốt, người nghe phải đoán ý.", why: "Phát âm cản trở việc hiểu." },
    { band: 6, sample: "Hiểu hầu hết; vài từ sai âm hoặc nhấn sai nhưng không cản trở ý.", why: "Rõ nhìn chung, còn lỗi âm." },
    { band: 8, sample: "Rõ, tự nhiên; nhấn và ngữ điệu giúp ý nổi lên, sai âm rất hiếm.", why: "Dễ nghe, chỉ lệch nhẹ khỏi giọng bản ngữ." },
  ],
};
