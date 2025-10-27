# E2E 테스트 전략 문서 (E2E Test Strategy)

## Executive Summary

이 문서는 React + TypeScript 기반 캘린더 애플리케이션의 **E2E (End-to-End) 테스트 전략**을 정의합니다.

### 현재 상태

- ✅ **Unit Test**: 173개 테스트 통과 (100% pass rate)
- ✅ **Hooks Test**: 포괄적인 커버리지
- ✅ **Integration Test**: 14개 시나리오 통과
- 🎯 **E2E Test**: 시작 단계

### E2E 테스트 목표

1. **사용자 시나리오 검증**: 실제 사용자 관점에서 전체 워크플로우 검증
2. **브라우저 호환성**: 다양한 브라우저에서 일관된 동작 확인
3. **UI 상호작용**: 실제 DOM 조작 및 렌더링 검증
4. **접근성**: 키보드 네비게이션, 스크린 리더 등 접근성 검증

### 예상 일정

- Phase 1 (계획): E2E 테스트 전략 수립 및 도구 설정
- Phase 2 (진행 중): 핵심 사용자 시나리오 E2E 테스트 작성
- Phase 3 (계획): CI/CD 통합 및 자동화

---

## 1. Context (맥락)

### 1.1 E2E 테스트의 범위

**E2E vs Integration Test 차이점**:

| 차이점       | Integration Test (현재) | E2E Test (계획)        |
| ------------ | ----------------------- | ---------------------- |
| **렌더링**   | jsdom (가상 DOM)        | 실제 브라우저          |
| **상호작용** | Testing Library 쿼리    | 실제 마우스/키보드     |
| **네트워크** | MSW (Mock)              | 실제 HTTP 또는 Mock    |
| **목적**     | 컴포넌트 통합 검증      | 사용자 워크플로우 검증 |
| **속도**     | 빠름 (~10초)            | 느림 (~30초+)          |
| **안정성**   | 높음 (격리됨)           | 낮음 (외부 의존)       |

### 1.2 프로젝트 구조

**현재 테스트 피라미드**:

```
       E2E (0개 - 추가 필요)
      /         \
     Integration (14개)
    /             \
   Unit (173개) - Hook (173개)
```

**권장 비율 (Test Pyramid)**:

- Unit + Hook: 70% (173개 ✅)
- Integration: 20% (14개 ✅)
- E2E: 10% (~5-7개 목표)

### 1.3 기술 스택

**E2E 테스트 도구**:

- ✅ **Playwright** 1.56.1 (이미 설치됨)
- ✅ **@playwright/test**
- Vitest (유닛/통합 테스트)

**선택 이유**:

- 빠른 실행 속도
- 자동 기다림 (Auto-waiting)
- 강력한 크로스 브라우저 지원
- 쉬운 디버깅
- 스크린샷/비디오 자동 캡처

---

## 2. E2E 테스트 범위 정의

### 2.1 포함할 시나리오 (In Scope)

#### Priority 0 (Critical) - 먼저 구현

1. **일정 추가 워크플로우**

   - 사용자가 폼에 정보 입력
   - 저장 버튼 클릭
   - 캘린더 뷰에 일정 표시 확인

2. **일정 충돌 감지**

   - 겹치는 시간의 일정 추가 시도
   - 경고 다이얼로그 표시 확인
   - 강제 저장 후 동작 확인

3. **일정 검색 기능**

   - 검색어 입력
   - 필터링된 결과 표시 확인
   - "검색 결과 없음" 케이스 확인

4. **뷰 전환 (Week/Month)**
   - 뷰 선택기 변경
   - 캘린더 렌더링 확인
   - 일정 표시 정확성 확인

#### Priority 1 (Important) - 다음 구현

5. **일정 수정**

   - 기존 일정 수정 버튼 클릭
   - 폼 자동 채우기 확인
   - 수정 사항 저장 확인

6. **일정 삭제**

   - 삭제 버튼 클릭
   - 일정 제거 확인

