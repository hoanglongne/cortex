"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

/** A quiet loading state: the ON AIR dot breathing, and what is loading. */
export default function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
  const dot = size === "sm" ? "size-2" : size === "lg" ? "size-3.5" : "size-2.5";
  return (
    <div className="flex flex-col items-center gap-3" role="status">
      <span className={`${dot} rounded-full bg-onair animate-onair`} aria-hidden />
      {message && <p className="text-sm text-muted">{message}</p>}
    </div>
  );
}
