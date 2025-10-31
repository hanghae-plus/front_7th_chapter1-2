import './integration/notificationTime.spec';
import './integration/eventCRUD.spec';
import './integration/eventOverlap.spec';
import './integration/eventView.spec';
import './integration/searchFeatures.spec';

describe('Integration Tests', () => {
  it('모든 Integration 테스트 모듈이 정상적으로 로드되었는지 확인', () => {
    expect(true).toBe(true);
  });
});
