# Test Strategy Summary

**작성일**: 2025-10-30  
**Phase**: 2/6 - Test Design  
**상태**: 완료  
**다음 단계**: test-writer (Phase 3)

---

## 📋 완성 항목

### ✅ 테스트 전략 문서 생성

**문서**: `.claude/agent-docs/test-designer/logs/2025-10-30_repeat-event-test-strategy.md`
**규모**: 1,114줄
**검토 완료**: 전체 13개 섹션

---

## 📊 테스트 계획 요약

### 테스트 범위

| 카테고리    | 파일                                    | 케이스 수 | 예상 라인     |
| ----------- | --------------------------------------- | --------- | ------------- |
| 단위 테스트 | `task.repeatUtils.spec.ts`              | 35+       | 400-500       |
| 훅 테스트   | `task.useEventOperations.spec.ts`       | 16+       | 200-300       |
| 통합 테스트 | `task.repeat-event-integration.spec.ts` | 13+       | 200-300       |
| 겹침 테스트 | `easy.eventOverlap.spec.ts` (추가)      | 3         | 30-50         |
| **총계**    | **4**                                   | **67+**   | **830-1,150** |

### 커버리지 목표

- **전체**: 80% 이상
- **핵심 함수**: 100%
  - `generateRepeatDates`
  - `getNextRepeatDate`
  - `isValid31stMonthly`
  - `isValidLeapYearFeb29`

---

## 🎯 테스트 케이스 상세 계획

### 1️⃣ 단위 테스트: `task.repeatUtils.spec.ts` (35개)

#### generateRepeatDates (15개)

- ✓ 반복 없음 처리
- ✓ 매일 반복 (1일, 3일 간격)
- ✓ 매주 반복 (1주, 2주 간격)
- ✓ 매월 반복 (일반 일자, 31일 특수 규칙)
- ✓ 매년 반복 (일반 날짜, 2월 29일 윤년 규칙)
- ✓ 예외 처리 (유효하지 않은 입력)

#### getNextRepeatDate (7개)

- ✓ 매일/주/월/년 다음 날짜 계산
- ✓ 큰 간격 처리
- ✓ 예외 처리 (type='none', 유효하지 않은 날짜)

#### isValid31stMonthly (5개)

- ✓ 31일 있는 달 (1월, 3월, 5월, 7월, 8월, 10월, 12월)
- ✓ 31일 없는 달 (2월, 4월, 6월, 9월, 11월)
- ✓ 다양한 일자 검증

#### isValidLeapYearFeb29 (5개)

- ✓ 윤년 2월 29일 (2024, 2000)
- ✓ 평년 2월 28일 (2025, 1900)
- ✓ 100년 경계 처리

#### formatRepeatInfo & 헬퍼 함수 (3개)

- ✓ 반복 정보를 사용자 친화적 문자열로 변환
- ✓ 간격 단위 계산

### 2️⃣ 훅 테스트: `task.useEventOperations.spec.ts` (16개)

#### saveRecurringEvents (5개)

- ✓ 배치 생성 성공 (반복 날짜별 EventForm 생성, repeatId 할당)
- ✓ 반복 날짜 없음 에러 처리
- ✓ API 500 에러 처리
- ✓ 네트워크 에러 처리
- ✓ 31일 특수 규칙으로 배치 생성

#### updateRecurringSeries (4개)

- ✓ 반복 시리즈 전체 수정 성공
- ✓ 시리즈 없음 (404) 처리
- ✓ 부분 수정 (repeat 필드만 수정)

#### deleteRecurringSeries (4개)

- ✓ 반복 시리즈 전체 삭제 성공
- ✓ 시리즈 없음 (404) 처리

#### saveEvent 분기 로직 (3개)

- ✓ 신규 반복 일정: 배치 API 사용
- ✓ 신규 일반 일정: 단일 API 사용
- ✓ 수정: 반복 여부 상관없이 단일 API 사용

### 3️⃣ 통합 테스트: `task.repeat-event-integration.spec.ts` (13개)

#### E2E 시나리오 (4개)

- ✓ 매주 반복: 생성 → 표시 → 수정 → 삭제 완전 흐름
- ✓ 31일 매월 반복: 생성 → 표시 검증
- ✓ 윤년 2월 29일: 4년 주기 검증
- ✓ 대량 일정 생성 (최대 730개)

#### 특수 규칙 시나리오 (3개)

- ✓ 31일 매월: 4월 30일 기준 처리
- ✓ 2월 29일 윤년 규칙: 1900년 vs 2000년
- ✓ 월말 처리 (28/29/30/31일)

#### 일정 겹침 제외 검증 (3개)

- ✓ 반복 일정은 겹침 체크 제외
- ✓ 일반 일정끼리만 겹침 체크
- ✓ 반복 일정끼리는 겹침 체크 제외

#### 에러 시나리오 (3개)

