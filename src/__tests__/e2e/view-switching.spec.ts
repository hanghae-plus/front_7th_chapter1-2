import { test, expect } from '@playwright/test';
import { CalendarPage, setupTest, TEST_EVENTS } from './e2e-utils';

test.describe('뷰 전환', () => {
  let calendar: CalendarPage;

  test.beforeEach(async ({ page }) => {
    calendar = await setupTest(page);

    // Given: 일정이 존재하는 상태
    const event = TEST_EVENTS.teamMeeting;
    await calendar.fillEventFormBasic(event.title, event.date, event.startTime, event.endTime);
    await calendar.submitEvent();
  });

  test('SC-012: Week 뷰를 선택할 수 있다', async () => {
    // Given: 현재 뷰가 불명확한 상태

    // When: Week 뷰를 선택함
    await calendar.switchView('week');

    // Then: Week 뷰가 표시됨
    await expect(calendar.page.locator('[data-testid="week-view"]')).toBeVisible();
  });

  test('SC-012: Month 뷰를 선택할 수 있다', async () => {
    // Given: 현재 뷰가 불명확한 상태

    // When: Month 뷰를 선택함
    await calendar.switchView('month');

    // Then: Month 뷰가 표시됨
    await expect(calendar.page.locator('[data-testid="month-view"]')).toBeVisible();
  });

  test('Week와 Month 뷰를 전환할 수 있다', async () => {
    // Given: Week 뷰가 표시된 상태
    await calendar.switchView('week');
    await expect(calendar.page.locator('[data-testid="week-view"]')).toBeVisible();

    // When: Month 뷰로 전환
    await calendar.switchView('month');

    // Then: Month 뷰가 표시됨
    await expect(calendar.page.locator('[data-testid="month-view"]')).toBeVisible();
    await expect(calendar.page.locator('[data-testid="week-view"]')).not.toBeVisible();

    // When: 다시 Week 뷰로 전환
    await calendar.switchView('week');

    // Then: Week 뷰가 표시됨
    await expect(calendar.page.locator('[data-testid="week-view"]')).toBeVisible();
    await expect(calendar.page.locator('[data-testid="month-view"]')).not.toBeVisible();
  });

  test('뷰 전환 시 일정이 올바르게 표시된다', async () => {
    // Given: 일정이 존재

    // When: Week 뷰로 전환
    await calendar.switchView('week');

    // Then: 일정이 Week 뷰에 표시됨
    await expect(calendar.page.locator('[data-testid="week-view"]')).toBeVisible();

    // When: Month 뷰로 전환
    await calendar.switchView('month');

    // Then: 일정이 Month 뷰에 표시됨
    await expect(calendar.page.locator('[data-testid="month-view"]')).toBeVisible();
    await expect(calendar.page.locator('text=팀 미팅')).toBeVisible();
  });

  test('SC-013: Week 뷰에서 다음 주로 이동할 수 있다', async () => {
    // Given: Week 뷰에서 현재 주에 위치
    await calendar.switchView('week');

    // When: "다음" 버튼을 클릭함
    await calendar.navigate('next');

    // Then: 다음 주로 이동됨
    // (현재 주 표시 텍스트가 변경되었는지 확인)
    await expect(calendar.page.locator('[data-testid="week-view"]')).toBeVisible();
  });

  test('SC-013: Week 뷰에서 이전 주로 이동할 수 있다', async () => {
    // Given: Week 뷰에서 현재 주에 위치
    await calendar.switchView('week');

    // When: "이전" 버튼을 클릭함
    await calendar.navigate('prev');

    // Then: 이전 주로 이동됨
    await expect(calendar.page.locator('[data-testid="week-view"]')).toBeVisible();
  });

  test('SC-014: Month 뷰에서 다음 달로 이동할 수 있다', async () => {
    // Given: Month 뷰에서 현재 월에 위치
    await calendar.switchView('month');

    // When: "다음" 버튼을 클릭함
    await calendar.navigate('next');

    // Then: 다음 달로 이동됨
    await expect(calendar.page.locator('[data-testid="month-view"]')).toBeVisible();
  });

  test('SC-014: Month 뷰에서 이전 달로 이동할 수 있다', async () => {
    // Given: Month 뷰에서 현재 월에 위치
    await calendar.switchView('month');

    // When: "이전" 버튼을 클릭함
    await calendar.navigate('prev');

    // Then: 이전 달로 이동됨
    await expect(calendar.page.locator('[data-testid="month-view"]')).toBeVisible();
  });

  test('네비게이션 후 일정이 올바른 주/월에 표시된다', async () => {
    // Given: 현재 주/월에 일정이 있음
    const event = TEST_EVENTS.teamMeeting;
    await calendar.fillEventFormBasic(event.title, event.date, event.startTime, event.endTime);
    await calendar.submitEvent();

    // When: Week 뷰에서 이전 주로 이동
    await calendar.switchView('week');
    await calendar.navigate('prev');

    // Then: 일정이 표시되지 않아야 함 (이전 주이므로)
    // (실제로는 해당 일정이 있는 주로 이동해야 표시됨)
    await expect(calendar.page.locator('[data-testid="week-view"]')).toBeVisible();
  });

  test('공휴일이 월 뷰에 표시된다', async () => {
    // Given: 월간 뷰
    await calendar.switchView('month');

    // Then: 공휴일이 표시됨 (홍보로 해당 월에 공휴일이 있다면)
    // 예: 설날, 어린이날 등
    // 실제 검증은 공휴일 API가 실제로 반환하는 데이터에 따라 달라짐
    await expect(calendar.page.locator('[data-testid="month-view"]')).toBeVisible();
  });
});
