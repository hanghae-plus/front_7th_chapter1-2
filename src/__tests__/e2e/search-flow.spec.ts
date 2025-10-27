import { test, expect } from '@playwright/test';

import { CalendarPage, setupTest, TEST_EVENTS } from './e2e-utils';

test.describe('검색 기능', () => {
  let calendar: CalendarPage;

  test.beforeEach(async ({ page }) => {
    calendar = await setupTest(page);

    // Given: 여러 일정이 존재하는 상태로 만들기
    const events = [TEST_EVENTS.teamMeeting, TEST_EVENTS.shopping, TEST_EVENTS.projectMeeting];

    for (const event of events) {
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
      // 일정 추가 후 다이얼로그가 있을 수 있으므로 잠시 대기
      await calendar.page.waitForTimeout(100);
    }
  });

  test('SC-009: 검색어로 일정을 필터링할 수 있다', async () => {
    // Given: 여러 일정이 존재

    // When: 검색 필드에 "팀"을 입력함
    await calendar.searchEvents('팀');

    // Then: 검색 결과에 "팀 미팅"만 표시됨
    const eventList = calendar.getEventList();
    await expect(eventList).toContainText('팀 미팅');
    await expect(eventList).not.toContainText('장보기');
    await expect(eventList).not.toContainText('프로젝트 회의');
  });

  test('검색은 대소문자를 구분하지 않는다', async () => {
    // Given: 여러 일정이 존재

    // When: 대문자로 검색
    await calendar.searchEvents('TEAM');

    // Then: "팀 미팅"이 표시됨 (대소문자 무관)
    await expect(calendar.getEventList()).toContainText('팀 미팅');
  });

  test('SC-010: 검색 결과가 없을 때 "검색 결과가 없습니다" 메시지가 표시된다', async () => {
    // Given: 여러 일정이 존재

    // When: 존재하지 않는 검색어 입력
    await calendar.searchEvents('존재하지않는키워드');

    // Then: "검색 결과가 없습니다." 메시지가 표시됨
    await expect(calendar.page.locator('text=검색 결과가 없습니다.')).toBeVisible();

    // 일정 리스트가 비어있는지 확인
    const eventList = calendar.getEventList();
    await expect(eventList).not.toContainText('팀 미팅');
    await expect(eventList).not.toContainText('장보기');
    await expect(eventList).not.toContainText('프로젝트 회의');
  });

  test('SC-011: 검색어를 지우면 모든 일정이 다시 표시된다', async () => {
    // Given: 검색어가 입력되어 있고 필터링된 상태
    await calendar.searchEvents('팀');

    // 검색 결과 확인
    await expect(calendar.getEventList()).toContainText('팀 미팅');
    await expect(calendar.getEventList()).not.toContainText('장보기');

    // When: 검색 필드를 지움
    await calendar.searchEvents('');

    // Then: 모든 일정이 다시 표시됨
    const eventList = calendar.getEventList();
    await expect(eventList).toContainText('팀 미팅');
    await expect(eventList).toContainText('장보기');
    await expect(eventList).toContainText('프로젝트 회의');
  });

  test('부분 일치 검색이 가능하다', async () => {
    // Given: 여러 일정이 존재

    // When: 일부 문자만 검색
    await calendar.searchEvents('회의');

    // Then: "팀 미팅"과 "프로젝트 회의"가 모두 표시됨
    const eventList = calendar.getEventList();
    await expect(eventList).toContainText('팀 미팅');
    await expect(eventList).toContainText('프로젝트 회의');
    await expect(eventList).not.toContainText('장보기');
  });

  test('설명 필드에서도 검색이 가능하다', async () => {
    // Given: 여러 일정이 존재

    // When: 설명에 포함된 텍스트로 검색
    await calendar.searchEvents('프로젝트');

    // Then: "프로젝트 회의"가 표시됨
    await expect(calendar.getEventList()).toContainText('프로젝트 회의');
  });

  test('위치 필드에서도 검색이 가능하다', async () => {
    // Given: 여러 일정이 존재

    // When: 위치 이름으로 검색
    await calendar.searchEvents('회의실');

    // Then: "회의실"이 포함된 일정이 표시됨
    const eventList = calendar.getEventList();
    await expect(eventList).toContainText('팀 미팅');
    await expect(eventList).toContainText('프로젝트 회의');
  });

  test('카테고리로 검색이 가능하다', async () => {
    // Given: 여러 일정이 존재 (여러 카테고리)

    // When: 카테고리명으로 검색
    await calendar.searchEvents('개인');

    // Then: "개인" 카테고리 일정만 표시됨
    await expect(calendar.getEventList()).toContainText('장보기');
    await expect(calendar.getEventList()).not.toContainText('팀 미팅');
  });
});
