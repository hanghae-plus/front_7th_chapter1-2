import { Event, RepeatType } from '../types';

/**
 * Generate recurring events based on repeat configuration
 * <!-- 반복 설정에 따라 반복 일정 생성 -->
 */
export function generateRecurringEvents(event: Event, maxOccurrences = 365): Event[] {
  if (event.repeat.type === 'none') {
    return [event];
  }

  const events: Event[] = [];
  const startDate = new Date(event.date);
  const endDate = event.repeat.endDate ? new Date(event.repeat.endDate) : null;
  const originalEventId = event.id; // Store original event ID
  // <!-- 원본 이벤트 ID 저장 -->
  const repeatId = event.repeat.id || generateRepeatId();
  const originalDay = startDate.getDate();

  // For monthly/yearly, track iteration count separately from Date object
  // to avoid overflow issues
  // <!-- 매월/매년의 경우, 오버플로우 문제를 피하기 위해 -->
  // <!-- Date 객체와 별도로 반복 횟수를 추적 -->
  let iterationCount = 0;
  const maxIterations = maxOccurrences * 12; // Prevent infinite loop
  // <!-- 무한 루프 방지 -->

  while (events.length < maxOccurrences && iterationCount < maxIterations) {
    let currentDate: Date;

    // Calculate date based on iteration count for monthly/yearly to avoid overflow issues
    // <!-- 매월/매년의 경우 오버플로우 문제를 피하기 위해 반복 횟수 기준으로 날짜 계산 -->
    if (event.repeat.type === 'monthly') {
      currentDate = getMonthlyOccurrence(startDate, iterationCount, event.repeat.interval);
    } else if (event.repeat.type === 'yearly') {
      currentDate = getYearlyOccurrence(startDate, iterationCount, event.repeat.interval);
    } else {
      // For daily/weekly, use traditional getNextOccurrence
      // <!-- 일일/주간의 경우 기존 getNextOccurrence 사용 -->
      currentDate =
        iterationCount === 0
          ? new Date(startDate)
          : getNextOccurrence(
              events[events.length - 1].date,
              event.repeat.type,
              event.repeat.interval
            );
    }

    // For monthly and yearly repeats, only add event if day matches original day
    // <!-- 매월/매년 반복의 경우, 날짜가 원래 날짜와 일치할 때만 이벤트 추가 -->
    const shouldAddEvent =
      event.repeat.type === 'daily' ||
      event.repeat.type === 'weekly' ||
      currentDate.getDate() === originalDay;

    if (shouldAddEvent) {
      const dateString = formatDate(currentDate);

      // Check endDate using formatted string
      // <!-- 포맷된 문자열로 endDate 확인 -->
      if (endDate && dateString > formatDate(endDate)) {
        break;
      }

      events.push({
        ...event,
        id: generateEventId(),
        date: dateString,
        repeat: {
          ...event.repeat,
          id: repeatId,
          originalEventId: originalEventId, // Store original event ID for editing/deletion
          // <!-- 수정/삭제를 위해 원본 이벤트 ID 저장 -->
          originalDate: event.date, // Store original start date for editing
          // <!-- 수정을 위해 원본 시작 날짜 저장 -->
        },
      });
    }

    iterationCount++;
  }

  return events;
}

/**
 * Get monthly occurrence for a specific iteration
 * <!-- 특정 반복에 대한 매월 발생 날짜 가져오기 -->
 */
function getMonthlyOccurrence(startDate: Date, iteration: number, interval: number): Date {
  const result = new Date(startDate);
  const originalDay = startDate.getDate();

  // Calculate target month and year
  // <!-- 목표 월과 연도 계산 -->
  const monthsToAdd = iteration * interval;
  const targetMonth = (startDate.getMonth() + monthsToAdd) % 12;
  const targetYear =
    startDate.getFullYear() + Math.floor((startDate.getMonth() + monthsToAdd) / 12);

  // Set to 1st day first, then target month/year, then try original day
  // <!-- 먼저 1일로 설정, 그 다음 목표 월/년도, 그 다음 원래 날짜 시도 -->
  result.setDate(1);
  result.setFullYear(targetYear);
  result.setMonth(targetMonth);
  result.setDate(originalDay);

  return result;
}

/**
 * Get yearly occurrence for a specific iteration
 * <!-- 특정 반복에 대한 매년 발생 날짜 가져오기 -->
 */
function getYearlyOccurrence(startDate: Date, iteration: number, interval: number): Date {
  const result = new Date(startDate);
  const originalDay = startDate.getDate();
  const originalMonth = startDate.getMonth();

  // Calculate target year
  // <!-- 목표 연도 계산 -->
  const targetYear = startDate.getFullYear() + iteration * interval;

  // Set to 1st day first, then target year, then try original month and day
  // <!-- 먼저 1일로 설정, 그 다음 목표 연도, 그 다음 원래 월과 날짜 시도 -->
  result.setDate(1);
  result.setFullYear(targetYear);
  result.setMonth(originalMonth);
  result.setDate(originalDay);

  return result;
}

/**
 * Get next occurrence date based on repeat type and interval
 * Only handles daily and weekly (monthly/yearly use separate functions)
 * <!-- 반복 유형과 간격에 따라 다음 발생 날짜 가져오기 -->
 * <!-- daily와 weekly만 처리 (monthly/yearly는 별도 함수 사용) -->
 */
function getNextOccurrence(currentDateString: string, type: RepeatType, interval: number): Date {
  const currentDate = new Date(currentDateString);
  const nextDate = new Date(currentDate);

  switch (type) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;

    case 'weekly':
      nextDate.setDate(nextDate.getDate() + interval * 7);
      break;

    default:
      // Monthly and yearly are now handled by separate functions
      // <!-- 매월/매년은 이제 별도 함수에서 처리 -->
      throw new Error(`Unexpected repeat type in getNextOccurrence: ${type}`);
  }

  return nextDate;
}

/**
 * Format date to YYYY-MM-DD string
 * <!-- 날짜를 YYYY-MM-DD 문자열로 포맷 -->
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate unique repeat ID
 * <!-- 고유한 반복 ID 생성 -->
 */
function generateRepeatId(): string {
  return `repeat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate unique event ID
 * <!-- 고유한 이벤트 ID 생성 -->
 */
function generateEventId(): string {
  return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
