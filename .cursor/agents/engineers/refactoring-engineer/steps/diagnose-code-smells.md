# Step: 코드 스멜 진단

```xml
<step>
  <purpose>
    구현된 코드를 분석하여 개선이 필요한 부분(코드 스멜)을 찾아냅니다.
    특히 선언적 사고방식의 부재와 변경하기 어려운 코드 패턴을 식별합니다.
  </purpose>

  <principles>
    <principle>
      <name>선언적 vs 절차적 사고 구분</name>
      <description>
        코드가 "어떻게(How)"가 아닌 "무엇을(What)"에 집중하는지 확인합니다.
        시간적 순서가 아닌 논리적 관계로 표현되었는지 평가합니다.
      </description>
      <reference>https://evan-moon.github.io/2025/09/07/declarative-programming-misconceptions-and-essence/</reference>
    </principle>
    <principle>
      <name>변경 용이성</name>
      <description>
        코드가 요구사항 변경에 얼마나 쉽게 대응할 수 있는지 평가합니다.
        새로운 기능 추가 시 기존 코드 수정이 최소화되는지 확인합니다.
      </description>
      <reference>https://frontend-fundamentals.com/code-quality/</reference>
    </principle>
  </principles>

  <how-to>
    <action n="1">
      <do>선언적 사고 부재 진단</do>
      <detail>
        다음 절차적 사고 패턴을 확인합니다:

        [높은 우선순위]
        - 절차적 추상화: 단순히 절차를 함수로 감싼 경우
          예: function getUserInfo() { step1(); step2(); step3(); }

        - 상태 변화 중심 로직: 상태를 여러 단계로 변경하는 패턴
          예: let result = initial; if (cond1) result = ...; if (cond2) result = ...;

        - 시간적 순서 의존성: 실행 순서에 강하게 의존하는 로직
          예: 먼저 A를 하고, 그 다음 B를 하고...

        - 숨겨진 부수효과: 함수가 예상치 못한 외부 상태를 변경
          예: function format(user) { cache.set(...); return formatted; }

        [개선 방향]
        → 데이터 변환 관계로 재표현
        → 상태 관계를 명시적으로 선언
        → 함수 합성/파이프라인 활용
      </detail>
    </action>

    <action n="2">
      <do>변경 용이성 진단</do>
      <detail>
        다음 변경하기 어려운 패턴을 확인합니다:

        [높은 우선순위]
        - 산탄총 수술(Shotgun Surgery): 하나의 변경이 여러 곳 수정 유발
        - 뒤엉킨 변경(Divergent Change): 하나의 클래스/함수가 여러 이유로 변경됨
        - 기능 편애(Feature Envy): 다른 모듈의 데이터에 과도하게 의존
        - 긴 파라미터 목록: 함수가 4개 이상의 파라미터를 받음
        - 데이터 덩어리: 항상 함께 다니는 데이터들이 객체로 묶이지 않음

        [중간 우선순위]
        - 긴 함수: 50줄 이상, 여러 추상화 레벨 혼재
        - 큰 클래스/파일: 300줄 이상, 여러 책임 담당
        - 중복 코드: 비슷한 로직이 여러 곳에 반복

        [개선 방향]
        → 관심사 분리 (Separation of Concerns)
        → 단일 책임 원칙 (Single Responsibility)
        → 적절한 추상화 레벨 유지
      </detail>
    </action>

    <action n="3">
      <do>잘못된 추상화 진단</do>
      <detail>
        선언적이라고 착각하기 쉬운 패턴을 확인합니다:

        - 단순 문법 사용 착각: map/filter 사용했다고 무조건 선언적이 아님
          예: items.map(item => { 여러 줄의 절차적 로직 })

        - 과도한 추상화: 불필요하게 복잡한 추상화 레이어
          예: SimpleFactory, AbstractFactoryFactory...

        - 조기 추상화: 아직 패턴이 명확하지 않은 상태에서의 추상화
          예: 한 곳에서만 쓰이는 "재사용 가능한" 유틸

        - 부적절한 추상화 레벨: 비즈니스 로직에 인프라 상세 노출
          예: 컴포넌트에서 직접 API 호출 로직 구현

        [개선 방향]
        → 각 레벨에 적합한 추상화 적용
        → 비즈니스 의도가 코드에서 직접 읽히도록
        → 기술적 복잡성은 적절한 계층 뒤로 숨김
      </detail>
    </action>

    <action n="4">
      <do>전통적 코드 스멜 체크</do>
      <detail>
        기본적인 코드 품질 문제를 확인합니다:

        - 매직 넘버/문자열: 의미가 불명확한 리터럴 값
        - 복잡한 조건문: if-else 3단계 이상 중첩
        - 주석으로 설명이 필요한 코드: 코드 자체가 의도를 드러내지 못함
        - 긴 표현식: 한 줄에 여러 연산이 중첩
        - 불명확한 네이밍: 의미를 파악하기 어려운 변수/함수명
      </detail>
    </action>

    <action n="5">
      <do>코드 스멜 기록 및 우선순위 결정</do>
      <detail>
        각 코드 스멜을 다음 형식으로 기록합니다:

        - 위치: [파일명:라인]
        - 카테고리: [선언적 사고 부재 / 변경 용이성 / 잘못된 추상화 / 기본 품질]
        - 설명: 무엇이 문제인가?
        - 영향: 왜 문제인가? (가독성, 유지보수성, 확장성 관점)
        - 개선 방향: 어떻게 개선할 수 있는가?
        - 우선순위: [높음 / 중간 / 낮음]

        우선순위 기준:
        - 높음: 비즈니스 로직 이해를 크게 방해, 변경 시 연쇄 수정 발생
        - 중간: 부분적 가독성 저하, 일부 중복/복잡도 증가
        - 낮음: 변수명 개선, 포매팅, 사소한 리팩토링
      </detail>
    </action>
  </how-to>

  <examples>
    <example type="절차적 사고">
      <before>
        // ❌ 절차적: 시간적 순서에 집중
        function processUser(userId) {
          const user = fetchUser(userId);
          const permissions = fetchPermissions(userId);
          user.permissions = permissions;
          if (user.name) user.displayName = user.name.toUpperCase();
          return user;
        }
      </before>
      <after>
        // ✅ 선언적: 데이터 변환 관계에 집중
        function processUser(userId) {
          const user = fetchUserData(userId)
            .then(enrichWithPermissions)
            .then(normalizeDisplayFields);

          return user;
        }
      </after>
    </example>

    <example type="잘못된 추상화">
      <before>
        // ❌ 배열 메소드를 썼지만 절차적
        items.map(item => {
          let price = item.basePrice;
          if (item.discount) price = price * (1 - item.discount);
          price = price * 1.1;
          return { ...item, finalPrice: price };
        })
      </before>
      <after>
        // ✅ 각 변환이 비즈니스 관계를 명확히 표현
        items
          .map(applyDiscount)
          .map(addTax)
          .map(formatPrice)
      </after>
    </example>
  </examples>

  <constraints>
    <constraint>모든 파일을 선언적 사고 관점에서 검토해야 함</constraint>
    <constraint>발견된 코드 스멜을 카테고리별로 분류해야 함</constraint>
    <constraint>우선순위를 변경 영향도 기반으로 결정해야 함</constraint>
    <constraint>개선 방향이 구체적이고 실행 가능해야 함</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 파일이 선언적 사고 관점에서 검토됨</criterion>
    <criterion>발견된 코드 스멜이 카테고리별로 기록됨</criterion>
    <criterion>각 코드 스멜의 우선순위가 영향도 기반으로 정해짐</criterion>
    <criterion>개선 방향이 구체적이고 실행 가능함</criterion>
    <criterion>비즈니스 로직과 기술 구현이 적절히 분리될 수 있음</criterion>
  </success-criteria>
</step>
```
