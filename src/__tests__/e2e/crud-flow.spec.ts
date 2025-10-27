import { test, expect } from '@playwright/test';
import { CalendarPage, setupTest, TEST_EVENTS } from './e2e-utils';

test.describe('일정 CRUD 워크플로우', () => {
  let calendar: CalendarPage;

  test.beforeEach(async ({ page }) => {
    calendar = await setupTest(page);
  });

  test('SC-001: 기본 일정을 추가할 수 있다', async () => {
    // Given: 캘린더 페이지에 접속, 폼이 비어있는 초기 상태
    const event = TEST_EVENTS.teamMeeting;

    // When: 사용자가 폼에 모든 정보를 입력하고 저장
    await calendar.fillEventFormFull(
      event.title,
      event.date,
      event.startTime,
      event.endTime,
      event.description,
      event.location,
      event.category
    );
    await calendar.submitEvent();

    // Then: 일정이 일정 리스트에 표시됨
    const eventList = calendar.getEventList();
    await expect(eventList).toContainText(event.title);
    await expect(eventList).toContainText(event.description!);
    await expect(eventList).toContainText(event.location!);

    // 폼이 초기화되었는지 확인 (제목 필드가 비어있음)
    await expect(calendar.page.locator('#title')).toHaveValue('');
  });

  test('SC-002: 필수 필드 누락 시 에러 메시지가 표시된다', async () => {
    // Given: 폼이 비어있는 상태

    // When: 필수 필드 없이 저장 버튼 클릭
    await calendar.submitEvent();

    // Then: 에러 메시지가 표시됨
    await expect(calendar.page.locator('text=필수 정보를 모두 입력해주세요.')).toBeVisible();
  });

  test('SC-003: 시작 시간과 종료 시간이 같을 수 있다', async () => {
    // Given: 기본 정보 입력
    const event = TEST_EVENTS.teamMeeting;

    // When: 시작 시간과 종료 시간이 같은 일정 추가
    await calendar.fillEventFormBasic(event.title, event.date, '10:00', '10:00');
    await calendar.submitEvent();

    // Then: 일정이 추가됨
    await expect(calendar.getEventList()).toContainText(event.title);
  });

  test('SC-004: 설명과 위치 없이 기본 필드만으로 일정 추가 가능', async () => {
    // Given: 폼이 비어있는 상태

    // When: 필수 필드만 입력
    const event = TEST_EVENTS.teamMeeting;
    await calendar.fillEventFormBasic(event.title, event.date, event.startTime, event.endTime);
    await calendar.submitEvent();

    // Then: 일정이 추가됨
    await expect(calendar.getEventList()).toContainText(event.title);
  });

  test('SC-007: 기존 일정을 수정할 수 있다', async () => {
    // Given: 이미 저장된 일정이 있음
    const originalEvent = TEST_EVENTS.teamMeeting;
    await calendar.fillEventFormFull(
      originalEvent.title,
      originalEvent.date,
      originalEvent.startTime,
      originalEvent.endTime,
      originalEvent.description,
      originalEvent.location,
      originalEvent.category
    );
    await calendar.submitEvent();

    // When: 일정을 수정함
    await calendar.clickEditEvent(originalEvent.title);

    // 수정 페이지에서 제목 변경
    await calendar.page.fill('#title', '팀 미팅 (수정됨)');
    await calendar.submitEvent();

    // Then: 수정된 일정이 표시됨
    const eventList = calendar.getEventList();
    await expect(eventList).toContainText('팀 미팅 (수정됨)');
    await expect(eventList).not.toContainText(originalEvent.title);
  });

  test('SC-008: 일정을 삭제할 수 있다', async () => {
    // Given: 이미 저장된 일정이 있음
    const event = TEST_EVENTS.teamMeeting;
    await calendar.fillEventFormBasic(event.title, event.date, event.startTime, event.endTime);
    await calendar.submitEvent();

    // 일정이 추가되었는지 확인
    await expect(calendar.getEventList()).toContainText(event.title);

    // When: 일정을 삭제함
    await calendar.clickDeleteEvent(event.title);

    // Then: 일정이 리스트에서 제거됨
    await expect(calendar.getEventList()).not.toContainText(event.title);
  });

  test('SC-007: 일정 수정 시 폼이 자동으로 채워진다', async () => {
    // Given: 저장된 일정이 있음
    const event = TEST_EVENTS.teamMeeting;
    await calendar.fillEventFormFull(
      event.title,
      event.date,
      event.startTime,
      event.endTime,
      event.description,
      event.location,
      event.category
    );
    await calendar.submitEvent();

    // When: 수정 버튼 클릭
    await calendar.clickEditEvent(event.title);

    // Then: 폼이 해당 일정 정보로 채워짐
    await expect(calendar.page.locator('#title')).toHaveValue(event.title);
    await expect(calendar.page.locator('#date')).toHaveValue(event.date);
    await expect(calendar.page.locator('#start-time')).toHaveValue(event.startTime);
    await expect(calendar.page.locator('#end-time')).toHaveValue(event.endTime);
    await expect(calendar.page.locator('#description')).toHaveValue(event.description!);
    await expect(calendar.page.locator('#location')).toHaveValue(event.location!);
  });
});
