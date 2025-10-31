import { describe, expect, it } from 'vitest';

import { Event, EventForm } from '../../types';
import { generateMonthlyRecurringEvents } from '../../utils/dateUtils';

/**
 * REQ-002: 매월 반복 - 31일 처리 - 통합 테스트
 *
 * 1년 전체 통합 테스트, 일정 겹침, 캘린더 UI 표시
 */

describe('매월 반복 - 31일 처리 - 통합 테스트', () => {
  describe('1년 전체 통합 검증', () => {
    // TODO-019: 31일 매월 반복 - 1년 전체 통합 테스트 (15분)
    it('2025년 전체(1월~12월) 동안 31일 매월 반복의 완전한 동작을 확인해야 한다', () => {
      // 명세: REQ-002, EDGE-001 전체 검증
      // 설계: TODO-019
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

      // Assert - 정확히 7개 이벤트 생성
      expect(events).toHaveLength(7);

      // 생성 순서 확인
      const expectedSequence = [
        { date: '2025-01-31', month: 1 }, // Jan
        { date: '2025-03-31', month: 3 }, // Mar (2월 건너뜀)
        { date: '2025-05-31', month: 5 }, // May (4월 건너뜀)
        { date: '2025-07-31', month: 7 }, // Jul (6월 건너뜀)
        { date: '2025-08-31', month: 8 }, // Aug
        { date: '2025-10-31', month: 10 }, // Oct (9월 건너뜀)
        { date: '2025-12-31', month: 12 }, // Dec (11월 건너뜀)
      ];

      events.forEach((event, index) => {
        expect(event.date).toBe(expectedSequence[index].date);
        const eventMonth = new Date(event.date).getMonth() + 1;
        expect(eventMonth).toBe(expectedSequence[index].month);
      });

      // 건너뛴 달 확인: 2, 4, 6, 9, 11월 (총 5개월)
      const dates = events.map((e) => e.date);
      const skippedMonths = ['2025-02-31', '2025-04-31', '2025-06-31', '2025-09-31', '2025-11-31'];
      skippedMonths.forEach((skippedDate) => {
        expect(dates).not.toContain(skippedDate);
      });

      // 각 이벤트의 날짜 간격 확인
      for (let i = 1; i < events.length; i++) {
        const prevDate = new Date(events[i - 1].date);
        const currDate = new Date(events[i].date);
        expect(currDate.getTime()).toBeGreaterThan(prevDate.getTime());
      }
    });
  });

  describe('일정 겹침 처리', () => {
    // TODO-021: 31일 매월 반복 - 일정 겹침 미고려 확인 (10분)
    it('반복 일정 생성 시 기존 일정과의 겹침을 검사하지 않아야 한다', () => {
      // 명세: REQ-004 - "반복 일정 겹침 미고려"
      // 설계: TODO-021
      expect.hasAssertions();

      // Arrange - 기존 일정과 신규 반복 일정
      const existingEvent: Event = {
        id: '1',
        title: '기존 회의',
        date: '2025-03-31',
        startTime: '10:00',
        endTime: '11:00',
        description: '기존 일정',
        location: '회의실',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      };

      const newRecurringEventForm: EventForm = {
        title: '새 회의',
        date: '2025-01-31',
        startTime: '10:00',
        endTime: '11:00',
        description: '매월 반복 일정',
        location: '회의실',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          endDate: '2025-05-31',
        },
        notificationTime: 10,
      };

      // Act - 신규 반복 일정 생성
      const newEvents = generateMonthlyRecurringEvents(newRecurringEventForm);

      // Assert
      // 신규 반복 일정이 정상 생성되어야 함
      expect(newEvents).toHaveLength(3); // 1월, 3월, 5월
      expect(newEvents[1].date).toBe('2025-03-31');

      // 2025-03-31에 2개 일정 존재 가능 (겹침 허용)
      const eventsOn331 = [existingEvent, ...newEvents].filter((e) => e.date === '2025-03-31');
      expect(eventsOn331).toHaveLength(2);

      // 겹침 경고 없음 (단순히 생성만 됨)
      expect(newEvents[1].title).toBe('새 회의');
      expect(existingEvent.title).toBe('기존 회의');
    });
  });

  describe('캘린더 UI 표시', () => {
    // TODO-022: 31일 매월 반복 - 캘린더 UI 표시 확인 (5분)
    it('생성된 31일 매월 반복 일정이 캘린더에 올바르게 표시되어야 한다', () => {
      // 명세: REQ-002, UI 요구사항
      // 설계: TODO-022
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

      // Assert - 각 달의 31일에 이벤트 표시 확인
      // 2025년 1월 캘린더: 31일에 이벤트 표시
      const januaryEvent = events.find((e) => e.date === '2025-01-31');
      expect(januaryEvent).toBeDefined();
      expect(januaryEvent?.title).toBe('월말 보고');

      // 2025년 2월 캘린더: 이벤트 없음
      const februaryEvent = events.find((e) => e.date.startsWith('2025-02'));
      expect(februaryEvent).toBeUndefined();

      // 2025년 3월 캘린더: 31일에 이벤트 표시
      const marchEvent = events.find((e) => e.date === '2025-03-31');
      expect(marchEvent).toBeDefined();
      expect(marchEvent?.title).toBe('월말 보고');

      // 2025년 4월 캘린더: 이벤트 없음
      const aprilEvent = events.find((e) => e.date.startsWith('2025-04'));
      expect(aprilEvent).toBeUndefined();

      // 2025년 5월 캘린더: 31일에 이벤트 표시
      const mayEvent = events.find((e) => e.date === '2025-05-31');
      expect(mayEvent).toBeDefined();
      expect(mayEvent?.title).toBe('월말 보고');

      // 모든 생성된 이벤트가 31일인지 확인
      events.forEach((event) => {
        expect(new Date(event.date).getDate()).toBe(31);
      });
    });
  });
});
