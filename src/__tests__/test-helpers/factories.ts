import { Event, RepeatType } from '../../types';

/**
 * 테스트용 Mock Event 객체를 생성합니다.
 *
 * 기본값을 제공하며, 필요한 필드만 오버라이드하여 사용할 수 있습니다.
 *
 * @param overrides - 오버라이드할 필드들
 * @returns 완전한 Event 객체
 *
 * @example
 * // 기본값으로 이벤트 생성
 * const event = createMockEvent();
 *
 * // 일부 필드만 오버라이드
 * const customEvent = createMockEvent({
 *   title: '팀 회의',
 *   date: '2025-10-15',
 * });
 */
export const createMockEvent = (overrides: Partial<Event> = {}): Event => {
  return {
    id: '1',
    title: '테스트 이벤트',
    date: '2025-10-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '테스트 설명',
    location: '테스트 장소',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 10,
    ...overrides,
  };
};

/**
 * 테스트용 반복 일정 Mock Event 객체를 생성합니다.
 *
 * 반복 일정에 필요한 recurrenceId를 포함하여 생성합니다.
 *
 * @param overrides - 오버라이드할 필드들
 * @param repeatType - 반복 유형 (기본값: 'weekly')
 * @param recurrenceId - 반복 일정 그룹 ID (기본값: 'rec-1')
 * @returns 반복 일정 Event 객체
 *
 * @example
 * const recurringEvent = createMockRecurringEvent({
 *   title: '주간 회의',
 *   date: '2025-10-06',
 * }, 'weekly', 'rec-1');
 */
export const createMockRecurringEvent = (
  overrides: Partial<Event> = {},
  repeatType: RepeatType = 'weekly',
  recurrenceId: string = 'rec-1'
): Event => {
  return createMockEvent({
    ...overrides,
    repeat: {
      type: repeatType,
      interval: 1,
      endDate: '2025-12-31',
      recurrenceId,
      ...overrides.repeat,
    },
  });
};

/**
 * 동일한 반복 일정 시리즈에 속하는 여러 이벤트를 생성합니다.
 *
 * @param dates - 일정 날짜 배열
 * @param baseEvent - 기본 이벤트 데이터
 * @param recurrenceId - 반복 일정 그룹 ID
 * @returns Event 배열
 *
 * @example
 * const events = createMockRecurringSeries(
 *   ['2025-10-06', '2025-10-13', '2025-10-20'],
 *   { title: '주간 회의', startTime: '10:00', endTime: '11:00' },
 *   'rec-1'
 * );
 */
export const createMockRecurringSeries = (
  dates: string[],
  baseEvent: Partial<Event>,
  recurrenceId: string = 'rec-1'
): Event[] => {
  return dates.map((date, index) =>
    createMockRecurringEvent(
      {
        ...baseEvent,
        id: String(index + 1),
        date,
      },
      baseEvent.repeat?.type as RepeatType,
      recurrenceId
    )
  );
};
