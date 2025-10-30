import { renderHook } from '@testing-library/react';

import { useTitleRecurringScheduleFeature } from '../../hooks/use-title-recurring-schedule-feature.ts';

describe('useTitleRecurringScheduleFeature', () => {
  it('exposes API without errors', () => {
    const { result } = renderHook(() => useTitleRecurringScheduleFeature());
    expect(result.current).toBeDefined();
  });
});
