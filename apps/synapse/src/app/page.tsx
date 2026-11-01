"use client";

import { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import ThemePicker from "../components/ThemePicker";
import LoreSelection from "../components/LoreSelection";
import AuthScreen from "../components/AuthScreen";
import { type ThemeId } from "../lib/themes";
import { accountsOn } from "../lib/supabase";
import { loadRemote, localFor, mergeProgress, readOwner, saveRemote, writeOwner } from "../lib/account";
import { parseProgress, PROGRESS_KEY } from "../lib/level";

export default function Home() {
  const { setTheme, resetTheme } = useTheme();
  const { user, loading, signOut } = useAuth();
  const [screen, setScreen] = useState<"picker" | "lore">("picker");
  // The account's progress is merged into this device once per sign-in, before the game shows
  const [syncedFor, setSyncedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!user || syncedFor === user.id) return;
    let live = true;
    (async () => {
      try {
        const local = localFor(user.id, parseProgress(localStorage.getItem(PROGRESS_KEY)), readOwner());
        const remote = await loadRemote();
        const merged = remote ? mergeProgress(local, remote) : local;
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(merged));
        writeOwner(user.id);
        await saveRemote(merged);
      } catch {
        // Offline or the SQL is not run yet: the device's own progress still plays, and syncs next time.
      }
      if (live) setSyncedFor(user.id);
    })();
    return () => {
      live = false;
    };
  }, [user, syncedFor]);

  function handlePickTheme(id: ThemeId) {
    setTheme(id);
    setScreen("lore");
  }

  function handleBack() {
    resetTheme();
    setScreen("picker");
  }

  if (accountsOn()) {
    if (loading) return <main className="flex-1 flex items-center justify-center text-white/50 text-sm">Đang tải...</main>;
    if (!user) return <AuthScreen />;
    if (syncedFor !== user.id) return <main className="flex-1 flex items-center justify-center text-white/50 text-sm">Đang đồng bộ tiến độ...</main>;
  }

  const account = user ? (
    <div className="fixed bottom-2 right-2 z-50 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-[11px] text-white/70">
      <span className="max-w-[160px] truncate">{user.email}</span>
      <button onClick={() => void signOut()} className="underline">
        Đăng xuất
      </button>
    </div>
  ) : null;

  if (screen === "picker") {
    return (
      <>
        <ThemePicker onPick={handlePickTheme} />
        {account}
      </>
    );
  }

  return (
    <main className="flex-1 flex flex-col">
      <LoreSelection onBack={handleBack} />
      {account}
    </main>
  );
}
