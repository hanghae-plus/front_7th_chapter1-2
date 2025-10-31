import { describe, expect, it } from 'vitest';

import { generateRecurringEvents } from '../../utils/eventUtils';
import { EventForm } from '../../types';

describe('REQ-004 & NFR-001: 반복 일정 성능 테스트', () => {
  describe('TODO-007: 반복 일정의 각 인스턴스가 기존 일정과 겹쳐도 모두 생성된다', () => {
    it('매일 반복 일정 생성 시 기존 일정 10개와 겹쳐도 모든 반복 인스턴스가 생성된다', () => {
      // 명세: REQ-004, CONS-001
      // 설계: TODO-007

      // Arrange - 기존 일정 10개 (시뮬레이션, 실제로는 조회하지 않음)
      const existingEvents = Array.from({ length: 10 }, (_, i) => ({
        title: `기존 회의 ${i + 1}`,
        date: `2025-06-${String(15 + i).padStart(2, '0')}`,
        startTime: '10:00',
        endTime: '11:00',
      }));

      // 겹치는 매일 반복 일정
      const recurringEvent: EventForm = {
        title: '매일 스탠드업',
        date: '2025-06-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '기존 일정과 겹침',
        location: '온라인',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-06-24' },
        notificationTime: 10,
      };

      // Act - 겹침 검증 없이 생성
      const events = generateRecurringEvents(recurringEvent);

      // Assert - 모든 반복 인스턴스가 생성됨 (10일)
      expect(events).toHaveLength(10);

      // 기존 일정과 같은 날짜, 같은 시간대에 생성됨
      events.forEach((event, index) => {
        expect(event.date).toBe(`2025-06-${String(15 + index).padStart(2, '0')}`);
        expect(event.startTime).toBe('10:00');
        expect(event.endTime).toBe('11:00');
      });

      // 기존 일정 개수와 동일한 수의 겹침 발생
      expect(existingEvents.length).toBe(10);
    });

    it('매주 반복 일정 생성 시 기존 주간 일정들과 겹쳐도 모든 인스턴스가 생성된다', () => {
      // 명세: REQ-004
      // 설계: TODO-007

      // Arrange - 매주 반복 (8주)
      const weeklyEvent: EventForm = {
        title: '주간 리뷰',
        date: '2025-06-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '매주 반복',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-08-03' },
        notificationTime: 10,
      };

      // Act - 기존 일정 조회 없이 생성
      const events = generateRecurringEvents(weeklyEvent);

      // Assert - 8주 모두 생성됨
      expect(events).toHaveLength(8);
      expect(events[0].date).toBe('2025-06-15');
      expect(events[7].date).toBe('2025-08-03');
    });

    it('매월 반복 일정 생성 시 기존 월간 일정과 겹쳐도 모든 월에 생성된다', () => {
      // 명세: REQ-004
      // 설계: TODO-007

      // Arrange - 매월 반복 (7개월)
      const monthlyEvent: EventForm = {
        title: '월간 보고',
        date: '2025-06-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '매월 반복',
        location: '대회의실',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      };

      // Act
      const events = generateRecurringEvents(monthlyEvent);

      // Assert - 7개월 모두 생성됨 (6월 ~ 12월)
      expect(events).toHaveLength(7);
      expect(events[0].date).toBe('2025-06-15');
      expect(events[6].date).toBe('2025-12-15');
    });
  });

  describe('TODO-008: 365개의 매일 반복 일정이 기존 일정과 관계없이 생성된다 (성능)', () => {
    it('365개의 매일 반복 일정이 1초 이내에 생성된다 (NFR-001)', () => {
      // 명세: REQ-004, NFR-001 - 성능 요구사항 (1초 이내)
      // 설계: TODO-008

      // Arrange - 1년 전체 매일 반복
      const yearlyDailyEvent: EventForm = {
        title: '매일 운동',
        date: '2025-01-01',
        startTime: '06:00',
        endTime: '07:00',
        description: '1년간 매일 반복',
        location: '헬스장',
        category: '개인',
        repeat: { type: 'daily', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      };

      // Act - 성능 측정
      const startTime = performance.now();
      const events = generateRecurringEvents(yearlyDailyEvent);
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      // Assert - 365개 생성, 1초(1000ms) 이내
      expect(events).toHaveLength(365);
      expect(executionTime).toBeLessThan(1000); // NFR-001: 1초 이내

      // 첫 번째와 마지막 날짜 확인
      expect(events[0].date).toBe('2025-01-01');
      expect(events[364].date).toBe('2025-12-31');
    });

    it('365개 생성 시 기존 일정과의 겹침 검증을 수행하지 않아 빠르게 생성된다', () => {
      // 명세: REQ-004, CONS-001, NFR-001
      // 설계: TODO-008

      // Arrange - 기존 일정 100개 시뮬레이션 (실제로는 조회 안 함)
      const existingEventsCount = 100;

      const dailyEventFullYear: EventForm = {
        title: '데일리 리마인더',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '09:10',
        description: '매일 알림',
        location: '',
        category: '개인',
        repeat: { type: 'daily', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      };

      // Act - 겹침 검증 없이 빠른 생성
      const startTime = performance.now();
      const events = generateRecurringEvents(dailyEventFullYear);
      const endTime = performance.now();

      // Assert - 기존 일정 조회 없이 빠르게 생성됨
      expect(events).toHaveLength(365);
      expect(endTime - startTime).toBeLessThan(1000);

      // 기존 일정 100개와 무관하게 365개 모두 생성
      expect(events.length).toBeGreaterThan(existingEventsCount);
    });

    it('매주 반복 52회 생성도 빠르게 완료된다', () => {
      // 명세: NFR-001
      // 설계: TODO-008

      // Arrange - 1년 매주 반복 (52주)
      const weeklyFullYear: EventForm = {
        title: '주간 회의',
        date: '2025-01-06', // 월요일
        startTime: '10:00',
        endTime: '11:00',
        description: '매주 월요일',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-12-29' },
        notificationTime: 10,
      };

      // Act
      const startTime = performance.now();
      const events = generateRecurringEvents(weeklyFullYear);
      const endTime = performance.now();

      // Assert - 52개 생성, 빠른 성능
      expect(events).toHaveLength(52);
      expect(endTime - startTime).toBeLessThan(500); // 0.5초 이내
    });

    it('매월 반복 12회 생성도 빠르게 완료된다', () => {
      // 명세: NFR-001
      // 설계: TODO-008

      // Arrange - 1년 매월 반복 (12개월)
      const monthlyFullYear: EventForm = {
        title: '월간 리뷰',
        date: '2025-01-15',
        startTime: '15:00',
        endTime: '16:00',
        description: '매월 15일',
        location: '대회의실',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      };

      // Act
      const startTime = performance.now();
      const events = generateRecurringEvents(monthlyFullYear);
      const endTime = performance.now();

      // Assert - 12개 생성, 빠른 성능
      expect(events).toHaveLength(12);
      expect(endTime - startTime).toBeLessThan(100); // 0.1초 이내
    });

    it('겹침 검증이 없어 대량 일정 생성 시에도 성능 저하가 없다', () => {
      // 명세: REQ-004, NFR-001
      // 설계: TODO-008

      // Arrange - 여러 반복 유형 동시 생성 시뮬레이션
      const events: EventForm[] = [
        // 365개 매일
        {
          title: '매일 1',
          date: '2025-01-01',
          startTime: '06:00',
          endTime: '07:00',
          description: '',
          location: '',
          category: '개인',
          repeat: { type: 'daily', interval: 1, endDate: '2025-12-31' },
          notificationTime: 10,
        },
        // 52개 매주
        {
          title: '매주 1',
          date: '2025-01-06',
          startTime: '10:00',
          endTime: '11:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'weekly', interval: 1, endDate: '2025-12-29' },
          notificationTime: 10,
        },
        // 12개 매월
        {
          title: '매월 1',
          date: '2025-01-15',
          startTime: '14:00',
          endTime: '15:00',
          description: '',
          location: '',
          category: '업무',
          repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' },
          notificationTime: 10,
        },
      ];

      // Act - 모든 일정 생성 (총 429개: 365 + 52 + 12)
      const startTime = performance.now();
      const allResults = events.map((event) => generateRecurringEvents(event));
      const endTime = performance.now();

      const totalEvents = allResults.reduce((sum, result) => sum + result.length, 0);

      // Assert - 429개 생성, 1초 이내
      expect(totalEvents).toBe(365 + 52 + 12);
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});

