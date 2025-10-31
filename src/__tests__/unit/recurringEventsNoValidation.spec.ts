import { describe, expect, it } from 'vitest';

import { EventForm } from '../../types';
import { generateRecurringEvents } from '../../utils/eventUtils';

describe('REQ-004: 중복 검증 없음', () => {
  describe('TODO-004: 동일한 제목, 시간의 단일 일정을 여러 개 생성할 수 있다', () => {
    it('완전히 동일한 내용의 단일 일정을 여러 개 생성할 수 있다', () => {
      // 명세: REQ-004, CONS-001 - 중복 검증 없음
      // 설계: TODO-004

      // Arrange - 완전히 동일한 일정 3개
      const event1: EventForm = {
        title: '회의',
        date: '2025-06-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 미팅',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const event2: EventForm = { ...event1 };
      const event3: EventForm = { ...event1 };

      // Act - 중복 검증 없이 생성
      const result1 = generateRecurringEvents(event1);
      const result2 = generateRecurringEvents(event2);
      const result3 = generateRecurringEvents(event3);

      // Assert - 모두 생성됨 (각각 독립적)
      expect(result1).toHaveLength(1);
      expect(result2).toHaveLength(1);
      expect(result3).toHaveLength(1);

      expect(result1[0].title).toBe('회의');
      expect(result2[0].title).toBe('회의');
      expect(result3[0].title).toBe('회의');
    });

    it('같은 시간, 같은 제목의 단일 일정이 여러 번 생성되어도 에러가 발생하지 않는다', () => {
      // 명세: REQ-004
      // 설계: TODO-004

      // Arrange
      const duplicateEvent: EventForm = {
        title: '중복 회의',
        date: '2025-06-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '동일한 일정',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      // Act - 5번 생성 시도
      const results = Array.from({ length: 5 }, () => generateRecurringEvents(duplicateEvent));

      // Assert - 모두 정상 생성됨
      expect(results).toHaveLength(5);
      results.forEach((result) => {
        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('중복 회의');
        expect(result[0].startTime).toBe('14:00');
      });
    });

    it('동일 시간대, 동일 제목이지만 다른 속성을 가진 일정들을 생성할 수 있다', () => {
      // 명세: REQ-004
      // 설계: TODO-004

      // Arrange - 시간과 제목은 같지만 설명이 다름
      const event1: EventForm = {
        title: '회의',
        date: '2025-06-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '설명 1',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      const event2: EventForm = {
        ...event1,
        description: '설명 2',
        location: '회의실 B',
      };

      const event3: EventForm = {
        ...event1,
        description: '설명 3',
        category: '개인',
      };

      // Act
      const result1 = generateRecurringEvents(event1);
      const result2 = generateRecurringEvents(event2);
      const result3 = generateRecurringEvents(event3);

      // Assert - 모두 생성됨
      expect(result1[0].description).toBe('설명 1');
      expect(result2[0].description).toBe('설명 2');
      expect(result3[0].description).toBe('설명 3');
    });
  });

  describe('TODO-005: 동일한 제목, 시간의 반복 일정을 여러 개 생성할 수 있다', () => {
    it('완전히 동일한 반복 일정을 여러 개 생성할 수 있다', () => {
      // 명세: REQ-004, CONS-001
      // 설계: TODO-005

      // Arrange - 동일한 반복 일정
      const recurringEvent1: EventForm = {
        title: '매일 회의',
        date: '2025-06-15',
        startTime: '09:00',
        endTime: '09:30',
        description: '매일 반복',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-06-20' },
        notificationTime: 10,
      };

      const recurringEvent2: EventForm = { ...recurringEvent1 };

      // Act - 중복 검증 없이 생성
      const result1 = generateRecurringEvents(recurringEvent1);
      const result2 = generateRecurringEvents(recurringEvent2);

      // Assert - 둘 다 6일간 생성됨
      expect(result1).toHaveLength(6);
      expect(result2).toHaveLength(6);

      expect(result1[0].date).toBe('2025-06-15');
      expect(result2[0].date).toBe('2025-06-15');

      expect(result1[5].date).toBe('2025-06-20');
      expect(result2[5].date).toBe('2025-06-20');
    });

    it('같은 시간대에 여러 개의 반복 일정(주간)을 생성할 수 있다', () => {
      // 명세: REQ-004
      // 설계: TODO-005

      // Arrange
      const weeklyEvent1: EventForm = {
        title: '주간 리뷰 1',
        date: '2025-06-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '반복 1',
        location: '온라인',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-07-06' },
        notificationTime: 10,
      };

      const weeklyEvent2: EventForm = {
        ...weeklyEvent1,
        title: '주간 리뷰 2',
        description: '반복 2',
      };

      const weeklyEvent3: EventForm = {
        ...weeklyEvent1,
        title: '주간 리뷰 3',
        description: '반복 3',
      };

      // Act - 동일 시간대에 3개 반복 일정 생성
      const result1 = generateRecurringEvents(weeklyEvent1);
      const result2 = generateRecurringEvents(weeklyEvent2);
      const result3 = generateRecurringEvents(weeklyEvent3);

      // Assert - 모두 4주간 생성됨
      expect(result1).toHaveLength(4);
      expect(result2).toHaveLength(4);
      expect(result3).toHaveLength(4);

      // 모두 같은 날짜에 생성됨
      expect(result1[0].date).toBe('2025-06-15');
      expect(result2[0].date).toBe('2025-06-15');
      expect(result3[0].date).toBe('2025-06-15');
    });

    it('동일한 제목과 시간을 가진 월간 반복 일정을 여러 개 생성할 수 있다', () => {
      // 명세: REQ-004
      // 설계: TODO-005

      // Arrange
      const monthlyEvent1: EventForm = {
        title: '월간 미팅',
        date: '2025-06-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '월간 반복 1',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      };

      const monthlyEvent2: EventForm = {
        ...monthlyEvent1,
        description: '월간 반복 2',
      };

      // Act
      const result1 = generateRecurringEvents(monthlyEvent1);
      const result2 = generateRecurringEvents(monthlyEvent2);

      // Assert - 둘 다 7개월 생성됨 (6월 ~ 12월)
      expect(result1).toHaveLength(7);
      expect(result2).toHaveLength(7);

      // 같은 날짜 패턴
      expect(result1[0].date).toBe('2025-06-15');
      expect(result2[0].date).toBe('2025-06-15');
      expect(result1[6].date).toBe('2025-12-15');
      expect(result2[6].date).toBe('2025-12-15');
    });

    it('동일한 연간 반복 일정을 여러 번 생성해도 에러가 발생하지 않는다', () => {
      // 명세: REQ-004
      // 설계: TODO-005

      // Arrange
      const yearlyEvent: EventForm = {
        title: '연간 이벤트',
        date: '2025-06-15',
        startTime: '00:00',
        endTime: '23:59',
        description: '연간 반복',
        location: '',
        category: '개인',
        repeat: { type: 'yearly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 1440,
      };

      // Act - 10번 생성 시도
      const results = Array.from({ length: 10 }, () => generateRecurringEvents(yearlyEvent));

      // Assert - 모두 정상 생성됨 (각각 1개씩, 2025년만)
      expect(results).toHaveLength(10);
      results.forEach((result) => {
        expect(result).toHaveLength(1);
        expect(result[0].date).toBe('2025-06-15');
      });
    });
  });
});
