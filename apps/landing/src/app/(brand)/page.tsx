import Link from "next/link";
import { TRACK_LABEL, TRACK_ROWS, TRACK_SWITCH_NOTE } from "@cortex/brand";
import { Arrow, Circled, Hand, Note, Squiggle } from "@/components/brand/doodle";
import { FlashCard, ParentSlip, TodayList } from "@/components/brand/mocks";
import { Button } from "@/components/brand/ui";
import { CONTACT, LEXICA_URL } from "@/lib/links";

const DAY: [string, string, string][] = [
  ["7:10", "Ôn 3 phút trên xe buýt", "Những từ sắp quên hiện lại đúng lúc. Nhớ thì lướt qua, quên thì ở lại thêm một vòng."],
  ["12:30", "Học 5 từ mới", "Mỗi từ có ví dụ đời thường và có tiếng đọc. Hiểu xong mới sang bước nhớ."],
  ["19:00", "Đọc và nói", "Một đoạn ngắn có chính những từ vừa học, rồi nói to cho app chấm phát âm."],
  ["21:30", "Thách đấu Hà", "Năm câu, mỗi người trả lời lúc rảnh. Điểm của nhau chỉ hiện khi cả hai xong."],
];

export default function Home() {
  return (
    <main>
      {/* Hero: a headline and a desk with things on it */}
      <section className="mx-auto grid max-w-6xl gap-10 px-5 pb-20 pt-12 lg:grid-cols-[1fr_1.05fr] lg:pt-20">
        <div className="relative">
          <Hand className="mb-3 block -rotate-2">gửi người học, thầy cô và phụ huynh</Hand>
          <h1 className="font-serif text-[2.7rem] font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Học xong
            <br />
            là <Circled>nhớ</Circled>.
            <br />
            <span className="text-ink-2">Dạy xong</span>
            <br />
            là thấy.
          </h1>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-ink-2">
            Người học nhớ từ lâu hơn nhờ ôn đúng lúc sắp quên. Thầy cô biết em nào cần giúp ngay từ sáng, không phải đợi đến kỳ thi.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href={LEXICA_URL}>Học thử, miễn phí</Button>
            <Button href="/giao-vien" tone="line">
              Tôi là giáo viên
            </Button>
          </div>
          <p className="mt-5 flex items-center gap-2 text-sm text-ink-3">
            <Hand className="text-xl">không hứa band nhé</Hand> Điểm trong app là ước lượng.
          </p>
        </div>

        {/* the desk */}
        <div className="relative mx-auto h-[520px] w-full max-w-[560px] sm:h-[560px]" aria-label="Ba màn hình: thẻ từ, danh sách của giáo viên, báo cáo phụ huynh">
          <div className="absolute left-0 top-6 z-10 -rotate-3 sm:left-4">
            <FlashCard />
          </div>
          <div className="absolute right-0 top-0 z-20 rotate-2 lg:-right-4">
            <Note tone="white" className="!p-0">
              <TodayList />
            </Note>
          </div>
          <div className="absolute bottom-2 right-3 z-30 -rotate-2 sm:right-10">
            <Note tone="sun" className="!p-3">
              <ParentSlip />
            </Note>
          </div>
          <Arrow className="absolute left-[44%] top-[56%] z-0 rotate-[200deg]" />
        </div>
      </section>

      {/* A day of Minh */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
          <h2 className="font-serif text-3xl font-semibold md:text-5xl">Một ngày của Minh</h2>
          <Hand className="pb-1">nhân vật minh họa</Hand>
        </div>
        <Squiggle className="mt-3" />
        <ol className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-2">
          {DAY.map(([t, title, body]) => (
            <li key={t} className="flex gap-5">
              <span className="font-hand text-4xl leading-none text-moss">{t}</span>
              <div className="border-l-2 border-rule pl-5">
                <h3 className="font-serif text-xl font-semibold">{title}</h3>
                <p className="mt-1.5 leading-relaxed text-ink-2">{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-8 max-w-xl text-ink-2">
          Cả ngày chừng 15 phút. Bỏ một hôm thì lộ trình dời theo, không có gì bị mất. <Link href="/hoc-vien" className="font-semibold text-moss-strong underline underline-offset-4">Xem Lexica →</Link>
        </p>
      </section>

      {/* Teacher */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
          <Note tone="white" tilt={-1} className="!p-8">
            <p className="font-hand text-3xl text-pen">Sáng thứ ba của cô Hạnh</p>
            <ul className="mt-5 space-y-4 text-[17px]">
              {[
                ["Em An bốn hôm chưa ôn", "nhắn một câu"],
                ["Cả lớp hay sai “dilemma”", "giao bài ôn riêng từ đó"],
                ["Em Chi nghỉ hai buổi", "gọi hỏi thăm"],
                ["Tối nay 14 em đủ cả", "chiếu Đấu trường cuối giờ"],
              ].map(([a, b]) => (
                <li key={a} className="flex items-start gap-3">
                  <span aria-hidden className="mt-1 h-5 w-5 shrink-0 rounded border-2 border-ink/60" />
                  <span>
                    <span className="font-semibold">{a}</span> <span className="text-ink-3">→</span> <span className="font-hand text-2xl leading-none text-moss-strong">{b}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Note>
          <div>
            <h2 className="font-serif text-3xl font-semibold leading-tight md:text-5xl">
              Thầy cô <Circled>thấy</Circled> trước khi em ấy bỏ.
            </h2>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-2">
              Teach lấy số liệu từ chính việc học của học viên. Mỗi con số đi kèm một việc làm được ngay, và báo cáo tuần cho phụ huynh viết sẵn bằng tiếng Việt dễ hiểu.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/giao-vien">Cho giáo viên</Button>
              <Button href="/trung-tam" tone="line">
                Cho trung tâm
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Two tracks, as two tabs */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-serif text-3xl font-semibold md:text-5xl">Thi chứng chỉ, hay nói được ngoài đời?</h2>
        <p className="mt-3 text-ink-2">
          Chọn lúc bắt đầu. <Hand className="text-xl">{TRACK_SWITCH_NOTE.toLowerCase().replace(/\.$/, "")}</Hand>
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {(["cert", "talk"] as const).map((t) => (
            <article key={t} className={`rounded-2xl rounded-tl-none border-2 border-ink p-7 ${t === "cert" ? "bg-sky/50" : "bg-blush/60"}`}>
              <p className={`inline-block -translate-y-11 rounded-t-lg border-2 border-b-0 border-ink px-4 py-1 font-semibold ${t === "cert" ? "bg-sky" : "bg-blush"}`}>{TRACK_LABEL[t]}</p>
              <div className="-mt-9 space-y-2 text-[17px]">
                {TRACK_ROWS.map((r) => (
                  <p key={r.label}>
                    <b>{r.label}</b> {r[t]}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Proof: left blank on purpose */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <Note tone="white" tilt={1} className="mx-auto max-w-2xl !p-9 text-center">
          <p className="font-hand text-3xl text-pen">chỗ này đang để trống</p>
          <p className="mt-3 font-serif text-2xl font-semibold">Chúng tôi đang chạy cùng những lớp đầu tiên.</p>
          <p className="mt-3 text-ink-2">Khi có số liệu thật (tỉ lệ quay lại, số từ nhớ sau 30 ngày, lời của thầy cô), chúng tôi sẽ dán vào đây. Chưa có thì chưa viết.</p>
          <div className="mt-6 flex justify-center">
            <Button href={CONTACT} tone="line">
              Thí điểm cùng lớp của bạn
            </Button>
          </div>
        </Note>
      </section>

      {/* Prices as tags */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <h2 className="font-serif text-3xl font-semibold md:text-5xl">Giá thử nghiệm</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            ["Người học", "0 đồng", "để học mỗi ngày. Gói Plus khoảng 79–99 nghìn mỗi tháng. Học viên được thầy cô giao bài có Plus khi còn trong lớp.", "sky"],
            ["Giáo viên", "~199 nghìn", "mỗi tháng. Dành cho giáo viên tự mở lớp.", "sun"],
            ["Trung tâm", "30–50 nghìn", "mỗi học viên đang học, mỗi tháng. Kèm bảng nhìn cả trung tâm.", "blush"],
          ].map(([who, price, note, tone], i) => (
            <Note key={who} tone={tone as "sky" | "sun" | "blush"} tilt={[-1.5, 1, -0.5][i]} className="!pb-7">
              <p className="font-hand text-2xl text-pen">{who}</p>
              <p className="mt-1 font-serif text-4xl font-semibold">{price}</p>
              <p className="mt-3 leading-relaxed text-ink-2">{note}</p>
            </Note>
          ))}
        </div>
        <p className="mt-6 text-sm text-ink-3">Mức dự kiến, có thể đổi sau thí điểm.</p>
      </section>
    </main>
  );
}
