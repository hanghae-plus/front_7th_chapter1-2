# AI Agent 사용 가이드

## 📖 개요

이 문서는 개선된 AI Agent들의 사용법과 워크플로우에 대한 상세한 가이드입니다.

## 🏗️ Agent 아키텍처

### 계층 구조
```
agents/
├── core/           # 핵심 Agent들 (검증된 기능)
├── improved/       # 개선된 Agent들 (최신 기능)
└── legacy/         # 기존 Agent들 (참고용)
```

### Agent 역할 분담
- **Core Agents**: 검증된 핵심 기능
- **Improved Agents**: 최신 개선사항이 적용된 Agent들
- **Legacy Agents**: 기존 버전 (호환성 유지)

## 🚀 개선된 Agent 사용법

### 1. Test Writing Agent

#### 기본 사용법
```bash
node agents/improved/improved-test-writing-agent.js \
  --testDesign "테스트 설계 내용" \
  --featureSpec "기능 명세 내용" \
  --output "생성할 테스트 파일 경로"
```

#### 예제
```bash
node agents/improved/improved-test-writing-agent.js \
  --testDesign "# 이벤트 알림 관리 기능

## 주요 시나리오

### 시나리오 1: 알림 설정
- Given: 사용자가 이벤트를 생성하거나 수정할 때
- When: 알림 시간을 30분으로 설정
- Then: 이벤트 시작 30분 전에 알림이 표시됨

### 시나리오 2: 알림 해제
- Given: 사용자가 이벤트 알림을 해제하고 싶을 때
- When: 알림 해제 버튼을 클릭
- Then: 해당 이벤트의 알림이 취소됨" \
  --featureSpec "# 이벤트 알림 관리 기능

## API 설계
- POST /api/notifications/schedule - 알림 스케줄링
- DELETE /api/notifications/:id - 알림 취소" \
  --output "src/__tests__/hooks/useEventNotification.spec.ts"
```

#### 생성되는 테스트 코드 특징
- ✅ 공식 문서 기반 구조
- ✅ MSW 핸들러 자동 생성
- ✅ Given-When-Then 패턴 적용
- ✅ TypeScript 타입 안전성
- ✅ 완전한 테스트 케이스

### 2. Code Writing Agent

#### 기본 사용법
```bash
node agents/improved/improved-code-writing-agent.js \
  --testCode "테스트 코드 내용" \
  --featureSpec "기능 명세 내용" \
  --output "생성할 구현 파일 경로"
```

#### 예제
```bash
node agents/improved/improved-code-writing-agent.js \
  --testCode "describe('useEventNotification', () => {
  it('알림 설정 - 정상 처리', async () => {
    const { result } = renderHook(() => useEventNotification());
    await act(async () => {
      await result.current.scheduleNotification('test-id', { title: 'test-title' });
    });
    expect(result.current.loading).toBe(false);
  });
});" \
  --featureSpec "# 이벤트 알림 관리 기능

## API 설계
- POST /api/notifications/schedule - 알림 스케줄링
- DELETE /api/notifications/:id - 알림 취소" \
  --output "src/hooks/useEventNotification.ts"
```

#### 생성되는 구현 코드 특징
- ✅ 테스트 기반 구현
- ✅ TypeScript 인터페이스 자동 생성
- ✅ React Hook 패턴 적용
- ✅ 완전한 에러 처리
- ✅ 사용자 피드백 통합

### 3. Refactoring Agent

#### 기본 사용법
```bash
node agents/improved/improved-refactoring-agent.js \
  --file "리팩토링할 파일 경로" \
  [--optimize] \
  [--dry-run]
```

#### 옵션 설명
- `--file`: 리팩토링할 파일 경로 (필수)
- `--optimize`: 성능 최적화 적용 (선택)
- `--dry-run`: 실제 변경 없이 분석만 수행 (선택)

#### 예제
```bash
# 기본 리팩토링
node agents/improved/improved-refactoring-agent.js \
  --file "src/hooks/useEventNotification.ts"

# 성능 최적화 포함
node agents/improved/improved-refactoring-agent.js \
  --file "src/hooks/useEventNotification.ts" \
  --optimize

# 분석만 수행 (변경하지 않음)
node agents/improved/improved-refactoring-agent.js \
  --file "src/hooks/useEventNotification.ts" \
  --dry-run
```

#### 리팩토링 기능
- ✅ 중복 코드 제거
- ✅ 긴 함수 분할
- ✅ 중복 import 정리
- ✅ 사용하지 않는 변수 제거
- ✅ 매직 넘버 상수화
- ✅ 성능 최적화 (useCallback, useMemo)

