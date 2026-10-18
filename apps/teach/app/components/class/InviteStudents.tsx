'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { joinLink, type Board } from '@cortex/classroom';
import { Button, Card, CardTitle, CopyField, ErrorNote, errorText } from '../ui';
import { api } from '../../lib/supabase';
import { modulesOf } from '../../modules';

/**
 * How students get in: a link that opens one of the class's apps (signs in,
 * joins), or the code typed in any of them. One membership serves every app.
 */
export default function InviteStudents({ board, onChanged, highlight }: { board: Board; onChanged: () => void; highlight?: boolean }) {
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const code = board.class.code;
    const first = modulesOf(board).find((m) => m.appUrl);
    return (
        <Card tone={highlight ? 'accent' : undefined}>
            <CardTitle>{highlight ? 'Lớp đã sẵn sàng: mời học viên vào' : 'Mời học viên'}</CardTitle>
            <div className="space-y-3">
                {first && (
                    <div>
                        <p className="mb-1 text-sm text-ink-2">Gửi link này vào nhóm lớp (Zalo, Messenger):</p>
                        <CopyField value={joinLink(first.appUrl, code)} label="Chép link mời" />
                    </div>
                )}
                <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm text-ink-2">
                        hoặc mã lớp <b className="font-mono text-lg tracking-[0.2em] text-ink">{code}</b> nhập ở mục Lớp học của {modulesOf(board).map((m) => m.core.name).join(' hoặc ')}
                    </p>
                    <Button
                        kind="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={async () => {
                            if (!window.confirm('Đổi mã? Link và mã cũ sẽ ngừng hoạt động; học viên đã vào lớp vẫn giữ nguyên.')) return;
                            setBusy(true);
                            try {
                                await api.newCode(board.class.id);
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
