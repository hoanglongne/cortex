import Link from 'next/link';
import { TEACH_URL } from '../lib/cortexConfig';

/** Old links to the teacher pages: they live in the teacher app now (apps/teach). */
export default function TeachMoved() {
    return (
        <div className="min-h-screen bg-bg px-4 py-16">
            <div className="max-w-md mx-auto rounded-2xl border border-line bg-surface p-6 text-center space-y-3">
                <p className="text-lg font-semibold text-ink">Trang giáo viên đã chuyển nhà</p>
                <p className="text-sm text-muted">Lớp học, giao bài và báo cáo giờ ở ứng dụng dành riêng cho giáo viên và trung tâm. Bạn vào bằng lời mời từ trung tâm hoặc từ Lexica.</p>
                {TEACH_URL && (
                    <a href={TEACH_URL} className="inline-flex h-11 items-center px-5 rounded-xl bg-accent text-on-accent font-bold">
                        Mở trang giáo viên
                    </a>
                )}
                <p>
                    <Link href="/" className="text-sm text-muted hover:text-accent">
                        ← Về Lexica
                    </Link>
                </p>
            </div>
        </div>
    );
}
