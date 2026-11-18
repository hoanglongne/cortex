import { describe, expect, it } from 'vitest';
import { parseThemePref, resolveTheme, THEME_BOOT } from '../../app/lib/theme';

describe('theme (#146 round 3)', () => {
    it('defaults to dark and follows the system when asked', () => {
        expect(parseThemePref(null)).toBe('dark');
        expect(parseThemePref('nope')).toBe('dark');
        expect(resolveTheme('light', true)).toBe('light');
        expect(resolveTheme('system', true)).toBe('dark');
        expect(resolveTheme('system', false)).toBe('light');
    });
    it('boot script is valid JS', () => {
        expect(() => new Function(THEME_BOOT)).not.toThrow();
    });
});
