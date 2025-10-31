// 반복 일정 생성 범위 테스트
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';

import { EventProps } from '@/types/events/Event.types';
import {
  generateRecurringEvents,
  calculateNextOccurrence,
  filterEventsInRange,
  optimizeEventGeneration,
  validateGenerationParams,
} from '@/utils/recurring/eventGeneration';

describe('반복 일정 생성 범위 제한', () => {
  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  describe('generateRecurringEvents', () => {
    it('기본 이벤트 템플릿으로 반복 일정을 생성해야 함', () => {
      const baseEvent: EventProps = {
        id: 'base-event',
        title: '테스트 반복 일정',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01'),
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endCondition: {
            type: 'count',
            count: 5,
          },
        },
      };

      const events = generateRecurringEvents(baseEvent);

      expect(events).toHaveLength(5);
      expect(events[0].id).toBe('base-event-1');
      expect(events[0].title).toBe('테스트 반복 일정');
      expect(events[4].id).toBe('base-event-5');
    });

    it('날짜 기반 종료 조건으로 제한된 일정을 생성해야 함', () => {
      const baseEvent: EventProps = {
        id: 'date-limited',
        title: '날짜 제한 반복',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01'),
        category: '개인',
        repeat: {
          type: 'weekly',
          interval: 1,
          endCondition: {
            type: 'date',
            endDate: new Date('2024-02-01'),
          },
        },
      };

      const events = generateRecurringEvents(baseEvent);

      expect(events).toHaveLength(5); // 1/1, 1/8, 1/15, 1/22, 1/29
      expect(events[0].startDate).toEqual(new Date('2024-01-01'));
      expect(events[4].startDate).toEqual(new Date('2024-01-29'));
    });

    it('최대 범위 제한으로 일정 생성을 제한해야 함', () => {
      const baseEvent: EventProps = {
        id: 'max-range',
        title: '최대 범위 테스트',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01'),
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endCondition: {
            type: 'never',
          },
        },
      };

      const events = generateRecurringEvents(baseEvent);

      // 2024-01-01부터 2025-12-31까지 제한
      expect(events.length).toBeLessThanOrEqual(731); // 최대 2년간
      expect(
        events[events.length - 1].startDate.getFullYear()
      ).toBeLessThanOrEqual(2025);
    });

    it('count 기반 종료 조건으로 정확한 개수를 생성해야 함', () => {
      const baseEvent: EventProps = {
        id: 'count-limited',
        title: '개수 제한 반복',
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-06-01'),
        category: '개인',
        repeat: {
          type: 'monthly',
          interval: 2,
          endCondition: {
            type: 'count',
            count: 6,
          },
        },
      };

      const events = generateRecurringEvents(baseEvent);

      expect(events).toHaveLength(6);
      expect(events[0].startDate).toEqual(new Date('2024-06-01'));
      expect(events[1].startDate).toEqual(new Date('2024-08-01')); // 2개월 간격
      expect(events[5].startDate).toEqual(new Date('2025-04-01')); // 10개월 후
    });

    it('빈 결과를 올바르게 처리해야 함', () => {
      const baseEvent: EventProps = {
        id: 'empty-result',
        title: '빈 결과 테스트',
        startDate: new Date('2026-01-01'), // 최대 범위 초과
        endDate: new Date('2026-01-01'),
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endCondition: {
            type: 'count',
            count: 5,
          },
        },
      };

      const events = generateRecurringEvents(baseEvent);

      expect(events).toHaveLength(0);
    });

    it('이벤트 기간이 있는 일정을 올바르게 처리해야 함', () => {
      const baseEvent: EventProps = {
        id: 'multi-day',
        title: '다일 이벤트',
        startDate: new Date('2024-01-01T09:00:00'),
        endDate: new Date('2024-01-03T17:00:00'), // 3일간
        category: '프로젝트',
        repeat: {
          type: 'monthly',
          interval: 1,
          endCondition: {
            type: 'count',
            count: 3,
          },
        },
      };

      const events = generateRecurringEvents(baseEvent);

      expect(events).toHaveLength(3);

      // 첫 번째 이벤트
      expect(events[0].startDate).toEqual(new Date('2024-01-01T09:00:00'));
      expect(events[0].endDate).toEqual(new Date('2024-01-03T17:00:00'));

      // 두 번째 이벤트 (1개월 후)
      expect(events[1].startDate).toEqual(new Date('2024-02-01T09:00:00'));
      expect(events[1].endDate).toEqual(new Date('2024-02-03T17:00:00'));

      // 세 번째 이벤트 (2개월 후)
      expect(events[2].startDate).toEqual(new Date('2024-03-01T09:00:00'));
      expect(events[2].endDate).toEqual(new Date('2024-03-03T17:00:00'));
    });
  });

  describe('calculateNextOccurrence', () => {
    it('일일 반복의 다음 발생일을 계산해야 함', () => {
      const currentDate = new Date('2024-01-01');

      const nextDaily = calculateNextOccurrence(currentDate, 'daily', 1);
      expect(nextDaily).toEqual(new Date('2024-01-02'));

      const nextDaily3 = calculateNextOccurrence(currentDate, 'daily', 3);
      expect(nextDaily3).toEqual(new Date('2024-01-04'));
    });

    it('주간 반복의 다음 발생일을 계산해야 함', () => {
      const currentDate = new Date('2024-01-01'); // 월요일

      const nextWeekly = calculateNextOccurrence(currentDate, 'weekly', 1);
      expect(nextWeekly).toEqual(new Date('2024-01-08')); // 다음 월요일

      const nextWeekly2 = calculateNextOccurrence(currentDate, 'weekly', 2);
      expect(nextWeekly2).toEqual(new Date('2024-01-15')); // 2주 후 월요일
    });

    it('월간 반복의 다음 발생일을 계산해야 함', () => {
      const currentDate = new Date('2024-01-15');

      const nextMonthly = calculateNextOccurrence(currentDate, 'monthly', 1);
      expect(nextMonthly).toEqual(new Date('2024-02-15'));

      const nextMonthly3 = calculateNextOccurrence(currentDate, 'monthly', 3);
      expect(nextMonthly3).toEqual(new Date('2024-04-15'));
    });

    it('연간 반복의 다음 발생일을 계산해야 함', () => {
      const currentDate = new Date('2024-06-15');

      const nextYearly = calculateNextOccurrence(currentDate, 'yearly', 1);
      expect(nextYearly).toEqual(new Date('2025-06-15'));

      const nextYearly2 = calculateNextOccurrence(currentDate, 'yearly', 2);
      expect(nextYearly2).toEqual(new Date('2026-06-15'));
    });

    it('월말 날짜의 월간 반복을 올바르게 처리해야 함', () => {
      const jan31 = new Date('2024-01-31');
      const nextMonth = calculateNextOccurrence(jan31, 'monthly', 1);
      expect(nextMonth).toEqual(new Date('2024-02-29')); // 윤년이므로 2/29

      const mar31 = new Date('2024-03-31');
      const nextFromMar = calculateNextOccurrence(mar31, 'monthly', 1);
      expect(nextFromMar).toEqual(new Date('2024-04-30')); // 4월은 30일까지
    });

    it('윤년 날짜의 연간 반복을 올바르게 처리해야 함', () => {
      const leapDay = new Date('2024-02-29');
      const nextYear = calculateNextOccurrence(leapDay, 'yearly', 1);
      expect(nextYear).toEqual(new Date('2025-02-28')); // 평년이므로 2/28
    });
  });

  describe('filterEventsInRange', () => {
    const sampleEvents: EventProps[] = [
      {
        id: '1',
        title: 'Event 1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01'),
        category: '업무',
      },
      {
        id: '2',
        title: 'Event 2',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-15'),
        category: '개인',
      },
      {
        id: '3',
        title: 'Event 3',
        startDate: new Date('2024-12-31'),
        endDate: new Date('2024-12-31'),
        category: '업무',
      },
      {
        id: '4',
        title: 'Event 4',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-01'),
        category: '개인',
      },
    ];

    it('지정된 날짜 범위 내의 이벤트만 필터링해야 함', () => {
      const startRange = new Date('2024-01-01');
      const endRange = new Date('2024-12-31');

      const filtered = filterEventsInRange(sampleEvents, startRange, endRange);

      expect(filtered).toHaveLength(3);
      expect(filtered.map((e) => e.id)).toEqual(['1', '2', '3']);
    });

    it('범위를 벗어난 이벤트를 제외해야 함', () => {
      const startRange = new Date('2024-06-01');
      const endRange = new Date('2024-12-01');

      const filtered = filterEventsInRange(sampleEvents, startRange, endRange);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('2');
    });

    it('빈 배열에서 빈 결과를 반환해야 함', () => {
      const filtered = filterEventsInRange(
        [],
        new Date('2024-01-01'),
        new Date('2024-12-31')
      );
      expect(filtered).toHaveLength(0);
    });

    it('경계 날짜의 이벤트를 포함해야 함', () => {
      const startRange = new Date('2024-01-01');
      const endRange = new Date('2024-01-01');

      const filtered = filterEventsInRange(sampleEvents, startRange, endRange);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].id).toBe('1');
    });
  });

  describe('optimizeEventGeneration', () => {
    it('대량 이벤트 생성을 최적화해야 함', () => {
      const baseEvent: EventProps = {
        id: 'optimization-test',
        title: '최적화 테스트',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01'),
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endCondition: {
            type: 'count',
            count: 500,
          },
        },
      };

      const startTime = performance.now();
      const events = optimizeEventGeneration(baseEvent);
      const endTime = performance.now();

      expect(events).toHaveLength(500);
      expect(endTime - startTime).toBeLessThan(100); // 100ms 이내
    });

    it('메모리 사용량을 최적화해야 함', () => {
      const baseEvent: EventProps = {
        id: 'memory-test',
        title: '메모리 테스트',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01'),
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endCondition: {
            type: 'count',
            count: 1000,
          },
        },
      };

      // 메모리 사용량 모니터링 (대략적)
      const initialMemory = process.memoryUsage().heapUsed;
      const events = optimizeEventGeneration(baseEvent);
      const finalMemory = process.memoryUsage().heapUsed;

      expect(events).toHaveLength(1000);
      // 메모리 증가량이 합리적인 범위 내에 있어야 함
      expect(finalMemory - initialMemory).toBeLessThan(50 * 1024 * 1024); // 50MB 이내
    });

    it('점진적 생성을 지원해야 함', () => {
      const baseEvent: EventProps = {
        id: 'incremental',
        title: '점진적 생성',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-01'),
        category: '업무',
        repeat: {
          type: 'weekly',
          interval: 1,
          endCondition: {
            type: 'count',
            count: 100,
          },
        },
      };

      const batchSize = 10;
      const generator = optimizeEventGeneration(baseEvent, { batchSize });

      expect(generator).toHaveLength(100);
      // 배치 처리가 올바르게 동작했는지 확인
      expect(generator[0].id).toBe('incremental-1');
      expect(generator[9].id).toBe('incremental-10');
      expect(generator[99].id).toBe('incremental-100');
    });
  });

  describe('validateGenerationParams', () => {
    it('유효한 생성 파라미터를 검증해야 함', () => {
      const baseEvent: EventProps = {
        id: 'valid-event',
        title: '유효한 이벤트',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-15'),
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endCondition: {
            type: 'count',
            count: 10,
          },
        },
      };

      const result = validateGenerationParams(baseEvent);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('잘못된 반복 타입에서 오류를 반환해야 함', () => {
      const baseEvent: EventProps = {
        id: 'invalid-type',
        title: '잘못된 타입',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-15'),
        category: '업무',
        repeat: {
          type: 'invalid' as 'daily',
          interval: 1,
          endCondition: {
            type: 'count',
            count: 10,
          },
        },
      };

      const result = validateGenerationParams(baseEvent);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('유효하지 않은 반복 타입입니다.');
    });

    it('잘못된 간격 값에서 오류를 반환해야 함', () => {
      const baseEvent: EventProps = {
        id: 'invalid-interval',
        title: '잘못된 간격',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-15'),
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 0,
          endCondition: {
            type: 'count',
            count: 10,
          },
        },
      };

      const result = validateGenerationParams(baseEvent);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('간격은 1 이상이어야 합니다.');
    });

    it('과도한 간격 값에서 경고를 반환해야 함', () => {
      const baseEvent: EventProps = {
        id: 'large-interval',
        title: '큰 간격',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-15'),
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 100,
          endCondition: {
            type: 'count',
            count: 10,
          },
        },
      };

      const result = validateGenerationParams(baseEvent);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('간격이 매우 큽니다. (100)');
    });

    it('반복 정보가 없는 경우 오류를 반환해야 함', () => {
      const baseEvent: EventProps = {
        id: 'no-repeat',
        title: '반복 없음',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-15'),
        category: '업무',
      };

      const result = validateGenerationParams(baseEvent);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('반복 정보가 필요합니다.');
    });
  });

  describe('경계값 및 특수 케이스', () => {
    it('시작 날짜가 최대 범위를 초과하는 경우', () => {
      const baseEvent: EventProps = {
        id: 'out-of-range',
        title: '범위 초과',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-01'),
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endCondition: {
            type: 'count',
            count: 5,
          },
        },
      };

      const events = generateRecurringEvents(baseEvent);
      expect(events).toHaveLength(0);
    });

    it('이벤트 종료 날짜가 시작 날짜보다 이전인 경우', () => {
      const baseEvent: EventProps = {
        id: 'invalid-duration',
        title: '잘못된 기간',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-14'), // 시작일보다 이전
        category: '업무',
        repeat: {
          type: 'daily',
          interval: 1,
          endCondition: {
            type: 'count',
            count: 5,
          },
        },
      };

      const result = validateGenerationParams(baseEvent);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        '이벤트 종료 날짜가 시작 날짜보다 이전입니다.'
      );
    });

    it('매우 긴 이벤트 기간의 반복 처리', () => {
      const baseEvent: EventProps = {
        id: 'long-duration',
        title: '긴 기간 이벤트',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-30'), // 30일간
        category: '프로젝트',
        repeat: {
          type: 'monthly',
          interval: 1,
          endCondition: {
            type: 'count',
            count: 3,
          },
        },
      };

      const events = generateRecurringEvents(baseEvent);

      expect(events).toHaveLength(3);

      // 각 이벤트의 기간이 올바르게 유지되는지 확인
      events.forEach((event) => {
        const duration = event.endDate.getTime() - event.startDate.getTime();
        const expectedDuration = 29 * 24 * 60 * 60 * 1000; // 30일간 (밀리초)
        expect(duration).toBe(expectedDuration);
      });
    });
  });
});
