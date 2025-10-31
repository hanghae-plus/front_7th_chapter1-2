# 코드 리뷰 가이드

## 📋 Description

이 가이드는 2주차 과제의 효율적인 코드 리뷰를 위해 작성되었습니다. 전체적인 프로젝트 구조, 개발 방법론, 그리고 코드 품질에 대한 이해를 돕기 위한 가이드입니다.

### 🎯 프로젝트 특징

- 추후 업데이트

## 0. 언어 관련

- 1주차에는 `영어`를 기반으로 커밋 | 주석 | PR제목 등이 작성되었습니다.
  - 이는 오로지 **제가** 사용하기 편한 언어를 사용한 것으로, **리뷰어**의 입장은 고려되지 않았기에, 이번 주차 부터는 아래와 같이 국문과 영문을 혼용합니다.
  - 커밋의 경우, 영어를 사용하는 것이 제 의도가 더 잘 전달된다고 생각하며, 간결하게 작성할 수 있기에 꾸준히 영어로 생성합니다.
    - 단, 커밋의 경우 앞으로 body에 국문을 병기하도록 하겠습니다.
  - PR 제목 또한 꾸준히 영문을 사용하나, 최상단에 국문을 병기하는 방향으로 작성하도록 하겠습니다.
  - `주석`은 최대한 국문을 사용하는 것을 목표로 하겠습니다.

## 1. 커밋 관련

- 이번 과제는 매 작업 시 `fork`한 브랜치에서 제가 별도로 구상한 ISSUE 번호로 작업하였습니다. 이슈 번호는 `ISSUES/`에 적어둡니다.
  - 이슈 생성 시 `Docs({Issue_Number}): Create {TITLE} issue` 라는 커밋 사용
  - 현재 FORK한 브랜치에서는 이슈 생성이 불가하므로, 부득이하게 이런 방식으로 작업하였습니다.
  - 이 방식을 사용한 이유:
    - 한 번에 커밋하게 될 경우 `files changes`가 너무 많아질 것을 우려하였습니다.
- 매 커밋은 아래와 같은 형태로 작성합니다.
  - `{Commit_Type}({Issue_Number}): {COMMIT_TITLE}`
    - 예시: `Docs(1): Add Joshua's Code Review Guide`
      - 익숙한 방법인 `#{Issue_Number}`로 날릴 경우, 다른 분들의 PR로 연결될 것 같아 #을 뺍니다.
- 커밋 명은 기본적으로 영어로 작성, 그러나 body의 최상단에 국문 제목 병기
- 커밋 body를 적극 활용하여 수행한 작업의 요약을 포

## 2. 브랜치 관련

- 이번 과제 또한 아래와 같은 형태의 `branch 전략`을 활용합니다.
  - 1. `hanghae-plus:main`에서 `joshuayeyo:hh-week2`으로 FORK
  - 2. 이슈 생성 후 `{Commit_Type}/{Issue_Number}/{Title}`의 형태로 새로운 **branch**를 생성합니다.
  - 3. 매 이슈 종료 후 `joshuayeyo:hh-week2/main` 브랜치로 `Squash Merge`를 진행합니다. 이는 최종 PR에서의 커밋 히스토리가 지나치게 길어지는 것을 방지하기 위함입니다🙇🏻‍♂️.
    - 번거로우시겠지만, 개별 브랜치에서 `n Commits`를 확인해주시면 감사하겠습니다🙏🏻🥹

## 3. PR

### 테스트 관련 PR 양식

- **PR 템플릿 사용**: `markdowns/templates/Test_PR.md` 템플릿을 활용하여 일관된 형태로 작성
- **필수 포함 사항**:
  - 📝 주요 변경사항 (구현된 테스트 함수와 개수)
  - 🔍 기술적 세부사항 (코드 예시 및 사용된 데이터)
  - 🚨 발견된 이슈나 질문사항 (설계 문제, 개선 제안)
  - 📊 테스트 현황 (통과/실패 여부, 커버리지)
  - 🎯 리뷰 포인트 (중점 검토 요청사항)

### PR 제목 규칙

- `#{이슈번호} {타입}: {간단한 설명}`
- 예시: `#8 Test: Implement comprehensive unit tests for eventOverlap functions`

### 코드 리뷰 요청 시 확인사항

- [ ] 모든 테스트가 통과하는가?
- [ ] 에러 처리가 적절한가?
- [ ] 테스트 커버리지가 충분한가?
- [ ] 설계 이슈나 개선점이 명확히 기술되었는가?

## 커밋 타입

```
Feat: 전반적인 기능 구현
Docs: 리드미와 같은 문서 작업
Test: 테스트 코드 추가 oR 삭제할 경우
Chore: 빌드 테스트 업데이트, 패키지 매니저 설정
Refactor: 전반적인 리팩토링
Fix: 버그 수정
Remove: 파일 삭제
Move: 파일 이동
Comment: 주석 추가 oR 변경
```

## 코딩 스타일

**상세한 코딩 표준은 `markdowns/process/CODING_STANDARDS.md`를 참조하세요.**
**AI 기반 개발 워크플로우는 `markdowns/process/DEVELOPMENT_WORKFLOW.md`를 참조하세요.**

### 주요 네이밍 컨벤션

- **풀네임 사용**: 축약형보다는 명확한 풀네임 사용

  - 🙆🏻‍♂️: `aespaKarina`
  - 🙅🏻‍♂️: `aspKrna`

- **함수명**: 동사 + 명사 형태로 명확한 동작 표현 (15-20줄 이하)

  - 🙆🏻‍♂️: `getDaysInMonth`, `formatWeek`, `convertEventToDateRange`
  - 🙅🏻‍♂️: `monthDays`, `weekFormat`, `eventToRange`

