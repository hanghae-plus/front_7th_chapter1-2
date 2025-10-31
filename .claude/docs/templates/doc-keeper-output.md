# Doc Keeper Agent Output Template

**버전:** 1.0.0
**생성일:** 2025-10-30
**목적:** Doc Keeper 에이전트의 산출물 형식 및 구조 정의

---

## 산출물 개요

Doc Keeper 에이전트는 **문서 인덱스**와 **최종 프로젝트 리포트**를 주요 산출물로 생성한다.

### 파일 정보

**1. 문서 인덱스**
- **파일명**: `index.md`
- **경로**: `.claude/outputs/{project-id}/index.md`
- **예시**: `.claude/outputs/PROJ-001-20250130/index.md`
- **티켓**: Doc Keeper 티켓 번호 (예: PROJ-007)
- **목적**: 프로젝트의 모든 산출물을 정리하고 탐색 가능한 인덱스 제공

**2. 최종 프로젝트 리포트**
- **파일명**: `final-report.md`
- **경로**: `.claude/outputs/{project-id}/final-report.md`
- **예시**: `.claude/outputs/PROJ-001-20250130/final-report.md`
- **티켓**: Doc Keeper 티켓 번호 (예: PROJ-007)
- **목적**: 프로젝트 전체 요약 및 배포/유지보수 가이드 제공

---

## 문서 인덱스 템플릿

