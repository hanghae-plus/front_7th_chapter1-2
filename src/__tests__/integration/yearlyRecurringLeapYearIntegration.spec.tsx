import { describe, expect, it } from 'vitest';

import { Event, EventForm } from '../../types';
import { generateRecurringEvents } from '../../utils/eventUtils';

/**
 * REQ-003: 매년 반복 - 윤년 29일 처리 - 통합 테스트
 *
 * 일정 겹침, 데이터 무결성, 반복 정보 유지 등의 통합 테스트
 */

describe('매년 반복 - 윤년 29일 처리 - 통합 테스트', () => {
  describe('일정 겹침 처리', () => {
    // TODO-Y011: 일정 겹침 미고려 확인 (10분)
    it('반복 일정 생성 시 기존 일정과의 겹침을 검사하지 않아야 한다', () => {
      // 명세: REQ-004 - "반복 일정 겹침 미고려"
      // 설계: TODO-Y011
      expect.hasAssertions();

      // Arrange - 기존 일정과 신규 반복 일정
      const existingEvent: Event = {
        id: '1',
        title: '기존 윤년 행사',
        date: '2024-02-29',
        startTime: '10:00',
        endTime: '11:00',
        description: '기존 일정',
        location: '체육관',
        category: '행사',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      };

      const newRecurringEventForm: EventForm = {
        title: '새 윤년 행사',
        date: '2024-02-29',
        startTime: '10:00',
        endTime: '11:00',
        description: '매년 반복 일정',
        location: '체육관',
        category: '행사',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2028-02-29',
        },
        notificationTime: 10,
      };

      // Act - 신규 반복 일정 생성
      const newEvents = generateRecurringEvents(newRecurringEventForm);

      // Assert
      // 신규 반복 일정이 정상 생성되어야 함
      expect(newEvents).toHaveLength(2); // 2024, 2028
      expect(newEvents[0].date).toBe('2024-02-29');

      // 2024-02-29에 2개 일정 존재 가능 (겹침 허용)
      const eventsOn229 = [existingEvent, ...newEvents].filter((e) => e.date === '2024-02-29');
      expect(eventsOn229).toHaveLength(2);

      // 겹침 경고 없음 (단순히 생성만 됨)
      expect(newEvents[0].title).toBe('새 윤년 행사');
      expect(existingEvent.title).toBe('기존 윤년 행사');
    });
  });

  describe('데이터 무결성 및 반복 정보', () => {
    // TODO-Y012: 생성된 이벤트 데이터 무결성 검증 (10분)
    it('생성된 모든 반복 이벤트가 원본 이벤트의 속성을 유지해야 한다', () => {
      // 명세: 데이터 구조 (specification.md)
      // 설계: TODO-Y012
      expect.hasAssertions();

      // Arrange
      const eventForm: EventForm = {
        title: '윤년 행사',
        date: '2024-02-29',
        startTime: '09:00',
        endTime: '10:00',
        description: '4년마다 열리는 특별 행사',
        location: '체육관',
        category: '행사',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2032-02-29',
        },
        notificationTime: 10,
      };

      // Act
      const events = generateRecurringEvents(eventForm);

      // Assert - 생성된 3개 이벤트(2024, 2028, 2032) 모두 동일한 속성
      expect(events).toHaveLength(3);
      events.forEach((event) => {
        expect(event.title).toBe('윤년 행사');
        expect(event.startTime).toBe('09:00');
        expect(event.endTime).toBe('10:00');
        expect(event.description).toBe('4년마다 열리는 특별 행사');
        expect(event.location).toBe('체육관');
        expect(event.category).toBe('행사');
        expect(event.notificationTime).toBe(10);
        expect(event.repeat.type).toBe('yearly');
        expect(event.repeat.interval).toBe(1);
        // id는 generateRecurringEvents에서 undefined로 반환되므로 체크하지 않음
      });
      // 모든 날짜가 02-29인지 확인
      events.forEach((event) => {
        expect(event.date.endsWith('-02-29')).toBe(true);
      });
      // 모든 날짜가 윤년인지 확인
      events.forEach((event) => {
        const year = new Date(event.date).getFullYear();
        const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        expect(isLeapYear).toBe(true);
      });
    });

    // TODO-Y013: 반복 정보 유지 확인 (10분)
    it('생성된 각 이벤트가 반복 정보를 유지해야 한다', () => {
      // 명세: 데이터 구조, REQ-005 (반복 아이콘 표시 준비)
      // 설계: TODO-Y013
      expect.hasAssertions();

      // Arrange
      const eventForm: EventForm = {
        title: '윤년 행사',
        date: '2024-02-29',
        startTime: '10:00',
        endTime: '11:00',
        description: '4년마다 열리는 특별 행사',
        location: '체육관',
        category: '행사',
        repeat: {
          type: 'yearly',
          interval: 1,
          endDate: '2028-02-29',
        },
        notificationTime: 10,
      };

      // Act
      const events = generateRecurringEvents(eventForm);

      // Assert
      expect(events).toHaveLength(2);
      // 각 이벤트의 repeat 정보 확인
      events.forEach((event) => {
        expect(event.repeat.type).toBe('yearly');
        expect(event.repeat.interval).toBe(1);
        expect(event.repeat.endDate).toBe('2028-02-29');
      });
    });
  });
});
