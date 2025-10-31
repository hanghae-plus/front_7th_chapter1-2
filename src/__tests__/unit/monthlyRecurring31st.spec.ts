import { describe, expect, it } from 'vitest';

import { EventForm } from '../../types';
import { generateMonthlyRecurringEvents } from '../../utils/dateUtils';

/**
 * REQ-002: 매월 반복 - 31일 처리
 *
 * 31일에 "매월" 반복을 선택하면 31일이 있는 달에만 일정을 생성한다
 * - 생성되는 달: 1월, 3월, 5월, 7월, 8월, 10월, 12월 (총 7개월)
 * - 건너뛰는 달: 2월, 4월, 6월, 9월, 11월 (총 5개월)
 */

describe('매월 반복 - 31일 처리 (REQ-002)', () => {
  describe('Level 1: 기본 동작 (Happy Path)', () => {
    // TODO-001: 매월 반복 기본 로직 검증 (15분)
    it('31일이 아닌 날짜(15일)로 매월 반복이 정상 작동해야 한다', () => {
      // 명세: REQ-002 (기본 매월 반복 동작)
      // 설계: TODO-001
      expect.hasAssertions();

      // Arrange - 15일 매월 반복 (모든 달에 15일 존재)
      const eventForm: EventForm = {
        title: '정기 회의',
        date: '2025-01-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '매월 중순 정기 회의',
        location: '회의실 A',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-04-15',
        },
        notificationTime: 10,
      };

      // Act - 함수 호출 (구현되지 않아 에러 발생 예상)
      const events = generateMonthlyRecurringEvents(eventForm);

      // Assert
      expect(events).toHaveLength(4);
      expect(events[0].date).toBe('2025-01-15');
      expect(events[1].date).toBe('2025-02-15');
      expect(events[2].date).toBe('2025-03-15');
      expect(events[3].date).toBe('2025-04-15');
      // 모든 이벤트의 일(day)이 15인지 확인
      events.forEach((event) => {
        expect(new Date(event.date).getDate()).toBe(15);
      });
      // 모든 이벤트가 동일한 속성을 유지하는지 확인
      events.forEach((event) => {
        expect(event.title).toBe('정기 회의');
        expect(event.startTime).toBe('14:00');
        expect(event.endTime).toBe('15:00');
        expect(event.description).toBe('매월 중순 정기 회의');
        expect(event.location).toBe('회의실 A');
        expect(event.category).toBe('업무');
        expect(event.notificationTime).toBe(10);
      });
    });
  });

  describe('Level 2: 31일 기본 케이스', () => {
    // TODO-002: 31일 매월 반복 - 1월 시작 3개월 (15분)
    it('31일 시작 매월 반복이 31일 있는 달에만 생성되어야 한다 (1, 3, 5월)', () => {
      // 명세: REQ-002, EDGE-001
      // 설계: TODO-002
      expect.hasAssertions();

      // Arrange
      const eventForm: EventForm = {
        title: '월말 보고',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '매월 말일 보고서 제출',
        location: '본사',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-05-31',
        },
        notificationTime: 10,
      };

      // Act
      const events = generateMonthlyRecurringEvents(eventForm);

      // Assert
      expect(events).toHaveLength(3); // 5개월 기간이지만 3개만 생성
      expect(events[0].date).toBe('2025-01-31');
      expect(events[1].date).toBe('2025-03-31'); // 2월 건너뜀
      expect(events[2].date).toBe('2025-05-31'); // 4월 건너뜀
      // 모든 이벤트의 일(day)이 31인지 확인
      events.forEach((event) => {
        expect(new Date(event.date).getDate()).toBe(31);
      });
      // 2월과 4월이 생성되지 않았는지 확인
      const dates = events.map((e) => e.date);
      expect(dates).not.toContain('2025-02-31');
      expect(dates).not.toContain('2025-04-31');
    });

    // TODO-003: 31일 매월 반복 - 1월 단독 (10분)
    it('31일 시작 후 즉시 건너뛰는 케이스 - 2월 건너뛰기', () => {
      // 명세: REQ-002, EDGE-001
      // 설계: TODO-003
      expect.hasAssertions();

      // Arrange
      const eventForm: EventForm = {
        title: '월말 보고',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '매월 말일 보고서 제출',
        location: '본사',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-02-28',
        },
        notificationTime: 10,
      };

      // Act
      const events = generateMonthlyRecurringEvents(eventForm);

      // Assert
      expect(events).toHaveLength(1);
      expect(events[0].date).toBe('2025-01-31');
      // 2025-02-31이 생성되지 않음
      const dates = events.map((e) => e.date);
      expect(dates).not.toContain('2025-02-31');
      expect(dates).not.toContain('2025-02-28'); // 대체 생성 없음
    });

    // TODO-004: 31일 매월 반복 - 2월 건너뛰기 명시 확인 (10분)
    it('2월을 명시적으로 건너뛰어야 한다', () => {
      // 명세: REQ-002, EDGE-001 - "2월은 28/29일까지"
      // 설계: TODO-004
      expect.hasAssertions();

      // Arrange
      const eventForm: EventForm = {
        title: '월말 보고',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '매월 말일 보고서 제출',
        location: '본사',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-03-31',
        },
        notificationTime: 10,
      };

      // Act
      const events = generateMonthlyRecurringEvents(eventForm);

      // Assert
      expect(events).toHaveLength(2);
      expect(events[0].date).toBe('2025-01-31');
      expect(events[1].date).toBe('2025-03-31');
      // 2025-02-31이 생성되지 않음
      const dates = events.map((e) => e.date);
      expect(dates).not.toContain('2025-02-31');
      expect(dates).not.toContain('2025-02-28'); // 대체 생성 없음
    });
  });

  describe('Level 3: 31일 있는 모든 달 검증', () => {
    // TODO-005: 31일 매월 반복 - 31일 있는 모든 달 생성 확인 (20분)
    it('31일이 있는 7개 달 모두에서 생성되어야 한다', () => {
      // 명세: REQ-002 - "1월, 3월, 5월, 7월, 8월, 10월, 12월"
      // 설계: TODO-005
      expect.hasAssertions();

      // Arrange
      const eventForm: EventForm = {
        title: '월말 보고',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '매월 말일 보고서 제출',
        location: '본사',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-12-31',
        },
        notificationTime: 10,
      };

      // Act
      const events = generateMonthlyRecurringEvents(eventForm);

      // Assert
      expect(events).toHaveLength(7);
      // 생성된 날짜 확인
      const expectedDates = [
        '2025-01-31',
        '2025-03-31',
        '2025-05-31',
        '2025-07-31',
        '2025-08-31',
        '2025-10-31',
        '2025-12-31',
      ];
      const actualDates = events.map((e) => e.date);
      expect(actualDates).toEqual(expectedDates);
      // 모든 날짜의 일(day)이 31인지 확인
      events.forEach((event) => {
        expect(new Date(event.date).getDate()).toBe(31);
      });
      // 월(month)이 1, 3, 5, 7, 8, 10, 12인지 확인
      const months = events.map((e) => new Date(e.date).getMonth() + 1);
      expect(months).toEqual([1, 3, 5, 7, 8, 10, 12]);
    });

    // TODO-006: 31일 매월 반복 - 30일 달 건너뛰기 확인 (15분)
    it('30일까지 있는 달(4, 6, 9, 11월)을 건너뛰어야 한다', () => {
      // 명세: REQ-002, EDGE-001 - "4월은 30일까지"
      // 설계: TODO-006
      expect.hasAssertions();

      // Arrange
      const eventForm: EventForm = {
        title: '월말 보고',
        date: '2025-03-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '매월 말일 보고서 제출',
        location: '본사',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-07-31',
        },
        notificationTime: 10,
      };

      // Act
      const events = generateMonthlyRecurringEvents(eventForm);

      // Assert
      expect(events).toHaveLength(3);
      expect(events[0].date).toBe('2025-03-31');
      expect(events[1].date).toBe('2025-05-31'); // 4월 건너뜀
      expect(events[2].date).toBe('2025-07-31'); // 6월 건너뜀
      // 4월과 6월이 생성되지 않았는지 확인
      const dates = events.map((e) => e.date);
      expect(dates).not.toContain('2025-04-31');
      expect(dates).not.toContain('2025-04-30'); // 대체 생성 없음
      expect(dates).not.toContain('2025-06-31');
      expect(dates).not.toContain('2025-06-30'); // 대체 생성 없음
    });

    // TODO-007: 31일 매월 반복 - 모든 건너뛰는 달 검증 (15분)
    it('31일 없는 5개 달 모두 건너뛰어야 한다', () => {
      // 명세: REQ-002, EDGE-001 - "2월, 4월, 6월, 9월, 11월"
      // 설계: TODO-007
      expect.hasAssertions();

      // Arrange
      const eventForm: EventForm = {
        title: '월말 보고',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '매월 말일 보고서 제출',
        location: '본사',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-12-31',
        },
        notificationTime: 10,
      };

      // Act
      const events = generateMonthlyRecurringEvents(eventForm);

      // Assert
      // 건너뛴 날짜들이 생성되지 않았는지 확인
      const dates = events.map((e) => e.date);
      expect(dates).not.toContain('2025-02-31');
      expect(dates).not.toContain('2025-04-31');
      expect(dates).not.toContain('2025-06-31');
      expect(dates).not.toContain('2025-09-31');
      expect(dates).not.toContain('2025-11-31');
      // 대체 날짜(28일, 30일)도 생성되지 않았는지 확인
      expect(dates).not.toContain('2025-02-28');
      expect(dates).not.toContain('2025-04-30');
      expect(dates).not.toContain('2025-06-30');
      expect(dates).not.toContain('2025-09-30');
      expect(dates).not.toContain('2025-11-30');
    });

    // TODO-008: 31일 매월 반복 - 연속된 건너뛰기 (4-6월) (10분)
    it('연속으로 2개월을 건너뛰는 경우 (4월, 6월)', () => {
      // 명세: REQ-002, EDGE-001
      // 설계: TODO-008
      expect.hasAssertions();

      // Arrange
      const eventForm: EventForm = {
        title: '월말 보고',
        date: '2025-03-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '매월 말일 보고서 제출',
        location: '본사',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-07-31',
        },
        notificationTime: 10,
      };

      // Act
      const events = generateMonthlyRecurringEvents(eventForm);

      // Assert
      expect(events).toHaveLength(3);
      expect(events[0].date).toBe('2025-03-31');
      expect(events[1].date).toBe('2025-05-31'); // 3월 → 5월 (4월 건너뜀)
      expect(events[2].date).toBe('2025-07-31'); // 5월 → 7월 (6월 건너뜀)
      // 4월과 6월이 생성되지 않았는지 확인
      const dates = events.map((e) => e.date);
      expect(dates).not.toContain('2025-04-31');
      expect(dates).not.toContain('2025-06-31');
    });
  });

  describe('Level 4: 데이터 무결성', () => {
    // TODO-009: 31일 매월 반복 - 생성된 이벤트 데이터 무결성 검증 (10분)
    it('생성된 모든 반복 이벤트가 원본 이벤트의 속성을 유지해야 한다', () => {
      // 명세: 데이터 구조 (specification.md)
      // 설계: TODO-009
      expect.hasAssertions();

      // Arrange
      const eventForm: EventForm = {
        title: '월말 보고',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '매월 말일 보고서 제출',
        location: '본사',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-05-31',
        },
        notificationTime: 10,
      };

      // Act
      const events = generateMonthlyRecurringEvents(eventForm);

      // Assert - 생성된 3개 이벤트(1월, 3월, 5월) 모두 동일한 속성
      expect(events).toHaveLength(3);
      events.forEach((event) => {
        expect(event.title).toBe('월말 보고');
        expect(event.startTime).toBe('09:00');
        expect(event.endTime).toBe('10:00');
        expect(event.description).toBe('매월 말일 보고서 제출');
        expect(event.location).toBe('본사');
        expect(event.category).toBe('업무');
        expect(event.notificationTime).toBe(10);
        expect(event.repeat.type).toBe('monthly');
        expect(event.repeat.interval).toBe(1);
        expect(event.id).toBeDefined();
      });
      // 각 이벤트는 고유한 id를 가져야 함
      const ids = events.map((e) => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(events.length);
    });

    // TODO-010: 31일 매월 반복 - 반복 정보 유지 확인 (10분)
    it('생성된 각 반복 이벤트가 반복 정보를 유지해야 한다', () => {
      // 명세: 데이터 구조, REQ-005 (반복 아이콘 표시 준비)
      // 설계: TODO-010
      expect.hasAssertions();

      // Arrange
      const eventForm: EventForm = {
        title: '월말 보고',
        date: '2025-01-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '매월 말일 보고서 제출',
        location: '본사',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-05-31',
        },
        notificationTime: 10,
      };

      // Act
      const events = generateMonthlyRecurringEvents(eventForm);

      // Assert
      expect(events).toHaveLength(3);
      // 각 이벤트의 repeat 정보 확인
      events.forEach((event) => {
        expect(event.repeat.type).toBe('monthly');
        expect(event.repeat.interval).toBe(1);
        expect(event.repeat.endDate).toBe('2025-05-31');
      });
    });
  });
});
