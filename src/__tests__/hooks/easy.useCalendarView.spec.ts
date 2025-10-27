import { act, renderHook } from '@testing-library/react';

import { useCalendarView } from '../../hooks/useCalendarView.ts';
import { assertDate } from '../utils.ts';

describe('초기 상태', () => {
  it('view는 "month"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.view).toBe('month');
  });

  it('currentDate는 오늘 날짜인 "2025-10-01"이어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    assertDate(result.current.currentDate, new Date('2025-10-01'));
  });

  it('holidays는 10월 휴일인 개천절, 한글날, 추석이 지정되어 있어야 한다', () => {
    const { result } = renderHook(() => useCalendarView());

    expect(result.current.holidays).toEqual({
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
      '2025-10-05': '추석',
      '2025-10-06': '추석',
      '2025-10-07': '추석',
    });
  });
});

it("view를 'week'으로 변경 시 적절하게 반영된다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setView('week');
  });

  expect(result.current.view).toBe('week');
});

it("주간 뷰에서 다음으로 navigate시 7일 후 '2025-10-08' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView('week');
  });

  act(() => {
    result.current.navigate('next');
  });

  assertDate(result.current.currentDate, new Date('2025-10-08'));
});

it("주간 뷰에서 이전으로 navigate시 7일 후 '2025-09-24' 날짜로 지정이 된다", () => {
  const { result } = renderHook(() => useCalendarView());
  act(() => {
    result.current.setView('week');
  });

  act(() => {
    result.current.navigate('prev');
  });

  assertDate(result.current.currentDate, new Date('2025-09-24'));
});

it("월간 뷰에서 다음으로 navigate시 한 달 후 '2025-11-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.navigate('next');
  });

  assertDate(result.current.currentDate, new Date('2025-11-01'));
});

it("월간 뷰에서 이전으로 navigate시 한 달 전 '2025-09-01' 날짜여야 한다", () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.navigate('prev');
  });

  assertDate(result.current.currentDate, new Date('2025-09-01'));
});

it("currentDate가 '2025-03-01' 변경되면 3월 휴일 '삼일절'로 업데이트되어야 한다", async () => {
  const { result } = renderHook(() => useCalendarView());

  act(() => {
    result.current.setCurrentDate(new Date('2025-03-01'));
  });

  expect(result.current.holidays).toEqual({ '2025-03-01': '삼일절' });
});

