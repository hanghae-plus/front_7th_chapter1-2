import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  format,
  getDaysInMonth,
  isLeapYear,
} from 'date-fns';

import type { Event, RepeatType, EventForm } from '../types';

/**
 * 반복 일정 생성 함수
 * @param startDate 시작 날짜
 * @param endDate 종료 날짜
 * @param repeatType 반복 유형 ('daily' | 'weekly' | 'monthly' | 'yearly')
 * @param eventData 이벤트 데이터
 * @param interval 반복 간격 (기본값: 1)
 * @returns 생성된 반복 일정 배열
 */
export function generateRecurringEvents(
  startDate: Date,
  endDate: Date | null,
  repeatType: RepeatType,
  eventData: Omit<EventForm, 'date' | 'repeat'>,
  interval: number = 1
): Event[] {
  // 종료 날짜가 없거나 시작 날짜보다 이전이면 빈 배열 반환
  if (!endDate || endDate < startDate) {
    return [];
  }

  const events: Event[] = [];
  const recurrenceId = crypto.randomUUID(); // 동일한 반복 그룹을 식별하는 ID
  let currentDate = new Date(startDate);

  const startDay = startDate.getDate();
  const startMonth = startDate.getMonth();

  while (currentDate <= endDate) {
    // 매월 반복 시 31일 처리: 31일이 없는 달은 건너뛰기
    if (repeatType === 'monthly') {
      const daysInMonth = getDaysInMonth(currentDate);
      if (startDay > daysInMonth) {
        // 다음 달로 이동
        currentDate = addMonths(currentDate, 1);
        currentDate.setDate(1); // 1일로 설정
        continue;
      }
      // 날짜를 시작일의 일(day)로 설정
      currentDate.setDate(startDay);
    }

    // 매년 반복 시 2월 29일 처리: 윤년이 아니면 건너뛰기
    if (repeatType === 'yearly') {
      if (startMonth === 1 && startDay === 29) {
        // 2월 29일
        if (!isLeapYear(currentDate)) {
          // 다음 해로 이동 (switch문에서 다시 addYears하므로 여기서는 안함)
          currentDate = addYears(currentDate, 1);
          currentDate.setMonth(startMonth);
          currentDate.setDate(1);
          continue;
        }
      }
      // 매년 반복의 경우 월/일을 시작일과 동일하게 설정
      currentDate.setMonth(startMonth);
      currentDate.setDate(startDay);
    }

    // 현재 날짜가 종료 날짜를 초과하면 중단
    if (currentDate > endDate) {
      break;
    }

    // 이벤트 생성
    const event: Event = {
      id: crypto.randomUUID(),
      ...eventData,
      date: format(currentDate, 'yyyy-MM-dd'),
      repeat: {
        type: repeatType,
        interval: interval,
        endDate: format(endDate, 'yyyy-MM-dd'),
        recurrenceId, // 추가: 반복 그룹 ID
      },
    };

    events.push(event);

    // 다음 반복 날짜로 이동
    switch (repeatType) {
      case 'daily':
        currentDate = addDays(currentDate, interval);
        break;
      case 'weekly':
        currentDate = addWeeks(currentDate, interval);
        break;
      case 'monthly':
        currentDate = addMonths(currentDate, interval);
        break;
      case 'yearly':
        currentDate = addYears(currentDate, interval);
        break;
      default:
        return events;
    }
  }

  return events;
}

/**
 * 반복 일정 여부 확인 함수
 * @param event 이벤트 객체
 * @returns 반복 일정이면 true, 아니면 false
 */
export function isRecurringEvent(event: Event): boolean {
  return event.repeat.type !== 'none';
}
