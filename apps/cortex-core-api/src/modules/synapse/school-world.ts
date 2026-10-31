/**
 * "Một Năm Ở Lớp 11": an everyday school world, written scene by scene so the
 * mission plays with no AI at all (docs/SYNAPSE_PLAN.md S3). Each scene has one
 * right phrase and three wrong ones, each wrong one with its own consequence.
 * Everything here is meant to be reviewed by a teacher before it reaches a class.
 */
import type { ScenarioBlueprint, WorldLore } from './world-bibles';

type Wrong = [expression: string, consequence: string, example: string];

/** One scene, written compactly. */
function scene(
  stage: number,
  arcLabel: string,
  where: string,
  situation: string,
  prompt: string,
  right: [
    expression: string,
    meaning: string,
    rationale: string,
    example: string,
  ],
  wrong: [Wrong, Wrong, Wrong],
  keyDetail: string,
): ScenarioBlueprint {
  return {
    stage,
    arcLabel,
    scene: where,
    situation,
    prompt,
    correctExpression: right[0],
    correctMeaning: right[1],
    correctRationale: right[2],
    correctExample: right[3],
    wrongOptions: wrong.map(([expression, consequence, example]) => ({
      expression,
      consequence,
      example,
    })),
    keyDetail,
  };
}

const m1: ScenarioBlueprint[] = [
  scene(
    1,
    'MỞ ĐẦU',
    'Lớp 11A3, tiết đầu tiên. Bạn đứng ở cửa với cặp sách còn mới.',
    'Cô chủ nhiệm mời bạn tự giới thiệu. Cả lớp quay lại nhìn, vài bạn thì thầm. Bạn chuyển trường vì nhà dọn sang quận khác.',
    'Bạn quyết định ___ trước cả lớp, không đứng im ở cửa.',
    [
      'speak up',
      'nói to, lên tiếng',
      'Nói rõ ràng ngay từ câu đầu để cả lớp nghe được, đó là cách làm quen nhanh nhất.',
      'Please speak up, we cannot hear you at the back.',
    ],
    [
      [
        'hold back',
        'Bạn nói lí nhí vài chữ rồi ngồi xuống. Không ai nhớ tên bạn.',
        'She held back her ideas in class.',
      ],
      [
        'back out',
        'Bạn xin cô cho giới thiệu sau. Cả lớp bắt đầu ngồi nói chuyện riêng.',
        'He backed out of the school play.',
      ],
      [
        'step aside',
        'Bạn nhường lượt cho cậu bạn khác. Tiết học qua mà bạn vẫn là "học sinh mới không tên".',
        'Please step aside and let them pass.',
      ],
    ],
    'Chiếc cặp màu xanh còn thơm mùi vải mới, quai cặp bạn đang siết chặt.',
  ),
  scene(
    2,
    'LEO THANG',
    'Giờ ra chơi, sân trường đông nghịt.',
    'Một nhóm bạn đang chơi bóng ở góc sân và thiếu người. Một bạn nam vẫy tay hỏi bạn có chơi không, nhưng bạn không giỏi bóng đá.',
    'Bạn ___ nhóm bạn ấy, dù chưa chắc mình chơi tốt.',
    [
      'join in',
      'tham gia cùng',
      'Cứ vào chơi cùng. Làm quen không cần giỏi, chỉ cần có mặt.',
      'Come and join in, we need one more player.',
    ],
    [
      [
        'drop out',
        'Bạn lắc đầu và đứng nhìn từ xa. Lần sau họ không hỏi nữa.',
        'He dropped out of the team last year.',
      ],
      [
        'sit out',
        'Bạn bảo "mình ngồi xem thôi". Giờ ra chơi trôi qua trên băng ghế.',
        'I will sit out this round.',
      ],
      [
        'walk off',
        'Bạn bỏ đi mua nước. Cả nhóm nghĩ bạn không thích họ.',
        'She walked off in the middle of the game.',
      ],
    ],
    'Quả bóng lăn tới chân bạn, cả nhóm đồng loạt quay lại nhìn.',
  ),
  scene(
    3,
    'XOẮN',
    'Căn tin, giờ ăn trưa.',
    'Bạn mới quen Nam hỏi mượn tiền ăn, hứa mai trả. Bạn để ý Nam đã mượn của hai bạn khác tuần này mà chưa trả ai.',
    'Bạn ___ lời nhờ này một cách lịch sự, rồi mời Nam chia nửa phần cơm của mình.',
    [
      'turn down',
      'từ chối',
      'Từ chối nhẹ nhàng rồi đề nghị cách khác: bạn giữ được tiền và giữ được tình bạn.',
      'She turned down the invitation politely.',
    ],
    [
      [
        'give in',
        'Bạn đưa tiền ngay. Ba hôm sau Nam vẫn chưa trả, bạn ngại nhắc.',
        'He gave in and lent him the money.',
      ],
      [
        'pay off',
        'Bạn trả luôn phần của Nam, không nói gì. Nam nghĩ bạn dễ dãi.',
        'She paid off all her debts.',
      ],
      [
        'run away',
        'Bạn giả vờ bận rồi bỏ đi. Nam thấy rõ bạn tránh mặt.',
        'He ran away from the problem.',
      ],
    ],
    'Khay cơm của bạn còn nóng, hơi nước bốc lên trước mặt Nam.',
  ),
  scene(
    4,
    'KHỦNG HOẢNG',
    'Hành lang trước lớp, trước giờ kiểm tra 15 phút.',
    'Bạn nhận ra mình để quên vở ghi ở nhà. Một bạn cùng lớp đưa vở của cậu ấy cho bạn mượn, nhưng cậu ấy cũng chưa ôn xong.',
    'Bạn ___ cảm ơn rồi đề nghị cả hai cùng ôn bài trong 10 phút.',
    [
      'team up',
      'hợp sức, ghép nhóm',
      'Cùng ôn là cách cả hai cùng có lợi, và biến một bạn lạ thành bạn học.',
      'Let us team up and revise together.',
    ],
    [
      [
        'look down on',
        'Bạn chê vở của cậu ấy viết xấu. Cậu ấy rút lại và bỏ đi.',
        'Do not look down on others.',
      ],
      [
        'rely on',
        'Bạn chỉ chép của cậu ấy rồi trả. Bài kiểm tra bạn vẫn không hiểu gì.',
        'You can rely on me.',
      ],
      [
        'give up',
        'Bạn nghĩ thôi bỏ qua bài này. Điểm 0 là phần thưởng.',
        'He never gives up.',
      ],
    ],
    'Chuông báo vào lớp reo, hai quyển vở mở chung một trang.',
  ),
  scene(
    5,
    'ĐỈNH ĐIỂM',
    'Cuối tuần đầu tiên, cổng trường.',
    'Cả nhóm bạn mới rủ bạn đi uống trà sữa. Bạn muốn đi, nhưng mẹ dặn phải về sớm học bài. Mọi người chờ câu trả lời.',
    'Bạn ___ rằng hôm nay phải về sớm, và hẹn lần sau đi cùng.',
    [
      'speak up',
      'nói thẳng, lên tiếng',
      'Nói thẳng lí do và hẹn lần sau: bạn giữ lời với mẹ mà không mất bạn mới.',
      'You should speak up if you disagree.',
    ],
    [
      [
        'go along',
        'Bạn đi theo mà không nói gì, về nhà muộn và bị mẹ nhắc.',
        'She went along with the plan.',
      ],
      [
        'cover up',
        'Bạn bịa ra một lí do khác. Hôm sau lộ ra, cả nhóm thấy bạn không thật.',
        'He tried to cover up his mistake.',
      ],
      [
        'give way',
        'Bạn gật đầu đồng ý rồi nhắn tin xin lỗi nhóm sau. Cả nhóm bực.',
        'We had to give way to the bus.',
      ],
    ],
    'Tiếng cười của nhóm bạn vang lên khi họ vẫy chào trước cổng.',
  ),
];