```markdown
# 프로젝트 문서 인덱스

**프로젝트 ID**: {PROJ-XXX-YYYYMMDD}
**프로젝트명**: {프로젝트 이름}
**작성일**: YYYY-MM-DD
**작성자**: Doc Keeper Agent
**티켓**: {PROJ-XXX}
**버전**: 1.0.0

---

## 1. 프로젝트 개요

### 1.1 프로젝트 정보

**프로젝트 ID**: {PROJ-XXX-YYYYMMDD}
**프로젝트 이름**: {프로젝트 이름}
**프로젝트 기간**: YYYY-MM-DD ~ YYYY-MM-DD
**프로젝트 목적**: {프로젝트 목적 요약}

### 1.2 주요 기능

- **기능 1**: {기능 설명}
- **기능 2**: {기능 설명}
- **기능 3**: {기능 설명}

### 1.3 기술 스택

**프론트엔드**:
- React {버전}
- TypeScript {버전}
- {기타 라이브러리}

**테스트**:
- Vitest {버전}
- React Testing Library {버전}
- Playwright | Cypress {버전}

**빌드 & 도구**:
- Vite {버전}
- ESLint {버전}
- Prettier {버전}

---

## 2. 산출물 목록

### 2.1 기획 문서

#### PRD (Product Requirements Document)
- **파일**: `.claude/outputs/{project-id}/prd.md`
- **작성자**: PM Agent
- **티켓**: PROJ-001
- **내용**: 프로젝트 요구사항, 기능 정의, 제약사항
- **주요 섹션**:
  - 프로젝트 목표
  - 기능 요구사항
  - 비기능 요구사항
  - 기술 스택
  - 제약사항

---

### 2.2 테스트 문서

#### 테스트 시나리오
- **파일**: `.claude/outputs/{project-id}/test-scenarios.md`
- **작성자**: Test Designer Agent
- **티켓**: PROJ-002
- **내용**: 테스트 설계 및 시나리오 정의
- **주요 섹션**:
  - 테스트 전략
  - 단위 테스트 시나리오
  - 통합 테스트 시나리오
  - E2E 테스트 시나리오

#### 테스트 코드 구현 리포트
- **파일**: `.claude/outputs/{project-id}/test-implementation-report.md`
- **작성자**: Test Writer Agent
- **티켓**: PROJ-003
- **내용**: 작성된 테스트 코드 설명
- **주요 섹션**:
  - 테스트 파일 구조
  - Mock 전략
  - 테스트 실행 방법
  - 테스트 커버리지

---

### 2.3 구현 문서

#### 구현 상태 리포트
- **파일**: `.claude/outputs/{project-id}/implementation-status-report.md`
- **작성자**: Implementer Agent
- **티켓**: PROJ-004
- **내용**: 구현된 기능 및 코드 설명
- **주요 섹션**:
  - 구현된 기능 목록
  - 주요 구현 결정사항
  - 파일 구조
  - 알려진 이슈

---

### 2.4 검증 문서

#### QA 리포트
- **파일**: `.claude/outputs/{project-id}/qa-report.md`
- **작성자**: QA Agent
- **티켓**: PROJ-005
- **내용**: 통합 테스트 및 검증 결과
- **주요 섹션**:
  - 테스트 요약
  - 통합 검증 결과
  - E2E 테스트 결과
  - 크로스 브라우저 테스트 결과
  - 접근성 테스트 결과
  - 성능 테스트 결과
  - 발견된 이슈 목록

---

### 2.5 리팩토링 문서

#### 리팩토링 리포트
- **파일**: `.claude/outputs/{project-id}/refactoring-report.md`
- **작성자**: Refactorer Agent
- **티켓**: PROJ-006
- **내용**: 리팩토링 내역 및 코드 품질 개선
- **주요 섹션**:
  - 리팩토링 대상 및 이유
  - 리팩토링 내역
  - 코드 품질 개선 사항
  - 성능 최적화
  - 테스트 검증 결과

---

### 2.6 최종 문서

#### 문서 인덱스 (현재 문서)
- **파일**: `.claude/outputs/{project-id}/index.md`
- **작성자**: Doc Keeper Agent
- **티켓**: PROJ-007
- **내용**: 프로젝트 산출물 인덱스
- **목적**: 모든 산출물의 접근성 향상

#### 최종 프로젝트 리포트
- **파일**: `.claude/outputs/{project-id}/final-report.md`
- **작성자**: Doc Keeper Agent
- **티켓**: PROJ-007
- **내용**: 프로젝트 전체 요약 및 가이드
- **목적**: 배포 및 유지보수 지원

---

## 3. 코드베이스 인덱스

### 3.1 디렉토리 구조

```
프로젝트 루트/
├── src/
│   ├── components/          # React 컴포넌트
│   │   ├── {ComponentName}/
│   │   │   ├── index.tsx
│   │   │   ├── {ComponentName}.test.tsx
│   │   │   └── types.ts
│   ├── hooks/               # Custom Hooks
│   ├── utils/               # 유틸리티 함수
│   ├── types/               # TypeScript 타입 정의
│   ├── constants/           # 상수
│   └── App.tsx              # 메인 애플리케이션
├── .claude/
│   ├── outputs/{project-id}/ # 프로젝트 산출물
│   ├── agents/              # 에이전트 정의
│   └── docs/                # 워크플로우 문서
└── ...
```

### 3.2 주요 컴포넌트

#### {Component 1}
- **파일**: `src/components/{Component1}/index.tsx`
- **목적**: {컴포넌트 목적}
- **주요 Props**: {주요 Props 목록}
- **테스트**: `src/components/{Component1}/{Component1}.test.tsx`

#### {Component 2}
- **파일**: `src/components/{Component2}/index.tsx`
- **목적**: {컴포넌트 목적}
- **주요 Props**: {주요 Props 목록}
- **테스트**: `src/components/{Component2}/{Component2}.test.tsx`

### 3.3 주요 Hook

#### {Hook 1}
- **파일**: `src/hooks/{useHook1}.ts`
- **목적**: {Hook 목적}
- **반환값**: {반환값 설명}
- **사용 예시**: {사용 예시}

### 3.4 주요 유틸리티

#### {Utility 1}
- **파일**: `src/utils/{utility1}.ts`
- **목적**: {유틸리티 목적}
- **주요 함수**: {함수 목록}

---

## 4. 테스트 코드 인덱스

### 4.1 단위 테스트

| 테스트 파일 | 대상 | 테스트 개수 | 상태 |
|-----------|------|-----------|------|
| {Component1}.test.tsx | {Component1} | X | ✅ Pass |
| {Component2}.test.tsx | {Component2} | X | ✅ Pass |
| {utility1}.test.ts | {utility1} | X | ✅ Pass |

### 4.2 통합 테스트

| 테스트 파일 | 시나리오 | 테스트 개수 | 상태 |
|-----------|---------|-----------|------|
| {integration1}.test.tsx | {시나리오 설명} | X | ✅ Pass |
| {integration2}.test.tsx | {시나리오 설명} | X | ✅ Pass |

### 4.3 E2E 테스트

| 테스트 파일 | 시나리오 | 상태 |
|-----------|---------|------|
| {e2e1}.spec.ts | {시나리오 설명} | ✅ Pass |
| {e2e2}.spec.ts | {시나리오 설명} | ✅ Pass |

---

## 5. 산출물 연관관계

### 5.1 워크플로우 순서

```
PRD
 ↓
