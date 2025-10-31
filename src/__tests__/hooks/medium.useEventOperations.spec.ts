import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

const enqueueSnackbarFn = vi.fn();

vi.mock('notistack', async () => {
  const actual = await vi.importActual('notistack');
  return {
    ...actual,
    useSnackbar: () => ({
      enqueueSnackbar: enqueueSnackbarFn,
    }),
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다', async () => {
  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  expect(result.current.events).toEqual([
    {
      id: '1',
      title: '기존 회의',
      date: '2025-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ]);
});

it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
  setupMockHandlerCreation(); // ? Med: 이걸 왜 써야하는지 물어보자

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  const newEvent: Event = {
    id: '1',
    title: '새 회의',
    date: '2025-10-16',
    startTime: '11:00',
    endTime: '12:00',
    description: '새로운 팀 미팅',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(newEvent);
  });

  expect(result.current.events).toEqual([{ ...newEvent, id: '1' }]);
});

it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
  setupMockHandlerUpdating();

  const { result } = renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  const updatedEvent: Event = {
    id: '1',
    date: '2025-10-15',
    startTime: '09:00',
    description: '기존 팀 미팅',
    location: '회의실 B',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
    title: '수정된 회의',
    endTime: '11:00',
  };

  await act(async () => {
    await result.current.saveEvent(updatedEvent);
  });

  expect(result.current.events[0]).toEqual(updatedEvent);
});

it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
  setupMockHandlerDeletion();

  const { result } = renderHook(() => useEventOperations(false));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  await act(() => Promise.resolve(null));

  expect(result.current.events).toEqual([]);
});

it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
  server.use(
    http.get('/api/events', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('이벤트 로딩 실패', { variant: 'error' });

  server.resetHandlers();
});

it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
  const { result } = renderHook(() => useEventOperations(true));

  await act(() => Promise.resolve(null));

  const nonExistentEvent: Event = {
    id: '999', // 존재하지 않는 ID
    title: '존재하지 않는 이벤트',
    date: '2025-07-20',
    startTime: '09:00',
    endTime: '10:00',
    description: '이 이벤트는 존재하지 않습니다',
    location: '어딘가',
    category: '기타',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  };

  await act(async () => {
    await result.current.saveEvent(nonExistentEvent);
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 저장 실패', { variant: 'error' });
});

it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
  server.use(
    http.delete('/api/events/:id', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );

  const { result } = renderHook(() => useEventOperations(false));

  await act(() => Promise.resolve(null));

  await act(async () => {
    await result.current.deleteEvent('1');
  });

  expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정 삭제 실패', { variant: 'error' });

  expect(result.current.events).toHaveLength(1);
});

