'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Mic, Square } from 'lucide-react';
import { startRecording } from '../lib/pronunciation/speech';

/**
 * "Giọng bạn" V0 (issue #145, docs/LEXICA_WOW_PLAN.md §3): one voice sample
 * of three to four minutes for the offline test of voice conversion: English
 * only (the converted clips are English), and one random check
 * sentence (proof that a person is reading now, not playing someone's file).
 * Nothing is uploaded: the learner downloads the WAV and sends it themselves.
 */
/** About four minutes of English read slowly: none of these sentences are the ones converted in the test. */
const SCRIPT = [
    "She did not know anyone, and the building was not familiar to her yet. At nine o'clock, her manager showed her around. Mai tried to remember every name, but she soon noticed that people were patient with her. She learned how to use the coffee machine quickly, and by lunch she knew where all the meeting rooms were.",
    "In the evening, she called her mother. He wants good quality food, but he does not want to spend more than that. Last week he made a small mistake. He forgot to check his list, and at home he found a lack of eggs for breakfast.",
    "Now his list is on his phone, and keeping to his budget is much easier. Lan had planned to take her little brother to the park, but now they had to stay inside. Lan took out some paper and colored pencils. When their mother came home, she could not believe how quiet the afternoon had been.",
    "Minh wanted to start running, but he felt anxious about it. He had not exercised for years, and he was afraid that people in the park would laugh at him. Do not try to improve too quickly. In fact, an older man in the park now waves to him every morning, and sometimes they run together.",
    "When Thu joined a small design studio, she noticed that the team often missed deadlines. Her manager was not sure at first, but he agreed to implement it for one month. The meetings were short and consistent. People knew what was most urgent, so they stopped losing time on small tasks.",
    "The team became more efficient, and the number of late projects fell by half. At the end of the month, the manager admitted that the change had been worthwhile. It also helps to study at a particular time, for example on the bus or right after dinner. Then it becomes part of the day rather than an extra task you have to remember.",
    "Ten minutes does not sound like a lot, but it is sufficient if you do it every day. After three months, those minutes add up to more than fifteen hours of practice. When the Nguyen family moved into a new apartment building, they did not know any of their neighbors. Their son, Bao, was eager to make friends, but the building felt quiet and private.",
    "Then there was a problem with the water supply, and for two days the taps were dry. Tam, made a schedule so that everyone could collect water from the tank downstairs. He was calm and dependable, and people started talking to each other in the corridors. He saw that small acts of help have a strong influence on how people feel about a place.",
    "He also learned to be sensitive to his neighbors' needs. Tam carry his shopping every Saturday. Rent takes a large part of the budget, and one unexpected bill can upset the whole month. She cooks at home on weekdays, buys second-hand furniture and keeps a small emergency fund.",
];
const CHECK_WORDS = ['seven', 'orange', 'window', 'silver', 'garden', 'thirty', 'yellow', 'pencil', 'monday', 'eleven', 'kitchen', 'purple'];
const MIN_SECONDS = 150;
const MAX_SECONDS = 420;

function checkSentence(): string {
    const pick = () => CHECK_WORDS[Math.floor(Math.random() * CHECK_WORDS.length)];
    const a = pick();
    let b = pick();
    while (b === a) b = pick();
    return `My check words are ${a} and ${b}.`;
}

