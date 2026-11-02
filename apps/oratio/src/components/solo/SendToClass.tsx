"use client";

import { useEffect, useState } from "react";
import { confirmClassSubmission, myClassWork, requestClassUpload, type ClassWork } from "@/actions/class-answers";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/card";

/**
 * "Nộp vào lớp": hands this answer in to a class the student is in (with the
 * assignment it is for, when there is one). The teacher hears it; classmates
 * only when the teacher allows. Shown only to students in a class using Oratio.
 */
export function SendToClass({ answerId, blob, submitted, onSent }: { answerId: string; blob: Blob; submitted?: boolean; onSent: () => void }) {
  const [work, setWork] = useState<ClassWork[] | null>(null);
  const [classId, setClassId] = useState("");
  const [assignmentId, setAssignmentId] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    myClassWork().then((r) => {
      if (!live) return;
      setWork(r.classes);
      if (r.classes[0]) setClassId(r.classes[0].classId);
    });
    return () => {
      live = false;
    };
  }, []);

  if (submitted && !done) return null;
  if (done) return <Notice tone="good">Đã nộp vào lớp. Thầy cô sẽ nghe và chấm.</Notice>;
  if (!work || work.length === 0) return null;
  const current = work.find((c) => c.classId === classId) ?? work[0];

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      const mime = blob.type || "audio/webm";
      const req = await requestClassUpload(answerId, current.classId, mime);
      if (req.error || !req.path || !req.token) return setError(req.error ?? "Không nộp được. Thử lại sau nhé.");
      const { error: upErr } = await getSupabaseClient().storage.from("oratio-answers").uploadToSignedUrl(req.path, req.token, blob, { contentType: mime.split(";")[0] || "audio/webm" });
      if (upErr) return setError("Không tải bản ghi lên được. Kiểm tra mạng rồi thử lại.");
      const ok = await confirmClassSubmission(answerId, current.classId, assignmentId || null, req.path);
      if (ok.error) return setError(ok.error);
      setDone(true);
      onSent();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface p-3.5 space-y-3">
      <p className="text-[15px] font-bold text-ink">Nộp vào lớp</p>
      {work.length > 1 && (
        <select value={classId} onChange={(e) => { setClassId(e.target.value); setAssignmentId(""); }} aria-label="Lớp" className="h-10 w-full rounded-xl border border-line-strong bg-surface px-3 text-sm text-ink">
          {work.map((c) => (
            <option key={c.classId} value={c.classId}>{c.className}</option>
          ))}
        </select>
      )}
      {current.assignments.length > 0 && (
        <select value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)} aria-label="Bài được giao" className="h-10 w-full rounded-xl border border-line-strong bg-surface px-3 text-sm text-ink">
          <option value="">Không thuộc bài nào</option>
          {current.assignments.map((a) => (
            <option key={a.id} value={a.id}>{a.title}{a.due ? ` (hạn ${a.due})` : ""}</option>
          ))}
        </select>
      )}
      <p className="text-xs text-muted">Giọng của bạn chỉ thầy cô nghe{current.peers ? ", và các bạn cùng lớp khi chấm chéo trong lớp" : ""}. Tự xoá sau 30 ngày.</p>
      {error && <Notice tone="error">{error}</Notice>}
      <Button variant="primary" block disabled={busy} onClick={() => void send()}>
        {busy ? "Đang nộp…" : `Nộp vào ${current.className}`}
      </Button>
    </div>
  );
}