테스트 시나리오
 ↓
테스트 코드 구현 리포트 + 테스트 코드
 ↓
구현 상태 리포트 + 구현 코드
 ↓
QA 리포트
 ↓
리팩토링 리포트
 ↓
문서 인덱스 + 최종 프로젝트 리포트
```

### 5.2 참조 관계

- **테스트 시나리오** → PRD 참조
- **테스트 코드 구현 리포트** → 테스트 시나리오 + PRD 참조
- **구현 상태 리포트** → 테스트 코드 + PRD 참조
- **QA 리포트** → 구현 코드 + 테스트 코드 + PRD 참조
- **리팩토링 리포트** → 구현 코드 + 테스트 코드 + QA 리포트 참조
- **최종 문서** → 모든 산출물 참조

---

## 6. 문서 접근 가이드

### 6.1 빠른 시작

**프로젝트 이해하기**:
1. **PRD** 읽기 → 프로젝트 목적 및 요구사항 파악
2. **최종 프로젝트 리포트** 읽기 → 전체 요약 및 주요 사항 확인
3. **구현 상태 리포트** 읽기 → 구현 내용 파악

**테스트 이해하기**:
1. **테스트 시나리오** 읽기 → 테스트 전략 파악
2. **QA 리포트** 읽기 → 검증 결과 확인

**코드 탐색하기**:
1. **디렉토리 구조** 참조 → 파일 위치 파악
2. **주요 컴포넌트** 참조 → 주요 파일 확인

### 6.2 목적별 가이드

**배포 준비**:
- 최종 프로젝트 리포트 → "배포 및 유지보수 가이드" 섹션

**버그 수정**:
- 구현 상태 리포트 → "알려진 이슈" 섹션
- QA 리포트 → "발견된 이슈 목록" 섹션

**기능 추가**:
- PRD → "기능 요구사항" 섹션
- 구현 상태 리포트 → "주요 구현 결정사항" 섹션

**테스트 작성**:
- 테스트 시나리오 → 테스트 전략
- 테스트 코드 구현 리포트 → Mock 전략 및 예시

---

## 7. 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | YYYY-MM-DD | Doc Keeper Agent | 초기 문서 인덱스 작성 |

---

**이 문서는 프로젝트의 모든 산출물을 정리한 인덱스로, 프로젝트 이해 및 탐색의 시작점입니다.**
```

---

## 최종 프로젝트 리포트 템플릿

