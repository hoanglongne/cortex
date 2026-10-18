'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { joinLink } from '@cortex/lexica-classes';
import { Button, Card, CardTitle, CopyField, ErrorNote, errorText } from '../ui';
import { api } from '../../lib/supabase';
import { LEXICA_URL } from '../../lib/config';

/** How students get in: a link (opens Lexica, signs in, joins) or the code typed in Lexica → Lớp học. */
export default function InviteStudents({ classId, code, onChanged, highlight }: { classId: string; code: string; onChanged: () => void; highlight?: boolean }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    return (
        <Card tone={highlight ? 'accent' : undefined}>
            <CardTitle>{highlight ? 'Lớp đã sẵn sàng: mời học viên vào' : 'Mời học viên'}</CardTitle>
            <div className="space-y-3">
                <div>
                    <p className="mb-1 text-sm text-ink-2">Gửi link này vào nhóm lớp (Zalo, Messenger):</p>
                    <CopyField value={joinLink(LEXICA_URL, code)} label="Chép link mời" />
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm text-ink-2">
                        hoặc mã lớp <b className="font-mono text-lg tracking-[0.2em] text-ink">{code}</b> nhập ở Lexica → Lớp học
                    </p>
                    <Button
                        kind="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={async () => {
                            if (!window.confirm('Đổi mã? Link và mã cũ sẽ ngừng hoạt động; học viên đã vào lớp vẫn giữ nguyên.')) return;
                            setBusy(true);
                            try {
                                await api.newCode(classId);
                                onChanged();
                            } catch (e) {
                                setError(errorText(e));
                            } finally {
                                setBusy(false);
                            }
                        }}
                    >
                        <RefreshCw className="h-3.5 w-3.5" /> Đổi mã
                    </Button>
                </div>
                <ErrorNote error={error} />
            </div>
        </Card>
    );
}
