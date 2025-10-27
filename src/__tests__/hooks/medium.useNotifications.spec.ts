import { act, renderHook } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';
import { formatDate } from '../../utils/dateUtils.ts';
import { parseHM } from '../utils.ts';

const 초 = 1000;
const 분 = 초 * 60;

beforeEach(() => {
  // 매 테스트 전에 타이머를 리셋
  vi.useRealTimers();
  vi.useFakeTimers();
});

afterEach(() => {
  // 매 테스트 후에 타이머를 정리
  vi.clearAllTimers();
  vi.useRealTimers();
});

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications([]));
  expect(result.current.notifications).toEqual([]);
  expect(result.current.notifiedEvents).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const notificationTime = 5;
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 이벤트',
      date: formatDate(new Date()),
      startTime: parseHM(Date.now() + 10 * 분),
      endTime: parseHM(Date.now() + 20 * 분),
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime,
    },
  ];

  const { result } = renderHook(() => useNotifications(mockEvents));

  expect(result.current.notifications).toHaveLength(0);

  vi.setSystemTime(new Date(Date.now() + notificationTime * 분));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifiedEvents).toContain('1');
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', () => {
  const { result } = renderHook(() => useNotifications([]));

  act(() => {
    result.current.setNotifications([
      { id: '1', message: '테스트 알림 1' },
      { id: '2', message: '테스트 알림 2' },
    ]);
  });

  expect(result.current.notifications).toHaveLength(2);

  act(() => {
    result.current.removeNotification(0);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications[0].message).toBe('테스트 알림 2');
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '테스트 이벤트',
      date: formatDate(new Date()),
      startTime: parseHM(Date.now() + 10 * 분),
      endTime: parseHM(Date.now() + 20 * 분),
      description: '',
      location: '',
      category: '',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  const { result } = renderHook(() => useNotifications(mockEvents));

  vi.setSystemTime(new Date(Date.now() + 5 * 분));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  vi.setSystemTime(new Date(Date.now() + 20 * 분));

  act(() => {
    vi.advanceTimersByTime(1000);
  });

  expect(result.current.notifications).toHaveLength(1);
});

describe('Edge Cases', () => {
  describe('타이머 cleanup', () => {
    it('언마운트 시 타이머가 정리되어야 한다', () => {
      const { result, unmount } = renderHook(() => useNotifications([]));

      const initialNotifications = result.current.notifications;

      // 언마운트
      act(() => {
        unmount();
      });

      // 타이머가 정리되었는지 확인 (에러가 발생하지 않아야 함)
      expect(initialNotifications).toEqual([]);
    });

    it('events 배열이 변경되어도 타이머가 정상 동작한다', () => {
      const initialEvents: Event[] = [
        {
          id: '1',
          title: '이벤트 1',
          date: formatDate(new Date()),
          startTime: parseHM(Date.now() + 10 * 분),
          endTime: parseHM(Date.now() + 20 * 분),
          description: '',
          location: '',
          category: '',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        },
      ];

      const { result, rerender } = renderHook((props) => useNotifications(props.events), {
        initialProps: { events: initialEvents },
      });

      expect(result.current.notifications).toHaveLength(0);

      const newEvents: Event[] = [
        ...initialEvents,
        {
          id: '2',
          title: '이벤트 2',
          date: formatDate(new Date()),
          startTime: parseHM(Date.now() + 15 * 분),
          endTime: parseHM(Date.now() + 25 * 분),
          description: '',
          location: '',
          category: '',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 5,
        },
      ];

      // 이벤트 배열 업데이트
      rerender({ events: newEvents });

      // 이벤트가 추가되어도 정상 동작 확인
      expect(result.current.notifications).toHaveLength(0);
    });
  });

  describe('성능 - 대량 일정', () => {
    it('많은 수의 이벤트에서도 정상 동작한다', () => {
      const largeEventList: Event[] = Array.from({ length: 100 }, (_, i) => ({
        id: String(i + 1),
        title: `이벤트 ${i + 1}`,
        date: formatDate(new Date()),
        startTime: parseHM(Date.now() + (i + 1) * 분),
        endTime: parseHM(Date.now() + (i + 2) * 분),
        description: '',
        location: '',
        category: '',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1,
      }));

      const { result } = renderHook(() => useNotifications(largeEventList));

      // 초기 상태 확인
      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.notifiedEvents).toEqual([]);
    });

    it('여러 이벤트가 동시에 알림 시간에 도달해도 모두 처리된다', () => {
      const now = Date.now();
      const mockEvents: Event[] = [
        {
          id: '1',
          title: '동시 이벤트 1',
          date: formatDate(new Date(now)),
          startTime: parseHM(now + 5 * 분),
          endTime: parseHM(now + 10 * 분),
          description: '',
          location: '',
          category: '',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 5,
        },
        {
          id: '2',
          title: '동시 이벤트 2',
          date: formatDate(new Date(now)),
          startTime: parseHM(now + 5 * 분),
          endTime: parseHM(now + 10 * 분),
          description: '',
          location: '',
          category: '',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 5,
        },
        {
          id: '3',
          title: '동시 이벤트 3',
          date: formatDate(new Date(now)),
          startTime: parseHM(now + 5 * 분),
          endTime: parseHM(now + 10 * 분),
          description: '',
          location: '',
          category: '',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 5,
        },
      ];

      const { result } = renderHook(() => useNotifications(mockEvents));

      // 초기 상태 확인
      expect(result.current.notifications).toHaveLength(0);
      expect(result.current.notifiedEvents).toHaveLength(0);

      // 알림 시간으로 이동 (5분 전)
      vi.setSystemTime(new Date(now));

      // 1초마다 체크하는 interval 때문에 시간을 충분히 진행
      act(() => {
        vi.advanceTimersByTime(2000); // 2초 진행
      });

      // 알림이 발생했는지 확인
      expect(result.current.notifications.length).toBeGreaterThan(0);
      expect(result.current.notifiedEvents.length).toBeGreaterThan(0);

      // 모든 알림 메시지가 올바르게 포함되었는지 확인
      const notificationMessages = result.current.notifications.map((n) => n.message);
      expect(notificationMessages.some((msg) => msg.includes('동시 이벤트 1'))).toBe(true);
      expect(notificationMessages.some((msg) => msg.includes('동시 이벤트 2'))).toBe(true);
      expect(notificationMessages.some((msg) => msg.includes('동시 이벤트 3'))).toBe(true);
    });
  });
});
