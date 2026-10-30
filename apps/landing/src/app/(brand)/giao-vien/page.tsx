import type { Metadata } from "next";
import { Button, Eyebrow, Fact, Mark } from "@/components/brand/ui";
import { CONTACT, TEACH_URL } from "@/lib/links";

export const metadata: Metadata = { title: "Cho giáo viên và phụ huynh | Cortex", description: "Biết em nào sắp quên bài trước khi em nghỉ học. Điểm danh, giao bài, bài kiểm tra lớp và báo cáo tuần cho phụ huynh." };

const FEATURES: [string, string][] = [
  ["Hôm nay", "Mỗi sáng một danh sách việc nên làm, em nào cần nhắn, em nào cần giao bài ôn."],
  ["Dự báo", "Em nào sắp quên và em nào có dấu hiệu bỏ học, nhìn thấy sớm."],
  ["Điểm danh và giao bài", "Điểm danh theo buổi, giao bài theo cả lớp hoặc từng em."],
  ["Bài kiểm tra lớp", "Ra bài từ vựng cho cả lớp, học sinh làm trên điện thoại, kết quả quay lại phần ôn của từng em."],
  ["Đấu trường", "Quiz trực tiếp trên máy chiếu, cả lớp vào bằng mã phòng."],
  ["Luyện nói trên lớp", "Cho cả lớp luyện nói theo từng Part, có tiêu chí để nhận xét."],
];

export default function Teachers() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 md:py-20">
      <Eyebrow>Cho giáo viên</Eyebrow>
      <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-[1.1] md:text-5xl">
        Biết em nào sắp quên bài, <Mark>trước</Mark> khi em ấy nghỉ học.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">
        Teach lấy số liệu từ chính việc học của học viên trong Lexica và Oratio. Thầy cô không phải chấm thêm hay nhập thêm gì: mở ra là thấy việc cần làm.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href={TEACH_URL ?? CONTACT}>{TEACH_URL ? "Mở Teach" : "Cùng thí điểm"}</Button>
      </div>

      <div className="mt-16 grid gap-x-10 gap-y-8 md:grid-cols-3">
        {FEATURES.map(([t, d], i) => (
          <Fact key={t} n={String(i + 1).padStart(2, "0")} title={t}>
            {d}
          </Fact>
        ))}
      </div>

      <section id="phu-huynh" className="mt-20 rounded-2xl bg-moss-soft p-8 md:p-10">
        <Eyebrow>Cho phụ huynh</Eyebrow>
        <h2 className="mt-3 max-w-2xl font-serif text-2xl font-semibold md:text-3xl">Một báo cáo tuần ngắn, bằng tiếng Việt dễ hiểu.</h2>
        <p className="mt-3 max-w-2xl text-ink-2">
          Mỗi tuần giáo viên gửi một liên kết riêng. Phụ huynh không cần tài khoản: xem con đã học bao nhiêu, nhớ được gì, cần để ý chỗ nào. Giáo viên chỉ chia sẻ con số, không chia sẻ nội dung bài làm của học viên.
        </p>
      </section>
    </main>
  );
}
