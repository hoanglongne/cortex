import type { Metadata } from "next";
import { Circled, Hand, Note, Squiggle } from "@/components/brand/doodle";
import { FlashCard } from "@/components/brand/mocks";
import { Button } from "@/components/brand/ui";
import { LEXICA_URL, ORATIO_URL } from "@/lib/links";

export const metadata: Metadata = { title: "Cho người học | Cortex", description: "Học từ vựng tiếng Anh nhớ lâu: ôn đúng lúc sắp quên, đọc, nói và chơi với bạn học." };

const STEPS: [string, string, string][] = [
  ["1", "Hiểu", "Biết nghĩa và cách dùng của từ qua ví dụ đời thường và tiếng đọc."],
  ["2", "Nhớ", "Ôn đúng lúc sắp quên. Từ đã chắc thì không bắt bạn ôn lại."],
  ["3", "Gặp", "Gặp lại từ trong bài đọc và ngoài đời, để từ không chỉ nằm trên thẻ."],
  ["4", "Dùng", "Nói và viết với từ đó. Phát âm được chấm, câu của bạn được lưu."],
];

const GAMES = ["Thám tử từ", "Từ nói dối", "Nghe và bắt từ", "Chớp", "Ghép", "Gõ", "Nối chuỗi", "Điền đoạn", "Nâng cấp câu"];

export default function Learners() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 md:py-20">
      <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <Hand className="block -rotate-1">cho người học</Hand>
          <h1 className="mt-2 font-serif text-4xl font-semibold leading-[1.08] md:text-6xl">
            Học từ nào, <Circled>nhớ</Circled> từ đó.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
            Lexica cho bạn một phiên ngắn mỗi ngày: ôn những từ sắp quên, học từ mới, đọc một đoạn có chính những từ ấy, rồi nói thử. Chơi game cũng là ôn.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={LEXICA_URL}>Học thử, miễn phí</Button>
            {ORATIO_URL && (
              <Button href={ORATIO_URL} tone="line">
                Luyện nói với bạn học (Oratio)
              </Button>
            )}
          </div>
        </div>
        <div className="flex justify-center lg:justify-end">
          <div className="-rotate-2">
            <FlashCard />
          </div>
        </div>
      </div>

      <section className="mt-24">
        <h2 className="font-serif text-3xl font-semibold md:text-4xl">Mỗi từ đi qua bốn bước</h2>
        <Squiggle className="mt-3" />
        <ol className="mt-8 grid gap-6 md:grid-cols-4">
          {STEPS.map(([n, t, d], i) => (
            <li key={t}>
              <Note tone={(["sky", "sun", "blush", "moss"] as const)[i]} tilt={[-1.5, 1, -1, 1.5][i]} className="h-full">
                <p className="font-hand text-4xl leading-none text-pen">{n}</p>
                <p className="mt-2 font-serif text-xl font-semibold">{t}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{d}</p>
              </Note>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-24 grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
        <div>
          <h2 className="font-serif text-3xl font-semibold leading-tight md:text-4xl">Chơi cũng là ôn.</h2>
          <p className="mt-4 text-lg leading-relaxed text-ink-2">
            Chín trò, mỗi trò một cách nhớ từ. Từ bạn chơi sai sẽ quay lại phần ôn của bạn, từ chơi đúng được tính một lần nhớ. Bạn bè có thể thách đấu nhau và nhìn thắng thua trong tuần.
          </p>
        </div>
        <ul className="flex flex-wrap gap-3">
          {GAMES.map((g, i) => (
            <li key={g} style={{ transform: `rotate(${[-2, 1.5, -1, 2, -1.5, 1][i % 6]}deg)` }} className="rounded-full border-2 border-ink bg-white px-4 py-2 font-semibold">
              {g}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-24">
        <Note tone="moss" tilt={-0.5} className="max-w-3xl !p-8">
          <Hand className="block">về điểm số</Hand>
          <p className="mt-2 text-lg leading-relaxed text-ink-2">
            Bài kiểm tra từ vựng thích ứng cho bạn một mức ước lượng, kèm khoảng rộng chừng một band IELTS. Đó là vốn từ của bạn, không phải điểm thi: điểm thật còn tùy ngữ pháp, nghe, nói và cách làm bài.
          </p>
        </Note>
      </section>
    </main>
  );
}
