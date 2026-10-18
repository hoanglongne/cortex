/**
 * E2E Test: Core Learning Flow (docs/LEXICA_DIRECTION.md)
 *
 * Kịch bản: người dùng đã có lộ trình, mở trang chủ và bấm "Bắt đầu hôm nay".
 *  1. Trang chủ: thẻ Hôm nay (4 chặng), 4 con số, Luyện thêm
 *  2. Phiên Hôm nay chạy Học → Đọc → Nói rồi tới màn kết phiên
 *  3. "Học thêm từ mới" mở bộ thẻ ngay trên trang chủ
 *  4. Chưa có lộ trình → /path/setup chọn nhánh và nhịp
 *
 * Swipe bằng phím ArrowLeft/ArrowRight (ổn định hơn kéo Framer Motion).
 */

import { test, expect } from '@playwright/test';
import { injectLexicaState, makeBypassState } from './helpers';

test.describe('Core Learning Flow — Hôm nay', () => {
  test('trang chủ: thẻ Hôm nay, 4 con số và Luyện thêm', async ({ page }) => {
    await injectLexicaState(page, makeBypassState());
    await page.goto('/');
    await page.waitForURL('/', { timeout: 10_000 });

    const card = page.getByTestId('today-card');
    await expect(card).toBeVisible({ timeout: 8_000 });
    for (const stage of ['Ôn', 'Học', 'Đọc', 'Nói']) await expect(card.getByText(stage, { exact: true })).toBeVisible();
    await expect(page.getByTestId('today-start')).toBeVisible();
    await expect(page.getByTestId('step-numbers')).toBeVisible();
    await expect(page.getByRole('button', { name: /Học thêm từ mới/ })).toBeVisible();
  });

  test('phiên Hôm nay: Học → Đọc → Nói → kết phiên', async ({ page }) => {
    await injectLexicaState(page, makeBypassState({ dailyGoal: 10 }));
    await page.goto('/');
    await page.getByTestId('today-start').click();
    await page.waitForURL('**/today', { timeout: 10_000 });

    // Không có từ đến hạn: chặng Ôn bị bỏ qua, vào thẳng Học.
    await expect(page.getByTestId('stage-bar')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chưa nhớ' })).toBeVisible({ timeout: 8_000 });
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(450);
    }
    await expect(page.getByTestId('learn-recap')).toBeVisible({ timeout: 8_000 });
    await page.getByRole('button', { name: /Tiếp tục/ }).first().click();

    // Đọc: một đoạn văn ở level của người học.
    await expect(page.getByTestId('passage-text')).toBeVisible({ timeout: 8_000 });
    await page.getByRole('button', { name: /Đọc xong/ }).click();
    await page.getByTestId('stage-next').click();

    // Nói: chưa có từ nào để nói thì bỏ qua được.
    await page.getByTestId('stage-next').click();

    await expect(page.getByTestId('today-recap')).toBeVisible({ timeout: 8_000 });
    await page.getByRole('link', { name: 'Về trang chủ' }).click();
    await expect(page.getByTestId('today-card').getByText('Xong hôm nay')).toBeVisible({ timeout: 8_000 });
  });

  test('"Học thêm từ mới" mở bộ thẻ, swipe ra thẻ mới', async ({ page }) => {
    await injectLexicaState(page, makeBypassState());
    await page.goto('/');
    await page.getByRole('button', { name: /Học thêm từ mới/ }).click();

    const deck = page.locator('[data-tour-id="swipe-deck"]');
    await expect(deck).toBeVisible({ timeout: 8_000 });
    const first = await deck.textContent();
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(700);
    expect(await deck.textContent()).not.toBe(first);
  });

  test('chưa có lộ trình → chọn nhánh và nhịp rồi vào phiên đầu tiên', async ({ page }) => {
    await injectLexicaState(page, makeBypassState({ path: null }));
    await page.goto('/');
    await page.waitForURL('**/path/setup', { timeout: 10_000 });

    await page.getByRole('button', { name: /Giao tiếp/ }).click();
    await page.getByRole('button', { name: /15/ }).click();
    await expect(page.getByTestId('path-promise')).toContainText('450 từ');
    await page.getByTestId('path-start').click();

    await page.waitForURL('**/today', { timeout: 10_000 });
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lexica-storage') ?? '{}').state?.path);
    expect(saved).toMatchObject({ branch: 'talk', pace: 15 });
  });
});
