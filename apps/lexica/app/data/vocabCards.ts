import { VocabCardData } from '../components/VocabCard';

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
    "scenario": "Lương chưa về mà bill thì ABUNDANT vãi, nhìn cái app ngân hàng mà muốn trầm cảm.",
    "translationHint": "Dư thừa, nhiều hơn cần thiết"
  },
  {
    "id": "v002",
    "word": "COGNITIVE",
    "ipa": "ˈkɒɡnətɪv",
    "elo": 870,
    "level": "beginner",
    "scenario": "Sáng thứ Hai mà chưa có cà phê thì khả năng COGNITIVE của tôi chỉ bằng con tôm luộc.",
    "translationHint": "Liên quan đến nhận thức, tri giác"
  },
  {
    "id": "v003",
    "word": "DILEMMA",
    "ipa": "dɪˈlemə",
    "elo": 820,
    "level": "beginner",
    "scenario": "Đứng trước cái DILEMMA: Fix tiếp cái bug này hay đi ngủ để mai còn có sức mà bị sếp chửi?",
    "translationHint": "Tình huống khó xử, lưỡng nan"
  },
  {
    "id": "v004",
    "word": "FEASIBLE",
    "ipa": "ˈfiːzəbl",
    "elo": 880,
    "level": "beginner",
    "scenario": "Dậy lúc 5h sáng để chạy bộ nghe có vẻ không FEASIBLE lắm với cái nết của tôi.",
    "translationHint": "Khả thi, có thể thực hiện được"
  },
  {
    "id": "v005",
    "word": "INEVITABLE",
    "ipa": "ɪnˈevɪtəbl",
    "elo": 890,
    "level": "beginner",
    "scenario": "Code lẹ để kịp deadline mà không unit test thì bug lòi ra là điều INEVITABLE thôi.",
    "translationHint": "Không thể tránh khỏi"
  },
  {
    "id": "v006",
    "word": "PRAGMATIC",
    "ipa": "præɡˈmætɪk",
    "elo": 920,
    "level": "beginner",
    "scenario": "Sống PRAGMATIC lên tí đi, bớt mơ mộng trúng crypto rồi nghỉ việc, lo mà học Next.js đi kìa.",
    "translationHint": "Thực dụng, thực tế"
  },
  {
    "id": "v007",
    "word": "AMBIGUOUS",
    "ipa": "æmˈbɪɡjuəs",
    "elo": 950,
    "level": "beginner",
    "scenario": "Mấy cái yêu cầu của khách hàng lúc nào cũng AMBIGUOUS, sửa xong kiểu gì cũng bị nói là 'không đúng ý'.",
    "translationHint": "Mơ hồ, không rõ ràng"
  },
  {
    "id": "v008",
    "word": "RESILIENT",
    "ipa": "rɪˈzɪliənt",
    "elo": 940,
    "level": "beginner",
    "scenario": "Cái server này RESILIENT thật, bị ddos liên tục mà vẫn chưa sập hoàn toàn.",
    "translationHint": "Kiên cường, phục hồi nhanh"
  },
  {
    "id": "v009",
    "word": "TEDIOUS",
    "ipa": "ˈtiːdiəs",
    "elo": 910,
    "level": "beginner",
    "scenario": "Ngồi đặt tên lại cho 100 cái file ảnh là một công việc TEDIOUS nhất thế kỷ.",
    "translationHint": "Buồn tẻ, nhàm chán"
  },
  {
    "id": "v010",
    "word": "SUBTLE",
    "ipa": "ˈsʌtl",
    "elo": 930,
    "level": "beginner",
    "scenario": "Bồ tôi bảo 'Em sao cũng được' là một dấu hiệu SUBTLE rằng tôi sắp tới số rồi.",
    "translationHint": "Tinh tế, khó nhận ra"
  },
  {
    "id": "v011",
    "word": "METICULOUS",
    "ipa": "məˈtɪkjələs",
    "elo": 1050,
    "level": "intermediate",
    "scenario": "Phải METICULOUS lắm mới tìm ra được cái lỗi logic mà thằng dev cũ giấu kỹ như vậy.",
    "translationHint": "Tỉ mỉ, cẩn thận"
  },
  {
    "id": "v012",
    "word": "UBIQUITOUS",
    "ipa": "juːˈbɪkwɪtəs",
    "elo": 1080,
    "level": "intermediate",
    "scenario": "Mấy cái app giao đồ ăn giờ UBIQUITOUS quá, bước ra ngõ là thấy shipper đứng đầy đường.",
    "translationHint": "Phổ biến khắp nơi"
  },
  {
    "id": "v013",
    "word": "EPHEMERAL",
    "ipa": "ɪˈfemərəl",
    "elo": 1100,
    "level": "intermediate",
    "scenario": "Cái cảm giác giàu sang khi vừa nhận lương thật là EPHEMERAL, trả nợ xong là hết.",
    "translationHint": "Phù du, ngắn ngủi"
  },
  {
    "id": "v014",
    "word": "ELOQUENT",
    "ipa": "ˈeləkwənt",
    "elo": 1020,
    "level": "intermediate",
    "scenario": "Hắn ta giải trình về lý do đi trễ ELOQUENT đến mức sếp quên luôn định phạt.",
    "translationHint": "Hùng biện, lưu loát"
  },
  {
    "id": "v015",
    "word": "PLAUSIBLE",
    "ipa": "ˈplɔːzəbl",
    "elo": 1010,
    "level": "intermediate",
    "scenario": "Lý do 'nhà mất mạng' nghe có vẻ PLAUSIBLE đấy, nhưng tiếc là tôi thấy ông đang on Facebook.",
    "translationHint": "Hợp lý, đáng tin"
  },
  {
    "id": "v016",
    "word": "SCRUTINIZE",
    "ipa": "ˈskruːtənaɪz",
    "elo": 1040,
    "level": "intermediate",
    "scenario": "Mỗi lần push code là sợ bị ông lead SCRUTINIZE từng dòng, soi còn hơn mẹ soi con dâu.",
    "translationHint": "Xem xét kỹ lưỡng"
  },
  {
    "id": "v017",
    "word": "CANDID",
    "ipa": "ˈkændɪd",
    "elo": 1030,
    "level": "intermediate",
    "scenario": "Nói CANDID nhé, cái UI này trông phèn lắm Long ạ, làm lại đi.",
    "translationHint": "Thẳng thắn, chân thành"
  },
  {
    "id": "v018",
    "word": "CONTEMPLATE",
    "ipa": "ˈkɒntəmpleɪt",
    "elo": 1060,
    "level": "intermediate",
    "scenario": "Đang ngồi CONTEMPLATE về ý nghĩa cuộc đời thì mẹ bảo đi đổ rác.",
    "translationHint": "Suy ngẫm, trầm tư"
  },
  {
    "id": "v019",
    "word": "MUNDANE",
    "ipa": "mʌnˈdeɪn",
    "elo": 1000,
    "level": "intermediate",
    "scenario": "Mấy cái task MUNDANE như update data này làm tốn thời gian mà chẳng học thêm được gì.",
    "translationHint": "Tầm thường, nhàm chán"
  },
  {
    "id": "v020",
    "word": "INHERENT",
    "ipa": "ɪnˈhɪrənt",
    "elo": 1070,
    "level": "intermediate",
    "scenario": "Làm freelance thì rủi ro bị bùng tiền là một đặc điểm INHERENT rồi, phải chịu thôi.",
    "translationHint": "Vốn có, cố hữu"
  },
  {
    "id": "v021",
    "word": "CONUNDRUM",
    "ipa": "kəˈnʌndrəm",
    "elo": 1150,
    "level": "intermediate",
    "scenario": "Một cái CONUNDRUM: Muốn có kinh nghiệm thì phải có việc, mà muốn có việc thì phải có kinh nghiệm?",
    "translationHint": "Vấn đề hóc búa"
  },
  {
    "id": "v022",
    "word": "EXACERBATE",
    "ipa": "ɪɡˈzæsərbeɪt",
    "elo": 1180,
    "level": "intermediate",
    "scenario": "Đang stress mà còn gặp thêm mấy tin nhắn 'Deadline tới đâu rồi em' chỉ làm EXACERBATE tình hình thôi.",
    "translationHint": "Làm tệ hại thêm"
  },
  {
    "id": "v023",
    "word": "MITIGATE",
    "ipa": "ˈmɪtɪɡeɪt",
    "elo": 1120,
    "level": "intermediate",
    "scenario": "Uống một ly trà sữa để MITIGATE sự mệt mỏi sau 8 tiếng dán mắt vào màn hình.",
    "translationHint": "Giảm nhẹ, làm dịu"
  },
  {
    "id": "v024",
    "word": "NUANCE",
    "ipa": "ˈnjuːɑːns",
    "elo": 1140,
    "level": "intermediate",
    "scenario": "Phải hiểu được cái NUANCE trong lời nói của sếp, 'Anh thấy cũng được' thường có nghĩa là 'Dở tệ'.",
    "translationHint": "Sắc thái nhỏ"
  },
  {
    "id": "v025",
    "word": "PROLIFIC",
    "ipa": "prəˈlɪfɪk",
    "elo": 1160,
    "level": "intermediate",
    "scenario": "Ông nội này PROLIFIC vãi, tuần nào cũng thấy ra 2-3 cái open source project mới.",
    "translationHint": "Hiệu suất cao, đẻ nhiều"
  },
  {
    "id": "v026",
    "word": "REDUNDANT",
    "ipa": "rɪˈdʌndənt",
    "elo": 1110,
    "level": "intermediate",
    "scenario": "Code gì mà REDUNDANT quá vậy, mười mấy dòng này gom lại thành 1 dòng là xong rồi.",
    "translationHint": "Thừa thãi"
  },
  {
    "id": "v027",
    "word": "TANGIBLE",
    "ipa": "ˈtænʤəbl",
    "elo": 1130,
    "level": "intermediate",
    "scenario": "Học xong khóa này hy vọng sẽ có kết quả TANGIBLE chút, chứ đừng có mỗi cái certificate ảo.",
    "translationHint": "Hữu hình, rõ rệt"
  },
  {
    "id": "v028",
    "word": "ZENITH",
    "ipa": "ˈzenɪθ",
    "elo": 1190,
    "level": "intermediate",
    "scenario": "Cái app này đạt ZENITH về số lượng người dùng vào năm ngoái, giờ thì đang tụt dốc.",
    "translationHint": "Đỉnh cao"
  },
  {
    "id": "v029",
    "word": "COHERENT",
    "ipa": "kəʊˈhɪrənt",
    "elo": 1170,
    "level": "intermediate",
    "scenario": "Nói chuyện kiểu gì mà chẳng thấy COHERENT tí nào, trước sau đá nhau chan chát.",
    "translationHint": "Mạch lạc, logic"
  },
  {
    "id": "v030",
    "word": "ARBITRARY",
    "ipa": "ˈɑːrbɪtreri",
    "elo": 1100,
    "level": "intermediate",
    "scenario": "Việc chọn màu cho cái button này cảm giác hoàn toàn ARBITRARY, chẳng theo cái design system nào cả.",
    "translationHint": "Tùy hứng, tùy tiện"
  },

    // ELO 1200-1300: Advanced
    {
    "id": "v031",
    "word": "BELLIGERENT",
    "ipa": "bəˈlɪdʒərənt",
    "elo": 1250,
    "level": "advanced",
    "scenario": "Mấy ông thần nhậu vào là bắt đầu BELLIGERENT, nhìn ai cũng muốn kiếm chuyện làm như mình là hổ báo trường mẫu giáo.",
    "translationHint": "Hiếu chiến, hung hăng"
  },
  {
    "id": "v032",
    "word": "ELUCIDATE",
    "ipa": "ɪˈluːsɪdeɪt",
    "elo": 1220,
    "level": "advanced",
    "scenario": "Ông giải thích nãy giờ tôi vẫn chưa hiểu, ELUCIDATE lại giùm cái logic tại sao cái component này lại render 10 lần vậy?",
    "translationHint": "Làm sáng tỏ, giải thích rõ"
  },
  {
    "id": "v033",
    "word": "ESOTERIC",
    "ipa": "esəˈterɪk",
    "elo": 1280,
    "level": "advanced",
    "scenario": "Mấy cái kiến thức về blockchain này ban đầu nghe có vẻ ESOTERIC, nhưng đọc kỹ thì... vẫn thấy khó hiểu vãi.",
    "translationHint": "Bí truyền, chuyên sâu khó hiểu"
  },
  {
    "id": "v034",
    "word": "GREGARIOUS",
    "ipa": "ɡrɪˈɡeəriəs",
    "elo": 1240,
    "level": "advanced",
    "scenario": "Mấy đứa GREGARIOUS đi networking lúc nào cũng như cá gặp nước, còn tôi thì chỉ muốn tìm cái góc nào có ổ điện để cắm sạc.",
    "translationHint": "Hòa đồng, thích giao du"
  },
  {
    "id": "v035",
    "word": "IMPETUOUS",
    "ipa": "ɪmˈpetʃuəs",
    "elo": 1260,
    "level": "advanced",
    "scenario": "Đừng có IMPETUOUS mà chốt mua cái bàn phím 5 củ đó, cuối tháng ăn mì tôm bây giờ.",
    "translationHint": "Hấp tấp, bốc đồng"
  },
  {
    "id": "v036",
    "word": "JUXTAPOSE",
    "ipa": "ʤʌksˈtæpəʊz",
    "elo": 1230,
    "level": "advanced",
    "scenario": "Thử JUXTAPOSE cái hình sống ảo trên mạng với cái mặt thật lúc vừa ngủ dậy đi, đảm bảo trầm cảm.",
    "translationHint": "Đặt cạnh nhau để so sánh"
  },
  {
    "id": "v037",
    "word": "MALEVOLENT",
    "ipa": "məˈlevələnt",
    "elo": 1270,
    "level": "advanced",
    "scenario": "Cái nụ cười MALEVOLENT của bà chị HR khi bảo 'Em ở lại họp tí nhé' làm tôi thấy lạnh cả sống lưng.",
    "translationHint": "Độc ác, có ác ý"
  },
  {
    "id": "v038",
    "word": "OBFUSCATE",
    "ipa": "ɒbˈfʌskeɪt",
    "elo": 1290,
    "level": "advanced",
    "scenario": "Đừng có dùng mấy cái thuật ngữ chuyên môn để OBFUSCATE cái lỗi sơ đẳng của ông, tôi biết thừa ông quên handle lỗi.",
    "translationHint": "Làm mờ mịt, che giấu"
  },
  {
    "id": "v039",
    "word": "PARSIMONY",
    "ipa": "ˈpɑːrsɪməni",
    "elo": 1210,
    "level": "advanced",
    "scenario": "Công ty này thực hành chính sách PARSIMONY cực độ, đến cái khăn giấy trong toilet cũng phải tiết kiệm.",
    "translationHint": "Sự bủn xỉn, keo kiệt"
  },
  {
    "id": "v040",
    "word": "QUINTESSENTIAL",
    "ipa": "kwɪntɪˈsenʃl",
    "elo": 1200,
    "level": "advanced",
    "scenario": "Ăn bát phở vỉa hè lúc sáng sớm là một trải nghiệm QUINTESSENTIAL khi ở Việt Nam rồi.",
    "translationHint": "Tinh túy, điển hình"
  },
  {
    "id": "v041",
    "word": "RECALCITRANT",
    "ipa": "rɪˈkælsɪtrənt",
    "elo": 1350,
    "level": "expert",
    "scenario": "Cái con chatbot RECALCITRANT này, dạy mãi mà nó vẫn cứ trả lời kiểu huề vốn.",
    "translationHint": "Ngoan cố, bướng bỉnh"
  },
  {
    "id": "v042",
    "word": "SALIENT",
    "ipa": "ˈseɪliənt",
    "elo": 1320,
    "level": "expert",
    "scenario": "Điểm SALIENT nhất trong cái CV của ông là 'biết nấu mì tôm', còn kỹ năng code thì chưa thấy đâu.",
    "translationHint": "Nổi bật, đáng chú ý"
  },
  {
    "id": "v043",
    "word": "TACITURN",
    "ipa": "ˈtæsɪtɜn",
    "elo": 1340,
    "level": "expert",
    "scenario": "Bình thường ông ấy TACITURN lắm, nhưng cứ nhắc đến chuyện lương lậu là nói như súng liên thanh.",
    "translationHint": "Ít nói, lầm lì"
  },
  {
    "id": "v044",
    "word": "VICARIOUS",
    "ipa": "vɪˈkeəriəs",
    "elo": 1310,
    "level": "expert",
    "scenario": "Không có tiền đi du lịch nên tôi toàn ngồi xem vlog của mấy ông travel blogger để hưởng thụ VICARIOUS.",
    "translationHint": "Trải nghiệm gián tiếp"
  },
  {
    "id": "v045",
    "word": "ZEALOT",
    "ipa": "ˈzelət",
    "elo": 1330,
    "level": "expert",
    "scenario": "Mấy ông ZEALOT của một cái framework nào đó thường rất hay đi gây chiến với cộng đồng framework khác.",
    "translationHint": "Người cuồng tín"
  },
  {
    "id": "v046",
    "word": "AMELIORATE",
    "ipa": "əˈmiːliəreɪt",
    "elo": 1360,
    "level": "expert",
    "scenario": "Tôi đang cố AMELIORATE cái mối quan hệ với sếp bằng cách đi làm đúng giờ, dù hơi khó.",
    "translationHint": "Cải thiện, làm tốt hơn"
  },
  {
    "id": "v047",
    "word": "CACOPHONY",
    "ipa": "kəˈkɒfəni",
    "elo": 1380,
    "level": "expert",
    "scenario": "Sáng sớm mà tiếng còi xe, tiếng karaoke hàng xóm trộn vào nhau tạo thành một bản CACOPHONY nhức cả đầu.",
    "translationHint": "Âm thanh hỗn tạp, chói tai"
  },
  {
    "id": "v048",
    "word": "DOGMATIC",
    "ipa": "dɒɡˈmætɪk",
    "elo": 1300,
    "level": "expert",
    "scenario": "Làm việc với mấy ông DOGMATIC mệt lắm, lúc nào cũng khư khư giữ cái tư duy cũ rích không chịu đổi mới.",
    "translationHint": "Giáo điều, độc đoán"
  },
  {
    "id": "v049",
    "word": "ENERVATE",
    "ipa": "ˈenərveɪt",
    "elo": 1390,
    "level": "expert",
    "scenario": "Ngồi họp 3 tiếng đồng hồ liên tục chỉ để nghe sếp hứa hẹn làm tôi thấy bị ENERVATE hoàn toàn.",
    "translationHint": "Làm suy yếu, làm kiệt sức"
  },
  {
    "id": "v050",
    "word": "HACKNEYED",
    "ipa": "ˈhæknid",
    "elo": 1410,
    "level": "expert",
    "scenario": "Mấy cái câu quote 'Vượt qua giới hạn bản thân' nghe HACKNEYED quá rồi, có cái gì mới hơn không?",
    "translationHint": "Sáo rỗng, tầm thường"
  },
  {
    "id": "v051",
    "word": "GRANDILOQUENT",
    "ipa": "ɡrændɪˈləʊkwənt",
    "elo": 1450,
    "level": "expert",
    "scenario": "Cái văn phong GRANDILOQUENT của ông nghe thì sang đấy, nhưng thực tế là chẳng ai hiểu ông muốn nói gì.",
    "translationHint": "Khoa trương, hoa mỹ"
  },
  {
    "id": "v052",
    "word": "ICONOCLAST",
    "ipa": "aɪˈkɒnəklæst",
    "elo": 1440,
    "level": "expert",
    "scenario": "Hắn ta đúng là một ICONOCLAST khi dám lên tiếng phản đối cái quy trình mà cả công ty đã dùng 10 năm nay.",
    "translationHint": "Người đả phá những quan điểm cũ"
  },
  {
    "id": "v053",
    "word": "LACONIC",
    "ipa": "ləˈkɒnɪk",
    "elo": 1430,
    "level": "expert",
    "scenario": "Câu trả lời LACONIC 'Không' của cô ấy làm tôi hiểu rằng mình không còn cơ hội nào nữa rồi.",
    "translationHint": "Ngắn gọn, súc tích"
  },
  {
    "id": "v054",
    "word": "OBSEQUIOUS",
    "ipa": "əbˈsiːkwiəs",
    "elo": 1460,
    "level": "expert",
    "scenario": "Nhìn cái cách ông kia OBSEQUIOUS với sếp mà tôi thấy phát ngốt, nịnh hót vừa thôi chứ.",
    "translationHint": "Khúm núm, xu nịnh"
  },
  {
    "id": "v055",
    "word": "PERNICIOUS",
    "ipa": "pərˈnɪʃəs",
    "elo": 1470,
    "level": "expert",
    "scenario": "Cái thói quen so sánh mình với người khác trên mạng xã hội là một thói quen PERNICIOUS cho sức khỏe tinh thần.",
    "translationHint": "Độc hại, nguy hiểm ngầm"
  },
  {
    "id": "v056",
    "word": "QUIXOTIC",
    "ipa": "kwɪkˈsɒtɪk",
    "elo": 1480,
    "level": "expert",
    "scenario": "Cái kế hoạch xây dựng một mạng xã hội mới để lật đổ Facebook nghe có vẻ QUIXOTIC quá không Long?",
    "translationHint": "Viển vông, không thực tế"
  },
  {
    "id": "v057",
    "word": "RISIBLE",
    "ipa": "ˈrɪzəbl",
    "elo": 1400,
    "level": "expert",
    "scenario": "Lời bào chữa cho việc nộp task muộn vì 'con mèo em nó nhảy lên bàn phím làm hỏng code' thật sự RISIBLE.",
    "translationHint": "Đáng cười, lố bịch"
  },
  {
    "id": "v058",
    "word": "SYCOPHANT",
    "ipa": "ˈsɪkəfənt",
    "elo": 1490,
    "level": "expert",
    "scenario": "Ông đừng có làm cái trò SYCOPHANT đó nữa, sếp thừa biết ông nịnh để xin tăng lương thôi.",
    "translationHint": "Kẻ nịnh hót"
  },
  {
    "id": "v059",
    "word": "VITRIOLIC",
    "ipa": "vɪtriˈɒlɪk",
    "elo": 1460,
    "level": "expert",
    "scenario": "Mấy cái comment VITRIOLIC trên mạng đôi khi có thể giết chết một con người đấy, bớt khẩu nghiệp lại.",
    "translationHint": "Châm chọc, cay độc"
  },
  {
    "id": "v060",
    "word": "ABSTRUSE",
    "ipa": "æbˈstruːs",
    "elo": 1490,
    "level": "expert",
    "scenario": "Cái tutorial này viết bằng ngôn ngữ gì mà ABSTRUSE thế không biết, đọc xong còn thấy lú hơn lúc chưa đọc.",
    "translationHint": "Thâm thúy, khó hiểu"
  },

    // === BEGINNER (ELO 800–950) ===
    {
    "id": "v061",
    "word": "ANXIOUS",
    "ipa": "ˈæŋkʃəs",
    "elo": 810,
    "level": "beginner",
    "scenario": "Cứ mỗi lần sếp nhắn 'Em có rảnh không' là tôi lại thấy ANXIOUS ngang, dù chẳng làm gì sai.",
    "translationHint": "Lo lắng, bồn chồn"
  },
  {
    "id": "v062",
    "word": "BLUNT",
    "ipa": "blʌnt",
    "elo": 820,
    "level": "beginner",
    "scenario": "Thằng bạn tôi nó BLUNT lắm, nó bảo 'Code ông rác vãi' mà tôi không biết nên khóc hay cười.",
    "translationHint": "Thẳng thắn đến mức thô lỗ"
  },
  {
    "id": "v063",
    "word": "CAUTIOUS",
    "ipa": "ˈkɔːʃəs",
    "elo": 815,
    "level": "beginner",
    "scenario": "Phải CAUTIOUS khi bấm vào mấy cái link lạ trên Telegram, không là bay màu cái ví crypto ngay.",
    "translationHint": "Thận trọng, cẩn thận"
  },
  {
    "id": "v064",
    "word": "DEMAND",
    "ipa": "dɪˈmɑːnd",
    "elo": 830,
    "level": "beginner",
    "scenario": "Khách hàng DEMAND thêm tính năng mới nhưng lại không muốn chi thêm một đồng nào.",
    "translationHint": "Yêu cầu, đòi hỏi"
  },
  {
    "id": "v065",
    "word": "EFFICIENT",
    "ipa": "ɪˈfɪʃnt",
    "elo": 840,
    "level": "beginner",
    "scenario": "Dùng phím tắt là cách EFFICIENT nhất để code nhanh mà không bị sếp soi là đang lười.",
    "translationHint": "Hiệu quả, năng suất"
  },
  {
    "id": "v066",
    "word": "FLEXIBLE",
    "ipa": "ˈfleksəbl",
    "elo": 835,
    "level": "beginner",
    "scenario": "Thời gian làm việc ở đây khá FLEXIBLE, miễn là ông nộp task đúng hạn thì ông ngủ đến trưa cũng được.",
    "translationHint": "Linh hoạt, dễ thích nghi"
  },
  {
    "id": "v067",
    "word": "GENUINE",
    "ipa": "ˈdʒenjuɪn",
    "elo": 845,
    "level": "beginner",
    "scenario": "Cái nụ cười GENUINE của crush làm tôi quên hết mệt mỏi sau một ngày bị bug hành.",
    "translationHint": "Thật thà, chân thành"
  },
  {
    "id": "v068",
    "word": "HESITATE",
    "ipa": "ˈhezɪteɪt",
    "elo": 830,
    "level": "beginner",
    "scenario": "Đừng HESITATE khi thấy lương không xứng đáng với công sức, cứ mạnh dạn mà deal lại.",
    "translationHint": "Do dự, ngập ngừng"
  },
  {
    "id": "v069",
    "word": "IMPACT",
    "ipa": "ˈɪmpækt",
    "elo": 825,
    "level": "beginner",
    "scenario": "Cái đợt layoff vừa rồi có IMPACT cực lớn đến tâm lý của anh em trong team.",
    "translationHint": "Tác động, ảnh hưởng mạnh"
  },
  {
    "id": "v070",
    "word": "JUSTIFY",
    "ipa": "ˈdʒʌstɪfaɪ",
    "elo": 850,
    "level": "beginner",
    "scenario": "Làm sao để JUSTIFY cái việc tôi ngủ gật trong cuộc họp là do 'đang suy nghĩ quá sâu' đây?",
    "translationHint": "Biện minh, thanh minh"
  },
  {
    "id": "v071",
    "word": "KEEN",
    "ipa": "kiːn",
    "elo": 835,
    "level": "beginner",
    "scenario": "Tôi rất KEEN với mấy cái framework mới, nhưng lười học quá nên toàn đọc qua loa.",
    "translationHint": "Hăng hái, nhiệt tình"
  },
  {
    "id": "v072",
    "word": "LOGICAL",
    "ipa": "ˈlɒdʒɪkl",
    "elo": 840,
    "level": "beginner",
    "scenario": "Giải thích kiểu gì cho LOGICAL một tí đi, đừng có đổ thừa tại máy tính nó tự xóa file nữa.",
    "translationHint": "Hợp lý, theo logic"
  },
  {
    "id": "v073",
    "word": "MASSIVE",
    "ipa": "ˈmæsɪv",
    "elo": 820,
    "level": "beginner",
    "scenario": "Có một sự MASSIVE khác biệt giữa việc 'biết code' và 'biết code sạch'.",
    "translationHint": "Khổng lồ, to lớn"
  },
  {
    "id": "v074",
    "word": "NEGLECT",
    "ipa": "nɪˈɡlekt",
    "elo": 855,
    "level": "beginner",
    "scenario": "Vì quá mải mê fix bug mà tôi NEGLECT luôn cả việc ăn tối, giờ thì đau dạ dày rồi.",
    "translationHint": "Bỏ bê, xao nhãng"
  },
  {
    "id": "v075",
    "word": "OBVIOUS",
    "ipa": "ˈɒbviəs",
    "elo": 815,
    "level": "beginner",
    "scenario": "Lỗi syntax sờ sờ ra đó mà tìm mãi không thấy, đúng là OBVIOUS quá nên mới mù quáng.",
    "translationHint": "Rõ ràng, hiển nhiên"
  },
  {
    "id": "v076",
    "word": "PERSISTENT",
    "ipa": "pəˈsɪstənt",
    "elo": 860,
    "level": "beginner",
    "scenario": "Mấy cái quảng cáo nhà đất nó PERSISTENT gọi cho tôi cả ngày, block số này nó gọi số khác.",
    "translationHint": "Kiên trì, dai dẳng"
  },
  {
    "id": "v077",
    "word": "RELEVANT",
    "ipa": "ˈreləvənt",
    "elo": 845,
    "level": "beginner",
    "scenario": "Nói chuyện vào trọng tâm đi ông ơi, mấy cái ví dụ này không RELEVANT gì đến vấn đề mình đang gặp cả.",
    "translationHint": "Liên quan, phù hợp"
  },
  {
    "id": "v078",
    "word": "SIGNIFICANT",
    "ipa": "sɪɡˈnɪfɪkənt",
    "elo": 850,
    "level": "beginner",
    "scenario": "Tìm được một con mentor tốt sẽ tạo ra thay đổi SIGNIFICANT cho con đường sự nghiệp của ông.",
    "translationHint": "Quan trọng, đáng kể"
  },
  {
    "id": "v079",
    "word": "TOLERATE",
    "ipa": "ˈtɒləreɪt",
    "elo": 855,
    "level": "beginner",
    "scenario": "Tôi không thể TOLERATE nổi cái thói lười biếng mà còn hay đổ lỗi của ông đồng nghiệp cùng team.",
    "translationHint": "Tha thứ, chịu đựng"
  },
  {
    "id": "v080",
    "word": "UTILIZE",
    "ipa": "ˈjuːtɪlaɪz",
    "elo": 860,
    "level": "beginner",
    "scenario": "Phải biết cách UTILIZE tối đa sức mạnh của AI để làm việc nhanh hơn, chứ đừng để nó thay thế mình.",
    "translationHint": "Sử dụng, tận dụng"
  },
  {
    "id": "v081",
    "word": "VALID",
    "ipa": "ˈvælɪd",
    "elo": 840,
    "level": "beginner",
    "scenario": "Cái argument của ông nghe cũng VALID đấy, nhưng áp dụng vào thực tế thì chắc chắn là tạch.",
    "translationHint": "Hợp lệ, có cơ sở"
  },
  {
    "id": "v082",
    "word": "WILLING",
    "ipa": "ˈwɪlɪŋ",
    "elo": 830,
    "level": "beginner",
    "scenario": "Tôi WILLING làm thêm giờ nếu công ty trả lương OT sòng phẳng, còn không thì cứ 5h là 'phắn'.",
    "translationHint": "Sẵn lòng, tự nguyện"
  },
  {
    "id": "v083",
    "word": "ABSTRACT",
    "ipa": "ˈæbstrækt",
    "elo": 870,
    "level": "beginner",
    "scenario": "Mấy cái định nghĩa về Clean Architecture này nghe ABSTRACT quá, cho tôi ví dụ code thực tế đi.",
    "translationHint": "Trừu tượng"
  },
  {
    "id": "v084",
    "word": "BENEFIT",
    "ipa": "ˈbenɪfɪt",
    "elo": 825,
    "level": "beginner",
    "scenario": "Làm ở công ty lớn thì BENEFIT tốt thiệt, nhưng bù lại là quy trình rườm rà phát mệt.",
    "translationHint": "Lợi ích, phúc lợi"
  },
  {
    "id": "v085",
    "word": "CONFIDENT",
    "ipa": "ˈkɒnfɪdənt",
    "elo": 835,
    "level": "beginner",
    "scenario": "Lúc phỏng vấn thì CONFIDENT lắm, vô làm thật mới biết mình còn non và xanh như trái chuối.",
    "translationHint": "Tự tin"
  },
  {
    "id": "v086",
    "word": "DIVERSE",
    "ipa": "daɪˈvɜːs",
    "elo": 865,
    "level": "beginner",
    "scenario": "Team mình cần những người có skill DIVERSE một tí, chứ ai cũng chỉ biết mỗi frontend thì toang.",
    "translationHint": "Đa dạng"
  },
  {
    "id": "v087",
    "word": "EVIDENT",
    "ipa": "ˈevɪdənt",
    "elo": 855,
    "level": "beginner",
    "scenario": "Việc ông không tập trung làm bài là quá EVIDENT khi ông cứ liếc điện thoại 5 phút một lần.",
    "translationHint": "Rõ ràng, hiển nhiên"
  },
  {
    "id": "v088",
    "word": "FOCUS",
    "ipa": "ˈfəʊkəs",
    "elo": 820,
    "level": "beginner",
    "scenario": "Đang định FOCUS học tiếng Nhật thì lại có đứa rủ đi đánh rank, thế là mất hút luôn.",
    "translationHint": "Tập trung"
  },
  {
    "id": "v089",
    "word": "GENERATE",
    "ipa": "ˈdʒenəreɪt",
    "elo": 845,
    "level": "beginner",
    "scenario": "Dùng ChatGPT để GENERATE đống dữ liệu mẫu này cho nhanh, chứ ngồi gõ tay chắc đến mùa quýt.",
    "translationHint": "Tạo ra"
  },
  {
    "id": "v090",
    "word": "HIGHLIGHT",
    "ipa": "ˈhaɪlaɪt",
    "elo": 830,
    "level": "beginner",
    "scenario": "HIGHLIGHT của buổi tiệc tối qua là lúc sếp say rượu rồi bắt đầu đi múa cột.",
    "translationHint": "Điểm nhấn, nổi bật"
  },

    // === INTERMEDIATE (ELO 950–1200) ===
    {
    "id": "v091",
    "word": "ADVOCATING",
    "ipa": "ˈædvəkeɪtɪŋ",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Dù sếp muốn OT không lương, tôi vẫn luôn ADVOCATING cho việc cân bằng cuộc sống, làm xong là về.",
    "translationHint": "Ủng hộ, vận động cho"
  },
  {
    "id": "v092",
    "word": "AMBIVALENT",
    "ipa": "æmˈbɪvələnt",
    "elo": 980,
    "level": "intermediate",
    "scenario": "Cảm giác AMBIVALENT vãi: muốn nghỉ việc để tự do nhưng lại sợ không có tiền đóng tiền nhà.",
    "translationHint": "Mâu thuẫn, vừa thích vừa ghét"
  },
  {
    "id": "v093",
    "word": "ANALOGOUS",
    "ipa": "əˈnæləɡəs",
    "elo": 1050,
    "level": "intermediate",
    "scenario": "Việc giải thích code cho sếp không biết kỹ thuật nó ANALOGOUS với việc dạy cá leo cây vậy.",
    "translationHint": "Tương tự, giống như"
  },
  {
    "id": "v094",
    "word": "ARTICULATE",
    "ipa": "ɑːˈtɪkjʊlət",
    "elo": 1000,
    "level": "intermediate",
    "scenario": "Hắn ta ARTICULATE cái plan nghe hay vãi chưởng, dù thực tế là team chưa làm được cái gì cả.",
    "translationHint": "Diễn đạt lưu loát"
  },
  {
    "id": "v095",
    "word": "ASSERTIVE",
    "ipa": "əˈsɜːtɪv",
    "elo": 970,
    "level": "intermediate",
    "scenario": "Đi phỏng vấn là phải ASSERTIVE lên, mình biết cái gì thì nói chắc cái đó, đừng có 'em nghĩ là'.",
    "translationHint": "Quyết đoán, tự tin khẳng định"
  },
  {
    "id": "v096",
    "word": "BIASED",
    "ipa": "ˈbaɪəst",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Đừng có BIASED cho cái framework ông thích mà chê mấy cái khác, cái nào cũng có cái dở thôi.",
    "translationHint": "Thiên vị, có thành kiến"
  },
  {
    "id": "v097",
    "word": "BUREAUCRATIC",
    "ipa": "ˌbjʊərəˈkrætɪk",
    "elo": 1080,
    "level": "intermediate",
    "scenario": "Cái quy trình hoàn tiền ở đây BUREAUCRATIC vãi, bắt ký 7749 cái giấy tờ chỉ để nhận lại 200k.",
    "translationHint": "Quan liêu, nhiều thủ tục"
  },
  {
    "id": "v098",
    "word": "CATALYST",
    "ipa": "ˈkætəlɪst",
    "elo": 1020,
    "level": "intermediate",
    "scenario": "Việc bị người yêu cũ cắm sừng chính là CATALYST giúp tôi quyết tâm học code để đổi đời.",
    "translationHint": "Chất xúc tác, nhân tố kích thích"
  },
  {
    "id": "v099",
    "word": "CHRONIC",
    "ipa": "ˈkrɒnɪk",
    "elo": 975,
    "level": "intermediate",
    "scenario": "Cái bệnh trì hoãn của tôi nó thành CHRONIC rồi, cứ phải sát nút mới bắt đầu vắt chân lên cổ.",
    "translationHint": "Mãn tính, kinh niên"
  },
  {
    "id": "v100",
    "word": "COMPREHENSIVE",
    "ipa": "ˌkɒmprɪˈhensɪv",
    "elo": 990,
    "level": "intermediate",
    "scenario": "Tôi cần một cái document COMPREHENSIVE hơn, chứ viết sơ sài thế này bố ai mà hiểu code kiểu gì.",
    "translationHint": "Toàn diện, bao quát"
  },
  {
    "id": "v101",
    "word": "CONTENTIOUS",
    "ipa": "kənˈtenʃəs",
    "elo": 1060,
    "level": "intermediate",
    "scenario": "Việc có nên dùng Tailwind hay không là một chủ đề CONTENTIOUS trong giới frontend hiện nay.",
    "translationHint": "Gây tranh cãi"
  },
  {
    "id": "v102",
    "word": "COUNTERPRODUCTIVE",
    "ipa": "ˌkaʊntəprəˈdʌktɪv",
    "elo": 1100,
    "level": "intermediate",
    "scenario": "Thức đêm để làm việc nhưng hôm sau ngủ bù cả ngày thì đúng là COUNTERPRODUCTIVE thật sự.",
    "translationHint": "Phản tác dụng"
  },
  {
    "id": "v103",
    "word": "CREDIBLE",
    "ipa": "ˈkredɪbl",
    "elo": 980,
    "level": "intermediate",
    "scenario": "Cái website này nhìn phèn quá, nhìn chẳng CREDIBLE tí nào, ai mà dám nhập thẻ credit vào đây.",
    "translationHint": "Đáng tin"
  },
  {
    "id": "v104",
    "word": "CUMULATIVE",
    "ipa": "ˈkjuːmjʊlətɪv",
    "elo": 1040,
    "level": "intermediate",
    "scenario": "Hệ quả CUMULATIVE của việc mỗi ngày học 5 từ vựng là sau một năm ông sẽ khác bọt hẳn.",
    "translationHint": "Tích lũy, dồn lại"
  },
  {
    "id": "v105",
    "word": "CYNICAL",
    "ipa": "ˈsɪnɪkl",
    "elo": 965,
    "level": "intermediate",
    "scenario": "Làm nghề này lâu năm khiến tôi trở nên CYNICAL, ai hứa hẹn gì tôi cũng thấy nghi nghi.",
    "translationHint": "Hoài nghi, yếm thế"
  },
  {
    "id": "v106",
    "word": "DECISIVE",
    "ipa": "dɪˈsaɪsɪv",
    "elo": 970,
    "level": "intermediate",
    "scenario": "Làm leader là phải DECISIVE, chứ cứ phân vân mãi thì team biết đường nào mà lần.",
    "translationHint": "Quyết đoán"
  },
  {
    "id": "v107",
    "word": "DETRIMENTAL",
    "ipa": "ˌdetrɪˈmentl",
    "elo": 1030,
    "level": "intermediate",
    "scenario": "Việc ngồi sai tư thế cả ngày rất DETRIMENTAL cho cái cột sống của anh em dev mình.",
    "translationHint": "Có hại, bất lợi"
  },
  {
    "id": "v108",
    "word": "DYNAMIC",
    "ipa": "daɪˈnæmɪk",
    "elo": 955,
    "level": "intermediate",
    "scenario": "Thấy JD ghi 'môi trường DYNAMIC' là hiểu chuẩn bị tinh thần task bay tới tấp, thay đổi xoành xoạch nhé.",
    "translationHint": "Năng động, thay đổi liên tục"
  },
  {
    "id": "v109",
    "word": "ELABORATE",
    "ipa": "ɪˈlæbərət",
    "elo": 990,
    "level": "intermediate",
    "scenario": "Ông có thể ELABORATE thêm về cái tính năng này không? Nghe còn mơ hồ quá.",
    "translationHint": "Giải thích chi tiết"
  },
  {
    "id": "v110",
    "word": "EMPIRICAL",
    "ipa": "ɪmˈpɪrɪkl",
    "elo": 1070,
    "level": "intermediate",
    "scenario": "Đừng có nói suông, đưa bằng chứng EMPIRICAL ra đây xem tốc độ load app nó tăng được bao nhiêu?",
    "translationHint": "Dựa trên thực tế, thực nghiệm"
  },
  {
    "id": "v111",
    "word": "EXPLICIT",
    "ipa": "ɪkˈsplɪsɪt",
    "elo": 1000,
    "level": "intermediate",
    "scenario": "Tôi đã dặn EXPLICIT là không được sửa cái file này rồi mà ông vẫn cứ táy máy tay chân nhỉ?",
    "translationHint": "Rõ ràng, dứt khoát"
  },
  {
    "id": "v112",
    "word": "FORMIDABLE",
    "ipa": "ˈfɔːmɪdəbl",
    "elo": 1050,
    "level": "intermediate",
    "scenario": "Đối thủ lần này FORMIDABLE vãi, tech stack của tụi nó toàn thứ dữ, mình phải cẩn thận.",
    "translationHint": "Đáng gờm"
  },
  {
    "id": "v113",
    "word": "FRAGMENTED",
    "ipa": "ˈfræɡməntɪd",
    "elo": 1020,
    "level": "intermediate",
    "scenario": "Hệ sinh thái của Android hơi bị FRAGMENTED, test app trên đống máy này mệt xỉu.",
    "translationHint": "Phân mảnh, rời rạc"
  },
  {
    "id": "v114",
    "word": "FUNDAMENTAL",
    "ipa": "ˌfʌndəˈmentl",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Mấy cái kiến thức FUNDAMENTAL về JavaScript mà không vững thì học framework chỉ có nát.",
    "translationHint": "Cơ bản, thiết yếu"
  },
  {
    "id": "v115",
    "word": "HYPOTHETICAL",
    "ipa": "ˌhaɪpəˈθetɪkl",
    "elo": 1080,
    "level": "intermediate",
    "scenario": "Đây chỉ là tình huống HYPOTHETICAL thôi, nhưng nếu bị hack hết database thì ông tính làm gì?",
    "translationHint": "Giả định, giả thuyết"
  },
  {
    "id": "v116",
    "word": "IMPLICIT",
    "ipa": "ɪmˈpɪrɪkl",
    "elo": 1040,
    "level": "intermediate",
    "scenario": "Dù sếp không nói ra, nhưng sự im lặng đó mang một thông điệp IMPLICIT là 'lo mà làm đi'.",
    "translationHint": "Ngầm định, ẩn ý"
  },
  {
    "id": "v117",
    "word": "INDISPENSABLE",
    "ipa": "ˌɪndɪˈspensəbl",
    "elo": 1090,
    "level": "intermediate",
    "scenario": "Cái thư viện này INDISPENSABLE cho project luôn rồi, gỡ ra cái là app tạch ngay.",
    "translationHint": "Không thể thiếu"
  },
  {
    "id": "v118",
    "word": "INTEGRATE",
    "ipa": "ˈɪntɪɡreɪt",
    "elo": 970,
    "level": "intermediate",
    "scenario": "Phải INTEGRATE thêm cái cổng thanh toán này vào app ngay trong tuần tới cho khách.",
    "translationHint": "Tích hợp"
  },
  {
    "id": "v119",
    "word": "INTUITIVE",
    "ipa": "ɪnˈtjuːɪtɪv",
    "elo": 1010,
    "level": "intermediate",
    "scenario": "Thiết kế UI phải làm sao cho nó INTUITIVE vào, để người dùng nhìn cái biết bấm đâu luôn.",
    "translationHint": "Trực quan, dễ hiểu"
  },
  {
    "id": "v120",
    "word": "LEVERAGE",
    "ipa": "ˈliːvərɪdʒ",
    "elo": 1000,
    "level": "intermediate",
    "scenario": "Cố gắng LEVERAGE đống code cũ đi, đừng có lúc nào cũng đòi viết lại từ đầu cho mệt.",
    "translationHint": "Tận dụng lợi thế"
  },
    {
    "id": "v121",
    "word": "MODICUM",
    "ipa": "ˈmɒdɪkəm",
    "elo": 1030,
    "level": "intermediate",
    "scenario": "Chỉ cần sếp có một MODICUM thấu hiểu cho anh em thôi là không khí văn phòng đã đỡ ngộp thở hơn rồi.",
    "translationHint": "Một chút, lượng nhỏ tối thiểu"
  },
  {
    "id": "v122",
    "word": "MOMENTUM",
    "ipa": "məˈmentəm",
    "elo": 990,
    "level": "intermediate",
    "scenario": "Đang có MOMENTUM code ngon lành thì thằng đồng nghiệp sang rủ đi hút thuốc làm đứt mạch luôn.",
    "translationHint": "Đà tiến, sức đẩy"
  },
  {
    "id": "v123",
    "word": "MONOTONOUS",
    "ipa": "məˈnɒtənəs",
    "elo": 975,
    "level": "intermediate",
    "scenario": "Mấy cái task MONOTONOUS như copy-paste data này làm tôi thấy mình giống robot hơn là kỹ sư.",
    "translationHint": "Đơn điệu, tẻ nhạt"
  },
  {
    "id": "v124",
    "word": "NAVIGATE",
    "ipa": "ˈnævɪɡeɪt",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Việc NAVIGATE trong đống legacy code không có document giống như đi lạc trong rừng rậm vậy.",
    "translationHint": "Điều hướng, tìm cách vượt qua"
  },
  {
    "id": "v125",
    "word": "OBJECTIVE",
    "ipa": "əbˈdʒektɪv",
    "elo": 950,
    "level": "intermediate",
    "scenario": "Nói một cách OBJECTIVE thì cái tính năng này chẳng giúp ích gì cho người dùng, chỉ tổ tốn tài nguyên.",
    "translationHint": "Khách quan, không định kiến"
  },
  {
    "id": "v126",
    "word": "OVERWHELMING",
    "ipa": "ˌəʊvəˈwelmɪŋ",
    "elo": 980,
    "level": "intermediate",
    "scenario": "Nhìn cái backlog còn 50 task mà deadline chỉ còn 2 ngày, cảm giác thật sự OVERWHELMING.",
    "translationHint": "Choáng ngợp, quá tải"
  },
  {
    "id": "v127",
    "word": "PARADOX",
    "ipa": "ˈpærədɒks",
    "elo": 1050,
    "level": "intermediate",
    "scenario": "Đúng là một cái PARADOX: Code càng phức tạp thì càng dễ lỗi, mà muốn fix lỗi lại phải thêm code phức tạp hơn.",
    "translationHint": "Nghịch lý"
  },
  {
    "id": "v128",
    "word": "PERCEIVE",
    "ipa": "pəˈsiːv",
    "elo": 1010,
    "level": "intermediate",
    "scenario": "Khách hàng PERCEIVE cái app mình là cao cấp chỉ vì mình đổi cái font chữ nhìn nó 'sang' hơn.",
    "translationHint": "Nhận thức, cảm nhận"
  },
  {
    "id": "v129",
    "word": "PERPETUAL",
    "ipa": "pəˈpetʃuəl",
    "elo": 1060,
    "level": "intermediate",
    "scenario": "Tôi luôn ở trong trạng thái PERPETUAL mệt mỏi, ngủ bao nhiêu cũng thấy không đủ.",
    "translationHint": "Liên tục, vĩnh cửu"
  },
  {
    "id": "v130",
    "word": "PREVALENT",
    "ipa": "ˈprevələnt",
    "elo": 1020,
    "level": "intermediate",
    "scenario": "Cái văn hóa 'làm màu' đang ngày càng PREVALENT trong mấy cái startup bây giờ.",
    "translationHint": "Phổ biến, thịnh hành"
  },
  {
    "id": "v131",
    "word": "PROACTIVE",
    "ipa": "ˌprəʊˈæktɪv",
    "elo": 975,
    "level": "intermediate",
    "scenario": "Thay vì đợi sếp nhắc, ông nên PROACTIVE cập nhật tình hình dự án đi cho đỡ bị ăn chửi.",
    "translationHint": "Chủ động"
  },
  {
    "id": "v132",
    "word": "PROFOUND",
    "ipa": "prəˈfaʊnd",
    "elo": 1040,
    "level": "intermediate",
    "scenario": "Những chia sẻ của anh ấy về nghề nghiệp mang lại cho tôi một sự thay đổi PROFOUND trong tư duy.",
    "translationHint": "Sâu sắc, thâm thúy"
  },
  {
    "id": "v133",
    "word": "RATIONAL",
    "ipa": "ˈræʃnəl",
    "elo": 965,
    "level": "intermediate",
    "scenario": "Đừng có cáu gắt, hãy đưa ra một cái giải trình RATIONAL xem tại sao dự án lại bị delay?",
    "translationHint": "Hợp lý, dựa trên lý trí"
  },
  {
    "id": "v134",
    "word": "SKEPTICAL",
    "ipa": "ˈskeptɪkl",
    "elo": 990,
    "level": "intermediate",
    "scenario": "Tôi hơi SKEPTICAL về mấy cái lời hứa 'lương tháng 13, 14' của mấy công ty này, nghe ảo lắm.",
    "translationHint": "Hoài nghi, ngờ vực"
  },
  {
    "id": "v135",
    "word": "SPONTANEOUS",
    "ipa": "spɒnˈteɪniəs",
    "elo": 1000,
    "level": "intermediate",
    "scenario": "Một chuyến đi du lịch SPONTANEOUS cuối tuần này có vẻ là ý hay để xả stress đấy.",
    "translationHint": "Ngẫu hứng, bột phát"
  },
  {
    "id": "v136",
    "word": "SUBJECTIVE",
    "ipa": "səbˈdʒektɪv",
    "elo": 975,
    "level": "intermediate",
    "scenario": "Cái đẹp là SUBJECTIVE, ông thấy cái UI này đẹp nhưng khách hàng thấy nó 'nhức mắt' thì vẫn phải sửa.",
    "translationHint": "Chủ quan"
  },
  {
    "id": "v137",
    "word": "SUSTAINABLE",
    "ipa": "səˈsteɪnəbl",
    "elo": 955,
    "level": "intermediate",
    "scenario": "Làm việc 14 tiếng một ngày không phải là cách làm SUSTAINABLE đâu, trụ được 1 tháng là ông cháy sạch năng lượng.",
    "translationHint": "Bền vững"
  },
  {
    "id": "v138",
    "word": "TRANSPARENT",
    "ipa": "trænsˈpærənt",
    "elo": 970,
    "level": "intermediate",
    "scenario": "Công ty cần TRANSPARENT hơn trong việc xét duyệt tăng lương, chứ cứ mập mờ thế này anh em nản.",
    "translationHint": "Minh bạch"
  },
  {
    "id": "v139",
    "word": "TRIVIAL",
    "ipa": "ˈtrɪviəl",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Đừng có tốn thời gian cãi nhau về mấy cái vấn đề TRIVIAL như dùng dấu nháy đơn hay nháy đôi nữa.",
    "translationHint": "Tầm thường, vụn vặt"
  },
  {
    "id": "v140",
    "word": "UNPRECEDENTED",
    "ipa": "ʌnˈpresɪdentɪd",
    "elo": 1070,
    "level": "intermediate",
    "scenario": "Đợt sụt giảm thị trường crypto vừa rồi là một sự kiện UNPRECEDENTED, không ai lường trước nổi.",
    "translationHint": "Chưa từng có tiền lệ"
  },
  {
    "id": "v141",
    "word": "VULNERABLE",
    "ipa": "ˈvʌlnərəbl",
    "elo": 1010,
    "level": "intermediate",
    "scenario": "Cái hệ thống này đang rất VULNERABLE trước các đợt tấn công mạng vì chưa update bản vá.",
    "translationHint": "Dễ bị tổn thương"
  },
  {
    "id": "v142",
    "word": "WARRANTED",
    "ipa": "ˈwɒrəntɪd",
    "elo": 1080,
    "level": "intermediate",
    "scenario": "Sự lo lắng của khách hàng là hoàn toàn WARRANTED khi app cứ crash liên tục thế này.",
    "translationHint": "Có cơ sở, được cho phép"
  },
  {
    "id": "v143",
    "word": "ACRIMONIOUS",
    "ipa": "ˌækrɪˈməʊniəs",
    "elo": 1150,
    "level": "advanced",
    "scenario": "Buổi họp kết thúc bằng một cuộc tranh cãi ACRIMONIOUS giữa bên dev và bên design.",
    "translationHint": "Cay nghiệt, đầy ác ý"
  },
  {
    "id": "v144",
    "word": "ADMONISH",
    "ipa": "ədˈmɒnɪʃ",
    "elo": 1200,
    "level": "advanced",
    "scenario": "Sếp ADMONISH tôi vì cái tội dám 'commit' code thẳng lên branch main mà không thèm qua review.",
    "translationHint": "Cảnh cáo, khiển trách nhẹ"
  },
  {
    "id": "v145",
    "word": "AFFLUENT",
    "ipa": "ˈæfluənt",
    "elo": 1120,
    "level": "advanced",
    "scenario": "Nhìn nhà cửa xe cộ là biết gia đình hắn ta thuộc hàng AFFLUENT rồi, đi làm chắc chỉ để trải nghiệm.",
    "translationHint": "Giàu có, thịnh vượng"
  },
  {
    "id": "v146",
    "word": "ALLEVIATE",
    "ipa": "əˈliːvieɪt",
    "elo": 1140,
    "level": "advanced",
    "scenario": "Có thêm một bạn intern hỗ trợ sẽ giúp ALLEVIATE được phần nào khối lượng công việc cho tôi.",
    "translationHint": "Giảm nhẹ, làm vơi bớt"
  },
  {
    "id": "v147",
    "word": "ALTRUISTIC",
    "ipa": "ˌæltruˈɪstɪk",
    "elo": 1180,
    "level": "advanced",
    "scenario": "Ông đừng có tỏ ra ALTRUISTIC, tôi biết ông giúp tôi là để sau này nhờ tôi gánh task hộ chứ gì.",
    "translationHint": "Vị tha, không vụ lợi"
  },
  {
    "id": "v148",
    "word": "ABERRANT",
    "ipa": "æˈberənt",
    "elo": 1130,
    "level": "advanced",
    "scenario": "Cái hành vi ABERRANT của hệ thống lúc 12h đêm làm tôi phải thức trắng để tìm nguyên nhân.",
    "translationHint": "Bất thường, lệch lạc"
  },
  {
    "id": "v149",
    "word": "ANACHRONISTIC",
    "ipa": "əˌnækrəˈnɪstɪk",
    "elo": 1280,
    "level": "advanced",
    "scenario": "Cái tư duy quản lý nhân viên theo kiểu chấm công từng phút thật sự là ANACHRONISTIC trong thời đại WFH này.",
    "translationHint": "Lỗi thời, sai thời điểm"
  },
  {
    "id": "v150",
    "word": "ANECDOTAL",
    "ipa": "ˌænɪkˈdəʊtl",
    "elo": 1160,
    "level": "advanced",
    "scenario": "Mấy cái tin đồn công ty sắp phá sản chỉ là ANECDOTAL thôi, đừng có nghe rồi hoảng loạn.",
    "translationHint": "Dựa trên lời kể, không chính thức"
  },
    {
    "id": "v151",
    "word": "ANOMALY",
    "ipa": "əˈnɒməli",
    "elo": 1170,
    "level": "advanced",
    "scenario": "Cái bug này đúng là một ANOMALY, test cả trăm lần không sao mà cứ hễ demo cho khách là nó hiện ra.",
    "translationHint": "Sự bất thường, dị thường"
  },
  {
    "id": "v152",
    "word": "ANTIQUATED",
    "ipa": "ˈæntɪkweɪtɪd",
    "elo": 1220,
    "level": "advanced",
    "scenario": "Dùng mấy cái tool ANTIQUATED này để quản lý dự án thì bảo sao năng suất không thấp cho được.",
    "translationHint": "Cổ lỗ sĩ, cũ kỹ"
  },
  {
    "id": "v153",
    "word": "APPREHENSIVE",
    "ipa": "ˌæprɪˈhensɪv",
    "elo": 1150,
    "level": "advanced",
    "scenario": "Tôi thấy hơi APPREHENSIVE về đợt update hệ thống tối nay, linh tính mách bảo là có gì đó không ổn.",
    "translationHint": "E sợ, lo lắng về điều gì đó sắp xảy ra"
  },
  {
    "id": "v154",
    "word": "ARDUOUS",
    "ipa": "ˈɑːdjuəs",
    "elo": 1200,
    "level": "advanced",
    "scenario": "Quá trình refactor lại toàn bộ đống code rác này là một hành trình ARDUOUS và đầy nước mắt.",
    "translationHint": "Gian nan, cực nhọc"
  },
  {
    "id": "v155",
    "word": "AUSTERE",
    "ipa": "ɒˈstɪə",
    "elo": 1240,
    "level": "advanced",
    "scenario": "Lối sống AUSTERE của ông ấy: chỉ ăn cơm hộp và code 16 tiếng mỗi ngày để tiết kiệm tiền mua nhà.",
    "translationHint": "Khắc khổ, giản dị quá mức"
  },
  {
    "id": "v156",
    "word": "BANAL",
    "ipa": "bəˈnɑːl",
    "elo": 1180,
    "level": "advanced",
    "scenario": "Mấy cái bài post 'Cố gắng lên bạn ơi' trên LinkedIn nghe BANAL vãi, sáo rỗng chẳng giúp ích gì.",
    "translationHint": "Tầm thường, vô vị, sáo rỗng"
  },
  {
    "id": "v157",
    "word": "BENEVOLENT",
    "ipa": "bəˈnevələnt",
    "elo": 1160,
    "level": "advanced",
    "scenario": "Anh lead này BENEVOLENT lắm, thấy anh em mệt là tự bỏ tiền túi ra order trà sữa về bồi bổ ngay.",
    "translationHint": "Nhân từ, rộng lượng"
  },
  {
    "id": "v158",
    "word": "CALLOUS",
    "ipa": "ˈkæləs",
    "elo": 1190,
    "level": "advanced",
    "scenario": "Cái cách công ty sa thải nhân viên thâm niên đúng là CALLOUS, không một lời thông báo trước.",
    "translationHint": "Vô tâm, nhẫn tâm"
  },
  {
    "id": "v159",
    "word": "CAPITULATE",
    "ipa": "kəˈpɪtʃʊleɪt",
    "elo": 1250,
    "level": "advanced",
    "scenario": "Sau 2 tiếng tranh luận gay gắt, tôi đành phải CAPITULATE và làm theo cái yêu cầu vô lý của khách hàng.",
    "translationHint": "Đầu hàng, chịu khuất phục"
  },
  {
    "id": "v160",
    "word": "CIRCUMVENT",
    "ipa": "ˌsɜːkəmˈvent",
    "elo": 1230,
    "level": "advanced",
    "scenario": "Thằng đó luôn tìm cách CIRCUMVENT mấy cái quy trình an mật của công ty để cài phần mềm lậu.",
    "translationHint": "Dùng mưu mẹo để lách luật"
  },
  {
    "id": "v161",
    "word": "CLANDESTINE",
    "ipa": "klænˈdestɪn",
    "elo": 1270,
    "level": "advanced",
    "scenario": "Mấy ông nội đang có một cuộc họp CLANDESTINE trong phòng kín, chắc lại sắp có biến gì rồi.",
    "translationHint": "Bí mật, lén lút"
  },
  {
    "id": "v162",
    "word": "COERCE",
    "ipa": "kəʊˈɜːs",
    "elo": 1210,
    "level": "advanced",
    "scenario": "Đừng có dùng chức quyền để COERCE nhân viên làm thêm giờ mà không trả lương, kỳ lắm.",
    "translationHint": "Ép buộc, cưỡng bức"
  },
  {
    "id": "v163",
    "word": "COMPLACENT",
    "ipa": "kəmˈpleɪsnt",
    "elo": 1170,
    "level": "advanced",
    "scenario": "Đừng có COMPLACENT với những gì mình đang biết, công nghệ nó thay đổi nhanh lắm, không học là bị đào thải ngay.",
    "translationHint": "Tự mãn, hài lòng với bản thân"
  },
  {
    "id": "v164",
    "word": "CONCEDE",
    "ipa": "kənˈsiːd",
    "elo": 1150,
    "level": "advanced",
    "scenario": "Tôi buộc phải CONCEDE là giải pháp của ông tối ưu hơn của tôi, mặc dù tôi không thích ông tí nào.",
    "translationHint": "Thừa nhận (thường là miễn cưỡng)"
  },
  {
    "id": "v165",
    "word": "CONDESCENDING",
    "ipa": "ˌkɒndɪˈsendɪŋ",
    "elo": 1200,
    "level": "advanced",
    "scenario": "Cái giọng CONDESCENDING của hắn khi nói chuyện với intern làm ai nhìn vào cũng thấy ngứa mắt.",
    "translationHint": "Ra vẻ bề trên, khinh khỉnh"
  },
  {
    "id": "v166",
    "word": "CONVOLUTED",
    "ipa": "ˈkɒnvəluːtɪd",
    "elo": 1220,
    "level": "advanced",
    "scenario": "Cái logic xử lý của cái module này CONVOLUTED quá, đọc muốn nổ cả não mà chưa hiểu gì.",
    "translationHint": "Phức tạp, rắc rối"
  },
  {
    "id": "v167",
    "word": "CREDULOUS",
    "ipa": "ˈkredjʊləs",
    "elo": 1180,
    "level": "advanced",
    "scenario": "Sao ông CREDULOUS thế? Nó bảo 'việc nhẹ lương cao' mà ông cũng tin cho được à?",
    "translationHint": "Cả tin, dễ tin người"
  },
  {
    "id": "v168",
    "word": "CURTAIL",
    "ipa": "kɜːˈteɪl",
    "elo": 1190,
    "level": "advanced",
    "scenario": "Công ty đang tìm cách CURTAIL mọi khoản chi phí không cần thiết sau một năm làm ăn thua lỗ.",
    "translationHint": "Cắt bớt, rút ngắn"
  },
  {
    "id": "v169",
    "word": "CYNICISM",
    "ipa": "ˈsɪnɪsɪzəm",
    "elo": 1160,
    "level": "advanced",
    "scenario": "Sự CYNICISM của ông ấy đối với các startup mới là do ông ấy đã từng bị lừa trắng tay 3 lần.",
    "translationHint": "Thái độ hoài nghi, yếm thế"
  },
  {
    "id": "v170",
    "word": "DEBILITATING",
    "ipa": "dɪˈbɪlɪteɪtɪŋ",
    "elo": 1240,
    "level": "advanced",
    "scenario": "Cái bệnh đau lưng DEBILITATING này làm tôi không thể tập trung ngồi code quá 15 phút.",
    "translationHint": "Làm suy nhược, làm kiệt sức"
  },
  {
    "id": "v171",
    "word": "DELINEATE",
    "ipa": "dɪˈlɪnieɪt",
    "elo": 1260,
    "level": "advanced",
    "scenario": "Dự án này cần DELINEATE rõ ràng trách nhiệm của từng người, chứ không là cứ đùn đẩy nhau suốt.",
    "translationHint": "Vạch ra, mô tả chi tiết"
  },
  {
    "id": "v172",
    "word": "DISCREPANCY",
    "ipa": "dɪˈskrepənsi",
    "elo": 1200,
    "level": "advanced",
    "scenario": "Có một sự DISCREPANCY cực lớn giữa số tiền ghi trên hóa đơn và số tiền thực tế nhận được.",
    "translationHint": "Sự khác nhau, không thống nhất"
  },
  {
    "id": "v173",
    "word": "DISMISSIVE",
    "ipa": "dɪsˈmɪsɪv",
    "elo": 1170,
    "level": "advanced",
    "scenario": "Ông đừng có thái độ DISMISSIVE với ý kiến của người khác như vậy, lỡ họ nói đúng thì sao?",
    "translationHint": "Gạt bỏ, coi thường"
  },
  {
    "id": "v174",
    "word": "DISPARATE",
    "ipa": "ˈdɪspərət",
    "elo": 1210,
    "level": "advanced",
    "scenario": "Phải kết hợp đống dữ liệu DISPARATE này thành một cái report hoàn chỉnh đúng là một cực hình.",
    "translationHint": "Khác hẳn nhau, tạp nham"
  },
  {
    "id": "v175",
    "word": "DRACONIAN",
    "ipa": "drəˈkəʊniən",
    "elo": 1280,
    "level": "advanced",
    "scenario": "Chính sách phạt tiền khi đi muộn ở đây đúng là DRACONIAN, đi trễ 1 phút phạt 100k.",
    "translationHint": "Hà khắc, khắc nghiệt"
  },
  {
    "id": "v176",
    "word": "DUPLICITOUS",
    "ipa": "djuːˈplɪsɪtəs",
    "elo": 1300,
    "level": "advanced",
    "scenario": "Cái thằng đó sống DUPLICITOUS lắm, trước mặt thì anh anh em em, sau lưng thì đâm chọt đủ điều.",
    "translationHint": "Hai mặt, gian trá"
  },
  {
    "id": "v177",
    "word": "ELUSIVE",
    "ipa": "ɪˈluːsɪv",
    "elo": 1190,
    "level": "advanced",
    "scenario": "Cái bug này ELUSIVE thật sự, cứ tưởng fix được rồi mà lúc sau nó lại hiện ra ở chỗ khác.",
    "translationHint": "Khó nắm bắt, hay lảng tránh"
  },
  {
    "id": "v178",
    "word": "EMULATE",
    "ipa": "ˈemjʊleɪt",
    "elo": 1160,
    "level": "advanced",
    "scenario": "Tôi luôn cố gắng EMULATE cái cách mà anh lead xử lý vấn đề, cực kỳ bình tĩnh và hiệu quả.",
    "translationHint": "Noi gương, học tập theo"
  },
  {
    "id": "v179",
    "word": "EQUIVOCATE",
    "ipa": "ɪˈkwɪvəkeɪt",
    "elo": 1290,
    "level": "advanced",
    "scenario": "Đừng có EQUIVOCATE nữa, trả lời thẳng vào vấn đề đi: Dự án này bao giờ thì xong?",
    "translationHint": "Nói mập mờ, lập lờ để lừa dối"
  },
  {
    "id": "v180",
    "word": "EXORBITANT",
    "ipa": "ɪɡˈzɔːbɪtənt",
    "elo": 1220,
    "level": "advanced",
    "scenario": "Cái giá cho một cốc cà phê ở khu vực này đúng là EXORBITANT, bằng mẹ nó tiền ăn cả ngày của tôi.",
    "translationHint": "Quá mức, cắt cổ (về giá cả)"
  },
    {
    "id": "v181",
    "word": "EXPEDIENT",
    "ipa": "ɪkˈspiːdiənt",
    "elo": 1230,
    "level": "advanced",
    "scenario": "Thôi cứ dùng giải pháp EXPEDIENT này đi, fix tạm cho app chạy cái đã rồi mai tính tiếp, deadline tới mông rồi.",
    "translationHint": "Tiện lợi nhất thời, thực dụng"
  },
  {
    "id": "v182",
    "word": "EXTRANEOUS",
    "ipa": "ɪkˈstreɪniəs",
    "elo": 1250,
    "level": "advanced",
    "scenario": "Ông xóa bớt mấy cái log EXTRANEOUS này đi, nhìn rối cả mắt mà chẳng giúp ích gì cho việc debug cả.",
    "translationHint": "Không liên quan, ngoài lề"
  },
  {
    "id": "v183",
    "word": "FALLACIOUS",
    "ipa": "fəˈleɪʃəs",
    "elo": 1270,
    "level": "advanced",
    "scenario": "Cái lập luận 'app chậm là do người dùng mạng yếu' của ông đúng là FALLACIOUS, do code ông tối ưu kém thì có.",
    "translationHint": "Sai lầm, ngụy biện"
  },
  {
    "id": "v184",
    "word": "FASTIDIOUS",
    "ipa": "fæˈstɪdiəs",
    "elo": 1240,
    "level": "advanced",
    "scenario": "Lão khách hàng này FASTIDIOUS vãi, lệch 1 pixel thôi lão cũng bắt chỉnh lại bằng được mới chịu trả tiền.",
    "translationHint": "Khó tính, cầu kỳ thái quá"
  },
  {
    "id": "v185",
    "word": "FERVENT",
    "ipa": "ˈfɜːvənt",
    "elo": 1180,
    "level": "advanced",
    "scenario": "Hắn ta là một người FERVENT tin vào tiền ảo, lúc nào cũng rủ rê anh em đầu tư để 'đổi đời'.",
    "translationHint": "Nồng nhiệt, tha thiết"
  },
  {
    "id": "v186",
    "word": "FLAGRANT",
    "ipa": "ˈfleɪɡrənt",
    "elo": 1210,
    "level": "advanced",
    "scenario": "Việc ông copy nguyên si code của project khác rồi bảo mình tự viết là một sự vi phạm bản quyền FLAGRANT.",
    "translationHint": "Trắng trợn, lộ liễu"
  },
  {
    "id": "v187",
    "word": "FLEETING",
    "ipa": "ˈfliːtɪŋ",
    "elo": 1130,
    "level": "advanced",
    "scenario": "Cái động lực làm việc của tôi nó FLEETING lắm, hăng hái được 5 phút xong lại nằm lướt TikTok tiếp.",
    "translationHint": "Thoáng qua, phù du"
  },
  {
    "id": "v188",
    "word": "FORTHRIGHT",
    "ipa": "ˈfɔːθraɪt",
    "elo": 1160,
    "level": "advanced",
    "scenario": "Tôi thích cái cách ông ấy FORTHRIGHT thừa nhận sai lầm trong thiết kế hệ thống, bớt tốn thời gian đổ lỗi.",
    "translationHint": "Thẳng thắn, bộc trực"
  },
  {
    "id": "v189",
    "word": "FRUGAL",
    "ipa": "ˈfruːɡl",
    "elo": 1140,
    "level": "advanced",
    "scenario": "Lối sống FRUGAL của anh em dev: đi làm mang cơm theo cho tiết kiệm để tiền đấy mua bàn phím cơ.",
    "translationHint": "Tiết kiệm, thanh đạm"
  },
  {
    "id": "v190",
    "word": "FUTILE",
    "ipa": "ˈfjuːtaɪl",
    "elo": 1170,
    "level": "advanced",
    "scenario": "Mọi nỗ lực giải thích cho bà chị HR hiểu về tech stack đều trở nên FUTILE vì bả chỉ quan tâm đến bằng cấp.",
    "translationHint": "Vô ích, không kết quả"
  },
  {
    "id": "v191",
    "word": "GRATUITOUS",
    "ipa": "ɡrəˈtjuːɪtəs",
    "elo": 1260,
    "level": "advanced",
    "scenario": "Mấy cái hiệu ứng chuyển trang GRATUITOUS này làm app nặng thêm chứ chẳng giúp trải nghiệm tốt hơn tí nào.",
    "translationHint": "Vô lý, không cần thiết"
  },
  {
    "id": "v192",
    "word": "HEGEMONY",
    "ipa": "hɪˈɡeməni",
    "elo": 1300,
    "level": "advanced",
    "scenario": "Sự thống trị của Google trong mảng tìm kiếm là một cái HEGEMONY mà chưa ai có thể lật đổ được.",
    "translationHint": "Sự bá quyền, thống trị"
  },
  {
    "id": "v193",
    "word": "HUBRIS",
    "ipa": "ˈhjuːbrɪs",
    "elo": 1280,
    "level": "advanced",
    "scenario": "Chính cái HUBRIS khi nghĩ mình là senior 'không bao giờ sai' đã khiến ông ta làm bay màu sạch database.",
    "translationHint": "Sự ngạo mạn quá mức"
  },
  {
    "id": "v194",
    "word": "HYPOCRITICAL",
    "ipa": "ˌhɪpəˈkrɪtɪkl",
    "elo": 1190,
    "level": "advanced",
    "scenario": "Thật là HYPOCRITICAL khi sếp bắt anh em đi làm đúng giờ trong khi lão toàn 10h mới có mặt.",
    "translationHint": "Đạo đức giả"
  },
  {
    "id": "v195",
    "word": "IDEALISTIC",
    "ipa": "aɪˌdɪəˈlɪstɪk",
    "elo": 1150,
    "level": "advanced",
    "scenario": "Cái suy nghĩ 'làm vì đam mê không cần lương' nghe thật IDEALISTIC, nhưng thực tế là tiền nhà không ai đóng hộ.",
    "translationHint": "Lý tưởng hóa, xa rời thực tế"
  },
  {
    "id": "v196",
    "word": "INADVERTENT",
    "ipa": "ˌɪnədˈvɜːtnt",
    "elo": 1230,
    "level": "advanced",
    "scenario": "Tôi lỡ tay bấm INADVERTENT vào nút delete toàn bộ data, giờ thì chuẩn bị dọn đồ về vườn thôi.",
    "translationHint": "Vô ý, không chủ tâm"
  },
  {
    "id": "v197",
    "word": "INCONGRUENT",
    "ipa": "ɪnˈkɒŋɡruənt",
    "elo": 1260,
    "level": "advanced",
    "scenario": "Cái hành động của ông nó hoàn toàn INCONGRUENT với những gì ông hứa trong buổi họp tuần trước.",
    "translationHint": "Không phù hợp, mâu thuẫn"
  },
  {
    "id": "v198",
    "word": "INDOLENT",
    "ipa": "ˈɪndələnt",
    "elo": 1200,
    "level": "advanced",
    "scenario": "Cái nết INDOLENT này của ông mà không sửa thì chẳng có cái task nào hoàn thành đúng hạn được đâu.",
    "translationHint": "Lười biếng, nhác làm"
  },
  {
    "id": "v199",
    "word": "INEXORABLE",
    "ipa": "ɪnˈeksərəbl",
    "elo": 1310,
    "level": "advanced",
    "scenario": "Sự tiến bộ của AI là một xu hướng INEXORABLE, thay vì sợ hãi thì mình nên tìm cách sống chung với nó.",
    "translationHint": "Không thể lay chuyển/ngăn cản"
  },
  {
    "id": "v200",
    "word": "INSIDIOUS",
    "ipa": "ɪnˈsɪdiəs",
    "elo": 1270,
    "level": "advanced",
    "scenario": "Mấy cái nợ kỹ thuật (tech debt) nó INSIDIOUS lắm, ban đầu không thấy gì nhưng sau này gỡ mệt xỉu.",
    "translationHint": "Âm thầm nguy hại"
  },
  {
    "id": "v201",
    "word": "INTRANSIGENT",
    "ipa": "ɪnˈtrænsɪdʒənt",
    "elo": 1290,
    "level": "advanced",
    "scenario": "Lão sếp INTRANSIGENT đến mức không chịu lắng nghe bất kỳ góp ý nào về việc thay đổi quy trình làm việc.",
    "translationHint": "Cố chấp, không nhượng bộ"
  },
  {
    "id": "v202",
    "word": "IRREVOCABLE",
    "ipa": "ɪˈrevəkəbl",
    "elo": 1300,
    "level": "advanced",
    "scenario": "Một khi đã bấm deploy lên production thì quyết định đó coi như là IRREVOCABLE, sướng hay khổ phải chịu.",
    "translationHint": "Không thể vãn hồi/thay đổi"
  },
  {
    "id": "v203",
    "word": "LAMENTABLE",
    "ipa": "ˈlæməntəbl",
    "elo": 1220,
    "level": "advanced",
    "scenario": "Tình trạng code của project này thật sự là LAMENTABLE, nát đến mức không thể cứu vãn nổi.",
    "translationHint": "Đáng buồn, đáng tiếc"
  },
  {
    "id": "v204",
    "word": "LETHARGIC",
    "ipa": "ləˈθɑːdʒɪk",
    "elo": 1180,
    "level": "advanced",
    "scenario": "Sáng nay thức dậy thấy người LETHARGIC quá, chắc do đêm qua thức cày code muộn quá đây mà.",
    "translationHint": "Uể oải, lờ đờ"
  },
  {
    "id": "v205",
    "word": "LUCID",
    "ipa": "ˈluːsɪd",
    "elo": 1140,
    "level": "advanced",
    "scenario": "Lâu lắm mới thấy ông này có một cái giải trình LUCID và dễ hiểu đến như vậy, chắc mới uống cà phê xong.",
    "translationHint": "Sáng suốt, rõ ràng"
  },
  {
    "id": "v206",
    "word": "MAGNANIMOUS",
    "ipa": "mæɡˈnænɪməs",
    "elo": 1250,
    "level": "advanced",
    "scenario": "Lead mình rất MAGNANIMOUS, sẵn sàng gánh tội thay cho anh em khi dự án bị chậm tiến độ.",
    "translationHint": "Hào hiệp, cao thượng"
  },
  {
    "id": "v207",
    "word": "MALLEABLE",
    "ipa": "ˈmæliəbl",
    "elo": 1210,
    "level": "advanced",
    "scenario": "Mấy đứa intern mới vào thường rất MALLEABLE, dạy gì nghe nấy, dễ uốn nắn hơn mấy ông senior cứng đầu.",
    "translationHint": "Dễ bị tác động, dễ uốn nắn"
  },
  {
    "id": "v208",
    "word": "MENDACIOUS",
    "ipa": "menˈdeɪʃəs",
    "elo": 1320,
    "level": "advanced",
    "scenario": "Cái bản báo cáo MENDACIOUS này nhằm che đậy sự thật là dự án đang nát bét, đừng hòng lừa được tôi.",
    "translationHint": "Sai sự thật, giả dối"
  },
  {
    "id": "v209",
    "word": "MELANCHOLY",
    "ipa": "ˈmelənkɒli",
    "elo": 1160,
    "level": "advanced",
    "scenario": "Chiều Chủ nhật ngồi nghe nhạc trịnh xong thấy lòng MELANCHOLY vãi, nghĩ đến cảnh mai đi làm mà nản.",
    "translationHint": "U sầu, buồn bã"
  },
  {
    "id": "v210",
    "word": "MOLLIFY",
    "ipa": "ˈmɒlɪfaɪ",
    "elo": 1130,
    "level": "advanced",
    "scenario": "Tôi phải hứa dắt crush đi ăn lẩu mới có thể MOLLIFY được cơn giận của bả vì tội quên reply tin nhắn.",
    "translationHint": "Làm nguôi đi, xoa dịu"
  },
    {
    "id": "v211",
    "word": "MERCURIAL",
    "ipa": "mɜːˈkjʊəriəl",
    "elo": 1110,
    "level": "advanced",
    "scenario": "Cái nết MERCURIAL của lão sếp làm anh em mệt mỏi vãi, sáng vừa khen lấy khen để, chiều đã quay sang chửi như tát nước vào mặt.",
    "translationHint": "Thất thường, hay thay đổi"
  },
  {
    "id": "v212",
    "word": "NEFARIOUS",
    "ipa": "nɪˈfeəriəs",
    "elo": 1310,
    "level": "advanced",
    "scenario": "Tôi nghi ngờ có âm mưu NEFARIOUS đằng sau việc toàn bộ server bị 'wipe' sạch data ngay trước ngày bàn giao.",
    "translationHint": "Hung ác, bất chính"
  },
  {
    "id": "v213",
    "word": "NONCHALANT",
    "ipa": "ˌnɒnʃəˈlɑːnt",
    "elo": 1190,
    "level": "advanced",
    "scenario": "Server sập mà lão lead vẫn cứ NONCHALANT ngồi húp mì tôm như không có chuyện gì xảy ra, nể thật sự.",
    "translationHint": "Thờ ơ, lãnh đạm"
  },
  {
    "id": "v214",
    "word": "NOSTALGIC",
    "ipa": "nɒˈstældʒɪk",
    "elo": 1130,
    "level": "advanced",
    "scenario": "Ngồi nhìn đống code cũ hồi mới tập tành làm web mà thấy NOSTALGIC vãi, hồi đó ngu ngơ nhưng mà vui.",
    "translationHint": "Hoài niệm"
  },
  {
    "id": "v215",
    "word": "OBLIVIOUS",
    "ipa": "əˈblɪviəs",
    "elo": 1160,
    "level": "advanced",
    "scenario": "Thằng đó OBLIVIOUS đến mức không nhận ra là cả team đang 'cạch mặt' nó vì cái thói hay báo task.",
    "translationHint": "Vô tâm, không nhận thấy"
  },
  {
    "id": "v216",
    "word": "OMINOUS",
    "ipa": "ˈɒmɪnəs",
    "elo": 1180,
    "level": "advanced",
    "scenario": "Cái thông báo 'Meeting khẩn toàn công ty' lúc 5h chiều thứ Sáu nghe OMINOUS vãi, chắc lại sắp layoff rồi.",
    "translationHint": "Điềm xấu, đáng lo ngại"
  },
  {
    "id": "v217",
    "word": "OPAQUE",
    "ipa": "əʊˈpeɪk",
    "elo": 1200,
    "level": "advanced",
    "scenario": "Cái cơ chế tính bonus của công ty này OPAQUE vãi, chẳng ai biết tại sao người được nhiều người được ít.",
    "translationHint": "Mập mờ, không minh bạch"
  },
  {
    "id": "v218",
    "word": "OSTENTATIOUS",
    "ipa": "ˌɒstənˈteɪʃəs",
    "elo": 1300,
    "level": "advanced",
    "scenario": "Mấy cái văn phòng startup cứ thích trang trí OSTENTATIOUS cho cố vào, trong khi lương nhân viên thì nợ mấy tháng trời.",
    "translationHint": "Phô trương, khoe mẽ"
  },
  {
    "id": "v219",
    "word": "PEDANTIC",
    "ipa": "pɪˈdæntɪk",
    "elo": 1250,
    "level": "advanced",
    "scenario": "Lão Reviewer PEDANTIC vãi, code chạy ngon ơ mà lão cứ bắt sửa từng cái dấu cách với xuống dòng cho đúng chuẩn lão mới chịu.",
    "translationHint": "Câu nệ, soi xét tiểu tiết"
  },
  {
    "id": "v220",
    "word": "PERFIDIOUS",
    "ipa": "pəˈfɪdiəs",
    "elo": 1330,
    "level": "advanced",
    "scenario": "Hành động PERFIDIOUS nhất là rủ anh em cùng nghỉ việc, xong mình thì ở lại nhận chức team lead của những người đã đi.",
    "translationHint": "Phản bội, xảo trá"
  },
  {
    "id": "v221",
    "word": "PERTINENT",
    "ipa": "ˈpɜːtɪnənt",
    "elo": 1150,
    "level": "advanced",
    "scenario": "Trong buổi họp 3 tiếng, chỉ có đúng một câu hỏi của ông là PERTINENT vào vấn đề, còn lại toàn nói nhảm.",
    "translationHint": "Đúng trọng tâm, liên quan trực tiếp"
  },
  {
    "id": "v222",
    "word": "PHLEGMATIC",
    "ipa": "fleɡˈmætɪk",
    "elo": 1280,
    "level": "advanced",
    "scenario": "Mấy ông PHLEGMATIC làm việc chung sướng vãi, có biến gì cũng bình tĩnh xử lý chứ không có cuống cuồng lên.",
    "translationHint": "Điềm tĩnh, lạnh lùng"
  },
  {
    "id": "v223",
    "word": "PLACID",
    "ipa": "ˈplæsɪd",
    "elo": 1200,
    "level": "advanced",
    "scenario": "Vẻ ngoài PLACID của khách hàng lúc này làm tôi thấy lo hơn, chắc là đang chuẩn bị gom hết lỗi để chửi một thể đây.",
    "translationHint": "Điềm tĩnh, lặng lẽ"
  },
  {
    "id": "v224",
    "word": "POLARIZING",
    "ipa": "ˈpəʊləraɪzɪŋ",
    "elo": 1170,
    "level": "advanced",
    "scenario": "Vấn đề dùng 'Tab' hay 'Space' đúng là cực kỳ POLARIZING trong cộng đồng dev, cãi nhau cả chục năm chưa xong.",
    "translationHint": "Gây chia rẽ, phân cực"
  },
  {
    "id": "v225",
    "word": "POMPOUS",
    "ipa": "ˈpɒmpəs",
    "elo": 1220,
    "level": "advanced",
    "scenario": "Mấy ông diễn giả hay dùng giọng POMPOUS để nói về những đạo lý ai cũng biết, nghe mà buồn ngủ.",
    "translationHint": "Hợm hĩnh, vênh váo"
  },
  {
    "id": "v226",
    "word": "PUNCTILIOUS",
    "ipa": "pʌŋkˈtɪliəs",
    "elo": 1280,
    "level": "advanced",
    "scenario": "Bà kế toán PUNCTILIOUS vãi, sai một chữ cái trong hóa đơn thôi cũng bắt về viết lại từ đầu.",
    "translationHint": "Kỹ lưỡng, câu nệ nghi thức"
  },
  {
    "id": "v227",
    "word": "PRECARIOUS",
    "ipa": "prɪˈkeəriəs",
    "elo": 1190,
    "level": "advanced",
    "scenario": "Cái hệ thống này đang ở trong tình trạng PRECARIOUS vãi, chỉ cần một con bot ddos nhẹ thôi là sập toàn tập.",
    "translationHint": "Bấp bênh, nguy hiểm"
  },
  {
    "id": "v228",
    "word": "PRESUMPTUOUS",
    "ipa": "prɪˈzʌmptʃuəs",
    "elo": 1260,
    "level": "advanced",
    "scenario": "Thật là PRESUMPTUOUS khi ông nghĩ rằng mình giỏi hơn cả cái team đã làm project này 3 năm nay.",
    "translationHint": "Tự phụ, quá trớn"
  },
  {
    "id": "v229",
    "word": "PRETENTIOUS",
    "ipa": "prɪˈtenʃəs",
    "elo": 1230,
    "level": "advanced",
    "scenario": "Cái profile LinkedIn của lão trông PRETENTIOUS vãi, ghi toàn chức danh nghe kêu như chuông mà hỏi kiến thức thì rỗng tuếch.",
    "translationHint": "Giả tạo, tự cao tự đại"
  },
  {
    "id": "v230",
    "word": "PUGNACIOUS",
    "ipa": "pʌɡˈneɪʃəs",
    "elo": 1260,
    "level": "advanced",
    "scenario": "Ông đừng có PUGNACIOUS thế, người ta chỉ góp ý nhẹ thôi mà đã nhảy dựng lên muốn đánh người ta rồi.",
    "translationHint": "Hay gây gổ, hiếu chiến"
  },
  {
    "id": "v231",
    "word": "ABNEGATION",
    "ipa": "ˌæbnɪˈɡeɪʃn",
    "elo": 1380,
    "level": "expert",
    "scenario": "Sự ABNEGATION của anh ấy đối với đời sống cá nhân để tập trung cứu dự án làm ai cũng nể, nhưng mà hơi cực đoan.",
    "translationHint": "Sự hy sinh, từ bỏ quyền lợi"
  },
  {
    "id": "v232",
    "word": "ABSTEMIOUS",
    "ipa": "əbˈstiːmiəs",
    "elo": 1420,
    "level": "expert",
    "scenario": "Bác sĩ bảo phải ABSTEMIOUS với trà sữa và cà phê nếu không muốn cái dạ dày biểu tình, nhưng khó quá Long ơi.",
    "translationHint": "Tiết chế, điều độ (ăn uống)"
  },
  {
    "id": "v233",
    "word": "ACERBIC",
    "ipa": "əˈsɜːbɪk",
    "elo": 1390,
    "level": "expert",
    "scenario": "Mấy cái nhận xét ACERBIC của ông lead làm intern khóc sưng cả mắt, biết là đúng nhưng mà gắt quá.",
    "translationHint": "Chua cay, gay gắt"
  },
  {
    "id": "v234",
    "word": "ACUMEN",
    "ipa": "ˈækjʊmən",
    "elo": 1400,
    "level": "expert",
    "scenario": "Cái ACUMEN trong kinh doanh của lão sếp đúng là không đùa được, nhìn đâu cũng thấy ra tiền.",
    "translationHint": "Sự nhạy bén, sắc sảo"
  },
  {
    "id": "v235",
    "word": "ADUMBRATE",
    "ipa": "ˈædʌmbreɪt",
    "elo": 1470,
    "level": "expert",
    "scenario": "Trong buổi kickoff, sếp chỉ ADUMBRATE sơ qua về tầm nhìn của dự án, còn chi tiết thì... đợi khi nào có rồi tính.",
    "translationHint": "Phác thảo, ám chỉ sơ lược"
  },
  {
    "id": "v236",
    "word": "ANACHRONISM",
    "ipa": "əˈnækrənɪzəm",
    "elo": 1440,
    "level": "expert",
    "scenario": "Thời buổi này mà vẫn dùng jQuery cho project mới thì đúng là một cái ANACHRONISM không thể chấp nhận được.",
    "translationHint": "Sự lỗi thời, sai thời đại"
  },
  {
    "id": "v237",
    "word": "ANATHEMA",
    "ipa": "əˈnæθəmə",
    "elo": 1460,
    "level": "expert",
    "scenario": "Họp hành vô tội vạ là một cái ANATHEMA đối với dân dev mình, chỉ tổ tốn thời gian chứ chẳng giải quyết được gì.",
    "translationHint": "Điều cực kỳ ghét bỏ"
  },
  {
    "id": "v238",
    "word": "APOCRYPHAL",
    "ipa": "əˈpɒkrɪfl",
    "elo": 1450,
    "level": "expert",
    "scenario": "Mấy cái câu chuyện về 'thần đồng code 10 tuổi' thường là APOCRYPHAL thôi, đừng có tin rồi tự tạo áp lực cho mình.",
    "translationHint": "Không xác thực, bịa đặt"
  },
  {
    "id": "v239",
    "word": "APOTHEOSIS",
    "ipa": "əˌɒθiˈəʊsɪs",
    "elo": 1490,
    "level": "expert",
    "scenario": "Được làm việc tại Google từng là APOTHEOSIS của sự nghiệp dev, nhưng giờ thì mọi chuyện đã khác nhiều rồi.",
    "translationHint": "Đỉnh cao, sự thần thánh hóa"
  },
  {
    "id": "v240",
    "word": "APPROBATION",
    "ipa": "ˌæprəˈbeɪʃn",
    "elo": 1430,
    "level": "expert",
    "scenario": "Phải vất vả lắm tôi mới nhận được sự APPROBATION của ông CTO cho cái kiến trúc hệ thống mới này.",
    "translationHint": "Sự tán thành, chấp thuận"
  },
    {
    "id": "v241",
    "word": "ARCANE",
    "ipa": "ɑːˈkeɪn",
    "elo": 1380,
    "level": "expert",
    "scenario": "Mấy cái thuật ngữ ARCANE trong smart contract này làm tôi đọc muốn nổ não, đúng là chỉ có mấy ông thần crypto mới hiểu nổi.",
    "translationHint": "Bí ẩn, kỳ bí, khó hiểu"
  },
  {
    "id": "v242",
    "word": "ARRANT",
    "ipa": "ˈærənt",
    "elo": 1460,
    "level": "expert",
    "scenario": "Việc ông bảo code này 'tự chạy' mà không cần server đúng là một sự ARRANT bốc phét, định lừa trẻ con à?",
    "translationHint": "Hoàn toàn, hết sức (nghĩa xấu)"
  },
  {
    "id": "v243",
    "word": "ARTIFICE",
    "ipa": "ˈɑːtɪfɪs",
    "elo": 1420,
    "level": "expert",
    "scenario": "Cái vẻ ngoài 'quan tâm nhân viên' của công ty thực ra chỉ là ARTIFICE để che đậy việc cắt giảm thưởng thôi.",
    "translationHint": "Mưu mẹo, sự đánh tráo giả tạo"
  },
  {
    "id": "v244",
    "word": "ASCETIC",
    "ipa": "əˈsetɪk",
    "elo": 1440,
    "level": "expert",
    "scenario": "Cuộc sống ASCETIC của ông thần CTO: không dùng smartphone, chỉ xài máy tính bàn và ăn cơm chay để tập trung tối đa.",
    "translationHint": "Khổ hạnh, tu hành"
  },
  {
    "id": "v245",
    "word": "ASSIDUOUS",
    "ipa": "əˈsɪdjuəs",
    "elo": 1390,
    "level": "expert",
    "scenario": "Phải công nhận ông intern này ASSIDUOUS thật, ngồi fix cái bug vặt vãnh mà cũng thức trắng đêm để tìm nguyên nhân.",
    "translationHint": "Cần cù, siêng năng"
  },
  {
    "id": "v246",
    "word": "ATAVISTIC",
    "ipa": "ˌætəˈvɪstɪk",
    "elo": 1480,
    "level": "expert",
    "scenario": "Cái nỗi sợ ATAVISTIC khi thấy server đỏ lòm lúc nửa đêm là thứ mà dev đời nào cũng phải nếm trải qua.",
    "translationHint": "Mang tính bản năng nguyên thủy"
  },
  {
    "id": "v247",
    "word": "ATTENUATE",
    "ipa": "əˈtenjueɪt",
    "elo": 1410,
    "level": "expert",
    "scenario": "Dùng thêm mấy lớp cache này sẽ giúp ATTENUATE áp lực lên database, chứ không là nó sập sớm thôi.",
    "translationHint": "Làm yếu đi, giảm cường độ"
  },
  {
    "id": "v248",
    "word": "AUGUST",
    "ipa": "ɔːˈɡʌst",
    "elo": 1370,
    "level": "expert",
    "scenario": "Được đứng phát biểu trước các chuyên gia AUGUST trong ngành làm tôi thấy vừa run vừa tự hào vãi.",
    "translationHint": "Uy nghi, đáng kính"
  },
  {
    "id": "v249",
    "word": "AVARICE",
    "ipa": "ˈævərɪs",
    "elo": 1430,
    "level": "expert",
    "scenario": "Chính cái sự AVARICE của ban lãnh đạo, chỉ muốn thu lợi nhuận ngắn hạn, đã làm nát bét cái định hướng dài hạn của dự án.",
    "translationHint": "Lòng tham tiền bạc"
  },
  {
    "id": "v250",
    "word": "BELLICOSE",
    "ipa": "ˈbelɪkəʊs",
    "elo": 1400,
    "level": "expert",
    "scenario": "Sếp bữa nay có vẻ BELLICOSE vãi, ai nói gì cũng muốn 'bật' lại, chắc là mới bị vợ mắng ở nhà rồi.",
    "translationHint": "Hiếu chiến, thích gây hấn"
  },
  {
    "id": "v251",
    "word": "BYZANTINE",
    "ipa": "ˈbɪzəntiːn",
    "elo": 1470,
    "level": "expert",
    "scenario": "Quy trình xin cấp quyền truy cập server ở cái tập đoàn này BYZANTINE vãi, qua 5 tầng 7 lớp ký duyệt mới xong.",
    "translationHint": "Rắc rối, cực kỳ phức tạp"
  },
  {
    "id": "v252",
    "word": "CAPRICIOUS",
    "ipa": "kəˈprɪʃəs",
    "elo": 1390,
    "level": "expert",
    "scenario": "Tính tình CAPRICIOUS của khách hàng làm team xoay như chong chóng, sáng đòi làm cái này chiều lại bảo 'thôi bỏ đi'.",
    "translationHint": "Thất thường, hay thay đổi"
  },
  {
    "id": "v253",
    "word": "CASTIGATE",
    "ipa": "ˈkæstɪɡeɪt",
    "elo": 1450,
    "level": "expert",
    "scenario": "Lead mình thường xuyên CASTIGATE mấy thanh niên hay viết code 'bẩn' mà không chịu format lại.",
    "translationHint": "Chỉ trích dữ dội"
  },
  {
    "id": "v254",
    "word": "CAUSTIC",
    "ipa": "ˈkɔːstɪk",
    "elo": 1410,
    "level": "expert",
    "scenario": "Mấy cái lời nhận xét CAUSTIC trong code review có thể làm một anh dev yếu lòng phải suy nghĩ về việc bỏ nghề.",
    "translationHint": "Cay nghiệt, châm chọc"
  },
  {
    "id": "v255",
    "word": "CHICANERY",
    "ipa": "ʃɪˈkeɪnəri",
    "elo": 1480,
    "level": "expert",
    "scenario": "Lão ta dùng đủ mọi CHICANERY để đẩy hết trách nhiệm sai sót sang cho team khác, đúng là cáo già.",
    "translationHint": "Mánh khóe, thủ đoạn lừa dối"
  },
  {
    "id": "v256",
    "word": "CHURLISH",
    "ipa": "ˈtʃɜːlɪʃ",
    "elo": 1380,
    "level": "expert",
    "scenario": "Hành động không thèm trả lời tin nhắn công việc của khách hàng là cực kỳ CHURLISH, dù ông có giận cỡ nào đi nữa.",
    "translationHint": "Thô lỗ, mất lịch sự"
  },
  {
    "id": "v257",
    "word": "CIRCUMLOCUTION",
    "ipa": "ˌsɜːkəmləˈkjuːʃn",
    "elo": 1490,
    "level": "expert",
    "scenario": "Bớt dùng CIRCUMLOCUTION lại đi ông nội, nói thẳng ra là dự án này khi nào xong cho tôi nhờ cái.",
    "translationHint": "Cách nói vòng vo, dài dòng"
  },
  {
    "id": "v258",
    "word": "CLAIRVOYANT",
    "ipa": "kleəˈvɔɪənt",
    "elo": 1420,
    "level": "expert",
    "scenario": "Lão lead như có khả năng CLAIRVOYANT vậy, nhìn qua là biết ngay chỗ nào trong code sắp tới sẽ nổ bug.",
    "translationHint": "Sáng suốt, có khả năng tiên đoán"
  },
  {
    "id": "v259",
    "word": "CLOYING",
    "ipa": "ˈklɔɪɪŋ",
    "elo": 1360,
    "level": "expert",
    "scenario": "Cái giọng nịnh hót CLOYING của thằng đó với sếp làm tôi nghe mà muốn nổi hết da gà, giả trân vãi.",
    "translationHint": "Ngọt xớt, giả tạo đến phát ngấy"
  },
  {
    "id": "v260",
    "word": "COGENT",
    "ipa": "ˈkəʊdʒənt",
    "elo": 1380,
    "level": "expert",
    "scenario": "Bài thuyết trình của ông rất COGENT, thuyết phục hoàn toàn ban giám đốc rót vốn cho dự án này.",
    "translationHint": "Vững chắc, có sức thuyết phục"
  },
  {
    "id": "v261",
    "word": "COMPUNCTION",
    "ipa": "kəmˈpʌŋkʃn",
    "elo": 1430,
    "level": "expert",
    "scenario": "Hắn ta lẳng lặng nghỉ việc ngay giữa lúc dự án đang cháy mà không hề có một chút COMPUNCTION nào, tệ thật sự.",
    "translationHint": "Sự hối hận, cắn rứt lương tâm"
  },
  {
    "id": "v262",
    "word": "CONFLAGRATION",
    "ipa": "ˌkɒnfləˈɡreɪʃn",
    "elo": 1460,
    "level": "expert",
    "scenario": "Một cái bug nhỏ xíu ở module thanh toán đã gây ra một cuộc CONFLAGRATION khủng khiếp, làm app bay màu cả ngày.",
    "translationHint": "Đám cháy lớn, sự xung đột dữ dội"
  },
  {
    "id": "v263",
    "word": "CONSTERNATION",
    "ipa": "ˌkɒnstəˈneɪʃn",
    "elo": 1460,
    "level": "expert",
    "scenario": "Nỗi CONSTERNATION bao trùm cả phòng họp khi sếp thông báo dự án chính thức bị 'cancel' sau 1 năm cày cuốc.",
    "translationHint": "Sự kinh hoàng, tiệt vọng"
  },
  {
    "id": "v264",
    "word": "CRAVEN",
    "ipa": "ˈkreɪvən",
    "elo": 1400,
    "level": "expert",
    "scenario": "Thật là CRAVEN khi ông đẩy thằng intern ra chịu trận trước khách hàng để bảo vệ cái ghế của mình.",
    "translationHint": "Hèn nhát"
  },
  {
    "id": "v265",
    "word": "CONTRITE",
    "ipa": "ˈkɒntraɪt",
    "elo": 1370,
    "level": "expert",
    "scenario": "Nhìn bộ dạng CONTRITE của thằng đệ sau khi làm mất con server của khách mà tôi cũng không nỡ mắng.",
    "translationHint": "Ăn năn, hối lỗi"
  },
  {
    "id": "v266",
    "word": "CONVIVIAL",
    "ipa": "kənˈvɪviəl",
    "elo": 1360,
    "level": "expert",
    "scenario": "Buổi tiệc tất niên diễn ra trong không khí CONVIVIAL vãi, bao nhiêu mệt mỏi cả năm coi như tan biến sạch.",
    "translationHint": "Vui vẻ, thân thiện"
  },
  {
    "id": "v267",
    "word": "COPIOUS",
    "ipa": "ˈkəʊpiəs",
    "elo": 1370,
    "level": "expert",
    "scenario": "Ông ghi chép COPIOUS thế kia mà lúc vào họp vẫn hỏi lại mấy cái vấn đề cơ bản là sao?",
    "translationHint": "Dồi dào, phong phú"
  },
  {
    "id": "v268",
    "word": "CUPIDITY",
    "ipa": "kjuːˈpɪdɪti",
    "elo": 1450,
    "level": "expert",
    "scenario": "Chính cái CUPIDITY muốn giàu nhanh đã khiến bao nhiêu người sập bẫy mấy cái sàn crypto lừa đảo.",
    "translationHint": "Lòng tham (đặc biệt là tiền bạc)"
  },
  {
    "id": "v269",
    "word": "DEARTH",
    "ipa": "dɜːθ",
    "elo": 1390,
    "level": "expert",
    "scenario": "Hiện nay đang có một sự DEARTH trầm trọng nhân lực biết làm blockchain chất lượng, hèn gì lương cao vãi.",
    "translationHint": "Sự khan hiếm, thiếu thốn"
  },
  {
    "id": "v270",
    "word": "DEFERENCE",
    "ipa": "ˈdefərəns",
    "elo": 1400,
    "level": "expert",
    "scenario": "Ông ấy luôn đối xử với các bậc tiền bối trong ngành với sự DEFERENCE tuyệt đối, đúng chuẩn người có học thức.",
    "translationHint": "Sự tôn trọng, cung kính"
  },
    {
    "id": "v271",
    "word": "DELETERIOUS",
    "ipa": "ˌdelɪˈtɪəriəs",
    "elo": 1440,
    "level": "expert",
    "scenario": "Cái thói quen ngồi code xuyên đêm mà không vận động thật sự có ảnh hưởng DELETERIOUS đến cột sống của ông đấy, lo mà tập gym đi.",
    "translationHint": "Gây hại, có tác động xấu"
  },
  {
    "id": "v272",
    "word": "DENOUEMENT",
    "ipa": "deɪˈnuːmɒŋ",
    "elo": 1460,
    "level": "expert",
    "scenario": "Cái DENOUEMENT của dự án này thật không thể tin nổi: sếp ôm tiền chạy, để lại anh em với đống code rác nợ lương 3 tháng.",
    "translationHint": "Kết cục, hạ màn"
  },
  {
    "id": "v273",
    "word": "DESULTORY",
    "ipa": "ˈdesəltri",
    "elo": 1470,
    "level": "expert",
    "scenario": "Ông học tiếng Anh kiểu DESULTORY thế này thì mùa quýt sang năm mới đạt được N2, học hành cho nó ra hệ thống tí đi.",
    "translationHint": "Rời rạc, thiếu hệ thống"
  },
  {
    "id": "v274",
    "word": "INVETERATE",
    "ipa": "ɪnˈvetərət",
    "elo": 1410,
    "level": "expert",
    "scenario": "Thằng đó là một kẻ INVETERATE nói dối, nó bảo 'fix xong rồi' nghĩa là nó còn chưa thèm mở code ra xem nữa.",
    "translationHint": "Thâm căn cố đế, khó bỏ"
  },
  {
    "id": "v275",
    "word": "LACHRYMOSE",
    "ipa": "ˈlækrɪməʊs",
    "elo": 1450,
    "level": "expert",
    "scenario": "Mấy cái phim quảng cáo Tết lúc nào cũng dùng kịch bản LACHRYMOSE để lấy nước mắt người xem rồi chèn cái logo vào.",
    "translationHint": "Hay khóc, ủy mị, gây xúc động mạnh"
  },
  {
    "id": "v276",
    "word": "LAMBASTE",
    "ipa": "læmˈbeɪst",
    "elo": 1420,
    "level": "expert",
    "scenario": "Cộng đồng mạng đang LAMBASTE cái app mới ra của công ty vì lỗi bảo mật sơ đẳng làm lộ thông tin người dùng.",
    "translationHint": "Chỉ trích gay gắt"
  },
  {
    "id": "v277",
    "word": "LANGUID",
    "ipa": "ˈlæŋɡwɪd",
    "elo": 1380,
    "level": "expert",
    "scenario": "Thời tiết Sài Gòn buổi chiều nóng đến mức làm ai cũng thấy LANGUID, chỉ muốn nằm điều hòa chứ code gì tầm này.",
    "translationHint": "Uể oải, lờ đờ"
  },
  {
    "id": "v278",
    "word": "LOQUACIOUS",
    "ipa": "ləˈkweɪʃəs",
    "elo": 1390,
    "level": "expert",
    "scenario": "Gặp mấy ông khách hàng LOQUACIOUS mệt lắm, nói chuyện 2 tiếng đồng hồ mà chẳng chốt được cái yêu cầu nào ra hồn.",
    "translationHint": "Nói nhiều, huyên thuyên"
  },
  {
    "id": "v279",
    "word": "MACHIAVELLIAN",
    "ipa": "ˌmækiəˈveliən",
    "elo": 1490,
    "level": "expert",
    "scenario": "Lão ta dùng những thủ đoạn MACHIAVELLIAN để leo lên cái ghế giám đốc, sẵn sàng đạp đổ mọi đồng nghiệp cũ.",
    "translationHint": "Xảo quyệt, mưu mô chính trị"
  },
  {
    "id": "v280",
    "word": "MAGNILOQUENT",
    "ipa": "mæɡˈnɪləkwənt",
    "elo": 1480,
    "level": "expert",
    "scenario": "Mấy cái diễn ngôn MAGNILOQUENT về 'thay đổi thế giới' của mấy founder startup nghe thì hay, nhưng thực tế là đang đốt tiền nhà đầu tư.",
    "translationHint": "Nói khoác lác, khoa trương"
  },
  {
    "id": "v281",
    "word": "MALADROIT",
    "ipa": "ˌmæləˈdrɔɪt",
    "elo": 1420,
    "level": "expert",
    "scenario": "Cách xử lý khủng hoảng truyền thông của công ty đúng là MALADROIT, càng giải thích thì dân tình càng chửi hăng hơn.",
    "translationHint": "Vụng về, thiếu khéo léo"
  },
  {
    "id": "v282",
    "word": "MALAISE",
    "ipa": "məˈleɪz",
    "elo": 1400,
    "level": "expert",
    "scenario": "Cảm giác MALAISE khi nhận ra mình đã làm dev 3 năm mà vẫn chưa có gì trong tay, kiến thức thì dở dở ương ương.",
    "translationHint": "Sự khó chịu, bất an mơ hồ"
  },
  {
    "id": "v283",
    "word": "MERETRICIOUS",
    "ipa": "ˌmerɪˈtrɪʃəs",
    "elo": 1470,
    "level": "expert",
    "scenario": "Cái UI này nhìn qua thì MERETRICIOUS đấy, màu mè hoa lá hẹ nhưng trải nghiệm người dùng thì tệ không tả nổi.",
    "translationHint": "Hào nhoáng nhưng vô giá trị"
  },
  {
    "id": "v284",
    "word": "METTLESOME",
    "ipa": "ˈmetlsəm",
    "elo": 1440,
    "level": "expert",
    "scenario": "Phải là một người cực kỳ METTLESOME mới dám bỏ việc lương cao để đi khởi nghiệp trong cái giai đoạn kinh tế khó khăn này.",
    "translationHint": "Dũng cảm, đầy nghị lực"
  },
  {
    "id": "v285",
    "word": "MISANTHROPIC",
    "ipa": "ˌmɪzənˈθrɒpɪk",
    "elo": 1460,
    "level": "expert",
    "scenario": "Làm nghề này lâu xong tôi thấy mình hơi MISANTHROPIC, chỉ thích ở một mình với máy tính hơn là đi xã giao với người thật.",
    "translationHint": "Ghét người, lánh đời"
  },
  {
    "id": "v286",
    "word": "MNEMONIC",
    "ipa": "nɪˈmɒnɪk",
    "elo": 1380,
    "level": "expert",
    "scenario": "Dùng mấy cái MNEMONIC kiểu này để nhớ từ vựng cũng hay, nhưng quan trọng vẫn là phải áp dụng vào thực tế mới nhớ lâu được.",
    "translationHint": "Thuật ghi nhớ"
  },
  {
    "id": "v287",
    "word": "MORDANT",
    "ipa": "ˈmɔːdnt",
    "elo": 1430,
    "level": "expert",
    "scenario": "Cái khiếu hài hước MORDANT của lão lead nhiều khi làm anh em hơi thốn, toàn lôi mấy pha 'bóp' của team ra để khịa.",
    "translationHint": "Châm chọc, cay nghiệt"
  },
  {
    "id": "v288",
    "word": "MUNIFICENT",
    "ipa": "mjuːˈnɪfɪsnt",
    "elo": 1410,
    "level": "expert",
    "scenario": "Công ty cũ của tôi cực kỳ MUNIFICENT trong khoản thiết bị, cứ vào làm là được phát ngay combo Macbook Pro và màn hình 4K.",
    "translationHint": "Hào phóng, cực kỳ rộng rãi"
  },
  {
    "id": "v289",
    "word": "NEBULOUS",
    "ipa": "ˈnebjʊləs",
    "elo": 1390,
    "level": "expert",
    "scenario": "Mấy cái lời hứa hẹn về tương lai dự án của sếp vẫn còn NEBULOUS lắm, chưa thấy một cái roadmap nào rõ ràng cả.",
    "translationHint": "Mơ hồ, mù mờ"
  },
  {
    "id": "v290",
    "word": "NOISOME",
    "ipa": "ˈnɔɪsəm",
    "elo": 1420,
    "level": "expert",
    "scenario": "Cái mùi NOISOME từ đống rác tích tụ lâu ngày ở pantry làm tôi không bao giờ dám bén mảng lại gần đó nữa.",
    "translationHint": "Hôi thối, khó chịu kinh khủng"
  },
  {
    "id": "v291",
    "word": "OBDURATE",
    "ipa": "ˈɒbdjʊrət",
    "elo": 1440,
    "level": "expert",
    "scenario": "Dù team đã đưa ra đủ mọi bằng chứng là công nghệ này đã cũ, nhưng lão CTO vẫn OBDURATE bắt dùng cho bằng được.",
    "translationHint": "Cứng đầu, ngoan cố"
  },
  {
    "id": "v292",
    "word": "OBSTREPEROUS",
    "ipa": "əbˈstrepərəs",
    "elo": 1470,
    "level": "expert",
    "scenario": "Gặp mấy thằng cha OBSTREPEROUS trong buổi họp đúng là cực hình, cứ hở tí là hét toáng lên để át tiếng người khác.",
    "translationHint": "Ồn ào, bướng bỉnh khó bảo"
  },
  {
    "id": "v293",
    "word": "OBTUSE",
    "ipa": "əbˈtjuːs",
    "elo": 1380,
    "level": "expert",
    "scenario": "Tôi giải thích đến lần thứ 10 rồi mà ông vẫn chưa hiểu thì đúng là ông OBTUSE thật, hay là đang giả vờ thế?",
    "translationHint": "Chậm hiểu, đần độn"
  },
  {
    "id": "v294",
    "word": "OFFICIOUS",
    "ipa": "əˈfɪʃəs",
    "elo": 1410,
    "level": "expert",
    "scenario": "Mấy bà hàng xóm OFFICIOUS vãi, chuyện gì trong nhà tôi bả cũng biết còn rõ hơn cả tôi nữa.",
    "translationHint": "Hay lanh chanh, thích can thiệp chuyện người khác"
  },
  {
    "id": "v295",
    "word": "OLEAGINOUS",
    "ipa": "ˌəʊliˈædʒɪnəs",
    "elo": 1490,
    "level": "expert",
    "scenario": "Cái nụ cười OLEAGINOUS của lão khách hàng làm tôi thấy nổi hết cả da gà, biết ngay là sắp có yêu cầu oái oăm gì rồi.",
    "translationHint": "Nịnh bợ, bóng bẩy (nghĩa bóng)"
  },
  {
    "id": "v296",
    "word": "ONEROUS",
    "ipa": "ˈɒnərəs",
    "elo": 1370,
    "level": "expert",
    "scenario": "Việc một mình phải gánh trách nhiệm bảo trì hệ thống cho cả công ty là một công việc cực kỳ ONEROUS.",
    "translationHint": "Nặng nề, khó nhọc"
  },
  {
    "id": "v297",
    "word": "OPPROBRIUM",
    "ipa": "əˈprəʊbriəm",
    "elo": 1460,
    "level": "expert",
    "scenario": "Ông ta phải đối mặt với sự OPPROBRIUM từ cộng đồng dev sau khi bị phát hiện ăn cắp mã nguồn của đồng nghiệp.",
    "translationHint": "Sự chỉ trích dữ dội, vết nhục"
  },
  {
    "id": "v298",
    "word": "PARSIMONIOUS",
    "ipa": "ˌpɑːsɪˈməʊniəs",
    "elo": 1430,
    "level": "expert",
    "scenario": "Công ty này PARSIMONIOUS đến mức cắt luôn cả tiền trà nước, bánh kẹo cho nhân viên vào buổi xế.",
    "translationHint": "Bủn xỉn, cực kỳ keo kiệt"
  },
  {
    "id": "v299",
    "word": "PEJORATIVE",
    "ipa": "pɪˈdʒɒrətɪv",
    "elo": 1420,
    "level": "expert",
    "scenario": "Đừng dùng từ 'thợ code' như một danh từ PEJORATIVE, mỗi nghề đều có cái giá trị riêng của nó cả.",
    "translationHint": "Mang nghĩa miệt thị, xấu"
  },
  {
    "id": "v300",
    "word": "PENURIOUS",
    "ipa": "pɪˈnjʊəriəs",
    "elo": 1450,
    "level": "expert",
    "scenario": "Trong cái tình cảnh PENURIOUS hiện tại, việc chi 200k cho một bữa ăn đối với tôi là một sự xa xỉ tột độ.",
    "translationHint": "Nghèo túng, thiếu thốn tột cùng"
  },
    {
    "id": "v301",
    "word": "PERSPECTIVE",
    "ipa": "pəˈspektɪv",
    "elo": 920,
    "level": "intermediate",
    "scenario": "Thay vì ngồi cãi nhau, hãy thử đổi PERSPECTIVE xem, khách hàng họ cần cái dùng được chứ không cần cái code đẹp như tranh.",
    "translationHint": "Góc nhìn, quan điểm"
  },
  {
    "id": "v302",
    "word": "AMBITIOUS",
    "ipa": "æmˈbɪʃəs",
    "elo": 850,
    "level": "beginner",
    "scenario": "Cái plan 'làm chủ React sau 2 ngày' của ông nghe AMBITIOUS đấy, nhưng khả năng cao là ông sẽ làm chủ cái giường nhiều hơn.",
    "translationHint": "Tham vọng"
  },
  {
    "id": "v303",
    "word": "COLLABORATE",
    "ipa": "kəˈlæbəreɪt",
    "elo": 880,
    "level": "beginner",
    "scenario": "Làm project là phải biết COLLABORATE, chứ cứ thích một mình một ngựa thì sang tuần sau là 'out' team.",
    "translationHint": "Hợp tác, làm việc chung"
  },
  {
    "id": "v304",
    "word": "ADAPTABLE",
    "ipa": "əˈdæptəbl",
    "elo": 940,
    "level": "intermediate",
    "scenario": "Làm nghề này là phải ADAPTABLE, nay dùng Next.js mai sếp bắt đổi sang Nuxt cũng phải vui vẻ mà học.",
    "translationHint": "Dễ thích nghi"
  },
  {
    "id": "v305",
    "word": "REDUCE",
    "ipa": "rɪˈdjuːs",
    "elo": 810,
    "level": "beginner",
    "scenario": "Phải tìm cách REDUCE bớt số lượng request gửi lên server đi, không là cuối tháng bill AWS nó vả cho không trượt phát nào.",
    "translationHint": "Cắt giảm"
  },
  {
    "id": "v306",
    "word": "POTENTIAL",
    "ipa": "pəˈtenʃl",
    "elo": 860,
    "level": "beginner",
    "scenario": "Thằng bé này có POTENTIAL phết, mới intern mà đã biết cách fix mấy cái bug logic hóc búa rồi.",
    "translationHint": "Tiềm năng"
  },
  {
    "id": "v307",
    "word": "SPECIFIC",
    "ipa": "spəˈsɪfɪk",
    "elo": 830,
    "level": "beginner",
    "scenario": "Nói SPECIFIC vào, 'app bị lỗi' là lỗi gì? Crash hay chỉ là cái button nó bị lệch?",
    "translationHint": "Cụ thể, rõ ràng"
  },
  {
    "id": "v308",
    "word": "CONSISTENT",
    "ipa": "kənˈsɪstənt",
    "elo": 910,
    "level": "intermediate",
    "scenario": "Style code phải CONSISTENT trên toàn bộ dự án, đừng có chỗ thì dùng tab, chỗ thì dùng space nhìn nhức mắt lắm.",
    "translationHint": "Nhất quán, đồng bộ"
  },
  {
    "id": "v309",
    "word": "VALUABLE",
    "ipa": "ˈvæljuəbl",
    "elo": 840,
    "level": "beginner",
    "scenario": "Những cái feedback 'phũ' của người dùng thực ra lại là những thông tin VALUABLE nhất để mình cải thiện app.",
    "translationHint": "Có giá trị"
  },
  {
    "id": "v310",
    "word": "PRECISE",
    "ipa": "prɪˈsaɪs",
    "elo": 950,
    "level": "intermediate",
    "scenario": "Design system yêu cầu khoảng cách là 16px thì cứ PRECISE 16px mà làm, đừng có 'áng chừng' 15 hay 17 nha.",
    "translationHint": "Chính xác, tỉ mỉ"
  },
  {
    "id": "v311",
    "word": "ALTERNATIVE",
    "ipa": "ɔːlˈtɜːnətɪv",
    "elo": 890,
    "level": "beginner",
    "scenario": "Nếu cái API này không work thì ông có giải pháp ALTERNATIVE nào khác không, hay là lại ngồi đợi?",
    "translationHint": "Sự thay thế, phương án khác"
  },
  {
    "id": "v312",
    "word": "COMPLICATED",
    "ipa": "ˈkɒmplɪkeɪtɪd",
    "elo": 820,
    "level": "beginner",
    "scenario": "Làm cái task này cho đơn giản thôi, đừng có làm nó COMPLICATED lên rồi chính mình cũng không đọc lại được code.",
    "translationHint": "Phức tạp"
  },
  {
    "id": "v313",
    "word": "ESSENTIAL",
    "ipa": "ɪˈsenʃl",
    "elo": 870,
    "level": "beginner",
    "scenario": "Cà phê là thứ ESSENTIAL nhất để khởi động một ngày làm việc, thiếu nó là não tôi đình công ngay.",
    "translationHint": "Thiết yếu, cần thiết"
  },
  {
    "id": "v314",
    "word": "OBJECT",
    "ipa": "əbˈdʒekt",
    "elo": 930,
    "level": "intermediate",
    "scenario": "Tôi hoàn toàn OBJECT cái việc ép anh em làm OT xuyên lễ mà không có thưởng thêm.",
    "translationHint": "Phản đối"
  },
  {
    "id": "v315",
    "word": "CONTRIBUTE",
    "ipa": "kənˈtrɪbjuːt",
    "elo": 900,
    "level": "intermediate",
    "scenario": "Mỗi người CONTRIBUTE một ít code vào cái open source này, sau này đi phỏng vấn ghi vào CV cho sang.",
    "translationHint": "Đóng góp"
  },
  {
    "id": "v316",
    "word": "INITIAL",
    "ipa": "ɪˈnɪʃl",
    "elo": 840,
    "level": "beginner",
    "scenario": "Cái INITIAL plan lúc nào cũng màu hồng, cho đến khi khách hàng nhảy vào 'feedback' thì nó mới bắt đầu nát.",
    "translationHint": "Ban đầu"
  },
  {
    "id": "v317",
    "word": "OBTAIN",
    "ipa": "əbˈteɪn",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Phải vất vả lắm tôi mới OBTAIN được cái chứng chỉ AWS này, tốn bao nhiêu đêm thức trắng học bài.",
    "translationHint": "Đạt được, thu được"
  },
  {
    "id": "v318",
    "word": "ESTIMATE",
    "ipa": "ˈestɪmeɪt",
    "elo": 880,
    "level": "beginner",
    "scenario": "Ông thử ESTIMATE xem cái feature này làm mất bao lâu? Nhớ nhân đôi thời gian lên để phòng hờ bị bug hành nhé.",
    "translationHint": "Ước lượng"
  },
  {
    "id": "v319",
    "word": "TYPICAL",
    "ipa": "ˈtɪpɪkl",
    "elo": 820,
    "level": "beginner",
    "scenario": "Lại quên đóng tag rồi, đúng là cái lỗi TYPICAL của mấy ông mới tập code.",
    "translationHint": "Điển hình, thường gặp"
  },
  {
    "id": "v320",
    "word": "VERSATILE",
    "ipa": "ˈvɜːsətaɪl",
    "elo": 1050,
    "level": "intermediate",
    "scenario": "Ông này VERSATILE vãi, vừa code được backend, vừa thiết kế được UI mà còn biết cả marketing luôn.",
    "translationHint": "Đa năng, linh hoạt"
  },
  {
    "id": "v321",
    "word": "SUFFICIENT",
    "ipa": "səˈfɪʃnt",
    "elo": 940,
    "level": "intermediate",
    "scenario": "Lương hiện tại chỉ vừa SUFFICIENT để trả tiền nhà với ăn mì tôm, chắc phải kiếm thêm job freelance thôi.",
    "translationHint": "Đầy đủ, vừa đủ"
  },
  {
    "id": "v322",
    "word": "PRIORITY",
    "ipa": "praɪˈɒrəti",
    "elo": 850,
    "level": "beginner",
    "scenario": "Fix cái lỗi thanh toán này là PRIORITY hàng đầu bây giờ, mấy cái chỉnh màu mè thì để sau đi.",
    "translationHint": "Sự ưu tiên"
  },
  {
    "id": "v323",
    "word": "APPROACH",
    "ipa": "əˈprəʊtʃ",
    "elo": 920,
    "level": "intermediate",
    "scenario": "Cái APPROACH của ông để xử lý data này có vẻ hơi cồng kềnh, thử dùng Map xem có nhanh hơn không?",
    "translationHint": "Cách tiếp cận"
  },
  {
    "id": "v324",
    "word": "DETERMINED",
    "ipa": "dɪˈtɜːmɪnd",
    "elo": 880,
    "level": "beginner",
    "scenario": "Tôi rất DETERMINED sẽ lấy bằng N2 trong năm nay để sang Nhật làm việc, không thể lười mãi được.",
    "translationHint": "Quyết tâm"
  },
  {
    "id": "v325",
    "word": "ACCURATE",
    "ipa": "ˈækjərət",
    "elo": 910,
    "level": "intermediate",
    "scenario": "Data trong báo cáo phải tuyệt đối ACCURATE, sếp mà phát hiện ra sai số là ăn chửi đủ luôn.",
    "translationHint": "Chính xác"
  },
  {
    "id": "v326",
    "word": "CONVINCE",
    "ipa": "kənˈvɪns",
    "elo": 870,
    "level": "beginner",
    "scenario": "Làm sao để CONVINCE khách hàng rằng họ cần cái feature này mặc dù nó tốn thêm đống tiền?",
    "translationHint": "Thuyết phục"
  },
  {
    "id": "v327",
    "word": "PROCEDURE",
    "ipa": "prəˈsiːdʒə",
    "elo": 950,
    "level": "intermediate",
    "scenario": "Nhớ tuân thủ đúng cái PROCEDURE khi deploy nhé, đừng có làm tắt rồi lại làm sập web của người ta.",
    "translationHint": "Quy trình, thủ tục"
  },
  {
    "id": "v328",
    "word": "SIGNIFICANCE",
    "ipa": "sɪɡˈnɪfɪkəns",
    "elo": 1020,
    "level": "intermediate",
    "scenario": "Nhiều người không hiểu được cái SIGNIFICANCE của việc viết Unit Test cho đến khi dự án phình to ra và bug nổ liên tục.",
    "translationHint": "Tầm quan trọng, ý nghĩa"
  },
  {
    "id": "v329",
    "word": "REVEAL",
    "ipa": "rɪˈviːl",
    "elo": 830,
    "level": "beginner",
    "scenario": "Vừa REVEAL cái giao diện mới là user chửi quá trời, chắc phải quay về bản cũ thôi Long ơi.",
    "translationHint": "Tiết lộ, ra mắt"
  },
  {
    "id": "v330",
    "word": "CHALLENGING",
    "ipa": "ˈtʃælɪndʒɪŋ",
    "elo": 890,
    "level": "beginner",
    "scenario": "Cái task này CHALLENGING phết, nhưng mà làm xong chắc chắn trình độ code của ông sẽ lên một tầm cao mới.",
    "translationHint": "Đầy thách thức"
  },
  {
    "id": "v331",
    "word": "ACQUIRE",
    "ipa": "əˈkwaɪə",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Phải mất 3 năm đi làm tôi mới ACQUIRE được cái tư duy: code chạy được là một chuyện, code bảo trì được hay không lại là chuyện khác.",
    "translationHint": "Đạt được, có được (kỹ năng/kiến thức)"
  },
  {
    "id": "v332",
    "word": "BENEFICIAL",
    "ipa": "ˌbenɪˈfɪʃl",
    "elo": 850,
    "level": "beginner",
    "scenario": "Việc học thêm tiếng Nhật cực kỳ BENEFICIAL cho túi tiền của ông, sau này làm việc với khách Nhật lương auto x2.",
    "translationHint": "Có lợi, ích lợi"
  },
  {
    "id": "v333",
    "word": "CAPABLE",
    "ipa": "ˈkeɪpəbl",
    "elo": 870,
    "level": "beginner",
    "scenario": "Tôi biết ông CAPABLE mà, mấy cái task hóc búa này chỉ có ông mới giải quyết nổi thôi.",
    "translationHint": "Có khả năng, năng lực"
  },
  {
    "id": "v334",
    "word": "CONTRADICT",
    "ipa": "ˌkɒntrəˈdɪkt",
    "elo": 980,
    "level": "intermediate",
    "scenario": "Lời nói của lão sếp luôn CONTRADICT với hành động, miệng bảo 'coi nhân viên là gia đình' nhưng lại cắt thưởng Tết.",
    "translationHint": "Mâu thuẫn, trái ngược"
  },
  {
    "id": "v335",
    "word": "DISTINCT",
    "ipa": "dɪˈstɪŋkt",
    "elo": 910,
    "level": "intermediate",
    "scenario": "Có một sự DISTINCT rõ rệt giữa code của một ông Senior thực thụ và một ông Senior 'nâng tầm' từ kinh nghiệm copy-paste.",
    "translationHint": "Rõ ràng, khác biệt"
  },
  {
    "id": "v336",
    "word": "ELIMINATE",
    "ipa": "ɪˈlɪmɪneɪt",
    "elo": 930,
    "level": "intermediate",
    "scenario": "Mục tiêu của cái đợt refactor này là ELIMINATE toàn bộ đống code thừa và logic rác từ thời dự án mới bắt đầu.",
    "translationHint": "Loại bỏ hoàn toàn"
  },
  {
    "id": "v337",
    "word": "FLEXIBILITY",
    "ipa": "ˌfleksəˈbɪləti",
    "elo": 880,
    "level": "beginner",
    "scenario": "Cái framework này cho mình sự FLEXIBILITY rất lớn, muốn tùy biến kiểu gì cũng được mà không sợ vỡ layout.",
    "translationHint": "Sự linh hoạt"
  },
  {
    "id": "v338",
    "word": "GENERALIZE",
    "ipa": "ˈdʒenrəlaɪz",
    "elo": 950,
    "level": "intermediate",
    "scenario": "Đừng có GENERALIZE là tất cả mọi người đều thích cái tính năng này, thực ra chỉ có mỗi ông thích thôi đấy.",
    "translationHint": "Khái quát hóa, vơ đũa cả nắm"
  },
  {
    "id": "v339",
    "word": "HINDER",
    "ipa": "ˈhɪndə",
    "elo": 970,
    "level": "intermediate",
    "scenario": "Mấy cái thủ tục hành chính rườm rà đang HINDER tiến độ của cả dự án, ký một cái giấy mà mất cả tuần.",
    "translationHint": "Cản trở, kìm hãm"
  },
  {
    "id": "v340",
    "word": "IMPLEMENT",
    "ipa": "ˈɪmplɪment",
    "elo": 920,
    "level": "intermediate",
    "scenario": "Ông lo mà IMPLEMENT cái module thanh toán này cho xong đi, khách hàng đang hối như cháy nhà rồi kìa.",
    "translationHint": "Triển khai, thực hiện"
  },
  {
    "id": "v341",
    "word": "INADEQUATE",
    "ipa": "ɪnˈædɪkwət",
    "elo": 990,
    "level": "intermediate",
    "scenario": "Kỹ năng của ông vẫn còn INADEQUATE so với cái yêu cầu của vị trí này, về học thêm đi rồi quay lại phỏng vấn sau.",
    "translationHint": "Thiếu, không đủ năng lực"
  },
  {
    "id": "v342",
    "word": "LACK",
    "ipa": "læk",
    "elo": 810,
    "level": "beginner",
    "scenario": "Cái app này không phải dở, chỉ là nó LACK một cái điểm nhấn để giữ chân người dùng thôi.",
    "translationHint": "Thiếu hụt"
  },
  {
    "id": "v343",
    "word": "MAINTAIN",
    "ipa": "meɪnˈteɪn",
    "elo": 860,
    "level": "beginner",
    "scenario": "Viết code xong mà không viết doc thì sau này thằng khác vào MAINTAIN kiểu gì? Đừng có ác thế chứ.",
    "translationHint": "Duy trì, bảo trì"
  },
  {
    "id": "v344",
    "word": "NOTABLE",
    "ipa": "ˈnəʊtəbl",
    "elo": 890,
    "level": "beginner",
    "scenario": "Một thay đổi NOTABLE nhất trong bản update này là chúng tôi đã gỡ bỏ cái tính năng mà... chẳng ai thèm dùng.",
    "translationHint": "Đáng chú ý"
  },
  {
    "id": "v345",
    "word": "OPTIMISTIC",
    "ipa": "ˌɒptɪˈmɪstɪk",
    "elo": 840,
    "level": "beginner",
    "scenario": "Sếp tôi luôn OPTIMISTIC về việc dự án sẽ xong trước Tết, trong khi bug còn cả một núi chưa fix.",
    "translationHint": "Lạc quan"
  },
  {
    "id": "v346",
    "word": "PARTIAL",
    "ipa": "ˈpɑːʃl",
    "elo": 830,
    "level": "beginner",
    "scenario": "Đây mới chỉ là một PARTIAL thành công thôi, đừng có vội ăn mừng, còn đống bug đang đợi kìa.",
    "translationHint": "Một phần"
  },
  {
    "id": "v347",
    "word": "PRACTICAL",
    "ipa": "ˈpræktɪkl",
    "elo": 870,
    "level": "beginner",
    "scenario": "Thôi bớt nói lý thuyết đi, đưa ra giải pháp nào PRACTICAL một tí xem nào, khách hàng họ cần sản phẩm chạy được.",
    "translationHint": "Thực tế, thực tiễn"
  },
  {
    "id": "v348",
    "word": "QUICKLY",
    "ipa": "ˈkwɪkli",
    "elo": 800,
    "level": "beginner",
    "scenario": "Làm cái này QUICKLY đi ông ơi, khách đang ngồi đợi demo trực tiếp kia kìa, đừng có câu giờ nữa.",
    "translationHint": "Nhanh chóng"
  },
  {
    "id": "v349",
    "word": "REACTION",
    "ipa": "riˈækʃn",
    "elo": 820,
    "level": "beginner",
    "scenario": "REACTION của người dùng khi thấy cái UI mới này khá là tiêu cực, chắc phải rollback lại thôi.",
    "translationHint": "Phản ứng"
  },
  {
    "id": "v350",
    "word": "SKEPTICISM",
    "ipa": "ˈskeptɪsɪzəm",
    "elo": 1040,
    "level": "intermediate",
    "scenario": "Tôi nhìn cái đống biểu đồ tăng trưởng của startup này với một sự SKEPTICISM cực lớn, nhìn ảo vãi chưởng.",
    "translationHint": "Sự nghi ngờ, thái độ hoài nghi"
  },
  {
    "id": "v351",
    "word": "TENDENCY",
    "ipa": "ˈtendənsi",
    "elo": 910,
    "level": "intermediate",
    "scenario": "Dân dev thường có TENDENCY lười viết documentation, để rồi vài tháng sau chính mình cũng không hiểu mình viết cái gì.",
    "translationHint": "Xu hướng, khuynh hướng"
  },
  {
    "id": "v352",
    "word": "UNEXPECTED",
    "ipa": "ˌʌnɪkˈspektɪd",
    "elo": 850,
    "level": "beginner",
    "scenario": "Một cái lỗi UNEXPECTED xảy ra ngay đúng lúc demo làm cả team đứng hình mất 5 giây.",
    "translationHint": "Bất ngờ, không mong đợi"
  },
  {
    "id": "v353",
    "word": "VALIDATE",
    "ipa": "ˈvælɪdeɪt",
    "elo": 940,
    "level": "intermediate",
    "scenario": "Phải VALIDATE dữ liệu người dùng thật kỹ ở phía server, đừng có tin tưởng tuyệt đối vào frontend.",
    "translationHint": "Xác nhận, kiểm tra tính hợp lệ"
  },
  {
    "id": "v354",
    "word": "WORTHWHILE",
    "ipa": "ˌwɜːθˈwaɪl",
    "elo": 900,
    "level": "intermediate",
    "scenario": "Bỏ 2 tiếng ra để tìm hiểu về AI là một việc cực kỳ WORTHWHILE, nó sẽ giúp ông tiết kiệm được khối thời gian sau này.",
    "translationHint": "Đáng giá, đáng công"
  },
  {
    "id": "v355",
    "word": "YIELD",
    "ipa": "jiːld",
    "elo": 1020,
    "level": "intermediate",
    "scenario": "Đầu tư vào mấy cái coin rác này chẳng YIELD được đồng nào đâu, chỉ có bay màu tài khoản thôi.",
    "translationHint": "Mang lại, sản sinh ra (lợi nhuận/kết quả)"
  },
  {
    "id": "v356",
    "word": "ABANDON",
    "ipa": "əˈbændən",
    "elo": 880,
    "level": "beginner",
    "scenario": "Công ty đã quyết định ABANDON cái dự án này sau 6 tháng đốt tiền mà chẳng thấy kết quả gì.",
    "translationHint": "Từ bỏ, ruồng bỏ"
  },
  {
    "id": "v357",
    "word": "BRIEF",
    "ipa": "briːf",
    "elo": 830,
    "level": "beginner",
    "scenario": "Gửi cho tôi một cái BRIEF ngắn gọn về yêu cầu của khách hàng đi, đừng có viết sớ táo quân dài dằng dặc thế.",
    "translationHint": "Ngắn gọn, tóm tắt"
  },
  {
    "id": "v358",
    "word": "CERTAIN",
    "ipa": "ˈsɜːtn",
    "elo": 810,
    "level": "beginner",
    "scenario": "Tôi chắc chắn CERTAIN 100% là cái bug này nằm ở chỗ này, nếu sai tôi bao ông chầu lẩu.",
    "translationHint": "Chắc chắn, nhất định"
  },
  {
    "id": "v359",
    "word": "CONVINCE",
    "ipa": "kənˈvɪns",
    "elo": 870,
    "level": "beginner",
    "scenario": "Làm sao để CONVINCE thằng bạn thân bỏ chơi game để quay lại học code đây? Khó hơn lên trời.",
    "translationHint": "Thuyết phục"
  },
  {
    "id": "v360",
    "word": "DECLINE",
    "ipa": "dɪˈklaɪn",
    "elo": 940,
    "level": "intermediate",
    "scenario": "Tôi buộc phải DECLINE lời mời làm việc này vì mức lương họ đưa ra nghe xúc phạm người làm nghề quá.",
    "translationHint": "Từ chối (một cách lịch sự)"
  },
  {
    "id": "v361",
    "word": "ACCOMMODATE",
    "ipa": "əˈkɒmədeɪt",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Cố gắng ACCOMMODATE mọi yêu cầu của người yêu đôi khi còn mệt hơn cả đi làm tăng ca.",
    "translationHint": "Đáp ứng, làm vừa lòng"
  },
  {
    "id": "v362",
    "word": "BENEFIT",
    "ipa": "ˈbenɪfɪt",
    "elo": 820,
    "level": "beginner",
    "scenario": "BENEFIT lớn nhất của việc dậy sớm là không phải chen chúc trong dòng người kẹt xe lúc 8h sáng.",
    "translationHint": "Lợi ích"
  },
  {
    "id": "v363",
    "word": "CHALLENGE",
    "ipa": "ˈtʃælɪndʒ",
    "elo": 830,
    "level": "beginner",
    "scenario": "Dậy đi tập gym vào buổi sáng mùa đông đúng là một cái CHALLENGE cực lớn đối với tôi.",
    "translationHint": "Thử thách"
  },
  {
    "id": "v364",
    "word": "DELIBERATE",
    "ipa": "dɪˈlɪbərət",
    "elo": 980,
    "level": "intermediate",
    "scenario": "Hắn ta DELIBERATE lờ đi tin nhắn của tôi dù đang 'online', đúng là đồ đáng ghét.",
    "translationHint": "Cố ý, chủ tâm"
  },
  {
    "id": "v365",
    "word": "ESSENTIAL",
    "ipa": "ɪˈsenʃl",
    "elo": 850,
    "level": "beginner",
    "scenario": "Tiền không phải là tất cả, nhưng nó là thứ ESSENTIAL để duy trì cái sự 'hạnh phúc' này.",
    "translationHint": "Thiết yếu, cần thiết"
  },
  {
    "id": "v366",
    "word": "FINANCIAL",
    "ipa": "faɪˈnænʃl",
    "elo": 840,
    "level": "beginner",
    "scenario": "Tình hình FINANCIAL của tôi cuối tháng thường rất thê thảm vì thói quen 'chốt đơn' trên Shopee.",
    "translationHint": "Thuộc về tài chính"
  },
  {
    "id": "v367",
    "word": "GENEROUS",
    "ipa": "ˈdʒenərəs",
    "elo": 835,
    "level": "beginner",
    "scenario": "Lão sếp thỉnh thoảng cũng GENEROUS đột xuất, mời cả phòng đi trà sữa mà không nhân dịp gì cả.",
    "translationHint": "Hào phóng, rộng lượng"
  },
  {
    "id": "v368",
    "word": "HESITATE",
    "ipa": "ˈhezɪteɪt",
    "elo": 825,
    "level": "beginner",
    "scenario": "Đừng HESITATE khi thấy món đồ mình thích đang sale 50%, vì chớp mắt thôi là nó hết hàng đấy.",
    "translationHint": "Do dự, ngập ngừng"
  },
  {
    "id": "v369",
    "word": "IMMEDIATE",
    "ipa": "ɪˈmiːdiət",
    "elo": 845,
    "level": "beginner",
    "scenario": "Tôi cần một câu trả lời IMMEDIATE, chứ cứ 'để mình suy nghĩ' thì biết bao giờ mới xong.",
    "translationHint": "Ngay lập tức"
  },
  {
    "id": "v370",
    "word": "JUSTIFY",
    "ipa": "ˈdʒʌstɪfaɪ",
    "elo": 900,
    "level": "intermediate",
    "scenario": "Làm sao để JUSTIFY cái việc tôi ăn hết sạch cái bánh kem một mình trong khi đang giảm cân đây?",
    "translationHint": "Biện minh, thanh minh"
  },
  {
    "id": "v371",
    "word": "KNOWLEDGEABLE",
    "ipa": "ˈnɒlɪdʒəbl",
    "elo": 950,
    "level": "intermediate",
    "scenario": "Anh ấy rất KNOWLEDGEABLE về mảng ẩm thực Sài Gòn, hỏi quán nào cũng biết hết.",
    "translationHint": "Có kiến thức rộng, am hiểu"
  },
  {
    "id": "v372",
    "word": "LOGICAL",
    "ipa": "ˈlɒdʒɪkl",
    "elo": 840,
    "level": "beginner",
    "scenario": "Mọi chuyện xảy ra đều có cái lý do LOGICAL của nó, chỉ là mình có muốn chấp nhận hay không thôi.",
    "translationHint": "Hợp lý, theo logic"
  },
  {
    "id": "v373",
    "word": "MOTIVATE",
    "ipa": "ˈməʊtɪveɪt",
    "elo": 860,
    "level": "beginner",
    "scenario": "Nhìn vào cái số dư tài khoản là cách tốt nhất để MOTIVATE bản thân dậy đi làm mỗi sáng.",
    "translationHint": "Thúc đẩy, tạo động lực"
  },
  {
    "id": "v374",
    "word": "NEGATIVE",
    "ipa": "ˈneɡətɪv",
    "elo": 810,
    "level": "beginner",
    "scenario": "Bớt suy nghĩ NEGATIVE lại ông ơi, đời còn dài, gái còn nhiều, lo gì cái chuyện lẻ bóng.",
    "translationHint": "Tiêu cực"
  },
  {
    "id": "v375",
    "word": "OBVIOUS",
    "ipa": "ˈɒbviəs",
    "elo": 815,
    "level": "beginner",
    "scenario": "Chuyện bả đang giận là quá OBVIOUS rồi, nhìn cái mặt 'hình sự' đó là hiểu ngay.",
    "translationHint": "Rõ ràng, hiển nhiên"
  },
  {
    "id": "v376",
    "word": "PERSISTENT",
    "ipa": "pəˈsɪstənt",
    "elo": 920,
    "level": "intermediate",
    "scenario": "Cái đống quảng cáo cho vay tiền nó PERSISTENT gọi cho tôi suốt cả tuần, chặn không xuể.",
    "translationHint": "Kiên trì, dai dẳng"
  },
  {
    "id": "v377",
    "word": "QUALITY",
    "ipa": "ˈkwɒləti",
    "elo": 805,
    "level": "beginner",
    "scenario": "Thà có một vài người bạn QUALITY còn hơn là có cả nghìn bạn trên Facebook mà chẳng ai thèm hỏi thăm.",
    "translationHint": "Chất lượng"
  },
  {
    "id": "v378",
    "word": "REASONABLE",
    "ipa": "ˈriːznəbl",
    "elo": 855,
    "level": "beginner",
    "scenario": "Mức giá cho cái áo này là khá REASONABLE, không quá đắt mà mặc lại chất lừ.",
    "translationHint": "Hợp lý, vừa phải"
  },
  {
    "id": "v379",
    "word": "SPECIFIC",
    "ipa": "spəˈsɪfɪk",
    "elo": 830,
    "level": "beginner",
    "scenario": "Nói SPECIFIC vào, ông muốn ăn gì? 'Gì cũng được' là cái món khó tìm nhất trên đời đấy.",
    "translationHint": "Cụ thể, đặc trưng"
  },
  {
    "id": "v380",
    "word": "TRADITIONAL",
    "ipa": "trəˈdɪʃənl",
    "elo": 820,
    "level": "beginner",
    "scenario": "Bố mẹ tôi vẫn thích những giá trị TRADITIONAL, nên Tết nào cũng bắt phải gói bánh chưng.",
    "translationHint": "Truyền thống"
  },
  {
    "id": "v381",
    "word": "ULTIMATE",
    "ipa": "ˈʌltɪmət",
    "elo": 940,
    "level": "intermediate",
    "scenario": "Mục tiêu ULTIMATE của tôi là được nghỉ hưu sớm và đi du lịch khắp thế giới.",
    "translationHint": "Cuối cùng, tối thượng"
  },
  {
    "id": "v382",
    "word": "VAGUE",
    "ipa": "veɪɡ",
    "elo": 910,
    "level": "intermediate",
    "scenario": "Lời hứa 'hôm nào cà phê nhé' là cái thứ VAGUE nhất trần đời, thường là chẳng bao giờ có cái 'hôm nào' đó.",
    "translationHint": "Mơ hồ, không rõ ràng"
  },
  {
    "id": "v383",
    "word": "WILLING",
    "ipa": "ˈwɪlɪŋ",
    "elo": 830,
    "level": "beginner",
    "scenario": "Tôi luôn WILLING giúp đỡ bạn bè, miễn là đừng có hỏi mượn tiền là được.",
    "translationHint": "Sẵn lòng, tự nguyện"
  },
  {
    "id": "v384",
    "word": "ACCURATE",
    "ipa": "ˈækjərət",
    "elo": 880,
    "level": "beginner",
    "scenario": "Google Maps thỉnh thoảng cũng không ACCURATE lắm, chỉ đường cho tôi đi vào ngõ cụt suốt.",
    "translationHint": "Chính xác"
  },
  {
    "id": "v385",
    "word": "BELIEVABLE",
    "ipa": "bɪˈliːvəbl",
    "elo": 815,
    "level": "beginner",
    "scenario": "Cái lý do 'xe hỏng' của ông nghe chẳng BELIEVABLE tí nào khi ông vừa đăng ảnh đi ăn sáng.",
    "translationHint": "Có thể tin được"
  },
  {
    "id": "v386",
    "word": "CONVENIENT",
    "ipa": "kənˈviːniənt",
    "elo": 820,
    "level": "beginner",
    "scenario": "Sống ở chung cư thì rất CONVENIENT, bước chân xuống sảnh là cái gì cũng có sẵn.",
    "translationHint": "Tiện lợi"
  },
  {
    "id": "v387",
    "word": "DEPENDABLE",
    "ipa": "dɪˈpendəbl",
    "elo": 930,
    "level": "intermediate",
    "scenario": "Thằng bạn thân tôi là một người cực kỳ DEPENDABLE, lúc nào hoạn nạn cũng thấy mặt nó đầu tiên.",
    "translationHint": "Đáng tin cậy"
  },
  {
    "id": "v388",
    "word": "EFFECTIVE",
    "ipa": "ɪˈfektɪv",
    "elo": 850,
    "level": "beginner",
    "scenario": "Cách EFFECTIVE nhất để hết buồn là đi ngủ, dậy xong là thấy chuyện gì cũng qua hết.",
    "translationHint": "Hiệu quả"
  },
  {
    "id": "v389",
    "word": "FAMILIAR",
    "ipa": "fəˈmɪliə",
    "elo": 810,
    "level": "beginner",
    "scenario": "Cái bài hát này nghe FAMILIAR quá, hình như tôi đã nghe ở đâu đó trong quán cà phê rồi.",
    "translationHint": "Quen thuộc"
  },
  {
    "id": "v390",
    "word": "GRATEFUL",
    "ipa": "ˈɡreɪtfl",
    "elo": 860,
    "level": "beginner",
    "scenario": "Tôi rất GRATEFUL vì giữa lúc khó khăn vẫn có người sẵn sàng đưa tay ra giúp đỡ mình.",
    "translationHint": "Biết ơn"
  },
  {
    "id": "v391",
    "word": "HONEST",
    "ipa": "ˈɒnɪst",
    "elo": 810,
    "level": "beginner",
    "scenario": "Nói HONEST nhé, cái kiểu tóc mới của ông nhìn hơi giống mấy ông chú những năm 90 ấy.",
    "translationHint": "Thật thà, thành thật"
  },
  {
    "id": "v392",
    "word": "IGNORE",
    "ipa": "ɪɡˈnɔː(r)",
    "elo": 820,
    "level": "beginner",
    "scenario": "Cách tốt nhất để sống yên ổn là IGNORE mấy cái lời bàn tán tào lao của mấy bà hàng xóm.",
    "translationHint": "Lờ đi, phớt lờ"
  },
  {
    "id": "v393",
    "word": "INTENTION",
    "ipa": "ɪnˈtenʃn",
    "elo": 910,
    "level": "intermediate",
    "scenario": "Tôi biết INTENTION của ông là tốt, nhưng cách ông làm làm mọi chuyện rối tung lên hết rồi.",
    "translationHint": "Ý định, mục đích"
  },
  {
    "id": "v394",
    "word": "JEALOUS",
    "ipa": "ˈdʒeləs",
    "elo": 830,
    "level": "beginner",
    "scenario": "Nhìn thằng bạn thân dắt người yêu đi chơi mà tôi thấy JEALOUS phát khóc, bao giờ mới đến lượt mình đây?",
    "translationHint": "Ghen tị, đố kỵ"
  },
  {
    "id": "v395",
    "word": "LIMIT",
    "ipa": "ˈlɪmɪt",
    "elo": 815,
    "level": "beginner",
    "scenario": "Cái gì cũng có LIMIT của nó thôi, ông đừng có mà làm quá kẻo bả giận thật đấy.",
    "translationHint": "Giới hạn, hạn mức"
  },
  {
    "id": "v396",
    "word": "MANAGE",
    "ipa": "ˈmænɪdʒ",
    "elo": 850,
    "level": "beginner",
    "scenario": "Không biết làm sao mà tôi có thể MANAGE được đống việc nhà lẫn việc công ty trong cái tuần lễ này nữa.",
    "translationHint": "Quản lý, xoay xở"
  },
  {
    "id": "v397",
    "word": "NECESSARY",
    "ipa": "ˈnesəsəri",
    "elo": 840,
    "level": "beginner",
    "scenario": "Mang theo ô là cực kỳ NECESSARY vì thời tiết Sài Gòn sáng nắng chiều mưa không biết đường nào mà lần.",
    "translationHint": "Cần thiết"
  },
  {
    "id": "v398",
    "word": "OPTIMUM",
    "ipa": "ˈɒptɪməm",
    "elo": 980,
    "level": "intermediate",
    "scenario": "Thời điểm OPTIMUM để tỏ tình là lúc cả hai đang vui vẻ, chứ đừng có chọn lúc bả đang đói.",
    "translationHint": "Tối ưu, tốt nhất"
  },
  {
    "id": "v399",
    "word": "PATIENT",
    "ipa": "ˈpeɪʃnt",
    "elo": 825,
    "level": "beginner",
    "scenario": "Phải cực kỳ PATIENT khi đợi crush trang điểm, 5 phút của bả thường tương đương với 1 tiếng đồng hồ.",
    "translationHint": "Kiên nhẫn"
  },
  {
    "id": "v400",
    "word": "QUARREL",
    "ipa": "ˈkwɒrəl",
    "elo": 930,
    "level": "intermediate",
    "scenario": "Hai đứa nó suốt ngày QUARREL về mấy cái chuyện cỏn con như ai là người đi rửa bát.",
    "translationHint": "Cãi vã, tranh chấp"
  },
  {
    "id": "v401",
    "word": "REACTION",
    "ipa": "riˈækʃn",
    "elo": 835,
    "level": "beginner",
    "scenario": "REACTION của mẹ tôi khi thấy cái hình xăm mới: im lặng một hồi rồi bảo 'đẹp đấy con'.",
    "translationHint": "Phản ứng"
  },
  {
    "id": "v402",
    "word": "STUBBORN",
    "ipa": "ˈstʌbən",
    "elo": 860,
    "level": "beginner",
    "scenario": "Lão ta STUBBORN lắm, đã bảo là quán đó dở rồi mà cứ nhất quyết đòi vào ăn cho bằng được.",
    "translationHint": "Bướng bỉnh, lỳ lợm"
  },
  {
    "id": "v403",
    "word": "TEMPORARY",
    "ipa": "ˈtemprəri",
    "elo": 870,
    "level": "beginner",
    "scenario": "Đau khổ chỉ là TEMPORARY thôi, đi ăn một bữa ngon xong là lại thấy đời tươi đẹp ngay.",
    "translationHint": "Tạm thời"
  },
  {
    "id": "v404",
    "word": "URGENT",
    "ipa": "ˈɜːdʒənt",
    "elo": 845,
    "level": "beginner",
    "scenario": "Có việc URGENT nên tôi phải về gấp, mấy ông cứ nhậu tiếp đi nha, hẹn bữa sau tạ lỗi.",
    "translationHint": "Khẩn cấp"
  },
  {
    "id": "v405",
    "word": "VALUABLE",
    "ipa": "ˈvæljuəbl",
    "elo": 855,
    "level": "beginner",
    "scenario": "Thời gian là thứ VALUABLE nhất, nên đừng có lãng phí nó vào mấy cái drama vô bổ trên mạng.",
    "translationHint": "Quý giá, có giá trị"
  },
  {
    "id": "v406",
    "word": "WONDER",
    "ipa": "ˈwʌndə(r)",
    "elo": 810,
    "level": "beginner",
    "scenario": "Nhiều khi tôi WONDER không biết sếp lấy đâu ra năng lượng mà lúc nào cũng hăng hái thế không biết.",
    "translationHint": "Tự hỏi, băn khoăn"
  },
  {
    "id": "v407",
    "word": "ADMIT",
    "ipa": "ədˈmɪt",
    "elo": 865,
    "level": "beginner",
    "scenario": "Phải ADMIT là tôi đã sai khi không nghe lời khuyên của ông, giờ thì 'ăn hành' đủ luôn.",
    "translationHint": "Thừa nhận"
  },
  {
    "id": "v408",
    "word": "BORING",
    "ipa": "ˈbɔːrɪŋ",
    "elo": 800,
    "level": "beginner",
    "scenario": "Cái bộ phim này BORING đến mức tôi ngủ quên luôn trong rạp lúc nào không hay.",
    "translationHint": "Buồn chán"
  },
  {
    "id": "v409",
    "word": "COMPLAIN",
    "ipa": "kəmˈpleɪn",
    "elo": 820,
    "level": "beginner",
    "scenario": "Đừng có COMPLAIN về thời tiết nữa, thay đổi được đâu mà cứ nói suốt thế.",
    "translationHint": "Than phiền, phàn nàn"
  },
  {
    "id": "v410",
    "word": "DOUBT",
    "ipa": "daʊt",
    "elo": 855,
    "level": "beginner",
    "scenario": "Tôi DOUBT là hắn ta sẽ đến đúng giờ, cái nết của hắn thì lạ gì nữa.",
    "translationHint": "Nghi ngờ"
  },
  {
    "id": "v411",
    "word": "EAGER",
    "ipa": "ˈiːɡə(r)",
    "elo": 920,
    "level": "intermediate",
    "scenario": "Bọn trẻ con lúc nào cũng EAGER chờ đến Tết để được nhận lì xì.",
    "translationHint": "Háo hức, hăm hở"
  },
  {
    "id": "v412",
    "word": "FORCE",
    "ipa": "fɔːs",
    "elo": 840,
    "level": "beginner",
    "scenario": "Đừng có FORCE mình phải làm những thứ mình không thích chỉ để làm hài lòng người khác.",
    "translationHint": "Ép buộc"
  },
  {
    "id": "v413",
    "word": "GATHER",
    "ipa": "ˈɡæðə(r)",
    "elo": 830,
    "level": "beginner",
    "scenario": "Cuối tuần anh em mình GATHER lại làm chầu bia rồi chém gió cho đỡ stress đi.",
    "translationHint": "Tập hợp, tụ họp"
  },
  {
    "id": "v414",
    "word": "HARDLY",
    "ipa": "ˈhɑːdli",
    "elo": 815,
    "level": "beginner",
    "scenario": "Dạo này bận quá, tôi HARDLY có thời gian để gọi điện về cho bố mẹ ở quê nữa.",
    "translationHint": "Hầu như không"
  },
  {
    "id": "v415",
    "word": "IMAGINE",
    "ipa": "ɪˈmædʒɪn",
    "elo": 805,
    "level": "beginner",
    "scenario": "Không thể IMAGINE nổi cuộc sống sẽ ra sao nếu một ngày thế giới không có internet.",
    "translationHint": "Tưởng tượng"
  },
  {
    "id": "v416",
    "word": "KINDNESS",
    "ipa": "ˈkaɪndnəs",
    "elo": 820,
    "level": "beginner",
    "scenario": "Một chút KINDNESS giữa người với người có thể làm một ngày tồi tệ trở nên tươi sáng hơn.",
    "translationHint": "Sự tử tế, lòng tốt"
  },
  {
    "id": "v417",
    "word": "LOOSE",
    "ipa": "luːs",
    "elo": 835,
    "level": "beginner",
    "scenario": "Cái quần này dạo này mặc thấy LOOSE quá, chắc là do tôi mới giảm được vài ký rồi.",
    "translationHint": "Lỏng lẻo, rộng"
  },
  {
    "id": "v418",
    "word": "MENTION",
    "ipa": "ˈmenʃn",
    "elo": 840,
    "level": "beginner",
    "scenario": "Đừng có MENTION chuyện đó trước mặt bả, bả đang nhạy cảm chuyện đó lắm đấy.",
    "translationHint": "Đề cập đến"
  },
  {
    "id": "v419",
    "word": "NOTICE",
    "ipa": "ˈnəʊtɪs",
    "elo": 810,
    "level": "beginner",
    "scenario": "Tôi vừa mới NOTICE là ông cắt tóc mới à? Nhìn trẻ ra được mấy tuổi đấy.",
    "translationHint": "Nhận thấy, để ý thấy"
  },
  {
    "id": "v420",
    "word": "OFFER",
    "ipa": "ˈɒfə(r)",
    "elo": 850,
    "level": "beginner",
    "scenario": "Công ty đó vừa mới OFFER cho tôi một vị trí khá tốt, đang phân vân không biết có nên đổi việc không.",
    "translationHint": "Đề nghị, mời chào"
  },
  {
    "id": "v421",
    "word": "PARTICULAR",
    "ipa": "pəˈtɪkjələ(r)",
    "elo": 910,
    "level": "intermediate",
    "scenario": "Tôi không có sở thích gì PARTICULAR cả, cứ cái gì vui thì làm, cái gì ngon thì ăn thôi.",
    "translationHint": "Cụ thể, đặc biệt"
  },
  {
    "id": "v422",
    "word": "QUALIFY",
    "ipa": "ˈkwɒlɪfaɪ",
    "elo": 940,
    "level": "intermediate",
    "scenario": "Phải cày thêm cái bằng tiếng Anh mới QUALIFY cho cái vị trí quản lý mà sếp đang nhắm cho mình.",
    "translationHint": "Đủ điều kiện, đủ tư cách"
  },
  {
    "id": "v423",
    "word": "REASONABLE",
    "ipa": "ˈriːznəbl",
    "elo": 855,
    "level": "beginner",
    "scenario": "Cái quán lẩu này giá cả khá REASONABLE, đồ ăn lại tươi, hèn gì lúc nào cũng đông nghịt khách.",
    "translationHint": "Hợp lý, giá cả phải chăng"
  },
  {
    "id": "v424",
    "word": "STRUGGLE",
    "ipa": "ˈstrʌɡl",
    "elo": 880,
    "level": "beginner",
    "scenario": "Sáng nào tôi cũng phải STRUGGLE với cái báo thức, tắt đi bật lại 5 lần mới chịu dậy nổi.",
    "translationHint": "Vật lộn, đấu tranh"
  },
  {
    "id": "v425",
    "word": "THOROUGH",
    "ipa": "ˈθʌrə",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Trước khi dắt xe ra khỏi bãi, nhớ check THOROUGH xem có bị trầy xước chỗ nào không kẻo mất tiền oan.",
    "translationHint": "Kỹ lưỡng, thấu đáo"
  },
  {
    "id": "v426",
    "word": "UNIQUE",
    "ipa": "juˈniːk",
    "elo": 860,
    "level": "beginner",
    "scenario": "Cái phong cách ăn mặc của ông đúng là UNIQUE thật, ra đường không sợ đụng hàng với ai luôn.",
    "translationHint": "Độc nhất, độc đáo"
  },
  {
    "id": "v427",
    "word": "VALUABLE",
    "ipa": "ˈvæljuəbl",
    "elo": 850,
    "level": "beginner",
    "scenario": "Mấy cái kinh nghiệm 'xương máu' hồi mới ra trường là bài học VALUABLE nhất mà không trường lớp nào dạy.",
    "translationHint": "Quý giá, có giá trị"
  },
  {
    "id": "v428",
    "word": "WHISPER",
    "ipa": "ˈwɪspə(r)",
    "elo": 830,
    "level": "beginner",
    "scenario": "Hai đứa nó cứ WHISPER với nhau trong góc lớp, nhìn là biết đang có 'biến' gì to lắm rồi.",
    "translationHint": "Thì thầm"
  },
  {
    "id": "v429",
    "word": "ANNOYING",
    "ipa": "əˈnɔɪɪŋ",
    "elo": 820,
    "level": "beginner",
    "scenario": "Mấy cái tin nhắn rác mời chào mua nhà, chứng khoán lúc giữa trưa thật sự ANNOYING vãi chưởng.",
    "translationHint": "Làm phiền, khó chịu"
  },
  {
    "id": "v430",
    "word": "BELIEVE",
    "ipa": "bɪˈliːv",
    "elo": 800,
    "level": "beginner",
    "scenario": "Tôi không thể BELIEVE nổi là thằng bạn thân mình lại đi tin mấy cái lời 'thả thính' dạo trên mạng.",
    "translationHint": "Tin tưởng"
  },
  {
    "id": "v431",
    "word": "CRITICAL",
    "ipa": "ˈkrɪtɪkl",
    "elo": 970,
    "level": "intermediate",
    "scenario": "Đây là giai đoạn CRITICAL của dự án, sai một li là đi một dặm nên anh em cẩn thận giùm cái.",
    "translationHint": "Quan trọng, mang tính quyết định"
  },
  {
    "id": "v432",
    "word": "DELIGHTED",
    "ipa": "dɪˈlaɪtɪd",
    "elo": 890,
    "level": "beginner",
    "scenario": "Mẹ tôi cực kỳ DELIGHTED khi thấy tôi đem về tặng mẹ một bó hoa vào ngày 8/3.",
    "translationHint": "Vui mừng, hài lòng"
  },
  {
    "id": "v433",
    "word": "EFFICIENT",
    "ipa": "ɪˈfɪʃnt",
    "elo": 920,
    "level": "intermediate",
    "scenario": "Dùng nồi chiên không dầu là cách EFFICIENT nhất để nấu ăn mà không phải dọn dẹp đống mỡ bắn tung tóe.",
    "translationHint": "Hiệu quả, năng suất"
  },
  {
    "id": "v434",
    "word": "FRUSTRATED",
    "ipa": "frʌˈstreɪtɪd",
    "elo": 870,
    "level": "beginner",
    "scenario": "Cảm giác FRUSTRATED nhất là khi đang chuẩn bị thanh toán thì app ngân hàng bị lỗi bảo trì.",
    "translationHint": "Bực bội, nản lòng"
  },
  {
    "id": "v435",
    "word": "GENUINE",
    "ipa": "ˈdʒenjuɪn",
    "elo": 880,
    "level": "beginner",
    "scenario": "Tìm được một người bạn GENUINE trong cái thời đại vật chất này khó hơn cả tìm kim đáy bể.",
    "translationHint": "Thật lòng, chân thành"
  },
  {
    "id": "v436",
    "word": "HESITATE",
    "ipa": "ˈhezɪteɪt",
    "elo": 825,
    "level": "beginner",
    "scenario": "Đừng HESITATE khi muốn nói lời xin lỗi, để lâu quá là cái 'tôi' nó to lên rồi khó nói lắm.",
    "translationHint": "Do dự, ngập ngừng"
  },
  {
    "id": "v437",
    "word": "INFLUENCE",
    "ipa": "ˈɪnfluəns",
    "elo": 915,
    "level": "intermediate",
    "scenario": "Mấy cái video trên TikTok có INFLUENCE cực lớn đến cách tiêu xài của giới trẻ bây giờ.",
    "translationHint": "Ảnh hưởng, tác động"
  },
  {
    "id": "v438",
    "word": "JUDGE",
    "ipa": "dʒʌdʒ",
    "elo": 830,
    "level": "beginner",
    "scenario": "Đừng có vội JUDGE người khác qua vẻ bề ngoài, nhìn bặm trợn thế thôi chứ hiền khô hà.",
    "translationHint": "Đánh giá, phán xét"
  },
  {
    "id": "v439",
    "word": "KNOWLEDGE",
    "ipa": "ˈnɒlɪdʒ",
    "elo": 840,
    "level": "beginner",
    "scenario": "KNOWLEDGE là thứ duy nhất mà không ai có thể lấy mất của ông, nên cứ đầu tư vào bản thân đi.",
    "translationHint": "Kiến thức, sự hiểu biết"
  },
  {
    "id": "v440",
    "word": "LACK",
    "ipa": "læk",
    "elo": 810,
    "level": "beginner",
    "scenario": "Cái món canh này hơi LACK vị chua, cho thêm tí chanh vào là đảm bảo cực phẩm luôn.",
    "translationHint": "Thiếu hụt"
  },
  {
    "id": "v441",
    "word": "MAINTAIN",
    "ipa": "meɪnˈteɪn",
    "elo": 865,
    "level": "beginner",
    "scenario": "Muốn MAINTAIN một mối quan hệ lâu dài thì cả hai đều phải biết nhường nhịn nhau một tí.",
    "translationHint": "Duy trì, giữ vững"
  },
  {
    "id": "v442",
    "word": "NERVOUS",
    "ipa": "ˈnɜːvəs",
    "elo": 815,
    "level": "beginner",
    "scenario": "Đi phỏng vấn mà NERVOUS quá nên tôi trả lời cứ ấp a ấp úng, sếp nhìn tôi cười mà muốn độn thổ.",
    "translationHint": "Lo lắng, hồi hộp"
  },
  {
    "id": "v443",
    "word": "OPPORTUNITY",
    "ipa": "ˌɒpəˈtjuːnəti",
    "elo": 850,
    "level": "beginner",
    "scenario": "Cơ hội không đến lần hai đâu, thấy OPPORTUNITY là phải 'vồ' lấy ngay đừng có chần chừ.",
    "translationHint": "Cơ hội"
  },
  {
    "id": "v444",
    "word": "PREFER",
    "ipa": "prɪˈfɜː(r)",
    "elo": 820,
    "level": "beginner",
    "scenario": "Tôi PREFER đi cà phê vỉa hè hơn là vào mấy quán máy lạnh sang chảnh, thấy nó thoải mái hơn.",
    "translationHint": "Thích hơn"
  },
  {
    "id": "v445",
    "word": "QUALITY",
    "ipa": "ˈkwɒləti",
    "elo": 805,
    "level": "beginner",
    "scenario": "Mua đồ thì nên chọn QUALITY hơn là quantity, thà mặc một cái áo xịn còn hơn mười cái áo dỏm.",
    "translationHint": "Chất lượng"
  },
  {
    "id": "v446",
    "word": "RECOGNIZE",
    "ipa": "ˈrekəɡnaɪz",
    "elo": 875,
    "level": "beginner",
    "scenario": "Dạo này ông thay đổi nhiều quá, suýt nữa là tôi không RECOGNIZE ra ông luôn đấy.",
    "translationHint": "Nhận ra"
  },
  {
    "id": "v447",
    "word": "SENSITIVE",
    "ipa": "ˈsensətɪv",
    "elo": 935,
    "level": "intermediate",
    "scenario": "Bả đang ở trong giai đoạn SENSITIVE, ông nói năng gì cũng phải uốn lưỡi 7 lần kẻo ăn tát.",
    "translationHint": "Nhạy cảm"
  },
  {
    "id": "v448",
    "word": "TRUSTWORTHY",
    "ipa": "ˈtrʌstwɜːði",
    "elo": 925,
    "level": "intermediate",
    "scenario": "Phải chọn người nào thật sự TRUSTWORTHY mới dám giao cái 'quỹ đen' này cho mà giữ hộ.",
    "translationHint": "Đáng tin cậy"
  },
  {
    "id": "v449",
    "word": "URGENT",
    "ipa": "ˈɜːdʒənt",
    "elo": 845,
    "level": "beginner",
    "scenario": "Có tin nhắn URGENT từ bồ: 'Anh ơi em đói'. Thế là phải xách xe đi mua đồ ăn ngay.",
    "translationHint": "Khẩn cấp"
  },
  {
    "id": "v450",
    "word": "VALUABLE",
    "ipa": "ˈvæljuəbl",
    "elo": 855,
    "level": "beginner",
    "scenario": "Đừng tốn thời gian VALUABLE của mình để đi giải thích với những người không muốn hiểu.",
    "translationHint": "Quý giá"
  },
  {
    "id": "v451",
    "word": "APPROPRIATE",
    "ipa": "əˈprəʊpriət",
    "elo": 960,
    "level": "intermediate",
    "scenario": "Đi đám cưới mà mặc quần short áo ba lỗ thì thật sự không APPROPRIATE tí nào đâu ông nội.",
    "translationHint": "Phù hợp, thích hợp"
  },
  {
    "id": "v452",
    "word": "BEHAVE",
    "ipa": "bɪˈheɪv",
    "elo": 820,
    "level": "beginner",
    "scenario": "Ra mắt nhà bạn gái thì nhớ BEHAVE cho nó đàng hoàng, đừng có hở tí là văng tục như lúc ở với anh em.",
    "translationHint": "Cư xử, ăn ở"
  },
  {
    "id": "v453",
    "word": "COINCIDENCE",
    "ipa": "kəʊˈɪnsɪdəns",
    "elo": 980,
    "level": "intermediate",
    "scenario": "Đúng là một cái COINCIDENCE kỳ lạ, vừa mới nhắc đến tên hắn xong là hắn gọi điện tới luôn.",
    "translationHint": "Sự trùng hợp ngẫu nhiên"
  },
  {
    "id": "v454",
    "word": "DETERMINED",
    "ipa": "dɪˈtɜːmɪnd",
    "elo": 880,
    "level": "beginner",
    "scenario": "Thấy bồ cũ có người yêu mới, tôi DETERMINED phải giảm cân để cho bả thấy bả đã đánh mất cái gì.",
    "translationHint": "Quyết tâm, kiên quyết"
  },
  {
    "id": "v455",
    "word": "ENCOURAGE",
    "ipa": "ɪnˈkʌrɪdʒ",
    "elo": 860,
    "level": "beginner",
    "scenario": "Mẹ tôi luôn ENCOURAGE tôi theo đuổi đam mê, miễn là đừng có về nhà xin tiền mẹ là được.",
    "translationHint": "Khuyến khích, động viên"
  },
  {
    "id": "v456",
    "word": "FAMILIAR",
    "ipa": "fəˈmɪliə(r)",
    "elo": 810,
    "level": "beginner",
    "scenario": "Cái quán cà phê này nhìn FAMILIAR quá, hình như đây là nơi mình bị người yêu cũ đá thì phải.",
    "translationHint": "Quen thuộc"
  },
  {
    "id": "v457",
    "word": "GENEROUS",
    "ipa": "ˈdʒenərəs",
    "elo": 835,
    "level": "beginner",
    "scenario": "Ông bà chủ trọ nhà tôi cực kỳ GENEROUS, Tết nào cũng bớt cho nửa tháng tiền phòng lấy lộc.",
    "translationHint": "Hào phóng, rộng lượng"
  },
  {
    "id": "v458",
    "word": "HESITATE",
    "ipa": "ˈhezɪteɪt",
    "elo": 825,
    "level": "beginner",
    "scenario": "Thấy gái xinh thì cứ lại gần mà làm quen, đừng có HESITATE mãi kẻo thằng khác nó hốt mất.",
    "translationHint": "Do dự, ngập ngừng"
  },
  {
    "id": "v459",
    "word": "IMITATE",
    "ipa": "ˈɪmɪteɪt",
    "elo": 940,
    "level": "intermediate",
    "scenario": "Đứa em tôi nó suốt ngày IMITATE cái giọng của tôi để đi lừa bố mẹ, nhìn mà ghét.",
    "translationHint": "Bắt chước, nhại lại"
  },
  {
    "id": "v460",
    "word": "JEALOUS",
    "ipa": "ˈdʒeləs",
    "elo": 830,
    "level": "beginner",
    "scenario": "Mỗi lần thấy tôi đi chơi với bạn nữ khác là người yêu tôi lại JEALOUS ra mặt luôn.",
    "translationHint": "Ghen tị, ghen tuông"
  },
  {
    "id": "v461",
    "word": "KNOWLEDGEABLE",
    "ipa": "ˈnɒlɪdʒəbl",
    "elo": 950,
    "level": "intermediate",
    "scenario": "Ba tôi rất KNOWLEDGEABLE về xe cộ, xe hỏng chỗ nào chỉ cần nghe tiếng máy là biết ngay.",
    "translationHint": "Am hiểu, có kiến thức rộng"
  },
  {
    "id": "v462",
    "word": "LIMIT",
    "ipa": "ˈlɪmɪt",
    "elo": 815,
    "level": "beginner",
    "scenario": "Tửu lượng của tôi có LIMIT thôi, mấy ông đừng có ép tôi uống thêm nữa kẻo tôi 'huệ' tại chỗ.",
    "translationHint": "Giới hạn"
  },
  {
    "id": "v463",
    "word": "MOTIVATE",
    "ipa": "ˈməʊtɪveɪt",
    "elo": 860,
    "level": "beginner",
    "scenario": "Cái bụng mỡ chính là thứ duy nhất MOTIVATE tôi xách giày ra sân đá bóng mỗi cuối tuần.",
    "translationHint": "Thúc đẩy, tạo động lực"
  },
  {
    "id": "v464",
    "word": "NOTICE",
    "ipa": "ˈnəʊtɪs",
    "elo": 810,
    "level": "beginner",
    "scenario": "Tôi vừa mới NOTICE là nãy giờ tôi đang mặc áo trái đi ngoài đường, nhục không để đâu cho hết.",
    "translationHint": "Để ý thấy, nhận ra"
  },
  {
    "id": "v465",
    "word": "OBVIOUS",
    "ipa": "ˈɒbviəs",
    "elo": 815,
    "level": "beginner",
    "scenario": "Lý do bả đòi chia tay quá OBVIOUS rồi: bả có mối khác ngon hơn, thế thôi.",
    "translationHint": "Rõ ràng, hiển nhiên"
  },
  {
    "id": "v466",
    "word": "PATIENT",
    "ipa": "ˈpeɪʃnt",
    "elo": 825,
    "level": "beginner",
    "scenario": "Muốn tán đổ crush thì phải PATIENT, chứ mới nhắn tin 2 ngày đã đòi yêu thì bả chạy mất dép.",
    "translationHint": "Kiên nhẫn"
  },
  {
    "id": "v467",
    "word": "QUARREL",
    "ipa": "ˈkwɒrəl",
    "elo": 930,
    "level": "intermediate",
    "scenario": "Mới sáng ra đã nghe thấy nhà hàng xóm QUARREL về việc ai là người đi đổ rác, mệt mỏi thật.",
    "translationHint": "Cãi vã, tranh chấp"
  },
  {
    "id": "v468",
    "word": "REASONABLE",
    "ipa": "ˈriːznəbl",
    "elo": 855,
    "level": "beginner",
    "scenario": "Cái shop này bán đồ giá cực kỳ REASONABLE, phù hợp với túi tiền của sinh viên nghèo như tôi.",
    "translationHint": "Hợp lý, phải chăng"
  },
  {
    "id": "v469",
    "word": "STUBBORN",
    "ipa": "ˈstʌbən",
    "elo": 860,
    "level": "beginner",
    "scenario": "Con mèo nhà tôi STUBBORN lắm, bảo nó xuống khỏi bàn mà nó cứ lỳ ra đó nhìn mình khinh bỉ.",
    "translationHint": "Bướng bỉnh, lỳ lợm"
  },
  {
    "id": "v470",
    "word": "TEMPORARY",
    "ipa": "ˈtemprəri",
    "elo": 870,
    "level": "beginner",
    "scenario": "Đừng lo, thất nghiệp chỉ là TEMPORARY thôi, lo mà học thêm skill mới đi rồi việc sẽ tới.",
    "translationHint": "Tạm thời"
  },
  {
    "id": "v471",
    "word": "URGENT",
    "ipa": "ˈɜːdʒənt",
    "elo": 845,
    "level": "beginner",
    "scenario": "Đang đi vệ sinh mà sếp gọi điện báo có việc URGENT thì đúng là một trải nghiệm đau khổ.",
    "translationHint": "Khẩn cấp"
  },
  {
    "id": "v472",
    "word": "VAGUE",
    "ipa": "veɪɡ",
    "elo": 910,
    "level": "intermediate",
    "scenario": "Câu trả lời 'Để em xem đã' của bồ thường rất VAGUE, đa phần là bả không muốn đi rồi.",
    "translationHint": "Mơ hồ, không rõ ràng"
  },
  {
    "id": "v473",
    "word": "WILLING",
    "ipa": "ˈwɪlɪŋ",
    "elo": 830,
    "level": "beginner",
    "scenario": "Tôi luôn WILLING đi nhậu nếu có ai đó bao, còn chia tiền thì để tôi xem lại lịch đã nha.",
    "translationHint": "Sẵn lòng, tự nguyện"
  },
  {
    "id": "v474",
    "word": "ACCURATE",
    "ipa": "ˈækjərət",
    "elo": 880,
    "level": "beginner",
    "scenario": "Cái cân này có vẻ không ACCURATE lắm, hôm qua tôi cân 70kg mà nay nó nhảy lên 75kg là sao?",
    "translationHint": "Chính xác"
  },
  {
    "id": "v475",
    "word": "BELIEVABLE",
    "ipa": "bɪˈliːvəbl",
    "elo": 815,
    "level": "beginner",
    "scenario": "Ông bảo ông đi làm muộn vì 'cứu người qua đường' nghe chẳng BELIEVABLE tí nào đâu.",
    "translationHint": "Có thể tin được"
  },
  {
    "id": "v476",
    "word": "CONVENIENT",
    "ipa": "kənˈviːniənt",
    "elo": 820,
    "level": "beginner",
    "scenario": "Cái app này CONVENIENT thật sự, đặt một cái là 15 phút sau đồ ăn đã ship tới tận cửa.",
    "translationHint": "Tiện lợi"
  },
  {
    "id": "v477",
    "word": "DEPENDABLE",
    "ipa": "dɪˈpendəbl",
    "elo": 930,
    "level": "intermediate",
    "scenario": "Trong nhóm bạn, lúc nào cũng cần một đứa DEPENDABLE để nó đứng ra lo liệu mọi thứ khi đi du lịch.",
    "translationHint": "Đáng tin cậy"
  },
  {
    "id": "v478",
    "word": "EFFECTIVE",
    "ipa": "ɪˈfektɪv",
    "elo": 850,
    "level": "beginner",
    "scenario": "Uống nước chanh mật ong là cách EFFECTIVE nhất để trị đau họng sau một đêm hát karaoke cháy máy.",
    "translationHint": "Hiệu quả"
  },
  {
    "id": "v479",
    "word": "GRATEFUL",
    "ipa": "ˈɡreɪtfl",
    "elo": 860,
    "level": "beginner",
    "scenario": "Tôi rất GRATEFUL vì cuối tháng hết tiền vẫn được thằng bạn thân cho ăn ké mì tôm.",
    "translationHint": "Biết ơn"
  },
  {
    "id": "v480",
    "word": "HONEST",
    "ipa": "ˈɒnɪst",
    "elo": 810,
    "level": "beginner",
    "scenario": "Nói HONEST nhé, cái váy này mặc vào trông ông... à nhầm, trông bà như cái bánh chưng vậy.",
    "translationHint": "Thành thật"
  },
  {
    "id": "v481",
    "word": "IGNORE",
    "ipa": "ɪɡˈnɔː(r)",
    "elo": 820,
    "level": "beginner",
    "scenario": "Cách tốt nhất để giữ tâm hồn thanh tịnh là IGNORE mấy cái lời drama, bóc phốt nhảm nhí trên Facebook.",
    "translationHint": "Phớt lờ, lờ đi"
  },
  {
    "id": "v482",
    "word": "INTENTION",
    "ipa": "ɪnˈtenʃn",
    "elo": 910,
    "level": "intermediate",
    "scenario": "Tôi biết INTENTION của ông là muốn giúp bả, nhưng cách ông làm chỉ khiến bả thấy bị làm phiền thêm thôi.",
    "translationHint": "Ý định, mục đích"
  },
  {
    "id": "v483",
    "word": "MANAGE",
    "ipa": "ˈmænɪdʒ",
    "elo": 850,
    "level": "beginner",
    "scenario": "Cuối tháng mà tài khoản còn 200k thì phải biết MANAGE chi tiêu cực khéo mới sống sót được đến ngày nhận lương.",
    "translationHint": "Quản lý, xoay xở"
  },
  {
    "id": "v484",
    "word": "NECESSARY",
    "ipa": "ˈnesəsəri",
    "elo": 840,
    "level": "beginner",
    "scenario": "Mua thêm cái sạc dự phòng là cực kỳ NECESSARY cho mấy chuyến đi phượt xa, không là điện thoại hết pin giữa đường là mệt.",
    "translationHint": "Cần thiết"
  },
  {
    "id": "v485",
    "word": "OPTIMISTIC",
    "ipa": "ˌɒptɪˈmɪstɪk",
    "elo": 840,
    "level": "beginner",
    "scenario": "Dù bị crush từ chối nhưng hắn vẫn rất OPTIMISTIC, bảo rằng 'chắc tại bả đang thử thách lòng kiên nhẫn của mình thôi'.",
    "translationHint": "Lạc quan"
  },
  {
    "id": "v486",
    "word": "PARTIAL",
    "ipa": "ˈpɑːʃl",
    "elo": 830,
    "level": "beginner",
    "scenario": "Đây mới chỉ là một PARTIAL sự thật thôi, đợi khi nào ông biết hết cả câu chuyện thì ông mới thấy nó sốc cỡ nào.",
    "translationHint": "Một phần"
  },
  {
    "id": "v487",
    "word": "QUICKLY",
    "ipa": "ˈkwɪkli",
    "elo": 800,
    "level": "beginner",
    "scenario": "Ăn QUICKLY đi rồi còn đi làm, cứ nhai như mèo mửa thế kia thì bao giờ mới xong?",
    "translationHint": "Nhanh chóng"
  },
  {
    "id": "v488",
    "word": "REACTION",
    "ipa": "riˈækʃn",
    "elo": 820,
    "level": "beginner",
    "scenario": "REACTION của sếp khi thấy tôi đi làm muộn: không nói gì nhưng ánh mắt ấy làm tôi lạnh sống lưng.",
    "translationHint": "Phản ứng"
  },
  {
    "id": "v489",
    "word": "SIGNIFICANT",
    "ipa": "sɪɡˈnɪfɪkənt",
    "elo": 850,
    "level": "beginner",
    "scenario": "Việc có thêm một đứa bạn thân cùng tiến bộ sẽ tạo ra thay đổi SIGNIFICANT cho cuộc đời ông.",
    "translationHint": "Quan trọng, đáng kể"
  },
  {
    "id": "v490",
    "word": "TOLERATE",
    "ipa": "ˈtɒləreɪt",
    "elo": 855,
    "level": "beginner",
    "scenario": "Tôi không thể TOLERATE nổi cái thói quen vừa ăn vừa bấm điện thoại của ông, nhìn mất lịch sự vãi.",
    "translationHint": "Chịu đựng, tha thứ"
  },
  {
    "id": "v491",
    "word": "UTILIZE",
    "ipa": "ˈjuːtɪlaɪz",
    "elo": 860,
    "level": "beginner",
    "scenario": "Phải biết UTILIZE mấy cái voucher giảm giá trên app, tích tiểu thành đại cũng đỡ được khối tiền đấy.",
    "translationHint": "Tận dụng, sử dụng"
  },
  {
    "id": "v492",
    "word": "VALID",
    "ipa": "ˈvælɪd",
    "elo": 840,
    "level": "beginner",
    "scenario": "Lý do 'em bận' chỉ VALID khi ông thật sự bận thôi, còn đang ngồi đánh rank mà bảo bận là bùa chú rồi.",
    "translationHint": "Hợp lý, có giá trị"
  },
  {
    "id": "v493",
    "word": "WONDER",
    "ipa": "ˈwʌndə(r)",
    "elo": 810,
    "level": "beginner",
    "scenario": "Đôi khi tôi WONDER không biết tại sao mình lại có thể kiên trì với cái công việc này lâu đến thế.",
    "translationHint": "Tự hỏi, băn khoăn"
  },
  {
    "id": "v494",
    "word": "ADMIT",
    "ipa": "ədˈmɪt",
    "elo": 865,
    "level": "beginner",
    "scenario": "Cuối cùng hắn cũng chịu ADMIT là mình đã sai, sau khi làm cả team phải làm lại từ đầu.",
    "translationHint": "Thừa nhận"
  },
  {
    "id": "v495",
    "word": "BORING",
    "ipa": "ˈbɔːrɪŋ",
    "elo": 800,
    "level": "beginner",
    "scenario": "Mấy cái buổi họp kéo dài cả tiếng đồng hồ mà chẳng chốt được gì thật sự rất BORING.",
    "translationHint": "Buồn chán"
  },
  {
    "id": "v496",
    "word": "COMPLAIN",
    "ipa": "kəmˈpleɪn",
    "elo": 820,
    "level": "beginner",
    "scenario": "Thôi bớt COMPLAIN về lương thấp đi, thay vào đó hãy lo mà nâng cấp cái kỹ năng của mình lên.",
    "translationHint": "Than phiền, phàn nàn"
  },
  {
    "id": "v497",
    "word": "DOUBT",
    "ipa": "daʊt",
    "elo": 855,
    "level": "beginner",
    "scenario": "Tôi DOUBT là cái shop này bán hàng chính hãng, giá rẻ bất ngờ thế kia thì nghi lắm.",
    "translationHint": "Nghi ngờ"
  },
  {
    "id": "v498",
    "word": "EAGER",
    "ipa": "ˈiːɡə(r)",
    "elo": 920,
    "level": "intermediate",
    "scenario": "Vừa nghe tin có quán nướng mới mở, lũ bạn tôi đã EAGER rủ nhau đi thử ngay cuối tuần này.",
    "translationHint": "Háo hức, hăm hở"
  },
  {
    "id": "v499",
    "word": "FORCE",
    "ipa": "fɔːs",
    "elo": 840,
    "level": "beginner",
    "scenario": "Bố mẹ không nên FORCE con cái phải học những ngành mà chúng nó không hề có đam mê.",
    "translationHint": "Ép buộc"
  },
  {
    "id": "v500",
    "word": "GATHER",
    "ipa": "ˈɡæðə(r)",
    "elo": 830,
    "level": "beginner",
    "scenario": "Cả nhà GATHER lại ăn bữa cơm cuối năm là khoảnh khắc ý nghĩa nhất đối với tôi.",
    "translationHint": "Tụ họp, tập hợp"
  },
  {
    "id": "v501",
    "word": "HARDLY",
    "ipa": "ˈhɑːdli",
    "elo": 815,
    "level": "beginner",
    "scenario": "Dạo này bận bù đầu, tôi HARDLY có thời gian để lướt Facebook hay xem phim nữa.",
    "translationHint": "Hầu như không"
  },
  {
    "id": "v502",
    "word": "IMAGINE",
    "ipa": "ɪˈmædʒɪn",
    "elo": 805,
    "level": "beginner",
    "scenario": "Ông có thể IMAGINE được cảnh mình trúng số độc đắc thì việc đầu tiên ông làm là gì không?",
    "translationHint": "Tưởng tượng"
  },
  {
    "id": "v503",
    "word": "KINDNESS",
    "ipa": "ˈkaɪndnəs",
    "elo": 820,
    "level": "beginner",
    "scenario": "Đôi khi chỉ một chút KINDNESS nhỏ như nhường ghế cho người già cũng làm ngày mới tốt đẹp hơn.",
    "translationHint": "Lòng tốt, sự tử tế"
  },
  {
    "id": "v504",
    "word": "LOOSE",
    "ipa": "luːs",
    "elo": 835,
    "level": "beginner",
    "scenario": "Cái ốc này bị LOOSE rồi, hèn gì cái bàn cứ lung lay mãi, lấy cái tua vít siết lại đi.",
    "translationHint": "Lỏng, lỏng lẻo"
  },
  {
    "id": "v505",
    "word": "MENTION",
    "ipa": "ˈmenʃn",
    "elo": 840,
    "level": "beginner",
    "scenario": "Đừng MENTION chuyện nợ nần trước mặt hắn, hắn đang stress chuyện tiền bạc lắm đấy.",
    "translationHint": "Đề cập đến"
  },
  {
    "id": "v506",
    "word": "NOTICE",
    "ipa": "ˈnəʊtɪs",
    "elo": 810,
    "level": "beginner",
    "scenario": "Tôi vừa NOTICE là bồ ông mới đổi màu tóc à? Nhìn cũng hợp phết đấy chứ.",
    "translationHint": "Nhận ra, để ý thấy"
  },
  {
    "id": "v507",
    "word": "OFFER",
    "ipa": "ˈɒfə(r)",
    "elo": 850,
    "level": "beginner",
    "scenario": "Công ty đó OFFER mức lương khá hời, nhưng bắt làm cả thứ Bảy nên tôi vẫn đang phân vân.",
    "translationHint": "Đề nghị, mời chào"
  },
  {
    "id": "v508",
    "word": "PERCEIVE",
    "ipa": "pəˈsiːv",
    "elo": 1010,
    "level": "intermediate",
    "scenario": "Nhiều người PERCEIVE việc làm freelancer là nhàn hạ, nhưng thực ra là cày ngày cày đêm không nghỉ.",
    "translationHint": "Nhận thức, nhìn nhận"
  },
  {
    "id": "v509",
    "word": "QUALITY",
    "ipa": "ˈkwɒləti",
    "elo": 805,
    "level": "beginner",
    "scenario": "Đi ăn quán lề đường thì đừng đòi hỏi QUALITY phục vụ như trong nhà hàng 5 sao nha.",
    "translationHint": "Chất lượng"
  },
  {
    "id": "v510",
    "word": "RECOGNIZE",
    "ipa": "ˈrekəɡnaɪz",
    "elo": 875,
    "level": "beginner",
    "scenario": "Ra đường đeo khẩu trang kín mít thế kia thì bố ai mà RECOGNIZE ra được ông là ai.",
    "translationHint": "Nhận ra"
  },
  {
    "id": "v511",
    "word": "SENSITIVE",
    "ipa": "ˈsensətɪv",
    "elo": 935,
    "level": "intermediate",
    "scenario": "Bà sếp dạo này SENSITIVE vãi, chỉ cần nói đùa một câu thôi là bả cũng tưởng mình đang nói đểu bả.",
    "translationHint": "Nhạy cảm"
  },
  {
    "id": "v512",
    "word": "TRUSTWORTHY",
    "ipa": "ˈtrʌstwɜːði",
    "elo": 925,
    "level": "intermediate",
    "scenario": "Muốn tìm người TRUSTWORTHY để gửi gắm chìa khóa nhà lúc đi du lịch cũng khó phết đấy.",
    "translationHint": "Đáng tin cậy"
  },
  {
    "id": "v513",
    "word": "UNEXPECTED",
    "ipa": "ˌʌnɪkˈspektɪd",
    "elo": 850,
    "level": "beginner",
    "scenario": "Đang đi chơi với ghẹ mà gặp ngay UNEXPECTED 'ông già vợ' tương lai đang đi tập thể dục thì đúng là cạn lời.",
    "translationHint": "Bất ngờ, không mong đợi"
  },
  {
    "id": "v514",
    "word": "VALUABLE",
    "ipa": "ˈvæljuəbl",
    "elo": 855,
    "level": "beginner",
    "scenario": "Mấy đứa bạn thân mà dám nói thẳng cái sai của mình mới là những người VALUABLE nhất.",
    "translationHint": "Quý giá, có giá trị"
  },
  {
    "id": "v515",
    "word": "WILLING",
    "ipa": "ˈwɪlɪŋ",
    "elo": 830,
    "level": "beginner",
    "scenario": "Tôi rất WILLING chở ông đi nếu ông bao tôi chầu cà phê, chứ xăng dạo này lên giá quá.",
    "translationHint": "Sẵn lòng, tự nguyện"
  },
  {
    "id": "v516",
    "word": "ANNOYING",
    "ipa": "əˈnɔɪɪŋ",
    "elo": 820,
    "level": "beginner",
    "scenario": "Cái tiếng chuông báo thức lúc 6h sáng thật sự ANNOYING, muốn ném luôn cái điện thoại vào tường.",
    "translationHint": "Làm phiền, gây khó chịu"
  },
  {
    "id": "v517",
    "word": "BELIEVABLE",
    "ipa": "bɪˈliːvəbl",
    "elo": 815,
    "level": "beginner",
    "scenario": "Lý do 'em bị đau bụng' nghe Believable hơn là 'em bị bắt cóc' khi xin nghỉ học đấy.",
    "translationHint": "Có thể tin được"
  },
  {
    "id": "v518",
    "word": "CONVENIENT",
    "ipa": "kənˈviːniənt",
    "elo": 820,
    "level": "beginner",
    "scenario": "Nhà gần VinMart tiện (CONVENIENT) thật, đêm hôm thèm mì tôm chỉ cần chạy xuống 2 phút là có.",
    "translationHint": "Tiện lợi"
  },
  {
    "id": "v519",
    "word": "DOUBT",
    "ipa": "daʊt",
    "elo": 855,
    "level": "beginner",
    "scenario": "Tôi DOUBT là hắn ta sẽ trả tiền đúng hạn, cái nết của hắn là 'hứa thật nhiều thất hứa thật nhiều'.",
    "translationHint": "Nghi ngờ"
  },
  {
    "id": "v520",
    "word": "EFFICIENT",
    "ipa": "ɪˈfɪʃnt",
    "elo": 920,
    "level": "intermediate",
    "scenario": "Cách EFFICIENT nhất để giảm cân là bớt miệng lại, chứ cứ ăn xong nằm thì gym cũng chịu.",
    "translationHint": "Hiệu quả, năng suất"
  },
  {
    "id": "v521",
    "word": "FRUSTRATED",
    "ipa": "frʌˈstreɪtɪd",
    "elo": 870,
    "level": "beginner",
    "scenario": "Cảm thấy cực kỳ FRUSTRATED khi đang nhắn tin tỏ tình mà máy hết pin đột ngột.",
    "translationHint": "Bực bội, nản lòng"
  },
  {
    "id": "v522",
    "word": "GENUINE",
    "ipa": "ˈdʒenjuɪn",
    "elo": 880,
    "level": "beginner",
    "scenario": "Cái nụ cười GENUINE của cô ấy làm tôi tin rằng trên đời này vẫn còn nhiều điều tốt đẹp.",
    "translationHint": "Thật lòng, chân thành"
  },
  {
    "id": "v523",
    "word": "HESITATE",
    "ipa": "ˈhezɪteɪt",
    "elo": 825,
    "level": "beginner",
    "scenario": "Đừng HESITATE khi thấy đồ sale, vì chớp mắt thôi là mấy chị em khác hốt sạch rồi.",
    "translationHint": "Do dự, ngập ngừng"
  },
  {
    "id": "v524",
    "word": "INFLUENCE",
    "ipa": "ˈɪnfluəns",
    "elo": 915,
    "level": "intermediate",
    "scenario": "Thằng bạn thân nó INFLUENCE cái gu âm nhạc của tôi hơi bị nhiều, giờ toàn nghe nhạc buồn.",
    "translationHint": "Ảnh hưởng, tác động"
  },
  {
    "id": "v525",
    "word": "JUDGE",
    "ipa": "dʒʌdʒ",
    "elo": 830,
    "level": "beginner",
    "scenario": "Đừng vội JUDGE một người qua cái xe họ đi, nhiều ông đi xe cà tàng nhưng tài khoản mấy tỷ đấy.",
    "translationHint": "Đánh giá, phán xét"
  },
  {
    "id": "v526",
    "word": "LACK",
    "ipa": "læk",
    "elo": 810,
    "level": "beginner",
    "scenario": "Món phở này ngon nhưng hơi LACK vị đậm đà của xương, chắc cho thêm tí muối vào.",
    "translationHint": "Thiếu hụt"
  },
  {
    "id": "v527",
    "word": "MAINTAIN",
    "ipa": "meɪnˈteɪn",
    "elo": 865,
    "level": "beginner",
    "scenario": "MAINTAIN cái thói quen đọc sách mỗi ngày khó vãi, toàn đọc được 2 trang là lăn ra ngủ.",
    "translationHint": "Duy trì, giữ vững"
  },
  {
    "id": "v528",
    "word": "NERVOUS",
    "ipa": "ˈnɜːvəs",
    "elo": 815,
    "level": "beginner",
    "scenario": "Lần đầu đi làm mà NERVOUS quá, cứ lo không biết đồng nghiệp có khó tính không.",
    "translationHint": "Lo lắng, hồi hộp"
  },
  {
    "id": "v529",
    "word": "OPPORTUNITY",
    "ipa": "ˌɒpəˈtjuːnəti",
    "elo": 850,
    "level": "beginner",
    "scenario": "Mất lượt này là mất luôn OPPORTUNITY thăng tiến trong năm nay, tiếc đứt ruột.",
    "translationHint": "Cơ hội"
  },
  {
    "id": "v530",
    "word": "PREFER",
    "ipa": "prɪˈfɜː(r)",
    "elo": 820,
    "level": "beginner",
    "scenario": "Tôi PREFER ở nhà ngủ hơn là đi quẩy lúc 10h đêm, tuổi già sức yếu rồi.",
    "translationHint": "Thích hơn"
  },
  {
    "id": "v531",
    "word": "QUALITY",
    "ipa": "ˈkwɒləti",
    "elo": 805,
    "level": "beginner",
    "scenario": "Đi ăn lề đường thì QUALITY đồ ăn là quan trọng nhất, chứ phục vụ thì đừng mong đợi gì nhiều.",
    "translationHint": "Chất lượng"
  },
  {
    "id": "v532",
    "word": "RECOGNIZE",
    "ipa": "ˈrekəɡnaɪz",
    "elo": 875,
    "level": "beginner",
    "scenario": "Dạo này béo lên hay sao mà RECOGNIZE ông không ra luôn, bụng bia to quá rồi.",
    "translationHint": "Nhận ra"
  },
  {
    "id": "v533",
    "word": "URGENT",
    "ipa": "ˈɜːdʒənt",
    "elo": 845,
    "level": "beginner",
    "scenario": "Có tin nhắn URGENT từ mẹ: 'Về nhà ăn cơm ngay'. Không về là ăn chửi đủ.",
    "translationHint": "Khẩn cấp"
  },
  {
    "id": "v534",
    "word": "ADMIT",
    "ipa": "ədˈmɪt",
    "elo": 865,
    "level": "beginner",
    "scenario": "Tôi phải ADMIT là con bé đó hát hay thật, dù tôi không ưa nó tí nào.",
    "translationHint": "Thừa nhận"
  },
  {
    "id": "v535",
    "word": "BORING",
    "ipa": "ˈbɔːrɪŋ",
    "elo": 800,
    "level": "beginner",
    "scenario": "Cuối tuần mà không có kèo đi chơi thì đúng là BORING chết đi được.",
    "translationHint": "Buồn chán"
  },
  {
    "id": "v536",
    "word": "COMPLAIN",
    "ipa": "kəmˈpleɪn",
    "elo": 820,
    "level": "beginner",
    "scenario": "Ngưng COMPLAIN về việc kẹt xe đi, ở thành phố này thì đó là 'đặc sản' rồi.",
    "translationHint": "Than phiền, phàn nàn"
  },
  {
    "id": "v537",
    "word": "FORCE",
    "ipa": "fɔːs",
    "elo": 840,
    "level": "beginner",
    "scenario": "Đừng FORCE mình phải cười khi đang thấy buồn, cứ khóc một tí cho nó nhẹ lòng.",
    "translationHint": "Ép buộc"
  },
  {
    "id": "v538",
    "word": "HARDLY",
    "ipa": "ˈhɑːdli",
    "elo": 815,
    "level": "beginner",
    "scenario": "Từ lúc đi làm, tôi HARDLY có thời gian để chơi game với anh em, nhớ quá.",
    "translationHint": "Hầu như không"
  },
  {
    "id": "v539",
    "word": "OFFER",
    "ipa": "ˈɒfə(r)",
    "elo": 850,
    "level": "beginner",
    "scenario": "Tiệm này OFFER gói combo khá rẻ, hời quá nên tôi chốt luôn không suy nghĩ.",
    "translationHint": "Đề nghị, mời chào"
  },
  {
    "id": "v540",
    "word": "NOTICE",
    "ipa": "ˈnəʊtɪs",
    "elo": 810,
    "level": "beginner",
    "scenario": "Tôi mới NOTICE là dạo này ông hay đi làm sớm, bộ mới bị sếp cảnh cáo à?",
    "translationHint": "Để ý thấy, nhận ra"
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