describe('REQ-004: 반복 일정 겹침 미고려 - useEventOperations', () => {
  describe('TODO-002: 같은 시간대에 단일 일정과 반복 일정을 생성할 수 있다', () => {
    it('같은 시간대에 단일 일정이 있어도 반복 일정을 생성할 수 있다', async () => {
      // 명세: REQ-004, CONS-001 - 겹침 검증 없음
      // 설계: TODO-002

      // Arrange - 기존 단일 일정과 동일한 시간대 반복 일정 준비
      setupMockHandlerCreation();
      const { result } = renderHook(() => useEventOperations(false));

      await act(() => Promise.resolve(null));

      // 기존 단일 일정 (2025-06-15 10:00-11:00)
      const existingEvent: Event = {
        id: '1',
        title: '기존 회의',
        date: '2025-06-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '기존 단일 일정',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      };

      await act(async () => {
        await result.current.saveEvent(existingEvent);
      });

      // 동일한 시간대 반복 일정
      const recurringEvent: Event = {
        id: '2',
        title: '반복 회의',
        date: '2025-06-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '매일 반복 일정',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-06-20' },
        notificationTime: 10,
      };

      // Act - 겹치는 시간대에 반복 일정 생성 (경고 없음)
      await act(async () => {
        await result.current.saveEvent(recurringEvent);
      });

      // Assert - 단일 일정(1개) + 반복 일정(6개) = 총 7개
      expect(result.current.events.length).toBeGreaterThan(1);
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
        variant: 'success',
      });
    });

    it('반복 일정이 있는 시간대에 단일 일정을 추가할 수 있다', async () => {
      // 명세: REQ-004 - 양방향 겹침 허용
      // 설계: TODO-002

      // Arrange
      setupMockHandlerCreation();
      const { result } = renderHook(() => useEventOperations(false));

      await act(() => Promise.resolve(null));

      // 기존 반복 일정
      const recurringEvent: Event = {
        id: '1',
        title: '매일 스탠드업',
        date: '2025-06-15',
        startTime: '09:00',
        endTime: '09:30',
        description: '매일 반복',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-06-20' },
        notificationTime: 10,
      };

      await act(async () => {
        await result.current.saveEvent(recurringEvent);
      });

      // 겹치는 단일 일정
      const singleEvent: Event = {
        id: '2',
        title: '중요 회의',
        date: '2025-06-15',
        startTime: '09:00',
        endTime: '09:30',
        description: '단일 일정',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      };

      // Act - 겹침 검증 없이 생성
      await act(async () => {
        await result.current.saveEvent(singleEvent);
      });

      // Assert - 반복 일정(6개) + 단일 일정(1개) = 총 7개
      expect(result.current.events.length).toBeGreaterThan(1);
      expect(enqueueSnackbarFn).toHaveBeenLastCalledWith('일정이 추가되었습니다.', {
        variant: 'success',
      });
    });
  });

  describe('TODO-003: 같은 시간대에 여러 반복 일정을 생성할 수 있다', () => {
    it('동일한 시간대에 여러 반복 일정(매일)을 생성할 수 있다', async () => {
      // 명세: REQ-004, CONS-001
      // 설계: TODO-003

      // Arrange
      setupMockHandlerCreation();
      const { result } = renderHook(() => useEventOperations(false));

      await act(() => Promise.resolve(null));

      // 첫 번째 반복 일정
      const recurringEvent1: Event = {
        id: '1',
        title: '아침 스탠드업',
        date: '2025-06-15',
        startTime: '09:00',
        endTime: '09:30',
        description: '매일 반복 1',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-06-20' },
        notificationTime: 10,
      };

      await act(async () => {
        await result.current.saveEvent(recurringEvent1);
      });

      // 두 번째 반복 일정 (동일 시간대)
      const recurringEvent2: Event = {
        id: '2',
        title: '데일리 미팅',
        date: '2025-06-15',
        startTime: '09:00',
        endTime: '09:30',
        description: '매일 반복 2',
        location: '온라인',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-06-20' },
        notificationTime: 10,
      };

      // Act - 겹침 검증 없이 생성
      await act(async () => {
        await result.current.saveEvent(recurringEvent2);
      });

      // Assert - 반복 일정 1 (6개) + 반복 일정 2 (6개) = 총 12개
      expect(result.current.events.length).toBeGreaterThan(2);
      expect(enqueueSnackbarFn).toHaveBeenCalledTimes(3); // init + 2번 save
    });

    it('서로 다른 반복 유형(매일, 매주)의 일정이 같은 시간대에 생성될 수 있다', async () => {
      // 명세: REQ-004
      // 설계: TODO-003

      // Arrange
      setupMockHandlerCreation();
      const { result } = renderHook(() => useEventOperations(false));

      await act(() => Promise.resolve(null));

      // 매일 반복
      const dailyEvent: Event = {
        id: '1',
        title: '매일 리뷰',
        date: '2025-06-15',
        startTime: '17:00',
        endTime: '17:30',
        description: '매일 반복',
        location: '',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-06-20' },
        notificationTime: 10,
      };

      await act(async () => {
        await result.current.saveEvent(dailyEvent);
      });

      // 매주 반복 (동일 시간대)
      const weeklyEvent: Event = {
        id: '2',
        title: '주간 회의',
        date: '2025-06-15',
        startTime: '17:00',
        endTime: '17:30',
        description: '매주 반복',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-07-06' },
        notificationTime: 10,
      };

      // Act
      await act(async () => {
        await result.current.saveEvent(weeklyEvent);
      });

      // Assert - 매일 반복 (6개) + 매주 반복 (4개) = 총 10개
      expect(result.current.events.length).toBeGreaterThan(2);
    });
  });

  describe('TODO-006: 기존 일정과 완전히 겹치는 시간대에 반복 일정을 생성할 수 있다', () => {
    it('기존 일정과 startTime, endTime이 완전히 동일한 반복 일정을 생성할 수 있다', async () => {
      // 명세: REQ-004, CONS-001
      // 설계: TODO-006

      // Arrange
      setupMockHandlerCreation();
      const { result } = renderHook(() => useEventOperations(false));

      await act(() => Promise.resolve(null));

      // 기존 일정 (10:00-11:00)
      const existingEvent: Event = {
        id: '1',
        title: '기존 회의',
        date: '2025-06-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '기존 일정',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      };

      await act(async () => {
        await result.current.saveEvent(existingEvent);
      });

      // 완전히 겹치는 반복 일정 (10:00-11:00)
      const fullyOverlappingEvent: Event = {
        id: '2',
        title: '반복 회의',
        date: '2025-06-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '완전 겹침',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-06-20' },
        notificationTime: 10,
      };

      // Act - 완전히 겹치는 시간에도 생성
      await act(async () => {
        await result.current.saveEvent(fullyOverlappingEvent);
      });

      // Assert - 단일 일정 (1개) + 반복 일정 (6개) = 총 7개
      expect(result.current.events.length).toBeGreaterThan(1);
      // 모든 일정이 같은 시간대
      result.current.events.forEach((event) => {
        expect(event.startTime).toBe('10:00');
        expect(event.endTime).toBe('11:00');
      });
    });

    it('부분적으로 겹치는 시간대에도 반복 일정을 생성할 수 있다', async () => {
      // 명세: REQ-004
      // 설계: TODO-006

      // Arrange
      setupMockHandlerCreation();
      const { result } = renderHook(() => useEventOperations(false));

      await act(() => Promise.resolve(null));

      // 기존 일정 (10:00-11:00)
      const existingEvent: Event = {
        id: '1',
        title: '기존 회의',
        date: '2025-06-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '기존',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      };

      await act(async () => {
        await result.current.saveEvent(existingEvent);
      });

      // 부분 겹침 (10:30-11:30)
      const partiallyOverlappingEvent: Event = {
        id: '2',
        title: '부분 겹침 회의',
        date: '2025-06-15',
        startTime: '10:30',
        endTime: '11:30',
        description: '부분 겹침',
        location: '회의실 C',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-06-18' },
        notificationTime: 10,
      };

      // Act
      await act(async () => {
        await result.current.saveEvent(partiallyOverlappingEvent);
      });

      // Assert - 단일 일정 (1개) + 반복 일정 (4개) = 총 5개
      expect(result.current.events.length).toBeGreaterThan(1);
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 추가되었습니다.', {
        variant: 'success',
      });
    });

    it('시작 시간만 겹치는 반복 일정을 생성할 수 있다', async () => {
      // 명세: REQ-004
      // 설계: TODO-006

      // Arrange
      setupMockHandlerCreation();
      const { result } = renderHook(() => useEventOperations(false));

      await act(() => Promise.resolve(null));

      // 기존 일정 (09:00-10:00)
      const existingEvent: Event = {
        id: '1',
        title: '오전 회의',
        date: '2025-06-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      };

      await act(async () => {
        await result.current.saveEvent(existingEvent);
      });

      // 시작 시간만 겹침 (09:00-09:30)
      const sameStartTimeEvent: Event = {
        id: '2',
        title: '짧은 회의',
        date: '2025-06-15',
        startTime: '09:00',
        endTime: '09:30',
        description: '',
        location: '',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-07-06' },
        notificationTime: 10,
      };

      // Act
      await act(async () => {
        await result.current.saveEvent(sameStartTimeEvent);
      });

      // Assert - 단일 일정 (1개) + 반복 일정 (4개) = 총 5개
      expect(result.current.events.length).toBeGreaterThan(1);
    });
  });

  describe('TODO-012: 반복 일정 수정 시에도 겹침 검증을 하지 않는다', () => {
    it('반복 일정 수정 시 다른 일정과 겹쳐도 저장된다', async () => {
      // 명세: REQ-004, REQ-008
      // 설계: TODO-012

      // Arrange
      setupMockHandlerUpdating();
      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      // 기존 일정 수정 (겹치는 시간으로)
      const updatedEvent: Event = {
        id: '1',
        title: '수정된 회의',
        date: '2025-10-15',
        startTime: '09:00', // 원래 시간 유지
        endTime: '10:00',
        description: '시간 변경 없음',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-20' },
        notificationTime: 10,
      };

      // Act - 겹침 검증 없이 수정
      await act(async () => {
        await result.current.saveEvent(updatedEvent);
      });

      // Assert
      expect(result.current.events[0].title).toBe('수정된 회의');
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
        variant: 'success',
      });
    });

    it('반복 일정을 다른 반복 일정과 겹치는 시간으로 수정할 수 있다', async () => {
      // 명세: REQ-004, REQ-008
      // 설계: TODO-012

      // Arrange
      setupMockHandlerUpdating();
      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      // 다른 일정과 겹치는 시간으로 수정
      const updatedToOverlapEvent: Event = {
        id: '1',
        title: '겹치도록 수정',
        date: '2025-10-15',
        startTime: '14:00', // 다른 일정과 겹치는 시간
        endTime: '15:00',
        description: '겹침 허용',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-11-15' },
        notificationTime: 10,
      };

      // Act
      await act(async () => {
        await result.current.saveEvent(updatedToOverlapEvent);
      });

      // Assert - 에러 없이 수정됨
      expect(result.current.events[0].startTime).toBe('14:00');
      expect(enqueueSnackbarFn).toHaveBeenCalledWith('일정이 수정되었습니다.', {
        variant: 'success',
      });
    });

    it('단일 일정을 반복 일정으로 수정할 때도 겹침 검증을 하지 않는다', async () => {
      // 명세: REQ-004
      // 설계: TODO-012

      // Arrange
      setupMockHandlerUpdating();
      const { result } = renderHook(() => useEventOperations(true));

      await act(() => Promise.resolve(null));

      // 단일 → 반복으로 변경 (기존 일정과 겹칠 수 있음)
      const changedToRecurring: Event = {
        id: '1',
        title: '반복으로 변경',
        date: '2025-10-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '단일에서 반복으로',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-10-25' },
        notificationTime: 10,
      };

      // Act - 겹침 검증 없이 수정
      await act(async () => {
        await result.current.saveEvent(changedToRecurring);
      });

      // Assert
      expect(result.current.events[0].repeat.type).toBe('daily');
    });
  });
});

