import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import MySentencePanel from '../../app/components/MySentencePanel';
import type { ContentCard } from '../../app/lib/content/pack';

const card: ContentCard = {
    id: 'v1',
    word: 'SUBTLE',
    elo: 1000,
    level: 'intermediate',
    scenario: 'Quán đổi công thức rất SUBTLE.',
    translationHint: 'Tinh tế',
    scenarios: { casual: 'Quán đổi công thức rất SUBTLE.', tech: 'Bug này SUBTLE lắm.' },
};

describe('MySentencePanel', () => {
    it('saves a picked sentence with one tap', () => {
        const onSave = vi.fn();
        render(<MySentencePanel card={card} onSave={onSave} onLater={() => {}} />);
        fireEvent.click(screen.getByText('Bug này SUBTLE lắm.'));
        expect(onSave).toHaveBeenCalledWith('Bug này SUBTLE lắm.', 'picked');
    });

    it('asks for the word, inserts it, then saves what was written', () => {
        const onSave = vi.fn();
        render(<MySentencePanel card={card} onSave={onSave} onLater={() => {}} />);
        fireEvent.click(screen.getByText('Hoặc tự viết'));
        const box = screen.getByRole('textbox');
        fireEvent.change(box, { target: { value: 'Mẹ nêm canh rất' } });
        fireEvent.click(screen.getByText('Lưu câu'));
        expect(screen.getByText('Câu cần có từ SUBTLE.')).toBeTruthy();
        expect(onSave).not.toHaveBeenCalled();
        fireEvent.click(screen.getByText('+ chèn SUBTLE'));
        fireEvent.click(screen.getByText('Lưu câu'));
        expect(onSave).toHaveBeenCalledWith('Mẹ nêm canh rất SUBTLE', 'written');
    });

    it('opens straight on writing when there is nothing to pick from', () => {
        render(<MySentencePanel card={{ ...card, scenarios: undefined }} onSave={() => {}} onLater={() => {}} />);
        expect(screen.getByRole('textbox')).toBeTruthy();
        expect(screen.queryByText('Chọn câu có sẵn')).toBeNull();
    });

    it('lets the learner leave with "Để sau"', () => {
        const onLater = vi.fn();
        render(<MySentencePanel card={card} onSave={() => {}} onLater={onLater} />);
        fireEvent.click(screen.getByText('Để sau'));
        expect(onLater).toHaveBeenCalled();
    });
});
