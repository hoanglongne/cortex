import type { VocabCardData } from '../types/vocab';

/**
 * The first Giao tiếp deck (docs/LEXICA_DIRECTION.md): everyday phrases in a
 * code-switched Vietnamese sentence, each with a situation to say it in.
 * Studio publishes more as the `talk` pack. Ids start with "g".
 */
type TalkCard = Omit<VocabCardData, 'state'> & { branch: 'talk'; situation: { prompt: string; model: string } };

const card = (
    id: string,
    word: string,
    level: VocabCardData['level'],
    elo: number,
    translationHint: string,
    scenario: string,
    prompt: string,
    model: string,
): TalkCard => ({ id, word, level, elo, translationHint, scenario, branch: 'talk', situation: { prompt, model } });

export const TALK_CARDS: TalkCard[] = [
    // ── Cơ bản ────────────────────────────────────────────────────────────
    card('g001', 'on my way', 'beginner', 805, 'Đang trên đường tới', 'Đừng nhắn on my way khi còn đang tắm nha, cả nhóm đứng chờ ngoài quán rồi.', 'Bạn đang tới chỗ hẹn, nhắn cho bạn bè.', "I'm on my way, see you in ten minutes."),
    card('g002', 'running late', 'beginner', 815, 'Bị trễ giờ', 'Sáng nay kẹt xe quá, em running late chừng mười lăm phút, mọi người cứ họp trước nha.', 'Bạn kẹt xe, nhắn cho sếp là sẽ đến trễ.', "Sorry, I'm running late. I'll be there in fifteen minutes."),
    card('g003', 'no worries', 'beginner', 810, 'Không sao đâu', 'Khách xin lỗi vì làm đổ nước, chị phục vụ cười bảo no worries rồi lau bàn ngay.', 'Đồng nghiệp xin lỗi vì gửi file trễ, bạn trấn an họ.', 'No worries, just send it when you can.'),
    card('g004', 'take your time', 'beginner', 820, 'Cứ từ từ', 'Bạn cứ take your time chọn món đi, hôm nay mình không vội đâu.', 'Người bạn chọn quà lâu quá, bạn bảo họ cứ từ từ.', "Take your time, there's no rush."),
    card('g005', 'check in', 'beginner', 830, 'Làm thủ tục nhận phòng, lên máy bay', 'Tới sân bay sớm hai tiếng để check in cho thong thả, đừng để sát giờ.', 'Bạn tới khách sạn và muốn nhận phòng.', "Hi, I'd like to check in, please. I have a reservation."),
    card('g006', 'sold out', 'beginner', 835, 'Hết hàng, bán hết', 'Mới mở bán được nửa tiếng mà vé concert đã sold out, tiếc ghê.', 'Bạn hỏi nhân viên xem mẫu áo này còn hàng không.', 'Is this one sold out, or do you have it in a medium?'),
    card('g007', 'pick up', 'beginner', 840, 'Đón (ai đó)', 'Chiều nay anh pick up con ở trường giúp em nhé, em họp tới sáu giờ.', 'Nhờ bạn đón em gái mình ở sân bay.', 'Could you pick up my sister at the airport at six?'),
    card('g008', 'catch up', 'beginner', 850, 'Gặp lại hàn huyên', 'Lâu rồi không gặp, cuối tuần đi cà phê catch up chút đi.', 'Rủ một người bạn cũ đi cà phê nói chuyện.', "Let's grab a coffee and catch up this weekend."),
    card('g009', 'hang out', 'beginner', 845, 'Đi chơi, tụ tập', 'Tối thứ Sáu tụi mình hay hang out ở quán nướng gần trường.', 'Rủ đồng nghiệp đi chơi tối nay.', 'Do you want to hang out after work tonight?'),
    card('g010', 'make sense', 'beginner', 860, 'Hợp lý, hiểu được', 'Giải thích vậy thì make sense rồi, ban đầu em cứ tưởng lỗi do máy.', 'Sếp giải thích kế hoạch, bạn nói là đã hiểu.', "Thanks, now the plan starts to make sense."),
    card('g011', 'figure out', 'beginner', 870, 'Tìm ra, nghĩ ra cách', 'Mất cả buổi tối mới figure out được vì sao wifi ở nhà cứ rớt.', 'Bạn chưa biết cách giải quyết, hứa sẽ tìm ra.', "I'll figure out a way and get back to you."),
    card('g012', 'give it a try', 'beginner', 865, 'Thử xem', 'Món này nhìn lạ nhưng cứ give it a try đi, ngon hơn bạn nghĩ đó.', 'Bạn của bạn ngại thử món mới, bạn khuyến khích.', 'It looks strange, but give it a try.'),
    card('g013', 'get used to', 'beginner', 880, 'Quen với', 'Mới chuyển sang ca đêm nên em chưa get used to việc ngủ ban ngày.', 'Kể với bạn là bạn cần thời gian để quen công việc mới.', 'I need some time to get used to my new job.'),
    card('g014', 'look forward to', 'beginner', 890, 'Mong chờ', 'Cả phòng đang look forward to chuyến đi Đà Lạt tháng sau.', 'Trả lời email mời họp, nói bạn mong được gặp họ.', 'I look forward to meeting you next week.'),
    card('g015', 'on sale', 'beginner', 825, 'Đang giảm giá', 'Đôi giày đó đang on sale ba mươi phần trăm, mua liền đi.', 'Hỏi nhân viên xem chiếc áo khoác này có giảm giá không.', 'Is this jacket on sale this week?'),
    card('g016', 'to go', 'beginner', 800, 'Mang đi (đồ ăn, nước)', 'Cho em một ly bạc xỉu to go, em đang trễ giờ làm.', 'Gọi một ly cà phê mang đi.', 'Can I get an iced latte to go, please?'),

    // ── Trung cấp ─────────────────────────────────────────────────────────
    card('g017', 'follow up', 'intermediate', 960, 'Theo sát, nhắc lại sau', 'Họp xong nhớ follow up với khách bằng email, kẻo họ quên những gì đã chốt.', 'Viết email nhắc khách về báo giá bạn gửi tuần trước.', "I'm just writing to follow up on the quote I sent last week."),
    card('g018', 'touch base', 'intermediate', 990, 'Liên lạc nhanh, cập nhật', 'Đầu tuần mình touch base năm phút để xem dự án tới đâu rồi nha.', 'Đề nghị gọi nhanh với đồng nghiệp sáng mai.', 'Can we touch base tomorrow morning?'),
    card('g019', 'heads up', 'intermediate', 980, 'Báo trước', 'Cảm ơn anh đã cho em cái heads up về lịch họp đổi sang chiều, suýt nữa em đi nhầm giờ.', 'Báo trước cho cả nhóm là bạn sẽ nghỉ thứ Sáu.', "Just a heads up, I'll be off on Friday."),
    card('g020', 'on the same page', 'intermediate', 1010, 'Cùng hiểu một ý', 'Trước khi làm, cả nhóm họp nhanh cho on the same page về hạn chót.', 'Đề nghị cả nhóm thống nhất trước khi bắt đầu.', "Let's make sure we're on the same page before we start."),
    card('g021', 'get back to', 'intermediate', 970, 'Trả lời lại sau', 'Em chưa có số liệu, để em get back to anh trước năm giờ chiều nay nhé.', 'Khách hỏi một câu bạn chưa trả lời được ngay.', 'Good question. Let me get back to you by Friday.'),
    card('g022', 'out of office', 'intermediate', 1000, 'Vắng mặt, không ở văn phòng', 'Chị ấy out of office cả tuần nên thư gửi giờ chắc thứ Hai mới đọc.', 'Báo cho khách là tuần sau bạn vắng mặt.', "I'll be out of office next week, so please contact my colleague."),
    card('g023', 'work from home', 'intermediate', 955, 'Làm việc ở nhà', 'Mưa ngập thế này, sếp cho cả phòng work from home hôm nay.', 'Xin sếp cho làm ở nhà ngày mai.', 'Would it be okay if I work from home tomorrow?'),
    card('g024', 'deal with', 'intermediate', 965, 'Xử lý, đối phó với', 'Tháng cuối năm phải deal with cả đống hoá đơn nên phòng kế toán về muộn.', 'Nói với đồng nghiệp là bạn sẽ xử lý khiếu nại này.', "Don't worry, I'll deal with this complaint."),
    card('g025', 'come up with', 'intermediate', 1020, 'Nghĩ ra', 'Cả nhóm bàn cả buổi mới come up with được cái tên cho quán.', 'Bạn cần thêm thời gian để nghĩ ra ý tưởng tốt hơn.', 'Give me a day to come up with a better idea.'),
    card('g026', 'keep in mind', 'intermediate', 1030, 'Lưu ý, nhớ rằng', 'Đặt vé thì keep in mind là hành lý xách tay chỉ được bảy ký thôi.', 'Nhắc khách hàng về hạn chót của chương trình khuyến mãi.', 'Please keep in mind that the offer ends on Sunday.'),
    card('g027', 'fill out', 'intermediate', 975, 'Điền (đơn, tờ khai)', 'Trước khi khám bệnh phải fill out tờ khai ở quầy lễ tân.', 'Hỏi lễ tân xem bạn có cần điền tờ khai không.', 'Do I need to fill out this form before the appointment?'),
    card('g028', 'run out of', 'intermediate', 995, 'Hết, cạn', 'Đang nấu dở thì run out of gas, cả nhà phải gọi đồ ăn ngoài.', 'Báo cho quản lý là văn phòng sắp hết giấy in.', "We're about to run out of paper for the printer."),
    card('g029', 'show up', 'intermediate', 985, 'Xuất hiện, có mặt', 'Hẹn bảy giờ mà gần tám giờ anh ấy mới show up, còn không nhắn trước.', 'Hỏi bạn bè xem tối nay mấy giờ họ tới.', 'What time are you going to show up tonight?'),
    card('g030', 'sort out', 'intermediate', 1040, 'Giải quyết ổn thoả', 'Lỗi chuyển khoản này để em gọi ngân hàng sort out trong sáng nay.', 'Hứa với khách là bạn sẽ giải quyết chuyện giao hàng chậm.', "We'll sort out the delivery problem today."),
    card('g031', 'turn down', 'intermediate', 1050, 'Từ chối', 'Lương ổn nhưng phải chuyển ra Hà Nội nên em đành turn down lời mời.', 'Lịch sự từ chối lời mời đi ăn tối nay.', 'Thanks, but I have to turn down the invitation tonight.'),
    card('g032', 'point out', 'intermediate', 1060, 'Chỉ ra', 'Cảm ơn chị đã point out lỗi chính tả trong bản trình bày trước khi gửi khách.', 'Lịch sự chỉ ra một lỗi nhỏ trong báo cáo của đồng nghiệp.', 'I just want to point out a small mistake on page two.'),

    // ── Nâng cao ──────────────────────────────────────────────────────────
    card('g033', 'bring up', 'advanced', 1160, 'Nêu ra (một vấn đề)', 'Đừng bring up chuyện tăng lương ngay đầu buổi họp, đợi lúc sếp vui đã.', 'Nói rằng bạn muốn nêu thêm một vấn đề trong cuộc họp.', "I'd like to bring up one more issue before we finish."),
    card('g034', 'push back', 'advanced', 1170, 'Lùi lịch; phản đối', 'Khách xin push back hạn chót thêm một tuần vì chưa duyệt xong thiết kế.', 'Đề nghị dời cuộc họp sang thứ Hai tuần sau.', 'Can we push back the meeting to next Monday?'),
    card('g035', 'cut corners', 'advanced', 1200, 'Làm ẩu cho nhanh, cho rẻ', 'Xây nhà mà cut corners ở phần móng thì vài năm là nứt hết.', 'Nói với cả nhóm là gấp mấy cũng không được làm ẩu.', "We're in a hurry, but we can't cut corners on safety."),
    card('g036', 'on short notice', 'advanced', 1190, 'Báo gấp, sát giờ', 'Xin lỗi vì báo on short notice, nhưng chiều nay em phải nghỉ để đưa mẹ đi khám.', 'Xin lỗi vì nhờ đồng nghiệp làm thay vào phút chót.', 'Sorry to ask on short notice, but could you cover for me today?'),
    card('g037', 'wrap up', 'advanced', 1150, 'Kết thúc, chốt lại', 'Còn mười phút nữa là hết giờ, mình wrap up cuộc họp ở đây nhé.', 'Đề nghị kết thúc cuộc họp, mai bàn tiếp.', "Let's wrap up the meeting here and continue tomorrow."),
    card('g038', 'fall through', 'advanced', 1210, 'Đổ bể, không thành', 'Kế hoạch đi Phú Quốc có thể fall through vì cả nhóm không ai xin nghỉ được.', 'Kể với bạn là thoả thuận với khách có thể không thành.', "I'm afraid the deal might fall through."),
    card('g039', 'think outside the box', 'advanced', 1230, 'Nghĩ khác đi, sáng tạo', 'Ngân sách quảng cáo ít thì phải think outside the box, quay video bằng điện thoại cũng được.', 'Khuyến khích cả nhóm nghĩ cách mới cho chiến dịch.', 'We need to think outside the box for this campaign.'),
    card('g040', 'get the hang of', 'advanced', 1180, 'Bắt đầu quen tay', 'Mới đầu dùng phần mềm kế toán thấy rối, làm một tuần là get the hang of liền.', 'Nói với sếp là bạn đã bắt đầu quen việc.', "It was hard at first, but I'm starting to get the hang of it."),
];
