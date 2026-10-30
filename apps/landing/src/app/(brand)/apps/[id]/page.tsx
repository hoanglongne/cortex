import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Hand, Note } from "@/components/brand/doodle";
import { Button } from "@/components/brand/ui";
import { ecosystemApps, languageMap, pillarMap, statusMap } from "@/data/ecosystem";
import { LEXICA_URL, ORATIO_URL } from "@/lib/links";

export function generateStaticParams() {
  return ecosystemApps.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const app = ecosystemApps.find((a) => a.id === id);
  return { title: app ? `${app.name} | Cortex` : "Cortex" };
}

const OPEN: Record<string, string | null> = { lexica: LEXICA_URL, oratio: ORATIO_URL };

export default async function AppPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = ecosystemApps.find((a) => a.id === id);
  if (!app) notFound();
  const href = app.status === "Live" ? OPEN[app.id] : null;
  return (
    <main className="mx-auto max-w-3xl px-5 py-14 md:py-20">
      <Link href="/dang-nghi-toi" className="text-sm text-ink-3 hover:text-ink">
        ← Tất cả
      </Link>
      <Hand className="mt-6 block">{statusMap[app.status]}</Hand>
      <h1 className="mt-1 font-serif text-5xl font-semibold">{app.name}</h1>
      <p className="mt-5 text-lg leading-relaxed text-ink-2">{app.pureFunctionDesc.replace("Giải quyết CHÍNH XÁC một vấn đề: ", "")}</p>
      <Note tone="white" tilt={-1} className="mt-8">
        <dl className="space-y-1 text-[15px]">
          <div className="flex justify-between gap-4"><dt className="text-ink-3">Mảng</dt><dd>{pillarMap[app.pillar]}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-ink-3">Ngôn ngữ</dt><dd>{languageMap[app.language]}</dd></div>
          {app.targetLaunchDate && <div className="flex justify-between gap-4"><dt className="text-ink-3">Dự kiến</dt><dd>{app.targetLaunchDate}</dd></div>}
        </dl>
      </Note>
      {href && (
        <div className="mt-8">
          <Button href={href}>Mở {app.name}</Button>
        </div>
      )}
    </main>
  );
}
