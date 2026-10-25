import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '../components/LegalPage';

export const metadata: Metadata = { title: 'Chính sách riêng tư · Lexica' };

export default function PrivacyPage() {
    return (
        <LegalPage
            title="Chính sách riêng tư"
            updated="10/2026"
            intro={<p>Lexica giữ ít dữ liệu nhất có thể. Phần lớn việc học của bạn nằm ngay trên máy bạn. Trang này nói rõ app lưu gì, gửi gì đi đâu, và bạn làm gì được với dữ liệu của mình.</p>}
            sections={[
                {
                    title: 'Dữ liệu nằm trên máy bạn',
                    body: (
                        <ul>
                            <li>Tiến độ học (từ đã học, lịch ôn, chuỗi ngày, câu bạn viết, nơi bạn bắt gặp từ) lưu trong trình duyệt của bạn.</li>
                            <li>Chấm phát âm bằng gói chấm tải về chạy ngay trên máy, giọng bạn không rời máy.</li>
                            <li>Xoá dữ liệu trình duyệt là xoá phần này, trừ khi bạn đã đăng nhập và sao lưu.</li>
                        </ul>
                    ),
                },
                {
                    title: 'Khi bạn đăng nhập',
                    body: (
                        <ul>
                            <li>Email (và mật khẩu đã mã hoá) để đăng nhập.</li>
                            <li>Bản sao lưu tiến độ học, để bạn học tiếp trên máy khác.</li>
                            <li>Dữ liệu Album, Buddy, thử thách nếu bạn dùng các phần đó.</li>
                            <li>Lưu trên Supabase (máy chủ đặt tại khu vực châu Á – Thái Bình Dương hoặc nơi khác do nhà cung cấp quản lý), có mã hoá khi truyền.</li>
                        </ul>
                    ),
                },
                {
                    title: 'Giọng nói khi luyện nói',
                    body: (
                        <>
                            <p>Để biết bạn nói gì, app dùng một trong các cách sau, tuỳ máy:</p>
                            <ul>
                                <li><b>Nhận dạng của trình duyệt</b> (Chrome, Safari…): trình duyệt có thể gửi đoạn âm thanh tới máy chủ của hãng (Google, Apple) theo chính sách của họ.</li>
                                <li><b>Máy chủ Cortex</b>: đoạn ghi âm được gửi tới dịch vụ nhận dạng giọng nói (ví dụ Google Gemini) để chuyển thành chữ, rồi bỏ đi. Lexica không lưu bản ghi âm.</li>
                            </ul>
                            <p>Bản ghi &quot;Giọng bạn&quot; để nghe lại chỉ nằm trong bộ nhớ của trang, mất khi đóng trang.</p>
                        </>
                    ),
                },
                {
                    title: 'Lớp học',
                    body: (
                        <ul>
                            <li>Khi bạn vào lớp bằng mã của giáo viên, giáo viên thấy <b>con số</b>: số từ đã học, đã nhớ, số lần luyện, nhóm âm hay sai.</li>
                            <li>Giáo viên <b>không</b> thấy câu bạn viết, giọng bạn, hay nội dung bạn tạo ra.</li>
                            <li>Rời lớp bất cứ lúc nào trong trang Lớp học.</li>
                        </ul>
                    ),
                },
                {
                    title: 'Đo cách dùng app',
                    body: (
                        <ul>
                            <li>App gửi sự kiện ẩn danh (ví dụ &quot;xong phiên học&quot;, &quot;đã luyện nói&quot;) tới PostHog để biết phần nào hữu ích, phần nào khó dùng.</li>
                            <li>Sự kiện gắn với một mã ngẫu nhiên của trình duyệt; nếu bạn đăng nhập thì kèm mã tài khoản. Không gửi câu bạn viết hay giọng bạn.</li>
                        </ul>
                    ),
                },
                {
                    title: 'Góp ý bạn gửi',
                    body: <p>Nội dung góp ý, liên hệ bạn để lại (nếu có), trang bạn đang ở và loại máy, trình duyệt. Chỉ nhóm làm Lexica đọc, để sửa lỗi và trả lời bạn.</p>,
                },
                {
                    title: 'Chúng tôi không làm',
                    body: (
                        <ul>
                            <li>Không bán dữ liệu của bạn.</li>
                            <li>Không chạy quảng cáo, không chia sẻ dữ liệu cho bên quảng cáo.</li>
                            <li>Không dùng giọng nói của bạn để huấn luyện mô hình nếu bạn chưa đồng ý riêng (ví dụ qua trang ghi âm kiểm định).</li>
                        </ul>
                    ),
                },
                {
                    title: 'Quyền của bạn',
                    body: (
                        <>
                            <p>Theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, bạn có quyền xem, sửa, xoá dữ liệu và rút lại đồng ý.</p>
                            <ul>
                                <li>Xoá dữ liệu trên máy: nút xoá tiến trình trong Cài đặt, hoặc xoá dữ liệu trang trong trình duyệt.</li>
                                <li>Xoá tài khoản và dữ liệu trên máy chủ: gửi yêu cầu qua <Link href="/feedback" className="underline">trang Góp ý</Link>, nhóm xử lý trong 30 ngày.</li>
                            </ul>
                        </>
                    ),
                },
                {
                    title: 'Người dưới 16 tuổi',
                    body: <p>Nếu bạn dưới 16 tuổi, hãy có sự đồng ý của cha mẹ hoặc người giám hộ trước khi tạo tài khoản. Học không cần tài khoản vẫn được.</p>,
                },
                {
                    title: 'Thay đổi',
                    body: <p>Khi chính sách đổi, ngày cập nhật ở đầu trang sẽ đổi theo. Thay đổi lớn sẽ được báo trong app.</p>,
                },
            ]}
        />
    );
}
