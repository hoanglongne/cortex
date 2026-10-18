'use client';

import { useState } from 'react';
import { inviteLink } from '@cortex/classroom';
import { Button, CopyField, Drawer, ErrorNote, errorText, Field, inputClass } from './ui';
import { TEACH_URL } from '../lib/config';

/** Makes a one-use invitation link (7 days) and shows it to copy. */
export default function InviteDrawer({ open, onClose, make, title, hint }: { open: boolean; onClose: () => void; make: (note: string) => Promise<{ token: string }>; title: string; hint: string }) {
    const [note, setNote] = useState('');
    const [link, setLink] = useState('');
    const [error, setError] = useState('');
    return (
        <Drawer
            open={open}
            title={title}
            onClose={() => {
                setLink('');
                setNote('');
                onClose();
            }}
        >
            {link ? (
                <div className="space-y-3">
                    <p className="text-sm text-ink-2">{hint}</p>
                    <CopyField value={link} label="Chép link mời" />
                </div>
            ) : (
                <div className="space-y-4">
                    <Field label="Gửi cho ai (để bạn nhớ)" hint="Ví dụ “Cô Lan, lớp tối”. Người nhận không thấy dòng này.">
                        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={80} className={inputClass} />
                    </Field>
                    <ErrorNote error={error} />
                    <Button
                        className="w-full"
                        onClick={async () => {
                            try {
                                const r = await make(note);
                                setLink(inviteLink(TEACH_URL, r.token));
                            } catch (e) {
                                setError(errorText(e));
                            }
                        }}
                    >
                        Tạo link mời
                    </Button>
                </div>
            )}
        </Drawer>
    );
}
