import type { Metadata } from "next";
import { Eyebrow } from "@/components/brand/ui";
import { ecosystemApps } from "@/data/ecosystem";

export const metadata: Metadata = { title: "Đang nghĩ tới | Cortex", description: "Những ý tưởng chúng tôi đang mài dũa. Chưa phải sản phẩm." };

export default function Thinking() {
  const ideas = ecosystemApps.filter((a) => a.status !== "Live");
  return (
    <main className="mx-auto max-w-4xl px-5 py-14 md:py-20">
      <Eyebrow>Đang nghĩ tới</Eyebrow>
      <h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.1] md:text-5xl">Những ý tưởng chúng tôi đang mài dũa.</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink-2">Chưa phải sản phẩm. Ý nào đúng nhu cầu thật của người học và thầy cô sẽ được làm trước.</p>
      <ul className="mt-10 divide-y divide-rule border-y border-rule">
        {ideas.map((a) => (
          <li key={a.id} className="py-5">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-serif text-xl font-semibold">{a.name}</h2>
              {a.targetLaunchDate && <span className="font-mono text-xs text-ink-3">{a.targetLaunchDate}</span>}
            </div>
            <p className="mt-1.5 text-[15px] leading-relaxed text-ink-2">{a.pureFunctionDesc.replace("Giải quyết CHÍNH XÁC một vấn đề: ", "")}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}