export default function VoiceSample() {
    const [check] = useState(checkSentence);
    const [state, setState] = useState<'idle' | 'rec' | 'error'>('idle');
    const [seconds, setSeconds] = useState(0);
    const [wav, setWav] = useState<Blob | null>(null);
    const [error, setError] = useState('');
    const stopRef = useRef<(() => void) | null>(null);
    const url = useBlobUrl(wav);

    useEffect(() => () => stopRef.current?.(), []);

    const record = async () => {
        setError('');
        setWav(null);
        let stream: MediaStream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true } });
        } catch {
            setState('error');
            setError('Không mở được micro. Cho phép trang dùng micro rồi thử lại.');
            return;
        }
        const rec = startRecording(stream);
        const started = performance.now();
        setSeconds(0);
        setState('rec');
        let timer = 0;
        const finish = () => {
            window.clearInterval(timer);
            stopRef.current = null;
            stream.getTracks().forEach((t) => t.stop());
            const out = rec.stop();
            const took = (performance.now() - started) / 1000;
            setState('idle');
            if (!out.wav || !out.voiced) return setError('Chưa nghe thấy tiếng. Đọc to hơn một chút rồi ghi lại nhé.');
            if (took < MIN_SECONDS) return setError(`Bản ghi mới ${Math.round(took)} giây. Đọc hết đoạn, chậm và rõ, khoảng 3–4 phút nhé.`);
            setWav(out.wav);
        };
        stopRef.current = finish;
        timer = window.setInterval(() => {
            const s = (performance.now() - started) / 1000;
            setSeconds(Math.floor(s));
            if (s > MAX_SECONDS) finish();
        }, 250);
    };

    const name = `giong-${new Date().toISOString().slice(0, 10)}.wav`;

    return (
        <div className="min-h-screen bg-bg px-4 py-6">
            <div className="mx-auto max-w-xl space-y-4">
                <h1 className="font-display text-2xl font-extrabold text-ink">Ghi mẫu giọng của bạn</h1>
                <p data-prose className="text-sm text-muted">
                    Dùng để thử tính năng “Giọng của tôi”: câu mẫu luyện nói đọc bằng giọng của chính bạn, phát âm chuẩn. Ngồi chỗ yên tĩnh, để micro gần miệng (khoảng 10–15 cm), đọc chậm, rõ và tự nhiên cả đoạn tiếng Anh dưới đây (khoảng 3–4 phút). Đọc vấp thì cứ đọc tiếp, không cần ghi lại. Bản ghi chỉ nằm trong máy bạn cho tới khi bạn tự gửi.
                </p>

                <section className="lx-hard space-y-3 rounded-[22px] bg-surface p-5 text-lg leading-relaxed text-ink">
                    {SCRIPT.map((t) => (
                        <p key={t} lang="en">{t}</p>
                    ))}
                    <hr className="border-line" />
                    <p lang="en" className="font-bold">{check}</p>
                </section>

                <div className="flex items-center gap-3">
                    {state === 'rec' ? (
                        <button onClick={() => stopRef.current?.()} className="lx-hard lx-press flex h-14 items-center gap-2 rounded-[18px] bg-ink px-5 font-extrabold text-bg">
                            <Square className="h-5 w-5" /> Xong ({seconds}s)
                        </button>
                    ) : (
                        <button onClick={() => void record()} className="lx-hard lx-press flex h-14 items-center gap-2 rounded-[18px] bg-accent px-5 font-extrabold text-on-accent">
                            <Mic className="h-5 w-5" /> {wav ? 'Ghi lại' : 'Bấm rồi đọc'}
                        </button>
                    )}
                    {state === 'rec' && <span className="text-sm text-muted">Đọc hết đoạn rồi bấm Xong</span>}
                </div>
                {error && <p className="text-sm text-danger">{error}</p>}

                {wav && url && (
                    <section className="lx-soft space-y-3 rounded-[18px] bg-surface p-4">
                        <p className="font-bold text-ink">Nghe lại</p>
                        <audio controls src={url} className="w-full" />
                        <a href={url} download={name} className="lx-hard lx-press inline-flex h-12 items-center gap-2 rounded-[16px] bg-accent px-4 font-extrabold text-on-accent">
                            <Download className="h-5 w-5" /> Tải file về
                        </a>
                        <p data-prose className="text-xs text-muted">Gửi file {name} cho đội Lexica. Câu kiểm tra của bạn: “{check}”.</p>
                    </section>
                )}
            </div>
        </div>
    );
}

function useBlobUrl(blob: Blob | null): string | null {
    const [url, setUrl] = useState<string | null>(null);
    useEffect(() => {
        if (!blob) return setUrl(null);
        const u = URL.createObjectURL(blob);
        setUrl(u);
        return () => URL.revokeObjectURL(u);
    }, [blob]);
    return url;
}
