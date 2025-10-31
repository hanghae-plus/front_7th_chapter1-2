# 코드 품질 규칙 (Code Quality Rules)

모든 TDD 에이전트(red-test-writer, green-implementer, refactor-engineer)가 **반드시** 준수해야 하는 코드 품질 검증 규칙입니다.

## 필수 검증 항목

### 1. 린트 검사 (Lint Check) ⭐ 필수

**언제**: 모든 코드 작성/수정 후

**실행 명령어**:
```bash
pnpm run lint
```

**규칙**:
- ✅ 린트 검사를 **반드시** 실행해야 함
- ✅ 린트 오류가 발생하면 **반드시** 수정해야 함
- ✅ 린트가 통과할 때까지 **반복**해야 함
- ❌ 린트 오류를 무시하고 진행 **절대 금지**

**실패 시 조치**:
1. 오류 메시지 확인
2. 해당 파일 수정
3. `pnpm run lint` 재실행
4. 통과 확인 후 다음 단계로

### 2. 타입 검사 (Type Check)

**포함**: `pnpm run lint`에 이미 포함됨 (lint:tsc)

**규칙**:
- TypeScript 타입 오류 0개
- any 타입 최소화
- 명시적 타입 선언

## 에이전트별 적용 시점

### RED 에이전트 (red-test-writer)

**적용 시점**: 테스트 작성 후

```markdown
Phase 1 작업 순서:
1. 테스트 코드 작성
2. 테스트 실행 (의도적 실패 확인)
3. **린트 검사 실행** ⭐
4. 린트 오류 수정
5. 문서 업데이트
```

### GREEN 에이전트 (green-implementer)

**적용 시점**: 구현 완료 후, 문서 작성 전

```markdown
Phase 1 작업 순서:
1. 최소 구현 작성
2. 해당 테스트 실행 (통과 확인)
3. 전체 테스트 실행 (회귀 없음 확인)
4. **린트 검사 실행** ⭐
5. 린트 오류 수정
6. 문서 업데이트
```

### REFACTOR 에이전트 (refactor-engineer)

**적용 시점**: 각 리팩토링마다

```markdown
Phase 2 작업 순서 (반복):
1. 리팩토링 선택
2. 리팩토링 적용
3. 테스트 실행
4. **린트 검사 실행** ⭐
5. 린트 오류 수정
6. 변경사항 기록
7. 다음 리팩토링으로
```

## 체크리스트

모든 에이전트는 다음 체크리스트를 **반드시** 확인해야 합니다:

### 코드 품질 검증

- [ ] `pnpm run lint` 실행 완료
- [ ] 린트 오류 0개 확인
- [ ] 타입 오류 0개 확인
- [ ] 린트 통과 후 다음 단계 진행

### 린트 실패 시

- [ ] 오류 메시지 확인
- [ ] 해당 파일 수정
- [ ] 재실행 및 통과 확인
- [ ] 린트 오류 무시 **절대 안함**

## 일반적인 린트 오류 및 해결 방법

### 1. ESLint 오류

**오류**: `'변수명' is defined but never used`
**해결**: 사용하지 않는 변수 제거 또는 `_변수명`으로 변경

**오류**: `Missing return type on function`
**해결**: 함수 반환 타입 명시

### 2. TypeScript 오류

**오류**: `Type 'any' is not assignable to type 'string'`
**해결**: 명시적 타입 지정

**오류**: `Property '속성명' does not exist on type`
**해결**: 타입 정의 추가 또는 옵셔널 체이닝 사용

### 3. 포맷팅 오류

**오류**: `Delete '␍'` (CRLF line endings)
**해결**: LF line endings로 변경

**오류**: `Insert ';'`
**해결**: 세미콜론 추가

## 린트 검사 예시

### 성공 케이스

```bash
$ pnpm run lint

> assignment@0.0.0 lint
> pnpm run lint:eslint && pnpm run lint:tsc

> assignment@0.0.0 lint:eslint
> eslint .

> assignment@0.0.0 lint:tsc
> tsc --noEmit

✅ 린트 검사 통과
```

### 실패 케이스

```bash
$ pnpm run lint

> assignment@0.0.0 lint:eslint
> eslint .

/path/to/file.ts
  10:7  error  'unusedVar' is defined but never used  @typescript-eslint/no-unused-vars

❌ 1 problem (1 error, 0 warnings)

❌ 린트 검사 실패 - 수정 필요
```

## 중요 원칙

### ✅ 해야 할 것

1. **모든 작업 후 린트 검사**
2. **오류 발생 시 즉시 수정**
3. **통과 확인 후 진행**

### ❌ 하지 말아야 할 것

1. **린트 검사 건너뛰기**
2. **오류 무시하고 진행**
3. **나중에 수정하겠다고 미루기**

## 참조

이 문서는 다음 에이전트들이 참조해야 합니다:
- `.claude/agents/red-test-writer.md`
- `.claude/agents/green-implementer.md`
- `.claude/agents/refactor-engineer.md`

모든 에이전트는 작업 시작 시 이 문서를 읽고 규칙을 준수해야 합니다.
