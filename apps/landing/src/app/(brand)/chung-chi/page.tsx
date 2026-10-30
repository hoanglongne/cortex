import type { Metadata } from "next";
import { BRAND, TRACK_LABEL } from "@cortex/brand";
import { Circled, Hand, Note, Squiggle } from "@/components/brand/doodle";
import { Button } from "@/components/brand/ui";
import { LEXICA_URL } from "@/lib/links";

export const metadata: Metadata = { title: "Luyện IELTS cùng Cortex", description: "Từ vựng học thuật, đọc, viết và nói cho người học IELTS. Điểm chỉ là ước lượng, không hứa band." };

export default function Cert() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-14 md:py-20">
      <Hand className="block -rotate-1">hướng {TRACK_LABEL.cert.toLowerCase()}</Hand>
      <h1 className="mt-2 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] md:text-6xl">
        Vốn từ cho IELTS, <Circled>nhớ</Circled> thật chứ không nhớ tạm.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">
        Từ học thuật được xếp theo mức của bạn. Bạn học, ôn đúng lúc sắp quên, gặp lại từ trong bài đọc kiểu thi, rồi dùng nó khi nói và viết.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href={LEXICA_URL}>Làm bài kiểm tra từ vựng</Button>
        <Button href="/giao-vien" tone="line">
          Tôi là giáo viên IELTS
        </Button>
      </div>

      <section className="mt-24 grid gap-6 md:grid-cols-3">
        <Note tone="sky" tilt={-1.5}>
          <p className="font-serif text-xl font-semibold">Bài kiểm tra thích ứng</p>
          <p className="mt-2 leading-relaxed text-ink-2">Câu hỏi khó dần hoặc dễ dần theo bạn. Máy chủ chấm và xác minh, bạn có thể chia sẻ trang điểm.</p>
        </Note>
        <Note tone="sun" tilt={1}>
          <p className="font-serif text-xl font-semibold">Bài đọc kiểu thi</p>
          <p className="mt-2 leading-relaxed text-ink-2">Đoạn đọc chứa chính những từ bạn vừa học, kèm câu hỏi và trò điền từ vào câu thật.</p>
        </Note>
        <Note tone="blush" tilt={-1}>
          <p className="font-serif text-xl font-semibold">Nói theo Part</p>
          <p className="mt-2 leading-relaxed text-ink-2">Luyện nói với bạn học theo Part 1, 2, 3 và chấm chéo theo tiêu chí band trong Oratio.</p>
        </Note>
      </section>

      <section className="mt-24">
        <h2 className="font-serif text-3xl font-semibold md:text-4xl">Nói thật về điểm</h2>
        <Squiggle className="mt-3" />
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">
          Từ vựng liên hệ với điểm IELTS ở mức vừa phải, không phải mức chính xác. Khoảng ước lượng của Lexica rộng chừng một band và chưa được đối chiếu với điểm thi của nhiều người. {BRAND.estimateNote} Chúng tôi sẽ không bao giờ nói &ldquo;chắc chắn đạt band X&rdquo;.
        </p>
      </section>
    </main>
  );
}
