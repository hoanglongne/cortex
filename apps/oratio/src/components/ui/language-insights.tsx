import { STRUCTURE_LABEL, type GrammarProfile, type Structure } from "@/lib/grammar-check";
import type { LexicalProfile } from "@/lib/lexical-weight";

const ALL: Structure[] = ["subordinate", "relative", "past", "perfect", "future", "modal", "passive", "conditional", "ing-clause"];

/**
 * What the words say about vocabulary and grammar: how many uncommon words and
 * which, words said again and again, which structures were tried and which
 * were not, and the few places the machine doubts. Shown under the transcript.
 */
export function LanguageInsights({ lexical, grammar }: { lexical: LexicalProfile | null; grammar: GrammarProfile | null }) {
  const lex = lexical && lexical.content >= 15 ? lexical : null;
  const gr = grammar && grammar.words >= 25 ? grammar : null;
  if (!lex && !gr) return null;
  const missing = gr ? ALL.filter((s) => !gr.structures.includes(s)).slice(0, 3) : [];
  return (
    <div className="mt-3 space-y-3 rounded-[12px] border border-line p-3">
      {lex && (
        <section>
          <h4 className="text-[13px] font-bold text-ink">Từ vựng</h4>
          <p className="mt-0.5 text-[13px] leading-snug text-ink-2">
            {Math.round(lex.advancedShare * 100)}% từ có nghĩa là từ ít gặp, độ đa dạng {Math.round(lex.variety * 100)}%.
          </p>
          {lex.examples.length > 0 && (
            <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px] text-subtle">
              Từ ít gặp bạn dùng:
              {lex.examples.map((w) => (
                <span key={w} className="rounded-full bg-good-soft px-2 py-0.5 font-semibold text-ink">
                  {w}
                </span>
              ))}
            </p>
          )}
          {lex.repeated.length > 0 && (
            <p className="mt-1.5 text-[12px] leading-snug text-subtle">
              Lặp nhiều: {lex.repeated.map((r) => `“${r.word}” ${r.count} lần`).join(", ")}. Thử thay bằng từ cụ thể hơn.
            </p>
          )}
        </section>
      )}
      {gr && (
        <section>
          <h4 className="text-[13px] font-bold text-ink">Ngữ pháp</h4>
          <p className="mt-0.5 text-[13px] leading-snug text-ink-2">
            Bạn đã dùng {gr.structures.length}/{ALL.length} loại cấu trúc
            {gr.structures.length > 0 ? `: ${gr.structures.map((s) => STRUCTURE_LABEL[s].split(" (")[0]).join(", ")}.` : "."}
          </p>
          {missing.length > 0 && <p className="mt-1 text-[12px] leading-snug text-subtle">Chưa thấy: {missing.map((s) => STRUCTURE_LABEL[s].split(" (")[0]).join(", ")}. Thêm một hai loại sẽ giúp điểm ngữ pháp.</p>}
          {gr.candidates.length > 0 ? (
            <ul className="mt-1.5 space-y-1 text-[12px] leading-snug text-ink-2">
              {gr.candidates.slice(0, 4).map((c, i) => (
                <li key={i}>
                  <b>“{c.snippet}”</b> ({c.rule}) → thử: {c.hint}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-[12px] leading-snug text-subtle">Máy không thấy lỗi rõ ràng. Lưu ý máy hay tự sửa ngữ pháp khi chép, nên bạn nghe lại để chắc.</p>
          )}
        </section>
      )}
    </div>
  );
}