```markdown
# 최종 프로젝트 리포트

**프로젝트 ID**: {PROJ-XXX-YYYYMMDD}
**프로젝트명**: {프로젝트 이름}
**작성일**: YYYY-MM-DD
**작성자**: Doc Keeper Agent
**티켓**: {PROJ-XXX}
**버전**: 1.0.0

---

## Executive Summary

### 프로젝트 개요

{프로젝트의 목적과 범위를 2-3문장으로 요약}

### 주요 성과

- **구현 완료**: {구현된 주요 기능 나열}
- **테스트 커버리지**: XX%
- **성능 점수**: XX/100 (Lighthouse)
- **접근성 점수**: XX/100 (Lighthouse)
- **배포 준비**: ✅ 완료 | 조건부 완료

### 주요 지표

| 지표 | 목표 | 실제 | 달성 여부 |
|-----|------|------|-----------|
| 테스트 커버리지 | 70% | XX% | ✅ / ❌ |
| 성능 점수 (Lighthouse) | 90 | XX | ✅ / ❌ |
| 접근성 점수 (Lighthouse) | 100 | XX | ✅ / ❌ |
| 번들 사이즈 | < 500KB | XXX KB | ✅ / ❌ |

---

## 1. 프로젝트 요약

### 1.1 프로젝트 정보

**프로젝트 ID**: {PROJ-XXX-YYYYMMDD}
**프로젝트 이름**: {프로젝트 이름}
**프로젝트 기간**: YYYY-MM-DD ~ YYYY-MM-DD (X일)
**프로젝트 목적**: {프로젝트 목적 상세}

### 1.2 프로젝트 범위

**포함 사항**:
- {기능 1}
- {기능 2}
- {기능 3}

**제외 사항**:
- {제외된 기능 또는 향후 구현 예정 사항}

### 1.3 주요 이해관계자

- **Product Manager**: PM Agent
- **Test Designer**: Test Designer Agent
- **Test Writer**: Test Writer Agent
- **Implementer**: Implementer Agent
- **QA**: QA Agent
- **Refactorer**: Refactorer Agent
- **Doc Keeper**: Doc Keeper Agent

---

## 2. 기술 개요

### 2.1 기술 스택

**프론트엔드**:
- React {버전}
- TypeScript {버전}
- {기타 주요 라이브러리}

**상태 관리**:
- {사용된 상태 관리 라이브러리 또는 패턴}

**스타일링**:
- {사용된 스타일링 솔루션}

**테스트**:
- Vitest {버전}
- React Testing Library {버전}
- Playwright | Cypress {버전}

**빌드 & 도구**:
- Vite {버전}
- ESLint {버전}
- Prettier {버전}

### 2.2 아키텍처 패턴

**컴포넌트 구조**:
- {컴포넌트 구조 패턴 설명}

**상태 관리 패턴**:
- {상태 관리 패턴 설명}

**테스트 전략**:
- 단위 테스트: {전략 설명}
- 통합 테스트: {전략 설명}
- E2E 테스트: {전략 설명}

### 2.3 주요 의존성

| 라이브러리 | 버전 | 용도 |
|-----------|------|------|
| React | {버전} | UI 라이브러리 |
| TypeScript | {버전} | 타입 체크 |
| {라이브러리} | {버전} | {용도} |

---

## 3. 구현 요약

### 3.1 구현된 기능

#### 기능 1: {기능명}
- **설명**: {기능 상세 설명}
- **주요 컴포넌트**: {관련 컴포넌트 목록}
- **구현 파일**: {주요 파일 경로}
- **테스트 파일**: {테스트 파일 경로}
- **상태**: ✅ 완료

#### 기능 2: {기능명}
{위와 동일한 형식}

### 3.2 주요 컴포넌트

#### {Component 1}
- **경로**: `src/components/{Component1}/index.tsx`
- **목적**: {컴포넌트 목적}
- **주요 Props**:
  - `{prop1}`: {설명}
  - `{prop2}`: {설명}
- **사용 예시**:
```tsx
<Component1 prop1="value" prop2={value} />
```

#### {Component 2}
{위와 동일한 형식}

### 3.3 주요 구현 결정사항

1. **결정사항 1**: {결정 내용}
   - **이유**: {결정 이유}
   - **영향**: {영향 범위}

2. **결정사항 2**: {결정 내용}
   - **이유**: {결정 이유}
   - **영향**: {영향 범위}

---

## 4. 테스트 요약

### 4.1 테스트 커버리지

**전체 커버리지**: XX%

**영역별 커버리지**:
- Statements: XX%
- Branches: XX%
- Functions: XX%
- Lines: XX%

**목표 달성 여부**: ✅ 70% 이상 달성 | ❌ 미달성

### 4.2 테스트 유형

#### 단위 테스트
- **테스트 개수**: X개
- **통과율**: 100%
- **커버리지**: XX%
- **주요 대상**: 컴포넌트, Hook, 유틸리티 함수

#### 통합 테스트
- **테스트 개수**: X개
- **통과율**: 100%
- **주요 대상**: 컴포넌트 간 상호작용, API 통합

#### E2E 테스트
- **테스트 개수**: X개
- **통과율**: 100%
- **주요 대상**: 사용자 플로우, 엔드투엔드 시나리오

### 4.3 테스트 실행 방법

```bash
# 모든 테스트 실행
npm test

