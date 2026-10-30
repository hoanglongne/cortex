import Link from "next/link";

export default function NotFound() {
  return (
    <main className="notebook flex min-h-screen flex-col items-center justify-center px-5 text-center font-body text-ink">
      <p className="font-hand text-3xl text-pen">ơ, trang này không có</p>
      <h1 className="mt-2 font-serif text-5xl font-semibold">404</h1>
      <Link href="/" className="mt-6 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper hover:bg-moss-strong">
        Về trang chủ
      </Link>
    </main>
  );
}
