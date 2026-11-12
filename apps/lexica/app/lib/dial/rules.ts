/**
 * Núm vặn D0 rules (docs/LEXICA_WOW_PLAN.md §2.9): a first, hand-written set
 * for the trial. Each rule must only fire where the English word is right;
 * when unsure, leave the phrase out. To be reviewed by a person before use.
 */
import type { DialRule } from './match';

// Phrases that turn an adjective into a noun ("tính minh bạch" = transparency).
const NOUNISH = ['tính', 'sự', 'độ'];

export const DIAL_RULES_D0: DialRule[] = [
    // "bất khả thi" is infeasible, not feasible.
    { cardId: 'v004', en: 'feasible', vi: ['khả thi'], notBefore: [...NOUNISH, 'nghiên cứu', 'bất'] },
    { cardId: 'v005', en: 'inevitable', vi: ['không thể tránh khỏi', 'không tránh khỏi'] },
    { cardId: 'v137', en: 'sustainable', vi: ['bền vững'], notBefore: NOUNISH, notAfter: ['trong môi trường'] },
    { cardId: 'v138', en: 'transparent', vi: ['minh bạch'], notBefore: NOUNISH },
    { cardId: 'v140', en: 'unprecedented', vi: ['chưa từng có tiền lệ', 'chưa có tiền lệ', 'chưa từng có trong lịch sử'] },
    { cardId: 'v141', en: 'vulnerable', vi: ['dễ bị tổn thương'], notBefore: NOUNISH },
    { cardId: 'v078', en: 'significant', vi: ['đáng kể'] },
    { cardId: 'v100', en: 'comprehensive', vi: ['toàn diện'], notBefore: NOUNISH },
    { cardId: 'v099', en: 'chronic', vi: ['mãn tính', 'kinh niên'] },
    // "hiệu quả năng lượng" is energy efficiency.
    { cardId: 'v360', en: 'effective', vi: ['hiệu quả'], notBefore: [...NOUNISH, 'mang lại', 'đem lại', 'đạt'], notAfter: ['năng lượng', 'kinh tế', 'sử dụng', 'hoạt động', 'thương mại', 'tài chính', 'sản xuất', 'đầu tư'] },
    { cardId: 'v375', en: 'temporary', vi: ['tạm thời'] },
    { cardId: 'v376', en: 'urgent', vi: ['khẩn cấp'], notBefore: ['tình trạng', 'trường hợp', 'tình huống', 'cấp cứu', 'ứng cứu', 'cứu hộ', 'cứu nạn', 'sơ tán', 'tắt', 'lối thoát', 'cửa thoát'] },
    { cardId: 'v378', en: 'accurate', vi: ['chính xác'], notBefore: NOUNISH },
    { cardId: 'v388', en: 'necessary', vi: ['cần thiết'], notBefore: NOUNISH },
    // "cơ hội thành công", a football "cơ hội": a chance, not an opportunity.
    { cardId: 'v426', en: 'opportunity', vi: ['cơ hội'], notAfter: ['thành công', 'nguy hiểm', 'ghi bàn', 'sống', 'vượt qua', 'được', 'chiến thắng', 'thắng', 'trúng', 'đi tiếp', 'bị bỏ lỡ', 'đánh đầu', 'dứt điểm', 'sút', 'phản công'], notBefore: ['tạo ra', 'bỏ lỡ', 'phung phí', 'hàng loạt'] },
    { cardId: 'v355', en: 'quality', vi: ['chất lượng'] },
    // Bare "ảnh hưởng" is mostly "affect" (bị ảnh hưởng, gây ảnh hưởng); keep the noun only.
    { cardId: 'v420', en: 'influence', vi: ['tầm ảnh hưởng', 'sức ảnh hưởng'] },
    { cardId: 'v069', en: 'impact', vi: ['tác động'] },
    { cardId: 'v084', en: 'benefit', vi: ['lợi ích'] },
    { cardId: 'v316', en: 'procedure', vi: ['thủ tục'] },
    { cardId: 'v309', en: 'estimate', vi: ['ước tính'] },
    { cardId: 'v314', en: 'approach', vi: ['cách tiếp cận'] },
    // "triển khai quân/lực lượng" is "deploy".
    { cardId: 'v328', en: 'implement', vi: ['triển khai'], notAfter: ['quân', 'lực lượng', 'binh', 'hệ thống phòng không', 'tên lửa', 'vũ khí'] },
    // "duy trì ở mức" is "remain at".
    { cardId: 'v330', en: 'maintain', vi: ['duy trì'], notAfter: ['ở', 'đến', 'tới', 'trong'] },
    { cardId: 'v325', en: 'eliminate', vi: ['loại bỏ'], notBefore: ['bị'] },
    // Noun uses ("quản lý tài chính") are "finance".
    { cardId: 'v349', en: 'financial', vi: ['tài chính'], notBefore: ['quản lý', 'cử nhân', 'thạc sĩ', 'tình hình', 'ngành', 'về', 'bộ'] },
    { cardId: 'v346', en: 'decline', vi: ['suy giảm', 'sụt giảm'] },
    { cardId: 'v370', en: 'limit', vi: ['giới hạn'] },
    { cardId: 'v411', en: 'struggle', vi: ['vật lộn', 'chật vật'] },
    { cardId: 'v429', en: 'recognize', vi: ['nhận ra'] },
    { cardId: 'v407', en: 'mention', vi: ['đề cập'] },
    { cardId: 'v396', en: 'admit', vi: ['thừa nhận'] },
    { cardId: 'v398', en: 'complain', vi: ['phàn nàn', 'than phiền'] },
    { cardId: 'v365', en: 'encourage', vi: ['khuyến khích'], notBefore: ['học bổng'] },
    { cardId: 'v385', en: 'ignore', vi: ['phớt lờ', 'làm ngơ'] },
    { cardId: 'v318', en: 'reveal', vi: ['tiết lộ', 'hé lộ'] },
    { cardId: 'v063', en: 'cautious', vi: ['thận trọng'], notBefore: NOUNISH },
    { cardId: 'v061', en: 'anxious', vi: ['lo lắng'], notBefore: NOUNISH },
    { cardId: 'v086', en: 'diverse', vi: ['đa dạng'], notBefore: NOUNISH, notAfter: ['hoá', 'hóa', 'sinh học', 'nguồn', 'trải nghiệm', 'sản phẩm', 'hình thức', 'loại hình', 'thị trường', 'phương thức', 'danh mục', 'các'] },
    { cardId: 'v066', en: 'flexible', vi: ['linh hoạt'], notBefore: NOUNISH },
    // "gã khổng lồ" is "a giant".
    { cardId: 'v073', en: 'massive', vi: ['khổng lồ'], notBefore: ['gã', 'người', 'những'] },
    { cardId: 'v075', en: 'obvious', vi: ['hiển nhiên'], notBefore: NOUNISH },
    { cardId: 'v108', en: 'dynamic', vi: ['năng động'], notBefore: NOUNISH },
    // "khả năng chủ động" is self-reliance; "chủ động chất lượng" is "control quality".
    { cardId: 'v131', en: 'proactive', vi: ['chủ động'], notBefore: [...NOUNISH, 'khả năng', 'thế'], notAfter: ['về', 'chất lượng', 'nguồn'] },
    // "khách quan sát" is "khách | quan sát" (guests observe).
    { cardId: 'v125', en: 'objective', vi: ['khách quan'], notBefore: NOUNISH, notAfter: ['sát'] },
    // "không dám chủ quan", "chủ quan với" mean "complacent".
    { cardId: 'v136', en: 'subjective', vi: ['chủ quan'], notBefore: [...NOUNISH, 'dám', 'đừng', 'không', 'tâm lý'], notAfter: ['với', 'trước', 'mà'] },
    { cardId: 'v096', en: 'biased', vi: ['thiên vị'], notBefore: NOUNISH },
    { cardId: 'v431', en: 'trustworthy', vi: ['đáng tin cậy'], notBefore: NOUNISH },
    // "giảm nhẹ vai trò/tội" is "downplay / reduce a sentence".
    { cardId: 'v023', en: 'mitigate', vi: ['giảm nhẹ', 'giảm thiểu'], notAfter: ['vai trò', 'tội', 'hình phạt', 'án'] },
    { cardId: 'v022', en: 'exacerbate', vi: ['làm trầm trọng thêm', 'làm trầm trọng hơn'] },
    { cardId: 'v097', en: 'bureaucratic', vi: ['quan liêu'] },
    { cardId: 'v151', en: 'anomaly', vi: ['sự bất thường', 'điểm bất thường'] },
    { cardId: 'v180', en: 'exorbitant', vi: ['cắt cổ'] },
    { cardId: 'v227', en: 'precarious', vi: ['bấp bênh'] },
    { cardId: 'v332', en: 'optimistic', vi: ['lạc quan'], notBefore: NOUNISH },
    // Bare "tiêu cực" is often a noun for misconduct ("phòng chống tiêu cực"): only after a noun it describes.
    { cardId: 'v354', en: 'negative', vi: ['tiêu cực'], onlyAfter: ['tác động', 'yếu tố', 'ảnh hưởng', 'nội dung', 'cảm xúc', 'suy nghĩ', 'thông tin', 'tác dụng', 'mặt', 'hành vi', 'tâm lý', 'tư duy', 'tín hiệu', 'xu hướng', 'thái độ', 'tăng trưởng', 'đánh giá', 'phản ứng', 'kết quả', 'bình luận', 'trải nghiệm'] },
    // Bare "bất ngờ" is mostly "suddenly" or "a surprise".
    { cardId: 'v339', en: 'unexpected', vi: ['ngoài dự kiến', 'không ngờ tới', 'ngoài dự đoán'] },
    { cardId: 'v380', en: 'convenient', vi: ['thuận tiện', 'tiện lợi'], notBefore: NOUNISH },
    { cardId: 'v319', en: 'challenging', vi: ['đầy thách thức'] },
    { cardId: 'v305', en: 'consistent', vi: ['nhất quán'], notBefore: NOUNISH },
    // "Điển hình, ..." is "for example": only after a noun it describes.
    { cardId: 'v310', en: 'typical', vi: ['điển hình'], onlyAfter: ['trường hợp', 'ví dụ', 'mô hình', 'đặc điểm', 'hình ảnh', 'biểu hiện', 'triệu chứng', 'dấu hiệu', 'đại diện', 'gương'] },
    { cardId: 'v413', en: 'unique', vi: ['độc đáo', 'độc nhất'], notBefore: NOUNISH },
    { cardId: 'v353', en: 'motivate', vi: ['tạo động lực'] },
    // "hợp tác" is mostly "cooperate/cooperation" (diplomacy, investigations).
    { cardId: 'v303', en: 'collaborate', vi: ['cộng tác'], notBefore: ['cộng tác viên'] },
    { cardId: 'v364', en: 'determined', vi: ['quyết tâm'] },
    { cardId: 'v372', en: 'patient', vi: ['kiên nhẫn'], notBefore: NOUNISH },
    { cardId: 'v384', en: 'honest', vi: ['trung thực'], notBefore: NOUNISH },
    { cardId: 'v383', en: 'grateful', vi: ['biết ơn'], notBefore: NOUNISH },
    { cardId: 'v350', en: 'generous', vi: ['hào phóng'], notBefore: NOUNISH },
    { cardId: 'v430', en: 'sensitive', vi: ['nhạy cảm'], notBefore: NOUNISH },
    { cardId: 'v374', en: 'stubborn', vi: ['bướng bỉnh'] },
    // "do/bị nghi ngờ" is "on suspicion of".
    { cardId: 'v399', en: 'doubt', vi: ['nghi ngờ'], notBefore: ['do', 'bị', 'vì', 'đối tượng'] },
    { cardId: 'v402', en: 'gather', vi: ['thu thập'] },
    { cardId: 'v343', en: 'abandon', vi: ['từ bỏ', 'bỏ rơi'], notAfter: ['cuộc sống', 'cuộc đời'] },
    { cardId: 'v327', en: 'hinder', vi: ['cản trở'] },
];
