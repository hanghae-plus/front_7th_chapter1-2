// Helper to wait for events to load in hook result

interface HookResult {
  current: {
    events: import('@/types/events/Event.types').EventProps[];
  };
}

export const waitForEventsToLoad = async (
  result: HookResult,
  expectedLength: number
) =>
  vi.waitFor(() => {
    expect(result.current.events).toBeDefined();
    expect(result.current.events.length).toBe(expectedLength);
  });
