import type { Passage } from '../lib/content/passages';

/**
 * Passages that ship with the app: the three old Story Mode stories, each cut
 * into two short passages (docs/LEXICA_FEEDBACK_TASKS.md T7). They are a bit
 * shorter than the 120–200 words Studio writes. `words` (other deck words in
 * the text) is filled in by the repository from the deck.
 */
export const CORE_PASSAGES: Passage[] = [
    {
        id: 'p_heist_1',
        level: 'beginner',
        topic: 'Đời sống',
        title: 'Vụ cướp lúc 3 giờ sáng',
        text: `You arrive at the bank at 3 AM with an abundant amount of confidence and zero common sense.

Your cognitive process is simple: if the movie made it look easy, it must be real life. Unfortunately, you immediately face a moral dilemma: steal money or go home and sleep.

You decide to test whether this plan is actually feasible. The answer becomes obvious when the front door is locked and the guard starts recording you.`,
        translation: `Bạn đến ngân hàng lúc 3 giờ sáng với một lượng tự tin dồi dào và không chút hiểu biết thông thường nào.

Cách bạn suy nghĩ rất đơn giản: phim làm có vẻ dễ thì ngoài đời chắc cũng vậy. Tiếc là bạn lập tức gặp một tình huống khó xử về đạo đức: lấy tiền, hay về nhà đi ngủ.

Bạn quyết định thử xem kế hoạch này có thật sự khả thi không. Câu trả lời rõ ngay khi cửa trước bị khoá và bác bảo vệ bắt đầu quay video bạn.`,
        newWords: ['v001', 'v002', 'v003', 'v004'],
        words: [],
        questions: [
            { question: "Why couldn't the character enter the bank?", options: ['The bank was closed for renovation', 'The front door was locked at 3 AM', 'They forgot their ID card', 'The guard blocked the entrance'], answer: 1 },
            { question: "What does the story imply about the character's plan?", options: ['It was carefully researched and professional', 'It was based on unrealistic movie expectations', 'It had a high chance of success', 'It was approved by experts'], answer: 1 },
        ],
    },
    {
        id: 'p_heist_2',
        level: 'beginner',
        topic: 'Đời sống',
        title: 'Lời bào chữa trên hộp pizza',
        text: `Trying to look pragmatic, you explain that you're "auditing their night security." Your excuse is so ambiguous that even you don't understand it.

The guard, somehow resilient after years of nonsense, asks you to leave for the third time. You keep talking about economic freedom until he opens the door just to get rid of you.

As you walk out, you notice one detail: your "master plan" was written on a pizza box in glitter pen.`,
        translation: `Cố tỏ ra thực tế, bạn giải thích rằng mình đang "kiểm tra an ninh ban đêm" của họ. Lời bào chữa mơ hồ đến mức chính bạn cũng không hiểu.

Bác bảo vệ, chẳng hiểu sao vẫn còn kiên nhẫn sau bao năm gặp chuyện vô lý, mời bạn về lần thứ ba. Bạn cứ nói mãi về tự do kinh tế cho đến khi bác mở cửa, chỉ để tống bạn đi.

Lúc bước ra, bạn để ý một chi tiết: "kế hoạch hoàn hảo" của bạn được viết trên một cái hộp pizza bằng bút nhũ.`,
        newWords: ['v006', 'v007', 'v008'],
        words: [],
        questions: [
            { question: 'How did the guard finally get rid of the character?', options: ['Called the police to arrest them', 'Used force to push them out', 'Opened the door so they would leave voluntarily', 'Ignored them until they got bored'], answer: 2 },
            { question: 'What detail revealed how unprepared the character was?', options: ['They forgot their mask at home', 'Their plan was written on a pizza box in glitter pen', 'They arrived during the day instead of night', 'They brought the wrong tools'], answer: 1 },
        ],
    },
    {
        id: 'p_interview_1',
        level: 'intermediate',
        topic: 'Công việc',
        title: 'Phỏng vấn giữa ngày tận thế',
        text: `You enter the office lobby with a meticulous resume while zombies are already in the parking lot.

Panic is ubiquitous, but you stay calm because confidence is temporary, like all things ephemeral.

The interviewer compliments your eloquent answer about leadership, though his left eye falls into his coffee mid-sentence.`,
        translation: `Bạn bước vào sảnh văn phòng với một bản CV chỉn chu từng chi tiết, trong khi xác sống đã tràn ra bãi đỗ xe.

Đâu đâu cũng thấy người hoảng loạn, nhưng bạn vẫn bình tĩnh, vì sự tự tin cũng chỉ là tạm thời, như mọi thứ phù du khác.

Người phỏng vấn khen câu trả lời lưu loát của bạn về khả năng lãnh đạo, dù mắt trái của ông ấy rơi vào cốc cà phê ngay giữa câu.`,
        newWords: ['v011', 'v012', 'v013', 'v014'],
        words: [],
        questions: [
            { question: 'What happens during the interview?', options: ['The interviewer compliments their answer while his eye falls out', 'Zombies break into the interview room', 'The character runs away immediately', 'The interview is canceled due to danger'], answer: 0 },
            { question: 'How does the character react to the apocalypse?', options: ['They panic and try to escape', 'They stay unusually calm and continue the interview', 'They call for help from outside', 'They hide under the desk'], answer: 1 },
        ],
    },
    {
        id: 'p_interview_2',
        level: 'intermediate',
        topic: 'Công việc',
        title: 'Người tham chiếu đã bị ăn',
        text: `"Your survival plan sounds plausible," he says. "Now let me scrutinize your references."

You remain candid: "All my references were eaten ten minutes ago."

He pauses, then asks why you want this role. "Because my previous life was too boring," you reply, as a zombie HR intern crawls under the table.

He nods. "Adaptability is essential to this company culture. You're hired if you survive the exit interview."

The exit interview is just running to the helicopter while signing tax forms.`,
        translation: `"Kế hoạch sinh tồn của bạn nghe có vẻ hợp lý," ông nói. "Giờ để tôi xem kỹ những người tham chiếu của bạn."

Bạn vẫn thẳng thắn: "Tất cả người tham chiếu của tôi đã bị ăn mười phút trước rồi."

Ông ngừng lại, rồi hỏi vì sao bạn muốn vị trí này. "Vì cuộc sống trước đây của tôi chán quá," bạn trả lời, trong khi một thực tập sinh nhân sự đã hoá xác sống bò dưới gầm bàn.

Ông gật đầu. "Khả năng thích nghi là điều cốt lõi trong văn hoá công ty. Bạn được nhận nếu sống sót qua buổi phỏng vấn nghỉ việc."

Buổi phỏng vấn nghỉ việc chỉ là chạy ra trực thăng trong lúc ký tờ khai thuế.`,
        newWords: ['v015', 'v016', 'v017'],
        words: [],
        questions: [
            { question: "What was the character's answer about their references?", options: ['They forgot to bring the references', 'All their references were eaten ten minutes ago', 'Their references were waiting outside', "They didn't need references"], answer: 1 },
            { question: "What is the 'exit interview' in this story?", options: ['A formal meeting in a conference room', 'Running to the helicopter while signing tax forms', 'Answering final questions about benefits', 'Shaking hands with the CEO'], answer: 1 },
        ],
    },
    {
        id: 'p_time_1',
        level: 'intermediate',
        topic: 'Xã hội',
        title: 'Năm 1920 và chiếc đồng hồ cảm ứng',
        text: `You travel back to 1920 and immediately face a historical conundrum: fix the timeline or avoid being arrested for your futuristic shoes.

Your panic will only exacerbate the mission, so you try to mitigate chaos by pretending to be a quiet accountant.

Then someone asks why your watch has a touchscreen. You invent a long explanation full of philosophical nuance and fake confidence.`,
        translation: `Bạn quay về năm 1920 và lập tức gặp một bài toán hóc búa của lịch sử: sửa dòng thời gian, hay tránh bị bắt vì đôi giày tương lai của mình.

Hoảng loạn chỉ làm nhiệm vụ tệ thêm, nên bạn cố giảm bớt hỗn loạn bằng cách giả làm một nhân viên kế toán ít nói.

Rồi có người hỏi sao đồng hồ của bạn có màn hình cảm ứng. Bạn bịa ra một lời giải thích dài, đầy sắc thái triết học và sự tự tin giả tạo.`,
        newWords: ['v021', 'v022', 'v023', 'v024'],
        words: [],
        questions: [
            { question: 'What does the character do to avoid suspicion in 1920?', options: ['Runs away and hides in the forest', 'Uses advanced technology openly', 'Pretends to be a quiet accountant', "Tells everyone they're from the future"], answer: 2 },
            { question: 'What gives away that the character is from the future?', options: ['Their modern clothing style', 'Their accent when speaking', 'Their watch has a touchscreen', 'They mention future events'], answer: 2 },
        ],
    },
    {
        id: 'p_time_2',
        level: 'intermediate',
        topic: 'Xã hội',
        title: 'Chiếc bánh mì kẹp nguy hiểm',
        text: `Unfortunately, your lies are too prolific. Every answer creates three new questions and two suspicious uncles.

To stay hidden, you remove all redundant gadgets and keep only one tangible objective: stop the inventor before lunch.

At the peak of your speech, you deliver a perfectly composed warning about the future. The inventor smiles and calls your logic "beautifully arbitrary."

Then he invents the dangerous sandwich anyway. By sunset, the timeline has forked into 47 cursed realities where everyone debates condiments for eternity.`,
        translation: `Tiếc là bạn nói dối quá nhiều. Mỗi câu trả lời lại sinh ra ba câu hỏi mới và hai ông chú đầy nghi ngờ.

Để ẩn mình, bạn bỏ hết đồ công nghệ thừa thãi và chỉ giữ một mục tiêu rõ ràng: ngăn nhà phát minh trước giờ ăn trưa.

Ở đoạn cao trào của bài nói, bạn đưa ra một lời cảnh báo hoàn hảo về tương lai. Nhà phát minh mỉm cười và gọi lập luận của bạn là "tuỳ tiện một cách đẹp đẽ".

Rồi ông vẫn phát minh ra chiếc bánh mì kẹp nguy hiểm. Đến hoàng hôn, dòng thời gian đã tách thành 47 thực tại bị nguyền rủa, nơi ai cũng tranh cãi mãi về nước chấm.`,
        newWords: ['v025', 'v026', 'v027'],
        words: [],
        questions: [
            { question: "What is the character's main objective?", options: ['Become rich in the past', 'Stop the inventor before lunch', 'Steal historical artifacts', 'Change their own history'], answer: 1 },
            { question: "How does the inventor respond to the time traveler's warning?", options: ['He believes them completely and stops', 'He calls the police immediately', "He calls their logic 'beautifully arbitrary'", 'He ignores them entirely'], answer: 2 },
        ],
    },

    // ── Giao tiếp: short dialogues (docs/LEXICA_DIRECTION.md), one speaker per line ──
    {
        id: 'd_cafe_1',
        kind: 'dialogue',
        level: 'beginner',
        topic: 'Đời sống',
        title: 'Một ly cà phê vội',
        text: `Staff: Hi! What can I get for you?
Linh: An iced latte to go, please. I'm running late for work.
Staff: No worries, it only takes two minutes.
Linh: Great. Oh, and is this banana bread on sale today?
Staff: It is. Twenty percent off until noon.
Linh: Then I'll give it a try.
Staff: Here you go. Take your time with the card machine, it's a bit slow.
Linh: Thanks! I'll text my boss that I'm on my way.`,
        translation: `Nhân viên: Chào bạn! Bạn dùng gì ạ?
Linh: Cho mình một ly latte đá mang đi. Mình đang trễ giờ làm.
Nhân viên: Không sao đâu, chỉ mất hai phút thôi.
Linh: Tuyệt. À, bánh chuối này hôm nay có giảm giá không?
Nhân viên: Có ạ. Giảm hai mươi phần trăm tới trưa.
Linh: Vậy mình thử một cái.
Nhân viên: Của bạn đây. Bạn cứ từ từ với máy quẹt thẻ nhé, máy hơi chậm.
Linh: Cảm ơn! Mình nhắn sếp là mình đang trên đường tới.`,
        newWords: ['g016', 'g002', 'g003', 'g015', 'g012', 'g004', 'g001'],
        words: [],
    },
    {
        id: 'd_hotel_1',
        kind: 'dialogue',
        level: 'beginner',
        topic: 'Du lịch',
        title: 'Nhận phòng ở Đà Nẵng',
        text: `Nam: Good evening. I'd like to check in, please. The booking is under Nam Tran.
Receptionist: Welcome! Your room is ready. Could you fill in this short form?
Nam: Sure. Also, my friend lands at nine. Is there a shuttle to pick up guests at the airport?
Receptionist: Yes, but tonight the shuttle is sold out. I can call a taxi for her.
Nam: That makes sense. Thank you.
Receptionist: You're welcome. Breakfast starts at six. Enjoy your stay!`,
        translation: `Nam: Chào buổi tối. Tôi muốn nhận phòng. Phòng đặt tên Nam Trần.
Lễ tân: Chào mừng anh! Phòng đã sẵn sàng. Anh điền giúp tờ khai ngắn này nhé?
Nam: Được. À, bạn tôi hạ cánh lúc chín giờ. Có xe đưa đón khách ở sân bay không?
Lễ tân: Có ạ, nhưng tối nay xe đã kín chỗ. Tôi gọi taxi cho chị ấy nhé.
Nam: Vậy cũng hợp lý. Cảm ơn chị.
Lễ tân: Không có gì. Bữa sáng bắt đầu lúc sáu giờ. Chúc anh nghỉ ngơi vui vẻ!`,
        newWords: ['g005', 'g007', 'g006', 'g010'],
        words: [],
    },
    {
        id: 'd_work_1',
        kind: 'dialogue',
        level: 'intermediate',
        topic: 'Công việc',
        title: 'Cuộc gọi đầu tuần',
        text: `Mai: Hi Tom, thanks for the call. I wanted to touch base about the new website.
Tom: Sure. Just a heads up, the client asked for one more page.
Mai: Okay. Let's make sure we're on the same page: is the deadline still Friday?
Tom: I'm not sure. I'll get back to you this afternoon.
Mai: Great. I'll follow up with the designer and deal with the new page myself.
Tom: Perfect. And keep in mind that I'm out of office on Thursday.`,
        translation: `Mai: Chào Tom, cảm ơn anh đã gọi. Em muốn cập nhật nhanh về trang web mới.
Tom: Ừ. Báo trước nhé, khách vừa xin thêm một trang nữa.
Mai: Dạ. Mình thống nhất lại cho chắc: hạn chót vẫn là thứ Sáu ạ?
Tom: Anh chưa chắc. Chiều nay anh trả lời em.
Mai: Dạ. Em sẽ nhắc lại với bên thiết kế và tự lo phần trang mới.
Tom: Tốt quá. Và nhớ là thứ Năm anh không ở văn phòng nhé.`,
        newWords: ['g018', 'g019', 'g020', 'g021', 'g017', 'g024', 'g026', 'g022'],
        words: [],
    },
    {
        id: 'd_friends_1',
        kind: 'dialogue',
        level: 'intermediate',
        topic: 'Đời sống',
        title: 'Hẹn cuối tuần',
        text: `Huy: Hey, long time no see! Do you want to catch up this weekend?
An: I'd love to. Let's hang out at that new barbecue place.
Huy: Good idea. Should I invite Phong too?
An: Sure, but he never shows up on time.
Huy: True. Last month he turned down our trip and then came anyway!
An: Ha! Okay, let's sort out the time in the group chat.`,
        translation: `Huy: Ê, lâu quá không gặp! Cuối tuần đi cà phê tán gẫu không?
An: Có chứ. Đi chơi ở quán nướng mới mở đi.
Huy: Ý hay. Có rủ Phong không?
An: Rủ đi, nhưng ông ấy chẳng bao giờ đến đúng giờ.
Huy: Đúng thật. Tháng trước ổng từ chối chuyến đi rồi cuối cùng vẫn tới!
An: Haha! Thôi, chốt giờ trong nhóm chat nha.`,
        newWords: ['g008', 'g009', 'g029', 'g031', 'g030'],
        words: [],
    },
];
