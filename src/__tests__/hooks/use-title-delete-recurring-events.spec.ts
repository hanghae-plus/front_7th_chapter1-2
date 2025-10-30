import { renderHook } from '@testing-library/react';

import { useTitleDeleteRecurringEvents } from '../../hooks/use-title-delete-recurring-events.ts';

describe('useTitleDeleteRecurringEvents', () => {
  it('exposes API without errors', () => {
    const { result } = renderHook(() => useTitleDeleteRecurringEvents());
    expect(result.current).toBeDefined();
  });
});
