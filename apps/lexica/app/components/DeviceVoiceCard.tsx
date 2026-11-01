'use client';

import { useEffect, useState } from 'react';
import { Cpu } from 'lucide-react';
import { deviceVoiceStatus, disableDeviceVoice, enableDeviceVoice, environment, onDeviceVoiceChange, resumeDeviceVoice } from '../lib/audio/deviceVoice';
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
                ? 'Đang thử tốc độ trên máy bạn…'
                : state === 'unfit'
                  ? `Máy này chưa đủ nhanh (cần tạo nhanh hơn thời gian nghe, máy bạn ${rtf?.toFixed(1)} lần). Lexica vẫn dùng giọng tạo sẵn và giọng máy chủ.`
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
            </p>
            {config && state !== 'unavailable' && (
                <button
                    disabled={busy}
                    onClick={async () => {
                        if (state === 'ready') {
                            disableDeviceVoice();
                            return;
                        }
                        const r = await enableDeviceVoice();
                        capture('device_voice', { result: r, device: config.device });
                    }}
                    className={`shrink-0 h-9 rounded-lg px-3 text-sm font-semibold disabled:opacity-50 ${state === 'ready' ? 'border border-line text-ink-2' : 'bg-accent text-on-accent'}`}
                >
                    {state === 'ready' ? 'Tắt' : busy ? 'Đang xử lý' : 'Bật'}
                </button>
            )}
        </section>
    );
}
