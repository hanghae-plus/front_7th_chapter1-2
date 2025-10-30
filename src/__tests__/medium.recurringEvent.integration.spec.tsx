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

import App from '../App';
import { server } from '../setupTests';

// 현재 앱 구조와 핸들러에 맞춘 최소 통합 시나리오 구현

describe('반복 일정 통합 테스트', () => {
  beforeEach(() => {
    // 기본 핸들러 유지. 필요 시 테스트별로 override
  });

  describe('일정 생성 플로우', () => {
    it('반복 설정을 활성화하고 유효한 규칙으로 일정을 생성한다', async () => {
      render(<App />);

      // 필수 필드 입력
      await userEvent.type(screen.getByLabelText('제목'), '주간 미팅');
      await userEvent.type(screen.getByLabelText('날짜'), '2025-11-05');
      await userEvent.type(screen.getByLabelText('시작 시간'), '09:00');
      await userEvent.type(screen.getByLabelText('종료 시간'), '10:00');

      // 반복 설정 활성화 및 유형/간격/종료일 지정
      await userEvent.click(screen.getByLabelText('반복 일정'));
      // 반복 유형 기본은 '매일'로 표시되므로 열어서 '매주' 선택
      await userEvent.click(screen.getByRole('button', { name: '매일' }));
      await userEvent.click(screen.getByRole('option', { name: '매주' }));
      await userEvent.clear(screen.getByLabelText('반복 간격'));
      await userEvent.type(screen.getByLabelText('반복 간격'), '1');
      await userEvent.type(screen.getByLabelText('반복 종료일'), '2025-11-26');

      await userEvent.click(screen.getByTestId('event-submit-button'));

      // 성공 스낵바 및 리스트 반영 확인
      await waitFor(() => expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument());
      await waitFor(() => expect(screen.getByTestId('event-list')).toBeInTheDocument());
      expect(screen.getByTestId('event-list').textContent).toContain('주간 미팅');
    });

    it('반복 설정이 비활성화되면 단일 일정만 생성한다', async () => {
      render(<App />);

      await userEvent.type(screen.getByLabelText('제목'), '단일 일정');
      await userEvent.type(screen.getByLabelText('날짜'), '2025-11-01');
      await userEvent.type(screen.getByLabelText('시작 시간'), '13:00');
      await userEvent.type(screen.getByLabelText('종료 시간'), '14:00');

      await userEvent.click(screen.getByTestId('event-submit-button'));

      await waitFor(() => expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument());
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

      await userEvent.type(screen.getByLabelText('제목'), '저장 실패 케이스');
      await userEvent.type(screen.getByLabelText('날짜'), '2025-11-01');
      await userEvent.type(screen.getByLabelText('시작 시간'), '09:00');
      await userEvent.type(screen.getByLabelText('종료 시간'), '10:00');

      await userEvent.click(screen.getByTestId('event-submit-button'));

      await waitFor(() => expect(screen.getByText('일정 저장 실패')).toBeInTheDocument());
    });
  });

  describe('반복 아이콘 표시', () => {
    it('반복 일정에는 반복 아이콘이 표시된다 (이벤트 목록)', async () => {
      render(<App />);

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      await userEvent.type(screen.getByLabelText('제목'), '오늘 반복 미팅');
      await userEvent.type(screen.getByLabelText('날짜'), todayStr);
      await userEvent.type(screen.getByLabelText('시작 시간'), '09:00');
      await userEvent.type(screen.getByLabelText('종료 시간'), '10:00');

      await userEvent.click(screen.getByLabelText('반복 일정'));
      await userEvent.click(screen.getByRole('button', { name: '매일' }));
      await userEvent.click(screen.getByRole('option', { name: '매주' }));
      await userEvent.clear(screen.getByLabelText('반복 간격'));
      await userEvent.type(screen.getByLabelText('반복 간격'), '1');

      await userEvent.click(screen.getByTestId('event-submit-button'));

      await waitFor(() => expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument());

      const titleEl = await screen.findByText('오늘 반복 미팅');
      const card = titleEl.closest('div') as HTMLElement;
      expect(card).toBeTruthy();
      expect(within(card).getByLabelText('반복 일정')).toBeInTheDocument();
    });

    it('단일 일정에는 반복 아이콘이 표시되지 않는다 (이벤트 목록)', async () => {
      render(<App />);

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      await userEvent.type(screen.getByLabelText('제목'), '오늘 단일 일정');
      await userEvent.type(screen.getByLabelText('날짜'), todayStr);
      await userEvent.type(screen.getByLabelText('시작 시간'), '13:00');
      await userEvent.type(screen.getByLabelText('종료 시간'), '14:00');

      await userEvent.click(screen.getByTestId('event-submit-button'));

      await waitFor(() => expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument());

      const titleEl = await screen.findByText('오늘 단일 일정');
      const card = titleEl.closest('div') as HTMLElement;
      expect(card).toBeTruthy();
      expect(within(card).queryByLabelText('반복 일정')).toBeNull();
    });

    it('월간 캘린더 셀에서도 반복 일정에 아이콘이 표시된다', async () => {
      render(<App />);

      // 기본 뷰는 Month
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      await userEvent.type(screen.getByLabelText('제목'), '월간 반복 테스트');
      await userEvent.type(screen.getByLabelText('날짜'), todayStr);
      await userEvent.type(screen.getByLabelText('시작 시간'), '09:00');
      await userEvent.type(screen.getByLabelText('종료 시간'), '10:00');
      await userEvent.click(screen.getByLabelText('반복 일정'));
      await userEvent.click(screen.getByRole('button', { name: '매일' }));
      await userEvent.click(screen.getByRole('option', { name: '매주' }));
      await userEvent.clear(screen.getByLabelText('반복 간격'));
      await userEvent.type(screen.getByLabelText('반복 간격'), '1');
      await userEvent.click(screen.getByTestId('event-submit-button'));

      await waitFor(() => expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument());

      const monthView = screen.getByTestId('month-view');
      const titleEl = await within(monthView).findByText('월간 반복 테스트');
      const container = titleEl.closest('div') as HTMLElement;
      expect(container).toBeTruthy();
      expect(within(container).getByLabelText('반복 일정')).toBeInTheDocument();
    });

    it('주간 캘린더 셀에서도 반복 아이콘이 표시된다', async () => {
      render(<App />);

      // 뷰를 Week로 변경
      await userEvent.click(screen.getByRole('button', { name: 'Month' }));
      await userEvent.click(screen.getByRole('option', { name: 'Week' }));

      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      await userEvent.type(screen.getByLabelText('제목'), '주간 반복 테스트');
      await userEvent.type(screen.getByLabelText('날짜'), todayStr);
      await userEvent.type(screen.getByLabelText('시작 시간'), '11:00');
      await userEvent.type(screen.getByLabelText('종료 시간'), '12:00');
      await userEvent.click(screen.getByLabelText('반복 일정'));
      await userEvent.click(screen.getByRole('button', { name: '매일' }));
      await userEvent.click(screen.getByRole('option', { name: '매주' }));
      await userEvent.clear(screen.getByLabelText('반복 간격'));
      await userEvent.type(screen.getByLabelText('반복 간격'), '1');
      await userEvent.click(screen.getByTestId('event-submit-button'));

      await waitFor(() => expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument());

      const weekView = screen.getByTestId('week-view');
      const titleEl = await within(weekView).findByText('주간 반복 테스트');
      const container = titleEl.closest('div') as HTMLElement;
      expect(container).toBeTruthy();
      expect(within(container).getByLabelText('반복 일정')).toBeInTheDocument();
    });

    it('주간 뷰: 다음 주로 이동하면 미래 인스턴스와 반복 아이콘이 표시된다', async () => {
      render(<App />);

      // Week로 전환
      await userEvent.click(screen.getByRole('button', { name: 'Month' }));
      await userEvent.click(screen.getByRole('option', { name: 'Week' }));

      // 오늘 날짜 문자열
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      // 매주 반복 일정 생성 (종료일은 3주 뒤)
      const threeWeeksLater = new Date(today);
      threeWeeksLater.setDate(today.getDate() + 21);
      const eyyyy = threeWeeksLater.getFullYear();
      const emm = String(threeWeeksLater.getMonth() + 1).padStart(2, '0');
      const edd = String(threeWeeksLater.getDate()).padStart(2, '0');
      const endStr = `${eyyyy}-${emm}-${edd}`;

      await userEvent.type(screen.getByLabelText('제목'), '주간 네비게이션 테스트');
      await userEvent.type(screen.getByLabelText('날짜'), todayStr);
      await userEvent.type(screen.getByLabelText('시작 시간'), '10:00');
      await userEvent.type(screen.getByLabelText('종료 시간'), '11:00');
      await userEvent.click(screen.getByLabelText('반복 일정'));
      await userEvent.click(screen.getByRole('button', { name: '매일' }));
      await userEvent.click(screen.getByRole('option', { name: '매주' }));
      await userEvent.clear(screen.getByLabelText('반복 간격'));
      await userEvent.type(screen.getByLabelText('반복 간격'), '1');
      await userEvent.type(screen.getByLabelText('반복 종료일'), endStr);
      await userEvent.click(screen.getByTestId('event-submit-button'));

      await waitFor(() => expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument());

      // 다음 주로 이동
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

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
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const todayStr = `${yyyy}-${mm}-${dd}`;

      // 종료일은 한 달 뒤로 설정
      const nextMonthDate = new Date(today);
      nextMonthDate.setMonth(today.getMonth() + 1);
      const eyyyy = nextMonthDate.getFullYear();
      const emm = String(nextMonthDate.getMonth() + 1).padStart(2, '0');
      const edd = String(nextMonthDate.getDate()).padStart(2, '0');
      const endStr = `${eyyyy}-${emm}-${edd}`;

      await userEvent.type(screen.getByLabelText('제목'), '월간 네비게이션 테스트');
      await userEvent.type(screen.getByLabelText('날짜'), todayStr);
      await userEvent.type(screen.getByLabelText('시작 시간'), '09:00');
      await userEvent.type(screen.getByLabelText('종료 시간'), '10:00');
      await userEvent.click(screen.getByLabelText('반복 일정'));
      await userEvent.click(screen.getByRole('button', { name: '매일' }));
      await userEvent.click(screen.getByRole('option', { name: '매주' }));
      await userEvent.clear(screen.getByLabelText('반복 간격'));
      await userEvent.type(screen.getByLabelText('반복 간격'), '1');
      await userEvent.type(screen.getByLabelText('반복 종료일'), endStr);
      await userEvent.click(screen.getByTestId('event-submit-button'));

      await waitFor(() => expect(screen.getByText('일정이 추가되었습니다.')).toBeInTheDocument());

      // 다음 달로 이동
      await userEvent.click(screen.getByRole('button', { name: 'Next' }));

      const monthView = screen.getByTestId('month-view');
      const titleEl = await within(monthView).findByText('월간 네비게이션 테스트');
      const container = titleEl.closest('div') as HTMLElement;
      expect(container).toBeTruthy();
      expect(within(container).getByLabelText('반복 일정')).toBeInTheDocument();
    });
  });
});
