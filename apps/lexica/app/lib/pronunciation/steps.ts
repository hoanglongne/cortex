/**
 * How to make each sound, in at most three short steps that each start with a
 * verb (issue #152, docs/LEXICA_MOUTH_GUIDE_PLAN.md M5). Each step names the
 * part of the mouth picture it is about, so the picture can light that part.
 * Plus one line on what Vietnamese speakers usually do instead.
 *
 * Hand-written; keep steps short enough to read while trying the sound.
 */
import { bare } from './phones';

/** The part of the mouth picture (components/pron/Mouth.tsx) a step is about. */
export type MouthPart = 'tongue' | 'lips' | 'jaw' | 'contact' | 'air' | 'voice' | 'nose';

export interface Step { text: string; part: MouthPart }
export interface SoundGuide { steps: Step[]; slip?: string }

const s = (part: MouthPart, text: string): Step => ({ part, text });

const VOICE = s('voice', 'Rung cổ họng trong lúc nói.');
const NO_VOICE = s('voice', 'Giữ cổ họng không rung, chỉ có hơi.');

const GUIDES: Record<string, SoundGuide> = {
    P: { steps: [s('lips', 'Khép hai môi lại.'), s('air', 'Dồn hơi sau môi một chút.'), s('air', 'Bật môi ra, hơi phụt mạnh (như thổi tắt nến).')], slip: 'Người Việt hay bỏ luồng hơi khi /p/ đứng đầu, hoặc nuốt mất /p/ ở cuối từ.' },
    B: { steps: [s('lips', 'Khép hai môi lại.'), VOICE, s('lips', 'Mở môi nhẹ, không phụt hơi.')], slip: 'Ở cuối từ (job, rub) người Việt hay bỏ hẳn /b/: nhớ mở môi ra ở cuối.' },
    T: { steps: [s('contact', 'Chạm đầu lưỡi vào lợi ngay sau răng trên.'), s('air', 'Chặn hơi lại một chút.'), s('air', 'Thả lưỡi ra, hơi bật mạnh.')], slip: 'Người Việt hay nuốt /t/ cuối (cat thành "ca"): phải thả lưỡi ra cho nghe tiếng.' },
    D: { steps: [s('contact', 'Chạm đầu lưỡi vào lợi ngay sau răng trên.'), VOICE, s('tongue', 'Thả lưỡi ra, không phụt hơi.')], slip: 'Ở cuối từ (bed, need) hay thành /t/ hoặc mất hẳn: giữ rung cổ đến hết.' },
    K: { steps: [s('contact', 'Nâng cuống lưỡi chạm vòm mềm phía trong.'), s('air', 'Chặn hơi lại.'), s('air', 'Thả ra, hơi bật mạnh.')], slip: 'Người Việt hay nuốt /k/ cuối (back thành "ba"): thả cuống lưỡi ra cho nghe tiếng.' },
    G: { steps: [s('contact', 'Nâng cuống lưỡi chạm vòm mềm phía trong.'), VOICE, s('tongue', 'Thả lưỡi ra nhẹ, không phụt hơi.')], slip: 'Ở cuối từ (bag, dog) hay thành /k/: giữ rung cổ.' },
    F: { steps: [s('contact', 'Đặt răng trên chạm nhẹ môi dưới.'), s('air', 'Thổi hơi đều qua khe.'), NO_VOICE] },
    V: { steps: [s('contact', 'Đặt răng trên chạm nhẹ môi dưới.'), s('air', 'Thổi hơi qua khe.'), VOICE], slip: 'Người Việt hay nói thành /b/ hoặc bỏ /v/ cuối (love thành "lớp"): giữ răng trên môi dưới.' },
    TH: { steps: [s('contact', 'Đặt đầu lưỡi giữa hai hàm răng.'), s('tongue', 'Giữ lưỡi phẳng, chạm nhẹ răng trên.'), s('air', 'Thổi hơi đều qua khe, không rung cổ.')], slip: 'Người Việt hay nói thành /t/ ("tink") hoặc /s/ ("sink"): lưỡi phải chạm răng.' },
    DH: { steps: [s('contact', 'Đặt đầu lưỡi giữa hai hàm răng.'), s('air', 'Đẩy hơi nhẹ qua khe.'), VOICE], slip: 'Người Việt hay nói thành /d/ hoặc /z/ (this thành "dis"): lưỡi phải chạm răng.' },
    S: { steps: [s('tongue', 'Đưa đầu lưỡi sát lợi trên, không chạm.'), s('lips', 'Kéo môi hơi dẹt.'), s('air', 'Thổi hơi xì qua khe hẹp, không rung cổ.')], slip: 'Người Việt hay bỏ /s/ cuối (cats thành "cat"): kéo dài tiếng xì.' },
    Z: { steps: [s('tongue', 'Đưa đầu lưỡi sát lợi trên, không chạm.'), s('air', 'Thổi hơi xì qua khe hẹp.'), VOICE], slip: 'Người Việt hay nói thành /s/ hoặc /d/ (zoo thành "du"): giữ rung cổ như con ong.' },
    SH: { steps: [s('lips', 'Chu môi ra một chút.'), s('tongue', 'Nâng mặt lưỡi sát phía sau lợi.'), s('air', 'Thổi hơi "suỵt" rộng hơn /s/.')], slip: 'Người Việt hay nói thành /s/: môi phải chu ra.' },
    ZH: { steps: [s('lips', 'Chu môi ra một chút.'), s('tongue', 'Nâng mặt lưỡi sát phía sau lợi.'), VOICE] },
    CH: { steps: [s('contact', 'Chạm mặt lưỡi vào phía sau lợi.'), s('lips', 'Chu môi ra một chút.'), s('air', 'Thả ra thành tiếng "ch" có hơi, không rung cổ.')], slip: 'Người Việt hay nói như "ch" tiếng Việt (lưỡi phẳng): môi chu, lưỡi bật ra.' },
    JH: { steps: [s('contact', 'Chạm mặt lưỡi vào phía sau lợi.'), s('lips', 'Chu môi ra một chút.'), VOICE], slip: 'Người Việt hay nói thành "ch" hoặc "gi": rung cổ và bật lưỡi ra.' },
    M: { steps: [s('lips', 'Khép hai môi lại.'), s('nose', 'Cho hơi đi ra đằng mũi.'), VOICE] },
    N: { steps: [s('contact', 'Chạm đầu lưỡi vào lợi sau răng trên.'), s('nose', 'Cho hơi đi ra đằng mũi.'), VOICE], slip: 'Cuối từ, người Việt hay đọc lẫn /n/ và /ŋ/: giữ đầu lưỡi ở lợi.' },
    NG: { steps: [s('contact', 'Nâng cuống lưỡi chạm vòm mềm.'), s('nose', 'Cho hơi đi ra đằng mũi.'), s('tongue', 'Giữ nguyên, đừng bật thêm /g/.')], slip: 'Người Việt hay thêm /k/ (sing thành "sinh-k") hoặc đổi thành /n/.' },
    L: { steps: [s('contact', 'Chạm đầu lưỡi vào lợi sau răng trên.'), s('tongue', 'Giữ đầu lưỡi ở đó.'), s('air', 'Cho hơi đi ra hai bên lưỡi.')], slip: 'Ở cuối từ (feel, school) người Việt hay bỏ /l/: phải chạm đầu lưỡi lên lợi.' },
    R: { steps: [s('tongue', 'Cong đầu lưỡi lên và lùi vào trong.'), s('tongue', 'Giữ lưỡi không chạm vòm miệng.'), s('lips', 'Chu môi tròn nhẹ.')], slip: 'Người Việt hay rung lưỡi như "r" tiếng Việt, hoặc nói thành /z/: lưỡi không chạm gì.' },
    HH: { steps: [s('jaw', 'Mở miệng tự nhiên.'), s('air', 'Đẩy hơi nhẹ từ cổ họng, như hà hơi lên kính.'), NO_VOICE] },
    W: { steps: [s('lips', 'Chu môi tròn và nhỏ.'), s('tongue', 'Nâng cuống lưỡi lên.'), s('lips', 'Mở môi ra nhanh sang nguyên âm sau.')], slip: 'Đừng nói thành /v/: môi tròn, răng không chạm môi.' },
    Y: { steps: [s('tongue', 'Nâng lưỡi cao về phía trước như /iː/.'), s('lips', 'Kéo môi dẹt.'), s('tongue', 'Trượt nhanh sang nguyên âm sau.')] },
    IY: { steps: [s('lips', 'Kéo môi dẹt như đang cười.'), s('tongue', 'Nâng lưỡi cao về phía trước.'), s('voice', 'Giữ âm dài.')], slip: 'Người Việt hay đọc ngắn như /ɪ/ (sheep thành "ship"): kéo dài ra.' },
    IH: { steps: [s('tongue', 'Nâng lưỡi cao nhưng thả lỏng.'), s('jaw', 'Hạ hàm xuống một chút so với /iː/.'), s('voice', 'Nói ngắn và gọn.')], slip: 'Người Việt hay kéo dài thành /iː/ (ship thành "sheep").' },
    EH: { steps: [s('jaw', 'Mở miệng vừa.'), s('tongue', 'Để lưỡi ở giữa.'), s('voice', 'Nói ngắn, như "e" tiếng Việt.')] },
    EY: { steps: [s('jaw', 'Mở miệng vừa như /e/.'), s('tongue', 'Nâng lưỡi lên dần về /ɪ/.'), s('voice', 'Trượt liền hai âm "ê-i".')] },
    AE: { steps: [s('jaw', 'Hạ hàm xuống thật thấp.'), s('lips', 'Kéo môi sang hai bên.'), s('tongue', 'Đẩy lưỡi thấp ra phía trước.')], slip: 'Người Việt hay đọc thành /e/ (bad thành "bed"): mở miệng rộng hơn.' },
    AH: { steps: [s('jaw', 'Mở miệng vừa, thả lỏng.'), s('tongue', 'Để lưỡi nằm thấp ở giữa.'), s('voice', 'Nói ngắn, như "ă".')] },
    AA: { steps: [s('jaw', 'Mở miệng rộng.'), s('tongue', 'Để lưỡi nằm thấp, lùi ra sau.'), s('voice', 'Giữ âm "a" dài.')] },
    AY: { steps: [s('jaw', 'Mở miệng rộng như "a".'), s('tongue', 'Nâng lưỡi dần lên.'), s('voice', 'Trượt liền "a-i".')] },
    AW: { steps: [s('jaw', 'Mở miệng rộng như "a".'), s('lips', 'Khép dần môi thành tròn.'), s('voice', 'Trượt liền "a-u".')] },
    AO: { steps: [s('lips', 'Tròn môi.'), s('jaw', 'Mở miệng vừa.'), s('tongue', 'Lùi lưỡi về sau.')] },
    OW: { steps: [s('lips', 'Tròn môi vừa.'), s('lips', 'Khép môi dần nhỏ lại.'), s('voice', 'Trượt liền "ô-u".')], slip: 'Người Việt hay đọc thành "ô" phẳng: kết thúc bằng môi tròn nhỏ.' },
    OY: { steps: [s('lips', 'Tròn môi như "o".'), s('tongue', 'Nâng lưỡi lên phía trước.'), s('voice', 'Trượt liền "o-i".')] },
    UH: { steps: [s('lips', 'Tròn môi nhẹ.'), s('tongue', 'Nâng lưỡi phía sau, thả lỏng.'), s('voice', 'Nói ngắn.')], slip: 'Người Việt hay kéo dài thành /uː/ (full thành "fool").' },
    UW: { steps: [s('lips', 'Chu môi tròn.'), s('tongue', 'Nâng cuống lưỡi cao.'), s('voice', 'Giữ âm dài.')] },
    ER: { steps: [s('tongue', 'Cong đầu lưỡi lên, không chạm vòm.'), s('lips', 'Tròn môi nhẹ.'), s('voice', 'Giữ âm "ơ" có cong lưỡi.')], slip: 'Người Việt hay đọc thành "ơ" không cong lưỡi.' },
};

/** The guide for `phone` (ARPAbet, stress ignored), or null when none is written. */
export function guideFor(phone: string): SoundGuide | null {
    return GUIDES[bare(phone)] ?? null;
}

export const GUIDED_PHONES = Object.keys(GUIDES);
