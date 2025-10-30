/**
 * 반복 일정 통합 테스트
 *
 * User Story: us001-recurring-event-selection.md
 * Acceptance Criteria: Scenario 4, 14
 *
 * 통합 테스트: 폼, 검증, API 연동, 캘린더 표시를 포함한 전체 플로우
 */

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';

import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';

// 현재 앱 구조와 핸들러에 맞춘 최소 통합 시나리오 구현

// 공통 유틸리티
const formatDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getTodayStr = () => formatDate(new Date());

const getRepeatTypeCombobox = async () => {
  // 반복 영역이 나타날 때까지 대기
  await waitFor(() => {
    expect(screen.getByText('반복 유형')).toBeInTheDocument();
  });
  const box = screen.getByText('반복 유형').closest('div') as HTMLElement;
  return within(box).getByRole('combobox');
};

const clickRepeatCheckbox = async () => {
  await userEvent.click(screen.getByLabelText('반복 일정'));
  // 반복 영역이 나타날 때까지 대기
  await waitFor(() => {
    expect(screen.getByText('반복 유형')).toBeInTheDocument();
  });
};

const setRepeatTypeWeekly = async () => {
  const combobox = await getRepeatTypeCombobox();
  await userEvent.click(combobox);
  await waitFor(() => {
    expect(screen.getByRole('option', { name: '매주' })).toBeInTheDocument();
  });
  await userEvent.click(screen.getByRole('option', { name: '매주' }));
};

const setRepeatInterval = async (interval: string) => {
  await userEvent.clear(screen.getByLabelText('반복 간격'));
  await userEvent.type(screen.getByLabelText('반복 간격'), interval);
};

const setRepeatEndDate = async (endStr: string) => {
  await userEvent.type(screen.getByLabelText('반복 종료일'), endStr);
};

const activateWeeklyRepeat = async (options?: { interval?: string; endDate?: string }) => {
  await clickRepeatCheckbox();
  await setRepeatTypeWeekly();
  if (options?.interval) {
    await setRepeatInterval(options.interval);
  }
  if (options?.endDate) {
    await setRepeatEndDate(options.endDate);
  }
};

const fillRequiredFields = async (args: {
  title: string;
  date: string;
  start?: string;
  end?: string;
}) => {
  const { title, date, start = '09:00', end = '10:00' } = args;
  await userEvent.type(screen.getByLabelText('제목'), title);
  await userEvent.type(screen.getByLabelText('날짜'), date);
  await userEvent.type(screen.getByLabelText('시작 시간'), start);
  await userEvent.type(screen.getByLabelText('종료 시간'), end);
};

const submitAndExpectSuccess = async () => {
  await userEvent.click(screen.getByTestId('event-submit-button'));
  const snackbar = await screen.findByText('일정이 추가되었습니다.');
  expect(snackbar).toBeInTheDocument();
};

const switchToWeekView = async () => {
  await userEvent.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
  await waitFor(() => {
    expect(screen.getByRole('option', { name: 'week-option' })).toBeInTheDocument();
  });
  await userEvent.click(screen.getByRole('option', { name: 'week-option' }));
};

const navigateNext = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'Next' }));
};

