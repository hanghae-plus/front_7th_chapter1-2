import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';

const theme = createTheme();

const setup = (element: ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider>{element}</SnackbarProvider>
    </ThemeProvider>
  );
};

describe('캘린더 뷰 - 반복 일정 아이콘 표시', () => {
  describe('반복 일정 아이콘 노출', () => {
    it('반복 일정 옆에 아이콘이 표시된다', async () => {
      // 반복 일정이 있는 mock 데이터 설정
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '주간 회의',
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:00',
          description: '매주 목요일 정기 회의',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
        },
      ];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        })
      );

      setup(<App />);

      // 일정 로딩 완료 대기
      await screen.findByText('일정 로딩 완료!');

      // 이벤트 리스트에서 스코프 지정
      const eventList = screen.getByTestId('event-list');

      // 반복 일정의 제목 존재 확인 (event-list 범위 내에서)
      const eventTitle = within(eventList).getByText('주간 회의');
      expect(eventTitle).toBeInTheDocument();

      // 반복 일정 옆에 반복 정보가 표시되어 있는지 확인
      const repeatInfo = within(eventList).getByText(/반복:/);
      expect(repeatInfo).toBeInTheDocument();

      // 반복 아이콘이 제목과 같은 Stack 내에 있는지 확인
      const titleContainer = eventTitle.closest('div');
      const repeatIcon = titleContainer?.querySelector('svg');
      expect(repeatIcon).toBeInTheDocument();
    });
  });
});
