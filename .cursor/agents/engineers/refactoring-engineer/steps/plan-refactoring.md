# Step: 리팩토링 계획 수립

```xml
<step>
  <purpose>
    진단한 코드 스멜을 바탕으로 선언적 사고방식으로 코드를 개선하는 계획을 수립합니다.
    절차적 코드를 관계 중심 코드로 전환하고, 비즈니스 의도가 명확히 드러나도록 합니다.
  </purpose>

  <principles>
    <principle>
      <name>추상화 레벨 일관성</name>
      <description>
        각 함수/모듈이 일관된 추상화 레벨을 유지하도록 계획합니다.
        비즈니스 로직 레벨에서는 선언적으로, 인프라 레벨에서는 필요시 절차적으로 작성합니다.
      </description>
    </principle>
    <principle>
      <name>관계 중심 설계</name>
      <description>
        시간적 순서가 아닌 데이터 변환 관계를 중심으로 코드를 재구성합니다.
        "A를 하고 B를 한다"가 아닌 "A와 B의 관계"로 표현합니다.
      </description>
    </principle>
    <principle>
      <name>의도 표현 우선</name>
      <description>
        코드가 "무엇을" 하는지 비즈니스 의도가 직접 읽히도록 개선합니다.
        기술적 "어떻게"는 적절한 추상화 뒤로 숨깁니다.
      </description>
    </principle>
  </principles>

  <how-to>
    <action n="1">
      <do>선언적 변환 전략 수립</do>
      <detail>
        절차적 패턴을 선언적으로 전환하는 전략을 선택합니다:

        [절차적 추상화 → 관계 기반 합성]
        - Before: function process() { step1(); step2(); step3(); }
        - Strategy: 데이터 변환 파이프라인으로 재표현
        - After: pipe(transform1, transform2, transform3)(data)

        [상태 변화 중심 → 상태 관계 선언]
        - Before: let result = init; if (A) result = x; if (B) result = y;
        - Strategy: 조건별 상태 매핑 함수 추출
        - After: const result = determineState(conditions)

        [시간적 순서 의존 → 독립적 변환]
        - Before: 순차적으로 의존하는 여러 단계
        - Strategy: 각 변환을 독립적 순수 함수로 분리
        - After: 각 함수가 입력만으로 출력 결정

        [복잡한 조건 로직 → 상태 모델링]
        - Before: 여러 if-else로 복잡하게 분기
        - Strategy: 가능한 상태를 명시적 타입으로 선언
        - After: type State = A | B | C; switch (state.type)
      </detail>
    </action>

    <action n="2">
      <do>추상화 레벨 분리 계획</do>
      <detail>
        코드를 적절한 추상화 레벨로 분리하는 계획을 수립합니다:

        [비즈니스 로직 레벨] - 선언적 접근
        - 도메인 개념을 직접 표현하는 함수명
        - 비즈니스 규칙이 코드 구조에서 읽힘
        - 예: validateUser, calculateTotalPrice, applyDiscount

        [데이터 변환 레벨] - 선언적 접근
        - 입력 → 출력 관계 명시
        - 부수효과 없는 순수 함수
        - 예: mapToDTO, enrichWithMetadata, normalizeData

        [인프라/최적화 레벨] - 절차적 허용
        - 성능 최적화가 필요한 계산
        - 복잡한 상태 관리
        - 예: cacheManager, retryWithBackoff, batchProcessor

        분리 원칙:
        1. 상위 레벨에서 하위 레벨 함수 사용은 OK
        2. 하위 레벨에서 상위 레벨 참조는 NO
        3. 같은 레벨 내에서는 일관된 스타일 유지
      </detail>
    </action>

    <action n="3">
      <do>전통적 리팩토링 기법 선택</do>
      <detail>
        기본적인 리팩토링 기법을 선택합니다:

        [코드 정리]
        - 매직 넘버/문자열 → Replace with Named Constant
        - 긴 함수 → Extract Function (의미 단위로)
        - 중복 코드 → Extract Shared Logic
        - 긴 파라미터 → Introduce Parameter Object

        [구조 개선]
        - 복잡한 조건 → Replace Conditional with Polymorphism/Strategy
        - 데이터 덩어리 → Create Value Object
        - 기능 편애 → Move Method to Appropriate Module
        - 큰 파일 → Split by Concern/Responsibility

        [패턴 적용]
        - 반복되는 변환 → Compose with Higher-Order Functions
        - 조건별 동작 → Strategy Pattern / Lookup Table
        - 상태 관리 → State Machine / Reducer Pattern
      </detail>
    </action>

    <action n="4">
      <do>리팩토링 순서 및 단계 계획</do>
      <detail>
        다음 원칙에 따라 순서를 정합니다:

        [1단계: 기반 정리]
        - 상수 추출 (매직 넘버/문자열)
        - 타입 정의 명확화
        - 의존성 정리

        [2단계: 함수 분리]
        - 큰 함수를 의미 단위로 분리
        - 각 함수의 추상화 레벨 일관성 확보
        - 순수 함수와 부수효과 분리

        [3단계: 선언적 변환]
        - 절차적 로직을 관계 기반으로 재작성
        - 데이터 변환 파이프라인 구성
        - 비즈니스 의도가 드러나는 함수명 사용

        [4단계: 구조 개선]
        - 모듈/파일 분리
        - 디렉토리 구조 정리
        - 순환 의존성 제거

        [5단계: 최종 검증]
        - 모든 테스트 통과 확인
        - 코드 리뷰 및 품질 검증
        - 문서화

        각 단계마다:
        - 작은 단위로 커밋
        - 테스트 실행하여 GREEN 유지
        - 문제 발생 시 즉시 롤백 가능하도록
      </detail>
    </action>

    <action n="5">
      <do>리팩토링 계획 문서화</do>
      <detail>
        각 단계를 다음 정보와 함께 문서화합니다:

        | 단계 | 대상 | 현재 문제 | 적용 기법 | 개선 후 | 리스크 | 시간 |
        |------|------|-----------|-----------|---------|--------|------|
        | 1-1  | App.tsx:189 | console.log 제거 안됨 | Remove Debug Code | 디버그 코드 제거 | 낮음 | 1분 |
        | 1-2  | App.tsx:243-272 | 절차적 save 호출 | Add Silent Option | silent 옵션 추가 | 중간 | 10분 |
        | 2-1  | App.tsx:228-279 | 긴 단일 수정 로직 | Extract Function | extractSingleEdit() | 중간 | 15분 |
        | 3-1  | App.tsx | 하드코딩된 상수 | Extract Constants | constants.ts | 낮음 | 5분 |

        롤백 계획:
        - Git commit을 단계별로 생성
        - 각 단계 후 테스트 실패 시 즉시 `git reset --hard HEAD~1`
        - 중요 변경 전 브랜치 생성
      </detail>
    </action>
  </how-to>

  <examples>
    <example type="선언적 변환 계획">
      <before>
        // 절차적: 여러 단계로 사용자 처리
        function processUser(userId) {
          const user = db.getUser(userId);
          const perms = db.getPermissions(userId);
          user.permissions = perms;
          if (user.status === 'active') {
            user.displayName = user.name.toUpperCase();
          }
          return user;
        }
      </before>
      <strategy>
        1. 데이터 변환 함수 분리
        2. 조건 로직을 별도 변환으로 추출
        3. 파이프라인으로 합성
      </strategy>
      <after>
        // 선언적: 데이터 변환 관계로 표현
        const processUser = (userId) =>
          pipe(
            fetchUserData,
            enrichWithPermissions,
            normalizeForDisplay
          )(userId);

        const normalizeForDisplay = (user) =>
          user.status === 'active'
            ? { ...user, displayName: user.name.toUpperCase() }
            : user;
      </after>
    </example>

    <example type="추상화 레벨 분리">
      <before>
        // 비즈니스 로직과 API 호출이 섞임
        async function getOrderSummary(orderId) {
          const res = await fetch(`/api/orders/${orderId}`);
          const order = await res.json();
          let total = 0;
          for (const item of order.items) {
            total += item.price * item.quantity;
          }
          return { ...order, total };
        }
      </before>
      <strategy>
        1. API 호출을 별도 레이어로 분리
        2. 계산 로직을 순수 함수로 추출
        3. 비즈니스 로직에서 조합
      </strategy>
      <after>
        // 비즈니스 레벨: 선언적
        const getOrderSummary = async (orderId) => {
          const order = await fetchOrder(orderId);
          return enrichWithTotal(order);
        };

        // 데이터 레벨: 선언적
        const enrichWithTotal = (order) => ({
          ...order,
          total: calculateOrderTotal(order.items)
        });

        // 계산 레벨: 절차적 허용 (성능)
        function calculateOrderTotal(items) {
          let total = 0;
          for (const item of items) {
            total += item.price * item.quantity;
          }
          return total;
        }

        // 인프라 레벨
        const fetchOrder = (orderId) =>
          fetch(`/api/orders/${orderId}`).then(r => r.json());
      </after>
    </example>
  </examples>

  <constraints>
    <constraint>각 코드 스멜에 대한 선언적 변환 전략이 수립되어야 함</constraint>
    <constraint>추상화 레벨이 명확히 분리되어야 함</constraint>
    <constraint>리팩토링 순서가 의존성과 리스크를 고려해야 함</constraint>
    <constraint>각 단계가 테스트 가능하고 롤백 가능해야 함</constraint>
    <constraint>비즈니스 의도가 코드에서 직접 읽힐 수 있어야 함</constraint>
  </constraints>

  <success-criteria>
    <criterion>절차적 패턴이 선언적으로 전환될 계획이 수립됨</criterion>
    <criterion>각 추상화 레벨이 명확히 정의되고 분리됨</criterion>
    <criterion>리팩토링 순서와 단계가 구체적으로 정해짐</criterion>
    <criterion>각 단계의 예상 시간과 리스크가 평가됨</criterion>
    <criterion>롤백 계획이 수립됨</criterion>
    <criterion>최종 코드에서 비즈니스 의도가 명확히 드러날 것으로 예상됨</criterion>
  </success-criteria>
</step>
```
