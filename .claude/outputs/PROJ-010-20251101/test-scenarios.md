# 테스트 시나리오: 반복 일정 인터벌 기능

**프로젝트 ID**: PROJ-010-20251101
**티켓**: PROJ-002
**버전**: 1.0.0
**작성일**: 2025-11-01
**작성자**: Test Designer Agent

---

## 1. 테스트 개요

### 1.1 기능 요약

반복 일정 생성 시 인터벌(간격) 설정 기능 구현
- 인터벌 입력 UI 추가
- generateRecurringEvents 함수에 인터벌 파라미터 적용
- 매일/매주/매월/매년 반복에 인터벌 배수 적용

**참조**:
- **PRD**: `.claude/outputs/PROJ-010-20251101/prd.md`
- **현재 구현**: `src/utils/recurringEventUtils.ts`
- **타입 정의**: `src/types.ts`

### 1.2 테스트 목표

**주요 테스트 목표**:
- generateRecurringEvents 함수가 interval 파라미터를 올바르게 처리하는지 검증
- 4가지 반복 유형(매일/매주/매월/매년) 모두 인터벌 적용 검증
- UI에서 인터벌 입력 및 저장 플로우 검증
- 기존 기능 회귀 없음 확인

**테스트 범위**:
- **단위 테스트**: generateRecurringEvents 함수
- **통합 테스트**: 일정 생성 폼 → 서버 저장 → 목록 표시

**테스트 커버리지 목표**: 70% 이상 유지

---

## 2. 단위 테스트 시나리오

### 2.1 generateRecurringEvents 함수 - 매일 반복 인터벌

**테스트 대상**: `src/utils/recurringEventUtils.ts`의 `generateRecurringEvents` 함수

#### Scenario 1: 매일 반복 - 인터벌 1 (기본값)

- **Given**:
  - startDate: 2025-01-01
  - endDate: 2025-01-05
  - repeatType: 'daily'
  - interval: 1
- **When**: generateRecurringEvents 호출
- **Then**:
  - [ ] 5개 이벤트 생성 (1/1, 1/2, 1/3, 1/4, 1/5)
  - [ ] 모든 이벤트의 repeat.interval이 1
  - [ ] 모든 이벤트의 repeat.type이 'daily'

**우선순위**: High

**테스트 데이터**:
```typescript
{
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-01-05'),
  repeatType: 'daily',
  interval: 1,
  eventData: {
    title: '매일 운동',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '개인',
    notificationTime: 10,
  }
}
```

---

#### Scenario 2: 매일 반복 - 인터벌 2 (하루 건너뛰기)

- **Given**:
  - startDate: 2025-01-01
  - endDate: 2025-01-10
  - repeatType: 'daily'
  - interval: 2
- **When**: generateRecurringEvents 호출
- **Then**:
  - [ ] 5개 이벤트 생성 (1/1, 1/3, 1/5, 1/7, 1/9)
  - [ ] 모든 이벤트의 repeat.interval이 2
  - [ ] 날짜 간격이 정확히 2일

**우선순위**: High

**테스트 데이터**:
```typescript
{
  interval: 2,
  // 나머지는 Scenario 1과 동일
}
```

---

#### Scenario 3: 매일 반복 - 인터벌 7 (일주일 간격)

- **Given**:
  - startDate: 2025-01-01
  - endDate: 2025-02-01
  - repeatType: 'daily'
  - interval: 7
- **When**: generateRecurringEvents 호출
- **Then**:
  - [ ] 5개 이벤트 생성 (1/1, 1/8, 1/15, 1/22, 1/29)
  - [ ] 모든 이벤트의 repeat.interval이 7
  - [ ] 날짜 간격이 정확히 7일

**우선순위**: Medium

---

### 2.2 generateRecurringEvents 함수 - 매주 반복 인터벌

#### Scenario 4: 매주 반복 - 인터벌 1 (매주)

- **Given**:
  - startDate: 2025-01-01 (수요일)
  - endDate: 2025-02-01
  - repeatType: 'weekly'
  - interval: 1
- **When**: generateRecurringEvents 호출
- **Then**:
  - [ ] 5개 이벤트 생성 (1/1, 1/8, 1/15, 1/22, 1/29)
  - [ ] 모든 이벤트가 같은 요일 (수요일)
  - [ ] 모든 이벤트의 repeat.interval이 1

**우선순위**: High

---

#### Scenario 5: 매주 반복 - 인터벌 2 (격주)

- **Given**:
  - startDate: 2025-01-01 (수요일)
  - endDate: 2025-03-01
  - repeatType: 'weekly'
  - interval: 2
