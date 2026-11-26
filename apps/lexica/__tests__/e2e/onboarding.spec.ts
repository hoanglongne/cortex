/**
 * E2E Test: Onboarding Flow
 *
 * Kịch bản: Người dùng mở app lần đầu (localStorage trống).
 * Mục tiêu:
 *  1. Người mới vào / thấy onboarding ngay tại chỗ (không chuyển trang)
 *  2. Người dùng điều hướng qua các bước, chọn archetype 'tech'
 *  3. Sau khi hoàn thành onboarding, được chuyển đi khỏi /onboarding
 *     (về /test theo logic thực tế của app)
 */

import { test, expect } from '@playwright/test';
import { clearLexicaState } from './helpers';

// ---------------------------------------------------------------------------
// Bộ test chính
// ---------------------------------------------------------------------------
test.describe('Onboarding Flow — lần đầu sử dụng', () => {
  test.beforeEach(async ({ page }) => {
    // Xóa sạch localStorage để mô phỏng người dùng mới hoàn toàn
    await clearLexicaState(page);
  });

  // -------------------------------------------------------------------------
  // Test 1: Redirect tự động vào /onboarding
  // -------------------------------------------------------------------------
  test('người mới vào / thấy onboarding ngay tại chỗ, không có thanh điều hướng', async ({ page }) => {
    await page.goto('/');

    // The first card is shown at /, without a redirect to /onboarding (#178)
    await expect(page.getByTestId('try-card')).toBeVisible({ timeout: 10_000 });
    expect(new URL(page.url()).pathname).toBe('/');
    await expect(page.getByRole('navigation', { name: 'Điều hướng' })).toHaveCount(0);
  });

  // -------------------------------------------------------------------------
  // Test 2: Trang /onboarding hiển thị modal chào mừng
  // -------------------------------------------------------------------------
  test('trang /onboarding hiển thị màn hình chào mừng LEXICA', async ({ page }) => {
    await page.goto('/onboarding');
    // Thử một thẻ trước (#146): bỏ qua để tới màn chào mừng.
    await page.getByRole('button', { name: 'Để sau' }).click();

    // Modal phải xuất hiện với tiêu đề chào mừng
    await expect(page.getByText('Bạn học tiếng Anh để làm gì?')).toBeVisible({ timeout: 8_000 });
  });

  // -------------------------------------------------------------------------
  // Test 3: Chọn archetype 'tech' và hoàn thành onboarding
  // -------------------------------------------------------------------------
  test('chọn archetype "tech" và hoàn thành onboarding → chuyển khỏi /onboarding', async ({ page }) => {
    await page.goto('/onboarding');
    // Thử một thẻ trước (#146): bỏ qua để tới màn chào mừng.
    await page.getByRole('button', { name: 'Để sau' }).click();

    // Đợi modal xuất hiện
    await expect(page.getByText('Bạn học tiếng Anh để làm gì?')).toBeVisible({ timeout: 8_000 });

    // First time: two steps only, the branch then the persona (issue #178)
    await page.getByTestId('branch-talk').click();
    await page.getByRole('button', { name: /tiếp theo/i }).click();

    // Đợi bước persona selection xuất hiện
    await expect(page.getByText('Câu ví dụ theo đời bạn')).toBeVisible({ timeout: 5_000 });

    // Click chọn archetype 'Lập trình viên / Tech'
    const techOption = page.getByText('Lập trình viên / Tech');
    await techOption.click();

    // Đảm bảo option được chọn (có thể kiểm tra via aria-pressed hoặc visual state)
    await expect(techOption).toBeVisible();

    // The persona is the last first-time step: its button leads to choosing a level
    await page.getByRole('button', { name: /Chọn trình độ/ }).click();

    // Sau khi hoàn thành onboarding:
    // - completeOnboarding() sets hasSeenOnboarding = true
    // - router.replace('/test') chuyển đến trang test
    // => URL KHÔNG còn là /onboarding
    await page.waitForURL((url) => !url.pathname.includes('/onboarding'), {
      timeout: 10_000,
    });

    expect(page.url()).not.toContain('/onboarding');
    // The branch picked here is waiting for the path setup after the level test.
    expect(await page.evaluate(() => localStorage.getItem('lexica-branch-pick'))).toBe('talk');
  });

  test('thử một thẻ trước: bấm "Biết rồi" thấy nghĩa rồi vào màn chào mừng', async ({ page }) => {
    await page.goto('/onboarding');
    await expect(page.getByTestId('try-card')).toBeVisible({ timeout: 8_000 });
    await page.getByRole('button', { name: 'Biết rồi' }).click();
    await expect(page.getByTestId('try-meaning')).toBeVisible();
    await page.getByRole('button', { name: /Học như vậy mỗi ngày/ }).click();
    await expect(page.getByText('Bạn học tiếng Anh để làm gì?')).toBeVisible({ timeout: 8_000 });
  });

  // -------------------------------------------------------------------------
  // Test 4: Nút Skip cho phép thoát ngay lập tức
  // -------------------------------------------------------------------------
  test('nút Skip (X) bỏ qua toàn bộ onboarding', async ({ page }) => {
    await page.goto('/onboarding');
    // Thử một thẻ trước (#146): bỏ qua để tới màn chào mừng.
    await page.getByRole('button', { name: 'Để sau' }).click();

    await expect(page.getByText('Bạn học tiếng Anh để làm gì?')).toBeVisible({ timeout: 8_000 });

    // Click nút X (Skip)
    await page.getByRole('button', { name: 'Bỏ qua' }).click();

    // Sau khi skip, phải chuyển ra khỏi /onboarding
    await page.waitForURL((url) => !url.pathname.includes('/onboarding'), {
      timeout: 8_000,
    });

    expect(page.url()).not.toContain('/onboarding');
  });

  // -------------------------------------------------------------------------
  // Test 5: Người dùng đã onboarding → redirect ra khỏi /onboarding
  // -------------------------------------------------------------------------
  test('người dùng đã onboarding bị redirect ra khỏi /onboarding', async ({ page }) => {
    // Set state đã onboarding trước khi load
    await page.addInitScript(() => {
      const state = {
        hasSeenOnboarding: true,
        hasSeenWelcome: true,
        selectedLevel: 'intermediate',
      };
      localStorage.setItem('lexica-storage', JSON.stringify({ state, version: 0 }));
    });

    await page.goto('/onboarding');

    // Nên được redirect ra ngay
    await page.waitForURL((url) => !url.pathname.includes('/onboarding'), {
      timeout: 8_000,
    });

    expect(page.url()).not.toContain('/onboarding');
  });
});
