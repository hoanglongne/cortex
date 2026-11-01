'use client';

import { useEffect, useState } from 'react';
import { Cpu } from 'lucide-react';
import { deviceVoiceStatus, disableDeviceVoice, enableDeviceVoice, environment, onDeviceVoiceChange, resumeDeviceVoice, synthOnDevice } from '../lib/audio/deviceVoice';
import { capture } from '../lib/productAnalytics';

/** Loads the voice quietly on a later visit, when the learner turned it on before. */
export function DeviceVoiceBoot() {
    useEffect(() => {
        const t = setTimeout(resumeDeviceVoice, 2500);
        return () => clearTimeout(t);
    }, []);
    return null;
}

/** "Giọng tự nhiên trên máy": off by default; a speed test on first use keeps it off on a device that cannot keep up. */
export default function DeviceVoiceCard() {
    const [, bump] = useState(0);
    const [tried, setTried] = useState('');
    const [config] = useState(() => (typeof window === 'undefined' ? null : environment()));
    useEffect(() => onDeviceVoiceChange(() => bump((n) => n + 1)), []);
    const { state, progress, rtf } = deviceVoiceStatus();
    const busy = state === 'loading' || state === 'testing';

    const line =
        state === 'ready'
            ? 'Đang bật. Câu chưa có sẵn được đọc bằng giọng tự nhiên tạo ngay trên máy bạn.'
            : state === 'loading'
              ? `Đang tải giọng${progress ? ` ${Math.round(progress)}%` : ''}…`
              : state === 'testing'
                ? 'Đang thử tốc độ trên máy bạn (tối đa khoảng 80 giây, có thể huỷ)…'
                : state === 'unfit'
                  ? `Máy này chưa đủ nhanh (${rtf === null ? 'quá chậm, không tạo nổi một câu ngắn trong 40 giây' : `cần tạo nhanh hơn thời gian nghe, máy bạn ${rtf.toFixed(1)} lần`}). Lexica vẫn dùng giọng tạo sẵn và giọng máy chủ.`
                  : state === 'error'
                    ? 'Chưa bật được, thử lại sau.'
                    : !config
                      ? 'Máy này chưa đủ mạnh để tạo giọng tại chỗ.'
                      : `Tạo giọng tự nhiên ngay trên máy: không phụ thuộc mạng và máy chủ. Tải một lần khoảng ${config.downloadMB} MB. Máy sẽ thử tốc độ ngay sau khi tải, không đủ nhanh thì tự để tắt.`;

    return (
        <section className="rounded-2xl border border-line bg-surface p-4 flex items-start justify-between gap-3">
            <p className="min-w-0 text-sm text-ink-2">
                <span className="flex items-center gap-1.5 font-semibold text-ink">
                    <Cpu className="w-4 h-4 text-accent" /> Giọng tự nhiên trên máy
                </span>
                <span className="mt-1 block text-xs text-muted">{line}</span>
                {state === 'ready' && (
                    <button
                        onClick={async () => {
                            setTried('Đang tạo…');
                            const text = `This sentence is made right here on your device, number ${Math.floor(Math.random() * 90 + 10)}.`;
                            const t = performance.now();
                            const blob = await synthOnDevice(text);
                            if (!blob) return setTried('Chưa tạo được, thử lại.');
                            setTried(`Tạo trong ${((performance.now() - t) / 1000).toFixed(1)} giây`);
                            const a = new Audio(URL.createObjectURL(blob));
                            void a.play().catch(() => undefined);
                        }}
                        className="mt-2 h-8 rounded-lg border border-line px-3 text-xs font-semibold text-ink-2"
                    >
                        Nghe thử
                    </button>
                )}
                {tried && state === 'ready' && <span className="ml-2 text-xs text-muted">{tried}</span>}
            </p>
            {config && state !== 'unavailable' && (
                <button
                    onClick={async () => {
                        if (state === 'ready' || busy) {
                            disableDeviceVoice();
                            return;
                        }
                        const r = await enableDeviceVoice();
                        capture('device_voice', { result: r, device: config.device });
                    }}
                    className={`shrink-0 h-9 rounded-lg px-3 text-sm font-semibold ${state === 'ready' || busy ? 'border border-line text-ink-2' : 'bg-accent text-on-accent'}`}
                >
                    {state === 'ready' ? 'Tắt' : busy ? 'Huỷ' : 'Bật'}
                </button>
            )}
        </section>
    );
}
