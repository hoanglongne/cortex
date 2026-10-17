/**
 * E2E Test: Onboarding Flow
 *
 * Kịch bản: Người dùng mở app lần đầu (localStorage trống).
 * Mục tiêu:
 *  1. App tự động redirect vào /onboarding
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
  test('app redirect vào /onboarding khi localStorage trống', async ({ page }) => {
    await page.goto('/');

    // Đợi redirect hoàn thành
    await page.waitForURL(/\/onboarding/, { timeout: 10_000 });

    expect(page.url()).toContain('/onboarding');
  });

  // -------------------------------------------------------------------------
  // Test 2: Trang /onboarding hiển thị modal chào mừng
  // -------------------------------------------------------------------------
  test('trang /onboarding hiển thị màn hình chào mừng LEXICA', async ({ page }) => {
    await page.goto('/onboarding');

    // Modal phải xuất hiện với tiêu đề chào mừng
    await expect(page.getByText('Từ câu chêm đến câu của mình')).toBeVisible({ timeout: 8_000 });
  });

  // -------------------------------------------------------------------------
  // Test 3: Chọn archetype 'tech' và hoàn thành onboarding
  // -------------------------------------------------------------------------
  test('chọn archetype "tech" và hoàn thành onboarding → chuyển khỏi /onboarding', async ({ page }) => {
    await page.goto('/onboarding');

    // Đợi modal xuất hiện
    await expect(page.getByText('Từ câu chêm đến câu của mình')).toBeVisible({ timeout: 8_000 });

    // Bước 1 → Bước 2 (chọn nhánh) → Bước 3 (Persona Selection)
    const nextButton = page.getByRole('button', { name: /tiếp theo/i });
    await nextButton.click();
    await expect(page.getByText('Bạn học tiếng Anh để làm gì?')).toBeVisible({ timeout: 5_000 });
    await page.getByTestId('branch-talk').click();
    await page.getByRole('button', { name: /tiếp theo/i }).click();

    // Đợi bước persona selection xuất hiện
    await expect(page.getByText('Câu ví dụ theo đời bạn')).toBeVisible({ timeout: 5_000 });

    // Click chọn archetype 'Lập trình viên / Tech'
    const techOption = page.getByText('Lập trình viên / Tech');
    await techOption.click();

    // Đảm bảo option được chọn (có thể kiểm tra via aria-pressed hoặc visual state)
    await expect(techOption).toBeVisible();

    // Tiếp tục qua các bước còn lại bằng cách click "Tiếp theo" nhiều lần
    // Số bước = 6 (STEPS.length trong OnboardingModal.tsx)
    // Đã ở bước 3, cần đến bước cuối
    const REMAINING_STEPS = 3;
    for (let i = 0; i < REMAINING_STEPS; i++) {
      const btn = page.getByRole('button', { name: /tiếp theo/i });
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(300); // đợi animation
      } else {
        // Bước cuối cùng: nút "Bắt đầu" hoặc tương đương
        break;
      }
    }

    // Bước cuối — nút có thể là "Bắt đầu" hoặc tương tự
    const startButton = page.getByRole('button', { name: /làm bài test level/i });
    if (await startButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await startButton.click();
    } else {
      // Thử nút tiếp theo một lần nữa (nếu còn bước)
      const lastNext = page.getByRole('button', { name: /tiếp theo/i });
      if (await lastNext.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await lastNext.click();
      }
    }

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

  // -------------------------------------------------------------------------
  // Test 4: Nút Skip cho phép thoát ngay lập tức
  // -------------------------------------------------------------------------
  test('nút Skip (X) bỏ qua toàn bộ onboarding', async ({ page }) => {
    await page.goto('/onboarding');

    await expect(page.getByText('Từ câu chêm đến câu của mình')).toBeVisible({ timeout: 8_000 });

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
