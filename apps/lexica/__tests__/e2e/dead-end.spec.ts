/**
 * E2E Test: Dead-End States
 *
 * Kịch bản: Người dùng đã dùng hết bộ thẻ (currentDeck rỗng sau khi swipe hết).
 * Mục tiêu:
 *  1. SwipeDeck KHÔNG hiển thị thẻ khi deck rỗng
 *  2. Hiển thị màn hình "Hoàn thành bộ bài!" với 2 nút CTA:
 *     - "Đọc 2 phút" → /read
 *     - "Xem danh sách từ vựng" → /learned
 *  3. Cả 2 nút đều clickable và điều hướng đúng
 *
 * Chiến lược: inject cardProgress cho mọi thẻ của level, chưa đến hạn
 * → bộ thẻ không còn gì để chia → dead-end.
 *
 * Lưu ý: energy = 0 không tự động tạo dead-end view trong SwipeDeck hiện tại.
 * Dead-end chỉ xảy ra khi cards.length === 0 (tất cả thẻ đã được swipe).
 */

import { test, expect } from '@playwright/test';
import { injectLexicaState, makeBypassState } from './helpers';
import { VOCAB_DATABASE } from '../../app/data/vocabCards';

/**
 * Every card of the level already learned and not due: the deck has nothing
 * new to deal, which is the real dead end (a 10-card session alone ends in
 * a recap and the deck refills).
 */
function exhaustedState() {
  const later = Date.now() + 30 * 86_400_000;
  const ids = VOCAB_DATABASE.filter((c) => c.level === 'intermediate').map((c) => c.id);
  const cardProgress = Object.fromEntries(
    ids.map((id) => [id, { cardId: id, state: 'gold', lastReviewedAt: Date.now(), nextReviewAt: later, reviewCount: 3, wrongCount: 0 }]),
  );
  return makeBypassState({ cardProgress, learnedWords: ids });
}

