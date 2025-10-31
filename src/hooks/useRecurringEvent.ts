import { Event } from '../types';

/**
 * Return type for useRecurringEvent hook.
 * Provides operations for managing recurring events and their instances.
 */
export interface RecurringEventOperations {
  /**
   * Expands a single recurring event into instances within a date range.
   * Returns empty array if event is not recurring (repeat.type === 'none').
   *
   * @param event - Master event to expand
   * @param rangeStart - Start date for expansion (ISO format 'YYYY-MM-DD')
   * @param rangeEnd - End date for expansion (ISO format 'YYYY-MM-DD')
   * @returns Array of event instances
   *
   * @example
   * const event = {
   *   id: '1',
   *   title: 'Daily Standup',
   *   date: '2025-01-01',
   *   repeat: { type: 'daily', interval: 1 },
   *   isSeriesDefinition: true
   * };
   * const instances = expandRecurringEvent(event, '2025-01-01', '2025-01-07');
   * // Returns 7 instances (one per day)
   */
  expandRecurringEvent(event: Event, rangeStart: string, rangeEnd: string): Event[];

  /**
   * Expands all recurring events in a list within a date range.
   * Non-recurring events are returned as-is.
   * Filters out master definitions (isSeriesDefinition: true) from final output.
   *
   * @param events - Mixed array of master events and one-time events
   * @param rangeStart - Start date for expansion (ISO format 'YYYY-MM-DD')
   * @param rangeEnd - End date for expansion (ISO format 'YYYY-MM-DD')
   * @returns Flattened array with instances replacing masters
   *
   * @example
   * const events = [
   *   { id: '1', date: '2025-01-05', repeat: { type: 'none' } }, // one-time
   *   { id: '2', date: '2025-01-01', repeat: { type: 'weekly' }, isSeriesDefinition: true } // recurring
   * ];
   * const expanded = expandAllRecurringEvents(events, '2025-01-01', '2025-01-31');
   * // Returns: one-time event + 4-5 weekly instances
   */
  expandAllRecurringEvents(events: Event[], rangeStart: string, rangeEnd: string): Event[];

  /**
   * Edits a recurring event instance (single or series).
   * In production, should show modal prompt: "해당 일정만 수정하시겠어요?"
   * - "예" (Yes) → mode: 'single'
   * - "아니오" (No) → mode: 'series'
   *
   * Single mode:
   * 1. Creates new standalone event with updates
   * 2. Adds instanceDate to master's excludedDates
   * 3. New event has: repeat.type = 'none', originalDate = instanceDate
   *
   * Series mode:
   * 1. Updates master definition with changes
   * 2. All instances reflect new properties
   * 3. Preserves excludedDates array
   *
   * @param eventId - ID of the series (seriesId)
   * @param mode - 'single' creates standalone event, 'series' updates master
   * @param updates - Partial event data to apply
   * @param instanceDate - Required for 'single' mode (ISO format 'YYYY-MM-DD')
   *
   * @throws {Error} If mode is 'single' but instanceDate is not provided
   *
   * @example
   * // Edit single instance
   * await editRecurringInstance('evt-1', 'single', { title: 'Rescheduled' }, '2025-03-15');
   * // Result: New standalone event created, '2025-03-15' added to excludedDates
   *
   * // Edit series
   * await editRecurringInstance('evt-1', 'series', { title: 'New Title' });
   * // Result: Master definition updated, all instances reflect change
   */
  editRecurringInstance(
    eventId: string,
    mode: 'single' | 'series',
    updates: Partial<Event>,
    instanceDate?: string
  ): Promise<void>;

  /**
   * Deletes a recurring event instance (single or series).
   * In production, should show modal prompt: "해당 일정만 삭제하시겠어요?"
   * - "예" (Yes) → mode: 'single'
   * - "아니오" (No) → mode: 'series'
   *
   * Single mode:
   * 1. Adds instanceDate to master's excludedDates array
   * 2. Instance no longer appears in calendar
   * 3. Other instances remain visible
   *
   * Series mode:
   * 1. Deletes master definition
   * 2. All instances removed from calendar
   *
   * @param eventId - ID of the series (seriesId)
   * @param mode - 'single' adds to excludedDates, 'series' deletes master
   * @param instanceDate - Required for 'single' mode (ISO format 'YYYY-MM-DD')
   *
   * @throws {Error} If mode is 'single' but instanceDate is not provided
   *
   * @example
   * // Delete single instance
   * await deleteRecurringInstance('evt-1', 'single', '2025-04-10');
   * // Result: '2025-04-10' added to excludedDates, instance hidden
   *
   * // Delete series
   * await deleteRecurringInstance('evt-1', 'series');
   * // Result: Master definition deleted, all instances removed
   */
  deleteRecurringInstance(
    eventId: string,
    mode: 'single' | 'series',
    instanceDate?: string
  ): Promise<void>;
}

/**
 * Hook for managing recurring event operations.
 * Integrates with useEventOperations for API calls.
 *
 * Responsibilities:
 * - Expand recurring events into instances for calendar views
 * - Handle single instance vs series modifications
 * - Manage excludedDates for deleted instances
 * - Create standalone events for edited instances
 *
 * @returns Object with recurring event operation functions
 *
 * @example
 * const { expandAllRecurringEvents, editRecurringInstance } = useRecurringEvent();
 *
 * // In calendar view component
 * const expandedEvents = expandAllRecurringEvents(events, '2025-01-01', '2025-01-31');
 *
 * // In event edit modal (after user confirms via modal)
 * await editRecurringInstance(event.seriesId, 'single', updates, event.date);
 */
export function useRecurringEvent(): RecurringEventOperations {
  throw new Error('NotImplementedError: useRecurringEvent not implemented');
}