const m2: ScenarioBlueprint[] = [
  scene(
    1,
    'MỞ ĐẦU',
    'Lớp Sinh học, cô vừa chia nhóm bốn người.',
    'Đề tài là làm mô hình hệ sinh thái. Nhóm bạn có Lan giỏi nhất lớp, Huy hay vắng mặt và Minh ít nói. Cả nhóm im lặng, chưa ai bắt đầu.',
    'Bạn ___ phân việc ngay, trước khi hết tiết.',
    [
      'step up',
      'đứng ra nhận việc',
      'Đứng ra phân việc sớm giúp nhóm khỏi lãng phí tuần đầu, và ai cũng biết mình làm gì.',
      'Somebody has to step up and lead.',
    ],
    [
      [
        'sit back',
        'Bạn chờ người khác mở lời. Tiết học hết mà chưa ai có việc.',
        'He sat back and watched.',
      ],
      [
        'back off',
        'Bạn nghĩ nhường Lan làm trưởng nhóm. Lan cũng chờ bạn.',
        'Please back off, I need space.',
      ],
      [
        'drop by',
        'Bạn hẹn "để hôm nào ghé nhà nhau bàn". Cả tuần trôi qua.',
        'I will drop by after school.',
      ],
    ],
    'Tờ giấy phân công vẫn trắng tinh trước mặt cả nhóm.',
  ),
  scene(
    2,
    'LEO THANG',
    'Nhóm chat, 9 giờ tối.',
    'Huy nhắn "mình bận, mai làm sau" lần thứ ba. Hạn nộp còn 5 ngày và phần của Huy là phần quan trọng nhất.',
    'Bạn ___ Huy, hỏi thẳng cậu ấy cần gì để bắt đầu.',
    [
      'reach out to',
      'chủ động liên lạc',
      'Nhắn riêng, hỏi han trước khi trách móc: Huy dễ hợp tác hơn nếu thấy được quan tâm.',
      'Please reach out to me if you need help.',
    ],
    [
      [
        'look down on',
        'Bạn nhắn "cậu lúc nào cũng lười". Huy im lặng luôn.',
        'They look down on beginners.',
      ],
      [
        'talk down to',
        'Bạn giảng giải như với trẻ con. Huy thả biểu tượng 👍 rồi biến mất.',
        'Do not talk down to your classmates.',
      ],
      [
        'write off',
        'Bạn coi như Huy không làm được và làm thay. Bạn quá tải ngay tuần này.',
        'They wrote off the project.',
      ],
    ],
    'Dấu "đã xem" hiện dưới tin nhắn mà Huy không trả lời.',
  ),
  scene(
    3,
    'XOẮN',
    'Thư viện trường, chiều thứ Sáu.',
    'Lan đề xuất cả nhóm copy một bài có sẵn trên mạng cho nhanh. Lan nói điểm sẽ cao và không ai biết. Minh nhìn bạn, chờ xem bạn nghĩ gì.',
    'Bạn ___ ý tưởng này và đề xuất tự viết theo cách của nhóm.',
    [
      'push back on',
      'phản đối, không đồng ý',
      'Phản đối nhẹ nhàng nhưng rõ ràng, kèm một phương án khác, vì sao chép dễ bị phát hiện.',
      'She pushed back on the idea.',
    ],
    [
      [
        'go along with',
        'Bạn gật đầu cho xong. Cô phát hiện bài trùng với nguồn trên mạng.',
        'He went along with the plan.',
      ],
      [
        'sign up for',
        'Bạn hứng khởi đăng kí luôn việc copy phần của mình. Cả nhóm bị điểm 0.',
        'I signed up for the club.',
      ],
      [
        'look the other way',
        'Bạn làm ngơ như không nghe. Minh nhìn bạn thất vọng.',
        'The teacher looked the other way.',
      ],
    ],
    'Màn hình laptop của Lan sáng lên với một bài viết có sẵn.',
  ),
  scene(
    4,
    'KHỦNG HOẢNG',
    'Đêm trước ngày nộp, cuộc gọi nhóm.',
    'Huy vừa báo bị ốm và không làm xong phần của mình. Còn 12 tiếng nữa là hạn, cả nhóm im lặng trên cuộc gọi.',
    'Bạn ___ cùng cả nhóm chia lại phần việc còn lại, mỗi người nhận một phần nhỏ.',
    [
      'pull together',
      'đồng lòng, chung sức',
      'Cùng chia nhỏ việc là cách duy nhất kịp hạn mà không ai kiệt sức.',
      'We must pull together to finish on time.',
    ],
    [
      [
        'break up',
        'Bạn bảo "nhóm này hết cách rồi" và thoát khỏi cuộc gọi. Cả nhóm hoảng.',
        'The group broke up after the project.',
      ],
      [
        'fall apart',
        'Bạn chỉ trách Huy. Cuộc họp biến thành cãi vã đến nửa đêm.',
        'Our plan fell apart.',
      ],
      [
        'hand over',
        'Bạn nhận làm hết phần của Huy một mình, và sáng mai kiệt sức.',
        'She handed over the keys.',
      ],
    ],
    'Đồng hồ trên màn hình điện thoại chỉ 23:40.',
  ),
  scene(
    5,
    'ĐỈNH ĐIỂM',
    'Phòng học, sáng nộp bài.',
    'Cô hỏi nhóm: "Ai làm phần nào?". Huy đứng sau, mặt đỏ vì xấu hổ. Cô đợi bạn trả lời với tư cách trưởng nhóm.',
    'Bạn ___ rằng cả nhóm đã cùng làm, và nêu đúng công của từng người, kể cả Huy.',
    [
      'speak up for',
      'lên tiếng bảo vệ, nói giúp',
      'Nói đúng phần của từng người, kể cả Huy: công bằng và giữ được sự tin tưởng của cả nhóm.',
      'She always speaks up for her friends.',
    ],
    [
      [
        'take over',
        'Bạn nhận hết phần việc về mình. Cô tưởng chỉ bạn làm, Lan và Minh tức.',
        'He took over the whole project.',
      ],
      [
        'give away',
        'Bạn nói thẳng Huy không làm gì. Huy cúi đầu, cả nhóm im lặng.',
        'She gave away the secret.',
      ],
      [
        'shut down',
        'Bạn bảo "cô hỏi nhóm khác đi". Cô đánh dấu nhóm bạn chưa nộp.',
        'The school shut down the lab.',
      ],
    ],
    'Tờ bài làm có tên bốn người, nét chữ của mỗi người một khác.',
  ),
];

