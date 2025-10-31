import './events/converts/parseDateTime.spec';
import './events/converts/convertEventToDateRange.spec';
import './events/overlaps/findOverlappingEvents.spec';
import './events/overlaps/isOverlapping.spec';

describe('eventUtils Integration Tests', () => {
  it('모든 eventUtils 테스트 모듈이 정상적으로 로드되었는지 확인', () => {
    expect(true).toBe(true);
  });
});
