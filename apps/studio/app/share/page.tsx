'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, errorText } from '../lib/api';
import { parseShared } from '../lib/capture';
import type { Capture } from '../lib/types';
import { Button, Card, ErrorNote, Input, Label, Textarea } from '../components/ui';

/** Target of the Android share sheet (see app/manifest.ts). */
export default function SharePage() {
    return (
        <Suspense fallback={null}>
            <ShareForm />
        </Suspense>
    );
}

function ShareForm() {
    const params = useSearchParams();
    const [initial] = useState(() => parseShared({ title: params.get('title'), text: params.get('text'), url: params.get('url') }));
    const [url, setUrl] = useState(initial.url);
    const [text, setText] = useState(initial.text);
    const [note, setNote] = useState('');
    const [busy, setBusy] = useState(false);
    const [saved, setSaved] = useState<Capture | null>(null);
    const [error, setError] = useState('');

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
            setSaved(
                await api<Capture>('/captures', {
                    method: 'POST',
                    body: { url: url.trim() || undefined, text: text.trim() || undefined, note: note.trim() || undefined },
                }),
            );
        } catch (err) {
            setError(errorText(err));
        } finally {
            setBusy(false);
        }
    };

    if (saved) {
        return (
            <Card className="max-w-lg mx-auto flex flex-col gap-3">
                <h1 className="text-lg font-bold">Đã thêm vào Radar</h1>
                <p className="text-sm text-muted">{saved.body ?? saved.phrase}</p>
                <div className="flex gap-2">
                    <Link href="/radar" className="h-10 px-4 rounded-xl text-sm bg-accent text-on-accent font-bold flex items-center">
                        Mở Radar
                    </Link>
                    <Button onClick={() => window.history.length > 1 ? window.history.back() : window.close()}>Xong</Button>
                </div>
            </Card>
        );
    }

    return (
        <Card className="max-w-lg mx-auto">
            <form onSubmit={submit} className="flex flex-col gap-3">
                <h1 className="text-lg font-bold">Gửi vào Radar</h1>
                <label className="flex flex-col gap-1.5">
                    <Label>Link</Label>
                    <Input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.threads.com/@…/post/…" />
                </label>
                <label className="flex flex-col gap-1.5">
                    <Label>Nội dung (để trống: Studio tự đọc từ link)</Label>
                    <Textarea rows={3} maxLength={2000} value={text} onChange={e => setText(e.target.value)} />
                </label>
                <label className="flex flex-col gap-1.5">
                    <Label>Ghi chú (tuỳ chọn)</Label>
                    <Textarea rows={2} maxLength={500} value={note} onChange={e => setNote(e.target.value)} placeholder="Vì sao trend, ai hay nói…" autoFocus />
                </label>
                <ErrorNote error={error} />
                <Button variant="primary" disabled={busy || (!url.trim() && !text.trim())}>
                    {busy ? 'Đang gửi…' : 'Gửi'}
                </Button>
            </form>
        </Card>
    );
}
