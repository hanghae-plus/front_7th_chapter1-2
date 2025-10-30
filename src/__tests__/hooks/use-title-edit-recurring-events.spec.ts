import { renderHook } from '@testing-library/react';

import { useTitleEditRecurringEvents } from '../../hooks/use-title-edit-recurring-events.ts';

describe('useTitleEditRecurringEvents', () => {
  it('exposes API without errors', () => {
    const { result } = renderHook(() => useTitleEditRecurringEvents());
    expect(result.current).toBeDefined();
  });
});
