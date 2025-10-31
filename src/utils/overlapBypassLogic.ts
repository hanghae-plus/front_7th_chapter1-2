import { Event, EventForm } from '../types';

/**
 * Determines if overlap allows bypass (continue)
 * 겹침이 bypass(계속 진행)를 허용하는지 판단
 *
 * Bypass is allowed when at least one event is recurring.
 * Only normal + normal overlaps are NOT allowed to bypass.
 * bypass는 하나라도 반복 일정이 있으면 허용됩니다.
 * 일반 + 일반 겹침만 bypass를 허용하지 않습니다.
 *
 * @param newEvent - Event being added/edited
 * @param overlappingEvents - Events that overlap with newEvent
 * @returns true if bypass should be allowed (at least one recurring event)
 */
export function shouldAllowOverlapBypass(
  newEvent: Event | EventForm,
  overlappingEvents: Event[]
): boolean {
  const newIsRecurring = newEvent.repeat.type !== 'none';

  return overlappingEvents.some((event) => {
    const overlapIsRecurring = event.repeat.type !== 'none';
    // Allow bypass if at least one is recurring (OR logic)
    // 하나라도 반복 일정이면 bypass 허용 (OR 로직)
    return newIsRecurring || overlapIsRecurring;
  });
}
