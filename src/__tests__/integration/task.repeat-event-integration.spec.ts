/**
 * TDD RED 단계 테스트
 * 작성일: 2025-10-30
 * 기능: 반복 일정 전체 흐름 통합 테스트
 *
 * 예상 실패 (구현 전):
 * - ✗ generateRepeatDates가 빈 배열 반환
 * - ✗ saveRecurringEvents 메서드가 존재하지 않음
 * - ✗ updateRecurringSeries 메서드가 존재하지 않음
 * - ✗ deleteRecurringSeries 메서드가 존재하지 않음
 * - ✗ findOverlappingEvents가 반복 일정을 제외하지 않음
 *
 * GREEN 단계 이후 (예상):
 * - ✓ 모든 테스트가 통과해야 함
 */

import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { useEventOperations } from '../../hooks/useEventOperations';
import { server } from '../../setupTests';
import { Event, EventForm } from '../../types';
import { findOverlappingEvents } from '../../utils/eventOverlap';
import { generateRepeatDates } from '../../utils/repeatUtils';

describe('반복 일정 전체 흐름 - E2E', () => {
  it('매주 반복 일정: 생성 → 표시 → 수정 → 삭제 완전 흐름', async () => {
    // Given - 초기 상태
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const weeklyEvent: EventForm = {
      title: '주간 회의',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '팀 주간 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-02-12' },
      notificationTime: 10,
    };

    const repeatId = 'repeat-weekly-test';
    let createdEvents: Event[] = [];

    // Step 1: 생성
    server.use(
      http.post('/api/events-list', async ({ request }) => {
        const body = (await request.json()) as { events: EventForm[] };
        createdEvents = body.events.map((event: EventForm, index: number) => ({
          id: String(index + 1),
          ...event,
          repeat: { ...event.repeat, id: repeatId },
        }));
        return HttpResponse.json({ events: createdEvents }, { status: 201 });
      }),
      http.get('/api/events', () => {
        return HttpResponse.json({ events: createdEvents });
      })
    );

    await act(async () => {
      await result.current.saveEvent(weeklyEvent);
    });

    // Then 1: 5개의 일정이 생성되고 모두 같은 repeatId를 가져야 함
    await waitFor(() => {
      expect(result.current.events.length).toBeGreaterThan(0);
      const recurringEvents = result.current.events.filter((e: Event) => e.repeat.id === repeatId);
      expect(recurringEvents.length).toBe(5);
      recurringEvents.forEach((e: Event) => {
        expect(e.repeat.id).toBe(repeatId);
      });
    });

    // Step 2: 수정 - 제목 변경
    server.use(
      http.put('/api/recurring-events/:repeatId', async ({ request }) => {
        const updateData = (await request.json()) as Partial<Event>;
        // 모든 시리즈 이벤트 제목 변경
        createdEvents = createdEvents.map((e) => ({
          ...e,
          ...updateData,
        }));
        return HttpResponse.json({ success: true, updateData }, { status: 200 });
      }),
      http.get('/api/events', () => {
        return HttpResponse.json({ events: createdEvents });
      })
    );

    await act(async () => {
      // @ts-expect-error - updateRecurringSeries는 아직 구현되지 않음 (RED phase)
      await result.current.updateRecurringSeries?.(repeatId, { title: '수정된 주간 회의' });
    });

    // Then 2: 모든 회의의 제목이 변경되고 repeatId는 유지되어야 함
    await waitFor(() => {
      const recurringEvents = result.current.events.filter((e: Event) => e.repeat.id === repeatId);
      recurringEvents.forEach((e: Event) => {
        expect(e.title).toBe('수정된 주간 회의');
        expect(e.repeat.id).toBe(repeatId);
      });
    });

    // Step 3: 삭제 - 시리즈 전체 삭제
    server.use(
      http.delete('/api/recurring-events/:repeatId', () => {
        // 시리즈 전체 삭제
        createdEvents = [];
        return new HttpResponse(null, { status: 204 });
      }),
      http.get('/api/events', () => {
        return HttpResponse.json({ events: createdEvents });
      })
    );

    await act(async () => {
      // @ts-expect-error - deleteRecurringSeries는 아직 구현되지 않음 (RED phase)
      await result.current.deleteRecurringSeries?.(repeatId);
    });

    // Then 3: 모든 회의가 삭제되어야 함
    await waitFor(() => {
      const recurringEvents = result.current.events.filter((e: Event) => e.repeat.id === repeatId);
      expect(recurringEvents.length).toBe(0);
    });
  });

  it('매일 반복 일정 생성 후 달력에 올바르게 표시된다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const dailyEvent: EventForm = {
      title: '매일 운동',
      date: '2025-01-15',
      startTime: '07:00',
      endTime: '08:00',
      description: '아침 운동',
      location: '헬스장',
      category: '개인',
      repeat: { type: 'daily', interval: 1, endDate: '2025-01-20' },
      notificationTime: 10,
    };

    let createdEvents: Event[] = [];

    server.use(
      http.post('/api/events-list', async ({ request }) => {
        const body = (await request.json()) as { events: EventForm[] };
        createdEvents = body.events.map((event: EventForm, index: number) => ({
          id: String(index + 1),
          ...event,
          repeat: { ...event.repeat, id: 'repeat-daily' },
        }));
        return HttpResponse.json({ events: createdEvents }, { status: 201 });
      }),
      http.get('/api/events', () => {
        return HttpResponse.json({ events: createdEvents });
      })
    );

    // When
    await act(async () => {
      await result.current.saveEvent(dailyEvent);
    });

    // Then
    await waitFor(() => {
      const dailyEvents = result.current.events.filter(
        (e: Event) => e.repeat.id === 'repeat-daily'
      );
      expect(dailyEvents.length).toBe(6); // 1/15 ~ 1/20 = 6일
      expect(dailyEvents[0].date).toBe('2025-01-15');
      expect(dailyEvents[5].date).toBe('2025-01-20');
    });
  });

  it('매월 반복 일정 생성 후 각 월의 같은 날짜에 표시된다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const monthlyEvent: EventForm = {
      title: '월간 점검',
      date: '2025-01-10',
      startTime: '14:00',
      endTime: '15:00',
      description: '월간 팀 점검',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'monthly', interval: 1, endDate: '2025-04-10' },
      notificationTime: 10,
    };

    let createdEvents: Event[] = [];

    server.use(
      http.post('/api/events-list', async ({ request }) => {
        const body = (await request.json()) as { events: EventForm[] };
        createdEvents = body.events.map((event: EventForm, index: number) => ({
          id: String(index + 1),
          ...event,
          repeat: { ...event.repeat, id: 'repeat-monthly' },
        }));
        return HttpResponse.json({ events: createdEvents }, { status: 201 });
      }),
      http.get('/api/events', () => {
        return HttpResponse.json({ events: createdEvents });
      })
    );

    // When
    await act(async () => {
      await result.current.saveEvent(monthlyEvent);
    });

    // Then
    await waitFor(() => {
      const monthlyEvents = result.current.events.filter(
        (e: Event) => e.repeat.id === 'repeat-monthly'
      );
      expect(monthlyEvents.length).toBe(4); // 1월, 2월, 3월, 4월 = 4개
      expect(monthlyEvents[0].date).toBe('2025-01-10');
      expect(monthlyEvents[1].date).toBe('2025-02-10');
      expect(monthlyEvents[2].date).toBe('2025-03-10');
      expect(monthlyEvents[3].date).toBe('2025-04-10');
    });
  });

  it('매년 반복 일정 생성 후 매년 같은 날짜에 표시된다', async () => {
    // Given
    const { result } = renderHook(() => useEventOperations(false));
    await act(() => Promise.resolve(null));

    const yearlyEvent: EventForm = {
      title: '연간 행사',
      date: '2025-03-15',
      startTime: '09:00',
      endTime: '18:00',
      description: '연간 기념 행사',
      location: '본사',
      category: '특별',
      repeat: { type: 'yearly', interval: 1, endDate: '2027-03-15' },
      notificationTime: 60,
    };

    let createdEvents: Event[] = [];

    server.use(
      http.post('/api/events-list', async ({ request }) => {
        const body = (await request.json()) as { events: EventForm[] };
        createdEvents = body.events.map((event: EventForm, index: number) => ({
          id: String(index + 1),
          ...event,
          repeat: { ...event.repeat, id: 'repeat-yearly' },
        }));
        return HttpResponse.json({ events: createdEvents }, { status: 201 });
      }),
      http.get('/api/events', () => {
        return HttpResponse.json({ events: createdEvents });
      })
    );

    // When
    await act(async () => {
      await result.current.saveEvent(yearlyEvent);
    });

    // Then
    await waitFor(() => {
      const yearlyEvents = result.current.events.filter(
        (e: Event) => e.repeat.id === 'repeat-yearly'
      );
      expect(yearlyEvents.length).toBe(3); // 2025, 2026, 2027 = 3개
      expect(yearlyEvents[0].date).toBe('2025-03-15');
      expect(yearlyEvents[1].date).toBe('2026-03-15');
      expect(yearlyEvents[2].date).toBe('2027-03-15');
    });
  });
});