# 특정 파일 테스트
npm test {file-path}

# 커버리지 확인
npm test -- --coverage

# E2E 테스트 실행 (Playwright)
npm run test:e2e

# 또는 (Cypress)
npm run cypress:open
```

---

## 5. 품질 지표

### 5.1 코드 품질

**TypeScript**:
- ✅ 타입 에러 없음
- ✅ strict 모드 활성화
- ✅ 모든 컴포넌트 타입 정의

**ESLint**:
- ✅ 에러 없음
- ⚠️ 경고 X건 (허용 가능)

**Prettier**:
- ✅ 모든 파일 포맷팅 완료

### 5.2 성능 지표

**Lighthouse 점수**:
- Performance: XX / 100 (목표: 90+)
- Accessibility: XX / 100 (목표: 100)
- Best Practices: XX / 100 (목표: 90+)
- SEO: XX / 100 (해당 시)

**Core Web Vitals**:
- LCP (Largest Contentful Paint): X.X초 (목표: < 2.5초)
- FID (First Input Delay): XXms (목표: < 100ms)
- CLS (Cumulative Layout Shift): X.XX (목표: < 0.1)

**번들 사이즈**:
- 총 번들 사이즈: XXX KB (목표: < 500KB)
- Main bundle: XXX KB
- Vendor bundle: XXX KB

### 5.3 접근성 지표

**WCAG 2.1 Level AA**: ✅ 준수 | ❌ 미준수

**axe-core 검증**:
- Critical 이슈: 0건
- Serious 이슈: 0건
- Moderate 이슈: 0건
- Minor 이슈: 0건

**키보드 네비게이션**: ✅ 완전 지원

**스크린 리더 호환**: ✅ 호환 | N/A

---

## 6. 알려진 이슈 및 제약사항

### 6.1 Critical 이슈

**이슈 없음** | 아래 이슈 존재:

#### Issue #1: {이슈 제목}
- **우선순위**: Critical
- **설명**: {상세 설명}
- **회피 방법**: {임시 회피 방법}
- **계획**: {해결 계획}

### 6.2 제약사항

1. **제약사항 1**: {제약사항 설명}
   - **영향**: {영향 범위}
   - **회피 방법**: {회피 방법}

2. **제약사항 2**: {제약사항 설명}
   - **영향**: {영향 범위}
   - **회피 방법**: {회피 방법}

### 6.3 향후 개선 사항

**기능 개선**:
- {개선 항목 1}
- {개선 항목 2}

**성능 개선**:
- {개선 항목 1}
- {개선 항목 2}

**접근성 개선**:
- {개선 항목 1}
- {개선 항목 2}

---

## 7. 배포 가이드

### 7.1 빌드

**개발 빌드**:
```bash
npm run dev
```

**프로덕션 빌드**:
```bash
npm run build
```

**빌드 결과 확인**:
- 빌드 파일 위치: `dist/`
- 빌드 시간: 약 X초

### 7.2 환경 변수

**필수 환경 변수**:
```
{ENV_VAR_1}={설명}
{ENV_VAR_2}={설명}
```

**선택 환경 변수**:
```
{ENV_VAR_3}={설명}
```

**환경 변수 설정 방법**:
1. `.env` 파일 생성
2. 위 환경 변수 추가
3. 값 설정

### 7.3 배포 체크리스트

**배포 전**:
- [ ] 모든 테스트 통과 (`npm test`)
- [ ] 빌드 성공 (`npm run build`)
- [ ] 환경 변수 설정 확인
- [ ] 의존성 설치 (`npm install`)
- [ ] 버전 확인

**배포 후**:
- [ ] 프로덕션 환경에서 동작 확인
- [ ] 주요 사용자 플로우 테스트
- [ ] 에러 로그 확인
- [ ] 성능 모니터링

### 7.4 배포 권장사항

**배포 플랫폼**:
- Vercel, Netlify, AWS S3 + CloudFront 등

**CI/CD**:
- GitHub Actions, GitLab CI 등 활용 권장

**모니터링**:
- Sentry, LogRocket 등 에러 트래킹 도구 설정 권장

---

## 8. 유지보수 가이드

### 8.1 프로젝트 구조 이해

**디렉토리 구조**:
```
프로젝트 루트/
├── src/
│   ├── components/          # React 컴포넌트
│   ├── hooks/               # Custom Hooks
│   ├── utils/               # 유틸리티 함수
│   ├── types/               # TypeScript 타입
│   └── App.tsx              # 메인 애플리케이션
├── .claude/outputs/         # 프로젝트 산출물
└── ...
```

**주요 파일**:
- `src/App.tsx`: 애플리케이션 진입점
- `src/components/`: 주요 컴포넌트
- `package.json`: 의존성 및 스크립트

### 8.2 일반적인 작업

**새 컴포넌트 추가**:
1. `src/components/{ComponentName}/` 디렉토리 생성
2. `index.tsx` 파일 작성
3. `{ComponentName}.test.tsx` 테스트 파일 작성
4. 테스트 실행 및 검증

**버그 수정**:
1. 이슈 재현
2. 관련 테스트 추가 (TDD Red 단계)
3. 코드 수정 (TDD Green 단계)
4. 리팩토링 (TDD Refactor 단계)
5. 모든 테스트 통과 확인

**의존성 업데이트**:
```bash
# 최신 버전 확인
npm outdated