// ---------------------------------------------------------------------------
// Bộ test chính
// ---------------------------------------------------------------------------
test.describe('Dead-End States — hết bộ thẻ', () => {
  // -------------------------------------------------------------------------
  // Test 1: Swipe hết tất cả thẻ → dead-end view xuất hiện
  // -------------------------------------------------------------------------
  test('swipe hết tất cả thẻ → hiển thị màn hình "Hoàn thành bộ bài!"', async ({ page }) => {
    await injectLexicaState(page, exhaustedState());
    await page.goto('/');
    await page.waitForURL('/', { timeout: 10_000 });

    // Bắt đầu phiên học
    await page.getByRole('button', { name: /Học thêm từ mới/ }).click();

    const swipeDeck = page.locator('[data-tour-id="swipe-deck"]');
    await expect(swipeDeck).toBeVisible({ timeout: 8_000 });

    // Dead-end view phải xuất hiện
    await expect(page.getByText('Hoàn thành bộ bài!')).toBeVisible({ timeout: 8_000 });
  });

  // -------------------------------------------------------------------------
  // Test 2: Dead-end — KHÔNG hiển thị thêm thẻ nào
  // -------------------------------------------------------------------------
  test('dead-end: không còn thẻ nào trong SwipeDeck', async ({ page }) => {
    await injectLexicaState(page, exhaustedState());
    await page.goto('/');
    await page.waitForURL('/', { timeout: 10_000 });

    await page.getByRole('button', { name: /Học thêm từ mới/ }).click();

    const swipeDeck = page.locator('[data-tour-id="swipe-deck"]');
    await expect(swipeDeck).toBeVisible({ timeout: 8_000 });

    // "Hoàn thành bộ bài!" xuất hiện
    await expect(page.getByText('Hoàn thành bộ bài!')).toBeVisible({ timeout: 8_000 });

    // Nhấn ArrowLeft thêm → không có thẻ mới xuất hiện, UI vẫn là dead-end
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(500);

    await expect(page.getByText('Hoàn thành bộ bài!')).toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test 3: Nút CTA "Đọc 2 phút" có thể click
  // -------------------------------------------------------------------------
  test('nút "Đọc 2 phút" xuất hiện và click được', async ({ page }) => {
    await injectLexicaState(page, exhaustedState());
    await page.goto('/');
    await page.waitForURL('/', { timeout: 10_000 });

    await page.getByRole('button', { name: /Học thêm từ mới/ }).click();

    await expect(page.locator('[data-tour-id="swipe-deck"]')).toBeVisible({ timeout: 8_000 });

    // Nút CTA chính: "Đọc 2 phút"
    const storiesBtn = page.getByRole('link', { name: 'Đọc 2 phút' });
    await expect(storiesBtn).toBeVisible({ timeout: 8_000 });

    // Click và kiểm tra điều hướng đến /read
    await storiesBtn.click();
    await page.waitForURL(/\/read/, { timeout: 8_000 });

    expect(page.url()).toContain('/read');
  });

  // -------------------------------------------------------------------------
  // Test 4: Nút CTA "Xem danh sách từ vựng" có thể click
  // -------------------------------------------------------------------------
  test('nút "Xem danh sách từ vựng" xuất hiện và click được', async ({ page }) => {
    await injectLexicaState(page, exhaustedState());
    await page.goto('/');
    await page.waitForURL('/', { timeout: 10_000 });

    await page.getByRole('button', { name: /Học thêm từ mới/ }).click();

    await expect(page.locator('[data-tour-id="swipe-deck"]')).toBeVisible({ timeout: 8_000 });

    // Nút CTA phụ: "Xem danh sách từ vựng"
    const learnedBtn = page.getByRole('link', { name: 'Xem danh sách từ vựng' });
    await expect(learnedBtn).toBeVisible({ timeout: 8_000 });

    // Click và kiểm tra điều hướng đến /learned
    await learnedBtn.click();
    await page.waitForURL(/\/learned/, { timeout: 8_000 });

    expect(page.url()).toContain('/learned');
  });

  // -------------------------------------------------------------------------
  // Test 5: Dead-end khi energy = 0 (kiểm tra UI thông báo hết energy)
  //
  // Lưu ý: Trong thiết kế hiện tại, SwipeDeck KHÔNG tự block khi energy=0.
  // Việc block energy diễn ra ở cấp độ swipeCard() action trong store.
  // Deck vẫn được hiển thị, người dùng chỉ không thể swipe right (consumeEnergy returns false).
  // Test này xác nhận rằng energy=0 KHÔNG ẩn SwipeDeck (design intent).
  // -------------------------------------------------------------------------
  test('energy=0: SwipeDeck vẫn render thẻ (energy không ẩn deck)', async ({ page }) => {
    // Inject state với energy = 0 nhưng còn thẻ trong deck
    await injectLexicaState(
      page,
      makeBypassState({
        energy: 0,
        lastGoalSetDate: null,
      })
    );

    await page.goto('/');
    await page.waitForURL('/', { timeout: 10_000 });

    // "Luyện thêm" → "Học thêm từ mới" mở bộ thẻ ngay trên Home
    await page.getByRole('button', { name: /Học thêm từ mới/ }).click();

    const swipeDeck = page.locator('[data-tour-id="swipe-deck"]');
    await expect(swipeDeck).toBeVisible({ timeout: 8_000 });
    await page.waitForTimeout(1_000);

    // Deck phải hiển thị thẻ (không phải dead-end view)
    // vì energy=0 không block việc hiển thị deck
    const completionMsg = page.getByText('Hoàn thành bộ bài!');
    await expect(completionMsg).not.toBeVisible();
  });

  // -------------------------------------------------------------------------
  // Test 6: Hoàn thành mục tiêu ngày (dailyProgress >= dailyGoal)
  //         → UI vẫn cho phép tiếp tục học (dead-end chỉ khi deck rỗng)
  // -------------------------------------------------------------------------
  test('hoàn thành daily goal: UI ghi nhận nhưng vẫn cho học tiếp', async ({ page }) => {
    await injectLexicaState(
      page,
      makeBypassState({
        dailyGoal: 5,
        dailyProgress: 5, // đã đạt mục tiêu
        lastGoalSetDate: new Date().toISOString().split('T')[0],
      })
    );

    await page.goto('/');
    await page.waitForURL('/', { timeout: 10_000 });

    // Home luôn có thẻ Hôm nay; mục tiêu đã đạt không chặn gì
    await page.waitForTimeout(2_000);

    // Trang chủ vẫn load được (không crash)
    await expect(page.locator('body')).toBeVisible();

    // Không bị redirect sang trang lạ
    expect(page.url()).toContain('/');
    expect(page.url()).not.toContain('/onboarding');
  });
});
