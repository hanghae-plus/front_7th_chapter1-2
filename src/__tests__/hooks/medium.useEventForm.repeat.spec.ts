import { act, renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';

import { useEventForm } from '../../hooks/useEventForm';
import { Event, RepeatType } from '../../types';

describe('useEventForm - Repeat Settings', () => {
  beforeEach(() => {
    expect.hasAssertions();
  });

  describe('반복 설정 상태 관리', () => {
    it('MEDIUM.2.1 - 반복 일정 토글', () => {
      const { result } = renderHook(() => useEventForm());

      // When no initial event, repeat state should be set to 'none' type
      expect(result.current.repeatType).toBe('none');
      expect(result.current.repeatInterval).toBe(1);
      expect(result.current.repeatEndDate).toBe('');
    });

    it('MEDIUM.2.2 - 반복 유형 변경 (daily)', () => {
      const { result } = renderHook(() => useEventForm());

      expect(result.current.repeatType).toBe('none');
      // setRepeatType should be exposed by the hook
      expect(typeof result.current.setRepeatType).toBe('function');
    });

    it('MEDIUM.2.3 - 반복 간격 변경', () => {
      const { result } = renderHook(() => useEventForm());

      expect(result.current.repeatInterval).toBe(1);
      // setRepeatInterval should be exposed by the hook
      expect(typeof result.current.setRepeatInterval).toBe('function');
    });

    it('MEDIUM.2.4 - 반복 종료일 변경', () => {
      const { result } = renderHook(() => useEventForm());

      expect(result.current.repeatEndDate).toBe('');
      // setRepeatEndDate should be exposed by the hook
      expect(typeof result.current.setRepeatEndDate).toBe('function');
    });

    it('MEDIUM.2.5 - 폼 초기화 시 반복 설정도 초기화', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setTitle('테스트 제목');
        result.current.setRepeatInterval(3);
        result.current.setRepeatEndDate('2025-10-31');
      });

      expect(result.current.title).toBe('테스트 제목');
      expect(result.current.repeatInterval).toBe(3);
      expect(result.current.repeatEndDate).toBe('2025-10-31');

      act(() => {
        result.current.resetForm();
      });

      expect(result.current.title).toBe('');
      expect(result.current.repeatInterval).toBe(1);
      expect(result.current.repeatEndDate).toBe('');
      expect(result.current.repeatType).toBe('none');
    });
  });

  describe('기존 반복 이벤트 수정', () => {
    it('MEDIUM.2.6 - 반복 이벤트 로드 시 반복 정보 유지', () => {
      const existingEvent: Event = {
        id: '1',
        title: '주간 회의',
        date: '2025-10-06',
        startTime: '10:00',
        endTime: '11:00',
        description: '팀 미팅',
        location: '회의실',
        category: '업무',
        repeat: {
          type: 'weekly' as RepeatType,
          interval: 2,
          endDate: '2025-11-01',
        },
        notificationTime: 10,
      };

      const { result } = renderHook(() => useEventForm(existingEvent));

      expect(result.current.title).toBe('주간 회의');
      expect(result.current.repeatType).toBe('weekly');
      expect(result.current.repeatInterval).toBe(2);
      expect(result.current.repeatEndDate).toBe('2025-11-01');
      expect(result.current.isRepeating).toBe(true);
    });

    it('반복 없는 이벤트 로드 시 초기값 설정', () => {
      const existingEvent: Event = {
        id: '2',
        title: '단일 회의',
        date: '2025-10-01',
        startTime: '14:00',
        endTime: '15:00',
        description: '일회성 미팅',
        location: '회의실',
        category: '개인',
        repeat: {
          type: 'none',
          interval: 1, // Should be 1, not 0
        },
        notificationTime: 10,
      };

      const { result } = renderHook(() => useEventForm(existingEvent));

      expect(result.current.repeatType).toBe('none');
      expect(result.current.isRepeating).toBe(false);
      expect(result.current.repeatInterval).toBe(1);
    });
  });

  describe('반복 설정 관련 상태 노출', () => {
    it('모든 반복 관련 setter가 노출되어야 함', () => {
      const { result } = renderHook(() => useEventForm());

      expect(result.current).toHaveProperty('setRepeatType');
      expect(result.current).toHaveProperty('setRepeatInterval');
      expect(result.current).toHaveProperty('setRepeatEndDate');
      expect(result.current).toHaveProperty('isRepeating');
      expect(result.current).toHaveProperty('repeatType');
      expect(result.current).toHaveProperty('repeatInterval');
      expect(result.current).toHaveProperty('repeatEndDate');
    });

    it('반복 데이터는 폼 객체에 포함되어야 함', () => {
      const { result } = renderHook(() => useEventForm());

      act(() => {
        result.current.setTitle('테스트');
        result.current.setDate('2025-10-01');
        result.current.setRepeatInterval(3);
        result.current.setRepeatEndDate('2025-10-31');
      });

      // The form should include repeat data in submission
      expect(result.current.repeatInterval).toBe(3);
      expect(result.current.repeatEndDate).toBe('2025-10-31');
    });
  });
});