describe('반복 일정 통합 테스트', () => {
  beforeEach(() => {
    // 기본 성공 핸들러 설정 (테스트별로 필요 시 override)
    setupMockHandlerCreation();
  });

  describe('일정 생성 플로우', () => {
    it('반복 설정을 활성화하고 유효한 규칙으로 일정을 생성한다', async () => {
      render(<App />);

      await fillRequiredFields({
        title: '주간 미팅',
        date: '2025-11-05',
        start: '09:00',
        end: '10:00',
      });
      await activateWeeklyRepeat({ interval: '1', endDate: '2025-11-26' });

      await submitAndExpectSuccess();
      await waitFor(() => expect(screen.getByTestId('event-list')).toBeInTheDocument());
      expect(screen.getByTestId('event-list').textContent).toContain('주간 미팅');
    });

    it('반복 설정이 비활성화되면 단일 일정만 생성한다', async () => {
      render(<App />);

      await fillRequiredFields({
        title: '단일 일정',
        date: '2025-11-01',
        start: '13:00',
        end: '14:00',
      });
      await submitAndExpectSuccess();
      expect(screen.getByTestId('event-list').textContent).toContain('단일 일정');
    });
  });

  describe('API 연동', () => {
    it('API 에러 발생 시 적절히 처리한다', async () => {
      server.use(
        http.post('/api/events', () =>
          HttpResponse.json({ error: 'Internal Error' }, { status: 500 })
        )
      );

      render(<App />);

      await fillRequiredFields({
        title: '저장 실패 케이스',
        date: '2025-11-01',
        start: '09:00',
        end: '10:00',
      });

      await userEvent.click(screen.getByTestId('event-submit-button'));

      await waitFor(() => expect(screen.getByText('일정 저장 실패')).toBeInTheDocument());
    });
  });

  describe('반복 아이콘 표시', () => {
    it('반복 일정에는 반복 아이콘이 표시된다 (이벤트 목록)', async () => {
      render(<App />);

      const todayStr = getTodayStr();

      await fillRequiredFields({
        title: '오늘 반복 미팅',
        date: todayStr,
        start: '09:00',
        end: '10:00',
      });
      await activateWeeklyRepeat({ interval: '1' });
      await submitAndExpectSuccess();

      const titleEl = await screen.findByText('오늘 반복 미팅');
      const card = titleEl.closest('div') as HTMLElement;
      expect(card).toBeTruthy();
      expect(within(card).getByLabelText('반복 일정')).toBeInTheDocument();
    });

    it('단일 일정에는 반복 아이콘이 표시되지 않는다 (이벤트 목록)', async () => {
      render(<App />);

      const todayStr = getTodayStr();

      await fillRequiredFields({
        title: '오늘 단일 일정',
        date: todayStr,
        start: '13:00',
        end: '14:00',
      });
      await submitAndExpectSuccess();

      const snackbar = await screen.findByText('일정이 추가되었습니다.');
      expect(snackbar).toBeInTheDocument();

      const titleEl = await screen.findByText('오늘 단일 일정');
      const card = titleEl.closest('div') as HTMLElement;
      expect(card).toBeTruthy();
      expect(within(card).queryByLabelText('반복 일정')).toBeNull();
    });

    it('월간 캘린더 셀에서도 반복 일정에 아이콘이 표시된다', async () => {
      render(<App />);

      // 기본 뷰는 Month
      const todayStr = getTodayStr();

      await fillRequiredFields({
        title: '월간 반복 테스트',
        date: todayStr,
        start: '09:00',
        end: '10:00',
      });
      await activateWeeklyRepeat({ interval: '1' });
      await submitAndExpectSuccess();

      const monthView = screen.getByTestId('month-view');
      const titleEl = await within(monthView).findByText('월간 반복 테스트');
      const container = titleEl.closest('div') as HTMLElement;
      expect(container).toBeTruthy();
      expect(within(container).getByLabelText('반복 일정')).toBeInTheDocument();
    });

    it('주간 캘린더 셀에서도 반복 아이콘이 표시된다', async () => {
      render(<App />);

      // 뷰를 Week로 변경
      await switchToWeekView();

      const todayStr = getTodayStr();

      await fillRequiredFields({
        title: '주간 반복 테스트',
        date: todayStr,
        start: '11:00',
        end: '12:00',
      });
      await activateWeeklyRepeat({ interval: '1' });
      await submitAndExpectSuccess();

      const weekView = screen.getByTestId('week-view');
      const titleEl = await within(weekView).findByText('주간 반복 테스트');
      const container = titleEl.closest('div') as HTMLElement;
      expect(container).toBeTruthy();
      expect(within(container).getByLabelText('반복 일정')).toBeInTheDocument();
    });

    it('주간 뷰: 다음 주로 이동하면 미래 인스턴스와 반복 아이콘이 표시된다', async () => {
      render(<App />);

      // Week로 전환 (Select 열기)
      await switchToWeekView();

      // 오늘 날짜 문자열
      const today = new Date();
      const todayStr = formatDate(today);

      // 매주 반복 일정 생성 (종료일은 3주 뒤)
      const threeWeeksLater = new Date(today);
      threeWeeksLater.setDate(today.getDate() + 21);
      const endStr = formatDate(threeWeeksLater);

      await fillRequiredFields({
        title: '주간 네비게이션 테스트',
        date: todayStr,
        start: '10:00',
        end: '11:00',
      });
      await activateWeeklyRepeat({ interval: '1', endDate: endStr });
      await submitAndExpectSuccess();

      // 다음 주로 이동
      await navigateNext();

      const weekView = screen.getByTestId('week-view');
      const titleEl = await within(weekView).findByText('주간 네비게이션 테스트');
      const container = titleEl.closest('div') as HTMLElement;
      expect(container).toBeTruthy();
      expect(within(container).getByLabelText('반복 일정')).toBeInTheDocument();
    });

    it('월간 뷰: 다음 달로 이동하면 미래 인스턴스와 반복 아이콘이 표시된다', async () => {
      render(<App />);

      // 기본은 Month 뷰
      const today = new Date();
      const todayStr = formatDate(today);

      // 종료일은 한 달 뒤로 설정
      const nextMonthDate = new Date(today);
      nextMonthDate.setMonth(today.getMonth() + 1);
      const endStr = formatDate(nextMonthDate);

      await fillRequiredFields({
        title: '월간 네비게이션 테스트',
        date: todayStr,
        start: '09:00',
        end: '10:00',
      });
      await activateWeeklyRepeat({ interval: '1', endDate: endStr });
      await submitAndExpectSuccess();

      // 다음 달로 이동
      await navigateNext();

      const monthView = screen.getByTestId('month-view');
      const titleEl = await within(monthView).findByText('월간 네비게이션 테스트');
      const container = titleEl.closest('div') as HTMLElement;
      expect(container).toBeTruthy();
      expect(within(container).getByLabelText('반복 일정')).toBeInTheDocument();
    });
  });
});
