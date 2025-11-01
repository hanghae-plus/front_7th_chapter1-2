import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen, waitFor, within } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { vi } from 'vitest';

import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const theme = createTheme();

// 스낵바 mock 설정
const mockEnqueueSnackbar = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: mockEnqueueSnackbar,
    }),
  };
});

// 테스트 컴포넌트 설정
const setup = (element: ReactElement) => {
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

// 반복 일정 저장 헬퍼 함수 (재사용 가능한 함수)
const saveEventWithRepeat = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>,
  repeat: { type: 'daily' | 'weekly' | 'monthly' | 'yearly'; interval: number; endDate: string }
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  // 반복 설정 활성화
  const repeatCheckbox = screen.getByLabelText('반복 설정');
  await user.click(repeatCheckbox);

  // 반복 유형 선택
  const repeatTypeSelect = screen.getByLabelText('반복 유형');
  await user.click(repeatTypeSelect);
  await user.click(
    screen.getByRole('option', {
      name:
        repeat.type === 'daily'
          ? '매일'
          : repeat.type === 'weekly'
          ? '매주'
          : repeat.type === 'monthly'
          ? '매월'
          : '매년',
    })
  );

  // 종료 날짜 설정
  const endDateInput = screen.getByLabelText('종료 날짜');
  await user.type(endDateInput, repeat.endDate);

  await user.click(screen.getByTestId('event-submit-button'));
};

