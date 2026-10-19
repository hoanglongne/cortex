"use client";

import { useState } from "react";
import { confirmSubmission, requestAudioUpload } from "@/actions/answers";
import { getSupabaseClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/card";

/** Audio leaves the device only here, when the learner presses the button for this answer. */
export function SendForReview({ answerId, blob, submitted, onSent }: { answerId: string; blob: Blob; submitted?: boolean; onSent: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (submitted) {
    return <Notice tone="good">Đã gửi. Điểm sẽ hiện ở tab Chấm khi có người chấm.</Notice>;
  }

  const send = async () => {
    setBusy(true);
    setError(null);
    try {
      const mime = blob.type || "audio/webm";
      const req = await requestAudioUpload(answerId, mime);
      if (req.error || !req.path || !req.token) {
        setError(req.error ?? "Không gửi được. Thử lại sau nhé.");
        return;
      }
      const { error: upErr } = await getSupabaseClient()
        .storage.from("oratio-answers")
        .uploadToSignedUrl(req.path, req.token, blob, { contentType: mime.split(";")[0] || "audio/webm" });
      if (upErr) {
        setError("Không tải bản ghi lên được. Kiểm tra mạng rồi thử lại.");
        return;
      }
      const done = await confirmSubmission(answerId, req.path);
      if (done.error) {
        setError(done.error);
        return;
      }
      onSent();
    } catch {
      setError("Không gửi được. Thử lại sau nhé.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted">Bản ghi được lưu riêng tư 30 ngày để người chấm nghe, rồi tự xoá.</p>
      {error && <Notice tone="error">{error}</Notice>}
      <Button variant="secondary" onClick={send} disabled={busy}>
        {busy ? "Đang gửi…" : "Gửi nhờ chấm"}
      </Button>
    </div>
  );
}
