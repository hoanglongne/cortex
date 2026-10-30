import type { Metadata } from "next";
import { Circled, Hand, Note, Squiggle } from "@/components/brand/doodle";
import { Button } from "@/components/brand/ui";
import { CONTACT } from "@/lib/links";

export const metadata: Metadata = { title: "Cho trung tâm | Cortex", description: "Nhìn cả trung tâm trên một màn hình: lớp nào chững, em nào có nguy cơ nghỉ, giáo viên nào cần hỗ trợ." };

export default function Centers() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 md:py-20">
      <Hand className="block -rotate-1">cho trung tâm</Hand>
      <h1 className="mt-2 max-w-3xl font-serif text-4xl font-semibold leading-[1.08] md:text-6xl">
        Có số liệu trước khi có <Circled>lời phàn nàn</Circled>.
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-2">
        Mỗi giáo viên của trung tâm dùng Teach cho lớp của mình. Quản lý nhìn tất cả trên một màn hình, và vẫn tôn trọng quyền riêng tư: chỉ có con số, không có bài làm của học viên.
      </p>
      <div className="mt-8">
        <Button href={CONTACT}>Thí điểm cùng trung tâm</Button>
      </div>

      <section className="mt-24">
        <h2 className="font-serif text-3xl font-semibold md:text-4xl">Quản lý thấy gì</h2>
        <Squiggle className="mt-3" />
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            ["Em nào có nguy cơ nghỉ", "Danh sách học viên có dấu hiệu bỏ học trên toàn trung tâm, kèm giáo viên phụ trách.", "sky", -1.5],
            ["Lớp nào đang chững", "So sánh mức ôn bài giữa các lớp để biết nên hỗ trợ ở đâu trước.", "sun", 1],
            ["Giáo viên mới vào là dùng được", "Mời bằng một liên kết. Lớp, điểm danh và báo cáo phụ huynh có sẵn, không cần tập huấn dài.", "blush", -1],
          ].map(([t, d, tone, tilt]) => (
            <Note key={t as string} tone={tone as "sky" | "sun" | "blush"} tilt={tilt as number}>
              <p className="font-serif text-xl font-semibold">{t}</p>
              <p className="mt-2 leading-relaxed text-ink-2">{d}</p>
            </Note>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <Note tone="white" tilt={0.5} className="max-w-2xl !p-8">
          <Hand className="block">giá thử nghiệm</Hand>
          <p className="mt-1 font-serif text-3xl font-semibold">30–50 nghìn đồng mỗi học viên mỗi tháng</p>
          <p className="mt-2 text-ink-2">Tính theo học viên đang học. Mức dự kiến, có thể đổi sau thí điểm; trung tâm tham gia thí điểm sẽ được báo giá cụ thể.</p>
        </Note>
      </section>
    </main>
  );
}
