# Test Automation Expansion Pack - 사용 가이드

## 🎯 실제 사용 시나리오

### 시나리오 1: 새로운 프로젝트의 테스트 전략 수립

```bash
# 1. Test Strategist 호출
@test-strategist *create-strategy

# AI가 물어볼 것:
# - 어떤 종류의 프로젝트인가요?
# - 주요 기능은 무엇인가요?
# - 위험도가 높은 부분은?

# 출력: docs/test-strategy.md
```

### 시나리오 2: 특정 컴포넌트 테스트 시나리오 설계

```bash
# 1. Test Scenario Designer 호출
@test-scenario-designer *create-scenarios UserAuth

# AI가 할 일:
# - test-strategy.md를 읽음
# - UserAuth 컴포넌트 분석
# - Given-When-Then 시나리오 작성
# - Edge case 식별

# 출력: docs/test-scenarios/user-auth.md
```

### 시나리오 3: 실제 테스트 코드 작성

```bash
# 1. Test Writer 호출
@test-writer *write-tests src/components/UserAuth.tsx

# AI가 할 일:
# - test-strategy.md 참조
# - test-scenarios/user-auth.md 참조
# - 실제 테스트 코드 작성
# - AAA 패턴 적용
# - Edge case 테스트 포함

# 출력: src/__tests__/UserAuth.test.tsx
```

## 📋 단계별 가이드

### Step 1: 프로젝트 분석

먼저 Test Strategist로 시작:

```bash
@test-strategist help
```

사용 가능한 명령:
- `*create-strategy` - 프로젝트 테스트 전략 수립
- `*analyze-project` - 전체 프로젝트 분석
- `*prioritize-tests` - 테스트 우선순위 결정

### Step 2: 전략 수립

```bash
@test-strategist *create-strategy

# 대화 예시:
User: 우리 프로젝트는 React + TypeScript 기반의 Todo 앱이야
Agent: 좋습니다! 주요 기능을 알려주세요
User: 사용자 인증, Todo CRUD, 필터링
Agent: 리스크를 평가하겠습니다...
       - User Auth: P0 (보안)
       - Todo CRUD: P1 (핵심 기능)
       - 필터링: P2 (부가 기능)
       
       docs/test-strategy.md 생성 완료!
```

### Step 3: 시나리오 작성

```bash
@test-scenario-designer *create-scenarios UserAuth

# 출력 예시: docs/test-scenarios/user-auth.md
```

내용 예시:
```markdown
# Test Scenarios: UserAuth

## Scenarios

### Scenario 1: Successful Login
Priority: P0 | Type: Functional | Level: E2E

**Given**: User with valid credentials exists
**When**: User submits login form with valid credentials
**Then**: User should be authenticated
**And**: Redirect to dashboard
**And**: Session token should be generated

### Scenario 2: Login with Invalid Credentials  
Priority: P0 | Type: Security | Level: Unit

**Given**: Invalid credentials provided
**When**: User submits login form
**Then**: Login should fail
**And**: Error message displayed
...
```

### Step 4: 테스트 코드 작성

```bash
@test-writer *write-tests src/components/UserAuth.tsx

# 생성되는 코드 예시:
```

```typescript
describe('UserAuth', () => {
  describe('login', () => {
    it('should authenticate user with valid credentials', async () => {
      // Arrange
      const credentials = { username: 'test', password: 'valid' };
      
      // Act
      const result = await login(credentials);
      
      // Assert
      expect(result.isAuthenticated).toBe(true);
      expect(result.token).toBeDefined();
    });
    
    it('should reject invalid credentials', async () => {
      // Arrange
      const credentials = { username: 'test', password: 'wrong' };
      
      // Act & Assert
      await expect(login(credentials)).rejects.toThrow('Invalid credentials');
    });
    
    // Edge cases...
    it('should handle empty credentials', async () => {
      await expect(login({ username: '', password: '' })).rejects.toThrow();
    });
  });
});
```

## 🔄 전체 워크플로우

```bash
# 1. 전략 수립
@test-strategist *create-strategy
→ docs/test-strategy.md

# 2. 시나리오 작성 (각 컴포넌트마다)
@test-scenario-designer *create-scenarios UserAuth
→ docs/test-scenarios/user-auth.md

# 3. 테스트 코드 작성
@test-writer *write-tests src/auth.tsx
→ src/__tests__/auth.test.tsx

# 다음 컴포넌트로 반복
@test-scenario-designer *create-scenarios TodoList
@test-writer *write-tests src/TodoList.tsx
```

## 💡 실전 팁

### Tip 1: 전략부터 시작
테스트 코드를 바로 작성하지 말고 전략을 먼저 수립하세요.

```bash
# ❌ 잘못된 순서
@test-writer *write-tests src/auth.tsx  # 전략 없이 바로 작성

# ✅ 올바른 순서
@test-strategist *create-strategy      # 1. 전략
@test-scenario-designer *create-scenarios auth  # 2. 시나리오
@test-writer *write-tests src/auth.tsx # 3. 코드
```

### Tip 2: 리스크 기반 우선순위
P0 (Critical)부터 시작하세요.

```markdown
Test Strategy에서:
P0: User Auth, Payment → 완전 커버리지
P1: Core Features → 핵심 시나리오만
P2: UI Polish → Smoke test만
```

### Tip 3: 문서 참조
에이전트가 자동으로 참조할 수 있도록 문서를 `docs/` 폴더에 저장하세요.

```
docs/
├── test-strategy.md          # 전략 문서
├── test-scenarios/           
│   ├── user-auth.md         # 컴포넌트별 시나리오
│   └── todo-list.md
└── qa/                       # QA 결과
```

## 🚨 문제 해결

### 문제: 에이전트를 찾을 수 없어요

```bash
# 해결 1: 수동 설치 확인
ls .bmad-test-automation/agents/

# 해결 2: IDE 재시작
# Cursor를 완전히 종료하고 재시작

# 해결 3: 설정 파일 확인
cat .bmad-core/core-config.yaml
```

### 문제: 에이전트가 명령을 인식하지 못해요

```bash
# 올바른 형식 확인
@test-strategist help      # help 확인
@test-strategist *create-strategy  # * 필수!
```

### 문제: 문서가 생성되지 않아요

```bash
# docs/ 폴더가 있는지 확인
mkdir -p docs/test-scenarios

# 권한 확인
chmod 755 docs/
```

## 📝 체크리스트

이 Expansion Pack을 사용하기 전에:

- [ ] Expansion Pack 파일이 프로젝트에 복사됨
- [ ] `.bmad-test-automation/` 폴더 존재
- [ ] `docs/` 폴더 생성됨
- [ ] IDE (Cursor/Claude Code) 재시작됨

사용 가능한 명령:

- [ ] `@test-strategist help` 작동
- [ ] `@test-scenario-designer help` 작동
- [ ] `@test-writer help` 작동

## 🎉 시작하기

지금 바로 시작:

```bash
# 1. Terminal에서
cd /your/project

# 2. Cursor에서
@test-strategist *create-strategy

# 3. 대화 시작!
```

행운을 빕니다! 🚀