const m3: ScenarioBlueprint[] = [
  scene(
    1,
    'MỞ ĐẦU',
    'Nhà bạn, tối Chủ nhật. Một tuần nữa là thi học kì.',
    'Bàn học đầy sách, điện thoại sáng liên tục với thông báo từ nhóm bạn. Bạn chưa lập kế hoạch ôn tập.',
    'Bạn ___ lịch ôn từng môn ngay tối nay, trước khi mở điện thoại.',
    [
      'map out',
      'vạch ra kế hoạch',
      'Lập lịch trước khi bắt đầu ôn giúp bạn biết tuần này cần làm gì mỗi ngày.',
      'We need to map out a plan for the week.',
    ],
    [
      [
        'put off',
        'Bạn nghĩ "mai bắt đầu cũng được". Mai trở thành thứ Ba, rồi thứ Tư.',
        'He put off studying until Friday.',
      ],
      [
        'mess around',
        'Bạn lướt điện thoại "một lát" thôi. Một tiếng sau, bạn vẫn chưa mở sách.',
        'Stop messing around and start studying.',
      ],
      [
        'give up on',
        'Bạn nghĩ môn Hoá khó quá, bỏ luôn. Điểm môn đó sẽ kéo cả học kì.',
        'Do not give up on yourself.',
      ],
    ],
    'Cây bút dạ quang trên bàn vẫn còn nắp.',
  ),
  scene(
    2,
    'LEO THANG',
    'Giữa tuần, 23:30, bạn vẫn thức.',
    'Bạn đã học 5 tiếng liên tục, mắt mờ đi và đọc một trang ba lần mà không nhớ gì. Bạn cảm thấy hoảng vì còn nhiều bài.',
    'Bạn ___ học 10 phút để đi bộ trong nhà và uống nước.',
    [
      'take a break',
      'nghỉ giải lao',
      'Nghỉ ngắn giúp não nhớ tốt hơn học liên tục, và đỡ hoảng.',
      'Let us take a break for ten minutes.',
    ],
    [
      [
        'push through',
        'Bạn cố gắng thêm hai tiếng. Sáng hôm sau bạn đau đầu và chẳng nhớ gì.',
        'He pushed through the pain.',
      ],
      [
        'burn out',
        'Bạn thức cả đêm. Đến ngày thứ Năm bạn kiệt sức, ngủ gục trong giờ.',
        'She burned out before the exam.',
      ],
      [
        'black out',
        'Bạn tắt hết đèn rồi nằm ngủ luôn, bỏ cả bài hôm đó.',
        'The lights blacked out.',
      ],
    ],
    'Tách trà đã nguội từ lâu bên cạnh chồng sách.',
  ),
  scene(
    3,
    'XOẮN',
    'Cuối buổi học thêm, hành lang.',
    'Một bạn cùng lớp rủ bạn: "Mình có đề thi thử, tối nay học cùng nhau nhé?". Bạn học khác phương pháp nhưng đây là cơ hội làm đề thật.',
    'Bạn ___ lời mời và sắp xếp để hai bạn gặp lúc 7 giờ.',
    [
      'take up',
      'nhận lời, chấp nhận',
      'Làm đề cùng bạn giúp bạn thấy chỗ mình yếu nhanh hơn học một mình.',
      'She took up his offer to study together.',
    ],
    [
      [
        'turn away',
        'Bạn từ chối vì sợ bị mất thời gian. Bạn lại tự làm đề một mình, không biết sai chỗ nào.',
        'He turned away from the group.',
      ],
      [
        'brush off',
        'Bạn nói "để mình tính" rồi quên. Cơ hội trôi mất.',
        'She brushed off the invitation.',
      ],
      [
        'hold off',
        'Bạn hẹn tuần sau. Tuần sau là tuần thi.',
        'Hold off until tomorrow.',
      ],
    ],
    'Tờ đề thi thử còn thơm mùi mực vừa photocopy.',
  ),
  scene(
    4,
    'KHỦNG HOẢNG',
    'Sáng ngày thi môn Toán, cổng trường.',
    'Bạn nhận ra mình quên máy tính bỏ túi. Một bạn quen mang dư một chiếc, nhưng bạn đã hứa cho người khác.',
    'Bạn ___ bình tĩnh, hỏi thầy giám thị xem có cách nào xử lí hợp lệ không.',
    [
      'calm down',
      'bình tĩnh lại',
      'Hoảng loạn không giúp được gì, hỏi đúng người mới giải quyết được vấn đề.',
      'Calm down and think clearly.',
    ],
    [
      [
        'freak out',
        'Bạn hoảng loạn, khóc ngay cổng trường. Bạn vào phòng thi với đầu óc trống rỗng.',
        'He freaked out before the test.',
      ],
      [
        'talk back',
        'Bạn trách bạn kia sao hứa trước. Bạn bị nhắc nhở vì làm ồn.',
        'Do not talk back to your teacher.',
      ],
      [
        'sneak in',
        'Bạn thử lén mượn của bạn khác trong phòng thi. Thầy phát hiện, bạn bị ghi tên.',
        'He sneaked in late.',
      ],
    ],
    'Tiếng trống trường vang lên báo còn 10 phút.',
  ),
  scene(
    5,
    'ĐỈNH ĐIỂM',
    'Phòng thi, 30 phút cuối.',
    'Bạn gặp một câu hỏi rất khó mà chưa ôn tới. Bạn bên cạnh nghiêng bài sang, ra hiệu cho bạn nhìn. Còn 15 phút.',
    'Bạn ___ lời mời đó và dùng thời gian còn lại để tự làm những câu bạn làm được.',
    [
      'turn down',
      'từ chối',
      'Tự làm phần mình làm được, vì gian lận có thể bị huỷ cả bài và mất nhiều hơn một câu.',
      'He turned down the offer to cheat.',
    ],
    [
      [
        'give in',
        'Bạn liếc sang chép. Giám thị đi ngang, cả hai bị lập biên bản.',
        'She gave in to temptation.',
      ],
      [
        'give up',
        'Bạn bỏ trống câu đó và ngồi nhìn đồng hồ. 15 phút trôi uổng.',
        'Never give up in a test.',
      ],
      [
        'hand in',
        'Bạn nộp bài sớm cho xong. Bạn bỏ lỡ những câu còn làm được.',
        'Please hand in your papers.',
      ],
    ],
    'Tờ nháp của bạn chi chít những phép tính gạch chéo.',
  ),
];

