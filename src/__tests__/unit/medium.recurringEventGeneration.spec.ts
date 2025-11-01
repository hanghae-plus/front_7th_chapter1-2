import { describe, it, expect } from 'vitest';

import { EventForm } from '../../types';
import { generateRecurringEvents } from '../../utils/eventUtils';

describe('generateRecurringEvents', () => {
  const baseEventForm: EventForm = {
    title: '반복 테스트 이벤트',
    date: '2025-01-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명',
    location: '테스트 장소',
    category: '업무',
    repeat: {
      type: 'daily',
      interval: 1,
      endDate: '2025-01-05',
    },
    notificationTime: 10,
  };

  describe('TC-001: 일일 반복 이벤트 생성', () => {
    it('시작일부터 종료일까지 매일 이벤트를 생성한다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-01',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-05',
        },
      };

      const result = generateRecurringEvents(eventForm);

      expect(result).toHaveLength(5);
      expect(result[0].date).toBe('2025-01-01');
      expect(result[1].date).toBe('2025-01-02');
      expect(result[2].date).toBe('2025-01-03');
      expect(result[3].date).toBe('2025-01-04');
      expect(result[4].date).toBe('2025-01-05');
    });

    it('모든 이벤트가 고유한 id를 가진다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-05',
        },
      };

      const result = generateRecurringEvents(eventForm);

      const ids = result.map((event) => event.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(5);
    });

    it('모든 이벤트가 동일한 repeat.id를 공유한다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-05',
        },
      };

      const result = generateRecurringEvents(eventForm);

      const repeatIds = result.map((event) => event.repeat.id);
      const uniqueRepeatIds = new Set(repeatIds);

      expect(uniqueRepeatIds.size).toBe(1);
      expect(result[0].repeat.id).toBeDefined();
      expect(result[0].repeat.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('각 이벤트가 repeat.type = "daily"를 가진다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-05',
        },
      };

      const result = generateRecurringEvents(eventForm);

      result.forEach((event) => {
        expect(event.repeat.type).toBe('daily');
        expect(event.repeat.interval).toBe(1);
        expect(event.repeat.endDate).toBe('2025-01-05');
      });
    });
  });

  describe('TC-002: 주간 반복 이벤트 생성', () => {
    it('시작일과 동일한 요일에 주간 반복 이벤트를 생성한다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-06', // Monday
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-01-27',
        },
      };

      const result = generateRecurringEvents(eventForm);

      expect(result).toHaveLength(4);
      expect(result[0].date).toBe('2025-01-06'); // Monday
      expect(result[1].date).toBe('2025-01-13'); // Monday
      expect(result[2].date).toBe('2025-01-20'); // Monday
      expect(result[3].date).toBe('2025-01-27'); // Monday

      // Verify all dates are Mondays
      result.forEach((event) => {
        const date = new Date(event.date);
        expect(date.getUTCDay()).toBe(1); // Monday = 1
      });
    });

    it('모든 주간 반복 이벤트가 동일한 repeat.id를 공유한다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-06',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-01-27',
        },
      };

      const result = generateRecurringEvents(eventForm);

      const repeatIds = result.map((event) => event.repeat.id);
      const uniqueRepeatIds = new Set(repeatIds);

      expect(uniqueRepeatIds.size).toBe(1);
    });

    it('각 이벤트가 repeat.type = "weekly"를 가진다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-06',
        repeat: {
          type: 'weekly',
          interval: 1,
          endDate: '2025-01-27',
        },
      };

      const result = generateRecurringEvents(eventForm);

      result.forEach((event) => {
        expect(event.repeat.type).toBe('weekly');
      });
    });
  });

  describe('TC-003: 월간 반복 이벤트 생성 (일반 날짜)', () => {
    it('매월 동일한 날짜에 이벤트를 생성한다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-15',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-04-30',
        },
      };

      const result = generateRecurringEvents(eventForm);

      expect(result).toHaveLength(4);
      expect(result[0].date).toBe('2025-01-15');
      expect(result[1].date).toBe('2025-02-15');
      expect(result[2].date).toBe('2025-03-15');
      expect(result[3].date).toBe('2025-04-15');
    });

    it('모든 월간 반복 이벤트가 동일한 repeat.id를 공유한다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-15',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-04-30',
        },
      };

      const result = generateRecurringEvents(eventForm);

      const repeatIds = result.map((event) => event.repeat.id);
      const uniqueRepeatIds = new Set(repeatIds);

      expect(uniqueRepeatIds.size).toBe(1);
    });

    it('각 이벤트가 repeat.type = "monthly"를 가진다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-15',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-04-30',
        },
      };

      const result = generateRecurringEvents(eventForm);

      result.forEach((event) => {
        expect(event.repeat.type).toBe('monthly');
      });
    });
  });

  describe('TC-006: 모든 이벤트가 동일한 repeat.id 공유', () => {
    it('생성된 모든 이벤트가 동일한 repeat.id를 가진다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-01',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-05',
        },
      };

      const result = generateRecurringEvents(eventForm);

      const repeatIds = result.map((event) => event.repeat.id);
      const uniqueRepeatIds = new Set(repeatIds);

      expect(uniqueRepeatIds.size).toBe(1);
    });

    it('repeat.id가 UUID v4 형식이다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-05',
        },
      };

      const result = generateRecurringEvents(eventForm);

      const repeatId = result[0].repeat.id;
      expect(repeatId).toBeDefined();
      expect(repeatId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it('repeat.id가 event.id와 다르다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-05',
        },
      };

      const result = generateRecurringEvents(eventForm);

      result.forEach((event) => {
        expect(event.id).not.toBe(event.repeat.id);
      });
    });
  });

  describe('TC-007: 모든 이벤트가 고유한 event.id 보유', () => {
    it('생성된 모든 이벤트가 고유한 id를 가진다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-01',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-05',
        },
      };

      const result = generateRecurringEvents(eventForm);

      const ids = result.map((event) => event.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(result.length);
      expect(uniqueIds.size).toBe(5);
    });

    it('각 event.id가 UUID v4 형식이다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-05',
        },
      };

      const result = generateRecurringEvents(eventForm);

      result.forEach((event) => {
        expect(event.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        );
      });
    });
  });

  // Phase 2: Core Edge Cases
  describe('TC-004: 31일에 월간 반복 이벤트 생성 (엣지 케이스)', () => {
    it('31일이 있는 월에만 이벤트를 생성한다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-31',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-04-30',
        },
      };

      const result = generateRecurringEvents(eventForm);

      // 1월과 3월에만 생성 (2월과 4월은 31일이 없음)
      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2025-01-31');
      expect(result[1].date).toBe('2025-03-31');

      // 모든 이벤트가 31일이어야 함
      result.forEach((event) => {
        const date = new Date(event.date);
        expect(date.getDate()).toBe(31);
      });
    });

    it('2월 31일 이벤트가 생성되지 않는다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-31',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-04-30',
        },
      };

      const result = generateRecurringEvents(eventForm);

      const februaryEvents = result.filter((event) => event.date.includes('2025-02'));
      expect(februaryEvents).toHaveLength(0);
    });

    it('4월 31일 이벤트가 생성되지 않는다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-31',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-04-30',
        },
      };

      const result = generateRecurringEvents(eventForm);

      const aprilEvents = result.filter((event) => event.date.includes('2025-04'));
      expect(aprilEvents).toHaveLength(0);
    });

    it('1년 동안 31일 반복 시 7개 이벤트가 생성된다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-31',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-12-31',
        },
      };

      const result = generateRecurringEvents(eventForm);

      // Jan, Mar, May, Jul, Aug, Oct, Dec = 7개월
      expect(result).toHaveLength(7);
      expect(result[0].date).toBe('2025-01-31');
      expect(result[1].date).toBe('2025-03-31');
      expect(result[2].date).toBe('2025-05-31');
      expect(result[3].date).toBe('2025-07-31');
      expect(result[4].date).toBe('2025-08-31');
      expect(result[5].date).toBe('2025-10-31');
      expect(result[6].date).toBe('2025-12-31');
    });
  });

  describe('TC-005: 2월 29일 연간 반복 이벤트 생성 (윤년 엣지 케이스)', () => {
    it('윤년에만 2월 29일 이벤트를 생성한다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2024-02-29',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2027-03-01',
        },
      };

      const result = generateRecurringEvents(eventForm);

      // 2024년만 윤년 (2025, 2026, 2027은 윤년 아님)
      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2024-02-29');
    });

    it('2025년에는 2월 29일 이벤트가 생성되지 않는다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2024-02-29',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2027-03-01',
        },
      };

      const result = generateRecurringEvents(eventForm);

      const has2025Event = result.some((event) => event.date.includes('2025-02-29'));
      expect(has2025Event).toBe(false);
    });

    it('2026년에는 2월 29일 이벤트가 생성되지 않는다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2024-02-29',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2027-03-01',
        },
      };

      const result = generateRecurringEvents(eventForm);

      const has2026Event = result.some((event) => event.date.includes('2026-02-29'));
      expect(has2026Event).toBe(false);
    });

    it('2024년부터 2028년까지 2월 29일 반복 시 2개 이벤트가 생성된다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2024-02-29',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2028-12-31',
        },
      };

      const result = generateRecurringEvents(eventForm);

      // 2024와 2028만 윤년
      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-02-29');
      expect(result[1].date).toBe('2028-02-29');
    });
  });

  describe('TC-041: 단일 날짜 반복 이벤트 (시작일 = 종료일)', () => {
    it('시작일과 종료일이 같을 때 1개의 이벤트를 생성한다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-01',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-01',
        },
      };

      const result = generateRecurringEvents(eventForm);

      expect(result).toHaveLength(1);
      expect(result[0].date).toBe('2025-01-01');
    });

    it('단일 날짜 이벤트도 repeat.id를 가진다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-01',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-01-01',
        },
      };

      const result = generateRecurringEvents(eventForm);

      expect(result[0].repeat.id).toBeDefined();
      expect(result[0].repeat.type).toBe('daily');
    });
  });

  describe('TC-042: 대용량 반복 시리즈 (365일)', () => {
    it('1년 전체 일일 반복 시 365개 이벤트를 생성한다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-01',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-12-31',
        },
      };

      const start = performance.now();
      const result = generateRecurringEvents(eventForm);
      const end = performance.now();

      expect(result).toHaveLength(365);
      expect(result[0].date).toBe('2025-01-01');
      expect(result[364].date).toBe('2025-12-31');

      // 성능 검증: 2초 이내 완료
      expect(end - start).toBeLessThan(2000);
    });

    it('모든 이벤트가 고유한 ID를 가진다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-01',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-12-31',
        },
      };

      const result = generateRecurringEvents(eventForm);

      const ids = result.map((event) => event.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(365);
    });

    it('모든 이벤트가 동일한 repeat.id를 공유한다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-01',
        repeat: {
          type: 'daily',
          interval: 1,
          endDate: '2025-12-31',
        },
      };

      const result = generateRecurringEvents(eventForm);

      const repeatIds = result.map((event) => event.repeat.id);
      const uniqueRepeatIds = new Set(repeatIds);

      expect(uniqueRepeatIds.size).toBe(1);
    });
  });

  describe('TC-045: 30일에 월간 반복 이벤트 (2월 건너뜀)', () => {
    it('30일이 있는 월에만 이벤트를 생성한다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-30',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-03-30',
        },
      };

      const result = generateRecurringEvents(eventForm);

      // 1월과 3월에만 생성 (2월은 28일까지)
      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2025-01-30');
      expect(result[1].date).toBe('2025-03-30');
    });

    it('2월 30일 이벤트가 생성되지 않는다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-30',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-03-30',
        },
      };

      const result = generateRecurringEvents(eventForm);

      const februaryEvents = result.filter((event) => event.date.includes('2025-02'));
      expect(februaryEvents).toHaveLength(0);
    });
  });

  describe('TC-046: 29일에 월간 반복 이벤트 (평년 2월 건너뜀)', () => {
    it('평년의 2월은 건너뛴다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-29',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-03-29',
        },
      };

      const result = generateRecurringEvents(eventForm);

      // 2025년은 평년이므로 2월에 29일 없음
      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2025-01-29');
      expect(result[1].date).toBe('2025-03-29');
    });

    it('2025년 2월 29일 이벤트가 생성되지 않는다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2025-01-29',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-03-29',
        },
      };

      const result = generateRecurringEvents(eventForm);

      const februaryEvents = result.filter((event) => event.date === '2025-02-29');
      expect(februaryEvents).toHaveLength(0);
    });
  });

  describe('TC-047: 29일에 월간 반복 이벤트 (윤년 2월 포함)', () => {
    it('윤년의 2월은 포함한다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2024-01-29',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2024-03-29',
        },
      };

      const result = generateRecurringEvents(eventForm);

      // 2024년은 윤년이므로 2월에 29일 있음
      expect(result).toHaveLength(3);
      expect(result[0].date).toBe('2024-01-29');
      expect(result[1].date).toBe('2024-02-29');
      expect(result[2].date).toBe('2024-03-29');
    });

    it('2024년 2월 29일 이벤트가 생성된다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2024-01-29',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2024-03-29',
        },
      };

      const result = generateRecurringEvents(eventForm);

      const februaryEvent = result.find((event) => event.date === '2024-02-29');
      expect(februaryEvent).toBeDefined();
    });
  });

  describe('TC-053: 연도 경계 넘김 (12월에서 1월)', () => {
    it('12월에서 1월로 월간 반복 이벤트를 생성한다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2024-12-15',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-01-15',
        },
      };

      const result = generateRecurringEvents(eventForm);

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe('2024-12-15');
      expect(result[1].date).toBe('2025-01-15');
    });

    it('연도가 올바르게 증가한다', () => {
      const eventForm: EventForm = {
        ...baseEventForm,
        date: '2024-12-15',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-01-15',
        },
      };

      const result = generateRecurringEvents(eventForm);

      const firstDate = new Date(result[0].date);
      const secondDate = new Date(result[1].date);

      expect(firstDate.getFullYear()).toBe(2024);
      expect(secondDate.getFullYear()).toBe(2025);
    });
  });
});
