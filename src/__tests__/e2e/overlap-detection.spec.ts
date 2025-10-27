import { test, expect } from '@playwright/test';
import { CalendarPage, setupTest, TEST_EVENTS } from './e2e-utils';

test.describe('일정 충돌 감지', () => {
  let calendar: CalendarPage;

  test.beforeEach(async ({ page }) => {
    calendar = await setupTest(page);
  });

  test('SC-004: 겹치는 일정 추가 시 경고 다이얼로그가 표시된다', async () => {
    // Given: 이미 다음과 같은 일정이 존재함
    const existingEvent = TEST_EVENTS.teamMeeting;
    await calendar.fillEventFormBasic(
      existingEvent.title,
      existingEvent.date,
      existingEvent.startTime,
      existingEvent.endTime
    );
    await calendar.submitEvent();

    // When: 겹치는 시간의 새 일정을 추가 시도함
    const overlappingEvent = TEST_EVENTS.overlappingEvent;
    await calendar.fillEventFormBasic(
      overlappingEvent.title,
      overlappingEvent.date,
      overlappingEvent.startTime,
      overlappingEvent.endTime
    );
    await calendar.submitEvent();

    // Then: 충돌 경고 다이얼로그가 표시됨
    await expect(calendar.page.locator('text=일정 겹침 경고')).toBeVisible();
    await expect(calendar.page.locator('text=다음 일정과 겹칩니다:')).toBeVisible();
    await expect(calendar.page.locator('text=계속 진행하시겠습니까?')).toBeVisible();

    // 충돌 일정 정보가 표시되는지 확인
    await expect(calendar.page.locator('text=팀 미팅')).toBeVisible();
  });

  test('SC-005: 충돌 경고 후 강제 저장을 선택할 수 있다', async () => {
    // Given: 기존 일정이 있고 충돌 경고 다이얼로그가 표시된 상태
    const existingEvent = TEST_EVENTS.teamMeeting;
    await calendar.fillEventFormBasic(
      existingEvent.title,
      existingEvent.date,
      existingEvent.startTime,
      existingEvent.endTime
    );
    await calendar.submitEvent();

    const overlappingEvent = TEST_EVENTS.overlappingEvent;
    await calendar.fillEventFormBasic(
      overlappingEvent.title,
      overlappingEvent.date,
      overlappingEvent.startTime,
      overlappingEvent.endTime
    );
    await calendar.submitEvent();

    // When: "계속 진행" 버튼을 클릭함
    await expect(calendar.page.locator('text=일정 겹침 경고')).toBeVisible();
    await calendar.page.click('button:has-text("계속 진행")');

    // Then: 두 일정이 모두 리스트에 표시됨
    const eventList = calendar.getEventList();
    await expect(eventList).toContainText(existingEvent.title);
    await expect(eventList).toContainText(overlappingEvent.title);
  });

  test('SC-006: 충돌 경고 후 취소를 선택할 수 있다', async () => {
    // Given: 기존 일정이 있고 충돌 경고 다이얼로그가 표시된 상태
    const existingEvent = TEST_EVENTS.teamMeeting;
    await calendar.fillEventFormBasic(
      existingEvent.title,
      existingEvent.date,
      existingEvent.startTime,
      existingEvent.endTime
    );
    await calendar.submitEvent();

    const overlappingEvent = TEST_EVENTS.overlappingEvent;
    await calendar.fillEventFormBasic(
      overlappingEvent.title,
      overlappingEvent.date,
      overlappingEvent.startTime,
      overlappingEvent.endTime
    );
    await calendar.submitEvent();

    // When: "취소" 버튼을 클릭함
    await expect(calendar.page.locator('text=일정 겹침 경고')).toBeVisible();
    await calendar.page.click('button:has-text("취소")');

    // Then: 다이얼로그가 닫힘
    await expect(calendar.page.locator('text=일정 겹침 경고')).not.toBeVisible();

    // 새 일정이 추가되지 않고 기존 일정만 존재함
    const eventList = calendar.getEventList();
    await expect(eventList).toContainText(existingEvent.title);
    await expect(eventList).not.toContainText(overlappingEvent.title);
  });

  test('EC-003: 동일한 시간대에 여러 충돌 일정이 있을 때 모두 표시된다', async () => {
    // Given: 여러 일정이 동일한 시간대에 존재
    const baseTime = { date: '2024-01-15', start: '10:00', end: '11:00' };

    // 첫 번째 일정 추가
    await calendar.fillEventFormBasic('첫 번째 회의', baseTime.date, baseTime.start, baseTime.end);
    await calendar.submitEvent();

    // 두 번째 일정 추가 (충돌)
    await calendar.fillEventFormBasic('두 번째 회의', baseTime.date, baseTime.start, baseTime.end);
    await calendar.submitEvent();

    // "계속 진행" 클릭하여 두 번째 일정 저장
    await calendar.page.click('button:has-text("계속 진행")');

    // 세 번째 일정 추가 시도 (충돌)
    await calendar.fillEventFormBasic('세 번째 회의', baseTime.date, baseTime.start, baseTime.end);
    await calendar.submitEvent();

    // When: 세 번째 일정 저장 시도 시 경고 표시
    // Then: 여러 충돌 일정이 모두 표시됨
    await expect(calendar.page.locator('text=일정 겹침 경고')).toBeVisible();
    await expect(calendar.page.locator('text=첫 번째 회의')).toBeVisible();
    await expect(calendar.page.locator('text=두 번째 회의')).toBeVisible();
  });

  test('충돌 없이 시간이 인접한 일정은 정상적으로 추가된다', async () => {
    // Given: 기존 일정이 존재
    const existingEvent = TEST_EVENTS.teamMeeting;
    await calendar.fillEventFormBasic(
      existingEvent.title,
      existingEvent.date,
      existingEvent.startTime,
      existingEvent.endTime
    );
    await calendar.submitEvent();

    // When: 충돌하지 않는 인접한 시간의 일정 추가
    await calendar.fillEventFormBasic('다음 회의', existingEvent.date, '11:00', '12:00');
    await calendar.submitEvent();

    // Then: 경고 없이 일정이 추가됨
    await expect(calendar.page.locator('text=일정 겹침 경고')).not.toBeVisible();

    const eventList = calendar.getEventList();
    await expect(eventList).toContainText(existingEvent.title);
    await expect(eventList).toContainText('다음 회의');
  });
});
