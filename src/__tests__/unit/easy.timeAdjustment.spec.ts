import { adjustEndTime } from '../../utils/timeValidation';
/**
 * 시간 자동 조정 로직 테스트
 *
 * User Story: us001-recurring-event-selection.md
 * Acceptance Criteria: Scenario 7
 */
describe('timeAdjustment', () => {
  describe('adjustEndTime', () => {
    it('endTime이 startTime보다 늦으면 변경하지 않는다', () => {
      const startTime = '14:00';
      const endTime = '15:00';
      expect(adjustEndTime(startTime, endTime)).toBe('15:00');
    });

    it('endTime이 startTime과 같으면 startTime+1h로 조정한다', () => {
      const startTime = '14:00';
      const endTime = '14:00';
      expect(adjustEndTime(startTime, endTime)).toBe('15:00');
    });

    it('endTime이 startTime보다 이전이면 startTime+1h로 조정한다', () => {
      const startTime = '14:00';
      const endTime = '13:30';
      expect(adjustEndTime(startTime, endTime)).toBe('15:00');
    });

    it('23:00 이후 시간 처리 (자정 넘김)', () => {
      const startTime = '23:30';
      const endTime = '23:30';
      expect(adjustEndTime(startTime, endTime)).toBe('00:30');
    });
  });
});
