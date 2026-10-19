"use client";

import { Bell, CalendarPlus } from "lucide-react";
import { downloadExamCalendar, useExamReminder } from "@/lib/client/reminders";
import { Button } from "./button";
import { cn } from "@/lib/utils";

const NOTE: Record<string, string> = {
  on: "Mình nhắc lúc 20:10, trước khi phòng thi mở 20 phút.",
  off: "Một thông báo lúc 20:10 mỗi tối, trước khi phòng thi mở.",
  denied: "Trình duyệt đang chặn thông báo của Oratio. Bật lại trong cài đặt trang, hoặc thêm giờ thi vào lịch.",
  "ios-install": "Trên iPhone, cài Oratio lên màn hình chính để nhận nhắc. Hoặc thêm giờ thi vào lịch.",
  unsupported: "Máy này chưa nhận được thông báo từ Oratio. Thêm giờ thi vào lịch để được nhắc.",
};

/** "Nhắc giờ thi": web push when possible, a calendar file otherwise. */
export function ExamReminder({ className }: { className?: string }) {
  const { state, error, enable, disable } = useExamReminder();
  if (state === "loading") return null;
  const canPush = state === "on" || state === "off";
  return (
    <div className={cn("flex flex-col gap-3 rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p id="exam-reminder-label" className="flex items-center gap-2 font-bold text-ink">
            <Bell className="size-4 text-voice" aria-hidden /> Nhắc giờ thi
          </p>
          <p className="text-[13px] text-subtle">{NOTE[state]}</p>
        </div>
        {canPush && (
          <button
            role="switch"
            aria-checked={state === "on"}
            aria-labelledby="exam-reminder-label"
            onClick={() => void (state === "on" ? disable() : enable())}
            className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors", state === "on" ? "bg-good" : "bg-surface-3")}
          >
            <span
              aria-hidden
              className={cn("absolute left-0.5 top-0.5 size-6 rounded-full bg-surface shadow-sm transition-transform", state === "on" && "translate-x-5")}
            />
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      )}
      {!canPush && (
        <Button variant="secondary" size="sm" onClick={downloadExamCalendar} className="self-start">
          <CalendarPlus /> Thêm giờ thi vào lịch
        </Button>
      )}
    </div>
  );
}
