# Step: 리팩토링 계획 수립

```xml
<step>
  <purpose>
    진단한 코드 스멜을 바탕으로 어떤 리팩토링 기법을 적용할지 계획합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>리팩토링 기법 선택</do>
      <detail>
        각 코드 스멜에 적합한 리팩토링 기법을 선택합니다:
        - 긴 함수 → Extract Function (함수 추출)
        - 중복 코드 → Extract Function/Variable
        - 매직 넘버/문자열 → Replace Magic Number with Constant
        - 복잡한 조건문 → Decompose Conditional
        - 긴 파라미터 목록 → Introduce Parameter Object
      </detail>
    </action>

    <action n="2">
      <do>리팩토링 순서 계획</do>
      <detail>
        다음 원칙에 따라 순서를 정합니다:
        - 작은 단계로 진행
        - 각 단계마다 테스트 실행
        - 의존성이 적은 것부터 시작

        일반적 순서: 상수 추출 → 헬퍼 함수 추출 → 메인 로직 분리 → 파일 구조 개선
      </detail>
    </action>

    <action n="3">
      <do>리팩토링 계획 문서화</do>
      <detail>
        각 단계를 다음 정보와 함께 문서화합니다:
        - 대상 파일
        - 적용할 기법
        - 예상 시간
        - 리스크 수준
        - 롤백 계획
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>각 코드 스멜에 대한 기법이 선택되어야 함</constraint>
    <constraint>리팩토링 순서가 의존성을 고려해야 함</constraint>
    <constraint>각 단계의 리스크가 평가되어야 함</constraint>
    <constraint>롤백 계획이 수립되어야 함</constraint>
  </constraints>

  <success-criteria>
    <criterion>각 코드 스멜에 대한 리팩토링 기법이 선택됨</criterion>
    <criterion>리팩토링 순서가 정해짐</criterion>
    <criterion>각 단계의 예상 시간과 리스크가 평가됨</criterion>
    <criterion>롤백 계획이 수립됨</criterion>
  </success-criteria>
</step>
```
