"use client";

import { useState } from "react";
import { getSupabaseClient } from "../lib/supabase";

/**
 * Sign in with the Cortex account: the email and password of Lexica work here.
 * A new email makes the account (typed twice), as in Lexica.
 */
export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit() {
    const supabase = getSupabaseClient();
    if (!supabase || busy || !email.includes("@") || password.length < 6) return;
    setBusy(true);
    setError("");
    const clean = email.trim().toLowerCase();
    const signIn = await supabase.auth.signInWithPassword({ email: clean, password });
    if (!signIn.error) return;
    if (!/invalid login credentials/i.test(signIn.error.message)) {
      setBusy(false);
      return setError(signIn.error.message);
    }
    if (repeat === null) {
      setBusy(false);
      return setRepeat("");
    }
    if (repeat !== password) {
      setBusy(false);
      return setError("Hai mật khẩu chưa khớp.");
    }
    const signUp = await supabase.auth.signUp({ email: clean, password });
    setBusy(false);
    if (signUp.error) return setError(signUp.error.message.includes("Password") ? "Mật khẩu cần ít nhất 6 ký tự." : signUp.error.message);
    if (signUp.data.user && signUp.data.user.identities?.length === 0) return setError("Sai mật khẩu. Tài khoản này đã có, thử đăng nhập lại.");
    if (!signUp.data.session) setNotice(`Đã tạo tài khoản. Mở email ${email} để xác nhận một lần, rồi đăng nhập lại ở đây.`);
  }

  const input = "w-full h-12 px-4 rounded-xl border border-white/20 bg-white/5 text-white placeholder-white/40 text-sm outline-none focus:border-white/60";
  return (
    <main className="flex-1 flex items-center justify-center p-6 bg-[#0a0a0a]">
      <form
        className="w-full max-w-sm space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-white">Synapse</h1>
          <p className="text-sm text-white/60">Đăng nhập bằng tài khoản Cortex, cũng là tài khoản Lexica của bạn. Tiến độ và cụm hay nhầm đi theo tài khoản.</p>
        </div>
        <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" aria-label="Email" className={input} />
        <input type="password" autoComplete={repeat === null ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu (ít nhất 6 ký tự)" aria-label="Mật khẩu" className={input} />
        {repeat !== null && (
          <>
            <p className="text-sm text-white/70">Chưa có tài khoản với email và mật khẩu này. Tạo mới thì nhập lại mật khẩu. Đã có tài khoản thì kiểm tra lại mật khẩu.</p>
            <input type="password" autoComplete="new-password" autoFocus value={repeat} onChange={(e) => setRepeat(e.target.value)} placeholder="Nhập lại mật khẩu" aria-label="Nhập lại mật khẩu" className={input} />
          </>
        )}
        <button type="submit" disabled={busy || !email.includes("@") || password.length < 6 || (repeat !== null && repeat.length < 6)} className="w-full h-12 rounded-xl bg-white text-black font-bold disabled:opacity-40">
          {busy ? "Đang vào..." : repeat === null ? "Tiếp tục" : "Tạo tài khoản"}
        </button>
        {error && <p className="text-sm text-red-400 text-center">{error}</p>}
        {notice && <p className="text-sm text-emerald-300 text-center">{notice}</p>}
      </form>
    </main>
  );
}
