import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '../components/LegalPage';

export const metadata: Metadata = { title: 'Điều khoản sử dụng · Lexica' };

export default function TermsPage() {
    return (
        <LegalPage
            title="Điều khoản sử dụng"
            updated="10/2026"
            intro={<p>Dùng Lexica nghĩa là bạn đồng ý với các điều dưới đây. Lexica đang trong giai đoạn thử nghiệm, nên điều khoản có thể thay đổi.</p>}
            sections={[
                {
                    title: 'Lexica là gì',
                    body: <p>Lexica là app học từ vựng tiếng Anh, thuộc hệ sinh thái Cortex. Bạn dùng được không cần tài khoản; đăng nhập để sao lưu, vào lớp, dùng Album và Buddy.</p>,
                },
                {
                    title: 'Bản thử nghiệm',
                    body: (
                        <ul>
                            <li>App đang được hoàn thiện: có thể có lỗi, tính năng có thể đổi hoặc bỏ.</li>
                            <li>Hiện tại app miễn phí. Nếu sau này có gói trả phí, bạn sẽ được báo trước, và những gì bạn đã học vẫn là của bạn.</li>
                            <li>Hãy đăng nhập để sao lưu, tránh mất tiến độ khi xoá dữ liệu trình duyệt.</li>
                        </ul>
                    ),
                },
                {
                    title: 'Tài khoản',
                    body: (
                        <ul>
                            <li>Bạn giữ mật khẩu của mình, và chịu trách nhiệm về những gì làm bằng tài khoản đó.</li>
                            <li>Mỗi người một tài khoản. Không dùng tài khoản của người khác.</li>
                        </ul>
                    ),
                },
                {
                    title: 'Dùng đúng mực',
                    body: (
                        <ul>
                            <li>Không gửi nội dung xúc phạm, quấy rối, vi phạm pháp luật (trong Buddy, tên hiển thị, góp ý).</li>
                            <li>Không tìm cách phá app, gian lận bảng xếp hạng, hay lấy dữ liệu của người khác.</li>
                            <li>Tài khoản vi phạm có thể bị khoá.</li>
                        </ul>
                    ),
                },
                {
                    title: 'Nội dung',
                    body: (
                        <ul>
                            <li>Thẻ từ, câu mẫu, bài đọc, giọng đọc và giao diện thuộc về Lexica / Cortex, chỉ dùng để học cá nhân.</li>
                            <li>Câu bạn tự viết là của bạn.</li>
                            <li>Điểm và nhận xét phát âm do máy chấm, để tham khảo; không thay cho đánh giá của giáo viên hay kỳ thi chính thức.</li>
                        </ul>
                    ),
                },
                {
                    title: 'Lớp học',
                    body: <p>Khi vào lớp, bạn đồng ý cho giáo viên của lớp đó xem số liệu học tập như mô tả trong <Link href="/privacy" className="underline">Chính sách riêng tư</Link>. Giáo viên và trung tâm chịu trách nhiệm về lớp họ mở.</p>,
                },
                {
                    title: 'Giới hạn trách nhiệm',
                    body: <p>Lexica được cung cấp &quot;như hiện có&quot;. Chúng tôi cố gắng giữ app chạy ổn và dữ liệu an toàn, nhưng không cam kết app luôn không lỗi, và không chịu trách nhiệm cho thiệt hại gián tiếp do việc dùng app.</p>,
                },
                {
                    title: 'Liên hệ',
                    body: <p>Mọi câu hỏi, khiếu nại, yêu cầu xoá dữ liệu: gửi qua <Link href="/feedback" className="underline">trang Góp ý</Link>.</p>,
                },
            ]}
        />
    );
}
