"use client";

import { useState } from "react";
import {
  MARK_LABEL,
  MARKS,
  sessionCounts,
  type Mark,
  type Session,
} from "@cortex/classroom";
import { Button, ErrorNote, errorText, inputClass } from "../ui";
import { api } from "../../lib/supabase";

/** The colour of a mark: came (green), late (lighter green), missed (warm), with leave (neutral). */
export const MARK_DOT: Record<Mark, string> = {
  present: "bg-accent",
  late: "bg-step-nho",
  absent: "bg-warm",
  excused: "bg-line-strong",
};

const ON: Record<Mark, string> = {
  present: "bg-accent text-on-accent border-accent",
  late: "bg-accent-soft text-accent-strong border-accent",
  absent: "bg-warm-soft text-warm border-warm",
  excused: "bg-surface-2 text-ink border-line-strong",
};

/**
 * Taking the roll for one day: everyone starts as present (what most of the
 * class is), the teacher taps the exceptions, writes what the lesson was
 * about, and saves once. Marks already saved are kept as they were.
 */
export default function Roll({
  classId,
  date,
  students,
  session,
  onSaved,
}: {
  classId: string;
  date: string;
  students: { user_id: string; name: string }[];
  session?: Session;
  onSaved: () => Promise<void> | void;
}) {
  const [marks, setMarks] = useState<Record<string, Mark>>(() =>
    Object.fromEntries(
      students.map((s) => [s.user_id, session?.marks[s.user_id] ?? "present"]),
    ),
  );
  const [topic, setTopic] = useState(session?.topic ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ids = students.map((s) => s.user_id);
  const c = sessionCounts({ date, topic, cancelled: false, marks }, ids);
  const set = (id: string, m: Mark) => setMarks((x) => ({ ...x, [id]: m }));

  return (
    <div className="space-y-6">
      <label className="block">
        <span className="text-[15px] font-medium text-ink-2">
          Buổi này học gì (không bắt buộc)
        </span>
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          maxLength={120}
          className={`${inputClass} mt-2`}
          placeholder="Ví dụ: Unit 3, Travel"
        />
      </label>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[15px] text-ink-2">
          <b className="text-ink tabular">{c.present + c.late}</b>/{ids.length}{" "}
          có mặt
          {c.late > 0 && <> · {c.late} muộn</>}
          {c.absent > 0 && (
            <span className="text-warm"> · {c.absent} vắng</span>
          )}
          {c.excused > 0 && <> · {c.excused} có phép</>}
        </p>
        <button
          type="button"
          onClick={() =>
            setMarks(Object.fromEntries(ids.map((id) => [id, "present"])))
          }
          className="px-1 text-[15px] text-accent-strong hover:underline"
        >
          Cả lớp có mặt
        </button>
      </div>

      <ul className="divide-y divide-line rounded-[var(--radius-card)] bg-surface px-4 shadow-[var(--shadow-card)] sm:px-5">
        {students.map((s) => (
          <li
            key={s.user_id}
            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3.5"
          >
            <span className="min-w-0 text-ink">{s.name}</span>
            <span
              className="flex gap-1"
              role="radiogroup"
              aria-label={`Điểm danh ${s.name}`}
            >
              {MARKS.map((m) => (
                <button
                  key={m}
                  type="button"
                  role="radio"
                  aria-checked={marks[s.user_id] === m}
                  onClick={() => set(s.user_id, m)}
                  className={`h-9 rounded-full border px-3 text-[14px] ${marks[s.user_id] === m ? `${ON[m]} font-semibold` : "border-line text-muted hover:text-ink"}`}
                >
                  {MARK_LABEL[m]}
                </button>
              ))}
            </span>
          </li>
        ))}
      </ul>

      <div className="sticky bottom-0 -mx-1 space-y-3 bg-bg px-1 pb-1 pt-3">
        <ErrorNote error={error} />
        <Button
          className="w-full"
          disabled={busy || ids.length === 0}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              await api.markAttendance(classId, date, marks, topic);
              await onSaved();
            } catch (e) {
              setError(errorText(e));
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Đang lưu…" : "Lưu điểm danh"}
        </Button>
      </div>
    </div>
  );
}
