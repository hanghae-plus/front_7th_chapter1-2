import { describe, expect, it } from 'vitest';

import { EventForm } from '../../types';
import { generateRecurringEvents } from '../../utils/eventUtils';

describe('REQ-004: 반복 일정 겹침 미고려', () => {
  describe('TODO-001: 반복 일정 생성 시 겹침 검증을 수행하지 않는다', () => {
    it('매일 반복 일정 생성 시 겹침 검증 없이 모든 날짜에 일정을 생성한다', () => {
      // 명세: REQ-004, CONS-001 - 반복 일정 겹침 미고려
      // 설계: TODO-001

      // Arrange
      const eventData: EventForm = {
        title: '매일 회의',
        date: '2025-06-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '겹침 테스트용 반복 일정',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'daily', interval: 1, endDate: '2025-06-20' },
        notificationTime: 10,
      };

      // Act - 반복 일정 생성 (겹침 검증 함수 호출되지 않음)
      const events = generateRecurringEvents(eventData);

      // Assert - 모든 날짜에 일정이 생성됨 (겹침 검증 없음)
      expect(events).toHaveLength(6); // 6월 15일 ~ 20일 (6일)
      expect(events[0].date).toBe('2025-06-15');
      expect(events[1].date).toBe('2025-06-16');
      expect(events[2].date).toBe('2025-06-17');
      expect(events[3].date).toBe('2025-06-18');
      expect(events[4].date).toBe('2025-06-19');
      expect(events[5].date).toBe('2025-06-20');
    });

    it('매주 반복 일정 생성 시 기존 일정 조회 없이 모든 주에 일정을 생성한다', () => {
      // 명세: REQ-004 - 겹침 검증 미수행
      // 설계: TODO-001

      // Arrange
      const eventData: EventForm = {
        title: '주간 미팅',
        date: '2025-06-15',
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 반복 일정',
        location: '회의실 B',
        category: '업무',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-07-06' },
        notificationTime: 10,
      };

      // Act - 기존 일정 조회 없이 생성
      const events = generateRecurringEvents(eventData);

      // Assert - 모든 주에 일정이 생성됨
      expect(events).toHaveLength(4); // 4주
      expect(events[0].date).toBe('2025-06-15');
      expect(events[1].date).toBe('2025-06-22');
      expect(events[2].date).toBe('2025-06-29');
      expect(events[3].date).toBe('2025-07-06');
    });

    it('매월 반복 일정 생성 시 겹침 체크 로직이 실행되지 않는다', () => {
      // 명세: REQ-004, CONS-001
      // 설계: TODO-001

      // Arrange
      const eventData: EventForm = {
        title: '월간 리뷰',
        date: '2025-06-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '월간 반복 일정',
        location: '대회의실',
        category: '업무',
        repeat: { type: 'monthly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 10,
      };

      // Act - 겹침 체크 없이 생성
      const events = generateRecurringEvents(eventData);

      // Assert - 모든 월에 일정이 생성됨 (7개월: 6월 ~ 12월)
      expect(events).toHaveLength(7);
      expect(events[0].date).toBe('2025-06-15');
      expect(events[1].date).toBe('2025-07-15');
      expect(events[2].date).toBe('2025-08-15');
      expect(events[6].date).toBe('2025-12-15');
    });

    it('매년 반복 일정 생성 시 기존 일정과의 비교 없이 생성한다', () => {
      // 명세: REQ-004
      // 설계: TODO-001

      // Arrange
      const eventData: EventForm = {
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

      // Act - 기존 일정 비교 없이 생성
      const events = generateRecurringEvents(eventData);

      // Assert - 1개 생성 (2025년만)
      expect(events).toHaveLength(1);
      expect(events[0].date).toBe('2025-06-15');
    });

    it('반복 안 함(none) 일정도 겹침 검증 없이 생성된다', () => {
      // 명세: REQ-004
      // 설계: TODO-001

      // Arrange
      const eventData: EventForm = {
        title: '단일 일정',
        date: '2025-06-15',
        startTime: '10:00',
        endTime: '11:00',
        description: '단일 일정',
        location: '회의실 A',
        category: '업무',
        repeat: { type: 'none', interval: 1 },
        notificationTime: 10,
      };

      // Act
      const events = generateRecurringEvents(eventData);

      // Assert - 단일 일정 1개 생성
      expect(events).toHaveLength(1);
      expect(events[0].date).toBe('2025-06-15');
      expect(events[0].title).toBe('단일 일정');
    });
  });
});
