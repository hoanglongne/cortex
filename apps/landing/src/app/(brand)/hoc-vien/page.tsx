import type { Metadata } from "next";
import { Button, Eyebrow, Fact, Mark, Phone } from "@/components/brand/ui";
import { LEXICA_URL, ORATIO_URL } from "@/lib/links";

export const metadata: Metadata = { title: "Cho người học | Cortex", description: "Học từ vựng tiếng Anh nhớ lâu: ôn đúng lúc sắp quên, đọc, nói và chơi với bạn học." };

export default function Learners() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 md:py-20">
      <div className="grid items-center gap-12 md:grid-cols-[1.2fr_1fr]">
        <div>
          <Eyebrow>Cho người học</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.1] md:text-5xl">
            Học từ nào, <Mark>nhớ</Mark> từ đó.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-2">
            Lexica cho bạn một phiên ngắn mỗi ngày: ôn những từ sắp quên, học từ mới, đọc một đoạn có chính những từ ấy, rồi nói thử. Chơi game cũng là ôn.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={LEXICA_URL}>Học thử miễn phí</Button>
            {ORATIO_URL && (
              <Button href={ORATIO_URL} tone="line">
                Luyện nói với bạn học (Oratio)
              </Button>
            )}
          </div>
        </div>
        <div className="flex justify-center gap-4 md:justify-end">
          <Phone src="/shots/lexica-detective.png" alt="Thám tử từ" className="-rotate-2" />
        </div>
      </div>

      <div className="mt-20 grid gap-8 md:grid-cols-4">
        <Fact n="1" title="Hiểu">
          Biết nghĩa và cách dùng của từ, qua ví dụ và âm thanh.
        </Fact>
        <Fact n="2" title="Nhớ">
          Ôn đúng lúc sắp quên, không ôn lại những gì đã chắc.
        </Fact>
        <Fact n="3" title="Gặp">
          Gặp lại từ trong bài đọc và ngoài đời.
        </Fact>
        <Fact n="4" title="Dùng">
          Nói và viết với từ đó, có chấm phát âm.
        </Fact>
      </div>

      <section className="mt-20">
        <Eyebrow>Chơi cũng là ôn</Eyebrow>
        <h2 className="mt-3 max-w-2xl font-serif text-3xl font-semibold leading-tight">Chín trò chơi, mỗi trò một cách nhớ từ.</h2>
        <p className="mt-3 max-w-2xl text-ink-2">
          Đoán từ qua manh mối, bắt cụm bị tráo từ, nghe và bắt từ, điền vào câu thật trong bài đọc, nâng cấp câu cho trang trọng. Từ sai sẽ quay lại phần ôn của bạn. Bạn bè có thể thách đấu nhau.
        </p>
      </section>

      <section className="mt-16 rounded-2xl bg-moss-soft p-8">
        <Eyebrow>Điểm của bạn</Eyebrow>
        <p className="mt-3 max-w-2xl text-ink-2">
          Bài kiểm tra từ vựng thích ứng cho bạn một mức ước lượng, kèm khoảng rộng khoảng một band IELTS. Đó là vốn từ của bạn, không phải điểm thi: điểm thật còn tùy ngữ pháp, nghe, nói và cách làm bài.
        </p>
      </section>
    </main>
  );
}
