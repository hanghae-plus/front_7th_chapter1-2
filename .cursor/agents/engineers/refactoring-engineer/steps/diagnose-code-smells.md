# Step: 코드 스멜 진단

```xml
<step>
  <purpose>
    구현된 코드를 분석하여 개선이 필요한 부분(코드 스멜)을 찾아냅니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>주요 코드 스멜 체크</do>
      <detail>
        다음 코드 스멜을 확인합니다:
        - 긴 함수 (Long Method): 함수가 50줄 이상, 여러 가지 일을 함
        - 중복 코드 (Duplicated Code): 비슷한 코드가 반복됨
        - 복잡한 조건문 (Complex Conditional): if-else 3단계 이상 중첩
        - 매직 넘버/문자열: 의미 없는 숫자나 문자열이 직접 사용됨
        - 긴 파라미터 목록: 함수가 4개 이상의 파라미터를 받음
        - 큰 파일: 파일이 300줄 이상
      </detail>
    </action>

    <action n="2">
      <do>코드 스멜 기록</do>
      <detail>
        각 코드 스멜을 다음 형식으로 기록합니다:
        - 위치: [파일명:라인]
        - 설명: 무엇이 문제인가?
        - 영향: 왜 문제인가?
        - 개선 방향: 어떻게 개선할 수 있는가?
      </detail>
    </action>

    <action n="3">
      <do>우선순위 결정</do>
      <detail>
        코드 스멜의 우선순위를 정합니다:
        - 높음: 가독성을 크게 해치는 코드, 버그 발생 가능성이 높은 코드
        - 중간: 약간의 중복, 조금 긴 함수, 일부 매직 넘버
        - 낮음: 변수명 개선, 주석 추가, 공백 정리
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>모든 파일을 검토해야 함</constraint>
    <constraint>발견된 코드 스멜을 기록해야 함</constraint>
    <constraint>우선순위를 명확히 해야 함</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 파일이 검토됨</criterion>
    <criterion>발견된 코드 스멜이 기록됨</criterion>
    <criterion>각 코드 스멜의 우선순위가 정해짐</criterion>
    <criterion>개선 방향이 명확함</criterion>
  </success-criteria>
</step>
```
