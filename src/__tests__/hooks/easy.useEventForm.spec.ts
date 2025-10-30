import { act, renderHook } from '@testing-library/react';

import { useEventForm } from '../../hooks/useEventForm.ts';
import { Event, RepeatType } from '../../types.ts';

describe('useEventForm - 반복 유형 선택', () => {
  it('생성 시 반복 체크 후 반복 유형을 daily/weekly/monthly/yearly로 선택할 수 있다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.setIsRepeating(true);
    });

    const repeatTypes: RepeatType[] = ['daily', 'weekly', 'monthly', 'yearly'];

    repeatTypes.forEach((type) => {
      act(() => {
        result.current.setRepeatType(type);
      });

      expect(result.current.repeatType).toBe(type);
      expect(result.current.isRepeating).toBe(true);
    });
  });

  it('수정 시 기존 이벤트의 반복 유형이 폼 상태에 반영된다', () => {
    const { result } = renderHook(() => useEventForm());

    const baseEvent: Omit<Event, 'repeat'> = {
      id: 'e1',
      title: '회의',
      date: '2025-10-20',
      startTime: '09:00',
      endTime: '10:00',
      description: '주간 회의',
      location: '회의실 A',
      category: '업무',
      notificationTime: 10,
    };

    const typesToCheck: RepeatType[] = ['none', 'daily', 'weekly', 'monthly', 'yearly'];

    typesToCheck.forEach((t) => {
      act(() => {
        result.current.editEvent({ ...baseEvent, repeat: { type: t, interval: 1 } });
      });

      expect(result.current.repeatType).toBe(t);
      expect(result.current.isRepeating).toBe(t !== 'none');
    });
  });
});
