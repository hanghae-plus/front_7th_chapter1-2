# E2E 테스트 디렉토리

이 디렉토리는 Playwright를 사용한 End-to-End 테스트 파일들을 포함합니다.

## 📁 파일 구조

```
src/__tests__/e2e/
├── README.md                 # 이 파일
├── e2e-utils.ts             # Page Object Pattern 헬퍼 함수
└── [실제 테스트 파일들]     # 아래 참고
```

## 🎯 예정된 테스트 파일

다음 E2E 테스트 파일들을 순차적으로 작성할 예정입니다:

1. **crud-flow.spec.ts** - 일정 CRUD 워크플로우

   - 일정 추가 (SC-001)
   - 일정 수정 (SC-007)
   - 일정 삭제 (SC-008)

2. **overlap-detection.spec.ts** - 충돌 감지

   - 겹치는 일정 경고 (SC-004)
   - 강제 저장 (SC-005)
   - 취소 (SC-006)

3. **search-flow.spec.ts** - 검색 기능

   - 검색어 필터링 (SC-009)
   - 빈 결과 처리 (SC-010)
   - 검색 초기화 (SC-011)

4. **view-switching.spec.ts** - 뷰 전환

   - Week ↔ Month 전환 (SC-012)
   - 네비게이션 (SC-013, SC-014)

5. **accessibility.spec.ts** - 접근성 (선택사항)
   - 키보드 네비게이션 (SC-016)
   - ARIA 속성 (SC-017)

## 📝 시나리오 문서

상세한 Given-When-Then 시나리오는 다음 문서를 참고하세요:

- [docs/test-scenarios/e2e-flow.md](../../../docs/test-scenarios/e2e-flow.md)
- [docs/e2e-test-strategy.md](../../../docs/e2e-test-strategy.md)

## 🚀 실행 방법

### 전체 E2E 테스트 실행

```bash
npm run test:e2e
```

### UI 모드로 실행 (디버깅)

```bash
npm run test:e2e:ui
```

### 디버그 모드

```bash
npm run test:e2e:debug
```

### 특정 테스트만 실행

```bash
npx playwright test crud-flow
```

## 📊 테스트 전략

### Test Pyramid

```
       E2E (5-7개 목표) ← 10%
      /         \
     Integration (14개 ✅) ← 20%
    /             \
   Unit+Hook (173개 ✅) ← 70%
```

### 우선순위

- **P0 (Critical)**: CRUD, 충돌 감지, 검색, 뷰 전환
- **P1 (Important)**: 수정, 삭제, 네비게이션
- **P2 (Nice to have)**: 알림, 접근성

## 🛠️ Page Object Pattern

모든 테스트는 `CalendarPage` 클래스를 사용합니다:

```typescript
import { setupTest } from './e2e-utils';

test('일정 추가', async ({ page }) => {
  const calendar = await setupTest(page);
  await calendar.fillEventFormBasic('팀 미팅', '2024-01-15', '10:00', '11:00');
  await calendar.submitEvent();

  const eventList = calendar.getEventList();
  await expect(eventList).toContainText('팀 미팅');
});
```

## 📚 참고 자료

- [Playwright 공식 문서](https://playwright.dev)
- [Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Pattern](https://playwright.dev/docs/pom)
