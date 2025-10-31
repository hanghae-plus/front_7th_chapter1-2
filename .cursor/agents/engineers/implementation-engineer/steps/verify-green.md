# Step: GREEN 상태 확인

```xml
<step>
  <purpose>
    테스트를 실행하여 모든 테스트가 통과(GREEN)하는지 확인합니다.
  </purpose>

  <how-to>
    <action n="1">
      <do>테스트 실행</do>
      <detail>
        npm test 명령으로 테스트를 실행합니다.
      </detail>
    </action>

    <action n="2">
      <do>통과 확인</do>
      <detail>
        모든 테스트가 통과하는지 확인합니다.
        실패하는 테스트가 있다면 다음 단계로 진행합니다.
      </detail>
    </action>

    <action n="3">
      <do>실패 케이스 처리</do>
      <detail>
        실패하는 테스트가 있다면:
        1. 실패 원인 파악
        2. 코드 검토
        3. 수정
        4. 재실행
        이 과정을 모든 테스트가 통과할 때까지 반복합니다.
      </detail>
    </action>

    <action n="4">
      <do>커버리지 확인 (선택사항)</do>
      <detail>
        npm test -- --coverage 명령으로 커버리지를 확인합니다.
        목표: Statements, Branches, Functions, Lines 모두 80% 이상
      </detail>
    </action>
  </how-to>

  <constraints>
    <constraint>모든 테스트가 통과해야 함</constraint>
    <constraint>실패하는 테스트가 없어야 함</constraint>
    <constraint>테스트 실행 시간이 합리적이어야 함 (< 5초)</constraint>
  </constraints>

  <success-criteria>
    <criterion>모든 테스트가 통과(GREEN)</criterion>
    <criterion>테스트 실행 시간이 합리적</criterion>
    <criterion>커버리지가 목표치 이상 (선택사항)</criterion>
  </success-criteria>
</step>
```
