import { renderHook } from '@testing-library/react';

import { useTitleRecurringScheduleDisplay } from '../../hooks/use-title-recurring-schedule-display.ts';

describe('useTitleRecurringScheduleDisplay', () => {
  it('exposes API without errors', () => {
    const { result } = renderHook(() => useTitleRecurringScheduleDisplay());
    expect(result.current).toBeDefined();
  });
});
