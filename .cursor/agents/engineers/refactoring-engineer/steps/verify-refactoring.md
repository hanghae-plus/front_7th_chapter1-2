# Step: 리팩토링 검증

```xml
<step>
  <purpose>
    리팩토링이 완료된 후 모든 테스트가 여전히 통과하는지 확인하고, 코드 품질이 개선되었는지 검토합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>테스트 검증</do>
      <detail>
        전체 테스트를 실행하여 모든 테스트가 통과하는지 확인합니다.
        npm test 명령으로 실행하고, 커버리지도 확인합니다 (npm test -- --coverage).
        리팩토링 전후 커버리지가 유지되거나 향상되어야 합니다.
      </detail>
    </action>

    <action n="2">
      <do>코드 품질 검증</do>
      <detail>
        Before/After를 비교합니다:
        - 메트릭: 파일 수, 최대 함수 길이, 순환 복잡도, 중복 코드, 매직 문자열
        - 구조: 파일 구조가 개선되었는가?
        - 가독성: 코드가 더 읽기 쉬워졌는가?
      </detail>
    </action>

    <action n="3">
      <do>개선 사항 확인</do>
      <detail>
        다음 체크리스트를 확인합니다:
        - 긴 함수가 분리됨
        - 중복 코드가 제거됨
        - 매직 넘버/문자열이 상수화됨
        - 복잡한 조건문이 단순화됨
        - 파일 구조가 개선됨
        - 함수/변수명이 명확함
      </detail>
    </action>

    <action n="4">
      <do>최종 검토</do>
      <detail>
        코드 리뷰 체크리스트를 확인합니다:
        - 모든 테스트가 통과함
        - 기능이 변경되지 않음
        - 코드가 더 읽기 쉬워짐
        - 중복이 제거됨
        - 네이밍이 명확함
        - 커밋 히스토리가 깔끔함
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>모든 테스트가 통과해야 함</constraint>
    <constraint>커버리지가 유지되거나 향상되어야 함</constraint>
    <constraint>코드 메트릭이 개선되어야 함</constraint>
    <constraint>기능이 변경되지 않아야 함</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 테스트가 통과함</criterion>
    <criterion>커버리지가 유지되거나 향상됨</criterion>
    <criterion>코드 메트릭이 개선됨</criterion>
    <criterion>개선 효과가 명확함</criterion>
  </success-criteria>
</step>
```