const m4: ScenarioBlueprint[] = [
  scene(
    1,
    'MỞ ĐẦU',
    'Phòng sinh hoạt câu lạc bộ, sau giờ học.',
    'Câu lạc bộ tiếng Anh sắp tổ chức ngày hội cuối năm. Chủ nhiệm hỏi ai muốn nhận phần phụ trách chương trình. Cả phòng nhìn xuống đất.',
    'Bạn ___ nhận phần việc đó, dù chưa làm bao giờ.',
    [
      'step up',
      'đứng ra nhận',
      'Nhận việc khó khi không ai dám là cách học nhanh nhất, và mọi người sẽ nhớ.',
      'She stepped up when the team needed her.',
    ],
    [
      [
        'back away',
        'Bạn giả vờ xem điện thoại. Chủ nhiệm đành giao cho người ít hứng thú.',
        'He backed away from the job.',
      ],
      [
        'hang back',
        'Bạn nghĩ để người khác xung phong. Cả buổi họp trôi qua không ai nhận.',
        'She hung back in the crowd.',
      ],
      [
        'pass on',
        'Bạn nói "mình nhường các bạn". Bạn bỏ lỡ cơ hội dẫn dắt.',
        'I will pass on this chance.',
      ],
    ],
    'Tờ danh sách việc cần làm treo trên bảng, ô "người phụ trách" còn trống.',
  ),
  scene(
    2,
    'LEO THANG',
    'Cuộc họp tuần sau, bốn bạn trong ban tổ chức.',
    'Ngân sách chỉ có 500 nghìn nhưng cả nhóm muốn mua rất nhiều thứ: bóng bay, quà, loa. Mọi người đang cãi nhau về thứ tự ưu tiên.',
    'Bạn đề nghị cả nhóm ___ một danh sách ưu tiên chỉ gồm ba thứ quan trọng nhất.',
    [
      'narrow down',
      'thu hẹp lại',
      'Chọn ra ba việc quan trọng nhất để dùng đúng chỗ số tiền có hạn.',
      'We need to narrow down the options.',
    ],
    [
      [
        'add up',
        'Bạn cộng tất cả vào danh sách. Tổng vượt ngân sách gấp ba lần.',
        'The numbers do not add up.',
      ],
      [
        'give away',
        'Bạn gợi ý tặng quà thật nhiều cho mọi người. Hết tiền ngay từ khâu đầu.',
        'They gave away free tickets.',
      ],
      [
        'cut off',
        'Bạn bảo "thôi không tổ chức nữa". Cả nhóm sững sờ.',
        'They cut off the music.',
      ],
    ],
    'Mặt bàn đầy giấy nháp ghi giá từng món.',
  ),
  scene(
    3,
    'XOẮN',
    'Hai ngày trước sự kiện, nhóm chat.',
    'Bạn phụ trách âm thanh vừa báo "loa không thuê được nữa". Cả nhóm hoang mang, có người đề xuất huỷ hoàn toàn.',
    'Bạn ___ ý tưởng dùng loa của trường, và đi xin phép thầy phụ trách ngay chiều nay.',
    [
      'come up with',
      'nghĩ ra',
      'Nghĩ ra giải pháp thay thế thay vì chỉ nhìn vào vấn đề, và hành động ngay.',
      'She came up with a clever plan.',
    ],
    [
      [
        'give up on',
        'Bạn đồng ý huỷ chương trình. Cả ban tổ chức thất vọng.',
        'We gave up on the idea.',
      ],
      [
        'call off',
        'Bạn gọi các bạn khác thông báo huỷ. Công sức hai tuần uổng phí.',
        'They called off the event.',
      ],
      [
        'put up with',
        'Bạn chấp nhận không có âm thanh, chỉ nói to. Hội trường 100 người không ai nghe rõ.',
        'I cannot put up with this noise.',
      ],
    ],
    'Chiếc loa cũ của phòng đa năng nằm ở góc phòng, phủ bụi.',
  ),
  scene(
    4,
    'KHỦNG HOẢNG',
    'Sáng ngày sự kiện, sân khấu.',
    'Bạn dẫn chương trình bị mất giọng vì cảm lạnh. 30 phút nữa khách vào. Cả nhóm nhìn bạn, vì bạn là người biết kịch bản nhất.',
    'Bạn ___ một bạn khác đứng dẫn cùng, và bạn lo phần giữ nhịp chương trình.',
    [
      'hand over to',
      'giao lại cho',
      'Giao phần dẫn cho người khác và vẫn giữ vai trò điều phối: sự kiện vẫn chạy và bạn vẫn dẫn dắt.',
      'He handed over the microphone to her.',
    ],
    [
      [
        'push through',
        'Bạn cố nói khản giọng. Vài phút đầu khán giả đã không nghe được gì.',
        'She pushed through the program.',
      ],
      [
        'drop out',
        'Bạn xin rút lui hoàn toàn. Ban tổ chức rối loạn lúc cuối.',
        'He dropped out of the event.',
      ],
      [
        'fall behind',
        'Bạn chờ giọng khá hơn. Chương trình chậm nửa tiếng.',
        'We fell behind the schedule.',
      ],
    ],
    'Tờ kịch bản của bạn chi chít nét bút đỏ nhắc giờ từng tiết mục.',
  ),
  scene(
    5,
    'ĐỈNH ĐIỂM',
    'Cuối chương trình, sân khấu tối dần.',
    'Sự kiện thành công và khán giả vỗ tay. Chủ nhiệm đưa micro cho bạn để nói lời kết. Bạn biết nhóm đã làm rất vất vả.',
    'Bạn ___ công sức của cả ban tổ chức, gọi tên từng người trước khán giả.',
    [
      'give credit to',
      'ghi nhận công lao',
      'Gọi tên từng người giúp cả nhóm thấy công sức của mình được nhìn thấy.',
      'Always give credit to your team.',
    ],
    [
      [
        'take over',
        'Bạn nhận hết công lao về mình. Cả ban tổ chức thấy lạ và im lặng.',
        'He took over the stage.',
      ],
      [
        'show off',
        'Bạn kể lại những gì bạn đã làm. Khán giả bắt đầu nhìn đồng hồ.',
        'Do not show off.',
      ],
      [
        'brush aside',
        'Bạn nói nhanh "cảm ơn mọi người" rồi bước xuống. Cả nhóm hụt hẫng.',
        'She brushed aside the praise.',
      ],
    ],
    'Ánh đèn sân khấu nhỏ dần và hắt lên khuôn mặt từng người.',
  ),
];

