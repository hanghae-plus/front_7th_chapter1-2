import { Event } from '../types';
import { getWeekDates, isDateInRange } from './dateUtils';

function filterEventsByDateRange(events: Event[], start: Date, end: Date): Event[] {
  return events.filter((event) => {
    const eventDate = new Date(event.date);
    return isDateInRange(eventDate, start, end);
  });
}

function containsTerm(target: string, term: string) {
  return target.toLowerCase().includes(term.toLowerCase());
}

function searchEvents(events: Event[], term: string) {
  return events.filter(
    ({ title, description, location }) =>
      containsTerm(title, term) || containsTerm(description, term) || containsTerm(location, term)
  );
}

function filterEventsByDateRangeAtWeek(events: Event[], currentDate: Date) {
  const weekDates = getWeekDates(currentDate);
  return filterEventsByDateRange(events, weekDates[0], weekDates[6]);
}

function filterEventsByDateRangeAtMonth(events: Event[], currentDate: Date) {
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  return filterEventsByDateRange(events, monthStart, monthEnd);
}

export function getFilteredEvents(
  events: Event[],
  searchTerm: string,
  currentDate: Date,
  view: 'week' | 'month'
): Event[] {
  const searchedEvents = searchEvents(events, searchTerm);

  if (view === 'week') {
    return filterEventsByDateRangeAtWeek(searchedEvents, currentDate);
  }

  if (view === 'month') {
    return filterEventsByDateRangeAtMonth(searchedEvents, currentDate);
  }

  return searchedEvents;
}

// ---- 반복 일정 생성 (테스트 통과를 위한 최소 구현) ----

type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface GenerateRecurrencesParams {
  start: Date;
  end: Date;
  type: RecurrenceType;
  interval: number;
}

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

export function generateRecurrences({
  start,
  end,
  type,
  interval,
}: GenerateRecurrencesParams): { date: string }[] {
  const results: { date: string }[] = [];
  const endTime = end.getTime();

  if (type === 'monthly') {
    // 월간 규칙(최소 구현): 시작일이 31일인 경우, 31일이 존재하는 달(1,3,5,7,8,10,12)에만 생성
    const startDay = start.getDate();
    let y = start.getFullYear();
    let m = start.getMonth();

    while (true) {
      const lastDayOfMonth = new Date(y, m + 1, 0).getDate();
      if (startDay === 31) {
        if (lastDayOfMonth === 31) {
          const candidate = new Date(y, m, 31);
          if (candidate.getTime() > endTime) break;
          if (candidate.getTime() >= start.getTime()) {
            results.push({ date: formatDate(candidate) });
          }
        }
      } else {
        // 현재 RED 테스트는 31일 케이스만 요구. 그 외는 추후 확장
        const candidate = new Date(y, m, startDay);
        if (candidate.getTime() > endTime) break;
        if (candidate.getDate() === startDay && candidate.getTime() >= start.getTime()) {
          results.push({ date: formatDate(candidate) });
        }
      }

      // interval 단위로 월 이동
      m += interval;
      while (m >= 12) {
        m -= 12;
        y += 1;
      }

      // 다음 루프가 종료일을 초과하는지 사전 확인
      const probe = new Date(y, m, 1);
      if (probe.getTime() > endTime) break;
    }

    return results;
  }

  if (type === 'yearly') {
    // 연간 규칙(최소 구현): 2/29 시작 시 윤년에만 생성(대체 금지)
    const startMonth = start.getMonth();
    const startDay = start.getDate();
    let y = start.getFullYear();

    while (true) {
      if (startMonth === 1 && startDay === 29) {
        if (isLeapYear(y)) {
          const candidate = new Date(y, 1, 29);
          if (candidate.getTime() > endTime) break;
          if (candidate.getTime() >= start.getTime()) {
            results.push({ date: formatDate(candidate) });
          }
        }
      } else {
        // 현재 RED 테스트는 2/29 케이스만 요구. 그 외는 추후 확장
        const candidate = new Date(y, startMonth, startDay);
        if (candidate.getTime() > endTime) break;
        if (candidate.getTime() >= start.getTime()) {
          results.push({ date: formatDate(candidate) });
        }
      }

      // interval 단위로 연도 이동
      y += interval;
      const probe = new Date(y, startMonth, 1);
      if (probe.getTime() > endTime) break;
    }

    return results;
  }

  // 현재 테스트 범위 외 타입은 생성하지 않음
  return results;
}
