/**
 * TDD RED 단계 테스트
 * 작성일: 2025-10-30
 * 기능: 반복 일정 수정 - 단일/전체 수정 선택
 *
 * 예상 실패 (구현 전):
 * - ✗ 반복 일정 수정 시 다이얼로그를 표시해야 함
 *   → Expected: role="dialog" element
 *   → Received: null (다이얼로그 UI가 아직 구현되지 않음)
 *
 * - ✗ 단일 일정 수정 시 다이얼로그가 표시되지 않아야 함
 *   → Expected: dialog to not be in document
 *   → Received: (기존 로직 확인 필요)
 *
 * - ✗ 예 버튼 클릭 시 단일 일정으로 수정되어야 함
 *   → Expected: testid="recurring-edit-single-button"
 *   → Received: element not found (버튼이 구현되지 않음)
 *
 * - ✗ 아니오 버튼 클릭 시 폼에 데이터가 로드되어야 함
 *   → Expected: testid="recurring-edit-all-button"
 *   → Received: element not found
 *
 * - ✗ 전체 시리즈 수정 후 모든 일정이 업데이트되어야 함
 *   → Expected: "반복 일정 시리즈가 수정되었습니다."
 *   → Received: (전체 수정 로직 없음)
 *
 * - ✗ 취소 버튼 클릭 시 다이얼로그만 닫혀야 함
 *   → Expected: testid="recurring-edit-cancel-button"
 *   → Received: element not found
 *
 * - ✗ 단일 수정 API 실패 시 에러 메시지를 표시해야 함
 *   → Expected: "일정 수정 실패"
 *   → Received: (에러 처리 로직 없음)
 *
 * - ✗ 반복 시리즈가 존재하지 않으면 404 에러를 처리해야 함
 *   → Expected: "반복 일정 시리즈를 찾을 수 없습니다."
 *   → Received: (404 에러 처리 로직 없음)
 *
 * GREEN 단계 이후 (예상):
 * - ✓ 모든 테스트가 통과해야 함
 * - ✓ 다이얼로그 UI 구현 완료
 * - ✓ 단일/전체 수정 로직 구현 완료
 * - ✓ 에러 핸들링 구현 완료
 */

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import React from 'react';

import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';

const theme = createTheme();

const setup = (element: React.ReactElement) => {
  const user = userEvent.setup();
  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

// Mock 데이터: 반복 일정 시리즈 (weekly, 4주)
const mockRecurringEvents: Event[] = [
  {
    id: '1',
    title: '주간 회의',
    date: '2025-10-30',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-11-20',
      id: 'repeat-1',
    },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '주간 회의',
    date: '2025-10-07',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-11-20',
      id: 'repeat-1',
    },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '주간 회의',
    date: '2025-10-14',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-11-20',
      id: 'repeat-1',
    },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '주간 회의',
    date: '2025-10-21',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-11-20',
      id: 'repeat-1',
    },
    notificationTime: 10,
  },
  {
    id: '5',
    title: '개인 약속',
    date: '2025-10-31',
    startTime: '14:00',
    endTime: '15:00',
    description: '병원 방문',
    location: '서울대병원',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 60,
  },
];

