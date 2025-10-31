// 반복 일정 표시 관련 유틸리티 함수
import { RepeatInfoProps } from '@/types/events/RepeatInfo.types';

// 반복 타입별 아이콘 정의
const RECURRING_ICONS = {
  default: '🔄', // 기본 반복 아이콘
  daily: '📅', // 매일 반복
  weekly: '📆', // 매주 반복
  monthly: '🗓️', // 매월 반복
  yearly: '📝', // 매년 반복
  none: '', // 반복 없음
} as const;

/**
 * 이벤트가 반복 일정인지 확인
 */
export function isRecurringEvent(
  repeatInfo: RepeatInfoProps | null | undefined
): boolean {
  if (!repeatInfo) {
    return false;
  }

  // type이 'none'이거나 유효하지 않은 경우 false 반환
  if (
    repeatInfo.type === 'none' ||
    !['daily', 'weekly', 'monthly', 'yearly'].includes(repeatInfo.type)
  ) {
    return false;
  }

  return true;
}

/**
 * 반복 타입에 따른 아이콘 반환
 */
export function getRecurringIcon(
  repeatInfo: RepeatInfoProps | null | undefined
): string {
  if (!repeatInfo) {
    return RECURRING_ICONS.default;
  }

  if (repeatInfo.type === 'none') {
    return RECURRING_ICONS.none;
  }

  const icon = RECURRING_ICONS[repeatInfo.type as keyof typeof RECURRING_ICONS];
  return icon || RECURRING_ICONS.default;
}

/**
 * 반복 타입에 따른 접근성 라벨 생성
 */
export function getRecurringIconLabel(
  repeatInfo: RepeatInfoProps | null | undefined
): string {
  if (!repeatInfo || repeatInfo.type === 'none') {
    return '';
  }

  const { type, interval = 1 } = repeatInfo;

  // 반복 타입별 라벨 생성
  switch (type) {
    case 'daily':
      return interval === 1 ? '매일 반복 일정' : `${interval}일마다 반복 일정`;
    case 'weekly':
      return interval === 1 ? '매주 반복 일정' : `${interval}주마다 반복 일정`;
    case 'monthly':
      return interval === 1
        ? '매월 반복 일정'
        : `${interval}개월마다 반복 일정`;
    case 'yearly':
      return interval === 1 ? '매년 반복 일정' : `${interval}년마다 반복 일정`;
    default:
      return '';
  }
}
