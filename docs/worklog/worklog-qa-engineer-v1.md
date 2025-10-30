# Worklog

- 작성자: QA Engineer
- 업무 지시 내용: 반복 일정 기능에 대한 통합 테스트 케이스 문서 작성
- 참고자료:
  - docs/prd/prd-recurring-events-v3.md
  - docs/sprint/sprint-plan-recurring-events-20251029.md
  - src/**tests**/medium.integration.spec.tsx
- 산출물: docs/testcases/recurring-events-testcases.md

## 업무 과정

1. **기존 코드 확인**

   - src/types.ts에서 RepeatInfo, EventForm, Event 타입 확인
   - src/hooks/useEventOperations.ts에서 이벤트 CRUD 로직 확인
   - src/**tests**/medium.integration.spec.tsx에서 기존 통합 테스트 패턴 분석
   - 기존 유틸리티 함수들(eventUtils.ts, dateUtils.ts) 확인

2. **수용 기준 추출**

   - PRD v3에서 90개의 사용자 시나리오 추출
   - 반복 일정 생성 (4가지 유형: 매일, 매주, 매월, 매년)
   - 반복 일정 수정 (단일/전체 선택 분기)
   - 반복 일정 삭제 (단일/전체 선택 분기)
   - 반복 일정 시각적 표시 (MUI Repeat 아이콘, 반복 정보 텍스트)
   - 특수 날짜 처리 (매월 31일, 윤년 2월 29일)

3. **경계값 및 예외 시나리오 정의**

   - 매월 31일 반복 시 31일이 없는 달(2월, 4월, 6월, 9월, 11월) 건너뛰기
   - 윤년 2월 29일 매년 반복 시 평년 건너뛰기
   - 반복 종료일 검증 (시작일 이후여야 함)
   - 반복 종료일 없음 (무한 반복)
   - 시작일 = 종료일 (1개 일정만 생성)
   - 반복 일정은 겹침 검사 제외

4. **테스트 유형 분류**

   - 통합 테스트: 사용자 시나리오 기반 15개 시나리오 작성
     - 시나리오 1-7: 반복 일정 생성 (매일/매주/매월/매년, 특수 날짜, 무한 반복)
     - 시나리오 8-9: 반복 일정 수정 (단일/전체)
     - 시나리오 10-11: 반복 일정 삭제 (단일/전체)
     - 시나리오 12-13: 예외 케이스 (겹침 검사 제외, 종료일 검증)
     - 시나리오 14-15: 뷰 표시 (주간/월간 뷰)
   - 유닛 테스트: 개별 함수/모듈 기반 6개 함수 식별
     - generateRecurringDates, validateRecurringConfig, splitRecurringEvent
     - getRepeatText, expandRecurringEvents, useEventOperations 확장

5. **통합 테스트 케이스 문서 작성**

   - 각 시나리오마다 목적, 전제 조건, 테스트 단계, 기대 결과 상세 작성
   - 경계값 케이스를 시나리오에 포함하여 명시
   - Test First Engineer가 테스트 코드 작성 시 참고할 수 있도록 충분히 상세하게 작성
   - 기존 통합 테스트 파일 참고 경로 명시

6. **유닛 테스트 작성 가이드 작성**
   - 필요한 유닛 테스트 6개 함수별로 테스트 케이스 나열
   - 경계값 테스트 케이스 8개 명시
   - 테스트 데이터 예시 10개 작성 (입력값, 예상 결과, 이유 포함)
   - 특수 날짜 처리 로직 상세 설명
   - repeatGroupId 관리 규칙 명시

## 참고 파일

- docs/prd/prd-recurring-events-v3.md
- docs/sprint/sprint-plan-recurring-events-20251029.md
- src/types.ts
- src/hooks/useEventOperations.ts
- src/**tests**/medium.integration.spec.tsx
- templates/testcases/testcases.md.hbs

## 다음 작업자에게 남기는 코멘트

Test First Engineer는 이 테스트 케이스 문서(`docs/testcases/recurring-events-testcases.md`)를 바탕으로 실제 테스트 코드를 작성해주세요.