- **When**: generateRecurringEvents 호출
- **Then**:
  - [ ] 5개 이벤트 생성 (1/1, 1/15, 1/29, 2/12, 2/26)
  - [ ] 모든 이벤트가 같은 요일 (수요일)
  - [ ] 날짜 간격이 정확히 14일
  - [ ] 모든 이벤트의 repeat.interval이 2

**우선순위**: High

**테스트 데이터**:
```typescript
{
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-03-01'),
  repeatType: 'weekly',
  interval: 2,
  eventData: { title: '격주 회의', ... }
}
```

---

#### Scenario 6: 매주 반복 - 인터벌 4 (4주 간격)

- **Given**:
  - startDate: 2025-01-01
  - endDate: 2025-05-01
  - repeatType: 'weekly'
  - interval: 4
- **When**: generateRecurringEvents 호출
- **Then**:
  - [ ] 5개 이벤트 생성 (약 1개월 간격)
  - [ ] 모든 이벤트의 repeat.interval이 4
  - [ ] 날짜 간격이 정확히 28일

**우선순위**: Medium

---

### 2.3 generateRecurringEvents 함수 - 매월 반복 인터벌

#### Scenario 7: 매월 반복 - 인터벌 1 (매월)

- **Given**:
  - startDate: 2025-01-15
  - endDate: 2025-05-15
  - repeatType: 'monthly'
  - interval: 1
- **When**: generateRecurringEvents 호출
- **Then**:
  - [ ] 5개 이벤트 생성 (1/15, 2/15, 3/15, 4/15, 5/15)
  - [ ] 모든 이벤트가 15일
  - [ ] 모든 이벤트의 repeat.interval이 1

**우선순위**: High

---

#### Scenario 8: 매월 반복 - 인터벌 2 (격월)

- **Given**:
  - startDate: 2025-01-15
  - endDate: 2025-09-15
  - repeatType: 'monthly'
  - interval: 2
- **When**: generateRecurringEvents 호출
- **Then**:
  - [ ] 5개 이벤트 생성 (1/15, 3/15, 5/15, 7/15, 9/15)
  - [ ] 모든 이벤트가 15일
  - [ ] 월 간격이 정확히 2개월
  - [ ] 모든 이벤트의 repeat.interval이 2

**우선순위**: High

**테스트 데이터**:
```typescript
{
  startDate: new Date('2025-01-15'),
  endDate: new Date('2025-09-15'),
  repeatType: 'monthly',
  interval: 2,
  eventData: { title: '격월 점검', ... }
}
```

---

#### Scenario 9: 매월 반복 - 인터벌 3 (분기별)

- **Given**:
  - startDate: 2025-01-01
  - endDate: 2026-01-01
  - repeatType: 'monthly'
  - interval: 3
- **When**: generateRecurringEvents 호출
- **Then**:
  - [ ] 5개 이벤트 생성 (1/1, 4/1, 7/1, 10/1, 2026/1/1)
  - [ ] 월 간격이 정확히 3개월
  - [ ] 모든 이벤트의 repeat.interval이 3

**우선순위**: Medium

---

#### Scenario 10: 매월 반복 - 31일 + 인터벌 2 (엣지 케이스)

- **Given**:
  - startDate: 2025-01-31
  - endDate: 2025-09-01
  - repeatType: 'monthly'
  - interval: 2
- **When**: generateRecurringEvents 호출
- **Then**:
  - [ ] 2월은 건너뛰고 3/31, 5/31, 7/31만 생성
  - [ ] 4월, 6월은 31일이 없어서 건너뜀
  - [ ] 모든 이벤트가 31일
  - [ ] 모든 이벤트의 repeat.interval이 2

**우선순위**: High (엣지 케이스)

**테스트 데이터**:
```typescript
{
  startDate: new Date('2025-01-31'),
  endDate: new Date('2025-09-01'),
  repeatType: 'monthly',
  interval: 2,
  eventData: { title: '월말 정산', ... }
}
```

---

### 2.4 generateRecurringEvents 함수 - 매년 반복 인터벌

#### Scenario 11: 매년 반복 - 인터벌 1 (매년)

- **Given**:
  - startDate: 2025-01-01
  - endDate: 2029-01-01
  - repeatType: 'yearly'
  - interval: 1
- **When**: generateRecurringEvents 호출
- **Then**:
  - [ ] 5개 이벤트 생성 (2025/1/1, 2026/1/1, 2027/1/1, 2028/1/1, 2029/1/1)
  - [ ] 모든 이벤트가 1월 1일
  - [ ] 모든 이벤트의 repeat.interval이 1

**우선순위**: High

---

#### Scenario 12: 매년 반복 - 인터벌 2 (격년)

- **Given**:
  - startDate: 2025-03-15
  - endDate: 2033-03-15
  - repeatType: 'yearly'
  - interval: 2