const m5: ScenarioBlueprint[] = [
  scene(
    1,
    'MỞ ĐẦU',
    'Lớp học, buổi họp chuẩn bị chuyến dã ngoại cuối tuần.',
    'Cô giao bạn làm trưởng nhóm lo việc di chuyển cho 12 bạn. Danh sách chưa ai ghi tên, hạn đăng kí là thứ Năm và bạn chưa biết bắt đầu từ đâu.',
    'Bạn ___ một bảng đăng kí và gửi vào nhóm lớp ngay chiều nay.',
    [
      'set up',
      'lập ra, thiết lập',
      'Làm ngay một bảng đăng kí rõ ràng là bước đầu tiên, cả lớp biết cần làm gì và trước hạn nào.',
      'She set up a sign-up sheet for the trip.',
    ],
    [
      [
        'put off',
        'Bạn nghĩ "để mai làm". Thứ Năm tới mà mới có ba người đăng kí.',
        'He put off the task again.',
      ],
      [
        'give up',
        'Bạn nhắn cô xin đổi người khác làm. Cô thất vọng vì bạn nhận việc chưa được một ngày.',
        'Do not give up so easily.',
      ],
      [
        'hand out',
        'Bạn phát tờ giấy trống cho mọi người rồi quên thu lại. Giấy thất lạc hết.',
        'She handed out the forms.',
      ],
    ],
    'Cô vừa đưa bạn tờ danh sách trắng, góc giấy còn thơm mùi mực in.',
  ),
  scene(
    2,
    'LEO THANG',
    'Nhóm chat lớp, 20:00.',
    'Mười người đã đăng kí nhưng hai bạn nói không đi vì gia đình bận. Xe chỉ thuê được khi đủ 12 người.',
    'Bạn ___ hai bạn đó, hỏi xem có cách nào cùng đi được không.',
    [
      'reach out to',
      'chủ động liên lạc',
      'Nhắn riêng hỏi hoàn cảnh trước khi kết luận: biết đâu chỉ cần đổi giờ hay nhờ bạn đi chung.',
      'Please reach out to me if you need help.',
    ],
    [
      [
        'write off',
        'Bạn coi như hai bạn đó không đi. Xe thiếu người, cả lớp phải đóng thêm tiền.',
        'They wrote off the loss.',
      ],
      [
        'look down on',
        'Bạn nhắn "sao lại không đi, tiếc quá". Hai bạn thấy bị trách và im luôn.',
        'Never look down on others.',
      ],
      [
        'brush off',
        'Bạn bảo "thôi kệ" và đổi chủ đề. Xe vẫn thiếu hai chỗ.',
        'She brushed off his concerns.',
      ],
    ],
    'Tin nhắn "đã xem" hiện dưới dòng chữ của hai bạn.',
  ),
  scene(
    3,
    'XOẮN',
    'Sáng thứ Bảy, điểm hẹn trước cổng trường.',
    'Xe đến trễ 40 phút. Các bạn bắt đầu than phiền, một bạn nói "tổ chức tệ quá". Cả lớp nhìn bạn.',
    'Bạn ___ và giải thích rõ: xe đang trên đường, và cả nhóm cần chờ thêm một chút.',
    [
      'calm down',
      'bình tĩnh, làm dịu',
      'Nói rõ tình hình bằng giọng bình tĩnh giúp cả lớp dịu lại thay vì cãi nhau.',
      'Calm down, everything is under control.',
    ],
    [
      [
        'blow up',
        'Bạn nổi nóng quát lại. Một nửa lớp quay đi, không khí chuyến đi hỏng ngay từ đầu.',
        'He blew up at his friends.',
      ],
      [
        'back out',
        'Bạn nói "ai muốn thì tự đi". Cô phải ra can thiệp.',
        'She backed out of leading the trip.',
      ],
      [
        'talk back',
        'Bạn cãi lại bạn kia từng câu. Cả lớp hết muốn nghe bạn.',
        'Do not talk back to teachers.',
      ],
    ],
    'Tiếng cười nói của lớp nhỏ dần khi bạn giơ tay ra hiệu.',
  ),
  scene(
    4,
    'KHỦNG HOẢNG',
    'Trên đường, xe dừng vì mưa lớn.',
    'Mưa làm đường trơn, tài xế báo phải đổi lộ trình và đến muộn một tiếng. Chương trình tham quan phải cắt bớt một điểm.',
    'Bạn ___ phương án: bỏ điểm tham quan ít quan trọng nhất và giữ lại giờ ăn trưa.',
    [
      'cut down',
      'cắt giảm',
      'Cắt bớt đúng chỗ giúp chuyến đi vẫn trọn vẹn thay vì cố làm hết rồi vội vàng.',
      'We need to cut down the schedule.',
    ],
    [
      [
        'call off',
        'Bạn đề nghị huỷ cả chuyến, quay xe. Cả lớp hụt hẫng sau cả tuần chờ đợi.',
        'They called off the trip.',
      ],
      [
        'give in',
        'Bạn để mọi người tranh cãi và quyết định. Kế hoạch không ai nhận trách nhiệm.',
        'She gave in to the noise.',
      ],
      [
        'pull over',
        'Bạn bảo tài xế dừng lại chờ tạnh. Hai tiếng sau vẫn mưa.',
        'The driver pulled over.',
      ],
    ],
    'Mưa gõ đều trên mái xe, kính cửa mờ đi vì hơi nước.',
  ),
  scene(
    5,
    'ĐỈNH ĐIỂM',
    'Cuối ngày, bãi đỗ xe.',
    'Điểm danh thì thiếu một bạn: Hà đã đi lạc khỏi nhóm lúc chụp ảnh. Trời sắp tối và các bạn bắt đầu lo lắng.',
    'Bạn ___ ngay: gọi cô, chia hai nhóm đi tìm ở hai hướng, và dặn nhóm còn lại ở yên một chỗ.',
    [
      'take charge',
      'đứng ra chỉ huy',
      'Khi có sự cố, phân công rõ ràng và bình tĩnh là cách nhanh nhất để tìm bạn an toàn.',
      'Someone has to take charge in an emergency.',
    ],
    [
      [
        'freak out',
        'Bạn hoảng lên và la lớn. Cả lớp chạy tán loạn, càng khó tìm.',
        'He freaked out when he heard the news.',
      ],
      [
        'hold back',
        'Bạn chờ thêm 15 phút xem Hà có tự về không. Trời tối hơn.',
        'She held back from calling.',
      ],
      [
        'sit back',
        'Bạn nói "chắc Hà tự về thôi" và ngồi chờ. Cô trách vì không báo ngay.',
        'He sat back and did nothing.',
      ],
    ],
    'Chiếc balo của Hà vẫn còn trên ghế xe, nằm ngay cạnh cửa.',
  ),
];

