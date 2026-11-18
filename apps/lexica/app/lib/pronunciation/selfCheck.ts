/**
 * Checks the learner can do with an everyday object, no scoring needed
 * (issue #155, docs/LEXICA_MOUTH_GUIDE_PLAN.md M4): a sheet of paper for the
 * puff after p t k, a hand on the throat for voicing, a mirror for th, a
 * finger on the lips for v and b, holding a sound for s and sh.
 *
 * "Làm được" is weak evidence: it only decides whether the card opens again.
 */
import { bare } from './phones';

export interface SelfCheck {
    id: 'paper' | 'throat' | 'mirror' | 'lips' | 'hold';
    /** What to pick up, shown as the title. */
    object: string;
    steps: string[];
    /** Words to say while checking. */
    words: string[];
}

const CHECKS: Record<SelfCheck['id'], SelfCheck> = {
    paper: {
        id: 'paper',
        object: 'Một tờ giấy',
        steps: ['Cầm tờ giấy mỏng trước miệng, cách 5 cm.', 'Nói paper, tea, key.', 'Giấy phải rung mạnh ở âm đầu. Nói bee, day: giấy gần như đứng yên.'],
        words: ['paper', 'tea', 'key'],
    },
    throat: {
        id: 'throat',
        object: 'Tay đặt lên cổ',
        steps: ['Đặt nhẹ hai ngón tay lên cổ họng.', 'Kéo dài zzzz rồi ssss.', 'Thấy rung ở z, không rung ở s. Làm tương tự với vvvv / ffff.'],
        words: ['zoo', 'sue', 'leave', 'leaf'],
    },
    mirror: {
        id: 'mirror',
        object: 'Một cái gương',
        steps: ['Cầm gương (hoặc mở camera trước).', 'Nói think, this chậm.', 'Phải thấy đầu lưỡi giữa hai hàm răng. Không thấy lưỡi là đang nói /s/ hoặc /t/.'],
        words: ['think', 'this', 'three'],
    },
    lips: {
        id: 'lips',
        object: 'Ngón tay trên môi',
        steps: ['Đặt ngón tay ngang dưới môi dưới.', 'Nói very: răng trên chạm môi dưới, môi không khép.', 'Nói berry: hai môi khép vào nhau.'],
        words: ['very', 'berry', 'vest', 'best'],
    },
    hold: {
        id: 'hold',
        object: 'Kéo dài âm',
        steps: ['Giữ ssss 2 giây, rồi shhhh 2 giây.', 'Nghe: s cao và mảnh, sh trầm và rộng.', 'Chu môi ở sh. Môi dẹt ở s.'],
        words: ['see', 'she', 'sip', 'ship'],
    },
};

const FOR_PHONE: Record<string, SelfCheck['id']> = {
    P: 'paper', T: 'paper', K: 'paper',
    Z: 'throat', S: 'hold', SH: 'hold', ZH: 'throat', B: 'lips', D: 'throat', G: 'throat',
    TH: 'mirror', DH: 'mirror', V: 'lips', F: 'lips',
};

/** The self-check for `phone`, or null when none fits. */
export function selfCheckFor(phone: string): SelfCheck | null {
    const id = FOR_PHONE[bare(phone)];
    return id ? CHECKS[id] : null;
}

/** Days after "Làm được" before the card opens on its own again. */
export const RECHECK_DAYS = 14;

/** Whether the card opens on its own: never done, or done long enough ago. */
export function shouldOpen(doneAt: number | undefined, now: number): boolean {
    return doneAt === undefined || now - doneAt >= RECHECK_DAYS * 86_400_000;
}
