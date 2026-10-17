/**
 * T1 (docs/LEXICA_FEEDBACK_TASKS.md): the recall check must fit inside the
 * card. Uses the dev-only fixture /dev/card-fit, which puts the longest
 * sentence, meanings and memory aid in the deck on one card.
 *
 * Screenshots go to the test output folder, or to $SCREENSHOT_DIR when set.
 */
import { test, expect, type Page } from '@playwright/test';
import path from 'path';
import { injectLexicaState, makeBypassState } from './helpers';

const VIEWPORTS = [
    { name: 'mobile', width: 375, height: 812 },
    { name: 'desktop', width: 1280, height: 800 },
    { name: 'wide', width: 1920, height: 1080 },
] as const;

const KINDS = ['meaning', 'cloze', 'type'] as const;

/** The panel ends inside the card and needs no scrolling to show everything. */
async function expectPanelFits(page: Page) {
    const card = page.getByTestId('vocab-card');
    const panel = page.getByTestId('card-panel');
    const cardBox = await card.boundingBox();
    const panelBox = await panel.boundingBox();
    expect(cardBox).not.toBeNull();
    expect(panelBox).not.toBeNull();
    expect(panelBox!.y + panelBox!.height).toBeLessThanOrEqual(cardBox!.y + cardBox!.height);
    const overflow = await panel.evaluate((el) => ({ y: el.scrollHeight - el.clientHeight, x: el.scrollWidth - el.clientWidth }));
    expect(overflow.y).toBeLessThanOrEqual(1);
    expect(overflow.x).toBeLessThanOrEqual(1);
}

for (const vp of VIEWPORTS) {
    for (const kind of KINDS) {
        test(`card fits: ${kind} check at ${vp.width}px`, async ({ page }, testInfo) => {
            await page.setViewportSize({ width: vp.width, height: vp.height });
            await injectLexicaState(page, makeBypassState());
            await page.goto(`/dev/card-fit?kind=${kind}`);
            await expect(page.getByTestId('vocab-card')).toBeVisible();

            const shot = (step: string) => {
                const file = `card-fit-${kind}-${vp.width}-${step}.png`;
                const dir = process.env.SCREENSHOT_DIR;
                return page.getByTestId('vocab-card').screenshot({ path: dir ? path.join(dir, file) : testInfo.outputPath(file) });
            };

            await expectPanelFits(page);
            await shot('before');

            // Answer wrong: first option (the fixture puts the answer last), or a typed miss.
            if (kind === 'type') {
                await page.getByLabel('Gõ từ còn thiếu').fill('zzz');
                await page.getByRole('button', { name: 'Kiểm tra' }).click();
            } else {
                await page.getByTestId('card-panel').getByRole('button').first().click();
            }
            await expect(page.getByTestId('recall-verdict')).toBeVisible();

            await expectPanelFits(page);
            const verdict = await page.getByTestId('recall-verdict').boundingBox();
            const cardBox = await page.getByTestId('vocab-card').boundingBox();
            expect(verdict!.y + verdict!.height).toBeLessThanOrEqual(cardBox!.y + cardBox!.height);
            const verdictOverflow = await page.getByTestId('recall-verdict').evaluate((el) => el.scrollHeight - el.clientHeight);
            expect(verdictOverflow).toBeLessThanOrEqual(1);
            await shot('wrong');
        });
    }
}
