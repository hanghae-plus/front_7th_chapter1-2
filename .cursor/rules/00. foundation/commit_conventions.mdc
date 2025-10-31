# Commit Convention Rule

## 목적
- 커밋 메시지를 표준화하여 변경 내역 추적과 자동화 도구 연동을 용이하게 한다.
- TDD 사이클 단계별 이력을 명확히 구분한다.

## 형식
Conventional Commits 포맷을 기본으로 하되, TDD 단계를 `scope` 로 표현한다.

```
<type>(<scope>): <subject>

<body>

<footer>
```

### type
- `feat`: 사용자 기능 추가
- `fix`: 버그 수정
- `test`: 테스트 코드 추가/수정
- `refactor`: 기능 변화 없이 구조 개선
- `chore`: 빌드, 설정, 의존성, 문서
- `revert`: 이전 커밋 되돌리기

### scope
- `td-design`, `td-red`, `td-verification`, `td-green`, `td-refactor`, `td-wrap` 등 TDD 단계 명시
- 공통 작업은 `core`, 문서 작업은 `docs`

### subject
- 50자 이내, 소문자로 시작, 마침표 금지
- 변경 결과(무엇을 했는가)를 명확하게 기술

## 본문/푸터
- 필요한 경우 72자 폭으로 줄바꿈, 변경 이유와 영향을 작성한다.
- 브레이킹 변경은 `BREAKING CHANGE: <내용>` 을 푸터에 추가한다.
- 관련 이슈는 `Refs: #123` 형식으로 명시.

## 커밋 단위
- 하나의 커밋에는 하나의 TDD 단계 작업만 포함한다.
- 테스트가 실패 상태(RED)인 커밋은 테스트 코드만 포함하며, 구현을 섞지 않는다.
- Green 단계 커밋은 테스트가 통과하는지 확인한 후 푸시한다.

## self-check
- 커밋 전 `pnpm test` 등을 실행해 테스트 상태를 검증한다.
- 커밋 메시지가 type/scope 규칙을 충족하는지 확인한다.
- 여러 파일이 섞인 작업은 interactive staging으로 분리한다.
