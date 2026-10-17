import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import SessionRecap from '../../app/components/SessionRecap';
import { newSession } from '../../app/lib/engagement/session';
import { DEFAULT_PROMPT } from '../../app/lib/engagement/mySentence';
import { useLexicaStore } from '../../app/store/lexicaStore';

const recap = (remembered: string[]) => (
    <SessionRecap session={{ ...newSession(0), count: 10, known: 8, remembered }} readyToMint={0} nearest={null} teasers={[]} onContinue={() => {}} />
);

beforeEach(() => {
    useLexicaStore.setState({ mySentences: {}, mySentencePrompt: DEFAULT_PROMPT });
});

describe('SessionRecap · Câu của bạn', () => {
    it('offers a remembered word, then saves the learner sentence', () => {
        render(recap(['v001']));
        expect(screen.getByText(/với đời bạn\?/)).toBeTruthy();
        fireEvent.click(screen.getByText('Chọn câu'));
        // v001 has only its own sentence here, so the panel opens on writing.
        fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Mùa này vườn nhà mình ra trái ABUNDANT' } });
        fireEvent.click(screen.getByText('Lưu câu'));
        expect(useLexicaStore.getState().mySentences.v001?.text).toBe('Mùa này vườn nhà mình ra trái ABUNDANT');
        expect(screen.getByText(/Đã lưu\. Lần sau gặp/)).toBeTruthy();
    });

    it('stays quiet with nothing remembered, when turned off, or after "Để sau"', () => {
        const { unmount } = render(recap([]));
        expect(screen.queryByText('Chọn câu')).toBeNull();
        unmount();

        useLexicaStore.setState({ mySentencePrompt: { ...DEFAULT_PROMPT, off: true } });
        const off = render(recap(['v001']));
        expect(screen.queryByText('Chọn câu')).toBeNull();
        off.unmount();

        useLexicaStore.setState({ mySentencePrompt: DEFAULT_PROMPT });
        render(recap(['v001']));
        fireEvent.click(screen.getByText('Để sau'));
        expect(screen.queryByText('Chọn câu')).toBeNull();
        expect(useLexicaStore.getState().mySentencePrompt.skips).toBe(1);
    });
});