# 의존성 업데이트
npm update

# 주요 버전 업그레이드
npm install {package}@latest
```

### 8.3 트러블슈팅

#### 문제 1: 테스트 실패
**증상**: `npm test` 실행 시 테스트 실패
**해결**:
1. 실패한 테스트 로그 확인
2. 관련 코드 검토
3. 환경 변수 확인
4. 의존성 재설치 (`rm -rf node_modules && npm install`)

#### 문제 2: 빌드 실패
**증상**: `npm run build` 실행 시 빌드 실패
**해결**:
1. TypeScript 에러 확인 (`tsc --noEmit`)
2. ESLint 에러 확인 (`npm run lint`)
3. 환경 변수 확인
4. 빌드 캐시 삭제 후 재시도

#### 문제 3: 성능 저하
**증상**: 애플리케이션 느림
**해결**:
1. React DevTools Profiler로 성능 측정
2. 불필요한 리렌더링 확인
3. 메모이제이션 적용 (`useMemo`, `useCallback`)
4. 번들 사이즈 확인

### 8.4 도움 받기

**문서**:
- PRD: `.claude/outputs/{project-id}/prd.md`
- 구현 상태 리포트: `.claude/outputs/{project-id}/implementation-status-report.md`
- QA 리포트: `.claude/outputs/{project-id}/qa-report.md`

**커뮤니티**:
- React 공식 문서: https://react.dev
- TypeScript 공식 문서: https://www.typescriptlang.org

---

## 9. 산출물 참조

### 9.1 주요 산출물

- **PRD**: `.claude/outputs/{project-id}/prd.md`
- **테스트 시나리오**: `.claude/outputs/{project-id}/test-scenarios.md`
- **테스트 코드 구현 리포트**: `.claude/outputs/{project-id}/test-implementation-report.md`
- **구현 상태 리포트**: `.claude/outputs/{project-id}/implementation-status-report.md`
- **QA 리포트**: `.claude/outputs/{project-id}/qa-report.md`
- **리팩토링 리포트**: `.claude/outputs/{project-id}/refactoring-report.md`
- **문서 인덱스**: `.claude/outputs/{project-id}/index.md`

### 9.2 Git 커밋 히스토리

**주요 커밋**:
```
{commit-hash} - docs(PROJ-007): [Doc Keeper] Add documentation index for {feature-name}
{commit-hash} - refactor(PROJ-006): [Refactorer] Refactor {feature-name} code
{commit-hash} - test(PROJ-005): [QA] Add QA report for {feature-name}
{commit-hash} - feat(PROJ-004): [Implementer] Complete {feature-name} implementation
{commit-hash} - test(PROJ-003): [Test Writer] Add failing tests for {feature-name} (Red phase)
{commit-hash} - test(PROJ-002): [Test Designer] Add test scenarios for {feature-name}
{commit-hash} - docs(PROJ-001): [PM] Add PRD for {feature-name}
```

---

## 10. 프로젝트 완료 체크리스트

### 10.1 기능 완성도
- [ ] ✅ 모든 요구사항 구현 완료
- [ ] ✅ 모든 테스트 통과
- [ ] ✅ 테스트 커버리지 70% 이상
- [ ] ✅ 빌드 성공

### 10.2 품질 기준
- [ ] ✅ TypeScript 타입 에러 없음
- [ ] ✅ ESLint 에러 없음
- [ ] ✅ Lighthouse 성능 점수 90점 이상
- [ ] ✅ Lighthouse 접근성 점수 100점
- [ ] ✅ WCAG 2.1 Level AA 준수

### 10.3 문서화
- [ ] ✅ PRD 작성 완료
- [ ] ✅ 테스트 시나리오 작성 완료
- [ ] ✅ 구현 상태 리포트 작성 완료
- [ ] ✅ QA 리포트 작성 완료
- [ ] ✅ 리팩토링 리포트 작성 완료
- [ ] ✅ 문서 인덱스 작성 완료
- [ ] ✅ 최종 프로젝트 리포트 작성 완료

### 10.4 배포 준비
- [ ] ✅ 빌드 설정 완료
- [ ] ✅ 환경 변수 문서화 완료
- [ ] ✅ 배포 가이드 작성 완료
- [ ] ✅ 유지보수 가이드 작성 완료

---

## 11. 변경 이력

| 버전 | 날짜 | 작성자 | 변경 내용 |
|------|------|--------|-----------|
| 1.0.0 | YYYY-MM-DD | Doc Keeper Agent | 최종 프로젝트 리포트 작성 |

---

## 결론

{프로젝트의 전반적인 성과와 품질을 2-3문장으로 요약}

**프로젝트 상태**: ✅ 완료 및 배포 준비 완료

**다음 단계**: {배포 또는 다음 단계 제안}

---

**이 리포트는 프로젝트의 최종 산출물이며, 배포 및 유지보수의 핵심 참조 문서입니다.**
```

