import type { Passage } from '../lib/content/passages';

/**
 * Passages that ship with the app: everyday texts (a first day at work, a
 * market budget, a rainy afternoon…) written around the words a learner meets
 * first at each level, plus short dialogues for Giao tiếp. Each is 110–170
 * words. `words` (other deck words in the text) is filled in by the
 * repository from the deck. Studio publishes more; the Today session asks the
 * API for a passage around the learner's own words when none of these fit.
 */
export const CORE_PASSAGES: Passage[] = [
    {
        id: 'p_first_day',
        level: 'beginner',
        topic: 'Công việc',
        title: "Buổi sáng đầu tiên ở chỗ làm mới",
        text: `On her first morning at the new office, Mai felt nervous. She did not know anyone, and the building was not familiar to her yet.

At nine o'clock, her manager showed her around. Mai tried to remember every name, but she soon noticed that people were patient with her. One colleague, Long, smiled and said, "To be honest, I still get lost on the third floor."

Mai laughed and relaxed a little. She learned how to use the coffee machine quickly, and by lunch she knew where all the meeting rooms were.

In the evening, she called her mother. "It was a long day," she said, "but I think I will like it there."`,
        translation: `Buổi sáng đầu tiên ở văn phòng mới, Mai thấy hồi hộp. Cô chưa quen ai, và toà nhà cũng còn lạ lẫm với cô.

Chín giờ, quản lý dẫn cô đi một vòng. Mai cố nhớ tên từng người, nhưng cô sớm nhận ra mọi người đều kiên nhẫn với mình. Một đồng nghiệp tên Long cười và nói: "Nói thật, đến giờ anh vẫn còn lạc ở tầng ba."

Mai bật cười và thấy nhẹ nhõm hơn. Cô học cách dùng máy pha cà phê rất nhanh, và tới trưa thì đã biết hết các phòng họp ở đâu.

Buổi tối, cô gọi cho mẹ. "Hôm nay dài thật," cô nói, "nhưng con nghĩ con sẽ thích chỗ đó."`,
        newWords: ["v425", "v366", "v371", "v335", "v384"],
        words: [],
        questions: [
            { question: "How did Mai feel on her first morning?", options: ["Bored", "Nervous", "Angry", "Sleepy"], answer: 1 },
            { question: "What did Long admit?", options: ["He was new too", "He still gets lost on the third floor", "He hates coffee", "He wants a new job"], answer: 1 },
        ],
    },
    {
        id: 'p_market_day',
        level: 'beginner',
        topic: 'Tiền bạc',
        title: "Đi chợ với ngân sách có hạn",
        text: `Every Sunday, Huy goes to the market with a limit of three hundred thousand dong. He wants good quality food, but he does not want to spend more than that.

He always starts with vegetables, because they are cheaper early in the morning. He is certain that the woman at the end of the row sells the freshest fish, so he buys from her every week.

Last week he made a small mistake. He forgot to check his list, and at home he found a lack of eggs for breakfast. The answer was obvious: write the list the night before.

Now his list is on his phone, and keeping to his budget is much easier.`,
        translation: `Chủ nhật nào Huy cũng đi chợ với mức giới hạn ba trăm nghìn đồng. Anh muốn mua đồ ăn chất lượng tốt, nhưng không muốn tiêu quá số đó.

Anh luôn mua rau trước, vì sáng sớm rau rẻ hơn. Anh chắc chắn rằng cô bán cá ở cuối dãy có cá tươi nhất, nên tuần nào cũng mua của cô.

Tuần trước anh mắc một lỗi nhỏ. Anh quên xem lại danh sách, và về nhà thì thấy thiếu trứng cho bữa sáng. Cách giải quyết thì quá rõ: viết danh sách từ tối hôm trước.

Giờ danh sách nằm trong điện thoại, và giữ đúng ngân sách dễ hơn nhiều.`,
        newWords: ["v370", "v355", "v345", "v423", "v075"],
        words: [],
        questions: [
            { question: "How much does Huy spend at most?", options: ["Three hundred thousand dong", "One million dong", "Fifty thousand dong", "He has no limit"], answer: 0 },
            { question: "What did Huy forget last week?", options: ["His wallet", "Eggs", "Fish", "His phone"], answer: 1 },
        ],
    },
    {
        id: 'p_rainy_day',
        level: 'beginner',
        topic: 'Đời sống',
        title: "Một buổi chiều mưa",
        text: `The rain started at two o'clock and did not stop. Lan had planned to take her little brother to the park, but now they had to stay inside.

"This is boring," her brother said. He could hardly sit still.

Lan took out some paper and colored pencils. "Imagine that our street is a river," she said. "What would you see from a boat?"

Her brother began to draw fish, bridges and a tiny house on the water. Soon he was asking questions: "I wonder if fish live under our house?"

By the time the rain stopped, the table was covered in pictures. When their mother came home, she could not believe how quiet the afternoon had been.`,
        translation: `Mưa bắt đầu lúc hai giờ và không ngớt. Lan định dẫn em trai ra công viên, nhưng giờ hai chị em phải ở trong nhà.

"Chán quá," em trai nói. Cậu bé gần như không ngồi yên được.

Lan lấy ra ít giấy và bút chì màu. "Tưởng tượng con đường nhà mình là một dòng sông nhé," cô nói. "Ngồi trên thuyền em sẽ thấy gì?"

Em trai bắt đầu vẽ cá, cầu và một ngôi nhà nhỏ trên mặt nước. Chẳng mấy chốc cậu đã hỏi: "Em tự hỏi không biết dưới nhà mình có cá không?"

Lúc mưa tạnh, cả cái bàn phủ đầy tranh. Mẹ về nhà mà không tin nổi buổi chiều lại yên ắng đến thế.`,
        newWords: ["v397", "v403", "v404", "v395", "v416"],
        words: [],
        questions: [
            { question: "Why did they stay inside?", options: ["It was raining", "The park was closed", "They were sick", "It was too hot"], answer: 0 },
            { question: "What did Lan ask her brother to imagine?", options: ["A forest", "That the street was a river", "A trip to space", "A new school"], answer: 1 },
        ],
    },
    {
        id: 'p_first_run',
        level: 'beginner',
        topic: 'Sức khoẻ',
        title: "Lần đầu chạy bộ",
        text: `Minh wanted to start running, but he felt anxious about it. He had not exercised for years, and he was afraid that people in the park would laugh at him.

His doctor gave him simple advice: be cautious at the start. Run for one minute, walk for two minutes, and repeat this ten times. Do not try to improve too quickly.

The first week was hard. On the third day his legs hurt, and he had negative thoughts: "Maybe running is not for me." But he kept going, slowly.

After a month, Minh could run for fifteen minutes without stopping. Nobody laughed. In fact, an older man in the park now waves to him every morning, and sometimes they run together.`,
        translation: `Minh muốn bắt đầu chạy bộ, nhưng anh thấy lo lắng. Đã nhiều năm anh không tập thể dục, và anh sợ người ta ở công viên sẽ cười mình.

Bác sĩ cho anh một lời khuyên đơn giản: lúc đầu hãy thận trọng. Chạy một phút, đi bộ hai phút, lặp lại mười lần. Đừng cố tiến bộ quá nhanh.

Tuần đầu rất vất vả. Đến ngày thứ ba thì chân đau, và anh có những suy nghĩ tiêu cực: "Chắc chạy bộ không hợp với mình." Nhưng anh vẫn tiếp tục, từ từ.

Sau một tháng, Minh chạy được mười lăm phút không nghỉ. Chẳng ai cười cả. Thậm chí có một bác lớn tuổi ở công viên giờ sáng nào cũng vẫy chào anh, và thỉnh thoảng hai người chạy cùng nhau.`,
        newWords: ["v061", "v063", "v354", "v335"],
        words: [],
        questions: [
            { question: "What was the doctor's advice?", options: ["Run as far as possible", "Start slowly and carefully", "Run only at night", "Stop exercising"], answer: 1 },
            { question: "What happened after a month?", options: ["Minh gave up", "Minh could run for fifteen minutes", "Minh hurt his leg", "Minh moved away"], answer: 1 },
        ],
    },
    {
        id: 'p_team_meeting',
        level: 'intermediate',
        topic: 'Công việc',
        title: "Một thói quen nhỏ cho cả nhóm",
        text: `When Thu joined a small design studio, she noticed that the team often missed deadlines. Nobody was lazy; the problem was that everyone had a different approach to planning their week.

Thu suggested a simple idea: a fifteen-minute meeting every Monday morning to agree on the week's priorities. Her manager was not sure at first, but he agreed to implement it for one month.

The meetings were short and consistent. People knew what was most urgent, so they stopped losing time on small tasks. The team became more efficient, and the number of late projects fell by half.

At the end of the month, the manager admitted that the change had been worthwhile. "It wasn't a big idea," he said, "but we needed someone to try it."`,
        translation: `Khi Thu vào làm ở một studio thiết kế nhỏ, cô để ý thấy cả nhóm hay trễ hạn. Không ai lười cả; vấn đề là mỗi người lên kế hoạch cho tuần theo một cách khác nhau.

Thu đề xuất một ý đơn giản: họp mười lăm phút mỗi sáng thứ Hai để thống nhất việc ưu tiên trong tuần. Lúc đầu quản lý còn phân vân, nhưng anh đồng ý áp dụng thử một tháng.

Các buổi họp ngắn và đều đặn. Mọi người biết việc nào gấp nhất, nên không còn mất thời gian vào việc vặt. Cả nhóm làm việc hiệu quả hơn, và số dự án trễ hạn giảm một nửa.

Cuối tháng, quản lý thừa nhận thay đổi này rất đáng. "Không phải ý gì lớn lao," anh nói, "nhưng mình cần một người dám thử."`,
        newWords: ["v314", "v328", "v305", "v065", "v341"],
        words: [],
        questions: [
            { question: "What was the team's real problem?", options: ["They were lazy", "Everyone planned differently", "They had no clients", "The office was too small"], answer: 1 },
            { question: "What happened to late projects?", options: ["They doubled", "They fell by half", "They stayed the same", "They stopped completely"], answer: 1 },
        ],
    },
    {
        id: 'p_daily_english',
        level: 'intermediate',
        topic: 'Giáo dục',
        title: "Học tiếng Anh mỗi ngày một chút",
        text: `Many people start learning English with a good intention: "This year I will finally be fluent." A few weeks later, they stop.

One common tendency is to set goals that are too vague. "Study more" is hard to measure. "Learn ten new words and read one short text every day" is much clearer, and you know when you have done it.

It also helps to study at a particular time, for example on the bus or right after dinner. Then it becomes part of the day rather than an extra task you have to remember.

Ten minutes does not sound like a lot, but it is sufficient if you do it every day. After three months, those minutes add up to more than fifteen hours of practice.`,
        translation: `Nhiều người bắt đầu học tiếng Anh với một ý định tốt: "Năm nay mình nhất định sẽ nói trôi chảy." Vài tuần sau, họ bỏ.

Một xu hướng hay gặp là đặt mục tiêu quá mơ hồ. "Học nhiều hơn" thì khó đo. "Mỗi ngày học mười từ mới và đọc một đoạn ngắn" rõ ràng hơn nhiều, và bạn biết khi nào mình đã làm xong.

Học vào một giờ cố định cũng giúp ích, ví dụ trên xe buýt hay ngay sau bữa tối. Khi đó việc học thành một phần của ngày, chứ không phải một việc thêm mà bạn phải nhớ.

Mười phút nghe có vẻ không nhiều, nhưng đủ nếu bạn làm mỗi ngày. Sau ba tháng, những phút đó cộng lại thành hơn mười lăm giờ luyện tập.`,
        newWords: ["v386", "v338", "v358", "v409", "v312"],
        words: [],
        questions: [
            { question: "Why do many learners stop?", options: ["Their goals are too vague", "English is too easy", "They have no phone", "Teachers are strict"], answer: 0 },
            { question: "How much practice is ten minutes a day for three months?", options: ["About two hours", "More than fifteen hours", "Exactly one day", "Fifty hours"], answer: 1 },
        ],
    },
    {
        id: 'p_neighbors',
        level: 'intermediate',
        topic: 'Xã hội',
        title: "Hàng xóm mới",
        text: `When the Nguyen family moved into a new apartment building, they did not know any of their neighbors. Their son, Bao, was eager to make friends, but the building felt quiet and private.

Then there was a problem with the water supply, and for two days the taps were dry. An older neighbor, Mr. Tam, made a schedule so that everyone could collect water from the tank downstairs. He was calm and dependable, and people started talking to each other in the corridors.

The experience changed Bao's perspective on the building. He saw that small acts of help have a strong influence on how people feel about a place.

He also learned to be sensitive to his neighbors' needs. Now he helps Mr. Tam carry his shopping every Saturday.`,
        translation: `Khi nhà họ Nguyễn chuyển đến một chung cư mới, họ chưa quen hàng xóm nào. Con trai họ, Bảo, rất háo hức kết bạn, nhưng toà nhà có vẻ yên ắng và khép kín.

Rồi đường nước gặp sự cố, và suốt hai ngày vòi nước khô cong. Một bác hàng xóm lớn tuổi, bác Tâm, lập lịch để mọi người lần lượt lấy nước từ bồn dưới tầng trệt. Bác điềm tĩnh và đáng tin cậy, và mọi người bắt đầu trò chuyện với nhau ở hành lang.

Chuyện đó làm Bảo nhìn toà nhà theo cách khác. Cậu thấy những việc giúp nhỏ có ảnh hưởng lớn đến cảm giác của người ta về một nơi chốn.

Cậu cũng học cách tinh ý với nhu cầu của hàng xóm. Giờ thứ Bảy nào cậu cũng xách đồ đi chợ giúp bác Tâm.`,
        newWords: ["v400", "v359", "v301", "v420", "v430"],
        words: [],
        questions: [
            { question: "What problem did the building have?", options: ["No electricity", "No water for two days", "A broken lift", "Too much noise"], answer: 1 },
            { question: "How does Bao help Mr. Tam now?", options: ["He cooks for him", "He carries his shopping", "He drives him to work", "He fixes his taps"], answer: 1 },
        ],
    },
    {
        id: 'p_city_budget',
        level: 'advanced',
        topic: 'Tiền bạc',
        title: "Sống tiết kiệm ở thành phố lớn",
        text: `Living in a big city on a starting salary can feel precarious. Rent takes a large part of the budget, and one unexpected bill can upset the whole month.

Linh decided to become more frugal without making her life miserable. She cooks at home on weekdays, buys second-hand furniture and keeps a small emergency fund. These habits do not make her affluent, but they alleviate much of the stress she used to feel at the end of each month.

When friends ask for advice, she starts with one pertinent question: "Do you know where your money actually goes?" Most of them do not. Tracking every expense for a single month, she believes, is the most useful step anyone can take.`,
        translation: `Sống ở thành phố lớn với mức lương khởi điểm có thể thấy bấp bênh. Tiền thuê nhà chiếm phần lớn ngân sách, và chỉ một hoá đơn bất ngờ cũng làm đảo lộn cả tháng.

Linh quyết định sống tiết kiệm hơn mà không biến cuộc sống thành khổ sở. Cô nấu ăn ở nhà các ngày trong tuần, mua đồ nội thất cũ và giữ một khoản dự phòng nhỏ. Những thói quen đó không làm cô giàu có, nhưng giảm bớt phần lớn căng thẳng mà cô từng có mỗi cuối tháng.

Khi bạn bè xin lời khuyên, cô bắt đầu bằng một câu hỏi đúng trọng tâm: "Bạn có biết tiền của mình thật sự đi đâu không?" Phần lớn đều không biết. Theo cô, ghi lại mọi khoản chi trong một tháng là bước hữu ích nhất mà ai cũng làm được.`,
        newWords: ["v227", "v189", "v145", "v146", "v221"],
        words: [],
        questions: [
            { question: "Why can city life feel precarious?", options: ["Rent is high and bills are unexpected", "Jobs are too easy", "Food is free", "Friends are expensive"], answer: 0 },
            { question: "What does Linh recommend first?", options: ["Buying a car", "Tracking expenses for a month", "Moving abroad", "Eating out more"], answer: 1 },
        ],
    },
    {
        id: 'p_hometown',
        level: 'advanced',
        topic: 'Đời sống',
        title: "Quê nhà sau mười năm",
        text: `After ten years abroad, Quang returned to his hometown for the Lunar New Year. On the train he felt apprehensive: would anything still feel like home?

The town had changed. There was a new bridge, two supermarkets and a café where his old school used to stand. He had to concede that much of it was an improvement.

Yet some moments made him deeply nostalgic. The smell of banh chung cooking at his aunt's house brought back lucid memories of his childhood, as clear as if they had happened yesterday.

The visit was short, and those feelings were fleeting. But on the train back to the city, Quang promised himself that he would not wait another ten years.`,
        translation: `Sau mười năm ở nước ngoài, Quang về quê ăn Tết. Ngồi trên tàu, anh thấy bồn chồn: liệu còn gì cho anh cảm giác như ở nhà không?

Thị trấn đã đổi khác. Có cây cầu mới, hai siêu thị và một quán cà phê ở chỗ trường cũ của anh ngày trước. Anh phải thừa nhận phần lớn những thay đổi đó là tốt hơn.

Vậy mà có những khoảnh khắc khiến anh hoài niệm da diết. Mùi bánh chưng đang nấu ở nhà dì gợi lại những ký ức tuổi thơ rõ mồn một, như mới hôm qua.

Chuyến về ngắn ngủi, và những cảm xúc ấy cũng thoáng qua. Nhưng trên chuyến tàu trở lại thành phố, Quang tự hứa sẽ không đợi thêm mười năm nữa.`,
        newWords: ["v153", "v164", "v214", "v205", "v187"],
        words: [],
        questions: [
            { question: "Why was Quang apprehensive?", options: ["He feared his hometown would feel strange", "He lost his ticket", "He was late for work", "He did not like trains"], answer: 0 },
            { question: "What brought back his childhood memories?", options: ["A new bridge", "The smell of banh chung", "A supermarket", "His old school"], answer: 1 },
        ],
    },
    {
        id: 'p_air_quality',
        level: 'expert',
        topic: 'Môi trường',
        title: "Một đề xuất thuyết phục",
        text: `When Ha applied for funding to study air quality in her district, she knew the competition would be tough. The committee received hundreds of proposals every year.

Her argument was cogent because it was simple. She pointed to a dearth of local data: the nearest monitoring station was eleven kilometres away. She then highlighted the most salient finding of a small pilot study she had run herself, which showed pollution near two primary schools well above national limits.

The committee was impressed by how assiduous her preparation had been. She had collected readings for six months, often before dawn.

Her project was funded. Its aim is not only to measure the problem but to ameliorate it, by working with the schools to change traffic at drop-off times.`,
        translation: `Khi Hà xin tài trợ để nghiên cứu chất lượng không khí ở quận mình, cô biết sẽ cạnh tranh gay gắt. Hội đồng nhận hàng trăm đề xuất mỗi năm.

Lập luận của cô thuyết phục vì nó đơn giản. Cô chỉ ra sự thiếu hụt dữ liệu tại chỗ: trạm quan trắc gần nhất cách đó mười một cây số. Rồi cô nêu bật phát hiện đáng chú ý nhất từ một nghiên cứu thử nhỏ do chính cô thực hiện, cho thấy mức ô nhiễm gần hai trường tiểu học cao hơn hẳn giới hạn quốc gia.

Hội đồng ấn tượng với sự chuẩn bị cần mẫn của cô. Cô đã đo đạc suốt sáu tháng, nhiều hôm từ trước bình minh.

Dự án của cô được tài trợ. Mục tiêu không chỉ là đo lường vấn đề mà còn cải thiện nó, bằng cách cùng các trường điều chỉnh giao thông vào giờ đưa đón.`,
        newWords: ["v260", "v269", "v042", "v245", "v046"],
        words: [],
        questions: [
            { question: "Why was Ha's argument convincing?", options: ["It was long and complex", "It was simple and backed by data", "She knew the committee", "She asked for little money"], answer: 1 },
            { question: "How will the project improve the problem?", options: ["By closing the schools", "By changing traffic at drop-off times", "By planting trees only", "By moving the station"], answer: 1 },
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
