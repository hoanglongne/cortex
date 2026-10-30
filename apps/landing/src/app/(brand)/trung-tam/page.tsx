import type { Metadata } from "next";
import { Button, Eyebrow, Fact, Mark } from "@/components/brand/ui";
import { CONTACT } from "@/lib/links";

export const metadata: Metadata = { title: "Cho trung tâm | Cortex", description: "Nhìn cả trung tâm trên một màn hình: lớp nào chững, em nào có nguy cơ nghỉ, giáo viên nào cần hỗ trợ." };

export default function Centers() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-14 md:py-20">
      <Eyebrow>Cho trung tâm</Eyebrow>
      <h1 className="mt-4 max-w-3xl font-serif text-4xl font-semibold leading-[1.1] md:text-5xl">
        Có số liệu trước khi có <Mark>lời phàn nàn</Mark>.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2">
        Mỗi giáo viên của trung tâm dùng Teach cho lớp của mình. Quản lý nhìn tất cả trên một màn hình, và vẫn tôn trọng quyền riêng tư: chỉ có con số, không có bài làm của học viên.
      </p>
      <div className="mt-8">
        <Button href={CONTACT}>Cùng thí điểm với trung tâm</Button>
      </div>

      <div className="mt-16 grid gap-x-10 gap-y-8 md:grid-cols-3">
        <Fact n="01" title="Em nào có nguy cơ nghỉ">
          Danh sách học viên có dấu hiệu bỏ học trên toàn trung tâm, kèm giáo viên phụ trách.
        </Fact>
        <Fact n="02" title="Lớp nào đang chững">
          So sánh mức ôn bài giữa các lớp để biết nên hỗ trợ ở đâu trước.
        </Fact>
        <Fact n="03" title="Giáo viên mới vào cũng dùng được">
          Mời giáo viên bằng một liên kết. Lớp, điểm danh và báo cáo phụ huynh có sẵn, không cần tập huấn dài.
        </Fact>
      </div>

      <section className="mt-20 rounded-2xl border border-rule bg-white/60 p-8">
        <Eyebrow>Giá thử nghiệm</Eyebrow>
        <p className="mt-3 font-serif text-2xl font-semibold">Khoảng 30–50 nghìn đồng mỗi học viên mỗi tháng.</p>
        <p className="mt-2 text-ink-2">Tính theo học viên đang học. Mức này dự kiến và có thể đổi sau thí điểm; trung tâm tham gia thí điểm sẽ được báo giá cụ thể.</p>
      </section>
    </main>
  );
}
