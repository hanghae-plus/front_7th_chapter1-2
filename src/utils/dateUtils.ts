import { Event, EventForm } from '../types.ts';

/**
 * 주어진 년도와 월의 일수를 반환합니다.
 */
export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * 주어진 날짜가 속한 주의 모든 날짜를 반환합니다.
 */
export function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const sunday = new Date(date.setDate(diff));
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(sunday);
    nextDate.setDate(sunday.getDate() + i);
    weekDates.push(nextDate);
  }
  return weekDates;
}

export function getWeeksAtMonth(currentDate: Date) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month + 1);
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weeks = [];

  const initWeek = () => Array(7).fill(null);

  let week: Array<number | null> = initWeek();

  for (let i = 0; i < firstDayOfMonth; i++) {
    week[i] = null;
  }

  for (const day of days) {
    const dayIndex = (firstDayOfMonth + day - 1) % 7;
    week[dayIndex] = day;
    if (dayIndex === 6 || day === daysInMonth) {
      weeks.push(week);
      week = initWeek();
    }
  }

  return weeks;
}

export function getEventsForDay(events: Event[], date: number): Event[] {
  return events.filter((event) => new Date(event.date).getDate() === date);
}

export function formatWeek(targetDate: Date) {
  const dayOfWeek = targetDate.getDay();
  const diffToThursday = 4 - dayOfWeek;
  const thursday = new Date(targetDate);
  thursday.setDate(targetDate.getDate() + diffToThursday);

  const year = thursday.getFullYear();
  const month = thursday.getMonth() + 1;

  const firstDayOfMonth = new Date(thursday.getFullYear(), thursday.getMonth(), 1);

  const firstThursday = new Date(firstDayOfMonth);
  firstThursday.setDate(1 + ((4 - firstDayOfMonth.getDay() + 7) % 7));

  const weekNumber: number =
    Math.floor((thursday.getTime() - firstThursday.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;

  return `${year}년 ${month}월 ${weekNumber}주`;
}

/**
 * 주어진 날짜의 월 정보를 "YYYY년 M월" 형식으로 반환합니다.
 */
export function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}년 ${month}월`;
}

const stripTime = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/**
 * 주어진 날짜가 특정 범위 내에 있는지 확인합니다.
 */
export function isDateInRange(date: Date, rangeStart: Date, rangeEnd: Date): boolean {
  const normalizedDate = stripTime(date);
  const normalizedStart = stripTime(rangeStart);
  const normalizedEnd = stripTime(rangeEnd);

  return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
}

export function fillZero(value: number, size = 2) {
  return String(value).padStart(size, '0');
}

export function formatDate(currentDate: Date, day?: number) {
  return [
    currentDate.getFullYear(),
    fillZero(currentDate.getMonth() + 1),
    fillZero(day ?? currentDate.getDate()),
  ].join('-');
}

/**
 * Generates unique event IDs
 */
let eventIdCounter = 0;
function generateEventId(): string {
  return `event-${Date.now()}-${++eventIdCounter}`;
}

/**
 * Checks if a month has 31 days
 * Months with 31 days: 1, 3, 5, 7, 8, 10, 12
 */
function hasDay31(month: number): boolean {
  const monthsWith31Days = [1, 3, 5, 7, 8, 10, 12];
  return monthsWith31Days.includes(month);
}

/**
 * Generates monthly recurring events based on eventForm
 * REQ-002: If starting on the 31st, only generate events in months with 31 days
 *
 * @param eventForm - Event form data with repeat information
 * @returns Array of generated recurring events
 */
export function generateMonthlyRecurringEvents(eventForm: EventForm): Event[] {
  const events: Event[] = [];

  // Parse start date
  const startDate = new Date(eventForm.date);
  const dayOfMonth = startDate.getDate();

  // Determine end date (default to 2025-12-31 if not specified)
  const MAX_END_DATE = new Date('2025-12-31');
  const endDate = eventForm.repeat.endDate ? new Date(eventForm.repeat.endDate) : MAX_END_DATE;

  // Ensure end date doesn't exceed MAX_END_DATE
  const effectiveEndDate = endDate > MAX_END_DATE ? MAX_END_DATE : endDate;

  // Start iterating from the start date
  let currentDate = new Date(startDate);

  while (currentDate <= effectiveEndDate) {
    const currentMonth = currentDate.getMonth() + 1; // JS months are 0-based (0=Jan, 11=Dec)
    const currentYear = currentDate.getFullYear();

    // Check if this month has the required day
    if (dayOfMonth === 31) {
      // Only generate if month has 31 days
      if (!hasDay31(currentMonth)) {
        // Skip this month - advance to next month
        currentDate.setMonth(currentDate.getMonth() + 1);
        currentDate.setDate(1); // Reset to 1st to avoid date overflow
        continue;
      }
    } else {
      // For non-31st days, check if the day exists in this month
      const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
      if (dayOfMonth > daysInCurrentMonth) {
        // Skip this month
        currentDate.setMonth(currentDate.getMonth() + 1);
        currentDate.setDate(1);
        continue;
      }
    }

    // Generate event for this month
    const event: Event = {
      ...eventForm,
      id: generateEventId(),
      date: formatDate(currentDate),
    };

    events.push(event);

    // Advance to next month
    currentDate.setMonth(currentDate.getMonth() + 1);
    // After advancing month, set back to the desired day
    currentDate.setDate(dayOfMonth);
  }

  return events;
}