- **폴더명**: kebab-case로 통일

  - 🙆🏻‍♂️: `event-forms`, `code-review`
  - 🙅🏻‍♂️: `eventForms`, `codeReview`

- **상수명**: UPPER_SNAKE_CASE 사용

  - 🙆🏻‍♂️: `AESPA_MEMBERS`, `NOTIFICATION_OPTIONS`
  - 🙅🏻‍♂️: `aespaMembers`, `notificationOptions`

- **타입명**: PascalCase + 명확한 접미사 (별도 `src/types/` 디렉토리에 정의)
  - 🙆🏻‍♂️: `EventForm.types`, `Calendar.types`, `RepeatType`
  - 🙅🏻‍♂️: `eventform`, `calendar`, `repeat`

### 리뷰 포인트별 체크리스트

#### 1. 타입 안전성 검토

- [ ] 리터럴 타입을 활용한 명확한 유니온 타입 정의
  ```typescript
  // ✅ 명확한 리터럴 타입
  export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  ```
- [ ] 인터페이스 확장을 통한 타입 재사용
- [ ] 제네릭보다는 명시적 타입 지정 선호
- [ ] 필수/선택 프로퍼티 구분 명확성

#### 2. 함수 설계 원칙

- [ ] 단일 책임 원칙: 한 함수당 15-20줄 이하
- [ ] 불변성 보장: 원본 데이터 수정 금지
  ```typescript
  // ✅ 불변성 보장
  getEvents(): Event[] {
    return [...this.events];
  }
  ```
- [ ] Early Return 패턴 활용
- [ ] 기본값을 통한 사용성 향상
- [ ] 명확한 반환 타입 (null 반환으로 실패 표현)

#### 3. 클래스 설계 검증

- [ ] Private 멤버를 통한 캡슐화
- [ ] 생성자에서 불변성 보장
- [ ] 명확한 메서드명과 일관된 반환 타입
- [ ] null 반환을 통한 명시적 실패 처리

#### 4. React 컴포넌트 패턴

- [ ] Props 타입 별도 파일 분리
- [ ] 접근성 고려 (aria-label, 시맨틱 마크업)
- [ ] 컴포넌트명의 명확성 (PascalCase + 기능 표현)
- [ ] 적절한 훅 사용과 의존성 배열 관리

#### 5. 비동기 처리 품질

- [ ] 일관된 async/await 사용
- [ ] Try-catch를 통한 에러 핸들링
- [ ] 사용자 친화적 한국어 에러 메시지
- [ ] 로딩 상태 및 에러 상태 적절한 처리

### 파일 구조 및 주석

- **파일 상단 주석**: 영어 + 한국어 병기

  ```typescript
  // Calendar component managing the display of week and month views
  // 주간 및 월간 뷰 표시를 관리하는 캘린더 컴포넌트
  ```

- **파일 길이**: 코드 파일(.ts, .tsx, .js, .jsx)은 주석 포함하여 최대한 80줄 이하로 유지
  - 코드 파일이 80줄 초과 시 파일 최상단에 주석으로 **사유** 명시
  - 문서 파일(.md, .json, .yaml)은 80줄 제한에서 제외

### Import/Export 스타일

- **Import 순서**:

  1. React 관련 라이브러리
  2. 외부 라이브러리 (MUI 등)
  3. 내부 컴포넌트
  4. 타입 정의
  5. 유틸리티 함수

  ```typescript
  import { useEffect, useState } from 'react';
  import { Stack, FormControl } from '@mui/material';
  import { CalendarHeader } from './calendars/CalendarHeader';
  import { CalendarProps } from '@/types/Calendar.types';
  import { fetchHolidays } from '@/apis/fetchHolidays';
  ```

- **Export 방식**: named export 선호, 모듈 단위로 re-export

  ```typescript
  // ✅ 개별 파일에서 named export
  export const parseDateTime = (date: string, time: string) => { ... }

  // ✅ 모듈 단위 re-export (dateUtils.ts)
  export { fillZero } from './dates/fillZero';
  export { formatDate } from './dates/formatDate';
  ```

### 컴포넌트 스타일

- **Props 타입**: 별도 파일로 분리하여 재사용성 확보

  ```typescript
  // types/EventForm.types.ts
  export interface BasicFieldsProps { ... }
  ```

- **컴포넌트 명**: PascalCase + 기능을 명확히 표현
  - 🙆🏻‍♂️: `BasicFields`, `CalendarHeader`, `ScheduleCard`
  - 🙅🏻‍♂️: `Fields`, `Header`, `Card`

### 함수 및 로직 스타일

- **함수 길이**: 한 함수당 15-20줄 이하로 단일 책임 원칙 준수
- **타입 안정성**: 엄격한 TypeScript 타입 사용
  - any 금지
  ```typescript
  // ✅ 명확한 타입 정의
  export const useCalendarView = (): {
    view: 'week' | 'month';
    setView: (view: 'week' | 'month') => void;
    currentDate: Date;
    // ...
  } => { ... }
  ```

### 테스트 코드 스타일

- **테스트 설명**: 한국어로 명확한 동작 기술

  ```typescript
  it('1월은 31일 수를 반환한다', () => { ... })
  it('주어진 월의 공휴일만 반환한다', () => { ... })
  ```

- **expect 방식**: 객체 직접 비교 선호

  ```typescript
  // ✅ 객체 직접 비교
  expect(result).toEqual({ '2025-03-01': '삼일절' });

  // ❌ JSON 문자열 비교
  expect(result).toEqual('{"2025-03-01": "삼일절"}');
  ```
