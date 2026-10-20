/**
 * The 20 words of the Vietnamese-voice recording kit (docs/LEXICA_PRONUNCIATION_RECORDING.md).
 * Each word is read twice: once right, once wrong on purpose in one known
 * way, so the answer key is exact. 18 words test sounds (the error groups
 * Vietnamese learners make most); 2 test stress, for level 3 later.
 *
 * `phones` is CMUdict with stress, as the scoring model reads it. `wrongAt`
 * holds the indexes in `phones` the wrong take changes.
 */
export interface KitWord {
    word: string;
    phones: string[];
    group: string;
    /** What to say for the wrong take, and how to say it. */
    wrong: { say: string; how: string; wrongAt: number[] };
}

const w = (word: string, phones: string, group: string, say: string, how: string, wrongAt: number[]): KitWord => ({ word, phones: phones.split(' '), group, wrong: { say, how, wrongAt } });

export const KIT_WORDS: KitWord[] = [
    w('light', 'L AY1 T', 'final_consonant', 'lie', 'Bỏ âm /t/ cuối, đọc thành “lie”.', [2]),
    w('bike', 'B AY1 K', 'final_consonant', 'buy', 'Bỏ âm /k/ cuối, đọc thành “buy”.', [2]),
    w('rice', 'R AY1 S', 'final_consonant', 'rye', 'Bỏ âm /s/ cuối, đọc thành “rye”.', [2]),
    w('wide', 'W AY1 D', 'final_consonant', 'why', 'Bỏ âm /d/ cuối, đọc thành “why”.', [2]),
    w('bed', 'B EH1 D', 'final_voicing', 'bet', 'Đổi /d/ cuối thành /t/, đọc thành “bet”.', [2]),
    w('think', 'TH IH1 NG K', 'th', 'sink', 'Đổi /θ/ (th) thành /s/, đọc thành “sink”.', [0]),
    w('three', 'TH R IY1', 'th', 'tree', 'Đổi /θ/ (th) thành /t/, đọc thành “tree”.', [0]),
    w('play', 'P L EY1', 'cluster', 'pay', 'Bỏ âm /l/ trong cụm “pl”, đọc thành “pay”.', [1]),
    w('glass', 'G L AE1 S', 'cluster', 'gas', 'Bỏ âm /l/ trong cụm “gl”, đọc thành “gas”.', [1]),
    w('walked', 'W AO1 K T', 'ending', 'walk', 'Bỏ đuôi -ed (/t/), đọc thành “walk”.', [3]),
    w('cats', 'K AE1 T S', 'ending', 'cat', 'Bỏ đuôi -s, đọc thành “cat”.', [3]),
    w('sheep', 'SH IY1 P', 'long_short', 'ship', 'Đọc /iː/ dài thành /ɪ/ ngắn, thành “ship”.', [1]),
    w('leave', 'L IY1 V', 'long_short', 'live', 'Đọc /iː/ dài thành /ɪ/ ngắn, thành “live” (như “I live here”).', [1]),
    w('cheap', 'CH IY1 P', 'ch_j', 'sheep', 'Đổi /tʃ/ (ch) thành /ʃ/ (sh), đọc thành “sheep”.', [0]),
    w('thing', 'TH IH1 NG', 'final_ng', 'thin', 'Đổi /ŋ/ cuối thành /n/, đọc thành “thin”.', [2]),
    w('feel', 'F IY1 L', 'final_l', 'fee', 'Bỏ âm /l/ cuối, đọc thành “fee”.', [2]),
    w('zoo', 'Z UW1', 'initial_z', 'sue', 'Đổi /z/ đầu thành /s/, đọc thành “sue”.', [0]),
    w('bad', 'B AE1 D', 'ae_e', 'bed', 'Đổi /æ/ thành /e/, đọc thành “bed”.', [1]),
    w('abundant', 'AH0 B AH1 N D AH0 N T', 'stress', 'A-bun-dant', 'Nhấn âm đầu: A-bun-dant (đúng là a-BUN-dant).', []),
    w('develop', 'D IH0 V EH1 L AH0 P', 'stress', 'DE-ve-lop', 'Nhấn âm đầu: DE-ve-lop (đúng là de-VEL-op).', []),
];
