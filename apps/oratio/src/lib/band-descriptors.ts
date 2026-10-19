import type { Criterion } from "@/lib/feedback";

/**
 * One short line per band and criterion, paraphrasing the public IELTS
 * speaking band descriptors for peer rating (not copied word for word).
 */
export const BAND_DESCRIPTORS: Record<Criterion, Record<number, string>> = {
  fluency: {
    1: "Gần như không nói được; chỉ có vài từ rời rạc.",
    2: "Ngừng rất lâu giữa các từ; hầu như không nối được thành câu.",
    3: "Nói rất chậm, hay dừng; chỉ nối được những ý rất đơn giản.",
    4: "Trả lời ngắt quãng, ngập ngừng nhiều; nối ý đơn giản, đôi lúc khó theo dõi.",
    5: "Giữ được nhịp nói nhưng hay lặp, tự sửa hoặc chậm lại; từ nối còn đơn điệu.",
    6: "Nói được dài, đôi khi mất mạch lạc vì lặp hoặc tự sửa; từ nối chưa luôn phù hợp.",
    7: "Nói dài không cần cố gắng, thỉnh thoảng ngập ngừng hay tự sửa; dùng từ nối linh hoạt.",
    8: "Nói trôi chảy, hiếm khi lặp; ngập ngừng thường là để tìm ý chứ không phải tìm từ.",
    9: "Nói trôi chảy tự nhiên, ý mạch lạc và được phát triển đầy đủ.",
  },
  vocabulary: {
    1: "Gần như không có vốn từ ngoài vài từ đơn lẻ.",
    2: "Chỉ biết một số từ và cụm từ rời rạc.",
    3: "Dùng được từ đơn giản cho thông tin cá nhân; thiếu từ ngay cả với chủ đề quen.",
    4: "Chỉ nói được chủ đề quen thuộc; hay dùng sai từ hoặc lặp từ.",
    5: "Nói được chủ đề quen thuộc, ít khi diễn đạt lại được; vốn từ còn hạn chế.",
    6: "Vốn từ đủ để bàn chủ đề dài; đôi khi dùng từ chưa chuẩn nhưng vẫn diễn đạt lại được.",
    7: "Dùng từ linh hoạt, có idiom và collocation, dù đôi lúc chưa chính xác.",
    8: "Vốn từ rộng, diễn đạt linh hoạt, dùng idiom ít gặp tốt; chỉ sai nhỏ thỉnh thoảng.",
    9: "Dùng từ chính xác và tự nhiên ở mọi chủ đề, kể cả idiom.",
  },
  grammar: {
    1: "Không tạo được câu hoàn chỉnh.",
    2: "Chỉ nói được cụm từ học thuộc, gần như không có cấu trúc câu.",
    3: "Cố tạo câu nhưng hầu hết đều sai và khó hiểu.",
    4: "Chủ yếu câu đơn; lỗi nhiều và có thể gây khó hiểu.",
    5: "Câu đơn khá chuẩn, câu phức còn hạn chế và thường có lỗi.",
    6: "Pha trộn câu đơn và câu phức; còn lỗi nhưng hiếm khi gây khó hiểu.",
    7: "Dùng khá linh hoạt nhiều cấu trúc phức; nhiều câu không lỗi, còn lỗi nhỏ.",
    8: "Cấu trúc đa dạng, phần lớn câu không lỗi; thỉnh thoảng sai nhỏ.",
    9: "Cấu trúc đa dạng, tự nhiên và chính xác; chỉ có lỗi nhỏ hiếm gặp.",
  },
  pronunciation: {
    1: "Gần như không thể hiểu được.",
    2: "Rất khó nghe; chỉ vài từ nghe ra được.",
    3: "Nhiều lỗi phát âm làm người nghe thường xuyên không hiểu.",
    4: "Nhiều lỗi phát âm, thường gây khó hiểu; người nghe phải cố gắng.",
    5: "Còn lỗi phát âm, đôi lúc khó hiểu; ảnh hưởng của tiếng mẹ đẻ khá rõ.",
    6: "Đủ rõ để hiểu, dù có lúc phát âm sai khiến người nghe phải đoán.",
    7: "Phát âm tốt nhưng chưa đều; dễ hiểu xuyên suốt, giọng ít ảnh hưởng.",
    8: "Dùng tốt ngữ điệu và trọng âm; ít lỗi, rất dễ hiểu.",
    9: "Phát âm, ngữ điệu và trọng âm tự nhiên, duy trì suốt buổi.",
  },
};
