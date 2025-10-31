// 반복 일정 수정 유틸리티 함수 테스트
import { describe, it, expect, beforeEach } from 'vitest';

import { Event } from '@/types/events/Event.types';
import { EventForm } from '@/types/events/EventForm.types';
import {
  convertToSingleEvent,
  updateAllRecurringEvents,
  updateRecurringIcon,
  validateEditPermissions,
} from '@/utils/recurring/recurringEdit';

describe('recurringEdit 유틸리티 함수', () => {
  let mockRecurringEvent: Event;
  let mockEventList: Event[];

  beforeEach(() => {
    mockRecurringEvent = {
      id: '1',
      title: '반복 회의',
      date: '2025-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 회의',
      location: '회의실 A',
      category: '업무',
      notificationTime: 10,
      repeat: {
        type: 'weekly',
        interval: 1,
        endCondition: { type: 'never' },
        id: 'repeat-1',
      },
    };

    mockEventList = [
      mockRecurringEvent,
      {
        id: '2',
        title: '반복 회의',
        date: '2025-11-08',
        startTime: '10:00',
        endTime: '11:00',
        description: '주간 팀 회의',
        location: '회의실 A',
        category: '업무',
        notificationTime: 10,
        repeat: {
          type: 'weekly',
          interval: 1,
          endCondition: { type: 'never' },
          id: 'repeat-1',
        },
      },
      {
        id: '3',
        title: '단일 일정',
        date: '2025-11-05',
        startTime: '14:00',
        endTime: '15:00',
        description: '개별 미팅',
        location: '회의실 B',
        category: '업무',
        notificationTime: 5,
        repeat: { type: 'none', interval: 0 },
      },
    ];
  });

  describe('convertToSingleEvent', () => {
    it('반복 정보를 제거하고 단일 이벤트로 변환해야 함', () => {
      const result = convertToSingleEvent(mockRecurringEvent);

      expect(result.repeat.type).toBe('none');
      expect(result.repeat.interval).toBe(0);
      expect(result.repeat.id).toBeUndefined();
      expect(result.repeat.endCondition).toBeUndefined();
      expect(result.id).toBe(mockRecurringEvent.id);
      expect(result.title).toBe(mockRecurringEvent.title);
    });

    it('이미 단일 이벤트인 경우 변경 없이 반환해야 함', () => {
      const singleEvent = mockEventList[2]; // 단일 일정
      const result = convertToSingleEvent(singleEvent);

      expect(result).toEqual(singleEvent);
      expect(result.repeat.type).toBe('none');
    });

    it('잘못된 입력에 대해 에러를 던져야 함', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => convertToSingleEvent(null as any)).toThrow();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => convertToSingleEvent(undefined as any)).toThrow();
    });
  });

  describe('updateAllRecurringEvents', () => {
    it('동일한 repeatId를 가진 모든 이벤트를 업데이트해야 함', () => {
      const updatedData: Partial<EventForm> = {
        title: '수정된 회의',
        startTime: '11:00',
        endTime: '12:00',
      };

      const result = updateAllRecurringEvents(
        mockEventList,
        'repeat-1',
        updatedData
      );

      const recurringEvents = result.filter(
        (event) => event.repeat.id === 'repeat-1'
      );

      expect(recurringEvents).toHaveLength(2);
      recurringEvents.forEach((event) => {
        expect(event.title).toBe('수정된 회의');
        expect(event.startTime).toBe('11:00');
        expect(event.endTime).toBe('12:00');
        expect(event.repeat.id).toBe('repeat-1'); // 반복 정보는 유지
      });

      // 단일 이벤트는 변경되지 않아야 함
      const singleEvent = result.find((event) => event.id === '3');
      expect(singleEvent?.title).toBe('단일 일정');
    });

    it('존재하지 않는 repeatId로 호출 시 원본 배열을 반환해야 함', () => {
      const updatedData: Partial<EventForm> = { title: '수정된 제목' };
      const result = updateAllRecurringEvents(
        mockEventList,
        'non-existent',
        updatedData
      );

      expect(result).toEqual(mockEventList);
    });

    it('빈 업데이트 데이터로 호출 시 원본 배열을 반환해야 함', () => {
      const result = updateAllRecurringEvents(mockEventList, 'repeat-1', {});

      expect(result).toEqual(mockEventList);
    });
  });

  describe('updateRecurringIcon', () => {
    it('단일 수정 시 해당 이벤트의 반복 아이콘을 제거해야 함', () => {
      const result = updateRecurringIcon(mockEventList, '1', 'single');

      const targetEvent = result.find((event) => event.id === '1');
      expect(targetEvent?.repeat.type).toBe('none');

      // 다른 반복 이벤트는 영향받지 않아야 함
      const otherEvent = result.find((event) => event.id === '2');
      expect(otherEvent?.repeat.type).toBe('weekly');
    });

    it('전체 수정 시 모든 관련 이벤트의 반복 아이콘을 유지해야 함', () => {
      const result = updateRecurringIcon(mockEventList, '1', 'all');

      const targetEvent = result.find((event) => event.id === '1');
      expect(targetEvent?.repeat.type).toBe('weekly');
      expect(targetEvent?.repeat.id).toBe('repeat-1');

      const relatedEvent = result.find((event) => event.id === '2');
      expect(relatedEvent?.repeat.type).toBe('weekly');
      expect(relatedEvent?.repeat.id).toBe('repeat-1');
    });

    it('존재하지 않는 이벤트 ID로 호출 시 원본 배열을 반환해야 함', () => {
      const result = updateRecurringIcon(
        mockEventList,
        'non-existent',
        'single'
      );

      expect(result).toEqual(mockEventList);
    });
  });

  describe('validateEditPermissions', () => {
    it('반복 이벤트에 대해 편집 권한을 검증해야 함', () => {
      const result = validateEditPermissions(mockRecurringEvent);

      expect(result.canEditSingle).toBe(true);
      expect(result.canEditAll).toBe(true);
      expect(result.requiresConfirmation).toBe(true);
    });

    it('단일 이벤트에 대해 직접 편집 권한을 허용해야 함', () => {
      const singleEvent = mockEventList[2];
      const result = validateEditPermissions(singleEvent);

      expect(result.canEditSingle).toBe(true);
      expect(result.canEditAll).toBe(false);
      expect(result.requiresConfirmation).toBe(false);
    });

    it('과거 날짜의 반복 이벤트에 대해 제한된 권한을 반환해야 함', () => {
      const pastEvent = {
        ...mockRecurringEvent,
        date: '2023-01-01', // 과거 날짜
      };

      const result = validateEditPermissions(pastEvent);

      expect(result.canEditSingle).toBe(true);
      expect(result.canEditAll).toBe(false); // 과거 이벤트는 전체 수정 불가
      expect(result.requiresConfirmation).toBe(true);
    });
  });

  describe('데이터 무결성 검증', () => {
    it('변환 후 필수 필드가 누락되지 않아야 함', () => {
      const result = convertToSingleEvent(mockRecurringEvent);

      expect(result.id).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.date).toBeDefined();
      expect(result.startTime).toBeDefined();
      expect(result.endTime).toBeDefined();
      expect(result.repeat).toBeDefined();
    });

    it('대량 업데이트 시 배열 길이가 보존되어야 함', () => {
      const updatedData: Partial<EventForm> = { title: '수정된 제목' };
      const result = updateAllRecurringEvents(
        mockEventList,
        'repeat-1',
        updatedData
      );

      expect(result).toHaveLength(mockEventList.length);
    });

    it('깊은 복사가 수행되어 원본 데이터가 보호되어야 함', () => {
      const originalTitle = mockRecurringEvent.title;
      const updatedData: Partial<EventForm> = { title: '수정된 제목' };

      updateAllRecurringEvents(mockEventList, 'repeat-1', updatedData);

      // 원본 데이터는 변경되지 않아야 함
      expect(mockRecurringEvent.title).toBe(originalTitle);
    });
  });
});