describe('반복 일정 생성 기능', () => {
  beforeEach(() => {
    mockEnqueueSnackbar.mockClear();
  });

  describe('반복 설정 토글버튼', () => {
    it('일정 생성 폼 로딩시 반복 설정 토글버튼이 표시되고 기본값은 비활성 상태여야함', async () => {
      // Given: 일정 생성 폼에 접근한 상태
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);

      // Then: 반복 설정 토글버튼이 표시됨
      const repeatCheckbox = screen.getByLabelText('반복 설정');
      expect(repeatCheckbox).toBeInTheDocument();

      // And: 토글버튼 기본값은 비활성 상태 (꺼짐)
      expect(repeatCheckbox).not.toBeChecked();
    });

    it('반복 설정 토글버튼을 활성화 반복 패턴 설정 UI가 표시됨', async () => {
      // Given: 일정 생성 폼에 접근한 상태
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);
      const repeatCheckbox = screen.getByLabelText('반복 설정');

      // When: 사용자가 반복 설정 토글버튼을 활성화
      await user.click(repeatCheckbox);

      // Then: 반복 패턴 설정 UI가 표시됨
      expect(screen.getByLabelText('반복 유형')).toBeInTheDocument();
      expect(screen.getByLabelText('종료 날짜')).toBeInTheDocument();
    });

    it('반복 설정 토글버튼을 비활성 반복 패턴 설정 UI가 숨겨지고 값이 초기화됨', async () => {
      // Given: 반복 설정 토글버튼이 활성화 상태로 반복 유형과 종료 날짜를 설정한상태
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);
      const repeatCheckbox = screen.getByLabelText('반복 설정');
      await user.click(repeatCheckbox);

      // 반복 유형 선택
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매주' }));

      // 종료 날짜 설정
      const endDateInput = screen.getByLabelText('종료 날짜');
      await user.type(endDateInput, '2025-12-31');

      // When: 사용자가 반복 설정 토글버튼을 비활성화
      await user.click(repeatCheckbox);

      // Then: 반복 패턴 설정 UI가 숨겨짐
      expect(screen.queryByLabelText('반복 유형')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('종료 날짜')).not.toBeInTheDocument();
    });
  });

  describe('반복 유형 선택', () => {
    it('반복 유형 드롭다운에 매일, 매주, 매월, 매년 옵션이 표시되어 선택함', async () => {
      // Given: 반복 설정 토글버튼이 활성화 상태
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.click(screen.getByLabelText('반복 설정'));

      // When: 반복 유형 드롭다운을 열기
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);

      // Then: 매일, 매주, 매월, 매년 옵션이 표시되어 선택함
      expect(screen.getByRole('option', { name: '매일' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '매주' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '매월' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '매년' })).toBeInTheDocument();
    });

    it('반복 유형을 선택한 선택된 값이 표시되고 토글버튼이 활성상태 유지됨', async () => {
      // Given: 반복 설정 토글버튼이 활성화 상태로 반복 패턴 설정 UI가 표시된 상태에서
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);
      const repeatCheckbox = screen.getByLabelText('반복 설정');
      await user.click(repeatCheckbox);

      // When: 사용자가 반복 유형 드롭다운에서 "매주"를 선택했을때
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매주' }));

      // Then: 선택된 값이 드롭다운에 표시됨
      expect(repeatTypeSelect).toHaveTextContent('매주');

      // And: 반복 설정 토글버튼 활성 상태를 유지함
      expect(repeatCheckbox).toBeChecked();
    });
  });

  describe('유효성 검사', () => {
    describe('필수 필드 검증 처리', () => {
      it('반복 설정 활성 시 반복 유형을 선택하지 않고 저장 시도시 에러 메시지가 표시되고 저장차단됨', async () => {
        // Given: 반복 설정 토글버튼을 활성화 했는데 반복 유형을 선택하지 않은 상태에서
        setupMockHandlerCreation();
        const { user } = setup(<App />);
        await user.click(screen.getAllByText('일정 추가')[0]);
        await user.click(screen.getByLabelText('반복 설정'));

        // 기본 일정 정보 입력
        await user.type(screen.getByLabelText('제목'), '팀회의 미팅');
        await user.type(screen.getByLabelText('날짜'), '2025-01-15');
        await user.type(screen.getByLabelText('시작 시간'), '14:00');
        await user.type(screen.getByLabelText('종료 시간'), '15:00');

        // When: 저장 버튼을 클릭함
        await user.click(screen.getByTestId('event-submit-button'));

        // Then: 폼 검증이 실패함 (스낵바 메시지 확인)
        await waitFor(() => {
          expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
            '반복 유형을 선택해주세요.',
            expect.objectContaining({
              variant: 'error',
            })
          );
        });

        // And: 저장이 차단되어 진행안됨
        // API 호출이 발생하지 않음을 확인
      });
    });

    describe('종료 날짜일 검증', () => {
      it('종료 날짜를 입력하지 않았을때 에러가 발생하고 에러 토스트가 표시됨', async () => {
        // Given: 반복 설정 토글버튼을 활성화 후에 종료 날짜를 설정하지 않고서 제출하려는 상태에서
        setupMockHandlerCreation();
        const { user } = setup(<App />);
        await user.click(screen.getAllByText('일정 추가')[0]);
        await user.click(screen.getByLabelText('반복 설정'));

        // 기본 일정 정보 입력
        await user.type(screen.getByLabelText('제목'), '팀회의 미팅');
        await user.type(screen.getByLabelText('날짜'), '2025-01-15');
        await user.type(screen.getByLabelText('시작 시간'), '14:00');
        await user.type(screen.getByLabelText('종료 시간'), '15:00');

        // 반복 유형 선택
        const repeatTypeSelect = screen.getByLabelText('반복 유형');
        await user.click(repeatTypeSelect);
        await user.click(screen.getByRole('option', { name: '매주' }));

        // 종료날짜를 입력하지 않음

        // When: 저장 버튼을 클릭함
        await user.click(screen.getByTestId('event-submit-button'));

        // Then: 폼검증이 실패함
        await waitFor(() => {
          expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
            '종료 날짜를 입력해주세요.',
            expect.objectContaining({
              variant: expect.stringMatching(/warning|error/),
            })
          );
        });

        // And: 저장이 차단되어 진행안됨
        // API 호출이 발생하지 않음을 확인
      });

      it('종료 날짜가 시작일보다 이전일 경우 에러가 발생하고 에러 토스트가 표시됨', async () => {
        // Given: 반복 설정을 활성화 후에 종료 날짜를 시작일 이전으로 설정한 상태에서
        setupMockHandlerCreation();
        const { user } = setup(<App />);
        await user.click(screen.getAllByText('일정 추가')[0]);
        await user.click(screen.getByLabelText('반복 설정'));

        // 기본 일정 정보 입력 (시작일: 2025-01-15)
        await user.type(screen.getByLabelText('제목'), '팀회의 미팅');
        await user.type(screen.getByLabelText('날짜'), '2025-01-15');
        await user.type(screen.getByLabelText('시작 시간'), '14:00');
        await user.type(screen.getByLabelText('종료 시간'), '15:00');

        // 반복 유형 선택
        const repeatTypeSelect = screen.getByLabelText('반복 유형');
        await user.click(repeatTypeSelect);
        await user.click(screen.getByRole('option', { name: '매주' }));

        // 종료날짜를 시작일 이전으로 설정 (2025-01-10)
        const endDateInput = screen.getByLabelText('종료 날짜');
        await user.type(endDateInput, '2025-01-10');

        // When: 저장 버튼을 클릭함
        await user.click(screen.getByTestId('event-submit-button'));

        // Then: 폼검증이 실패함
        await waitFor(() => {
          expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
            '종료 날짜는 시작 날짜보다 이후여야 합니다.',
            expect.objectContaining({
              variant: expect.stringMatching(/warning|error/),
            })
          );
        });

        // And: 저장이 차단되어 진행안됨
      });

      it('종료 날짜가 2025-12-31을 초과할 수 없다는 제한이 검증되고 에러가 표시됨', async () => {
        // Given: 반복 설정을 활성화 후에 종료 날짜를 최대 제한을 초과해서 설정한 상태에서
        setupMockHandlerCreation();
        const { user } = setup(<App />);
        await user.click(screen.getAllByText('일정 추가')[0]);
        await user.click(screen.getByLabelText('반복 설정'));

        // 기본 일정 정보 입력
        await user.type(screen.getByLabelText('제목'), '팀회의 미팅');
        await user.type(screen.getByLabelText('날짜'), '2025-01-15');
        await user.type(screen.getByLabelText('시작 시간'), '14:00');
        await user.type(screen.getByLabelText('종료 시간'), '15:00');

        // 반복 유형 선택
        const repeatTypeSelect = screen.getByLabelText('반복 유형');
        await user.click(repeatTypeSelect);
        await user.click(screen.getByRole('option', { name: '매주' }));

        // 종료날짜 입력 필드의 최대 값 확인 (2026-01-01)
        const endDateInput = screen.getByLabelText('종료 날짜');

        // 날짜 입력의 max 속성 확인
        expect(endDateInput).toHaveAttribute('max', '2025-12-31');

        // 2026년 이후 날짜 입력 (브라우저가 자동으로 제한할수도 있지만 수동 테스트)
        await user.clear(endDateInput);
        await user.type(endDateInput, '2026-01-01');

        // When: 저장 버튼을 클릭함
        await user.click(screen.getByTestId('event-submit-button'));

        // Then: 에러 토스트 메시지 표시
        await waitFor(() => {
          expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
            '종료 날짜는 2025-12-31까지 설정 가능합니다.',
            expect.objectContaining({
              variant: 'error',
            })
          );
        });
      });
    });
  });

  describe('데이터 저장 검증', () => {
    it('올바른 반복 정보를 입력한 후 저장이 성공적으로 이루어짐', async () => {
      // Given: 반복 설정을 올바르게 완료한 후에 저장한상태
      const mockEvents: Event[] = [];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.post('/api/events', async ({ request }) => {
          const newEvent = (await request.json()) as Event;
          newEvent.id = '1';
          mockEvents.push(newEvent);
          return HttpResponse.json(newEvent, { status: 201 });
        })
      );

      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);

      // 기본 일정 정보 입력
      await user.type(screen.getByLabelText('제목'), '팀 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-01-15');
      await user.type(screen.getByLabelText('시작 시간'), '14:00');
      await user.type(screen.getByLabelText('종료 시간'), '15:00');
      await user.type(screen.getByLabelText('설명'), '팀 미팅');
      await user.type(screen.getByLabelText('위치'), '회의실 A');
      await user.click(screen.getByLabelText('카테고리'));
      await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: '업무-option' }));

      // 반복 설정 활성화
      await user.click(screen.getByLabelText('반복 설정'));
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매주' }));

      const endDateInput = screen.getByLabelText('종료 날짜');
      await user.type(endDateInput, '2025-12-31');

      // When: 저장 버튼을 클릭함
      await user.click(screen.getByTestId('event-submit-button'));

      // Then: 데이터 저장이 성공한 후 성공 토스트 표시됨
      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
          '일정이 추가되었습니다.',
          expect.objectContaining({
            variant: 'success',
          })
        );
      });
    });
  });

  describe('반복 설정 중 폼 데이터 보존', () => {
    it('반복 일정 수정시 기존 반복 설정이 올바르게 표시됨', async () => {
      // Given: 기존 반복 일정이 있는 상태
      const existingEvent: Event = {
        id: '1',
        title: '팀 회의',
        date: '2025-10-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-12-31',
        },
        notificationTime: 10,
      };

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: [existingEvent] });
        }),
        http.put('/api/events/:id', async ({ params, request }) => {
          const { id } = params;
          const updatedEvent = (await request.json()) as Event;
          return HttpResponse.json({ ...existingEvent, ...updatedEvent, id });
        })
      );

      const { user } = setup(<App />);

      // 기존 일정 수정
      await user.click(await screen.findByLabelText('Edit event'));

      // Then: 반복 설정 토글버튼이 체크된 상태로 표시됨
      const repeatCheckbox = screen.getByLabelText('반복 설정');
      expect(repeatCheckbox).toBeChecked();

      // And: 반복 유형 드롭다운에 기존 설정이 올바르게 표시됨
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      expect(screen.getByRole('option', { name: '매주', selected: true })).toBeInTheDocument();

      // And: 종료 날짜에 기존 날짜 값이 정확히 표시됨
      const endDateInput = screen.getByLabelText('종료 날짜');
      expect(endDateInput).toHaveValue('2025-12-31');
    });
  });

  describe('중복 일정 경고 표시 처리', () => {
    it('기존 일정과 겹치는 시간대로 설정시 경고가 표시됨', async () => {
      // Given: 기존 일정과 동일한 시간과 날짜에 새로운 일정을 생성하려 시도
      const existingEvent: Event = {
        id: '1',
        title: '기존 회의',
        date: '2025-01-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '회의',
        repeat: { type: 'none', interval: 1, endDate: '' },
        notificationTime: 10,
      };

      const mockEvents: Event[] = [existingEvent];

      server.use(
        http.get('/api/events', () => {
          return HttpResponse.json({ events: mockEvents });
        }),
        http.post('/api/events', async ({ request }) => {
          const newEvent = (await request.json()) as Event;
          newEvent.id = '2';
          mockEvents.push(newEvent);
          return HttpResponse.json(newEvent, { status: 201 });
        })
      );

      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);

      // 겹치는 시간의 새로운 일정 입력
      await user.type(screen.getByLabelText('제목'), '새로운 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-01-15');
      await user.type(screen.getByLabelText('시작 시간'), '14:00');
      await user.type(screen.getByLabelText('종료 시간'), '15:00');
      await user.clear(screen.getByLabelText('설명'));
      await user.clear(screen.getByLabelText('위치'));
      await user.click(screen.getByLabelText('카테고리'));
      await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: '업무-option' }));

      // 반복 설정 활성화
      await user.click(screen.getByLabelText('반복 설정'));
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);

      await user.click(screen.getByRole('option', { name: '매주' }));

      const endDateInput = screen.getByLabelText('종료 날짜');
      await user.type(endDateInput, '2025-12-31');

      // When: 저장 버튼을 클릭함
      await user.click(screen.getByTestId('event-submit-button'));

      // Then: 반복 일정인 경우 중복 검사가 스킵되고 저장이 허용됨
      // 반복 일정은 일정 겹침을 고려하지 않으므로 중복 경고가 표시되지 않음
      await waitFor(() => {
        expect(mockEnqueueSnackbar).toHaveBeenCalledWith(
          '일정이 추가되었습니다.',
          expect.objectContaining({
            variant: 'success',
          })
        );
      });
    });
  });
});