- **When**: generateRecurringEvents 호출
- **Then**:
  - [ ] 5개 이벤트 생성 (2025, 2027, 2029, 2031, 2033)
  - [ ] 모든 이벤트가 3월 15일
  - [ ] 연도 간격이 정확히 2년
  - [ ] 모든 이벤트의 repeat.interval이 2

**우선순위**: High

**테스트 데이터**:
```typescript
{
  startDate: new Date('2025-03-15'),
  endDate: new Date('2033-03-15'),
  repeatType: 'yearly',
  interval: 2,
  eventData: { title: '격년 행사', ... }
}
```

---

#### Scenario 13: 매년 반복 - 2월 29일 + 인터벌 2 (엣지 케이스)

- **Given**:
  - startDate: 2024-02-29 (윤년)
  - endDate: 2034-02-29
  - repeatType: 'yearly'
  - interval: 2
- **When**: generateRecurringEvents 호출
- **Then**:
  - [ ] 윤년만 생성 (2024, 2028, 2032)
  - [ ] 2026, 2030년은 건너뜀 (평년)
  - [ ] 모든 이벤트가 2월 29일
  - [ ] 모든 이벤트의 repeat.interval이 2

**우선순위**: Medium (엣지 케이스)

---

### 2.5 generateRecurringEvents 함수 - 엣지 케이스

#### Scenario 14: 인터벌 매우 큰 경우

- **Given**:
  - startDate: 2025-01-01
  - endDate: 2025-01-10
  - repeatType: 'daily'
  - interval: 100 (매우 큰 값)
- **When**: generateRecurringEvents 호출
- **Then**:
  - [ ] 1개 이벤트만 생성 (2025-01-01)
  - [ ] 에러 발생하지 않음

**우선순위**: Low

---

#### Scenario 15: 종료일이 시작일보다 이른 경우

- **Given**:
  - startDate: 2025-01-10
  - endDate: 2025-01-01
  - repeatType: 'daily'
  - interval: 1
- **When**: generateRecurringEvents 호출
- **Then**:
  - [ ] 빈 배열 반환 ([])
  - [ ] 에러 발생하지 않음

**우선순위**: Medium

---

#### Scenario 16: 종료일이 null인 경우

- **Given**:
  - startDate: 2025-01-01
  - endDate: null
  - repeatType: 'daily'
  - interval: 1
- **When**: generateRecurringEvents 호출
- **Then**:
  - [ ] 빈 배열 반환 ([])
  - [ ] 에러 발생하지 않음

**우선순위**: Medium

---

## 3. 통합 테스트 시나리오

### 3.1 UI에서 인터벌 설정 후 반복 일정 생성

#### Scenario 17: 격주 회의 일정 생성 전체 플로우

- **Given**: 사용자가 일정 추가 폼을 열음
- **When**:
  1. 제목에 "격주 회의" 입력
  2. 날짜 "2025-10-01" 선택
  3. 시작 시간 "14:00", 종료 시간 "15:00" 입력
  4. 카테고리 "업무" 선택
  5. "반복 일정" 체크박스 선택
  6. 반복 유형 "매주" 선택
  7. **인터벌 "2" 입력**
  8. 반복 종료일 "2025-12-31" 입력
  9. "일정 추가" 버튼 클릭
- **Then**:
  - [ ] 약 7개 이벤트 생성 (10/1, 10/15, 10/29, 11/12, 11/26, 12/10, 12/24)
  - [ ] 모든 이벤트의 repeat.interval이 2
  - [ ] 캘린더에서 격주로 일정 표시 확인
  - [ ] 서버에 올바르게 저장됨

**우선순위**: High

**테스트 헬퍼**: `fillAndSubmitRecurringEventForm` 확장 (interval 파라미터 추가 필요)

---

#### Scenario 18: 인터벌 기본값 동작 확인

- **Given**: 사용자가 일정 추가 폼을 열음
- **When**:
  1. 반복 일정 정보 입력
  2. **인터벌을 입력하지 않음** (기본값 사용)
  3. 일정 추가
- **Then**:
  - [ ] interval이 1로 설정됨
  - [ ] 기존 동작과 동일하게 작동 (매일/매주/매월/매년 연속)

**우선순위**: High

---

#### Scenario 19: 인터벌 0 또는 음수 입력

- **Given**: 사용자가 반복 일정 폼을 작성 중
- **When**:
  1. 인터벌 필드에 "0" 또는 "-1" 입력
  2. 일정 추가 시도
- **Then**:
  - [ ] 자동으로 1로 변경됨
  - [ ] 또는 유효성 검사 에러 표시
  - [ ] 일정 생성 시 interval=1로 저장

**우선순위**: Medium

