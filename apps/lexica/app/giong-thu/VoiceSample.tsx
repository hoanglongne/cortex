'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Mic, Square } from 'lucide-react';
import { startRecording } from '../lib/pronunciation/speech';

/**
 * "Giọng bạn" V0 (issue #145, docs/LEXICA_WOW_PLAN.md §3): one voice sample
 * of about a minute for the offline test of voice conversion. The script mixes
 * Vietnamese and short English sentences, and ends with one random check
 * sentence (proof that a person is reading now, not playing someone's file).
 * Nothing is uploaded: the learner downloads the WAV and sends it themselves.
 */
const VI = [
    'Xin chào, mình đang ghi một đoạn giọng nói để thử tính năng mới của Lexica.',
    'Mỗi sáng mình thường uống một ly cà phê, rồi đi làm bằng xe máy.',
    'Cuối tuần mình hay gặp bạn bè, ăn một bữa thật ngon và nói chuyện thật lâu.',
];
const EN = [
    'Good morning, how are you today?',
    'I usually take the bus to work, but today I walked.',
    'Could you send me the file before lunch?',
    'My favourite place in the city is a small coffee shop near the river.',
    'Learning a new language takes time, but it is worth it.',
    'Thank you so much, I really appreciate your help.',
];
const CHECK_WORDS = ['seven', 'orange', 'window', 'silver', 'garden', 'thirty', 'yellow', 'pencil', 'monday', 'eleven', 'kitchen', 'purple'];
const MIN_SECONDS = 45;
const MAX_SECONDS = 150;

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
            if (took < MIN_SECONDS) return setError(`Bản ghi mới ${Math.round(took)} giây. Đọc hết đoạn, chậm và rõ, khoảng một phút nhé.`);
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
                    Dùng để thử tính năng “Giọng của tôi”: câu mẫu luyện nói đọc bằng giọng của chính bạn, phát âm chuẩn. Ngồi chỗ yên tĩnh, cầm máy cách miệng một gang tay, đọc chậm và rõ cả đoạn dưới đây (khoảng một phút). Bản ghi chỉ nằm trong máy bạn cho tới khi bạn tự gửi.
                </p>

                <section className="lx-hard space-y-3 rounded-[22px] bg-surface p-5 text-lg leading-relaxed text-ink">
                    {VI.map((t) => (
                        <p key={t}>{t}</p>
                    ))}
                    <hr className="border-line" />
                    {EN.map((t) => (
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
