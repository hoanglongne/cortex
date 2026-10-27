/**
 * Messages a teacher copies into Zalo or Messenger: warm, short, praise
 * before the ask. The app has no chat of its own; teachers already have one.
 */
export function nudgeMessage(names: string[], className: string): string {
    const who = names.length === 1 ? names[0] : 'cả nhóm';
    return `Chào ${who}! Mấy hôm nay chưa thấy ${names.length === 1 ? 'em' : 'các em'} vào Lexica. Chỉ cần 10 phút phiên "Hôm nay" là từ của lớp ${className} lại vào nếp. Cô/thầy chờ tin vui nhé!`;
}

export function praiseMessage(name: string, why: string): string {
    return `${name} ơi, tuần này em ${why.replace(/^\+/, 'thêm ')}. Giỏi lắm, giữ nhịp này nhé!`;
}

export function dueMessage(title: string, className: string, days: number): string {
    const when = days <= 0 ? 'hôm nay' : days === 1 ? 'ngày mai' : `${days} ngày nữa`;
    return `Nhắc lớp ${className}: bài "${title}" hết hạn ${when}. Mở Lexica, phiên "Hôm nay" sẽ đưa các em học đúng những từ này.`;
}

/** To a parent, after lessons missed in a row: what was missed, a question, and how to catch up. */
export function absenceParentMessage(name: string, className: string, days: readonly string[]): string {
    return `Chào anh/chị, em ${name} đã vắng ${days.length} buổi gần đây của lớp ${className} (${days.join(', ')}). Anh/chị cho cô/thầy biết con có ổn không ạ? Từ của các buổi đó đã có trong Lexica để con học bù.`;
}

/** To the student: no blame, the way back. */
export function absenceStudentMessage(name: string, days: number): string {
    return `${name} ơi, ${days} buổi rồi chưa thấy em trên lớp. Em ổn chứ? Từ của các buổi đó có sẵn trong Lexica, em học bù 10 phút là theo kịp lớp. Buổi tới gặp em nhé!`;
}