describe('Edge Cases', () => {
  describe('월말/연말 경계 테스트', () => {
    it('월간 뷰에서 12월 다음으로 navigate시 다음해 1월로 이동해야 한다', () => {
      const { result } = renderHook(() => useCalendarView());

      // 12월로 이동
      act(() => {
        result.current.setCurrentDate(new Date('2025-12-01'));
      });

      // 다음 달로 이동
      act(() => {
        result.current.navigate('next');
      });

      assertDate(result.current.currentDate, new Date('2026-01-01'));
    });

    it('월간 뷰에서 1월 이전으로 navigate시 전년도 12월로 이동해야 한다', () => {
      const { result } = renderHook(() => useCalendarView());

      // 1월로 이동
      act(() => {
        result.current.setCurrentDate(new Date('2025-01-01'));
      });

      // 이전 달로 이동
      act(() => {
        result.current.navigate('prev');
      });

      assertDate(result.current.currentDate, new Date('2024-12-01'));
    });

    it('마지막 날짜(31일)에서 다음 달로 이동할 때 올바르게 처리된다', () => {
      const { result } = renderHook(() => useCalendarView());

      // 1월 31일로 설정
      act(() => {
        result.current.setCurrentDate(new Date('2025-01-31'));
      });

      // 다음 달로 이동 (2월 1일)
      act(() => {
        result.current.navigate('next');
      });

      assertDate(result.current.currentDate, new Date('2025-02-01'));
    });

    it('2월 29일(윤년)에서 다음 달로 이동할 때 올바르게 처리된다', () => {
      const { result } = renderHook(() => useCalendarView());

      // 윤년의 2월 29일로 설정
      act(() => {
        result.current.setCurrentDate(new Date('2024-02-29'));
      });

      // 다음 달로 이동
      act(() => {
        result.current.navigate('next');
      });

      assertDate(result.current.currentDate, new Date('2024-03-01'));
    });
  });

  describe('주간 뷰 경계 테스트', () => {
    it('월 말 주간 뷰에서 다음으로 이동하면 다음 달 주로 이동한다', () => {
      const { result } = renderHook(() => useCalendarView());

      // 10월 마지막 주로 이동
      act(() => {
        result.current.setView('week');
        result.current.setCurrentDate(new Date('2025-10-25'));
      });

      // 다음 주로 이동
      act(() => {
        result.current.navigate('next');
      });

      // 11월로 이동
      const novDate = new Date(result.current.currentDate);
      expect(novDate.getMonth()).toBe(10); // 11월 (0-indexed)
    });

    it('주간 뷰에서 한 달 전후를 넘나들 수 있다', () => {
      const { result } = renderHook(() => useCalendarView());

      // 10월 첫 주로 이동
      act(() => {
        result.current.setView('week');
        result.current.setCurrentDate(new Date('2025-10-01'));
      });

      // 이전 주로 이동하여 9월로 이동
      act(() => {
        result.current.navigate('prev');
      });

      const sepDate = new Date(result.current.currentDate);
      expect(sepDate.getMonth()).toBe(8); // 9월 (0-indexed)
    });
  });

  describe('공휴일 업데이트 테스트', () => {
    it('날짜 변경 시 공휴일이 자동으로 업데이트된다', () => {
      const { result } = renderHook(() => useCalendarView());

      // 초기 휴일 확인
      expect(result.current.holidays['2025-10-03']).toBe('개천절');

      // 12월로 이동
      act(() => {
        result.current.setCurrentDate(new Date('2025-12-01'));
      });

      // 12월 휴일로 업데이트되어야 함
      expect(result.current.holidays['2025-12-25']).toBe('크리스마스');
    });

    it('다른 달로 이동하면 해당 달의 휴일만 표시된다', () => {
      const { result } = renderHook(() => useCalendarView());

      // 초기 10월 휴일
      expect(result.current.holidays['2025-10-09']).toBe('한글날');

      // 3월으로 이동
      act(() => {
        result.current.setCurrentDate(new Date('2025-03-01'));
      });

      // 3월 휴일만 표시
      expect(result.current.holidays['2025-03-01']).toBe('삼일절');
      expect(result.current.holidays['2025-10-09']).toBeUndefined();
    });
  });

  describe('뷰 전환 시 날짜 보존', () => {
    it('주간 뷰에서 월간 뷰로 전환해도 currentDate가 유지된다', () => {
      const { result } = renderHook(() => useCalendarView());

      // 주간 뷰로 전환
      act(() => {
        result.current.setView('week');
        result.current.setCurrentDate(new Date('2025-10-15'));
      });

      const weekDate = new Date(result.current.currentDate);

      // 월간 뷰로 전환
      act(() => {
        result.current.setView('month');
      });

      const monthDate = new Date(result.current.currentDate);

      // 날짜가 유지되어야 함
      expect(monthDate.getDate()).toBe(weekDate.getDate());
      expect(monthDate.getMonth()).toBe(weekDate.getMonth());
      expect(monthDate.getFullYear()).toBe(weekDate.getFullYear());
    });

    it('월간 뷰에서 주간 뷰로 전환해도 currentDate가 유지된다', () => {
      const { result } = renderHook(() => useCalendarView());

      // 월간 뷰로 시작
      act(() => {
        result.current.setCurrentDate(new Date('2025-10-20'));
      });

      const monthDate = new Date(result.current.currentDate);

      // 주간 뷰로 전환
      act(() => {
        result.current.setView('week');
      });

      const weekDate = new Date(result.current.currentDate);

      // 날짜가 유지되어야 함
      expect(weekDate.getDate()).toBe(monthDate.getDate());
      expect(weekDate.getMonth()).toBe(monthDate.getMonth());
      expect(weekDate.getFullYear()).toBe(monthDate.getFullYear());
    });
  });
});