---

#### Scenario 20: 인터벌 소수점 입력

- **Given**: 사용자가 반복 일정 폼을 작성 중
- **When**:
  1. 인터벌 필드에 "2.5" 입력
  2. 일정 추가
- **Then**:
  - [ ] 정수로 반올림되어 3 또는 2로 처리
  - [ ] 일정이 정상적으로 생성됨

**우선순위**: Low

---

### 3.2 기존 기능 회귀 테스트

#### Scenario 21: 기존 테스트 모두 통과

- **Given**: 기존 157개 테스트 존재
- **When**: 전체 테스트 실행 (`pnpm test`)
- **Then**:
  - [ ] 157개 테스트 모두 통과
  - [ ] 새로운 테스트 추가로 총 테스트 개수 증가
  - [ ] 회귀 없음

**우선순위**: High

---

#### Scenario 22: 단일 일정 생성 정상 동작

- **Given**: 사용자가 반복하지 않는 일반 일정 생성
- **When**: 일정 추가
- **Then**:
  - [ ] 기존처럼 단일 이벤트만 생성
  - [ ] repeat.type이 'none'
  - [ ] interval 필드 무시

**우선순위**: High

---

## 4. 테스트 데이터 명세

### 4.1 공통 Mock 데이터

```typescript
// 기본 이벤트 데이터
export const mockEventData = {
  title: '테스트 일정',
  startTime: '09:00',
  endTime: '10:00',
  description: '테스트 설명',
  location: '테스트 장소',
  category: '업무',
  notificationTime: 10,
};

// 반복 일정 파라미터
export const mockRecurringParams = {
  startDate: new Date('2025-01-01'),
  endDate: new Date('2025-12-31'),
  repeatType: 'weekly',
  interval: 2,
  eventData: mockEventData,
};
```

### 4.2 테스트 헬퍼 확장

#### 새로운 헬퍼: fillAndSubmitRecurringEventFormWithInterval

```typescript
export const fillAndSubmitRecurringEventFormWithInterval = async (
  user: UserEvent,
  eventData: Omit<Event, 'id' | 'notificationTime' | 'repeat'>,
  repeatType: '매일' | '매주' | '매월' | '매년',
  interval: number,  // 추가
  endDate: string
) => {
  // 기본 폼 작성
  await fillAndSubmitRecurringEventForm(user, eventData, repeatType, endDate);

  // 인터벌 입력 추가
  const intervalInput = screen.getByLabelText('반복 간격');
  await user.clear(intervalInput);
  await user.type(intervalInput, interval.toString());
};
```

---

## 5. Mocking 전략

### 5.1 날짜 Mocking

```typescript
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-10-01'));
});

afterEach(() => {
  vi.useRealTimers();
});
```

### 5.2 API Mocking (MSW)

기존 MSW 핸들러 확장 - interval 필드 포함

```typescript
rest.post('/api/events', (req, res, ctx) => {
  const event = req.body as Event;
  // interval 검증
  expect(event.repeat.interval).toBeGreaterThanOrEqual(1);
  return res(ctx.json({ success: true }));
})
```

---

## 6. 테스트 우선순위

### High Priority
- generateRecurringEvents 함수의 4가지 반복 유형 + 인터벌 (Scenario 1-2, 4-5, 7-8, 11-12)
- 통합 테스트: 전체 플로우 (Scenario 17-18)
- 기존 기능 회귀 (Scenario 21-22)

### Medium Priority
- 엣지 케이스: 31일, 2월 29일 (Scenario 10, 13)
- 입력 검증: 0, 음수, 소수점 (Scenario 19-20)
- 인터벌 큰 값 (Scenario 14)

### Low Priority
- 인터벌 매우 큰 값 상세 테스트
- UI 스타일 테스트

---

## 7. 성공 기준

### 단위 테스트
- [ ] generateRecurringEvents 함수 인터벌 적용 테스트 12개 통과
- [ ] 엣지 케이스 테스트 3개 통과

### 통합 테스트
- [ ] UI 입력 → 저장 → 표시 플로우 테스트 통과
- [ ] 기존 157개 테스트 회귀 없음

### 코드 커버리지
- [ ] 70% 이상 유지

---

## 8. 참조

- **PRD**: `.claude/outputs/PROJ-010-20251101/prd.md`
- **현재 구현**: `src/utils/recurringEventUtils.ts`
- **테스트 헬퍼**: `src/__tests__/test-helpers/integration-helpers.tsx`
- **기존 테스트**: `src/__tests__/unit/recurringEventUtils.spec.ts`

---

**다음 단계**: Test Writer가 이 시나리오를 기반으로 실패하는 테스트 코드 작성 (Red 단계)

**티켓**: PROJ-003
