// 반복 일정 삭제 유틸리티 테스트
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { Event } from '@/types/events/Event.types';
import {
  validateDeletePermissions,
  getRecurringEventsByRepeatId,
  deleteSingleEvent,
  deleteAllRecurringEvents,
} from '@/utils/recurring/recurringDelete';

describe('recurringDelete 유틸리티', () => {
  let eventList: Event[];

  beforeEach(() => {
    // 시스템 시간을 2025년 1월 10일로 고정
    vi.setSystemTime(new Date('2025-01-10T00:00:00.000Z'));
    eventList = [
      {
        id: '1',
        title: '반복 회의 1',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 1, id: 'repeat-1' },
        notificationTime: 10,
      },
      {
        id: '2',
        title: '반복 회의 2',
        date: '2025-01-22',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'weekly', interval: 1, id: 'repeat-1' },
        notificationTime: 10,
      },
      {
        id: '3',
        title: '단일 일정',
        date: '2025-01-20',
        startTime: '14:00',
        endTime: '15:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10,
      },
      {
        id: '4',
        title: '다른 반복 회의',
        date: '2025-01-16',
        startTime: '11:00',
        endTime: '12:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, id: 'repeat-2' },
        notificationTime: 10,
      },
    ];
  });

  describe('validateDeletePermissions', () => {
    it('반복 일정의 경우 확인이 필요하다고 반환해야 함', () => {
      const result = validateDeletePermissions(eventList[0]);

      expect(result.canDeleteSingle).toBe(true);
      expect(result.canDeleteAll).toBe(true);
      expect(result.requiresConfirmation).toBe(true);
    });

    it('단일 일정의 경우 확인이 불필요하다고 반환해야 함', () => {
      const result = validateDeletePermissions(eventList[2]);

      expect(result.canDeleteSingle).toBe(true);
      expect(result.canDeleteAll).toBe(false);
      expect(result.requiresConfirmation).toBe(false);
    });

    it('과거 반복 이벤트의 경우 전체 삭제가 불가능해야 함', () => {
      const pastEvent = {
        ...eventList[0],
        date: '2024-12-15', // 과거 날짜
      };

      const result = validateDeletePermissions(pastEvent);

      expect(result.canDeleteSingle).toBe(true);
      expect(result.canDeleteAll).toBe(false);
      expect(result.requiresConfirmation).toBe(true);
    });
  });

  describe('getRecurringEventsByRepeatId', () => {
    it('같은 repeatId를 가진 모든 이벤트를 반환해야 함', () => {
      const result = getRecurringEventsByRepeatId(eventList, 'repeat-1');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[1].id).toBe('2');
    });

    it('존재하지 않는 repeatId의 경우 빈 배열을 반환해야 함', () => {
      const result = getRecurringEventsByRepeatId(eventList, 'non-existent');

      expect(result).toHaveLength(0);
    });

    it('단일 이벤트 repeatId로 검색 시 빈 배열을 반환해야 함', () => {
      const result = getRecurringEventsByRepeatId(eventList, undefined);

      expect(result).toHaveLength(0);
    });
  });

  describe('deleteSingleEvent', () => {
    it('지정된 단일 이벤트만 삭제해야 함', () => {
      const result = deleteSingleEvent(eventList, '1');

      expect(result).toHaveLength(3);
      expect(result.find((e) => e.id === '1')).toBeUndefined();
      expect(result.find((e) => e.id === '2')).toBeDefined(); // 같은 repeatId이지만 유지
    });

    it('존재하지 않는 이벤트 ID로 삭제 시 원본 배열을 반환해야 함', () => {
      const result = deleteSingleEvent(eventList, 'non-existent');

      expect(result).toHaveLength(4);
      expect(result).toEqual(eventList);
    });

    it('빈 이벤트 목록에서 삭제 시 빈 배열을 반환해야 함', () => {
      const result = deleteSingleEvent([], '1');

      expect(result).toHaveLength(0);
    });
  });

  describe('deleteAllRecurringEvents', () => {
    it('같은 repeatId를 가진 모든 이벤트를 삭제해야 함', () => {
      const result = deleteAllRecurringEvents(eventList, 'repeat-1');

      expect(result).toHaveLength(2);
      expect(result.find((e) => e.id === '1')).toBeUndefined();
      expect(result.find((e) => e.id === '2')).toBeUndefined();
      expect(result.find((e) => e.id === '3')).toBeDefined(); // 다른 일정은 유지
      expect(result.find((e) => e.id === '4')).toBeDefined(); // 다른 반복 일정도 유지
    });

    it('존재하지 않는 repeatId로 삭제 시 원본 배열을 반환해야 함', () => {
      const result = deleteAllRecurringEvents(eventList, 'non-existent');

      expect(result).toHaveLength(4);
      expect(result).toEqual(eventList);
    });

    it('빈 repeatId로 삭제 시 원본 배열을 반환해야 함', () => {
      const result = deleteAllRecurringEvents(eventList, '');

      expect(result).toHaveLength(4);
      expect(result).toEqual(eventList);
    });

    it('undefined repeatId로 삭제 시 원본 배열을 반환해야 함', () => {
      const result = deleteAllRecurringEvents(eventList, undefined as string);

      expect(result).toHaveLength(4);
      expect(result).toEqual(eventList);
    });
  });

  describe('엣지 케이스', () => {
    it('빈 이벤트 목록에서 반복 삭제 시 빈 배열을 반환해야 함', () => {
      const result = deleteAllRecurringEvents([], 'repeat-1');

      expect(result).toHaveLength(0);
    });

    it('null 이벤트 목록 처리 시 에러가 발생하지 않아야 함', () => {
      expect(() => {
        deleteSingleEvent(null as Event[], '1');
      }).not.toThrow();
    });

    it('undefined 이벤트 목록 처리 시 에러가 발생하지 않아야 함', () => {
      expect(() => {
        deleteAllRecurringEvents(undefined as Event[], 'repeat-1');
      }).not.toThrow();
    });
  });
});
