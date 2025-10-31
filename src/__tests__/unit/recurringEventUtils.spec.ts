import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import type { Event, RepeatType } from '../../types';
import { generateRecurringEvents, isRecurringEvent } from '../../utils/recurringEventUtils';

describe('recurringEventUtils', () => {
  beforeEach(() => {
    vi.useRealTimers(); // Ensure clean state first
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('generateRecurringEvents', () => {
    const baseEventData = {
      title: '테스트 이벤트',
      startTime: '09:00',
      endTime: '10:00',
      description: '테스트 설명',
      location: '테스트 장소',
      category: 'meeting',
      notificationTime: 10,
    };

    it('매일 반복 일정을 올바르게 생성한다', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-07');
      const repeatType: RepeatType = 'daily';

      const events = generateRecurringEvents(startDate, endDate, repeatType, baseEventData);

      expect(events).toHaveLength(7);
      expect(events[0].date).toBe('2025-01-01');
      expect(events[6].date).toBe('2025-01-07');

      // 모든 이벤트가 동일한 recurrenceId를 가지는지 확인
      const recurrenceIds = events.map((e) => e.repeat.interval);
      expect(new Set(recurrenceIds).size).toBe(1);

      // 각 이벤트의 repeat.type이 'daily'인지 확인
      events.forEach((event) => {
        expect(event.repeat.type).toBe('daily');
      });
    });

    it('매주 반복 일정을 올바르게 생성한다', () => {
      const startDate = new Date('2025-01-01'); // 수요일
      const endDate = new Date('2025-01-29');
      const repeatType: RepeatType = 'weekly';

      const events = generateRecurringEvents(startDate, endDate, repeatType, baseEventData);

      expect(events).toHaveLength(5); // 1/1, 1/8, 1/15, 1/22, 1/29
      expect(events[0].date).toBe('2025-01-01');
      expect(events[1].date).toBe('2025-01-08');
      expect(events[4].date).toBe('2025-01-29');

      // 모든 이벤트가 수요일인지 확인
      events.forEach((event) => {
        const eventDate = new Date(event.date);
        expect(eventDate.getDay()).toBe(3); // 수요일 = 3
      });
    });

    it('매월 반복 일정을 올바르게 생성한다', () => {
      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-06-30');
      const repeatType: RepeatType = 'monthly';

      const events = generateRecurringEvents(startDate, endDate, repeatType, baseEventData);

      expect(events).toHaveLength(6); // 1/15, 2/15, 3/15, 4/15, 5/15, 6/15
      expect(events[0].date).toBe('2025-01-15');
      expect(events[1].date).toBe('2025-02-15');
      expect(events[5].date).toBe('2025-06-15');

      // 각 이벤트가 15일인지 확인
      events.forEach((event) => {
        const eventDate = new Date(event.date);
        expect(eventDate.getDate()).toBe(15);
      });
    });

    it('31일 매월 반복 시 31일이 없는 달은 건너뛴다 (엣지 케이스)', () => {
      const startDate = new Date('2025-01-31');
      const endDate = new Date('2025-12-31');
      const repeatType: RepeatType = 'monthly';

      const events = generateRecurringEvents(startDate, endDate, repeatType, baseEventData);

      // 31일이 있는 달: 1월, 3월, 5월, 7월, 8월, 10월, 12월 = 7개
      expect(events).toHaveLength(7);

      expect(events[0].date).toBe('2025-01-31');
      expect(events[1].date).toBe('2025-03-31');
      expect(events[2].date).toBe('2025-05-31');
      expect(events[3].date).toBe('2025-07-31');
      expect(events[4].date).toBe('2025-08-31');
      expect(events[5].date).toBe('2025-10-31');
      expect(events[6].date).toBe('2025-12-31');
    });

    it('윤년 2월 29일 매년 반복 시 윤년이 아닌 해는 건너뛴다 (엣지 케이스)', () => {
      const startDate = new Date('2024-02-29'); // 2024년은 윤년
      const endDate = new Date('2030-12-31');
      const repeatType: RepeatType = 'yearly';

      const events = generateRecurringEvents(startDate, endDate, repeatType, baseEventData);

      // 2024, 2028만 윤년 = 2개
      expect(events).toHaveLength(2);
      expect(events[0].date).toBe('2024-02-29');
      expect(events[1].date).toBe('2028-02-29');
    });

    it('매년 반복 일정을 올바르게 생성한다', () => {
      const startDate = new Date('2025-03-15');
      const endDate = new Date('2028-12-31');
      const repeatType: RepeatType = 'yearly';

      const events = generateRecurringEvents(startDate, endDate, repeatType, baseEventData);

      expect(events).toHaveLength(4); // 2025, 2026, 2027, 2028
      expect(events[0].date).toBe('2025-03-15');
      expect(events[1].date).toBe('2026-03-15');
      expect(events[2].date).toBe('2027-03-15');
      expect(events[3].date).toBe('2028-03-15');
    });

    it('종료 날짜가 없으면 빈 배열을 반환한다', () => {
      const startDate = new Date('2025-01-01');
      const endDate: Date | null = null;
      const repeatType: RepeatType = 'daily';

      const events = generateRecurringEvents(startDate, endDate, repeatType, baseEventData);

      expect(events).toEqual([]);
    });

    it('종료 날짜가 시작 날짜보다 이전이면 빈 배열을 반환한다', () => {
      const startDate = new Date('2025-01-10');
      const endDate = new Date('2025-01-05');
      const repeatType: RepeatType = 'daily';

      const events = generateRecurringEvents(startDate, endDate, repeatType, baseEventData);

      expect(events).toEqual([]);
    });

    it('생성된 모든 이벤트는 고유한 ID를 가진다', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-05');
      const repeatType: RepeatType = 'daily';

      const events = generateRecurringEvents(startDate, endDate, repeatType, baseEventData);

      const ids = events.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(events.length);
    });
  });

  describe('generateRecurringEvents - interval 적용', () => {
    const baseEventData = {
      title: '인터벌 테스트 이벤트',
      startTime: '14:00',
      endTime: '15:00',
      description: '인터벌 테스트',
      location: '테스트 장소',
      category: 'meeting',
      notificationTime: 10,
    };

    it('매일 반복 - 인터벌 2 (하루 건너뛰기)', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-10');
      const repeatType: RepeatType = 'daily';
      const interval = 2;

      const events = generateRecurringEvents(
        startDate,
        endDate,
        repeatType,
        baseEventData,
        interval
      );

      expect(events).toHaveLength(5); // 1/1, 1/3, 1/5, 1/7, 1/9
      expect(events[0].date).toBe('2025-01-01');
      expect(events[1].date).toBe('2025-01-03');
      expect(events[2].date).toBe('2025-01-05');
      expect(events[3].date).toBe('2025-01-07');
      expect(events[4].date).toBe('2025-01-09');

      // 모든 이벤트의 interval이 2인지 확인
      events.forEach((event) => {
        expect(event.repeat.interval).toBe(2);
      });
    });

    it('매일 반복 - 인터벌 7 (일주일 간격)', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-02-01');
      const repeatType: RepeatType = 'daily';
      const interval = 7;

      const events = generateRecurringEvents(
        startDate,
        endDate,
        repeatType,
        baseEventData,
        interval
      );

      expect(events).toHaveLength(5); // 1/1, 1/8, 1/15, 1/22, 1/29
      expect(events[0].date).toBe('2025-01-01');
      expect(events[1].date).toBe('2025-01-08');
      expect(events[4].date).toBe('2025-01-29');

      events.forEach((event) => {
        expect(event.repeat.interval).toBe(7);
      });
    });

    it('매주 반복 - 인터벌 2 (격주)', () => {
      const startDate = new Date('2025-01-01'); // 수요일
      const endDate = new Date('2025-03-01');
      const repeatType: RepeatType = 'weekly';
      const interval = 2;

      const events = generateRecurringEvents(
        startDate,
        endDate,
        repeatType,
        baseEventData,
        interval
      );

      expect(events).toHaveLength(5); // 1/1, 1/15, 1/29, 2/12, 2/26
      expect(events[0].date).toBe('2025-01-01');
      expect(events[1].date).toBe('2025-01-15');
      expect(events[2].date).toBe('2025-01-29');
      expect(events[3].date).toBe('2025-02-12');
      expect(events[4].date).toBe('2025-02-26');

      // 모든 이벤트가 수요일인지 확인
      events.forEach((event) => {
        const eventDate = new Date(event.date);
        expect(eventDate.getDay()).toBe(3); // 수요일 = 3
        expect(event.repeat.interval).toBe(2);
      });
    });

    it('매주 반복 - 인터벌 4 (4주 간격)', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-05-01');
      const repeatType: RepeatType = 'weekly';
      const interval = 4;

      const events = generateRecurringEvents(
        startDate,
        endDate,
        repeatType,
        baseEventData,
        interval
      );

      expect(events).toHaveLength(5); // 약 1개월 간격으로 5개
      expect(events[0].date).toBe('2025-01-01');
      expect(events[1].date).toBe('2025-01-29');
      expect(events[2].date).toBe('2025-02-26');

      events.forEach((event) => {
        expect(event.repeat.interval).toBe(4);
      });
    });

    it('매월 반복 - 인터벌 2 (격월)', () => {
      const startDate = new Date('2025-01-15');
      const endDate = new Date('2025-09-15');
      const repeatType: RepeatType = 'monthly';
      const interval = 2;

      const events = generateRecurringEvents(
        startDate,
        endDate,
        repeatType,
        baseEventData,
        interval
      );

      expect(events).toHaveLength(5); // 1/15, 3/15, 5/15, 7/15, 9/15
      expect(events[0].date).toBe('2025-01-15');
      expect(events[1].date).toBe('2025-03-15');
      expect(events[2].date).toBe('2025-05-15');
      expect(events[3].date).toBe('2025-07-15');
      expect(events[4].date).toBe('2025-09-15');

      // 모든 이벤트가 15일인지 확인
      events.forEach((event) => {
        const eventDate = new Date(event.date);
        expect(eventDate.getDate()).toBe(15);
        expect(event.repeat.interval).toBe(2);
      });
    });

    it('매월 반복 - 인터벌 3 (분기별)', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2026-01-01');
      const repeatType: RepeatType = 'monthly';
      const interval = 3;

      const events = generateRecurringEvents(
        startDate,
        endDate,
        repeatType,
        baseEventData,
        interval
      );

      expect(events).toHaveLength(5); // 1/1, 4/1, 7/1, 10/1, 2026/1/1
      expect(events[0].date).toBe('2025-01-01');
      expect(events[1].date).toBe('2025-04-01');
      expect(events[2].date).toBe('2025-07-01');
      expect(events[3].date).toBe('2025-10-01');
      expect(events[4].date).toBe('2026-01-01');

      events.forEach((event) => {
        expect(event.repeat.interval).toBe(3);
      });
    });

    it('매월 반복 - 31일 + 인터벌 2 (엣지 케이스)', () => {
      const startDate = new Date('2025-01-31');
      const endDate = new Date('2025-09-01');
      const repeatType: RepeatType = 'monthly';
      const interval = 2;

      const events = generateRecurringEvents(
        startDate,
        endDate,
        repeatType,
        baseEventData,
        interval
      );

      // 1월, 3월, 5월, 7월만 31일 존재
      expect(events).toHaveLength(4);
      expect(events[0].date).toBe('2025-01-31');
      expect(events[1].date).toBe('2025-03-31');
      expect(events[2].date).toBe('2025-05-31');
      expect(events[3].date).toBe('2025-07-31');

      events.forEach((event) => {
        expect(event.repeat.interval).toBe(2);
      });
    });

    it('매년 반복 - 인터벌 2 (격년)', () => {
      const startDate = new Date('2025-03-15');
      const endDate = new Date('2033-03-15');
      const repeatType: RepeatType = 'yearly';
      const interval = 2;

      const events = generateRecurringEvents(
        startDate,
        endDate,
        repeatType,
        baseEventData,
        interval
      );

      expect(events).toHaveLength(5); // 2025, 2027, 2029, 2031, 2033
      expect(events[0].date).toBe('2025-03-15');
      expect(events[1].date).toBe('2027-03-15');
      expect(events[2].date).toBe('2029-03-15');
      expect(events[3].date).toBe('2031-03-15');
      expect(events[4].date).toBe('2033-03-15');

      // 모든 이벤트가 3월 15일인지 확인
      events.forEach((event) => {
        const eventDate = new Date(event.date);
        expect(eventDate.getMonth()).toBe(2); // 3월 = 2
        expect(eventDate.getDate()).toBe(15);
        expect(event.repeat.interval).toBe(2);
      });
    });

    it('매년 반복 - 2월 29일 + 인터벌 2 (엣지 케이스)', () => {
      const startDate = new Date('2024-02-29'); // 윤년
      const endDate = new Date('2034-02-29');
      const repeatType: RepeatType = 'yearly';
      const interval = 2;

      const events = generateRecurringEvents(
        startDate,
        endDate,
        repeatType,
        baseEventData,
        interval
      );

      // 2024, 2028, 2032만 윤년 (2026, 2030은 평년)
      expect(events).toHaveLength(3);
      expect(events[0].date).toBe('2024-02-29');
      expect(events[1].date).toBe('2028-02-29');
      expect(events[2].date).toBe('2032-02-29');

      events.forEach((event) => {
        expect(event.repeat.interval).toBe(2);
      });
    });

    it('인터벌 파라미터 없이 호출하면 기본값 1로 동작한다', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-05');
      const repeatType: RepeatType = 'daily';

      // interval 파라미터 없이 호출
      const events = generateRecurringEvents(startDate, endDate, repeatType, baseEventData);

      // 기본값 1로 동작 - 연속된 날짜
      expect(events).toHaveLength(5);
      expect(events[0].date).toBe('2025-01-01');
      expect(events[4].date).toBe('2025-01-05');

      // interval은 1로 설정됨
      events.forEach((event) => {
        expect(event.repeat.interval).toBe(1);
      });
    });
  });

  describe('isRecurringEvent', () => {
    it('repeat.type이 "daily"이면 true를 반환한다', () => {
      const event: Event = {
        id: '1',
        title: '테스트',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: 'meeting',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-07',
        },
        notificationTime: 10,
      };

      expect(isRecurringEvent(event)).toBe(true);
    });

    it('repeat.type이 "weekly"이면 true를 반환한다', () => {
      const event: Event = {
        id: '1',
        title: '테스트',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: 'meeting',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-01-29',
        },
        notificationTime: 10,
      };

      expect(isRecurringEvent(event)).toBe(true);
    });

    it('repeat.type이 "none"이면 false를 반환한다', () => {
      const event: Event = {
        id: '1',
        title: '테스트',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: 'meeting',
        repeat: {
          type: 'none',
          interval: 1,
        },
        notificationTime: 10,
      };

      expect(isRecurringEvent(event)).toBe(false);
    });
  });
});
