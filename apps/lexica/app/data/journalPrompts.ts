import type { TopicId } from '../lib/engagement/collection';
import type { Depth, JournalPrompt } from '../lib/journey/prompts';

/**
 * Questions for "Một câu hôm nay" (lib/journey/prompts.ts), by topic (the
 * album topics, lib/engagement/collection.ts) and depth:
 * 1 nhẹ: what happened; 2 vừa: how it felt, why; 3 sâu: what it says about
 * you, what you would change. Real questions about the learner's own life,
 * answerable in one or two sentences.
 */
const BANK: Record<TopicId, Record<Depth, string[]>> = {
    work: {
        1: ['Hôm nay việc gì chiếm nhiều thời gian nhất của bạn?', 'Cuộc họp hay cuộc trò chuyện nào ở chỗ làm bạn còn nhớ hôm nay?', 'Sáng nay bạn bắt đầu ngày làm việc thế nào?'],
        2: ['Việc nào hôm nay làm bạn thấy mệt, và vì sao?', 'Hôm nay có lúc nào bạn thấy mình làm tốt không? Lúc đó ra sao?', 'Một đồng nghiệp làm gì khiến bạn để ý hôm nay?'],
        3: ['Nếu được bỏ một việc khỏi lịch làm việc, bạn bỏ việc gì, và vì sao?', 'Công việc hiện tại dạy bạn điều gì về chính mình?', 'Một năm nữa bạn muốn ngày làm việc của mình khác hôm nay ở điểm nào?'],
    },
    study: {
        1: ['Hôm nay bạn học được điều gì mới, dù nhỏ?', 'Bạn học ở đâu hôm nay, lúc mấy giờ?', 'Bài hay môn nào chiếm nhiều thời gian nhất của bạn hôm nay?'],
        2: ['Phần nào hôm nay làm bạn thấy khó, và bạn đã làm gì với nó?', 'Lúc nào hôm nay bạn thấy học vào nhất? Vì sao?', 'Bạn có mắc lỗi nào hôm nay mà thấy đáng nhớ không?'],
        3: ['Bạn học tiếng Anh để làm gì, nói thật với chính mình?', 'Cách học nào hợp với bạn nhất, và bạn nhận ra điều đó khi nào?', 'Nếu bạn của một năm trước nhìn bạn hôm nay, họ sẽ ngạc nhiên vì điều gì?'],
    },
    money: {
        1: ['Hôm nay bạn tiêu tiền vào việc gì?', 'Món đồ cuối cùng bạn mua là gì?', 'Hôm nay bạn có trả hóa đơn hay chuyển khoản cho ai không?'],
        2: ['Khoản chi nào gần đây làm bạn thấy đáng tiền nhất? Vì sao?', 'Có món nào bạn suýt mua mà rồi thôi không? Điều gì làm bạn dừng lại?', 'Chuyện tiền bạc nào làm bạn lo nhất dạo này?'],
        3: ['Với bạn, tiêu tiền thế nào là tiêu khôn?', 'Nếu có thêm một khoản tiền bất ngờ, bạn làm gì đầu tiên, và điều đó nói gì về bạn?', 'Cách gia đình nói chuyện tiền bạc ảnh hưởng tới bạn thế nào?'],
    },
    love: {
        1: ['Hôm nay bạn nhắn tin hay gọi cho người thương chưa? Nói chuyện gì?', 'Lần gần nhất bạn đi chơi với một nửa (hoặc crush) là khi nào?', 'Hôm nay ai làm bạn mỉm cười?'],
        2: ['Một điều nhỏ người kia làm khiến bạn thấy được quan tâm là gì?', 'Gần đây có lúc nào hai người hiểu lầm nhau không? Chuyện gì xảy ra?', 'Bạn thấy dễ chịu nhất khi ở cạnh người như thế nào?'],
        3: ['Với bạn, một mối quan hệ tốt cần điều gì nhất?', 'Bạn đã thay đổi thế nào sau mối quan hệ gần nhất?', 'Bạn muốn người thương biết điều gì về bạn mà bạn chưa nói?'],
    },
    social: {
        1: ['Hôm nay bạn xem gì trên mạng lâu nhất?', 'Bài đăng hay video nào bạn nhớ nhất hôm nay?', 'Hôm nay bạn có đăng, bình luận hay chia sẻ gì không?'],
        2: ['Có bài đăng nào hôm nay làm bạn thấy vui, hoặc khó chịu không? Vì sao?', 'Bạn theo dõi một người nào đó vì điều gì ở họ?', 'Sau khi lướt mạng một lúc, bạn thường thấy thế nào?'],
        3: ['Nếu tắt mạng xã hội một tuần, bạn nghĩ mình sẽ nhớ gì nhất, và không nhớ gì?', 'Hình ảnh bạn trên mạng giống và khác bạn ngoài đời ở đâu?', 'Mạng xã hội đã thay đổi cách bạn nhìn bạn bè thế nào?'],
    },
    food: {
        1: ['Hôm nay bạn ăn gì ngon nhất?', 'Bữa sáng của bạn hôm nay là gì, ăn ở đâu?', 'Hôm nay bạn uống mấy ly cà phê hay trà?'],
        2: ['Món nào làm bạn nhớ nhà nhất? Vì sao?', 'Bạn ăn một mình hay với ai hôm nay? Bữa đó thế nào?', 'Có quán nào bạn hay quay lại không? Điều gì kéo bạn quay lại?'],
        3: ['Một bữa ăn đáng nhớ nhất đời bạn là bữa nào, và vì sao nó ở lại trong trí nhớ?', 'Cách bạn ăn uống dạo này nói gì về nhịp sống của bạn?', 'Nếu được nấu cho một người một bữa, bạn nấu cho ai, món gì?'],
    },
    people: {
        1: ['Hôm nay bạn nói chuyện với ai nhiều nhất?', 'Hôm nay bạn gặp hoặc nhắn tin cho người nhà chưa?', 'Ai là người đầu tiên bạn nói chuyện sáng nay?'],
        2: ['Một người bạn làm điều gì khiến bạn thấy biết ơn gần đây?', 'Có ai trong nhà làm bạn lo hoặc vui dạo này không? Chuyện gì vậy?', 'Bạn hợp với kiểu người nào, và kiểu người nào làm bạn thấy mệt?'],
        3: ['Người nào đã thay đổi cách bạn nghĩ nhiều nhất, và bằng cách nào?', 'Bạn muốn giống bố mẹ ở điểm nào, và khác ở điểm nào?', 'Bạn bè biết bạn qua điều gì, và có điều gì họ chưa biết?'],
    },
    life: {
        1: ['Kể một việc bình thường bạn làm hôm nay.', 'Hôm nay trời thế nào, và nó làm ngày của bạn ra sao?', 'Bạn đi lại hôm nay bằng gì, có gì đáng kể trên đường không?'],
        2: ['Khoảnh khắc nào hôm nay bạn thấy thoải mái nhất?', 'Hôm nay có chuyện gì không như bạn tính không? Bạn xử lý thế nào?', 'Điều gì làm bạn có năng lượng nhất hôm nay, và điều gì lấy mất nó?'],
        3: ['Một thói quen nhỏ bạn muốn giữ suốt đời là gì, và vì sao?', 'Nếu hôm nay là một chương trong sách đời bạn, tên chương là gì?', 'Điều gì bạn đang chờ đợi, và nó nói gì về điều bạn cần lúc này?'],
    },
};

export const JOURNAL_PROMPTS: JournalPrompt[] = Object.entries(BANK).flatMap(([topic, byDepth]) =>
    ([1, 2, 3] as const).flatMap((depth) => byDepth[depth].map((text, i) => ({ id: `${topic}-${depth}-${i}`, topic: topic as TopicId, depth, text }))),
);
