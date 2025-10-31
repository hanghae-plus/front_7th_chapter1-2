# Step: 리팩토링 실행

```xml
<step>
  <purpose>
    계획한 리팩토링을 단계적으로 실행하며, 각 단계마다 테스트를 통해 기능이 깨지지 않았는지 확인합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>Red-Green-Refactor 사이클 유지</do>
      <detail>
        현재 상태가 GREEN (모든 테스트 통과)임을 확인하고:
        1. 리팩토링 실행
        2. 테스트 실행: GREEN 유지 확인
        3. 다음 리팩토링
        이 사이클을 반복합니다.
      </detail>
    </action>

    <action n="2">
      <do>한 번에 하나씩 실행</do>
      <detail>
        다음 원칙을 따릅니다:
        - 한 번에 하나의 리팩토링만 수행
        - 여러 변경을 섞지 않음
        - 각 변경 후 테스트 실행
        - 각 변경 후 커밋
      </detail>
    </action>

    <action n="3">
      <do>단계별 실행</do>
      <detail>
        계획한 순서대로 실행합니다:
        1. 상수 추출 → 테스트 → 커밋
        2. 함수 추출 → 테스트 → 커밋
        3. 파일 분리 → 테스트 → 커밋
        각 단계가 독립적으로 의미 있어야 합니다.
      </detail>
    </action>

    <action n="4">
      <do>문제 발생 시 대응</do>
      <detail>
        테스트 실패 시: 변경 사항 검토, 수정, 재실행, 여전히 실패하면 롤백
        컴파일 에러 시: import 경로, 파일명, export/import 구문 확인
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>각 단계마다 테스트가 통과해야 함</constraint>
    <constraint>각 단계가 커밋되어야 함</constraint>
    <constraint>기능이 변경되지 않아야 함</constraint>
    <constraint>한 번에 하나의 리팩토링만 수행할 것</constraint>
  </constraints>

  <success-criteria>
    <criterion>계획한 모든 리팩토링이 완료됨</criterion>
    <criterion>각 단계마다 테스트가 통과함</criterion>
    <criterion>각 단계가 커밋됨</criterion>
    <criterion>기능이 변경되지 않음</criterion>
  </success-criteria>
</step>
```
