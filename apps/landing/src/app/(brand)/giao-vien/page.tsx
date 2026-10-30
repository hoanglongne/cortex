import type { Metadata } from "next";
import { Circled, Hand, Note, Squiggle } from "@/components/brand/doodle";
import { ParentSlip, TodayList } from "@/components/brand/mocks";
import { Button } from "@/components/brand/ui";
import { CONTACT, TEACH_URL } from "@/lib/links";

export const metadata: Metadata = { title: "Cho giáo viên và phụ huynh | Cortex", description: "Biết em nào sắp quên bài trước khi em nghỉ học. Điểm danh, giao bài, bài kiểm tra lớp và báo cáo tuần cho phụ huynh." };

const FEATURES: [string, string][] = [
  ["Hôm nay", "Mỗi sáng một danh sách việc nên làm: em nào cần nhắn, em nào cần giao bài ôn."],
  ["Dự báo", "Em nào sắp quên và em nào có dấu hiệu bỏ học, nhìn thấy sớm."],
  ["Điểm danh, giao bài", "Điểm danh theo buổi. Giao bài cho cả lớp hoặc riêng từng em."],
  ["Bài kiểm tra lớp", "Ra bài từ vựng cho cả lớp. Em làm trên điện thoại, kết quả quay lại phần ôn của từng em."],
  ["Đấu trường", "Quiz trực tiếp trên máy chiếu, cả lớp vào bằng mã phòng."],
  ["Luyện nói trên lớp", "Cho cả lớp luyện nói theo từng Part, có tiêu chí để nhận xét."],
];

export default function Teachers() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 md:py-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <Hand className="block -rotate-1">cho giáo viên</Hand>
          <h1 className="mt-2 font-serif text-4xl font-semibold leading-[1.08] md:text-6xl">
            Biết em nào sắp quên bài, <Circled>trước</Circled> khi em ấy nghỉ học.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            Teach lấy số liệu từ chính việc học của học viên trong Lexica và Oratio. Thầy cô không phải chấm thêm hay nhập thêm gì: mở ra là thấy việc cần làm.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={TEACH_URL ?? CONTACT}>{TEACH_URL ? "Mở Teach" : "Cùng thí điểm"}</Button>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <Note tone="white" tilt={2} className="!p-0">
            <TodayList />
          </Note>
        </div>
      </div>

      <section className="mt-24">
        <h2 className="font-serif text-3xl font-semibold md:text-4xl">Trong Teach có gì</h2>
        <Squiggle className="mt-3" />
        <ul className="mt-8 grid gap-x-12 gap-y-7 md:grid-cols-2">
          {FEATURES.map(([t, d]) => (
            <li key={t} className="flex gap-4">
              <span aria-hidden className="mt-1.5 h-5 w-5 shrink-0 rounded border-2 border-moss bg-moss-soft" />
              <div>
                <h3 className="font-serif text-xl font-semibold">{t}</h3>
                <p className="mt-1 leading-relaxed text-ink-2">{d}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="phu-huynh" className="mt-24 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <Note tone="sun" tilt={-2} className="mx-auto !p-3">
          <ParentSlip />
        </Note>
        <div>
          <Hand className="block">cho phụ huynh</Hand>
          <h2 className="mt-1 font-serif text-3xl font-semibold leading-tight md:text-4xl">Một báo cáo tuần ngắn, bằng tiếng Việt dễ hiểu.</h2>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-ink-2">
            Mỗi tuần giáo viên gửi một liên kết riêng. Phụ huynh không cần tài khoản: xem con học bao nhiêu ngày, nhớ thêm bao nhiêu từ, cần để ý chỗ nào. Giáo viên chỉ chia sẻ con số, không chia sẻ nội dung bài làm của học viên.
          </p>
        </div>
      </section>
    </main>
  );
}
