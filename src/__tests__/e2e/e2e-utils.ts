import { Page } from '@playwright/test';

/**
 * E2E 테스트용 헬퍼 함수 및 Page Object Pattern
 */

/**
 * 캘린더 페이지 클래스
 * Page Object Pattern을 사용하여 테스트 코드의 가독성과 유지보수성 향상
 */
export class CalendarPage {
  constructor(public page: Page) {
    // Page는 모든 메서드에서 사용됨
  }

  /**
   * 페이지 이동
   */
  async goto() {
    await this.page.goto('/');
    // 페이지가 완전히 로드될 때까지 대기
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * 일정 폼 채우기 (기본 필수 필드)
   */
  async fillEventFormBasic(title: string, date: string, startTime: string, endTime: string) {
    await this.page.fill('#title', title);
    await this.page.fill('#date', date);
    await this.page.fill('#start-time', startTime);
    await this.page.fill('#end-time', endTime);
  }

  /**
   * 일정 폼 채우기 (모든 필드)
   */
  async fillEventFormFull(
    title: string,
    date: string,
    startTime: string,
    endTime: string,
    description?: string,
    location?: string,
    category?: string
  ) {
    await this.fillEventFormBasic(title, date, startTime, endTime);

    if (description) {
      await this.page.fill('#description', description);
    }
    if (location) {
      await this.page.fill('#location', location);
    }
    if (category) {
      // MUI native select의 실제 select 요소를 찾아야 함
      // 내부 구조: MuiSelect-root > select (실제 select 요소)
      await this.page.selectOption('select#category-select', category);
    }
  }

  /**
   * 일정 추가/수정 버튼 클릭
   */
  async submitEvent() {
    await this.page.click('[data-testid="event-submit-button"]');
    // 버튼 클릭 후 잠시 대기 (디바운스 시간)
    await this.page.waitForTimeout(1000);
    
    // 성공 메시지가 표시될 때까지 대기 (최대 3초)
    try {
      await this.page.waitForSelector('text=/일정.*저장/', { timeout: 3000 });
    } catch {
      // 성공 메시지가 없어도 계속 진행 (충돌 다이얼로그가 뜰 수 있음)
    }
    
    // 추가로 API 요청이 완료될 때까지 대기
    await this.page.waitForTimeout(500);
  }

  /**
   * 일정 리스트 가져오기
   */
  getEventList() {
    return this.page.locator('[data-testid="event-list"]');
  }

  /**
   * 검색 입력
   */
  async searchEvents(searchTerm: string) {
    await this.page.fill('#search', searchTerm);
  }

  /**
   * 뷰 전환 (Week/Month)
   */
  async switchView(view: 'week' | 'month') {
    // MUI native select의 실제 select 요소 찾기
    await this.page.selectOption('select#view-select', view);
  }

  /**
   * 네비게이션 (이전/다음)
   */
  async navigate(direction: 'prev' | 'next') {
    const label = direction === 'prev' ? 'Previous' : 'Next';
    await this.page.click(`[aria-label="${label}"]`);
  }

  /**
   * 일정 수정 버튼 클릭 (리스트에서)
   */
  async clickEditEvent(eventTitle: string) {
    // 모든 수정 버튼을 찾고, 해당 일정을 포함하는 박스의 버튼만 클릭
    const editButtons = this.page.locator('[aria-label="Edit event"]');
    for (let i = 0; i < (await editButtons.count()); i++) {
      const button = editButtons.nth(i);
      const parentBox = button.locator('xpath=ancestor::div[contains(@class, "MuiPaper-root")]');
      const hasTitle = (await parentBox.locator(`text=${eventTitle}`).count()) > 0;
      if (hasTitle) {
        await button.click();
        return;
      }
    }
    throw new Error(`일정 "${eventTitle}"을 찾을 수 없습니다.`);
  }

  /**
   * 일정 삭제 버튼 클릭 (리스트에서)
   */
  async clickDeleteEvent(eventTitle: string) {
    // 모든 삭제 버튼을 찾고, 해당 일정을 포함하는 박스의 버튼만 클릭
    const deleteButtons = this.page.locator('[aria-label="Delete event"]');
    for (let i = 0; i < (await deleteButtons.count()); i++) {
      const button = deleteButtons.nth(i);
      const parentBox = button.locator('xpath=ancestor::div[contains(@class, "MuiPaper-root")]');
      const hasTitle = (await parentBox.locator(`text=${eventTitle}`).count()) > 0;
      if (hasTitle) {
        await button.click();
        return;
      }
    }
    throw new Error(`일정 "${eventTitle}"을 찾을 수 없습니다.`);
  }

  /**
   * 알림 설정 선택
   */
  async selectNotification(notificationLabel: string) {
    // MUI native select의 실제 select 요소 찾기
    await this.page.selectOption('select#notification-select', notificationLabel);
  }

  /**
   * 성공/에러 메시지 대기
   */
  async waitForSnackbar(messageText: string) {
    await this.page.waitForSelector(`text=${messageText}`, { timeout: 5000 });
  }
}

/**
 * 테스트 데이터 헬퍼
 */
export const TEST_EVENTS = {
  teamMeeting: {
    title: '팀 미팅',
    date: '2024-01-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '프로젝트 진행 상황 논의',
    location: '회의실 A',
    category: '업무',
  },
  shopping: {
    title: '장보기',
    date: '2024-01-16',
    startTime: '14:00',
    endTime: '15:00',
    description: '마트에서 장보기',
    location: '대형마트',
    category: '개인',
  },
  projectMeeting: {
    title: '프로젝트 회의',
    date: '2024-01-17',
    startTime: '09:00',
    endTime: '10:30',
    description: '프로젝트 진행 상황 회의',
    location: '회의실 B',
    category: '업무',
  },
  overlappingEvent: {
    title: '회의',
    date: '2024-01-15',
    startTime: '10:30',
    endTime: '11:30',
    description: '중복 회의',
    location: '회의실 C',
    category: '업무',
  },
};

/**
 * 공통 테스트 설정
 */
export async function setupTest(page: Page) {
  const calendarPage = new CalendarPage(page);
  await calendarPage.goto();
  return calendarPage;
}