describe('반복 일정 특수 규칙', () => {
  it('31일 매월 반복: 31일이 있는 달에만 일정이 생성된다', async () => {
    // Given
    const baseDate = '2025-01-31';
    const repeatInfo = { type: 'monthly' as const, interval: 1, endDate: '2025-12-31' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    // 31일이 있는 달: 1, 3, 5, 7, 8, 10, 12월 (7개)
    expect(result).toHaveLength(7);
    expect(result).toEqual([
      '2025-01-31',
      '2025-03-31',
      '2025-05-31',
      '2025-07-31',
      '2025-08-31',
      '2025-10-31',
      '2025-12-31',
    ]);
  });

  it('윤년 2월 29일 매년 반복: 윤년에만 일정이 생성된다', async () => {
    // Given
    const baseDate = '2024-02-29';
    const repeatInfo = { type: 'yearly' as const, interval: 1, endDate: '2032-02-29' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    // 윤년: 2024, 2028, 2032 (3개)
    expect(result).toHaveLength(3);
    expect(result).toEqual(['2024-02-29', '2028-02-29', '2032-02-29']);
  });

  it('30일 매월 반복: 2월을 건너뛰고 생성된다', async () => {
    // Given
    const baseDate = '2025-01-30';
    const repeatInfo = { type: 'monthly' as const, interval: 1, endDate: '2025-04-30' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    // 2월 제외: 1월, 3월, 4월 (3개)
    expect(result).toHaveLength(3);
    expect(result).toEqual(['2025-01-30', '2025-03-30', '2025-04-30']);
  });
});

describe('반복 일정과 일정 겹침 감지', () => {
  it('반복 일정은 겹침 체크에서 제외된다', () => {
    // Given
    const recurringEvent: Event = {
      id: '1',
      title: '반복 회의',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '매주 회의',
      location: '회의실 A',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, id: 'repeat-123' },
      notificationTime: 10,
    };

    const normalEvent: Event = {
      id: '2',
      title: '일반 회의',
      date: '2025-01-15',
      startTime: '10:30',
      endTime: '11:30',
      description: '일회성 회의',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    // When
    const overlapping = findOverlappingEvents(recurringEvent, [normalEvent]);

    // Then - 반복 일정은 겹침으로 인식되지 않음
    expect(overlapping).toHaveLength(0);
  });

  it('일반 일정끼리만 겹침 체크가 수행된다', () => {
    // Given
    const event1: Event = {
      id: '1',
      title: '일반 회의 1',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    const event2: Event = {
      id: '2',
      title: '일반 회의 2',
      date: '2025-01-15',
      startTime: '10:30',
      endTime: '11:30',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'none', interval: 1 },
      notificationTime: 10,
    };

    // When
    const overlapping = findOverlappingEvents(event1, [event2]);

    // Then - 일반 일정끼리는 겹침 감지됨
    expect(overlapping).toHaveLength(1);
    expect(overlapping[0].id).toBe('2');
  });

  it('반복 일정끼리는 겹침 체크에서 제외된다', () => {
    // Given
    const recurringEvent1: Event = {
      id: '1',
      title: '반복 회의 1',
      date: '2025-01-15',
      startTime: '10:00',
      endTime: '11:00',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'weekly', interval: 1, id: 'repeat-123' },
      notificationTime: 10,
    };

    const recurringEvent2: Event = {
      id: '2',
      title: '반복 회의 2',
      date: '2025-01-15',
      startTime: '10:30',
      endTime: '11:30',
      description: '',
      location: '',
      category: '업무',
      repeat: { type: 'daily', interval: 1, id: 'repeat-456' },
      notificationTime: 10,
    };

    // When
    const overlapping = findOverlappingEvents(recurringEvent1, [recurringEvent2]);

    // Then - 반복 일정끼리는 겹침 감지 안 됨
    expect(overlapping).toHaveLength(0);
  });
});

describe('반복 일정 에러 처리', () => {
  it('반복 종료일이 시작일보다 이전인 경우 빈 배열을 반환한다', () => {
    // Given
    const baseDate = '2025-12-31';
    const repeatInfo = { type: 'daily' as const, interval: 1, endDate: '2025-01-01' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    expect(result).toEqual([]);
  });

  it('유효하지 않은 간격 값(0)인 경우 빈 배열을 반환한다', () => {
    // Given
    const baseDate = '2025-01-15';
    const repeatInfo = { type: 'daily' as const, interval: 0, endDate: '2025-12-31' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    expect(result).toEqual([]);
  });

  it('유효하지 않은 간격 값(음수)인 경우 빈 배열을 반환한다', () => {
    // Given
    const baseDate = '2025-01-15';
    const repeatInfo = { type: 'daily' as const, interval: -1, endDate: '2025-12-31' };

    // When
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then
    expect(result).toEqual([]);
  });
});
