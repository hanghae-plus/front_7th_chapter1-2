import { RepeatInfo } from '../types';
import { generateOccurrences } from './repeatRuleGenerator';

// 에러코드 정의
export const REPEAT_MISSING_SCOPE = 'REPEAT_MISSING_SCOPE';
export const REPEAT_INVALID_SCOPE = 'REPEAT_INVALID_SCOPE';
export const REPEAT_TOO_MANY = 'REPEAT_TOO_MANY';
export const REPEAT_INVALID_RANGE = 'REPEAT_INVALID_RANGE';

// 총생성 상한
export const MAX_OCCURRENCE_COUNT = 10000;

/** 종료조건 및 상호배타성/범위 기본유효성 검증 */
export function validateRepeatRule(repeat: RepeatInfo): {
  valid: boolean;
  code?: string;
  message?: string;
} {
  if (repeat.enabled) {
    // count, endDate: 둘 다 있거나, 둘 다 없으면 에러
    if ((repeat.count == null || repeat.count === undefined) && !repeat.endDate) {
      return {
        valid: false,
        code: REPEAT_MISSING_SCOPE,
        message: '반복 종료 조건을 지정하세요',
      };
    }
    if ((repeat.count != null && repeat.count !== undefined) && repeat.endDate) {
      return {
        valid: false,
        code: REPEAT_INVALID_SCOPE,
        message: 'count와 until 중 하나만 지정하세요',
      };
    }
    // count 범위 체크
    if (repeat.count !== undefined) {
      if (repeat.count < 1 || repeat.count > 1000) {
        return {
          valid: false,
          code: 'INVALID_COUNT_RANGE',
          message: 'count는 1~1000 사이여야 합니다.',
        };
      }
    }
    // interval 범위 체크
    if (repeat.interval < 1 || repeat.interval > 12) {
      return {
        valid: false,
        code: 'INVALID_INTERVAL_RANGE',
        message: 'interval은 1~12 사이여야 합니다.',
      };
    }
    // endDate 타입 및 범위 체크 (startDate 필요 -> 호출자에서 전달)
    if (repeat.endDate) {
      // endDate가 유효한 날짜인지, startDate와 비교
      // startDate는 별도 전달 필요, 보통 RepeatInfo와 별도 관리
      // 여기서는 startDate가 함께 전달된다고 가정
      const { startDate } = repeat;
      if (startDate) {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(repeat.endDate);
        if (isNaN(endDateObj.getTime()) || isNaN(startDateObj.getTime())) {
          return {
            valid: false,
            code: 'INVALID_DATE',
            message: '유효하지 않은 날짜 형식입니다.',
          };
        }
        if (endDateObj < startDateObj) {
          return {
            valid: false,
            code: REPEAT_INVALID_RANGE,
            message: '종료일은 시작일 이후여야 합니다.',
          };
        }
        // 10년 초과 제한
        const tenYearsLater = new Date(startDateObj);
        tenYearsLater.setFullYear(tenYearsLater.getFullYear() + 10);
        if (endDateObj > tenYearsLater) {
          return {
            valid: false,
            code: REPEAT_INVALID_RANGE,
            message: '종료일은 시작일로부터 10년 이내여야 합니다.',
          };
        }
      }
    }
  }
  return { valid: true };
}

/** 실제 생성될 occurrence 총 갯수(상한) 검증 */
export function validateOccurrenceCount(
  params: RepeatInfo
): { valid: boolean; code?: string; message?: string } {
  // 실제 생성 시뮬레이션
  const occurrences = generateOccurrences(params);
  if (occurrences.length > MAX_OCCURRENCE_COUNT) {
    return {
      valid: false,
      code: REPEAT_TOO_MANY,
      message: '반복 횟수가 너무 큽니다(최대 10,000)',
    };
  }
  return { valid: true };
}
