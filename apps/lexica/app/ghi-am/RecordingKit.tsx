'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Download, Mic, Play, RotateCcw, Square } from 'lucide-react';
import { KIT_WORDS } from '../data/recordingKit';
import { fileName, manifestCsv, takesOf, testerCode, zip, type Meta } from '../lib/pronunciation/recordingKit';
import { startRecording } from '../lib/pronunciation/speech';
import { localDate } from '../lib/engagement/ghost';

const TAKES = takesOf(KIT_WORDS);
/** A take stops by itself after this much quiet once a voice was heard, or at MAX_MS. */
const QUIET_MS = 900;
const MAX_MS = 5000;

/**
 * Recording kit for checking the pronunciation model on Vietnamese voices:
 * a name, then 40 takes one by one (each word right, then wrong on purpose),
 * then one zip to send back. Recordings stay in this tab until downloaded.
 */
export default function RecordingKit() {
    const [meta, setMeta] = useState<Meta | null>(null);
    const [wavs, setWavs] = useState<(Blob | null)[]>(() => TAKES.map(() => null));
    const [at, setAt] = useState(0);
    const done = wavs.filter(Boolean).length;

    if (!meta) return <Start onStart={setMeta} />;
    if (at >= TAKES.length) return <Finish meta={meta} wavs={wavs} onBack={() => setAt(TAKES.length - 1)} />;

    return (
        <Frame>
            <p className="font-mono text-xs text-muted">
                Lượt {at + 1}/{TAKES.length} · đã ghi {done}
            </p>
            <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div className="h-full bg-accent" style={{ width: `${(done / TAKES.length) * 100}%` }} />
            </div>
            <TakeCard
                key={at}
                index={at}
                wav={wavs[at]}
                onSaved={(wav) => setWavs((list) => list.map((x, i) => (i === at ? wav : x)))}
                onNext={() => setAt((n) => n + 1)}
                onBack={at > 0 ? () => setAt((n) => n - 1) : undefined}
            />
        </Frame>
    );
}

function Frame({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-bg px-4 py-8">
            <div className="max-w-md mx-auto space-y-4">
                <p className="text-ink font-bold">Ghi âm kiểm định · Lexica</p>
                {children}
            </div>
        </div>
    );
}

function Start({ onStart }: { onStart: (m: Meta) => void }) {
    const [name, setName] = useState('');
    const [device, setDevice] = useState<'dien-thoai' | 'laptop'>('dien-thoai');
    const [headset, setHeadset] = useState(false);
    const chip = (on: boolean) => `h-10 px-4 rounded-xl border text-sm ${on ? 'border-accent bg-accent/10 text-ink' : 'border-line text-ink-2'}`;
    return (
        <Frame>
            <section className="rounded-2xl border border-line bg-surface p-4 space-y-3 text-sm text-ink-2">
                <p className="text-ink font-semibold">Cảm ơn bạn giúp Lexica chấm phát âm tốt hơn!</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Có 20 từ. Mỗi từ đọc 2 lần: một lần đọc đúng, một lần đọc sai theo hướng dẫn. Tổng 40 lượt, khoảng 10 phút.</li>
                    <li>Ngồi chỗ yên tĩnh, cầm máy cách miệng khoảng một gang tay, đọc to rõ như bình thường.</li>
                    <li>Mỗi lượt: bấm nút micro, đọc, máy tự dừng. Nghe lại, chưa ổn thì ghi lại.</li>
                    <li>Xong thì bấm “Tải file về” và gửi file .zip cho đội Lexica. Đừng tắt trang giữa chừng: bản ghi chỉ nằm trong trang này.</li>
                </ul>
            </section>
            <label className="block space-y-1.5">
                <span className="text-sm text-ink-2">Tên hoặc biệt danh (để phân biệt các bạn ghi)</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 rounded-xl border border-line bg-surface px-3 text-ink" placeholder="Ví dụ: Lan" />
            </label>
            <div className="space-y-1.5">
                <p className="text-sm text-ink-2">Bạn ghi bằng</p>
                <div className="flex gap-2">
                    <button aria-pressed={device === 'dien-thoai'} onClick={() => setDevice('dien-thoai')} className={chip(device === 'dien-thoai')}>
                        Điện thoại
                    </button>
                    <button aria-pressed={device === 'laptop'} onClick={() => setDevice('laptop')} className={chip(device === 'laptop')}>
                        Laptop
                    </button>
                    <button aria-pressed={headset} onClick={() => setHeadset(!headset)} className={chip(headset)}>
                        Có tai nghe mic
                    </button>
                </div>
            </div>
            <button disabled={!name.trim()} onClick={() => onStart({ tester: testerCode(name), device, headset, date: localDate() })} className="w-full h-12 rounded-xl bg-accent text-on-accent font-bold disabled:opacity-40">
                Bắt đầu
            </button>
        </Frame>
    );
}

