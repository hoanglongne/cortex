import { expect, test } from '@playwright/test';
import { injectLexicaState, makeBypassState } from './helpers';

/**
 * UI rule (docs/LEXICA_DESIGN_B.md): no short label may wrap onto two lines.
 * Opens the main pages at six widths and lists every short text that breaks.
 * Descriptions meant to wrap carry data-prose. Slow (about 2 minutes), so it runs only with UI_SCAN=1:
 *   UI_SCAN=1 pnpm exec playwright test ui-wrap
 */
const PAGES = ['/', '/practice', '/play', '/learned', '/album', '/me', '/settings', '/blend', '/speak', '/read', '/stats', '/path', '/review', '/buddy', '/class', '/guide', '/score', '/journal', '/write'];
const WIDTHS = [360, 390, 768, 1024, 1280, 1440];

test.skip(!process.env.UI_SCAN, 'set UI_SCAN=1 to run the wrap scan');

test('no short label wraps', async ({ page }) => {
    test.setTimeout(600_000);
    await injectLexicaState(page, makeBypassState());
    const found: string[] = [];
    for (const w of WIDTHS) {
        await page.setViewportSize({ width: w, height: 900 });
        for (const p of PAGES) {
            await page.goto(p).catch(() => {});
            await page.waitForTimeout(900);
            const bad = await page.evaluate(() => {
                const res: string[] = [];
                const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
                let n: Node | null;
                while ((n = walker.nextNode())) {
                    const t = (n.nodeValue || '').trim();
                    if (t.length < 2) continue;
                    const el = n.parentElement;
                    if (!el || el.closest('p, textarea, script, style, article, [data-prose], [data-testid=passage-text]')) continue;
                    const box = el.closest('a, button, label, li, [role=button], span, h1, h2, h3, th, td, summary, div') as HTMLElement | null;
                    if ((box?.innerText || t).trim().length > 30) continue;
                    const r = document.createRange();
                    r.selectNodeContents(n);
                    const tops = new Set(Array.from(r.getClientRects()).filter((x) => x.width > 1).map((x) => Math.round(x.top / 3)));
                    if (tops.size > 1) res.push(t);
                }
                return Array.from(new Set(res));
            });
            for (const b of bad) found.push(`${w}px ${p}: "${b}"`);
        }
    }
    expect(found, found.join('\n')).toEqual([]);
});
