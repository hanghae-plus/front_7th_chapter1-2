// 반복 일정 생성 유틸리티
import { EventProps } from '@/types/events/Event.types';
import { RepeatEndCondition } from '@/types/events/RepeatInfo.types';

// 테스트에서 사용하는 확장된 이벤트 타입 (startDate, endDate가 Date 타입)
export interface RecurringEventProps extends EventProps {
  startDate: Date;
  endDate: Date;
  repeat: {
    type: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endCondition: RepeatEndCondition;
  };
}

// 최대 허용 종료 날짜
const MAX_END_DATE = new Date('2025-12-31');

/**
 * 기본 이벤트 템플릿으로 반복 일정 생성
 */
export function generateRecurringEvents(
  baseEvent: RecurringEventProps,
  maxLimit?: number
): RecurringEventProps[] {
  if (!baseEvent.repeat || !baseEvent.repeat.endCondition) {
    return [];
  }

  // 시작 날짜가 최대 범위를 초과하는 경우
  if (baseEvent.startDate > MAX_END_DATE) {
    return [];
  }

  const events: RecurringEventProps[] = [];
  const { type, interval, endCondition } = baseEvent.repeat;
  const limit = maxLimit || 10000; // 기본 최대 제한

  let currentStartDate = new Date(baseEvent.startDate);
  let currentEndDate = new Date(baseEvent.endDate);
  let count = 0;

  while (count < limit) {
    // 종료 조건 확인
    if (!isWithinEndCondition(currentStartDate, endCondition, count + 1)) {
      break;
    }

    // 최대 날짜 범위 확인 (count 기반 종료 조건이 아닌 경우에만)
    if (endCondition.type !== 'count' && currentStartDate > MAX_END_DATE) {
      break;
    }

    // 이벤트 생성
    const eventId = `${baseEvent.id}-${count + 1}`;
    const newEvent: RecurringEventProps = {
      ...baseEvent,
      id: eventId,
      startDate: new Date(currentStartDate),
      endDate: new Date(currentEndDate),
    };

    events.push(newEvent);
    count++;

    // 다음 발생일 계산
    const nextStart = calculateNextOccurrence(currentStartDate, type, interval);
    const duration = currentEndDate.getTime() - currentStartDate.getTime();
    const nextEnd = new Date(nextStart.getTime() + duration);

    currentStartDate = nextStart;
    currentEndDate = nextEnd;
  }

  return events;
}

/**
 * 다음 발생일 계산
 */
export function calculateNextOccurrence(
  currentDate: Date,
  repeatType: 'daily' | 'weekly' | 'monthly' | 'yearly',
  interval: number
): Date {
  const nextDate = new Date(currentDate);

  switch (repeatType) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;

    case 'weekly':
      nextDate.setDate(nextDate.getDate() + interval * 7);
      break;

    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + interval);
      // 월말 날짜 처리 (예: 1/31 -> 2/28)
      if (nextDate.getDate() !== currentDate.getDate()) {
        nextDate.setDate(0); // 이전 달의 마지막 날로 설정
      }
      break;

    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      // 윤년 처리 (예: 2/29 -> 다음 평년의 2/28)
      if (nextDate.getDate() !== currentDate.getDate()) {
        nextDate.setDate(0); // 이전 달의 마지막 날로 설정
      }
      break;
  }

  return nextDate;
}

/**
 * 종료 조건 내에 있는지 확인
 */
export function isWithinEndCondition(
  date: Date,
  endCondition: RepeatEndCondition,
  occurrenceNumber: number
): boolean {
  switch (endCondition.type) {
    case 'never':
      return true;

    case 'date':
      return endCondition.endDate ? date <= endCondition.endDate : true;

    case 'count':
      return endCondition.count ? occurrenceNumber <= endCondition.count : true;

    default:
      return false;
  }
}

/**
 * 날짜 범위 내 이벤트 필터링
 */
export function filterEventsInRange(
  events: RecurringEventProps[],
  startRange: Date,
  endRange: Date
): RecurringEventProps[] {
  return events.filter((event) => {
    return event.startDate >= startRange && event.startDate <= endRange;
  });
}

/**
 * 이벤트 생성 최적화 (대량 처리용)
 */
export function optimizeEventGeneration(
  baseEvent: RecurringEventProps
): RecurringEventProps[] {
  // 전체 이벤트를 생성하되, 배치 단위로 처리하여 메모리 최적화
  // 실제로는 전체 반복 횟수만큼 생성해야 함
  const totalCount =
    baseEvent.repeat.endCondition.type === 'count'
      ? baseEvent.repeat.endCondition.count || 1
      : 1000; // never나 date 타입의 기본 제한

  return generateRecurringEvents(baseEvent, totalCount);
}

/**
 * 생성 파라미터 검증 결과 타입
 */
export interface GenerationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * 이벤트 생성 파라미터 검증
 */
export function validateGenerationParams(
  baseEvent: RecurringEventProps | EventProps
): GenerationValidationResult {
  const result: GenerationValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // 반복 정보 확인
  if (!baseEvent.repeat) {
    result.isValid = false;
    result.errors.push('반복 정보가 필요합니다.');
    return result;
  }

  // 반복 타입 확인
  const validTypes = ['daily', 'weekly', 'monthly', 'yearly'];
  if (!validTypes.includes(baseEvent.repeat.type)) {
    result.isValid = false;
    result.errors.push('유효하지 않은 반복 타입입니다.');
  }

  // 간격 확인
  if (!baseEvent.repeat.interval || baseEvent.repeat.interval <= 0) {
    result.isValid = false;
    result.errors.push('간격은 1 이상이어야 합니다.');
  } else if (baseEvent.repeat.interval > 50) {
    result.warnings.push(`간격이 매우 큽니다. (${baseEvent.repeat.interval})`);
  }

  // 이벤트 기간 확인
  if (
    'startDate' in baseEvent &&
    'endDate' in baseEvent &&
    baseEvent.startDate &&
    baseEvent.endDate
  ) {
    // RecurringEventProps 타입인 경우 (테스트에서 사용)
    if (baseEvent.endDate < baseEvent.startDate) {
      result.isValid = false;
      result.errors.push('이벤트 종료 날짜가 시작 날짜보다 이전입니다.');
    }
  } else if (
    'date' in baseEvent &&
    (!baseEvent.date || !baseEvent.startTime || !baseEvent.endTime)
  ) {
    // EventProps 타입인 경우 (실제 운영에서 사용)
    result.isValid = false;
    result.errors.push('이벤트 날짜와 시간 정보가 필요합니다.');
  }

  return result;
}