### 통합 테스트 작성 시

**파일명**: `src/__tests__/recurring-events.integration.spec.tsx`

**패턴 참고**: `src/__tests__/medium.integration.spec.tsx`

**작성 방법**:

- 기존 `setup()` 헬퍼 함수 재사용
- 기존 `saveSchedule()` 헬퍼 함수를 확장하여 반복 일정 입력 처리 추가
- userEvent를 사용하여 사용자 시나리오대로 작성
- 다이얼로그 테스트 시 MUI Dialog의 "예"/"아니오" 버튼 선택 포함
- MSW 핸들러 설정하여 API 모킹

**주의사항**:

- 반복 일정 수정/삭제 시 다이얼로그가 표시되는지 확인
- repeatGroupId가 올바르게 생성/유지되는지 확인
- MUI Repeat 아이콘이 표시되는지 확인
- 반복 정보 텍스트 형식이 정확한지 확인

### 유닛 테스트 작성 시

**파일 구조**:

```
src/__tests__/unit/
  easy.generateRecurringDates.spec.ts
  easy.validateRecurringConfig.spec.ts
  medium.splitRecurringEvent.spec.ts
  easy.getRepeatText.spec.ts
  easy.expandRecurringEvents.spec.ts
```

**패턴 참고**: 기존 유닛 테스트 파일들 (`src/__tests__/unit/easy.*.spec.ts`)

**작성 방법**:

- 각 함수별로 별도 파일로 분리 (1:1 매칭)
- describe 블록으로 함수명 명시
- it 블록으로 각 테스트 케이스 명시
- 경계값 케이스를 빠짐없이 포함

**특히 중요한 경계값 테스트**:

1. **매월 31일 반복**: 31일이 없는 달(2월, 4월, 6월, 9월, 11월) 건너뛰기 확인
2. **윤년 2월 29일 매년 반복**: 평년 건너뛰기 확인
3. **반복 종료일 검증**: 시작일 >= 종료일 에러 처리
4. **무한 반복**: endDate=undefined 처리

**테스트 데이터**:

- 문서의 "테스트 데이터 예시" 섹션을 활용하세요
- 각 예시에는 입력값, 예상 결과, 이유가 명시되어 있습니다

**repeatGroupId 테스트**:

- 생성 시 고유 ID 자동 생성 확인
- 단일 일정 수정/삭제 시 원본 repeatGroupId 유지 확인
- 전체 일정 수정/삭제 시 repeatGroupId로 조회 확인

### 구현 전 확인사항

다음 함수들이 아직 구현되지 않았으므로 RED 테스트를 먼저 작성해주세요:

- `generateRecurringDates`: 반복 일정 날짜 생성
- `validateRecurringConfig`: 반복 설정 검증
- `splitRecurringEvent`: 반복 일정 분할 (단일 수정/삭제 시)
- `getRepeatText`: 반복 정보 텍스트 생성
- `expandRecurringEvents`: 반복 일정 인스턴스 전개

기존 `useEventOperations` 훅을 확장하여 반복 일정 CRUD를 지원하도록 수정해야 합니다.

### 특수 날짜 처리 로직 구현 시 참고

**매월 31일 규칙**:

```typescript
// 31일이 있는 달: 1, 3, 5, 7, 8, 10, 12
// 31일이 없는 달: 2, 4, 6, 9, 11
const daysInMonth = new Date(year, month + 1, 0).getDate();
if (dayOfMonth > daysInMonth) {
  // 건너뛰고 다음 달로
  continue;
}
```

**윤년 2월 29일 규칙**:

```typescript
const isLeapYear = (year: number) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

if (month === 1 && dayOfMonth === 29 && !isLeapYear(year)) {
  // 평년이면 건너뛰고 다음 해로
  continue;
}
```

**반복 간격**: PRD에 명시된 대로 항상 `interval: 1`로 고정되어 있습니다.

테스트 작성 시 궁금한 점이 있으면 이 worklog나 테스트 케이스 문서를 다시 참고해주세요!