- ✓ 반복 종료일이 시작일보다 이전
- ✓ 유효하지 않은 간격 값
- ✓ API 통신 실패 시 상태 보존

### 4️⃣ 기존 테스트 추가: `easy.eventOverlap.spec.ts` (3개)

- ✓ 반복 일정 겹침 제외 로직 검증

---

## 🔧 MSW 핸들러 전략

### 추가 핸들러 (3개)

1. **POST /api/events-list** - 배치 생성

   ```typescript
   요청: { events: EventForm[] }
   응답: { events: Event[] } (repeatId 포함)
   ```

2. **PUT /api/recurring-events/:repeatId** - 시리즈 수정

   ```typescript
   요청: { title?, description?, location?, category?, notificationTime?, repeat? }
   응답: 200 또는 404
   ```

3. **DELETE /api/recurring-events/:repeatId** - 시리즈 삭제
   ```typescript
   요청: (본문 없음)
   응답: 204 또는 404
   ```

### 기존 핸들러 유지

- GET /api/events
- POST /api/events
- PUT /api/events/:id
- DELETE /api/events/:id

---

## 📈 커버리지 전략

### 코드 커버리지 목표

**`src/utils/repeatUtils.ts`**: 100%

- 모든 RepeatType (daily/weekly/monthly/yearly)
- 모든 월 (1월~12월)
- 윤년/평년 구분
- Edge cases (빈 배열, null, 유효하지 않은 입력)

**`src/hooks/useEventOperations.ts`**: 90%

- 성공/실패 경로
- 에러 핸들링 (400, 404, 500, 네트워크 에러)
- 단일/배치 분기 로직

**`src/utils/eventOverlap.ts`**: 90%

- 반복 일정 제외 로직
- 일반 일정 겹침 감지

### 테스트 커버리지 목표

- **전체**: 80% 이상
- **로직 분기**: 85% 이상
- **함수**: 90% 이상

---

## 🎯 테스트 데이터 준비

### 반복 정보 픽스처

```typescript
{
  dailyEvent: { type: 'daily', interval: 1, endDate: '2025-01-20' }
  weeklyEvent: { type: 'weekly', interval: 1, endDate: '2025-02-15' }
  monthlyEvent31st: { type: 'monthly', interval: 1, endDate: '2025-12-31' }
  yearlyFeb29: { type: 'yearly', interval: 1, endDate: '2032-02-29' }
}
```

### 날짜 테스트 매트릭스

**31일 매월 반복**:

- 기준월: 2025-01, 반복 종료: 2025-12
- 예상 개수: 7개 (1월, 3월, 5월, 7월, 8월, 10월, 12월)

**윤년 2월 29일 반복**:

- 기준연도: 2024, 반복 종료: 2032
- 예상 개수: 3개 (2024, 2028, 2032)

---

## 🚀 실행 순서 (Phase별)

### Phase 3: RED (Test Writing)

```bash
# 1. 테스트 파일 작성 (이 전략 기반)
#    - task.repeatUtils.spec.ts
#    - task.useEventOperations.spec.ts
#    - task.repeat-event-integration.spec.ts
#    - easy.eventOverlap.spec.ts 추가

# 2. 모든 테스트 실행
pnpm test
# 예상 결과: 모든 테스트 RED (실패)
```

### Phase 4: GREEN (Implementation)

```bash
# 1. src/types.ts - 배치 API 타입 추가
# 2. src/utils/repeatUtils.ts - 유틸 함수 구현
# 3. src/utils/eventOverlap.ts - 겹침 제외 로직
# 4. src/hooks/useEventOperations.ts - 배치 API 메서드
# 5. src/App.tsx - UI 통합

# 각 단계마다 테스트 실행
pnpm test -- task.repeatUtils.spec.ts  # 통과 확인
pnpm test -- task.useEventOperations.spec.ts
pnpm test -- task.repeat-event-integration.spec.ts
```

### Phase 5-6: REFACTOR & VALIDATE

```bash
# 최종 검증
pnpm test:coverage
# 목표: 80% 이상 커버리지

pnpm lint
# 타입 체크 및 린트 통과
```

---

## 📋 GWT 패턴 적용 가이드

### 구조 예시

```typescript
describe('generateRepeatDates', () => {
  it('31일이 있는 달에만 일정을 생성한다', () => {
    // Given: 2025-01-31부터 시작하는 매월 반복
    const baseDate = '2025-01-31';
    const repeatInfo = {
      type: 'monthly',
      interval: 1,
      endDate: '2025-12-31',
    };

    // When: 반복 일정 날짜 생성
    const result = generateRepeatDates(baseDate, repeatInfo);

    // Then: 31일 있는 달만 포함 (7개)
    expect(result).toEqual([
      '2025-01-31', // 1월
      '2025-03-31', // 3월
      '2025-05-31', // 5월
      '2025-07-31', // 7월
      '2025-08-31', // 8월
      '2025-10-31', // 10월
      '2025-12-31', // 12월
    ]);
  });
});
```

