import Link from "next/link";
import { Button, Eyebrow, Fact, Mark, Phone } from "@/components/brand/ui";
import { CONTACT, LEXICA_URL } from "@/lib/links";

const DOORS = [
  {
    href: "/hoc-vien",
    tag: "Người học",
    title: "Từ vựng ở lại trong đầu bạn.",
    body: "Mỗi ngày một phiên ngắn: ôn đúng lúc sắp quên, học từ mới, đọc và nói với chính những từ đó.",
  },
  {
    href: "/giao-vien",
    tag: "Giáo viên",
    title: "Biết em nào sắp quên bài, trước khi em ấy nghỉ học.",
    body: "Mỗi sáng một danh sách việc nên làm. Điểm danh, giao bài, báo cáo cho phụ huynh bằng tiếng Việt dễ hiểu.",
  },
  {
    href: "/trung-tam",
    tag: "Trung tâm",
    title: "Nhìn cả trung tâm trên một màn hình.",
    body: "Lớp nào đang chững, em nào có nguy cơ nghỉ, giáo viên nào cần hỗ trợ. Có số liệu trước khi có lời phàn nàn.",
  },
];

export default function Home() {
  return (
    <main>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-14 md:grid-cols-[1.15fr_1fr] md:pt-20">
        <div>
          <Eyebrow>Cortex · học tiếng Anh nhớ lâu</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.08] tracking-tight md:text-6xl">
            Học xong là <Mark>nhớ</Mark>.
            <br />
            Dạy xong là thấy.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            Người học nhớ từ lâu hơn nhờ ôn đúng lúc sắp quên. Thầy cô biết em nào cần giúp, ngay từ sáng, thay vì đợi đến kỳ thi mới biết.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={LEXICA_URL}>Học thử miễn phí</Button>
            <Button href="/giao-vien" tone="line">
              Tôi là giáo viên
            </Button>
          </div>
          <p className="mt-4 text-sm text-ink-3">Điểm trong app là ước lượng, không phải điểm thi thật. Chúng tôi không hứa band.</p>
        </div>
        <div className="flex justify-center gap-4 md:justify-end" aria-label="Màn hình Lexica">
          <Phone src="/shots/lexica-detective.png" alt="Trò chơi Thám tử từ trong Lexica" className="sm:mt-8 -rotate-2" />
          <Phone src="/shots/lexica-cloze.png" alt="Điền từ vào câu trong Lexica" className="hidden rotate-2 sm:block" />
        </div>
      </section>

      {/* Doors */}
      <section className="mx-auto max-w-6xl px-5">
        <Eyebrow>Bạn là ai?</Eyebrow>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {DOORS.map((d) => (
            <Link key={d.href} href={d.href} className="group flex flex-col rounded-2xl border border-rule bg-white/60 p-6 transition-colors hover:border-moss">
              <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-moss">{d.tag}</span>
              <h2 className="mt-3 font-serif text-2xl font-semibold leading-snug">{d.title}</h2>
              <p className="mt-3 flex-1 text-[15px] leading-relaxed text-ink-2">{d.body}</p>
              <span className="mt-5 text-sm font-semibold text-moss-strong group-hover:underline">Xem thêm →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Two tracks */}
      <section className="mx-auto mt-24 max-w-6xl px-5">
        <Eyebrow>Hai hướng học</Eyebrow>
        <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold leading-tight md:text-4xl">Thi chứng chỉ, hay nói được ngoài đời?</h2>
        <p className="mt-3 max-w-xl text-ink-2">Chọn lúc bắt đầu, đổi lúc nào cũng được, tiến độ vẫn giữ.</p>
        <div className="mt-8 overflow-hidden rounded-2xl border border-rule bg-white/60">
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="border-b border-rule bg-paper-2 text-sm">
                <th className="w-1/4 px-5 py-3 font-normal text-ink-3" />
                <th className="px-5 py-3 font-semibold">Chứng chỉ</th>
                <th className="px-5 py-3 font-semibold">Giao tiếp</th>
              </tr>
            </thead>
            <tbody className="align-top text-ink-2">
              {[
                ["Học để", "Thi IELTS", "Nói được ngoài đời"],
                ["Nội dung", "Từ học thuật, đọc, viết", "Cụm từ, tình huống thật"],
                ["Đo bằng", "Điểm từ vựng (ước lượng)", "Số từ dùng được"],
              ].map(([k, a, b]) => (
                <tr key={k} className="border-b border-rule last:border-0">
                  <td className="px-5 py-3 text-ink-3">{k}</td>
                  <td className="px-5 py-3">{a}</td>
                  <td className="px-5 py-3">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Why different */}
      <section className="mx-auto mt-24 max-w-6xl px-5">
        <Eyebrow>Khác ở đâu</Eyebrow>
        <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold leading-tight md:text-4xl">Ba điều chúng tôi làm khác.</h2>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <Fact n="01" title="Điểm do máy chủ chấm">
            Bài kiểm tra từ vựng được chấm và xác minh trên máy chủ, không tự khai. Bạn có thể chia sẻ trang điểm của mình.
          </Fact>
          <Fact n="02" title="Số liệu học thật">
            Thầy cô thấy em nào ôn đều, em nào đã bỏ vài ngày, từ nào cả lớp hay quên. Dữ liệu đến từ chính việc học trong app.
          </Fact>
          <Fact n="03" title="Mỗi con số kèm một việc làm được">
            Không phải bảng biểu để ngắm. Bên cạnh &ldquo;em An chưa ôn 5 ngày&rdquo; là nút nhắn em ấy hoặc giao bài ôn.
          </Fact>
        </div>
      </section>

      {/* Proof, honestly empty */}
      <section className="mx-auto mt-24 max-w-6xl px-5">
        <div className="rounded-2xl border border-dashed border-ink/30 p-8 md:p-10">
          <Eyebrow>Đang thí điểm</Eyebrow>
          <h2 className="mt-3 font-serif text-2xl font-semibold md:text-3xl">Chúng tôi đang chạy cùng những lớp đầu tiên.</h2>
          <p className="mt-3 max-w-2xl text-ink-2">
            Khi có số liệu thật (tỉ lệ quay lại, số từ nhớ được sau 30 ngày, lời của thầy cô), chúng tôi sẽ đặt ở đây. Chưa có thì chúng tôi để trống thay vì bịa.
          </p>
          <div className="mt-6">
            <Button href={CONTACT} tone="line">
              Cùng thí điểm với lớp của bạn
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto mt-24 max-w-6xl px-5">
        <Eyebrow>Giá thử nghiệm</Eyebrow>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            ["Người học", "Miễn phí để học hằng ngày", "Gói Plus khoảng 79–99 nghìn đồng mỗi tháng. Học viên được thầy cô giao bài có Plus khi còn trong lớp."],
            ["Giáo viên", "Khoảng 199 nghìn đồng mỗi tháng", "Dành cho giáo viên tự mở lớp, một tài khoản, không giới hạn lớp trong phạm vi thử nghiệm."],
            ["Trung tâm", "30–50 nghìn đồng mỗi học viên mỗi tháng", "Tính theo số học viên đang học, kèm bảng nhìn cả trung tâm."],
          ].map(([t, p, d]) => (
            <div key={t} className="rounded-2xl border border-rule bg-white/60 p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-moss">{t}</p>
              <p className="mt-3 font-serif text-xl font-semibold leading-snug">{p}</p>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-ink-3">Đây là mức dự kiến, có thể đổi khi thí điểm xong.</p>
      </section>
    </main>
  );
}
