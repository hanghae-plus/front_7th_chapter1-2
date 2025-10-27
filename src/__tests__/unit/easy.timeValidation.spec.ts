import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    const result = getTimeErrorMessage('14:00', '13:00');
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    const result = getTimeErrorMessage('14:00', '14:00');
    expect(result).toEqual({
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    });
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    const result = getTimeErrorMessage('13:00', '14:00');
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    const result = getTimeErrorMessage('', '14:00');
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    const result = getTimeErrorMessage('13:00', '');
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    const result = getTimeErrorMessage('', '');
    expect(result).toEqual({
      startTimeError: null,
      endTimeError: null,
    });
  });
});

describe('Edge Cases', () => {
  describe('24시간 형식 경계값', () => {
    it('00:00 (자정) 시간을 올바르게 처리한다', () => {
      const result = getTimeErrorMessage('00:00', '01:00');
      expect(result.startTimeError).toBeNull();
      expect(result.endTimeError).toBeNull();
    });

    it('23:59에서 00:00로 넘어가는 경우를 처리한다', () => {
      // 자정을 넘어가는 일정 (23:59 ~ 00:01)
      // 현재 구현은 같은 날로 처리하므로 에러가 발생할 수 있음
      const result = getTimeErrorMessage('23:59', '00:01');

      // 에러가 발생해야 함 (현재 구현에서는)
      expect(result.startTimeError).not.toBeNull();
    });

    it('마지막 시간(23:59)을 올바르게 처리한다', () => {
      const result = getTimeErrorMessage('22:00', '23:59');
      expect(result.startTimeError).toBeNull();
      expect(result.endTimeError).toBeNull();
    });
  });

  describe('경계 시간 테스트', () => {
    it('1분 차이만 있어도 정상으로 처리한다', () => {
      const result = getTimeErrorMessage('14:00', '14:01');
      expect(result.startTimeError).toBeNull();
      expect(result.endTimeError).toBeNull();
    });

    it('정확히 같은 시간이면 에러가 발생한다', () => {
      const result = getTimeErrorMessage('14:30', '14:30');
      expect(result.startTimeError).not.toBeNull();
      expect(result.endTimeError).not.toBeNull();
    });

    it('1분 이전 시간이면 에러가 발생한다', () => {
      const result = getTimeErrorMessage('14:30', '14:29');
      expect(result.startTimeError).not.toBeNull();
      expect(result.endTimeError).not.toBeNull();
    });
  });

  describe('특수 시간대', () => {
    it('자정 직후 시간을 올바르게 처리한다', () => {
      const result = getTimeErrorMessage('00:01', '00:30');
      expect(result.startTimeError).toBeNull();
      expect(result.endTimeError).toBeNull();
    });

    it('밤 시간대(22:00 - 02:00)를 올바르게 처리한다', () => {
      const result = getTimeErrorMessage('22:00', '02:00');

      // 같은 날 처리 시 에러가 발생해야 함
      expect(result.startTimeError).not.toBeNull();
    });

    it('이른 아침 시간을 올바르게 처리한다', () => {
      const result = getTimeErrorMessage('05:00', '06:00');
      expect(result.startTimeError).toBeNull();
      expect(result.endTimeError).toBeNull();
    });
  });

  describe('긴 시간대', () => {
    it('8시간 일정을 올바르게 처리한다', () => {
      const result = getTimeErrorMessage('09:00', '17:00');
      expect(result.startTimeError).toBeNull();
      expect(result.endTimeError).toBeNull();
    });

    it('12시간 이상 일정을 올바르게 처리한다', () => {
      const result = getTimeErrorMessage('08:00', '20:00');
      expect(result.startTimeError).toBeNull();
      expect(result.endTimeError).toBeNull();
    });
  });
});