describe('반복 일정 수정', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockRecurringEvents });
      })
    );
  });

  describe('반복 일정 수정 다이얼로그', () => {
    it('반복 일정 수정 시 다이얼로그를 표시해야 함', async () => {
      // Given: 반복 일정이 로드됨
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // When: Edit 버튼 클릭
      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]); // 첫 번째 반복 일정

      // Then: 다이얼로그 표시 확인
      const dialog = await screen.findByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
      expect(screen.getByText(/해당 일정만 수정하시겠어요?/)).toBeInTheDocument();
      expect(screen.getByTestId('recurring-edit-single-button')).toHaveTextContent('예');
      expect(screen.getByTestId('recurring-edit-all-button')).toHaveTextContent('아니오');
      expect(screen.getByTestId('recurring-edit-cancel-button')).toHaveTextContent('취소');
    });

    it('단일 일정 수정 시 다이얼로그가 표시되지 않아야 함', async () => {
      // Given: 단일 일정이 존재함
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      // When: 단일 일정의 Edit 버튼 클릭
      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[4]); // 5번째는 단일 일정

      // Then: 다이얼로그 없이 바로 폼 로드
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(await screen.findByDisplayValue('개인 약속')).toBeInTheDocument();
    });
  });

  describe('단일 일정으로 수정', () => {
    it('예 버튼 클릭 시 단일 일정으로 수정되어야 함', async () => {
      // Given: 다이얼로그가 열려 있음
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      let requestBody: unknown = null;
      server.use(
        http.put('/api/events/:id', async ({ request }) => {
          requestBody = await request.json();
          return HttpResponse.json({ event: requestBody });
        })
      );

      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);
      await screen.findByRole('dialog');

      // When: "예" 버튼 클릭
      const yesButton = screen.getByTestId('recurring-edit-single-button');
      await user.click(yesButton);

      // Then: API 호출 및 성공 메시지 확인
      await screen.findByText('일정이 수정되었습니다.');
      expect(requestBody).toMatchObject({
        id: '1',
        repeat: {
          type: 'none',
          interval: 1,
        },
      });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('전체 시리즈 수정', () => {
    it('아니오 버튼 클릭 시 폼에 데이터가 로드되어야 함', async () => {
      // Given: 다이얼로그가 열려 있음
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);
      await screen.findByRole('dialog');

      // When: "아니오" 버튼 클릭
      const noButton = screen.getByTestId('recurring-edit-all-button');
      await user.click(noButton);

      // Then: 폼에 데이터 로드 확인
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(await screen.findByDisplayValue('주간 회의')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2025-10-30')).toBeInTheDocument();
      expect(screen.getByDisplayValue('10:00')).toBeInTheDocument();
      expect(screen.getByDisplayValue('11:00')).toBeInTheDocument();
      expect(screen.getByLabelText('반복 설정')).toBeChecked();
    });

    it('전체 시리즈 수정 후 모든 일정이 업데이트되어야 함', async () => {
      // Given: 전체 수정 모드로 진입
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      let requestBody: { title?: string; description?: string } = {};
      server.use(
        http.put('/api/recurring-events/:repeatId', async ({ request }) => {
          requestBody = (await request.json()) as { title?: string; description?: string };
          const updatedEvents = mockRecurringEvents
            .filter((e) => e.repeat.id === 'repeat-1')
            .map((e) => ({
              ...e,
              title: requestBody.title ?? e.title,
              description: requestBody.description ?? e.description,
            }));
          return HttpResponse.json({ events: updatedEvents });
        })
      );

      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);
      await screen.findByRole('dialog');

      const noButton = screen.getByTestId('recurring-edit-all-button');
      await user.click(noButton);

      // When: 제목 수정 후 저장
      const titleInput = await screen.findByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '주간 회의 (변경됨)');

      const saveButton = screen.getAllByText('일정 수정')[1];
      await user.click(saveButton);

      // Then: 반복 시리즈 수정 API 호출 확인
      await screen.findByText('반복 일정 시리즈가 수정되었습니다.');
      expect(requestBody).toMatchObject({
        title: '주간 회의 (변경됨)',
      });
    });
  });

  describe('다이얼로그 취소', () => {
    it('취소 버튼 클릭 시 다이얼로그만 닫혀야 함', async () => {
      // Given: 다이얼로그가 열려 있음
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      let apiCalled = false;
      server.use(
        http.put('/api/events/:id', () => {
          apiCalled = true;
          return HttpResponse.json({});
        })
      );

      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);
      await screen.findByRole('dialog');

      // When: "취소" 버튼 클릭
      const cancelButton = screen.getByTestId('recurring-edit-cancel-button');
      await user.click(cancelButton);

      // Then: 다이얼로그만 닫히고 API 호출 없음
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(apiCalled).toBe(false);
    });
  });

  describe('에러 핸들링', () => {
    it('단일 수정 API 실패 시 에러 메시지를 표시해야 함', async () => {
      // Given: 다이얼로그가 열려 있음
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      server.use(
        http.put('/api/events/:id', () => {
          return HttpResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        })
      );

      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);
      await screen.findByRole('dialog');

      // When: "예" 버튼 클릭 시 API 실패
      const yesButton = screen.getByTestId('recurring-edit-single-button');
      await user.click(yesButton);

      // Then: 에러 메시지 표시 + 다이얼로그 유지
      await screen.findByText('일정 수정 실패');
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('반복 시리즈가 존재하지 않으면 404 에러를 처리해야 함', async () => {
      expect.hasAssertions();

      // Given: 전체 수정 모드로 진입
      const { user } = setup(<App />);
      await screen.findByText('일정 로딩 완료!');

      server.use(
        http.put('/api/recurring-events/:repeatId', () => {
          return HttpResponse.json({ error: 'Recurring series not found' }, { status: 404 });
        })
      );

      const editButtons = screen.getAllByLabelText('Edit event');
      await user.click(editButtons[0]);
      await screen.findByRole('dialog');

      const noButton = screen.getByTestId('recurring-edit-all-button');
      await user.click(noButton);

      const saveButton = screen.getAllByText('일정 수정')[1];
      await user.click(saveButton);

      // Then: 404 에러 메시지 표시
      const errorMessage = await screen.findByText('반복 일정 시리즈를 찾을 수 없습니다.');
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
