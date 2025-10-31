// Integration test file to ensure all recurring utils test modules are included

import './recurring/repeatTypes.spec';
import './recurring/validators.spec';
import './recurring/dateCalculations.spec';
import './recurring/endConditions.spec';
import './recurring/recurringSelector.spec';

describe('Recurring Utils Integration Tests', () => {
  it('모든 recurring utils 테스트 모듈이 정상적으로 로드되었는지 확인', () => {
    expect(true).toBe(true);
  });
});
