import { describe, it, expect } from 'vitest';

import { Event } from '../../types';
import { generateRecurringEvents } from '../../utils/recurringEventUtils';

describe('generateRecurringEvents - endDate filtering', () => {
  const baseEvent: Event = {
    id: 'test-1',
    title: '주간 회의',
    date: '2025-10-01',
    startTime: '10:00',
    endTime: '11:00',
    description: '테스트',
    location: '회의실',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
    },
    notificationTime: 10,
  };

  it('endDate가 없으면 maxOccurrences까지 무한 반복한다', () => {
    const events = generateRecurringEvents(baseEvent, 5);

    expect(events).toHaveLength(5);
    expect(events[0].date).toBe('2025-10-01');
    expect(events[1].date).toBe('2025-10-08');
    expect(events[2].date).toBe('2025-10-15');
    expect(events[3].date).toBe('2025-10-22');
    expect(events[4].date).toBe('2025-10-29');
  });

  it('endDate가 있으면 해당 날짜까지만 생성한다', () => {
    const eventWithEndDate: Event = {
      ...baseEvent,
      repeat: {
        ...baseEvent.repeat,
        endDate: '2025-10-15',
      },
    };

    const events = generateRecurringEvents(eventWithEndDate, 10);

    expect(events.length).toBeLessThanOrEqual(3); // 10/01, 10/08, 10/15
    expect(events.some((e) => e.date === '2025-10-01')).toBe(true);
    expect(events.some((e) => e.date === '2025-10-08')).toBe(true);
    expect(events.some((e) => e.date === '2025-10-15')).toBe(true);
    expect(events.some((e) => e.date === '2025-10-22')).toBe(false); // endDate 이후
  });

  it('endDate 당일의 일정은 포함된다', () => {
    const eventWithEndDate: Event = {
      ...baseEvent,
      repeat: {
        ...baseEvent.repeat,
        endDate: '2025-10-15',
      },
    };

    const events = generateRecurringEvents(eventWithEndDate, 10);

    // endDate 당일인 2025-10-15가 포함되어야 함
    expect(events.some((e) => e.date === '2025-10-15')).toBe(true);
  });

  it('endDate 이후의 일정은 생성되지 않는다', () => {
    const eventWithEndDate: Event = {
      ...baseEvent,
      repeat: {
        ...baseEvent.repeat,
        endDate: '2025-10-15',
      },
    };

    const events = generateRecurringEvents(eventWithEndDate, 10);

    // 모든 이벤트가 endDate 이전 또는 당일이어야 함
    events.forEach((event) => {
      expect(event.date <= '2025-10-15').toBe(true);
    });
  });

  it('endDate가 시작일과 같으면 1개의 이벤트만 생성된다', () => {
    const eventWithEndDate: Event = {
      ...baseEvent,
      repeat: {
        ...baseEvent.repeat,
        endDate: '2025-10-01', // 시작일과 동일
      },
    };

    const events = generateRecurringEvents(eventWithEndDate, 10);

    expect(events).toHaveLength(1);
    expect(events[0].date).toBe('2025-10-01');
  });
});