---

## 출력 위치 및 파일 관리

### 디렉토리 구조

```
.claude/outputs/
└── {project-id}/                    # 예: PROJ-001-20250130
    ├── prd.md                       # PM 산출물
    ├── test-scenarios.md            # Test Designer 산출물
    ├── test-implementation-report.md # Test Writer 산출물
    ├── implementation-status-report.md # Implementer 산출물
    ├── qa-report.md                 # QA 산출물
    ├── refactoring-report.md        # Refactorer 산출물
    ├── index.md                     # Doc Keeper 산출물 ⭐
    └── final-report.md              # Doc Keeper 산출물 ⭐
```

### 파일 경로 규칙

- **문서 인덱스**: `.claude/outputs/{project-id}/index.md`
- **최종 프로젝트 리포트**: `.claude/outputs/{project-id}/final-report.md`
- **예시**: `.claude/outputs/PROJ-001-20250130/index.md`

### 티켓 번호

- Doc Keeper 티켓 번호 (예: PROJ-007)

---

## 주요 원칙

### 완전성 원칙
- 모든 산출물을 빠짐없이 인덱싱
- 누락된 문서 식별 및 기록
- 모든 링크 유효성 확인

### 명확성 원칙
- 각 산출물의 역할과 내용을 명확히 설명
- 용어 일관성 유지
- 가독성 높은 구조

### 접근성 원칙
- 계층적 구조로 쉽게 탐색 가능
- 주요 정보 빠르게 찾을 수 있음
- 명확한 네비게이션 제공

### 유지보수성 원칙
- 향후 업데이트 용이한 구조
- 표준화된 포맷 사용
- 버전 정보 명시

---

**이 템플릿은 Doc Keeper 에이전트가 산출물을 생성할 때 반드시 따라야 하는 표준 형식이다.**