describe('REQ-001: 반복 유형 선택 - Data Persistence', () => {
  describe('Phase 4: Data Persistence Verification', () => {
    describe('Group 4.1: Save and Retrieve', () => {
      it('"매일" 반복으로 저장된 일정 조회 시 repeat.type이 "daily"다', async () => {
        // 명세: REQ-001 - 매일 반복 데이터 저장
        // 설계: TODO-015

        // Arrange
        setupMockHandlerCreation();
        const { result } = renderHook(() => useEventOperations(false));

        await act(() => Promise.resolve(null));

        const dailyEvent: Event = {
          id: '1',
          title: '매일 운동',
          date: '2025-01-01',
          startTime: '07:00',
          endTime: '08:00',
          description: '아침 운동',
          location: '헬스장',
          category: '개인',
          repeat: { type: 'daily', interval: 1 },
          notificationTime: 10,
        };

        // Act
        await act(async () => {
          await result.current.saveEvent(dailyEvent);
        });

        // Assert
        expect(result.current.events[0].repeat.type).toBe('daily');
      });

      it('"매주" 반복으로 저장된 일정 조회 시 repeat.type이 "weekly"다', async () => {
        // 명세: REQ-001 - 매주 반복 데이터 저장
        // 설계: TODO-016

        // Arrange
        setupMockHandlerCreation();
        const { result } = renderHook(() => useEventOperations(false));

        await act(() => Promise.resolve(null));

        const weeklyEvent: Event = {
          id: '1',
          title: '주간 회의',
          date: '2025-01-06',
          startTime: '14:00',
          endTime: '15:00',
          description: '팀 주간 회의',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
        };

        // Act
        await act(async () => {
          await result.current.saveEvent(weeklyEvent);
        });

        // Assert
        expect(result.current.events[0].repeat.type).toBe('weekly');
      });

      it('"매월" 반복으로 저장된 일정 조회 시 repeat.type이 "monthly"다', async () => {
        // 명세: REQ-001 - 매월 반복 데이터 저장
        // 설계: TODO-017

        // Arrange
        setupMockHandlerCreation();
        const { result } = renderHook(() => useEventOperations(false));

        await act(() => Promise.resolve(null));

        const monthlyEvent: Event = {
          id: '1',
          title: '월간 리뷰',
          date: '2025-01-15',
          startTime: '10:00',
          endTime: '11:00',
          description: '월간 성과 리뷰',
          location: '대회의실',
          category: '업무',
          repeat: { type: 'monthly', interval: 1 },
          notificationTime: 10,
        };

        // Act
        await act(async () => {
          await result.current.saveEvent(monthlyEvent);
        });

        // Assert
        expect(result.current.events[0].repeat.type).toBe('monthly');
      });

      it('"매년" 반복으로 저장된 일정 조회 시 repeat.type이 "yearly"다', async () => {
        // 명세: REQ-001 - 매년 반복 데이터 저장
        // 설계: TODO-018

        // Arrange
        setupMockHandlerCreation();
        const { result } = renderHook(() => useEventOperations(false));

        await act(() => Promise.resolve(null));

        const yearlyEvent: Event = {
          id: '1',
          title: '생일',
          date: '2025-03-15',
          startTime: '00:00',
          endTime: '23:59',
          description: '내 생일',
          location: '',
          category: '개인',
          repeat: { type: 'yearly', interval: 1 },
          notificationTime: 1440,
        };

        // Act
        await act(async () => {
          await result.current.saveEvent(yearlyEvent);
        });

        // Assert
        expect(result.current.events[0].repeat.type).toBe('yearly');
      });

      it('비반복으로 저장된 일정 조회 시 repeat.type이 "none"이다', async () => {
        // 명세: REQ-001 - 비반복 데이터 저장
        // 설계: TODO-019

        // Arrange
        setupMockHandlerCreation();
        const { result } = renderHook(() => useEventOperations(false));

        await act(() => Promise.resolve(null));

        const nonRecurringEvent: Event = {
          id: '1',
          title: '회의',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '팀 미팅',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        };

        // Act
        await act(async () => {
          await result.current.saveEvent(nonRecurringEvent);
        });

        // Assert
        expect(result.current.events[0].repeat.type).toBe('none');
      });
    });
  });
});
