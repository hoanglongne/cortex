import { VocabCardData } from '../types/vocab';

/**
 * LEXICA Vocabulary Database
 * IELTS-level vocabulary cards with ELO ratings (800-1500)
 * Câu tiếng Việt với từ tiếng Anh được nhúng vào tự nhiên
 * 
 * Difficulty Levels:
 * - Beginner: ELO 800-950 (10 cards)
 * - Intermediate: ELO 900-1200 (25 cards with overlap)
 * - Advanced: ELO 1100-1400 (30 cards with overlap)
 * - Expert: ELO 1300+ (30 cards)
 */
export const VOCAB_DATABASE: Omit<VocabCardData, 'state'>[] = [
  // ELO 800-900: Easier words (BEGINNER)
  {
    "id": "v001",
    "word": "ABUNDANT",
    "ipa": "əˈbʌndənt",
    "elo": 850,
    "level": "beginner",
    "scenario": "Về quê ba ngày, mẹ gói đồ ăn ABUNDANT đỉnh nóc kịch trần, cả dãy trọ ăn ké, chủ trọ cũng ghé xin một hộp.",
    "translationHint": "Dư thừa, nhiều hơn cần thiết",
    "upgradeModule": {
      "simpleSentence": "There is a very big amount of food in the fridge.",
      "targetSlot": "very big amount",
      "academicOptions": [
        { "text": "abundant supply", "nuance": "Nhấn mạnh sự dư dả, đầy đủ vượt mức cần thiết.", "formalityScore": 9 },
        { "text": "excessive quantity", "nuance": "Nhấn mạnh số lượng quá nhiều, đôi khi mang nghĩa tiêu cực.", "formalityScore": 8 },
        { "text": "surplus", "nuance": "Dùng trong ngữ cảnh kinh tế hoặc khi nói về phần dư thừa.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ab-", "meaning": "rời đi/từ đâu đó", "relatedWords": [{ "word": "abnormal", "meaning": "bất thường" }, { "word": "absent", "meaning": "vắng mặt" }, { "word": "abstract", "meaning": "trừu tượng" }] },
      "root": { "text": "und-", "meaning": "sóng (trào dâng như sóng)", "relatedWords": [{ "word": "undulate", "meaning": "gợn sóng" }, { "word": "redundant", "meaning": "dư thừa" }, { "word": "inundate", "meaning": "tràn ngập" }] },
      "suffix": { "text": "-ant", "meaning": "hậu tố tạo tính từ", "relatedWords": [{ "word": "brilliant", "meaning": "rực rỡ" }, { "word": "distant", "meaning": "xa xôi" }, { "word": "elegant", "meaning": "thanh lịch" }] }
    }
  },
  {
    "id": "v002",
    "word": "COGNITIVE",
    "ipa": "ˈkɒɡnətɪv",
    "elo": 870,
    "level": "beginner",
    "scenario": "Ôn thi xuyên đêm tới 4 giờ sáng, khả năng COGNITIVE còn đủ đọc tên môn, đề hỏi gì thì toang.",
    "translationHint": "Liên quan đến nhận thức, tri giác",
    "upgradeModule": {
      "simpleSentence": "The patient's thinking ability is being tested.",
      "targetSlot": "thinking ability",
      "academicOptions": [
        { "text": "cognitive function", "nuance": "Thuật ngữ chuyên môn để chỉ các hoạt động tư duy, nhận thức của não bộ.", "formalityScore": 9 },
        { "text": "mental capacity", "nuance": "Chỉ khả năng tinh thần nói chung, thường dùng trong pháp lý hoặc y khoa.", "formalityScore": 8 },
        { "text": "intellectual power", "nuance": "Nhấn mạnh vào sức mạnh trí tuệ, ít mang tính y học hơn.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "co-", "meaning": "cùng nhau", "relatedWords": [{ "word": "cooperate", "meaning": "hợp tác" }, { "word": "coexist", "meaning": "cùng tồn tại" }, { "word": "cohesion", "meaning": "sự gắn kết" }] },
      "root": { "text": "gnosc-", "meaning": "biết/hiểu", "relatedWords": [{ "word": "recognize", "meaning": "công nhận" }, { "word": "ignore", "meaning": "phớt lờ" }, { "word": "agnostic", "meaning": "thuyết bất khả tri" }] },
      "suffix": { "text": "-itive", "meaning": "hậu tố liên quan đến...", "relatedWords": [{ "word": "positive", "meaning": "tích cực" }, { "word": "sensitive", "meaning": "nhạy cảm" }, { "word": "primitive", "meaning": "nguyên thủy" }] }
    }
  },
  {
    "id": "v003",
    "word": "DILEMMA",
    "ipa": "dɪˈlemə",
    "elo": 820,
    "level": "beginner",
    "scenario": "DILEMMA cuối tháng: còn 50 nghìn, mua cơm cho no hay mua trà sữa cho đỡ chằm zn vì nghèo.",
    "translationHint": "Tình huống khó xử, lưỡng nan",
    "surgeryModule": {
      "prefix": { "text": "di-", "meaning": "hai/gấp đôi", "relatedWords": [{ "word": "diverge", "meaning": "phân tách" }, { "word": "dimorphism", "meaning": "lưỡng hình" }, { "word": "dioxide", "meaning": "đioxit" }] },
      "root": { "text": "lemma", "meaning": "giả thuyết/đề mục", "relatedWords": [{ "word": "lemma", "meaning": "bổ đề" }, { "word": "dilemmatic", "meaning": "tiến thoái lưỡng nan" }] }
    }
  },
  {
    "id": "v004",
    "word": "FEASIBLE",
    "ipa": "ˈfiːzəbl",
    "elo": 880,
    "level": "beginner",
    "scenario": "Kế hoạch học xong ba chương trong một đêm nghe không FEASIBLE lắm, nhưng cả nhóm vẫn hô gét gô.",
    "translationHint": "Khả thi, có thể thực hiện được",
    "upgradeModule": {
      "simpleSentence": "This plan is possible to do.",
      "targetSlot": "possible to do",
      "academicOptions": [
        { "text": "highly feasible", "nuance": "Nhấn mạnh tính khả thi cao, đã được xem xét kỹ.", "formalityScore": 8 },
        { "text": "commercially viable", "nuance": "Dùng trong kinh doanh, ý nói có khả năng sinh lời.", "formalityScore": 9 },
        { "text": "practicable", "nuance": "Có thể đưa vào thực tế sử dụng được.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "fac/feas-", "meaning": "làm (to do/make)", "relatedWords": [{ "word": "factory", "meaning": "nhà máy" }, { "word": "facilitate", "meaning": "tạo điều kiện" }, { "word": "defeat", "meaning": "đánh bại" }] },
      "suffix": { "text": "-ible", "meaning": "có thể (can be)", "relatedWords": [{ "word": "visible", "meaning": "có thể thấy" }, { "word": "credible", "meaning": "đáng tin" }, { "word": "flexible", "meaning": "linh hoạt" }] }
    }
  },
  {
    "id": "v005",
    "word": "INEVITABLE",
    "ipa": "ɪnˈevɪtəbl",
    "elo": 890,
    "level": "beginner",
    "scenario": "Lướt app mua sắm lúc nửa đêm thì chốt đơn là INEVITABLE, sáng ra mới hỏi mua máy làm bánh để làm gì, u là trời.",
    "translationHint": "Không thể tránh khỏi",
    "upgradeModule": {
      "simpleSentence": "Changes will surely happen in the future.",
      "targetSlot": "surely happen",
      "academicOptions": [
        { "text": "inevitable", "nuance": "Một sự kiện chắc chắn sẽ xảy ra dù có cố ngăn cản.", "formalityScore": 9 },
        { "text": "unavoidable", "nuance": "Không thể tránh né được.", "formalityScore": 7 },
        { "text": "inescapable", "nuance": "Không thể trốn thoát khỏi thực tế đó.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "không (not)", "relatedWords": [{ "word": "incorrect", "meaning": "sai" }, { "word": "insane", "meaning": "điên rồ" }] },
      "root": { "text": "evit-", "meaning": "tránh (avoid)", "relatedWords": [{ "word": "evitable", "meaning": "có thể tránh" }, { "word": "eviternal", "meaning": "vĩnh cửu" }] },
      "suffix": { "text": "-able", "meaning": "có thể", "relatedWords": [{ "word": "available", "meaning": "có sẵn" }, { "word": "capable", "meaning": "có khả năng" }] }
    }
  },
  {
    "id": "v006",
    "word": "PRAGMATIC",
    "ipa": "præɡˈmætɪk",
    "elo": 920,
    "level": "beginner",
    "scenario": "Bạn mình PRAGMATIC lắm, đi date chọn quán có ổ cắm với wifi mạnh, tình chưa tới nhưng pin thì đầy, ra đường tôi nể mỗi bạn.",
    "translationHint": "Thực dụng, thực tế",
    "upgradeModule": {
      "simpleSentence": "We need a realistic way to solve this.",
      "targetSlot": "realistic way",
      "academicOptions": [
        { "text": "pragmatic approach", "nuance": "Cách tiếp cận dựa trên thực tế thay vì lý thuyết.", "formalityScore": 9 },
        { "text": "down-to-earth solution", "nuance": "Giải pháp thực tế, gần gũi.", "formalityScore": 6 },
        { "text": "functional strategy", "nuance": "Chiến lược thiên về tính năng và hiệu quả.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "pragma-", "meaning": "hành động/việc làm", "relatedWords": [{ "word": "practice", "meaning": "thực hành" }, { "word": "practitioner", "meaning": "người hành nghề" }] },
      "suffix": { "text": "-tic", "meaning": "thuộc về...", "relatedWords": [{ "word": "dramatic", "meaning": "kịch tính" }, { "word": "automatic", "meaning": "tự động" }] }
    }
  },
  {
    "id": "v007",
    "word": "AMBIGUOUS",
    "ipa": "æmˈbɪɡjuəs",
    "elo": 950,
    "level": "beginner",
    "scenario": "Crush thả tim story rồi seen tin nhắn ba ngày, AMBIGUOUS cỡ này thì delulu cũng phải nghỉ giữa hiệp.",
    "translationHint": "Mơ hồ, không rõ ràng",
    "upgradeModule": {
      "simpleSentence": "The wording in the contract is not clear.",
      "targetSlot": "not clear",
      "academicOptions": [
        { "text": "highly ambiguous", "nuance": "Rất mơ hồ, có thể hiểu theo nhiều nghĩa gây hiểu lầm.", "formalityScore": 9 },
        { "text": "vague", "nuance": "Mờ mịt, thiếu chi tiết cụ thể.", "formalityScore": 7 },
        { "text": "obscure", "nuance": "Tối nghĩa, khó hiểu, ít người biết.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ambi-", "meaning": "cả hai/xung quanh", "relatedWords": [{ "word": "ambidextrous", "meaning": "thuận cả hai tay" }, { "word": "ambivalent", "meaning": "mâu thuẫn" }] },
      "root": { "text": "ag-", "meaning": "làm/đi (to drive/do)", "relatedWords": [{ "word": "agent", "meaning": "đại lý" }, { "word": "agile", "meaning": "nhanh nhẹn" }] },
      "suffix": { "text": "-ous", "meaning": "đầy rẫy/tính chất", "relatedWords": [{ "word": "famous", "meaning": "nổi tiếng" }, { "word": "dangerous", "meaning": "nguy hiểm" }] }
    }
  },
  {
    "id": "v008",
    "word": "RESILIENT",
    "ipa": "rɪˈzɪliənt",
    "elo": 940,
    "level": "beginner",
    "scenario": "Nhỏ bạn RESILIENT thật, trưa bị từ chối tỏ tình, tối đã đăng story caption chữa lành kèm ly matcha.",
    "translationHint": "Kiên cường, phục hồi nhanh",
    "upgradeModule": {
      "simpleSentence": "The economy is strong enough to recover from the crisis.",
      "targetSlot": "strong enough to recover",
      "academicOptions": [
        { "text": "remarkably resilient", "nuance": "Khả năng phục hồi cực kỳ ấn tượng sau nghịch cảnh.", "formalityScore": 9 },
        { "text": "robust", "nuance": "Mạnh mẽ, vững chãi, khó bị phá vỡ.", "formalityScore": 8 },
        { "text": "durable", "nuance": "Bền bỉ theo thời gian.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "re-", "meaning": "lại một lần nữa/lùi lại", "relatedWords": [{ "word": "repeat", "meaning": "nhắc lại" }, { "word": "return", "meaning": "quay lại" }] },
      "root": { "text": "sal/sil-", "meaning": "nhảy (to jump)", "relatedWords": [{ "word": "assault", "meaning": "tấn công" }, { "word": "salient", "meaning": "nổi bật" }] },
      "suffix": { "text": "-ient", "meaning": "hậu tố tính từ (đang làm gì đó)", "relatedWords": [{ "word": "patient", "meaning": "kiên nhẫn" }, { "word": "efficient", "meaning": "hiệu quả" }] }
    }
  },
  {
    "id": "v009",
    "word": "TEDIOUS",
    "ipa": "ˈtiːdiəs",
    "elo": 910,
    "level": "beginner",
    "scenario": "Ngồi gõ điểm danh 200 người từ ảnh chụp vào Excel, việc TEDIOUS tới mức con mắt xin nghỉ phép, ét o ét.",
    "translationHint": "Buồn tẻ, nhàm chán",
    "upgradeModule": {
      "simpleSentence": "Filling in forms is a very boring task.",
      "targetSlot": "boring task",
      "academicOptions": [
        { "text": "tedious process", "nuance": "Quy trình dài dòng, lặp đi lặp lại gây mệt mỏi.", "formalityScore": 8 },
        { "text": "monotonous labor", "nuance": "Công việc đơn điệu, không có sự thay đổi.", "formalityScore": 9 },
        { "text": "repetitive work", "nuance": "Công việc mang tính lặp lại.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "taed-", "meaning": "mệt mỏi/chán ghét", "relatedWords": [{ "word": "taedium", "meaning": "sự chán nản" }] },
      "suffix": { "text": "-ous", "meaning": "có tính chất...", "relatedWords": [{ "word": "poisonous", "meaning": "có độc" }, { "word": "nervous", "meaning": "lo lắng" }] }
    }
  },
  {
    "id": "v010",
    "word": "SUBTLE",
    "ipa": "ˈsʌtl",
    "elo": 930,
    "level": "beginner",
    "scenario": "Mẹ khen 'dạo này con có da có thịt ha', lời nhắc SUBTLE rằng Tết này bớt đụng vô nồi bánh chưng, ok mom.",
    "translationHint": "Tinh tế, khó nhận ra",
    "upgradeModule": {
      "simpleSentence": "There is a small difference between the two colors.",
      "targetSlot": "small difference",
      "academicOptions": [
        { "text": "subtle distinction", "nuance": "Sự khác biệt cực nhỏ, cần để ý kỹ mới thấy.", "formalityScore": 9 },
        { "text": "nuance", "nuance": "Sắc thái khác biệt tinh tế.", "formalityScore": 8 },
        { "text": "marginal variation", "nuance": "Sự thay đổi không đáng kể ở lề.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "sub-", "meaning": "dưới/nhẹ", "relatedWords": [{ "word": "submarine", "meaning": "tàu ngầm" }, { "word": "subway", "meaning": "tàu điện ngầm" }] },
      "root": { "text": "tex-", "meaning": "dệt/mạng lưới (web/woven)", "relatedWords": [{ "word": "textile", "meaning": "dệt may" }, { "word": "context", "meaning": "ngữ cảnh" }] }
    }
  },
  {
    "id": "v011",
    "word": "METICULOUS",
    "ipa": "məˈtɪkjələs",
    "elo": 1050,
    "level": "intermediate",
    "scenario": "Nhỏ bàn trên METICULOUS tới mức note ôn thi có bốn màu bút với mục lục, keo lỳ thật, mình xin photo mà muốn lạy.",
    "translationHint": "Tỉ mỉ, cẩn thận",
    "upgradeModule": {
      "simpleSentence": "He is very careful with his work.",
      "targetSlot": "very careful",
      "academicOptions": [
        { "text": "meticulous attention to detail", "nuance": "Sự tỉ mỉ đến từng chi tiết nhỏ nhất.", "formalityScore": 9 },
        { "text": "thorough", "nuance": "Cẩn thận và thấu đáo.", "formalityScore": 7 },
        { "text": "scrupulous", "nuance": "Cực kỳ khắt khe và tận tâm để tránh sai sót.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "met-", "meaning": "sợ hãi (fear - nghĩa cổ: lo sợ làm sai)", "relatedWords": [{ "word": "meticulosity", "meaning": "tính tỉ mỉ" }] },
      "suffix": { "text": "-ous", "meaning": "tính chất", "relatedWords": [{ "word": "generous", "meaning": "hào phóng" }] }
    }
  },
  {
    "id": "v012",
    "word": "UBIQUITOUS",
    "ipa": "juːˈbɪkwɪtəs",
    "elo": 1080,
    "level": "intermediate",
    "scenario": "Bài nhạc trend đó giờ UBIQUITOUS thật, từ TikTok tới quán phở đầu hẻm đều bật, tối nằm mơ cũng nghe, u là trời.",
    "translationHint": "Phổ biến khắp nơi",
    "upgradeModule": {
      "simpleSentence": "Computers are everywhere nowadays.",
      "targetSlot": "everywhere",
      "academicOptions": [
        { "text": "ubiquitous", "nuance": "Có mặt ở khắp nơi cùng một lúc.", "formalityScore": 9 },
        { "text": "pervasive", "nuance": "Tỏa ra khắp nơi, lan tỏa sâu rộng.", "formalityScore": 8 },
        { "text": "commonplace", "nuance": "Tầm thường, đâu đâu cũng thấy.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "ubique-", "meaning": "khắp mọi nơi (everywhere)", "relatedWords": [{ "word": "ubiquity", "meaning": "sự phổ biến khắp nơi" }] }
    }
  },
  {
    "id": "v013",
    "word": "EPHEMERAL",
    "ipa": "ɪˈfemərəl",
    "elo": 1100,
    "level": "intermediate",
    "scenario": "Cảm giác được chữa lành sau chuyến Đà Lạt EPHEMERAL thật, sáng thứ Hai mở mail ra là bay sạch.",
    "translationHint": "Phù du, ngắn ngủi",
    "upgradeModule": {
      "simpleSentence": "Fame is short-lived.",
      "targetSlot": "short-lived",
      "academicOptions": [
        { "text": "ephemeral nature", "nuance": "Bản chất tạm thời, mau chóng lụi tàn.", "formalityScore": 9 },
        { "text": "transient", "nuance": "Thoáng qua, chỉ tồn tại trong thời gian ngắn.", "formalityScore": 8 },
        { "text": "fleeting moment", "nuance": "Khoảnh khắc lướt qua rất nhanh.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "epi-", "meaning": "trên/trong vòng (upon)", "relatedWords": [{ "word": "epidemic", "meaning": "dịch bệnh" }, { "word": "episode", "meaning": "tập phim" }] },
      "root": { "text": "hemer-", "meaning": "ngày (day)", "relatedWords": [{ "word": "hemerocallis", "meaning": "hoa hiên (chỉ nở một ngày)" }] }
    }
  },
  {
    "id": "v014",
    "word": "ELOQUENT",
    "ipa": "ˈeləkwənt",
    "elo": 1020,
    "level": "intermediate",
    "scenario": "Bình thường nói chuyện ấp úng, mà tới lúc xin mẹ tiền mua laptop là ELOQUENT như diễn giả, out trình cả thầy dạy thuyết trình.",
    "translationHint": "Hùng biện, lưu loát",
    "upgradeModule": {
      "simpleSentence": "She gave a very good speech.",
      "targetSlot": "very good speech",
      "academicOptions": [
        { "text": "eloquent oration", "nuance": "Bài diễn văn hùng hồn và có sức thuyết phục cao.", "formalityScore": 9 },
        { "text": "articulate", "nuance": "Diễn đạt ý tưởng một cách rõ ràng và mạch lạc.", "formalityScore": 8 },
        { "text": "persuasive", "nuance": "Mang tính thuyết phục.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "e-", "meaning": "ra ngoài (out)", "relatedWords": [{ "word": "exit", "meaning": "lối ra" }, { "word": "eject", "meaning": "đẩy ra" }] },
      "root": { "text": "loqu-", "meaning": "nói (speak)", "relatedWords": [{ "word": "loquacious", "meaning": "nói nhiều" }, { "word": "colloquial", "meaning": "thông tục" }] }
    }
  },
  {
    "id": "v015",
    "word": "PLAUSIBLE",
    "ipa": "ˈplɔːzəbl",
    "elo": 1010,
    "level": "intermediate",
    "scenario": "'Xe tao xẹp lốp' là lý do PLAUSIBLE, nếu story của nó không đang check-in quán nướng, ủa alo.",
    "translationHint": "Hợp lý, đáng tin",
    "upgradeModule": {
      "simpleSentence": "Your explanation sounds like it could be true.",
      "targetSlot": "sounds like it could be true",
      "academicOptions": [
        { "text": "plausible explanation", "nuance": "Lời giải thích nghe có vẻ hợp lý và chấp nhận được.", "formalityScore": 8 },
        { "text": "credible scenario", "nuance": "Kịch bản đáng tin cậy.", "formalityScore": 9 },
        { "text": "reasonable excuse", "nuance": "Lý do bào chữa hợp lý.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "plaud/plaus-", "meaning": "vỗ tay/tán thưởng (applause)", "relatedWords": [{ "word": "applaud", "meaning": "vỗ tay" }, { "word": "plaudits", "meaning": "lời khen ngợi" }] }
    }
  },
  {
    "id": "v016",
    "word": "SCRUTINIZE",
    "ipa": "ˈskruːtənaɪz",
    "elo": 1040,
    "level": "intermediate",
    "scenario": "Người yêu cũ đăng ảnh mới là cả group SCRUTINIZE từng pixel, check var còn kỹ hơn chấm thi.",
    "translationHint": "Xem xét kỹ lưỡng",
    "upgradeModule": {
      "simpleSentence": "The manager looked at the report carefully.",
      "targetSlot": "looked at the report carefully",
      "academicOptions": [
        { "text": "scrutinize the findings", "nuance": "Kiểm tra kết quả một cách cực kỳ chi tiết để tìm sai sót.", "formalityScore": 9 },
        { "text": "inspect", "nuance": "Thanh tra, kiểm tra chính thức.", "formalityScore": 8 },
        { "text": "examine", "nuance": "Khảo sát, xem xét.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "scruta-", "meaning": "rác/vụn vặt (search through trash)", "relatedWords": [{ "word": "scrutiny", "meaning": "sự soi xét" }] },
      "suffix": { "text": "-ize", "meaning": "hậu tố tạo động từ", "relatedWords": [{ "word": "realize", "meaning": "nhận ra" }, { "word": "optimize", "meaning": "tối ưu" }] }
    }
  },
  {
    "id": "v017",
    "word": "CANDID",
    "ipa": "ˈkændɪd",
    "elo": 1030,
    "level": "intermediate",
    "scenario": "Nhờ bạn thân nhận xét CANDID về outfit đi date, nó phán 'kém miếng khó chịu', giờ mình đang thay bộ thứ năm.",
    "translationHint": "Thẳng thắn, chân thành",
    "upgradeModule": {
      "simpleSentence": "I want your honest opinion.",
      "targetSlot": "honest opinion",
      "academicOptions": [
        { "text": "candid feedback", "nuance": "Phản hồi thẳng thắn, không giấu giếm, đôi khi hơi phũ.", "formalityScore": 8 },
        { "text": "frank discussion", "nuance": "Thảo luận cởi mở, bộc trực.", "formalityScore": 7 },
        { "text": "forthright", "nuance": "Thẳng thắn, quyết đoán.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "cand-", "meaning": "trắng/sáng (white/bright)", "relatedWords": [{ "word": "candle", "meaning": "cây nến" }, { "word": "candidate", "meaning": "ứng viên (thời La Mã ứng viên mặc áo trắng)" }] }
    }
  },
  {
    "id": "v018",
    "word": "CONTEMPLATE",
    "ipa": "ˈkɒntəmpleɪt",
    "elo": 1060,
    "level": "intermediate",
    "scenario": "Nằm CONTEMPLATE nửa tiếng xem nên dậy hay ngủ tiếp, cuối cùng ngủ tiếp vì nghĩ nhiều lowkey mệt quá.",
    "translationHint": "Suy ngẫm, trầm tư",
    "upgradeModule": {
      "simpleSentence": "I am thinking about quitting my job.",
      "targetSlot": "thinking about",
      "academicOptions": [
        { "text": "contemplating a career change", "nuance": "Cân nhắc kỹ lưỡng về việc đổi nghề.", "formalityScore": 9 },
        { "text": "ponder", "nuance": "Trầm tư suy nghĩ.", "formalityScore": 8 },
        { "text": "deliberate", "nuance": "Thảo luận hoặc suy nghĩ thận trọng trước khi quyết định.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "con-", "meaning": "cùng nhau/hoàn toàn", "relatedWords": [{ "word": "connect", "meaning": "kết nối" }] },
      "root": { "text": "templ-", "meaning": "không gian mở/đền thờ (temple - nơi quan sát tinh tú)", "relatedWords": [{ "word": "temple", "meaning": "đền thờ" }] }
    }
  },
  {
    "id": "v019",
    "word": "MUNDANE",
    "ipa": "mʌnˈdeɪn",
    "elo": 1000,
    "level": "intermediate",
    "scenario": "Đi làm năm nhất delulu tưởng được đụng dự án lớn, ai ngờ ngày nào cũng việc MUNDANE: photo, scan, pha cà phê.",
    "translationHint": "Tầm thường, nhàm chán",
    "upgradeModule": {
      "simpleSentence": "I am tired of my boring daily life.",
      "targetSlot": "boring daily life",
      "academicOptions": [
        { "text": "mundane existence", "nuance": "Sự tồn tại tầm thường, thiếu đi sự thú vị hay tâm linh.", "formalityScore": 8 },
        { "text": "prosaic", "nuance": "Tẻ nhạt, thiếu trí tưởng tượng.", "formalityScore": 9 },
        { "text": "humdrum", "nuance": "Đơn điệu, lặp đi lặp lại.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "mund-", "meaning": "thế giới (world)", "relatedWords": [{ "word": "mundial", "meaning": "thuộc về thế giới" }] }
    }
  },
  {
    "id": "v020",
    "word": "INHERENT",
    "ipa": "ɪnˈhɪrənt",
    "elo": 1070,
    "level": "intermediate",
    "scenario": "Ở trọ thì phòng bên hát karaoke lúc 11 giờ đêm là rủi ro INHERENT, hợp đồng không ghi mà ai cũng biết, real.",
    "translationHint": "Vốn có, cố hữu",
    "upgradeModule": {
      "simpleSentence": "Every job has its basic risks.",
      "targetSlot": "basic risks",
      "academicOptions": [
        { "text": "inherent dangers", "nuance": "Những nguy hiểm vốn đã nằm sẵn bên trong bản chất vấn đề.", "formalityScore": 9 },
        { "text": "intrinsic value", "nuance": "Giá trị nội tại.", "formalityScore": 9 },
        { "text": "innate", "nuance": "Bẩm sinh (thường dùng cho con người).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "vào trong", "relatedWords": [{ "word": "input", "meaning": "đầu vào" }] },
      "root": { "text": "her-", "meaning": "dính vào (to stick)", "relatedWords": [{ "word": "adhere", "meaning": "dính chặt" }, { "word": "cohesive", "meaning": "gắn kết" }] }
    }
  },
  {
    "id": "v021",
    "word": "CONUNDRUM",
    "ipa": "kəˈnʌndrəm",
    "elo": 1150,
    "level": "intermediate",
    "scenario": "CONUNDRUM mỗi sáng: dậy sớm thì buồn ngủ cả ngày, dậy muộn thì trễ học, còn ngủ sớm thì chưa từng, hết cứu.",
    "translationHint": "Vấn đề hóc búa",
    "upgradeModule": {
      "simpleSentence": "This is a very difficult problem to solve.",
      "targetSlot": "difficult problem",
      "academicOptions": [
        { "text": "ethical conundrum", "nuance": "Một vấn đề hóc búa về mặt đạo đức khó tìm ra lời giải.", "formalityScore": 9 },
        { "text": "dilemma", "nuance": "Tiến thoái lưỡng nan giữa 2 lựa chọn.", "formalityScore": 8 },
        { "text": "enigma", "nuance": "Một bí ẩn, điều khó hiểu.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "conundrum", "meaning": "từ lóng thời xưa chỉ các câu đố/vấn đề kỳ quái", "relatedWords": [] }
    }
  },
  {
    "id": "v022",
    "word": "EXACERBATE",
    "ipa": "ɪɡˈzæsərbeɪt",
    "elo": 1180,
    "level": "intermediate",
    "scenario": "Thi rớt xong mở TikTok toàn clip người ta flex học bổng, càng lướt càng EXACERBATE nỗi đau.",
    "translationHint": "Làm tệ hại thêm",
    "upgradeModule": {
      "simpleSentence": "Loud music will make your headache worse.",
      "targetSlot": "make your headache worse",
      "academicOptions": [
        { "text": "exacerbate the pain", "nuance": "Làm trầm trọng thêm cơn đau hoặc tình huống xấu.", "formalityScore": 9 },
        { "text": "aggravate", "nuance": "Làm bực mình hoặc làm trầm trọng thêm.", "formalityScore": 8 },
        { "text": "worsen", "nuance": "Làm tệ đi (thông dụng hơn).", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ex-", "meaning": "làm cho (intensive prefix)", "relatedWords": [{ "word": "exaggerate", "meaning": "phóng đại" }] },
      "root": { "text": "acer-", "meaning": "nhọn/sắc/chua (sharp/sour)", "relatedWords": [{ "word": "acid", "meaning": "axit" }, { "word": "acrid", "meaning": "hăng/cay" }] }
    }
  },
  {
    "id": "v023",
    "word": "MITIGATE",
    "ipa": "ˈmɪtɪɡeɪt",
    "elo": 1120,
    "level": "intermediate",
    "scenario": "Hai ly cà phê đá chỉ MITIGATE được cơn buồn ngủ tới 10 giờ, sau đó vẫn gục lên bàn phím như cũ, toang.",
    "translationHint": "Giảm nhẹ, làm dịu",
    "upgradeModule": {
      "simpleSentence": "We need to reduce the damage of the flood.",
      "targetSlot": "reduce the damage",
      "academicOptions": [
        { "text": "mitigate the risks", "nuance": "Giảm thiểu các rủi ro tiềm tàng.", "formalityScore": 9 },
        { "text": "alleviate", "nuance": "Làm nhẹ bớt (thường dùng cho nỗi đau, sự nghèo khổ).", "formalityScore": 8 },
        { "text": "lessen", "nuance": "Làm ít đi.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "mit-", "meaning": "nhẹ/mềm (mild/soft)", "relatedWords": [{ "word": "mild", "meaning": "nhẹ nhàng" }] },
      "suffix": { "text": "-ate", "meaning": "hậu tố động từ", "relatedWords": [{ "word": "activate", "meaning": "kích hoạt" }] }
    }
  },
  {
    "id": "v024",
    "word": "NUANCE",
    "ipa": "ˈnjuːɑːns",
    "elo": 1140,
    "level": "intermediate",
    "scenario": "Phải hiểu NUANCE giữa 'ok' và 'okk' trong tin nhắn crush, sai một chữ k là cả tối nằm check var như trọng tài.",
    "translationHint": "Sắc thái nhỏ",
    "upgradeModule": {
      "simpleSentence": "The translator must understand the small details of the language.",
      "targetSlot": "small details",
      "academicOptions": [
        { "text": "subtle nuances", "nuance": "Những khác biệt cực kỳ nhỏ và tinh tế.", "formalityScore": 9 },
        { "text": "fine points", "nuance": "Những điểm chi tiết, tinh vi.", "formalityScore": 8 },
        { "text": "niceties", "nuance": "Sự chi tiết, chuẩn xác trong hành vi hoặc ngôn ngữ.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "nua-", "meaning": "đám mây (cloud - bắt nguồn từ 'nubes')", "relatedWords": [{ "word": "nubilous", "meaning": "mây mù" }] }
    }
  },
  {
    "id": "v025",
    "word": "PROLIFIC",
    "ipa": "prəˈlɪfɪk",
    "elo": 1160,
    "level": "intermediate",
    "scenario": "Đứa em họ PROLIFIC thật, một tuần đăng 20 video TikTok, còn mình một video edit chưa xong, bị out trình.",
    "translationHint": "Hiệu suất cao, đẻ nhiều",
    "upgradeModule": {
      "simpleSentence": "He is a very busy writer who writes many books.",
      "targetSlot": "writes many books",
      "academicOptions": [
        { "text": "prolific author", "nuance": "Tác giả có sức sáng tạo lớn, viết rất nhiều tác phẩm.", "formalityScore": 9 },
        { "text": "productive", "nuance": "Năng suất cao.", "formalityScore": 7 },
        { "text": "fecund", "nuance": "Màu mỡ, khả năng sinh sản/sáng tạo cực cao.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "proli-", "meaning": "con cháu/dòng dõi (offspring)", "relatedWords": [{ "word": "proliferate", "meaning": "tăng sinh/sinh sôi" }] },
      "suffix": { "text": "-fic", "meaning": "làm ra/tạo ra", "relatedWords": [{ "word": "terrific", "meaning": "khủng khiếp" }, { "word": "scientific", "meaning": "khoa học" }] }
    }
  },
  {
    "id": "v026",
    "word": "REDUNDANT",
    "ipa": "rɪˈdʌndənt",
    "elo": 1110,
    "level": "intermediate",
    "scenario": "Mua sạc dự phòng thứ ba trong năm, balo giờ toàn đồ REDUNDANT mà điện thoại vẫn sập nguồn, xu cà na gì đâu.",
    "translationHint": "Thừa thãi",
    "upgradeModule": {
      "simpleSentence": "This information is not needed.",
      "targetSlot": "not needed",
      "academicOptions": [
        { "text": "redundant information", "nuance": "Thông tin dư thừa, lặp lại không cần thiết.", "formalityScore": 8 },
        { "text": "superfluous", "nuance": "Nhiều hơn mức cần thiết, thừa thãi.", "formalityScore": 9 },
        { "text": "surplus", "nuance": "Số dư, phần dư ra.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "re-", "meaning": "lại một lần nữa", "relatedWords": [] },
      "root": { "text": "und-", "meaning": "sóng (wave - tràn ra như sóng)", "relatedWords": [{ "word": "abundant", "meaning": "dư thừa" }, { "word": "undulate", "meaning": "gợn sóng" }] }
    }
  },
  {
    "id": "v027",
    "word": "TANGIBLE",
    "ipa": "ˈtænʤəbl",
    "elo": 1130,
    "level": "intermediate",
    "scenario": "Ba tháng đi gym, kết quả TANGIBLE duy nhất để flex là cái thẻ hội viên, cái bụng thì vẫn y chang.",
    "translationHint": "Hữu hình, rõ rệt",
    "upgradeModule": {
      "simpleSentence": "We need to see real results.",
      "targetSlot": "real results",
      "academicOptions": [
        { "text": "tangible benefits", "nuance": "Lợi ích hữu hình, có thể đo lường hoặc chạm vào được.", "formalityScore": 9 },
        { "text": "concrete evidence", "nuance": "Bằng chứng cụ thể, vững chắc.", "formalityScore": 8 },
        { "text": "palpable", "nuance": "Rõ ràng đến mức cảm nhận được bằng giác quan.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "tang/tact-", "meaning": "chạm (touch)", "relatedWords": [{ "word": "contact", "meaning": "liên lạc" }, { "word": "tactile", "meaning": "thuộc về xúc giác" }] },
      "suffix": { "text": "-ible", "meaning": "có thể", "relatedWords": [] }
    }
  },
  {
    "id": "v028",
    "word": "ZENITH",
    "ipa": "ˈzenɪθ",
    "elo": 1190,
    "level": "intermediate",
    "scenario": "ZENITH đời sinh viên là tuần nhận học bổng, ăn lẩu ba bữa liền như đại gia, sau đó là chuỗi ngày mì gói, toang.",
    "translationHint": "Đỉnh cao",
    "upgradeModule": {
      "simpleSentence": "He is at the highest point of his career.",
      "targetSlot": "highest point",
      "academicOptions": [
        { "text": "at the zenith of his power", "nuance": "Ở đỉnh cao quyền lực/sự nghiệp.", "formalityScore": 9 },
        { "text": "pinnacle", "nuance": "Đỉnh chóp (thường dùng cho thành tựu).", "formalityScore": 9 },
        { "text": "peak", "nuance": "Đỉnh (thông dụng).", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "zenith", "meaning": "đỉnh đầu (thiên văn học - từ gốc Ả Rập)", "relatedWords": [] }
    }
  },
  {
    "id": "v029",
    "word": "COHERENT",
    "ipa": "kəʊˈhɪrənt",
    "elo": 1170,
    "level": "intermediate",
    "scenario": "Ba giờ sáng gửi crush một đoạn văn ô dề mà chẳng COHERENT tí nào, sáng dậy đọc lại muốn đổi luôn tên Zalo.",
    "translationHint": "Mạch lạc, logic",
    "upgradeModule": {
      "simpleSentence": "He failed to give a clear explanation.",
      "targetSlot": "clear explanation",
      "academicOptions": [
        { "text": "coherent argument", "nuance": "Lập luận mạch lạc, các phần kết nối logic với nhau.", "formalityScore": 9 },
        { "text": "lucid", "nuance": "Sáng sủa, dễ hiểu.", "formalityScore": 8 },
        { "text": "consistent", "nuance": "Nhất quán.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "co-", "meaning": "cùng nhau", "relatedWords": [] },
      "root": { "text": "her-", "meaning": "dính (stick)", "relatedWords": [{ "word": "adhere", "meaning": "dính chặt" }, { "word": "inhere", "meaning": "vốn có" }] }
    }
  },
  {
    "id": "v030",
    "word": "ARBITRARY",
    "ipa": "ˈɑːrbɪtreri",
    "elo": 1100,
    "level": "intermediate",
    "scenario": "Cách thầy chấm thuyết trình nghe ARBITRARY quá, nhóm làm ba tuần được 7, nhóm làm ba tiếng được 9, đòi check var gấp.",
    "translationHint": "Tùy hứng, tùy tiện",
    "upgradeModule": {
      "simpleSentence": "The decision was based on chance, not a rule.",
      "targetSlot": "based on chance, not a rule",
      "academicOptions": [
        { "text": "arbitrary decision", "nuance": "Quyết định tùy tiện, không dựa trên lý lẽ hay hệ thống.", "formalityScore": 9 },
        { "text": "random", "nuance": "Ngẫu nhiên.", "formalityScore": 6 },
        { "text": "capricious", "nuance": "Thất thường, thay đổi tùy hứng.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "arbiter-", "meaning": "người phán xử/trọng tài (judge)", "relatedWords": [{ "word": "arbitrate", "meaning": "phân xử" }, { "word": "arbiter", "meaning": "người có quyền quyết định" }] }
    }
  },

  // ELO 1200-1300: Advanced
  {
    "id": "v031",
    "word": "BELLIGERENT",
    "ipa": "bəˈlɪdʒərənt",
    "elo": 1250,
    "level": "advanced",
    "scenario": "Chưa ăn sáng là bạn cùng phòng BELLIGERENT liền, hỏi 'mày ổn không' cũng bị lườm như kẻ thù, tới công chuyện.",
    "translationHint": "Hiếu chiến, hung hăng",
    "upgradeModule": {
      "simpleSentence": "The drunk man was very aggressive.",
      "targetSlot": "very aggressive",
      "academicOptions": [
        { "text": "belligerent attitude", "nuance": "Thái độ sặc mùi thuốc súng, sẵn sàng gây chiến.", "formalityScore": 9 },
        { "text": "hostile", "nuance": "Thù địch, không thân thiện.", "formalityScore": 7 },
        { "text": "pugnacious", "nuance": "Thích tranh cãi, hay gây gổ (thiên về tính cách).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "bell-", "meaning": "chiến tranh (war)", "relatedWords": [{ "word": "rebellion", "meaning": "cuộc nổi loạn" }, { "word": "antebellum", "meaning": "trước chiến tranh" }] },
      "suffix": { "text": "-gerent", "meaning": "mang theo/tiến hành (waging/carrying)", "relatedWords": [{ "word": "vicegerent", "meaning": "người đại diện" }] }
    }
  },
  {
    "id": "v032",
    "word": "ELUCIDATE",
    "ipa": "ɪˈluːsɪdeɪt",
    "elo": 1220,
    "level": "advanced",
    "scenario": "Nhờ bạn học giỏi ELUCIDATE lại bài đạo hàm, nó giảng mười phút, mình chỉ hiểu ra là mình hết cứu.",
    "translationHint": "Làm sáng tỏ, giải thích rõ",
    "upgradeModule": {
      "simpleSentence": "Can you explain this point more clearly?",
      "targetSlot": "explain this point more clearly",
      "academicOptions": [
        { "text": "elucidate this concept", "nuance": "Làm sáng tỏ một khái niệm khó hiểu bằng cách giải thích chi tiết.", "formalityScore": 9 },
        { "text": "clarify", "nuance": "Làm cho rõ ràng (thông dụng).", "formalityScore": 7 },
        { "text": "explicate", "nuance": "Phân tích và giải thích chi tiết một văn bản hoặc ý tưởng.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "e-", "meaning": "ra ngoài (out)", "relatedWords": [] },
      "root": { "text": "lucid-", "meaning": "ánh sáng/sáng sủa (light/clear)", "relatedWords": [{ "word": "lucid", "meaning": "sáng suốt" }, { "word": "translucent", "meaning": "trong mờ" }, { "word": "lucidity", "meaning": "sự minh mẫn" }] },
      "suffix": { "text": "-ate", "meaning": "hậu tố động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v033",
    "word": "ESOTERIC",
    "ipa": "esəˈterɪk",
    "elo": 1280,
    "level": "advanced",
    "scenario": "Group chat có mấy inside joke ESOTERIC tới mức người mới vào đọc ba ngày vẫn tưởng mật mã, fomo muốn khóc.",
    "translationHint": "Bí truyền, chuyên sâu khó hiểu",
    "upgradeModule": {
      "simpleSentence": "This topic is only understood by a few experts.",
      "targetSlot": "only understood by a few experts",
      "academicOptions": [
        { "text": "esoteric knowledge", "nuance": "Kiến thức hàn lâm, bí hiểm, chỉ dành cho người trong cuộc.", "formalityScore": 9 },
        { "text": "obscure", "nuance": "Ít người biết đến, mờ mịt.", "formalityScore": 7 },
        { "text": "abstruse", "nuance": "Khó hiểu vì quá sâu xa hoặc phức tạp.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "eso-", "meaning": "bên trong (within/inner)", "relatedWords": [{ "word": "exoteric", "meaning": "phổ biến (ngược với esoteric)" }] },
      "suffix": { "text": "-ic", "meaning": "thuộc về", "relatedWords": [] }
    }
  },
  {
    "id": "v034",
    "word": "GREGARIOUS",
    "ipa": "ɡrɪˈɡeəriəs",
    "elo": 1240,
    "level": "advanced",
    "scenario": "Nhỏ bạn GREGARIOUS tới mức đi vệ sinh ở quán cà phê ra đã có thêm hai người bạn và một nhóm Zalo, ra đường tôi nể mỗi bạn.",
    "translationHint": "Hòa đồng, thích giao du",
    "upgradeModule": {
      "simpleSentence": "He is a very social person.",
      "targetSlot": "social person",
      "academicOptions": [
        { "text": "gregarious personality", "nuance": "Kiểu người thích ở trong đám đông, cực kỳ hướng ngoại.", "formalityScore": 8 },
        { "text": "sociable", "nuance": "Dễ gần, thích giao lưu.", "formalityScore": 6 },
        { "text": "extroverted", "nuance": "Hướng ngoại (thuật ngữ tâm lý).", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "greg-", "meaning": "bầy đàn/đám đông (flock/herd)", "relatedWords": [{ "word": "segregate", "meaning": "tách biệt" }, { "word": "aggregate", "meaning": "tổng hợp lại" }, { "word": "congregate", "meaning": "tập hợp" }] },
      "suffix": { "text": "-ous", "meaning": "tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v035",
    "word": "IMPETUOUS",
    "ipa": "ɪmˈpetʃuəs",
    "elo": 1260,
    "level": "advanced",
    "scenario": "Một phút IMPETUOUS tự báo thủ mái tóc theo trend TikTok, giờ đi học phải đội mũ lưỡi trai cả tuần.",
    "translationHint": "Hấp tấp, bốc đồng",
    "upgradeModule": {
      "simpleSentence": "Don't make quick decisions without thinking.",
      "targetSlot": "quick decisions",
      "academicOptions": [
        { "text": "impetuous decision", "nuance": "Quyết định làm theo cảm xúc nhất thời, thiếu suy nghĩ chín chắn.", "formalityScore": 8 },
        { "text": "impulsive", "nuance": "Bốc đồng, làm theo bản năng.", "formalityScore": 7 },
        { "text": "rash", "nuance": "Hấp tấp, liều lĩnh (thường mang nghĩa tiêu cực hơn).", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "pet-", "meaning": "lao tới/yêu cầu (to rush/seek)", "relatedWords": [{ "word": "petition", "meaning": "đơn kiến nghị" }, { "word": "appetite", "meaning": "sự thèm ăn" }, { "word": "compete", "meaning": "cạnh tranh" }] },
      "suffix": { "text": "-uous", "meaning": "tính chất/đầy rẫy", "relatedWords": [] }
    }
  },
  {
    "id": "v036",
    "word": "JUXTAPOSE",
    "ipa": "ʤʌksˈtæpəʊz",
    "elo": 1230,
    "level": "advanced",
    "scenario": "Thử JUXTAPOSE ảnh mẫu trên shop với bộ đồ giao tới, thấy rõ hai vũ trụ song song, u là trời.",
    "translationHint": "Đặt cạnh nhau để so sánh",
    "upgradeModule": {
      "simpleSentence": "The artist put two different things next to each other.",
      "targetSlot": "put two different things next to each other",
      "academicOptions": [
        { "text": "juxtapose contrasting elements", "nuance": "Đặt các yếu tố đối lập cạnh nhau để làm bật lên sự khác biệt.", "formalityScore": 9 },
        { "text": "place side-by-side", "nuance": "Đặt cạnh nhau (trung tính).", "formalityScore": 6 },
        { "text": "compare and contrast", "nuance": "So sánh và đối chiếu.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "juxta-", "meaning": "gần/cạnh bên (near/beside)", "relatedWords": [{ "word": "proximity", "meaning": "sự gần gũi (gốc Latin gần giống)" }] },
      "suffix": { "text": "pose-", "meaning": "đặt/để (to place)", "relatedWords": [{ "word": "compose", "meaning": "soạn thảo" }, { "word": "expose", "meaning": "phơi bày" }, { "word": "impose", "meaning": "áp đặt" }] }
    }
  },
  {
    "id": "v037",
    "word": "MALEVOLENT",
    "ipa": "məˈlevələnt",
    "elo": 1270,
    "level": "advanced",
    "scenario": "Con mèo nhìn ly cà phê trên bàn bằng ánh mắt MALEVOLENT, ba giây sau bàn phím laptop ướt sũng, báo thủ chính hiệu.",
    "translationHint": "Độc ác, có ác ý",
    "upgradeModule": {
      "simpleSentence": "He has a very bad and evil look.",
      "targetSlot": "bad and evil look",
      "academicOptions": [
        { "text": "malevolent gaze", "nuance": "Cái nhìn đầy ác ý, mong muốn điều xấu cho người khác.", "formalityScore": 9 },
        { "text": "malicious", "nuance": "Hiểm độc, có ý đồ xấu (thường dùng cho hành động).", "formalityScore": 8 },
        { "text": "wicked", "nuance": "Xấu xa, độc ác (mang tính kể chuyện).", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "mal-", "meaning": "xấu/tệ (bad/evil)", "relatedWords": [{ "word": "malfunction", "meaning": "lỗi chức năng" }, { "word": "malnutrition", "meaning": "suy dinh dưỡng" }] },
      "root": { "text": "vol-", "meaning": "ý muốn (wish/will)", "relatedWords": [{ "word": "voluntary", "meaning": "tự nguyện" }, { "word": "benevolent", "meaning": "nhân từ (ngược lại)" }] },
      "suffix": { "text": "-ent", "meaning": "hậu tố tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v038",
    "word": "OBFUSCATE",
    "ipa": "ɒbˈfʌskeɪt",
    "elo": 1290,
    "level": "advanced",
    "scenario": "Hỏi 'hôm qua đi đâu' mà người yêu trả lời vòng vo ba đoạn, cố OBFUSCATE kiểu này là red flag rồi.",
    "translationHint": "Làm mờ mịt, che giấu",
    "upgradeModule": {
      "simpleSentence": "The lawyer tried to hide the truth with long words.",
      "targetSlot": "hide the truth",
      "academicOptions": [
        { "text": "obfuscate the facts", "nuance": "Cố tình làm cho sự thật trở nên khó hiểu hoặc mờ mịt.", "formalityScore": 9 },
        { "text": "obscure", "nuance": "Làm mờ đi.", "formalityScore": 7 },
        { "text": "confuse the issue", "nuance": "Làm rối rắm vấn đề.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob-", "meaning": "đối diện/ngược lại (against/over)", "relatedWords": [] },
      "root": { "text": "fusc-", "meaning": "tối/đen (dark)", "relatedWords": [{ "word": "fuscous", "meaning": "màu nâu xám tối" }] },
      "suffix": { "text": "-ate", "meaning": "hậu tố động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v039",
    "word": "PARSIMONY",
    "ipa": "ˈpɑːrsɪməni",
    "elo": 1210,
    "level": "advanced",
    "scenario": "PARSIMONY của thằng bạn đỉnh nóc kịch trần, đi chơi năm lần thì đúng năm lần nó quên ví.",
    "translationHint": "Sự bủn xỉn, keo kiệt",
    "upgradeModule": {
      "simpleSentence": "The government's extreme stinginess is a problem.",
      "targetSlot": "extreme stinginess",
      "academicOptions": [
        { "text": "unnecessary parsimony", "nuance": "Sự tiết kiệm quá mức đến mức bủn xỉn không cần thiết.", "formalityScore": 9 },
        { "text": "frugality", "nuance": "Sự tiết kiệm (nghĩa tích cực hơn).", "formalityScore": 7 },
        { "text": "niggardliness", "nuance": "Sự keo kiệt (từ cũ, trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "parsi-", "meaning": "tiết kiệm/dành dụm (to spare)", "relatedWords": [{ "word": "parsimonious", "meaning": "keo kiệt" }] },
      "suffix": { "text": "-mony", "meaning": "trạng thái/hành động", "relatedWords": [{ "word": "matrimony", "meaning": "hôn nhân" }, { "word": "testimony", "meaning": "lời khai" }] }
    }
  },
  {
    "id": "v040",
    "word": "QUINTESSENTIAL",
    "ipa": "kwɪntɪˈsenʃl",
    "elo": 1200,
    "level": "advanced",
    "scenario": "Ngồi ghế nhựa ăn bánh tráng trộn, uống trà đá, hóng biến group lớp, một buổi chiều QUINTESSENTIAL của sinh viên.",
    "translationHint": "Tinh túy, điển hình",
    "upgradeModule": {
      "simpleSentence": "This is a perfect example of French style.",
      "targetSlot": "perfect example",
      "academicOptions": [
        { "text": "quintessential example", "nuance": "Ví dụ điển hình nhất, chứa đựng tinh hoa của một phong cách.", "formalityScore": 9 },
        { "text": "archetypal", "nuance": "Nguyên mẫu, điển hình.", "formalityScore": 9 },
        { "text": "ultimate", "nuance": "Cuối cùng, bậc nhất.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "quint-", "meaning": "thứ năm (fifth - nguyên tố thứ 5 sau đất, nước, lửa, khí)", "relatedWords": [{ "word": "quintet", "meaning": "nhóm 5 người" }, { "word": "quintuple", "meaning": "gấp 5 lần" }] },
      "root": { "text": "essent-", "meaning": "bản chất (essence)", "relatedWords": [{ "word": "essential", "meaning": "thiết yếu" }] },
      "suffix": { "text": "-ial", "meaning": "thuộc về", "relatedWords": [] }
    }
  },
  {
    "id": "v041",
    "word": "RECALCITRANT",
    "ipa": "rɪˈkælsɪtrənt",
    "elo": 1350,
    "level": "expert",
    "scenario": "Mái tóc RECALCITRANT này sấy, uốn, xịt keo đủ kiểu vẫn dựng đứng y như vừa ngủ dậy, hết cứu.",
    "translationHint": "Ngoan cố, bướng bỉnh",
    "upgradeModule": {
      "simpleSentence": "The stubborn student refused to follow rules.",
      "targetSlot": "stubborn",
      "academicOptions": [
        { "text": "recalcitrant behavior", "nuance": "Thái độ ngoan cố, chống đối lại kỷ luật hoặc mệnh lệnh.", "formalityScore": 9 },
        { "text": "defiant", "nuance": "Thách thức, công khai chống đối.", "formalityScore": 8 },
        { "text": "obstinate", "nuance": "Lỳ lợm, khó bảo.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "re-", "meaning": "ngược lại (back/again)", "relatedWords": [] },
      "root": { "text": "calcitr-", "meaning": "đá bằng gót chân (to kick with heels)", "relatedWords": [{ "word": "calcium", "meaning": "canxi (liên quan đến xương gót)" }] },
      "suffix": { "text": "-ant", "meaning": "tính từ chỉ đặc điểm", "relatedWords": [] }
    }
  },
  {
    "id": "v042",
    "word": "SALIENT",
    "ipa": "ˈseɪliənt",
    "elo": 1320,
    "level": "expert",
    "scenario": "Điểm SALIENT nhất trong profile hẹn hò của nó là tấm ảnh ôm chó, mà con chó là của hàng xóm, red flag.",
    "translationHint": "Nổi bật, đáng chú ý",
    "upgradeModule": {
      "simpleSentence": "What are the most important points of the book?",
      "targetSlot": "most important points",
      "academicOptions": [
        { "text": "salient features", "nuance": "Những đặc điểm nổi bật nhất, đập ngay vào mắt.", "formalityScore": 9 },
        { "text": "prominent", "nuance": "Dễ thấy, lỗi lạc.", "formalityScore": 7 },
        { "text": "striking", "nuance": "Gây ấn tượng mạnh mẽ.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "sal/sil-", "meaning": "nhảy (to leap/jump)", "relatedWords": [{ "word": "resilient", "meaning": "kiên cường" }, { "word": "assail", "meaning": "tấn công" }] },
      "suffix": { "text": "-ent", "meaning": "tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v043",
    "word": "TACITURN",
    "ipa": "ˈtæsɪtɜn",
    "elo": 1340,
    "level": "expert",
    "scenario": "Về quê ăn Tết, mình TACITURN cả buổi, bị hỏi lương bao nhiêu mới chằm zn nói đúng ba chữ 'cũng tạm ạ'.",
    "translationHint": "Ít nói, lầm lì",
    "upgradeModule": {
      "simpleSentence": "He is a quiet man who doesn't talk much.",
      "targetSlot": "quiet man",
      "academicOptions": [
        { "text": "taciturn individual", "nuance": "Người có xu hướng lầm lì, ít nói một cách tự nhiên.", "formalityScore": 9 },
        { "text": "reticent", "nuance": "Kín đáo, dè dặt (thường là có chủ ý).", "formalityScore": 8 },
        { "text": "reserved", "nuance": "Giữ kẽ, chừng mực.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "tac-", "meaning": "im lặng (silent)", "relatedWords": [{ "word": "tacit", "meaning": "ngầm định" }, { "word": "reticent", "meaning": "kín đáo" }] },
      "suffix": { "text": "-urn", "meaning": "hậu tố chỉ đặc điểm", "relatedWords": [] }
    }
  },
  {
    "id": "v044",
    "word": "VICARIOUS",
    "ipa": "vɪˈkeəriəs",
    "elo": 1310,
    "level": "expert",
    "scenario": "Ví cạn nên du lịch kiểu VICARIOUS, coi vlog Nhật tới 2 giờ sáng, manifest xong ngủ như vừa đi về.",
    "translationHint": "Trải nghiệm gián tiếp",
    "upgradeModule": {
      "simpleSentence": "She feels happy by watching her daughter's success.",
      "targetSlot": "feels happy by watching",
      "academicOptions": [
        { "text": "vicarious pleasure", "nuance": "Niềm vui có được thông qua việc quan sát trải nghiệm của người khác.", "formalityScore": 9 },
        { "text": "indirect experience", "nuance": "Trải nghiệm gián tiếp.", "formalityScore": 6 },
        { "text": "proxy", "nuance": "Sự ủy quyền/thay thế.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "vic-", "meaning": "thay đổi/thay thế (change/substitute)", "relatedWords": [{ "word": "vice-president", "meaning": "phó chủ tịch" }, { "word": "vicissitude", "meaning": "sự thăng trầm" }] },
      "suffix": { "text": "-ous", "meaning": "tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v045",
    "word": "ZEALOT",
    "ipa": "ˈzelət",
    "elo": 1330,
    "level": "expert",
    "scenario": "Nhỏ bạn là ZEALOT của trà sữa, ai chê trân châu đường đen là kick khỏi group liền, ô dề hết sức.",
    "translationHint": "Người cuồng tín",
    "upgradeModule": {
      "simpleSentence": "He is a crazy fan of this political party.",
      "targetSlot": "crazy fan",
      "academicOptions": [
        { "text": "religious zealot", "nuance": "Kẻ cuồng tín mù quáng, sẵn sàng cực đoan vì niềm tin.", "formalityScore": 9 },
        { "text": "fanatic", "nuance": "Người cuồng nhiệt quá mức.", "formalityScore": 7 },
        { "text": "enthusiast", "nuance": "Người say mê (nghĩa tích cực).", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "zeal-", "meaning": "nhiệt huyết (passion/fervor)", "relatedWords": [{ "word": "zealous", "meaning": "hăng hái" }, { "word": "jealous", "meaning": "ghen tị (gốc từ gần giống)" }] },
      "suffix": { "text": "-ot", "meaning": "người thực hiện hành động", "relatedWords": [{ "word": "idiot", "meaning": "kẻ ngốc" }, { "word": "patriot", "meaning": "người yêu nước" }] }
    }
  },
  {
    "id": "v046",
    "word": "AMELIORATE",
    "ipa": "əˈmiːliəreɪt",
    "elo": 1360,
    "level": "expert",
    "scenario": "Sắm cây xanh, đèn vàng, nến thơm để AMELIORATE phòng trọ 12 mét vuông, giờ chật hơn nhưng lowkey xinh.",
    "translationHint": "Cải thiện, làm tốt hơn",
    "upgradeModule": {
      "simpleSentence": "The government wants to make the living conditions better.",
      "targetSlot": "make the living conditions better",
      "academicOptions": [
        { "text": "ameliorate the situation", "nuance": "Cải thiện một tình huống đang tồi tệ hoặc khó khăn.", "formalityScore": 10 },
        { "text": "improve", "nuance": "Cải thiện (thông dụng).", "formalityScore": 6 },
        { "text": "enhance", "nuance": "Nâng cao chất lượng.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "melior-", "meaning": "tốt hơn (better)", "relatedWords": [{ "word": "meliorism", "meaning": "thuyết tin rằng thế giới có thể tốt hơn" }] },
      "suffix": { "text": "-ate", "meaning": "hậu tố động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v047",
    "word": "CACOPHONY",
    "ipa": "kəˈkɒfəni",
    "elo": 1380,
    "level": "expert",
    "scenario": "Bảy giờ sáng Chủ nhật: khoan tường, gà gáy, loa bán hàng, một bản CACOPHONY ngay trên đầu phòng trọ, tới công chuyện.",
    "translationHint": "Âm thanh hỗn tạp, chói tai",
    "upgradeModule": {
      "simpleSentence": "The noise from the street was terrible.",
      "targetSlot": "terrible",
      "academicOptions": [
        { "text": "cacophony of sounds", "nuance": "Sự hỗn tạp âm thanh chói tai, không có chút giai điệu nào.", "formalityScore": 9 },
        { "text": "din", "nuance": "Tiếng ồn kéo dài, khó chịu.", "formalityScore": 7 },
        { "text": "clamor", "nuance": "Tiếng la hét, phản đối ồn ào.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "caco-", "meaning": "xấu/tệ (bad/evil)", "relatedWords": [{ "word": "cacography", "meaning": "chữ viết xấu" }] },
      "root": { "text": "phon-", "meaning": "âm thanh (sound)", "relatedWords": [{ "word": "telephone", "meaning": "điện thoại" }, { "word": "symphony", "meaning": "bản giao hưởng (âm thanh cùng nhau)" }] },
      "suffix": { "text": "-y", "meaning": "trạng thái/kết quả", "relatedWords": [] }
    }
  },
  {
    "id": "v048",
    "word": "DOGMATIC",
    "ipa": "dɒɡˈmætɪk",
    "elo": 1300,
    "level": "expert",
    "scenario": "Ông chú DOGMATIC tới mức tin học IT là phải sửa được tủ lạnh, giải thích cỡ nào cũng không nghe, xỉu ngang.",
    "translationHint": "Giáo điều, độc đoán",
    "upgradeModule": {
      "simpleSentence": "He is very sure he is right and won't listen to others.",
      "targetSlot": "very sure he is right",
      "academicOptions": [
        { "text": "dogmatic approach", "nuance": "Cách tiếp cận mang tính giáo điều, coi ý kiến mình là chân lý tuyệt đối.", "formalityScore": 9 },
        { "text": "opinionated", "nuance": "Bảo thủ, khư khư ý kiến.", "formalityScore": 7 },
        { "text": "dictatorial", "nuance": "Độc đoán như một kẻ độc tài.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "dogma-", "meaning": "niềm tin/ý kiến (opinion/belief)", "relatedWords": [{ "word": "dogma", "meaning": "giáo điều" }, { "word": "doxology", "meaning": "bài tụng ca" }] },
      "suffix": { "text": "-tic", "meaning": "thuộc về", "relatedWords": [] }
    }
  },
  {
    "id": "v049",
    "word": "ENERVATE",
    "ipa": "ˈenərveɪt",
    "elo": 1390,
    "level": "expert",
    "scenario": "Ba tiếng xếp hàng săn vé concert vì fomo đủ ENERVATE cả người, mua được vé xong ngồi bệt luôn ra vỉa hè.",
    "translationHint": "Làm suy yếu, làm kiệt sức",
    "upgradeModule": {
      "simpleSentence": "The heat makes me feel very weak.",
      "targetSlot": "feel very weak",
      "academicOptions": [
        { "text": "enervate the spirit", "nuance": "Làm kiệt quệ tinh thần hoặc sức lực từ bên trong.", "formalityScore": 9 },
        { "text": "exhaust", "nuance": "Làm kiệt sức (thông dụng).", "formalityScore": 7 },
        { "text": "debilitate", "nuance": "Làm yếu sức khỏe (thường do bệnh tật).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "e-", "meaning": "ra ngoài (out)", "relatedWords": [] },
      "root": { "text": "nerv-", "meaning": "dây thần kinh/sức mạnh (nerve/sinew)", "relatedWords": [{ "word": "nervous", "meaning": "lo lắng" }, { "word": "innervate", "meaning": "kích thích dây thần kinh" }] },
      "suffix": { "text": "-ate", "meaning": "động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v050",
    "word": "HACKNEYED",
    "ipa": "ˈhæknid",
    "elo": 1410,
    "level": "expert",
    "scenario": "Caption 'đi đâu không quan trọng, quan trọng là đi với ai' HACKNEYED lắm rồi, mà đi biển lần nào mình cũng xài, real.",
    "translationHint": "Sáo rỗng, tầm thường",
    "upgradeModule": {
      "simpleSentence": "The movie's plot was very old and unoriginal.",
      "targetSlot": "old and unoriginal",
      "academicOptions": [
        { "text": "hackneyed phrase", "nuance": "Cụm từ sáo rỗng vì bị dùng quá nhiều đến mức mất hết ý nghĩa.", "formalityScore": 8 },
        { "text": "cliché", "nuance": "Lời lẽ rập khuôn.", "formalityScore": 7 },
        { "text": "trite", "nuance": "Tầm thường, không còn thú vị.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "hackney-", "meaning": "ngựa cho thuê (Hackney horse - loại ngựa bị dùng làm việc đến kiệt sức)", "relatedWords": [] }
    }
  },
  {
    "id": "v051",
    "word": "GRANDILOQUENT",
    "ipa": "ɡrændɪˈləʊkwənt",
    "elo": 1450,
    "level": "expert",
    "scenario": "Bài luận học bổng viết GRANDILOQUENT như diễn văn, đọc ba trang mới thấy ý chính là 'em cần tiền', ô dề ghê.",
    "translationHint": "Khoa trương, hoa mỹ",
    "upgradeModule": {
      "simpleSentence": "His speech was full of big, fancy words.",
      "targetSlot": "big, fancy words",
      "academicOptions": [
        { "text": "grandiloquent style", "nuance": "Văn phong hoa mỹ quá mức cần thiết nhằm gây ấn tượng hão huyền.", "formalityScore": 9 },
        { "text": "pompous", "nuance": "Hợm hĩnh, khoe mẽ.", "formalityScore": 7 },
        { "text": "magniloquent", "nuance": "Tương tự grandiloquent, nhấn mạnh vào sự cao siêu của từ ngữ.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "grandi-", "meaning": "to lớn (grand)", "relatedWords": [{ "word": "grandiose", "meaning": "vĩ đại" }, { "word": "grandeur", "meaning": "sự huy hoàng" }] },
      "root": { "text": "loqu-", "meaning": "nói (speak)", "relatedWords": [{ "word": "eloquent", "meaning": "hùng biện" }, { "word": "soliloquy", "meaning": "độc thoại" }] },
      "suffix": { "text": "-ent", "meaning": "tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v052",
    "word": "ICONOCLAST",
    "ipa": "aɪˈkɒnəklæst",
    "elo": 1440,
    "level": "expert",
    "scenario": "Đứa ICONOCLAST của nhóm dám nói lẩu Thái dở, cả bàn im bặt như vừa nghe tin chia tay, ra đường tôi nể mỗi bạn.",
    "translationHint": "Người đả phá những quan điểm cũ",
    "upgradeModule": {
      "simpleSentence": "He is a person who attacks established beliefs.",
      "targetSlot": "attacks established beliefs",
      "academicOptions": [
        { "text": "true iconoclast", "nuance": "Người thực sự dám phá vỡ những niềm tin hoặc định chế truyền thống.", "formalityScore": 10 },
        { "text": "rebel", "nuance": "Kẻ nổi loạn.", "formalityScore": 6 },
        { "text": "maverick", "nuance": "Người độc lập, không theo quy tắc chung.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "eikon-", "meaning": "hình ảnh/biểu tượng (image/icon)", "relatedWords": [{ "word": "icon", "meaning": "biểu tượng" }] },
      "suffix": { "text": "-klastes", "meaning": "người phá vỡ (breaker)", "relatedWords": [{ "word": "clastic", "meaning": "đá vụn (địa chất)" }] }
    }
  },
  {
    "id": "v053",
    "word": "LACONIC",
    "ipa": "ləˈkɒnɪk",
    "elo": 1430,
    "level": "expert",
    "scenario": "Gửi crush một tin dài 500 chữ, nhận về câu trả lời LACONIC đúng một chữ 'ok', đọc xong xỉu ngang.",
    "translationHint": "Ngắn gọn, súc tích",
    "upgradeModule": {
      "simpleSentence": "He gave a very short answer.",
      "targetSlot": "very short answer",
      "academicOptions": [
        { "text": "laconic reply", "nuance": "Câu trả lời cực ngắn, gọn lén nhưng đầy đủ ý.", "formalityScore": 9 },
        { "text": "terse", "nuance": "Cộc lốc, ngắn gọn (đôi khi hơi thiếu lịch sự).", "formalityScore": 8 },
        { "text": "pithy", "nuance": "Súc tích, cô đọng và có ý nghĩa sâu sắc.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "Lakon-", "meaning": "vùng Laconia (Sparta - nơi nổi tiếng với lối nói cực kỳ ngắn gọn)", "relatedWords": [] }
    }
  },
  {
    "id": "v054",
    "word": "OBSEQUIOUS",
    "ipa": "əbˈsiːkwiəs",
    "elo": 1460,
    "level": "expert",
    "scenario": "Tuần trước thi cả lớp OBSEQUIOUS với lớp trưởng lạ thường, mời trà sữa liên tục để xin đề cương, thao túng tâm lý.",
    "translationHint": "Khúm núm, xu nịnh",
    "upgradeModule": {
      "simpleSentence": "The waiter was too polite and trying too hard to please.",
      "targetSlot": "too polite and trying too hard to please",
      "academicOptions": [
        { "text": "obsequious manner", "nuance": "Thái độ khúm núm, sẵn lòng phục tùng thái quá để lấy lòng.", "formalityScore": 9 },
        { "text": "servile", "nuance": "Nô lệ, thấp hèn.", "formalityScore": 8 },
        { "text": "fawning", "nuance": "Nịnh hót một cách đáng ghét.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob-", "meaning": "sau/theo sau (after)", "relatedWords": [] },
      "root": { "text": "sequi-", "meaning": "theo (to follow)", "relatedWords": [{ "word": "sequence", "meaning": "trình tự" }, { "word": "consequence", "meaning": "hệ quả" }] },
      "suffix": { "text": "-ous", "meaning": "tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v055",
    "word": "PERNICIOUS",
    "ipa": "pərˈnɪʃəs",
    "elo": 1470,
    "level": "expert",
    "scenario": "Thói quen 'xem thêm một tập thôi' PERNICIOUS hơn mình tưởng, giờ đã hết season ba và trời đã sáng, toang.",
    "translationHint": "Độc hại, nguy hiểm ngầm",
    "upgradeModule": {
      "simpleSentence": "This trend has a very harmful effect on children.",
      "targetSlot": "harmful effect",
      "academicOptions": [
        { "text": "pernicious influence", "nuance": "Sự ảnh hưởng độc hại, lây lan âm thầm và gây hậu quả nghiêm trọng.", "formalityScore": 10 },
        { "text": "detrimental", "nuance": "Có hại (thông dụng hơn).", "formalityScore": 8 },
        { "text": "malignant", "nuance": "Hiểm ác, ác tính.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "neci/nex-", "meaning": "cái chết/hủy diệt (death/destruction)", "relatedWords": [{ "word": "internecine", "meaning": "đồ sát lẫn nhau" }, { "word": "innocent", "meaning": "vô tội (không làm hại ai)" }] },
      "suffix": { "text": "-ious", "meaning": "tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v056",
    "word": "QUIXOTIC",
    "ipa": "kwɪkˈsɒtɪk",
    "elo": 1480,
    "level": "expert",
    "scenario": "Kế hoạch mua nhà bằng lương thực tập 3 triệu nghe QUIXOTIC quá, nhưng tối nào mình cũng manifest.",
    "translationHint": "Viển vông, không thực tế",
    "upgradeModule": {
      "simpleSentence": "Building a city on Mars is an unrealistic dream.",
      "targetSlot": "unrealistic dream",
      "academicOptions": [
        { "text": "quixotic quest", "nuance": "Một cuộc hành trình hào hiệp nhưng hoàn toàn phi thực tế.", "formalityScore": 9 },
        { "text": "idealistic", "nuance": "Lý tưởng hóa.", "formalityScore": 7 },
        { "text": "visionary", "nuance": "Tầm nhìn xa trông rộng (nghĩa tích cực).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "Quixote-", "meaning": "nhân vật Don Quixote (người hay ảo tưởng mình là hiệp sĩ chống lại cối xay gió)", "relatedWords": [] }
    }
  },
  {
    "id": "v057",
    "word": "RISIBLE",
    "ipa": "ˈrɪzəbl",
    "elo": 1400,
    "level": "expert",
    "scenario": "Bài thuyết trình nhóm RISIBLE tới mức slide 3 còn nguyên dòng 'chèn nội dung vào đây', ét o ét.",
    "translationHint": "Đáng cười, lố bịch",
    "upgradeModule": {
      "simpleSentence": "The amount of money they offered was laughable.",
      "targetSlot": "laughable",
      "academicOptions": [
        { "text": "risible excuse", "nuance": "Lời xin lỗi nực cười, lố bịch đến mức không thể tin được.", "formalityScore": 9 },
        { "text": "ludicrous", "nuance": "Lố lăng, nực cười.", "formalityScore": 9 },
        { "text": "farcical", "nuance": "Mang tính kịch hài, lố bịch.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "rid/ris-", "meaning": "cười (to laugh)", "relatedWords": [{ "word": "ridiculous", "meaning": "nực cười" }, { "word": "deride", "meaning": "chế nhạo" }] },
      "suffix": { "text": "-ible", "meaning": "có thể", "relatedWords": [] }
    }
  },
  {
    "id": "v058",
    "word": "SYCOPHANT",
    "ipa": "ˈsɪkəfənt",
    "elo": 1490,
    "level": "expert",
    "scenario": "Group lớp có một SYCOPHANT chính hiệu, cô đăng gì cũng thả tim đầu tiên kèm 'bài giảng hay quá ạ', thao túng tâm lý.",
    "translationHint": "Kẻ nịnh hót",
    "upgradeModule": {
      "simpleSentence": "He is a person who praises powerful people to get advantage.",
      "targetSlot": "person who praises powerful people",
      "academicOptions": [
        { "text": "office sycophant", "nuance": "Kẻ nịnh hót chốn công sở nhằm trục lợi cá nhân.", "formalityScore": 9 },
        { "text": "yes-man", "nuance": "Kẻ luôn đồng ý (thông tục).", "formalityScore": 5 },
        { "text": "toady", "nuance": "Kẻ bợ đỡ hèn hạ.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "syko-", "meaning": "quả sung (fig)", "relatedWords": [] },
      "suffix": { "text": "-phantes", "meaning": "người chỉ ra (shower - nguồn gốc từ việc chỉ điểm những người buôn lậu sung trái phép)", "relatedWords": [] }
    }
  },
  {
    "id": "v059",
    "word": "VITRIOLIC",
    "ipa": "vɪtriˈɒlɪk",
    "elo": 1460,
    "level": "expert",
    "scenario": "Đăng ảnh tự nấu cơm lên Threads, nhận ngay comment VITRIOLIC 'nhìn như đồ ăn cho mèo', ủa alo.",
    "translationHint": "Châm chọc, cay độc",
    "upgradeModule": {
      "simpleSentence": "The politician made a very mean attack on his opponent.",
      "targetSlot": "very mean attack",
      "academicOptions": [
        { "text": "vitriolic criticism", "nuance": "Sự chỉ trích cực kỳ cay nghiệt, có tính chất 'ăn mòn' tinh thần.", "formalityScore": 9 },
        { "text": "scathing", "nuance": "Gay gắt, nảy lửa.", "formalityScore": 8 },
        { "text": "acerbic", "nuance": "Chua cay, sắc sảo.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "vitriol-", "meaning": "axit sunfuric/dầu bóng (oil of vitriol - thứ có tính ăn mòn cực mạnh)", "relatedWords": [{ "word": "vitriol", "meaning": "lời lẽ cay độc" }] },
      "suffix": { "text": "-ic", "meaning": "tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v060",
    "word": "ABSTRUSE",
    "ipa": "æbˈstruːs",
    "elo": 1490,
    "level": "expert",
    "scenario": "Tài liệu triết thầy gửi ABSTRUSE tới mức đọc xong một trang, mình cần thêm một trang để hiểu trang đó, xỉu ngang.",
    "translationHint": "Thâm thúy, khó hiểu",
    "upgradeModule": {
      "simpleSentence": "This philosophy book is too difficult for me.",
      "targetSlot": "too difficult",
      "academicOptions": [
        { "text": "abstruse arguments", "nuance": "Những lập luận cực kỳ khó hiểu vì sự sâu xa và phức tạp của chúng.", "formalityScore": 10 },
        { "text": "esoteric", "nuance": "Chuyên sâu, ít người hiểu.", "formalityScore": 9 },
        { "text": "recondite", "nuance": "Ít được biết đến, khó nắm bắt.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ab-", "meaning": "xa rời (away)", "relatedWords": [] },
      "root": { "text": "trud/trus-", "meaning": "đẩy (to push - nghĩa là bị đẩy ra khỏi tầm hiểu biết thông thường)", "relatedWords": [{ "word": "intrude", "meaning": "xâm phạm" }, { "word": "extrude", "meaning": "ép ra" }] }
    }
  },

  // === BEGINNER (ELO 800–950) ===
  {
    "id": "v061",
    "word": "ANXIOUS",
    "ipa": "ˈæŋkʃəs",
    "elo": 810,
    "level": "beginner",
    "scenario": "Mẹ gọi đủ cả họ cả tên, chưa bắt máy mà đã ANXIOUS rà lại cả tuần mình làm gì, ét o ét.",
    "translationHint": "Lo lắng, bồn chồn",
    "upgradeModule": {
      "simpleSentence": "I am very worried about the exam.",
      "targetSlot": "very worried",
      "academicOptions": [
        { "text": "deeply anxious", "nuance": "Sự lo âu sâu sắc, thường đi kèm cảm giác bất an về kết quả.", "formalityScore": 8 },
        { "text": "apprehensive", "nuance": "E sợ điều gì đó xấu sắp xảy ra.", "formalityScore": 9 },
        { "text": "uneasy", "nuance": "Cảm giác bứt rứt, không yên lòng.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "ang/anx-", "meaning": "bóp nghẹt/siết chặt (choke/squeeze)", "relatedWords": [{ "word": "anger", "meaning": "cơn giận" }, { "word": "anguish", "meaning": "đau khổ tột cùng" }, { "word": "angina", "meaning": "đau thắt ngực" }] },
      "suffix": { "text": "-ious", "meaning": "có tính chất/đầy rẫy", "relatedWords": [] }
    }
  },
  {
    "id": "v062",
    "word": "BLUNT",
    "ipa": "blʌnt",
    "elo": 820,
    "level": "beginner",
    "scenario": "Hỏi em gái bộ này mặc đi phỏng vấn được không, nó BLUNT luôn: 'nhìn như đi đám giỗ'.",
    "translationHint": "Thẳng thắn đến mức thô lỗ",
    "upgradeModule": {
      "simpleSentence": "He was very honest and told me the truth.",
      "targetSlot": "very honest",
      "academicOptions": [
        { "text": "blunt assessment", "nuance": "Đánh giá thẳng tuột, không hề kiêng nể hay nói giảm nói tránh.", "formalityScore": 8 },
        { "text": "candid", "nuance": "Thẳng thắn, chân thành (mang nghĩa tích cực hơn).", "formalityScore": 7 },
        { "text": "forthright", "nuance": "Bộc trực, thẳng thắn.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "blunt", "meaning": "mòn/cùn (không sắc bén - ám chỉ cách nói chuyện không 'gọt giũa')", "relatedWords": [{ "word": "bluntness", "meaning": "sự cùn/thẳng thừng" }] }
    }
  },
  {
    "id": "v063",
    "word": "CAUTIOUS",
    "ipa": "ˈkɔːʃəs",
    "elo": 815,
    "level": "beginner",
    "scenario": "Đi buffet lần đầu nên CAUTIOUS lấy ít ít, no rồi mới phát hiện khu hải sản nằm ở bên kia, xu cà na.",
    "translationHint": "Thận trọng, cẩn thận",
    "upgradeModule": {
      "simpleSentence": "The driver was very careful on the icy road.",
      "targetSlot": "very careful",
      "academicOptions": [
        { "text": "cautious approach", "nuance": "Cách tiếp cận thận trọng để tránh rủi ro tiềm ẩn.", "formalityScore": 9 },
        { "text": "prudent", "nuance": "Khôn ngoan, thận trọng (thiên về quản lý tài chính/quyết định).", "formalityScore": 10 },
        { "text": "circumspect", "nuance": "Cẩn thận bằng cách xem xét mọi khía cạnh xung quanh.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "caut-", "meaning": "chăm sóc/chú ý (care/heed)", "relatedWords": [{ "word": "caution", "meaning": "sự thận trọng" }, { "word": "precaution", "meaning": "biện pháp phòng ngừa" }] },
      "suffix": { "text": "-ious", "meaning": "tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v064",
    "word": "DEMAND",
    "ipa": "dɪˈmɑːnd",
    "elo": 830,
    "level": "beginner",
    "scenario": "Bạn cùng phòng DEMAND mình tắt đèn lúc 11 giờ, trong khi nó cày phim tới 3 giờ sáng bằng loa ngoài, ủa alo.",
    "translationHint": "Yêu cầu, đòi hỏi",
    "upgradeModule": {
      "simpleSentence": "The boss asked for the report immediately.",
      "targetSlot": "asked for",
      "academicOptions": [
        { "text": "demand accountability", "nuance": "Đòi hỏi trách nhiệm giải trình một cách quyết liệt.", "formalityScore": 9 },
        { "text": "insist on", "nuance": "Khăng khăng đòi hỏi điều gì đó.", "formalityScore": 7 },
        { "text": "require", "nuance": "Yêu cầu (mang tính quy định/kỹ thuật hơn).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "de-", "meaning": "hoàn toàn/xuống (completely/down)", "relatedWords": [] },
      "root": { "text": "mand-", "meaning": "giao phó/đặt hàng (order/entrust)", "relatedWords": [{ "word": "mandatory", "meaning": "bắt buộc" }, { "word": "command", "meaning": "lệnh" }, { "word": "mandate", "meaning": "ủy thác" }] }
    }
  },
  {
    "id": "v065",
    "word": "EFFICIENT",
    "ipa": "ɪˈfɪʃnt",
    "elo": 840,
    "level": "beginner",
    "scenario": "Cách ôn thi EFFICIENT nhất của mình là đợi tới đêm cuối, áp lực tự bật não lên chế độ tua nhanh, keo lỳ.",
    "translationHint": "Hiệu quả, năng suất",
    "upgradeModule": {
      "simpleSentence": "We need a faster way to finish the project.",
      "targetSlot": "faster way",
      "academicOptions": [
        { "text": "efficient methodology", "nuance": "Phương pháp luận tối ưu hóa thời gian và nguồn lực.", "formalityScore": 9 },
        { "text": "streamlined process", "nuance": "Quy trình được tinh gọn để tăng hiệu quả.", "formalityScore": 8 },
        { "text": "cost-effective", "nuance": "Hiệu quả về mặt chi phí.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ex/ef-", "meaning": "ra ngoài (out)", "relatedWords": [] },
      "root": { "text": "fic/fac-", "meaning": "làm (to do/make)", "relatedWords": [{ "word": "fiction", "meaning": "hư cấu (thứ được tạo ra)" }, { "word": "deficient", "meaning": "thiếu hụt (làm không đủ)" }] },
      "suffix": { "text": "-ient", "meaning": "hậu tố tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v066",
    "word": "FLEXIBLE",
    "ipa": "ˈfleksəbl",
    "elo": 835,
    "level": "beginner",
    "scenario": "Lịch hẹn của nhóm bạn FLEXIBLE quá mức, hẹn 7 giờ thì 8 rưỡi đứa đầu tiên mới nhắn 'đang ra nè', real.",
    "translationHint": "Linh hoạt, dễ thích nghi",
    "upgradeModule": {
      "simpleSentence": "The rules are not strict.",
      "targetSlot": "not strict",
      "academicOptions": [
        { "text": "flexible framework", "nuance": "Một khung làm việc có thể điều chỉnh tùy theo tình huống.", "formalityScore": 9 },
        { "text": "adaptable", "nuance": "Có khả năng thích nghi tốt (thường dùng cho người).", "formalityScore": 8 },
        { "text": "malleable", "nuance": "Dễ bị uốn nắn, thay đổi (nghĩa bóng).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "flect/flex-", "meaning": "uốn cong (to bend)", "relatedWords": [{ "word": "reflect", "meaning": "phản chiếu (cong lại)" }, { "word": "deflect", "meaning": "làm chệch hướng" }, { "word": "inflection", "meaning": "biến điệu" }] },
      "suffix": { "text": "-ible", "meaning": "có thể", "relatedWords": [] }
    }
  },
  {
    "id": "v067",
    "word": "GENUINE",
    "ipa": "ˈdʒenjuɪn",
    "elo": 845,
    "level": "beginner",
    "scenario": "Lời khen GENUINE nhất tuần này là cô bán xôi nói 'dạo này con nhìn tươi ghê', chữa lành hơn đi spa.",
    "translationHint": "Thật thà, chân thành",
    "upgradeModule": {
      "simpleSentence": "Is this a real diamond?",
      "targetSlot": "real",
      "academicOptions": [
        { "text": "genuine article", "nuance": "Hàng thật, chính hãng (không phải đồ giả).", "formalityScore": 9 },
        { "text": "authentic", "nuance": "Xác thực, có nguồn gốc đáng tin cậy.", "formalityScore": 9 },
        { "text": "sincere", "nuance": "Chân thành (dùng cho cảm xúc/lời nói).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "gen-", "meaning": "sinh ra/gốc gác (birth/race)", "relatedWords": [{ "word": "generate", "meaning": "tạo ra" }, { "word": "gender", "meaning": "giới tính" }, { "word": "genealogy", "meaning": "gia phả" }] },
      "suffix": { "text": "-ine", "meaning": "thuộc về/có tính chất", "relatedWords": [{ "word": "divine", "meaning": "thần thánh" }] }
    }
  },
  {
    "id": "v068",
    "word": "HESITATE",
    "ipa": "ˈhezɪteɪt",
    "elo": 830,
    "level": "beginner",
    "scenario": "Săn sale 0 đồng thì mình không HESITATE nửa giây, còn trả lời tin nhắn crush thì soạn ba tiếng chưa gửi.",
    "translationHint": "Do dự, ngập ngừng",
    "upgradeModule": {
      "simpleSentence": "Don't stop and wait, just do it.",
      "targetSlot": "stop and wait",
      "academicOptions": [
        { "text": "without hesitation", "nuance": "Làm một cách dứt khoát, không chần chừ.", "formalityScore": 8 },
        { "text": "waver", "nuance": "Dao động, không kiên định giữa các lựa chọn.", "formalityScore": 9 },
        { "text": "vacillate", "nuance": "Lưỡng lự, thay đổi ý kiến liên tục.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "hes/her-", "meaning": "dính chặt/mắc kẹt (to stick)", "relatedWords": [{ "word": "adhere", "meaning": "dính vào" }, { "word": "coherent", "meaning": "mạch lạc (dính kết nhau)" }] },
      "suffix": { "text": "-ate", "meaning": "động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v069",
    "word": "IMPACT",
    "ipa": "ˈɪmpækt",
    "elo": 825,
    "level": "beginner",
    "scenario": "Một câu 'ăn gì cũng được' có IMPACT tới cả buổi tối, đi bốn quán vẫn chưa ai được ăn, tới công chuyện.",
    "translationHint": "Tác động, ảnh hưởng mạnh",
    "upgradeModule": {
      "simpleSentence": "His music had a big effect on many people.",
      "targetSlot": "big effect",
      "academicOptions": [
        { "text": "profound impact", "nuance": "Tác động sâu sắc, làm thay đổi căn bản vấn đề.", "formalityScore": 9 },
        { "text": "significant influence", "nuance": "Ảnh hưởng đáng kể.", "formalityScore": 8 },
        { "text": "repercussion", "nuance": "Hệ quả, tác động ngược lại (thường là xấu).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "im-", "meaning": "vào trong (into/on)", "relatedWords": [] },
      "root": { "text": "pact-", "meaning": "đóng chặt/thỏa thuận (fastened/driven)", "relatedWords": [{ "word": "pact", "meaning": "hiệp ước" }, { "word": "compact", "meaning": "nhỏ gọn/nén chặt" }] }
    }
  },
  {
    "id": "v070",
    "word": "JUSTIFY",
    "ipa": "ˈdʒʌstɪfaɪ",
    "elo": 850,
    "level": "beginner",
    "scenario": "Mua đôi giày thứ tư trong tháng rồi tự JUSTIFY là đầu tư cho đôi chân, đúng chuẩn báo thủ ví tiền.",
    "translationHint": "Biện minh, thanh minh",
    "upgradeModule": {
      "simpleSentence": "Can you give a reason for your behavior?",
      "targetSlot": "give a reason for",
      "academicOptions": [
        { "text": "justify the expenditure", "nuance": "Chứng minh sự chi tiêu là hợp lý và cần thiết.", "formalityScore": 9 },
        { "text": "legitimize", "nuance": "Hợp pháp hóa, làm cho chính đáng.", "formalityScore": 10 },
        { "text": "rationalize", "nuance": "Hợp lý hóa (đôi khi mang nghĩa tự huyễn hoặc).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "jus-", "meaning": "luật/đúng đắn (law/right)", "relatedWords": [{ "word": "justice", "meaning": "công lý" }, { "word": "injury", "meaning": "chấn thương (làm sai luật tự nhiên)" }] },
      "suffix": { "text": "-fy", "meaning": "làm cho (to make)", "relatedWords": [{ "word": "simplify", "meaning": "đơn giản hóa" }, { "word": "clarify", "meaning": "làm rõ" }] }
    }
  },
  {
    "id": "v071",
    "word": "KEEN",
    "ipa": "kiːn",
    "elo": 835,
    "level": "beginner",
    "scenario": "Lớp trưởng KEEN tổ chức đi biển lắm, tạo group, làm bình chọn, riêng tin nhắn thu tiền là không ai rep, chằm zn.",
    "translationHint": "Hăng hái, nhiệt tình",
    "upgradeModule": {
      "simpleSentence": "He is very interested in learning English.",
      "targetSlot": "very interested",
      "academicOptions": [
        { "text": "keen interest", "nuance": "Sự quan tâm cực kỳ mãnh liệt và sắc bén.", "formalityScore": 7 },
        { "text": "enthusiastic", "nuance": "Nhiệt tình, hăng hái.", "formalityScore": 8 },
        { "text": "avid", "nuance": "Khao khát, say mê (thường dùng cho sở thích).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "keen", "meaning": "sắc bén (sharp - ám chỉ trí tuệ hoặc giác quan sắc sảo)", "relatedWords": [{ "word": "keenness", "meaning": "sự sắc bén" }] }
    }
  },
  {
    "id": "v072",
    "word": "LOGICAL",
    "ipa": "ˈlɒdʒɪkl",
    "elo": 840,
    "level": "beginner",
    "scenario": "Mượn tiền đi lẩu, hứa trả bằng tiền tiết kiệm được nhờ ăn lẩu ở nhà, nghe LOGICAL mà sai sai, thao túng tâm lý.",
    "translationHint": "Hợp lý, theo logic",
    "upgradeModule": {
      "simpleSentence": "The conclusion was based on facts.",
      "targetSlot": "based on facts",
      "academicOptions": [
        { "text": "logical progression", "nuance": "Một chuỗi diễn tiến hợp lý, bước sau dựa trên bước trước.", "formalityScore": 9 },
        { "text": "rational", "nuance": "Dựa trên lý trí.", "formalityScore": 8 },
        { "text": "coherent", "nuance": "Mạch lạc, kết nối chặt chẽ.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "log-", "meaning": "lời nói/lý lẽ (word/reason)", "relatedWords": [{ "word": "dialogue", "meaning": "đối thoại" }, { "word": "logarithm", "meaning": "logarit" }, { "word": "apology", "meaning": "lời xin lỗi" }] },
      "suffix": { "text": "-ical", "meaning": "thuộc về", "relatedWords": [] }
    }
  },
  {
    "id": "v073",
    "word": "MASSIVE",
    "ipa": "ˈmæsɪv",
    "elo": 820,
    "level": "beginner",
    "scenario": "Đặt online gấu bông 'size lớn', hàng tới MASSIVE tới mức phòng trọ phải chọn giữ gấu hay giữ giường, u là trời.",
    "translationHint": "Khổng lồ, to lớn",
    "upgradeModule": {
      "simpleSentence": "There was a very big explosion.",
      "targetSlot": "very big",
      "academicOptions": [
        { "text": "massive scale", "nuance": "Quy mô cực kỳ lớn, mang tính vĩ mô.", "formalityScore": 9 },
        { "text": "enormous", "nuance": "To lớn, khổng lồ.", "formalityScore": 7 },
        { "text": "colossal", "nuance": "Cực kỳ vĩ đại (như những bức tượng khổng lồ).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "mass-", "meaning": "khối/đám đông (lump/crowd)", "relatedWords": [{ "word": "mass", "meaning": "khối lượng" }, { "word": "amass", "meaning": "tích lũy" }] },
      "suffix": { "text": "-ive", "meaning": "tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v074",
    "word": "NEGLECT",
    "ipa": "nɪˈɡlekt",
    "elo": 855,
    "level": "beginner",
    "scenario": "Cày rank cả tuần nên NEGLECT luôn chậu sen đá, nghe nói sen đá khó chết mà nó vẫn bỏ mình đi.",
    "translationHint": "Bỏ bê, xao nhãng",
    "upgradeModule": {
      "simpleSentence": "He didn't pay attention to his duties.",
      "targetSlot": "didn't pay attention to",
      "academicOptions": [
        { "text": "neglect obligations", "nuance": "Bỏ bê các nghĩa vụ bắt buộc.", "formalityScore": 9 },
        { "text": "disregard", "nuance": "Coi thường, không thèm để ý đến.", "formalityScore": 8 },
        { "text": "overlook", "nuance": "Vô tình bỏ sót.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "neg-", "meaning": "không (not)", "relatedWords": [{ "word": "negative", "meaning": "tiêu cực" }] },
      "root": { "text": "leg-", "meaning": "chọn/thu thập (to pick up/choose)", "relatedWords": [{ "word": "select", "meaning": "lựa chọn" }, { "word": "eligible", "meaning": "đủ tư cách (được chọn)" }] }
    }
  },
  {
    "id": "v075",
    "word": "OBVIOUS",
    "ipa": "ˈɒbviəs",
    "elo": 815,
    "level": "beginner",
    "scenario": "Nó bảo 'tao với ổng chỉ là bạn' mà ngày nào cũng ăn trưa chung, OBVIOUS tới mức cả lớp ăn cơm chó.",
    "translationHint": "Rõ ràng, hiển nhiên",
    "upgradeModule": {
      "simpleSentence": "The answer is very easy to see.",
      "targetSlot": "easy to see",
      "academicOptions": [
        { "text": "it is glaringly obvious", "nuance": "Rõ ràng một cách chói mắt, không thể chối cãi.", "formalityScore": 8 },
        { "text": "evident", "nuance": "Hiển nhiên qua bằng chứng.", "formalityScore": 9 },
        { "text": "manifest", "nuance": "Lộ rõ, biểu hiện rõ ràng.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob-", "meaning": "đối diện/ngang qua (against/in front of)", "relatedWords": [] },
      "root": { "text": "via-", "meaning": "con đường (way)", "relatedWords": [{ "word": "via", "meaning": "thông qua" }, { "word": "deviate", "meaning": "chệch đường" }, { "word": "trivial", "meaning": "tầm thường (nơi ngã ba đường)" }] },
      "suffix": { "text": "-ous", "meaning": "tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v076",
    "word": "PERSISTENT",
    "ipa": "pəˈsɪstənt",
    "elo": 860,
    "level": "beginner",
    "scenario": "Con mèo PERSISTENT thật, đóng cửa phòng là nó cào tới khi mở, mở rồi thì nó lại khum vào.",
    "translationHint": "Kiên trì, dai dẳng",
    "upgradeModule": {
      "simpleSentence": "He kept trying until he won.",
      "targetSlot": "kept trying",
      "academicOptions": [
        { "text": "persistent effort", "nuance": "Nỗ lực bền bỉ bất chấp khó khăn kéo dài.", "formalityScore": 9 },
        { "text": "tenacious", "nuance": "Ngoan cường, bám trụ (như keo dính).", "formalityScore": 10 },
        { "text": "relentless", "nuance": "Không ngừng nghỉ, không nao núng.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "per-", "meaning": "xuyên suốt/hoàn toàn (throughout)", "relatedWords": [{ "word": "perfect", "meaning": "hoàn hảo" }] },
      "root": { "text": "sist-", "meaning": "đứng (to stand)", "relatedWords": [{ "word": "resist", "meaning": "chống lại (đứng ngược lại)" }, { "word": "assist", "meaning": "hỗ trợ (đứng cạnh)" }, { "word": "exist", "meaning": "tồn tại (đứng ra ngoài)" }] },
      "suffix": { "text": "-ent", "meaning": "tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v077",
    "word": "RELEVANT",
    "ipa": "ˈreləvənt",
    "elo": 845,
    "level": "beginner",
    "scenario": "Hỏi bạn 'thi xong chưa', nó gửi lại ba cái meme mèo khóc, chẳng RELEVANT gì mà hiểu kết quả luôn.",
    "translationHint": "Liên quan, phù hợp",
    "upgradeModule": {
      "simpleSentence": "This information is connected to our topic.",
      "targetSlot": "connected to",
      "academicOptions": [
        { "text": "highly relevant", "nuance": "Liên quan mật thiết đến vấn đề đang thảo luận.", "formalityScore": 9 },
        { "text": "pertinent", "nuance": "Đúng trọng tâm, liên quan trực tiếp.", "formalityScore": 10 },
        { "text": "applicable", "nuance": "Có thể áp dụng được.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "re-", "meaning": "lần nữa/ngược lại", "relatedWords": [] },
      "root": { "text": "lev-", "meaning": "nâng lên (to raise)", "relatedWords": [{ "word": "elevate", "meaning": "nâng cao" }, { "word": "alleviate", "meaning": "làm nhẹ bớt" }, { "word": "levitate", "meaning": "bay bổng" }] },
      "suffix": { "text": "-ant", "meaning": "tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v078",
    "word": "SIGNIFICANT",
    "ipa": "sɪɡˈnɪfɪkənt",
    "elo": 850,
    "level": "beginner",
    "scenario": "Chuyển qua phòng trọ có máy lạnh là thay đổi SIGNIFICANT: ngủ ngon hẳn, còn hóa đơn điện thì tỉnh cả ngủ.",
    "translationHint": "Quan trọng, đáng kể",
    "upgradeModule": {
      "simpleSentence": "There is a big difference between the two products.",
      "targetSlot": "big difference",
      "academicOptions": [
        { "text": "significant shift", "nuance": "Một sự thay đổi lớn và mang tính bước ngoặt.", "formalityScore": 9 },
        { "text": "substantial", "nuance": "Đáng kể (về lượng hoặc giá trị).", "formalityScore": 8 },
        { "text": "momentous", "nuance": "Quan trọng, có ý nghĩa lịch sử.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "sign-", "meaning": "dấu hiệu/đánh dấu (mark)", "relatedWords": [{ "word": "signal", "meaning": "tín hiệu" }, { "word": "design", "meaning": "thiết kế (đánh dấu ra)" }] },
      "suffix": { "text": "fic/fac-", "meaning": "làm (to make)", "relatedWords": [] }
    }
  },
  {
    "id": "v079",
    "word": "TOLERATE",
    "ipa": "ˈtɒləreɪt",
    "elo": 855,
    "level": "beginner",
    "scenario": "Mình TOLERATE được bạn cùng phòng ngáy, chứ vụ ăn mì xong để tô qua đêm là tới công chuyện.",
    "translationHint": "Tha thứ, chịu đựng",
    "upgradeModule": {
      "simpleSentence": "I can't put up with his bad temper anymore.",
      "targetSlot": "put up with",
      "academicOptions": [
        { "text": "zero tolerance policy", "nuance": "Chính sách không khoan nhượng đối với sai phạm.", "formalityScore": 10 },
        { "text": "endure", "nuance": "Cam chịu, chịu đựng gian khổ.", "formalityScore": 8 },
        { "text": "brook", "nuance": "Chịu đựng (thường dùng trong câu phủ định, rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "toler-", "meaning": "chịu đựng/gánh vác (to bear/endure)", "relatedWords": [{ "word": "tolerable", "meaning": "có thể chịu được" }, { "word": "intolerant", "meaning": "không khoan dung" }] },
      "suffix": { "text": "-ate", "meaning": "động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v080",
    "word": "UTILIZE",
    "ipa": "ˈjuːtɪlaɪz",
    "elo": 860,
    "level": "beginner",
    "scenario": "Biết UTILIZE từng voucher freeship, mã giảm 10k với xu tích điểm, đơn 300 nghìn còn đúng 87 nghìn, slay.",
    "translationHint": "Sử dụng, tận dụng",
    "upgradeModule": {
      "simpleSentence": "We should use all the available tools.",
      "targetSlot": "use",
      "academicOptions": [
        { "text": "utilize resources effectively", "nuance": "Tận dụng nguồn lực một cách có chiến lược và hiệu quả.", "formalityScore": 9 },
        { "text": "employ", "nuance": "Sử dụng, thuê mướn.", "formalityScore": 7 },
        { "text": "harness", "nuance": "Khai thác sức mạnh (thường dùng cho năng lượng/tiềm năng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "uti-", "meaning": "sử dụng (to use)", "relatedWords": [{ "word": "utility", "meaning": "tiện ích" }, { "word": "usury", "meaning": "cho vay nặng lãi (dùng tiền sai cách)" }] },
      "suffix": { "text": "-ize", "meaning": "động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v081",
    "word": "VALID",
    "ipa": "ˈvælɪd",
    "elo": 840,
    "level": "beginner",
    "scenario": "Đưa thẻ sinh viên hết hạn hai năm để xin giảm giá, chị thu ngân nhìn kỹ rồi nói 'hết VALID rồi em ơi'.",
    "translationHint": "Hợp lệ, có cơ sở",
    "upgradeModule": {
      "simpleSentence": "Is your ticket still good for today?",
      "targetSlot": "good",
      "academicOptions": [
        { "text": "valid concern", "nuance": "Mối quan ngại chính đáng và có cơ sở.", "formalityScore": 8 },
        { "text": "legitimate", "nuance": "Hợp pháp, chính đáng.", "formalityScore": 9 },
        { "text": "sound", "nuance": "Vững chãi, có lập luận chặt chẽ (sound logic).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "val-", "meaning": "mạnh mẽ/giá trị (strong/worth)", "relatedWords": [{ "word": "value", "meaning": "giá trị" }, { "word": "prevalent", "meaning": "phổ biến (mạnh vượt trội)" }, { "word": "valor", "meaning": "sự dũng cảm" }] }
    }
  },
  {
    "id": "v082",
    "word": "WILLING",
    "ipa": "ˈwɪlɪŋ",
    "elo": 830,
    "level": "beginner",
    "scenario": "Nhắn group 'ai WILLING đi chợ mua đồ lẩu nè', ba mươi người seen, đúng một đứa thả like.",
    "translationHint": "Sẵn lòng, tự nguyện",
    "upgradeModule": {
      "simpleSentence": "Are you ready to help us?",
      "targetSlot": "ready",
      "academicOptions": [
        { "text": "willingness to learn", "nuance": "Sự sẵn lòng học hỏi (một đức tính quý báu).", "formalityScore": 7 },
        { "text": "amenable", "nuance": "Dễ bảo, sẵn lòng tuân theo.", "formalityScore": 9 },
        { "text": "inclined", "nuance": "Có xu hướng muốn làm gì đó.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "will-", "meaning": "ý muốn (desire/will)", "relatedWords": [{ "word": "willpower", "meaning": "nghị lực" }] },
      "suffix": { "text": "-ing", "meaning": "tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v083",
    "word": "ABSTRACT",
    "ipa": "ˈæbstrækt",
    "elo": 870,
    "level": "beginner",
    "scenario": "Hỏi crush thích kiểu người nào, nhận câu trả lời ABSTRACT 'ai có vibe dễ chịu', nghe xong vẫn chưa biết nên sửa mình từ đâu.",
    "translationHint": "Trừu tượng",
    "upgradeModule": {
      "simpleSentence": "The idea is not clear and hard to understand.",
      "targetSlot": "not clear and hard to understand",
      "academicOptions": [
        { "text": "abstract concept", "nuance": "Khái niệm trừu tượng, không thể cầm nắm hay quan sát trực tiếp.", "formalityScore": 9 },
        { "text": "theoretical", "nuance": "Mang tính lý thuyết.", "formalityScore": 8 },
        { "text": "intangible", "nuance": "Vô hình, không thể chạm vào.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ab-", "meaning": "xa/từ (away)", "relatedWords": [] },
      "root": { "text": "tract-", "meaning": "kéo (to pull - kéo ra khỏi thực tế cụ thể)", "relatedWords": [{ "word": "attract", "meaning": "thu hút" }, { "word": "extract", "meaning": "chiết xuất" }, { "word": "distract", "meaning": "làm xao nhãng" }] }
    }
  },
  {
    "id": "v084",
    "word": "BENEFIT",
    "ipa": "ˈbenɪfɪt",
    "elo": 825,
    "level": "beginner",
    "scenario": "BENEFIT lớn nhất ở công ty đầu tiên là máy lạnh mát, còn lương thì đủ mua cà phê để ngồi máy lạnh.",
    "translationHint": "Lợi ích, phúc lợi",
    "upgradeModule": {
      "simpleSentence": "Exercising is good for your health.",
      "targetSlot": "good for",
      "academicOptions": [
        { "text": "reap the benefits", "nuance": "Gặt hái những thành quả/lợi ích tốt đẹp.", "formalityScore": 8 },
        { "text": "advantageous", "nuance": "Có lợi.", "formalityScore": 9 },
        { "text": "perk", "nuance": "Đặc quyền, lợi ích thêm (thông dụng trong công việc).", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "bene-", "meaning": "tốt (well/good)", "relatedWords": [{ "word": "benevolent", "meaning": "nhân từ" }, { "word": "benediction", "meaning": "lời chúc phúc" }] },
      "root": { "text": "fit/fac-", "meaning": "làm (to do/make)", "relatedWords": [] }
    }
  },
  {
    "id": "v085",
    "word": "CONFIDENT",
    "ipa": "ˈkɒnfɪdənt",
    "elo": 835,
    "level": "beginner",
    "scenario": "Mặc đồ mới đi học CONFIDENT slay cả buổi sáng, trưa mới phát hiện còn nguyên cái tem giá sau lưng.",
    "translationHint": "Tự tin",
    "upgradeModule": {
      "simpleSentence": "I am sure about my answer.",
      "targetSlot": "sure",
      "academicOptions": [
        { "text": "self-confident", "nuance": "Tự tin vào khả năng bản thân.", "formalityScore": 7 },
        { "text": "assured", "nuance": "Chắc chắn, quả quyết.", "formalityScore": 9 },
        { "text": "sanguine", "nuance": "Lạc quan, tự tin (thường dùng trong tình huống khó khăn).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "con-", "meaning": "hoàn toàn (thoroughly)", "relatedWords": [] },
      "root": { "text": "fid-", "meaning": "tin tưởng (to trust)", "relatedWords": [{ "word": "fidelity", "meaning": "sự trung thành" }, { "word": "infidel", "meaning": "kẻ ngoại đạo (không tin)" }, { "word": "diffident", "meaning": "thiếu tự tin" }] },
      "suffix": { "text": "-ent", "meaning": "tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v086",
    "word": "DIVERSE",
    "ipa": "daɪˈvɜːs",
    "elo": 865,
    "level": "beginner",
    "scenario": "Tủ lạnh phòng trọ DIVERSE ghê: nửa hộp cơm, ba quả trứng, chai tương ớt và một miếng mặt nạ dưỡng da.",
    "translationHint": "Đa dạng",
    "upgradeModule": {
      "simpleSentence": "The museum has many different kinds of paintings.",
      "targetSlot": "many different kinds of",
      "academicOptions": [
        { "text": "diverse range", "nuance": "Một phạm vi đa dạng, phong phú.", "formalityScore": 9 },
        { "text": "multifaceted", "nuance": "Nhiều mặt, nhiều khía cạnh.", "formalityScore": 10 },
        { "text": "varied", "nuance": "Thay đổi, đa dạng.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "di-", "meaning": "tách ra (aside)", "relatedWords": [] },
      "root": { "text": "vers/vert-", "meaning": "xoay chuyển (to turn)", "relatedWords": [{ "word": "reverse", "meaning": "đảo ngược" }, { "word": "convert", "meaning": "chuyển đổi" }, { "word": "universe", "meaning": "vũ trụ (xoay thành một)" }] }
    }
  },
  {
    "id": "v087",
    "word": "EVIDENT",
    "ipa": "ˈevɪdənt",
    "elo": 855,
    "level": "beginner",
    "scenario": "Sau đêm chạy deadline, quầng thâm EVIDENT tới mức đồng nghiệp hỏi có phải đang thử trend makeup khói.",
    "translationHint": "Rõ ràng, hiển nhiên",
    "upgradeModule": {
      "simpleSentence": "It is clear that he is lying.",
      "targetSlot": "clear",
      "academicOptions": [
        { "text": "self-evident", "nuance": "Rõ ràng một cách tự thân, không cần chứng minh.", "formalityScore": 10 },
        { "text": "apparent", "nuance": "Rõ rệt (nhìn thấy được).", "formalityScore": 8 },
        { "text": "unmistakable", "nuance": "Không thể nhầm lẫn được.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "e-", "meaning": "ra ngoài (out)", "relatedWords": [] },
      "root": { "text": "vid/vis-", "meaning": "nhìn thấy (to see)", "relatedWords": [{ "word": "video", "meaning": "video" }, { "word": "visit", "meaning": "thăm viếng" }, { "word": "provide", "meaning": "cung cấp (nhìn thấy trước)" }] },
      "suffix": { "text": "-ent", "meaning": "tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v088",
    "word": "FOCUS",
    "ipa": "ˈfəʊkəs",
    "elo": 820,
    "level": "beginner",
    "scenario": "Định FOCUS học từ vựng hai tiếng, năm phút sau đã đứng trước tủ lạnh lần thứ ba dù không đói.",
    "translationHint": "Tập trung",
    "upgradeModule": {
      "simpleSentence": "You should pay more attention to your studies.",
      "targetSlot": "pay more attention to",
      "academicOptions": [
        { "text": "maintain focus", "nuance": "Duy trì sự tập trung cao độ.", "formalityScore": 8 },
        { "text": "concentrate", "nuance": "Tập trung tư tưởng/nguồn lực.", "formalityScore": 9 },
        { "text": "center on", "nuance": "Lấy cái gì làm trung tâm.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "focus", "meaning": "lò sưởi/điểm tụ (hearth - nơi cả gia đình tụ lại)", "relatedWords": [{ "word": "focal", "meaning": "thuộc tiêu điểm" }] }
    }
  },
  {
    "id": "v089",
    "word": "GENERATE",
    "ipa": "ˈdʒenəreɪt",
    "elo": 845,
    "level": "beginner",
    "scenario": "Đăng một tấm ảnh đi biển lên story là GENERATE ra hai chục tin nhắn hóng biến 'đi với ai đó'.",
    "translationHint": "Tạo ra",
    "upgradeModule": {
      "simpleSentence": "The wind can make electricity.",
      "targetSlot": "make",
      "academicOptions": [
        { "text": "generate revenue", "nuance": "Tạo ra doanh thu/lợi nhuận.", "formalityScore": 9 },
        { "text": "produce", "nuance": "Sản xuất, tạo ra sản phẩm.", "formalityScore": 7 },
        { "text": "spawn", "nuance": "Sản sinh ra hàng loạt (thường dùng cho tech/game).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "gen-", "meaning": "sinh ra (birth/race)", "relatedWords": [{ "word": "genesis", "meaning": "sự khởi đầu" }, { "word": "indigenous", "meaning": "bản địa (sinh ra ở đó)" }] },
      "suffix": { "text": "-ate", "meaning": "động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v090",
    "word": "HIGHLIGHT",
    "ipa": "ˈhaɪlaɪt",
    "elo": 830,
    "level": "beginner",
    "scenario": "HIGHLIGHT đám cưới chị họ là màn bốc thăm, mình trúng nồi cơm điện kèm câu hỏi 'chừng nào tới con'.",
    "translationHint": "Điểm nhấn, nổi bật",
    "upgradeModule": {
      "simpleSentence": "He pointed out the main problem.",
      "targetSlot": "pointed out",
      "academicOptions": [
        { "text": "highlight the issues", "nuance": "Làm nổi bật những vấn đề tồn đọng cần giải quyết.", "formalityScore": 8 },
        { "text": "underscore", "nuance": "Nhấn mạnh (gạch dưới).", "formalityScore": 9 },
        { "text": "accentuate", "nuance": "Làm cho nổi bật hơn, làm cho nhấn mạnh hơn.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "high-", "meaning": "cao/quan trọng", "relatedWords": [] },
      "root": { "text": "light-", "meaning": "ánh sáng (làm sáng rõ phần quan trọng)", "relatedWords": [] }
    }
  },

  // === INTERMEDIATE (ELO 950–1200) ===
  {
    "id": "v091",
    "word": "ADVOCATING",
    "ipa": "ˈædvəkeɪtɪŋ",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Cả phòng trọ đang ADVOCATING cho luật ai nấu thì người khác rửa chén, riêng đứa chỉ biết úp mì thì im re, chằm zn.",
    "translationHint": "Ủng hộ, vận động cho",
    "upgradeModule": {
      "simpleSentence": "He is supporting the use of new technology.",
      "targetSlot": "supporting",
      "academicOptions": [
        { "text": "advocating for", "nuance": "Công khai ủng hộ hoặc vận động cho một chính sách/niềm tin.", "formalityScore": 9 },
        { "text": "championing", "nuance": "Đấu tranh, bảo vệ và thúc đẩy một ý tưởng nào đó như một hiệp sĩ.", "formalityScore": 10 },
        { "text": "promoting", "nuance": "Thúc đẩy, quảng bá.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad-", "meaning": "đến/hướng tới (to/towards)", "relatedWords": [] },
      "root": { "text": "voc-", "meaning": "gọi/tiếng nói (voice/call)", "relatedWords": [{ "word": "vocal", "meaning": "thuộc về giọng nói" }, { "word": "vocation", "meaning": "nghề nghiệp (tiếng gọi của con tim)" }, { "word": "evoke", "meaning": "gợi lên" }] }
    }
  },
  {
    "id": "v092",
    "word": "AMBIVALENT",
    "ipa": "æmˈbɪvələnt",
    "elo": 980,
    "level": "intermediate",
    "scenario": "Người yêu cũ nhắn lúc nửa đêm, cảm xúc AMBIVALENT dữ lắm: vừa muốn block, vừa lowkey muốn đọc lại ba lần.",
    "translationHint": "Mâu thuẫn, vừa thích vừa ghét",
    "upgradeModule": {
      "simpleSentence": "I am not sure how I feel about the new rules.",
      "targetSlot": "not sure how I feel",
      "academicOptions": [
        { "text": "deeply ambivalent", "nuance": "Có những cảm xúc trái ngược mạnh mẽ cùng lúc về một vấn đề.", "formalityScore": 9 },
        { "text": "equivocal", "nuance": "Lập lờ, không rõ ràng (thường dùng cho thái độ/kết quả).", "formalityScore": 10 },
        { "text": "conflicted", "nuance": "Bị giằng xé giữa các lựa chọn.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ambi-", "meaning": "cả hai (both)", "relatedWords": [{ "word": "ambidextrous", "meaning": "thuận cả hai tay" }] },
      "root": { "text": "val-", "meaning": "mạnh mẽ/giá trị (worth/strong)", "relatedWords": [{ "word": "value", "meaning": "giá trị" }, { "word": "prevail", "meaning": "chiếm ưu thế" }] },
      "suffix": { "text": "-ent", "meaning": "tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v093",
    "word": "ANALOGOUS",
    "ipa": "əˈnæləɡəs",
    "elo": 1050,
    "level": "intermediate",
    "scenario": "Ôn cả học kỳ trong một đêm ANALOGOUS với việc đổ nguyên bình nước vào cái ly, sáng ra nhớ được mỗi tên môn.",
    "translationHint": "Tương tự, giống như",
    "upgradeModule": {
      "simpleSentence": "The human brain is like a computer.",
      "targetSlot": "is like",
      "academicOptions": [
        { "text": "analogous to", "nuance": "Tương tự về chức năng hoặc cấu trúc dù bản chất khác nhau.", "formalityScore": 9 },
        { "text": "comparable to", "nuance": "Có thể so sánh được (về mức độ/tầm vóc).", "formalityScore": 8 },
        { "text": "akin to", "nuance": "Hơi giống như, có họ hàng với (thường dùng cho tính chất).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ana-", "meaning": "theo/dọc theo (according to)", "relatedWords": [] },
      "root": { "text": "log-", "meaning": "lý lẽ/tỉ lệ (proportion/reason)", "relatedWords": [{ "word": "logic", "meaning": "lý luận" }, { "word": "prologue", "meaning": "lời mở đầu" }] },
      "suffix": { "text": "-ous", "meaning": "có tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v094",
    "word": "ARTICULATE",
    "ipa": "ɑːˈtɪkjʊlət",
    "elo": 1000,
    "level": "intermediate",
    "scenario": "Trong đầu có nguyên bài TED talk, lên thuyết trình ARTICULATE được đúng câu 'dạ em xin hết', toang.",
    "translationHint": "Diễn đạt lưu loát",
    "upgradeModule": {
      "simpleSentence": "He is good at expressing his ideas.",
      "targetSlot": "expressing his ideas",
      "academicOptions": [
        { "text": "highly articulate", "nuance": "Có khả năng dùng từ ngữ chuẩn xác và mạch lạc để thuyết phục.", "formalityScore": 9 },
        { "text": "eloquent", "nuance": "Hùng biện, có sức hút khi nói.", "formalityScore": 9 },
        { "text": "well-spoken", "nuance": "Nói năng có văn hóa, dễ nghe.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "art-", "meaning": "khớp nối/nghệ thuật (joint/skill)", "relatedWords": [{ "word": "article", "meaning": "bài báo/khớp nối câu" }, { "word": "artifact", "meaning": "hiện vật" }] },
      "suffix": { "text": "-ate", "meaning": "động từ/tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v095",
    "word": "ASSERTIVE",
    "ipa": "əˈsɜːtɪv",
    "elo": 970,
    "level": "intermediate",
    "scenario": "Tập cả tuần để ASSERTIVE với chủ trọ vụ tăng giá điện, gặp mặt cái tự nói 'dạ anh tính sao cũng được', hết cứu.",
    "translationHint": "Quyết đoán, tự tin khẳng định",
    "upgradeModule": {
      "simpleSentence": "You need to be confident and say what you want.",
      "targetSlot": "be confident and say what you want",
      "academicOptions": [
        { "text": "be more assertive", "nuance": "Thể hiện sự tự tin và quyết đoán mà không gây hấn.", "formalityScore": 8 },
        { "text": "authoritative", "nuance": "Có uy quyền, khiến người khác phải nghe theo.", "formalityScore": 10 },
        { "text": "decisive", "nuance": "Dứt khoát trong việc đưa ra lựa chọn.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad/as-", "meaning": "đến/hướng tới (to/towards)", "relatedWords": [] },
      "root": { "text": "sert-", "meaning": "đặt vào/ghép vào (to join/put)", "relatedWords": [{ "word": "insert", "meaning": "chèn vào" }, { "word": "desert", "meaning": "rời bỏ (không gắn kết nữa)" }, { "word": "series", "meaning": "chuỗi (các thứ nối nhau)" }] },
      "suffix": { "text": "-ive", "meaning": "có tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v096",
    "word": "BIASED",
    "ipa": "ˈbaɪəst",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Nhờ đứa bạn thân chấm outfit đi date là vô ích, nó BIASED quá, mặc bao tải nó cũng khen slay.",
    "translationHint": "Thiên vị, có thành kiến",
    "upgradeModule": {
      "simpleSentence": "The news report was not fair.",
      "targetSlot": "not fair",
      "academicOptions": [
        { "text": "heavily biased", "nuance": "Bị lệch lạc quan điểm nghiêm trọng do lợi ích cá nhân hoặc định kiến.", "formalityScore": 9 },
        { "text": "prejudiced", "nuance": "Có thành kiến sâu sắc (thường mang nghĩa tiêu cực về sắc tộc/tôn giáo).", "formalityScore": 10 },
        { "text": "partisan", "nuance": "Thiên vị cho một đảng phái hoặc phe nhóm.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "bias", "meaning": "đường chéo/xiên (slant)", "relatedWords": [{ "word": "bias", "meaning": "độ lệch (trong điện tử/thống kê)" }] }
    }
  },
  {
    "id": "v097",
    "word": "BUREAUCRATIC",
    "ipa": "ˌbjʊərəˈkrætɪk",
    "elo": 1080,
    "level": "intermediate",
    "scenario": "Xin cái giấy xác nhận sinh viên mà BUREAUCRATIC tới mức đi ba phòng, ký năm chữ, cuối cùng hẹn tuần sau, u là trời.",
    "translationHint": "Quan liêu, nhiều thủ tục",
    "upgradeModule": {
      "simpleSentence": "The system has too many rules and paperwork.",
      "targetSlot": "too many rules and paperwork",
      "academicOptions": [
        { "text": "bureaucratic red tape", "nuance": "Thủ tục hành chính rườm rà, gây chậm trễ (thuật ngữ rất hay dùng).", "formalityScore": 9 },
        { "text": "administrative burden", "nuance": "Gánh nặng hành chính.", "formalityScore": 10 },
        { "text": "cumbersome", "nuance": "Cồng kềnh, chậm chạp (cho quy trình).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "bureau-", "meaning": "văn phòng/bàn làm việc (desk)", "relatedWords": [{ "word": "bureau", "meaning": "cục/vụ" }] },
      "suffix": { "text": "-cratic", "meaning": "quyền lực/quản trị (power/rule)", "relatedWords": [{ "word": "democratic", "meaning": "dân chủ" }, { "word": "autocratic", "meaning": "độc đoán" }] }
    }
  },
  {
    "id": "v098",
    "word": "CATALYST",
    "ipa": "ˈkætəlɪst",
    "elo": 1020,
    "level": "intermediate",
    "scenario": "Bị crush seen không rep chính là CATALYST để mình đăng ký gym 6 giờ sáng, flex body là chuyện tháng sau.",
    "translationHint": "Chất xúc tác, nhân tố kích thích",
    "upgradeModule": {
      "simpleSentence": "The new law was the reason for the change.",
      "targetSlot": "reason for the change",
      "academicOptions": [
        { "text": "catalyst for change", "nuance": "Tác nhân đẩy nhanh quá trình thay đổi hoặc phản ứng.", "formalityScore": 9 },
        { "text": "impetus", "nuance": "Sức đẩy, động lực thúc đẩy.", "formalityScore": 10 },
        { "text": "trigger", "nuance": "Ngòi nổ, kích hoạt (thường dùng cho một sự kiện cụ thể).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "cata-", "meaning": "xuống/hoàn toàn (down/completely)", "relatedWords": [{ "word": "catastrophe", "meaning": "thảm họa (lật nhào xuống)" }] },
      "root": { "text": "lys-", "meaning": "nới lỏng/phân rã (loosen/dissolve)", "relatedWords": [{ "word": "analysis", "meaning": "phân tích (phân rã vấn đề)" }, { "word": "paralysis", "meaning": "liệt (nới lỏng cơ bắp quá mức)" }] }
    }
  },
  {
    "id": "v099",
    "word": "CHRONIC",
    "ipa": "ˈkrɒnɪk",
    "elo": 975,
    "level": "intermediate",
    "scenario": "Bệnh đặt 7 cái báo thức rồi tắt cả 7 của mình là CHRONIC rồi, lên 8 cái cũng khum cứu nổi.",
    "translationHint": "Mãn tính, kinh niên",
    "upgradeModule": {
      "simpleSentence": "He has a long-term back pain.",
      "targetSlot": "long-term",
      "academicOptions": [
        { "text": "chronic condition", "nuance": "Tình trạng bệnh lý hoặc vấn đề kéo dài dai dẳng không dứt.", "formalityScore": 9 },
        { "text": "persistent", "nuance": "Kiên trì, dai dẳng (có thể mang nghĩa tích cực).", "formalityScore": 8 },
        { "text": "inveterate", "nuance": "Thâm căn cố đế (thường dùng cho thói quen xấu).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "chron-", "meaning": "thời gian (time)", "relatedWords": [{ "word": "chronological", "meaning": "theo thứ tự thời gian" }, { "word": "synchronize", "meaning": "đồng bộ hóa (cùng thời gian)" }, { "word": "chronicle", "meaning": "biên niên sử" }] }
    }
  },
  {
    "id": "v100",
    "word": "COMPREHENSIVE",
    "ipa": "ˌkɒmprɪˈhensɪv",
    "elo": 990,
    "level": "intermediate",
    "scenario": "Group project kêu làm bản tóm tắt COMPREHENSIVE, nhóm trưởng gửi đúng ba gạch đầu dòng kèm chữ 'tự hiểu nha', báo thủ.",
    "translationHint": "Toàn diện, bao quát",
    "upgradeModule": {
      "simpleSentence": "We need a full and detailed plan.",
      "targetSlot": "full and detailed",
      "academicOptions": [
        { "text": "comprehensive review", "nuance": "Đánh giá toàn diện mọi khía cạnh, không bỏ sót chi tiết nào.", "formalityScore": 9 },
        { "text": "exhaustive", "nuance": "Thấu đáo, làm đến mức kiệt cùng (exhausted).", "formalityScore": 10 },
        { "text": "all-encompassing", "nuance": "Bao trùm tất cả mọi thứ.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "com-", "meaning": "cùng nhau/hoàn toàn (together)", "relatedWords": [] },
      "root": { "text": "prehend-", "meaning": "nắm lấy (to seize/grasp)", "relatedWords": [{ "word": "apprehend", "meaning": "bắt giữ/hiểu" }, { "word": "comprehend", "meaning": "thấu hiểu (nắm hết vào đầu)" }] },
      "suffix": { "text": "-ive", "meaning": "có tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v101",
    "word": "CONTENTIOUS",
    "ipa": "kənˈtenʃəs",
    "elo": 1060,
    "level": "intermediate",
    "scenario": "Trà sữa bao nhiêu phần trăm đường là chủ đề CONTENTIOUS nhất group chat, lỡ nói 100% là bị kick liền, real.",
    "translationHint": "Gây tranh cãi",
    "upgradeModule": {
      "simpleSentence": "Abortion is a very controversial topic.",
      "targetSlot": "controversial",
      "academicOptions": [
        { "text": "highly contentious issue", "nuance": "Vấn đề gây chia rẽ mạnh mẽ và dẫn đến tranh cãi gay gắt.", "formalityScore": 9 },
        { "text": "polemical", "nuance": "Mang tính bút chiến, công kích quan điểm.", "formalityScore": 10 },
        { "text": "disputed", "nuance": "Đang bị tranh chấp, chưa được thống nhất.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "con-", "meaning": "cùng nhau (với người khác)", "relatedWords": [] },
      "root": { "text": "tend/tent-", "meaning": "căng ra/vươn tới (to stretch)", "relatedWords": [{ "word": "contend", "meaning": "đấu tranh/khẳng định" }, { "word": "tension", "meaning": "sự căng thẳng" }, { "word": "extend", "meaning": "kéo dài" }] },
      "suffix": { "text": "-ious", "meaning": "đầy rẫy/tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v102",
    "word": "COUNTERPRODUCTIVE",
    "ipa": "ˌkaʊntəprəˈdʌktɪv",
    "elo": 1100,
    "level": "intermediate",
    "scenario": "Thức tới 4 giờ sáng ôn thi rồi ngủ quên luôn giờ thi, đúng chuẩn COUNTERPRODUCTIVE, u là trời.",
    "translationHint": "Phản tác dụng",
    "upgradeModule": {
      "simpleSentence": "Too much exercise can be bad for your health.",
      "targetSlot": "bad for your health",
      "academicOptions": [
        { "text": "counterproductive", "nuance": "Đưa ra kết quả ngược lại với mục đích ban đầu.", "formalityScore": 9 },
        { "text": "self-defeating", "nuance": "Tự làm hại mình, tự chuốc lấy thất bại.", "formalityScore": 9 },
        { "text": "detrimental", "nuance": "Gây hại cho tiến trình.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "counter-", "meaning": "ngược lại (against/opposite)", "relatedWords": [{ "word": "counter-attack", "meaning": "phản công" }, { "word": "counterpart", "meaning": "bên đối tác" }] },
      "root": { "text": "product-", "meaning": "sản phẩm/kết quả (lead forward)", "relatedWords": [] }
    }
  },
  {
    "id": "v103",
    "word": "CREDIBLE",
    "ipa": "ˈkredɪbl",
    "elo": 980,
    "level": "intermediate",
    "scenario": "Shop online toàn feedback năm sao mà ảnh nào cũng cùng một bàn tay, nhìn khum CREDIBLE xíu nào.",
    "translationHint": "Đáng tin",
    "upgradeModule": {
      "simpleSentence": "We need a believable witness.",
      "targetSlot": "believable",
      "academicOptions": [
        { "text": "credible source", "nuance": "Nguồn thông tin đáng tin cậy, có thẩm quyền.", "formalityScore": 9 },
        { "text": "trustworthy", "nuance": "Đáng tin (thiên về tính cách con người).", "formalityScore": 7 },
        { "text": "plausible", "nuance": "Nghe có vẻ hợp lý.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "cred-", "meaning": "tin tưởng (believe)", "relatedWords": [{ "word": "credit", "meaning": "tín dụng" }, { "word": "incredible", "meaning": "không thể tin được" }, { "word": "creed", "meaning": "tín ngưỡng" }] },
      "suffix": { "text": "-ible", "meaning": "có thể", "relatedWords": [] }
    }
  },
  {
    "id": "v104",
    "word": "CUMULATIVE",
    "ipa": "ˈkjuːmjʊlətɪv",
    "elo": 1040,
    "level": "intermediate",
    "scenario": "Mỗi ngày một ly trà sữa 35k nghe nhỏ xíu, nhưng con số CUMULATIVE tới cuối tháng là ví ét o ét.",
    "translationHint": "Tích lũy, dồn lại",
    "upgradeModule": {
      "simpleSentence": "The total effect of the changes is big.",
      "targetSlot": "total effect",
      "academicOptions": [
        { "text": "cumulative impact", "nuance": "Tác động dồn nén, tăng dần qua thời gian.", "formalityScore": 9 },
        { "text": "aggregated", "nuance": "Được tổng hợp từ nhiều nguồn.", "formalityScore": 10 },
        { "text": "accrued", "nuance": "Được tích lũy dần (thường dùng cho tiền lãi hoặc lợi ích).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "cumul-", "meaning": "chồng lên/đống (heap/pile)", "relatedWords": [{ "word": "accumulate", "meaning": "tích tụ" }, { "word": "cumulus", "meaning": "mây tích" }] },
      "suffix": { "text": "-ative", "meaning": "có tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v105",
    "word": "CYNICAL",
    "ipa": "ˈsɪnɪkl",
    "elo": 965,
    "level": "intermediate",
    "scenario": "Sau ba lần bị bùng kèo, giờ group rủ đi Đà Lạt là mình CYNICAL liền: hết delulu rồi, chắc lại nói cho vui.",
    "translationHint": "Hoài nghi, yếm thế",
    "upgradeModule": {
      "simpleSentence": "He is very suspicious of people's motives.",
      "targetSlot": "suspicious of people's motives",
      "academicOptions": [
        { "text": "cynical outlook", "nuance": "Cái nhìn tiêu cực, tin rằng mọi người làm việc chỉ vì lợi ích cá nhân.", "formalityScore": 8 },
        { "text": "misanthropic", "nuance": "Ghét con người, lánh đời.", "formalityScore": 10 },
        { "text": "skeptical", "nuance": "Hoài nghi (mang tính khoa học, khách quan hơn).", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "cyn-", "meaning": "chó (dog - bắt nguồn từ triết học Cynicism, những người sống đơn giản như chó)", "relatedWords": [{ "word": "cynic", "meaning": "người hay chỉ trích" }] },
      "suffix": { "text": "-ical", "meaning": "thuộc về", "relatedWords": [] }
    }
  },
  {
    "id": "v106",
    "word": "DECISIVE",
    "ipa": "dɪˈsaɪsɪv",
    "elo": 970,
    "level": "intermediate",
    "scenario": "Chọn món ở quán mất 15 phút mà đổi chuyên ngành thì DECISIVE ghê, nghĩ đúng một đêm là nộp đơn, ra đường tôi nể mỗi bạn.",
    "translationHint": "Quyết đoán",
    "upgradeModule": {
      "simpleSentence": "The general made a quick and firm move.",
      "targetSlot": "quick and firm",
      "academicOptions": [
        { "text": "decisive action", "nuance": "Hành động dứt khoát, mang tính giải quyết triệt để vấn đề.", "formalityScore": 9 },
        { "text": "conclusive", "nuance": "Mang tính kết luận, chấm dứt mọi nghi ngờ.", "formalityScore": 10 },
        { "text": "resolute", "nuance": "Kiên quyết, kiên định.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "de-", "meaning": "xuống/hoàn toàn (completely/off)", "relatedWords": [] },
      "root": { "text": "cis-", "meaning": "cắt (to cut - nghĩa là cắt đứt sự phân vân)", "relatedWords": [{ "word": "concise", "meaning": "ngắn gọn (cắt bớt)" }, { "word": "incisor", "meaning": "răng cửa (để cắt)" }, { "word": "precise", "meaning": "chính xác (được cắt gọt kỹ)" }] },
      "suffix": { "text": "-ive", "meaning": "tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v107",
    "word": "DETRIMENTAL",
    "ipa": "ˌdetrɪˈmentl",
    "elo": 1030,
    "level": "intermediate",
    "scenario": "Nằm lướt TikTok tư thế con tôm cả đêm cực kỳ DETRIMENTAL cho cái cổ, sáng dậy quay đầu như robot, tới công chuyện.",
    "translationHint": "Có hại, bất lợi",
    "upgradeModule": {
      "simpleSentence": "Smoking is bad for your lungs.",
      "targetSlot": "bad for",
      "academicOptions": [
        { "text": "highly detrimental to", "nuance": "Cực kỳ gây hại hoặc gây bất lợi cho sự phát triển.", "formalityScore": 9 },
        { "text": "deleterious", "nuance": "Có hại (rất trang trọng).", "formalityScore": 10 },
        { "text": "pernicious", "nuance": "Độc hại một cách âm thầm.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "detri-", "meaning": "mòn/chà xát (to wear away/rub)", "relatedWords": [{ "word": "detritus", "meaning": "mảnh vụn/đống rác" }, { "word": "trite", "meaning": "tầm thường (bị dùng mòn rồi)" }] },
      "suffix": { "text": "-mental", "meaning": "hậu tố tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v108",
    "word": "DYNAMIC",
    "ipa": "daɪˈnæmɪk",
    "elo": 955,
    "level": "intermediate",
    "scenario": "Đi làm năm nhất mới hiểu môi trường DYNAMIC nghĩa là sáng một yêu cầu, chiều đổi hai lần, tối hỏi sao chưa xong.",
    "translationHint": "Năng động, thay đổi liên tục",
    "upgradeModule": {
      "simpleSentence": "We work in a fast-changing market.",
      "targetSlot": "fast-changing",
      "academicOptions": [
        { "text": "dynamic environment", "nuance": "Môi trường đầy biến động, đòi hỏi sự thích nghi liên tục.", "formalityScore": 8 },
        { "text": "volatile", "nuance": "Dễ biến động (thường dùng cho chứng khoán/hóa chất).", "formalityScore": 9 },
        { "text": "vibrant", "nuance": "Sống động, đầy sức sống.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "dynam-", "meaning": "sức mạnh/năng lượng (power)", "relatedWords": [{ "word": "dynamite", "meaning": "thuốc nổ" }, { "word": "dynamo", "meaning": "máy phát điện" }, { "word": "thermodynamics", "meaning": "nhiệt động lực học" }] },
      "suffix": { "text": "-ic", "meaning": "thuộc về", "relatedWords": [] }
    }
  },
  {
    "id": "v109",
    "word": "ELABORATE",
    "ipa": "ɪˈlæbərət",
    "elo": 990,
    "level": "intermediate",
    "scenario": "Crush nhắn 'mình cần nói chuyện', xin ELABORATE thêm thì nó bảo 'mai nói', đêm đó ét o ét luôn.",
    "translationHint": "Giải thích chi tiết",
    "upgradeModule": {
      "simpleSentence": "The plan was very detailed.",
      "targetSlot": "very detailed",
      "academicOptions": [
        { "text": "elaborate scheme", "nuance": "Một kế hoạch cực kỳ chi tiết, công phu (đôi khi mang nghĩa lừa đảo).", "formalityScore": 9 },
        { "text": "explicate", "nuance": "Phân tích tỉ mỉ một lý thuyết.", "formalityScore": 10 },
        { "text": "flesh out", "nuance": "Thêm chi tiết vào một khung sườn có sẵn.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "e-", "meaning": "ra ngoài (out)", "relatedWords": [] },
      "root": { "text": "labor-", "meaning": "lao động/công sức (work)", "relatedWords": [{ "word": "laboratory", "meaning": "phòng thí nghiệm" }, { "word": "laborious", "meaning": "cần cù/khó nhọc" }] },
      "suffix": { "text": "-ate", "meaning": "động từ/tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v110",
    "word": "EMPIRICAL",
    "ipa": "ɪmˈpɪrɪkl",
    "elo": 1070,
    "level": "intermediate",
    "scenario": "Bằng chứng EMPIRICAL sau ba năm ở trọ: cứ mở nắp ly mì là chủ trọ gõ cửa thu tiền điện, xu cà na.",
    "translationHint": "Dựa trên thực tế, thực nghiệm",
    "upgradeModule": {
      "simpleSentence": "The theory is based on real experience.",
      "targetSlot": "based on real experience",
      "academicOptions": [
        { "text": "empirical evidence", "nuance": "Bằng chứng thu được từ quan sát thực tế hoặc thí nghiệm, thay vì lý thuyết.", "formalityScore": 10 },
        { "text": "evidence-based", "nuance": "Dựa trên bằng chứng rõ ràng.", "formalityScore": 9 },
        { "text": "first-hand", "nuance": "Trực tiếp, tận mắt thấy.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "empeir-", "meaning": "kinh nghiệm/thử nghiệm (experience)", "relatedWords": [{ "word": "expert", "meaning": "chuyên gia (người có kinh nghiệm)" }, { "word": "experience", "meaning": "kinh nghiệm" }] },
      "suffix": { "text": "-ical", "meaning": "thuộc về", "relatedWords": [] }
    }
  },
  {
    "id": "v111",
    "word": "EXPLICIT",
    "ipa": "ɪkˈsplɪsɪt",
    "elo": 1000,
    "level": "intermediate",
    "scenario": "Ủa alo, đã nói EXPLICIT là tao không ăn hành, nó vẫn gọi bánh mì full hành rồi bảo tưởng giỡn.",
    "translationHint": "Rõ ràng, dứt khoát",
    "upgradeModule": {
      "simpleSentence": "The instructions were very clear.",
      "targetSlot": "clear",
      "academicOptions": [
        { "text": "explicit instructions", "nuance": "Hướng dẫn cực kỳ chi tiết, không để lại chút nghi ngờ nào.", "formalityScore": 9 },
        { "text": "unambiguous", "nuance": "Không mơ hồ, chỉ có một cách hiểu.", "formalityScore": 10 },
        { "text": "specific", "nuance": "Cụ thể.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ex-", "meaning": "ra ngoài (out)", "relatedWords": [] },
      "root": { "text": "plic-", "meaning": "gấp (to fold - nghĩa là mở các nếp gấp ra cho rõ ràng)", "relatedWords": [{ "word": "complicate", "meaning": "phức tạp (gấp lại cùng nhau)" }, { "word": "imply", "meaning": "ẩn ý (gấp vào trong)" }, { "word": "replica", "meaning": "bản sao (gấp lại lần nữa)" }] }
    }
  },
  {
    "id": "v112",
    "word": "FORMIDABLE",
    "ipa": "ˈfɔːmɪdəbl",
    "elo": 1050,
    "level": "intermediate",
    "scenario": "Đối thủ FORMIDABLE nhất mùa săn sale không phải người khác, mà là cái app lag đúng lúc 0 giờ, hết cứu.",
    "translationHint": "Đáng gờm",
    "upgradeModule": {
      "simpleSentence": "He is a very strong opponent.",
      "targetSlot": "very strong",
      "academicOptions": [
        { "text": "formidable opponent", "nuance": "Đối thủ gây ra sự sợ hãi hoặc nể trọng vì sức mạnh/kỹ năng vượt trội.", "formalityScore": 9 },
        { "text": "intimidating", "nuance": "Đáng sợ, làm người khác mất tự tin.", "formalityScore": 8 },
        { "text": "invincible", "nuance": "Bất khả chiến bại.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "formid-", "meaning": "sợ hãi (fear)", "relatedWords": [{ "word": "formidability", "meaning": "sự đáng gờm" }] },
      "suffix": { "text": "-able", "meaning": "có thể (đáng để)", "relatedWords": [] }
    }
  },
  {
    "id": "v113",
    "word": "FRAGMENTED",
    "ipa": "ˈfræɡməntɪd",
    "elo": 1020,
    "level": "intermediate",
    "scenario": "Giấc ngủ ở trọ FRAGMENTED cỡ này: 1 giờ phòng bên hát karaoke, 3 giờ mèo đánh nhau, 5 giờ gà gáy, u là trời.",
    "translationHint": "Phân mảnh, rời rạc",
    "upgradeModule": {
      "simpleSentence": "The market is broken into small parts.",
      "targetSlot": "broken into small parts",
      "academicOptions": [
        { "text": "highly fragmented market", "nuance": "Thị trường bị xé nhỏ, không có đơn vị nào chiếm ưu thế tuyệt đối.", "formalityScore": 9 },
        { "text": "disjointed", "nuance": "Rời rạc, không kết nối tốt.", "formalityScore": 8 },
        { "text": "atomized", "nuance": "Bị chia nhỏ đến mức cực đoan.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "frag/frac-", "meaning": "vỡ/gãy (to break)", "relatedWords": [{ "word": "fraction", "meaning": "phân số" }, { "word": "fracture", "meaning": "vết gãy xương" }, { "word": "fragile", "meaning": "dễ vỡ" }] },
      "suffix": { "text": "-ed", "meaning": "quá khứ phân từ (bị...)", "relatedWords": [] }
    }
  },
  {
    "id": "v114",
    "word": "FUNDAMENTAL",
    "ipa": "ˌfʌndəˈmentl",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Đi làm năm nhất mới thấy kỹ năng FUNDAMENTAL nhất là gật gù như hiểu trong cuộc họp, còn lại học sau, real.",
    "translationHint": "Cơ bản, thiết yếu",
    "upgradeModule": {
      "simpleSentence": "This is a basic rule of economics.",
      "targetSlot": "basic",
      "academicOptions": [
        { "text": "fundamental principle", "nuance": "Nguyên tắc cốt lõi, là nền tảng cho mọi thứ khác.", "formalityScore": 9 },
        { "text": "rudimentary", "nuance": "Sơ đẳng, thô sơ.", "formalityScore": 8 },
        { "text": "underlying", "nuance": "Nằm bên dưới, là căn nguyên.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "fund-", "meaning": "đáy/nền tảng (bottom)", "relatedWords": [{ "word": "foundation", "meaning": "nền móng" }, { "word": "profound", "meaning": "sâu sắc (đến tận đáy)" }, { "word": "fund", "meaning": "quỹ (nền tảng tài chính)" }] }
    }
  },
  {
    "id": "v115",
    "word": "HYPOTHETICAL",
    "ipa": "ˌhaɪpəˈθetɪkl",
    "elo": 1080,
    "level": "intermediate",
    "scenario": "Câu hỏi HYPOTHETICAL thôi nha: nếu mày trúng Vietlott thì có trả tao 200k tháng trước khum?",
    "translationHint": "Giả định, giả thuyết",
    "upgradeModule": {
      "simpleSentence": "Let's think about an imaginary situation.",
      "targetSlot": "imaginary situation",
      "academicOptions": [
        { "text": "hypothetical scenario", "nuance": "Một kịch bản được đưa ra dựa trên giả thuyết để phân tích.", "formalityScore": 10 },
        { "text": "theoretical", "nuance": "Mang tính lý thuyết.", "formalityScore": 8 },
        { "text": "supposed", "nuance": "Được cho là (nhưng chưa chắc chắn).", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "hypo-", "meaning": "ở dưới (under)", "relatedWords": [{ "word": "hypothermia", "meaning": "hạ thân nhiệt" }] },
      "root": { "text": "the-", "meaning": "đặt/để (to place - nghĩa là đặt một nền móng bên dưới để lập luận)", "relatedWords": [{ "word": "thesis", "meaning": "luận điểm" }, { "word": "theme", "meaning": "chủ đề" }] }
    }
  },
  {
    "id": "v116",
    "word": "IMPLICIT",
    "ipa": "ɪmˈplɪsɪt",
    "elo": 1040,
    "level": "intermediate",
    "scenario": "Mẹ nhắn 'Tết này về dẫn ai về cũng được', lời nhắc IMPLICIT nặng ký nhất năm, ok mom.",
    "translationHint": "Ngầm định, ẩn ý",
    "upgradeModule": {
      "simpleSentence": "The message was hidden in the text.",
      "targetSlot": "hidden",
      "academicOptions": [
        { "text": "implicit bias", "nuance": "Định kiến ngầm, không tự nhận thức được.", "formalityScore": 10 },
        { "text": "tacit", "nuance": "Ngầm hiểu, không cần nói ra (tacit agreement).", "formalityScore": 10 },
        { "text": "inherent", "nuance": "Vốn có sẵn bên trong.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "im-", "meaning": "vào trong (in)", "relatedWords": [] },
      "root": { "text": "plic-", "meaning": "gấp (to fold - nghĩa là gấp vào bên trong, không phô ra ngoài)", "relatedWords": [{ "word": "complicit", "meaning": "đồng lõa" }, { "word": "duplicate", "meaning": "nhân bản (gấp đôi)" }] }
    }
  },
  {
    "id": "v117",
    "word": "INDISPENSABLE",
    "ipa": "ˌɪndɪˈspensəbl",
    "elo": 1090,
    "level": "intermediate",
    "scenario": "Cục sạc dự phòng là món INDISPENSABLE khi đi concert, mất nó là mất luôn cơ hội đăng story flex.",
    "translationHint": "Không thể thiếu",
    "upgradeModule": {
      "simpleSentence": "Water is very important for life.",
      "targetSlot": "very important",
      "academicOptions": [
        { "text": "indispensable to", "nuance": "Thiết yếu đến mức không thể bỏ qua hoặc thay thế được.", "formalityScore": 9 },
        { "text": "essential", "nuance": "Cần thiết.", "formalityScore": 7 },
        { "text": "integral", "nuance": "Là một phần không thể tách rời để tạo nên tổng thể.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "không (not)", "relatedWords": [] },
      "root": { "text": "dispens-", "meaning": "phân phát/bỏ qua (to weigh out/assign - dispense with: bỏ qua)", "relatedWords": [{ "word": "dispensary", "meaning": "phòng phát thuốc" }, { "word": "pension", "meaning": "lương hưu (được cân đo trả dần)" }] },
      "suffix": { "text": "-able", "meaning": "có thể (đáng để)", "relatedWords": [] }
    }
  },
  {
    "id": "v118",
    "word": "INTEGRATE",
    "ipa": "ˈɪntɪɡreɪt",
    "elo": 970,
    "level": "intermediate",
    "scenario": "Bạn cùng phòng đòi INTEGRATE lịch tắm vào Google Calendar, ai trễ năm phút là bị tag lên group, ô dề thật.",
    "translationHint": "Tích hợp",
    "upgradeModule": {
      "simpleSentence": "The company wants to combine the two systems.",
      "targetSlot": "combine",
      "academicOptions": [
        { "text": "seamlessly integrate", "nuance": "Tích hợp một cách mượt mà, không thấy vết nối.", "formalityScore": 9 },
        { "text": "incorporate", "nuance": "Kết hợp vào thành một thực thể.", "formalityScore": 9 },
        { "text": "assimilate", "nuance": "Đồng hóa, làm cho hòa nhập hoàn toàn.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "integr-", "meaning": "toàn bộ/nguyên vẹn (whole)", "relatedWords": [{ "word": "integrity", "meaning": "sự chính trực/nguyên vẹn" }, { "word": "integer", "meaning": "số nguyên" }, { "word": "integral", "meaning": "phần thiết yếu" }] },
      "suffix": { "text": "-ate", "meaning": "hậu tố động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v119",
    "word": "INTUITIVE",
    "ipa": "ɪnˈtjuːɪtɪv",
    "elo": 1010,
    "level": "intermediate",
    "scenario": "Máy giặt chung ở trọ có 14 nút mà chẳng nút nào INTUITIVE, cả xóm giặt đồ bằng niềm tin với manifest.",
    "translationHint": "Trực quan, dễ hiểu",
    "upgradeModule": {
      "simpleSentence": "The software is easy to use.",
      "targetSlot": "easy to use",
      "academicOptions": [
        { "text": "intuitive interface", "nuance": "Giao diện dễ hiểu đến mức dùng theo bản năng, không cần hướng dẫn.", "formalityScore": 8 },
        { "text": "user-friendly", "nuance": "Thân thiện với người dùng (thông dụng).", "formalityScore": 6 },
        { "text": "instinctive", "nuance": "Mang tính bản năng.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "vào trong (into)", "relatedWords": [] },
      "root": { "text": "tuit/tuit-", "meaning": "nhìn/trông nom (to look/guard)", "relatedWords": [{ "word": "tutor", "meaning": "gia sư (người trông nom việc học)" }, { "word": "tuition", "meaning": "học phí" }] },
      "suffix": { "text": "-ive", "meaning": "tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v120",
    "word": "LEVERAGE",
    "ipa": "ˈliːvərɪdʒ",
    "elo": 1000,
    "level": "intermediate",
    "scenario": "Biết bà chủ quán quý mình nên LEVERAGE triệt để, gọi ly 25k mà topping như ly 40k, nước đi keo lỳ.",
    "translationHint": "Tận dụng lợi thế",
    "upgradeModule": {
      "simpleSentence": "We should use our brand name to sell more products.",
      "targetSlot": "use",
      "academicOptions": [
        { "text": "leverage assets", "nuance": "Sử dụng các tài sản/lợi thế có sẵn như một đòn bẩy để đạt kết quả lớn hơn.", "formalityScore": 9 },
        { "text": "capitalize on", "nuance": "Tận dụng triệt để một cơ hội để kiếm lời.", "formalityScore": 10 },
        { "text": "exploit", "nuance": "Khai thác (có thể mang nghĩa tiêu cực nếu dùng cho con người).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "lever-", "meaning": "đòn bẩy/nâng lên (to raise)", "relatedWords": [{ "word": "lever", "meaning": "cái cần gạt" }, { "word": "elevate", "meaning": "nâng lên" }, { "word": "levity", "meaning": "sự khinh suất (nhẹ tênh)" }] },
      "suffix": { "text": "-age", "meaning": "hậu tố danh từ chỉ hành động/kết quả", "relatedWords": [] }
    }
  },
  {
    "id": "v121",
    "word": "MODICUM",
    "ipa": "ˈmɒdɪkəm",
    "elo": 1030,
    "level": "intermediate",
    "scenario": "Ủa alo, chỉ xin một MODICUM tôn trọng thôi: ăn mì của tao thì ít ra chừa lại gói gia vị.",
    "translationHint": "Một chút, lượng nhỏ tối thiểu",
    "upgradeModule": {
      "simpleSentence": "He has a small amount of common sense.",
      "targetSlot": "small amount",
      "academicOptions": [
        { "text": "modicum of", "nuance": "Một lượng nhỏ bé, thường dùng cho các giá trị trừu tượng (lòng tin, sự thật).", "formalityScore": 9 },
        { "text": "iota", "nuance": "Một chút ít (thường dùng trong câu phủ định).", "formalityScore": 9 },
        { "text": "fragment", "nuance": "Mảnh vỡ, phần nhỏ.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "mod-", "meaning": "đo lường/chừng mực (measure)", "relatedWords": [{ "word": "moderate", "meaning": "vừa phải" }, { "word": "mode", "meaning": "chế độ/cách thức" }, { "word": "modify", "meaning": "sửa đổi (cho đúng mực)" }] }
    }
  },
  {
    "id": "v122",
    "word": "MOMENTUM",
    "ipa": "məˈmentəm",
    "elo": 990,
    "level": "intermediate",
    "scenario": "Đang có MOMENTUM dọn phòng ngon lành thì lục ra album ảnh cũ, ngồi chữa lành tới tối, phòng vẫn y nguyên.",
    "translationHint": "Đà tiến, sức đẩy",
    "upgradeModule": {
      "simpleSentence": "The campaign is getting more speed.",
      "targetSlot": "getting more speed",
      "academicOptions": [
        { "text": "gaining momentum", "nuance": "Đang trên đà phát triển mạnh mẽ và khó dừng lại.", "formalityScore": 8 },
        { "text": "impetus", "nuance": "Sức đẩy, động lực thúc đẩy ban đầu.", "formalityScore": 10 },
        { "text": "traction", "nuance": "Sự bám trụ/bắt đầu có tiến triển (thường dùng cho startup).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "mov/mo-", "meaning": "di chuyển (to move)", "relatedWords": [{ "word": "motion", "meaning": "chuyển động" }, { "word": "mobile", "meaning": "di động" }, { "word": "moment", "meaning": "khoảnh khắc (sự di chuyển của thời gian)" }] },
      "suffix": { "text": "-tum", "meaning": "hậu tố danh từ chỉ trạng thái/vật thể", "relatedWords": [{ "word": "stratum", "meaning": "tầng lớp" }] }
    }
  },
  {
    "id": "v123",
    "word": "MONOTONOUS",
    "ipa": "məˈnɒtənəs",
    "elo": 975,
    "level": "intermediate",
    "scenario": "Thực tập tháng đầu MONOTONOUS cỡ nào? Ngày nào cũng nhập Excel, tối mơ thấy mình là ô B12, chằm zn.",
    "translationHint": "Đơn điệu, tẻ nhạt",
    "upgradeModule": {
      "simpleSentence": "His voice was very boring and the same all the time.",
      "targetSlot": "boring and the same",
      "academicOptions": [
        { "text": "monotonous tone", "nuance": "Giọng nói đều đều, đơn điệu gây buồn ngủ.", "formalityScore": 8 },
        { "text": "humdrum", "nuance": "Tẻ nhạt, tầm thường (thường dùng cho cuộc sống hằng ngày).", "formalityScore": 7 },
        { "text": "prosaic", "nuance": "Chán ngắt, thiếu tính sáng tạo/thơ mộng.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "mono-", "meaning": "một (single/one)", "relatedWords": [{ "word": "monopoly", "meaning": "độc quyền" }, { "word": "monologue", "meaning": "độc thoại" }] },
      "root": { "text": "ton-", "meaning": "âm điệu/tiếng (tone/sound)", "relatedWords": [{ "word": "intonation", "meaning": "ngữ điệu" }, { "word": "baritone", "meaning": "giọng nam trung" }] },
      "suffix": { "text": "-ous", "meaning": "tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v124",
    "word": "NAVIGATE",
    "ipa": "ˈnævɪɡeɪt",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Lần đầu NAVIGATE chợ Bến Thành không có Google Maps, đi một vòng quay về đúng chỗ bán móc khóa, hết cứu.",
    "translationHint": "Điều hướng, tìm cách vượt qua",
    "upgradeModule": {
      "simpleSentence": "He helped me find the way through the complex rules.",
      "targetSlot": "find the way through",
      "academicOptions": [
        { "text": "navigate the complexities", "nuance": "Tìm cách xoay xở vượt qua những vấn đề phức tạp.", "formalityScore": 9 },
        { "text": "maneuver", "nuance": "Điều khiển, lèo lái một cách khéo léo.", "formalityScore": 10 },
        { "text": "steer through", "nuance": "Lèo lái con tàu vượt qua (thường dùng cho tình huống khó).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "nav-", "meaning": "tàu (ship)", "relatedWords": [{ "word": "navy", "meaning": "hải quân" }, { "word": "naval", "meaning": "thuộc về hải quân" }] },
      "suffix": { "text": "ig-", "meaning": "lái/đi (to drive/do)", "relatedWords": [{ "word": "agent", "meaning": "người đại diện" }] }
    }
  },
  {
    "id": "v125",
    "word": "OBJECTIVE",
    "ipa": "əbˈdʒektɪv",
    "elo": 950,
    "level": "intermediate",
    "scenario": "Nói OBJECTIVE nha, ảnh thẻ của mày đâu có xấu, chỉ là nhìn như vừa thức ba đêm chạy deadline thôi.",
    "translationHint": "Khách quan, mục tiêu",
    "upgradeModule": {
      "simpleSentence": "Try to look at the situation without being personal.",
      "targetSlot": "without being personal",
      "academicOptions": [
        { "text": "remain objective", "nuance": "Giữ thái độ khách quan, dựa trên sự thật thay vì cảm xúc.", "formalityScore": 9 },
        { "text": "impartial", "nuance": "Công tâm, không thiên vị.", "formalityScore": 10 },
        { "text": "unbiased", "nuance": "Không định kiến.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob-", "meaning": "đối diện/hướng tới (towards/against)", "relatedWords": [] },
      "root": { "text": "ject-", "meaning": "ném (to throw - nghĩa là ném vật thể ra xa để quan sát rõ)", "relatedWords": [{ "word": "reject", "meaning": "từ chối (ném ngược lại)" }, { "word": "project", "meaning": "dự án (ném về phía trước)" }, { "word": "eject", "meaning": "đẩy ra" }] }
    }
  },
  {
    "id": "v126",
    "word": "OVERWHELMING",
    "ipa": "ˌəʊvəˈwelmɪŋ",
    "elo": 980,
    "level": "intermediate",
    "scenario": "Mở app ngân hàng sau 11.11 thấy sao kê dài ba trang, cảm giác OVERWHELMING tới mức xỉu ngang tại chỗ.",
    "translationHint": "Choáng ngợp, quá tải",
    "upgradeModule": {
      "simpleSentence": "The work is too much for me to handle.",
      "targetSlot": "too much for me to handle",
      "academicOptions": [
        { "text": "overwhelming workload", "nuance": "Khối lượng công việc quá lớn gây áp lực cực độ.", "formalityScore": 8 },
        { "text": "staggering", "nuance": "Gây sửng sốt, choáng váng (về con số hoặc quy mô).", "formalityScore": 10 },
        { "text": "formidable", "nuance": "Khó khăn đáng gờm.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "over-", "meaning": "quá mức/trên đầu", "relatedWords": [] },
      "root": { "text": "whelm-", "meaning": "nhấn chìm/lật úp (to submerge/turn over)", "relatedWords": [{ "word": "whelm", "meaning": "nhấn chìm (từ cổ)" }] }
    }
  },
  {
    "id": "v127",
    "word": "PARADOX",
    "ipa": "ˈpærədɒks",
    "elo": 1050,
    "level": "intermediate",
    "scenario": "PARADOX của tuổi 22: có thời gian thì không có tiền, có tiền thì bị deadline giữ chân, real.",
    "translationHint": "Nghịch lý",
    "upgradeModule": {
      "simpleSentence": "It is a strange situation that seems impossible but is true.",
      "targetSlot": "strange situation",
      "academicOptions": [
        { "text": "apparent paradox", "nuance": "Một nghịch lý hiển nhiên nhưng chứa đựng sự thật ngầm định.", "formalityScore": 9 },
        { "text": "oxymoron", "nuance": "Sự kết hợp từ ngữ mâu thuẫn (như 'hòa bình tàn khốc').", "formalityScore": 10 },
        { "text": "contradiction", "nuance": "Sự mâu thuẫn trái ngược.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "para-", "meaning": "bên cạnh/trái lại (beside/contrary)", "relatedWords": [{ "word": "parallel", "meaning": "song song" }, { "word": "paramilitary", "meaning": "bán quân sự" }] },
      "root": { "text": "dox-", "meaning": "ý kiến/niềm tin (belief/opinion)", "relatedWords": [{ "word": "orthodox", "meaning": "chính thống (ý kiến đúng)" }, { "word": "dogma", "meaning": "giáo điều" }] }
    }
  },
  {
    "id": "v128",
    "word": "PERCEIVE",
    "ipa": "pəˈsiːv",
    "elo": 1010,
    "level": "intermediate",
    "scenario": "Đứa bạn PERCEIVE dấu chấm trong tin 'ok.' như lời tuyên chiến, nên giờ cả group nhắn tin khỏi chấm câu, ô dề.",
    "translationHint": "Nhận thức, cảm nhận",
    "upgradeModule": {
      "simpleSentence": "People think of him as a great leader.",
      "targetSlot": "think of him as",
      "academicOptions": [
        { "text": "perceive as", "nuance": "Nhìn nhận hoặc cảm nhận ai đó/cái gì đó theo một cách cụ thể.", "formalityScore": 9 },
        { "text": "regard as", "nuance": "Xem như là, coi là.", "formalityScore": 8 },
        { "text": "envisage", "nuance": "Hình dung, tưởng tượng ra.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "per-", "meaning": "hoàn toàn/xuyên suốt", "relatedWords": [] },
      "root": { "text": "ceive-", "meaning": "nắm lấy (to take/seize)", "relatedWords": [{ "word": "receive", "meaning": "nhận (lấy về)" }, { "word": "conceive", "meaning": "hình thành ý tưởng" }, { "word": "deceive", "meaning": "lừa dối (lấy đi niềm tin)" }] }
    }
  },
  {
    "id": "v129",
    "word": "PERPETUAL",
    "ipa": "pəˈpetʃuəl",
    "elo": 1060,
    "level": "intermediate",
    "scenario": "Sinh viên năm ba sống trong trạng thái PERPETUAL thiếu ngủ, ngủ trưa hai tiếng dậy vẫn hỏi nay thứ mấy.",
    "translationHint": "Liên tục, vĩnh cửu",
    "upgradeModule": {
      "simpleSentence": "They live in a state of never-ending war.",
      "targetSlot": "never-ending",
      "academicOptions": [
        { "text": "perpetual motion", "nuance": "Chuyển động vĩnh cửu, không bao giờ dừng lại.", "formalityScore": 9 },
        { "text": "incessant", "nuance": "Liên miên không dứt (thường mang nghĩa gây khó chịu).", "formalityScore": 9 },
        { "text": "everlasting", "nuance": "Trường tồn, mãi mãi.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "per-", "meaning": "xuyên suốt", "relatedWords": [] },
      "root": { "text": "pet-", "meaning": "lao tới/yêu cầu (to seek/go to)", "relatedWords": [{ "word": "petition", "meaning": "đơn kiến nghị" }, { "word": "compete", "meaning": "cạnh tranh (cùng lao tới)" }] },
      "suffix": { "text": "-ual", "meaning": "tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v130",
    "word": "PREVALENT",
    "ipa": "ˈprevələnt",
    "elo": 1020,
    "level": "intermediate",
    "scenario": "Trend quay 'một ngày của tôi' PREVALENT tới mức đứa bạn fomo quay luôn cảnh ngủ gục ở thư viện.",
    "translationHint": "Phổ biến, thịnh hành",
    "upgradeModule": {
      "simpleSentence": "Smoking is common among teenagers.",
      "targetSlot": "common",
      "academicOptions": [
        { "text": "widely prevalent", "nuance": "Lan rộng và cực kỳ phổ biến tại một thời điểm hoặc khu vực.", "formalityScore": 9 },
        { "text": "ubiquitous", "nuance": "Có mặt ở khắp mọi nơi.", "formalityScore": 10 },
        { "text": "rife with", "nuance": "Tràn lan (thường dùng cho tệ nạn/tiêu cực).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "pre-", "meaning": "trước/vượt trội (before)", "relatedWords": [] },
      "root": { "text": "val-", "meaning": "mạnh mẽ/giá trị (strong/worth)", "relatedWords": [{ "word": "value", "meaning": "giá trị" }, { "word": "valid", "meaning": "có giá trị" }, { "word": "valor", "meaning": "dũng cảm" }] },
      "suffix": { "text": "-ent", "meaning": "tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v131",
    "word": "PROACTIVE",
    "ipa": "ˌprəʊˈæktɪv",
    "elo": 975,
    "level": "intermediate",
    "scenario": "Đứa PROACTIVE nhất nhóm là đứa tạo file Drive đầu tiên, rồi biến mất tới ngày thuyết trình, báo thủ đúng nghĩa.",
    "translationHint": "Chủ động",
    "upgradeModule": {
      "simpleSentence": "You should take action before problems happen.",
      "targetSlot": "take action before problems happen",
      "academicOptions": [
        { "text": "take a proactive stance", "nuance": "Giữ vững lập trường chủ động giải quyết vấn đề từ sớm.", "formalityScore": 9 },
        { "text": "preemptive", "nuance": "Đón đầu, hành động trước để ngăn chặn.", "formalityScore": 10 },
        { "text": "anticipatory", "nuance": "Mang tính dự báo và chuẩn bị trước.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "pro-", "meaning": "về phía trước/trước (forward/before)", "relatedWords": [{ "word": "progress", "meaning": "tiến bộ" }, { "word": "promote", "meaning": "thúc đẩy" }] },
      "root": { "text": "act-", "meaning": "làm (to do)", "relatedWords": [{ "word": "action", "meaning": "hành động" }, { "word": "react", "meaning": "phản ứng (làm ngược lại)" }] }
    }
  },
  {
    "id": "v132",
    "word": "PROFOUND",
    "ipa": "prəˈfaʊnd",
    "elo": 1040,
    "level": "intermediate",
    "scenario": "Chú xe ôm bảo 'xe hư thì sửa, tuổi trẻ thì không', câu nói PROFOUND tới mức mình ngồi im lố nhà, chữa lành.",
    "translationHint": "Sâu sắc, thâm thúy",
    "upgradeModule": {
      "simpleSentence": "The book has a very deep meaning.",
      "targetSlot": "very deep",
      "academicOptions": [
        { "text": "profound implications", "nuance": "Những hệ quả sâu sắc, tác động lâu dài và rộng lớn.", "formalityScore": 9 },
        { "text": "insightful", "nuance": "Sâu sắc, sáng suốt (thiên về sự thấu hiểu).", "formalityScore": 8 },
        { "text": "fathomless", "nuance": "Sâu không đáy (nghĩa đen và bóng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "pro-", "meaning": "phía trước", "relatedWords": [] },
      "root": { "text": "found/fund-", "meaning": "đáy (bottom)", "relatedWords": [{ "word": "foundation", "meaning": "nền móng" }, { "word": "fundamental", "meaning": "cơ bản" }, { "word": "fund", "meaning": "quỹ (nền tài chính)" }] }
    }
  },
  {
    "id": "v133",
    "word": "RATIONAL",
    "ipa": "ˈræʃnəl",
    "elo": 965,
    "level": "intermediate",
    "scenario": "Mua áo khoác thứ năm vì đang giảm 50%, tự thao túng tâm lý bằng lý do nghe RATIONAL lắm, cho tới khi tủ đồ không đóng lại được.",
    "translationHint": "Hợp lý, dựa trên lý trí",
    "upgradeModule": {
      "simpleSentence": "Make a choice based on logic, not emotions.",
      "targetSlot": "based on logic",
      "academicOptions": [
        { "text": "rational decision-making", "nuance": "Quá trình ra quyết định dựa trên suy luận logic và dữ liệu.", "formalityScore": 9 },
        { "text": "reasonable", "nuance": "Hợp tình hợp lý (mềm mỏng hơn rational).", "formalityScore": 7 },
        { "text": "judicious", "nuance": "Sáng suốt, khôn ngoan.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "rat-", "meaning": "tính toán/lý lẽ (to calculate/reason)", "relatedWords": [{ "word": "ratio", "meaning": "tỉ lệ" }, { "word": "ratify", "meaning": "phê chuẩn (cho là hợp lý)" }, { "word": "rate", "meaning": "đánh giá/tốc độ" }] }
    }
  },
  {
    "id": "v134",
    "word": "SKEPTICAL",
    "ipa": "ˈskeptɪkl",
    "elo": 990,
    "level": "intermediate",
    "scenario": "Tin tuyển dụng ghi 'việc nhẹ lương 20 triệu, không cần kinh nghiệm', red flag to đùng, ai tỉnh cũng SKEPTICAL.",
    "translationHint": "Hoài nghi, ngờ vực",
    "upgradeModule": {
      "simpleSentence": "I don't really believe what he said.",
      "targetSlot": "don't really believe",
      "academicOptions": [
        { "text": "highly skeptical of", "nuance": "Rất ngờ vực và đòi hỏi bằng chứng xác thực mới tin.", "formalityScore": 9 },
        { "text": "dubious", "nuance": "Mơ hồ, đáng ngờ.", "formalityScore": 9 },
        { "text": "cynical", "nuance": "Hoài nghi vì cho rằng ai cũng có mục đích xấu.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "skept-", "meaning": "quan sát/xem xét kỹ (to look out/examine)", "relatedWords": [{ "word": "skepticism", "meaning": "chủ nghĩa hoài nghi" }] }
    }
  },
  {
    "id": "v135",
    "word": "SPONTANEOUS",
    "ipa": "spɒnˈteɪniəs",
    "elo": 1000,
    "level": "intermediate",
    "scenario": "Chuyến đi Vũng Tàu SPONTANEOUS lúc 11 giờ đêm, sáng ra cả đám ngồi ngắm biển còn ví thì toang.",
    "translationHint": "Ngẫu hứng, bột phát",
    "upgradeModule": {
      "simpleSentence": "He made a quick decision without planning.",
      "targetSlot": "without planning",
      "academicOptions": [
        { "text": "spontaneous reaction", "nuance": "Phản ứng tự nhiên, bột phát ngay lập tức.", "formalityScore": 8 },
        { "text": "impromptu", "nuance": "Ứng khẩu, không chuẩn bị trước (thường dùng cho bài phát biểu).", "formalityScore": 10 },
        { "text": "unpremeditated", "nuance": "Không tính toán trước (thường dùng trong pháp lý).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "sponte-", "meaning": "tự nguyện (of one's own accord)", "relatedWords": [{ "word": "sponsor", "meaning": "nhà tài trợ (người tự nguyện cam kết)" }] }
    }
  },
  {
    "id": "v136",
    "word": "SUBJECTIVE",
    "ipa": "səbˈdʒektɪv",
    "elo": 975,
    "level": "intermediate",
    "scenario": "Cái đẹp là SUBJECTIVE, nên tóc nhuộm tím của mày được cả họ bình luận đủ 7 kiểu dịp Tết, hết cứu.",
    "translationHint": "Chủ quan",
    "upgradeModule": {
      "simpleSentence": "That is just your personal opinion.",
      "targetSlot": "personal opinion",
      "academicOptions": [
        { "text": "highly subjective", "nuance": "Rất mang tính cá nhân, phụ thuộc vào sở thích/định kiến riêng.", "formalityScore": 9 },
        { "text": "biased", "nuance": "Thiên vị.", "formalityScore": 7 },
        { "text": "impressionistic", "nuance": "Dựa trên ấn tượng cá nhân thay vì phân tích kỹ.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "sub-", "meaning": "dưới (under)", "relatedWords": [] },
      "root": { "text": "ject-", "meaning": "ném (to throw - nghĩa là ném cái 'tôi' vào vật thể quan sát)", "relatedWords": [{ "word": "subject", "meaning": "chủ thể/môn học (thứ đặt ở dưới để bàn luận)" }] }
    }
  },
  {
    "id": "v137",
    "word": "SUSTAINABLE",
    "ipa": "səˈsteɪnəbl",
    "elo": 955,
    "level": "intermediate",
    "scenario": "Ăn mì gói 30 ngày để mua vé concert nghe slay thật, nhưng chẳng SUSTAINABLE gì với cái bao tử của mày.",
    "translationHint": "Bền vững",
    "upgradeModule": {
      "simpleSentence": "We need a plan that can last a long time.",
      "targetSlot": "can last a long time",
      "academicOptions": [
        { "text": "sustainable development", "nuance": "Phát triển bền vững, không làm cạn kiệt tài nguyên tương lai.", "formalityScore": 9 },
        { "text": "viable", "nuance": "Có khả năng tồn tại và phát triển độc lập.", "formalityScore": 9 },
        { "text": "enduring", "nuance": "Lâu dài, kiên cường.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "sub-", "meaning": "từ dưới lên", "relatedWords": [] },
      "root": { "text": "tain-", "meaning": "giữ (to hold)", "relatedWords": [{ "word": "maintain", "meaning": "duy trì" }, { "word": "contain", "meaning": "chứa đựng" }, { "word": "retain", "meaning": "giữ lại" }] }
    }
  },
  {
    "id": "v138",
    "word": "TRANSPARENT",
    "ipa": "trænsˈpærənt",
    "elo": 970,
    "level": "intermediate",
    "scenario": "Quỹ lớp cần TRANSPARENT hơn nha, thu 100k mỗi đứa mà cuối kỳ chỉ thấy một bịch hướng dương, check var gấp.",
    "translationHint": "Minh bạch",
    "upgradeModule": {
      "simpleSentence": "The process should be clear for everyone to see.",
      "targetSlot": "clear for everyone to see",
      "academicOptions": [
        { "text": "transparent governance", "nuance": "Sự quản trị minh bạch, công khai mọi thông tin.", "formalityScore": 9 },
        { "text": "lucid", "nuance": "Sáng sủa, rõ ràng.", "formalityScore": 10 },
        { "text": "candid", "nuance": "Thẳng thắn.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "trans-", "meaning": "xuyên qua (across/through)", "relatedWords": [{ "word": "transfer", "meaning": "chuyển giao" }, { "word": "transport", "meaning": "vận tải" }] },
      "root": { "text": "par-", "meaning": "xuất hiện/trông thấy (to appear)", "relatedWords": [{ "word": "appear", "meaning": "xuất hiện" }, { "word": "apparent", "meaning": "rõ rệt" }] }
    }
  },
  {
    "id": "v139",
    "word": "TRIVIAL",
    "ipa": "ˈtrɪviəl",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Cãi nhau 3 tiếng với người yêu vì chuyện TRIVIAL là ăn bún hay phở, cuối cùng đi ăn cơm tấm, rồi bắt cả group ăn cơm chó.",
    "translationHint": "Tầm thường, vụn vặt",
    "upgradeModule": {
      "simpleSentence": "It's just a small and unimportant problem.",
      "targetSlot": "small and unimportant",
      "academicOptions": [
        { "text": "trivial matter", "nuance": "Vấn đề vụn vặt, không đáng để bận tâm.", "formalityScore": 8 },
        { "text": "insignificant", "nuance": "Không đáng kể.", "formalityScore": 9 },
        { "text": "trifling", "nuance": "Nhỏ nhen, tầm thường (rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "tri-", "meaning": "ba (three)", "relatedWords": [] },
      "root": { "text": "via-", "meaning": "con đường (way - nghĩa là nơi ngã ba đường, nơi mọi người tán gẫu chuyện phiếm)", "relatedWords": [{ "word": "via", "meaning": "thông qua" }, { "word": "deviate", "meaning": "chệch hướng" }] }
    }
  },
  {
    "id": "v140",
    "word": "UNPRECEDENTED",
    "ipa": "ʌnˈpresɪdentɪd",
    "elo": 1070,
    "level": "intermediate",
    "scenario": "Thằng keo kiệt nhất xóm trọ bỗng bao cả phòng trà sữa, sự kiện UNPRECEDENTED tới mức cả đám phải check var.",
    "translationHint": "Chưa từng có tiền lệ",
    "upgradeModule": {
      "simpleSentence": "This has never happened before.",
      "targetSlot": "never happened before",
      "academicOptions": [
        { "text": "unprecedented growth", "nuance": "Sự tăng trưởng chưa từng thấy trong lịch sử.", "formalityScore": 10 },
        { "text": "unparalleled", "nuance": "Vô song, không gì sánh bằng.", "formalityScore": 10 },
        { "text": "novel", "nuance": "Mới lạ, độc đáo.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "un-", "meaning": "không (not)", "relatedWords": [] },
      "root": { "text": "precedent-", "meaning": "tiền lệ (đi trước)", "relatedWords": [{ "word": "precede", "meaning": "đi trước" }, { "word": "recede", "meaning": "lùi lại" }] }
    }
  },
  {
    "id": "v141",
    "word": "VULNERABLE",
    "ipa": "ˈvʌlnərəbl",
    "elo": 1010,
    "level": "intermediate",
    "scenario": "Ba giờ sáng nghe nhạc buồn là lúc mình VULNERABLE nhất, một cái story của người cũ cũng đủ khóc, chằm zn.",
    "translationHint": "Dễ bị tổn thương",
    "upgradeModule": {
      "simpleSentence": "The old house is weak against the storm.",
      "targetSlot": "weak against",
      "academicOptions": [
        { "text": "highly vulnerable to", "nuance": "Cực kỳ yếu thế và dễ bị gây hại bởi tác động bên ngoài.", "formalityScore": 9 },
        { "text": "susceptible to", "nuance": "Dễ bị ảnh hưởng (thường dùng cho bệnh tật/tâm lý).", "formalityScore": 9 },
        { "text": "exposed", "nuance": "Bị phơi bày ra, không được bảo vệ.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "vulner-", "meaning": "vết thương (wound)", "relatedWords": [{ "word": "vulnerable", "meaning": "có thể bị thương" }] },
      "suffix": { "text": "-able", "meaning": "có thể", "relatedWords": [] }
    }
  },
  {
    "id": "v142",
    "word": "WARRANTED",
    "ipa": "ˈwɒrəntɪd",
    "elo": 1080,
    "level": "intermediate",
    "scenario": "Nỗi lo của mẹ hoàn toàn WARRANTED: con nói đi Đà Lạt 'tiết kiệm' mà story toàn quán cà phê view đồi, check var là lộ.",
    "translationHint": "Có cơ sở, được cho phép",
    "upgradeModule": {
      "simpleSentence": "The extra cost is justified by the quality.",
      "targetSlot": "justified",
      "academicOptions": [
        { "text": "warranted concern", "nuance": "Sự lo ngại có căn cứ xác đáng.", "formalityScore": 9 },
        { "text": "legitimate", "nuance": "Chính đáng, hợp pháp.", "formalityScore": 9 },
        { "text": "merited", "nuance": "Xứng đáng (với công sức/phần thưởng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "warrant-", "meaning": "bảo đảm/cho phép (to guarantee/authorize)", "relatedWords": [{ "word": "warranty", "meaning": "giấy bảo hành" }, { "word": "warrant", "meaning": "lệnh bắt giữ" }] }
    }
  },
  {
    "id": "v143",
    "word": "ACRIMONIOUS",
    "ipa": "ˌækrɪˈməʊniəs",
    "elo": 1150,
    "level": "advanced",
    "scenario": "Vụ chia tiền lẩu trong group kết thúc cực ACRIMONIOUS chỉ vì một đĩa bò 120k, cả lớp kéo vào hóng biến.",
    "translationHint": "Cay nghiệt, đầy ác ý",
    "upgradeModule": {
      "simpleSentence": "The divorce was very bitter and angry.",
      "targetSlot": "bitter and angry",
      "academicOptions": [
        { "text": "acrimonious debate", "nuance": "Cuộc tranh luận gay gắt với những lời lẽ cay độc dành cho nhau.", "formalityScore": 9 },
        { "text": "vitriolic", "nuance": "Cay độc, ăn mòn (như axit).", "formalityScore": 10 },
        { "text": "rancorous", "nuance": "Đầy oán hận.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "acri-", "meaning": "nhọn/sắc/chua (sharp/sour)", "relatedWords": [{ "word": "acid", "meaning": "axit" }, { "word": "acrid", "meaning": "hăng/nồng" }, { "word": "acute", "meaning": "cấp tính/sắc bén" }] },
      "suffix": { "text": "-ous", "meaning": "tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v144",
    "word": "ADMONISH",
    "ipa": "ədˈmɒnɪʃ",
    "elo": 1200,
    "level": "advanced",
    "scenario": "Cô ADMONISH đứa bạn vì điểm danh hộ năm người, tính ra một mình nó gánh nửa lớp, keo lỳ thiệt.",
    "translationHint": "Cảnh cáo, khiển trách nhẹ",
    "upgradeModule": {
      "simpleSentence": "The teacher warned the student for talking in class.",
      "targetSlot": "warned",
      "academicOptions": [
        { "text": "admonish firmly", "nuance": "Khuyên răn hoặc khiển trách một cách nghiêm túc nhưng chân thành.", "formalityScore": 9 },
        { "text": "reprimand", "nuance": "Khiển trách chính thức (nặng hơn admonish).", "formalityScore": 10 },
        { "text": "chide", "nuance": "Mắng mỏ nhẹ nhàng.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad-", "meaning": "đến/hướng tới", "relatedWords": [] },
      "root": { "text": "mon-", "meaning": "nhắc nhở/cảnh báo (to warn/advise)", "relatedWords": [{ "word": "monitor", "meaning": "giám sát" }, { "word": "monument", "meaning": "đài tưởng niệm (để nhắc nhớ)" }, { "word": "summon", "meaning": "triệu tập" }] }
    }
  },
  {
    "id": "v145",
    "word": "AFFLUENT",
    "ipa": "ˈæfluənt",
    "elo": 1120,
    "level": "advanced",
    "scenario": "Nhìn đôi giày của thành viên mới là đoán gia đình AFFLUENT, check var xong cả đám im re.",
    "translationHint": "Giàu có, thịnh vượng",
    "upgradeModule": {
      "simpleSentence": "They live in a very rich neighborhood.",
      "targetSlot": "rich",
      "academicOptions": [
        { "text": "affluent society", "nuance": "Một xã hội sung túc, dư dả về vật chất.", "formalityScore": 9 },
        { "text": "prosperous", "nuance": "Thịnh vượng, phát đạt.", "formalityScore": 8 },
        { "text": "opulent", "nuance": "Sang trọng, xa hoa (phô trương sự giàu có).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad/af-", "meaning": "hướng tới", "relatedWords": [] },
      "root": { "text": "flu-", "meaning": "chảy (to flow - nghĩa là tiền bạc đổ về như nước)", "relatedWords": [{ "word": "fluent", "meaning": "trôi chảy" }, { "word": "fluid", "meaning": "chất lỏng" }, { "word": "influence", "meaning": "ảnh hưởng (chảy vào)" }] }
    }
  },
  {
    "id": "v146",
    "word": "ALLEVIATE",
    "ipa": "əˈliːvieɪt",
    "elo": 1140,
    "level": "advanced",
    "scenario": "Một ly bạc xỉu giúp ALLEVIATE nỗi đau thứ hai đầu tuần, ly thứ hai thì làm tim đập như vừa thi xong.",
    "translationHint": "Giảm nhẹ, làm vơi bớt",
    "upgradeModule": {
      "simpleSentence": "This medicine will make the pain less.",
      "targetSlot": "make the pain less",
      "academicOptions": [
        { "text": "alleviate suffering", "nuance": "Làm dịu đi nỗi đau hoặc sự khốn khổ.", "formalityScore": 9 },
        { "text": "mitigate", "nuance": "Giảm thiểu (thường dùng cho rủi ro/tác động).", "formalityScore": 10 },
        { "text": "assuage", "nuance": "Làm nguôi ngoai (thường dùng cho cơn giận/nỗi sợ).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad-", "meaning": "đến/hướng tới", "relatedWords": [] },
      "root": { "text": "lev-", "meaning": "nhẹ/nâng lên (light/raise)", "relatedWords": [{ "word": "elevate", "meaning": "nâng cao" }, { "word": "levity", "meaning": "sự khinh suất" }, { "word": "lever", "meaning": "đòn bẩy" }] }
    }
  },
  {
    "id": "v147",
    "word": "ALTRUISTIC",
    "ipa": "ˌæltruˈɪstɪk",
    "elo": 1180,
    "level": "advanced",
    "scenario": "Tưởng nó ALTRUISTIC nhường mình giường gần quạt, ai ngờ chỗ đó muỗi đông nhất phòng, thao túng tâm lý đỉnh.",
    "translationHint": "Vị tha, không vụ lợi",
    "upgradeModule": {
      "simpleSentence": "He does charity work because he is a selfless person.",
      "targetSlot": "selfless person",
      "academicOptions": [
        { "text": "altruistic motives", "nuance": "Động cơ vị tha, vì lợi ích của người khác mà không mưu cầu cá nhân.", "formalityScore": 9 },
        { "text": "philanthropic", "nuance": "Nhân đạo, hay làm từ thiện (quy mô lớn).", "formalityScore": 10 },
        { "text": "benevolent", "nuance": "Nhân từ.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "alter-", "meaning": "khác (other)", "relatedWords": [{ "word": "alternative", "meaning": "sự thay thế" }, { "word": "alter ego", "meaning": "bản ngã khác" }] },
      "suffix": { "text": "-istic", "meaning": "thuộc về niềm tin/đặc điểm", "relatedWords": [] }
    }
  },
  {
    "id": "v148",
    "word": "ABERRANT",
    "ipa": "æˈberənt",
    "elo": 1130,
    "level": "advanced",
    "scenario": "Thằng bạn tự dậy 6 giờ sáng chạy bộ, hành vi ABERRANT tới mức cả phòng hỏi nó có đang thất tình khum.",
    "translationHint": "Bất thường, lệch lạc",
    "upgradeModule": {
      "simpleSentence": "The test results showed some unusual behavior.",
      "targetSlot": "unusual",
      "academicOptions": [
        { "text": "aberrant cells", "nuance": "Tế bào đột biến, đi chệch khỏi sự phát triển bình thường.", "formalityScore": 10 },
        { "text": "anomalous", "nuance": "Bất thường, dị thường.", "formalityScore": 10 },
        { "text": "atypical", "nuance": "Không điển hình.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ab-", "meaning": "xa rời (away)", "relatedWords": [] },
      "root": { "text": "err-", "meaning": "đi lang thang/sai lầm (to wander/error)", "relatedWords": [{ "word": "error", "meaning": "sai lầm" }, { "word": "erratic", "meaning": "thất thường" }, { "word": "errand", "meaning": "việc vặt (đi tới đi lui)" }] }
    }
  },
  {
    "id": "v149",
    "word": "ANACHRONISTIC",
    "ipa": "əˌnækrəˈnɪstɪk",
    "elo": 1280,
    "level": "advanced",
    "scenario": "Thầy bắt viết tay tiểu luận rồi scan thành PDF, quy định ANACHRONISTIC tới mức cả lớp phải đi mua bút lại.",
    "translationHint": "Lỗi thời, sai thời điểm",
    "upgradeModule": {
      "simpleSentence": "Using a typewriter in a modern office is out of date.",
      "targetSlot": "out of date",
      "academicOptions": [
        { "text": "anachronistic approach", "nuance": "Cách tiếp cận không còn phù hợp với bối cảnh thời đại hiện nay.", "formalityScore": 9 },
        { "text": "antiquated", "nuance": "Cổ lỗ sĩ, cũ kỹ.", "formalityScore": 9 },
        { "text": "obsolete", "nuance": "Đã bị đào thải, không còn sử dụng.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ana-", "meaning": "ngược lại/trái với (against)", "relatedWords": [] },
      "root": { "text": "chron-", "meaning": "thời gian (time)", "relatedWords": [{ "word": "chronology", "meaning": "niên đại học" }, { "word": "synchronize", "meaning": "đồng bộ" }] }
    }
  },
  {
    "id": "v150",
    "word": "ANECDOTAL",
    "ipa": "ˌænɪkˈdəʊtl",
    "elo": 1160,
    "level": "advanced",
    "scenario": "Vụ 'uống cà phê muối là qua môn' chỉ là bằng chứng ANECDOTAL từ một anh khóa trên, vậy mà cả lớp xếp hàng.",
    "translationHint": "Dựa trên lời kể, không chính thức",
    "upgradeModule": {
      "simpleSentence": "The doctor's report was based on personal stories, not science.",
      "targetSlot": "personal stories",
      "academicOptions": [
        { "text": "anecdotal evidence", "nuance": "Bằng chứng dựa trên trải nghiệm cá nhân đơn lẻ, chưa được kiểm chứng khoa học.", "formalityScore": 9 },
        { "text": "subjective account", "nuance": "Lời kể mang tính chủ quan.", "formalityScore": 9 },
        { "text": "unsubstantiated", "nuance": "Chưa được xác minh/không có căn cứ.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "an-", "meaning": "không (not)", "relatedWords": [] },
      "root": { "text": "ekdot-", "meaning": "đưa ra/xuất bản (published - nghĩa là những chuyện 'chưa được công bố' chính thức)", "relatedWords": [] }
    }
  },
  {
    "id": "v151",
    "word": "ANOMALY",
    "ipa": "əˈnɒməli",
    "elo": 1170,
    "level": "advanced",
    "scenario": "Một ANOMALY của xóm trọ: tuần này wifi mạnh bất thường, hóa ra cả xóm về quê hết, fomo dễ sợ.",
    "translationHint": "Sự bất thường, dị thường",
    "upgradeModule": {
      "simpleSentence": "There is a strange thing in the data.",
      "targetSlot": "strange thing",
      "academicOptions": [
        { "text": "statistical anomaly", "nuance": "Sự bất thường trong số liệu thống kê.", "formalityScore": 9 },
        { "text": "aberration", "nuance": "Sự lệch lạc khỏi tiêu chuẩn thông thường.", "formalityScore": 10 },
        { "text": "irregularity", "nuance": "Sự không quy tắc, không đồng đều.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "a-", "meaning": "không (not/without)", "relatedWords": [{ "word": "amoral", "meaning": "không có đạo đức" }, { "word": "atypical", "meaning": "không điển hình" }] },
      "root": { "text": "homalos-", "meaning": "bằng phẳng/giống nhau (even/same)", "relatedWords": [{ "word": "homogeneous", "meaning": "đồng nhất" }] }
    }
  },
  {
    "id": "v152",
    "word": "ANTIQUATED",
    "ipa": "ˈæntɪkweɪtɪd",
    "elo": 1220,
    "level": "advanced",
    "scenario": "Cái laptop ANTIQUATED đời ông cố mở Word mất ba phút, đủ để úp mì và ăn xong, nồi cơm điện còn out trình nó.",
    "translationHint": "Cổ lỗ sĩ, cũ kỹ",
    "upgradeModule": {
      "simpleSentence": "This law is very old and should be changed.",
      "targetSlot": "very old",
      "academicOptions": [
        { "text": "antiquated system", "nuance": "Hệ thống lỗi thời, không còn phù hợp với hiện đại.", "formalityScore": 9 },
        { "text": "obsolete", "nuance": "Đã bị đào thải hoàn toàn.", "formalityScore": 10 },
        { "text": "outmoded", "nuance": "Lỗi mốt, không còn hợp thời.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "anti-", "meaning": "trước đây (before/ancient)", "relatedWords": [{ "word": "antique", "meaning": "đồ cổ" }, { "word": "anticipate", "meaning": "đoán trước" }] },
      "suffix": { "text": "-ated", "meaning": "hậu tố tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v153",
    "word": "APPREHENSIVE",
    "ipa": "ˌæprɪˈhensɪv",
    "elo": 1150,
    "level": "advanced",
    "scenario": "Thấy mẹ nhắn 'tối nay gọi video nha con', mình APPREHENSIVE liền, phòng trọ đang như bãi chiến trường, ét o ét.",
    "translationHint": "E sợ, lo lắng về điều gì đó sắp xảy ra",
    "upgradeModule": {
      "simpleSentence": "I am a bit worried about the future.",
      "targetSlot": "worried",
      "academicOptions": [
        { "text": "apprehensive about", "nuance": "Cảm giác lo sợ, bất an nhẹ về một sự kiện sắp tới.", "formalityScore": 9 },
        { "text": "fearful", "nuance": "Sợ hãi (mức độ mạnh hơn).", "formalityScore": 7 },
        { "text": "trepidation", "nuance": "Sự run rẩy, lo sợ (danh từ).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad-", "meaning": "hướng tới", "relatedWords": [] },
      "root": { "text": "prehend-", "meaning": "nắm lấy (to seize - nghĩa là 'nắm lấy' một ý nghĩ lo sợ trong đầu)", "relatedWords": [{ "word": "comprehend", "meaning": "thấu hiểu" }, { "word": "apprehend", "meaning": "bắt giữ" }] },
      "suffix": { "text": "-ive", "meaning": "tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v154",
    "word": "ARDUOUS",
    "ipa": "ˈɑːdjuəs",
    "elo": 1200,
    "level": "advanced",
    "scenario": "Hành trình ARDUOUS nhất năm: xách hai thùng mì với bao gạo lên tầng 5 không thang máy, tới nơi xỉu ngang.",
    "translationHint": "Gian nan, cực nhọc",
    "upgradeModule": {
      "simpleSentence": "It was a very difficult and long journey.",
      "targetSlot": "difficult and long",
      "academicOptions": [
        { "text": "arduous task", "nuance": "Công việc đòi hỏi nỗ lực cực lớn và kéo dài.", "formalityScore": 9 },
        { "text": "strenuous", "nuance": "Căng thẳng, đòi hỏi nhiều thể lực/trí lực.", "formalityScore": 8 },
        { "text": "laborious", "nuance": "Cần cù, tốn nhiều công sức.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "ardu-", "meaning": "dốc/cao/khó (steep/difficult)", "relatedWords": [{ "word": "ardor", "meaning": "nhiệt huyết (nóng bỏng)" }] },
      "suffix": { "text": "-ous", "meaning": "đầy rẫy", "relatedWords": [] }
    }
  },
  {
    "id": "v155",
    "word": "AUSTERE",
    "ipa": "ɒˈstɪə",
    "elo": 1240,
    "level": "advanced",
    "scenario": "Tháng này sống AUSTERE thật: cơm trắng, trứng chiên, nước lọc, wifi thì xài ké quán cà phê.",
    "translationHint": "Khắc khổ, giản dị quá mức",
    "upgradeModule": {
      "simpleSentence": "The room is very simple with no decoration.",
      "targetSlot": "simple with no decoration",
      "academicOptions": [
        { "text": "austere style", "nuance": "Phong cách tối giản đến mức khắc nghiệt, không có trang trí.", "formalityScore": 9 },
        { "text": "stark", "nuance": "Hoàn toàn đơn điệu, tương phản mạnh.", "formalityScore": 8 },
        { "text": "ascetic", "nuance": "Khổ hạnh (thiên về tôn giáo/kỷ luật cá nhân).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "auster-", "meaning": "khô/khắt khe (dry/harsh)", "relatedWords": [{ "word": "austerity", "meaning": "chính sách thắt lưng buộc bụng" }] }
    }
  },
  {
    "id": "v156",
    "word": "BANAL",
    "ipa": "bəˈnɑːl",
    "elo": 1180,
    "level": "advanced",
    "scenario": "Caption 'cuộc sống là những chuyến đi' nghe BANAL thật, nhưng ảnh Đà Lạt đẹp quá nên vẫn đăng, slay.",
    "translationHint": "Tầm thường, vô vị, sáo rỗng",
    "upgradeModule": {
      "simpleSentence": "The plot of the movie is very common and boring.",
      "targetSlot": "common and boring",
      "academicOptions": [
        { "text": "banal observation", "nuance": "Nhận xét tầm thường, ai cũng biết, thiếu tính độc đáo.", "formalityScore": 9 },
        { "text": "trite", "nuance": "Cũ rích, lặp lại quá nhiều.", "formalityScore": 10 },
        { "text": "prosaic", "nuance": "Tẻ nhạt, thiếu chất thơ.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "ban-", "meaning": "mệnh lệnh/công cộng (decree - nghĩa gốc là thứ gì đó 'công cộng' nên ai cũng dùng được dẫn đến tầm thường)", "relatedWords": [{ "word": "ban", "meaning": "lệnh cấm" }, { "word": "abandon", "meaning": "từ bỏ (đưa ra khỏi tầm kiểm soát)" }] }
    }
  },
  {
    "id": "v157",
    "word": "BENEVOLENT",
    "ipa": "bəˈnevələnt",
    "elo": 1160,
    "level": "advanced",
    "scenario": "Chủ trọ BENEVOLENT đỉnh nóc kịch trần: Tết không tăng giá, còn tặng mỗi phòng một hộp mứt.",
    "translationHint": "Nhân từ, rộng lượng",
    "upgradeModule": {
      "simpleSentence": "He is a very kind old man.",
      "targetSlot": "kind",
      "academicOptions": [
        { "text": "benevolent leader", "nuance": "Nhà lãnh đạo nhân từ, luôn lo cho lợi ích của cấp dưới.", "formalityScore": 9 },
        { "text": "philanthropic", "nuance": "Thương người, hay làm từ thiện.", "formalityScore": 10 },
        { "text": "altruistic", "nuance": "Vị tha, sống vì người khác.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "bene-", "meaning": "tốt (well/good)", "relatedWords": [{ "word": "benefit", "meaning": "lợi ích" }, { "word": "benediction", "meaning": "lời chúc phúc" }] },
      "root": { "text": "vol-", "meaning": "ý muốn (will)", "relatedWords": [{ "word": "voluntary", "meaning": "tự nguyện" }, { "word": "malevolent", "meaning": "ác ý (ngược lại)" }] }
    }
  },
  {
    "id": "v158",
    "word": "CALLOUS",
    "ipa": "ˈkæləs",
    "elo": 1190,
    "level": "advanced",
    "scenario": "Chia tay qua tin nhắn đúng ngày sinh nhật, kèm câu 'chúc vui', CALLOUS cỡ đó là red flag hạng nặng.",
    "translationHint": "Vô tâm, nhẫn tâm",
    "upgradeModule": {
      "simpleSentence": "She was very cold and didn't care about his feelings.",
      "targetSlot": "cold and didn't care",
      "academicOptions": [
        { "text": "callous disregard", "nuance": "Sự coi thường nhẫn tâm, không chút mảy may cảm xúc.", "formalityScore": 9 },
        { "text": "heartless", "nuance": "Vô tâm (thông dụng).", "formalityScore": 7 },
        { "text": "insensitive", "nuance": "Thiếu nhạy cảm/vô tình.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "call-", "meaning": "da dày/vết chai (hard skin)", "relatedWords": [{ "word": "callus", "meaning": "vết chai tay" }] }
    }
  },
  {
    "id": "v159",
    "word": "CAPITULATE",
    "ipa": "kəˈpɪtʃʊleɪt",
    "elo": 1250,
    "level": "advanced",
    "scenario": "Thề không ăn sau 8 giờ tối, tới 11 giờ group rủ đi ăn ốc là CAPITULATE trong hai giây, gét gô.",
    "translationHint": "Đầu hàng, chịu khuất phục",
    "upgradeModule": {
      "simpleSentence": "The army finally gave up.",
      "targetSlot": "gave up",
      "academicOptions": [
        { "text": "capitulate to demands", "nuance": "Chấp nhận đầu hàng và tuân theo các điều khoản bắt buộc.", "formalityScore": 10 },
        { "text": "surrender", "nuance": "Đầu hàng (trung tính).", "formalityScore": 7 },
        { "text": "yield", "nuance": "Nhượng bộ, chịu thua.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "capit-", "meaning": "đầu (head - nghĩa gốc là liệt kê các đầu mục điều kiện để đầu hàng)", "relatedWords": [{ "word": "capital", "meaning": "thủ đô/vốn" }, { "word": "captain", "meaning": "thuyền trưởng/đội trưởng" }] },
      "suffix": { "text": "-ate", "meaning": "hậu tố động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v160",
    "word": "CIRCUMVENT",
    "ipa": "ˌsɜːkəmˈvent",
    "elo": 1230,
    "level": "advanced",
    "scenario": "Thư viện cấm mang đồ ăn, nó CIRCUMVENT bằng cách giấu bánh mì trong hộp bút, thơm nguyên dãy bàn, ra đường tôi nể mỗi bạn.",
    "translationHint": "Dùng mưu mẹo để lách luật",
    "upgradeModule": {
      "simpleSentence": "They tried to go around the rules.",
      "targetSlot": "go around",
      "academicOptions": [
        { "text": "circumvent the law", "nuance": "Tìm kẽ hở để lách luật một cách khôn ngoan.", "formalityScore": 9 },
        { "text": "bypass", "nuance": "Đi vòng qua, bỏ qua.", "formalityScore": 7 },
        { "text": "evade", "nuance": "Lẩn tránh (trách nhiệm/thuế).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "circum-", "meaning": "vòng quanh (around)", "relatedWords": [{ "word": "circumstance", "meaning": "hoàn cảnh" }, { "word": "circulate", "meaning": "lưu thông" }] },
      "root": { "text": "ven-", "meaning": "đến (to come)", "relatedWords": [{ "word": "convene", "meaning": "tụ họp" }, { "word": "prevent", "meaning": "ngăn chặn (đến trước để chặn)" }, { "word": "event", "meaning": "sự kiện" }] }
    }
  },
  {
    "id": "v161",
    "word": "CLANDESTINE",
    "ipa": "klænˈdestɪn",
    "elo": 1270,
    "level": "advanced",
    "scenario": "Có một nhóm chat CLANDESTINE lowkey thiếu đúng một đứa, vì tuần sau là sinh nhật nó.",
    "translationHint": "Bí mật, lén lút",
    "upgradeModule": {
      "simpleSentence": "The spies had a secret meeting.",
      "targetSlot": "secret",
      "academicOptions": [
        { "text": "clandestine operation", "nuance": "Một hoạt động bí mật, thường là bất hợp pháp hoặc ám muội.", "formalityScore": 10 },
        { "text": "surreptitious", "nuance": "Lén lút, vụng trộm.", "formalityScore": 10 },
        { "text": "covert", "nuance": "Che đậy, không công khai (ngược với overt).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "clam-", "meaning": "bí mật/che giấu (secret/hidden)", "relatedWords": [] }
    }
  },
  {
    "id": "v162",
    "word": "COERCE",
    "ipa": "kəʊˈɜːs",
    "elo": 1210,
    "level": "advanced",
    "scenario": "Bạn thân COERCE mình đi coi phim kinh dị bằng cách mua sẵn vé, giờ mình ngủ phải bật đèn, báo thủ.",
    "translationHint": "Ép buộc, cưỡng bức",
    "upgradeModule": {
      "simpleSentence": "He was forced to sign the paper.",
      "targetSlot": "forced",
      "academicOptions": [
        { "text": "coerce into", "nuance": "Dùng quyền lực hoặc đe dọa để ép ai đó làm việc họ không muốn.", "formalityScore": 10 },
        { "text": "compel", "nuance": "Bắt buộc (do hoàn cảnh hoặc luật lệ).", "formalityScore": 8 },
        { "text": "browbeat", "nuance": "Hăm dọa, nạt nộ để ép buộc.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "co-", "meaning": "cùng nhau/hoàn toàn", "relatedWords": [] },
      "root": { "text": "arcere-", "meaning": "kiềm chế/nhốt lại (to enclose/restrain)", "relatedWords": [{ "word": "ark", "meaning": "con tàu cứu thế (nơi nhốt/chứa)" }, { "word": "exercise", "meaning": "bài tập (nghĩa gốc là rèn luyện trong khuôn khổ)" }] }
    }
  },
  {
    "id": "v163",
    "word": "COMPLACENT",
    "ipa": "kəmˈpleɪsnt",
    "elo": 1170,
    "level": "advanced",
    "scenario": "Giữa kỳ được 9 điểm nên COMPLACENT, cuối kỳ lướt TikTok thay vì ôn, kết quả tới công chuyện.",
    "translationHint": "Tự mãn, hài lòng với bản thân",
    "upgradeModule": {
      "simpleSentence": "He is too happy with his current success and doesn't want to try harder.",
      "targetSlot": "too happy with his current success",
      "academicOptions": [
        { "text": "become complacent", "nuance": "Sự tự mãn nguy hiểm dẫn đến việc thiếu cảnh giác hoặc ngừng cố gắng.", "formalityScore": 9 },
        { "text": "self-satisfied", "nuance": "Tự hài lòng (thông dụng).", "formalityScore": 7 },
        { "text": "smug", "nuance": "Tự phụ, vẻ mặt đắc ý một cách đáng ghét.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "com-", "meaning": "hoàn toàn", "relatedWords": [] },
      "root": { "text": "plac-", "meaning": "làm hài lòng (to please)", "relatedWords": [{ "word": "please", "meaning": "làm hài lòng" }, { "word": "placid", "meaning": "bình thản" }, { "word": "placate", "meaning": "xoa dịu" }] }
    }
  },
  {
    "id": "v164",
    "word": "CONCEDE",
    "ipa": "kənˈsiːd",
    "elo": 1150,
    "level": "advanced",
    "scenario": "Cãi cả buổi rồi cũng phải CONCEDE là mẹ nói đúng: áo trắng đừng giặt chung với quần jean, ok mom.",
    "translationHint": "Thừa nhận (thường là miễn cưỡng)",
    "upgradeModule": {
      "simpleSentence": "He finally agreed that he was wrong.",
      "targetSlot": "agreed",
      "academicOptions": [
        { "text": "concede defeat", "nuance": "Thừa nhận thất bại sau khi đã cố gắng hết sức.", "formalityScore": 9 },
        { "text": "acknowledge", "nuance": "Công nhận sự hiện diện/sự thật của cái gì đó.", "formalityScore": 8 },
        { "text": "acquiesce", "nuance": "Bằng lòng, ưng thuận (dù không thích lắm).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "con-", "meaning": "hoàn toàn", "relatedWords": [] },
      "root": { "text": "ced-", "meaning": "đi/nhường bước (to go/yield)", "relatedWords": [{ "word": "precede", "meaning": "đi trước" }, { "word": "recede", "meaning": "lùi lại" }, { "word": "exceed", "meaning": "vượt quá" }] }
    }
  },
  {
    "id": "v165",
    "word": "CONDESCENDING",
    "ipa": "ˌkɒndɪˈsendɪŋ",
    "elo": 1200,
    "level": "advanced",
    "scenario": "Anh khóa trên giảng bài bằng giọng CONDESCENDING, rồi tự giải sai đúng câu đầu tiên, ô dề thật sự.",
    "translationHint": "Ra vẻ bề trên, khinh khỉnh",
    "upgradeModule": {
      "simpleSentence": "He talks to people like they are stupid.",
      "targetSlot": "talks to people like they are stupid",
      "academicOptions": [
        { "text": "condescending tone", "nuance": "Giọng điệu hạ mình để tỏ vẻ bề trên, coi thường người khác.", "formalityScore": 9 },
        { "text": "patronizing", "nuance": "Ra vẻ bảo trợ nhưng thực chất là coi thường.", "formalityScore": 10 },
        { "text": "supercilious", "nuance": "Kiêu kỳ, hất hàm sai khiến.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "con-", "meaning": "cùng nhau", "relatedWords": [] },
      "root": { "text": "descend-", "meaning": "đi xuống (nghĩa là hạ mình xuống để người khác thấy mình đang ở cao hơn)", "relatedWords": [{ "word": "descendant", "meaning": "hậu duệ" }] }
    }
  },
  {
    "id": "v166",
    "word": "CONVOLUTED",
    "ipa": "ˈkɒnvəluːtɪd",
    "elo": 1220,
    "level": "advanced",
    "scenario": "Cách tính điểm rèn luyện CONVOLUTED tới mức đứa học Toán ứng dụng cũng bó tay, hết cứu.",
    "translationHint": "Phức tạp, rắc rối",
    "upgradeModule": {
      "simpleSentence": "The explanation was very complex and hard to follow.",
      "targetSlot": "complex and hard to follow",
      "academicOptions": [
        { "text": "convoluted argument", "nuance": "Lập luận xoắn xuýt, rắc rối thái quá gây khó hiểu.", "formalityScore": 9 },
        { "text": "intricate", "nuance": "Tinh vi, phức tạp (nghĩa tích cực hơn).", "formalityScore": 8 },
        { "text": "labyrinthine", "nuance": "Rắc rối như mê cung.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "con-", "meaning": "cùng nhau", "relatedWords": [] },
      "root": { "text": "volv-", "meaning": "cuộn/xoay (to roll)", "relatedWords": [{ "word": "evolve", "meaning": "tiến hóa (cuộn ra)" }, { "word": "revolve", "meaning": "xoay quanh" }, { "word": "volume", "meaning": "cuốn sách (cuộn giấy thời xưa)" }] },
      "suffix": { "text": "-uted", "meaning": "tính từ", "relatedWords": [] }
    }
  },
  {
    "id": "v167",
    "word": "CREDULOUS",
    "ipa": "ˈkredjʊləs",
    "elo": 1180,
    "level": "advanced",
    "scenario": "Đứa CREDULOUS nhất phòng tin lời shop 'mặc vào cao thêm 5 phân', giờ áo dài tới gối, delulu thật sự.",
    "translationHint": "Cả tin, dễ tin người",
    "upgradeModule": {
      "simpleSentence": "He is very easy to trick because he believes everything.",
      "targetSlot": "believes everything",
      "academicOptions": [
        { "text": "too credulous", "nuance": "Quá ngây thơ, tin vào những thứ thiếu căn cứ.", "formalityScore": 8 },
        { "text": "gullible", "nuance": "Dễ tin, dễ bị lừa (thông dụng).", "formalityScore": 6 },
        { "text": "naive", "nuance": "Ngây thơ, khờ dại.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "cred-", "meaning": "tin tưởng (believe)", "relatedWords": [{ "word": "credit", "meaning": "tín dụng" }, { "word": "incredible", "meaning": "khó tin" }, { "word": "creed", "meaning": "tín ngưỡng" }] },
      "suffix": { "text": "-ulous", "meaning": "đầy rẫy/có xu hướng", "relatedWords": [{ "word": "garrulous", "meaning": "nói nhiều" }] }
    }
  },
  {
    "id": "v168",
    "word": "CURTAIL",
    "ipa": "kɜːˈteɪl",
    "elo": 1190,
    "level": "advanced",
    "scenario": "Quyết tâm CURTAIL trà sữa còn hai ly một tuần, mới thứ hai đã xài hết suất vì fomo món mới.",
    "translationHint": "Cắt bớt, rút ngắn",
    "upgradeModule": {
      "simpleSentence": "We need to limit the time of the meeting.",
      "targetSlot": "limit the time",
      "academicOptions": [
        { "text": "curtail spending", "nuance": "Cắt giảm chi tiêu một cách quyết liệt.", "formalityScore": 9 },
        { "text": "abbreviate", "nuance": "Viết tắt, rút ngắn (văn bản).", "formalityScore": 9 },
        { "text": "truncate", "nuance": "Cắt cụt (thường dùng trong toán học/lập trình).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "curt-", "meaning": "ngắn (short)", "relatedWords": [{ "word": "curt", "meaning": "cộc lốc/ngắn gọn" }] },
      "suffix": { "text": "tail-", "meaning": "cắt (to cut - như là 'cắt đuôi')", "relatedWords": [{ "word": "tailor", "meaning": "thợ may (người cắt vải)" }, { "word": "detail", "meaning": "chi tiết (cắt nhỏ ra)" }] }
    }
  },
  {
    "id": "v169",
    "word": "CYNICISM",
    "ipa": "ˈsɪnɪsɪzəm",
    "elo": 1160,
    "level": "advanced",
    "scenario": "CYNICISM của mình với chữ 'sale sốc' có lý do: ba lần mua xong tuần sau giá còn rẻ hơn, xu cà na.",
    "translationHint": "Thái độ hoài nghi, yếm thế",
    "upgradeModule": {
      "simpleSentence": "He has a very negative view of life.",
      "targetSlot": "negative view of life",
      "academicOptions": [
        { "text": "pervasive cynicism", "nuance": "Sự hoài nghi lan tỏa, tin rằng mọi người chỉ hành động vì tư lợi.", "formalityScore": 9 },
        { "text": "skepticism", "nuance": "Sự hoài nghi (khách quan, khoa học hơn).", "formalityScore": 8 },
        { "text": "pessimism", "nuance": "Sự bi quan.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "cyn-", "meaning": "chó (dog)", "relatedWords": [{ "word": "cynic", "meaning": "người hay chỉ trích" }] },
      "suffix": { "text": "-ism", "meaning": "chủ nghĩa/trạng thái", "relatedWords": [] }
    }
  },
  {
    "id": "v170",
    "word": "DEBILITATING",
    "ipa": "dɪˈbɪlɪteɪtɪŋ",
    "elo": 1240,
    "level": "advanced",
    "scenario": "Cơn buồn ngủ sau bữa trưa DEBILITATING cỡ nào? Ngồi họp mà lowkey gật gù như đang nghe nhạc chill.",
    "translationHint": "Làm suy yếu, làm kiệt sức",
    "upgradeModule": {
      "simpleSentence": "The disease makes him very weak.",
      "targetSlot": "makes him very weak",
      "academicOptions": [
        { "text": "debilitating illness", "nuance": "Căn bệnh làm suy nhược cơ thể nghiêm trọng, mất khả năng lao động.", "formalityScore": 10 },
        { "text": "crippling", "nuance": "Làm tê liệt, gây tàn phế (nghĩa đen và bóng).", "formalityScore": 8 },
        { "text": "enervating", "nuance": "Làm kiệt quệ tinh thần/sức lực.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "de-", "meaning": "làm giảm/ngược lại", "relatedWords": [] },
      "root": { "text": "bil/bilit-", "meaning": "sức mạnh (strength - bắt nguồn từ 'de-ability' làm mất khả năng)", "relatedWords": [{ "word": "ability", "meaning": "khả năng" }] }
    }
  },
  {
    "id": "v171",
    "word": "DELINEATE",
    "ipa": "dɪˈlɪnieɪt",
    "elo": 1260,
    "level": "advanced",
    "scenario": "Trước khi ở ghép phải DELINEATE ai đổ rác, ai rửa chén, chứ không là tháng sau toang.",
    "translationHint": "Vạch ra, mô tả chi tiết",
    "upgradeModule": {
      "simpleSentence": "Can you describe the plan more clearly?",
      "targetSlot": "describe the plan",
      "academicOptions": [
        { "text": "clearly delineate", "nuance": "Vạch ra ranh giới hoặc chi tiết một cách cực kỳ rõ nét.", "formalityScore": 10 },
        { "text": "outline", "nuance": "Phác thảo sơ bộ.", "formalityScore": 7 },
        { "text": "depict", "nuance": "Miêu tả (thường dùng cho nghệ thuật/văn học).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "de-", "meaning": "xuống/hoàn toàn", "relatedWords": [] },
      "root": { "text": "line-", "meaning": "đường kẻ (line)", "relatedWords": [{ "word": "linear", "meaning": "tuyến tính" }, { "word": "lineage", "meaning": "dòng dõi" }] },
      "suffix": { "text": "-ate", "meaning": "động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v172",
    "word": "DISCREPANCY",
    "ipa": "dɪˈskrepənsi",
    "elo": 1200,
    "level": "advanced",
    "scenario": "Ảnh menu thì tô bún đầy thịt, ra tới bàn còn ba lát, DISCREPANCY cỡ này là lừa tình, ủa alo.",
    "translationHint": "Sự khác nhau, không thống nhất",
    "upgradeModule": {
      "simpleSentence": "There is a difference between the two reports.",
      "targetSlot": "difference",
      "academicOptions": [
        { "text": "major discrepancy", "nuance": "Sự khác biệt đáng kể giữa hai thứ lẽ ra phải giống nhau.", "formalityScore": 9 },
        { "text": "divergence", "nuance": "Sự phân kỳ, đi chệch hướng.", "formalityScore": 10 },
        { "text": "inconsistency", "nuance": "Sự không nhất quán.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "dis-", "meaning": "rời ra/không (apart)", "relatedWords": [] },
      "root": { "text": "crep-", "meaning": "kêu răng rắc/nứt (to rattle/crack - nghĩa là có vết nứt trong sự thống nhất)", "relatedWords": [{ "word": "decrepit", "meaning": "già yếu/đổ nát" }] }
    }
  },
  {
    "id": "v173",
    "word": "DISMISSIVE",
    "ipa": "dɪsˈmɪsɪv",
    "elo": 1170,
    "level": "advanced",
    "scenario": "Gửi idea vào group, nhóm trưởng đáp đúng chữ 'ừm', DISMISSIVE vậy là red flag, tuần sau tự làm nha.",
    "translationHint": "Gạt bỏ, coi thường",
    "upgradeModule": {
      "simpleSentence": "He ignored my idea and didn't think it was important.",
      "targetSlot": "ignored my idea",
      "academicOptions": [
        { "text": "dismissive attitude", "nuance": "Thái độ gạt đi ngay lập tức vì cho rằng không đáng quan tâm.", "formalityScore": 9 },
        { "text": "contemptuous", "nuance": "Khinh rẻ, coi thường.", "formalityScore": 10 },
        { "text": "disdainful", "nuance": "Coi khinh.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "dis-", "meaning": "rời đi", "relatedWords": [] },
      "root": { "text": "miss-", "meaning": "gửi đi (to send - nghĩa là đuổi đi, không cho ở lại trong đầu)", "relatedWords": [{ "word": "mission", "meaning": "nhiệm vụ" }, { "word": "missile", "meaning": "tên lửa" }, { "word": "admit", "meaning": "nhận vào" }] }
    }
  },
  {
    "id": "v174",
    "word": "DISPARATE",
    "ipa": "ˈdɪspərət",
    "elo": 1210,
    "level": "advanced",
    "scenario": "Tủ đồ toàn món DISPARATE: áo hoa đi biển, quần tây đi làm, giày leo núi, ghép lại ra bộ đi đám cưới.",
    "translationHint": "Khác hẳn nhau, tạp nham",
    "upgradeModule": {
      "simpleSentence": "The team has very different groups of people.",
      "targetSlot": "very different",
      "academicOptions": [
        { "text": "disparate elements", "nuance": "Các thành phần khác biệt hoàn toàn về bản chất, khó hòa nhập.", "formalityScore": 10 },
        { "text": "diverse", "nuance": "Đa dạng (nghĩa tích cực hơn).", "formalityScore": 7 },
        { "text": "heterogeneous", "nuance": "Hỗn hợp, không đồng nhất.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "dis-", "meaning": "không/tách ra", "relatedWords": [] },
      "root": { "text": "par-", "meaning": "ngang hàng (equal)", "relatedWords": [{ "word": "parity", "meaning": "sự ngang hàng" }, { "word": "compare", "meaning": "so sánh (đặt ngang nhau)" }] }
    }
  },
  {
    "id": "v175",
    "word": "DRACONIAN",
    "ipa": "drəˈkəʊniən",
    "elo": 1280,
    "level": "advanced",
    "scenario": "Luật phòng trọ DRACONIAN thật: sau 10 giờ khóa cổng, gọi cháy máy cũng chỉ nghe tiếng chó sủa, toang.",
    "translationHint": "Hà khắc, khắc nghiệt",
    "upgradeModule": {
      "simpleSentence": "The new rules are very strict and unfair.",
      "targetSlot": "very strict and unfair",
      "academicOptions": [
        { "text": "draconian measures", "nuance": "Biện pháp trừng phạt cực kỳ nặng nề và tàn nhẫn.", "formalityScore": 10 },
        { "text": "stringent", "nuance": "Nghiêm ngặt, chặt chẽ (về quy tắc).", "formalityScore": 9 },
        { "text": "rigorous", "nuance": "Khắt khe, nghiêm túc.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "Draco-", "meaning": "Draco (vị luật sư thời Hy Lạp cổ đại nổi tiếng với bộ luật cực kỳ đẫm máu)", "relatedWords": [] }
    }
  },
  {
    "id": "v176",
    "word": "DUPLICITOUS",
    "ipa": "djuːˈplɪsɪtəs",
    "elo": 1300,
    "level": "advanced",
    "scenario": "Đứa bạn DUPLICITOUS nhất: trước mặt khen váy xinh, quay qua group khác chụp màn hình bàn tán, ra đường tôi nể mỗi bạn.",
    "translationHint": "Hai mặt, gian trá",
    "upgradeModule": {
      "simpleSentence": "I don't trust him because he is a liar.",
      "targetSlot": "liar",
      "academicOptions": [
        { "text": "duplicitous behavior", "nuance": "Hành vi lừa dối có tính chất hai mặt, thiếu trung thực.", "formalityScore": 9 },
        { "text": "deceitful", "nuance": "Dối trá.", "formalityScore": 8 },
        { "text": "mendacious", "nuance": "Hay nói dối (rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "du-", "meaning": "hai (two)", "relatedWords": [] },
      "root2": { "text": "plic-", "meaning": "gấp (to fold - nghĩa là 'gấp đôi' lại để che giấu sự thật)", "relatedWords": [{ "word": "duplicate", "meaning": "nhân bản" }, { "word": "complicit", "meaning": "đồng lõa" }] }
    }
  },
  {
    "id": "v177",
    "word": "ELUSIVE",
    "ipa": "ɪˈluːsɪv",
    "elo": 1190,
    "level": "advanced",
    "scenario": "Chiếc tất còn lại của đôi nào cũng ELUSIVE, giặt hai chiếc mà phơi lên chỉ còn một.",
    "translationHint": "Khó nắm bắt, hay lảng tránh",
    "upgradeModule": {
      "simpleSentence": "The answer was hard to find.",
      "targetSlot": "hard to find",
      "academicOptions": [
        { "text": "elusive concept", "nuance": "Khái niệm mơ hồ, khó có thể định nghĩa hay hiểu rõ.", "formalityScore": 9 },
        { "text": "evasive", "nuance": "Lảng tránh (trả lời).", "formalityScore": 9 },
        { "text": "subtle", "nuance": "Tinh tế, khó nhận ra.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "e-", "meaning": "ra ngoài", "relatedWords": [] },
      "root": { "text": "lud/lus-", "meaning": "chơi/đùa giỡn (to play - nghĩa là 'chơi trò trốn tìm' với sự thật)", "relatedWords": [{ "word": "illusion", "meaning": "ảo giác" }, { "word": "delude", "meaning": "đánh lừa" }, { "word": "collude", "meaning": "cấu kết" }] }
    }
  },
  {
    "id": "v178",
    "word": "EMULATE",
    "ipa": "ˈemjʊleɪt",
    "elo": 1160,
    "level": "advanced",
    "scenario": "Manifest làm cô gái 5 giờ sáng, cố EMULATE routine mấy chị trên TikTok được hai ngày, ngày ba ngủ tới trưa.",
    "translationHint": "Noi gương, học tập theo",
    "upgradeModule": {
      "simpleSentence": "He tried to copy his father's success.",
      "targetSlot": "copy",
      "academicOptions": [
        { "text": "strive to emulate", "nuance": "Cố gắng bắt chước để đạt được thành tựu tương tự hoặc tốt hơn.", "formalityScore": 9 },
        { "text": "imitate", "nuance": "Bắt chước (trung tính).", "formalityScore": 7 },
        { "text": "mimic", "nuance": "Nhại lại (thường mang nghĩa trêu chọc).", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "aemul-", "meaning": "ganh đua/bằng hữu (rivaling)", "relatedWords": [{ "word": "emulous", "meaning": "có tính ganh đua" }] }
    }
  },
  {
    "id": "v179",
    "word": "EQUIVOCATE",
    "ipa": "ɪˈkwɪvəkeɪt",
    "elo": 1290,
    "level": "advanced",
    "scenario": "Hỏi thẳng 'tối qua mày ăn hết bánh của tao hả', nó EQUIVOCATE kiểu 'ai biết, chắc chuột', thao túng tâm lý.",
    "translationHint": "Nói mập mờ, lập lờ để lừa dối",
    "upgradeModule": {
      "simpleSentence": "He didn't give a straight answer.",
      "targetSlot": "didn't give a straight answer",
      "academicOptions": [
        { "text": "stop equivocating", "nuance": "Ngừng dùng lời lẽ mập mờ để né tránh cam kết.", "formalityScore": 10 },
        { "text": "prevaricate", "nuance": "Nói quanh co để tránh sự thật.", "formalityScore": 10 },
        { "text": "hedge", "nuance": "Nói nước đôi để bảo vệ bản thân.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "equi-", "meaning": "bằng nhau (equal)", "relatedWords": [{ "word": "equivalent", "meaning": "tương đương" }] },
      "root2": { "text": "voc-", "meaning": "tiếng nói (voice - nghĩa là nói hai thứ có trọng lượng bằng nhau dẫn đến lập lờ)", "relatedWords": [{ "word": "vocal", "meaning": "thuộc về giọng nói" }, { "word": "advocate", "meaning": "ủng hộ" }] }
    }
  },
  {
    "id": "v180",
    "word": "EXORBITANT",
    "ipa": "ɪɡˈzɔːbɪtənt",
    "elo": 1220,
    "level": "advanced",
    "scenario": "Ly cà phê ở phố đi bộ giá EXORBITANT, sinh viên ví mỏng như mình chỉ dám chụp hình cái menu, u là trời.",
    "translationHint": "Quá mức, cắt cổ (về giá cả)",
    "upgradeModule": {
      "simpleSentence": "The rent for this apartment is too high.",
      "targetSlot": "too high",
      "academicOptions": [
        { "text": "exorbitant prices", "nuance": "Mức giá quá cao, vượt xa giới hạn hợp lý.", "formalityScore": 9 },
        { "text": "excessive", "nuance": "Quá mức.", "formalityScore": 8 },
        { "text": "extortionate", "nuance": "Đắt như trấn lột.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ex-", "meaning": "ra ngoài", "relatedWords": [] },
      "root": { "text": "orbit-", "meaning": "quỹ đạo/đường mòn (track - nghĩa là văng ra khỏi quỹ đạo bình thường)", "relatedWords": [{ "word": "orbit", "meaning": "quỹ đạo" }] }
    }
  },
  {
    "id": "v181",
    "word": "EXPEDIENT",
    "ipa": "ɪkˈspiːdiənt",
    "elo": 1230,
    "level": "advanced",
    "scenario": "Mì gói ba bữa liền là lựa chọn EXPEDIENT nhất mùa thi, còn cái dạ dày thì đang ét o ét gửi đơn khiếu nại.",
    "translationHint": "Tiện lợi nhất thời, thực dụng",
    "upgradeModule": {
      "simpleSentence": "This is a quick way to solve the problem for now.",
      "targetSlot": "quick way",
      "academicOptions": [
        { "text": "politically expedient", "nuance": "Tiện lợi về mặt chính trị nhưng có thể không đúng đắn về đạo đức.", "formalityScore": 9 },
        { "text": "pragmatic", "nuance": "Thực dụng, thực tế.", "formalityScore": 7 },
        { "text": "makeshift", "nuance": "Tạm bợ, dùng thay thế lúc cấp bách.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ex-", "meaning": "ra ngoài (out)", "relatedWords": [] },
      "root": { "text": "ped-", "meaning": "chân (foot - nghĩa gốc là giải phóng cái chân đang bị vướng để đi cho nhanh)", "relatedWords": [{ "word": "pedal", "meaning": "bàn đạp" }, { "word": "pedestrian", "meaning": "người đi bộ" }, { "word": "expedition", "meaning": "cuộc thám hiểm" }] }
    }
  },
  {
    "id": "v182",
    "word": "EXTRANEOUS",
    "ipa": "ɪkˈstreɪniəs",
    "elo": 1250,
    "level": "advanced",
    "scenario": "Hỏi crush tối nay đi xem phim không, nó gửi lại 12 tin EXTRANEOUS về con mèo nhà nó, câu hỏi chính thì lowkey bị bơ.",
    "translationHint": "Không liên quan, ngoài lề",
    "upgradeModule": {
      "simpleSentence": "The report has too much unnecessary information.",
      "targetSlot": "unnecessary",
      "academicOptions": [
        { "text": "extraneous details", "nuance": "Các chi tiết thừa thãi, không liên quan đến cốt lõi vấn đề.", "formalityScore": 9 },
        { "text": "irrelevant", "nuance": "Không liên quan.", "formalityScore": 7 },
        { "text": "superfluous", "nuance": "Dư thừa, quá mức cần thiết.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "extra-", "meaning": "bên ngoài (outside)", "relatedWords": [{ "word": "extraordinary", "meaning": "phi thường" }, { "word": "extravagant", "meaning": "phung phí" }] },
      "root": { "text": "ane-", "meaning": "thuộc về", "relatedWords": [] }
    }
  },
  {
    "id": "v183",
    "word": "FALLACIOUS",
    "ipa": "fəˈleɪʃəs",
    "elo": 1270,
    "level": "advanced",
    "scenario": "Lập luận 'sale 50% tức là mình lời 50%' nghe FALLACIOUS rõ ràng, vậy mà tui vẫn bị nó thao túng tâm lý, chốt đơn liền.",
    "translationHint": "Sai lầm, ngụy biện",
    "upgradeModule": {
      "simpleSentence": "His argument is based on false ideas.",
      "targetSlot": "based on false ideas",
      "academicOptions": [
        { "text": "fallacious reasoning", "nuance": "Cách suy luận có vẻ hợp lý nhưng thực chất là sai lầm logic.", "formalityScore": 9 },
        { "text": "erroneous", "nuance": "Sai lầm (mang tính khách quan hơn).", "formalityScore": 10 },
        { "text": "spurious", "nuance": "Giả mạo, không xác thực.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "fall/fals-", "meaning": "lừa dối/sai (to deceive/false)", "relatedWords": [{ "word": "false", "meaning": "sai" }, { "word": "fail", "meaning": "thất bại" }, { "word": "fallible", "meaning": "có thể sai lầm" }] },
      "suffix": { "text": "-acious", "meaning": "đầy rẫy/có xu hướng", "relatedWords": [] }
    }
  },
  {
    "id": "v184",
    "word": "FASTIDIOUS",
    "ipa": "fæˈstɪdiəs",
    "elo": 1240,
    "level": "advanced",
    "scenario": "Bạn cùng phòng trọ FASTIDIOUS tới mức xếp dép theo màu, tui để lệch một chiếc là tới công chuyện liền.",
    "translationHint": "Khó tính, cầu kỳ thái quá",
    "upgradeModule": {
      "simpleSentence": "He is very careful and hard to please.",
      "targetSlot": "very careful and hard to please",
      "academicOptions": [
        { "text": "fastidious attention", "nuance": "Sự chú ý cực kỳ kỹ lưỡng, đôi khi đến mức cực đoan.", "formalityScore": 9 },
        { "text": "meticulous", "nuance": "Tỉ mỉ (nghĩa tích cực hơn).", "formalityScore": 8 },
        { "text": "scrupulous", "nuance": "Cẩn trọng để không sai sót đạo đức hoặc kỹ thuật.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "fasti-", "meaning": "sự ghê tởm/khinh miệt (disgust - nghĩa gốc là người dễ thấy ghê tởm nên cực kỳ kén chọn)", "relatedWords": [] },
      "suffix": { "text": "-idious", "meaning": "tính chất", "relatedWords": [{ "word": "insidious", "meaning": "âm hiểm" }] }
    }
  },
  {
    "id": "v185",
    "word": "FERVENT",
    "ipa": "ˈfɜːvənt",
    "elo": 1180,
    "level": "advanced",
    "scenario": "Fan FERVENT cỡ nó canh vé concert từ 5 giờ sáng với ba cái báo thức, săn vé thì keo lỳ, bài tập nhóm thì chưa mở lần nào.",
    "translationHint": "Nồng nhiệt, tha thiết",
    "upgradeModule": {
      "simpleSentence": "He has a very strong belief in his religion.",
      "targetSlot": "very strong belief",
      "academicOptions": [
        { "text": "fervent hope", "nuance": "Niềm hy vọng mãnh liệt và cháy bỏng.", "formalityScore": 8 },
        { "text": "ardent", "nuance": "Hăng hái, cuồng nhiệt.", "formalityScore": 9 },
        { "text": "vehement", "nuance": "Kịch liệt, dữ dội (thường dùng cho sự phản đối).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "ferv-", "meaning": "sôi/nóng (to boil/glow)", "relatedWords": [{ "word": "fervor", "meaning": "sự nhiệt thành" }, { "word": "fever", "meaning": "cơn sốt" }, { "word": "effervescent", "meaning": "sủi bọt" }] }
    }
  },
  {
    "id": "v186",
    "word": "FLAGRANT",
    "ipa": "ˈfleɪɡrənt",
    "elo": 1210,
    "level": "advanced",
    "scenario": "Nó chép nguyên bài essay của tui, đổi đúng cái tên rồi nộp, FLAGRANT tới mức thầy hỏi luôn hai đứa ai là bản gốc, u là trời.",
    "translationHint": "Trắng trợn, lộ liễu",
    "upgradeModule": {
      "simpleSentence": "This is a very obvious and bad mistake.",
      "targetSlot": "obvious and bad",
      "academicOptions": [
        { "text": "flagrant violation", "nuance": "Sự vi phạm trắng trợn, công khai coi thường luật lệ.", "formalityScore": 9 },
        { "text": "glaring", "nuance": "Chói mắt, không thể không thấy (thường dùng cho lỗi).", "formalityScore": 7 },
        { "text": "blatant", "nuance": "Rành rành, trơ tráo.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "flagr-", "meaning": "cháy rực (to burn/blaze - nghĩa là sai phạm 'cháy hừng hực' ai cũng thấy)", "relatedWords": [{ "word": "conflagration", "meaning": "đám cháy lớn" }, { "word": "flamboyant", "meaning": "rực rỡ" }] }
    }
  },
  {
    "id": "v187",
    "word": "FLEETING",
    "ipa": "ˈfliːtɪŋ",
    "elo": 1130,
    "level": "advanced",
    "scenario": "Động lực đi gym sau khi xem clip lột xác trên TikTok cực kỳ FLEETING, lướt hết clip là nằm luôn, hết cứu.",
    "translationHint": "Thoáng qua, phù du",
    "upgradeModule": {
      "simpleSentence": "I caught a very quick look at the movie star.",
      "targetSlot": "very quick look",
      "academicOptions": [
        { "text": "fleeting glimpse", "nuance": "Cái nhìn thoáng qua trong tích tắc.", "formalityScore": 8 },
        { "text": "transient", "nuance": "Tạm thời, ngắn ngủi.", "formalityScore": 9 },
        { "text": "ephemeral", "nuance": "Phù du (thường dùng cho vẻ đẹp/sự sống).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "fleet-", "meaning": "trôi đi/nhanh (to float/swift)", "relatedWords": [{ "word": "fleet", "meaning": "hạm đội (những con tàu trôi đi)" }, { "word": "float", "meaning": "nổi" }] }
    }
  },
  {
    "id": "v188",
    "word": "FORTHRIGHT",
    "ipa": "ˈfɔːθraɪt",
    "elo": 1160,
    "level": "advanced",
    "scenario": "Hỏi đứa FORTHRIGHT nhất nhóm outfit này ổn không, nó bảo 'giống rèm cửa nhà bà ngoại tao', đau mà real.",
    "translationHint": "Thẳng thắn, bộc trực",
    "upgradeModule": {
      "simpleSentence": "He is very direct and honest in his speech.",
      "targetSlot": "direct and honest",
      "academicOptions": [
        { "text": "forthright manner", "nuance": "Phong thái bộc trực, nói thẳng vào vấn đề không vòng vo.", "formalityScore": 8 },
        { "text": "candid", "nuance": "Thật thà, chân thành.", "formalityScore": 8 },
        { "text": "frank", "nuance": "Ngay thẳng (thường dùng cho thảo luận).", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "forth-", "meaning": "về phía trước", "relatedWords": [] },
      "root": { "text": "right-", "meaning": "thẳng/đúng", "relatedWords": [] }
    }
  },
  {
    "id": "v189",
    "word": "FRUGAL",
    "ipa": "ˈfruːɡl",
    "elo": 1140,
    "level": "advanced",
    "scenario": "Tuần cuối tháng sống FRUGAL đúng nghĩa: cơm trắng, trứng chiên và chai nước mắm mẹ gửi lên, cái ví đang ét o ét.",
    "translationHint": "Tiết kiệm, thanh đạm",
    "upgradeModule": {
      "simpleSentence": "She is very careful with money and lives simply.",
      "targetSlot": "careful with money",
      "academicOptions": [
        { "text": "frugal lifestyle", "nuance": "Lối sống tiết kiệm, không hoang phí nhưng không phải bủn xỉn.", "formalityScore": 8 },
        { "text": "thrifty", "nuance": "Tằn tiện, khéo chi tiêu.", "formalityScore": 7 },
        { "text": "economical", "nuance": "Tiết kiệm (thường dùng cho phương pháp/máy móc).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "frug-", "meaning": "hoa quả/thành quả (fruit - nghĩa gốc là dùng thành quả một cách xứng đáng)", "relatedWords": [{ "word": "fruit", "meaning": "trái cây" }, { "word": "fructose", "meaning": "đường trái cây" }] }
    }
  },
  {
    "id": "v190",
    "word": "FUTILE",
    "ipa": "ˈfjuːtaɪl",
    "elo": 1170,
    "level": "advanced",
    "scenario": "Giải thích cho mẹ vì sao 2 giờ sáng còn thức là nỗ lực FUTILE, kiểu gì cũng quy về cái điện thoại, hết cứu.",
    "translationHint": "Vô ích, không kết quả",
    "upgradeModule": {
      "simpleSentence": "All his attempts to fix the machine were useless.",
      "targetSlot": "useless",
      "academicOptions": [
        { "text": "futile exercise", "nuance": "Một nỗ lực vô ích, làm tốn thời gian mà không đem lại gì.", "formalityScore": 9 },
        { "text": "fruitless", "nuance": "Không có thành quả.", "formalityScore": 8 },
        { "text": "vain", "nuance": "Uổng công (in vain).", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "fud/fut-", "meaning": "đổ ra (to pour - nghĩa là thứ gì đó dễ đổ ra, rò rỉ nên không giữ được giá trị)", "relatedWords": [{ "word": "confuse", "meaning": "lộn xộn (đổ chung lại)" }, { "word": "refuse", "meaning": "từ chối (đổ ngược lại)" }, { "word": "diffuse", "meaning": "khuếch tán" }] }
    }
  },
  {
    "id": "v191",
    "word": "GRATUITOUS",
    "ipa": "ɡrəˈtjuːɪtəs",
    "elo": 1260,
    "level": "advanced",
    "scenario": "Clip review quán cà phê có 30 giây nội dung với 3 phút cảnh rót nước quay chậm GRATUITOUS, ô dề gì đâu.",
    "translationHint": "Vô lý, không cần thiết",
    "upgradeModule": {
      "simpleSentence": "The movie has too much unnecessary violence.",
      "targetSlot": "unnecessary",
      "academicOptions": [
        { "text": "gratuitous violence", "nuance": "Bạo lực vô lý, được đưa vào mà không có mục đích nghệ thuật hay cốt truyện.", "formalityScore": 9 },
        { "text": "unwarranted", "nuance": "Không có cơ sở, không đáng có.", "formalityScore": 10 },
        { "text": "needless", "nuance": "Không cần thiết.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "grat-", "meaning": "miễn phí/lòng tốt (pleasing/free)", "relatedWords": [{ "word": "grateful", "meaning": "biết ơn" }, { "word": "gratitude", "meaning": "lòng biết ơn" }, { "word": "gratuity", "meaning": "tiền tip (cho thêm miễn phí)" }] }
    }
  },
  {
    "id": "v192",
    "word": "HEGEMONY",
    "ipa": "hɪˈɡeməni",
    "elo": 1300,
    "level": "advanced",
    "scenario": "Trong group chat lớp, HEGEMONY của phe gửi sticker con vịt là tuyệt đối, ai nhắn chữ tử tế là lạc loài.",
    "translationHint": "Sự bá quyền, thống trị",
    "upgradeModule": {
      "simpleSentence": "The large country has control over its neighbors.",
      "targetSlot": "control over",
      "academicOptions": [
        { "text": "cultural hegemony", "nuance": "Sự thống trị về mặt văn hóa, áp đặt tư tưởng lên nhóm khác.", "formalityScore": 10 },
        { "text": "dominance", "nuance": "Sự thống trị (thông dụng).", "formalityScore": 8 },
        { "text": "supremacy", "nuance": "Sự tối cao, ưu thế tuyệt đối.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "hegemon-", "meaning": "người lãnh đạo (leader/guide)", "relatedWords": [] }
    }
  },
  {
    "id": "v193",
    "word": "HUBRIS",
    "ipa": "ˈhjuːbrɪs",
    "elo": 1280,
    "level": "advanced",
    "scenario": "Tự tin không ôn vì 'môn này dễ mà', HUBRIS cỡ đó nên vào phòng thi lật đề ra là toang.",
    "translationHint": "Sự ngạo mạn quá mức",
    "upgradeModule": {
      "simpleSentence": "His extreme pride led to his failure.",
      "targetSlot": "extreme pride",
      "academicOptions": [
        { "text": "tragic hubris", "nuance": "Sự kiêu ngạo quá mức của một anh hùng dẫn đến cái kết bi thảm.", "formalityScore": 10 },
        { "text": "arrogance", "nuance": "Sự kiêu căng.", "formalityScore": 8 },
        { "text": "conceit", "nuance": "Sự tự phụ.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "hubris", "meaning": "sự xấc xược/xâm phạm (insolence - bắt nguồn từ Hy Lạp cổ đại)", "relatedWords": [] }
    }
  },
  {
    "id": "v194",
    "word": "HYPOCRITICAL",
    "ipa": "ˌhɪpəˈkrɪtɪkl",
    "elo": 1190,
    "level": "advanced",
    "scenario": "Nó chửi người ta seen không rep là thiếu tôn trọng, trong khi đang ngâm 40 tin nhắn của tui, HYPOCRITICAL kiểu này đúng red flag.",
    "translationHint": "Đạo đức giả",
    "upgradeModule": {
      "simpleSentence": "He says one thing but does another.",
      "targetSlot": "says one thing but does another",
      "academicOptions": [
        { "text": "hypocritical stance", "nuance": "Lập trường đạo đức giả, không nhất quán giữa lời nói và việc làm.", "formalityScore": 9 },
        { "text": "insincere", "nuance": "Không chân thành.", "formalityScore": 7 },
        { "text": "duplicitous", "nuance": "Hai mặt, dối trá.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "hypo-", "meaning": "ở dưới (under)", "relatedWords": [] },
      "root": { "text": "krit-", "meaning": "người phán xét/diễn viên (judge/actor - nghĩa là diễn viên đóng vai ở dưới lớp mặt nạ)", "relatedWords": [{ "word": "critic", "meaning": "nhà phê bình" }, { "word": "criterion", "meaning": "tiêu chí" }] }
    }
  },
  {
    "id": "v195",
    "word": "IDEALISTIC",
    "ipa": "aɪˌdɪəˈlɪstɪk",
    "elo": 1150,
    "level": "advanced",
    "scenario": "Kế hoạch dậy 5 giờ tập yoga, đọc sách, nấu bữa sáng healthy nghe IDEALISTIC quá, sáng ra tui ngủ tới 10 giờ, delulu thiệt.",
    "translationHint": "Lý tưởng hóa, xa rời thực tế",
    "upgradeModule": {
      "simpleSentence": "He has very high goals that are hard to reach.",
      "targetSlot": "very high goals",
      "academicOptions": [
        { "text": "idealistic vision", "nuance": "Tầm nhìn đầy lý tưởng nhưng có thể thiếu tính khả thi.", "formalityScore": 8 },
        { "text": "quixotic", "nuance": "Viển vông, hào hiệp thái quá.", "formalityScore": 10 },
        { "text": "utopian", "nuance": "Không tưởng (về một xã hội hoàn hảo).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "idea-", "meaning": "hình dáng/ý tưởng (form/pattern)", "relatedWords": [{ "word": "idea", "meaning": "ý tưởng" }, { "word": "ideal", "meaning": "lý tưởng" }] },
      "suffix": { "text": "-istic", "meaning": "thuộc về niềm tin", "relatedWords": [] }
    }
  },
  {
    "id": "v196",
    "word": "INADVERTENT",
    "ipa": "ˌɪnədˈvɜːtnt",
    "elo": 1230,
    "level": "advanced",
    "scenario": "Cú thả tim INADVERTENT vào ảnh năm 2019 của crush lúc 1 giờ sáng, gỡ ra thì người ta nhận thông báo rồi, xu cà na.",
    "translationHint": "Vô ý, không chủ tâm",
    "upgradeModule": {
      "simpleSentence": "I accidentally deleted the file.",
      "targetSlot": "accidentally",
      "academicOptions": [
        { "text": "inadvertent error", "nuance": "Sai sót vô tình, không hề có ý định từ trước.", "formalityScore": 9 },
        { "text": "unintentional", "nuance": "Không cố ý.", "formalityScore": 8 },
        { "text": "unwitting", "nuance": "Vô tình (thường dùng cho người không biết mình đang làm gì).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "không", "relatedWords": [] },
      "prefix2": { "text": "ad-", "meaning": "đến/hướng tới", "relatedWords": [] },
      "root": { "text": "vert-", "meaning": "xoay chuyển (to turn - nghĩa là 'không xoay sự chú ý đến')", "relatedWords": [{ "word": "divert", "meaning": "làm chệch hướng" }, { "word": "convert", "meaning": "chuyển đổi" }] }
    }
  },
  {
    "id": "v197",
    "word": "INCONGRUENT",
    "ipa": "ɪnˈkɒŋɡruənt",
    "elo": 1260,
    "level": "advanced",
    "scenario": "Caption ghi 'đang chữa lành ở Đà Lạt' mà ảnh là cảnh ngồi chạy deadline trong homestay, nhìn INCONGRUENT gì đâu.",
    "translationHint": "Không phù hợp, mâu thuẫn",
    "upgradeModule": {
      "simpleSentence": "His behavior doesn't match his words.",
      "targetSlot": "doesn't match",
      "academicOptions": [
        { "text": "incongruent with", "nuance": "Không khớp, mâu thuẫn với bối cảnh hoặc mong đợi.", "formalityScore": 10 },
        { "text": "inconsistent", "nuance": "Không nhất quán.", "formalityScore": 8 },
        { "text": "clashing", "nuance": "Xung đột, đối chọi nhau.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "không", "relatedWords": [] },
      "root": { "text": "congru-", "meaning": "hợp nhau/đồng ý (to come together/agree)", "relatedWords": [{ "word": "congruent", "meaning": "bằng nhau/khớp nhau (hình học)" }] }
    }
  },
  {
    "id": "v198",
    "word": "INDOLENT",
    "ipa": "ˈɪndələnt",
    "elo": 1200,
    "level": "advanced",
    "scenario": "Chủ nhật INDOLENT tới mức với cái remote cách nửa mét cũng phải cân nhắc năm phút xem có đáng không, lowkey hạnh phúc.",
    "translationHint": "Lười biếng, nhác làm",
    "upgradeModule": {
      "simpleSentence": "He is a very lazy person who hates working.",
      "targetSlot": "lazy",
      "academicOptions": [
        { "text": "indolent employee", "nuance": "Nhân viên lười biếng, thiếu động lực và trốn tránh công việc.", "formalityScore": 9 },
        { "text": "lethargic", "nuance": "Uể oải, thiếu năng lượng.", "formalityScore": 8 },
        { "text": "slothful", "nuance": "Lười biếng (như con lười).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "không", "relatedWords": [] },
      "root": { "text": "dol-", "meaning": "đau đớn (pain - nghĩa gốc là 'không cảm thấy đau đớn/lo lắng' nên không thèm làm gì)", "relatedWords": [{ "word": "doleful", "meaning": "u sầu" }, { "word": "condolence", "meaning": "lời chia buồn" }] }
    }
  },
  {
    "id": "v199",
    "word": "INEXORABLE",
    "ipa": "ɪnˈeksərəbl",
    "elo": 1310,
    "level": "advanced",
    "scenario": "Ngày đóng tiền trọ tới INEXORABLE như mặt trời mọc, dù tui đã manifest đủ kiểu cho nó lùi lại một tuần.",
    "translationHint": "Không thể lay chuyển/ngăn cản",
    "upgradeModule": {
      "simpleSentence": "The process cannot be stopped.",
      "targetSlot": "cannot be stopped",
      "academicOptions": [
        { "text": "inexorable progress", "nuance": "Sự tiến triển không ngừng nghỉ và không thể bị tác động để dừng lại.", "formalityScore": 10 },
        { "text": "relentless", "nuance": "Tàn nhẫn, không nao núng.", "formalityScore": 9 },
        { "text": "inevitable", "nuance": "Không thể tránh khỏi.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "không", "relatedWords": [] },
      "root": { "text": "exor-", "meaning": "cầu xin/lay chuyển (to pray/entreat - nghĩa là không thể cầu xin để nó dừng lại)", "relatedWords": [{ "word": "oracle", "meaning": "lời sấm truyền" }, { "word": "oration", "meaning": "bài diễn văn" }] },
      "suffix": { "text": "-able", "meaning": "có thể", "relatedWords": [] }
    }
  },
  {
    "id": "v200",
    "word": "INSIDIOUS",
    "ipa": "ɪnˈsɪdiəs",
    "elo": 1270,
    "level": "advanced",
    "scenario": "Mỗi ngày một ly trà sữa nghe vô hại, cái INSIDIOUS là cuối tháng mở app ngân hàng mới thấy bay mất tiền nhà, xỉu ngang.",
    "translationHint": "Âm thầm nguy hại",
    "upgradeModule": {
      "simpleSentence": "The disease spreads secretly and dangerously.",
      "targetSlot": "secretly and dangerously",
      "academicOptions": [
        { "text": "insidious effect", "nuance": "Sự ảnh hưởng có vẻ vô hại lúc đầu nhưng dần dần gây hại nghiêm trọng.", "formalityScore": 10 },
        { "text": "pernicious", "nuance": "Độc hại ngầm.", "formalityScore": 10 },
        { "text": "stealthy", "nuance": "Lén lút.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "vào trong", "relatedWords": [] },
      "root": { "text": "sid-", "meaning": "ngồi (to sit - nghĩa là 'ngồi phục sẵn bên trong' để chờ thời cơ hại người)", "relatedWords": [{ "word": "resident", "meaning": "cư dân (ngồi lại ở đó)" }, { "word": "subside", "meaning": "lún xuống" }, { "word": "sediment", "meaning": "trầm tích" }] }
    }
  },
  {
    "id": "v201",
    "word": "INTRANSIGENT",
    "ipa": "ɪnˈtrænsɪdʒənt",
    "elo": 1290,
    "level": "advanced",
    "scenario": "Mẹ tui INTRANSIGENT vụ áo khoác, 35 độ vẫn bắt mang theo, cãi kiểu gì cũng ra câu 'lỡ trời trở gió', thôi ok mom.",
    "translationHint": "Cố chấp, không nhượng bộ",
    "upgradeModule": {
      "simpleSentence": "He refuses to change his mind.",
      "targetSlot": "refuses to change his mind",
      "academicOptions": [
        { "text": "intransigent position", "nuance": "Lập trường cứng nhắc, hoàn toàn từ chối thỏa hiệp.", "formalityScore": 10 },
        { "text": "uncompromising", "nuance": "Không thỏa hiệp.", "formalityScore": 9 },
        { "text": "obdurate", "nuance": "Bướng bỉnh, cứng lòng.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "không", "relatedWords": [] },
      "root": { "text": "transig-", "meaning": "thỏa hiệp/thông qua (to come to an agreement)", "relatedWords": [{ "word": "transaction", "meaning": "giao dịch" }] }
    }
  },
  {
    "id": "v202",
    "word": "IRREVOCABLE",
    "ipa": "ɪˈrevəkəbl",
    "elo": 1300,
    "level": "advanced",
    "scenario": "Tin nhắn gửi nhầm vào group gia đình đã quá 24 tiếng, giờ nó IRREVOCABLE rồi, toang thật, chỉ còn cách đổi họ.",
    "translationHint": "Không thể thu hồi/thay đổi",
    "upgradeModule": {
      "simpleSentence": "The damage is done and cannot be fixed.",
      "targetSlot": "cannot be fixed",
      "academicOptions": [
        { "text": "irrevocable decision", "nuance": "Quyết định cuối cùng, không thể rút lại hoặc đảo ngược.", "formalityScore": 10 },
        { "text": "irreversible", "nuance": "Không thể đảo ngược.", "formalityScore": 9 },
        { "text": "final", "nuance": "Cuối cùng.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in/ir-", "meaning": "không", "relatedWords": [] },
      "prefix2": { "text": "re-", "meaning": "lại/ngược lại", "relatedWords": [] },
      "root": { "text": "voc-", "meaning": "tiếng nói/gọi (to call - nghĩa là không thể 'gọi ngược lại' được nữa)", "relatedWords": [{ "word": "revoke", "meaning": "thu hồi" }, { "word": "vocal", "meaning": "giọng nói" }] }
    }
  },
  {
    "id": "v203",
    "word": "LAMENTABLE",
    "ipa": "ˈlæməntəbl",
    "elo": 1220,
    "level": "advanced",
    "scenario": "Tủ lạnh phòng trọ cuối tháng LAMENTABLE: một quả trứng, nửa chai tương ớt và hộp cơm vô chủ, u là trời.",
    "translationHint": "Đáng buồn, đáng tiếc",
    "upgradeModule": {
      "simpleSentence": "The company's lack of safety is very bad.",
      "targetSlot": "very bad",
      "academicOptions": [
        { "text": "lamentable state", "nuance": "Tình trạng tồi tệ đến mức đáng phải than thở, hối tiếc.", "formalityScore": 9 },
        { "text": "deplorable", "nuance": "Đáng bị lên án, rất tồi tệ.", "formalityScore": 10 },
        { "text": "pitiful", "nuance": "Đáng thương hại.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "lament-", "meaning": "than vãn/tiếng khóc (wailing/moaning)", "relatedWords": [{ "word": "lament", "meaning": "lời than vãn" }] },
      "suffix": { "text": "-able", "meaning": "đáng bị", "relatedWords": [] }
    }
  },
  {
    "id": "v204",
    "word": "LETHARGIC",
    "ipa": "ləˈθɑːdʒɪk",
    "elo": 1180,
    "level": "advanced",
    "scenario": "Ăn trưa no xong vào tiết 1 giờ chiều, cả lớp LETHARGIC như bật chế độ tiết kiệm pin, cô hỏi gì cũng khum ai rep.",
    "translationHint": "Uể oải, lờ đờ",
    "upgradeModule": {
      "simpleSentence": "The hot weather makes me feel tired and slow.",
      "targetSlot": "tired and slow",
      "academicOptions": [
        { "text": "feel lethargic", "nuance": "Cảm giác mệt mỏi rã rời, thiếu năng lượng sống.", "formalityScore": 8 },
        { "text": "sluggish", "nuance": "Chậm chạp như sên.", "formalityScore": 7 },
        { "text": "listless", "nuance": "Lờ đờ, không có chút hứng thú nào.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "letharg-", "meaning": "quên/buồn ngủ (forgetfulness/drowsiness - bắt nguồn từ dòng sông Lethe trong thần thoại Hy Lạp, ai uống nước sông này sẽ quên hết quá khứ)", "relatedWords": [{ "word": "lethargy", "meaning": "sự uể oải" }] }
    }
  },
  {
    "id": "v205",
    "word": "LUCID",
    "ipa": "ˈluːsɪd",
    "elo": 1140,
    "level": "advanced",
    "scenario": "Đứa bạn đang ngái ngủ bỗng có một phút LUCID, dặn 'đừng nhắn cho người yêu cũ nha' rồi ngáy tiếp, lời khuyên real nhất năm.",
    "translationHint": "Sáng suốt, rõ ràng",
    "upgradeModule": {
      "simpleSentence": "He gave a very clear and easy to understand speech.",
      "targetSlot": "clear and easy to understand",
      "academicOptions": [
        { "text": "lucid explanation", "nuance": "Lời giải thích cực kỳ minh bạch, dễ hiểu dù vấn đề phức tạp.", "formalityScore": 9 },
        { "text": "articulate", "nuance": "Diễn đạt lưu loát.", "formalityScore": 8 },
        { "text": "perspicuous", "nuance": "Rõ ràng, mạch lạc (rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "luc-", "meaning": "ánh sáng (light)", "relatedWords": [{ "word": "lucifer", "meaning": "sao mai (người mang ánh sáng)" }, { "word": "translucent", "meaning": "trong mờ" }, { "word": "elucidate", "meaning": "làm sáng tỏ" }] }
    }
  },
  {
    "id": "v206",
    "word": "MAGNANIMOUS",
    "ipa": "mæɡˈnænɪməs",
    "elo": 1250,
    "level": "advanced",
    "scenario": "Thua kèo mà vẫn MAGNANIMOUS bao nguyên nhóm trà sữa, đúng là ra đường tôi nể mỗi bạn.",
    "translationHint": "Hào hiệp, cao thượng",
    "upgradeModule": {
      "simpleSentence": "He was very kind and forgave his enemy.",
      "targetSlot": "kind and forgave his enemy",
      "academicOptions": [
        { "text": "magnanimous gesture", "nuance": "Một cử chỉ cao thượng, rộng lượng đối với đối thủ hoặc người kém thế.", "formalityScore": 10 },
        { "text": "benevolent", "nuance": "Nhân từ.", "formalityScore": 8 },
        { "text": "chivalrous", "nuance": "Hào hiệp (kiểu hiệp sĩ).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "magn-", "meaning": "to lớn (great)", "relatedWords": [{ "word": "magnify", "meaning": "phóng to" }, { "word": "magnificent", "meaning": "vĩ đại" }] },
      "root2": { "text": "anim-", "meaning": "tâm hồn (soul/mind - nghĩa là người có tâm hồn rộng lớn)", "relatedWords": [{ "word": "animal", "meaning": "động vật (thứ có linh hồn)" }, { "word": "unanimous", "meaning": "nhất trí (cùng tâm hồn)" }] }
    }
  },
  {
    "id": "v207",
    "word": "MALLEABLE",
    "ipa": "ˈmæliəbl",
    "elo": 1210,
    "level": "advanced",
    "scenario": "Ý chí ăn kiêng của tui MALLEABLE như cục đất sét, đứa bạn rủ ăn ốc một câu là gét gô liền.",
    "translationHint": "Dễ bị tác động, dễ uốn nắn",
    "upgradeModule": {
      "simpleSentence": "Children's minds are easy to influence.",
      "targetSlot": "easy to influence",
      "academicOptions": [
        { "text": "malleable personality", "nuance": "Tính cách dễ thay đổi hoặc chịu ảnh hưởng từ bên ngoài.", "formalityScore": 9 },
        { "text": "pliant", "nuance": "Dẻo dai, dễ uốn.", "formalityScore": 9 },
        { "text": "impressionable", "nuance": "Dễ bị ấn tượng/ảnh hưởng (thường dùng cho trẻ em).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "malle-", "meaning": "cái búa (hammer - nghĩa là có thể dùng búa đập thành hình dạng khác)", "relatedWords": [{ "word": "mallet", "meaning": "vồ gỗ" }] },
      "suffix": { "text": "-able", "meaning": "có thể", "relatedWords": [] }
    }
  },
  {
    "id": "v208",
    "word": "MENDACIOUS",
    "ipa": "menˈdeɪʃəs",
    "elo": 1320,
    "level": "advanced",
    "scenario": "Bài đăng 'phòng rộng, sát trường' MENDACIOUS hết cỡ, check var tới nơi thì phòng 9 mét, cách trường 7 cây số.",
    "translationHint": "Sai sự thật, giả dối",
    "upgradeModule": {
      "simpleSentence": "The politician made many false statements.",
      "targetSlot": "false statements",
      "academicOptions": [
        { "text": "mendacious propaganda", "nuance": "Những lời tuyên truyền dối trá, cố tình xuyên tạc sự thật.", "formalityScore": 10 },
        { "text": "deceitful", "nuance": "Dối trá.", "formalityScore": 8 },
        { "text": "fraudulent", "nuance": "Gian lận (thường dùng cho tài chính/pháp lý).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "mend-", "meaning": "lỗi/thiếu sót (fault/defect)", "relatedWords": [{ "word": "amend", "meaning": "sửa đổi (bỏ lỗi đi)" }, { "word": "emend", "meaning": "hiệu đính" }] },
      "suffix": { "text": "-acious", "meaning": "tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v209",
    "word": "MELANCHOLY",
    "ipa": "ˈmelənkɒli",
    "elo": 1160,
    "level": "advanced",
    "scenario": "Tối Chủ nhật nghe playlist nhạc buồn, tự nhiên MELANCHOLY nhớ cơm mẹ nấu, mở tủ lạnh chỉ có gói mì, cần chữa lành gấp.",
    "translationHint": "U sầu, buồn bã",
    "upgradeModule": {
      "simpleSentence": "He felt a very deep sadness.",
      "targetSlot": "deep sadness",
      "academicOptions": [
        { "text": "melancholy reflection", "nuance": "Sự trầm tư đầy u sầu, buồn bã kéo dài.", "formalityScore": 9 },
        { "text": "somber", "nuance": "Ảm đạm, u tối.", "formalityScore": 8 },
        { "text": "wistful", "nuance": "Bâng khuâng, tiếc nuối.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "melan-", "meaning": "đen (black)", "relatedWords": [{ "word": "melanin", "meaning": "sắc tố đen" }, { "word": "melanoma", "meaning": "ung thư hắc tố" }] },
      "root2": { "text": "chol-", "meaning": "mật (bile - y học cổ đại tin rằng quá nhiều 'mật đen' sẽ gây trầm cảm)", "relatedWords": [{ "word": "cholera", "meaning": "bệnh tả" }, { "word": "cholesterol", "meaning": "cholesterol" }] }
    }
  },
  {
    "id": "v210",
    "word": "MOLLIFY",
    "ipa": "ˈmɒlɪfaɪ",
    "elo": 1130,
    "level": "advanced",
    "scenario": "Lỡ quên sinh nhật bạn thân, tui ship hộp bánh tráng trộn mới MOLLIFY được nó, vậy mà nó vẫn đòi thêm ly trà sữa, đàm phán keo lỳ thật.",
    "translationHint": "Làm nguôi đi, xoa dịu",
    "upgradeModule": {
      "simpleSentence": "The manager tried to make the angry customer calm down.",
      "targetSlot": "make the angry customer calm down",
      "academicOptions": [
        { "text": "mollify the critics", "nuance": "Xoa dịu những lời chỉ trích bằng cách nhượng bộ hoặc giải thích.", "formalityScore": 9 },
        { "text": "appease", "nuance": "Nhượng bộ để cầu hòa (đôi khi mang nghĩa tiêu cực).", "formalityScore": 10 },
        { "text": "placate", "nuance": "Làm cho ai đó bớt giận.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "moll-", "meaning": "mềm (soft)", "relatedWords": [{ "word": "mollusk", "meaning": "động vật thân mềm" }, { "word": "emollient", "meaning": "thuốc làm mềm da" }] },
      "suffix": { "text": "-fy", "meaning": "làm cho", "relatedWords": [] }
    }
  },
  {
    "id": "v211",
    "word": "MERCURIAL",
    "ipa": "mɜːˈkjʊəriəl",
    "elo": 1110,
    "level": "advanced",
    "scenario": "Thời tiết Sài Gòn MERCURIAL thật, sáng nắng cháy da, chiều mưa ầm ầm, tối lại mát rượi như chưa có gì, ủa alo.",
    "translationHint": "Thất thường, hay thay đổi",
    "upgradeModule": {
      "simpleSentence": "He has a mood that changes very quickly.",
      "targetSlot": "mood that changes very quickly",
      "academicOptions": [
        { "text": "mercurial temperament", "nuance": "Tính khí thất thường, khó đoán định (như thủy ngân).", "formalityScore": 9 },
        { "text": "volatile", "nuance": "Dễ biến động, dễ bay hơi (thường dùng cho cảm xúc mạnh).", "formalityScore": 8 },
        { "text": "capricious", "nuance": "Thay đổi tùy hứng, thiếu lý do cụ thể.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "mercury-", "meaning": "vị thần Mercury/thủy ngân (vị thần liên lạc nhanh nhẹn nhưng khó nắm bắt)", "relatedWords": [{ "word": "mercury", "meaning": "thủy ngân" }] }
    }
  },
  {
    "id": "v212",
    "word": "NEFARIOUS",
    "ipa": "nɪˈfeəriəs",
    "elo": 1310,
    "level": "advanced",
    "scenario": "Bạn cùng phòng NEFARIOUS: ăn vụng mì của tui rồi giấu vỏ dưới gầm giường, ai ngờ báo thủ bị mùi tôm chua tố cáo.",
    "translationHint": "Hung ác, bất chính",
    "upgradeModule": {
      "simpleSentence": "They have a very evil plan to steal the money.",
      "targetSlot": "very evil",
      "academicOptions": [
        { "text": "nefarious activities", "nuance": "Các hoạt động phi pháp, độc ác và vô đạo đức.", "formalityScore": 10 },
        { "text": "villainous", "nuance": "Đểu giả, ác ôn (kiểu nhân vật phản diện).", "formalityScore": 7 },
        { "text": "iniquitous", "nuance": "Cực kỳ bất công và tội lỗi.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "ne-", "meaning": "không (not)", "relatedWords": [] },
      "root2": { "text": "fas-", "meaning": "luật thần thánh/điều đúng đắn (divine law - nghĩa là làm trái với luật trời)", "relatedWords": [{ "word": "fatal", "meaning": "chết người (định mệnh từ trời)" }] },
      "suffix": { "text": "-ous", "meaning": "đầy rẫy", "relatedWords": [] }
    }
  },
  {
    "id": "v213",
    "word": "NONCHALANT",
    "ipa": "ˌnɒnʃəˈlɑːnt",
    "elo": 1190,
    "level": "advanced",
    "scenario": "Cả nhóm hóng biến tới nóng máy, còn nhân vật chính thì NONCHALANT đăng story đi ăn lẩu như chưa có gì.",
    "translationHint": "Thờ ơ, lãnh đạm",
    "upgradeModule": {
      "simpleSentence": "He behaved in a calm way that showed he didn't care.",
      "targetSlot": "calm way that showed he didn't care",
      "academicOptions": [
        { "text": "nonchalant attitude", "nuance": "Thái độ bình thản đến mức thờ ơ, không hề lo lắng.", "formalityScore": 8 },
        { "text": "insouciant", "nuance": "Vô tư lự, không mảy may bận tâm.", "formalityScore": 10 },
        { "text": "dispassionate", "nuance": "Thản nhiên, không để cảm xúc xen vào.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "non-", "meaning": "không (not)", "relatedWords": [] },
      "root": { "text": "chaloir-", "meaning": "làm nóng/quan tâm (to concern/heat - nghĩa là 'không thấy nóng' trong lòng khi gặp chuyện)", "relatedWords": [{ "word": "calorie", "meaning": "đơn vị nhiệt lượng" }, { "word": "scald", "meaning": "bỏng" }] }
    }
  },
  {
    "id": "v214",
    "word": "NOSTALGIC",
    "ipa": "nɒˈstældʒɪk",
    "elo": 1130,
    "level": "advanced",
    "scenario": "Lục lại ảnh Facebook năm lớp 8 với mấy dòng status emo ô dề, vừa NOSTALGIC vừa muốn xóa sạch trước khi ai thấy.",
    "translationHint": "Hoài niệm",
    "upgradeModule": {
      "simpleSentence": "Looking at old photos makes me feel sad and happy about the past.",
      "targetSlot": "feel sad and happy about the past",
      "academicOptions": [
        { "text": "deeply nostalgic", "nuance": "Cảm giác nhớ nhung quá khứ pha lẫn chút buồn tiếc.", "formalityScore": 8 },
        { "text": "wistful", "nuance": "Bâng khuâng, mong đợi một thứ đã qua.", "formalityScore": 9 },
        { "text": "reminiscent", "nuance": "Gợi nhớ lại kỷ niệm.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "nostos-", "meaning": "về nhà (homecoming)", "relatedWords": [] },
      "root2": { "text": "algos-", "meaning": "đau đớn (pain - nghĩa gốc là nỗi đau vì nhớ nhà)", "relatedWords": [{ "word": "analgesic", "meaning": "thuốc giảm đau" }, { "word": "neuralgia", "meaning": "đau dây thần kinh" }] }
    }
  },
  {
    "id": "v215",
    "word": "OBLIVIOUS",
    "ipa": "əˈblɪviəs",
    "elo": 1160,
    "level": "advanced",
    "scenario": "Cả lớp biết nó thích bạn bàn trên, chỉ có bạn bàn trên là OBLIVIOUS, vẫn hồn nhiên nhờ nó chép bài giùm, hết cứu.",
    "translationHint": "Vô tâm, không nhận thấy",
    "upgradeModule": {
      "simpleSentence": "He was not aware of the danger.",
      "targetSlot": "not aware of",
      "academicOptions": [
        { "text": "oblivious to", "nuance": "Hoàn toàn không hay biết hoặc không để ý đến xung quanh.", "formalityScore": 9 },
        { "text": "unmindful", "nuance": "Thiếu sự chú tâm.", "formalityScore": 8 },
        { "text": "unwitting", "nuance": "Vô tình (không biết mình đang làm gì).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob-", "meaning": "chống lại/ngang qua", "relatedWords": [] },
      "root": { "text": "liv/lev-", "meaning": "trơn trượt/mòn (smooth - nghĩa là ký ức bị trượt đi mất)", "relatedWords": [{ "word": "oblivion", "meaning": "sự lãng quên" }] }
    }
  },
  {
    "id": "v216",
    "word": "OMINOUS",
    "ipa": "ˈɒmɪnəs",
    "elo": 1180,
    "level": "advanced",
    "scenario": "Mẹ nhắn đúng ba chữ 'về nói chuyện' kèm dấu chấm, OMINOUS hơn mọi phim kinh dị tui từng xem, tới công chuyện rồi.",
    "translationHint": "Điềm xấu, đáng lo ngại",
    "upgradeModule": {
      "simpleSentence": "The black clouds look like a bad sign.",
      "targetSlot": "bad sign",
      "academicOptions": [
        { "text": "ominous silence", "nuance": "Sự im lặng đáng sợ, báo hiệu điều chẳng lành sắp tới.", "formalityScore": 9 },
        { "text": "foreboding", "nuance": "Linh tính điều xấu.", "formalityScore": 8 },
        { "text": "portentous", "nuance": "Báo điềm, hệ trọng (thường là xấu).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "omen-", "meaning": "điềm báo (sign/omen)", "relatedWords": [{ "word": "omen", "meaning": "điềm" }, { "word": "abominate", "meaning": "ghê tởm (coi là điềm xấu nên tránh xa)" }] }
    }
  },
  {
    "id": "v217",
    "word": "OPAQUE",
    "ipa": "əʊˈpeɪk",
    "elo": 1200,
    "level": "advanced",
    "scenario": "Cách app giao đồ ăn tính phí OPAQUE gì đâu, món 30 nghìn cộng phí dịch vụ, phí đóng gói, ra gần 70, ví lowkey khóc.",
    "translationHint": "Mập mờ, không minh bạch",
    "upgradeModule": {
      "simpleSentence": "The rules of the game are very hard to understand.",
      "targetSlot": "hard to understand",
      "academicOptions": [
        { "text": "opaque regulations", "nuance": "Các quy định tối nghĩa, thiếu sự minh bạch cần thiết.", "formalityScore": 9 },
        { "text": "impenetrable", "nuance": "Không thể thấu hiểu/xuyên qua nổi.", "formalityScore": 10 },
        { "text": "obscure", "nuance": "Mờ mịt, ít người biết.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "opacus-", "meaning": "âm u/tối (shaded/dark)", "relatedWords": [{ "word": "opacity", "meaning": "độ đục/độ mờ" }] }
    }
  },
  {
    "id": "v218",
    "word": "OSTENTATIOUS",
    "ipa": "ˌɒstənˈteɪʃəs",
    "elo": 1300,
    "level": "advanced",
    "scenario": "Đi cà phê mà đặt chìa khóa xe với điện thoại mới ngay giữa bàn, kiểu flex OSTENTATIOUS cỡ đó ai cũng nhìn ra.",
    "translationHint": "Phô trương, khoe mẽ",
    "upgradeModule": {
      "simpleSentence": "He bought a very expensive car just to show off.",
      "targetSlot": "show off",
      "academicOptions": [
        { "text": "ostentatious display of wealth", "nuance": "Sự phô trương giàu sang một cách lố bịch để gây chú ý.", "formalityScore": 9 },
        { "text": "pretentious", "nuance": "Tự phụ, làm bộ làm tịch.", "formalityScore": 8 },
        { "text": "flamboyant", "nuance": "Rực rỡ, khoa trương (đôi khi mang nghĩa tích cực về phong cách).", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob-", "meaning": "trước mặt", "relatedWords": [] },
      "root": { "text": "tend/tens-", "meaning": "căng ra/vươn ra (to stretch - nghĩa là vươn ra cho thiên hạ thấy)", "relatedWords": [{ "word": "extend", "meaning": "mở rộng" }, { "word": "tendency", "meaning": "xu hướng" }] }
    }
  },
  {
    "id": "v219",
    "word": "PEDANTIC",
    "ipa": "pɪˈdæntɪk",
    "elo": 1250,
    "level": "advanced",
    "scenario": "Rủ đi ăn mà đứa bạn PEDANTIC chỉ trả lời bằng cách sửa 'dzậy' thành 'vậy', đi hay không thì im re, u là trời.",
    "translationHint": "Câu nệ, soi xét tiểu tiết",
    "upgradeModule": {
      "simpleSentence": "The teacher is too worried about small, unimportant rules.",
      "targetSlot": "too worried about small, unimportant rules",
      "academicOptions": [
        { "text": "pedantic insistence", "nuance": "Sự khăng khăng đòi hỏi đúng từng chi tiết nhỏ nhặt đến mức phiền phức.", "formalityScore": 9 },
        { "text": "fastidious", "nuance": "Khó tính, tỉ mỉ thái quá.", "formalityScore": 8 },
        { "text": "nitpicking", "nuance": "Bới lông tìm vết (thông tục).", "formalityScore": 5 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "ped-", "meaning": "trẻ con (child - nghĩa gốc là giáo viên dạy trẻ con hay bắt lỗi vặt)", "relatedWords": [{ "word": "pediatrics", "meaning": "nhi khoa" }, { "word": "encyclopedia", "meaning": "bách khoa toàn thư (vòng tròn kiến thức cho trẻ)" }] }
    }
  },
  {
    "id": "v220",
    "word": "PERFIDIOUS",
    "ipa": "pəˈfɪdiəs",
    "elo": 1330,
    "level": "advanced",
    "scenario": "Hứa cùng nhau ế tới 30, vậy mà nó lặng lẽ có bồ rồi đăng ảnh, cú quay xe PERFIDIOUS nhất năm, cả group ăn cơm chó.",
    "translationHint": "Phản bội, xảo trá",
    "upgradeModule": {
      "simpleSentence": "He was a disloyal friend who told my secrets.",
      "targetSlot": "disloyal",
      "academicOptions": [
        { "text": "perfidious act", "nuance": "Hành động phản bội lòng tin một cách đê hèn.", "formalityScore": 10 },
        { "text": "treacherous", "nuance": "Phản bội, nguy hiểm.", "formalityScore": 9 },
        { "text": "deceitful", "nuance": "Dối trá.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "per-", "meaning": "xuyên qua/lệch lạc (nghĩa xấu)", "relatedWords": [] },
      "root": { "text": "fid-", "meaning": "niềm tin (faith - nghĩa là đi xuyên qua/phá vỡ niềm tin)", "relatedWords": [{ "word": "fidelity", "meaning": "sự chung thủy" }, { "word": "confidence", "meaning": "sự tin tưởng" }] }
    }
  },
  {
    "id": "v221",
    "word": "PERTINENT",
    "ipa": "ˈpɜːtɪnənt",
    "elo": 1150,
    "level": "advanced",
    "scenario": "Họp nhóm hai tiếng toàn bàn trưa ăn gì, câu PERTINENT duy nhất là 'ủa alo, mai nộp bài rồi đó'.",
    "translationHint": "Đúng trọng tâm, liên quan trực tiếp",
    "upgradeModule": {
      "simpleSentence": "Your point is very relevant to the discussion.",
      "targetSlot": "very relevant",
      "academicOptions": [
        { "text": "pertinent information", "nuance": "Thông tin liên quan mật thiết và quan trọng đối với tình huống hiện tại.", "formalityScore": 9 },
        { "text": "germane", "nuance": "Có liên quan chặt chẽ về mặt ý tưởng.", "formalityScore": 10 },
        { "text": "applicable", "nuance": "Có thể áp dụng được.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "per-", "meaning": "hoàn toàn", "relatedWords": [] },
      "root": { "text": "tin/tain-", "meaning": "giữ (to hold - nghĩa là 'giữ đúng' vào vị trí của nó)", "relatedWords": [{ "word": "contain", "meaning": "chứa đựng" }, { "word": "maintain", "meaning": "duy trì" }] }
    }
  },
  {
    "id": "v222",
    "word": "PHLEGMATIC",
    "ipa": "fleɡˈmætɪk",
    "elo": 1280,
    "level": "advanced",
    "scenario": "Rớt môn, lỡ xe về quê, crush có bồ trong cùng một tuần mà nó vẫn PHLEGMATIC bảo 'đời mà', chằm zn ăn bánh tráng tiếp.",
    "translationHint": "Điềm tĩnh, lạnh lùng",
    "upgradeModule": {
      "simpleSentence": "He is always calm and doesn't get excited easily.",
      "targetSlot": "calm and doesn't get excited easily",
      "academicOptions": [
        { "text": "phlegmatic disposition", "nuance": "Tính khí điềm đạm, ít khi biểu lộ cảm xúc dù gặp chuyện lớn.", "formalityScore": 9 },
        { "text": "composed", "nuance": "Bình tĩnh, tự chủ.", "formalityScore": 8 },
        { "text": "stolid", "nuance": "Thản nhiên đến mức hơi lỳ lợm/vô cảm.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "phlegm-", "meaning": "đờm (phlegm - y học cổ đại tin rằng người nhiều đờm sẽ có tính cách lạnh lùng, chậm chạp)", "relatedWords": [{ "word": "phlegm", "meaning": "đờm" }] }
    }
  },
  {
    "id": "v223",
    "word": "PLACID",
    "ipa": "ˈplæsɪd",
    "elo": 1200,
    "level": "advanced",
    "scenario": "Mặt hồ buổi sáng PLACID tới mức ngồi nhìn một lúc là quên luôn deadline, chữa lành được đúng năm phút thì điện thoại rung.",
    "translationHint": "Điềm tĩnh, lặng lẽ",
    "upgradeModule": {
      "simpleSentence": "The lake was very peaceful and quiet.",
      "targetSlot": "peaceful and quiet",
      "academicOptions": [
        { "text": "placid surface", "nuance": "Bề mặt phẳng lặng, yên bình (thường dùng cho thiên nhiên hoặc gương mặt).", "formalityScore": 8 },
        { "text": "serene", "nuance": "Thanh thản, yên bình (mức độ tâm linh cao hơn).", "formalityScore": 9 },
        { "text": "tranquil", "nuance": "Tĩnh lặng, không bị làm phiền.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "plac-", "meaning": "làm hài lòng/phẳng (to please/flat)", "relatedWords": [{ "word": "placate", "meaning": "xoa dịu" }, { "word": "complacent", "meaning": "tự mãn" }, { "word": "placebo", "meaning": "giả dược (thứ làm bệnh nhân hài lòng)" }] }
    }
  },
  {
    "id": "v224",
    "word": "POLARIZING",
    "ipa": "ˈpəʊləraɪzɪŋ",
    "elo": 1170,
    "level": "advanced",
    "scenario": "Món trà sữa sầu riêng POLARIZING cỡ này: nửa group xin công thức, nửa kia đòi rời nhóm, admin thì ngồi hóng biến.",
    "translationHint": "Gây chia rẽ, phân cực",
    "upgradeModule": {
      "simpleSentence": "The new law divided the people into two opposing groups.",
      "targetSlot": "divided the people into two opposing groups",
      "academicOptions": [
        { "text": "polarizing figure", "nuance": "Nhân vật gây tranh cãi mạnh, khiến mọi người chia thành 2 phe yêu-ghét rõ rệt.", "formalityScore": 9 },
        { "text": "divisive", "nuance": "Gây chia rẽ.", "formalityScore": 8 },
        { "text": "contentious", "nuance": "Gây tranh cãi.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "polar-", "meaning": "điểm cực (pole - như cực Bắc/Nam)", "relatedWords": [{ "word": "pole", "meaning": "cái cột/cực" }, { "word": "polarity", "meaning": "tính phân cực" }] }
    }
  },
  {
    "id": "v225",
    "word": "POMPOUS",
    "ipa": "ˈpɒmpəs",
    "elo": 1220,
    "level": "advanced",
    "scenario": "Ông anh khóa trên họp lớp flex giọng POMPOUS về 'tư duy triệu đô', hỏi ra thì vẫn xin tiền nhà đóng trọ.",
    "translationHint": "Hợm hĩnh, vênh váo",
    "upgradeModule": {
      "simpleSentence": "He was behaving like he was more important than he really was.",
      "targetSlot": "behaving like he was more important",
      "academicOptions": [
        { "text": "pompous speech", "nuance": "Bài phát biểu mang tính khoe khoang, dùng từ ngữ to tát để tỏ ra quan trọng.", "formalityScore": 9 },
        { "text": "arrogant", "nuance": "Kiêu ngạo.", "formalityScore": 7 },
        { "text": "grandiose", "nuance": "Phô trương, vĩ cuồng.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "pomp-", "meaning": "lễ hội rước/long trọng (solemn procession)", "relatedWords": [{ "word": "pomp", "meaning": "sự hào nhoáng" }] }
    }
  },
  {
    "id": "v226",
    "word": "PUNCTILIOUS",
    "ipa": "pʌŋkˈtɪliəs",
    "elo": 1280,
    "level": "advanced",
    "scenario": "Ra mắt nhà người yêu, bố bạn ấy PUNCTILIOUS từ cách rót trà tới cách cầm đũa, tui ngồi thẳng lưng mà trong lòng ét o ét.",
    "translationHint": "Kỹ lưỡng, câu nệ nghi thức",
    "upgradeModule": {
      "simpleSentence": "He is very careful about following rules and behavior.",
      "targetSlot": "careful about following rules",
      "academicOptions": [
        { "text": "punctilious observer", "nuance": "Người tuân thủ các quy tắc ứng xử hoặc chi tiết một cách cực kỳ nghiêm ngặt.", "formalityScore": 10 },
        { "text": "scrupulous", "nuance": "Cẩn trọng, có lương tâm.", "formalityScore": 9 },
        { "text": "meticulous", "nuance": "Tỉ mỉ.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "punct-", "meaning": "điểm/châm (point/prick)", "relatedWords": [{ "word": "punctual", "meaning": "đúng giờ (đúng điểm)" }, { "word": "puncture", "meaning": "đâm thủng" }, { "word": "punctuation", "meaning": "dấu câu" }] }
    }
  },
  {
    "id": "v227",
    "word": "PRECARIOUS",
    "ipa": "prɪˈkeəriəs",
    "elo": 1190,
    "level": "advanced",
    "scenario": "Chồng bát chưa rửa trong bồn đang ở thế PRECARIOUS, đứa nào trong phòng trọ đụng vào là tới công chuyện.",
    "translationHint": "Bấp bênh, nguy hiểm",
    "upgradeModule": {
      "simpleSentence": "His job is in a dangerous situation and might be lost.",
      "targetSlot": "in a dangerous situation",
      "academicOptions": [
        { "text": "precarious position", "nuance": "Vị thế không chắc chắn, có thể sụp đổ bất cứ lúc nào.", "formalityScore": 9 },
        { "text": "unstable", "nuance": "Không ổn định.", "formalityScore": 7 },
        { "text": "perilous", "nuance": "Hiểm nghèo.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "prec-", "meaning": "cầu xin (to pray - nghĩa gốc là thứ gì đó có được do 'cầu xin' nên không thuộc về mình, dễ mất)", "relatedWords": [{ "word": "pray", "meaning": "cầu nguyện" }, { "word": "imprecation", "meaning": "lời nguyền rủa" }] }
    }
  },
  {
    "id": "v228",
    "word": "PRESUMPTUOUS",
    "ipa": "prɪˈzʌmptʃuəs",
    "elo": 1260,
    "level": "advanced",
    "scenario": "Mới nói chuyện hai ngày đã tính tên con chung, PRESUMPTUOUS cỡ này thì delulu cũng phải gọi bằng sư phụ.",
    "translationHint": "Tự phụ, quá trớn",
    "upgradeModule": {
      "simpleSentence": "It was rude of him to assume I would pay for him.",
      "targetSlot": "rude of him to assume",
      "academicOptions": [
        { "text": "it is presumptuous to", "nuance": "Quá trớn khi dám giả định hoặc làm gì đó mà không có quyền/sự cho phép.", "formalityScore": 9 },
        { "text": "audacious", "nuance": "Táo bạo (có thể tích cực hoặc tiêu cực).", "formalityScore": 9 },
        { "text": "overconfident", "nuance": "Quá tự tin.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "pre-", "meaning": "trước", "relatedWords": [] },
      "root": { "text": "sum-", "meaning": "lấy (to take - nghĩa là chiếm lấy vị trí/quyền lợi trước khi được cho)", "relatedWords": [{ "word": "assume", "meaning": "giả định" }, { "word": "consume", "meaning": "tiêu thụ" }] }
    }
  },
  {
    "id": "v229",
    "word": "PRETENTIOUS",
    "ipa": "prɪˈtenʃəs",
    "elo": 1230,
    "level": "advanced",
    "scenario": "Menu quán ghi 'nước lọc tinh khiết từ tầng sâu cảm xúc' giá 45 nghìn, PRETENTIOUS tới mức tui gọi luôn để chụp, fomo mà.",
    "translationHint": "Giả tạo, tự cao tự đại",
    "upgradeModule": {
      "simpleSentence": "The restaurant is trying too hard to look fancy and expensive.",
      "targetSlot": "trying too hard to look fancy",
      "academicOptions": [
        { "text": "pretentious display", "nuance": "Sự làm màu, cố gắng tỏ ra đẳng cấp hoặc thông thái hơn thực tế.", "formalityScore": 8 },
        { "text": "ostentatious", "nuance": "Phô trương.", "formalityScore": 9 },
        { "text": "affected", "nuance": "Giả tạo, điệu bộ.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "pre-", "meaning": "trước", "relatedWords": [] },
      "root": { "text": "tend-", "meaning": "căng ra (to stretch - nghĩa là 'giăng cái bẫy' hình ảnh ra trước mặt người khác)", "relatedWords": [{ "word": "pretend", "meaning": "giả vờ" }, { "word": "extend", "meaning": "mở rộng" }] }
    }
  },
  {
    "id": "v230",
    "word": "PUGNACIOUS",
    "ipa": "pʌɡˈneɪʃəs",
    "elo": 1260,
    "level": "advanced",
    "scenario": "Con ngỗng nhà ngoại PUGNACIOUS dữ lắm, tui đi ngang sân thôi cũng bị rượt như nợ tiền nó, báo thủ của cả xóm.",
    "translationHint": "Hay gây gổ, hiếu chiến",
    "upgradeModule": {
      "simpleSentence": "He is always ready to fight or argue.",
      "targetSlot": "ready to fight or argue",
      "academicOptions": [
        { "text": "pugnacious character", "nuance": "Bản tính hung hăng, thích dùng nắm đấm hoặc tranh cãi nảy lửa.", "formalityScore": 9 },
        { "text": "belligerent", "nuance": "Hiếu chiến (thường dùng cho quốc gia/nhóm).", "formalityScore": 9 },
        { "text": "combative", "nuance": "Sẵn sàng chiến đấu.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "pugn-", "meaning": "nắm đấm (fist)", "relatedWords": [{ "word": "impugn", "meaning": "công kích/phản bác" }, { "word": "repugnant", "meaning": "đáng ghét (đẩy ra bằng nắm đấm)" }] }
    }
  },
  {
    "id": "v231",
    "word": "ABNEGATION",
    "ipa": "ˌæbnɪˈɡeɪʃn",
    "elo": 1380,
    "level": "expert",
    "scenario": "Nhường miếng gà rán cuối cho đứa bạn đang thất tình, mức ABNEGATION slay cỡ đó đáng ghi vào sử sách của nhóm.",
    "translationHint": "Sự hy sinh, từ bỏ quyền lợi",
    "upgradeModule": {
      "simpleSentence": "The king gave up his power for his people.",
      "targetSlot": "gave up his power",
      "academicOptions": [
        { "text": "self-abnegation", "nuance": "Sự quên mình, từ bỏ ý chí và ham muốn cá nhân vì mục tiêu cao cả.", "formalityScore": 10 },
        { "text": "renunciation", "nuance": "Sự từ bỏ (thường là quyền lực/niềm tin).", "formalityScore": 10 },
        { "text": "sacrifice", "nuance": "Hy sinh.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ab-", "meaning": "xa rời/từ bỏ", "relatedWords": [] },
      "root": { "text": "neg-", "meaning": "phủ nhận (to deny)", "relatedWords": [{ "word": "negative", "meaning": "tiêu cực" }, { "word": "negate", "meaning": "phủ định" }] }
    }
  },
  {
    "id": "v232",
    "word": "ABSTEMIOUS",
    "ipa": "əbˈstiːmiəs",
    "elo": 1420,
    "level": "expert",
    "scenario": "Đầu tuần thề sống ABSTEMIOUS, bỏ trà sữa bỏ đồ chiên, tối thứ Hai bạn rủ đi gà rán là gét gô liền.",
    "translationHint": "Tiết chế, điều độ (ăn uống)",
    "upgradeModule": {
      "simpleSentence": "He doesn't eat or drink much because he wants to be healthy.",
      "targetSlot": "doesn't eat or drink much",
      "academicOptions": [
        { "text": "abstemious habits", "nuance": "Thói quen ăn uống đạm bạc, kiêng khem và cực kỳ điều độ.", "formalityScore": 9 },
        { "text": "temperate", "nuance": "Chừng mực, điều độ.", "formalityScore": 9 },
        { "text": "austere", "nuance": "Khắc khổ.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ab-", "meaning": "xa rời", "relatedWords": [] },
      "root": { "text": "temetum-", "meaning": "đồ uống có cồn/rượu (strong drink)", "relatedWords": [{ "word": "abstemious", "meaning": "nghĩa gốc là tránh xa rượu" }] }
    }
  },
  {
    "id": "v233",
    "word": "ACERBIC",
    "ipa": "əˈsɜːbɪk",
    "elo": 1390,
    "level": "expert",
    "scenario": "Đăng ảnh tóc mới lên, bà chị họ comment ACERBIC 'cắt tiếc tiền ha', 50 like trong 5 phút, out trình luôn bài gốc.",
    "translationHint": "Chua cay, gay gắt",
    "upgradeModule": {
      "simpleSentence": "He made a very sharp and mean comment.",
      "targetSlot": "sharp and mean",
      "academicOptions": [
        { "text": "acerbic wit", "nuance": "Sự hài hước chua cay, thông minh nhưng đầy tính công kích.", "formalityScore": 9 },
        { "text": "caustic", "nuance": "Châm chọc, ăn mòn (như hóa chất).", "formalityScore": 10 },
        { "text": "acidic", "nuance": "Chua như axit.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "acer-", "meaning": "sắc/nhọn/chua (sharp/sour)", "relatedWords": [{ "word": "acid", "meaning": "axit" }, { "word": "acrid", "meaning": "hăng/nồng" }, { "word": "exacerbate", "meaning": "làm tệ hại thêm" }] }
    }
  },
  {
    "id": "v234",
    "word": "ACUMEN",
    "ipa": "ˈækjʊmən",
    "elo": 1400,
    "level": "expert",
    "scenario": "Đứa bạn có ACUMEN kinh doanh đỉnh nóc kịch trần, lấy sỉ bánh tráng về bán trong ký túc xá, một tuần đủ tiền đi Đà Lạt.",
    "translationHint": "Sự nhạy bén, sắc sảo",
    "upgradeModule": {
      "simpleSentence": "He has a great ability to understand and make good decisions in business.",
      "targetSlot": "ability to understand and make good decisions",
      "academicOptions": [
        { "text": "business acumen", "nuance": "Sự nhạy bén vượt trội trong việc phán đoán và ra quyết định kinh doanh.", "formalityScore": 9 },
        { "text": "shrewdness", "nuance": "Sự khôn ngoan, sắc sảo.", "formalityScore": 9 },
        { "text": "insight", "nuance": "Sự thấu suốt.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "acu-", "meaning": "nhọn/sắc (sharp)", "relatedWords": [{ "word": "acute", "meaning": "sắc bén/cấp tính" }, { "word": "acupuncture", "meaning": "châm cứu" }] }
    }
  },
  {
    "id": "v235",
    "word": "ADUMBRATE",
    "ipa": "ˈædʌmbreɪt",
    "elo": 1470,
    "level": "expert",
    "scenario": "Trưởng nhóm chỉ ADUMBRATE kế hoạch du lịch đúng một dòng 'đi biển', còn ai đặt phòng ai lo xe thì tùy duyên, toang chắc.",
    "translationHint": "Phác thảo, ám chỉ sơ lược",
    "upgradeModule": {
      "simpleSentence": "The report only gave a brief and dark outline of the problem.",
      "targetSlot": "brief and dark outline",
      "academicOptions": [
        { "text": "adumbrate the future", "nuance": "Phác thảo mờ nhạt hoặc tiên đoán lờ mờ về tương lai.", "formalityScore": 10 },
        { "text": "foreshadow", "nuance": "Báo trước, hé lộ (thường dùng trong văn học).", "formalityScore": 9 },
        { "text": "sketch out", "nuance": "Phác họa nhanh.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad-", "meaning": "hướng tới", "relatedWords": [] },
      "root": { "text": "umbra-", "meaning": "bóng tối (shadow)", "relatedWords": [{ "word": "umbrella", "meaning": "cái ô (thứ tạo ra bóng mát)" }, { "word": "penumbra", "meaning": "vùng nửa tối" }] }
    }
  },
  {
    "id": "v236",
    "word": "ANACHRONISM",
    "ipa": "əˈnækrənɪzəm",
    "elo": 1440,
    "level": "expert",
    "scenario": "Bố tui vẫn in bản đồ ra giấy trước mỗi chuyến đi, ANACHRONISM vậy mà đọc đường keo lỳ hơn cả Google Maps.",
    "translationHint": "Sự lỗi thời, sai thời đại",
    "upgradeModule": {
      "simpleSentence": "The character in the movie wearing a watch in 1700 was a mistake.",
      "targetSlot": "mistake",
      "academicOptions": [
        { "text": "historical anachronism", "nuance": "Một sự vật/sự kiện bị đặt sai dòng thời gian lịch sử.", "formalityScore": 10 },
        { "text": "anomaly", "nuance": "Sự bất thường.", "formalityScore": 8 },
        { "text": "archaic", "nuance": "Cổ xưa, không còn hợp thời.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ana-", "meaning": "ngược lại (against)", "relatedWords": [] },
      "root": { "text": "chron-", "meaning": "thời gian (time)", "relatedWords": [{ "word": "chronology", "meaning": "niên đại học" }, { "word": "synchronize", "meaning": "đồng bộ" }] }
    }
  },
  {
    "id": "v237",
    "word": "ANATHEMA",
    "ipa": "əˈnæθəmə",
    "elo": 1460,
    "level": "expert",
    "scenario": "Với dân ở trọ, tin nhắn 'tháng sau tăng giá điện' là ANATHEMA, đọc xong xỉu ngang, chỉ muốn chặn số chủ nhà.",
    "translationHint": "Điều cực kỳ ghét bỏ",
    "upgradeModule": {
      "simpleSentence": "Violence is something he hates very much.",
      "targetSlot": "something he hates very much",
      "academicOptions": [
        { "text": "be anathema to", "nuance": "Một thứ gì đó bị coi là ghê tởm, đáng nguyền rủa hoặc hoàn toàn trái ngược với niềm tin.", "formalityScore": 10 },
        { "text": "abhorrent", "nuance": "Đáng ghét, đáng ghê tởm.", "formalityScore": 10 },
        { "text": "repugnant", "nuance": "Mâu thuẫn, đáng ghét.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ana-", "meaning": "lên trên", "relatedWords": [] },
      "root": { "text": "tithemi-", "meaning": "đặt (to set/place - nghĩa gốc là vật hiến tế đặt trên bàn thờ để nguyền rủa/loại bỏ)", "relatedWords": [{ "word": "theme", "meaning": "chủ đề (thứ được đặt ra)" }] }
    }
  },
  {
    "id": "v238",
    "word": "APOCRYPHAL",
    "ipa": "əˈpɒkrɪfl",
    "elo": 1450,
    "level": "expert",
    "scenario": "Chuyện 'anh kia học tiếng Anh hai tuần nói như người bản xứ' nghe APOCRYPHAL ghê, vậy mà cả lớp vẫn lưu lại để manifest.",
    "translationHint": "Không xác thực, bị bịa đặt",
    "upgradeModule": {
      "simpleSentence": "The story about the ghost is probably not true.",
      "targetSlot": "probably not true",
      "academicOptions": [
        { "text": "apocryphal tale", "nuance": "Câu chuyện được lưu truyền rộng rãi nhưng tính xác thực cực kỳ nghi ngờ.", "formalityScore": 9 },
        { "text": "dubious", "nuance": "Đáng ngờ.", "formalityScore": 8 },
        { "text": "spurious", "nuance": "Giả mạo, sai trái.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "apo-", "meaning": "xa rời", "relatedWords": [] },
      "root": { "text": "kryptein-", "meaning": "che giấu (to hide)", "relatedWords": [{ "word": "crypt", "meaning": "hầm mộ" }, { "word": "cryptography", "meaning": "mật mã học" }, { "word": "cryptic", "meaning": "bí ẩn" }] }
    }
  },
  {
    "id": "v239",
    "word": "APOTHEOSIS",
    "ipa": "əˌɒθiˈəʊsɪs",
    "elo": 1490,
    "level": "expert",
    "scenario": "Giật được deal 0 đồng đúng 0 giờ 0 phút là APOTHEOSIS của sự nghiệp săn sale, tui flex với cả group tới sáng.",
    "translationHint": "Đỉnh cao, sự thần thánh hóa",
    "upgradeModule": {
      "simpleSentence": "Winning the Nobel prize was the best point of his life.",
      "targetSlot": "best point",
      "academicOptions": [
        { "text": "the apotheosis of", "nuance": "Giai đoạn phát triển rực rỡ nhất hoặc ví dụ hoàn hảo nhất về một thứ gì đó.", "formalityScore": 10 },
        { "text": "pinnacle", "nuance": "Đỉnh cao thành tựu.", "formalityScore": 9 },
        { "text": "epitome", "nuance": "Ví dụ điển hình nhất.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "apo-", "meaning": "thay đổi/xa rời", "relatedWords": [] },
      "root": { "text": "theos-", "meaning": "thần (god - nghĩa là biến một người thành thần)", "relatedWords": [{ "word": "theology", "meaning": "thần học" }, { "word": "atheism", "meaning": "thuyết vô thần" }] }
    }
  },
  {
    "id": "v240",
    "word": "APPROBATION",
    "ipa": "ˌæprəˈbeɪʃn",
    "elo": 1430,
    "level": "expert",
    "scenario": "Mặc áo mới về quê, cả họ check var từ đầu tới chân, phải có APPROBATION của bà nội thì mới thôi bàn tán.",
    "translationHint": "Sự tán thành, chấp thuận",
    "upgradeModule": {
      "simpleSentence": "The crowd showed their formal approval.",
      "targetSlot": "formal approval",
      "academicOptions": [
        { "text": "official approbation", "nuance": "Sự công nhận và khen ngợi chính thức từ cơ quan hoặc cấp trên.", "formalityScore": 10 },
        { "text": "commendation", "nuance": "Sự tuyên dương.", "formalityScore": 10 },
        { "text": "endorsement", "nuance": "Sự bảo đảm/xác nhận ủng hộ.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad/ap-", "meaning": "hướng tới", "relatedWords": [] },
      "root": { "text": "prob-", "meaning": "tốt/thử nghiệm (good/test - nghĩa gốc là công nhận cái gì đó đạt chuẩn tốt sau khi thử)", "relatedWords": [{ "word": "probe", "meaning": "thăm dò" }, { "word": "probable", "meaning": "có khả năng (có thể chứng minh)" }, { "word": "prove", "meaning": "chứng minh" }] }
    }
  },
  {
    "id": "v241",
    "word": "ARCANE",
    "ipa": "ɑːˈkeɪn",
    "elo": 1380,
    "level": "expert",
    "scenario": "Luật chơi board game đứa bạn mang tới ARCANE thật, đọc hướng dẫn 40 phút mà cả đám chưa ai biết đi lượt đầu, ủa alo.",
    "translationHint": "Bí ẩn, kỳ bí, khó hiểu",
    "upgradeModule": {
      "simpleSentence": "The rules of the game were very old and secret.",
      "targetSlot": "old and secret",
      "academicOptions": [
        { "text": "arcane rituals", "nuance": "Những nghi lễ bí truyền, cổ xưa và cực kỳ khó hiểu với người ngoài.", "formalityScore": 9 },
        { "text": "esoteric", "nuance": "Chuyên sâu, bí truyền (thiên về kiến thức nhóm nhỏ).", "formalityScore": 9 },
        { "text": "recondite", "nuance": "Ít người biết, mờ mịt.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "arca-", "meaning": "cái rương/hòm (chest/box - nghĩa là thứ được cất kỹ trong hòm)", "relatedWords": [{ "word": "ark", "meaning": "con tàu cứu thế/hòm giao ước" }] }
    }
  },
  {
    "id": "v242",
    "word": "ARRANT",
    "ipa": "ˈærənt",
    "elo": 1460,
    "level": "expert",
    "scenario": "Hứa làm slide rồi biến mất cả tuần, hôm thuyết trình hỏi 'mình làm phần nào ta', đúng là báo thủ ARRANT.",
    "translationHint": "Hoàn toàn, hết sức (nghĩa xấu)",
    "upgradeModule": {
      "simpleSentence": "That is a complete lie.",
      "targetSlot": "complete",
      "academicOptions": [
        { "text": "arrant nonsense", "nuance": "Sự vô nghĩa hoàn toàn, không thể bào chữa được (dùng để nhấn mạnh sự tệ hại).", "formalityScore": 9 },
        { "text": "utter", "nuance": "Hoàn toàn (thông dụng).", "formalityScore": 7 },
        { "text": "unmitigated", "nuance": "Tuyệt đối, không hề giảm nhẹ (unmitigated disaster).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "errant-", "meaning": "đi lang thang (wandering - biến thể từ 'errant', ám chỉ những kẻ lừa đảo đi lang thang)", "relatedWords": [{ "word": "error", "meaning": "sai lầm" }, { "word": "erratic", "meaning": "thất thường" }] }
    }
  },
  {
    "id": "v243",
    "word": "ARTIFICE",
    "ipa": "ˈɑːtɪfɪs",
    "elo": 1420,
    "level": "expert",
    "scenario": "Bài đăng 'pass lại vì không vừa size' của shop thực ra là ARTIFICE để đẩy hàng tồn, tui bị thao túng tâm lý hai lần rồi.",
    "translationHint": "Mưu mẹo, sự đánh tráo giả tạo",
    "upgradeModule": {
      "simpleSentence": "He used a clever trick to win the game.",
      "targetSlot": "clever trick",
      "academicOptions": [
        { "text": "political artifice", "nuance": "Thủ đoạn chính trị tinh vi nhằm đánh lừa dư luận.", "formalityScore": 10 },
        { "text": "stratagem", "nuance": "Chiến lược, mưu đồ để đánh bại đối thủ.", "formalityScore": 9 },
        { "text": "deception", "nuance": "Sự lừa dối.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "arti-", "meaning": "kỹ năng/nghệ thuật (skill)", "relatedWords": [{ "word": "art", "meaning": "nghệ thuật" }, { "word": "artifact", "meaning": "hiện vật (vật có bàn tay người làm)" }] },
      "root2": { "text": "fac/fic-", "meaning": "làm (to make)", "relatedWords": [{ "word": "factory", "meaning": "nhà máy" }, { "word": "fiction", "meaning": "hư cấu" }] }
    }
  },
  {
    "id": "v244",
    "word": "ASCETIC",
    "ipa": "əˈsetɪk",
    "elo": 1440,
    "level": "expert",
    "scenario": "Tuần thi cuối kỳ tui sống ASCETIC: xóa TikTok, ăn cơm hộp, ngủ bốn tiếng, fomo cỡ nào cũng không cài lại.",
    "translationHint": "Khổ hạnh, tu hành",
    "upgradeModule": {
      "simpleSentence": "He lives a very simple life without any pleasure.",
      "targetSlot": "very simple life without any pleasure",
      "academicOptions": [
        { "text": "ascetic lifestyle", "nuance": "Lối sống khổ hạnh, tự kỷ luật nghiêm khắc và từ bỏ mọi thú vui vật chất.", "formalityScore": 10 },
        { "text": "austere", "nuance": "Khắc khổ, đơn giản.", "formalityScore": 9 },
        { "text": "spartan", "nuance": "Kỷ luật, thiếu tiện nghi (như người Sparta).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "askesis-", "meaning": "rèn luyện/luyện tập (exercise/training - nghĩa gốc là việc rèn luyện của vận động viên Hy Lạp)", "relatedWords": [] }
    }
  },
  {
    "id": "v245",
    "word": "ASSIDUOUS",
    "ipa": "əˈsɪdjuəs",
    "elo": 1390,
    "level": "expert",
    "scenario": "Đứa bạn ASSIDUOUS nhất lớp ghi chép bằng năm màu bút, vở đẹp đỉnh nóc kịch trần, mùa thi cả lớp xếp hàng xin chụp.",
    "translationHint": "Cần cù, siêng năng",
    "upgradeModule": {
      "simpleSentence": "She is a very hard-working student.",
      "targetSlot": "hard-working",
      "academicOptions": [
        { "text": "assiduous effort", "nuance": "Sự nỗ lực kiên trì, làm việc bền bỉ và vô cùng tỉ mỉ.", "formalityScore": 9 },
        { "text": "diligent", "nuance": "Siêng năng (thông dụng hơn).", "formalityScore": 7 },
        { "text": "sedulous", "nuance": "Chăm chỉ, cần mẫn (rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad-", "meaning": "đến/tới", "relatedWords": [] },
      "root": { "text": "sed-", "meaning": "ngồi (to sit - nghĩa là ngồi lì một chỗ để làm việc cho xong)", "relatedWords": [{ "word": "sedentary", "meaning": "ít vận động (ngồi nhiều)" }, { "word": "sediment", "meaning": "trầm tích (thứ lắng xuống)" }, { "word": "resident", "meaning": "cư dân" }] }
    }
  },
  {
    "id": "v246",
    "word": "ATAVISTIC",
    "ipa": "ˌætəˈvɪstɪk",
    "elo": 1480,
    "level": "expert",
    "scenario": "Nghe tiếng mở cửa lúc đang lén chơi game là bật dậy giả bộ học, phản xạ ATAVISTIC từ hồi lớp 5 vẫn còn nguyên.",
    "translationHint": "Mang tính bản năng nguyên thủy",
    "upgradeModule": {
      "simpleSentence": "The fear of the dark is a very old human feeling.",
      "targetSlot": "very old human feeling",
      "academicOptions": [
        { "text": "atavistic impulse", "nuance": "Một xung năng nguyên thủy, gợi lại những bản năng từ tổ tiên xa xưa.", "formalityScore": 10 },
        { "text": "primal", "nuance": "Nguyên thủy, căn bản nhất.", "formalityScore": 9 },
        { "text": "instinctive", "nuance": "Thuộc về bản năng.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "atavus-", "meaning": "ông cụ/tổ tiên (great-grandfather's grandfather)", "relatedWords": [{ "word": "avuncular", "meaning": "thuộc về người chú" }] }
    }
  },
  {
    "id": "v247",
    "word": "ATTENUATE",
    "ipa": "əˈtenjueɪt",
    "elo": 1410,
    "level": "expert",
    "scenario": "Tai nghe chống ồn cũng chỉ ATTENUATE được phần nào tiếng karaoke nhà hàng xóm, phần còn lại thấm thẳng vào tim.",
    "translationHint": "Làm yếu đi, giảm cường độ",
    "upgradeModule": {
      "simpleSentence": "The earplugs helped make the noise lower.",
      "targetSlot": "make the noise lower",
      "academicOptions": [
        { "text": "attenuate the signal", "nuance": "Làm suy giảm cường độ hoặc giá trị của một thứ gì đó (thường dùng trong kỹ thuật/vật lý).", "formalityScore": 9 },
        { "text": "weaken", "nuance": "Làm yếu đi (thông dụng).", "formalityScore": 6 },
        { "text": "diminish", "nuance": "Làm giảm bớt quy mô/tầm quan trọng.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad-", "meaning": "hướng tới", "relatedWords": [] },
      "root": { "text": "tenu-", "meaning": "mỏng/mảnh (thin)", "relatedWords": [{ "word": "tenuous", "meaning": "mong manh" }, { "word": "tenuity", "meaning": "sự thanh mảnh" }, { "word": "extenuating", "meaning": "giảm nhẹ (tình tiết)" }] }
    }
  },
  {
    "id": "v248",
    "word": "AUGUST",
    "ipa": "ɔːˈɡʌst",
    "elo": 1370,
    "level": "expert",
    "scenario": "Bước vào hội trường AUGUST của lễ tốt nghiệp, áo cử nhân thì đi thuê, dưới tà áo là đôi dép tổ ong, vẫn slay.",
    "translationHint": "Uy nghi, đáng kính",
    "upgradeModule": {
      "simpleSentence": "The old university is a very respected place.",
      "targetSlot": "respected",
      "academicOptions": [
        { "text": "august institution", "nuance": "Một tổ chức uy nghiêm, có lịch sử lâu đời và đáng kính trọng.", "formalityScore": 10 },
        { "text": "venerable", "nuance": "Đáng tôn kính (thường do tuổi tác/lịch sử).", "formalityScore": 10 },
        { "text": "distinguished", "nuance": "Lỗi lạc, xuất sắc.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "aug-", "meaning": "tăng trưởng/thêm vào (to increase - nghĩa gốc là làm cho vĩ đại hơn)", "relatedWords": [{ "word": "augment", "meaning": "tăng cường" }, { "word": "auction", "meaning": "đấu giá (nơi giá tăng dần)" }, { "word": "author", "meaning": "tác giả (người tạo ra/làm lớn mạnh ý tưởng)" }] }
    }
  },
  {
    "id": "v249",
    "word": "AVARICE",
    "ipa": "ˈævərɪs",
    "elo": 1430,
    "level": "expert",
    "scenario": "Chủ trọ tăng tiền điện lên 4 nghìn một số, AVARICE lộ liễu tới mức cả dãy trọ lập group riêng để than, red flag to đùng.",
    "translationHint": "Lòng tham tiền bạc",
    "upgradeModule": {
      "simpleSentence": "He was driven by his desire for more money.",
      "targetSlot": "desire for more money",
      "academicOptions": [
        { "text": "insatiable avarice", "nuance": "Lòng tham không đáy đối với của cải và vật chất.", "formalityScore": 10 },
        { "text": "greed", "nuance": "Lòng tham (thông dụng).", "formalityScore": 6 },
        { "text": "cupidity", "nuance": "Sự tham lam quá mức.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "avere-", "meaning": "khao khát mạnh mẽ (to desire eagerly)", "relatedWords": [{ "word": "avid", "meaning": "khao khát/say mê" }] }
    }
  },
  {
    "id": "v250",
    "word": "BELLICOSE",
    "ipa": "ˈbelɪkəʊs",
    "elo": 1400,
    "level": "expert",
    "scenario": "Đói mà chưa được ăn trưa là tui thành BELLICOSE liền, ai hỏi 'ăn gì' cũng muốn cãi tay đôi.",
    "translationHint": "Hiếu chiến, thích gây hấn",
    "upgradeModule": {
      "simpleSentence": "The leader's speech was very aggressive and sounded like he wanted war.",
      "targetSlot": "aggressive",
      "academicOptions": [
        { "text": "bellicose rhetoric", "nuance": "Những lời lẽ sặc mùi hiếu chiến, kích động xung đột.", "formalityScore": 10 },
        { "text": "belligerent", "nuance": "Hung hăng, sẵn sàng chiến đấu.", "formalityScore": 9 },
        { "text": "pugnacious", "nuance": "Thích tranh cãi (thiên về tính cách).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "bell-", "meaning": "chiến tranh (war)", "relatedWords": [{ "word": "rebellion", "meaning": "cuộc nổi loạn" }, { "word": "belligerent", "meaning": "hiếu chiến" }] },
      "suffix": { "text": "-ose", "meaning": "đầy rẫy (full of)", "relatedWords": [{ "word": "verbose", "meaning": "dài dòng" }, { "word": "grandiose", "meaning": "phô trương" }] }
    }
  },
  {
    "id": "v251",
    "word": "BYZANTINE",
    "ipa": "ˈbɪzəntiːn",
    "elo": 1470,
    "level": "expert",
    "scenario": "Thủ tục xin giấy xác nhận sinh viên BYZANTINE thật: ba phòng, bốn con dấu, hai tuần và một câu 'mai quay lại em', ét o ét.",
    "translationHint": "Rắc rối, cực kỳ phức tạp",
    "upgradeModule": {
      "simpleSentence": "The law is very complicated and difficult to follow.",
      "targetSlot": "complicated",
      "academicOptions": [
        { "text": "byzantine bureaucracy", "nuance": "Hệ thống quản lý cực kỳ rắc rối, cứng nhắc và thiếu minh bạch.", "formalityScore": 10 },
        { "text": "convoluted", "nuance": "Xoắn xuýt, phức tạp.", "formalityScore": 8 },
        { "text": "labyrinthine", "nuance": "Rắc rối như mê cung.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "Byzantium-", "meaning": "đế quốc Byzantine (nổi tiếng với bộ máy chính trị cực kỳ rắc rối và mưu mô)", "relatedWords": [] }
    }
  },
  {
    "id": "v252",
    "word": "CAPRICIOUS",
    "ipa": "kəˈprɪʃəs",
    "elo": 1390,
    "level": "expert",
    "scenario": "Crush CAPRICIOUS tới mức hôm qua rep sau năm giây, hôm nay seen ba tiếng, tui check var lịch sử chat vẫn không ra quy luật.",
    "translationHint": "Thất thường, hay thay đổi",
    "upgradeModule": {
      "simpleSentence": "The weather is very unstable today.",
      "targetSlot": "unstable",
      "academicOptions": [
        { "text": "capricious nature", "nuance": "Bản chất hay thay đổi đột ngột, không theo một quy luật nào.", "formalityScore": 9 },
        { "text": "fickle", "nuance": "Hay thay đổi (thường dùng cho tình cảm/sở thích).", "formalityScore": 7 },
        { "text": "mercurial", "nuance": "Thất thường, nhanh nhẹn nhưng khó đoán.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "capriccio-", "meaning": "con dê (goat - bắt nguồn từ việc con dê hay nhảy nhót lung tung không đoán được)", "relatedWords": [] }
    }
  },
  {
    "id": "v253",
    "word": "CASTIGATE",
    "ipa": "ˈkæstɪɡeɪt",
    "elo": 1450,
    "level": "expert",
    "scenario": "Cô chủ nhiệm CASTIGATE cả lớp mười lăm phút vì vụ trốn tiết, xong mới phát hiện thủ phạm là lớp kế bên, ủa alo.",
    "translationHint": "Chỉ trích dữ dội",
    "upgradeModule": {
      "simpleSentence": "The manager shouted at the employee for the mistake.",
      "targetSlot": "shouted at",
      "academicOptions": [
        { "text": "publicly castigate", "nuance": "Trừng phạt hoặc chỉ trích nặng nề trước đám đông.", "formalityScore": 10 },
        { "text": "reprimand", "nuance": "Khiển trách chính thức.", "formalityScore": 9 },
        { "text": "chastise", "nuance": "Trừng phạt, mắng nhiếc.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "cast-", "meaning": "thuần khiết (pure - nghĩa gốc là trừng phạt để làm cho người đó 'sạch tội')", "relatedWords": [{ "word": "caste", "meaning": "đẳng cấp" }, { "word": "chaste", "meaning": "trinh bạch/thuần khiết" }] },
      "suffix": { "text": "-ate", "meaning": "động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v254",
    "word": "CAUSTIC",
    "ipa": "ˈkɔːstɪk",
    "elo": 1410,
    "level": "expert",
    "scenario": "Đứa em họ comment CAUSTIC dưới ảnh tui đi Đà Lạt: 'cảnh đẹp, tiếc là có người', tới công chuyện với nó.",
    "translationHint": "Cay nghiệt, châm chọc",
    "upgradeModule": {
      "simpleSentence": "He made a very sharp and unkind remark.",
      "targetSlot": "sharp and unkind",
      "academicOptions": [
        { "text": "caustic wit", "nuance": "Sự hài hước chua cay, có tính sát thương cao bằng lời lẽ.", "formalityScore": 9 },
        { "text": "acerbic", "nuance": "Chua cay, sắc sảo.", "formalityScore": 9 },
        { "text": "mordant", "nuance": "Châm biếm cay độc (như vết cắn).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "kaustos-", "meaning": "đốt cháy (burnt - như hóa chất ăn mòn da)", "relatedWords": [{ "word": "holocaust", "meaning": "sự hủy diệt lớn (đốt cháy hoàn toàn)" }, { "word": "cauterize", "meaning": "đốt vết thương (để cầm máu)" }] }
    }
  },
  {
    "id": "v255",
    "word": "CHICANERY",
    "ipa": "ʃɪˈkeɪnəri",
    "elo": 1480,
    "level": "expert",
    "scenario": "Shop xài đủ CHICANERY: giá gạch, mã giảm 'chỉ còn 2 phút', đồng hồ đếm ngược reset mỗi lần vào lại, thao túng tâm lý dữ.",
    "translationHint": "Mánh khóe, thủ thuật lừa dối",
    "upgradeModule": {
      "simpleSentence": "The lawyer used clever tricks to win.",
      "targetSlot": "clever tricks",
      "academicOptions": [
        { "text": "legal chicanery", "nuance": "Việc sử dụng các kẽ hở pháp lý tinh vi để đánh lừa hoặc trục lợi.", "formalityScore": 10 },
        { "text": "subterfuge", "nuance": "Mưu đồ, thủ đoạn lén lút.", "formalityScore": 10 },
        { "text": "trickery", "nuance": "Sự lừa đảo (thông dụng).", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "chicaner-", "meaning": "cãi vã/mưu mẹo (to quibble)", "relatedWords": [{ "word": "chicane", "meaning": "đường chữ S (để ngăn cản/đánh lừa tốc độ)" }] }
    }
  },
  {
    "id": "v256",
    "word": "CHURLISH",
    "ipa": "ˈtʃɜːlɪʃ",
    "elo": 1380,
    "level": "expert",
    "scenario": "Bạn cùng phòng mượn sạc ba ngày chưa trả, nhắc thì đáp 'gì căng' cực CHURLISH, tui lặng lẽ đổi mật khẩu wifi.",
    "translationHint": "Thô lỗ, mất lịch sự",
    "upgradeModule": {
      "simpleSentence": "It was very rude of him to refuse the gift.",
      "targetSlot": "rude",
      "academicOptions": [
        { "text": "churlish behavior", "nuance": "Hành xử thô lỗ, thiếu giáo dục và không biết điều.", "formalityScore": 9 },
        { "text": "boorish", "nuance": "Cục súc, thô bỉ.", "formalityScore": 10 },
        { "text": "surly", "nuance": "Cáu kỉnh, khó tính.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "churl-", "meaning": "người nông dân/người thô kệch (peasant/fellow)", "relatedWords": [] }
    }
  },
  {
    "id": "v257",
    "word": "CIRCUMLOCUTION",
    "ipa": "ˌsɜːkəmləˈkjuːʃn",
    "elo": 1490,
    "level": "expert",
    "scenario": "Hỏi 'có đi chơi khum' mà nó trả lời cả đoạn CIRCUMLOCUTION về lịch học với thời tiết, dịch ra là khum.",
    "translationHint": "Cách nói vòng vo, dài dòng",
    "upgradeModule": {
      "simpleSentence": "He used too many words to explain a simple thing.",
      "targetSlot": "used too many words",
      "academicOptions": [
        { "text": "evasive circumlocution", "nuance": "Cách nói vòng vo để né tránh câu trả lời trực tiếp.", "formalityScore": 10 },
        { "text": "periphrasis", "nuance": "Cách dùng cụm từ dài thay cho một từ ngắn (thuật ngữ ngôn ngữ học).", "formalityScore": 10 },
        { "text": "verbosity", "nuance": "Sự dài dòng văn tự.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "circum-", "meaning": "vòng quanh (around)", "relatedWords": [{ "word": "circumstance", "meaning": "hoàn cảnh" }] },
      "root": { "text": "loqu-", "meaning": "nói (to speak)", "relatedWords": [{ "word": "eloquent", "meaning": "hùng biện" }, { "word": "soliloquy", "meaning": "độc thoại" }, { "word": "colloquial", "meaning": "thông tục" }] }
    }
  },
  {
    "id": "v258",
    "word": "CLAIRVOYANT",
    "ipa": "kleəˈvɔɪənt",
    "elo": 1420,
    "level": "expert",
    "scenario": "Mẹ tui CLAIRVOYANT thật, chưa kịp kể đã biết tháng này cháy túi, gọi video câu đầu là 'gửi thêm hả con', out trình thầy bói.",
    "translationHint": "Sáng suốt, có khả năng tiên đoán",
    "upgradeModule": {
      "simpleSentence": "She seems to know the future.",
      "targetSlot": "know the future",
      "academicOptions": [
        { "text": "clairvoyant abilities", "nuance": "Khả năng nhìn thấu những thứ mắt thường không thấy hoặc tương lai.", "formalityScore": 9 },
        { "text": "prophetic", "nuance": "Mang tính tiên tri.", "formalityScore": 9 },
        { "text": "prescient", "nuance": "Biết trước việc gì sẽ xảy ra.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "clair-", "meaning": "sáng sủa/rõ ràng (clear)", "relatedWords": [{ "word": "clarify", "meaning": "làm rõ" }] },
      "root2": { "text": "voy-", "meaning": "nhìn thấy (to see)", "relatedWords": [{ "word": "vision", "meaning": "tầm nhìn" }, { "word": "visible", "meaning": "có thể thấy" }] }
    }
  },
  {
    "id": "v259",
    "word": "CLOYING",
    "ipa": "ˈklɔɪɪŋ",
    "elo": 1360,
    "level": "expert",
    "scenario": "Cặp đôi phòng bên gọi nhau 'bé iu' cả buổi tối, độ CLOYING cỡ này thì cả dãy trọ ăn cơm chó tới no.",
    "translationHint": "Ngọt xớt, giả tạo đến phát ngấy",
    "upgradeModule": {
      "simpleSentence": "The music was too sweet and sentimental.",
      "targetSlot": "too sweet and sentimental",
      "academicOptions": [
        { "text": "cloying sentimentality", "nuance": "Sự ủy mị sướt mướt thái quá gây cảm giác khó chịu.", "formalityScore": 9 },
        { "text": "saccharine", "nuance": "Ngọt xớt (như đường hóa học).", "formalityScore": 10 },
        { "text": "mawkish", "nuance": "Ủy mị đến mức buồn nôn.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "cloie-", "meaning": "đóng đinh/lấp đầy (to nail/stop up - nghĩa là ăn ngọt quá mức làm 'lấp đầy' dạ dày không nạp thêm được gì)", "relatedWords": [] }
    }
  },
  {
    "id": "v260",
    "word": "COGENT",
    "ipa": "ˈkəʊdʒənt",
    "elo": 1380,
    "level": "expert",
    "scenario": "Tui soạn 10 slide lý lẽ COGENT xin bố mẹ cho đi Đà Lạt, bố xem hết rồi hỏi đúng một câu 'tiền ai trả', toang.",
    "translationHint": "Vững chắc, có sức thuyết phục",
    "upgradeModule": {
      "simpleSentence": "He gave a very strong and clear reason.",
      "targetSlot": "strong and clear reason",
      "academicOptions": [
        { "text": "cogent argument", "nuance": "Lập luận sắc bén, logic và vô cùng thuyết phục.", "formalityScore": 9 },
        { "text": "compelling", "nuance": "Hấp dẫn, đầy sức thuyết phục.", "formalityScore": 8 },
        { "text": "lucid", "nuance": "Sáng sủa, dễ hiểu.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "co-", "meaning": "cùng nhau (together)", "relatedWords": [] },
      "root": { "text": "ag-", "meaning": "thúc đẩy/làm (to drive/do - nghĩa là gom đống lý lẽ lại để thúc đẩy lòng tin)", "relatedWords": [{ "word": "agent", "meaning": "đại diện" }, { "word": "agile", "meaning": "nhanh nhẹn" }] }
    }
  },
  {
    "id": "v261",
    "word": "COMPUNCTION",
    "ipa": "kəmˈpʌŋkʃn",
    "elo": 1430,
    "level": "expert",
    "scenario": "Nó ăn hết hộp bánh tui mua mà không có chút COMPUNCTION nào, còn trách tui mua ít, ra đường tôi nể mỗi bạn.",
    "translationHint": "Sự hối hận, cắn rứt lương tâm",
    "upgradeModule": {
      "simpleSentence": "He felt no regret for what he did.",
      "targetSlot": "regret",
      "academicOptions": [
        { "text": "no compunction about", "nuance": "Không một chút áy náy lương tâm khi làm điều gì đó sai trái.", "formalityScore": 10 },
        { "text": "remorse", "nuance": "Sự hối hận sâu sắc.", "formalityScore": 9 },
        { "text": "scruple", "nuance": "Sự đắn đo do lương tâm.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "com-", "meaning": "hoàn toàn", "relatedWords": [] },
      "root": { "text": "pung/punct-", "meaning": "đâm/châm (to prick - nghĩa là cảm giác bị lương tâm 'châm chích')", "relatedWords": [{ "word": "puncture", "meaning": "đâm thủng" }, { "word": "pungent", "meaning": "hăng/cay nồng" }, { "word": "punctual", "meaning": "đúng giờ" }] }
    }
  },
  {
    "id": "v262",
    "word": "CONFLAGRATION",
    "ipa": "ˌkɒnfləˈɡreɪʃn",
    "elo": 1460,
    "level": "expert",
    "scenario": "Câu hỏi 'pizza có nên bỏ dứa không' biến group lớp thành một CONFLAGRATION ba trăm tin nhắn, cả đám hóng biến tới khuya.",
    "translationHint": "Đám cháy lớn, sự xung đột dữ dội",
    "upgradeModule": {
      "simpleSentence": "The small fire grew into a giant blaze.",
      "targetSlot": "giant blaze",
      "academicOptions": [
        { "text": "massive conflagration", "nuance": "Một vụ hỏa hoạn khổng lồ hoặc một cuộc xung đột thảm khốc tàn phá mọi thứ.", "formalityScore": 10 },
        { "text": "inferno", "nuance": "Biển lửa, địa ngục trần gian.", "formalityScore": 9 },
        { "text": "holocaust", "nuance": "Sự hủy diệt hàng loạt (đặc biệt là bằng lửa).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "con-", "meaning": "hoàn toàn", "relatedWords": [] },
      "root": { "text": "flagr-", "meaning": "cháy rực (to burn)", "relatedWords": [{ "word": "flagrant", "meaning": "trắng trợn (cháy hừng hực)" }] }
    }
  },
  {
    "id": "v263",
    "word": "CONSTERNATION",
    "ipa": "ˌkɒnstəˈneɪʃn",
    "elo": 1460,
    "level": "expert",
    "scenario": "Cả phòng thi chìm trong CONSTERNATION khi đề ra đúng chương cô dặn 'phần này không cần học đâu', xu cà na gì đâu.",
    "translationHint": "Sự kinh hoàng, tiệt vọng",
    "upgradeModule": {
      "simpleSentence": "The news caused a lot of shock and worry.",
      "targetSlot": "shock and worry",
      "academicOptions": [
        { "text": "utter consternation", "nuance": "Sự bàng hoàng, kinh ngạc pha lẫn lo sợ tột độ trước một tin xấu.", "formalityScore": 10 },
        { "text": "dismay", "nuance": "Sự mất tinh thần, thất vọng.", "formalityScore": 8 },
        { "text": "trepidation", "nuance": "Sự run rẩy, lo sợ.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "con-", "meaning": "hoàn toàn", "relatedWords": [] },
      "root": { "text": "stern-", "meaning": "trải ra/ném xuống (to strew/throw down - nghĩa là bị đánh gục hoàn toàn)", "relatedWords": [{ "word": "prostrate", "meaning": "phủ phục" }] }
    }
  },
  {
    "id": "v264",
    "word": "CRAVEN",
    "ipa": "ˈkreɪvən",
    "elo": 1400,
    "level": "expert",
    "scenario": "Chó nhà hàng xóm sủa một tiếng là nó đẩy tui lên trước rồi chạy, màn CRAVEN nhất tui từng thấy, red flag tình bạn.",
    "translationHint": "Hèn nhát",
    "upgradeModule": {
      "simpleSentence": "His behavior was very cowardly.",
      "targetSlot": "cowardly",
      "academicOptions": [
        { "text": "craven act", "nuance": "Hành động hèn nhát đến mức đáng khinh bỉ, thiếu hẳn lòng tự trọng.", "formalityScore": 10 },
        { "text": "pusillanimous", "nuance": "Nhút nhát, hèn mọn (rất trang trọng).", "formalityScore": 10 },
        { "text": "timid", "nuance": "Rụt rè.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "cravant-", "meaning": "bị đánh bại/nghiền nát (crushed/defeated)", "relatedWords": [] }
    }
  },
  {
    "id": "v265",
    "word": "CONTRITE",
    "ipa": "ˈkɒntraɪt",
    "elo": 1370,
    "level": "expert",
    "scenario": "Đứa bạn làm đổ trà sữa lên laptop tui, mặt CONTRITE tới mức tui phải quay qua an ủi ngược lại nó.",
    "translationHint": "Ăn năn, hối lỗi",
    "upgradeModule": {
      "simpleSentence": "He felt very sorry for his mistake.",
      "targetSlot": "very sorry",
      "academicOptions": [
        { "text": "contrite heart", "nuance": "Sự ăn năn hối lỗi chân thành vì đã làm sai.", "formalityScore": 9 },
        { "text": "penitents", "nuance": "Người hối lỗi (thường dùng trong tôn giáo).", "formalityScore": 10 },
        { "text": "remorseful", "nuance": "Hối hận.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "con-", "meaning": "hoàn toàn", "relatedWords": [] },
      "root": { "text": "trit-", "meaning": "chà xát/nghiền nát (to rub/wear away - nghĩa là bị mặc cảm tội lỗi nghiền nát)", "relatedWords": [{ "word": "attrition", "meaning": "sự hao mòn" }, { "word": "detritus", "meaning": "mảnh vụn" }, { "word": "trite", "meaning": "tầm thường (bị dùng mòn rồi)" }] }
    }
  },
  {
    "id": "v266",
    "word": "CONVIVIAL",
    "ipa": "kənˈvɪviəl",
    "elo": 1360,
    "level": "expert",
    "scenario": "Bữa lẩu ở trọ CONVIVIAL tới nỗi phòng bên sang xin nước mắm rồi ngồi lại luôn tới khuya, chữa lành thật sự.",
    "translationHint": "Vui vẻ, thân thiện",
    "upgradeModule": {
      "simpleSentence": "The party was full of life and friendly people.",
      "targetSlot": "full of life and friendly",
      "academicOptions": [
        { "text": "convivial atmosphere", "nuance": "Bầu không khí lễ hội vui tươi, mọi người hòa đồng và hiếu khách.", "formalityScore": 9 },
        { "text": "gregarious", "nuance": "Thích giao du, hòa đồng.", "formalityScore": 9 },
        { "text": "jovial", "nuance": "Vui vẻ, hớn hở.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "con-", "meaning": "cùng nhau", "relatedWords": [] },
      "root": { "text": "viv-", "meaning": "sống (to live - nghĩa gốc là 'sống cùng nhau' một cách vui vẻ)", "relatedWords": [{ "word": "revive", "meaning": "hồi sinh" }, { "word": "vivid", "meaning": "sống động" }, { "word": "survive", "meaning": "sống sót" }] }
    }
  },
  {
    "id": "v267",
    "word": "COPIOUS",
    "ipa": "ˈkəʊpiəs",
    "elo": 1370,
    "level": "expert",
    "scenario": "Bà ngoại gói đồ COPIOUS cho tui lên lại thành phố: ba bao gạo, hai can nước mắm và một con gà còn đang gáy, đỉnh nóc kịch trần.",
    "translationHint": "Dồi dào, phong phú",
    "upgradeModule": {
      "simpleSentence": "She took many pages of notes.",
      "targetSlot": "many pages of",
      "academicOptions": [
        { "text": "copious amounts of", "nuance": "Một lượng rất lớn và dồi dào (thường dùng cho dữ liệu, thông tin, đồ uống).", "formalityScore": 9 },
        { "text": "abundant", "nuance": "Dư thừa, dồi dào.", "formalityScore": 7 },
        { "text": "profuse", "nuance": "Dồi dào quá mức (profuse sweating).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "copia-", "meaning": "dồi dào/nguồn lực (plenty/resources)", "relatedWords": [{ "word": "cornucopia", "meaning": "chiếc sừng sung túc" }, { "word": "copy", "meaning": "bản sao (nghĩa gốc là làm cho dồi dào thêm)" }] }
    }
  },
  {
    "id": "v268",
    "word": "CUPIDITY",
    "ipa": "kjuːˈpɪdɪti",
    "elo": 1450,
    "level": "expert",
    "scenario": "CUPIDITY trỗi dậy đúng lúc thấy livestream xả kho đồng giá 1 nghìn, canh tới 3 giờ sáng được đúng cái móc khóa, fomo mà.",
    "translationHint": "Lòng tham (đặc biệt là tiền bạc)",
    "upgradeModule": {
      "simpleSentence": "The man's greed was his downfall.",
      "targetSlot": "greed",
      "academicOptions": [
        { "text": "naked cupidity", "nuance": "Lòng tham lam trần trụi đối với của cải, không hề che giấu.", "formalityScore": 10 },
        { "text": "avarice", "nuance": "Lòng tham tiền bạc (rất trang trọng).", "formalityScore": 10 },
        { "text": "rapacity", "nuance": "Sự tham tàn, cướp đoạt.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "cupid-", "meaning": "khao khát/mong muốn (desire - thần tình ái Cupid)", "relatedWords": [{ "word": "covet", "meaning": "thèm muốn" }] }
    }
  },
  {
    "id": "v269",
    "word": "DEARTH",
    "ipa": "dɜːθ",
    "elo": 1390,
    "level": "expert",
    "scenario": "Mùa thi ở thư viện là DEARTH ổ cắm trầm trọng, ai ngồi gần ổ điện là người quyền lực nhất tầng, real.",
    "translationHint": "Sự khan hiếm, thiếu thốn",
    "upgradeModule": {
      "simpleSentence": "There is a lack of water in the desert.",
      "targetSlot": "lack",
      "academicOptions": [
        { "text": "dearth of resources", "nuance": "Sự thiếu hụt nghiêm trọng dẫn đến khó khăn.", "formalityScore": 9 },
        { "text": "scarcity", "nuance": "Sự khan hiếm.", "formalityScore": 9 },
        { "text": "paucity", "nuance": "Sự ít ỏi, thiếu thốn.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "dere-", "meaning": "đắt đỏ/quý giá (dear - nghĩa là khi thứ gì đó khan hiếm thì nó sẽ trở nên rất đắt đỏ)", "relatedWords": [] }
    }
  },
  {
    "id": "v270",
    "word": "DEFERENCE",
    "ipa": "ˈdefərəns",
    "elo": 1400,
    "level": "expert",
    "scenario": "Về quê ăn Tết, tui chào họ hàng với DEFERENCE tuyệt đối, cho tới khi nghe câu 'có bồ chưa' là tới công chuyện.",
    "translationHint": "Sự tôn trọng, cung kính",
    "upgradeModule": {
      "simpleSentence": "He showed respect to his boss's decision.",
      "targetSlot": "respect",
      "academicOptions": [
        { "text": "show deference to", "nuance": "Sự nhường nhịn và tôn kính đối với người có địa vị hoặc kiến thức cao hơn.", "formalityScore": 9 },
        { "text": "veneration", "nuance": "Sự sùng kính.", "formalityScore": 10 },
        { "text": "obeisance", "nuance": "Sự phủ phục, tôn kính tuyệt đối.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "de-", "meaning": "xuống", "relatedWords": [] },
      "root": { "text": "fer-", "meaning": "mang/vác (to carry - nghĩa là 'mang' ý kiến của mình hạ xuống trước người khác)", "relatedWords": [{ "word": "transfer", "meaning": "chuyển giao" }, { "word": "offer", "meaning": "đề nghị" }, { "word": "refer", "meaning": "tham chiếu" }] }
    }
  },
  {
    "id": "v271",
    "word": "DELETERIOUS",
    "ipa": "ˌdelɪˈtɪəriəs",
    "elo": 1440,
    "level": "expert",
    "scenario": "Thức tới 3 giờ cày phim rồi sáng nốc ba ly cà phê, combo DELETERIOUS cho da mặt đỉnh nóc kịch trần luôn á.",
    "translationHint": "Gây hại, có tác động xấu",
    "upgradeModule": {
      "simpleSentence": "Stress is bad for your health.",
      "targetSlot": "bad for",
      "academicOptions": [
        { "text": "deleterious effect", "nuance": "Tác động gây hại nghiêm trọng, thường dùng trong ngữ cảnh khoa học hoặc xã hội.", "formalityScore": 10 },
        { "text": "detrimental", "nuance": "Gây bất lợi, có hại.", "formalityScore": 8 },
        { "text": "pernicious", "nuance": "Độc hại một cách âm thầm và hiểm độc.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "deleter-", "meaning": "kẻ hủy diệt/người xóa bỏ (destroyer)", "relatedWords": [{ "word": "delete", "meaning": "xóa bỏ" }, { "word": "indelible", "meaning": "không thể tẩy xóa" }] }
    }
  },
  {
    "id": "v272",
    "word": "DENOUEMENT",
    "ipa": "deɪˈnuːmɒŋ",
    "elo": 1460,
    "level": "expert",
    "scenario": "Drama group lớp cãi nhau ba ngày ba đêm, DENOUEMENT là cả đám rủ nhau đi ăn lẩu như chưa có gì, hóng biến uổng công.",
    "translationHint": "Kết cục, hạ màn",
    "upgradeModule": {
      "simpleSentence": "The end of the movie was very surprising.",
      "targetSlot": "end",
      "academicOptions": [
        { "text": "dramatic denouement", "nuance": "Đoạn kết nơi mọi nút thắt của cốt truyện được tháo gỡ.", "formalityScore": 10 },
        { "text": "culmination", "nuance": "Điểm cao trào dẫn đến kết thúc.", "formalityScore": 9 },
        { "text": "aftermath", "nuance": "Hệ quả sau một sự kiện lớn (thường là tiêu cực).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "de-", "meaning": "mở ra/ngược lại", "relatedWords": [] },
      "root": { "text": "nouer-", "meaning": "thắt nút (to knot - nghĩa gốc là 'mở nút thắt')", "relatedWords": [{ "word": "node", "meaning": "nút/điểm nút" }, { "word": "nodule", "meaning": "nốt nhỏ" }] }
    }
  },
  {
    "id": "v273",
    "word": "DESULTORY",
    "ipa": "ˈdesəltri",
    "elo": 1470,
    "level": "expert",
    "scenario": "Ôn tiếng Anh kiểu DESULTORY, hôm nay Writing, mai lướt TikTok tips, tuần sau quên luôn mình đang học tới đâu, hết cứu.",
    "translationHint": "Rời rạc, thiếu hệ thống",
    "upgradeModule": {
      "simpleSentence": "He worked in a random way without a plan.",
      "targetSlot": "random way without a plan",
      "academicOptions": [
        { "text": "desultory fashion", "nuance": "Làm việc kiểu nhảy cóc, hời hợt, thiếu tập trung và mục đích.", "formalityScore": 9 },
        { "text": "haphazard", "nuance": "May rủi, ngẫu nhiên không tính toán.", "formalityScore": 8 },
        { "text": "perfunctory", "nuance": "Làm cho có lệ, chiếu lệ.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "desultor-", "meaning": "người nhảy ngựa (vận động viên xiếc nhảy từ ngựa này sang ngựa khác)", "relatedWords": [{ "word": "salient", "meaning": "nổi bật (nhảy vọt lên)" }, { "word": "result", "meaning": "kết quả (nhảy ra từ...)" }] }
    }
  },
  {
    "id": "v274",
    "word": "INVETERATE",
    "ipa": "ɪnˈvetərət",
    "elo": 1410,
    "level": "expert",
    "scenario": "Nó là đứa INVETERATE trễ hẹn, hẹn 7 giờ thì đúng 7 giờ mới bắt đầu đi tắm, red flag mà cả group quen luôn rồi.",
    "translationHint": "Thâm căn cố đế, khó bỏ",
    "upgradeModule": {
      "simpleSentence": "He is a long-time gambler.",
      "targetSlot": "long-time",
      "academicOptions": [
        { "text": "inveterate gambler", "nuance": "Một thói quen đã ăn sâu vào máu, cực kỳ khó thay đổi.", "formalityScore": 9 },
        { "text": "chronic", "nuance": "Mãn tính (thường dùng cho bệnh lý).", "formalityScore": 7 },
        { "text": "entrenched", "nuance": "Đã bám rễ sâu, vững chắc.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "vào trong/hoàn toàn", "relatedWords": [] },
      "root": { "text": "veter-", "meaning": "già/cũ (old)", "relatedWords": [{ "word": "veteran", "meaning": "cựu chiến binh" }, { "word": "veterinary", "meaning": "thú y (nghĩa gốc là chăm sóc súc vật già làm việc)" }] }
    }
  },
  {
    "id": "v275",
    "word": "LACHRYMOSE",
    "ipa": "ˈlækrɪməʊs",
    "elo": 1450,
    "level": "expert",
    "scenario": "Bộ phim Hàn này LACHRYMOSE dữ thần, mới tập hai mà hộp khăn giấy của cả phòng trọ đã toang.",
    "translationHint": "Hay khóc, ủy mị, gây xúc động mạnh",
    "upgradeModule": {
      "simpleSentence": "The movie was very sad and made everyone cry.",
      "targetSlot": "sad and made everyone cry",
      "academicOptions": [
        { "text": "lachrymose drama", "nuance": "Mang tính bi lụy, gợi nước mắt một cách thái quá.", "formalityScore": 10 },
        { "text": "tearful", "nuance": "Đẫm lệ.", "formalityScore": 6 },
        { "text": "maudlin", "nuance": "Ủy mị sướt mướt (thường do say xỉn hoặc quá đà).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "lachrym-", "meaning": "nước mắt (tear)", "relatedWords": [{ "word": "lachrymal", "meaning": "thuộc về tuyến lệ" }] },
      "suffix": { "text": "-ose", "meaning": "đầy rẫy", "relatedWords": [{ "word": "verbose", "meaning": "dài dòng" }] }
    }
  },
  {
    "id": "v276",
    "word": "LAMBASTE",
    "ipa": "læmˈbeɪst",
    "elo": 1420,
    "level": "expert",
    "scenario": "Quán trà sữa tăng giá mà ly còn nhỏ lại, dân Threads LAMBASTE suốt đêm, sáng ra quán lặng lẽ xóa bài, tới công chuyện.",
    "translationHint": "Chỉ trích gay gắt",
    "upgradeModule": {
      "simpleSentence": "The critics attacked the play severely.",
      "targetSlot": "attacked",
      "academicOptions": [
        { "text": "severely lambaste", "nuance": "Đánh đập bằng lời lẽ, phê bình không thương tiếc.", "formalityScore": 9 },
        { "text": "castigate", "nuance": "Trừng phạt bằng lời chỉ trích nặng nề.", "formalityScore": 10 },
        { "text": "berate", "nuance": "Mắng mỏ nhiếc móc.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "lam-", "meaning": "đánh/vả (to beat)", "relatedWords": [] },
      "root2": { "text": "baste-", "meaning": "đánh bằng gậy (to thrash)", "relatedWords": [] }
    }
  },
  {
    "id": "v277",
    "word": "LANGUID",
    "ipa": "ˈlæŋɡwɪd",
    "elo": 1380,
    "level": "expert",
    "scenario": "Ăn xong cơm trưa văn phòng là cả team LANGUID như cá phơi khô, sếp hỏi gì cũng gật, lowkey đang ngủ gục.",
    "translationHint": "Uể oải, lờ đờ",
    "upgradeModule": {
      "simpleSentence": "We had a slow and relaxed afternoon by the pool.",
      "targetSlot": "slow and relaxed",
      "academicOptions": [
        { "text": "languid pace", "nuance": "Chậm chạp, thiếu sức sống hoặc thư thái một cách lười biếng.", "formalityScore": 9 },
        { "text": "lethargic", "nuance": "Uể oải, hôn mê nhẹ.", "formalityScore": 8 },
        { "text": "listless", "nuance": "Lờ đờ, không có chút hứng thú nào.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "lang-", "meaning": "lỏng lẻo/yếu (slack/loose)", "relatedWords": [{ "word": "languish", "meaning": "ốm yếu/hao mòn" }, { "word": "languor", "meaning": "sự tiều tụy" }] }
    }
  },
  {
    "id": "v278",
    "word": "LOQUACIOUS",
    "ipa": "ləˈkweɪʃəs",
    "elo": 1390,
    "level": "expert",
    "scenario": "Bác tài Grab LOQUACIOUS cỡ nào mà đi có mười lăm phút, mình đã thuộc hết lịch sử tình trường của bác, out trình podcast.",
    "translationHint": "Nói nhiều, huyên thuyên",
    "upgradeModule": {
      "simpleSentence": "He is a very talkative person.",
      "targetSlot": "talkative",
      "academicOptions": [
        { "text": "loquacious guest", "nuance": "Người nói rất nhiều, thao thao bất tuyệt (đôi khi gây phiền).", "formalityScore": 9 },
        { "text": "garrulous", "nuance": "Ba hoa, nói những chuyện vụn vặt.", "formalityScore": 10 },
        { "text": "verbose", "nuance": "Dài dòng văn tự (thiên về văn viết).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "loqu-", "meaning": "nói (to speak)", "relatedWords": [{ "word": "eloquent", "meaning": "hùng biện" }, { "word": "colloquial", "meaning": "thông tục" }, { "word": "soliloquy", "meaning": "độc thoại" }] },
      "suffix": { "text": "-acious", "meaning": "đầy rẫy/có xu hướng", "relatedWords": [] }
    }
  },
  {
    "id": "v279",
    "word": "MACHIAVELLIAN",
    "ipa": "ˌmækiəˈveliən",
    "elo": 1490,
    "level": "expert",
    "scenario": "Nó khen mình nấu ăn ngon đúng hôm tới lượt nó rửa chén, nước cờ MACHIAVELLIAN thao túng tâm lý này mình nhận ra quá trễ.",
    "translationHint": "Xảo quyệt, mưu mô chính trị",
    "upgradeModule": {
      "simpleSentence": "He used clever and dishonest ways to get power.",
      "targetSlot": "clever and dishonest ways",
      "academicOptions": [
        { "text": "machiavellian scheme", "nuance": "Mưu đồ xảo quyệt, đặt mục đích lên trên đạo đức.", "formalityScore": 10 },
        { "text": "cunning", "nuance": "Láu cá, khôn vặt.", "formalityScore": 7 },
        { "text": "scheming", "nuance": "Luôn toan tính, lập mưu.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "Machiavelli-", "meaning": "Niccolò Machiavelli (tác giả cuốn 'Quân Vương', nổi tiếng với tư tưởng chính trị thực dụng/tàn nhẫn)", "relatedWords": [] }
    }
  },
  {
    "id": "v280",
    "word": "MAGNILOQUENT",
    "ipa": "mæɡˈnɪləkwənt",
    "elo": 1480,
    "level": "expert",
    "scenario": "Bio Tinder ghi \"kiến tạo tương lai\" nghe MAGNILOQUENT vậy chứ hỏi ra là đang bán sim số đẹp, ô dề ghê.",
    "translationHint": "Nói khoác lác, khoa trương",
    "upgradeModule": {
      "simpleSentence": "The leader used very grand and impressive words.",
      "targetSlot": "grand and impressive words",
      "academicOptions": [
        { "text": "magniloquent style", "nuance": "Văn phong hoa mỹ quá mức nhằm gây ấn tượng một cách hợm hĩnh.", "formalityScore": 10 },
        { "text": "grandiloquent", "nuance": "Tương tự magniloquent.", "formalityScore": 10 },
        { "text": "pompous", "nuance": "Vênh váo, tự cao.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "magn-", "meaning": "to lớn (great)", "relatedWords": [{ "word": "magnify", "meaning": "phóng to" }] },
      "root2": { "text": "loqu-", "meaning": "nói (to speak)", "relatedWords": [] }
    }
  },
  {
    "id": "v281",
    "word": "MALADROIT",
    "ipa": "ˌmæləˈdrɔɪt",
    "elo": 1420,
    "level": "expert",
    "scenario": "Định thả thính crush bằng một câu thơ, gõ sai chính tả ngay chữ \"yêu\", màn MALADROIT nhất học kỳ, u là trời.",
    "translationHint": "Vụng về, thiếu khéo léo",
    "upgradeModule": {
      "simpleSentence": "His handling of the situation was very clumsy.",
      "targetSlot": "clumsy",
      "academicOptions": [
        { "text": "maladroit attempt", "nuance": "Nỗ lực vụng về, thiếu sự tinh tế trong xử lý tình huống.", "formalityScore": 9 },
        { "text": "inept", "nuance": "Thiếu khả năng, dở tệ.", "formalityScore": 10 },
        { "text": "bungling", "nuance": "Làm hỏng việc do vụng về.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "mal-", "meaning": "xấu/tồi tệ", "relatedWords": [{ "word": "malfunction", "meaning": "lỗi" }] },
      "root": { "text": "adroit-", "meaning": "khéo léo (nghĩa gốc là 'tay phải' - người thuận tay phải thời xưa được coi là khéo hơn)", "relatedWords": [{ "word": "adroit", "meaning": "khéo léo" }] }
    }
  },
  {
    "id": "v282",
    "word": "MALAISE",
    "ipa": "məˈleɪz",
    "elo": 1400,
    "level": "expert",
    "scenario": "Tối chủ nhật nào cũng lowkey có một cái MALAISE khó tả, chưa ai nhắc mà cơ thể đã biết mai là thứ hai.",
    "translationHint": "Sự khó chịu, bất an mơ hồ",
    "upgradeModule": {
      "simpleSentence": "The country is in a general feeling of unhappiness.",
      "targetSlot": "feeling of unhappiness",
      "academicOptions": [
        { "text": "economic malaise", "nuance": "Tình trạng trì trệ, khó chịu và bất ổn chung của nền kinh tế.", "formalityScore": 10 },
        { "text": "disquiet", "nuance": "Sự băn khoăn, không yên tâm.", "formalityScore": 9 },
        { "text": "ennui", "nuance": "Sự chán chường do thiếu mục đích sống.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "mal-", "meaning": "xấu/tệ", "relatedWords": [] },
      "root": { "text": "aise-", "meaning": "thoải mái (ease)", "relatedWords": [{ "word": "ease", "meaning": "sự dễ dàng" }, { "word": "disease", "meaning": "bệnh tật (không thoải mái)" }] }
    }
  },
  {
    "id": "v283",
    "word": "MERETRICIOUS",
    "ipa": "ˌmerɪˈtrɪʃəs",
    "elo": 1470,
    "level": "expert",
    "scenario": "Quán cà phê decor MERETRICIOUS hết cỡ, chụp ảnh slay thật nhưng ly bạc xỉu uống y nước đường.",
    "translationHint": "Hào nhoáng nhưng vô giá trị",
    "upgradeModule": {
      "simpleSentence": "The decorations were cheap and flashy.",
      "targetSlot": "cheap and flashy",
      "academicOptions": [
        { "text": "meretricious ornament", "nuance": "Vẻ đẹp giả tạo, hào nhoáng bề ngoài để lừa dối nhưng rỗng tuếch bên trong.", "formalityScore": 10 },
        { "text": "gaudy", "nuance": "Lòe loẹt, rẻ tiền.", "formalityScore": 7 },
        { "text": "specious", "nuance": "Có vẻ đúng/đẹp nhưng thực chất là sai/xấu.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "meretric-", "meaning": "kỹ nữ (prostitute - nghĩa gốc là món đồ trang sức của kỹ nữ để thu hút khách)", "relatedWords": [{ "word": "merit", "meaning": "xứng đáng/công trạng (cùng gốc 'kiếm tiền')" }] }
    }
  },
  {
    "id": "v284",
    "word": "METTLESOME",
    "ipa": "ˈmetlsəm",
    "elo": 1440,
    "level": "expert",
    "scenario": "Đứa bạn METTLESOME dám tỏ tình crush ngay giữa tiệc sinh nhật đông người, cả bàn nín thở, ra đường tôi nể mỗi bạn.",
    "translationHint": "Dũng cảm, đầy nghị lực",
    "upgradeModule": {
      "simpleSentence": "The young soldier was very brave.",
      "targetSlot": "brave",
      "academicOptions": [
        { "text": "mettlesome spirit", "nuance": "Tinh thần hăng hái, đầy dũng khí và không khuất phục.", "formalityScore": 9 },
        { "text": "plucky", "nuance": "Gan góc, can trường (thường dùng cho người nhỏ bé).", "formalityScore": 8 },
        { "text": "intrepid", "nuance": "Gan dạ, không biết sợ là gì.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "mettle-", "meaning": "bản lĩnh/khí chất (biến thể từ 'metal' - kim loại quý trong con người)", "relatedWords": [{ "word": "metal", "meaning": "kim loại" }] }
    }
  },
  {
    "id": "v285",
    "word": "MISANTHROPIC",
    "ipa": "ˌmɪzənˈθrɒpɪk",
    "elo": 1460,
    "level": "expert",
    "scenario": "Sau ba tháng ở trọ chung năm người, mình thành MISANTHROPIC lúc nào không hay, giờ chỉ chữa lành bằng cách nói chuyện với con mèo.",
    "translationHint": "Ghét người, lánh đời",
    "upgradeModule": {
      "simpleSentence": "He hates people and avoids society.",
      "targetSlot": "hates people",
      "academicOptions": [
        { "text": "misanthropic hermit", "nuance": "Thái độ chán ghét loài người và xa lánh xã hội.", "formalityScore": 10 },
        { "text": "cynical", "nuance": "Hoài nghi nhân thế.", "formalityScore": 8 },
        { "text": "asocial", "nuance": "Không thích giao du.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "mis-", "meaning": "ghét (hate)", "relatedWords": [{ "word": "misogyny", "meaning": "ghét phụ nữ" }, { "word": "misstep", "meaning": "bước sai (nghĩa khác)" }] },
      "root": { "text": "anthrop-", "meaning": "con người (human)", "relatedWords": [{ "word": "anthropology", "meaning": "nhân chủng học" }, { "word": "philanthropy", "meaning": "lòng yêu người/từ thiện" }] }
    }
  },
  {
    "id": "v286",
    "word": "MNEMONIC",
    "ipa": "nɪˈmɒnɪk",
    "elo": 1380,
    "level": "expert",
    "scenario": "Cô dạy cái MNEMONIC để nhớ thứ tự các hành tinh, giờ mình nhớ y câu thần chú mà quên mất nó dùng để làm gì, hết cứu.",
    "translationHint": "Thuật ghi nhớ",
    "upgradeModule": {
      "simpleSentence": "This is a good way to help you remember names.",
      "targetSlot": "way to help you remember",
      "academicOptions": [
        { "text": "mnemonic device", "nuance": "Công cụ hỗ trợ trí nhớ (như vè, thơ, hoặc từ viết tắt).", "formalityScore": 9 },
        { "text": "memory aid", "nuance": "Hỗ trợ trí nhớ (thông dụng).", "formalityScore": 7 },
        { "text": "aide-mémoire", "nuance": "Văn bản ghi nhớ/nhắc nhở (rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "mnemon-", "meaning": "trí nhớ (memory - vị thần Mnemosyne trong thần thoại Hy Lạp)", "relatedWords": [{ "word": "amnesia", "meaning": "chứng mất trí nhớ" }, { "word": "amnesty", "meaning": "ân xá (lãng quên tội lỗi)" }] }
    }
  },
  {
    "id": "v287",
    "word": "MORDANT",
    "ipa": "ˈmɔːdnt",
    "elo": 1430,
    "level": "expert",
    "scenario": "Thằng bạn comment MORDANT dưới ảnh mới của mình: \"Filter xịn đó, gửi tên app đi\". Kém miếng khó chịu.",
    "translationHint": "Châm chọc, cay nghiệt",
    "upgradeModule": {
      "simpleSentence": "He has a very sharp and critical sense of humor.",
      "targetSlot": "sharp and critical",
      "academicOptions": [
        { "text": "mordant wit", "nuance": "Sự châm biếm sắc lẹm, có tính 'cắn xé' và gây đau đớn.", "formalityScore": 10 },
        { "text": "caustic", "nuance": "Châm chọc ăn mòn.", "formalityScore": 9 },
        { "text": "sardonic", "nuance": "Mỉa mai, nhạo báng.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "mord-", "meaning": "cắn (to bite)", "relatedWords": [{ "word": "remorse", "meaning": "hối hận (lương tâm cắn rứt)" }, { "word": "morsel", "meaning": "miếng nhỏ (vừa một miếng cắn)" }] }
    }
  },
  {
    "id": "v288",
    "word": "MUNIFICENT",
    "ipa": "mjuːˈnɪfɪsnt",
    "elo": 1410,
    "level": "expert",
    "scenario": "Bà ngoại MUNIFICENT đỉnh nóc kịch trần, về quê ba ngày mà được dúi tiền, gà, gạo, cả bao xoài mang lên trọ.",
    "translationHint": "Hào phóng, cực kỳ rộng rãi",
    "upgradeModule": {
      "simpleSentence": "The rich man gave a very big gift to the hospital.",
      "targetSlot": "very big gift",
      "academicOptions": [
        { "text": "munificent donation", "nuance": "Sự tặng thưởng cực kỳ hào phóng, vượt xa mong đợi.", "formalityScore": 10 },
        { "text": "magnanimous", "nuance": "Hào hiệp, cao thượng.", "formalityScore": 9 },
        { "text": "bountiful", "nuance": "Dồi dào, hậu hĩnh.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "munus-", "meaning": "quà tặng/nhiệm vụ (gift/service)", "relatedWords": [{ "word": "remuneration", "meaning": "tiền thù lao" }, { "word": "immunity", "meaning": "miễn dịch (miễn trừ nhiệm vụ)" }, { "word": "community", "meaning": "cộng đồng (cùng thực hiện nhiệm vụ)" }] },
      "root2": { "text": "fac/fic-", "meaning": "làm (to make)", "relatedWords": [] }
    }
  },
  {
    "id": "v289",
    "word": "NEBULOUS",
    "ipa": "ˈnebjʊləs",
    "elo": 1390,
    "level": "expert",
    "scenario": "Hỏi \"mình là gì của nhau\", người ta đáp \"thì cứ vậy đi\", câu trả lời NEBULOUS cỡ này là red flag rồi.",
    "translationHint": "Mơ hồ, mù mờ",
    "upgradeModule": {
      "simpleSentence": "His ideas for the project are still very unclear.",
      "targetSlot": "very unclear",
      "academicOptions": [
        { "text": "nebulous concept", "nuance": "Mơ hồ như một đám mây, thiếu hình dáng và chi tiết rõ ràng.", "formalityScore": 9 },
        { "text": "vague", "nuance": "Mơ hồ (thông dụng).", "formalityScore": 7 },
        { "text": "amorphous", "nuance": "Không có hình dạng nhất định.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "nebul-", "meaning": "đám mây/sương mù (cloud/mist)", "relatedWords": [{ "word": "nebula", "meaning": "tinh vân" }] }
    }
  },
  {
    "id": "v290",
    "word": "NOISOME",
    "ipa": "ˈnɔɪsəm",
    "elo": 1420,
    "level": "expert",
    "scenario": "Mở tủ lạnh phòng trọ sau kỳ nghỉ Tết, mùi NOISOME xộc ra làm cả dãy trọ ét o ét.",
    "translationHint": "Hôi thối, khó chịu kinh khủng",
    "upgradeModule": {
      "simpleSentence": "There is a very bad smell coming from the kitchen.",
      "targetSlot": "very bad smell",
      "academicOptions": [
        { "text": "noisome odor", "nuance": "Mùi hôi thối nồng nặc gây buồn nôn hoặc độc hại.", "formalityScore": 10 },
        { "text": "malodorous", "nuance": "Có mùi hôi (rất trang trọng).", "formalityScore": 10 },
        { "text": "fetid", "nuance": "Hôi thối.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "annoy-", "meaning": "làm phiền/gây hại (biến thể từ 'annoy' - nghĩa gốc là gây hại cho sức khỏe)", "relatedWords": [{ "word": "annoy", "meaning": "làm phiền" }] }
    }
  },
  {
    "id": "v291",
    "word": "OBDURATE",
    "ipa": "ˈɒbdjʊrət",
    "elo": 1440,
    "level": "expert",
    "scenario": "Ba mình OBDURATE lắm, nói mạng chậm là do trời mưa, check var cỡ nào cũng không chịu thay cái router đời 2015.",
    "translationHint": "Cứng đầu, ngoan cố",
    "upgradeModule": {
      "simpleSentence": "The leader was very stubborn and refused to change.",
      "targetSlot": "very stubborn",
      "academicOptions": [
        { "text": "obdurate resistance", "nuance": "Sự kháng cự cứng đầu, không hề lay chuyển trước lý lẽ hay tình cảm.", "formalityScore": 10 },
        { "text": "intransigent", "nuance": "Cứng nhắc, không thỏa hiệp.", "formalityScore": 9 },
        { "text": "obstinate", "nuance": "Lỳ lợm.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob-", "meaning": "chống lại/hoàn toàn", "relatedWords": [] },
      "root": { "text": "dur-", "meaning": "cứng/lâu dài (hard/lasting)", "relatedWords": [{ "word": "durable", "meaning": "bền bỉ" }, { "word": "endure", "meaning": "chịu đựng" }, { "word": "duress", "meaning": "sự cưỡng ép (cứng rắn)" }] }
    }
  },
  {
    "id": "v292",
    "word": "OBSTREPEROUS",
    "ipa": "əbˈstrepərəs",
    "elo": 1470,
    "level": "expert",
    "scenario": "Nhóm bàn bên OBSTREPEROUS từ đầu tới cuối, hát karaoke ngay trong quán cà phê học bài, nhắc ba lần vẫn hát, đúng báo thủ.",
    "translationHint": "Ồn ào bướng bỉnh, khó kiểm soát",
    "upgradeModule": {
      "simpleSentence": "The noisy and difficult crowd was hard to manage.",
      "targetSlot": "noisy and difficult",
      "academicOptions": [
        { "text": "obstreperous behavior", "nuance": "Hành vi ồn ào, ngang ngược và chống đối lại sự kiểm soát.", "formalityScore": 10 },
        { "text": "unruly", "nuance": "Ngỗ ngược, vô kỷ luật.", "formalityScore": 8 },
        { "text": "boisterous", "nuance": "Náo nhiệt, huyên náo (đôi khi mang nghĩa tích cực).", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob-", "meaning": "chống lại", "relatedWords": [] },
      "root": { "text": "streper-", "meaning": "gây tiếng động lớn (to make a noise)", "relatedWords": [] }
    }
  },
  {
    "id": "v293",
    "word": "OBTUSE",
    "ipa": "əbˈtjuːs",
    "elo": 1380,
    "level": "expert",
    "scenario": "Crush thả tim mọi story của mình mà mình tưởng người ta lỡ tay, nhìn lại mới thấy bản thân OBTUSE cỡ nào, u là trời.",
    "translationHint": "Chậm hiểu, đần độn",
    "upgradeModule": {
      "simpleSentence": "Are you being intentionally stupid?",
      "targetSlot": "stupid",
      "academicOptions": [
        { "text": "deliberately obtuse", "nuance": "Cố tình giả vờ chậm hiểu để né tránh vấn đề hoặc làm khó người khác.", "formalityScore": 9 },
        { "text": "dim-witted", "nuance": "Đần độn (thông dụng).", "formalityScore": 5 },
        { "text": "imperceptive", "nuance": "Thiếu nhạy bén, không nhận thức được.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob-", "meaning": "đối diện/ngược lại", "relatedWords": [] },
      "root": { "text": "tund/tus-", "meaning": "đánh/mài (to beat/dull - nghĩa là bị đánh cho cùn đi, không còn sắc bén)", "relatedWords": [{ "word": "contusion", "meaning": "vết bầm tím" }] }
    }
  },
  {
    "id": "v294",
    "word": "OFFICIOUS",
    "ipa": "əˈfɪʃəs",
    "elo": 1410,
    "level": "expert",
    "scenario": "Cô chủ trọ OFFICIOUS tới mức biết mình chia tay trước cả mình, còn ghé hỏi \"có cần cô giới thiệu đứa khác khum\".",
    "translationHint": "Hay lanh chanh, thích can thiệp chuyện người khác",
    "upgradeModule": {
      "simpleSentence": "He is always trying to tell people what to do when they don't want help.",
      "targetSlot": "trying to tell people what to do",
      "academicOptions": [
        { "text": "officious bystander", "nuance": "Người ngoài cuộc lanh chanh, thích can thiệp vào việc không phải của mình.", "formalityScore": 9 },
        { "text": "meddlesome", "nuance": "Hay can thiệp, xía vào chuyện người khác.", "formalityScore": 8 },
        { "text": "intrusive", "nuance": "Xâm phạm quyền riêng tư.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "offici-", "meaning": "nhiệm vụ/chức vụ (duty/office - nghĩa gốc là lạm dụng chức vụ để làm phiền)", "relatedWords": [{ "word": "office", "meaning": "văn phòng" }, { "word": "official", "meaning": "chính thức" }] }
    }
  },
  {
    "id": "v295",
    "word": "OLEAGINOUS",
    "ipa": "ˌəʊliˈædʒɪnəs",
    "elo": 1490,
    "level": "expert",
    "scenario": "Tin nhắn OLEAGINOUS kiểu \"dạo này em xinh lên á\" từ đứa bạn cũ, đọc tới dòng ba là thấy link đa cấp, ủa alo.",
    "translationHint": "Nịnh bợ, bóng bẩy (nghĩa bóng)",
    "upgradeModule": {
      "simpleSentence": "He has a very oily and fake personality.",
      "targetSlot": "oily and fake",
      "academicOptions": [
        { "text": "oleaginous smile", "nuance": "Vẻ bóng bẩy, trơn tuột một cách giả tạo nhằm mục đích xu nịnh.", "formalityScore": 10 },
        { "text": "unctuous", "nuance": "Sặc mùi giả dối, nịnh hót trơn tru.", "formalityScore": 10 },
        { "text": "fawning", "nuance": "Khúm núm nịnh bợ.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "oleum-", "meaning": "dầu (oil)", "relatedWords": [{ "word": "oil", "meaning": "dầu" }, { "word": "petroleum", "meaning": "dầu mỏ (dầu đá)" }] }
    }
  },
  {
    "id": "v296",
    "word": "ONEROUS",
    "ipa": "ˈɒnərəs",
    "elo": 1370,
    "level": "expert",
    "scenario": "Làm thủ tục nhập học online mà cần mười loại giấy tờ công chứng, nhiệm vụ ONEROUS hơn cả đề thi đại học, xỉu ngang.",
    "translationHint": "Nặng nề, khó nhọc",
    "upgradeModule": {
      "simpleSentence": "The task was very difficult and tiring.",
      "targetSlot": "difficult and tiring",
      "academicOptions": [
        { "text": "onerous responsibility", "nuance": "Trách nhiệm nặng nề, gây áp lực và mệt mỏi cho người gánh vác.", "formalityScore": 9 },
        { "text": "burdensome", "nuance": "Nặng nề (như gánh nặng).", "formalityScore": 8 },
        { "text": "taxing", "nuance": "Đòi hỏi nhiều sức lực, gây kiệt quệ.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "onus-", "meaning": "gánh nặng (burden)", "relatedWords": [{ "word": "onus", "meaning": "trách nhiệm/gánh nặng chứng minh" }] }
    }
  },
  {
    "id": "v297",
    "word": "OPPROBRIUM",
    "ipa": "əˈprəʊbriəm",
    "elo": 1460,
    "level": "expert",
    "scenario": "Lỡ spoil cái kết phim trong group chat, mình hứng OPPROBRIUM cả tuần, bị loại khỏi kèo xem phần hai, báo thủ thì chịu.",
    "translationHint": "Sự chỉ trích dữ dội, vết nhục",
    "upgradeModule": {
      "simpleSentence": "He suffered a lot of public shame after the scandal.",
      "targetSlot": "public shame",
      "academicOptions": [
        { "text": "public opprobrium", "nuance": "Sự sỉ nhục hoặc chỉ trích gay gắt từ dư luận xã hội.", "formalityScore": 10 },
        { "text": "ignominy", "nuance": "Sự ô nhục, nhục nhã.", "formalityScore": 10 },
        { "text": "infamy", "nuance": "Sự tai tiếng.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob-", "meaning": "chống lại", "relatedWords": [] },
      "root": { "text": "probrum-", "meaning": "vết nhục/sự sỉ nhục (reproach)", "relatedWords": [] }
    }
  },
  {
    "id": "v298",
    "word": "PARSIMONIOUS",
    "ipa": "ˌpɑːsɪˈməʊniəs",
    "elo": 1430,
    "level": "expert",
    "scenario": "Rủ đi ăn mà nó PARSIMONIOUS tới mức chia bill tới từng 500 đồng tiền trà đá, keo lỳ có hạng.",
    "translationHint": "Bủn xỉn, cực kỳ keo kiệt",
    "upgradeModule": {
      "simpleSentence": "He is very stingy and doesn't want to spend money.",
      "targetSlot": "stingy",
      "academicOptions": [
        { "text": "parsimonious nature", "nuance": "Bản tính tiết kiệm đến mức bủn xỉn, cực kỳ chi ly.", "formalityScore": 9 },
        { "text": "miserly", "nuance": "Keo kiệt (như một gã bủn xỉn).", "formalityScore": 8 },
        { "text": "penurious", "nuance": "Túng thiếu hoặc bủn xỉn quá mức.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "parsi-", "meaning": "tiết kiệm/dành dụm (to spare)", "relatedWords": [{ "word": "parsimony", "meaning": "sự bủn xỉn" }] }
    }
  },
  {
    "id": "v299",
    "word": "PEJORATIVE",
    "ipa": "pɪˈdʒɒrətɪv",
    "elo": 1420,
    "level": "expert",
    "scenario": "Mẹ gọi mình là \"con nghiện điện thoại\" bằng giọng PEJORATIVE, mình đáp \"ok mom\" trong lúc mẹ đang lướt TikTok.",
    "translationHint": "Mang nghĩa xấu, có tính miệt thị",
    "upgradeModule": {
      "simpleSentence": "The word was used in a negative and insulting way.",
      "targetSlot": "negative and insulting",
      "academicOptions": [
        { "text": "pejorative term", "nuance": "Một từ ngữ được dùng với mục đích hạ thấp hoặc khinh bỉ.", "formalityScore": 10 },
        { "text": "derogatory", "nuance": "Xúc phạm, làm giảm giá trị.", "formalityScore": 9 },
        { "text": "disparaging", "nuance": "Miệt thị, coi rẻ.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "pejor-", "meaning": "tệ hơn (worse)", "relatedWords": [] }
    }
  },
  {
    "id": "v300",
    "word": "PENURIOUS",
    "ipa": "pɪˈnjʊəriəs",
    "elo": 1450,
    "level": "expert",
    "scenario": "Cuối tháng PENURIOUS tới mức nhìn gói mì tôm như món sang trọng, phải chia ra ăn hai bữa, ví toang thật.",
    "translationHint": "Nghèo túng, thiếu thốn tột cùng",
    "upgradeModule": {
      "simpleSentence": "He lives in a very poor state.",
      "targetSlot": "poor",
      "academicOptions": [
        { "text": "penurious existence", "nuance": "Cuộc sống nghèo khổ cùng cực, thiếu thốn mọi bề.", "formalityScore": 10 },
        { "text": "destitute", "nuance": "Cơ cực, không một đồng dính túi.", "formalityScore": 9 },
        { "text": "impoverished", "nuance": "Bần cùng hóa.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "penur-", "meaning": "sự thiếu hụt/nghèo khổ (want/scarcity)", "relatedWords": [{ "word": "penury", "meaning": "sự nghèo túng" }] }
    }
  },
  {
    "id": "v301",
    "word": "PERSPECTIVE",
    "ipa": "pəˈspektɪv",
    "elo": 920,
    "level": "intermediate",
    "scenario": "Thử đổi PERSPECTIVE coi: crush không rep chưa chắc là ghét mình, có khi người ta chỉ... không quan tâm thôi, bớt delulu.",
    "translationHint": "Góc nhìn, quan điểm",
    "upgradeModule": {
      "simpleSentence": "He has a different way of looking at things.",
      "targetSlot": "way of looking at things",
      "academicOptions": [
        { "text": "broader perspective", "nuance": "Một cái nhìn rộng hơn, bao quát hơn về vấn đề.", "formalityScore": 8 },
        { "text": "outlook", "nuance": "Cách nhìn nhận cuộc sống/tương lai (thường mang tính thái độ).", "formalityScore": 7 },
        { "text": "viewpoint", "nuance": "Quan điểm cá nhân về một điểm cụ thể.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "per-", "meaning": "xuyên qua (through)", "relatedWords": [] },
      "root": { "text": "spect-", "meaning": "nhìn (to look)", "relatedWords": [{ "word": "spectator", "meaning": "khán giả (người nhìn)" }, { "word": "inspect", "meaning": "thanh tra (nhìn vào bên trong)" }, { "word": "spectacle", "meaning": "kính mắt/quang cảnh" }] }
    }
  },
  {
    "id": "v302",
    "word": "AMBITIOUS",
    "ipa": "æmˈbɪʃəs",
    "elo": 850,
    "level": "beginner",
    "scenario": "Plan hè của mình AMBITIOUS lắm, manifest đủ thứ: học code, tập gym, đọc mười cuốn sách; thực tế cày xong ba bộ phim.",
    "translationHint": "Tham vọng",
    "upgradeModule": {
      "simpleSentence": "This is a very big plan that needs a lot of work.",
      "targetSlot": "very big plan",
      "academicOptions": [
        { "text": "ambitious undertaking", "nuance": "Một công việc mang tính thử thách cao và đầy tham vọng.", "formalityScore": 9 },
        { "text": "aspiring", "nuance": "Có khát vọng (thường dùng cho người).", "formalityScore": 8 },
        { "text": "audacious", "nuance": "Táo bạo, liều lĩnh.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "ambit-", "meaning": "đi vòng quanh (to go around - nghĩa gốc là đi vận động tranh cử)", "relatedWords": [{ "word": "ambience", "meaning": "không gian xung quanh" }] },
      "suffix": { "text": "-ious", "meaning": "tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v303",
    "word": "COLLABORATE",
    "ipa": "kəˈlæbəreɪt",
    "elo": 880,
    "level": "beginner",
    "scenario": "Làm bài nhóm mà COLLABORATE kiểu một người làm, bốn người thả tim vào file Drive, ủa alo.",
    "translationHint": "Hợp tác, cộng tác",
    "upgradeModule": {
      "simpleSentence": "The two teams worked together on the project.",
      "targetSlot": "worked together",
      "academicOptions": [
        { "text": "collaborate effectively", "nuance": "Hợp tác một cách hiệu quả để đạt mục tiêu chung.", "formalityScore": 8 },
        { "text": "cooperate", "nuance": "Phối hợp (nhấn mạnh vào việc tuân thủ hoặc hỗ trợ).", "formalityScore": 7 },
        { "text": "synergize", "nuance": "Tạo ra sức mạnh tổng hợp (vượt lên trên sự hợp tác thông thường).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "col-", "meaning": "cùng nhau (together)", "relatedWords": [{ "word": "collect", "meaning": "thu thập" }] },
      "root": { "text": "labor-", "meaning": "lao động (work)", "relatedWords": [{ "word": "laboratory", "meaning": "phòng thí nghiệm" }, { "word": "laborious", "meaning": "cần cù" }] }
    }
  },
  {
    "id": "v304",
    "word": "ADAPTABLE",
    "ipa": "əˈdæptəbl",
    "elo": 940,
    "level": "intermediate",
    "scenario": "Ở trọ ba năm mình ADAPTABLE dữ lắm, mất điện thì học bằng đèn điện thoại, cúp nước thì ra tiệm gội đầu, keo lỳ chưa.",
    "translationHint": "Dễ thích nghi",
    "upgradeModule": {
      "simpleSentence": "He is very good at changing to fit new situations.",
      "targetSlot": "good at changing to fit new situations",
      "academicOptions": [
        { "text": "highly adaptable", "nuance": "Khả năng thích ứng linh hoạt trong nhiều điều kiện khác nhau.", "formalityScore": 8 },
        { "text": "versatile", "nuance": "Đa năng, linh hoạt.", "formalityScore": 9 },
        { "text": "flexible", "nuance": "Linh hoạt (thông dụng).", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad-", "meaning": "hướng tới", "relatedWords": [] },
      "root": { "text": "apt-", "meaning": "phù hợp (fit)", "relatedWords": [{ "word": "aptitude", "meaning": "năng khiếu" }, { "word": "adept", "meaning": "tinh thông/khéo léo" }] },
      "suffix": { "text": "-able", "meaning": "có thể", "relatedWords": [] }
    }
  },
  {
    "id": "v305",
    "word": "CONSISTENT",
    "ipa": "kənˈsɪstənt",
    "elo": 910,
    "level": "intermediate",
    "scenario": "Mình CONSISTENT đúng một thứ: tối nào cũng hứa sáng mai dậy sớm chạy bộ, hứa thì keo lỳ, dậy thì chưa.",
    "translationHint": "Nhất quán, kiên trì",
    "upgradeModule": {
      "simpleSentence": "He is always the same in his work and never changes.",
      "targetSlot": "always the same",
      "academicOptions": [
        { "text": "consistent performance", "nuance": "Phong độ ổn định, không thay đổi qua thời gian.", "formalityScore": 9 },
        { "text": "steady", "nuance": "Vững vàng, đều đặn.", "formalityScore": 6 },
        { "text": "uniform", "nuance": "Đồng nhất, đồng dạng.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "con-", "meaning": "cùng nhau", "relatedWords": [] },
      "root": { "text": "sist-", "meaning": "đứng (to stand)", "relatedWords": [{ "word": "assist", "meaning": "hỗ trợ" }, { "word": "resist", "meaning": "chống lại" }, { "word": "persist", "meaning": "kiên trì" }] }
    }
  },
  {
    "id": "v306",
    "word": "OBTAIN",
    "ipa": "əbˈteɪn",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Canh 0 giờ ba đêm liền mới OBTAIN được vé concert, giờ mới nhớ ra là chưa xin nghỉ phép, tới công chuyện.",
    "translationHint": "Đạt được, giành được",
    "upgradeModule": {
      "simpleSentence": "He got the permission from his boss.",
      "targetSlot": "got",
      "academicOptions": [
        { "text": "obtain authorization", "nuance": "Nhận được sự cho phép hoặc ủy quyền chính thức.", "formalityScore": 10 },
        { "text": "acquire", "nuance": "Có được (thường dùng cho kỹ năng/tài sản).", "formalityScore": 9 },
        { "text": "procure", "nuance": "Kiếm được, thu mua được (thường cần nỗ lực).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob-", "meaning": "theo/đối diện", "relatedWords": [] },
      "root": { "text": "tain-", "meaning": "giữ (to hold)", "relatedWords": [{ "word": "contain", "meaning": "chứa đựng" }, { "word": "retain", "meaning": "giữ lại" }, { "word": "maintain", "meaning": "duy trì" }] }
    }
  },
  {
    "id": "v307",
    "word": "SPECIFIC",
    "ipa": "spəˈsɪfɪk",
    "elo": 830,
    "level": "beginner",
    "scenario": "Hỏi ăn gì thì nói SPECIFIC giùm cái, \"gì cũng được\" xong mình đề xuất món nào cũng bị chê, ủa alo.",
    "translationHint": "Cụ thể, rõ ràng",
    "upgradeModule": {
      "simpleSentence": "I need clear instructions on what to do.",
      "targetSlot": "clear",
      "academicOptions": [
        { "text": "specific guidelines", "nuance": "Hướng dẫn cụ thể và chi tiết.", "formalityScore": 8 },
        { "text": "precise", "nuance": "Chính xác tuyệt đối.", "formalityScore": 9 },
        { "text": "explicit", "nuance": "Rõ ràng, không mập mờ.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "spec-", "meaning": "nhìn/loại hình (kind/appearance)", "relatedWords": [{ "word": "species", "meaning": "loài" }, { "word": "specimen", "meaning": "mẫu vật" }] },
      "suffix": { "text": "-fic", "meaning": "làm cho (to make)", "relatedWords": [] }
    }
  },
  {
    "id": "v308",
    "word": "VALUABLE",
    "ipa": "ˈvæljuəbl",
    "elo": 840,
    "level": "beginner",
    "scenario": "Kho sticker meme trong máy là tài sản VALUABLE nhất mình có, đổi điện thoại là backup đầu tiên, lowkey quý hơn ảnh gia đình.",
    "translationHint": "Quý giá, có giá trị",
    "upgradeModule": {
      "simpleSentence": "This experience is very useful for my career.",
      "targetSlot": "very useful",
      "academicOptions": [
        { "text": "invaluable asset", "nuance": "Một tài sản vô giá (vượt lên trên cả giá trị tiền bạc).", "formalityScore": 10 },
        { "text": "precious", "nuance": "Quý báu (thường dùng cho tình cảm/kỷ niệm).", "formalityScore": 7 },
        { "text": "worthwhile", "nuance": "Đáng giá, xứng đáng công sức bỏ ra.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "val-", "meaning": "mạnh mẽ/giá trị (strong/worth)", "relatedWords": [{ "word": "valid", "meaning": "hợp lệ" }, { "word": "value", "meaning": "giá trị" }] },
      "suffix": { "text": "-able", "meaning": "có thể", "relatedWords": [] }
    }
  },
  {
    "id": "v309",
    "word": "ESTIMATE",
    "ipa": "ˈestɪmeɪt",
    "elo": 880,
    "level": "beginner",
    "scenario": "Mình ESTIMATE làm slide mất một tiếng, cuối cùng mất bốn tiếng vì ngồi chọn font, ô dề thật.",
    "translationHint": "Ước tính",
    "upgradeModule": {
      "simpleSentence": "Can you guess how much it will cost?",
      "targetSlot": "guess",
      "academicOptions": [
        { "text": "rough estimate", "nuance": "Số liệu ước tính sơ bộ (có thể sai số).", "formalityScore": 7 },
        { "text": "appraisal", "nuance": "Sự thẩm định giá trị chính thức.", "formalityScore": 10 },
        { "text": "projection", "nuance": "Sự dự phóng (dựa trên dữ liệu hiện tại cho tương lai).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "estim-", "meaning": "đánh giá/coi trọng (to value)", "relatedWords": [{ "word": "esteem", "meaning": "lòng tự trọng/kính trọng" }] },
      "suffix": { "text": "-ate", "meaning": "hậu tố động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v310",
    "word": "TYPICAL",
    "ipa": "ˈtɪpɪkl",
    "elo": 820,
    "level": "beginner",
    "scenario": "Tủ quần áo đầy ứ mà vẫn thấy chẳng có gì mặc, tình trạng TYPICAL của mọi buổi sáng đi học, ô dề chứ đâu.",
    "translationHint": "Điển hình, đặc trưng",
    "upgradeModule": {
      "simpleSentence": "This is a normal example of his work.",
      "targetSlot": "normal example",
      "academicOptions": [
        { "text": "quintessential", "nuance": "Tinh túy, điển hình nhất.", "formalityScore": 10 },
        { "text": "representative", "nuance": "Mang tính đại diện cho một nhóm.", "formalityScore": 9 },
        { "text": "standard", "nuance": "Tiêu chuẩn.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "typ-", "meaning": "dấu vết/kiểu mẫu (blow/impression)", "relatedWords": [{ "word": "type", "meaning": "loại" }, { "word": "prototype", "meaning": "nguyên mẫu" }] }
    }
  },
  {
    "id": "v311",
    "word": "VERSATILE",
    "ipa": "ˈvɜːsətaɪl",
    "elo": 1050,
    "level": "intermediate",
    "scenario": "Cái hoodie đen VERSATILE nhất tủ, đi học, đi cà phê, đi phỏng vấn cũng khoác được, slay mọi hoàn cảnh.",
    "translationHint": "Linh hoạt, đa năng",
    "upgradeModule": {
      "simpleSentence": "He is a person with many different skills.",
      "targetSlot": "person with many different skills",
      "academicOptions": [
        { "text": "versatile talent", "nuance": "Tài năng đa dạng, có thể làm tốt nhiều lĩnh vực khác nhau.", "formalityScore": 9 },
        { "text": "all-rounder", "nuance": "Người toàn diện (thông dụng).", "formalityScore": 6 },
        { "text": "multi-talented", "nuance": "Đa tài.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "vers-", "meaning": "xoay chuyển (to turn)", "relatedWords": [{ "word": "reverse", "meaning": "đảo ngược" }, { "word": "universe", "meaning": "vũ trụ" }] },
      "suffix": { "text": "-ile", "meaning": "có tính chất/có thể", "relatedWords": [{ "word": "fragile", "meaning": "dễ vỡ" }] }
    }
  },
  {
    "id": "v312",
    "word": "SUFFICIENT",
    "ipa": "səˈfɪʃnt",
    "elo": 940,
    "level": "intermediate",
    "scenario": "Lương thực tập SUFFICIENT để trả tiền trọ, còn tiền ăn thì tùy vào lòng tốt của mẹ ở quê.",
    "translationHint": "Đầy đủ, đủ dùng",
    "upgradeModule": {
      "simpleSentence": "We have enough evidence to win.",
      "targetSlot": "enough",
      "academicOptions": [
        { "text": "sufficient proof", "nuance": "Bằng chứng đầy đủ để thỏa mãn yêu cầu pháp lý hoặc logic.", "formalityScore": 9 },
        { "text": "adequate", "nuance": "Thỏa đáng, vừa đủ (thường dùng cho chất lượng).", "formalityScore": 8 },
        { "text": "ample", "nuance": "Dư dả, phong phú.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "sub/suf-", "meaning": "từ dưới lên", "relatedWords": [] },
      "root": { "text": "fic-", "meaning": "làm (to do/make - nghĩa gốc là làm cho đến khi đạt mức yêu cầu)", "relatedWords": [{ "word": "efficient", "meaning": "hiệu quả" }, { "word": "sacrifice", "meaning": "hy sinh (làm cho linh thiêng)" }] }
    }
  },
  {
    "id": "v313",
    "word": "PRIORITY",
    "ipa": "praɪˈɒrəti",
    "elo": 850,
    "level": "beginner",
    "scenario": "Trước kỳ thi, PRIORITY số một là ôn bài, vậy mà mình lại dọn phòng sạch nhất từ đầu năm tới giờ, hết cứu.",
    "translationHint": "Sự ưu tiên",
    "upgradeModule": {
      "simpleSentence": "Safety is the most important thing for us.",
      "targetSlot": "most important thing",
      "academicOptions": [
        { "text": "top priority", "nuance": "Ưu tiên tối thượng cần được giải quyết ngay lập tức.", "formalityScore": 8 },
        { "text": "precedence", "nuance": "Quyền ưu tiên đi trước (trang trọng).", "formalityScore": 10 },
        { "text": "paramount importance", "nuance": "Tối quan trọng.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "prior-", "meaning": "trước đây (former/before)", "relatedWords": [{ "word": "prior", "meaning": "trước đó" }] },
      "suffix": { "text": "-ity", "meaning": "hậu tố danh từ chỉ trạng thái", "relatedWords": [] }
    }
  },
  {
    "id": "v314",
    "word": "APPROACH",
    "ipa": "əˈprəʊtʃ",
    "elo": 920,
    "level": "intermediate",
    "scenario": "APPROACH của nó với crush là like hết ảnh từ năm 2019 trong một đêm, crush xỉu ngang rồi block luôn.",
    "translationHint": "Cách tiếp cận, phương pháp",
    "upgradeModule": {
      "simpleSentence": "We need a new way to solve the problem.",
      "targetSlot": "way",
      "academicOptions": [
        { "text": "innovative approach", "nuance": "Cách tiếp cận đổi mới, sáng tạo.", "formalityScore": 9 },
        { "text": "methodology", "nuance": "Hệ phương pháp (mang tính khoa học/nghiên cứu).", "formalityScore": 10 },
        { "text": "strategy", "nuance": "Chiến lược lâu dài.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad/ap-", "meaning": "hướng tới", "relatedWords": [] },
      "root": { "text": "proche-", "meaning": "gần (near)", "relatedWords": [{ "word": "proximity", "meaning": "sự gần gũi" }, { "word": "approximate", "meaning": "xấp xỉ" }] }
    }
  },
  {
    "id": "v315",
    "word": "CONVINCE",
    "ipa": "kənˈvɪns",
    "elo": 870,
    "level": "beginner",
    "scenario": "Mất nguyên buổi tối để CONVINCE mẹ cho đi Đà Lạt với hội bạn, mẹ gật với điều kiện gọi video mỗi hai tiếng, ok mom.",
    "translationHint": "Thuyết phục",
    "upgradeModule": {
      "simpleSentence": "He tried to make me believe his story.",
      "targetSlot": "make me believe",
      "academicOptions": [
        { "text": "convince me otherwise", "nuance": "Thuyết phục tôi tin vào điều ngược lại.", "formalityScore": 9 },
        { "text": "persuade", "nuance": "Thuyết phục ai đó làm gì (convince thiên về tin, persuade thiên về hành động).", "formalityScore": 8 },
        { "text": "sway", "nuance": "Làm dao động, ảnh hưởng đến ý kiến.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "con-", "meaning": "hoàn toàn", "relatedWords": [] },
      "root": { "text": "vinc-", "meaning": "chinh phục/chiến thắng (to conquer)", "relatedWords": [{ "word": "victory", "meaning": "chiến thắng" }, { "word": "invincible", "meaning": "bất khả chiến bại" }, { "word": "evict", "meaning": "đuổi ra (chiến thắng bằng cách đuổi đi)" }] }
    }
  },
  {
    "id": "v316",
    "word": "PROCEDURE",
    "ipa": "prəˈsiːdʒə",
    "elo": 950,
    "level": "intermediate",
    "scenario": "PROCEDURE xin nghỉ ốm ở công ty mới cần ba chữ ký, tới khi xin xong thì mình khỏi bệnh luôn, u là trời.",
    "translationHint": "Quy trình, thủ tục",
    "upgradeModule": {
      "simpleSentence": "You must follow the steps to finish the task.",
      "targetSlot": "steps",
      "academicOptions": [
        { "text": "standard operating procedure", "nuance": "Quy trình vận hành tiêu chuẩn (SOP).", "formalityScore": 10 },
        { "text": "protocol", "nuance": "Nghi thức, quy tắc chính thức.", "formalityScore": 10 },
        { "text": "routine", "nuance": "Lệ thường, thói quen hằng ngày.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "pro-", "meaning": "về phía trước", "relatedWords": [] },
      "root": { "text": "ced-", "meaning": "đi (to go)", "relatedWords": [{ "word": "precede", "meaning": "đi trước" }, { "word": "recede", "meaning": "lùi lại" }, { "word": "exceed", "meaning": "vượt quá" }] }
    }
  },
  {
    "id": "v317",
    "word": "SIGNIFICANCE",
    "ipa": "sɪɡˈnɪfɪkəns",
    "elo": 1020,
    "level": "intermediate",
    "scenario": "Mất điện thoại rồi mới hiểu SIGNIFICANCE của việc nhớ số mẹ, vì trong đầu chỉ còn số của shipper, xu cà na.",
    "translationHint": "Tầm quan trọng, ý nghĩa",
    "upgradeModule": {
      "simpleSentence": "What is the importance of this event?",
      "targetSlot": "importance",
      "academicOptions": [
        { "text": "profound significance", "nuance": "Tầm quan trọng sâu sắc, ảnh hưởng lớn lao.", "formalityScore": 10 },
        { "text": "magnitude", "nuance": "Độ lớn, tầm vóc khổng lồ của một sự kiện.", "formalityScore": 9 },
        { "text": "relevance", "nuance": "Sự liên quan/phù hợp trong hoàn cảnh.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "sign-", "meaning": "dấu hiệu/đánh dấu (mark)", "relatedWords": [{ "word": "signal", "meaning": "tín hiệu" }, { "word": "design", "meaning": "thiết kế" }] },
      "suffix": { "text": "-icance", "meaning": "hậu tố danh từ chỉ trạng thái", "relatedWords": [] }
    }
  },
  {
    "id": "v318",
    "word": "REVEAL",
    "ipa": "rɪˈviːl",
    "elo": 830,
    "level": "beginner",
    "scenario": "Đứa bạn REVEAL người yêu mới trên story, cả group chat hóng biến rồi nhận ra là anh bán bánh mì đầu hẻm.",
    "translationHint": "Tiết lộ, hé lộ",
    "upgradeModule": {
      "simpleSentence": "The test results showed a health problem.",
      "targetSlot": "showed",
      "academicOptions": [
        { "text": "reveal the findings", "nuance": "Công bố các kết quả nghiên cứu/phát hiện.", "formalityScore": 9 },
        { "text": "unveil", "nuance": "Vén màn, ra mắt (thường dùng cho sản phẩm mới).", "formalityScore": 10 },
        { "text": "disclose", "nuance": "Tiết lộ thông tin mật.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "re-", "meaning": "ngược lại", "relatedWords": [] },
      "root": { "text": "velum-", "meaning": "tấm màn/màn che (veil - nghĩa là vén màn che lại)", "relatedWords": [{ "word": "veil", "meaning": "màn che mặt" }] }
    }
  },
  {
    "id": "v319",
    "word": "CHALLENGING",
    "ipa": "ˈtʃælɪndʒɪŋ",
    "elo": 890,
    "level": "beginner",
    "scenario": "Môn Kinh tế lượng CHALLENGING tới mức cả lớp lập group chat riêng chỉ để than, khum ai hỏi bài.",
    "translationHint": "Đầy thách thức",
    "upgradeModule": {
      "simpleSentence": "The task was very difficult for the team.",
      "targetSlot": "difficult",
      "academicOptions": [
        { "text": "intellectually challenging", "nuance": "Thách thức về mặt trí tuệ.", "formalityScore": 9 },
        { "text": "arduous", "nuance": "Gian nan, cực nhọc.", "formalityScore": 10 },
        { "text": "daunting", "nuance": "Làm nản chí (do độ khó cao).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "calumnia-", "meaning": "sự vu khống/khiêu khích (nghĩa gốc là đưa ra lời khiêu chiến)", "relatedWords": [] }
    }
  },
  {
    "id": "v320",
    "word": "ACQUIRE",
    "ipa": "əˈkwaɪə",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Sau một năm ở trọ, mình ACQUIRED kỹ năng nấu ba món chỉ bằng nồi cơm điện, slay nhẹ.",
    "translationHint": "Có được, thu nhận được",
    "upgradeModule": {
      "simpleSentence": "He got many new skills during his trip.",
      "targetSlot": "got",
      "academicOptions": [
        { "text": "acquire proficiency", "nuance": "Đạt được sự thành thạo trong một kỹ năng.", "formalityScore": 10 },
        { "text": "obtain", "nuance": "Có được (qua yêu cầu hoặc nỗ lực).", "formalityScore": 9 },
        { "text": "garner", "nuance": "Thu lượm, tích góp được (thường là sự ủng hộ/chú ý).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad/ac-", "meaning": "hướng tới", "relatedWords": [] },
      "root": { "text": "quaer-", "meaning": "tìm kiếm/hỏi (to seek)", "relatedWords": [{ "word": "query", "meaning": "câu hỏi/truy vấn" }, { "word": "question", "meaning": "câu hỏi" }, { "word": "conquer", "meaning": "chinh phục" }] }
    }
  },
  {
    "id": "v321",
    "word": "BENEFICIAL",
    "ipa": "ˌbenɪˈfɪʃl",
    "elo": 850,
    "level": "beginner",
    "scenario": "Ngủ trưa hai mươi phút cực BENEFICIAL cho não, ngủ hai tiếng thì dậy khum biết mình là ai.",
    "translationHint": "Có lợi",
    "upgradeModule": {
      "simpleSentence": "Regular exercise is good for your heart.",
      "targetSlot": "good for",
      "academicOptions": [
        { "text": "highly beneficial to", "nuance": "Cực kỳ có lợi cho mục tiêu lâu dài.", "formalityScore": 8 },
        { "text": "advantageous", "nuance": "Có lợi thế.", "formalityScore": 9 },
        { "text": "salutary", "nuance": "Có lợi (thường là sau một trải nghiệm khó khăn).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "bene-", "meaning": "tốt (well)", "relatedWords": [{ "word": "benefit", "meaning": "lợi ích" }, { "word": "benediction", "meaning": "lời chúc phúc" }] },
      "root": { "text": "fic-", "meaning": "làm (to make)", "relatedWords": [] }
    }
  },
  {
    "id": "v322",
    "word": "CAPABLE",
    "ipa": "ˈkeɪpəbl",
    "elo": 870,
    "level": "beginner",
    "scenario": "Mình hoàn toàn CAPABLE dậy lúc 5 giờ sáng, chỉ cần có một chuyến bay giá rẻ đang chờ là gét gô liền.",
    "translationHint": "Có khả năng, năng lực",
    "upgradeModule": {
      "simpleSentence": "He is a very good worker who can do anything.",
      "targetSlot": "very good worker who can do anything",
      "academicOptions": [
        { "text": "highly capable", "nuance": "Có năng lực vượt trội, đáng tin cậy trong công việc.", "formalityScore": 8 },
        { "text": "competent", "nuance": "Đủ năng lực (thỏa mãn yêu cầu).", "formalityScore": 9 },
        { "text": "proficient", "nuance": "Thành thạo, điêu luyện.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "cap-", "meaning": "nắm giữ/chứa (to take/hold)", "relatedWords": [{ "word": "capacity", "meaning": "sức chứa" }, { "word": "capture", "meaning": "bắt giữ" }, { "word": "captive", "meaning": "con tin" }] },
      "suffix": { "text": "-able", "meaning": "có thể", "relatedWords": [] }
    }
  },
  {
    "id": "v323",
    "word": "CONTRADICT",
    "ipa": "ˌkɒntrəˈdɪkt",
    "elo": 980,
    "level": "intermediate",
    "scenario": "Story ghi \"đang ôn thi chăm chỉ\" mà giờ đó online Liên Quân, CONTRADICT nhau vậy check var là lộ liền.",
    "translationHint": "Mâu thuẫn, trái ngược",
    "upgradeModule": {
      "simpleSentence": "What he said today is different from what he said yesterday.",
      "targetSlot": "is different from",
      "academicOptions": [
        { "text": "contradict the evidence", "nuance": "Mâu thuẫn hoàn toàn với những bằng chứng đã có.", "formalityScore": 9 },
        { "text": "belie", "nuance": "Gây ấn tượng sai lầm về cái gì đó (nghĩa tinh tế hơn).", "formalityScore": 10 },
        { "text": "clash with", "nuance": "Xung đột với.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "contra-", "meaning": "chống lại/ngược lại (against)", "relatedWords": [{ "word": "contrast", "meaning": "tương phản" }, { "word": "controversial", "meaning": "gây tranh cãi" }] },
      "root": { "text": "dict-", "meaning": "nói (to speak)", "relatedWords": [{ "word": "dictate", "meaning": "đọc cho chép/mệnh lệnh" }, { "word": "predict", "meaning": "dự báo" }, { "word": "dictionary", "meaning": "từ điển" }] }
    }
  },
  {
    "id": "v324",
    "word": "DISTINCT",
    "ipa": "dɪˈstɪŋkt",
    "elo": 910,
    "level": "intermediate",
    "scenario": "Hai ly trà sữa giá chênh 30 nghìn mà vị chẳng có gì DISTINCT, mình bị thao túng tâm lý trả thêm cho cái logo thôi.",
    "translationHint": "Khác biệt rõ ràng",
    "upgradeModule": {
      "simpleSentence": "There is a clear difference between the two styles.",
      "targetSlot": "clear difference",
      "academicOptions": [
        { "text": "distinct advantage", "nuance": "Một lợi thế rõ rệt, không thể nhầm lẫn được.", "formalityScore": 8 },
        { "text": "discrepancy", "nuance": "Sự khác biệt lớn (thường dùng cho số liệu/thông tin).", "formalityScore": 10 },
        { "text": "marked contrast", "nuance": "Sự tương phản rõ rệt.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "dis-", "meaning": "tách ra", "relatedWords": [] },
      "root": { "text": "stinguere-", "meaning": "châm/đánh dấu (to prick/mark - nghĩa là đánh dấu riêng ra để phân biệt)", "relatedWords": [{ "word": "distinguish", "meaning": "phân biệt" }, { "word": "extinguish", "meaning": "dập tắt" }] }
    }
  },
  {
    "id": "v325",
    "word": "ELIMINATE",
    "ipa": "ɪˈlɪmɪneɪt",
    "elo": 930,
    "level": "intermediate",
    "scenario": "Quyết ELIMINATE trà sữa khỏi chế độ ăn, tuần sau mình ghiền luôn sinh tố bơ thêm kem, toang.",
    "translationHint": "Loại bỏ, triệt tiêu",
    "upgradeModule": {
      "simpleSentence": "We need to get rid of all the waste.",
      "targetSlot": "get rid of",
      "academicOptions": [
        { "text": "eliminate the risk", "nuance": "Loại bỏ hoàn toàn rủi ro tiềm tàng.", "formalityScore": 9 },
        { "text": "eradicate", "nuance": "Diệt tận gốc (như nhổ cỏ/xóa sổ bệnh tật).", "formalityScore": 10 },
        { "text": "obviate", "nuance": "Loại bỏ sự cần thiết của cái gì đó.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "e-", "meaning": "ra ngoài", "relatedWords": [] },
      "root": { "text": "limin-", "meaning": "ngưỡng cửa (threshold - nghĩa gốc là đuổi ra khỏi cửa)", "relatedWords": [{ "word": "limit", "meaning": "giới hạn" }, { "word": "subliminal", "meaning": "dưới ngưỡng nhận thức" }] }
    }
  },
  {
    "id": "v326",
    "word": "GENERALIZE",
    "ipa": "ˈdʒenrəlaɪz",
    "elo": 950,
    "level": "intermediate",
    "scenario": "Gặp một người yêu cũ tệ rồi GENERALIZE cả thế giới đều red flag là hơi quá rồi đó bà.",
    "translationHint": "Khái quát hóa, đánh đồng",
    "upgradeModule": {
      "simpleSentence": "Don't say that everything is the same based on one example.",
      "targetSlot": "say that everything is the same",
      "academicOptions": [
        { "text": "sweepingly generalize", "nuance": "Vơ đũa cả nắm một cách phi lý và phiến diện.", "formalityScore": 9 },
        { "text": "extrapolate", "nuance": "Suy diễn từ cái cụ thể ra cái tổng quát hơn.", "formalityScore": 10 },
        { "text": "stereotype", "nuance": "Định kiến, rập khuôn.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "gener-", "meaning": "loại/giống loài (kind/race)", "relatedWords": [{ "word": "genus", "meaning": "chi (sinh học)" }, { "word": "generic", "meaning": "chung chung" }] },
      "suffix": { "text": "-ize", "meaning": "động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v327",
    "word": "HINDER",
    "ipa": "ˈhɪndə",
    "elo": 970,
    "level": "intermediate",
    "scenario": "Group chat gia đình nổ 99 tin nhắn về đám giỗ, HINDER công cuộc chạy deadline của mình trầm trọng, ét o ét.",
    "translationHint": "Cản trở, kìm hãm",
    "upgradeModule": {
      "simpleSentence": "The bad weather stopped the project from moving forward.",
      "targetSlot": "stopped",
      "academicOptions": [
        { "text": "hinder progress", "nuance": "Cản trở tiến độ phát triển của một cái gì đó.", "formalityScore": 9 },
        { "text": "impede", "nuance": "Làm chậm lại (thường dùng cho giao thông/quy trình).", "formalityScore": 10 },
        { "text": "obstruct", "nuance": "Gây tắc nghẽn, cản trở hoàn toàn.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "hind-", "meaning": "phía sau (behind)", "relatedWords": [{ "word": "behind", "meaning": "phía sau" }, { "word": "hind", "meaning": "chân sau (động vật)" }] }
    }
  },
  {
    "id": "v328",
    "word": "IMPLEMENT",
    "ipa": "ˈɪmplɪment",
    "elo": 920,
    "level": "intermediate",
    "scenario": "Kế hoạch tiết kiệm nghe hay lắm, tới lúc IMPLEMENT thì đụng ngay đợt sale 10.10, fomo thắng.",
    "translationHint": "Triển khai, thực hiện",
    "upgradeModule": {
      "simpleSentence": "The company decided to use the new rules.",
      "targetSlot": "use",
      "academicOptions": [
        { "text": "implement policies", "nuance": "Triển khai các chính sách vào thực tế cuộc sống.", "formalityScore": 10 },
        { "text": "execute", "nuance": "Thi hành, thực hiện một lệnh hoặc kế hoạch.", "formalityScore": 9 },
        { "text": "deploy", "nuance": "Dàn quân/triển khai (thường dùng cho quân đội hoặc tech).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in/im-", "meaning": "vào trong", "relatedWords": [] },
      "root": { "text": "plere-", "meaning": "lấp đầy (to fill - nghĩa là đổ đầy hành động vào kế hoạch)", "relatedWords": [{ "word": "complete", "meaning": "hoàn thành" }, { "word": "complement", "meaning": "bổ sung" }, { "word": "replete", "meaning": "đầy đủ/no nê" }] }
    }
  },
  {
    "id": "v329",
    "word": "INADEQUATE",
    "ipa": "ɪnˈædɪkwət",
    "elo": 990,
    "level": "intermediate",
    "scenario": "Ba tiếng ôn cho môn học cả kỳ là INADEQUATE thấy rõ, nhưng mình vẫn manifest được điểm A.",
    "translationHint": "Thiếu hụt, không thỏa đáng",
    "upgradeModule": {
      "simpleSentence": "The money was not enough for the trip.",
      "targetSlot": "not enough",
      "academicOptions": [
        { "text": "woefully inadequate", "nuance": "Thiếu hụt một cách thảm hại và đáng thương.", "formalityScore": 10 },
        { "text": "deficient", "nuance": "Thiếu hụt (thường là chất dinh dưỡng/kỹ năng).", "formalityScore": 9 },
        { "text": "insufficient", "nuance": "Không đủ lượng.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "không (not)", "relatedWords": [] },
      "root": { "text": "adequ-", "meaning": "ngang hàng/đủ (to make equal)", "relatedWords": [{ "word": "equal", "meaning": "công bằng" }, { "word": "equate", "meaning": "đánh đồng" }] }
    }
  },
  {
    "id": "v330",
    "word": "MAINTAIN",
    "ipa": "meɪnˈteɪn",
    "elo": 860,
    "level": "beginner",
    "scenario": "MAINTAIN chuỗi Duolingo 300 ngày là thành tựu lớn nhất đời mình để flex, dù tiếng Pháp vẫn chỉ biết \"bonjour\".",
    "translationHint": "Duy trì, bảo trì",
    "upgradeModule": {
      "simpleSentence": "He wants to keep his good reputation.",
      "targetSlot": "keep",
      "academicOptions": [
        { "text": "maintain stability", "nuance": "Duy trì sự ổn định bền vững.", "formalityScore": 9 },
        { "text": "uphold", "nuance": "Giữ vững, ủng hộ (luật lệ/truyền thống).", "formalityScore": 10 },
        { "text": "sustain", "nuance": "Duy trì sự tồn tại/chịu đựng.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "man-", "meaning": "tay (hand)", "relatedWords": [{ "word": "manual", "meaning": "thủ công" }, { "word": "manuscript", "meaning": "bản viết tay" }] },
      "root2": { "text": "tain-", "meaning": "giữ (to hold - nghĩa là nắm giữ trong lòng bàn tay)", "relatedWords": [] }
    }
  },
  {
    "id": "v331",
    "word": "NOTABLE",
    "ipa": "ˈnəʊtəbl",
    "elo": 890,
    "level": "beginner",
    "scenario": "Thay đổi NOTABLE nhất sau năm đầu đi làm: mình đọc giá trước, chằm zn tính nhẩm rồi mới đọc tên món.",
    "translationHint": "Đáng chú ý, nổi bật",
    "upgradeModule": {
      "simpleSentence": "This is a very important difference.",
      "targetSlot": "very important",
      "academicOptions": [
        { "text": "notable distinction", "nuance": "Một sự khác biệt rõ rệt đáng để tâm.", "formalityScore": 8 },
        { "text": "striking", "nuance": "Gây ấn tượng mạnh, đập vào mắt ngay lập tức.", "formalityScore": 9 },
        { "text": "prominent", "nuance": "Lỗi lạc, xuất chúng hoặc nhô cao rõ rệt.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "not-", "meaning": "đánh dấu/biết (to mark/know)", "relatedWords": [{ "word": "notice", "meaning": "nhận ra" }, { "word": "annotate", "meaning": "chú giải" }, { "word": "notorious", "meaning": "tai tiếng (nổi danh xấu)" }] },
      "suffix": { "text": "-able", "meaning": "có thể", "relatedWords": [] }
    }
  },
  {
    "id": "v332",
    "word": "OPTIMISTIC",
    "ipa": "ˌɒptɪˈmɪstɪk",
    "elo": 840,
    "level": "beginner",
    "scenario": "Còn đúng một tuần mà mình vẫn OPTIMISTIC lắm, tin rằng đọc slide hai đêm là qua môn, delulu nhẹ thôi.",
    "translationHint": "Lạc quan",
    "upgradeModule": {
      "simpleSentence": "He is very positive about the future.",
      "targetSlot": "positive",
      "academicOptions": [
        { "text": "cautiously optimistic", "nuance": "Lạc quan một cách thận trọng (thường dùng trong kinh doanh/kinh tế).", "formalityScore": 9 },
        { "text": "sanguine", "nuance": "Lạc quan, đầy hy vọng (ngay cả trong tình huống khó).", "formalityScore": 10 },
        { "text": "buoyant", "nuance": "Vui vẻ, sôi nổi (như phao nổi trên mặt nước).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "optim-", "meaning": "tốt nhất (best)", "relatedWords": [{ "word": "optimum", "meaning": "tối ưu" }, { "word": "optimize", "meaning": "tối ưu hóa" }] },
      "suffix": { "text": "-istic", "meaning": "thuộc về niềm tin/đặc điểm", "relatedWords": [] }
    }
  },
  {
    "id": "v333",
    "word": "PARTIAL",
    "ipa": "ˈpɑːʃl",
    "elo": 830,
    "level": "beginner",
    "scenario": "Mẹ PARTIAL rõ ràng, em trai làm vỡ chén thì \"không sao con\", mình làm vỡ thì nghe giảng tới tối, kém miếng khó chịu ghê.",
    "translationHint": "Một phần, thiên vị",
    "upgradeModule": {
      "simpleSentence": "The plan was only a small success.",
      "targetSlot": "small",
      "academicOptions": [
        { "text": "partial success", "nuance": "Thành công bước đầu, chưa trọn vẹn.", "formalityScore": 8 },
        { "text": "fragmentary", "nuance": "Rời rạc, chắp vá từ nhiều mảnh.", "formalityScore": 9 },
        { "text": "biased", "nuance": "Thiên vị (một nghĩa khác của partial).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "part-", "meaning": "phần (part)", "relatedWords": [{ "word": "partition", "meaning": "vách ngăn" }, { "word": "impartial", "meaning": "công bằng (không đứng về phía nào)" }] },
      "suffix": { "text": "-ial", "meaning": "thuộc về", "relatedWords": [] }
    }
  },
  {
    "id": "v334",
    "word": "PRACTICAL",
    "ipa": "ˈpræktɪkl",
    "elo": 870,
    "level": "beginner",
    "scenario": "Món quà sinh nhật PRACTICAL nhất mình từng nhận là một thùng mì, tới đúng tuần cuối tháng, keo lỳ.",
    "translationHint": "Thực tế, thực tiễn",
    "upgradeModule": {
      "simpleSentence": "We need a realistic solution.",
      "targetSlot": "realistic",
      "academicOptions": [
        { "text": "pragmatic", "nuance": "Thực dụng, thực tế (nhấn mạnh vào hiệu quả).", "formalityScore": 9 },
        { "text": "feasible", "nuance": "Khả thi, có thể thực hiện được.", "formalityScore": 8 },
        { "text": "viable", "nuance": "Có khả năng tồn tại và phát triển thực tế.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "pract/prag-", "meaning": "làm/hành động (to do/act)", "relatedWords": [{ "word": "practice", "meaning": "thực hành" }, { "word": "practitioner", "meaning": "người hành nghề" }, { "word": "pragmatic", "meaning": "thực tế" }] }
    }
  },
  {
    "id": "v335",
    "word": "QUICKLY",
    "ipa": "ˈkwɪkli",
    "elo": 800,
    "level": "beginner",
    "scenario": "Nghe tiếng xe mẹ đầu ngõ, mình QUICKLY tắt game, mở sách, bày đủ bút highlight, diễn out trình luôn.",
    "translationHint": "Nhanh chóng",
    "upgradeModule": {
      "simpleSentence": "The technology is changing very fast.",
      "targetSlot": "very fast",
      "academicOptions": [
        { "text": "rapidly evolving", "nuance": "Phát triển một cách nhanh chóng và mạnh mẽ.", "formalityScore": 9 },
        { "text": "swiftly", "nuance": "Nhanh nhẹn, không chậm trễ.", "formalityScore": 8 },
        { "text": "expeditiously", "nuance": "Khẩn trương và hiệu quả (thường dùng trong công việc).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "quick-", "meaning": "sống/nhanh (alive/swift - nghĩa gốc 'the quick and the dead')", "relatedWords": [{ "word": "quicken", "meaning": "làm nhanh thêm" }] },
      "suffix": { "text": "-ly", "meaning": "hậu tố trạng từ", "relatedWords": [] }
    }
  },
  {
    "id": "v336",
    "word": "REACTION",
    "ipa": "riˈækʃn",
    "elo": 820,
    "level": "beginner",
    "scenario": "REACTION của mẹ khi thấy mình nhuộm tóc hồng: im lặng ba giây rồi hỏi đúng một câu \"bao nhiêu tiền\", tới công chuyện.",
    "translationHint": "Phản ứng",
    "upgradeModule": {
      "simpleSentence": "What was his answer to your question?",
      "targetSlot": "answer",
      "academicOptions": [
        { "text": "immediate response", "nuance": "Sự phản hồi ngay lập tức.", "formalityScore": 8 },
        { "text": "backlash", "nuance": "Sự phản đối dữ dội từ cộng đồng.", "formalityScore": 9 },
        { "text": "reflex", "nuance": "Phản xạ tự nhiên.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "re-", "meaning": "ngược lại", "relatedWords": [] },
      "root": { "text": "act-", "meaning": "làm (to do)", "relatedWords": [{ "word": "activate", "meaning": "kích hoạt" }, { "word": "transaction", "meaning": "giao dịch (làm xuyên suốt)" }] }
    }
  },
  {
    "id": "v337",
    "word": "SKEPTICISM",
    "ipa": "ˈskeptɪsɪzəm",
    "elo": 1040,
    "level": "intermediate",
    "scenario": "Xem review \"quán ngon nhất Sài Gòn\" trên TikTok với đầy SKEPTICISM, vì clip nào cũng kèm mã giảm giá, phải check var.",
    "translationHint": "Sự hoài nghi",
    "upgradeModule": {
      "simpleSentence": "There is a lot of doubt about the new plan.",
      "targetSlot": "doubt",
      "academicOptions": [
        { "text": "widespread skepticism", "nuance": "Sự ngờ vực lan rộng trong cộng đồng.", "formalityScore": 9 },
        { "text": "cynicism", "nuance": "Sự hoài nghi do niềm tin vào bản chất xấu của con người.", "formalityScore": 9 },
        { "text": "reservation", "nuance": "Sự dè dặt, chưa hoàn toàn tin tưởng.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "skept-", "meaning": "xem xét/quan sát kỹ (to look/examine)", "relatedWords": [{ "word": "skeptic", "meaning": "người hay hoài nghi" }] },
      "suffix": { "text": "-ism", "meaning": "chủ nghĩa/trạng thái", "relatedWords": [] }
    }
  },
  {
    "id": "v338",
    "word": "TENDENCY",
    "ipa": "ˈtendənsi",
    "elo": 910,
    "level": "intermediate",
    "scenario": "Mình có TENDENCY mở tủ lạnh mỗi lần bí bài, đề chưa giải xong mà tủ lạnh đã ét o ét.",
    "translationHint": "Xu hướng, khuynh hướng",
    "upgradeModule": {
      "simpleSentence": "He usually forgets his keys.",
      "targetSlot": "usually forgets",
      "academicOptions": [
        { "text": "has a tendency to forget", "nuance": "Có xu hướng lặp lại một hành vi nào đó.", "formalityScore": 8 },
        { "text": "inclination", "nuance": "Sự thiên hướng, muốn làm gì đó.", "formalityScore": 9 },
        { "text": "propensity", "nuance": "Thiên hướng tự nhiên (thường dùng cho thói quen xấu).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "tend-", "meaning": "căng ra/vươn tới (to stretch)", "relatedWords": [{ "word": "extend", "meaning": "mở rộng" }, { "word": "intend", "meaning": "có ý định (vươn tới mục tiêu)" }, { "word": "tension", "meaning": "sự căng thẳng" }] },
      "suffix": { "text": "-ency", "meaning": "hậu tố danh từ", "relatedWords": [] }
    }
  },
  {
    "id": "v339",
    "word": "UNEXPECTED",
    "ipa": "ˌʌnɪkˈspektɪd",
    "elo": 850,
    "level": "beginner",
    "scenario": "Tin nhắn UNEXPECTED nhất năm nay: người yêu cũ hỏi mượn tài khoản Netflix, cả group hóng biến.",
    "translationHint": "Bất ngờ, không mong đợi",
    "upgradeModule": {
      "simpleSentence": "The rain was a surprise to us.",
      "targetSlot": "surprise",
      "academicOptions": [
        { "text": "unforeseen circumstance", "nuance": "Một tình huống không thể dự đoán trước được.", "formalityScore": 9 },
        { "text": "abrupt", "nuance": "Đột ngột, bất ngờ (đôi khi hơi thô lỗ).", "formalityScore": 8 },
        { "text": "fortuitous", "nuance": "Tình cờ, may mắn bất ngờ.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "un-", "meaning": "không", "relatedWords": [] },
      "prefix2": { "text": "ex-", "meaning": "ra ngoài", "relatedWords": [] },
      "root": { "text": "spect-", "meaning": "nhìn (nghĩa là 'không nhìn thấy trước được')", "relatedWords": [{ "word": "spectacle", "meaning": "quang cảnh" }, { "word": "inspect", "meaning": "thanh tra" }] }
    }
  },
  {
    "id": "v340",
    "word": "VALIDATE",
    "ipa": "ˈvælɪdeɪt",
    "elo": 940,
    "level": "intermediate",
    "scenario": "Gửi outfit vào group nhờ VALIDATE, cả đám khen đẹp, ra đường mới thấy ba người mặc y chang, xu cà na.",
    "translationHint": "Xác nhận, phê chuẩn",
    "upgradeModule": {
      "simpleSentence": "The expert checked if the painting was real.",
      "targetSlot": "checked if the painting was real",
      "academicOptions": [
        { "text": "validate the authenticity", "nuance": "Xác thực tính nguyên bản/thật của một vật.", "formalityScore": 10 },
        { "text": "verify", "nuance": "Kiểm chứng (thông qua dữ liệu).", "formalityScore": 8 },
        { "text": "corroborate", "nuance": "Làm vững thêm chứng cứ bằng các lời khai khác.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "val-", "meaning": "mạnh/giá trị (strong/worth)", "relatedWords": [{ "word": "valid", "meaning": "hợp lệ" }, { "word": "valor", "meaning": "dũng cảm" }, { "word": "value", "meaning": "giá trị" }] },
      "suffix": { "text": "-ate", "meaning": "hậu tố động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v341",
    "word": "WORTHWHILE",
    "ipa": "ˌwɜːθˈwaɪl",
    "elo": 900,
    "level": "intermediate",
    "scenario": "Xếp hàng hai tiếng vì fomo ổ bánh mì nổi trên TikTok, miếng đầu thấy WORTHWHILE, tới miếng hai thì hết chắc.",
    "translationHint": "Đáng công, xứng đáng",
    "upgradeModule": {
      "simpleSentence": "Learning a new language is a good thing to do.",
      "targetSlot": "good thing to do",
      "academicOptions": [
        { "text": "worthwhile endeavor", "nuance": "Một nỗ lực xứng đáng với thời gian và công sức bỏ ra.", "formalityScore": 9 },
        { "text": "rewarding", "nuance": "Đáng bõ công, đem lại cảm giác mãn nguyện.", "formalityScore": 8 },
        { "text": "valuable", "nuance": "Có giá trị.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "worth-", "meaning": "giá trị (value)", "relatedWords": [{ "word": "worthy", "meaning": "xứng đáng" }] },
      "root2": { "text": "while-", "meaning": "khoảng thời gian (time - nghĩa là xứng đáng với thời gian bỏ ra)", "relatedWords": [{ "word": "meanwhile", "meaning": "trong khi đó" }] }
    }
  },
  {
    "id": "v342",
    "word": "YIELD",
    "ipa": "jiːld",
    "elo": 1020,
    "level": "intermediate",
    "scenario": "Ba tháng nhắn chào buổi sáng cuối cùng cũng YIELD kết quả: crush rủ mình vô nhóm làm bài tập, delulu tưởng hẹn hò.",
    "translationHint": "Mang lại, sản sinh ra, nhượng bộ",
    "upgradeModule": {
      "simpleSentence": "The farm produced a lot of corn this year.",
      "targetSlot": "produced",
      "academicOptions": [
        { "text": "yield significant results", "nuance": "Mang lại những kết quả đáng kể.", "formalityScore": 9 },
        { "text": "generate", "nuance": "Tạo ra (thường dùng cho năng lượng/doanh thu).", "formalityScore": 8 },
        { "text": "render", "nuance": "Làm cho, đưa ra (thường mang tính kỹ thuật).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "yield", "meaning": "trả lại/nộp (to pay/give up - từ gốc tiếng Anh cổ 'gieldan')", "relatedWords": [] }
    }
  },
  {
    "id": "v343",
    "word": "ABANDON",
    "ipa": "əˈbændən",
    "elo": 880,
    "level": "beginner",
    "scenario": "Mua bộ màu nước về để chữa lành, vẽ đúng một bức rồi ABANDON nó trong góc tủ tới giờ.",
    "translationHint": "Từ bỏ, bỏ rơi",
    "upgradeModule": {
      "simpleSentence": "They had to stop the project because of money.",
      "targetSlot": "stop",
      "academicOptions": [
        { "text": "abandon the initiative", "nuance": "Từ bỏ một sáng kiến hoặc dự án đang dang dở.", "formalityScore": 9 },
        { "text": "relinquish", "nuance": "Từ bỏ quyền lợi hoặc kiểm soát (rất trang trọng).", "formalityScore": 10 },
        { "text": "discard", "nuance": "Vứt bỏ thứ không còn dùng được.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad-", "meaning": "tới", "relatedWords": [] },
      "root": { "text": "ban-", "meaning": "mệnh lệnh/quyền kiểm soát (proclamation/jurisdiction - nghĩa là đưa ra khỏi tầm kiểm soát)", "relatedWords": [{ "word": "ban", "meaning": "lệnh cấm" }, { "word": "bandit", "meaning": "kẻ bị trục xuất/ngoài vòng pháp luật" }] }
    }
  },
  {
    "id": "v344",
    "word": "BRIEF",
    "ipa": "briːf",
    "elo": 830,
    "level": "beginner",
    "scenario": "Ai BRIEF giùm mình drama group lớp với, mới ngủ trưa dậy mà đã 300 tin nhắn chưa đọc, fomo dữ.",
    "translationHint": "Ngắn gọn, tóm tắt",
    "upgradeModule": {
      "simpleSentence": "The meeting was very short.",
      "targetSlot": "short",
      "academicOptions": [
        { "text": "brief overview", "nuance": "Một cái nhìn tổng quan ngắn gọn.", "formalityScore": 8 },
        { "text": "concise", "nuance": "Súc tích, ít từ nhưng đủ ý.", "formalityScore": 9 },
        { "text": "succinct", "nuance": "Ngắn gọn và đi thẳng vào vấn đề.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "brevis-", "meaning": "ngắn (short)", "relatedWords": [{ "word": "abbreviate", "meaning": "viết tắt" }, { "word": "brevity", "meaning": "sự ngắn gọn" }] }
    }
  },
  {
    "id": "v345",
    "word": "CERTAIN",
    "ipa": "ˈsɜːtn",
    "elo": 810,
    "level": "beginner",
    "scenario": "Mình CERTAIN là đã khóa cửa phòng trọ rồi, nhưng vẫn quay xe về check var lần thứ ba.",
    "translationHint": "Chắc chắn",
    "upgradeModule": {
      "simpleSentence": "I am sure that the shop is closed.",
      "targetSlot": "sure",
      "academicOptions": [
        { "text": "absolutely certain", "nuance": "Chắc chắn tuyệt đối không chút nghi ngờ.", "formalityScore": 8 },
        { "text": "convinced", "nuance": "Bị thuyết phục, tin tưởng hoàn toàn.", "formalityScore": 8 },
        { "text": "indubitable", "nuance": "Không thể nghi ngờ được (cực kỳ trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "cert-", "meaning": "phân loại/quyết định (to sift/decide)", "relatedWords": [{ "word": "certificate", "meaning": "giấy chứng nhận" }, { "word": "discern", "meaning": "phân biệt (sàng lọc ra)" }, { "word": "ascertain", "meaning": "xác nhận rõ ràng" }] }
    }
  },
  {
    "id": "v346",
    "word": "DECLINE",
    "ipa": "dɪˈklaɪn",
    "elo": 940,
    "level": "intermediate",
    "scenario": "Lịch sự DECLINE thiệp cưới của đứa bạn cấp hai mười năm không nói chuyện, cái ví thở phào, chữa lành.",
    "translationHint": "Từ chối, suy giảm",
    "upgradeModule": {
      "simpleSentence": "The number of smokers is going down.",
      "targetSlot": "going down",
      "academicOptions": [
        { "text": "steadily decline", "nuance": "Sự suy giảm đều đặn qua thời gian.", "formalityScore": 9 },
        { "text": "deteriorate", "nuance": "Xuống cấp, tệ đi (thường dùng cho sức khỏe/chất lượng).", "formalityScore": 10 },
        { "text": "dwindle", "nuance": "Thu nhỏ, teo tóp dần.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "de-", "meaning": "xuống", "relatedWords": [] },
      "root": { "text": "clin-", "meaning": "nghiêng/dựa (to lean/bend)", "relatedWords": [{ "word": "recline", "meaning": "ngả lưng" }, { "word": "inclined", "meaning": "có khuynh hướng" }, { "word": "clinic", "meaning": "phòng khám (nơi bệnh nhân nằm nghiêng/nghỉ)" }] }
    }
  },
  {
    "id": "v347",
    "word": "ACCOMMODATE",
    "ipa": "əˈkɒmədeɪt",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Phòng trọ 12 mét vuông mà phải ACCOMMODATE cả hội bạn từ quê lên thi, ngủ xếp như cá mòi, real.",
    "translationHint": "Đáp ứng, cung cấp chỗ ở",
    "upgradeModule": {
      "simpleSentence": "We will try to follow your special requests.",
      "targetSlot": "follow your special requests",
      "academicOptions": [
        { "text": "accommodate the needs", "nuance": "Đáp ứng các nhu cầu hoặc điều kiện cụ thể.", "formalityScore": 9 },
        { "text": "cater to", "nuance": "Phục vụ cho một nhóm đối tượng/nhu cầu riêng biệt.", "formalityScore": 8 },
        { "text": "oblige", "nuance": "Giúp đỡ/làm ơn để vừa lòng ai đó.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad-", "meaning": "tới", "relatedWords": [] },
      "root": { "text": "mod-", "meaning": "đo lường/chừng mực (measure - nghĩa là làm cho phù hợp với khuôn mẫu)", "relatedWords": [{ "word": "modify", "meaning": "sửa đổi" }, { "word": "moderate", "meaning": "vừa phải" }] },
      "suffix": { "text": "-ate", "meaning": "động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v348",
    "word": "DELIBERATE",
    "ipa": "dɪˈlɪbərət",
    "elo": 980,
    "level": "intermediate",
    "scenario": "Seen tin nhắn rồi ba ngày sau mới rep là DELIBERATE chứ ai mà bận dữ vậy trời, red flag.",
    "translationHint": "Cố ý, thận trọng",
    "upgradeModule": {
      "simpleSentence": "It was not an accident; he did it on purpose.",
      "targetSlot": "on purpose",
      "academicOptions": [
        { "text": "deliberate act", "nuance": "Hành động có tính toán và chủ đích rõ ràng.", "formalityScore": 9 },
        { "text": "intentional", "nuance": "Có chủ ý.", "formalityScore": 8 },
        { "text": "premeditated", "nuance": "Có tính toán/sắp đặt từ trước (thường dùng trong pháp lý).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "de-", "meaning": "hoàn toàn", "relatedWords": [] },
      "root": { "text": "libra-", "meaning": "cái cân (balance - nghĩa là cân nhắc kỹ lưỡng trước khi làm)", "relatedWords": [{ "word": "equilibrium", "meaning": "sự cân bằng" }, { "word": "Libra", "meaning": "Cung Thiên Bình" }] }
    }
  },
  {
    "id": "v349",
    "word": "FINANCIAL",
    "ipa": "faɪˈnænʃl",
    "elo": 840,
    "level": "beginner",
    "scenario": "Tình hình FINANCIAL giữa tháng của mình: một trăm nghìn, hai gói mì và niềm tin vào ngày lãnh lương.",
    "translationHint": "Thuộc về tài chính",
    "upgradeModule": {
      "simpleSentence": "The company is having money problems.",
      "targetSlot": "money",
      "academicOptions": [
        { "text": "financial difficulties", "nuance": "Khó khăn về mặt tài chính (nghe chuyên nghiệp hơn 'hết tiền').", "formalityScore": 9 },
        { "text": "fiscal", "nuance": "Thuộc về ngân sách nhà nước/tài khóa.", "formalityScore": 10 },
        { "text": "monetary", "nuance": "Thuộc về tiền tệ.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "fin-", "meaning": "kết thúc/thanh toán (end/payment - nghĩa là kết thúc một khoản nợ)", "relatedWords": [{ "word": "finish", "meaning": "kết thúc" }, { "word": "fine", "meaning": "tiền phạt (khoản tiền để kết thúc rắc rối)" }] },
      "suffix": { "text": "-cial", "meaning": "thuộc về", "relatedWords": [] }
    }
  },
  {
    "id": "v350",
    "word": "GENEROUS",
    "ipa": "ˈdʒenərəs",
    "elo": 835,
    "level": "beginner",
    "scenario": "Nó GENEROUS bất ngờ, bao cả nhóm trà sữa, hóa ra là thao túng tâm lý để nhờ cả đám làm hộ phần thuyết trình.",
    "translationHint": "Hào phóng, rộng lượng",
    "upgradeModule": {
      "simpleSentence": "He gave a very big tip to the waiter.",
      "targetSlot": "big",
      "academicOptions": [
        { "text": "generous contribution", "nuance": "Sự đóng góp hào phóng và đáng kể.", "formalityScore": 8 },
        { "text": "magnanimous", "nuance": "Hào hiệp, cao thượng (vượt lên trên cả sự hào phóng tiền bạc).", "formalityScore": 10 },
        { "text": "bountiful", "nuance": "Dồi dào, hậu hĩnh.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "gener-", "meaning": "giống nòi/sinh ra (race/birth - nghĩa gốc là người thuộc dòng dõi quý tộc nên hào phóng)", "relatedWords": [{ "word": "generate", "meaning": "tạo ra" }, { "word": "general", "meaning": "chung/phổ quát (thuộc về cả dòng giống)" }] }
    }
  },
  {
    "id": "v351",
    "word": "IMMEDIATE",
    "ipa": "ɪˈmiːdiət",
    "elo": 845,
    "level": "beginner",
    "scenario": "Nhắn \"đi ăn khum\" là nó phản hồi IMMEDIATE, còn nhắc trả tiền nợ thì đọc ba ngày chưa rep.",
    "translationHint": "Ngay lập tức",
    "upgradeModule": {
      "simpleSentence": "We need to take action right now.",
      "targetSlot": "right now",
      "academicOptions": [
        { "text": "immediate attention", "nuance": "Sự chú ý cần được thực hiện ngay lập tức.", "formalityScore": 8 },
        { "text": "instantaneous", "nuance": "Tức thời (thường dùng cho phản ứng vật lý/kỹ thuật).", "formalityScore": 9 },
        { "text": "prompt", "nuance": "Kịp thời, nhanh chóng đúng lúc.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "không (not)", "relatedWords": [] },
      "root": { "text": "medi-", "meaning": "ở giữa (middle - nghĩa gốc là không có cái gì ngăn ở giữa, đến thẳng luôn)", "relatedWords": [{ "word": "medium", "meaning": "trung bình" }, { "word": "mediate", "meaning": "hòa giải (đứng giữa)" }] }
    }
  },
  {
    "id": "v352",
    "word": "KNOWLEDGEABLE",
    "ipa": "ˈnɒlɪdʒəbl",
    "elo": 950,
    "level": "intermediate",
    "scenario": "Đứa bạn KNOWLEDGEABLE về mọi quán ốc trong thành phố, out trình food reviewer, nhưng hỏi bài Kinh tế vi mô thì ngơ ngác.",
    "translationHint": "Am hiểu, có kiến thức rộng",
    "upgradeModule": {
      "simpleSentence": "He knows a lot about computers.",
      "targetSlot": "knows a lot",
      "academicOptions": [
        { "text": "highly knowledgeable", "nuance": "Cực kỳ am hiểu và có kiến thức chuyên sâu.", "formalityScore": 8 },
        { "text": "erudite", "nuance": "Thông thái, uyên bác (thường do đọc sách nhiều).", "formalityScore": 10 },
        { "text": "well-informed", "nuance": "Nắm bắt thông tin tốt.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "know-", "meaning": "biết", "relatedWords": [] },
      "root2": { "text": "ledge/log-", "meaning": "lý lẽ/lời nói", "relatedWords": [] },
      "suffix": { "text": "-able", "meaning": "có thể", "relatedWords": [] }
    }
  },
  {
    "id": "v353",
    "word": "MOTIVATE",
    "ipa": "ˈməʊtɪveɪt",
    "elo": 860,
    "level": "beginner",
    "scenario": "Thứ duy nhất MOTIVATE mình đi học sáng thứ hai là ổ bánh mì chảo trước cổng trường.",
    "translationHint": "Thúc đẩy, tạo động lực",
    "upgradeModule": {
      "simpleSentence": "The teacher tried to make the students want to learn.",
      "targetSlot": "make the students want to learn",
      "academicOptions": [
        { "text": "motivate the staff", "nuance": "Truyền cảm hứng và động lực cho nhân viên.", "formalityScore": 8 },
        { "text": "incentivize", "nuance": "Khuyến khích bằng phần thưởng hoặc lợi ích.", "formalityScore": 10 },
        { "text": "inspire", "nuance": "Truyền cảm hứng.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "mot-", "meaning": "di chuyển (to move)", "relatedWords": [{ "word": "motion", "meaning": "chuyển động" }, { "word": "motor", "meaning": "động cơ" }, { "word": "remote", "meaning": "xa xôi (di chuyển ra xa)" }] },
      "suffix": { "text": "-ate", "meaning": "động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v354",
    "word": "NEGATIVE",
    "ipa": "ˈneɡətɪv",
    "elo": 810,
    "level": "beginner",
    "scenario": "Đọc comment NEGATIVE dưới clip đầu tay xong mình xóa app, tối lại cài lại để đọc tiếp, hết cứu.",
    "translationHint": "Tiêu cực",
    "upgradeModule": {
      "simpleSentence": "The feedback from the customers was bad.",
      "targetSlot": "bad",
      "academicOptions": [
        { "text": "negative feedback", "nuance": "Phản hồi tiêu cực, không hài lòng.", "formalityScore": 8 },
        { "text": "adverse", "nuance": "Bất lợi, có hại (thường dùng cho tác dụng phụ hoặc điều kiện thời tiết).", "formalityScore": 10 },
        { "text": "pessimistic", "nuance": "Bi quan.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "neg-", "meaning": "không (no/not)", "relatedWords": [{ "word": "negate", "meaning": "phủ định" }, { "word": "negligent", "meaning": "cẩu thả (không quan tâm)" }] },
      "suffix": { "text": "-ive", "meaning": "tính chất", "relatedWords": [] }
    }
  },
  {
    "id": "v355",
    "word": "QUALITY",
    "ipa": "ˈkwɒləti",
    "elo": 805,
    "level": "beginner",
    "scenario": "Áo sale 50 nghìn QUALITY đúng giá, giặt lần đầu là co lại thành áo của em mình, toang.",
    "translationHint": "Chất lượng",
    "upgradeModule": {
      "simpleSentence": "The food in this restaurant is very good.",
      "targetSlot": "very good",
      "academicOptions": [
        { "text": "superior quality", "nuance": "Chất lượng vượt trội, cao cấp.", "formalityScore": 9 },
        { "text": "premium", "nuance": "Hạng sang, chất lượng cao đi kèm giá cao.", "formalityScore": 8 },
        { "text": "excellence", "nuance": "Sự xuất sắc, ưu tú.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "qual-", "meaning": "như thế nào (of what sort)", "relatedWords": [{ "word": "qualify", "meaning": "đủ tiêu chuẩn (xác định chất lượng)" }] }
    }
  },
  {
    "id": "v356",
    "word": "REASONABLE",
    "ipa": "ˈriːznəbl",
    "elo": 855,
    "level": "beginner",
    "scenario": "Giá phòng trọ nghe REASONABLE lắm, tới lúc chủ nhà báo tiền điện 4 nghìn một số là mình xỉu ngang.",
    "translationHint": "Hợp lý, phải chăng",
    "upgradeModule": {
      "simpleSentence": "The price of the house is fair.",
      "targetSlot": "fair",
      "academicOptions": [
        { "text": "reasonable request", "nuance": "Một yêu cầu hợp tình hợp lý.", "formalityScore": 8 },
        { "text": "justifiable", "nuance": "Chính đáng, có thể biện minh được.", "formalityScore": 10 },
        { "text": "affordable", "nuance": "Giá cả phải chăng (vừa túi tiền).", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "reason-", "meaning": "lý trí/tính toán (to calculate/reckon)", "relatedWords": [{ "word": "rational", "meaning": "hợp lý" }] },
      "suffix": { "text": "-able", "meaning": "có thể", "relatedWords": [] }
    }
  },
  {
    "id": "v357",
    "word": "ULTIMATE",
    "ipa": "ˈʌltɪmət",
    "elo": 940,
    "level": "intermediate",
    "scenario": "Mục tiêu ULTIMATE của mùa thi: đậu hết, ngủ đủ, không học lại môn nào để còn về quê ăn Tết, manifest gấp.",
    "translationHint": "Cuối cùng, tối thượng",
    "upgradeModule": {
      "simpleSentence": "What is the final goal of your project?",
      "targetSlot": "final",
      "academicOptions": [
        { "text": "ultimate objective", "nuance": "Mục tiêu cuối cùng và quan trọng nhất.", "formalityScore": 9 },
        { "text": "definitive", "nuance": "Dứt khoát, mang tính kết luận cuối cùng.", "formalityScore": 10 },
        { "text": "paramount", "nuance": "Tối cao, quan trọng hơn tất cả.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "ultim-", "meaning": "xa nhất/cuối cùng (last/farthest)", "relatedWords": [{ "word": "ultimatum", "meaning": "tối hậu thư" }, { "word": "ultra", "meaning": "vượt quá/cực đoan" }] }
    }
  },
  {
    "id": "v358",
    "word": "VAGUE",
    "ipa": "veɪɡ",
    "elo": 910,
    "level": "intermediate",
    "scenario": "\"Hôm nào cà phê nha\" là lời hẹn VAGUE đỉnh nóc kịch trần, hai đứa nói câu này từ hồi tốt nghiệp tới giờ.",
    "translationHint": "Mơ hồ, mập mờ",
    "upgradeModule": {
      "simpleSentence": "The instructions were not clear.",
      "targetSlot": "not clear",
      "academicOptions": [
        { "text": "vague description", "nuance": "Sự mô tả lờ mờ, thiếu chi tiết.", "formalityScore": 8 },
        { "text": "ambiguous", "nuance": "Mơ hồ, có thể hiểu theo nhiều nghĩa.", "formalityScore": 10 },
        { "text": "obscure", "nuance": "Tối nghĩa, khó hiểu.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "vagus-", "meaning": "lang thang (wandering - nghĩa gốc là ý nghĩa 'đi lang thang' không tập trung vào một điểm)", "relatedWords": [{ "word": "vagrant", "meaning": "người sống lang thang" }, { "word": "extravagant", "meaning": "phung phí (đi quá giới hạn)" }] }
    }
  },
  {
    "id": "v359",
    "word": "DEPENDABLE",
    "ipa": "dɪˈpendəbl",
    "elo": 930,
    "level": "intermediate",
    "scenario": "Đứa bạn DEPENDABLE nhất group nhớ lịch thi giùm cả lớp, còn gửi đề cương lúc 12 giờ đêm, ra đường tôi nể mỗi bạn.",
    "translationHint": "Đáng tin cậy",
    "upgradeModule": {
      "simpleSentence": "He is a person you can trust.",
      "targetSlot": "person you can trust",
      "academicOptions": [
        { "text": "dependable ally", "nuance": "Một đồng minh đáng tin cậy.", "formalityScore": 9 },
        { "text": "reliable", "nuance": "Đáng tin (thông dụng).", "formalityScore": 7 },
        { "text": "steadfast", "nuance": "Kiên định, không lay chuyển.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "de-", "meaning": "xuống", "relatedWords": [] },
      "root": { "text": "pend-", "meaning": "treo (to hang - nghĩa gốc là treo/dựa dẫm vào cái gì đó)", "relatedWords": [{ "word": "pendant", "meaning": "mặt dây chuyền" }, { "word": "suspend", "meaning": "đình chỉ/treo lên" }, { "word": "appendix", "meaning": "phụ lục (treo thêm vào)" }] }
    }
  },
  {
    "id": "v360",
    "word": "EFFECTIVE",
    "ipa": "ɪˈfektɪv",
    "elo": 850,
    "level": "beginner",
    "scenario": "Cách học thuộc EFFECTIVE nhất của mình: hẹn đứa bạn dò bài, sai một câu là bao một ly trà sữa, gét gô.",
    "translationHint": "Hiệu quả",
    "upgradeModule": {
      "simpleSentence": "This medicine is good at treating the flu.",
      "targetSlot": "good at treating",
      "academicOptions": [
        { "text": "highly effective", "nuance": "Đạt được hiệu quả mong muốn một cách rõ rệt.", "formalityScore": 8 },
        { "text": "efficacious", "nuance": "Có hiệu lực (thường dùng trong y tế/thuốc).", "formalityScore": 10 },
        { "text": "potent", "nuance": "Mạnh mẽ, có tác động lớn.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ex/ef-", "meaning": "ra ngoài", "relatedWords": [] },
      "root": { "text": "fic-", "meaning": "làm (to make - nghĩa là làm ra được kết quả bên ngoài)", "relatedWords": [{ "word": "efficient", "meaning": "năng suất" }, { "word": "fiction", "meaning": "hư cấu" }] }
    }
  },
  {
    "id": "v361",
    "word": "APPROPRIATE",
    "ipa": "əˈprəʊpriət",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Mặc đồ ngủ hình con gấu đi họp Zoom với khách hàng, mình thấy cũng APPROPRIATE, cho tới khi phải đứng dậy lấy sạc, u là trời.",
    "translationHint": "Phù hợp, thích hợp",
    "upgradeModule": {
      "simpleSentence": "Is this formal dress right for the party?",
      "targetSlot": "right",
      "academicOptions": [
        { "text": "appropriate attire", "nuance": "Trang phục phù hợp với hoàn cảnh/nghi thức.", "formalityScore": 9 },
        { "text": "fitting", "nuance": "Xứng đáng, vừa vặn với tình huống.", "formalityScore": 7 },
        { "text": "apt", "nuance": "Thích hợp, khéo léo (apt remark).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad/ap-", "meaning": "đến/hướng tới", "relatedWords": [] },
      "root": { "text": "proprius-", "meaning": "riêng biệt/đặc hữu (one's own)", "relatedWords": [{ "word": "property", "meaning": "tài sản/thuộc tính" }, { "word": "proper", "meaning": "đúng mực" }, { "word": "proprietor", "meaning": "chủ sở hữu" }] }
    }
  },
  {
    "id": "v362",
    "word": "BEHAVE",
    "ipa": "bɪˈheɪv",
    "elo": 820,
    "level": "beginner",
    "scenario": "Về quê ăn giỗ, mẹ dặn phải BEHAVE cho đàng hoàng, vậy mà mới ngồi năm phút đã cãi tay đôi với ông chú về lương IT, toang.",
    "translationHint": "Cư xử, ăn ở",
    "upgradeModule": {
      "simpleSentence": "The children acted very well during the trip.",
      "targetSlot": "acted",
      "academicOptions": [
        { "text": "behave professionally", "nuance": "Hành xử một cách chuyên nghiệp.", "formalityScore": 8 },
        { "text": "conduct oneself", "nuance": "Cách một người tự dẫn dắt/thể hiện bản thân (rất trang trọng).", "formalityScore": 10 },
        { "text": "comport", "nuance": "Cư xử phù hợp với địa vị/hoàn cảnh.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "be-", "meaning": "hoàn toàn/xung quanh", "relatedWords": [] },
      "root": { "text": "have-", "meaning": "có/giữ (to have - nghĩa gốc là 'tự giữ mình')", "relatedWords": [{ "word": "habit", "meaning": "thói quen (thứ mình giữ)" }] }
    }
  },
  {
    "id": "v363",
    "word": "COINCIDENCE",
    "ipa": "kəʊˈɪnsɪdəns",
    "elo": 980,
    "level": "intermediate",
    "scenario": "Vừa nói xấu đứa cùng phòng trọ trong group chat thì nó gõ cửa, mong đây chỉ là COINCIDENCE, ét o ét.",
    "translationHint": "Sự trùng hợp ngẫu nhiên",
    "upgradeModule": {
      "simpleSentence": "It was just a chance that we met at the airport.",
      "targetSlot": "chance",
      "academicOptions": [
        { "text": "remarkable coincidence", "nuance": "Một sự trùng hợp đáng chú ý.", "formalityScore": 8 },
        { "text": "fluke", "nuance": "Sự may mắn/trùng hợp ngẫu nhiên (thông dụng).", "formalityScore": 5 },
        { "text": "serendipity", "nuance": "Sự tình cờ may mắn tìm được thứ quý giá.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "co-", "meaning": "cùng nhau", "relatedWords": [] },
      "prefix2": { "text": "in-", "meaning": "vào/trên", "relatedWords": [] },
      "root": { "text": "cad/cid-", "meaning": "rơi (to fall - nghĩa là các sự kiện 'rơi vào nhau' cùng lúc)", "relatedWords": [{ "word": "accident", "meaning": "tai nạn (rơi vào bất ngờ)" }, { "word": "incident", "meaning": "sự cố" }, { "word": "deciduous", "meaning": "rụng lá (rơi xuống)" }] }
    }
  },
  {
    "id": "v364",
    "word": "DETERMINED",
    "ipa": "dɪˈtɜːmɪnd",
    "elo": 880,
    "level": "beginner",
    "scenario": "Tối Chủ nhật DETERMINED từ mai dậy 5 giờ chạy bộ, manifest đủ kiểu, sáng thứ Hai tắt báo thức bằng một ngón tay mà mắt chưa kịp mở.",
    "translationHint": "Quyết tâm, kiên quyết",
    "upgradeModule": {
      "simpleSentence": "He is very firm about finishing the marathon.",
      "targetSlot": "firm",
      "academicOptions": [
        { "text": "resolute", "nuance": "Kiên định, không hề nao núng trước khó khăn.", "formalityScore": 9 },
        { "text": "dogged", "nuance": "Lỳ lợm, bền bỉ (như chó săn).", "formalityScore": 8 },
        { "text": "steadfast", "nuance": "Trung thành và kiên định.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "de-", "meaning": "hoàn toàn", "relatedWords": [] },
      "root": { "text": "termin-", "meaning": "giới hạn/ranh giới (limit/end - nghĩa là đặt ra ranh giới cuối cùng, không thay đổi)", "relatedWords": [{ "word": "terminal", "meaning": "nhà ga cuối/cuối cùng" }, { "word": "terminate", "meaning": "chấm dứt" }, { "word": "exterminate", "meaning": "hủy diệt (đưa ra khỏi ranh giới)" }] }
    }
  },
  {
    "id": "v365",
    "word": "ENCOURAGE",
    "ipa": "ɪnˈkʌrɪdʒ",
    "elo": 860,
    "level": "beginner",
    "scenario": "Cả group ENCOURAGE tao nhắn tin cho crush trước, tới lúc bị seen không rep thì đứa nào cũng bận đi tắm, bạn bè red flag.",
    "translationHint": "Khuyến khích, động viên",
    "upgradeModule": {
      "simpleSentence": "The boss told me to keep working hard.",
      "targetSlot": "told me to keep",
      "academicOptions": [
        { "text": "encourage growth", "nuance": "Thúc đẩy sự tăng trưởng.", "formalityScore": 8 },
        { "text": "incentivize", "nuance": "Khuyến khích bằng lợi ích/phần thưởng.", "formalityScore": 10 },
        { "text": "foster", "nuance": "Nuôi dưỡng, thúc đẩy (thường dùng cho kỹ năng/môi trường).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "en-", "meaning": "làm cho/vào trong", "relatedWords": [] },
      "root": { "text": "cour/cor-", "meaning": "trái tim (heart - nghĩa là truyền thêm 'tim'/sức mạnh cho ai đó)", "relatedWords": [{ "word": "core", "meaning": "cốt lõi" }, { "word": "cordial", "meaning": "thân ái (từ tận trái tim)" }, { "word": "courage", "meaning": "dũng cảm" }] }
    }
  },
  {
    "id": "v366",
    "word": "FAMILIAR",
    "ipa": "fəˈmɪliə(r)",
    "elo": 810,
    "level": "beginner",
    "scenario": "Mở đề thi ra thấy câu nào cũng FAMILIAR, kiểu đã gặp ở đâu rồi, chắc là trong giấc mơ đêm qua.",
    "translationHint": "Quen thuộc",
    "upgradeModule": {
      "simpleSentence": "I know this place very well.",
      "targetSlot": "know this place very well",
      "academicOptions": [
        { "text": "intimately familiar with", "nuance": "Cực kỳ am tường, hiểu rõ như lòng bàn tay.", "formalityScore": 9 },
        { "text": "acquainted with", "nuance": "Quen biết, có biết qua (mức độ thấp hơn).", "formalityScore": 8 },
        { "text": "conversant with", "nuance": "Thông thạo, có thể nói chuyện sâu về vấn đề đó.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "famil-", "meaning": "gia đình (family - nghĩa là quen thuộc như người trong nhà)", "relatedWords": [{ "word": "family", "meaning": "gia đình" }, { "word": "familiarity", "meaning": "sự thân thuộc" }] }
    }
  },
  {
    "id": "v367",
    "word": "HINDER",
    "ipa": "ˈhɪndə(r)",
    "elo": 970,
    "level": "intermediate",
    "scenario": "Wifi phòng trọ chập chờn đang HINDER sự nghiệp chạy deadline của tôi, mà lướt TikTok thì mượt re, thao túng tâm lý ghê.",
    "translationHint": "Cản trở, kìm hãm",
    "upgradeModule": {
      "simpleSentence": "The noise made it hard to study.",
      "targetSlot": "made it hard",
      "academicOptions": [
        { "text": "hinder the process", "nuance": "Làm chậm hoặc gây khó khăn cho tiến trình.", "formalityScore": 8 },
        { "text": "impede", "nuance": "Làm trì trệ (thường dùng cho giao thông/quy trình).", "formalityScore": 10 },
        { "text": "obstruct", "nuance": "Gây tắc nghẽn, chặn đường hoàn toàn.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "hind-", "meaning": "phía sau (behind - nghĩa là giữ ai đó lại phía sau)", "relatedWords": [{ "word": "behind", "meaning": "phía sau" }, { "word": "hind", "meaning": "chân sau (động vật)" }] }
    }
  },
  {
    "id": "v368",
    "word": "IMITATE",
    "ipa": "ˈɪmɪteɪt",
    "elo": 940,
    "level": "intermediate",
    "scenario": "Đứa bạn IMITATE giọng cô chủ nhiệm y chang, cả lớp đang nghiêng ngả thì phát hiện cô đứng ngay cửa sổ, tới công chuyện.",
    "translationHint": "Bắt chước, nhại lại",
    "upgradeModule": {
      "simpleSentence": "He tried to copy the style of the famous artist.",
      "targetSlot": "copy",
      "academicOptions": [
        { "text": "emulate", "nuance": "Bắt chước để noi gương và cố gắng đạt được thành tựu tương tự.", "formalityScore": 9 },
        { "text": "mimic", "nuance": "Nhại lại (thường mang tính giải trí hoặc châm chọc).", "formalityScore": 6 },
        { "text": "replicate", "nuance": "Tái tạo, sao chép chính xác (trong thí nghiệm/sản xuất).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "imag-", "meaning": "hình ảnh (image/likeness)", "relatedWords": [{ "word": "image", "meaning": "hình ảnh" }, { "word": "imagination", "meaning": "tưởng tượng" }] },
      "suffix": { "text": "-ate", "meaning": "động từ", "relatedWords": [] }
    }
  },
  {
    "id": "v369",
    "word": "JEALOUS",
    "ipa": "ˈdʒeləs",
    "elo": 830,
    "level": "beginner",
    "scenario": "Thấy bạn thân đăng ảnh đi Đà Lạt với người yêu, tôi khum JEALOUS đâu, chỉ là lỡ tay xem story đó bảy lần.",
    "translationHint": "Ghen tị, ghen tuông",
    "upgradeModule": {
      "simpleSentence": "He was angry because his friend got a new car.",
      "targetSlot": "angry",
      "academicOptions": [
        { "text": "envious of", "nuance": "Thèm muốn thứ người khác có (jealous thường kèm cảm giác bảo vệ thứ mình có).", "formalityScore": 8 },
        { "text": "resentful", "nuance": "Bực bội, uất ức vì cảm thấy bất công.", "formalityScore": 9 },
        { "text": "green-eyed", "nuance": "Mắt xanh vì ghen tị (thành ngữ).", "formalityScore": 5 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "zelos-", "meaning": "nhiệt huyết (zeal - nghĩa gốc là sự nhiệt thành quá mức dẫn đến ghen tị)", "relatedWords": [{ "word": "zeal", "meaning": "lòng nhiệt thành" }, { "word": "zealous", "meaning": "hăng hái" }, { "word": "zealot", "meaning": "người cuồng tín" }] }
    }
  },
  {
    "id": "v370",
    "word": "LIMIT",
    "ipa": "ˈlɪmɪt",
    "elo": 815,
    "level": "beginner",
    "scenario": "Thẻ tín dụng chạm LIMIT từ hôm săn sale 10.10, giờ quẹt mua ly trà sữa cũng nghe máy kêu từ chối, ét o ét.",
    "translationHint": "Giới hạn, hạn mức",
    "upgradeModule": {
      "simpleSentence": "We need to stop the amount of sugar we eat.",
      "targetSlot": "stop the amount of",
      "academicOptions": [
        { "text": "curtail consumption", "nuance": "Cắt giảm sự tiêu thụ (rất trang trọng).", "formalityScore": 10 },
        { "text": "restrict", "nuance": "Hạn chế, thắt chặt (theo quy định).", "formalityScore": 8 },
        { "text": "cap", "nuance": "Đặt mức trần (thường dùng cho chi phí/ngân sách).", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "limin-", "meaning": "ngưỡng cửa/ranh giới (threshold)", "relatedWords": [{ "word": "eliminate", "meaning": "loại bỏ (đưa ra khỏi ngưỡng)" }, { "word": "subliminal", "meaning": "dưới ngưỡng nhận thức" }] }
    }
  },
  {
    "id": "v371",
    "word": "NOTICE",
    "ipa": "ˈnəʊtɪs",
    "elo": 810,
    "level": "beginner",
    "scenario": "Đi làm cả buổi sáng mới NOTICE là mình mang hai chiếc dép khác màu, mà không ai nói, đồng nghiệp lowkey ác.",
    "translationHint": "Để ý thấy, nhận ra",
    "upgradeModule": {
      "simpleSentence": "Did you see the small change in the room?",
      "targetSlot": "see",
      "academicOptions": [
        { "text": "observe the discrepancy", "nuance": "Quan sát thấy sự khác biệt/sai lệch.", "formalityScore": 9 },
        { "text": "perceive", "nuance": "Nhận thức/cảm nhận được.", "formalityScore": 10 },
        { "text": "detect", "nuance": "Dò tìm/phát hiện ra (thường là thứ khó thấy).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "not-", "meaning": "biết/đánh dấu (to know/mark)", "relatedWords": [{ "word": "note", "meaning": "ghi chú" }, { "word": "notable", "meaning": "đáng chú ý" }, { "word": "notorious", "meaning": "khét tiếng" }] }
    }
  },
  {
    "id": "v372",
    "word": "PATIENT",
    "ipa": "ˈpeɪʃnt",
    "elo": 825,
    "level": "beginner",
    "scenario": "Chờ shipper giao đơn ba ngày tôi PATIENT lắm, nhưng chờ crush rep tin ba phút là đi vòng vòng khắp phòng, hết cứu.",
    "translationHint": "Kiên nhẫn",
    "upgradeModule": {
      "simpleSentence": "You have to wait for the results.",
      "targetSlot": "wait",
      "academicOptions": [
        { "text": "be patient with", "nuance": "Kiên nhẫn với ai đó/việc gì đó.", "formalityScore": 7 },
        { "text": "forbearing", "nuance": "Chịu đựng, bao dung (rất trang trọng).", "formalityScore": 10 },
        { "text": "uncomplaining", "nuance": "Không than phiền, cam chịu.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "pas/path-", "meaning": "chịu đựng/cảm xúc (to suffer/feel)", "relatedWords": [{ "word": "passion", "meaning": "đam mê (nghĩa gốc là chịu khổ vì yêu)" }, { "word": "passive", "meaning": "bị động" }, { "word": "sympathy", "meaning": "đồng cảm" }] }
    }
  },
  {
    "id": "v373",
    "word": "QUARREL",
    "ipa": "ˈkwɒrəl",
    "elo": 930,
    "level": "intermediate",
    "scenario": "Hai đứa cùng phòng trọ QUARREL cả tối vì ai rửa chén, cuối cùng đặt đồ ăn ngoài cho khỏi có chén mà rửa, keo lỳ.",
    "translationHint": "Cãi vã, tranh chấp",
    "upgradeModule": {
      "simpleSentence": "The couple had a small fight about money.",
      "targetSlot": "fight",
      "academicOptions": [
        { "text": "domestic quarrel", "nuance": "Cuộc cãi vã trong gia đình.", "formalityScore": 8 },
        { "text": "altercation", "nuance": "Cuộc đấu khẩu ồn ào (thường ở nơi công cộng).", "formalityScore": 10 },
        { "text": "dispute", "nuance": "Tranh chấp (thường về lý lẽ/pháp lý).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "queri-", "meaning": "phàn nàn (to complain)", "relatedWords": [{ "word": "querulous", "meaning": "hay phàn nàn/cáu kỉnh" }] }
    }
  },
  {
    "id": "v374",
    "word": "STUBBORN",
    "ipa": "ˈstʌbən",
    "elo": 860,
    "level": "beginner",
    "scenario": "Con laptop cũ STUBBORN thật, bấm cập nhật là nó quay vòng tròn tới sáng, như đang thao túng tâm lý mình.",
    "translationHint": "Bướng bỉnh, lỳ lợm",
    "upgradeModule": {
      "simpleSentence": "He refuses to change his mind.",
      "targetSlot": "refuses to change his mind",
      "academicOptions": [
        { "text": "stubbornly refuse", "nuance": "Từ chối một cách bướng bỉnh.", "formalityScore": 7 },
        { "text": "obstinate", "nuance": "Ngoan cố, khó bảo (mức độ nặng hơn).", "formalityScore": 9 },
        { "text": "intransigent", "nuance": "Cứng nhắc, không chịu thỏa hiệp.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "stub-", "meaning": "gốc cây (gốc từ 'stub' - cứng và khó nhổ như gốc cây)", "relatedWords": [{ "word": "stub", "meaning": "mẩu (thuốc lá/vé)" }] }
    }
  },
  {
    "id": "v375",
    "word": "TEMPORARY",
    "ipa": "ˈtemprəri",
    "elo": 870,
    "level": "beginner",
    "scenario": "Nghỉ việc nói là TEMPORARY để chữa lành, giờ đã tháng thứ tư và tôi quên luôn mật khẩu email công ty.",
    "translationHint": "Tạm thời",
    "upgradeModule": {
      "simpleSentence": "This is a short-term solution.",
      "targetSlot": "short-term",
      "academicOptions": [
        { "text": "temporary measure", "nuance": "Biện pháp tạm thời.", "formalityScore": 8 },
        { "text": "transient", "nuance": "Thoáng qua, ngắn ngủi.", "formalityScore": 10 },
        { "text": "provisional", "nuance": "Tạm thời (chờ thay thế bằng cái chính thức).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "temp-", "meaning": "thời gian (time)", "relatedWords": [{ "word": "temple", "meaning": "thái dương (nơi đo thời gian/tuổi tác)" }, { "word": "tempo", "meaning": "nhịp độ" }, { "word": "contemporary", "meaning": "đương đại (cùng thời gian)" }] }
    }
  },
  {
    "id": "v376",
    "word": "URGENT",
    "ipa": "ˈɜːdʒənt",
    "elo": 845,
    "level": "beginner",
    "scenario": "Mẹ nhắn \"Gọi mẹ gấp, chuyện URGENT\", tôi run tay bấm gọi, hóa ra mẹ hỏi cách gửi sticker trên Zalo, xỉu ngang.",
    "translationHint": "Khẩn cấp",
    "upgradeModule": {
      "simpleSentence": "We need to fix this problem very soon.",
      "targetSlot": "very soon",
      "academicOptions": [
        { "text": "urgent matter", "nuance": "Vấn đề cấp bách cần xử lý ngay.", "formalityScore": 8 },
        { "text": "pressing issue", "nuance": "Vấn đề nhức nhối/cấp thiết.", "formalityScore": 9 },
        { "text": "imperative", "nuance": "Bắt buộc, khẩn thiết yếu.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "urg-", "meaning": "thúc đẩy/ép (to press/drive)", "relatedWords": [{ "word": "urge", "meaning": "thúc giục" }] }
    }
  },
  {
    "id": "v377",
    "word": "WILLING",
    "ipa": "ˈwɪlɪŋ",
    "elo": 830,
    "level": "beginner",
    "scenario": "Ai rủ đi lẩu nửa đêm tôi WILLING liền, gét gô trong một nốt nhạc; rủ chạy bộ 6 giờ sáng thì tôi xin phép mất sóng.",
    "translationHint": "Sẵn lòng, tự nguyện",
    "upgradeModule": {
      "simpleSentence": "He is ready to help his neighbors.",
      "targetSlot": "ready",
      "academicOptions": [
        { "text": "willingness to cooperate", "nuance": "Sự sẵn lòng hợp tác.", "formalityScore": 8 },
        { "text": "amenable", "nuance": "Dễ bảo, sẵn lòng tuân theo.", "formalityScore": 10 },
        { "text": "inclined", "nuance": "Có xu hướng/muốn làm gì đó.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "will-", "meaning": "ý muốn (wish/will)", "relatedWords": [{ "word": "willpower", "meaning": "nghị lực" }] }
    }
  },
  {
    "id": "v378",
    "word": "ACCURATE",
    "ipa": "ˈækjərət",
    "elo": 880,
    "level": "beginner",
    "scenario": "App bói tình yêu bảo crush đang thích mình, ACCURATE hay không chưa biết, nhưng mình tin rồi, delulu một chút cho vui.",
    "translationHint": "Chính xác",
    "upgradeModule": {
      "simpleSentence": "The map is very correct.",
      "targetSlot": "correct",
      "academicOptions": [
        { "text": "highly accurate", "nuance": "Chính xác cao.", "formalityScore": 8 },
        { "text": "precise", "nuance": "Tỉ mỉ, chính xác tuyệt đối.", "formalityScore": 10 },
        { "text": "exact", "nuance": "Chuẩn xác.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad/ac-", "meaning": "đến/hướng tới", "relatedWords": [] },
      "root": { "text": "cur-", "meaning": "chăm sóc (care - nghĩa gốc là được làm với sự chăm sóc kỹ lưỡng)", "relatedWords": [{ "word": "cure", "meaning": "chữa trị" }, { "word": "curator", "meaning": "người quản lý bảo tàng" }, { "word": "secure", "meaning": "an toàn (không lo lắng)" }] }
    }
  },
  {
    "id": "v379",
    "word": "BELIEVABLE",
    "ipa": "bɪˈliːvəbl",
    "elo": 815,
    "level": "beginner",
    "scenario": "Lý do trễ hẹn của nó là \"kẹt xe trên cầu\" nghe cũng BELIEVABLE, nếu story của nó khum đang ở quán ốc.",
    "translationHint": "Có thể tin được",
    "upgradeModule": {
      "simpleSentence": "His excuse sounds like it could be true.",
      "targetSlot": "sounds like it could be true",
      "academicOptions": [
        { "text": "plausible explanation", "nuance": "Lời giải thích hợp lý, đáng tin.", "formalityScore": 9 },
        { "text": "credible", "nuance": "Đáng tin cậy.", "formalityScore": 10 },
        { "text": "convincing", "nuance": "Có sức thuyết phục.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "believe-", "meaning": "tin tưởng/yêu quý (trust/love)", "relatedWords": [{ "word": "belief", "meaning": "niềm tin" }] },
      "suffix": { "text": "-able", "meaning": "có thể", "relatedWords": [] }
    }
  },
  {
    "id": "v380",
    "word": "CONVENIENT",
    "ipa": "kənˈviːniənt",
    "elo": 820,
    "level": "beginner",
    "scenario": "Ở trọ ngay dưới nhà là quán trà sữa, CONVENIENT cực, chỉ có cái ví là lowkey muốn dọn nhà đi chỗ khác.",
    "translationHint": "Tiện lợi",
    "upgradeModule": {
      "simpleSentence": "The location of the hotel is very good for tourists.",
      "targetSlot": "good",
      "academicOptions": [
        { "text": "conveniently located", "nuance": "Vị trí thuận tiện.", "formalityScore": 8 },
        { "text": "advantageous", "nuance": "Có lợi thế.", "formalityScore": 10 },
        { "text": "expedient", "nuance": "Tiện lợi (thường mang tính thực dụng/nhất thời).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "con-", "meaning": "cùng nhau", "relatedWords": [] },
      "root": { "text": "ven-", "meaning": "đến (to come - nghĩa là các thứ 'đến cùng nhau' một cách hợp lý)", "relatedWords": [{ "word": "event", "meaning": "sự kiện" }, { "word": "prevent", "meaning": "ngăn chặn" }, { "word": "venue", "meaning": "địa điểm" }] }
    }
  },
  {
    "id": "v381",
    "word": "DEPENDABLE",
    "ipa": "dɪˈpendəbl",
    "elo": 930,
    "level": "intermediate",
    "scenario": "Trong group du lịch luôn có một đứa DEPENDABLE giữ vé, giữ tiền, giữ luôn sạc dự phòng cho cả đám báo thủ.",
    "translationHint": "Đáng tin cậy",
    "upgradeModule": {
      "simpleSentence": "My car is old but I can trust it.",
      "targetSlot": "I can trust it",
      "academicOptions": [
        { "text": "highly dependable", "nuance": "Cực kỳ đáng tin cậy.", "formalityScore": 8 },
        { "text": "reliable", "nuance": "Đáng tin (thông dụng).", "formalityScore": 7 },
        { "text": "steadfast", "nuance": "Kiên định, không thay đổi.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "de-", "meaning": "xuống/từ", "relatedWords": [] },
      "root": { "text": "pend-", "meaning": "treo (to hang - nghĩa gốc là treo mình/dựa dẫm vào cái gì đó)", "relatedWords": [{ "word": "pendant", "meaning": "mặt dây chuyền" }, { "word": "suspend", "meaning": "đình chỉ/treo lên" }] }
    }
  },
  {
    "id": "v382",
    "word": "EFFECTIVE",
    "ipa": "ɪˈfektɪv",
    "elo": 850,
    "level": "beginner",
    "scenario": "Thử đủ app học tiếng Anh, cách EFFECTIVE nhất vẫn là con cú xanh nhắc bài kiểu đe dọa lúc nửa đêm, out trình mọi thầy cô.",
    "translationHint": "Hiệu quả",
    "upgradeModule": {
      "simpleSentence": "The new law is working well to reduce crime.",
      "targetSlot": "working well",
      "academicOptions": [
        { "text": "highly effective", "nuance": "Đạt được hiệu quả mong muốn rõ rệt.", "formalityScore": 8 },
        { "text": "efficacious", "nuance": "Có hiệu lực (thường dùng cho thuốc).", "formalityScore": 10 },
        { "text": "potent", "nuance": "Mạnh mẽ, có tác động lớn.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ex/ef-", "meaning": "ra ngoài", "relatedWords": [] },
      "root": { "text": "fic-", "meaning": "làm (to make - nghĩa là làm ra kết quả thực tế bên ngoài)", "relatedWords": [{ "word": "fiction", "meaning": "hư cấu" }, { "word": "sacrifice", "meaning": "hy sinh" }] }
    }
  },
  {
    "id": "v383",
    "word": "GRATEFUL",
    "ipa": "ˈɡreɪtfl",
    "elo": 860,
    "level": "beginner",
    "scenario": "Cuối tháng còn 50 nghìn, tôi GRATEFUL vô cùng vì mẹ gửi lên thùng mì với hũ chà bông, kèm câu \"ăn uống cho đàng hoàng\", ok mom.",
    "translationHint": "Biết ơn",
    "upgradeModule": {
      "simpleSentence": "I am very thankful for your help.",
      "targetSlot": "thankful",
      "academicOptions": [
        { "text": "deeply grateful", "nuance": "Biết ơn sâu sắc.", "formalityScore": 8 },
        { "text": "indebted to", "nuance": "Mắc nợ/biết ơn ai đó (rất trang trọng).", "formalityScore": 10 },
        { "text": "appreciative", "nuance": "Biết trân trọng.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "grat-", "meaning": "lòng tốt/miễn phí (pleasing/free)", "relatedWords": [{ "word": "gratitude", "meaning": "lòng biết ơn" }, { "word": "gratuitous", "meaning": "miễn phí/vô lý" }, { "word": "congratulate", "meaning": "chúc mừng" }] }
    }
  },
  {
    "id": "v384",
    "word": "HONEST",
    "ipa": "ˈɒnɪst",
    "elo": 810,
    "level": "beginner",
    "scenario": "Nhờ bạn thân cho ý kiến HONEST về ảnh đại diện mới, nó im lặng ba phút rồi hỏi \"chụp lúc đang buồn ngủ hả\", bạn real.",
    "translationHint": "Thành thật, chân thật",
    "upgradeModule": {
      "simpleSentence": "He gave a very true answer.",
      "targetSlot": "true",
      "academicOptions": [
        { "text": "candid", "nuance": "Thẳng thắn, không che giấu.", "formalityScore": 9 },
        { "text": "forthright", "nuance": "Bộc trực, ngay thẳng.", "formalityScore": 10 },
        { "text": "sincere", "nuance": "Chân thành.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "honos-", "meaning": "danh dự (honor)", "relatedWords": [{ "word": "honor", "meaning": "danh dự" }, { "word": "honorary", "meaning": "danh dự (chức danh)" }] }
    }
  },
  {
    "id": "v385",
    "word": "IGNORE",
    "ipa": "ɪɡˈnɔː(r)",
    "elo": 820,
    "level": "beginner",
    "scenario": "Tôi IGNORE thông báo của group lớp suốt tuần, tới lúc vào hóng biến mới biết mai thi giữa kỳ.",
    "translationHint": "Phớt lờ, lờ đi",
    "upgradeModule": {
      "simpleSentence": "Don't pay attention to his mean comments.",
      "targetSlot": "Don't pay attention to",
      "academicOptions": [
        { "text": "disregard", "nuance": "Coi thường, không thèm để ý.", "formalityScore": 9 },
        { "text": "overlook", "nuance": "Vô tình bỏ qua.", "formalityScore": 8 },
        { "text": "neglect", "nuance": "Bỏ bê (thường dùng cho nhiệm vụ/trách nhiệm).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in/ig-", "meaning": "không (not)", "relatedWords": [] },
      "root": { "text": "gnor/gno-", "meaning": "biết (to know - nghĩa là 'không muốn biết')", "relatedWords": [{ "word": "know", "meaning": "biết" }, { "word": "agnostic", "meaning": "người theo thuyết bất khả tri" }, { "word": "recognize", "meaning": "nhận ra" }] }
    }
  },
  {
    "id": "v386",
    "word": "INTENTION",
    "ipa": "ɪnˈtenʃn",
    "elo": 910,
    "level": "intermediate",
    "scenario": "Nó thả tim mọi story của tôi lúc 2 giờ sáng, INTENTION là gì thì chưa rõ, cả group đang check var.",
    "translationHint": "Ý định, mục đích",
    "upgradeModule": {
      "simpleSentence": "What is your plan for the future?",
      "targetSlot": "plan",
      "academicOptions": [
        { "text": "clear intention", "nuance": "Ý định rõ ràng.", "formalityScore": 8 },
        { "text": "objective", "nuance": "Mục tiêu khách quan.", "formalityScore": 9 },
        { "text": "endeavor", "nuance": "Sự nỗ lực hướng tới mục tiêu (rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "vào/hướng tới", "relatedWords": [] },
      "root": { "text": "tend/tens-", "meaning": "căng ra/vươn tới (to stretch - nghĩa là vươn tâm trí tới một mục tiêu)", "relatedWords": [{ "word": "extend", "meaning": "mở rộng" }, { "word": "tension", "meaning": "căng thẳng" }] }
    }
  },
  {
    "id": "v387",
    "word": "MANAGE",
    "ipa": "ˈmænɪdʒ",
    "elo": 850,
    "level": "beginner",
    "scenario": "Lương thực tập 3 triệu, tôi MANAGE được tới ngày 12 rồi bắt đầu sống bằng niềm tin và trà đá.",
    "translationHint": "Quản lý, xoay xở",
    "upgradeModule": {
      "simpleSentence": "He can deal with difficult customers.",
      "targetSlot": "deal with",
      "academicOptions": [
        { "text": "effectively manage", "nuance": "Quản lý một cách hiệu quả.", "formalityScore": 8 },
        { "text": "administer", "nuance": "Điều hành, quản trị (hệ thống/thuốc).", "formalityScore": 10 },
        { "text": "supervise", "nuance": "Giám sát.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "man-", "meaning": "tay (hand - nghĩa gốc là điều khiển ngựa bằng tay)", "relatedWords": [{ "word": "manual", "meaning": "thủ công" }, { "word": "manipulate", "meaning": "thao túng" }] }
    }
  },
  {
    "id": "v388",
    "word": "NECESSARY",
    "ipa": "ˈnesəsəri",
    "elo": 840,
    "level": "beginner",
    "scenario": "Đi săn sale thì món nào cũng thấy NECESSARY, fomo dữ lắm, về mở hộp ra mới tự hỏi mua máy đánh trứng làm chi.",
    "translationHint": "Cần thiết",
    "upgradeModule": {
      "simpleSentence": "Food is needed for survival.",
      "targetSlot": "needed",
      "academicOptions": [
        { "text": "absolutely necessary", "nuance": "Cần thiết tuyệt đối.", "formalityScore": 8 },
        { "text": "essential", "nuance": "Thiết yếu.", "formalityScore": 9 },
        { "text": "indispensable", "nuance": "Không thể thiếu.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ne-", "meaning": "không (not)", "relatedWords": [] },
      "root": { "text": "ced-", "meaning": "nhường bước/đi (to yield - nghĩa gốc là thứ không thể nhường bước, phải có cho bằng được)", "relatedWords": [{ "word": "cede", "meaning": "nhượng bộ" }, { "word": "precede", "meaning": "đi trước" }] }
    }
  },
  {
    "id": "v389",
    "word": "OPTIMISTIC",
    "ipa": "ˌɒptɪˈmɪstɪk",
    "elo": 840,
    "level": "beginner",
    "scenario": "Thi trượt môn lần hai mà nó vẫn OPTIMISTIC, bảo học lại lần ba để thân với thầy hơn, hết cứu.",
    "translationHint": "Lạc quan",
    "upgradeModule": {
      "simpleSentence": "He is positive about the new project.",
      "targetSlot": "positive",
      "academicOptions": [
        { "text": "cautiously optimistic", "nuance": "Lạc quan một cách thận trọng.", "formalityScore": 9 },
        { "text": "sanguine", "nuance": "Lạc quan (ngay cả trong khó khăn).", "formalityScore": 10 },
        { "text": "buoyant", "nuance": "Vui vẻ, tràn đầy hy vọng.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "optim-", "meaning": "tốt nhất (best)", "relatedWords": [{ "word": "optimum", "meaning": "tối ưu" }, { "word": "optimize", "meaning": "tối ưu hóa" }] }
    }
  },
  {
    "id": "v390",
    "word": "PARTIAL",
    "ipa": "ˈpɑːʃl",
    "elo": 830,
    "level": "beginner",
    "scenario": "Thầy chỉ cho PARTIAL điểm câu cuối vì tôi viết đúng mỗi chữ \"Giải\", nhưng có còn hơn không.",
    "translationHint": "Một phần, thiên vị",
    "upgradeModule": {
      "simpleSentence": "The results were only a small success.",
      "targetSlot": "small",
      "academicOptions": [
        { "text": "partial results", "nuance": "Kết quả bước đầu/chưa đầy đủ.", "formalityScore": 8 },
        { "text": "fragmentary", "nuance": "Rời rạc, từng mảnh.", "formalityScore": 10 },
        { "text": "biased", "nuance": "Thiên vị (một nghĩa khác của partial).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "part-", "meaning": "phần (part)", "relatedWords": [{ "word": "partition", "meaning": "vách ngăn" }, { "word": "impartial", "meaning": "công bằng" }] }
    }
  },
  {
    "id": "v391",
    "word": "SIGNIFICANT",
    "ipa": "sɪɡˈnɪfɪkənt",
    "elo": 850,
    "level": "beginner",
    "scenario": "Bỏ trà sữa một tháng, ví dư ra số tiền SIGNIFICANT tới mức tôi tự thưởng một ly trà sữa size lớn, ủa alo.",
    "translationHint": "Quan trọng, đáng kể",
    "upgradeModule": {
      "simpleSentence": "There is a big difference between the two phones.",
      "targetSlot": "big",
      "academicOptions": [
        { "text": "significant disparity", "nuance": "Sự chênh lệch đáng kể và quan trọng.", "formalityScore": 9 },
        { "text": "substantial", "nuance": "Lớn lao, có giá trị thực chất.", "formalityScore": 8 },
        { "text": "considerable", "nuance": "Đáng kể (về lượng hoặc mức độ).", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "sign-", "meaning": "dấu hiệu/đánh dấu (mark)", "relatedWords": [{ "word": "signal", "meaning": "tín hiệu" }, { "word": "design", "meaning": "thiết kế" }, { "word": "signature", "meaning": "chữ ký" }] },
      "suffix": { "text": "-fic", "meaning": "làm (to make)", "relatedWords": [{ "word": "efficient", "meaning": "hiệu quả" }, { "word": "terrific", "meaning": "khủng khiếp" }] }
    }
  },
  {
    "id": "v392",
    "word": "TOLERATE",
    "ipa": "ˈtɒləreɪt",
    "elo": 855,
    "level": "beginner",
    "scenario": "Tôi TOLERATE được bạn cùng phòng ngáy, nói mớ, nhưng ăn vụng gói snack cuối cùng của tôi là tới công chuyện.",
    "translationHint": "Chịu đựng, tha thứ",
    "upgradeModule": {
      "simpleSentence": "I can't put up with this noise anymore.",
      "targetSlot": "put up with",
      "academicOptions": [
        { "text": "tolerate the disturbance", "nuance": "Chịu đựng sự làm phiền một cách nhẫn nhịn.", "formalityScore": 8 },
        { "text": "endure", "nuance": "Cam chịu, chịu đựng gian khổ lâu dài.", "formalityScore": 9 },
        { "text": "countenance", "nuance": "Chấp nhận hoặc cho phép điều gì đó (thường dùng trong phủ định).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "toler-", "meaning": "chịu đựng/gánh vác (to bear/endure)", "relatedWords": [{ "word": "tolerable", "meaning": "có thể chịu được" }, { "word": "intolerant", "meaning": "không khoan dung" }] }
    }
  },
  {
    "id": "v393",
    "word": "UTILIZE",
    "ipa": "ˈjuːtɪlaɪz",
    "elo": 860,
    "level": "beginner",
    "scenario": "Tôi UTILIZE hết mười mã giảm giá trong một đơn, tiết kiệm được 47 nghìn và mua thêm ba món không cần, đỉnh nóc kịch trần.",
    "translationHint": "Sử dụng, tận dụng",
    "upgradeModule": {
      "simpleSentence": "We should use all the tools we have.",
      "targetSlot": "use",
      "academicOptions": [
        { "text": "effectively utilize", "nuance": "Tận dụng một cách hiệu quả các nguồn lực có sẵn.", "formalityScore": 9 },
        { "text": "harness", "nuance": "Khai thác sức mạnh (thường dùng cho năng lượng/tiềm năng).", "formalityScore": 10 },
        { "text": "employ", "nuance": "Sử dụng (phương pháp/nhân lực).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "uti-", "meaning": "sử dụng (to use)", "relatedWords": [{ "word": "utility", "meaning": "tiện ích" }, { "word": "useful", "meaning": "hữu dụng" }, { "word": "usury", "meaning": "cho vay nặng lãi" }] }
    }
  },
  {
    "id": "v394",
    "word": "VALID",
    "ipa": "ˈvælɪd",
    "elo": 840,
    "level": "beginner",
    "scenario": "Lý do nghỉ học \"bị cảm\" chỉ VALID khi mày không đăng story check-in Vũng Tàu cùng ngày, báo thủ ghê.",
    "translationHint": "Hợp lệ, có cơ sở",
    "upgradeModule": {
      "simpleSentence": "Do you have a good reason for being late?",
      "targetSlot": "good reason",
      "academicOptions": [
        { "text": "valid justification", "nuance": "Lý do chính đáng và có cơ sở pháp lý/logic.", "formalityScore": 9 },
        { "text": "legitimate", "nuance": "Hợp pháp, chính đáng.", "formalityScore": 9 },
        { "text": "sound", "nuance": "Vững chãi, logic (sound argument).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "val-", "meaning": "mạnh mẽ/giá trị (strong/worth)", "relatedWords": [{ "word": "value", "meaning": "giá trị" }, { "word": "valor", "meaning": "dũng cảm" }, { "word": "prevail", "meaning": "chiếm ưu thế" }] }
    }
  },
  {
    "id": "v395",
    "word": "WONDER",
    "ipa": "ˈwʌndə(r)",
    "elo": 810,
    "level": "beginner",
    "scenario": "Nửa đêm nằm WONDER không biết hồi lớp 3 mình nói gì mà đứa bạn giận, giờ nó có con rồi mà tôi vẫn chằm zn.",
    "translationHint": "Tự hỏi, băn khoăn",
    "upgradeModule": {
      "simpleSentence": "I am thinking about why he left early.",
      "targetSlot": "thinking about why",
      "academicOptions": [
        { "text": "pondering the reasons", "nuance": "Suy ngẫm kỹ về các lý do.", "formalityScore": 9 },
        { "text": "speculate", "nuance": "Suy đoán, đưa ra giả thuyết.", "formalityScore": 9 },
        { "text": "query", "nuance": "Đặt câu hỏi nghi vấn.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "wonder", "meaning": "kinh ngạc/sửng sốt (từ gốc tiếng Anh cổ 'wundor')", "relatedWords": [{ "word": "wonderful", "meaning": "tuyệt vời" }] }
    }
  },
  {
    "id": "v396",
    "word": "ADMIT",
    "ipa": "ədˈmɪt",
    "elo": 865,
    "level": "beginner",
    "scenario": "Cãi nhau ba tiếng, nó cũng ADMIT là ăn hết hộp bánh của tôi, kèm lý do \"tại nó nằm trong tủ lạnh dụ tao\", ra đường tôi nể mỗi bạn.",
    "translationHint": "Thừa nhận, nhận vào",
    "upgradeModule": {
      "simpleSentence": "He agreed that he made a mistake.",
      "targetSlot": "agreed",
      "academicOptions": [
        { "text": "admit liability", "nuance": "Thừa nhận trách nhiệm pháp lý.", "formalityScore": 10 },
        { "text": "concede", "nuance": "Thừa nhận (thường là miễn cưỡng).", "formalityScore": 9 },
        { "text": "acknowledge", "nuance": "Công nhận sự thật.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad-", "meaning": "đến/hướng tới", "relatedWords": [] },
      "root": { "text": "miss/mit-", "meaning": "gửi đi (to send - nghĩa gốc là cho phép gửi đi hoặc cho phép vào)", "relatedWords": [{ "word": "mission", "meaning": "nhiệm vụ" }, { "word": "submit", "meaning": "nộp/khuất phục" }, { "word": "dismiss", "meaning": "sa thải" }] }
    }
  },
  {
    "id": "v397",
    "word": "BORING",
    "ipa": "ˈbɔːrɪŋ",
    "elo": 800,
    "level": "beginner",
    "scenario": "Buổi học online BORING tới mức tôi tắt cam đi nấu mì, quay lại thì cô đang gọi tên tôi lần thứ ba, tới công chuyện.",
    "translationHint": "Buồn chán, tẻ nhạt",
    "upgradeModule": {
      "simpleSentence": "The movie was not interesting at all.",
      "targetSlot": "not interesting",
      "academicOptions": [
        { "text": "boring", "nuance": "Thiếu sự hấp dẫn, gây buồn chán.", "formalityScore": 6 },
        { "text": "monotonous", "nuance": "Đơn điệu, đều đều gây buồn chán.", "formalityScore": 9 },
        { "text": "tedious", "nuance": "Nhàm chán vì quá dài và chi tiết.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "bore", "meaning": "khoan/đục (nghĩa bóng là làm cho ai đó thấy mệt mỏi như bị khoan vào người)", "relatedWords": [] }
    }
  },
  {
    "id": "v398",
    "word": "COMPLAIN",
    "ipa": "kəmˈpleɪn",
    "elo": 820,
    "level": "beginner",
    "scenario": "Cả tuần COMPLAIN với group là hết tiền, cuối tuần vẫn có mặt đầy đủ ở buổi đi bar, real nể.",
    "translationHint": "Than phiền, phàn nàn",
    "upgradeModule": {
      "simpleSentence": "The customers said they were unhappy with the service.",
      "targetSlot": "said they were unhappy",
      "academicOptions": [
        { "text": "lodge a complaint", "nuance": "Đưa ra lời khiếu nại chính thức.", "formalityScore": 10 },
        { "text": "grumble", "nuance": "Càu nhàu, lầm bầm.", "formalityScore": 6 },
        { "text": "remonstrate", "nuance": "Phản đối, than phiền (rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "com-", "meaning": "hoàn toàn", "relatedWords": [] },
      "root": { "text": "plangere-", "meaning": "đánh vào ngực (to strike one's breast - biểu hiện của sự đau khổ/than khóc)", "relatedWords": [{ "word": "plaintive", "meaning": "than vãn/u sầu" }] }
    }
  },
  {
    "id": "v399",
    "word": "DOUBT",
    "ipa": "daʊt",
    "elo": 855,
    "level": "beginner",
    "scenario": "Áo khoác \"hàng hiệu\" giá 99 nghìn, tôi có DOUBT nhẹ, nhưng khum đủ mạnh để ngón tay ngừng bấm đặt hàng.",
    "translationHint": "Nghi ngờ",
    "upgradeModule": {
      "simpleSentence": "I am not sure if he is telling the truth.",
      "targetSlot": "not sure",
      "academicOptions": [
        { "text": "harbor doubts", "nuance": "Nuôi dưỡng sự nghi ngờ trong lòng.", "formalityScore": 9 },
        { "text": "skeptical", "nuance": "Hoài nghi (đòi hỏi bằng chứng).", "formalityScore": 8 },
        { "text": "dubious", "nuance": "Mơ hồ, đáng ngờ.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "dub-", "meaning": "hai (two - nghĩa gốc là phân vân giữa hai lựa chọn)", "relatedWords": [{ "word": "double", "meaning": "gấp đôi" }, { "word": "dubious", "meaning": "mơ hồ" }, { "word": "duplicity", "meaning": "sự hai mặt" }] }
    }
  },
  {
    "id": "v400",
    "word": "EAGER",
    "ipa": "ˈiːɡə(r)",
    "elo": 920,
    "level": "intermediate",
    "scenario": "Đầu năm nhất ai cũng EAGER đi học đủ buổi, tới giữa kỳ check var thì lớp còn đúng thầy và cái máy chiếu.",
    "translationHint": "Háo hức, hăm hở",
    "upgradeModule": {
      "simpleSentence": "The students want to learn more.",
      "targetSlot": "want to",
      "academicOptions": [
        { "text": "be eager to", "nuance": "Háo hức muốn làm gì đó.", "formalityScore": 7 },
        { "text": "keen to", "nuance": "Hăng hái, nhiệt tình.", "formalityScore": 8 },
        { "text": "enthusiastic about", "nuance": "Nhiệt huyết về cái gì đó.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "acer-", "meaning": "sắc/nhọn/chua (sharp - nghĩa gốc là tinh thần sắc bén, nôn nóng)", "relatedWords": [{ "word": "acid", "meaning": "axit" }, { "word": "acute", "meaning": "cấp tính/sắc bén" }] }
    }
  },
  {
    "id": "v401",
    "word": "FORCE",
    "ipa": "fɔːs",
    "elo": 840,
    "level": "beginner",
    "scenario": "Mẹ FORCE tôi đi xem mắt con của bạn mẹ, ngồi mười phút thì hai đứa phát hiện cùng bị ép, hợp nhau ghê.",
    "translationHint": "Ép buộc, lực lượng",
    "upgradeModule": {
      "simpleSentence": "The weather made them stay inside.",
      "targetSlot": "made them",
      "academicOptions": [
        { "text": "force someone to", "nuance": "Ép buộc ai đó làm gì.", "formalityScore": 7 },
        { "text": "compel", "nuance": "Bắt buộc (do hoàn cảnh/luật lệ).", "formalityScore": 10 },
        { "text": "coerce", "nuance": "Cưỡng bức, đe dọa để ép buộc.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "fort-", "meaning": "mạnh mẽ (strong)", "relatedWords": [{ "word": "fort", "meaning": "pháo đài" }, { "word": "fortify", "meaning": "củng cố/làm mạnh thêm" }, { "word": "comfort", "meaning": "an ủi (làm cho mạnh mẽ lên)" }] }
    }
  },
  {
    "id": "v402",
    "word": "GATHER",
    "ipa": "ˈɡæðə(r)",
    "elo": 830,
    "level": "beginner",
    "scenario": "Lớp cấp 3 GATHER lại sau 5 năm, nửa bàn dắt theo người yêu, nửa còn lại ngồi ăn cơm chó tới no.",
    "translationHint": "Tập hợp, thu thập",
    "upgradeModule": {
      "simpleSentence": "The scientist collected a lot of data.",
      "targetSlot": "collected",
      "academicOptions": [
        { "text": "gather information", "nuance": "Thu thập thông tin.", "formalityScore": 8 },
        { "text": "accumulate", "nuance": "Tích lũy dần dần qua thời gian.", "formalityScore": 9 },
        { "text": "assemble", "nuance": "Lắp ráp/tập hợp các bộ phận lại.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "gader-", "meaning": "cùng nhau (together - từ gốc tiếng Đức cổ)", "relatedWords": [{ "word": "together", "meaning": "cùng nhau" }] }
    }
  },
  {
    "id": "v403",
    "word": "HARDLY",
    "ipa": "ˈhɑːdli",
    "elo": 815,
    "level": "beginner",
    "scenario": "Từ hồi đi làm, tôi HARDLY gặp ánh mặt trời, sáng đi lúc trời chưa sáng, tối về lúc trời đã tối thui, u là trời.",
    "translationHint": "Hầu như không",
    "upgradeModule": {
      "simpleSentence": "I almost never see him these days.",
      "targetSlot": "almost never",
      "academicOptions": [
        { "text": "hardly ever", "nuance": "Hầu như không bao giờ.", "formalityScore": 7 },
        { "text": "scarcely", "nuance": "Vừa vặn mới đủ/hiếm khi (rất trang trọng).", "formalityScore": 10 },
        { "text": "seldom", "nuance": "Ít khi.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "hard", "meaning": "khó khăn (nghĩa gốc là làm một việc gì đó khó khăn đến mức suýt soát mới xong)", "relatedWords": [] }
    }
  },
  {
    "id": "v404",
    "word": "IMAGINE",
    "ipa": "ɪˈmædʒɪn",
    "elo": 805,
    "level": "beginner",
    "scenario": "Nhắn crush xong, tôi đã IMAGINE luôn cảnh hai đứa nuôi con mèo tên Bơ, trong khi người ta còn chưa seen, delulu.",
    "translationHint": "Tưởng tượng",
    "upgradeModule": {
      "simpleSentence": "Try to think of a world without war.",
      "targetSlot": "think of",
      "academicOptions": [
        { "text": "envision", "nuance": "Hình dung về một tương lai hoặc khả năng.", "formalityScore": 10 },
        { "text": "conceive of", "nuance": "Hình thành ý niệm trong đầu.", "formalityScore": 10 },
        { "text": "visualize", "nuance": "Hình ảnh hóa trong tâm trí.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "imag-", "meaning": "hình ảnh/hình dáng (copy/likeness)", "relatedWords": [{ "word": "image", "meaning": "hình ảnh" }, { "word": "imitate", "meaning": "bắt chước" }] }
    }
  },
  {
    "id": "v405",
    "word": "KINDNESS",
    "ipa": "ˈkaɪndnəs",
    "elo": 820,
    "level": "beginner",
    "scenario": "Chị shipper đứng dưới mưa chờ tôi chạy xuống, KINDNESS này xứng đáng năm sao và một ly cà phê sữa, chữa lành ghê.",
    "translationHint": "Sự tử tế, lòng tốt",
    "upgradeModule": {
      "simpleSentence": "We should show love to everyone.",
      "targetSlot": "love",
      "academicOptions": [
        { "text": "act of kindness", "nuance": "Hành động tử tế.", "formalityScore": 8 },
        { "text": "benevolence", "nuance": "Lòng nhân từ.", "formalityScore": 10 },
        { "text": "compassion", "nuance": "Lòng trắc ẩn.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "kind", "meaning": "loại/giống (nghĩa gốc là đối xử tốt với những người cùng 'loại'/gia đình với mình)", "relatedWords": [{ "word": "kin", "meaning": "dòng tộc" }, { "word": "kindred", "meaning": "người thân" }] }
    }
  },
  {
    "id": "v406",
    "word": "LOOSE",
    "ipa": "luːs",
    "elo": 835,
    "level": "beginner",
    "scenario": "Quần mua online size S mà mặc vào LOOSE như quần của ông nội, hình một đằng hàng một nẻo, xỉu ngang.",
    "translationHint": "Lỏng lẻo, rộng",
    "upgradeModule": {
      "simpleSentence": "The rules are very free.",
      "targetSlot": "free",
      "academicOptions": [
        { "text": "loose interpretation", "nuance": "Cách giải thích lỏng lẻo/phóng khoáng.", "formalityScore": 9 },
        { "text": "lax", "nuance": "Lỏng lẻo, thiếu nghiêm ngặt (thường mang nghĩa tiêu cực).", "formalityScore": 10 },
        { "text": "slapdash", "nuance": "Cẩu thả, làm cho xong chuyện.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "leus-", "meaning": "nới lỏng/phân rã (to loosen)", "relatedWords": [{ "word": "lose", "meaning": "mất" }, { "word": "analysis", "meaning": "phân tích (tháo rời ra)" }, { "word": "release", "meaning": "thả ra" }] }
    }
  },
  {
    "id": "v407",
    "word": "MENTION",
    "ipa": "ˈmenʃn",
    "elo": 840,
    "level": "beginner",
    "scenario": "Lỡ MENTION tên người yêu cũ của bạn thân trong buổi cà phê, nguyên bàn im lặng như đang chờ đọc điểm thi, đúng báo thủ.",
    "translationHint": "Đề cập đến",
    "upgradeModule": {
      "simpleSentence": "He said something about the meeting.",
      "targetSlot": "said something about",
      "academicOptions": [
        { "text": "mention briefly", "nuance": "Đề cập ngắn gọn.", "formalityScore": 8 },
        { "text": "allude to", "nuance": "Nói bóng gió, ám chỉ đến.", "formalityScore": 10 },
        { "text": "cite", "nuance": "Trích dẫn (làm bằng chứng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "men-", "meaning": "tâm trí (mind - nghĩa gốc là gọi cái gì đó vào tâm trí)", "relatedWords": [{ "word": "mental", "meaning": "thuộc về tâm trí" }, { "word": "memory", "meaning": "trí nhớ" }, { "word": "remind", "meaning": "nhắc nhở" }] }
    }
  },
  {
    "id": "v408",
    "word": "OFFER",
    "ipa": "ˈɒfə(r)",
    "elo": 850,
    "level": "beginner",
    "scenario": "Công ty mới OFFER mức lương gấp rưỡi, tôi đồng ý trong hai giây rồi giả vờ suy nghĩ thêm hai ngày.",
    "translationHint": "Đề nghị, mời chào",
    "upgradeModule": {
      "simpleSentence": "The shop provided a big discount.",
      "targetSlot": "provided",
      "academicOptions": [
        { "text": "offer an incentive", "nuance": "Đưa ra một sự khuyến khích/ưu đãi.", "formalityScore": 9 },
        { "text": "tender", "nuance": "Đưa ra/nộp (thường dùng trong đấu thầu).", "formalityScore": 10 },
        { "text": "proffer", "nuance": "Chìa ra, đưa ra mời (rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob/of-", "meaning": "đến/trước mặt", "relatedWords": [] },
      "root": { "text": "fer-", "meaning": "mang/vác (to carry - nghĩa là mang cái gì đó đến trước mặt người khác)", "relatedWords": [{ "word": "transfer", "meaning": "chuyển giao" }, { "word": "refer", "meaning": "tham chiếu" }, { "word": "fertile", "meaning": "màu mỡ (mang lại nhiều quả)" }] }
    }
  },
  {
    "id": "v409",
    "word": "PARTICULAR",
    "ipa": "pəˈtɪkjələ(r)",
    "elo": 910,
    "level": "intermediate",
    "scenario": "Hỏi muốn ăn gì thì nó bảo không có món nào PARTICULAR, gợi ý thì món nào cũng \"thôi, món khác đi\", ủa alo.",
    "translationHint": "Cụ thể, đặc biệt",
    "upgradeModule": {
      "simpleSentence": "Is there a special reason for your call?",
      "targetSlot": "special",
      "academicOptions": [
        { "text": "particular emphasis", "nuance": "Sự nhấn mạnh đặc biệt.", "formalityScore": 9 },
        { "text": "specific", "nuance": "Cụ thể.", "formalityScore": 8 },
        { "text": "meticulous", "nuance": "Kỹ lưỡng, tỉ mỉ (khi nói về tính cách cầu kỳ).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "part-", "meaning": "phần (part)", "relatedWords": [{ "word": "particle", "meaning": "hạt nhỏ" }, { "word": "partition", "meaning": "vách ngăn" }] }
    }
  },
  {
    "id": "v410",
    "word": "QUALIFY",
    "ipa": "ˈkwɒlɪfaɪ",
    "elo": 940,
    "level": "intermediate",
    "scenario": "Học bổng yêu cầu điểm 8.0 mới QUALIFY, tôi được 7.98, đúng là kém miếng khó chịu.",
    "translationHint": "Đủ điều kiện, tư cách",
    "upgradeModule": {
      "simpleSentence": "He has the right skills for the job.",
      "targetSlot": "has the right skills",
      "academicOptions": [
        { "text": "meet the qualifications", "nuance": "Đáp ứng đủ các tiêu chuẩn chuyên môn.", "formalityScore": 9 },
        { "text": "eligible", "nuance": "Đủ tư cách/điều kiện (theo luật lệ).", "formalityScore": 10 },
        { "text": "certified", "nuance": "Được cấp chứng chỉ.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "qual-", "meaning": "loại nào/thế nào (of what sort)", "relatedWords": [{ "word": "quality", "meaning": "chất lượng" }] },
      "suffix": { "text": "-fy", "meaning": "làm cho (to make)", "relatedWords": [{ "word": "simplify", "meaning": "đơn giản hóa" }] }
    }
  },
  {
    "id": "v411",
    "word": "STRUGGLE",
    "ipa": "ˈstrʌɡl",
    "elo": 880,
    "level": "beginner",
    "scenario": "Mỗi lần mở file Excel của sếp là tôi STRUGGLE cả buổi, công thức nào cũng lồng nhau như phim trinh thám, xỉu ngang.",
    "translationHint": "Vật lộn, đấu tranh",
    "upgradeModule": {
      "simpleSentence": "He is having a hard time with the math problem.",
      "targetSlot": "having a hard time",
      "academicOptions": [
        { "text": "struggle to cope", "nuance": "Vật lộn để đối phó với khó khăn.", "formalityScore": 8 },
        { "text": "strive", "nuance": "Phấn đấu, nỗ lực (nghĩa tích cực hơn).", "formalityScore": 9 },
        { "text": "grapple with", "nuance": "Vật lộn/tìm cách giải quyết một vấn đề khó.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "strug-", "meaning": "từ gốc Scandinavi có nghĩa là 'đi khập khiễng/vất vả'", "relatedWords": [] }
    }
  },
  {
    "id": "v412",
    "word": "THOROUGH",
    "ipa": "ˈθʌrə",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Trả phòng trọ, bà chủ kiểm tra THOROUGH tới mức soi từng lỗ đinh trên tường để trừ cọc, xu cà na thiệt.",
    "translationHint": "Kỹ lưỡng, thấu đáo",
    "upgradeModule": {
      "simpleSentence": "The police made a full search of the house.",
      "targetSlot": "full",
      "academicOptions": [
        { "text": "thorough investigation", "nuance": "Một cuộc điều tra kỹ lưỡng, không bỏ sót chi tiết nào.", "formalityScore": 9 },
        { "text": "exhaustive", "nuance": "Thấu đáo đến mức kiệt cùng.", "formalityScore": 10 },
        { "text": "comprehensive", "nuance": "Toàn diện, bao quát.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "through-", "meaning": "xuyên qua (nghĩa gốc là làm cái gì đó 'xuyên suốt' từ đầu đến cuối)", "relatedWords": [{ "word": "through", "meaning": "xuyên qua" }] }
    }
  },
  {
    "id": "v413",
    "word": "UNIQUE",
    "ipa": "juˈniːk",
    "elo": 860,
    "level": "beginner",
    "scenario": "Tự tin mặc chiếc áo UNIQUE săn ở shop đồ si, tới công ty gặp ngay chị kế toán mặc y chang, u là trời.",
    "translationHint": "Độc nhất, độc đáo",
    "upgradeModule": {
      "simpleSentence": "This is a very special case.",
      "targetSlot": "special",
      "academicOptions": [
        { "text": "unique opportunity", "nuance": "Cơ hội có một không hai.", "formalityScore": 8 },
        { "text": "unparalleled", "nuance": "Vô song, không gì sánh bằng.", "formalityScore": 10 },
        { "text": "singular", "nuance": "Kỳ lạ, độc nhất vô nhị.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "uni-", "meaning": "một (one)", "relatedWords": [{ "word": "unit", "meaning": "đơn vị" }, { "word": "universe", "meaning": "vũ trụ" }, { "word": "unify", "meaning": "thống nhất" }] }
    }
  },
  {
    "id": "v414",
    "word": "WHISPER",
    "ipa": "ˈwɪspə(r)",
    "elo": 830,
    "level": "beginner",
    "scenario": "Đứa ngồi kế WHISPER đáp án trong giờ kiểm tra, tôi chép theo đầy tin tưởng và hai đứa cùng sai, toang.",
    "translationHint": "Thì thầm",
    "upgradeModule": {
      "simpleSentence": "He talked very quietly so no one could hear.",
      "targetSlot": "talked very quietly",
      "academicOptions": [
        { "text": "whisper softly", "nuance": "Thì thầm nhẹ nhàng.", "formalityScore": 7 },
        { "text": "murmur", "nuance": "Rì rầm (tiếng nói nhỏ không rõ từ).", "formalityScore": 9 },
        { "text": "mutter", "nuance": "Lầm bầm (thường mang nghĩa phàn nàn).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "whisper", "meaning": "từ tượng thanh (mô phỏng tiếng gió hoặc tiếng nói nhỏ)", "relatedWords": [{ "word": "whistle", "meaning": "huýt sáo" }] }
    }
  },
  {
    "id": "v415",
    "word": "ANNOYING",
    "ipa": "əˈnɔɪɪŋ",
    "elo": 820,
    "level": "beginner",
    "scenario": "Không gì ANNOYING bằng đứa gửi tin nhắn thoại 5 phút chỉ để hỏi \"mày rảnh không\", red flag.",
    "translationHint": "Làm phiền, khó chịu",
    "upgradeModule": {
      "simpleSentence": "That sound is very bad.",
      "targetSlot": "bad",
      "academicOptions": [
        { "text": "highly annoying", "nuance": "Cực kỳ phiền phức.", "formalityScore": 7 },
        { "text": "exasperating", "nuance": "Làm bực mình đến phát điên.", "formalityScore": 10 },
        { "text": "irksome", "nuance": "Gây mệt mỏi, khó chịu.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "odiousness-", "meaning": "đáng ghét (từ gốc Latin 'in odio' - đang trong sự ghét bỏ)", "relatedWords": [{ "word": "odious", "meaning": "ghê tởm" }, { "word": "noisome", "meaning": "hôi thối/độc hại" }] }
    }
  },
  {
    "id": "v416",
    "word": "BELIEVE",
    "ipa": "bɪˈliːv",
    "elo": 800,
    "level": "beginner",
    "scenario": "Nó khoe tự nấu nồi lẩu Thái, tôi đã định BELIEVE, cho tới khi check var thấy cái hộp có logo quán trong góc ảnh.",
    "translationHint": "Tin tưởng",
    "upgradeModule": {
      "simpleSentence": "I think that he is right.",
      "targetSlot": "think",
      "academicOptions": [
        { "text": "firmly believe", "nuance": "Tin tưởng một cách kiên định.", "formalityScore": 8 },
        { "text": "maintain", "nuance": "Khẳng định, giữ vững quan điểm.", "formalityScore": 9 },
        { "text": "assert", "nuance": "Quả quyết, khẳng định.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "lief-", "meaning": "yêu quý/quan tâm (dear/love - nghĩa gốc là coi cái gì đó là quý giá/đúng đắn)", "relatedWords": [{ "word": "belief", "meaning": "niềm tin" }, { "word": "libido", "meaning": "dục vọng" }] }
    }
  },
  {
    "id": "v417",
    "word": "CRITICAL",
    "ipa": "ˈkrɪtɪkl",
    "elo": 970,
    "level": "intermediate",
    "scenario": "Pin điện thoại còn 2% đúng lúc đang chốt hẹn với crush, giai đoạn CRITICAL nhất đời tôi, ét o ét.",
    "translationHint": "Quan trọng, nguy cấp, phê bình",
    "upgradeModule": {
      "simpleSentence": "This is a very important time for the company.",
      "targetSlot": "very important",
      "academicOptions": [
        { "text": "critical juncture", "nuance": "Thời điểm bước ngoặt/quyết định.", "formalityScore": 10 },
        { "text": "pivotal", "nuance": "Then chốt, đóng vai trò trục xoay.", "formalityScore": 9 },
        { "text": "crucial", "nuance": "Cốt yếu, quyết định.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "crit-", "meaning": "phán xét/phân loại (judge/decide)", "relatedWords": [{ "word": "critic", "meaning": "nhà phê bình" }, { "word": "criterion", "meaning": "tiêu chí" }, { "word": "crisis", "meaning": "khủng hoảng (điểm cần đưa ra quyết định)" }] }
    }
  },
  {
    "id": "v418",
    "word": "DELIGHTED",
    "ipa": "dɪˈlaɪtɪd",
    "elo": 890,
    "level": "beginner",
    "scenario": "Bà ngoại DELIGHTED ra mặt khi tôi về quê, rồi quay qua hỏi \"sao ốm vậy con\" dù tôi vừa lên 3 ký.",
    "translationHint": "Vui mừng, hài lòng",
    "upgradeModule": {
      "simpleSentence": "She was very happy with the news.",
      "targetSlot": "very happy",
      "academicOptions": [
        { "text": "absolutely delighted", "nuance": "Vô cùng vui sướng và hài lòng.", "formalityScore": 8 },
        { "text": "elated", "nuance": "Phấn chấn, hân hoan (thường do thành công).", "formalityScore": 10 },
        { "text": "gratified", "nuance": "Hài lòng, mãn nguyện (thường do ước nguyện được đáp ứng).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "de-", "meaning": "hoàn toàn", "relatedWords": [] },
      "root": { "text": "lactare-", "meaning": "dụ dỗ/lôi cuốn (to entice/lure - nghĩa là bị lôi cuốn bởi thứ gì đó đẹp đẽ)", "relatedWords": [{ "word": "delectable", "meaning": "ngon lành/thú vị" }] }
    }
  },
  {
    "id": "v419",
    "word": "FRUSTRATED",
    "ipa": "frʌˈstreɪtɪd",
    "elo": 870,
    "level": "beginner",
    "scenario": "Code chạy ngon trên máy tôi, lên máy trưởng nhóm thì lỗi đỏ màn hình, FRUSTRATED tới mức muốn đi bán trà chanh, toang.",
    "translationHint": "Bực bội, nản lòng",
    "upgradeModule": {
      "simpleSentence": "I feel bad because I can't finish my work.",
      "targetSlot": "feel bad",
      "academicOptions": [
        { "text": "feel increasingly frustrated", "nuance": "Cảm thấy bực bội tích tụ do không đạt được mục tiêu.", "formalityScore": 8 },
        { "text": "disheartened", "nuance": "Nản lòng, mất tinh thần.", "formalityScore": 9 },
        { "text": "thwarted", "nuance": "Bị ngăn cản, bị làm cho thất bại.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "frustra-", "meaning": "vô ích/sai lầm (in vain)", "relatedWords": [{ "word": "frustrate", "meaning": "làm hỏng/vô hiệu hóa" }] }
    }
  },
  {
    "id": "v420",
    "word": "INFLUENCE",
    "ipa": "ˈɪnfluəns",
    "elo": 915,
    "level": "intermediate",
    "scenario": "Một video review 30 giây có INFLUENCE ghê thật, fomo cái là tôi chốt máy làm bánh waffle, dùng đúng một lần.",
    "translationHint": "Ảnh hưởng, tác động",
    "upgradeModule": {
      "simpleSentence": "He had a big effect on my choice.",
      "targetSlot": "big effect",
      "academicOptions": [
        { "text": "significant influence", "nuance": "Ảnh hưởng đáng kể.", "formalityScore": 9 },
        { "text": "leverage", "nuance": "Tận dụng lợi thế để gây ảnh hưởng.", "formalityScore": 10 },
        { "text": "sway", "nuance": "Làm dao động, thuyết phục theo ý mình.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "vào trong", "relatedWords": [] },
      "root": { "text": "flu-", "meaning": "chảy (to flow - nghĩa gốc là một dòng chảy lực tác động vào cái gì đó)", "relatedWords": [{ "word": "fluent", "meaning": "trôi chảy" }, { "word": "fluid", "meaning": "chất lỏng" }, { "word": "affluent", "meaning": "giàu có (tiền chảy về)" }] }
    }
  },
  {
    "id": "v421",
    "word": "JUDGE",
    "ipa": "dʒʌdʒ",
    "elo": 830,
    "level": "beginner",
    "scenario": "Đồng nghiệp mới nhìn khó gần, tôi lỡ JUDGE là red flag, ai ngờ ổng là người duy nhất mang bánh chia cả phòng.",
    "translationHint": "Đánh giá, phán xét",
    "upgradeModule": {
      "simpleSentence": "He looked at the work and gave his opinion.",
      "targetSlot": "gave his opinion",
      "academicOptions": [
        { "text": "critically evaluate", "nuance": "Đánh giá một cách có phê phán và hệ thống.", "formalityScore": 10 },
        { "text": "appraise", "nuance": "Thẩm định giá trị hoặc chất lượng.", "formalityScore": 9 },
        { "text": "assess", "nuance": "Đánh giá mức độ/tình hình.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "jus-", "meaning": "luật pháp (law)", "relatedWords": [{ "word": "justice", "meaning": "công lý" }, { "word": "jury", "meaning": "bồi thẩm đoàn" }] },
      "root2": { "text": "dic-", "meaning": "nói (to say - nghĩa là người nói ra luật)", "relatedWords": [{ "word": "dictate", "meaning": "tuyên bố/mệnh lệnh" }, { "word": "prediction", "meaning": "dự đoán" }] }
    }
  },
  {
    "id": "v422",
    "word": "KNOWLEDGE",
    "ipa": "ˈnɒlɪdʒ",
    "elo": 840,
    "level": "beginner",
    "scenario": "Cày phim Hàn ba năm, KNOWLEDGE tiếng Hàn của tôi gồm đúng chữ \"saranghae\" và cách gọi oppa, keo lỳ.",
    "translationHint": "Kiến thức, sự hiểu biết",
    "upgradeModule": {
      "simpleSentence": "He has a lot of information about history.",
      "targetSlot": "information",
      "academicOptions": [
        { "text": "expertise", "nuance": "Kiến thức chuyên môn sâu.", "formalityScore": 9 },
        { "text": "erudition", "nuance": "Sự thông thái, uyên bác (do học rộng tài cao).", "formalityScore": 10 },
        { "text": "proficiency", "nuance": "Sự thành thạo/thông thạo.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "gno-", "meaning": "biết (to know)", "relatedWords": [{ "word": "recognize", "meaning": "nhận ra" }, { "word": "ignore", "meaning": "lờ đi (không muốn biết)" }, { "word": "diagnosis", "meaning": "chẩn đoán" }] }
    }
  },
  {
    "id": "v423",
    "word": "LACK",
    "ipa": "læk",
    "elo": 810,
    "level": "beginner",
    "scenario": "Bài thuyết trình nhóm tôi LACK đúng một thứ: người chịu làm slide, còn người góp ý thì dư, xu cà na.",
    "translationHint": "Thiếu hụt",
    "upgradeModule": {
      "simpleSentence": "There is not enough water in the village.",
      "targetSlot": "not enough",
      "academicOptions": [
        { "text": "dearth of", "nuance": "Sự khan hiếm trầm trọng.", "formalityScore": 10 },
        { "text": "deficiency", "nuance": "Sự thiếu hụt (về chất lượng hoặc thành phần).", "formalityScore": 9 },
        { "text": "scarcity", "nuance": "Sự ít ỏi, khó tìm.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "lack", "meaning": "khiếm khuyết/thiếu (từ gốc Bắc Âu cổ)", "relatedWords": [] }
    }
  },
  {
    "id": "v424",
    "word": "MAINTAIN",
    "ipa": "meɪnˈteɪn",
    "elo": 865,
    "level": "beginner",
    "scenario": "Tôi MAINTAIN chuỗi học tiếng Anh 200 ngày liên tục, toàn bằng cách mở app lúc 11 giờ 59 tối, slay.",
    "translationHint": "Duy trì, giữ vững",
    "upgradeModule": {
      "simpleSentence": "You should keep your car in good condition.",
      "targetSlot": "keep",
      "academicOptions": [
        { "text": "sustain", "nuance": "Duy trì sự tồn tại bền vững.", "formalityScore": 9 },
        { "text": "preserve", "nuance": "Bảo tồn, giữ gìn nguyên vẹn.", "formalityScore": 8 },
        { "text": "uphold", "nuance": "Giữ vững (tiêu chuẩn/luật lệ).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "man-", "meaning": "tay (hand)", "relatedWords": [{ "word": "manual", "meaning": "thủ công" }, { "word": "manipulate", "meaning": "thao túng/điều khiển bằng tay" }] },
      "root2": { "text": "tain-", "meaning": "giữ (to hold)", "relatedWords": [{ "word": "contain", "meaning": "chứa đựng" }, { "word": "retain", "meaning": "giữ lại" }] }
    }
  },
  {
    "id": "v425",
    "word": "NERVOUS",
    "ipa": "ˈnɜːvəs",
    "elo": 815,
    "level": "beginner",
    "scenario": "Lần đầu thuyết trình trước cả phòng, tôi NERVOUS tới mức tự giới thiệu sai tên của chính mình, xỉu ngang.",
    "translationHint": "Lo lắng, hồi hộp",
    "upgradeModule": {
      "simpleSentence": "She felt worried before the interview.",
      "targetSlot": "worried",
      "academicOptions": [
        { "text": "apprehensive", "nuance": "E sợ điều gì đó không hay sắp tới.", "formalityScore": 9 },
        { "text": "anxious", "nuance": "Lo âu, bồn chồn.", "formalityScore": 8 },
        { "text": "jittery", "nuance": "Run rẩy, đứng ngồi không yên (thông dụng).", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "nerv-", "meaning": "dây thần kinh/sức mạnh (nerve/sinew)", "relatedWords": [{ "word": "nerve", "meaning": "thần kinh/dũng khí" }, { "word": "enervate", "meaning": "làm kiệt sức" }] }
    }
  },
  {
    "id": "v426",
    "word": "OPPORTUNITY",
    "ipa": "ˌɒpəˈtjuːnəti",
    "elo": 850,
    "level": "beginner",
    "scenario": "Crush hỏi \"có ai về chung đường không\", OPPORTUNITY ngàn năm có một, vậy mà tôi trả lời \"tao đi xe buýt\", hết cứu.",
    "translationHint": "Cơ hội",
    "upgradeModule": {
      "simpleSentence": "This is a good chance to improve your skills.",
      "targetSlot": "good chance",
      "academicOptions": [
        { "text": "golden opportunity", "nuance": "Cơ hội ngàn vàng, cực kỳ hiếm.", "formalityScore": 8 },
        { "text": "prospect", "nuance": "Triển vọng, khả năng thành công trong tương lai.", "formalityScore": 9 },
        { "text": "opening", "nuance": "Một vị trí trống/kẽ hở cơ hội.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob-", "meaning": "hướng tới/đối diện", "relatedWords": [] },
      "root": { "text": "port-", "meaning": "cảng (harbor - nghĩa gốc là gió thổi con tàu hướng tới cảng)", "relatedWords": [{ "word": "port", "meaning": "cảng" }, { "word": "import", "meaning": "nhập khẩu" }, { "word": "transport", "meaning": "vận chuyển" }] }
    }
  },
  {
    "id": "v427",
    "word": "PREFER",
    "ipa": "prɪˈfɜː(r)",
    "elo": 820,
    "level": "beginner",
    "scenario": "Tôi PREFER nhắn tin hơn gọi điện, điện thoại mà reo là tim đập như bị gọi lên bảng.",
    "translationHint": "Thích hơn",
    "upgradeModule": {
      "simpleSentence": "I like tea more than coffee.",
      "targetSlot": "like",
      "academicOptions": [
        { "text": "have a preference for", "nuance": "Có sự ưu tiên/thiên vị cho cái gì.", "formalityScore": 8 },
        { "text": "favor", "nuance": "Ưu ái, ủng hộ cái gì hơn.", "formalityScore": 9 },
        { "text": "opt for", "nuance": "Lựa chọn (trong các phương án).", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "pre-", "meaning": "trước", "relatedWords": [] },
      "root": { "text": "fer-", "meaning": "mang/vác (to carry - nghĩa gốc là mang một thứ đặt lên trước những thứ khác)", "relatedWords": [{ "word": "transfer", "meaning": "chuyển giao" }, { "word": "offer", "meaning": "đề nghị" }] }
    }
  },
  {
    "id": "v428",
    "word": "QUALITY",
    "ipa": "ˈkwɒləti",
    "elo": 805,
    "level": "beginner",
    "scenario": "Mua áo 50 nghìn ba cái, QUALITY đỉnh nóc kịch trần: giặt một lần là từ áo thun thành áo croptop.",
    "translationHint": "Chất lượng, đặc tính",
    "upgradeModule": {
      "simpleSentence": "The work is of a very high standard.",
      "targetSlot": "standard",
      "academicOptions": [
        { "text": "caliber", "nuance": "Tầm cỡ, năng lực (thường dùng cho con người).", "formalityScore": 10 },
        { "text": "excellence", "nuance": "Sự xuất sắc.", "formalityScore": 9 },
        { "text": "attribute", "nuance": "Thuộc tính, đặc điểm (nghĩa khác của quality).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "qual-", "meaning": "thế nào/loại nào (of what sort)", "relatedWords": [{ "word": "qualify", "meaning": "đủ tiêu chuẩn" }, { "word": "qualification", "meaning": "bằng cấp" }] }
    }
  },
  {
    "id": "v429",
    "word": "RECOGNIZE",
    "ipa": "ˈrekəɡnaɪz",
    "elo": 875,
    "level": "beginner",
    "scenario": "Họp lớp sau 5 năm, tôi không RECOGNIZE nổi đứa lớp trưởng, cho tới khi nó mở miệng nhắc đóng quỹ, ra đường tôi nể mỗi bạn.",
    "translationHint": "Nhận ra, công nhận",
    "upgradeModule": {
      "simpleSentence": "The company said his hard work was good.",
      "targetSlot": "said his hard work was good",
      "academicOptions": [
        { "text": "acknowledge his contribution", "nuance": "Ghi nhận đóng góp của anh ấy.", "formalityScore": 9 },
        { "text": "identify", "nuance": "Nhận dạng, xác định.", "formalityScore": 8 },
        { "text": "commend", "nuance": "Khen ngợi/tuyên dương chính thức.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "re-", "meaning": "lại một lần nữa", "relatedWords": [] },
      "root": { "text": "cogn-", "meaning": "biết (to know - nghĩa là 'biết lại' một thứ đã từng biết)", "relatedWords": [{ "word": "cognitive", "meaning": "nhận thức" }, { "word": "incognito", "meaning": "ẩn danh (không cho biết)" }] }
    }
  },
  {
    "id": "v430",
    "word": "SENSITIVE",
    "ipa": "ˈsensətɪv",
    "elo": 935,
    "level": "intermediate",
    "scenario": "Răng tôi đang SENSITIVE, ăn kem thì ê buốt, mà bỏ kem thì tâm hồn còn ê buốt hơn, chằm zn.",
    "translationHint": "Nhạy cảm",
    "upgradeModule": {
      "simpleSentence": "He is very easily hurt by what people say.",
      "targetSlot": "easily hurt",
      "academicOptions": [
        { "text": "highly sensitive", "nuance": "Cực kỳ nhạy cảm.", "formalityScore": 8 },
        { "text": "susceptible", "nuance": "Dễ bị ảnh hưởng/tác động (thường là tiêu cực).", "formalityScore": 10 },
        { "text": "vulnerable", "nuance": "Dễ bị tổn thương.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "sens/sent-", "meaning": "cảm nhận/cảm xúc (to feel)", "relatedWords": [{ "word": "sense", "meaning": "giác quan" }, { "word": "sentiment", "meaning": "tình cảm" }, { "word": "consensus", "meaning": "sự đồng lòng" }] }
    }
  },
  {
    "id": "v431",
    "word": "TRUSTWORTHY",
    "ipa": "ˈtrʌstwɜːði",
    "elo": 925,
    "level": "intermediate",
    "scenario": "Giao quỹ lớp cho đứa TRUSTWORTHY nhất nhóm, cuối kỳ nó báo cáo từng đồng kèm hóa đơn, flex nhẹ sự minh bạch.",
    "translationHint": "Đáng tin cậy",
    "upgradeModule": {
      "simpleSentence": "She is a very honest person who you can trust.",
      "targetSlot": "person who you can trust",
      "academicOptions": [
        { "text": "reliable", "nuance": "Đáng tin cậy (dựa trên hiệu quả công việc).", "formalityScore": 8 },
        { "text": "dependable", "nuance": "Có thể dựa dẫm được.", "formalityScore": 7 },
        { "text": "credible", "nuance": "Đáng tin (thường dùng cho nguồn tin/lời giải thích).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "trust", "meaning": "tin tưởng", "relatedWords": [] },
      "root2": { "text": "worth-", "meaning": "giá trị/xứng đáng", "relatedWords": [{ "word": "worthy", "meaning": "xứng đáng" }] }
    }
  },
  {
    "id": "v432",
    "word": "URGENT",
    "ipa": "ˈɜːdʒənt",
    "elo": 845,
    "level": "beginner",
    "scenario": "Group công ty báo \"việc URGENT, vào gấp\", vào thì thấy sếp hỏi trưa nay ai ăn cơm gà, ủa alo.",
    "translationHint": "Khẩn cấp",
    "upgradeModule": {
      "simpleSentence": "This problem needs to be fixed right now.",
      "targetSlot": "needs to be fixed right now",
      "academicOptions": [
        { "text": "requires immediate attention", "nuance": "Yêu cầu sự chú ý ngay lập tức.", "formalityScore": 9 },
        { "text": "pressing", "nuance": "Cấp thiết, nhức nhối.", "formalityScore": 8 },
        { "text": "imperative", "nuance": "Bắt buộc, khẩn thiết yếu.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "urg-", "meaning": "thúc đẩy/ép (to press)", "relatedWords": [{ "word": "urge", "meaning": "thúc giục" }] }
    }
  },
  {
    "id": "v433",
    "word": "VALUABLE",
    "ipa": "ˈvæljuəbl",
    "elo": 855,
    "level": "beginner",
    "scenario": "Ở phòng trọ năm người, thứ VALUABLE nhất không phải laptop mà là cái ổ cắm còn trống lúc 11 giờ đêm, giành được là flex cả phòng.",
    "translationHint": "Quý giá",
    "upgradeModule": {
      "simpleSentence": "Gold is a very expensive metal.",
      "targetSlot": "expensive",
      "academicOptions": [
        { "text": "precious", "nuance": "Quý báu (giá trị tinh thần hoặc vật chất cực cao).", "formalityScore": 9 },
        { "text": "invaluable", "nuance": "Vô giá.", "formalityScore": 10 },
        { "text": "worthwhile", "nuance": "Xứng đáng (thời gian/công sức).", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "val-", "meaning": "mạnh mẽ/giá trị", "relatedWords": [{ "word": "valid", "meaning": "hợp lệ" }] }
    }
  },
  {
    "id": "v434",
    "word": "PARTICULAR",
    "ipa": "pəˈtɪkjələ(r)",
    "elo": 910,
    "level": "intermediate",
    "scenario": "Tôi không kén ăn, chỉ có một yêu cầu PARTICULAR: trà sữa 30% đường, ít đá, thêm trân châu trắng.",
    "translationHint": "Cụ thể, đặc biệt",
    "upgradeModule": {
      "simpleSentence": "Is there a special reason for your visit?",
      "targetSlot": "special",
      "academicOptions": [
        { "text": "specific", "nuance": "Cụ thể.", "formalityScore": 8 },
        { "text": "meticulous", "nuance": "Tỉ mỉ, kỹ lưỡng (khi nói về tính cách cầu kỳ).", "formalityScore": 10 },
        { "text": "noteworthy", "nuance": "Đáng chú ý.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "part-", "meaning": "phần (part)", "relatedWords": [{ "word": "particle", "meaning": "hạt nhỏ" }, { "word": "partial", "meaning": "một phần" }] }
    }
  },
  {
    "id": "v435",
    "word": "QUALIFY",
    "ipa": "ˈkwɒlɪfaɪ",
    "elo": 940,
    "level": "intermediate",
    "scenario": "Tin tuyển thực tập sinh đòi 3 năm kinh nghiệm, đọc xong biết ngay mình khum QUALIFY cho cả vị trí thực tập.",
    "translationHint": "Đủ điều kiện, đủ tư cách",
    "upgradeModule": {
      "simpleSentence": "He has the right skills to do the job.",
      "targetSlot": "has the right skills",
      "academicOptions": [
        { "text": "meet the requirements", "nuance": "Đáp ứng các yêu cầu.", "formalityScore": 9 },
        { "text": "eligible for", "nuance": "Đủ tư cách/điều kiện (theo luật lệ).", "formalityScore": 10 },
        { "text": "certified", "nuance": "Được chứng nhận.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "qual-", "meaning": "thế nào/loại nào", "relatedWords": [{ "word": "quality", "meaning": "chất lượng" }] },
      "suffix": { "text": "-fy", "meaning": "làm cho (to make)", "relatedWords": [{ "word": "clarify", "meaning": "làm rõ" }] }
    }
  },
  {
    "id": "v436",
    "word": "REASONABLE",
    "ipa": "ˈriːznəbl",
    "elo": 855,
    "level": "beginner",
    "scenario": "Quán cơm gần trường giá REASONABLE, cơm thêm miễn phí, bà chủ keo lỳ tới mức cả lớp coi như mẹ nuôi tập thể.",
    "translationHint": "Hợp lý, giá cả phải chăng",
    "upgradeModule": {
      "simpleSentence": "The price is okay for most people.",
      "targetSlot": "okay",
      "academicOptions": [
        { "text": "affordable", "nuance": "Giá cả phải chăng, vừa túi tiền.", "formalityScore": 7 },
        { "text": "justifiable", "nuance": "Chính đáng, có thể biện minh được.", "formalityScore": 10 },
        { "text": "rational", "nuance": "Hợp lý (dựa trên lý trí).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "ratio/reason-", "meaning": "tính toán/lý lẽ (to calculate/reckon)", "relatedWords": [{ "word": "ratio", "meaning": "tỉ lệ" }, { "word": "rational", "meaning": "hợp lý" }] }
    }
  },
  {
    "id": "v437",
    "word": "STRUGGLE",
    "ipa": "ˈstrʌɡl",
    "elo": 880,
    "level": "beginner",
    "scenario": "Tôi STRUGGLE với cái nắp hũ dưa cải mười phút, đưa đứa cùng phòng vặn một cái là mở, out trình.",
    "translationHint": "Vật lộn, đấu tranh",
    "upgradeModule": {
      "simpleSentence": "He is having a hard time with his new job.",
      "targetSlot": "having a hard time",
      "academicOptions": [
        { "text": "grappling with", "nuance": "Vật lộn để giải quyết một vấn đề khó.", "formalityScore": 9 },
        { "text": "endeavoring to", "nuance": "Nỗ lực hết mình để (rất trang trọng).", "formalityScore": 10 },
        { "text": "striving", "nuance": "Phấn đấu, nỗ lực (nghĩa tích cực).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "strug-", "meaning": "đi vất vả/khập khiễng (từ gốc Scandinavi)", "relatedWords": [] }
    }
  },
  {
    "id": "v438",
    "word": "THOROUGH",
    "ipa": "ˈθʌrə",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Trước khi chốt đơn, tôi ô dề đọc review THOROUGH tới từng bình luận một sao, xong vẫn mua cái rẻ nhất.",
    "translationHint": "Kỹ lưỡng, thấu đáo",
    "upgradeModule": {
      "simpleSentence": "He did a full job of cleaning the house.",
      "targetSlot": "full",
      "academicOptions": [
        { "text": "comprehensive", "nuance": "Toàn diện, bao quát.", "formalityScore": 9 },
        { "text": "exhaustive", "nuance": "Thấu đáo đến mức kiệt cùng.", "formalityScore": 10 },
        { "text": "rigorous", "nuance": "Khắt khe, nghiêm ngặt.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "thorough", "meaning": "xuyên suốt (từ gốc của 'through')", "relatedWords": [{ "word": "through", "meaning": "xuyên qua" }] }
    }
  },
  {
    "id": "v439",
    "word": "UNIQUE",
    "ipa": "juˈniːk",
    "elo": 860,
    "level": "beginner",
    "scenario": "Bạn tôi đặt tên mèo là Mì Tôm Trứng, cái tên UNIQUE tới mức bác sĩ thú y đọc tên cũng phải nhịn cười, slay.",
    "translationHint": "Độc nhất, độc đáo",
    "upgradeModule": {
      "simpleSentence": "This is a very special opportunity.",
      "targetSlot": "special",
      "academicOptions": [
        { "text": "singular", "nuance": "Độc nhất, kỳ lạ.", "formalityScore": 9 },
        { "text": "unparalleled", "nuance": "Vô song, chưa từng có.", "formalityScore": 10 },
        { "text": "distinctive", "nuance": "Dễ phân biệt, mang nét riêng.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "uni-", "meaning": "một (one)", "relatedWords": [{ "word": "unit", "meaning": "đơn vị" }, { "word": "unify", "meaning": "thống nhất" }, { "word": "universe", "meaning": "vũ trụ" }] }
    }
  },
  {
    "id": "v440",
    "word": "WHISPER",
    "ipa": "ˈwɪspə(r)",
    "elo": 830,
    "level": "beginner",
    "scenario": "Trong rạp phim, đứa ngồi sau WHISPER với bồ nó mà nguyên hàng ghế đều biết luôn cái kết, ủa alo.",
    "translationHint": "Thì thầm",
    "upgradeModule": {
      "simpleSentence": "She said it very quietly.",
      "targetSlot": "said it very quietly",
      "academicOptions": [
        { "text": "murmured softly", "nuance": "Thì thầm rì rầm.", "formalityScore": 8 },
        { "text": "muttered", "nuance": "Lầm bầm (thường là phàn nàn).", "formalityScore": 7 },
        { "text": "breathed", "nuance": "Thốt ra khẽ khàng.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "whisper", "meaning": "tượng thanh (tiếng xì xào)", "relatedWords": [{ "word": "whistle", "meaning": "huýt sáo" }] }
    }
  },
  {
    "id": "v441",
    "word": "ANNOYING",
    "ipa": "əˈnɔɪɪŋ",
    "elo": 820,
    "level": "beginner",
    "scenario": "Tiếng muỗi vo ve lúc 2 giờ sáng là thứ ANNOYING nhất đời, bật đèn lên thì nó tàng hình.",
    "translationHint": "Làm phiền, khó chịu",
    "upgradeModule": {
      "simpleSentence": "The noise is very bad.",
      "targetSlot": "bad",
      "academicOptions": [
        { "text": "exasperating", "nuance": "Làm bực mình đến phát điên.", "formalityScore": 10 },
        { "text": "irksome", "nuance": "Gây khó chịu, mệt mỏi.", "formalityScore": 9 },
        { "text": "vexing", "nuance": "Gây rắc rối, bực bội.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "in odio-", "meaning": "trong sự ghét bỏ (at enmity)", "relatedWords": [{ "word": "odious", "meaning": "ghê tởm" }, { "word": "enmity", "meaning": "sự thù hằn" }] }
    }
  },
  {
    "id": "v442",
    "word": "BELIEVE",
    "ipa": "bɪˈliːv",
    "elo": 800,
    "level": "beginner",
    "scenario": "Tôi vẫn BELIEVE cuối tuần này mình sẽ dọn phòng trọ, manifest đều đều, niềm tin đó đã sống khỏe suốt ba tháng nay.",
    "translationHint": "Tin tưởng",
    "upgradeModule": {
      "simpleSentence": "I think that his story is true.",
      "targetSlot": "think",
      "academicOptions": [
        { "text": "maintain", "nuance": "Khẳng định, giữ vững quan điểm.", "formalityScore": 9 },
        { "text": "assert", "nuance": "Quả quyết.", "formalityScore": 10 },
        { "text": "be convinced of", "nuance": "Bị thuyết phục/tin chắc vào.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "lief-", "meaning": "yêu quý/quan tâm (dear)", "relatedWords": [{ "word": "belief", "meaning": "niềm tin" }, { "word": "libido", "meaning": "dục vọng" }] }
    }
  },
  {
    "id": "v443",
    "word": "CRITICAL",
    "ipa": "ˈkrɪtɪkl",
    "elo": 970,
    "level": "intermediate",
    "scenario": "Thầy hướng dẫn CRITICAL với đề cương của tôi tới mức sửa luôn cả dấu chấm, tôi chằm zn hai ngày.",
    "translationHint": "Quan trọng, nguy cấp, phê bình",
    "upgradeModule": {
      "simpleSentence": "The situation is very dangerous and important.",
      "targetSlot": "dangerous and important",
      "academicOptions": [
        { "text": "pivotal moment", "nuance": "Thời điểm then chốt, mang tính xoay chuyển.", "formalityScore": 9 },
        { "text": "dire situation", "nuance": "Tình huống cực kỳ thảm khốc/nguy kịch.", "formalityScore": 10 },
        { "text": "crucial", "nuance": "Quyết định, cốt yếu.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "crit-", "meaning": "phán xét/phân loại (judge/decide)", "relatedWords": [{ "word": "critic", "meaning": "nhà phê bình" }, { "word": "crisis", "meaning": "khủng hoảng (điểm quyết định)" }, { "word": "criterion", "meaning": "tiêu chí" }] }
    }
  },
  {
    "id": "v444",
    "word": "DELIGHTED",
    "ipa": "dɪˈlaɪtɪd",
    "elo": 890,
    "level": "beginner",
    "scenario": "Sếp bảo nay về sớm, cả phòng DELIGHTED được đúng mười giây thì sếp nói thêm \"nhớ mang laptop về\".",
    "translationHint": "Vui mừng, hài lòng",
    "upgradeModule": {
      "simpleSentence": "She was very happy with the gift.",
      "targetSlot": "very happy",
      "academicOptions": [
        { "text": "elated", "nuance": "Phấn chấn, hân hoan (thường do thành công).", "formalityScore": 10 },
        { "text": "gratified", "nuance": "Hài lòng, mãn nguyện (do ước nguyện được đáp ứng).", "formalityScore": 9 },
        { "text": "overjoyed", "nuance": "Vui mừng khôn xiết.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "de-", "meaning": "hoàn toàn", "relatedWords": [] },
      "root": { "text": "lact-", "meaning": "lôi cuốn (entice)", "relatedWords": [{ "word": "delectable", "meaning": "ngon lành/thú vị" }] }
    }
  },
  {
    "id": "v445",
    "word": "FRUSTRATED",
    "ipa": "frʌˈstreɪtɪd",
    "elo": 870,
    "level": "beginner",
    "scenario": "Chụp 87 tấm mới được một tấm ưng, đăng lên bị app làm mờ, xu cà na thật, tôi FRUSTRATED tới mức xóa luôn app.",
    "translationHint": "Bực bội, nản lòng",
    "upgradeModule": {
      "simpleSentence": "He feels bad because he can't solve the problem.",
      "targetSlot": "feels bad",
      "academicOptions": [
        { "text": "disheartened", "nuance": "Nản lòng, mất tinh thần.", "formalityScore": 9 },
        { "text": "exasperated", "nuance": "Bực tức đến cực độ.", "formalityScore": 10 },
        { "text": "thwarted", "nuance": "Bị ngăn cản, làm cho thất bại.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "frustra-", "meaning": "vô ích (in vain)", "relatedWords": [{ "word": "frustrate", "meaning": "làm hỏng kế hoạch/vô hiệu hóa" }] }
    }
  },
  {
    "id": "v446",
    "word": "GENUINE",
    "ipa": "ˈdʒenjuɪn",
    "elo": 880,
    "level": "beginner",
    "scenario": "Bạn GENUINE là đứa thấy mình đăng ảnh xấu thì nhắn riêng bảo xóa, chứ không vào khen \"xinh quá\" cho vui.",
    "translationHint": "Thật lòng, chân thành",
    "upgradeModule": {
      "simpleSentence": "Is this a real leather bag?",
      "targetSlot": "real",
      "academicOptions": [
        { "text": "authentic", "nuance": "Xác thực, có nguồn gốc đáng tin.", "formalityScore": 10 },
        { "text": "sincere", "nuance": "Chân thành (cho cảm xúc/lời nói).", "formalityScore": 8 },
        { "text": "bona fide", "nuance": "Thật sự, thiện chí (rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "gen-", "meaning": "sinh ra (birth/race)", "relatedWords": [{ "word": "gender", "meaning": "giới tính" }, { "word": "gene", "meaning": "gen di truyền" }, { "word": "general", "meaning": "chung/phổ quát" }] }
    }
  },
  {
    "id": "v447",
    "word": "HESITATE",
    "ipa": "ˈhezɪteɪt",
    "elo": 825,
    "level": "beginner",
    "scenario": "Tôi HESITATE nửa tiếng trước nút thanh toán giỏ hàng 2 triệu, tới khi mã giảm giá hết hạn, vũ trụ quyết giùm luôn.",
    "translationHint": "Do dự, ngập ngừng",
    "upgradeModule": {
      "simpleSentence": "Don't wait, just do it.",
      "targetSlot": "wait",
      "academicOptions": [
        { "text": "vacillate", "nuance": "Lưỡng lự, thay đổi ý kiến liên tục.", "formalityScore": 10 },
        { "text": "waver", "nuance": "Dao động, không kiên định.", "formalityScore": 9 },
        { "text": "pause", "nuance": "Tạm dừng lại.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "hes-", "meaning": "dính chặt/mắc kẹt (to stick)", "relatedWords": [{ "word": "adhere", "meaning": "dính vào" }, { "word": "coherent", "meaning": "mạch lạc (dính kết)" }] }
    }
  },
  {
    "id": "v448",
    "word": "INFLUENCE",
    "ipa": "ˈɪnfluəns",
    "elo": 915,
    "level": "intermediate",
    "scenario": "Bạn cùng phòng mở nhạc buồn mỗi tối, INFLUENCE tới mức tôi chưa thất tình mà cũng thấy cần chữa lành.",
    "translationHint": "Ảnh hưởng, tác động",
    "upgradeModule": {
      "simpleSentence": "The leader had a big effect on the group.",
      "targetSlot": "big effect",
      "academicOptions": [
        { "text": "profound impact", "nuance": "Tác động sâu sắc.", "formalityScore": 10 },
        { "text": "leverage", "nuance": "Tận dụng lợi thế để gây ảnh hưởng.", "formalityScore": 10 },
        { "text": "sway", "nuance": "Thuyết phục, làm dao động ý kiến.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "vào trong", "relatedWords": [] },
      "root": { "text": "flu-", "meaning": "chảy (to flow)", "relatedWords": [{ "word": "fluid", "meaning": "chất lỏng" }, { "word": "fluent", "meaning": "trôi chảy" }, { "word": "affluent", "meaning": "giàu có (tiền đổ về)" }] }
    }
  },
  {
    "id": "v449",
    "word": "URGENT",
    "ipa": "ˈɜːdʒənt",
    "elo": 845,
    "level": "beginner",
    "scenario": "Ba gọi lúc 6 giờ sáng bảo về quê gấp vì việc URGENT, về tới nơi thì ba nhờ đăng nhập lại Facebook.",
    "translationHint": "Khẩn cấp",
    "upgradeModule": {
      "simpleSentence": "We need help right now.",
      "targetSlot": "right now",
      "academicOptions": [
        { "text": "immediate assistance", "nuance": "Sự trợ giúp tức thì.", "formalityScore": 9 },
        { "text": "imperative", "nuance": "Bắt buộc, khẩn thiết.", "formalityScore": 10 },
        { "text": "exigent", "nuance": "Cấp bách, đòi hỏi hành động ngay.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "urg-", "meaning": "thúc đẩy (to press)", "relatedWords": [{ "word": "urge", "meaning": "thúc giục" }] }
    }
  },
  {
    "id": "v450",
    "word": "VALUABLE",
    "ipa": "ˈvæljuəbl",
    "elo": 855,
    "level": "beginner",
    "scenario": "Trước mùa thi, cuốn vở ghi chép của đứa học giỏi nhất lớp còn VALUABLE hơn vàng, xin photo phải xếp hàng, fomo cả lớp.",
    "translationHint": "Quý giá, có giá trị",
    "upgradeModule": {
      "simpleSentence": "This watch is very expensive.",
      "targetSlot": "expensive",
      "academicOptions": [
        { "text": "precious", "nuance": "Quý báu (giá trị tinh thần).", "formalityScore": 9 },
        { "text": "inestimable", "nuance": "Không thể ước lượng được (giá trị quá lớn).", "formalityScore": 10 },
        { "text": "noteworthy", "nuance": "Đáng chú ý/có giá trị ghi nhận.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "val-", "meaning": "mạnh mẽ/giá trị", "relatedWords": [{ "word": "valid", "meaning": "hợp lệ" }, { "word": "valor", "meaning": "dũng cảm" }] }
    }
  },
  {
    "id": "v451",
    "word": "APPROPRIATE",
    "ipa": "əˈprəʊpriət",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Đi phỏng vấn mặc hoodie in hình mèo, mẹ hỏi vậy có APPROPRIATE khum, tôi bảo đây là văn hóa startup.",
    "translationHint": "Phù hợp, thích hợp",
    "upgradeModule": {
      "simpleSentence": "Is this formal dress right for the party?",
      "targetSlot": "right",
      "academicOptions": [
        { "text": "appropriate attire", "nuance": "Trang phục phù hợp với hoàn cảnh/nghi thức.", "formalityScore": 9 },
        { "text": "fitting", "nuance": "Xứng đáng, vừa vặn với tình huống.", "formalityScore": 7 },
        { "text": "apt", "nuance": "Thích hợp, khéo léo (apt remark).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad/ap-", "meaning": "đến/hướng tới", "relatedWords": [] },
      "root": { "text": "proprius-", "meaning": "riêng biệt/đặc hữu (one's own)", "relatedWords": [{ "word": "property", "meaning": "tài sản/thuộc tính" }, { "word": "proper", "meaning": "đúng mực" }, { "word": "proprietor", "meaning": "chủ sở hữu" }] }
    }
  },
  {
    "id": "v452",
    "word": "BEHAVE",
    "ipa": "bɪˈheɪv",
    "elo": 820,
    "level": "beginner",
    "scenario": "Về quê ăn Tết, mẹ dặn BEHAVE cho đàng hoàng, vậy mà cô Ba vừa hỏi lương bao nhiêu là tôi suýt báo thủ tại chỗ.",
    "translationHint": "Cư xử, ăn ở",
    "upgradeModule": {
      "simpleSentence": "The children acted very well during the trip.",
      "targetSlot": "acted",
      "academicOptions": [
        { "text": "behave professionally", "nuance": "Hành xử một cách chuyên nghiệp.", "formalityScore": 8 },
        { "text": "conduct oneself", "nuance": "Cách một người tự dẫn dắt/thể hiện bản thân (rất trang trọng).", "formalityScore": 10 },
        { "text": "comport", "nuance": "Cư xử phù hợp với địa vị/hoàn cảnh.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "be-", "meaning": "hoàn toàn/xung quanh", "relatedWords": [] },
      "root": { "text": "have-", "meaning": "có/giữ (to have - nghĩa gốc là 'tự giữ mình')", "relatedWords": [{ "word": "habit", "meaning": "thói quen (thứ mình giữ)" }] }
    }
  },
  {
    "id": "v453",
    "word": "COINCIDENCE",
    "ipa": "kəʊˈɪnsɪdəns",
    "elo": 980,
    "level": "intermediate",
    "scenario": "Vừa đăng story than đói thì crush nhắn rủ ăn lẩu, nó bảo COINCIDENCE thôi mà tôi đã manifest tới đám cưới.",
    "translationHint": "Sự trùng hợp ngẫu nhiên",
    "upgradeModule": {
      "simpleSentence": "It was just a chance that we met at the airport.",
      "targetSlot": "chance",
      "academicOptions": [
        { "text": "remarkable coincidence", "nuance": "Một sự trùng hợp đáng chú ý.", "formalityScore": 8 },
        { "text": "fluke", "nuance": "Sự may mắn/trùng hợp ngẫu nhiên (thông dụng).", "formalityScore": 5 },
        { "text": "serendipity", "nuance": "Sự tình cờ may mắn tìm được thứ quý giá.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "co-", "meaning": "cùng nhau", "relatedWords": [] },
      "prefix2": { "text": "in-", "meaning": "vào/trên", "relatedWords": [] },
      "root": { "text": "cad/cid-", "meaning": "rơi (to fall - nghĩa là các sự kiện 'rơi vào nhau' cùng lúc)", "relatedWords": [{ "word": "accident", "meaning": "tai nạn" }, { "word": "incident", "meaning": "sự cố" }, { "word": "deciduous", "meaning": "rụng lá" }] }
    }
  },
  {
    "id": "v454",
    "word": "DETERMINED",
    "ipa": "dɪˈtɜːmɪnd",
    "elo": 880,
    "level": "beginner",
    "scenario": "Đăng ký gym 12 tháng, DETERMINED lắm, tới buổi thứ ba thì lý do nghỉ là trời hơi âm u, hết cứu.",
    "translationHint": "Quyết tâm, kiên quyết",
    "upgradeModule": {
      "simpleSentence": "He is very firm about finishing the marathon.",
      "targetSlot": "firm",
      "academicOptions": [
        { "text": "resolute", "nuance": "Kiên định, không hề nao núng trước khó khăn.", "formalityScore": 9 },
        { "text": "dogged", "nuance": "Lỳ lợm, bền bỉ (như chó săn).", "formalityScore": 8 },
        { "text": "steadfast", "nuance": "Trung thành và kiên định.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "de-", "meaning": "hoàn toàn", "relatedWords": [] },
      "root": { "text": "termin-", "meaning": "giới hạn/ranh giới (limit/end)", "relatedWords": [{ "word": "terminal", "meaning": "nhà ga cuối" }, { "word": "terminate", "meaning": "chấm dứt" }, { "word": "exterminate", "meaning": "hủy diệt" }] }
    }
  },
  {
    "id": "v455",
    "word": "ENCOURAGE",
    "ipa": "ɪnˈkʌrɪdʒ",
    "elo": 860,
    "level": "beginner",
    "scenario": "Cả group chat ENCOURAGE tôi nhắn tin cho crush, gửi xong thì cả lũ đồng loạt offline, red flag cả đám.",
    "translationHint": "Khuyến khích, động viên",
    "upgradeModule": {
      "simpleSentence": "The boss told me to keep working hard.",
      "targetSlot": "told me to keep",
      "academicOptions": [
        { "text": "encourage growth", "nuance": "Thúc đẩy sự tăng trưởng.", "formalityScore": 8 },
        { "text": "incentivize", "nuance": "Khuyến khích bằng lợi ích/phần thưởng.", "formalityScore": 10 },
        { "text": "foster", "nuance": "Nuôi dưỡng, thúc đẩy (thường dùng cho kỹ năng/môi trường).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "en-", "meaning": "làm cho/vào trong", "relatedWords": [] },
      "root": { "text": "cour/cor-", "meaning": "trái tim (heart - nghĩa là truyền thêm 'tim'/sức mạnh cho ai đó)", "relatedWords": [{ "word": "core", "meaning": "cốt lõi" }, { "word": "cordial", "meaning": "thân ái" }, { "word": "courage", "meaning": "dũng cảm" }] }
    }
  },
  {
    "id": "v456",
    "word": "FAMILIAR",
    "ipa": "fəˈmɪliə(r)",
    "elo": 810,
    "level": "beginner",
    "scenario": "Mở đề thi thấy bài nào cũng FAMILIAR y như người yêu cũ: nhớ mặt mà không nhớ làm sao, chằm zn.",
    "translationHint": "Quen thuộc",
    "upgradeModule": {
      "simpleSentence": "I know this place very well.",
      "targetSlot": "know this place very well",
      "academicOptions": [
        { "text": "intimately familiar with", "nuance": "Cực kỳ am tường, hiểu rõ như lòng bàn tay.", "formalityScore": 9 },
        { "text": "acquainted with", "nuance": "Quen biết, có biết qua (mức độ thấp hơn).", "formalityScore": 8 },
        { "text": "conversant with", "nuance": "Thông thạo, có thể nói chuyện sâu về vấn đề đó.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "famil-", "meaning": "gia đình (family - nghĩa là quen thuộc như người trong nhà)", "relatedWords": [{ "word": "family", "meaning": "gia đình" }, { "word": "familiarity", "meaning": "sự thân thuộc" }] }
    }
  },
  {
    "id": "v457",
    "word": "GENEROUS",
    "ipa": "ˈdʒenərəs",
    "elo": 835,
    "level": "beginner",
    "scenario": "Thằng keo lỳ nhất nhóm bỗng GENEROUS bao trà sữa cả phòng, hóa ra là để mọi người vote cho clip của nó.",
    "translationHint": "Hào phóng, rộng lượng",
    "upgradeModule": {
      "simpleSentence": "He gave a very big tip to the waiter.",
      "targetSlot": "big",
      "academicOptions": [
        { "text": "generous contribution", "nuance": "Sự đóng góp hào phóng và đáng kể.", "formalityScore": 8 },
        { "text": "magnanimous", "nuance": "Hào hiệp, cao thượng.", "formalityScore": 10 },
        { "text": "bountiful", "nuance": "Dồi dào, hậu hĩnh.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "gener-", "meaning": "giống nòi/sinh ra (race/birth)", "relatedWords": [{ "word": "generate", "meaning": "tạo ra" }, { "word": "general", "meaning": "chung/phổ quát" }] }
    }
  },
  {
    "id": "v458",
    "word": "HESITATE",
    "ipa": "ˈhezɪteɪt",
    "elo": 825,
    "level": "beginner",
    "scenario": "Đứng trước quầy trà sữa HESITATE mười phút giữa trân châu đen và trắng, quay lại thì quán hết cả hai, xu cà na.",
    "translationHint": "Do dự, ngập ngừng",
    "upgradeModule": {
      "simpleSentence": "Don't wait, just do it.",
      "targetSlot": "wait",
      "academicOptions": [
        { "text": "vacillate", "nuance": "Lưỡng lự, thay đổi ý kiến liên tục.", "formalityScore": 10 },
        { "text": "waver", "nuance": "Dao động, không kiên định.", "formalityScore": 9 },
        { "text": "pause", "nuance": "Tạm dừng lại.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "hes-", "meaning": "dính chặt/mắc kẹt (to stick)", "relatedWords": [{ "word": "adhere", "meaning": "dính vào" }, { "word": "coherent", "meaning": "mạch lạc" }] }
    }
  },
  {
    "id": "v459",
    "word": "IMITATE",
    "ipa": "ˈɪmɪteɪt",
    "elo": 940,
    "level": "intermediate",
    "scenario": "Em gái IMITATE y chang giọng tôi gọi cho mẹ xin tiền, mẹ chuyển khoản liền, giờ tôi mới là đứa bị nghi, báo thủ chính hiệu.",
    "translationHint": "Bắt chước, nhại lại",
    "upgradeModule": {
      "simpleSentence": "He tried to copy the style of the famous artist.",
      "targetSlot": "copy",
      "academicOptions": [
        { "text": "emulate", "nuance": "Bắt chước để noi gương và cố gắng đạt được thành tựu tương tự.", "formalityScore": 9 },
        { "text": "mimic", "nuance": "Nhại lại (thường mang tính giải trí hoặc châm chọc).", "formalityScore": 6 },
        { "text": "replicate", "nuance": "Tái tạo, sao chép chính xác.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "imag-", "meaning": "hình ảnh (image/likeness)", "relatedWords": [{ "word": "image", "meaning": "hình ảnh" }, { "word": "imagination", "meaning": "tưởng tượng" }] }
    }
  },
  {
    "id": "v460",
    "word": "JEALOUS",
    "ipa": "ˈdʒeləs",
    "elo": 830,
    "level": "beginner",
    "scenario": "Thấy bạn cùng phòng được mẹ gửi lên nguyên thùng đồ ăn, tôi JEALOUS tới mức gọi về nhà nhắc khéo ba lần, ô dề ghê.",
    "translationHint": "Ghen tị, ghen tuông",
    "upgradeModule": {
      "simpleSentence": "He was angry because his friend got a new car.",
      "targetSlot": "angry",
      "academicOptions": [
        { "text": "envious of", "nuance": "Thèm muốn thứ người khác có.", "formalityScore": 8 },
        { "text": "resentful", "nuance": "Bực bội, uất ức vì cảm thấy bất công.", "formalityScore": 9 },
        { "text": "green-eyed", "nuance": "Mắt xanh vì ghen tị (thành ngữ).", "formalityScore": 5 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "zelos-", "meaning": "nhiệt huyết (zeal)", "relatedWords": [{ "word": "zeal", "meaning": "lòng nhiệt thành" }, { "word": "zealous", "meaning": "hăng hái" }] }
    }
  },
  {
    "id": "v461",
    "word": "KNOWLEDGEABLE",
    "ipa": "ˈnɒlɪdʒəbl",
    "elo": 950,
    "level": "intermediate",
    "scenario": "Ông bạn KNOWLEDGEABLE về cà phê cỡ ngửi là biết hạt gì, vậy mà ra quán lần nào cũng gọi bạc xỉu thêm đường, ủa alo.",
    "translationHint": "Am hiểu, có kiến thức rộng",
    "upgradeModule": {
      "simpleSentence": "He knows a lot about computers.",
      "targetSlot": "knows a lot",
      "academicOptions": [
        { "text": "highly knowledgeable", "nuance": "Cực kỳ am hiểu và có kiến thức chuyên sâu.", "formalityScore": 8 },
        { "text": "erudite", "nuance": "Thông thái, uyên bác.", "formalityScore": 10 },
        { "text": "well-informed", "nuance": "Nắm bắt thông tin tốt.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "know-", "meaning": "biết", "relatedWords": [] },
      "root2": { "text": "ledge/log-", "meaning": "lý lẽ/lời nói", "relatedWords": [] }
    }
  },
  {
    "id": "v462",
    "word": "LIMIT",
    "ipa": "ˈlɪmɪt",
    "elo": 815,
    "level": "beginner",
    "scenario": "Thẻ tín dụng thì có LIMIT, còn lòng tham của tôi mùa sale 11.11 thì khum.",
    "translationHint": "Giới hạn",
    "upgradeModule": {
      "simpleSentence": "We need to stop the amount of sugar we eat.",
      "targetSlot": "stop the amount of",
      "academicOptions": [
        { "text": "curtail consumption", "nuance": "Cắt giảm sự tiêu thụ (rất trang trọng).", "formalityScore": 10 },
        { "text": "restrict", "nuance": "Hạn chế, thắt chặt (theo quy định).", "formalityScore": 8 },
        { "text": "cap", "nuance": "Đặt mức trần.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "limin-", "meaning": "ngưỡng cửa/ranh giới (threshold)", "relatedWords": [{ "word": "eliminate", "meaning": "loại bỏ" }, { "word": "subliminal", "meaning": "dưới ngưỡng nhận thức" }] }
    }
  },
  {
    "id": "v463",
    "word": "MOTIVATE",
    "ipa": "ˈməʊtɪveɪt",
    "elo": 860,
    "level": "beginner",
    "scenario": "Nói real, thứ duy nhất MOTIVATE tôi dậy sớm là cái mã giảm 50% chỉ áp dụng trước 9 giờ sáng.",
    "translationHint": "Thúc đẩy, tạo động lực",
    "upgradeModule": {
      "simpleSentence": "The teacher tried to make the students want to learn.",
      "targetSlot": "make the students want to learn",
      "academicOptions": [
        { "text": "motivate the staff", "nuance": "Truyền cảm hứng và động lực cho nhân viên.", "formalityScore": 8 },
        { "text": "incentivize", "nuance": "Khuyến khích bằng phần thưởng hoặc lợi ích.", "formalityScore": 10 },
        { "text": "inspire", "nuance": "Truyền cảm hứng.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "mot-", "meaning": "di chuyển (to move)", "relatedWords": [{ "word": "motion", "meaning": "chuyển động" }, { "word": "motor", "meaning": "động cơ" }] }
    }
  },
  {
    "id": "v464",
    "word": "NOTICE",
    "ipa": "ˈnəʊtɪs",
    "elo": 810,
    "level": "beginner",
    "scenario": "Đi cà phê cả buổi mới NOTICE mình mang hai chiếc dép khác màu, đứa bạn thấy từ đầu mà im re ngồi chụp hình, ra đường tôi nể mỗi bạn.",
    "translationHint": "Để ý thấy, nhận ra",
    "upgradeModule": {
      "simpleSentence": "Did you see the small change in the room?",
      "targetSlot": "see",
      "academicOptions": [
        { "text": "observe the discrepancy", "nuance": "Quan sát thấy sự khác biệt/sai lệch.", "formalityScore": 9 },
        { "text": "perceive", "nuance": "Nhận thức/cảm nhận được.", "formalityScore": 10 },
        { "text": "detect", "nuance": "Dò tìm/phát hiện ra.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "not-", "meaning": "biết/đánh dấu (to know/mark)", "relatedWords": [{ "word": "note", "meaning": "ghi chú" }, { "word": "notable", "meaning": "đáng chú ý" }] }
    }
  },
  {
    "id": "v465",
    "word": "OBVIOUS",
    "ipa": "ˈɒbviəs",
    "elo": 815,
    "level": "beginner",
    "scenario": "Nó bảo không thích crush, nhưng tối nào cũng xem story người ta đầu tiên, OBVIOUS tới mức cả group khỏi cần check var.",
    "translationHint": "Rõ ràng, hiển nhiên",
    "upgradeModule": {
      "simpleSentence": "The answer is very easy to see.",
      "targetSlot": "easy to see",
      "academicOptions": [
        { "text": "it is glaringly obvious", "nuance": "Rõ ràng một cách chói mắt.", "formalityScore": 8 },
        { "text": "evident", "nuance": "Hiển nhiên qua bằng chứng.", "formalityScore": 9 },
        { "text": "manifest", "nuance": "Lộ rõ, biểu hiện rõ ràng.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob-", "meaning": "đối diện/ngang qua", "relatedWords": [] },
      "root": { "text": "via-", "meaning": "con đường (way)", "relatedWords": [{ "word": "via", "meaning": "thông qua" }, { "word": "deviate", "meaning": "chệch đường" }] }
    }
  },
  {
    "id": "v466",
    "word": "PATIENT",
    "ipa": "ˈpeɪʃnt",
    "elo": 825,
    "level": "beginner",
    "scenario": "Chờ shipper mười lăm phút vẫn PATIENT, tới khi app báo giao thành công mà trước cửa trống trơn là tới công chuyện.",
    "translationHint": "Kiên nhẫn",
    "upgradeModule": {
      "simpleSentence": "You have to wait for the results.",
      "targetSlot": "wait",
      "academicOptions": [
        { "text": "be patient with", "nuance": "Kiên nhẫn với ai đó/việc gì đó.", "formalityScore": 7 },
        { "text": "forbearing", "nuance": "Chịu đựng, bao dung.", "formalityScore": 10 },
        { "text": "uncomplaining", "nuance": "Không than phiền, cam chịu.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "pas/path-", "meaning": "chịu đựng/cảm xúc", "relatedWords": [{ "word": "passion", "meaning": "đam mê" }, { "word": "passive", "meaning": "bị động" }] }
    }
  },
  {
    "id": "v467",
    "word": "QUARREL",
    "ipa": "ˈkwɒrəl",
    "elo": 930,
    "level": "intermediate",
    "scenario": "Hai đứa cùng phòng QUARREL suốt một tiếng xem ai rửa chén, cuối cùng gọi đồ ăn ngoài cho khỏi rửa, keo lỳ.",
    "translationHint": "Cãi vã, tranh chấp",
    "upgradeModule": {
      "simpleSentence": "The couple had a small fight about money.",
      "targetSlot": "fight",
      "academicOptions": [
        { "text": "domestic quarrel", "nuance": "Cuộc cãi vã trong gia đình.", "formalityScore": 8 },
        { "text": "altercation", "nuance": "Cuộc đấu khẩu ồn ào.", "formalityScore": 10 },
        { "text": "dispute", "nuance": "Tranh chấp.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "queri-", "meaning": "phàn nàn (to complain)", "relatedWords": [{ "word": "querulous", "meaning": "hay phàn nàn" }] }
    }
  },
  {
    "id": "v468",
    "word": "REASONABLE",
    "ipa": "ˈriːznəbl",
    "elo": 855,
    "level": "beginner",
    "scenario": "Quán cơm sau ký túc giá REASONABLE tới mức tôi nghi chủ quán đang làm dự án chữa lành sinh viên.",
    "translationHint": "Hợp lý, phải chăng",
    "upgradeModule": {
      "simpleSentence": "The price of the house is fair.",
      "targetSlot": "fair",
      "academicOptions": [
        { "text": "reasonable request", "nuance": "Một yêu cầu hợp tình hợp lý.", "formalityScore": 8 },
        { "text": "justifiable", "nuance": "Chính đáng.", "formalityScore": 10 },
        { "text": "affordable", "nuance": "Giá cả phải chăng.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "reason-", "meaning": "lý trí/tính toán", "relatedWords": [{ "word": "rational", "meaning": "hợp lý" }] }
    }
  },
  {
    "id": "v469",
    "word": "STUBBORN",
    "ipa": "ˈstʌbən",
    "elo": 860,
    "level": "beginner",
    "scenario": "Cái laptop STUBBORN lắm, bấm cập nhật thì nhất quyết không chịu, đúng lúc nộp bài thì tự cập nhật 40 phút, thao túng tâm lý.",
    "translationHint": "Bướng bỉnh, lỳ lợm",
    "upgradeModule": {
      "simpleSentence": "He refuses to change his mind.",
      "targetSlot": "refuses to change his mind",
      "academicOptions": [
        { "text": "stubbornly refuse", "nuance": "Từ chối một cách bướng bỉnh.", "formalityScore": 7 },
        { "text": "obstinate", "nuance": "Ngoan cố, khó bảo.", "formalityScore": 9 },
        { "text": "intransigent", "nuance": "Cứng nhắc, không thỏa hiệp.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "stub-", "meaning": "gốc cây", "relatedWords": [{ "word": "stub", "meaning": "mẩu" }] }
    }
  },
  {
    "id": "v470",
    "word": "TEMPORARY",
    "ipa": "ˈtemprəri",
    "elo": 870,
    "level": "beginner",
    "scenario": "Ở phòng trọ không cửa sổ chỉ là TEMPORARY thôi, tôi tự nhủ vậy từ hồi năm nhất tới giờ đi làm năm hai, delulu.",
    "translationHint": "Tạm thời",
    "upgradeModule": {
      "simpleSentence": "This is a short-term solution.",
      "targetSlot": "short-term",
      "academicOptions": [
        { "text": "temporary measure", "nuance": "Biện pháp tạm thời.", "formalityScore": 8 },
        { "text": "transient", "nuance": "Thoáng qua, ngắn ngủi.", "formalityScore": 10 },
        { "text": "provisional", "nuance": "Tạm thời (chờ thay thế).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "temp-", "meaning": "thời gian", "relatedWords": [{ "word": "tempo", "meaning": "nhịp độ" }, { "word": "contemporary", "meaning": "đương đại" }] }
    }
  },
  {
    "id": "v471",
    "word": "URGENT",
    "ipa": "ˈɜːdʒənt",
    "elo": 845,
    "level": "beginner",
    "scenario": "Group lớp ghi \"URGENT, vào gấp\", cả đám vào đủ thì lớp trưởng hỏi ai có sạc dự phòng cho mượn, ủa alo.",
    "translationHint": "Khẩn cấp",
    "upgradeModule": {
      "simpleSentence": "We need to fix this problem very soon.",
      "targetSlot": "very soon",
      "academicOptions": [
        { "text": "urgent matter", "nuance": "Vấn đề cấp bách cần xử lý ngay.", "formalityScore": 8 },
        { "text": "pressing issue", "nuance": "Vấn đề nhức nhối/cấp thiết.", "formalityScore": 9 },
        { "text": "imperative", "nuance": "Bắt buộc, khẩn thiết yếu.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "urg-", "meaning": "thúc đẩy/ép", "relatedWords": [{ "word": "urge", "meaning": "thúc giục" }] }
    }
  },
  {
    "id": "v472",
    "word": "VAGUE",
    "ipa": "veɪɡ",
    "elo": 910,
    "level": "intermediate",
    "scenario": "Hỏi cả nhóm chừng nào đi biển, nhận về câu 'để tính', VAGUE cỡ này là kèo toang chắc rồi.",
    "translationHint": "Mơ hồ, không rõ ràng",
    "upgradeModule": {
      "simpleSentence": "The instructions were not clear.",
      "targetSlot": "not clear",
      "academicOptions": [
        { "text": "vague description", "nuance": "Sự mô tả lờ mờ, thiếu chi tiết.", "formalityScore": 8 },
        { "text": "ambiguous", "nuance": "Mơ hồ, có thể hiểu theo nhiều nghĩa.", "formalityScore": 10 },
        { "text": "obscure", "nuance": "Tối nghĩa, khó hiểu.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "vagus-", "meaning": "lang thang (nghĩa gốc là ý nghĩa 'đi lang thang')", "relatedWords": [{ "word": "vagrant", "meaning": "người sống lang thang" }] }
    }
  },
  {
    "id": "v473",
    "word": "WILLING",
    "ipa": "ˈwɪlɪŋ",
    "elo": 830,
    "level": "beginner",
    "scenario": "Cả nhóm rủ dậy 4 giờ sáng săn bình minh, tôi WILLING liền, gét gô, miễn có người chụp hộ còn tôi ngủ trên xe.",
    "translationHint": "Sẵn lòng, tự nguyện",
    "upgradeModule": {
      "simpleSentence": "He is ready to help his neighbors.",
      "targetSlot": "ready",
      "academicOptions": [
        { "text": "willingness to cooperate", "nuance": "Sự sẵn lòng hợp tác.", "formalityScore": 8 },
        { "text": "amenable", "nuance": "Dễ bảo, sẵn lòng tuân theo.", "formalityScore": 10 },
        { "text": "inclined", "nuance": "Có xu hướng/muốn làm gì đó.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "will-", "meaning": "ý muốn", "relatedWords": [{ "word": "willpower", "meaning": "nghị lực" }] }
    }
  },
  {
    "id": "v474",
    "word": "ACCURATE",
    "ipa": "ˈækjərət",
    "elo": 880,
    "level": "beginner",
    "scenario": "Nhỏ bạn đoán drama nhà tôi ACCURATE hơn app thời tiết, nói trước ba ngày là xảy ra y chang, out trình.",
    "translationHint": "Chính xác",
    "upgradeModule": {
      "simpleSentence": "The map is very correct.",
      "targetSlot": "correct",
      "academicOptions": [
        { "text": "highly accurate", "nuance": "Chính xác cao.", "formalityScore": 8 },
        { "text": "precise", "nuance": "Tỉ mỉ, chính xác tuyệt đối.", "formalityScore": 10 },
        { "text": "exact", "nuance": "Chuẩn xác.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad/ac-", "meaning": "đến/hướng tới", "relatedWords": [] },
      "root": { "text": "cur-", "meaning": "chăm sóc (care - nghĩa gốc là được làm với sự chăm sóc kỹ lưỡng)", "relatedWords": [{ "word": "cure", "meaning": "chữa trị" }, { "word": "secure", "meaning": "an toàn" }] }
    }
  },
  {
    "id": "v475",
    "word": "BELIEVABLE",
    "ipa": "bɪˈliːvəbl",
    "elo": 815,
    "level": "beginner",
    "scenario": "Bảo lớp trưởng quên nộp vì mạng rớt nghe còn BELIEVABLE, chứ bảo con mèo xóa file thì hơi xu cà na.",
    "translationHint": "Có thể tin được",
    "upgradeModule": {
      "simpleSentence": "His excuse sounds like it could be true.",
      "targetSlot": "sounds like it could be true",
      "academicOptions": [
        { "text": "plausible explanation", "nuance": "Lời giải thích hợp lý, đáng tin.", "formalityScore": 9 },
        { "text": "credible", "nuance": "Đáng tin cậy.", "formalityScore": 10 },
        { "text": "convincing", "nuance": "Có sức thuyết phục.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "believe-", "meaning": "tin tưởng/yêu quý", "relatedWords": [{ "word": "belief", "meaning": "niềm tin" }] }
    }
  },
  {
    "id": "v476",
    "word": "CONVENIENT",
    "ipa": "kənˈviːniənt",
    "elo": 820,
    "level": "beginner",
    "scenario": "Ở trọ ngay trên tiệm tạp hóa CONVENIENT thật, mỗi tội đêm nào cũng xuống mua đồ ăn vặt, ví đang ét o ét.",
    "translationHint": "Tiện lợi",
    "upgradeModule": {
      "simpleSentence": "The hotel location is very good for tourists.",
      "targetSlot": "good",
      "academicOptions": [
        { "text": "conveniently located", "nuance": "Vị trí thuận tiện.", "formalityScore": 8 },
        { "text": "advantageous", "nuance": "Có lợi thế.", "formalityScore": 10 },
        { "text": "expedient", "nuance": "Tiện lợi (thực dụng).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "con-", "meaning": "cùng nhau", "relatedWords": [] },
      "root": { "text": "ven-", "meaning": "đến (to come)", "relatedWords": [{ "word": "event", "meaning": "sự kiện" }, { "word": "venue", "meaning": "địa điểm" }] }
    }
  },
  {
    "id": "v477",
    "word": "DEPENDABLE",
    "ipa": "dɪˈpendəbl",
    "elo": 930,
    "level": "intermediate",
    "scenario": "Đứa DEPENDABLE nhất nhóm là đứa nhớ mang sạc dự phòng, ô, khăn giấy và cả tiền lẻ gửi xe, đỉnh nóc kịch trần.",
    "translationHint": "Đáng tin cậy",
    "upgradeModule": {
      "simpleSentence": "My car is old but I can trust it.",
      "targetSlot": "I can trust it",
      "academicOptions": [
        { "text": "highly dependable", "nuance": "Cực kỳ đáng tin cậy.", "formalityScore": 8 },
        { "text": "reliable", "nuance": "Đáng tin.", "formalityScore": 7 },
        { "text": "steadfast", "nuance": "Kiên định.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "de-", "meaning": "xuống/từ", "relatedWords": [] },
      "root": { "text": "pend-", "meaning": "treo (to hang - nghĩa gốc là treo mình/dựa dẫm vào cái gì đó)", "relatedWords": [{ "word": "pendant", "meaning": "mặt dây chuyền" }, { "word": "suspend", "meaning": "đình chỉ" }] }
    }
  },
  {
    "id": "v478",
    "word": "EFFECTIVE",
    "ipa": "ɪˈfektɪv",
    "elo": 850,
    "level": "beginner",
    "scenario": "Cách học thuộc bài EFFECTIVE nhất của tôi lowkey hơi kỳ: giảng lại cho con mèo nghe, nó ngủ, tôi thuộc.",
    "translationHint": "Hiệu quả",
    "upgradeModule": {
      "simpleSentence": "The new law is working well.",
      "targetSlot": "working well",
      "academicOptions": [
        { "text": "highly effective", "nuance": "Đạt được hiệu quả mong muốn rõ rệt.", "formalityScore": 8 },
        { "text": "efficacious", "nuance": "Có hiệu lực (thuốc).", "formalityScore": 10 },
        { "text": "potent", "nuance": "Mạnh mẽ, có tác động lớn.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ex/ef-", "meaning": "ra ngoài", "relatedWords": [] },
      "root": { "text": "fic-", "meaning": "làm (to make)", "relatedWords": [{ "word": "efficient", "meaning": "năng suất" }] }
    }
  },
  {
    "id": "v479",
    "word": "GRATEFUL",
    "ipa": "ˈɡreɪtfl",
    "elo": 860,
    "level": "beginner",
    "scenario": "Ví ét o ét, cuối tháng còn hai chục nghìn, tôi GRATEFUL với gói mì tôm cuối cùng như với ân nhân cứu mạng.",
    "translationHint": "Biết ơn",
    "upgradeModule": {
      "simpleSentence": "I am very thankful for your help.",
      "targetSlot": "thankful",
      "academicOptions": [
        { "text": "deeply grateful", "nuance": "Biết ơn sâu sắc.", "formalityScore": 8 },
        { "text": "indebted to", "nuance": "Mắc nợ/biết ơn ai đó.", "formalityScore": 10 },
        { "text": "appreciative", "nuance": "Biết trân trọng.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "grat-", "meaning": "lòng tốt/miễn phí", "relatedWords": [{ "word": "gratitude", "meaning": "lòng biết ơn" }, { "word": "gratuitous", "meaning": "miễn phí" }] }
    }
  },
  {
    "id": "v480",
    "word": "HONEST",
    "ipa": "ˈɒnɪst",
    "elo": 810,
    "level": "beginner",
    "scenario": "Nhỏ bạn hỏi tóc mới đẹp không, tôi HONEST khen đẹp, nó bảo nói thật đi, u là trời, biết đường nào mà sống.",
    "translationHint": "Thành thật",
    "upgradeModule": {
      "simpleSentence": "He gave a very true answer.",
      "targetSlot": "true",
      "academicOptions": [
        { "text": "candid", "nuance": "Thẳng thắn.", "formalityScore": 9 },
        { "text": "forthright", "nuance": "Bộc trực.", "formalityScore": 10 },
        { "text": "sincere", "nuance": "Chân thành.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "honos-", "meaning": "danh dự", "relatedWords": [{ "word": "honor", "meaning": "danh dự" }] }
    }
  },
  {
    "id": "v481",
    "word": "IGNORE",
    "ipa": "ɪɡˈnɔː(r)",
    "elo": 820,
    "level": "beginner",
    "scenario": "Group lớp nhắn 99+ tin, tôi IGNORE hết, tới khi thấy chữ 'điểm danh' là đọc lại từ đầu trong ba giây.",
    "translationHint": "Phớt lờ, lờ đi",
    "upgradeModule": {
      "simpleSentence": "Don't pay attention to his mean comments.",
      "targetSlot": "Don't pay attention to",
      "academicOptions": [
        { "text": "disregard", "nuance": "Coi thường, không thèm để ý.", "formalityScore": 9 },
        { "text": "overlook", "nuance": "Vô tình bỏ qua hoặc lờ đi (lỗi lầm).", "formalityScore": 8 },
        { "text": "neglect", "nuance": "Bỏ bê (thường dùng cho nhiệm vụ/trách nhiệm).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in/ig-", "meaning": "không (not)", "relatedWords": [] },
      "root": { "text": "gno-", "meaning": "biết (to know - nghĩa gốc là 'không muốn biết')", "relatedWords": [{ "word": "know", "meaning": "biết" }, { "word": "recognize", "meaning": "nhận ra" }, { "word": "agnostic", "meaning": "người theo thuyết bất khả tri" }] }
    }
  },
  {
    "id": "v482",
    "word": "INTENTION",
    "ipa": "ɪnˈtenʃn",
    "elo": 910,
    "level": "intermediate",
    "scenario": "INTENTION ban đầu là vào app mua cục sạc, thoát app ra thì giỏ hàng có thêm cái đèn ngủ hình cây nấm, thao túng tâm lý.",
    "translationHint": "Ý định, mục đích",
    "upgradeModule": {
      "simpleSentence": "What is your plan for the future?",
      "targetSlot": "plan",
      "academicOptions": [
        { "text": "objective", "nuance": "Mục tiêu cụ thể, khách quan.", "formalityScore": 9 },
        { "text": "endeavor", "nuance": "Sự nỗ lực hướng tới mục tiêu (rất trang trọng).", "formalityScore": 10 },
        { "text": "aspiration", "nuance": "Nguyện vọng, khát vọng.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "vào/hướng tới", "relatedWords": [] },
      "root": { "text": "tend/tens-", "meaning": "căng ra/vươn tới (to stretch - vươn tâm trí tới một mục tiêu)", "relatedWords": [{ "word": "extend", "meaning": "mở rộng" }, { "word": "tension", "meaning": "căng thẳng" }, { "word": "tendency", "meaning": "xu hướng" }] }
    }
  },
  {
    "id": "v483",
    "word": "MANAGE",
    "ipa": "ˈmænɪdʒ",
    "elo": 850,
    "level": "beginner",
    "scenario": "Đi làm năm nhất, tôi MANAGE lương bằng cách chia năm cái hũ, tới ngày mười thì cả năm hũ cùng trống, toang.",
    "translationHint": "Quản lý, xoay xở",
    "upgradeModule": {
      "simpleSentence": "He can deal with difficult customers.",
      "targetSlot": "deal with",
      "academicOptions": [
        { "text": "effectively manage", "nuance": "Quản lý một cách hiệu quả.", "formalityScore": 8 },
        { "text": "administer", "nuance": "Điều hành, quản trị (hệ thống/thuốc).", "formalityScore": 10 },
        { "text": "supervise", "nuance": "Giám sát công việc của người khác.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "man-", "meaning": "tay (hand - nghĩa gốc là huấn luyện/điều khiển ngựa bằng tay)", "relatedWords": [{ "word": "manual", "meaning": "thủ công" }, { "word": "manipulate", "meaning": "thao túng/điều khiển" }, { "word": "manuscript", "meaning": "bản viết tay" }] }
    }
  },
  {
    "id": "v484",
    "word": "NECESSARY",
    "ipa": "ˈnesəsəri",
    "elo": 840,
    "level": "beginner",
    "scenario": "Đi Đà Lạt ô dề mang sáu cái áo khoác, cái nào cũng NECESSARY, rốt cuộc mặc đúng một cái hoodie từ đầu tới cuối.",
    "translationHint": "Cần thiết",
    "upgradeModule": {
      "simpleSentence": "Food is needed for survival.",
      "targetSlot": "needed",
      "academicOptions": [
        { "text": "essential", "nuance": "Thiết yếu, thuộc về bản chất.", "formalityScore": 9 },
        { "text": "indispensable", "nuance": "Không thể thiếu, không thể thay thế.", "formalityScore": 10 },
        { "text": "imperative", "nuance": "Cấp bách, bắt buộc.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ne-", "meaning": "không (not)", "relatedWords": [] },
      "root": { "text": "ced-", "meaning": "nhường bước/đi (to yield - nghĩa gốc là thứ không thể nhường bước/bỏ qua)", "relatedWords": [{ "word": "cede", "meaning": "nhượng bộ" }, { "word": "precede", "meaning": "đi trước" }, { "word": "process", "meaning": "quá trình" }] }
    }
  },
  {
    "id": "v485",
    "word": "OPTIMISTIC",
    "ipa": "ˌɒptɪˈmɪstɪk",
    "elo": 840,
    "level": "beginner",
    "scenario": "Bị từ chối lần thứ ba mà nó vẫn OPTIMISTIC, bảo crush đang test độ kiên trì, delulu cỡ này là có hệ thống.",
    "translationHint": "Lạc quan",
    "upgradeModule": {
      "simpleSentence": "He is very positive about the new project.",
      "targetSlot": "positive",
      "academicOptions": [
        { "text": "cautiously optimistic", "nuance": "Lạc quan một cách thận trọng.", "formalityScore": 9 },
        { "text": "sanguine", "nuance": "Lạc quan, tràn đầy hy vọng (ngay cả khi khó khăn).", "formalityScore": 10 },
        { "text": "buoyant", "nuance": "Vui vẻ, sôi nổi, dễ phục hồi tinh thần.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "optim-", "meaning": "tốt nhất (best)", "relatedWords": [{ "word": "optimum", "meaning": "tối ưu" }, { "word": "optimize", "meaning": "tối ưu hóa" }] },
      "suffix": { "text": "-istic", "meaning": "thuộc về niềm tin/đặc điểm", "relatedWords": [] }
    }
  },
  {
    "id": "v486",
    "word": "PARTIAL",
    "ipa": "ˈpɑːʃl",
    "elo": 830,
    "level": "beginner",
    "scenario": "Mẹ PARTIAL với con mèo ra mặt: nó làm vỡ ly thì là bé ngoan, tôi làm vỡ thì là báo thủ.",
    "translationHint": "Một phần, thiên vị",
    "upgradeModule": {
      "simpleSentence": "The results were only a small success.",
      "targetSlot": "small",
      "academicOptions": [
        { "text": "partial results", "nuance": "Kết quả bước đầu/chưa đầy đủ.", "formalityScore": 8 },
        { "text": "fragmentary", "nuance": "Rời rạc, gồm nhiều mảnh nhỏ.", "formalityScore": 10 },
        { "text": "biased", "nuance": "Thiên vị (một nghĩa khác của partial).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "part-", "meaning": "phần (part)", "relatedWords": [{ "word": "partition", "meaning": "vách ngăn" }, { "word": "impartial", "meaning": "công bằng (không đứng về phe nào)" }, { "word": "particle", "meaning": "hạt nhỏ" }] }
    }
  },
  {
    "id": "v487",
    "word": "QUICKLY",
    "ipa": "ˈkwɪkli",
    "elo": 800,
    "level": "beginner",
    "scenario": "Thấy tin 'tới cổng rồi' là tôi trang điểm QUICKLY như đang thi chạy, ra tới nơi mới biết quên kẻ một bên mày, ét o ét.",
    "translationHint": "Nhanh chóng",
    "upgradeModule": {
      "simpleSentence": "The technology is changing very fast.",
      "targetSlot": "very fast",
      "academicOptions": [
        { "text": "rapidly evolving", "nuance": "Phát triển một cách nhanh chóng và mạnh mẽ.", "formalityScore": 9 },
        { "text": "swiftly", "nuance": "Nhanh nhẹn, không chậm trễ.", "formalityScore": 8 },
        { "text": "expeditiously", "nuance": "Khẩn trương và hiệu quả (thường dùng trong công việc).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "quick-", "meaning": "sống/nhanh (alive/swift - nghĩa gốc là còn sống, cử động nhanh)", "relatedWords": [{ "word": "quicken", "meaning": "làm nhanh thêm" }] }
    }
  },
  {
    "id": "v488",
    "word": "REACTION",
    "ipa": "riˈækʃn",
    "elo": 820,
    "level": "beginner",
    "scenario": "REACTION của ba khi thấy tôi nhuộm tóc hồng: im lặng ba giây, rồi hỏi có đổi lại được khum.",
    "translationHint": "Phản ứng",
    "upgradeModule": {
      "simpleSentence": "What was his answer to your question?",
      "targetSlot": "answer",
      "academicOptions": [
        { "text": "immediate response", "nuance": "Sự phản hồi ngay lập tức.", "formalityScore": 8 },
        { "text": "backlash", "nuance": "Sự phản đối dữ dội từ cộng đồng.", "formalityScore": 10 },
        { "text": "reflex", "nuance": "Phản xạ tự nhiên.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "re-", "meaning": "ngược lại", "relatedWords": [] },
      "root": { "text": "act-", "meaning": "làm (to do)", "relatedWords": [{ "word": "activate", "meaning": "kích hoạt" }, { "word": "transaction", "meaning": "giao dịch" }] }
    }
  },
  {
    "id": "v489",
    "word": "SIGNIFICANT",
    "ipa": "sɪɡˈnɪfɪkənt",
    "elo": 850,
    "level": "beginner",
    "scenario": "Đổi từ trà sữa full topping sang ít đường là bước tiến SIGNIFICANT, ít nhất tôi tự thấy mình slay.",
    "translationHint": "Quan trọng, đáng kể",
    "upgradeModule": {
      "simpleSentence": "There is a big difference between the two products.",
      "targetSlot": "big",
      "academicOptions": [
        { "text": "significant disparity", "nuance": "Sự chênh lệch đáng kể và quan trọng.", "formalityScore": 9 },
        { "text": "substantial", "nuance": "Lớn lao, có giá trị thực chất.", "formalityScore": 8 },
        { "text": "considerable", "nuance": "Đáng kể (về lượng hoặc mức độ).", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "sign-", "meaning": "dấu hiệu/đánh dấu (mark)", "relatedWords": [{ "word": "signal", "meaning": "tín hiệu" }, { "word": "signature", "meaning": "chữ ký" }] },
      "suffix": { "text": "-fic", "meaning": "làm (to make)", "relatedWords": [] }
    }
  },
  {
    "id": "v490",
    "word": "TOLERATE",
    "ipa": "ˈtɒləreɪt",
    "elo": 855,
    "level": "beginner",
    "scenario": "Tôi TOLERATE được bạn cùng phòng ngáy, hát karaoke nửa đêm, nhưng ăn vụng mì của tôi là tới công chuyện.",
    "translationHint": "Chịu đựng, tha thứ",
    "upgradeModule": {
      "simpleSentence": "I can't put up with his bad temper anymore.",
      "targetSlot": "put up with",
      "academicOptions": [
        { "text": "tolerate the behavior", "nuance": "Chịu đựng hành vi một cách nhẫn nhịn.", "formalityScore": 8 },
        { "text": "endure", "nuance": "Cam chịu, chịu đựng gian khổ lâu dài.", "formalityScore": 9 },
        { "text": "brook", "nuance": "Chịu đựng (thường dùng trong phủ định, rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "toler-", "meaning": "chịu đựng/gánh vác (to bear/endure)", "relatedWords": [{ "word": "tolerable", "meaning": "có thể chịu được" }, { "word": "intolerant", "meaning": "không khoan dung" }] }
    }
  },
  {
    "id": "v491",
    "word": "UTILIZE",
    "ipa": "ˈjuːtɪlaɪz",
    "elo": 860,
    "level": "beginner",
    "scenario": "Nhỏ bạn UTILIZE tối đa voucher, freeship với xu, đơn hai trăm nghìn mà chỉ trả ba chục, đúng là out trình.",
    "translationHint": "Tận dụng, sử dụng",
    "upgradeModule": {
      "simpleSentence": "We should use all the available tools.",
      "targetSlot": "use",
      "academicOptions": [
        { "text": "effectively utilize", "nuance": "Tận dụng một cách hiệu quả các nguồn lực.", "formalityScore": 9 },
        { "text": "harness", "nuance": "Khai thác sức mạnh (thường dùng cho tiềm năng).", "formalityScore": 10 },
        { "text": "employ", "nuance": "Sử dụng (phương pháp/nhân lực).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "uti-", "meaning": "sử dụng (to use)", "relatedWords": [{ "word": "utility", "meaning": "tiện ích" }, { "word": "usury", "meaning": "cho vay nặng lãi (dùng tiền sai cách)" }] }
    }
  },
  {
    "id": "v492",
    "word": "VALID",
    "ipa": "ˈvælɪd",
    "elo": 840,
    "level": "beginner",
    "scenario": "Xin nghỉ vì đau bụng là lý do VALID, nhưng lỡ đăng ảnh check-in quán lẩu cùng ngày thì hết cứu.",
    "translationHint": "Hợp lệ, có cơ sở",
    "upgradeModule": {
      "simpleSentence": "Is your ticket still good for today?",
      "targetSlot": "good",
      "academicOptions": [
        { "text": "valid justification", "nuance": "Lý do chính đáng và có cơ sở.", "formalityScore": 9 },
        { "text": "legitimate", "nuance": "Hợp pháp, chính đáng.", "formalityScore": 9 },
        { "text": "sound", "nuance": "Vững chãi, logic (sound logic).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "val-", "meaning": "mạnh mẽ/giá trị (strong/worth)", "relatedWords": [{ "word": "value", "meaning": "giá trị" }, { "word": "prevail", "meaning": "chiếm ưu thế" }] }
    }
  },
  {
    "id": "v493",
    "word": "WONDER",
    "ipa": "ˈwʌndə(r)",
    "elo": 810,
    "level": "beginner",
    "scenario": "Lướt TikTok lúc 3 giờ sáng, tôi WONDER sao mình thuộc công thức làm bánh mà vẫn không biết nấu cơm, hết cứu.",
    "translationHint": "Tự hỏi, băn khoăn",
    "upgradeModule": {
      "simpleSentence": "I am thinking about why he left early.",
      "targetSlot": "thinking about why",
      "academicOptions": [
        { "text": "pondering the reasons", "nuance": "Suy ngẫm kỹ về các lý do.", "formalityScore": 9 },
        { "text": "speculate", "nuance": "Suy đoán, đưa ra giả thuyết.", "formalityScore": 9 },
        { "text": "query", "nuance": "Đặt câu hỏi nghi vấn.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "wonder", "meaning": "kinh ngạc (từ gốc tiếng Anh cổ 'wundor')", "relatedWords": [{ "word": "wonderful", "meaning": "tuyệt vời" }] }
    }
  },
  {
    "id": "v494",
    "word": "ADMIT",
    "ipa": "ədˈmɪt",
    "elo": 865,
    "level": "beginner",
    "scenario": "Cãi nhau cả buổi về đường đi, cuối cùng nó ADMIT là mở nhầm bản đồ, lúc đó cả nhóm đã lạc sang tỉnh khác, tới công chuyện.",
    "translationHint": "Thừa nhận",
    "upgradeModule": {
      "simpleSentence": "He agreed that he made a mistake.",
      "targetSlot": "agreed",
      "academicOptions": [
        { "text": "admit liability", "nuance": "Thừa nhận trách nhiệm pháp lý.", "formalityScore": 10 },
        { "text": "concede", "nuance": "Thừa nhận (thường là miễn cưỡng).", "formalityScore": 9 },
        { "text": "acknowledge", "nuance": "Công nhận sự thật.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad-", "meaning": "đến/hướng tới", "relatedWords": [] },
      "root": { "text": "mit-", "meaning": "gửi đi (to send - nghĩa gốc là cho phép gửi đi hoặc cho phép vào)", "relatedWords": [{ "word": "mission", "meaning": "nhiệm vụ" }, { "word": "submit", "meaning": "nộp/khuất phục" }, { "word": "dismiss", "meaning": "sa thải" }] }
    }
  },
  {
    "id": "v495",
    "word": "BORING",
    "ipa": "ˈbɔːrɪŋ",
    "elo": 800,
    "level": "beginner",
    "scenario": "Phim được review đỉnh nóc kịch trần mà BORING tới mức tôi ngủ gật, tỉnh dậy nhân vật vẫn đang ngồi uống trà.",
    "translationHint": "Buồn chán",
    "upgradeModule": {
      "simpleSentence": "The movie was not interesting at all.",
      "targetSlot": "not interesting",
      "academicOptions": [
        { "text": "monotonous", "nuance": "Đơn điệu, đều đều gây buồn chán.", "formalityScore": 9 },
        { "text": "tedious", "nuance": "Nhàm chán vì quá dài và chi tiết.", "formalityScore": 8 },
        { "text": "insipid", "nuance": "Nhạt nhẽo, thiếu sức sống.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "bore", "meaning": "khoan/đục (làm cho ai đó thấy mệt mỏi như bị khoan vào người)", "relatedWords": [] }
    }
  },
  {
    "id": "v496",
    "word": "COMPLAIN",
    "ipa": "kəmˈpleɪn",
    "elo": 820,
    "level": "beginner",
    "scenario": "Cả phòng COMPLAIN wifi chậm suốt ba tuần, tới khi check var mới phát hiện phòng bên đang ké mạng để cày phim.",
    "translationHint": "Than phiền, phàn nàn",
    "upgradeModule": {
      "simpleSentence": "The customers said they were unhappy with the service.",
      "targetSlot": "said they were unhappy",
      "academicOptions": [
        { "text": "lodge a complaint", "nuance": "Đưa ra lời khiếu nại chính thức.", "formalityScore": 10 },
        { "text": "grumble", "nuance": "Càu nhàu, lầm bầm.", "formalityScore": 6 },
        { "text": "remonstrate", "nuance": "Phản đối, than phiền (rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "com-", "meaning": "hoàn toàn", "relatedWords": [] },
      "root": { "text": "plangere-", "meaning": "đánh vào ngực (to strike one's breast - biểu hiện của sự đau khổ/than khóc)", "relatedWords": [{ "word": "plaintive", "meaning": "than vãn/u sầu" }] }
    }
  },
  {
    "id": "v497",
    "word": "DOUBT",
    "ipa": "daʊt",
    "elo": 855,
    "level": "beginner",
    "scenario": "Áo hiệu giá 99 nghìn kèm freeship, tôi DOUBT ngay, rồi vẫn chốt đơn vì lỡ nó real thì sao.",
    "translationHint": "Nghi ngờ",
    "upgradeModule": {
      "simpleSentence": "I am not sure if he is telling the truth.",
      "targetSlot": "not sure",
      "academicOptions": [
        { "text": "harbor doubts", "nuance": "Nuôi dưỡng sự nghi ngờ trong lòng.", "formalityScore": 9 },
        { "text": "skeptical", "nuance": "Hoài nghi (đòi hỏi bằng chứng).", "formalityScore": 8 },
        { "text": "dubious", "nuance": "Mơ hồ, đáng ngờ.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "dub-", "meaning": "hai (two - nghĩa gốc là phân vân giữa hai lựa chọn)", "relatedWords": [{ "word": "double", "meaning": "gấp đôi" }, { "word": "duplicity", "meaning": "sự hai mặt" }] }
    }
  },
  {
    "id": "v498",
    "word": "EAGER",
    "ipa": "ˈiːɡə(r)",
    "elo": 920,
    "level": "intermediate",
    "scenario": "Nghe có quán trà sữa mới gần trường, cả lớp fomo, EAGER rủ nhau đi, tới nơi thì hàng dài hơn cả hàng đăng ký tín chỉ.",
    "translationHint": "Háo hức, hăm hở",
    "upgradeModule": {
      "simpleSentence": "The students want to learn more.",
      "targetSlot": "want to",
      "academicOptions": [
        { "text": "be eager to", "nuance": "Háo hức muốn làm gì đó.", "formalityScore": 7 },
        { "text": "keen to", "nuance": "Hăng hái, nhiệt tình.", "formalityScore": 8 },
        { "text": "enthusiastic about", "nuance": "Nhiệt huyết về cái gì đó.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "acer-", "meaning": "sắc/nhọn/chua (sharp - nghĩa gốc là tinh thần sắc bén, nôn nóng)", "relatedWords": [{ "word": "acid", "meaning": "axit" }, { "word": "acute", "meaning": "cấp tính/sắc bén" }] }
    }
  },
  {
    "id": "v499",
    "word": "FORCE",
    "ipa": "fɔːs",
    "elo": 840,
    "level": "beginner",
    "scenario": "Hồi nhỏ mẹ FORCE tôi đi học bơi, giờ đi biển tôi là đứa duy nhất không phải ôm phao chụp hình, flex nhẹ.",
    "translationHint": "Ép buộc",
    "upgradeModule": {
      "simpleSentence": "The weather made them stay inside.",
      "targetSlot": "made them",
      "academicOptions": [
        { "text": "force someone to", "nuance": "Ép buộc ai đó làm gì.", "formalityScore": 7 },
        { "text": "compel", "nuance": "Bắt buộc (do hoàn cảnh/luật lệ).", "formalityScore": 10 },
        { "text": "coerce", "nuance": "Cưỡng bức, đe dọa để ép buộc.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "fort-", "meaning": "mạnh mẽ (strong)", "relatedWords": [{ "word": "fort", "meaning": "pháo đài" }, { "word": "fortify", "meaning": "làm mạnh thêm" }, { "word": "comfort", "meaning": "an ủi (làm cho mạnh mẽ lên)" }] }
    }
  },
  {
    "id": "v500",
    "word": "GATHER",
    "ipa": "ˈɡæðə(r)",
    "elo": 830,
    "level": "beginner",
    "scenario": "Cả xóm trọ GATHER trước phòng số 3 lúc nửa đêm, tưởng hóng biến, hóa ra chủ phòng đang nấu mì cay.",
    "translationHint": "Tụ họp, tập hợp",
    "upgradeModule": {
      "simpleSentence": "The scientist collected a lot of data.",
      "targetSlot": "collected",
      "academicOptions": [
        { "text": "gather information", "nuance": "Thu thập thông tin.", "formalityScore": 8 },
        { "text": "accumulate", "nuance": "Tích lũy dần dần qua thời gian.", "formalityScore": 9 },
        { "text": "assemble", "nuance": "Lắp ráp/tập hợp các bộ phận lại.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "gader-", "meaning": "cùng nhau (together - từ gốc tiếng Đức cổ)", "relatedWords": [{ "word": "together", "meaning": "cùng nhau" }] }
    }
  },
  {
    "id": "v501",
    "word": "HARDLY",
    "ipa": "ˈhɑːdli",
    "elo": 815,
    "level": "beginner",
    "scenario": "Từ hồi đi làm năm nhất, tôi HARDLY thấy mặt trời, đi lúc trời chưa sáng, về thì đèn đường đã bật, chằm zn.",
    "translationHint": "Hầu như không",
    "upgradeModule": {
      "simpleSentence": "I almost never see him these days.",
      "targetSlot": "almost never",
      "academicOptions": [
        { "text": "hardly ever", "nuance": "Hầu như không bao giờ.", "formalityScore": 7 },
        { "text": "scarcely", "nuance": "Vừa vặn mới đủ/hiếm khi (rất trang trọng).", "formalityScore": 10 },
        { "text": "seldom", "nuance": "Ít khi.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "hard", "meaning": "khó khăn (nghĩa gốc là làm một việc gì đó khó khăn đến mức suýt soát mới xong)", "relatedWords": [] }
    }
  },
  {
    "id": "v502",
    "word": "IMAGINE",
    "ipa": "ɪˈmædʒɪn",
    "elo": 805,
    "level": "beginner",
    "scenario": "Ngồi IMAGINE cảnh crush rep tin nhắn trong năm phút, delulu thôi, thực tế là rep sau năm ngày bằng một cái like.",
    "translationHint": "Tưởng tượng",
    "upgradeModule": {
      "simpleSentence": "Try to think of a world without war.",
      "targetSlot": "think of",
      "academicOptions": [
        { "text": "envision", "nuance": "Hình dung về một tương lai hoặc khả năng.", "formalityScore": 10 },
        { "text": "conceive of", "nuance": "Hình thành ý niệm trong đầu.", "formalityScore": 10 },
        { "text": "visualize", "nuance": "Hình ảnh hóa trong tâm trí.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "imag-", "meaning": "hình ảnh/hình dáng (copy/likeness)", "relatedWords": [{ "word": "image", "meaning": "hình ảnh" }, { "word": "imitate", "meaning": "bắt chước" }] }
    }
  },
  {
    "id": "v503",
    "word": "KINDNESS",
    "ipa": "ˈkaɪndnəs",
    "elo": 820,
    "level": "beginner",
    "scenario": "Cô bán xôi đầu hẻm biết tôi ở trọ một mình nên hay cho thêm trứng, KINDNESS kiểu này chữa lành cả dạ dày lẫn tâm hồn.",
    "translationHint": "Lòng tốt, sự tử tế",
    "upgradeModule": {
      "simpleSentence": "We should show love to everyone.",
      "targetSlot": "love",
      "academicOptions": [
        { "text": "act of kindness", "nuance": "Hành động tử tế.", "formalityScore": 8 },
        { "text": "benevolence", "nuance": "Lòng nhân từ.", "formalityScore": 10 },
        { "text": "compassion", "nuance": "Lòng trắc ẩn.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "kind", "meaning": "loại/giống (nghĩa gốc là đối xử tốt với những người cùng 'loại'/gia đình với mình)", "relatedWords": [{ "word": "kin", "meaning": "dòng tộc" }, { "word": "kindred", "meaning": "người thân" }] }
    }
  },
  {
    "id": "v504",
    "word": "LOOSE",
    "ipa": "luːs",
    "elo": 835,
    "level": "beginner",
    "scenario": "Cái ghế ở quán cà phê LOOSE từ chân tới lưng, ngồi chill mà như đang tập thăng bằng, u là trời.",
    "translationHint": "Lỏng, lỏng lẻo",
    "upgradeModule": {
      "simpleSentence": "The rules are very free.",
      "targetSlot": "free",
      "academicOptions": [
        { "text": "loose interpretation", "nuance": "Cách giải thích lỏng lẻo/phóng khoáng.", "formalityScore": 9 },
        { "text": "lax", "nuance": "Lỏng lẻo, thiếu nghiêm ngặt (thường mang nghĩa tiêu cực).", "formalityScore": 10 },
        { "text": "slapdash", "nuance": "Cẩu thả, làm cho xong chuyện.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "leus-", "meaning": "nới lỏng/phân rã (to loosen)", "relatedWords": [{ "word": "lose", "meaning": "mất" }, { "word": "release", "meaning": "thả ra" }] }
    }
  },
  {
    "id": "v505",
    "word": "MENTION",
    "ipa": "ˈmenʃn",
    "elo": 840,
    "level": "beginner",
    "scenario": "Lỡ MENTION người yêu cũ trong buổi họp lớp, cả bàn im bặt, rồi có đứa lặng lẽ mở story của người ta ra hóng biến.",
    "translationHint": "Đề cập đến",
    "upgradeModule": {
      "simpleSentence": "He said something about the meeting.",
      "targetSlot": "said something about",
      "academicOptions": [
        { "text": "mention briefly", "nuance": "Đề cập ngắn gọn.", "formalityScore": 8 },
        { "text": "allude to", "nuance": "Nói bóng gió, ám chỉ đến.", "formalityScore": 10 },
        { "text": "cite", "nuance": "Trích dẫn (làm bằng chứng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "men-", "meaning": "tâm trí (mind - nghĩa gốc là gọi cái gì đó vào tâm trí)", "relatedWords": [{ "word": "mental", "meaning": "thuộc về tâm trí" }, { "word": "memory", "meaning": "trí nhớ" }, { "word": "remind", "meaning": "nhắc nhở" }] }
    }
  },
  {
    "id": "v506",
    "word": "NOTICE",
    "ipa": "ˈnəʊtɪs",
    "elo": 810,
    "level": "beginner",
    "scenario": "Đổi avatar từ hôm qua, mẹ NOTICE trước cả crush, còn nhắn hỏi sao ảnh này con trông ốm thế, ok mom.",
    "translationHint": "Nhận ra, để ý thấy",
    "upgradeModule": {
      "simpleSentence": "Did you see the small change in the room?",
      "targetSlot": "see",
      "academicOptions": [
        { "text": "observe the discrepancy", "nuance": "Quan sát thấy sự khác biệt/sai lệch.", "formalityScore": 9 },
        { "text": "perceive", "nuance": "Nhận thức/cảm nhận được.", "formalityScore": 10 },
        { "text": "detect", "nuance": "Dò tìm/phát hiện ra (thường là thứ khó thấy).", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "not-", "meaning": "biết/đánh dấu (to know/mark)", "relatedWords": [{ "word": "note", "meaning": "ghi chú" }, { "word": "notable", "meaning": "đáng chú ý" }, { "word": "notorious", "meaning": "khét tiếng" }] }
    }
  },
  {
    "id": "v507",
    "word": "OFFER",
    "ipa": "ˈɒfə(r)",
    "elo": 850,
    "level": "beginner",
    "scenario": "Công ty OFFER lương cao hơn chỗ cũ 2 triệu, đọc kỹ thì thấy dòng 'sẵn sàng làm cuối tuần', red flag.",
    "translationHint": "Đề nghị, mời chào",
    "upgradeModule": {
      "simpleSentence": "The shop provided a big discount.",
      "targetSlot": "provided",
      "academicOptions": [
        { "text": "offer an incentive", "nuance": "Đưa ra một sự khuyến khích/ưu đãi.", "formalityScore": 9 },
        { "text": "tender", "nuance": "Đưa ra/nộp (thường dùng trong đấu thầu).", "formalityScore": 10 },
        { "text": "proffer", "nuance": "Chìa ra, đưa ra mời (rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob/of-", "meaning": "đến/trước mặt", "relatedWords": [] },
      "root": { "text": "fer-", "meaning": "mang/vác (to carry - nghĩa là mang cái gì đó đến trước mặt người khác)", "relatedWords": [{ "word": "transfer", "meaning": "chuyển giao" }, { "word": "refer", "meaning": "tham chiếu" }, { "word": "fertile", "meaning": "màu mỡ (mang lại nhiều quả)" }] }
    }
  },
  {
    "id": "v508",
    "word": "PERCEIVE",
    "ipa": "pəˈsiːv",
    "elo": 1010,
    "level": "intermediate",
    "scenario": "Ba mẹ PERCEIVE việc tôi làm content là ngồi chơi điện thoại cả ngày, nói real thì cũng đúng một nửa.",
    "translationHint": "Nhận thức, nhìn nhận",
    "upgradeModule": {
      "simpleSentence": "People think of him as a great leader.",
      "targetSlot": "think of him as",
      "academicOptions": [
        { "text": "perceive as", "nuance": "Nhìn nhận hoặc cảm nhận ai đó/cái gì đó theo một cách cụ thể.", "formalityScore": 9 },
        { "text": "regard as", "nuance": "Xem như là, coi là.", "formalityScore": 8 },
        { "text": "envisage", "nuance": "Hình dung, tưởng tượng ra.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "per-", "meaning": "hoàn toàn/xuyên suốt", "relatedWords": [] },
      "root": { "text": "ceive-", "meaning": "nắm lấy (to take/seize)", "relatedWords": [{ "word": "receive", "meaning": "nhận (lấy về)" }, { "word": "conceive", "meaning": "hình thành ý tưởng" }, { "word": "deceive", "meaning": "lừa dối (lấy đi niềm tin)" }] }
    }
  },
  {
    "id": "v509",
    "word": "QUALITY",
    "ipa": "ˈkwɒləti",
    "elo": 805,
    "level": "beginner",
    "scenario": "Mua áo khoác 70 nghìn mà đòi QUALITY như hàng hiệu, giặt lần đầu nó co lại thành áo của em bé.",
    "translationHint": "Chất lượng",
    "upgradeModule": {
      "simpleSentence": "The food in this restaurant is very good.",
      "targetSlot": "very good",
      "academicOptions": [
        { "text": "superior quality", "nuance": "Chất lượng vượt trội, cao cấp.", "formalityScore": 9 },
        { "text": "premium", "nuance": "Hạng sang, chất lượng cao đi kèm giá cao.", "formalityScore": 8 },
        { "text": "excellence", "nuance": "Sự xuất sắc, ưu tú.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "qual-", "meaning": "như thế nào (of what sort)", "relatedWords": [{ "word": "qualify", "meaning": "đủ tiêu chuẩn (xác định chất lượng)" }] }
    }
  },
  {
    "id": "v510",
    "word": "RECOGNIZE",
    "ipa": "ˈrekəɡnaɪz",
    "elo": 875,
    "level": "beginner",
    "scenario": "Cắt tóc mái xong đi học, bác bảo vệ không RECOGNIZE nổi tôi, đòi xem thẻ sinh viên.",
    "translationHint": "Nhận ra",
    "upgradeModule": {
      "simpleSentence": "The company said his hard work was good.",
      "targetSlot": "said his hard work was good",
      "academicOptions": [
        { "text": "acknowledge his contribution", "nuance": "Ghi nhận đóng góp của anh ấy.", "formalityScore": 9 },
        { "text": "identify", "nuance": "Nhận dạng, xác định.", "formalityScore": 8 },
        { "text": "commend", "nuance": "Khen ngợi/tuyên dương chính thức.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "re-", "meaning": "lại một lần nữa", "relatedWords": [] },
      "root": { "text": "cogn-", "meaning": "biết (to know - nghĩa là 'biết lại' một thứ đã từng biết)", "relatedWords": [{ "word": "cognitive", "meaning": "nhận thức" }, { "word": "incognito", "meaning": "ẩn danh (không cho biết)" }] }
    }
  },
  {
    "id": "v511",
    "word": "SENSITIVE",
    "ipa": "ˈsensətɪv",
    "elo": 935,
    "level": "intermediate",
    "scenario": "Răng tôi SENSITIVE tới mức uống trà đá phải nhai một bên, cắn kem một miếng là xỉu ngang.",
    "translationHint": "Nhạy cảm",
    "upgradeModule": {
      "simpleSentence": "He is very easily hurt by what people say.",
      "targetSlot": "easily hurt",
      "academicOptions": [
        { "text": "highly sensitive", "nuance": "Cực kỳ nhạy cảm, dễ bị tác động.", "formalityScore": 8 },
        { "text": "susceptible", "nuance": "Dễ bị ảnh hưởng/tác động (thường là tiêu cực).", "formalityScore": 10 },
        { "text": "vulnerable", "nuance": "Dễ bị tổn thương.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "sens/sent-", "meaning": "cảm nhận/cảm xúc (to feel)", "relatedWords": [{ "word": "sense", "meaning": "giác quan" }, { "word": "sentiment", "meaning": "tình cảm" }, { "word": "consensus", "meaning": "sự đồng lòng" }] }
    }
  },
  {
    "id": "v512",
    "word": "TRUSTWORTHY",
    "ipa": "ˈtrʌstwɜːði",
    "elo": 925,
    "level": "intermediate",
    "scenario": "Gửi mèo cho đứa TRUSTWORTHY nhất nhóm trông ba ngày, về thì mèo béo lên, còn nó lowkey thành fan cứng của con mèo.",
    "translationHint": "Đáng tin cậy",
    "upgradeModule": {
      "simpleSentence": "She is a very honest person who you can trust.",
      "targetSlot": "person who you can trust",
      "academicOptions": [
        { "text": "reliable", "nuance": "Đáng tin cậy (dựa trên hiệu quả thực tế).", "formalityScore": 8 },
        { "text": "dependable", "nuance": "Có thể dựa dẫm được.", "formalityScore": 7 },
        { "text": "credible", "nuance": "Đáng tin (thường dùng cho nguồn tin/lời giải thích).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "trust", "meaning": "tin tưởng", "relatedWords": [] },
      "root2": { "text": "worth-", "meaning": "giá trị/xứng đáng", "relatedWords": [{ "word": "worthy", "meaning": "xứng đáng" }] }
    }
  },
  {
    "id": "v513",
    "word": "UNEXPECTED",
    "ipa": "ˌʌnɪkˈspektɪd",
    "elo": 850,
    "level": "beginner",
    "scenario": "Điều UNEXPECTED nhất buổi hẹn đầu: nguyên lớp đại học ngồi ngay bàn bên ăn cơm chó, có đứa còn vẫy tay chào.",
    "translationHint": "Bất ngờ, không mong đợi",
    "upgradeModule": {
      "simpleSentence": "The rain was a surprise to us.",
      "targetSlot": "surprise",
      "academicOptions": [
        { "text": "unforeseen circumstance", "nuance": "Một tình huống không thể dự đoán trước được.", "formalityScore": 9 },
        { "text": "abrupt", "nuance": "Đột ngột, bất ngờ (đôi khi hơi thô lỗ).", "formalityScore": 8 },
        { "text": "fortuitous", "nuance": "Tình cờ, may mắn bất ngờ.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "un-", "meaning": "không", "relatedWords": [] },
      "root": { "text": "spect-", "meaning": "nhìn (nghĩa là 'không nhìn thấy trước được')", "relatedWords": [{ "word": "spectacle", "meaning": "quang cảnh" }, { "word": "inspect", "meaning": "thanh tra" }] }
    }
  },
  {
    "id": "v514",
    "word": "VALUABLE",
    "ipa": "ˈvæljuəbl",
    "elo": 855,
    "level": "beginner",
    "scenario": "Món đồ VALUABLE nhất phòng trọ không phải laptop, mà là cái quạt duy nhất còn chịu quay đủ ba số, keo lỳ.",
    "translationHint": "Quý giá, có giá trị",
    "upgradeModule": {
      "simpleSentence": "This watch is very expensive.",
      "targetSlot": "expensive",
      "academicOptions": [
        { "text": "precious", "nuance": "Quý báu (giá trị tinh thần).", "formalityScore": 9 },
        { "text": "inestimable", "nuance": "Không thể ước lượng được (giá trị quá lớn).", "formalityScore": 10 },
        { "text": "noteworthy", "nuance": "Đáng chú ý/có giá trị ghi nhận.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "val-", "meaning": "mạnh mẽ/giá trị", "relatedWords": [{ "word": "valid", "meaning": "hợp lệ" }, { "word": "valor", "meaning": "dũng cảm" }] }
    }
  },
  {
    "id": "v515",
    "word": "WILLING",
    "ipa": "ˈwɪlɪŋ",
    "elo": 830,
    "level": "beginner",
    "scenario": "Ai cần người xếp hàng mua vé concert, tôi WILLING liền, chỉ cần bao một ly trà chanh với cho sạc ké điện thoại, gét gô.",
    "translationHint": "Sẵn lòng, tự nguyện",
    "upgradeModule": {
      "simpleSentence": "He is ready to help his neighbors.",
      "targetSlot": "ready",
      "academicOptions": [
        { "text": "willingness to cooperate", "nuance": "Sự sẵn lòng hợp tác.", "formalityScore": 8 },
        { "text": "amenable", "nuance": "Dễ bảo, sẵn lòng tuân theo.", "formalityScore": 10 },
        { "text": "inclined", "nuance": "Có xu hướng/muốn làm gì đó.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "will-", "meaning": "ý muốn", "relatedWords": [{ "word": "willpower", "meaning": "nghị lực" }] }
    }
  },
  {
    "id": "v516",
    "word": "ANNOYING",
    "ipa": "əˈnɔɪɪŋ",
    "elo": 820,
    "level": "beginner",
    "scenario": "Ủa alo, tiếng khoan tường nhà bên lúc 7 giờ sáng Chủ nhật ANNOYING kinh khủng, tôi nghi họ khoan thẳng vào giấc mơ của tôi.",
    "translationHint": "Làm phiền, gây khó chịu",
    "upgradeModule": {
      "simpleSentence": "That sound is very bad.",
      "targetSlot": "bad",
      "academicOptions": [
        { "text": "exasperating", "nuance": "Làm bực mình đến phát điên.", "formalityScore": 10 },
        { "text": "irksome", "nuance": "Gây khó chịu, mệt mỏi.", "formalityScore": 9 },
        { "text": "vexing", "nuance": "Gây rắc rối, bực bội.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "in odio-", "meaning": "trong sự ghét bỏ (at enmity)", "relatedWords": [{ "word": "odious", "meaning": "ghê tởm" }, { "word": "enmity", "meaning": "sự thù hằn" }] }
    }
  },
  {
    "id": "v517",
    "word": "BELIEVABLE",
    "ipa": "bɪˈliːvəbl",
    "elo": 815,
    "level": "beginner",
    "scenario": "Story 'đang ôn bài nghiêm túc' sẽ BELIEVABLE hơn nếu góc ảnh không lộ cái tay cầm máy chơi game, check var là ra.",
    "translationHint": "Có thể tin được",
    "upgradeModule": {
      "simpleSentence": "His excuse sounds like it could be true.",
      "targetSlot": "sounds like it could be true",
      "academicOptions": [
        { "text": "plausible explanation", "nuance": "Lời giải thích hợp lý, đáng tin.", "formalityScore": 9 },
        { "text": "credible", "nuance": "Đáng tin cậy.", "formalityScore": 10 },
        { "text": "convincing", "nuance": "Có sức thuyết phục.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "believe-", "meaning": "tin tưởng/yêu quý", "relatedWords": [{ "word": "belief", "meaning": "niềm tin" }] }
    }
  },
  {
    "id": "v518",
    "word": "CONVENIENT",
    "ipa": "kənˈviːniənt",
    "elo": 820,
    "level": "beginner",
    "scenario": "Mua nồi chiên không dầu xong mới thấy CONVENIENT thật, giờ tôi chiên luôn cả bánh mì, trứng với nỗi buồn.",
    "translationHint": "Tiện lợi",
    "upgradeModule": {
      "simpleSentence": "The hotel location is very good for tourists.",
      "targetSlot": "good",
      "academicOptions": [
        { "text": "conveniently located", "nuance": "Vị trí thuận tiện.", "formalityScore": 8 },
        { "text": "advantageous", "nuance": "Có lợi thế.", "formalityScore": 10 },
        { "text": "expedient", "nuance": "Tiện lợi (thực dụng).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "con-", "meaning": "cùng nhau", "relatedWords": [] },
      "root": { "text": "ven-", "meaning": "đến (to come)", "relatedWords": [{ "word": "event", "meaning": "sự kiện" }, { "word": "venue", "meaning": "địa điểm" }] }
    }
  },
  {
    "id": "v519",
    "word": "DOUBT",
    "ipa": "daʊt",
    "elo": 855,
    "level": "beginner",
    "scenario": "Nó hứa mai trả tiền ăn lẩu, tôi DOUBT nhẹ, vì chữ mai của nó đã kéo dài từ học kỳ trước, red flag.",
    "translationHint": "Nghi ngờ",
    "upgradeModule": {
      "simpleSentence": "I am not sure if he is telling the truth.",
      "targetSlot": "not sure",
      "academicOptions": [
        { "text": "harbor doubts", "nuance": "Nuôi dưỡng sự nghi ngờ trong lòng.", "formalityScore": 9 },
        { "text": "skeptical", "nuance": "Hoài nghi (đòi hỏi bằng chứng).", "formalityScore": 8 },
        { "text": "dubious", "nuance": "Mơ hồ, đáng ngờ.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "dub-", "meaning": "hai (two - nghĩa gốc là phân vân giữa hai lựa chọn)", "relatedWords": [{ "word": "double", "meaning": "gấp đôi" }, { "word": "duplicity", "meaning": "sự hai mặt" }] }
    }
  },
  {
    "id": "v520",
    "word": "EFFICIENT",
    "ipa": "ɪˈfɪʃnt",
    "elo": 920,
    "level": "intermediate",
    "scenario": "Tôi học EFFICIENT nhất vào đêm trước hôm thi, nửa học kỳ gói gọn trong sáu tiếng và hai lon nước tăng lực, slay.",
    "translationHint": "Hiệu quả, năng suất",
    "upgradeModule": {
      "simpleSentence": "We need a faster way to finish the project.",
      "targetSlot": "faster way",
      "academicOptions": [
        { "text": "efficient methodology", "nuance": "Phương pháp luận tối ưu hóa thời gian và nguồn lực.", "formalityScore": 9 },
        { "text": "streamlined process", "nuance": "Quy trình được tinh gọn để tăng hiệu quả.", "formalityScore": 8 },
        { "text": "cost-effective", "nuance": "Hiệu quả về mặt chi phí.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ex/ef-", "meaning": "ra ngoài (out)", "relatedWords": [] },
      "root": { "text": "fic/fac-", "meaning": "làm (to do/make)", "relatedWords": [{ "word": "fiction", "meaning": "hư cấu" }, { "word": "deficient", "meaning": "thiếu hụt" }] }
    }
  },
  {
    "id": "v521",
    "word": "FRUSTRATED",
    "ipa": "frʌˈstreɪtɪd",
    "elo": 870,
    "level": "beginner",
    "scenario": "Canh săn vé concert từ 9 giờ, tới lượt thì web báo hết vé, FRUSTRATED tới mức muốn úp mặt vào bàn phím, kém miếng khó chịu.",
    "translationHint": "Bực bội, nản lòng",
    "upgradeModule": {
      "simpleSentence": "He feels bad because he can't solve the problem.",
      "targetSlot": "feels bad",
      "academicOptions": [
        { "text": "disheartened", "nuance": "Nản lòng, mất tinh thần.", "formalityScore": 9 },
        { "text": "exasperated", "nuance": "Bực tức đến cực độ.", "formalityScore": 10 },
        { "text": "thwarted", "nuance": "Bị ngăn cản, làm cho thất bại.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "frustra-", "meaning": "vô ích (in vain)", "relatedWords": [{ "word": "frustrate", "meaning": "làm hỏng kế hoạch" }] }
    }
  },
  {
    "id": "v522",
    "word": "GENUINE",
    "ipa": "ˈdʒenjuɪn",
    "elo": 880,
    "level": "beginner",
    "scenario": "Lời khen GENUINE nhất tôi từng nhận là của chú bán bánh mì: 'con ăn khỏe vậy chú bán vui'.",
    "translationHint": "Thật lòng, chân thành",
    "upgradeModule": {
      "simpleSentence": "Is this a real leather bag?",
      "targetSlot": "real",
      "academicOptions": [
        { "text": "authentic", "nuance": "Xác thực, có nguồn gốc đáng tin.", "formalityScore": 10 },
        { "text": "sincere", "nuance": "Chân thành (cho cảm xúc/lời nói).", "formalityScore": 8 },
        { "text": "bona fide", "nuance": "Thật sự, thiện chí (rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "gen-", "meaning": "sinh ra (birth/race)", "relatedWords": [{ "word": "gender", "meaning": "giới tính" }, { "word": "gene", "meaning": "gen di truyền" }] }
    }
  },
  {
    "id": "v523",
    "word": "HESITATE",
    "ipa": "ˈhezɪteɪt",
    "elo": 825,
    "level": "beginner",
    "scenario": "Thấy cái áo giảm 70% mà HESITATE đúng ba giây, quay lại thì hết size, fomo nguyên tuần.",
    "translationHint": "Do dự, ngập ngừng",
    "upgradeModule": {
      "simpleSentence": "Don't wait, just do it.",
      "targetSlot": "wait",
      "academicOptions": [
        { "text": "vacillate", "nuance": "Lưỡng lự, thay đổi ý kiến liên tục.", "formalityScore": 10 },
        { "text": "waver", "nuance": "Dao động, không kiên định.", "formalityScore": 9 },
        { "text": "pause", "nuance": "Tạm dừng lại.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "hes-", "meaning": "dính chặt/mắc kẹt (to stick)", "relatedWords": [{ "word": "adhere", "meaning": "dính vào" }, { "word": "coherent", "meaning": "mạch lạc" }] }
    }
  },
  {
    "id": "v524",
    "word": "INFLUENCE",
    "ipa": "ˈɪnfluəns",
    "elo": 915,
    "level": "intermediate",
    "scenario": "Một video review trên TikTok INFLUENCE tôi fomo mua máy làm sữa hạt, giờ nó là cái kệ để chìa khóa đắt nhất nhà.",
    "translationHint": "Ảnh hưởng, tác động",
    "upgradeModule": {
      "simpleSentence": "The leader had a big effect on the group.",
      "targetSlot": "big effect",
      "academicOptions": [
        { "text": "profound impact", "nuance": "Tác động sâu sắc.", "formalityScore": 10 },
        { "text": "leverage", "nuance": "Tận dụng lợi thế để gây ảnh hưởng.", "formalityScore": 10 },
        { "text": "sway", "nuance": "Thuyết phục, làm dao động ý kiến.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "vào trong", "relatedWords": [] },
      "root": { "text": "flu-", "meaning": "chảy (to flow)", "relatedWords": [{ "word": "fluid", "meaning": "chất lỏng" }, { "word": "fluent", "meaning": "trôi chảy" }, { "word": "affluent", "meaning": "giàu có" }] }
    }
  },
  {
    "id": "v525",
    "word": "JUDGE",
    "ipa": "dʒʌdʒ",
    "elo": 830,
    "level": "beginner",
    "scenario": "Mọi người hay JUDGE tôi vì mặc pijama đi siêu thị, chưa ai biết đó là bộ đồ đẹp nhất của tôi, slay.",
    "translationHint": "Đánh giá, phán xét",
    "upgradeModule": {
      "simpleSentence": "He looked at the work and gave his opinion.",
      "targetSlot": "gave his opinion",
      "academicOptions": [
        { "text": "critically evaluate", "nuance": "Đánh giá một cách có phê phán và hệ thống.", "formalityScore": 10 },
        { "text": "appraise", "nuance": "Thẩm định giá trị hoặc chất lượng.", "formalityScore": 9 },
        { "text": "assess", "nuance": "Đánh giá mức độ/tình hình.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "jus-", "meaning": "luật pháp (law)", "relatedWords": [{ "word": "justice", "meaning": "công lý" }, { "word": "jury", "meaning": "bồi thẩm đoàn" }] },
      "root2": { "text": "dic-", "meaning": "nói (to say)", "relatedWords": [{ "word": "dictate", "meaning": "mệnh lệnh" }] }
    }
  },
  {
    "id": "v526",
    "word": "LACK",
    "ipa": "læk",
    "elo": 810,
    "level": "beginner",
    "scenario": "Bài thuyết trình nhóm tôi chẳng LACK thứ gì, slide có, nhạc nền có, chỉ thiếu đứa dám đứng lên nói, toang.",
    "translationHint": "Thiếu hụt",
    "upgradeModule": {
      "simpleSentence": "There is not enough water in the village.",
      "targetSlot": "not enough",
      "academicOptions": [
        { "text": "dearth of", "nuance": "Sự khan hiếm trầm trọng.", "formalityScore": 10 },
        { "text": "deficiency", "nuance": "Sự thiếu hụt (về chất lượng hoặc thành phần).", "formalityScore": 9 },
        { "text": "scarcity", "nuance": "Sự ít ỏi, khó tìm.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "lack", "meaning": "khiếm khuyết/thiếu", "relatedWords": [] }
    }
  },
  {
    "id": "v527",
    "word": "MAINTAIN",
    "ipa": "meɪnˈteɪn",
    "elo": 865,
    "level": "beginner",
    "scenario": "MAINTAIN chuỗi học tiếng Anh 100 ngày liên tục, ngày 101 quên mở app, con cú xanh nhắn y như người yêu cũ, thao túng tâm lý.",
    "translationHint": "Duy trì, giữ vững",
    "upgradeModule": {
      "simpleSentence": "You should keep your car in good condition.",
      "targetSlot": "keep",
      "academicOptions": [
        { "text": "sustain", "nuance": "Duy trì sự tồn tại bền vững.", "formalityScore": 9 },
        { "text": "preserve", "nuance": "Bảo tồn, giữ gìn nguyên vẹn.", "formalityScore": 8 },
        { "text": "uphold", "nuance": "Giữ vững (tiêu chuẩn/luật lệ).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "man-", "meaning": "tay (hand)", "relatedWords": [{ "word": "manual", "meaning": "thủ công" }] },
      "root2": { "text": "tain-", "meaning": "giữ (to hold)", "relatedWords": [{ "word": "contain", "meaning": "chứa đựng" }] }
    }
  },
  {
    "id": "v528",
    "word": "NERVOUS",
    "ipa": "ˈnɜːvəs",
    "elo": 815,
    "level": "beginner",
    "scenario": "Ngày đầu đi làm NERVOUS tới mức cúi chào luôn cái tượng ở sảnh, đồng nghiệp thấy nhưng giả vờ không thấy.",
    "translationHint": "Lo lắng, hồi hộp",
    "upgradeModule": {
      "simpleSentence": "She felt worried before the interview.",
      "targetSlot": "worried",
      "academicOptions": [
        { "text": "apprehensive", "nuance": "E sợ điều gì đó không hay sắp tới.", "formalityScore": 9 },
        { "text": "anxious", "nuance": "Lo âu, bồn chồn.", "formalityScore": 8 },
        { "text": "jittery", "nuance": "Run rẩy, đứng ngồi không yên.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "nerv-", "meaning": "dây thần kinh/sức mạnh", "relatedWords": [{ "word": "nerve", "meaning": "thần kinh" }, { "word": "enervate", "meaning": "làm kiệt sức" }] }
    }
  },
  {
    "id": "v529",
    "word": "OPPORTUNITY",
    "ipa": "ˌɒpəˈtjuːnəti",
    "elo": 850,
    "level": "beginner",
    "scenario": "Crush rủ đi xem phim đúng hôm tôi sốt, OPPORTUNITY ngàn năm có một mà tôi nằm đắp chăn nhìn trần nhà, xu cà na.",
    "translationHint": "Cơ hội",
    "upgradeModule": {
      "simpleSentence": "This is a good chance to improve your skills.",
      "targetSlot": "good chance",
      "academicOptions": [
        { "text": "golden opportunity", "nuance": "Cơ hội ngàn vàng, cực kỳ hiếm.", "formalityScore": 8 },
        { "text": "prospect", "nuance": "Triển vọng, khả năng thành công trong tương lai.", "formalityScore": 9 },
        { "text": "opening", "nuance": "Một vị trí trống/kẽ hở cơ hội.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob-", "meaning": "hướng tới/đối diện", "relatedWords": [] },
      "root": { "text": "port-", "meaning": "cảng (harbor)", "relatedWords": [{ "word": "port", "meaning": "cảng" }, { "word": "transport", "meaning": "vận chuyển" }] }
    }
  },
  {
    "id": "v530",
    "word": "PREFER",
    "ipa": "prɪˈfɜː(r)",
    "elo": 820,
    "level": "beginner",
    "scenario": "Tối thứ Sáu tôi PREFER nằm nhà xem phim với gói snack hơn đi bar, nghe ô dề nhưng năm nay tôi chọn chữa lành.",
    "translationHint": "Thích hơn",
    "upgradeModule": {
      "simpleSentence": "I like tea more than coffee.",
      "targetSlot": "like",
      "academicOptions": [
        { "text": "have a preference for", "nuance": "Có sự ưu tiên/thiên vị cho cái gì.", "formalityScore": 8 },
        { "text": "favor", "nuance": "Ưu ái, ủng hộ cái gì hơn.", "formalityScore": 9 },
        { "text": "opt for", "nuance": "Lựa chọn (trong các phương án).", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "pre-", "meaning": "trước", "relatedWords": [] },
      "root": { "text": "fer-", "meaning": "mang/vác (to carry)", "relatedWords": [{ "word": "transfer", "meaning": "chuyển giao" }, { "word": "offer", "meaning": "đề nghị" }] }
    }
  },
  {
    "id": "v531",
    "word": "QUALITY",
    "ipa": "ˈkwɒləti",
    "elo": 805,
    "level": "beginner",
    "scenario": "Shop quảng cáo QUALITY cao cấp, nhận hàng thì cái túi da dính mưa một cái đã đổi sang màu khác, ủa alo.",
    "translationHint": "Chất lượng",
    "upgradeModule": {
      "simpleSentence": "The work is of a very high standard.",
      "targetSlot": "standard",
      "academicOptions": [
        { "text": "caliber", "nuance": "Tầm cỡ, năng lực (thường dùng cho con người).", "formalityScore": 10 },
        { "text": "excellence", "nuance": "Sự xuất sắc.", "formalityScore": 9 },
        { "text": "attribute", "nuance": "Thuộc tính, đặc điểm.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "qual-", "meaning": "thế nào/loại nào", "relatedWords": [{ "word": "qualify", "meaning": "đủ tiêu chuẩn" }] }
    }
  },
  {
    "id": "v532",
    "word": "RECOGNIZE",
    "ipa": "ˈrekəɡnaɪz",
    "elo": 875,
    "level": "beginner",
    "scenario": "Họp lớp sau 5 năm, tôi không RECOGNIZE nổi lớp trưởng, cho tới khi nó mở miệng nhắc đóng quỹ, ra đường tôi nể mỗi bạn.",
    "translationHint": "Nhận ra",
    "upgradeModule": {
      "simpleSentence": "The company said his hard work was good.",
      "targetSlot": "said his hard work was good",
      "academicOptions": [
        { "text": "acknowledge his contribution", "nuance": "Ghi nhận đóng góp của anh ấy.", "formalityScore": 9 },
        { "text": "identify", "nuance": "Nhận dạng, xác định.", "formalityScore": 8 },
        { "text": "commend", "nuance": "Khen ngợi/tuyên dương chính thức.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "re-", "meaning": "lại một lần nữa", "relatedWords": [] },
      "root": { "text": "cogn-", "meaning": "biết (to know)", "relatedWords": [{ "word": "cognitive", "meaning": "nhận thức" }, { "word": "incognito", "meaning": "ẩn danh" }] }
    }
  },
  {
    "id": "v533",
    "word": "URGENT",
    "ipa": "ˈɜːdʒənt",
    "elo": 845,
    "level": "beginner",
    "scenario": "Group chat bắn tin URGENT liên tục, vào hóng biến thì hóa ra cả bọn đang chọn quán lẩu tối nay.",
    "translationHint": "Khẩn cấp",
    "upgradeModule": {
      "simpleSentence": "This problem needs to be fixed right now.",
      "targetSlot": "needs to be fixed right now",
      "academicOptions": [
        { "text": "requires immediate attention", "nuance": "Yêu cầu sự chú ý ngay lập tức.", "formalityScore": 9 },
        { "text": "pressing", "nuance": "Cấp thiết, nhức nhối.", "formalityScore": 8 },
        { "text": "imperative", "nuance": "Bắt buộc, khẩn thiết yếu.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "urg-", "meaning": "thúc đẩy/ép (to press)", "relatedWords": [{ "word": "urge", "meaning": "thúc giục" }] }
    }
  },
  {
    "id": "v534",
    "word": "ADMIT",
    "ipa": "ədˈmɪt",
    "elo": 865,
    "level": "beginner",
    "scenario": "Tôi phải ADMIT là cái nồi cơm điện mẹ bắt mang lên trọ đã cứu tôi khỏi ăn mì cả tháng, ok mom.",
    "translationHint": "Thừa nhận",
    "upgradeModule": {
      "simpleSentence": "He agreed that he made a mistake.",
      "targetSlot": "agreed",
      "academicOptions": [
        { "text": "admit liability", "nuance": "Thừa nhận trách nhiệm pháp lý.", "formalityScore": 10 },
        { "text": "concede", "nuance": "Thừa nhận (thường là miễn cưỡng).", "formalityScore": 9 },
        { "text": "acknowledge", "nuance": "Công nhận sự thật.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad-", "meaning": "đến/hướng tới", "relatedWords": [] },
      "root": { "text": "mit-", "meaning": "gửi đi (to send)", "relatedWords": [{ "word": "mission", "meaning": "nhiệm vụ" }, { "word": "submit", "meaning": "nộp/khuất phục" }] }
    }
  },
  {
    "id": "v535",
    "word": "BORING",
    "ipa": "ˈbɔːrɪŋ",
    "elo": 800,
    "level": "beginner",
    "scenario": "Buổi đi chơi BORING nhất lowkey là hẹn nhau ra cà phê rồi mỗi đứa cắm mặt lướt điện thoại riêng ba tiếng.",
    "translationHint": "Buồn chán",
    "upgradeModule": {
      "simpleSentence": "The movie was not interesting at all.",
      "targetSlot": "not interesting",
      "academicOptions": [
        { "text": "monotonous", "nuance": "Đơn điệu, đều đều gây buồn chán.", "formalityScore": 9 },
        { "text": "tedious", "nuance": "Nhàm chán vì quá dài và chi tiết.", "formalityScore": 8 },
        { "text": "insipid", "nuance": "Nhạt nhẽo, thiếu sức sống.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "bore", "meaning": "khoan/đục", "relatedWords": [] }
    }
  },
  {
    "id": "v536",
    "word": "COMPLAIN",
    "ipa": "kəmˈpleɪn",
    "elo": 820,
    "level": "beginner",
    "scenario": "Nó COMPLAIN suốt về chuyện ế, tới khi có người rủ đi date thì bảo hôm đó bận giặt đồ, hết cứu.",
    "translationHint": "Than phiền, phàn nàn",
    "upgradeModule": {
      "simpleSentence": "The customers said they were unhappy with the service.",
      "targetSlot": "said they were unhappy",
      "academicOptions": [
        { "text": "lodge a complaint", "nuance": "Đưa ra lời khiếu nại chính thức.", "formalityScore": 10 },
        { "text": "grumble", "nuance": "Càu nhàu, lầm bầm.", "formalityScore": 6 },
        { "text": "remonstrate", "nuance": "Phản đối, than phiền (rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "com-", "meaning": "hoàn toàn", "relatedWords": [] },
      "root": { "text": "plangere-", "meaning": "đánh vào ngực (biểu hiện sự đau khổ)", "relatedWords": [{ "word": "plaintive", "meaning": "u sầu" }] }
    }
  },
  {
    "id": "v537",
    "word": "FORCE",
    "ipa": "fɔːs",
    "elo": 840,
    "level": "beginner",
    "scenario": "Bạn thân FORCE tôi nhảy trend TikTok cùng, quay 30 lần mới xong, clip nổi nhất lại là cảnh tôi té, u là trời.",
    "translationHint": "Ép buộc",
    "upgradeModule": {
      "simpleSentence": "The weather made them stay inside.",
      "targetSlot": "made them",
      "academicOptions": [
        { "text": "force someone to", "nuance": "Ép buộc ai đó làm gì.", "formalityScore": 7 },
        { "text": "compel", "nuance": "Bắt buộc (do hoàn cảnh/luật lệ).", "formalityScore": 10 },
        { "text": "coerce", "nuance": "Cưỡng bức, đe dọa để ép buộc.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "fort-", "meaning": "mạnh mẽ (strong)", "relatedWords": [{ "word": "fort", "meaning": "pháo đài" }, { "word": "fortify", "meaning": "củng cố" }] }
    }
  },
  {
    "id": "v538",
    "word": "HARDLY",
    "ipa": "ˈhɑːdli",
    "elo": 815,
    "level": "beginner",
    "scenario": "Mua máy chạy bộ về phòng trọ xong tôi HARDLY đụng tới, giờ nó là cây phơi đồ xịn nhất xóm, flex nhẹ.",
    "translationHint": "Hầu như không",
    "upgradeModule": {
      "simpleSentence": "I almost never see him these days.",
      "targetSlot": "almost never",
      "academicOptions": [
        { "text": "hardly ever", "nuance": "Hầu như không bao giờ.", "formalityScore": 7 },
        { "text": "scarcely", "nuance": "Vừa vặn mới đủ/hiếm khi (rất trang trọng).", "formalityScore": 10 },
        { "text": "seldom", "nuance": "Ít khi.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "hard", "meaning": "khó khăn", "relatedWords": [] }
    }
  },
  {
    "id": "v539",
    "word": "OFFER",
    "ipa": "ˈɒfə(r)",
    "elo": 850,
    "level": "beginner",
    "scenario": "Quán lẩu mới OFFER combo bốn người giá ba người, cả nhóm bỗng nhớ ra là lâu lắm rồi chưa gặp nhau, gét gô.",
    "translationHint": "Đề nghị, mời chào",
    "upgradeModule": {
      "simpleSentence": "The shop provided a big discount.",
      "targetSlot": "provided",
      "academicOptions": [
        { "text": "offer an incentive", "nuance": "Đưa ra một sự khuyến khích/ưu đãi.", "formalityScore": 9 },
        { "text": "tender", "nuance": "Đưa ra/nộp (thường dùng trong đấu thầu).", "formalityScore": 10 },
        { "text": "proffer", "nuance": "Chìa ra, đưa ra mời (rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob/of-", "meaning": "đến/trước mặt", "relatedWords": [] },
      "root": { "text": "fer-", "meaning": "mang/vác (to carry)", "relatedWords": [{ "word": "transfer", "meaning": "chuyển giao" }, { "word": "refer", "meaning": "tham chiếu" }] }
    }
  },
  {
    "id": "v540",
    "word": "NOTICE",
    "ipa": "ˈnəʊtɪs",
    "elo": 810,
    "level": "beginner",
    "scenario": "Bạn cùng bàn NOTICE tôi ngáp tới lần thứ mười, lặng lẽ đẩy qua một ly cà phê sữa đá, tình bạn đỉnh nóc kịch trần.",
    "translationHint": "Để ý thấy, nhận ra",
    "upgradeModule": {
      "simpleSentence": "Did you see the small change in the room?",
      "targetSlot": "see",
      "academicOptions": [
        { "text": "observe the discrepancy", "nuance": "Quan sát thấy sự khác biệt/sai lệch.", "formalityScore": 9 },
        { "text": "perceive", "nuance": "Nhận thức/cảm nhận được.", "formalityScore": 10 },
        { "text": "detect", "nuance": "Dò tìm/phát hiện ra.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "not-", "meaning": "biết/đánh dấu (to know/mark)", "relatedWords": [{ "word": "note", "meaning": "ghi chú" }, { "word": "notable", "meaning": "đáng chú ý" }] }
    }
  },
  {
    "id": "v511",
    "word": "SENSITIVE",
    "ipa": "ˈsensətɪv",
    "elo": 935,
    "level": "intermediate",
    "scenario": "Răng tôi SENSITIVE tới mức uống trà đá phải nhai một bên, cắn kem một miếng là xỉu ngang.",
    "translationHint": "Nhạy cảm",
    "upgradeModule": {
      "simpleSentence": "He is very easily hurt by what people say.",
      "targetSlot": "easily hurt",
      "academicOptions": [
        { "text": "highly sensitive", "nuance": "Cực kỳ nhạy cảm, dễ bị tác động.", "formalityScore": 8 },
        { "text": "susceptible", "nuance": "Dễ bị ảnh hưởng/tác động (thường là tiêu cực).", "formalityScore": 10 },
        { "text": "vulnerable", "nuance": "Dễ bị tổn thương.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "sens/sent-", "meaning": "cảm nhận/cảm xúc (to feel)", "relatedWords": [{ "word": "sense", "meaning": "giác quan" }, { "word": "sentiment", "meaning": "tình cảm" }, { "word": "consensus", "meaning": "sự đồng lòng" }] }
    }
  },
  {
    "id": "v512",
    "word": "TRUSTWORTHY",
    "ipa": "ˈtrʌstwɜːði",
    "elo": 925,
    "level": "intermediate",
    "scenario": "Gửi mèo cho đứa TRUSTWORTHY nhất nhóm trông ba ngày, về thì mèo béo lên, còn nó lowkey thành fan cứng của con mèo.",
    "translationHint": "Đáng tin cậy",
    "upgradeModule": {
      "simpleSentence": "She is a very honest person who you can trust.",
      "targetSlot": "person who you can trust",
      "academicOptions": [
        { "text": "reliable", "nuance": "Đáng tin cậy (dựa trên hiệu quả thực tế).", "formalityScore": 8 },
        { "text": "dependable", "nuance": "Có thể dựa dẫm được.", "formalityScore": 7 },
        { "text": "credible", "nuance": "Đáng tin (thường dùng cho nguồn tin/lời giải thích).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "trust", "meaning": "tin tưởng", "relatedWords": [] },
      "root2": { "text": "worth-", "meaning": "giá trị/xứng đáng", "relatedWords": [{ "word": "worthy", "meaning": "xứng đáng" }] }
    }
  },
  {
    "id": "v513",
    "word": "UNEXPECTED",
    "ipa": "ˌʌnɪkˈspektɪd",
    "elo": 850,
    "level": "beginner",
    "scenario": "Điều UNEXPECTED nhất buổi hẹn đầu: nguyên lớp đại học ngồi ngay bàn bên ăn cơm chó, có đứa còn vẫy tay chào.",
    "translationHint": "Bất ngờ, không mong đợi",
    "upgradeModule": {
      "simpleSentence": "The rain was a surprise to us.",
      "targetSlot": "surprise",
      "academicOptions": [
        { "text": "unforeseen circumstance", "nuance": "Một tình huống không thể dự đoán trước được.", "formalityScore": 9 },
        { "text": "abrupt", "nuance": "Đột ngột, bất ngờ (đôi khi hơi thô lỗ).", "formalityScore": 8 },
        { "text": "fortuitous", "nuance": "Tình cờ, may mắn bất ngờ.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "un-", "meaning": "không", "relatedWords": [] },
      "root": { "text": "spect-", "meaning": "nhìn (nghĩa là 'không nhìn thấy trước được')", "relatedWords": [{ "word": "spectacle", "meaning": "quang cảnh" }, { "word": "inspect", "meaning": "thanh tra" }] }
    }
  },
  {
    "id": "v514",
    "word": "VALUABLE",
    "ipa": "ˈvæljuəbl",
    "elo": 855,
    "level": "beginner",
    "scenario": "Món đồ VALUABLE nhất phòng trọ không phải laptop, mà là cái quạt duy nhất còn chịu quay đủ ba số, keo lỳ.",
    "translationHint": "Quý giá, có giá trị",
    "upgradeModule": {
      "simpleSentence": "This watch is very expensive.",
      "targetSlot": "expensive",
      "academicOptions": [
        { "text": "precious", "nuance": "Quý báu (giá trị tinh thần).", "formalityScore": 9 },
        { "text": "inestimable", "nuance": "Không thể ước lượng được (giá trị quá lớn).", "formalityScore": 10 },
        { "text": "noteworthy", "nuance": "Đáng chú ý/có giá trị ghi nhận.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "val-", "meaning": "mạnh mẽ/giá trị", "relatedWords": [{ "word": "valid", "meaning": "hợp lệ" }, { "word": "valor", "meaning": "dũng cảm" }] }
    }
  },
  {
    "id": "v515",
    "word": "WILLING",
    "ipa": "ˈwɪlɪŋ",
    "elo": 830,
    "level": "beginner",
    "scenario": "Ai cần người xếp hàng mua vé concert, tôi WILLING liền, chỉ cần bao một ly trà chanh với cho sạc ké điện thoại, gét gô.",
    "translationHint": "Sẵn lòng, tự nguyện",
    "upgradeModule": {
      "simpleSentence": "He is ready to help his neighbors.",
      "targetSlot": "ready",
      "academicOptions": [
        { "text": "willingness to cooperate", "nuance": "Sự sẵn lòng hợp tác.", "formalityScore": 8 },
        { "text": "amenable", "nuance": "Dễ bảo, sẵn lòng tuân theo.", "formalityScore": 10 },
        { "text": "inclined", "nuance": "Có xu hướng/muốn làm gì đó.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "will-", "meaning": "ý muốn", "relatedWords": [{ "word": "willpower", "meaning": "nghị lực" }] }
    }
  },
  {
    "id": "v516",
    "word": "ANNOYING",
    "ipa": "əˈnɔɪɪŋ",
    "elo": 820,
    "level": "beginner",
    "scenario": "Ủa alo, tiếng khoan tường nhà bên lúc 7 giờ sáng Chủ nhật ANNOYING kinh khủng, tôi nghi họ khoan thẳng vào giấc mơ của tôi.",
    "translationHint": "Làm phiền, gây khó chịu",
    "upgradeModule": {
      "simpleSentence": "That sound is very bad.",
      "targetSlot": "bad",
      "academicOptions": [
        { "text": "exasperating", "nuance": "Làm bực mình đến phát điên.", "formalityScore": 10 },
        { "text": "irksome", "nuance": "Gây khó chịu, mệt mỏi.", "formalityScore": 9 },
        { "text": "vexing", "nuance": "Gây rắc rối, bực bội.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "in odio-", "meaning": "trong sự ghét bỏ (at enmity)", "relatedWords": [{ "word": "odious", "meaning": "ghê tởm" }, { "word": "enmity", "meaning": "sự thù hằn" }] }
    }
  },
  {
    "id": "v517",
    "word": "BELIEVABLE",
    "ipa": "bɪˈliːvəbl",
    "elo": 815,
    "level": "beginner",
    "scenario": "Story 'đang ôn bài nghiêm túc' sẽ BELIEVABLE hơn nếu góc ảnh không lộ cái tay cầm máy chơi game, check var là ra.",
    "translationHint": "Có thể tin được",
    "upgradeModule": {
      "simpleSentence": "His excuse sounds like it could be true.",
      "targetSlot": "sounds like it could be true",
      "academicOptions": [
        { "text": "plausible explanation", "nuance": "Lời giải thích hợp lý, đáng tin.", "formalityScore": 9 },
        { "text": "credible", "nuance": "Đáng tin cậy.", "formalityScore": 10 },
        { "text": "convincing", "nuance": "Có sức thuyết phục.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "believe-", "meaning": "tin tưởng/yêu quý", "relatedWords": [{ "word": "belief", "meaning": "niềm tin" }] }
    }
  },
  {
    "id": "v518",
    "word": "CONVENIENT",
    "ipa": "kənˈviːniənt",
    "elo": 820,
    "level": "beginner",
    "scenario": "Mua nồi chiên không dầu xong mới thấy CONVENIENT thật, giờ tôi chiên luôn cả bánh mì, trứng với nỗi buồn.",
    "translationHint": "Tiện lợi",
    "upgradeModule": {
      "simpleSentence": "The hotel location is very good for tourists.",
      "targetSlot": "good",
      "academicOptions": [
        { "text": "conveniently located", "nuance": "Vị trí thuận tiện.", "formalityScore": 8 },
        { "text": "advantageous", "nuance": "Có lợi thế.", "formalityScore": 10 },
        { "text": "expedient", "nuance": "Tiện lợi (thực dụng).", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "con-", "meaning": "cùng nhau", "relatedWords": [] },
      "root": { "text": "ven-", "meaning": "đến (to come)", "relatedWords": [{ "word": "event", "meaning": "sự kiện" }, { "word": "venue", "meaning": "địa điểm" }] }
    }
  },
  {
    "id": "v519",
    "word": "DOUBT",
    "ipa": "daʊt",
    "elo": 855,
    "level": "beginner",
    "scenario": "Nó hứa mai trả tiền ăn lẩu, tôi DOUBT nhẹ, vì chữ mai của nó đã kéo dài từ học kỳ trước, red flag.",
    "translationHint": "Nghi ngờ",
    "upgradeModule": {
      "simpleSentence": "I am not sure if he is telling the truth.",
      "targetSlot": "not sure",
      "academicOptions": [
        { "text": "harbor doubts", "nuance": "Nuôi dưỡng sự nghi ngờ trong lòng.", "formalityScore": 9 },
        { "text": "skeptical", "nuance": "Hoài nghi (đòi hỏi bằng chứng).", "formalityScore": 8 },
        { "text": "dubious", "nuance": "Mơ hồ, đáng ngờ.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "dub-", "meaning": "hai (two - nghĩa gốc là phân vân giữa hai lựa chọn)", "relatedWords": [{ "word": "double", "meaning": "gấp đôi" }, { "word": "duplicity", "meaning": "sự hai mặt" }] }
    }
  },
  {
    "id": "v520",
    "word": "EFFICIENT",
    "ipa": "ɪˈfɪʃnt",
    "elo": 920,
    "level": "intermediate",
    "scenario": "Tôi học EFFICIENT nhất vào đêm trước hôm thi, nửa học kỳ gói gọn trong sáu tiếng và hai lon nước tăng lực, slay.",
    "translationHint": "Hiệu quả, năng suất",
    "upgradeModule": {
      "simpleSentence": "We need a faster way to finish the project.",
      "targetSlot": "faster way",
      "academicOptions": [
        { "text": "efficient methodology", "nuance": "Phương pháp luận tối ưu hóa thời gian và nguồn lực.", "formalityScore": 9 },
        { "text": "streamlined process", "nuance": "Quy trình được tinh gọn để tăng hiệu quả.", "formalityScore": 8 },
        { "text": "cost-effective", "nuance": "Hiệu quả về mặt chi phí.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ex/ef-", "meaning": "ra ngoài (out)", "relatedWords": [] },
      "root": { "text": "fic/fac-", "meaning": "làm (to do/make)", "relatedWords": [{ "word": "fiction", "meaning": "hư cấu" }, { "word": "deficient", "meaning": "thiếu hụt" }] }
    }
  },
  {
    "id": "v521",
    "word": "FRUSTRATED",
    "ipa": "frʌˈstreɪtɪd",
    "elo": 870,
    "level": "beginner",
    "scenario": "Canh săn vé concert từ 9 giờ, tới lượt thì web báo hết vé, FRUSTRATED tới mức muốn úp mặt vào bàn phím, kém miếng khó chịu.",
    "translationHint": "Bực bội, nản lòng",
    "upgradeModule": {
      "simpleSentence": "He feels bad because he can't solve the problem.",
      "targetSlot": "feels bad",
      "academicOptions": [
        { "text": "disheartened", "nuance": "Nản lòng, mất tinh thần.", "formalityScore": 9 },
        { "text": "exasperated", "nuance": "Bực tức đến cực độ.", "formalityScore": 10 },
        { "text": "thwarted", "nuance": "Bị ngăn cản, làm cho thất bại.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "frustra-", "meaning": "vô ích (in vain)", "relatedWords": [{ "word": "frustrate", "meaning": "làm hỏng kế hoạch" }] }
    }
  },
  {
    "id": "v522",
    "word": "GENUINE",
    "ipa": "ˈdʒenjuɪn",
    "elo": 880,
    "level": "beginner",
    "scenario": "Lời khen GENUINE nhất tôi từng nhận là của chú bán bánh mì: 'con ăn khỏe vậy chú bán vui'.",
    "translationHint": "Thật lòng, chân thành",
    "upgradeModule": {
      "simpleSentence": "Is this a real leather bag?",
      "targetSlot": "real",
      "academicOptions": [
        { "text": "authentic", "nuance": "Xác thực, có nguồn gốc đáng tin.", "formalityScore": 10 },
        { "text": "sincere", "nuance": "Chân thành (cho cảm xúc/lời nói).", "formalityScore": 8 },
        { "text": "bona fide", "nuance": "Thật sự, thiện chí (rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "gen-", "meaning": "sinh ra (birth/race)", "relatedWords": [{ "word": "gender", "meaning": "giới tính" }, { "word": "gene", "meaning": "gen di truyền" }] }
    }
  },
  {
    "id": "v523",
    "word": "HESITATE",
    "ipa": "ˈhezɪteɪt",
    "elo": 825,
    "level": "beginner",
    "scenario": "Thấy cái áo giảm 70% mà HESITATE đúng ba giây, quay lại thì hết size, fomo nguyên tuần.",
    "translationHint": "Do dự, ngập ngừng",
    "upgradeModule": {
      "simpleSentence": "Don't wait, just do it.",
      "targetSlot": "wait",
      "academicOptions": [
        { "text": "vacillate", "nuance": "Lưỡng lự, thay đổi ý kiến liên tục.", "formalityScore": 10 },
        { "text": "waver", "nuance": "Dao động, không kiên định.", "formalityScore": 9 },
        { "text": "pause", "nuance": "Tạm dừng lại.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "hes-", "meaning": "dính chặt/mắc kẹt (to stick)", "relatedWords": [{ "word": "adhere", "meaning": "dính vào" }, { "word": "coherent", "meaning": "mạch lạc" }] }
    }
  },
  {
    "id": "v524",
    "word": "INFLUENCE",
    "ipa": "ˈɪnfluəns",
    "elo": 915,
    "level": "intermediate",
    "scenario": "Một video review trên TikTok INFLUENCE tôi fomo mua máy làm sữa hạt, giờ nó là cái kệ để chìa khóa đắt nhất nhà.",
    "translationHint": "Ảnh hưởng, tác động",
    "upgradeModule": {
      "simpleSentence": "The leader had a big effect on the group.",
      "targetSlot": "big effect",
      "academicOptions": [
        { "text": "profound impact", "nuance": "Tác động sâu sắc.", "formalityScore": 10 },
        { "text": "leverage", "nuance": "Tận dụng lợi thế để gây ảnh hưởng.", "formalityScore": 10 },
        { "text": "sway", "nuance": "Thuyết phục, làm dao động ý kiến.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "in-", "meaning": "vào trong", "relatedWords": [] },
      "root": { "text": "flu-", "meaning": "chảy (to flow)", "relatedWords": [{ "word": "fluid", "meaning": "chất lỏng" }, { "word": "fluent", "meaning": "trôi chảy" }, { "word": "affluent", "meaning": "giàu có" }] }
    }
  },
  {
    "id": "v525",
    "word": "JUDGE",
    "ipa": "dʒʌdʒ",
    "elo": 830,
    "level": "beginner",
    "scenario": "Mọi người hay JUDGE tôi vì mặc pijama đi siêu thị, chưa ai biết đó là bộ đồ đẹp nhất của tôi, slay.",
    "translationHint": "Đánh giá, phán xét",
    "upgradeModule": {
      "simpleSentence": "He looked at the work and gave his opinion.",
      "targetSlot": "gave his opinion",
      "academicOptions": [
        { "text": "critically evaluate", "nuance": "Đánh giá một cách có phê phán và hệ thống.", "formalityScore": 10 },
        { "text": "appraise", "nuance": "Thẩm định giá trị hoặc chất lượng.", "formalityScore": 9 },
        { "text": "assess", "nuance": "Đánh giá mức độ/tình hình.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "jus-", "meaning": "luật pháp (law)", "relatedWords": [{ "word": "justice", "meaning": "công lý" }, { "word": "jury", "meaning": "bồi thẩm đoàn" }] },
      "root2": { "text": "dic-", "meaning": "nói (to say)", "relatedWords": [{ "word": "dictate", "meaning": "mệnh lệnh" }] }
    }
  },
  {
    "id": "v526",
    "word": "LACK",
    "ipa": "læk",
    "elo": 810,
    "level": "beginner",
    "scenario": "Bài thuyết trình nhóm tôi chẳng LACK thứ gì, slide có, nhạc nền có, chỉ thiếu đứa dám đứng lên nói, toang.",
    "translationHint": "Thiếu hụt",
    "upgradeModule": {
      "simpleSentence": "There is not enough water in the village.",
      "targetSlot": "not enough",
      "academicOptions": [
        { "text": "dearth of", "nuance": "Sự khan hiếm trầm trọng.", "formalityScore": 10 },
        { "text": "deficiency", "nuance": "Sự thiếu hụt (về chất lượng hoặc thành phần).", "formalityScore": 9 },
        { "text": "scarcity", "nuance": "Sự ít ỏi, khó tìm.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "lack", "meaning": "khiếm khuyết/thiếu", "relatedWords": [] }
    }
  },
  {
    "id": "v527",
    "word": "MAINTAIN",
    "ipa": "meɪnˈteɪn",
    "elo": 865,
    "level": "beginner",
    "scenario": "MAINTAIN chuỗi học tiếng Anh 100 ngày liên tục, ngày 101 quên mở app, con cú xanh nhắn y như người yêu cũ, thao túng tâm lý.",
    "translationHint": "Duy trì, giữ vững",
    "upgradeModule": {
      "simpleSentence": "You should keep your car in good condition.",
      "targetSlot": "keep",
      "academicOptions": [
        { "text": "sustain", "nuance": "Duy trì sự tồn tại bền vững.", "formalityScore": 9 },
        { "text": "preserve", "nuance": "Bảo tồn, giữ gìn nguyên vẹn.", "formalityScore": 8 },
        { "text": "uphold", "nuance": "Giữ vững (tiêu chuẩn/luật lệ).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "man-", "meaning": "tay (hand)", "relatedWords": [{ "word": "manual", "meaning": "thủ công" }] },
      "root2": { "text": "tain-", "meaning": "giữ (to hold)", "relatedWords": [{ "word": "contain", "meaning": "chứa đựng" }] }
    }
  },
  {
    "id": "v528",
    "word": "NERVOUS",
    "ipa": "ˈnɜːvəs",
    "elo": 815,
    "level": "beginner",
    "scenario": "Ngày đầu đi làm NERVOUS tới mức cúi chào luôn cái tượng ở sảnh, đồng nghiệp thấy nhưng giả vờ không thấy.",
    "translationHint": "Lo lắng, hồi hộp",
    "upgradeModule": {
      "simpleSentence": "She felt worried before the interview.",
      "targetSlot": "worried",
      "academicOptions": [
        { "text": "apprehensive", "nuance": "E sợ điều gì đó không hay sắp tới.", "formalityScore": 9 },
        { "text": "anxious", "nuance": "Lo âu, bồn chồn.", "formalityScore": 8 },
        { "text": "jittery", "nuance": "Run rẩy, đứng ngồi không yên.", "formalityScore": 6 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "nerv-", "meaning": "dây thần kinh/sức mạnh", "relatedWords": [{ "word": "nerve", "meaning": "thần kinh" }, { "word": "enervate", "meaning": "làm kiệt sức" }] }
    }
  },
  {
    "id": "v529",
    "word": "OPPORTUNITY",
    "ipa": "ˌɒpəˈtjuːnəti",
    "elo": 850,
    "level": "beginner",
    "scenario": "Crush rủ đi xem phim đúng hôm tôi sốt, OPPORTUNITY ngàn năm có một mà tôi nằm đắp chăn nhìn trần nhà, xu cà na.",
    "translationHint": "Cơ hội",
    "upgradeModule": {
      "simpleSentence": "This is a good chance to improve your skills.",
      "targetSlot": "good chance",
      "academicOptions": [
        { "text": "golden opportunity", "nuance": "Cơ hội ngàn vàng, cực kỳ hiếm.", "formalityScore": 8 },
        { "text": "prospect", "nuance": "Triển vọng, khả năng thành công trong tương lai.", "formalityScore": 9 },
        { "text": "opening", "nuance": "Một vị trí trống/kẽ hở cơ hội.", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob-", "meaning": "hướng tới/đối diện", "relatedWords": [] },
      "root": { "text": "port-", "meaning": "cảng (harbor)", "relatedWords": [{ "word": "port", "meaning": "cảng" }, { "word": "transport", "meaning": "vận chuyển" }] }
    }
  },
  {
    "id": "v530",
    "word": "PREFER",
    "ipa": "prɪˈfɜː(r)",
    "elo": 820,
    "level": "beginner",
    "scenario": "Tối thứ Sáu tôi PREFER nằm nhà xem phim với gói snack hơn đi bar, nghe ô dề nhưng năm nay tôi chọn chữa lành.",
    "translationHint": "Thích hơn",
    "upgradeModule": {
      "simpleSentence": "I like tea more than coffee.",
      "targetSlot": "like",
      "academicOptions": [
        { "text": "have a preference for", "nuance": "Có sự ưu tiên/thiên vị cho cái gì.", "formalityScore": 8 },
        { "text": "favor", "nuance": "Ưu ái, ủng hộ cái gì hơn.", "formalityScore": 9 },
        { "text": "opt for", "nuance": "Lựa chọn (trong các phương án).", "formalityScore": 7 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "pre-", "meaning": "trước", "relatedWords": [] },
      "root": { "text": "fer-", "meaning": "mang/vác (to carry)", "relatedWords": [{ "word": "transfer", "meaning": "chuyển giao" }, { "word": "offer", "meaning": "đề nghị" }] }
    }
  },
  {
    "id": "v531",
    "word": "QUALITY",
    "ipa": "ˈkwɒləti",
    "elo": 805,
    "level": "beginner",
    "scenario": "Shop quảng cáo QUALITY cao cấp, nhận hàng thì cái túi da dính mưa một cái đã đổi sang màu khác, ủa alo.",
    "translationHint": "Chất lượng",
    "upgradeModule": {
      "simpleSentence": "The work is of a very high standard.",
      "targetSlot": "standard",
      "academicOptions": [
        { "text": "caliber", "nuance": "Tầm cỡ, năng lực (thường dùng cho con người).", "formalityScore": 10 },
        { "text": "excellence", "nuance": "Sự xuất sắc.", "formalityScore": 9 },
        { "text": "attribute", "nuance": "Thuộc tính, đặc điểm.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "qual-", "meaning": "thế nào/loại nào", "relatedWords": [{ "word": "qualify", "meaning": "đủ tiêu chuẩn" }] }
    }
  },
  {
    "id": "v532",
    "word": "RECOGNIZE",
    "ipa": "ˈrekəɡnaɪz",
    "elo": 875,
    "level": "beginner",
    "scenario": "Họp lớp sau 5 năm, tôi không RECOGNIZE nổi lớp trưởng, cho tới khi nó mở miệng nhắc đóng quỹ, ra đường tôi nể mỗi bạn.",
    "translationHint": "Nhận ra",
    "upgradeModule": {
      "simpleSentence": "The company said his hard work was good.",
      "targetSlot": "said his hard work was good",
      "academicOptions": [
        { "text": "acknowledge his contribution", "nuance": "Ghi nhận đóng góp của anh ấy.", "formalityScore": 9 },
        { "text": "identify", "nuance": "Nhận dạng, xác định.", "formalityScore": 8 },
        { "text": "commend", "nuance": "Khen ngợi/tuyên dương chính thức.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "re-", "meaning": "lại một lần nữa", "relatedWords": [] },
      "root": { "text": "cogn-", "meaning": "biết (to know)", "relatedWords": [{ "word": "cognitive", "meaning": "nhận thức" }, { "word": "incognito", "meaning": "ẩn danh" }] }
    }
  },
  {
    "id": "v533",
    "word": "URGENT",
    "ipa": "ˈɜːdʒənt",
    "elo": 845,
    "level": "beginner",
    "scenario": "Group chat bắn tin URGENT liên tục, vào hóng biến thì hóa ra cả bọn đang chọn quán lẩu tối nay.",
    "translationHint": "Khẩn cấp",
    "upgradeModule": {
      "simpleSentence": "This problem needs to be fixed right now.",
      "targetSlot": "needs to be fixed right now",
      "academicOptions": [
        { "text": "requires immediate attention", "nuance": "Yêu cầu sự chú ý ngay lập tức.", "formalityScore": 9 },
        { "text": "pressing", "nuance": "Cấp thiết, nhức nhối.", "formalityScore": 8 },
        { "text": "imperative", "nuance": "Bắt buộc, khẩn thiết yếu.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "urg-", "meaning": "thúc đẩy/ép (to press)", "relatedWords": [{ "word": "urge", "meaning": "thúc giục" }] }
    }
  },
  {
    "id": "v534",
    "word": "ADMIT",
    "ipa": "ədˈmɪt",
    "elo": 865,
    "level": "beginner",
    "scenario": "Tôi phải ADMIT là cái nồi cơm điện mẹ bắt mang lên trọ đã cứu tôi khỏi ăn mì cả tháng, ok mom.",
    "translationHint": "Thừa nhận",
    "upgradeModule": {
      "simpleSentence": "He agreed that he made a mistake.",
      "targetSlot": "agreed",
      "academicOptions": [
        { "text": "admit liability", "nuance": "Thừa nhận trách nhiệm pháp lý.", "formalityScore": 10 },
        { "text": "concede", "nuance": "Thừa nhận (thường là miễn cưỡng).", "formalityScore": 9 },
        { "text": "acknowledge", "nuance": "Công nhận sự thật.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ad-", "meaning": "đến/hướng tới", "relatedWords": [] },
      "root": { "text": "mit-", "meaning": "gửi đi (to send)", "relatedWords": [{ "word": "mission", "meaning": "nhiệm vụ" }, { "word": "submit", "meaning": "nộp/khuất phục" }] }
    }
  },
  {
    "id": "v535",
    "word": "BORING",
    "ipa": "ˈbɔːrɪŋ",
    "elo": 800,
    "level": "beginner",
    "scenario": "Buổi đi chơi BORING nhất lowkey là hẹn nhau ra cà phê rồi mỗi đứa cắm mặt lướt điện thoại riêng ba tiếng.",
    "translationHint": "Buồn chán",
    "upgradeModule": {
      "simpleSentence": "The movie was not interesting at all.",
      "targetSlot": "not interesting",
      "academicOptions": [
        { "text": "monotonous", "nuance": "Đơn điệu, đều đều gây buồn chán.", "formalityScore": 9 },
        { "text": "tedious", "nuance": "Nhàm chán vì quá dài và chi tiết.", "formalityScore": 8 },
        { "text": "insipid", "nuance": "Nhạt nhẽo, thiếu sức sống.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "bore", "meaning": "khoan/đục", "relatedWords": [] }
    }
  },
  {
    "id": "v536",
    "word": "COMPLAIN",
    "ipa": "kəmˈpleɪn",
    "elo": 820,
    "level": "beginner",
    "scenario": "Nó COMPLAIN suốt về chuyện ế, tới khi có người rủ đi date thì bảo hôm đó bận giặt đồ, hết cứu.",
    "translationHint": "Than phiền, phàn nàn",
    "upgradeModule": {
      "simpleSentence": "The customers said they were unhappy with the service.",
      "targetSlot": "said they were unhappy",
      "academicOptions": [
        { "text": "lodge a complaint", "nuance": "Đưa ra lời khiếu nại chính thức.", "formalityScore": 10 },
        { "text": "grumble", "nuance": "Càu nhàu, lầm bầm.", "formalityScore": 6 },
        { "text": "remonstrate", "nuance": "Phản đối, than phiền (rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "com-", "meaning": "hoàn toàn", "relatedWords": [] },
      "root": { "text": "plangere-", "meaning": "đánh vào ngực (biểu hiện sự đau khổ)", "relatedWords": [{ "word": "plaintive", "meaning": "u sầu" }] }
    }
  },
  {
    "id": "v537",
    "word": "FORCE",
    "ipa": "fɔːs",
    "elo": 840,
    "level": "beginner",
    "scenario": "Bạn thân FORCE tôi nhảy trend TikTok cùng, quay 30 lần mới xong, clip nổi nhất lại là cảnh tôi té, u là trời.",
    "translationHint": "Ép buộc",
    "upgradeModule": {
      "simpleSentence": "The weather made them stay inside.",
      "targetSlot": "made them",
      "academicOptions": [
        { "text": "force someone to", "nuance": "Ép buộc ai đó làm gì.", "formalityScore": 7 },
        { "text": "compel", "nuance": "Bắt buộc (do hoàn cảnh/luật lệ).", "formalityScore": 10 },
        { "text": "coerce", "nuance": "Cưỡng bức, đe dọa để ép buộc.", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "fort-", "meaning": "mạnh mẽ (strong)", "relatedWords": [{ "word": "fort", "meaning": "pháo đài" }, { "word": "fortify", "meaning": "củng cố" }] }
    }
  },
  {
    "id": "v538",
    "word": "HARDLY",
    "ipa": "ˈhɑːdli",
    "elo": 815,
    "level": "beginner",
    "scenario": "Mua máy chạy bộ về phòng trọ xong tôi HARDLY đụng tới, giờ nó là cây phơi đồ xịn nhất xóm, flex nhẹ.",
    "translationHint": "Hầu như không",
    "upgradeModule": {
      "simpleSentence": "I almost never see him these days.",
      "targetSlot": "almost never",
      "academicOptions": [
        { "text": "hardly ever", "nuance": "Hầu như không bao giờ.", "formalityScore": 7 },
        { "text": "scarcely", "nuance": "Vừa vặn mới đủ/hiếm khi (rất trang trọng).", "formalityScore": 10 },
        { "text": "seldom", "nuance": "Ít khi.", "formalityScore": 9 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "hard", "meaning": "khó khăn", "relatedWords": [] }
    }
  },
  {
    "id": "v539",
    "word": "OFFER",
    "ipa": "ˈɒfə(r)",
    "elo": 850,
    "level": "beginner",
    "scenario": "Quán lẩu mới OFFER combo bốn người giá ba người, cả nhóm bỗng nhớ ra là lâu lắm rồi chưa gặp nhau, gét gô.",
    "translationHint": "Đề nghị, mời chào",
    "upgradeModule": {
      "simpleSentence": "The shop provided a big discount.",
      "targetSlot": "provided",
      "academicOptions": [
        { "text": "offer an incentive", "nuance": "Đưa ra một sự khuyến khích/ưu đãi.", "formalityScore": 9 },
        { "text": "tender", "nuance": "Đưa ra/nộp (thường dùng trong đấu thầu).", "formalityScore": 10 },
        { "text": "proffer", "nuance": "Chìa ra, đưa ra mời (rất trang trọng).", "formalityScore": 10 }
      ]
    },
    "surgeryModule": {
      "prefix": { "text": "ob/of-", "meaning": "đến/trước mặt", "relatedWords": [] },
      "root": { "text": "fer-", "meaning": "mang/vác (to carry)", "relatedWords": [{ "word": "transfer", "meaning": "chuyển giao" }, { "word": "refer", "meaning": "tham chiếu" }] }
    }
  },
  {
    "id": "v540",
    "word": "NOTICE",
    "ipa": "ˈnəʊtɪs",
    "elo": 810,
    "level": "beginner",
    "scenario": "Bạn cùng bàn NOTICE tôi ngáp tới lần thứ mười, lặng lẽ đẩy qua một ly cà phê sữa đá, tình bạn đỉnh nóc kịch trần.",
    "translationHint": "Để ý thấy, nhận ra",
    "upgradeModule": {
      "simpleSentence": "Did you see the small change in the room?",
      "targetSlot": "see",
      "academicOptions": [
        { "text": "observe the discrepancy", "nuance": "Quan sát thấy sự khác biệt/sai lệch.", "formalityScore": 9 },
        { "text": "perceive", "nuance": "Nhận thức/cảm nhận được.", "formalityScore": 10 },
        { "text": "detect", "nuance": "Dò tìm/phát hiện ra.", "formalityScore": 8 }
      ]
    },
    "surgeryModule": {
      "root": { "text": "not-", "meaning": "biết/đánh dấu (to know/mark)", "relatedWords": [{ "word": "note", "meaning": "ghi chú" }, { "word": "notable", "meaning": "đáng chú ý" }] }
    }
  }
];

/**
 * Helper function to get random cards by ELO range
 */
export function getCardsByEloRange(minElo: number, maxElo: number, count: number = 10): Omit<VocabCardData, 'state'>[] {
  const filtered = VOCAB_DATABASE.filter(card => card.elo >= minElo && card.elo <= maxElo);
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
