"use client";

import { useCallback, useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { daysUntil, type ClassInfo, type LeaderRow } from "@cortex/classroom";
import { assignmentState, fmtBand, oratioModule, ORATIO, partLabel, type OratioMetrics } from "@cortex/classroom-oratio";
import { syncClasses } from "@/actions/classroom";
import { Button } from "@/components/ui/button";
import { Card, EmptyState, Label, Notice } from "@/components/ui/card";
import { FlowShell } from "@/components/ui/shell";
import { classes as api, cleanCode, dueLabel, pendingCode, setPendingCode } from "@/lib/classroom";
import { cn } from "@/lib/utils";

interface ClassScreenProps {
  /** The name the class sees, filled in for joining. */
  defaultName: string;
  onBack: () => void;
}

/**
 * "Lớp học": join with the teacher's code (or a /join link), see what the
 * teacher gave and how far you are, the class ranking when the teacher
 * turned it on, and leave. Practice itself stays in Phòng thi and Tập một
 * mình, which ask the assigned questions first.
 */
export default function ClassScreen({ defaultName, onBack }: ClassScreenProps) {
  const [list, setList] = useState<ClassInfo[] | null>(null);
  const [metrics, setMetrics] = useState<OratioMetrics | null>(null);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState("");

  const load = useCallback(async () => {
    const r = await syncClasses();
    setList(r.classes);
    setMetrics(r.metrics);
    if (r.error) setError(r.error);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading data on open
    void load();
  }, [load]);

  return (
    <FlowShell title="Lớp học" onBack={onBack}>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">Lớp học</h1>
      <p className="mt-2 text-muted">Giáo viên giao chủ đề hoặc câu hỏi; Phòng thi và Tập một mình sẽ hỏi bạn những câu đó trước.</p>

      <JoinForm
        defaultName={defaultName}
        onJoined={(name) => {
          setJoined(name);
          setError("");
          void load();
        }}
        onError={setError}
      />
      {joined && (
        <Notice className="mt-4" onDismiss={() => setJoined("")}>
          Bạn đã vào lớp {joined}.
        </Notice>
      )}
      {error && (
        <Notice tone="error" className="mt-4" onDismiss={() => setError("")}>
          {error}
        </Notice>
      )}

      <div className="mt-8 space-y-4">
        {list === null ? (
          <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-surface" aria-busy />
        ) : list.length === 0 ? (
          <EmptyState title="Bạn chưa ở lớp nào">Nhập mã lớp giáo viên gửi, hoặc mở link mời của lớp.</EmptyState>
        ) : (
          list.map((c) => <ClassCard key={c.id} cls={c} metrics={metrics} onLeft={load} />)
        )}
      </div>
    </FlowShell>
  );
}

function JoinForm({ defaultName, onJoined, onError }: { defaultName: string; onJoined: (name: string) => void; onError: (e: string) => void }) {
  const [code, setCode] = useState(() => pendingCode() ?? "");
  const [name, setName] = useState(defaultName);
  const [busy, setBusy] = useState(false);
  const clean = cleanCode(code);

  const join = async () => {
    if (!clean || !name.trim()) return;
    setBusy(true);
    onError("");
    try {
      const r = await api.joinClass(clean, name.trim());
      setPendingCode(null);
      setCode("");
      onJoined(r.name);
    } catch (e) {
      onError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="mt-6">
      <Label>Vào lớp bằng mã</Label>
      <p className="mt-2 text-sm text-muted">
        Giáo viên sẽ thấy tên bạn, số buổi và số phút đã nói, band bạn luyện chấm và tiến độ bài của lớp. Không thấy bản ghi hay nội dung buổi nói.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-[9rem_1fr_auto]">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Mã lớp"
          maxLength={6}
          aria-label="Mã lớp"
          className="h-11 rounded-[var(--radius-control)] border border-line-strong bg-bg px-3 font-mono tracking-[0.2em] text-ink"
        />
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên hiện trong lớp"
          maxLength={40}
          aria-label="Tên hiện trong lớp"
          className="h-11 rounded-[var(--radius-control)] border border-line-strong bg-bg px-3 text-ink"
        />
        <Button variant="primary" onClick={() => void join()} disabled={busy || !clean || !name.trim()}>
          {busy ? "Đang vào…" : "Vào lớp"}
        </Button>
      </div>
    </Card>
  );
}

function ClassCard({ cls, metrics, onLeft }: { cls: ClassInfo; metrics: OratioMetrics | null; onLeft: () => void }) {
  const [board, setBoard] = useState<LeaderRow[] | null>(null);
  const work = cls.assignments.filter((a) => a.app === ORATIO);
  const target = oratioModule.parseSettings(cls.settings[ORATIO]).target_band;
  const ranked = cls.leaderboard && cls.leaderboard_app === ORATIO;

  useEffect(() => {
    if (!ranked) return;
    api.leaderboard(cls.id).then(setBoard, () => setBoard([]));
  }, [cls.id, ranked]);

  return (
    <Card data-testid="class-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-semibold text-ink">{cls.name}</p>
          <p className="mt-0.5 font-mono text-xs text-muted">
            {cls.members} học viên{target ? ` · mục tiêu band ${fmtBand(target)}` : ""}
            {cls.org ? ` · ${cls.org}` : ""}
          </p>
        </div>
        <button
          onClick={() => {
            if (window.confirm(`Rời lớp ${cls.name}? Giáo viên sẽ không thấy tiến độ của bạn nữa.`)) void api.leaveClass(cls.id).then(onLeft);
          }}
          className="flex h-9 items-center gap-1 rounded-[var(--radius-control)] px-2 text-xs text-muted hover:text-danger"
        >
          <LogOut className="size-3.5" /> Rời lớp
        </button>
      </div>

      <div className="mt-5">
        <Label>Bài được giao</Label>
        {work.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Giáo viên chưa giao bài nói nào.</p>
        ) : (
          <ul className="mt-2 divide-y divide-line">
            {work.map((a) => {
              const payload = oratioModule.parsePayload(a.kind, a.payload);
              const st = assignmentState({ kind: a.kind, payload }, metrics?.progress[a.id]);
              const days = a.due_on ? daysUntil(a.due_on) : null;
              return (
                <li key={a.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-ink">{a.title}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {payload.kind === "topic"
                        ? `${payload.category} · ${partLabel(payload.part)}`
                        : payload.kind === "questions"
                          ? `${payload.question_ids.length} câu hỏi được hỏi trước`
                          : "Tính từ ngày giao"}
                      {days !== null && (
                        <span className={cn("ml-1.5 font-mono", days <= 1 && !st.done ? "text-onair" : "text-subtle")}>· {dueLabel(days)}</span>
                      )}
                    </p>
                  </div>
                  <span className={cn("shrink-0 font-mono text-sm tabular", st.done ? "text-ink" : "text-muted")}>{st.done ? `✓ ${st.line}` : st.line}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {ranked && board && board.length > 0 && (
        <div className="mt-5">
          <Label>Xếp hạng theo phút nói</Label>
          <ol className="mt-2 space-y-1">
            {board.slice(0, 10).map((r, i) => (
              <li key={`${r.name}-${i}`} className={cn("flex items-center gap-3 rounded-[var(--radius-control)] px-2 py-1.5 text-sm", r.me ? "bg-surface-2 text-ink" : "text-ink-2")}>
                <span className="w-5 text-right font-mono text-xs text-muted">{i + 1}</span>
                <span className="flex-1 truncate">
                  {r.name}
                  {r.me ? " (bạn)" : ""}
                </span>
                <span className="font-mono text-xs tabular">{Math.round(r.score)} phút</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Card>
  );
}
