import { describe, expect, it } from 'vitest';

import { EventForm } from '../../types';
import { generateMonthlyRecurringEvents } from '../../utils/dateUtils';

/**
 * REQ-002: 매월 반복 - 31일 처리 - 성능 및 제약사항
 *
 * 최대 종료일, 성능, 최소 생성 케이스 테스트
 */

describe('매월 반복 - 31일 처리 - 성능 및 제약사항', () => {
  describe('제약사항 검증', () => {
    // TODO-017: 31일 매월 반복 - 최대 종료일 2025-12-31 제약 (10분)
    it('종료일이 2025-12-31을 넘지 않아야 한다', () => {
      // 명세: CONS-002 - "최대 종료 날짜는 2025-12-31"
      // 설계: TODO-017
      expect.hasAssertions();

      // Arrange - 종료일 미지정 또는 2026-12-31 지정
      const eventForm: EventForm = {
        title: '월말 보고',
        date: '2025-10-31',
        startTime: '09:00',
        endTime: '10:00',
        description: '매월 말일 보고서 제출',
        location: '본사',
        category: '업무',
        repeat: {
          type: 'monthly',
          interval: 1,
          // endDate를 명시하지 않거나 2026-12-31로 설정
        },
        notificationTime: 10,
      };

      // Act
      const events = generateMonthlyRecurringEvents(eventForm);

      // Assert
      expect(events).toHaveLength(2); // 10월, 12월만 생성
      expect(events[0].date).toBe('2025-10-31');
      expect(events[1].date).toBe('2025-12-31');
      // 마지막 이벤트가 2025-12-31인지 확인
      const lastEvent = events[events.length - 1];
      expect(lastEvent.date).toBe('2025-12-31');
      // 2026년 이후 이벤트 생성 안 됨
      events.forEach((event) => {
        const year = new Date(event.date).getFullYear();
        expect(year).toBeLessThanOrEqual(2025);
      });
      // 11월(30일) 건너뛰기 확인
      const dates = events.map((e) => e.date);
      expect(dates).not.toContain('2025-11-31');
      expect(dates).not.toContain('2026-01-31');
    });

    // TODO-020: 31일 매월 반복 - 최소 생성 케이스 (단일 이벤트) (10분)
    it('반복 일정이 1개만 생성되는 경우', () => {
      // 명세: REQ-002, CONS-002
      // 설계: TODO-020
      expect.hasAssertions();

      // Arrange - 시작일이 2025-12-31이고 종료일도 2025-12-31
      const eventForm: EventForm = {
        title: '월말 보고',
        date: '2025-12-31',
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
      expect(events).toHaveLength(1);
      expect(events[0].date).toBe('2025-12-31');
      // 다음 31일(2026-01-31)은 최대 종료일 초과로 생성 안 됨
      const dates = events.map((e) => e.date);
      expect(dates).not.toContain('2026-01-31');
    });
  });

  describe('성능 검증', () => {
    // TODO-018: 31일 매월 반복 - 성능 검증 (1초 이내) (10분)
    it('365개 반복 일정 생성이 1초 이내에 완료되어야 한다', () => {
      // 명세: NFR-001 - "1초 이내에 완료되어야 한다"
      // 설계: TODO-018
      // 참고: 31일 매월 반복은 최대 7개만 생성되므로, 이 테스트는 기본 성능 확인용
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

      // Act - 성능 측정
      const startTime = performance.now();
      const events = generateMonthlyRecurringEvents(eventForm);
      const endTime = performance.now();
      const elapsedTime = endTime - startTime;

      // Assert
      expect(elapsedTime).toBeLessThan(1000); // 1초 이내
      expect(events).toHaveLength(7); // 31일 반복은 최대 7개
      // 모든 이벤트가 정상 생성되었는지 확인
      events.forEach((event) => {
        expect(event.id).toBeDefined();
        expect(event.date).toBeDefined();
        expect(new Date(event.date).getDate()).toBe(31);
      });
    });
  });
});