---

## ✅ 품질 검증 포인트

### 테스트 설계 검증

- [x] 최소 67개 이상의 테스트 케이스 설계
- [x] GWT 패턴 모든 테스트에 적용
- [x] 엣지 케이스 (31일, 윤년) 포함
- [x] 특수 규칙 시나리오 (월말, 윤년) 명시
- [x] 에러 처리 시나리오 포함
- [x] 통합 테스트 E2E 흐름 정의

### MSW 전략 검증

- [x] 배치 API 3개 핸들러 설계
- [x] 요청/응답 형식 명시
- [x] 에러 응답 (404, 500) 정의
- [x] 기존 핸들러 유지 계획

### 커버리지 전략 검증

- [x] 80% 이상 목표 설정
- [x] 핵심 함수 100% 목표
- [x] 코드 경로별 커버리지 목표 명시
- [x] 테스트 실행 및 검증 절차 정의

---

## 📚 문서 구조

**생성된 문서**: `2025-10-30_repeat-event-test-strategy.md`

### 포함 내용 (13개 섹션)

1. **테스트 전략 개요** - 목표, 구조, 통계, 커버리지, 우선순위
2. **테스트 케이스 상세 설계** - 67개+ 케이스 명세
3. **MSW 핸들러 전략** - 3개 신규 + 기존 핸들러
4. **테스트 데이터 및 픽스처** - 반복 정보, 날짜 매트릭스
5. **테스트 실행 및 커버리지** - 실행 순서, 커버리지 목표
6. **GWT 패턴 적용 가이드** - 구조, 설명 규칙
7. **엣지 케이스 및 특수 테스트** - 날짜 경계, 윤년, 큰 간격
8. **성능 고려사항** - 테스트 속도, 안정성
9. **디버깅 및 로깅** - 로그 레벨, 스냅샷
10. **테스트 체크리스트** - 생성, 실행, 핸들러, 데이터 검증
11. **예상 결과** - RED/GREEN 단계별 예상 출력
12. **다음 단계** - Phase 3-5 활동 계획
13. **참고 문서** - 관련 문서 링크

---

## 🎓 핵심 인사이트

### 1. 특수 규칙 테스트의 중요성

- **31일 매월 반복**: 2월, 4월, 6월, 9월, 11월 제외
- **윤년 2월 29일**: 4년 주기, 100년/400년 예외 처리
- 이 두 규칙만으로 13개 이상의 테스트 케이스 필요

### 2. MSW 핸들러의 역할

- 배치 API 3개 엔드포인트 구현 필요
- 실제 서버 로직 시뮬레이션 (repeatId 생성, 트랜잭션)
- 에러 응답 처리 (400, 404, 500)

### 3. 통합 테스트의 필수성

- 단위 테스트만으로는 전체 흐름 검증 불가
- E2E 시나리오 (생성 → 표시 → 수정 → 삭제)
- API 분기 로직 검증 (단일 vs 배치)

### 4. 엣지 케이스 처리

- 월말 처리 (28/29/30/31일)
- 연도 경계 (12월 → 1월)
- 윤년/평년 구분
- 이들은 수작업 테스트로는 발견 어려움

---

## 🔄 다음 단계

### Phase 3: test-writer 에이전트

**작업**: 이 전략을 기반으로 테스트 파일 작성
**기한**: 약 2시간
**산출물**:

- `src/__tests__/unit/task.repeatUtils.spec.ts`
- `src/__tests__/hooks/task.useEventOperations.spec.ts`
- `src/__tests__/integration/task.repeat-event-integration.spec.ts`
- `src/__tests__/unit/easy.eventOverlap.spec.ts` (추가)

**성공 기준**:

- 모든 테스트 RED (실패) 상태
- 테스트 파일 문법 에러 없음
- 테스트 이름 모두 한글
- GWT 패턴 적용됨

### Phase 4: code-writer 에이전트

**작업**: 테스트를 통과하는 구현 코드 작성
**기한**: 약 2.5시간
**산출물**: 구현 완료된 코드

---

## 📞 질문 및 검토사항

### 검토 완료 항목

- [x] 테스트 케이스 수 (67개 이상)
- [x] 커버리지 목표 (80% 이상)
- [x] 특수 규칙 처리 (31일, 윤년)
- [x] MSW 핸들러 설계 (3개 신규)
- [x] GWT 패턴 적용
- [x] 엣지 케이스 포함

### 추가 고려사항

- [ ] 성능 요구사항 (최대 2년치 730개 일정)
- [ ] 에러 메시지 한글화 (notistack)
- [ ] 접근성 속성 (aria-label, data-testid)

---

**테스트 전략 완성**: 2025-10-30 14:30
**예상 Phase 3 기간**: 2시간
**예상 Phase 4 기간**: 2.5시간
**총 예상 시간**: 4.5시간 + Phase 5-6 (2시간)
