'use client';

import { useState } from 'react';
import { useLexicaStore } from '../store/lexicaStore';
import { localDate } from '../lib/engagement/ghost';
import { nudgeQuiet, paceNudge } from '../lib/journey/pace';

/**
 * Offers a lower pace when the last week mostly fell short of it. The pace only
 * changes when the learner accepts; either answer keeps it quiet for a week.
 */
export default function PaceNudge() {
    const path = useLexicaStore((s) => s.path);
    const setPath = useLexicaStore((s) => s.setPath);
    const history = useLexicaStore((s) => s.stepHistory);
    const answeredAt = useLexicaStore((s) => s.paceNudgeAt);
    const answer = useLexicaStore((s) => s.answerPaceNudge);
    const [today] = useState(() => localDate());
    if (!path || !path.pace || path.finished || nudgeQuiet(answeredAt, today)) return null;
    const nudge = paceNudge(path.pace, history, today);
    if (!nudge) return null;

    return (
        <div data-testid="pace-nudge" className="rounded-2xl border border-warning/40 bg-warning/5 p-4 space-y-3">
            <p className="text-sm text-ink">
                {nudge.shortDays}/7 ngày qua bạn chưa học đủ {path.pace} từ, trung bình {nudge.average} từ/ngày. Hạ xuống <span className="font-semibold">{nudge.suggested} từ/ngày</span> cho vừa sức nhé?
            </p>
            <div className="flex gap-2">
                <button
                    onClick={() => {
                        setPath({ ...path, pace: nudge.suggested });
                        answer();
                    }}
                    className="h-10 px-4 rounded-xl bg-accent text-on-accent text-sm font-semibold"
                >
                    Đổi thành {nudge.suggested}
                </button>
                <button onClick={answer} className="h-10 px-4 rounded-xl border border-line bg-surface text-ink-2 text-sm">
                    Giữ {path.pace}
                </button>
            </div>
        </div>
    );
}
