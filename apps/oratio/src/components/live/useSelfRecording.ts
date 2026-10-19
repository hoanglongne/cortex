"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveAnswer } from "./types";

const MIN_MS = 1000;

function pickMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  return ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((m) => MediaRecorder.isTypeSupported(m));
}

interface Current {
  rec: MediaRecorder;
  chunks: Blob[];
  startedAt: number;
  question: { id: string; part: number; text: string };
  done: Promise<void>;
}

/**
 * Records only this user's own microphone, one clip per question. It opens its own
 * getUserMedia stream (the LiveKit track may be muted or replaced mid-call) and never
 * touches the partner's audio. Nothing leaves the device here.
 */
export function useSelfRecording({
  active,
  muted,
  question,
}: {
  /** Candidate, real call, and the learner left recording on */
  active: boolean;
  muted: boolean;
  question: { id: string; part: number; text: string } | null;
}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState(false);
  const answersRef = useRef<LiveAnswer[]>([]);
  const currentRef = useRef<Current | null>(null);
  const pendingRef = useRef<Promise<void>[]>([]);

  const stopCurrent = useCallback(() => {
    const cur = currentRef.current;
    if (!cur) return;
    currentRef.current = null;
    pendingRef.current.push(cur.done);
    if (cur.rec.state !== "inactive") cur.rec.stop();
  }, []);

  // Microphone: open while active, release when not
  useEffect(() => {
    if (!active) return;
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(true);
      return;
    }
    let cancelled = false;
    let opened: MediaStream | null = null;
    navigator.mediaDevices.getUserMedia({ audio: true }).then(
      (s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        opened = s;
        setError(false);
        setStream(s);
      },
      () => !cancelled && setError(true)
    );
    return () => {
      cancelled = true;
      stopCurrent();
      opened?.getTracks().forEach((t) => t.stop());
      setStream(null);
    };
  }, [active, stopCurrent]);

  // Muting in the call mutes the recording too
  useEffect(() => {
    stream?.getAudioTracks().forEach((t) => (t.enabled = !muted));
  }, [stream, muted]);

  const qId = question?.id;
  const qPart = question?.part;
  const qText = question?.text;
  useEffect(() => {
    if (!active || !stream || !qId || qPart === undefined || qText === undefined) return;
    const mime = pickMime();
    let rec: MediaRecorder;
    try {
      rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    } catch {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError(true);
      return;
    }
    const chunks: Blob[] = [];
    const q = { id: qId, part: qPart, text: qText };
    const startedAt = Date.now();
    const done = new Promise<void>((resolve) => {
      rec.onstop = () => {
        const durationMs = Date.now() - startedAt;
        const type = rec.mimeType || mime || "audio/webm";
        if (durationMs >= MIN_MS && chunks.length > 0) {
          answersRef.current.push({ questionId: q.id, part: q.part, questionText: q.text, blob: new Blob(chunks, { type }), mimeType: type, durationMs });
        }
        resolve();
      };
    });
    rec.ondataavailable = (e) => e.data.size > 0 && chunks.push(e.data);
    rec.start();
    currentRef.current = { rec, chunks, startedAt, question: q, done };
    return stopCurrent;
  }, [active, stream, qId, qPart, qText, stopCurrent]);

  /** Stops the clip in progress and returns every answer recorded so far. */
  const finish = useCallback(async (): Promise<LiveAnswer[]> => {
    stopCurrent();
    await Promise.all(pendingRef.current);
    return answersRef.current.slice();
  }, [stopCurrent]);

  return { finish, error, recording: !!stream && !!qId };
}
