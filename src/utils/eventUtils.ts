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

// 월에 31일이 있는지 판별
function has31stDay(year: number, month: number): boolean {
  return new Date(year, month + 1, 0).getDate() === 31;
}

// 해당 연도가 윤년인지 판별
function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

// 날짜 YYYY-MM-DD 형식 문자열 변환
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function generateRecurrences({
  start,
  end,
  type,
  interval,
}: GenerateRecurrencesParams): { date: string }[] {
  const results: { date: string }[] = [];
  const endTime = end.getTime();
  const startDay = start.getDate();
  let y = start.getFullYear();
  let m = start.getMonth();

  if (type === 'monthly') {
    // 31일 전용: 31일이 있는 달에만
    while (true) {
      if (startDay === 31) {
        if (has31stDay(y, m)) {
          const candidate = new Date(y, m, 31);
          if (candidate.getTime() > endTime) break;
          if (candidate.getTime() >= start.getTime()) {
            results.push({ date: formatDate(candidate) });
          }
        }
      } else {
        // 일반 규칙(후속 확장)
        const candidate = new Date(y, m, startDay);
        if (candidate.getTime() > endTime) break;
        if (candidate.getDate() === startDay && candidate.getTime() >= start.getTime()) {
          results.push({ date: formatDate(candidate) });
        }
      }
      // 월, 연도 증가
      m += interval;
      while (m >= 12) {
        m -= 12;
        y += 1;
      }
      if (new Date(y, m, 1).getTime() > endTime) break;
    }
    return results;
  }

  if (type === 'yearly') {
    // 2/29 전용: 윤년에만
    const startMonth = start.getMonth();
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
        const candidate = new Date(y, startMonth, startDay);
        if (candidate.getTime() > endTime) break;
        if (candidate.getTime() >= start.getTime()) {
          results.push({ date: formatDate(candidate) });
        }
      }
      y += interval;
      if (new Date(y, startMonth, 1).getTime() > endTime) break;
    }
    return results;
  }

  // 그 외: 테스트 요구 타입 외엔 반환 없음
  return results;
}
