'use client';

import { useCallback, useEffect, useState } from 'react';
import { Copy, KeyRound } from 'lucide-react';
import { api, errorText } from '../lib/api';
import type { CaptureToken } from '../lib/types';
import { Badge, Button, Card, ErrorNote, Input } from '../components/ui';

/** Tokens for the browser extension and the iOS Shortcut (POST /capture). */
export function CaptureTokens() {
    const [tokens, setTokens] = useState<CaptureToken[]>([]);
    const [name, setName] = useState('');
    const [fresh, setFresh] = useState<{ name: string; token: string } | null>(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        try {
            setTokens(await api<CaptureToken[]>('/capture-tokens'));
        } catch (err) {
            setError(errorText(err));
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const create = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setCopied(false);
        try {
            const r = await api<CaptureToken & { token: string }>('/capture-tokens', { method: 'POST', body: { name: name.trim() } });
            setFresh({ name: r.name, token: r.token });
            setName('');
            await load();
        } catch (err) {
            setError(errorText(err));
        }
    };

    const revoke = async (t: CaptureToken) => {
        if (!window.confirm(`Thu hồi mã "${t.name}"? Thiết bị đang dùng mã này sẽ không gửi bài được nữa.`)) return;
        setError('');
        try {
            await api(`/capture-tokens/${t.id}/revoke`, { method: 'POST' });
            await load();
        } catch (err) {
            setError(errorText(err));
        }
    };

    const copy = async () => {
        if (!fresh) return;
        await navigator.clipboard.writeText(fresh.token);
        setCopied(true);
    };

    return (
        <Card className="flex flex-col gap-4">
            <div id="capture" className="scroll-mt-20">
                <h2 className="font-bold">Mã gửi bài</h2>
                <p className="text-sm text-muted">
                    Dùng cho extension Chrome và Phím tắt iOS để gửi bài vào Radar. Mỗi thiết bị một mã; mã chỉ thêm được bài, không đọc hay sửa được gì khác. Mất máy thì thu hồi mã đó.
                </p>
            </div>
            <form onSubmit={create} className="flex flex-wrap gap-2">
                <Input required maxLength={60} value={name} onChange={e => setName(e.target.value)} placeholder="Tên thiết bị, ví dụ Chrome laptop" className="flex-1 min-w-48" />
                <Button variant="primary" disabled={!name.trim()}>
                    <span className="flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4" />
                        Tạo mã
                    </span>
                </Button>
            </form>
            {fresh && (
                <div className="rounded-xl border border-accent/40 bg-accent/10 p-3 flex flex-col gap-2">
                    <p className="text-sm text-ink-2">
                        Mã của <b>{fresh.name}</b>. Chỉ hiện một lần: chép vào extension hoặc Phím tắt ngay, đừng gửi qua chat.
                    </p>
                    <div className="flex gap-2">
                        <code className="flex-1 min-w-0 truncate rounded-lg bg-surface-2 px-3 py-2 font-mono text-xs">{fresh.token}</code>
                        <Button onClick={copy}>
                            <span className="flex items-center gap-1.5">
                                <Copy className="w-4 h-4" />
                                {copied ? 'Đã chép' : 'Chép'}
                            </span>
                        </Button>
                    </div>
                </div>
            )}
            <ErrorNote error={error} />
            <div className="flex flex-col divide-y divide-line">
                {tokens.map(t => (
                    <div key={t.id} className="py-2 flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium">{t.name}</span>
                        {t.revoked_at ? <Badge tone="danger">đã thu hồi</Badge> : <Badge tone="accent">đang dùng</Badge>}
                        <span className="font-mono text-xs text-subtle">
                            tạo {new Date(t.created_at).toLocaleDateString('vi-VN')} · {t.last_used_at ? `dùng lần cuối ${new Date(t.last_used_at).toLocaleString('vi-VN')}` : 'chưa dùng'}
                        </span>
                        {!t.revoked_at && (
                            <Button variant="danger" className="ml-auto h-8" onClick={() => revoke(t)}>
                                Thu hồi
                            </Button>
                        )}
                    </div>
                ))}
                {tokens.length === 0 && <p className="text-sm text-muted">Chưa có mã nào.</p>}
            </div>
        </Card>
    );
}