7. **네비게이션 (이전/다음)**
   - 이전/다음 주/월 이동
   - 날짜 업데이트 확인

#### Priority 2 (Nice to have)

8. **알림 기능**

   - 알림 설정
   - 알림 표시 확인

9. **접근성 테스트**
   - 키보드 네비게이션
   - ARIA 레이블 확인

### 2.2 제외할 시나리오 (Out of Scope)

- ❌ 외부 API (fetchHolidays) - Mock으로 처리
- ❌ 반복 일정 기능 - 미구현 상태
- ❌ 복잡한 날짜 계산 - Unit Test에서 이미 커버됨
- ❌ 성능 테스트 - 별도 프로파일링으로 처리

---

## 3. E2E 테스트 구조

### 3.1 디렉토리 구조

```
src/
├── __tests__/
│   ├── e2e/                      # 새 폴더
│   │   ├── e2e-setup.ts         # Playwright 설정
│   │   ├── e2e-utils.ts         # 헬퍼 함수
│   │   ├── crud-flow.spec.ts    # CRUD 워크플로우
│   │   ├── overlap-detection.spec.ts  # 충돌 감지
│   │   ├── search-flow.spec.ts  # 검색 기능
│   │   └── view-switching.spec.ts     # 뷰 전환
│   ├── hooks/                    # Hook 테스트
│   ├── unit/                     # Unit 테스트
│   └── medium.integration.spec.tsx  # Integration 테스트
```

### 3.2 설정 파일

**playwright.config.ts** (생성 필요):

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/__tests__/e2e',
  fullyParallel: false, // 순차 실행 (MSW 영향)
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 4. Risk Assessment (위험 평가)

### 4.1 E2E 테스트 위험 요소

| 위험 카테고리   | 설명                | 대응 방안                                                       |
| --------------- | ------------------- | --------------------------------------------------------------- |
| **Flakiness**   | 비결정적 실패       | • 충분한 대기 시간<br>• 안정적인 쿼리 사용<br>• 재시도 메커니즘 |
| **느린 실행**   | E2E는 느림          | • 적은 수의 E2E 테스트<br>• 병렬 실행 피하기<br>• CI/CD 최적화  |
| **환경 의존성** | 브라우저, 서버 필요 | • Docker 컨테이너<br>• Github Actions 자동화                    |
| **유지보수**    | UI 변경 시 깨짐     | • 명확한 테스트 ID<br>• Page Object Pattern<br>• 문서화         |

### 4.2 우선순위별 리스크

**P0 (Critical)**:

- 일정 CRUD 실패 → 비즈니스 로직 문제
- 충돌 감지 실패 → 데이터 무결성 문제

**P1 (Important)**:

- 검색 실패 → UX 문제
- 뷰 전환 실패 → 기능 접근 불가

**P2 (Minor)**:

- 알림 실패 → 추가 기능 문제

---

## 5. 구현 계획

### 5.1 Phase 1: 환경 설정 (1일)

**작업 내용**:

1. Playwright 설정 파일 생성
2. E2E 테스트 디렉토리 생성
3. 기본 헬퍼 함수 작성
4. MSW 통합 설정

**산출물**:

- `playwright.config.ts`
- `src/__tests__/e2e/e2e-setup.ts`
- `src/__tests__/e2e/e2e-utils.ts`

### 5.2 Phase 2: 핵심 시나리오 작성 (2-3일)

**작업 순서**:

1. **CRUD Flow** (최우선)

   ```typescript
   // crud-flow.spec.ts
   - 일정 추가 (필수 필드)
   - 일정 수정 (모든 필드)
   - 일정 삭제
   ```

2. **Overlap Detection** (중요)

   ```typescript
   // overlap-detection.spec.ts
   - 시간 충돌 시 경고 표시
   - 강제 저장 후 행동
   ```

