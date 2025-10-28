# TDD Orchestrator Agent

## 역할
전체 TDD 워크플로우를 관리하고 각 단계별 에이전트를 조율하는 중앙 관리자 역할을 담당합니다.

## 주요 기능

### 1. 워크플로우 관리
- RED → GREEN → REFACTOR 사이클을 순차적으로 실행
- 각 단계별 에이전트 호출 및 결과 검증
- 단계별 커밋 관리

### 2. 에이전트 조율
- Feature Design Agent: 기능 명세 작성
- Test Design Agent: 테스트 설계
- Test Writing Agent: 테스트 코드 작성
- Code Writing Agent: 구현 코드 작성
- Refactoring Agent: 코드 리팩토링

### 3. 품질 관리
- 각 단계별 결과물 검증
- 테스트 통과 여부 확인
- 코드 품질 기준 준수 확인

## 사용법

```bash
# 기본 TDD 사이클 실행
node orchestrator.js --feature="반복 일정 수정"

# 특정 단계만 실행
node orchestrator.js --step="test-design" --feature="반복 일정 수정"

# 커밋 메시지와 함께 실행
node orchestrator.js --feature="반복 일정 수정" --commit-message="feat: 반복 일정 수정 기능 추가"
```

## 설정

### 환경 변수
- `GIT_AUTHOR_NAME`: 커밋 작성자 이름
- `GIT_AUTHOR_EMAIL`: 커밋 작성자 이메일
- `AI_MODEL`: 사용할 AI 모델 (gpt-4, claude-3, etc.)

### 설정 파일
`orchestrator.config.json`에서 세부 설정을 관리합니다.

## 워크플로우 단계

1. **Feature Design**: 기능 명세 작성 및 검증
2. **Test Design**: 테스트 케이스 설계
3. **Test Writing (RED)**: 실패하는 테스트 작성
4. **Code Writing (GREEN)**: 테스트를 통과시키는 최소한의 코드 작성
5. **Refactoring**: 코드 품질 개선
6. **Commit**: 각 단계별 커밋 생성

## 에러 처리

- 각 단계별 실패 시 롤백 기능
- 상세한 로그 기록
- 실패 원인 분석 및 재시도 로직