## 🔄 완전한 TDD 워크플로우

### 1단계: 기능 명세 작성
```markdown
# 이벤트 알림 관리 기능

## 주요 시나리오
### 시나리오 1: 알림 설정
- Given: 사용자가 이벤트를 생성하거나 수정할 때
- When: 알림 시간을 30분으로 설정
- Then: 이벤트 시작 30분 전에 알림이 표시됨

## API 설계
- POST /api/notifications/schedule - 알림 스케줄링
- DELETE /api/notifications/:id - 알림 취소
```

### 2단계: 테스트 코드 생성
```bash
node agents/improved/improved-test-writing-agent.js \
  --testDesign "위의 명세 내용" \
  --featureSpec "위의 명세 내용" \
  --output "src/__tests__/hooks/useEventNotification.spec.ts"
```

### 3단계: 구현 코드 생성
```bash
node agents/improved/improved-code-writing-agent.js \
  --testCode "생성된 테스트 코드" \
  --featureSpec "위의 명세 내용" \
  --output "src/hooks/useEventNotification.ts"
```

### 4단계: 코드 리팩토링
```bash
node agents/improved/improved-refactoring-agent.js \
  --file "src/hooks/useEventNotification.ts" \
  --optimize
```

### 5단계: 테스트 실행 및 검증
```bash
npm test src/__tests__/hooks/useEventNotification.spec.ts
```

## 📚 공식 문서 참조

### 테스트 작성 가이드라인
- **파일**: `docs/guidelines/testing-guidelines.md`
- **내용**: 완전한 테스트 작성 표준
- **활용**: Test Writing Agent가 자동으로 참조

### 테스트 작성 규칙
- **파일**: `docs/guidelines/test-writing-rules.md`
- **내용**: 테스트 작성 규칙 및 패턴
- **활용**: 일관된 테스트 품질 보장

## 🛠️ 고급 사용법

### 1. 커스텀 패턴 적용
Agent들은 공식 문서를 기반으로 작동하므로, 프로젝트별 맞춤형 패턴을 적용하려면 `docs/guidelines/` 디렉토리의 문서를 수정하면 됩니다.

### 2. 배치 처리
여러 기능을 한 번에 처리하려면 스크립트를 작성하여 Agent들을 순차적으로 호출할 수 있습니다.

```bash
#!/bin/bash
# batch-process.sh

FEATURE_SPEC="이벤트 알림 관리 기능 명세"

# 1. 테스트 생성
node agents/improved/improved-test-writing-agent.js \
  --testDesign "$FEATURE_SPEC" \
  --featureSpec "$FEATURE_SPEC" \
  --output "src/__tests__/hooks/useEventNotification.spec.ts"

# 2. 구현 생성
node agents/improved/improved-code-writing-agent.js \
  --testCode "$(cat src/__tests__/hooks/useEventNotification.spec.ts)" \
  --featureSpec "$FEATURE_SPEC" \
  --output "src/hooks/useEventNotification.ts"

# 3. 리팩토링
node agents/improved/improved-refactoring-agent.js \
  --file "src/hooks/useEventNotification.ts" \
  --optimize
```

### 3. 통합 테스트
생성된 코드가 실제로 작동하는지 확인하려면:

```bash
# 타입 체크
npx tsc --noEmit

# 테스트 실행
npm test

# 개발 서버 실행
npm run dev
```

## ⚠️ 주의사항

### 1. 파일 경로
- 모든 파일 경로는 프로젝트 루트 기준으로 작성
- 상대 경로 사용 시 주의

### 2. 의존성
- 필요한 패키지가 설치되어 있는지 확인
- TypeScript, React Testing Library, MSW 등

### 3. 백업
- 중요한 파일은 리팩토링 전에 백업
- Git을 사용하여 변경사항 추적

## 🔧 문제 해결

### 일반적인 문제들

#### 1. "Module not found" 오류
```bash
# 의존성 설치
npm install

# 또는
pnpm install
```

#### 2. TypeScript 컴파일 오류
```bash
# 타입 체크
npx tsc --noEmit

# 설정 파일 확인
cat tsconfig.json
```

#### 3. 테스트 실행 오류
```bash
# 테스트 환경 설정 확인
cat src/setupTests.ts

# MSW 설정 확인
cat src/__mocks__/handlers.ts
```

## 📞 지원

문제가 발생하거나 개선사항이 필요하면:
1. 이슈 생성
2. 문서 업데이트
3. Agent 개선

---

이 가이드를 통해 개선된 AI Agent들을 효과적으로 활용하여 고품질의 코드를 자동으로 생성할 수 있습니다.