3. **Search Flow** (중요)

   ```typescript
   // search-flow.spec.ts
   - 검색어로 필터링
   - 빈 결과 처리
   ```

4. **View Switching** (중요)
   ```typescript
   // view-switching.spec.ts
   - Week ↔ Month 전환
   - 날짜 네비게이션
   ```

### 5.3 Phase 3: CI/CD 통합 (1일)

**작업 내용**:

1. GitHub Actions 워크플로우 추가
2. 스크린샷/비디오 캡처 설정
3. 테스트 리포트 생성

---

## 6. Best Practices

### 6.1 테스트 작성 원칙

1. **독립성**: 각 테스트는 독립적으로 실행 가능
2. **명확한 이름**: "given-when-then" 스타일 네이밍
3. **단순함**: 한 테스트에 하나의 시나리오만
4. **안정성**: 충분한 대기 시간, 재시도 로직
5. **유지보수성**: Page Object Pattern 사용

### 6.2 테스트 예시

```typescript
import { test, expect } from '@playwright/test';

test.describe('일정 CRUD 워크플로우', () => {
  test('새 일정을 추가할 수 있다', async ({ page }) => {
    // Given: 캘린더 페이지 로드
    await page.goto('/');

    // When: 폼에 정보 입력 후 저장
    await page.fill('#title', '팀 미팅');
    await page.fill('#date', '2024-01-15');
    await page.fill('#start-time', '10:00');
    await page.fill('#end-time', '11:00');
    await page.click('[data-testid="event-submit-button"]');

    // Then: 일정이 캘린더에 표시됨
    await expect(page.locator('[data-testid="event-list"]')).toContainText('팀 미팅');
  });
});
```

### 6.3 Page Object Pattern

```typescript
// e2e-utils.ts
export class CalendarPage {
  constructor(private page: Page) {}

  async fillEventForm(title: string, date: string, start: string, end: string) {
    await this.page.fill('#title', title);
    await this.page.fill('#date', date);
    await this.page.fill('#start-time', start);
    await this.page.fill('#end-time', end);
  }

  async submitEvent() {
    await this.page.click('[data-testid="event-submit-button"]');
  }

  async getEventList() {
    return this.page.locator('[data-testid="event-list"]');
  }
}
```

---

## 7. CI/CD 통합

### 7.1 GitHub Actions

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### 7.2 로컬 실행

```bash
# E2E 테스트만 실행
npm run test:e2e

# 특정 브라우저로 실행
npx playwright test --project=chromium

# UI 모드로 실행
npx playwright test --ui

# 디버그 모드
npx playwright test --debug
```

---

## 8. 성공 지표

### 8.1 정량적 목표

- ✅ **E2E 테스트 수**: 5-7개 (핵심 시나리오)
- ✅ **통과율**: 95% 이상
- ✅ **실행 시간**: 30초 이내
- ✅ **커버리지**: P0 기능 100%, P1 기능 80%

### 8.2 정성적 목표

- ✅ **안정성**: Flaky 테스트 없음
- ✅ **유지보수성**: Page Object Pattern 적용
- ✅ **문서화**: 각 테스트 시나리오 문서화
- ✅ **CI/CD**: 자동화 완료

---

## 9. 다음 단계

### 즉시 작업

1. ✅ Playwright 설정 파일 생성
2. ✅ 첫 번째 E2E 테스트 작성 (CRUD Flow)
3. ✅ MSW 통합 및 테스트

### 단기 목표

- 5개 핵심 E2E 테스트 완성
- CI/CD 통합
- 문서화

### 장기 목표

- 추가 시나리오 추가
- 크로스 브라우저 테스트 확장
- 성능 테스트 도입

---

## 10. 참고 자료

- [Playwright 공식 문서](https://playwright.dev)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library Guides](https://testing-library.com/docs/)
- [MSW 공식 문서](https://mswjs.io/)

---

**작성일**: 2024-01-XX  
**작성자**: Test Strategist (스트라텔)  
**버전**: 1.0.0
