"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import { cleanCode, setPendingCode } from "@/lib/classroom";

/**
 * A class link from a teacher (oratio…/join/ABC123). The app is one screen
 * flow, so the code waits in this browser; after sign-in the "Lớp học"
 * screen opens with it filled in.
 */
export default function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();
  useEffect(() => {
    setPendingCode(cleanCode(decodeURIComponent(code)));
    router.replace("/");
  }, [code, router]);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg">
      <LoadingSpinner size="md" message="Đang mở lớp…" />
    </div>
  );
}
