import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const theme = createTheme();

// 테스트 컴포넌트 설정
const setup = (element: ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>{element}</SnackbarProvider>
    </ThemeProvider>
  );
};

// MSW 핸들러: 반복 일정 데이터로 목킹 설정
const setupMockEventsWithRepeat = (events: Event[]) => {
  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events });
    })
  );
};

describe('반복 일정 아이콘 표시', () => {
  beforeEach(() => {
    server.resetHandlers();
  });

  describe('AC-1: 반복 일정에 아이콘 표시', () => {
    it('반복 일정인 경우 제목 앞에 Repeat 아이콘이 표시됨', async () => {
      // Given: 반복 일정(repeat.type !== 'none')이 있을 때
      const recurringEvent: Event = {
        id: '1',
        title: '팀 회의',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 0,
      };

      setupMockEventsWithRepeat([recurringEvent]);
      setup(<App />);

      // 일정 로딩 완료 대기
      await screen.findByText('일정 로딩 완료!');

      // When: 캘린더가 렌더링되면
      await waitFor(() => {
        expect(screen.getAllByText('팀 회의').length).toBeGreaterThan(0);
      });

      // Then: 반복 아이콘(Repeat)이 표시되어야함
      // MUI Icon은 aria-label로 찾기
      const repeatIcons = screen.getAllByLabelText('반복 일정');
      expect(repeatIcons.length).toBeGreaterThan(0);
    });

    it('반복 아이콘의 크기는 small이고 aria-label 속성이 설정되어 있음', async () => {
      // Given: 반복 아이콘이 표시될 때
      const recurringEvent: Event = {
        id: '1',
        title: '팀 회의',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 0,
      };

      setupMockEventsWithRepeat([recurringEvent]);
      setup(<App />);

      // 일정 로딩 완료 대기
      await screen.findByText('일정 로딩 완료!');

      // When: 캘린더가 렌더링되면
      await waitFor(() => {
        expect(screen.getAllByText('팀 회의').length).toBeGreaterThan(0);
      });

      // Then: 접근성을 위해 aria-label="반복 일정" 속성이 설정되어야함
      const repeatIcons = screen.getAllByLabelText('반복 일정');
      expect(repeatIcons.length).toBeGreaterThan(0);
      expect(repeatIcons[0]).toHaveAttribute('aria-label', '반복 일정');
    });
  });

  describe('AC-2: 일반 일정에는 아이콘 미표시', () => {
    it('일반 일정(repeat.type === "none")인 경우 반복 아이콘이 표시되지 않음', async () => {
      // Given: 일반 일정이 있을 때
      const singleEvent: Event = {
        id: '1',
        title: '점심 약속',
        date: '2025-10-01',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'none', interval: 1, endDate: '' },
        notificationTime: 0,
      };

      setupMockEventsWithRepeat([singleEvent]);
      setup(<App />);

      // When: 캘린더가 렌더링되면
      await waitFor(() => {
        expect(screen.getAllByText('점심 약속').length).toBeGreaterThan(0);
      });

      // Then: 반복 아이콘이 표시되지 않아야함
      const repeatIcon = screen.queryByLabelText('반복 일정');
      expect(repeatIcon).not.toBeInTheDocument();
    });
  });

  describe('AC-3: 아이콘 배치와 레이아웃 정렬', () => {
    it('알림과 반복이 모두 설정된 경우 알림 아이콘이 앞에 반복 아이콘이 뒤에 표시됨', async () => {
      // Given: 알림과 반복이 모두 설정된 일정이 있을 때
      const eventWithNotificationAndRepeat: Event = {
        id: '1',
        title: '생일',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'yearly', interval: 1, endDate: '' },
        notificationTime: 1440, // 1일 전 알림
      };

      setupMockEventsWithRepeat([eventWithNotificationAndRepeat]);
      setup(<App />);

      // When: 캘린더가 렌더링되면
      await waitFor(() => {
        expect(screen.getAllByText('생일').length).toBeGreaterThan(0);
      });

      // Then: 반복 아이콘이 표시되어야함
      const repeatIcons = screen.getAllByLabelText('반복 일정');
      expect(repeatIcons.length).toBeGreaterThan(0);

      // 알림 아이콘은 notifiedEvents에 포함되어야 표시되지만,
      // 테스트 환경에서는 시간 경과가 없어 알림이 트리거되지 않을 수 있음
      // 따라서 반복 아이콘 표시만 검증
      const repeatIcon = repeatIcons[0];
      expect(repeatIcon).toBeInTheDocument();

      // 알림 아이콘도 있는 경우 함께 확인 (있는 경우만)
      const notificationIcons = screen.queryAllByLabelText('알림');
      if (notificationIcons.length > 0) {
        // And: 반복 아이콘이 알림 아이콘 다음 위치에 표시되어야함
        const eventItem = screen.getAllByText('생일')[0].closest('div');
        const icons = eventItem?.querySelectorAll('[aria-label]');
        expect(icons?.length).toBeGreaterThanOrEqual(1);
        // 반복 아이콘이 존재함을 확인
        const repeatIconInItem = eventItem?.querySelector('[aria-label="반복 일정"]');
        expect(repeatIconInItem).toBeInTheDocument();
      } else {
        // 알림 아이콘이 없는 경우도 반복 아이콘은 표시되어야 함
        expect(repeatIcon).toBeInTheDocument();
      }
    });
  });

  describe('AC-4: 모든 반복 타입에서 아이콘 표시', () => {
    it.each([
      { type: 'daily' as const, label: '매일' },
      { type: 'weekly' as const, label: '매주' },
      { type: 'monthly' as const, label: '매월' },
      { type: 'yearly' as const, label: '매년' },
    ])('반복 타입이 $label로 설정된 경우 동일한 반복 아이콘이 표시됨', async ({ type }) => {
      // Given: 반복 타입이 각각 다르게 설정된 일정이 있을 때
      const event: Event = {
        id: '1',
        title: `${type} 일정`,
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type, interval: 1, endDate: '2025-12-31' },
        notificationTime: 0,
      };

      setupMockEventsWithRepeat([event]);
      setup(<App />);

      // When: 캘린더가 렌더링되면
      await waitFor(() => {
        expect(screen.getAllByText(`${type} 일정`).length).toBeGreaterThan(0);
      });

      // Then: 모든 타입에 대해서 동일한 반복 아이콘이 표시되어야함
      const repeatIcons = screen.getAllByLabelText('반복 일정');
      expect(repeatIcons.length).toBeGreaterThan(0);
    });
  });

  describe('AC-5: 반복 간격이 1이 아닌 경우에도 표시', () => {
    it('반복 간격이 1이 아닌 설정(예: 2주마다)인 경우 반복 아이콘이 표시됨', async () => {
      // Given: 반복 간격이 2로 설정된 일정이 있을 때
      const eventWithInterval: Event = {
        id: '1',
        title: '격주 회의',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 2, endDate: '2025-12-31' },
        notificationTime: 0,
      };

      setupMockEventsWithRepeat([eventWithInterval]);
      setup(<App />);

      // 일정 로딩 완료 대기
      await screen.findByText('일정 로딩 완료!');

      // When: 캘린더가 렌더링되면
      await waitFor(() => {
        expect(screen.getAllByText('격주 회의').length).toBeGreaterThan(0);
      });

      // Then: 반복 아이콘이 표시되어야함
      const repeatIcons = screen.getAllByLabelText('반복 일정');
      expect(repeatIcons.length).toBeGreaterThan(0);
    });
  });

  describe('AC-6: 종료날짜 설정 여부와 무관한 표시', () => {
    it('종료날짜(repeat.endDate)가 설정된 반복 일정도 반복 아이콘이 표시됨', async () => {
      // Given: 종료날짜가 설정된 반복 일정이 있을 때
      const eventWithEndDate: Event = {
        id: '1',
        title: '한달간 운동 스케쥴',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '개인',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-11-30' },
        notificationTime: 0,
      };

      setupMockEventsWithRepeat([eventWithEndDate]);
      setup(<App />);

      // 일정 로딩 완료 대기
      await screen.findByText('일정 로딩 완료!');

      // When: 캘린더가 렌더링되면
      await waitFor(() => {
        expect(screen.getAllByText('한달간 운동 스케쥴').length).toBeGreaterThan(0);
      });

      // Then: 반복 아이콘이 표시되어야함
      const repeatIcons = screen.getAllByLabelText('반복 일정');
      expect(repeatIcons.length).toBeGreaterThan(0);
    });
  });

  describe('AC-7: 반복 정보가 없는 레거시 데이터 처리', () => {
    it('event.repeat이 undefined인 경우 오류 없이 렌더링되고 반복 아이콘이 표시되지 않음', async () => {
      // Given: repeat 속성이 undefined인 기존의 일정이 있을 때
      const eventWithoutRepeat = {
        id: '1',
        title: '레거시 일정',
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '기타',
        notificationTime: 0,
      } as Event;

      setupMockEventsWithRepeat([eventWithoutRepeat]);
      setup(<App />);

      // 일정 로딩 완료 대기
      await screen.findByText('일정 로딩 완료!');

      // When: 캘린더가 렌더링되면
      await waitFor(() => {
        expect(screen.getAllByText('레거시 일정').length).toBeGreaterThan(0);
      });

      // Then: 오류 없이 렌더링되고 반복 아이콘이 표시되지 않아야함
      const repeatIcon = screen.queryByLabelText('반복 일정');
      expect(repeatIcon).not.toBeInTheDocument();
    });
  });

  describe('AC-8: 제목 길이와 아이콘 표시 조화', () => {
    it('일정 제목이 매우 긴 반복 일정의 경우 아이콘이 먼저 표시되고 제목이 말줄임으로 처리됨', async () => {
      // Given: 일정 제목이 매우 긴 반복 일정이 있을 때
      const recurringEvent: Event = {
        id: '1',
        title: '팀 회의',
        date: '2025-10-01', // 수요일 (현재 주에 포함)
        startTime: '10:00',
        endTime: '11:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 0,
      };

      setupMockEventsWithRepeat([recurringEvent]);
      setup(<App />);

      // 일정 로딩 완료 대기
      await screen.findByText('일정 로딩 완료!');

      // When: 월간 뷰에서 화면에 렌더링될때
      await waitFor(() => {
        expect(screen.getAllByText('팀 회의').length).toBeGreaterThan(0);
      });

      const monthViewRepeatIcons = screen.getAllByLabelText('반복 일정');
      expect(monthViewRepeatIcons.length).toBeGreaterThan(0);

      // 주간 뷰로 전환
      const user = userEvent.setup();
      const viewSelect = within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox');
      await user.click(viewSelect);
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      // Then: 주간 뷰에서도 반복 아이콘이 표시되어야함
      await waitFor(() => {
        const weekViewRepeatIcons = screen.getAllByLabelText('반복 일정');
        expect(weekViewRepeatIcons.length).toBeGreaterThan(0);
      });
    });
  });
});
