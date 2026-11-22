'use client';

import Link from 'next/link';
import AuthGate from '../components/AuthGate';
import DeleteAccount from '../components/DeleteAccount';
import { useAuth } from '../context/AuthContext';

/** A public address for "delete my account" (the stores ask for one); the button is the same as in Cài đặt. */
export default function DeleteAccountPage() {
    const { user, loading } = useAuth();
    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            <div className="mx-auto max-w-2xl">
                <Link href="/settings" className="text-sm text-muted underline">← Cài đặt</Link>
                <h1 className="mt-4 text-2xl font-extrabold text-ink">Xóa tài khoản Lexica</h1>
                <p className="mb-6 mt-2 text-sm text-muted">
                    Đăng nhập bằng tài khoản muốn xóa, rồi dùng nút bên dưới. Việc xóa có hiệu lực ngay. Nếu không đăng nhập được, gửi yêu cầu ở <Link href="/feedback" className="underline">trang Góp ý</Link>, nhóm xử lý trong 30 ngày.
                </p>
                {!loading && !user && <AuthGate reason="Đăng nhập để xóa tài khoản." redirectPath="/xoa-tai-khoan" />}
                <DeleteAccount />
            </div>
        </div>
    );
}
