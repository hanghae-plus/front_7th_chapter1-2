import {
  REPEAT_INVALID_RANGE,
  REPEAT_INVALID_SCOPE,
  REPEAT_MISSING_SCOPE,
  REPEAT_TOO_MANY,
  validateOccurrenceCount,
  validateRepeatRule,
} from '../../utils/repeatValidation';

describe('repeatValidation', () => {
  describe('정상 동작', () => {
    it('type="none" 때 검증을 스킵한다', () => {
      const repeat = { type: 'none', interval: 1 };
      expect(validateRepeatRule(repeat)).toEqual({ valid: true });
    });
    it('count만 지정 시 정상 통과한다', () => {
      const repeat = { type: 'daily', interval: 1, count: 5 };
      expect(validateRepeatRule(repeat)).toEqual({ valid: true });
    });
    it('until만 지정 시 정상 통과한다', () => {
      const repeat = {
        type: 'daily',
        interval: 2,
        endDate: '2026-12-31',
        startDate: '2025-01-01',
      };
      expect(validateRepeatRule(repeat)).toEqual({ valid: true });
    });
  });

  describe('에러 케이스', () => {
    describe('종료 조건 검증', () => {
      it('count와 until을 모두 누락하면 에러를 발생시킨다', () => {
        const repeat = { type: 'daily', interval: 1 };
        expect(validateRepeatRule(repeat)).toEqual({
          valid: false,
          code: REPEAT_MISSING_SCOPE,
          message: '반복 종료 조건을 지정하세요',
        });
      });
      it('count와 until을 동시에 지정하면 에러를 발생시킨다', () => {
        const repeat = {
          type: 'daily',
          interval: 1,
          count: 5,
          endDate: '2026-12-31',
        };
        expect(validateRepeatRule(repeat)).toEqual({
          valid: false,
          code: REPEAT_INVALID_SCOPE,
          message: 'count와 until 중 하나만 지정하세요',
        });
      });
    });
    describe('값 범위 검증', () => {
      it('count가 1보다 작으면 에러를 발생시킨다', () => {
        const repeat = { type: 'daily', interval: 1, count: 0 };
        expect(validateRepeatRule(repeat)).toEqual({
          valid: false,
          code: 'INVALID_COUNT_RANGE',
          message: 'count는 1~1000 사이여야 합니다.',
        });
      });
      it('count가 1000을 초과하면 에러를 발생시킨다', () => {
        const repeat = { type: 'daily', interval: 1, count: 1001 };
        expect(validateRepeatRule(repeat)).toEqual({
          valid: false,
          code: 'INVALID_COUNT_RANGE',
          message: 'count는 1~1000 사이여야 합니다.',
        });
      });
      it('interval이 1보다 작으면 에러를 발생시킨다', () => {
        const repeat = { type: 'daily', interval: 0, count: 5 };
        expect(validateRepeatRule(repeat)).toEqual({
          valid: false,
          code: 'INVALID_INTERVAL_RANGE',
          message: 'interval은 1~12 사이여야 합니다.',
        });
      });
      it('interval이 12를 초과하면 에러를 발생시킨다', () => {
        const repeat = { type: 'daily', interval: 13, count: 5 };
        expect(validateRepeatRule(repeat)).toEqual({
          valid: false,
          code: 'INVALID_INTERVAL_RANGE',
          message: 'interval은 1~12 사이여야 합니다.',
        });
      });
      it('until이 startDate보다 이전이면 에러를 발생시킨다', () => {
        const repeat = {
          type: 'daily',
          interval: 1,
          endDate: '2025-10-31',
          startDate: '2025-11-01',
        };
        expect(validateRepeatRule(repeat)).toEqual({
          valid: false,
          code: REPEAT_INVALID_RANGE,
          message: '종료일은 시작일 이후여야 합니다.',
        });
      });
      it('until이 startDate+10년을 초과하면 에러를 발생시킨다', () => {
        const repeat = {
          type: 'daily',
          interval: 1,
          endDate: '2036-11-02',
          startDate: '2025-11-01',
        };
        expect(validateRepeatRule(repeat)).toEqual({
          valid: false,
          code: REPEAT_INVALID_RANGE,
          message: '종료일은 시작일로부터 10년 이내여야 합니다.',
        });
      });
    });
    describe('생성 상한 검증', () => {
      it('예상 생성 횟수가 10,000회 이하면 통과한다', () => {
        const repeat = {
          type: 'daily',
          interval: 1,
          count: 10000,
        };
        expect(validateOccurrenceCount({ ...repeat, startDate: '2025-01-01' })).toEqual({
          valid: true,
        });
      });
      it('예상 생성 횟수가 10,000회를 초과하면 에러를 발생시킨다', () => {
        const repeat = {
          type: 'daily',
          interval: 1,
          count: 10001,
        };
        expect(validateOccurrenceCount({ ...repeat, startDate: '2025-01-01' })).toEqual({
          valid: false,
          code: REPEAT_TOO_MANY,
          message: '반복 횟수가 너무 큽니다(최대 10,000)',
        });
      });
    });
  });
});