function TakeCard({ index, wav, onSaved, onNext, onBack }: { index: number; wav: Blob | null; onSaved: (wav: Blob) => void; onNext: () => void; onBack?: () => void }) {
    const take = TAKES[index];
    const [state, setState] = useState<'idle' | 'rec' | 'error'>('idle');
    const [error, setError] = useState('');
    const stopRef = useRef<(() => void) | null>(null);
    const url = useBlobUrl(wav);

    useEffect(() => () => stopRef.current?.(), []);

    const record = async () => {
        setError('');
        let stream: MediaStream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true } });
        } catch {
            setState('error');
            setError('Không mở được micro. Cho phép trang dùng micro rồi thử lại.');
            return;
        }
        const rec = startRecording(stream);
        setState('rec');
        const started = performance.now();
        let timer = 0;
        const finish = () => {
            window.clearInterval(timer);
            stopRef.current = null;
            stream.getTracks().forEach((t) => t.stop());
            const out = rec.stop();
            setState('idle');
            if (!out.wav || !out.voiced) {
                setError('Chưa nghe thấy tiếng. Đọc to hơn một chút rồi ghi lại nhé.');
                return;
            }
            onSaved(out.wav);
        };
        stopRef.current = finish;
        timer = window.setInterval(() => {
            if (rec.silentAfterVoice(QUIET_MS) || performance.now() - started > MAX_MS) finish();
        }, 100);
    };

    return (
        <section className="rounded-2xl border border-line bg-surface p-5 space-y-4">
            {take.kind === 'dung' ? (
                <>
                    <p className="text-sm text-muted">Đọc ĐÚNG từ này:</p>
                    <p className="text-4xl font-bold text-ink">{take.word.word}</p>
                </>
            ) : (
                <>
                    <p className="text-sm text-warning font-semibold">Đọc SAI có chủ ý</p>
                    <p className="text-ink">
                        Từ <b>{take.word.word}</b>: {take.word.wrong.how}
                    </p>
                    <p className="text-4xl font-bold text-ink">“{take.word.wrong.say}”</p>
                </>
            )}
            <div className="flex items-center gap-3">
                {state === 'rec' ? (
                    <button onClick={() => stopRef.current?.()} className="h-14 px-5 rounded-2xl bg-danger text-bg font-bold flex items-center gap-2" aria-label="Dừng ghi">
                        <Square className="w-5 h-5" /> Đang ghi… bấm để dừng
                    </button>
                ) : (
                    <button onClick={() => void record()} className="h-14 px-5 rounded-2xl bg-accent text-on-accent font-bold flex items-center gap-2">
                        {wav ? <RotateCcw className="w-5 h-5" /> : <Mic className="w-5 h-5" />} {wav ? 'Ghi lại' : 'Bấm và đọc'}
                    </button>
                )}
                {url && state !== 'rec' && (
                    <button onClick={() => void new Audio(url).play()} className="h-14 px-4 rounded-2xl border border-line text-ink flex items-center gap-2">
                        <Play className="w-5 h-5" /> Nghe lại
                    </button>
                )}
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex gap-2 pt-2">
                {onBack && (
                    <button onClick={onBack} className="h-11 px-4 rounded-xl border border-line text-ink-2">
                        Quay lại
                    </button>
                )}
                <button onClick={onNext} disabled={!wav || state === 'rec'} className="flex-1 h-11 rounded-xl bg-ink text-bg font-bold disabled:opacity-30">
                    {index === TAKES.length - 1 ? 'Xong' : 'Tiếp'}
                </button>
            </div>
            <p className="text-xs text-subtle">File: {fileName(take)}</p>
        </section>
    );
}

function Finish({ meta, wavs, onBack }: { meta: Meta; wavs: (Blob | null)[]; onBack: () => void }) {
    const recorded = TAKES.filter((_, i) => wavs[i]);
    const [busy, setBusy] = useState(false);
    const download = async () => {
        setBusy(true);
        const files = await Promise.all(TAKES.flatMap((t, i) => (wavs[i] ? [wavs[i]!.arrayBuffer().then((b) => ({ name: fileName(t), data: new Uint8Array(b) }))] : [])));
        const manifest = new TextEncoder().encode(manifestCsv(recorded, meta));
        const blob = new Blob([zip([{ name: 'manifest.csv', data: manifest }, ...files]) as BlobPart], { type: 'application/zip' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `lexica-ghiam-${meta.tester}-${meta.date}.zip`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
        setBusy(false);
    };
    return (
        <Frame>
            <section className="rounded-2xl border border-line bg-surface p-5 space-y-3">
                <p className="flex items-center gap-2 text-ink font-semibold">
                    <Check className="w-5 h-5 text-accent" /> Đã ghi {recorded.length}/{TAKES.length} lượt
                </p>
                <p className="text-sm text-ink-2">Bấm tải về, rồi gửi file .zip cho đội Lexica (Zalo, email hoặc Google Drive). File chỉ chứa giọng đọc 20 từ này, tên bạn nhập và loại máy.</p>
                <button onClick={() => void download()} disabled={busy} className="w-full h-12 rounded-xl bg-accent text-on-accent font-bold flex items-center justify-center gap-2 disabled:opacity-40">
                    <Download className="w-5 h-5" /> Tải file về
                </button>
                <button onClick={onBack} className="w-full h-11 rounded-xl border border-line text-ink-2">
                    Quay lại sửa
                </button>
            </section>
        </Frame>
    );
}

function useBlobUrl(blob: Blob | null): string | null {
    const [url, setUrl] = useState<string | null>(null);
    useEffect(() => {
        if (!blob) return;
        const u = URL.createObjectURL(blob);
        const t = setTimeout(() => setUrl(u), 0);
        return () => {
            clearTimeout(t);
            URL.revokeObjectURL(u);
        };
    }, [blob]);
    return blob ? url : null;
}