const m6: ScenarioBlueprint[] = [
  scene(
    1,
    'MỞ ĐẦU',
    'Căn tin, giờ ra chơi.',
    'Mai, bạn thân từ lớp 6, thấy bạn ngồi cùng nhóm bạn mới và im lặng quay đi. Bạn hiểu Mai đang buồn nhưng cả nhóm đang nhìn bạn.',
    'Bạn ___ nhóm một lúc và qua ngồi cùng Mai để hỏi han.',
    [
      'step away from',
      'rời khỏi một lúc',
      'Quan tâm bạn cũ ngay lúc này giúp tình bạn không nguội đi chỉ vì có bạn mới.',
      'She stepped away from the group to call her.',
    ],
    [
      [
        'carry on',
        'Bạn vẫn ngồi nói chuyện như không thấy. Mai về lớp một mình.',
        'He carried on talking.',
      ],
      [
        'look away',
        'Bạn nhìn đi chỗ khác cho đỡ ngại. Mai chắc chắn là bạn đã thấy.',
        'She looked away in embarrassment.',
      ],
      [
        'show off',
        'Bạn kể to về nhóm bạn mới với Mai. Mai càng thấy lạc lõng.',
        'He showed off his new phone.',
      ],
    ],
    'Mai ôm khay cơm đi chậm về chiếc bàn trống ở góc căn tin.',
  ),
  scene(
    2,
    'LEO THANG',
    'Sau giờ học, sân trường vắng.',
    'Mai nói: "Dạo này cậu ít nhắn tin cho mình." Giọng cô ấy hơi run. Bạn biết mình đã bận hơn trước thật.',
    'Bạn ___ rằng mình bận thật, và xin lỗi vì đã để cậu ấy cảm thấy bị bỏ rơi.',
    [
      'own up',
      'thẳng thắn nhận',
      'Nhận lỗi thật lòng mà không bào chữa khiến Mai thấy mình được tôn trọng.',
      'He owned up to the mistake.',
    ],
    [
      [
        'cover up',
        'Bạn nói "đâu có, mình vẫn nhớ cậu mà". Mai biết bạn đang nói dối.',
        'She tried to cover up the truth.',
      ],
      [
        'talk down to',
        'Bạn bảo "cậu nghĩ nhiều quá". Mai im lặng rồi quay đi.',
        'Do not talk down to your friends.',
      ],
      [
        'back off',
        'Bạn lùi lại bảo "mình không muốn tranh cãi". Hai người hết nói chuyện.',
        'He backed off from the argument.',
      ],
    ],
    'Chiếc điện thoại trong túi bạn rung lên, bạn không nhìn.',
  ),
  scene(
    3,
    'XOẮN',
    'Lớp học, giờ ra chơi hôm sau.',
    'Một bạn trong nhóm mới bắt đầu nói xấu Mai: "bạn đó kì lắm, cậu đừng chơi nữa". Cả nhóm cười theo, chờ bạn phản ứng.',
    'Bạn ___ Mai và nói rằng bạn ấy là người bạn rất tốt của mình.',
    [
      'stand up for',
      'bênh vực',
      'Bênh vực bạn vắng mặt cho thấy bạn là người đáng tin, cả với nhóm mới.',
      'She stood up for her friend.',
    ],
    [
      [
        'go along with',
        'Bạn cười theo cho xong chuyện. Hôm sau Mai nghe lại, mọi chuyện nặng hơn.',
        'He went along with the joke.',
      ],
      [
        'look the other way',
        'Bạn giả vờ lục cặp. Nhóm hiểu là bạn đồng tình.',
        'The monitor looked the other way.',
      ],
      [
        'hold off',
        'Bạn nói "để mình nghĩ thêm". Chuyện nói xấu vẫn tiếp tục.',
        'He held off answering.',
      ],
    ],
    'Tiếng cười của nhóm nhỏ lại khi bạn bắt đầu nói.',
  ),
  scene(
    4,
    'KHỦNG HOẢNG',
    'Nhóm chat, tối thứ Sáu.',
    'Mai nhắn: "Mình nghe nói cậu cười khi họ nói xấu mình." Tin đồn đã đến tai Mai, và bạn biết một phần là thật.',
    'Bạn ___ ngay: gọi điện, nói rõ chuyện gì đã xảy ra, và xin lỗi vì phần mình đã làm sai.',
    [
      'make up for',
      'bù đắp',
      'Xin lỗi và làm điều cụ thể để bù lại, thay vì chỉ nói lời xin lỗi.',
      'He made up for his mistake.',
    ],
    [
      [
        'give up on',
        'Bạn nghĩ "tình bạn này hết rồi". Bạn tắt máy, không trả lời.',
        'Do not give up on her.',
      ],
      [
        'talk back',
        'Bạn nhắn lại trách Mai nghe tin đồn. Mai chặn tin nhắn.',
        'He talked back angrily.',
      ],
      [
        'blow off',
        'Bạn nhắn "đừng để ý chuyện đó". Mai cảm thấy mình không quan trọng.',
        'She blew off the apology.',
      ],
    ],
    'Màn hình điện thoại sáng lên với dòng chữ "Đã xem" bên dưới tin của Mai.',
  ),
  scene(
    5,
    'ĐỈNH ĐIỂM',
    'Cuối tuần, quán nước gần trường.',
    'Mai đồng ý gặp. Cô ấy vẫn còn giận nhưng đang nghe. Bạn biết cuộc nói chuyện này có thể làm lành hoặc làm hai người xa nhau.',
    'Bạn ___ trước, kể thật cảm xúc của mình, rồi lắng nghe Mai nói hết.',
    [
      'open up',
      'cởi mở, mở lòng',
      'Mở lòng trước giúp Mai thấy an toàn để mở lòng lại, và hai bạn nói được những điều thật.',
      'She opened up to her best friend.',
    ],
    [
      [
        'shut down',
        'Bạn im lặng và khoanh tay. Mai nghĩ bạn không quan tâm.',
        'He shut down during the argument.',
      ],
      [
        'speak out',
        'Bạn nói to quan điểm của mình và không chờ Mai nói. Hai bạn cãi nhau.',
        'She spoke out against the rumor.',
      ],
      [
        'walk away',
        'Bạn đứng dậy khi thấy căng thẳng. Cuộc gặp kết thúc sau năm phút.',
        'He walked away from the table.',
      ],
    ],
    'Hai ly trà sữa chưa ai đụng tới, đá tan dần trong ly.',
  ),
];

