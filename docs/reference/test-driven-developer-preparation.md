# 구현 전 필수 확인사항 ⚠️

> **참고**: 이 문서는 `test-driven-developer.md`의 일부로, 구현 시작 전 필수 확인사항을 상세히 설명합니다.

---

## ⚠️ 반드시 구현 시작 전에 확인하세요!

구현을 시작하기 전에 다음 사항을 **반드시** 확인하고 파악해야 합니다. 확인하지 않으면 잘못된 방향으로 구현할 수 있습니다.

---

## 1. 사용 가능한 API 명세 확인

### 필수 확인 사항

```markdown
✅ 사용 가능한 API 엔드포인트는?
✅ 각 API의 요청/응답 형식은?
✅ 인증/권한이 필요한가?
✅ 에러 처리 방식은?
✅ MSW 핸들러가 이미 존재하는가?
```

### 확인 방법

1. **API 문서 확인**

   ```bash
   # API 관련 파일 찾기
   grep -r "fetch\|axios\|http" src/apis/
   grep -r "http\." src/__mocks__/handlers.ts
   ```

2. **기존 MSW 핸들러 확인**

   ```typescript
   // src/__mocks__/handlers.ts
   // src/__mocks__/handlersUtils.ts

   // 사용 가능한 핸들러 목록 파악
   - GET /api/events
   - POST /api/events
   - PUT /api/events/:id
   - DELETE /api/events/:id
   ```

3. **API 호출 패턴 파악**
   ```typescript
   // 기존 코드에서 API 호출 방식 확인
   const response = await fetch('/api/events');
   const { events } = await response.json();
   ```

### ⚠️ 중요: 없는 API는 사용하지 마세요!

- 명세나 테스트에 없는 API를 임의로 만들지 마세요
- 필요하다면 설계 단계로 돌아가 논의하세요
- MSW 핸들러가 없다면 추가가 필요한지 확인하세요

---

## 2. 프로젝트 구조 파악

### 필수 확인 사항

```markdown
✅ 사용 중인 주요 라이브러리는? (React, MUI, etc.)
✅ 상태 관리 방식은? (useState, Context, etc.)
✅ 컴포넌트 구조는?
✅ 훅(Hook) 패턴은?
✅ 유틸 함수 위치는?
✅ 타입 정의 위치는?
```

### 확인 방법

1. **package.json 확인**

   ```bash
   cat package.json | grep "dependencies" -A 20
   ```

2. **프로젝트 구조 파악**

   ```
   src/
   ├── components/     # UI 컴포넌트
   ├── hooks/          # 커스텀 훅
   ├── utils/          # 유틸 함수
   ├── apis/           # API 호출
   ├── types.ts        # 타입 정의
   └── App.tsx         # 메인 앱
   ```

3. **기존 패턴 학습**

   ```typescript
   // 기존 훅 패턴 확인
   src / hooks / useEventOperations.ts;
   src / hooks / useEventForm.ts;

   // 기존 유틸 패턴 확인
   src / utils / dateUtils.ts;
   src / utils / eventUtils.ts;
   ```

### ⚠️ 중요: 기존 패턴을 따르세요!

- 새로운 라이브러리를 함부로 추가하지 마세요
- 기존 코드 스타일과 일관성을 유지하세요
- 비슷한 기능이 이미 있다면 재사용하세요

---

## 3. 영향 받는 파일 식별

### 필수 확인 사항

```markdown
✅ 수정해야 할 파일은?
✅ 새로 생성해야 할 파일은?
✅ 영향 받을 수 있는 다른 파일은?
✅ 타입 정의 변경이 필요한가?
```

### 확인 방법

1. **테스트 파일에서 힌트 찾기**

   ```typescript
   // 테스트가 import하는 파일들이 구현 대상
   import { generateRecurringEvents } from '../../utils/recurringEvents';
   // → src/utils/recurringEvents.ts 구현 필요
   ```

2. **grep으로 사용처 찾기**

   ```bash
   # 특정 함수나 컴포넌트의 사용처 찾기
   grep -r "useEventForm" src/
   ```

3. **타입 의존성 확인**
   ```bash
   # 타입 정의 확인
   cat src/types.ts
   ```

---

## 4. 코딩 스타일 확인

### 필수 확인 사항

```markdown
✅ ESLint 규칙은?
✅ Prettier 설정은?
✅ 네이밍 컨벤션은?
✅ 주석 스타일은?
```

### 확인 방법

```bash
# ESLint 설정 확인
cat eslint.config.js

# Prettier 설정 확인
cat .prettierrc

# 기존 코드의 스타일 학습
cat src/utils/dateUtils.ts
```

---

## 구현 전 체크리스트

구현을 시작하기 전에 다음을 체크하세요:

```markdown
## 구현 전 필수 체크리스트

- [ ] 테스트 구현 보고서를 읽고 이해했다
- [ ] 사용 가능한 API 목록을 확인했다
- [ ] MSW 핸들러가 준비되어 있는지 확인했다
- [ ] 프로젝트 구조를 파악했다
- [ ] 사용 중인 라이브러리를 확인했다
- [ ] 기존 코드 패턴을 학습했다
- [ ] 수정/생성할 파일 목록을 작성했다
- [ ] 타입 정의가 충분한지 확인했다
- [ ] ESLint/Prettier 규칙을 확인했다
- [ ] 비슷한 기능의 기존 구현을 찾아봤다
```

**⚠️ 이 체크리스트를 완료한 후에만 구현을 시작하세요!**

---

**원본 문서**: [test-driven-developer.md](../../.claude/agents/test-driven-developer.md)

