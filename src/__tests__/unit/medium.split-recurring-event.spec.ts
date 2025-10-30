import { describe, it, expect } from 'vitest';

import { splitRecurringEvent } from '../../features/recurring-events';
import { Event } from '../../types';

describe('splitRecurringEvent', () => {
  describe('단일 일정 수정 (분할)', () => {
    it('"예" 버튼을 클릭하면 반복 일정이 분할되고 해당 날짜의 일정만 수정된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const modifiedEvent = {
        title: '수정된 일정',
        startTime: '10:00',
        endTime: '11:00',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', modifiedEvent);

      expect(result.before).toBeDefined();
      expect(result.modified).toBeDefined();
      expect(result.after).toBeDefined();
    });

    it('단일 일정 수정 시 기존 반복 일정의 endDate가 수정 날짜 이전의 마지막 반복 날짜로 변경된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      expect(result.before?.repeat.endDate).toBe('2025-01-04');
    });

    it('단일 일정 수정 시 수정된 내용으로 새로운 단일 일정이 생성된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const modifiedEvent = {
        title: '수정된 일정',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', modifiedEvent);

      expect(result.modified).toBeDefined();
      expect(result.modified?.title).toBe('수정된 일정');
      expect(result.modified?.date).toBe('2025-01-05');
    });

    it('단일 일정 수정 시 생성된 단일 일정의 repeat.type은 "none"이다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      expect(result.modified?.repeat.type).toBe('none');
    });

    it('단일 일정 수정 시 생성된 단일 일정의 repeatGroupId는 원본과 동일하다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      expect(result.modified?.repeatGroupId).toBe('group-123');
    });

    it('단일 일정 수정 시 수정 날짜 이후의 날짜부터 시작하는 새로운 반복 일정이 생성된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      expect(result.after).toBeDefined();
      expect(result.after?.repeat.type).toBe('daily');
    });

    it('단일 일정 수정 시 생성된 새 반복 일정의 시작일은 수정 날짜의 다음 반복 날짜이다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      expect(result.after?.date).toBe('2025-01-06');
    });

    it('단일 일정 수정 시 생성된 새 반복 일정의 endDate는 원본의 endDate와 동일하다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      expect(result.after?.repeat.endDate).toBe('2025-01-10');
    });

    it('단일 일정 수정 시 생성된 새 반복 일정의 repeatGroupId는 원본과 동일하다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      expect(result.after?.repeatGroupId).toBe('group-123');
    });

    it('단일 일정 수정 후 해당 일정의 Repeat 아이콘이 사라진다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      // 수정된 일정은 단일 일정이므로 아이콘 사라짐
      expect(result.modified?.repeat.type).toBe('none');
    });

    it('단일 일정 수정 후 나머지 반복 일정의 Repeat 아이콘은 유지된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05', { title: '수정됨' });

      // before와 after는 여전히 반복 일정
      expect(result.before?.repeat.type).toBe('daily');
      expect(result.after?.repeat.type).toBe('daily');
    });
  });

  describe('단일 일정 삭제 (분할)', () => {
    it('"예" 버튼을 클릭하면 반복 일정이 분할되고 해당 날짜의 일정만 제외된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05');

      expect(result.before).toBeDefined();
      expect(result.modified).toBeUndefined(); // 삭제는 modified가 없음
      expect(result.after).toBeDefined();
    });

    it('단일 일정 삭제 시 기존 반복 일정의 endDate가 삭제 날짜 이전의 마지막 반복 날짜로 변경된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05');

      expect(result.before?.repeat.endDate).toBe('2025-01-04');
    });

    it('단일 일정 삭제 시 삭제 날짜 이후의 날짜부터 시작하는 새로운 반복 일정이 생성된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05');

      expect(result.after).toBeDefined();
      expect(result.after?.repeat.type).toBe('daily');
    });

    it('단일 일정 삭제 시 생성된 새 반복 일정의 시작일은 삭제 날짜의 다음 반복 날짜이다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05');

      expect(result.after?.date).toBe('2025-01-06');
    });

    it('단일 일정 삭제 시 생성된 새 반복 일정의 endDate는 원본의 endDate와 동일하다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05');

      expect(result.after?.repeat.endDate).toBe('2025-01-10');
    });

    it('단일 일정 삭제 시 생성된 새 반복 일정의 repeatGroupId는 원본과 동일하다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05');

      expect(result.after?.repeatGroupId).toBe('group-123');
    });

    it('단일 일정 삭제 후 해당 날짜의 일정이 표시되지 않는다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05');

      // 2025-01-05는 제외됨
      expect(result.before?.repeat.endDate).toBe('2025-01-04');
      expect(result.after?.date).toBe('2025-01-06');
    });

    it('단일 일정 삭제 후 나머지 반복 일정은 정상적으로 표시된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-05');

      // before와 after는 여전히 존재
      expect(result.before).toBeDefined();
      expect(result.after).toBeDefined();
    });
  });

  describe('반복 일정 분할 경계 케이스', () => {
    it('반복 일정의 첫 번째 일정을 수정하면 원본 반복 일정이 삭제되고 단일 일정과 새 반복 일정이 생성된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-01', { title: '수정됨' });

      // before는 없고 (첫 날짜이므로), modified와 after만 존재
      expect(result.before).toBeUndefined();
      expect(result.modified).toBeDefined();
      expect(result.after).toBeDefined();
    });

    it('반복 일정의 마지막 일정을 수정하면 원본 반복 일정의 endDate가 변경되고 단일 일정이 생성된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-10', { title: '수정됨' });

      // before만 있고 after는 없음 (마지막 날짜이므로)
      expect(result.before).toBeDefined();
      expect(result.modified).toBeDefined();
      expect(result.after).toBeUndefined();
    });

    it('반복 일정의 첫 번째 일정을 삭제하면 원본 반복 일정의 시작일이 다음 반복 날짜로 변경된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-01');

      // before는 없고 after만 존재
      expect(result.before).toBeUndefined();
      expect(result.after).toBeDefined();
      expect(result.after?.date).toBe('2025-01-02');
    });

    it('반복 일정의 마지막 일정을 삭제하면 원본 반복 일정의 endDate가 이전 반복 날짜로 변경된다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-10' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      const result = splitRecurringEvent(originalEvent, '2025-01-10');

      // before만 있고 after는 없음
      expect(result.before).toBeDefined();
      expect(result.before?.repeat.endDate).toBe('2025-01-09');
      expect(result.after).toBeUndefined();
    });

    it('반복 일정이 2개의 인스턴스만 있을 때 중간 일정을 수정하면 분할되지 않는다', () => {
      const originalEvent: Event = {
        id: '1',
        title: '원본 반복 일정',
        date: '2025-01-01',
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        location: '',
        category: '',
        repeat: { type: 'daily', interval: 1, endDate: '2025-01-02' },
        notificationTime: 10,
        repeatGroupId: 'group-123',
      };

      // 2개만 있을 때는 첫번째나 마지막 케이스로 처리
      const result = splitRecurringEvent(originalEvent, '2025-01-01', { title: '수정됨' });

      expect(result.modified).toBeDefined();
    });
  });
});