export const SCHOOL_LORE: WorldLore = {
  id: 'school-01',
  name: 'Một Năm Ở Lớp 11',
  context:
    'Một năm học bình thường với những chuyện rất thật: chuyển lớp, làm việc nhóm, thi cử, tổ chức sự kiện. Không có kẻ phản diện, chỉ có những lựa chọn nhỏ quyết định bạn là ai trong mắt bạn bè.',
  toneDescriptor: 'gần gũi, nhẹ nhàng, hơi hài hước',
  writingStyle:
    'Văn kể chuyện đời thường, câu ngắn, gần với học sinh phổ thông.',
  stakesDimensions: 'tình bạn, điểm số, sự tự tin',
  situationTypes: ['lớp học', 'căn tin', 'thư viện', 'nhóm chat', 'phòng thi'],
  bannedPhrases: [],
  codePrefix: 'SCH',
  factions: [
    {
      name: 'Lớp 11A3',
      description: 'Tập thể lớp, gồm những bạn thân thiện và vài bạn khó gần.',
      ultimateGoal: 'Cùng nhau vượt qua năm học.',
    },
    {
      name: 'Nhóm học tập',
      description: 'Bốn bạn chung một dự án, mỗi người một tính cách.',
      ultimateGoal: 'Nộp bài đúng hạn và công bằng.',
    },
  ],
  missions: [
    {
      id: 'sc-m1',
      name: 'Ngày Đầu Ở Lớp Mới',
      briefing:
        'Bạn chuyển trường giữa năm. Mỗi lựa chọn trong tuần đầu quyết định bạn sẽ là học sinh mới không ai nhớ hay một người bạn được chào đón.',
      objective: 'Có nhóm bạn đầu tiên sau tuần đầu.',
      scenarios: m1,
    },
    {
      id: 'sc-m2',
      name: 'Dự Án Nhóm',
      briefing:
        'Bốn bạn một đề tài, một bạn hay vắng và một bạn muốn đi đường tắt. Bạn là người có thể giữ nhóm lại với nhau.',
      objective: 'Nộp bài đúng hạn mà cả nhóm vẫn còn là bạn.',
      scenarios: m2,
    },
    {
      id: 'sc-m3',
      name: 'Tuần Thi',
      briefing:
        'Một tuần ôn thi, những cám dỗ nhỏ và áp lực lớn. Bạn cần giữ bình tĩnh và giữ sự trung thực.',
      objective: 'Vượt qua kì thi mà vẫn giữ được sự trung thực.',
      scenarios: m3,
    },
    {
      id: 'sc-m4',
      name: 'Ngày Hội Câu Lạc Bộ',
      briefing:
        'Bạn nhận làm phần phụ trách sự kiện cuối năm với ngân sách nhỏ và nhiều việc bất ngờ.',
      objective: 'Tổ chức thành công sự kiện và ghi nhận công của cả nhóm.',
      scenarios: m4,
    },
    {
      id: 'sc-m5',
      name: 'Chuyến Dã Ngoại',
      briefing:
        'Cô giao bạn lo việc di chuyển cho cả lớp trong chuyến đi cuối tuần. Mọi thứ đều có thể trục trặc: thiếu người, xe trễ, mưa, thậm chí lạc đường.',
      objective: 'Đưa cả lớp đi và về an toàn.',
      scenarios: m5,
    },
    {
      id: 'sc-m6',
      name: 'Bạn Cũ, Bạn Mới',
      briefing:
        'Bạn có nhóm bạn mới và một người bạn thân từ lớp 6 đang xa dần. Mỗi lựa chọn trong tuần này quyết định tình bạn nào còn lại.',
      objective: 'Giữ được người bạn cũ mà không phải bỏ nhóm mới.',
      scenarios: m6,
    },
  ],
};
