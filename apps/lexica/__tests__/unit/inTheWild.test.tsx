import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import InTheWild from '../../app/components/InTheWild';
import { parseQuotes } from '../../app/lib/content/pack';

const song = {
    kind: 'song' as const,
    text: 'You know the rules and so do I',
    source: 'Song — Singer',
    media: { provider: 'youtube' as const, id: 'dQw4w9WgXcQ', start: 42, end: 50 },
};

describe('InTheWild', () => {
    it('renders nothing without quotes', () => {
        const { container } = render(<InTheWild word="rules" quotes={[]} />);
        expect(container.firstChild).toBeNull();
    });

    it('loads the video only after a tap, at the line', () => {
        const { container } = render(<InTheWild word="rules" quotes={[song]} />);
        expect(container.querySelector('iframe')).toBeNull();
        fireEvent.click(screen.getByText(/Nghe đoạn này/));
        const src = container.querySelector('iframe')?.getAttribute('src') ?? '';
        expect(src).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
        expect(src).toContain('start=42');
        expect(src).toContain('end=50');
    });
});

describe('parseQuotes media', () => {
    it('keeps a valid clip and drops a bad one', () => {
        const out = parseQuotes({
            schema: 1,
            quotes: {
                v001: [song],
                v002: [{ ...song, media: { provider: 'vimeo', id: '1', start: 0, end: 5 } }],
            },
        });
        expect(out.v001[0].media?.id).toBe('dQw4w9WgXcQ');
        expect(out.v002[0].media).toBeUndefined();
    });
});

describe('InTheWild preview', () => {
    const book = { kind: 'book' as const, text: 'It was just like Ellen to place the family in such dilemmas.', source: 'The Age of Innocence — Edith Wharton' };

    it('shows the first quote without a tap', () => {
        render(<InTheWild word="dilemma" quotes={[book, song]} />);
        const preview = screen.getByTestId('wild-preview');
        expect(preview.textContent).toBe(book.text);
        // the plural form is marked too
        expect(preview.querySelector('mark')?.textContent).toBe('dilemmas');
        expect(screen.getByText(/2 câu thật/)).toBeTruthy();
    });
});
