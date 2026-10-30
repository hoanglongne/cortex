import type { Metadata } from "next";
import { Hand, Note, Squiggle } from "@/components/brand/doodle";
import { Button } from "@/components/brand/ui";
import { CONTACT_MAILTO } from "@/lib/links";

export const metadata: Metadata = { title: "Thí điểm cùng Cortex", description: "Chúng tôi đang chạy thí điểm với các lớp và trung tâm đầu tiên. Tham gia để dùng sớm và góp ý." };

const STEPS: [string, string][] = [
  ["Nói chuyện 20 phút", "Bạn kể lớp của bạn thế nào, chúng tôi chỉ cách dùng. Không cần chuẩn bị gì."],
  ["Chạy với một lớp", "Một lớp, 4 đến 6 tuần. Học viên vào Lexica bằng một liên kết mời, thầy cô dùng Teach."],
  ["Xem số liệu cùng nhau", "Hết kỳ, cùng xem em nào nhớ thêm, em nào bỏ giữa chừng, và chỗ nào sản phẩm chưa ổn."],
];

export default function Pilot() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14 md:py-20">
      <Hand className="block -rotate-1">thí điểm</Hand>
      <h1 className="mt-2 font-serif text-4xl font-semibold leading-[1.08] md:text-6xl">Chạy thử cùng lớp của bạn.</h1>
      <p className="mt-6 text-lg leading-relaxed text-ink-2">
        Chúng tôi đang tìm những giáo viên và trung tâm đầu tiên để dùng sớm. Bạn được dùng miễn phí trong thời gian thí điểm, đổi lại chúng tôi cần nghe bạn nói thẳng chỗ nào dùng được, chỗ nào chưa.
      </p>
      <Squiggle className="mt-6" />
      <ol className="mt-8 space-y-6">
        {STEPS.map(([t, d], i) => (
          <li key={t} className="flex gap-5">
            <span className="font-hand text-4xl leading-none text-pen">{i + 1}</span>
            <div>
              <h2 className="font-serif text-xl font-semibold">{t}</h2>
              <p className="mt-1 leading-relaxed text-ink-2">{d}</p>
            </div>
          </li>
        ))}
      </ol>
      <Note tone="sun" tilt={-1} className="mt-12 !p-7">
        <p className="font-serif text-2xl font-semibold">Gửi cho chúng tôi vài dòng</p>
        <p className="mt-2 text-ink-2">Tên bạn, bạn dạy gì, lớp có bao nhiêu học viên. Chúng tôi trả lời trong vài ngày.</p>
        <div className="mt-5">
          {CONTACT_MAILTO ? (
            <Button href={CONTACT_MAILTO}>Gửi email</Button>
          ) : (
            <p className="font-hand text-2xl text-pen">địa chỉ liên hệ sẽ hiện ở đây khi trang được cấu hình</p>
          )}
        </div>
      </Note>
    </main>
  );
}
