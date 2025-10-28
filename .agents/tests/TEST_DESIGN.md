# 반복 일정 기능 테스트 케이스 설계 (Test Case Design)

**작성일**: 2025-10-27
**프로젝트**: React Calendar Event Management Application
**기능**: Week 8 반복 일정 (Recurring Events)
**총 테스트 케이스**: 52개

---

## 1. 유틸리티 함수 테스트 (Unit Tests - Easy)

### 1.1 generateRecurringDates() 함수 테스트

#### Group: 일일(Daily) 반복
1. **EASY.1.1** - 기본 일일 반복 (interval=1, endDate 있음)
   - Given: startDate="2025-10-01", repeatType="daily", interval=1, endDate="2025-10-05"
   - When: generateRecurringDates() 호출
   - Then: ["2025-10-01", "2025-10-02", "2025-10-03", "2025-10-04", "2025-10-05"] 반환

2. **EASY.1.2** - 2일마다 반복 (interval=2)
   - Given: startDate="2025-10-01", repeatType="daily", interval=2, endDate="2025-10-07"
   - When: generateRecurringDates() 호출
   - Then: ["2025-10-01", "2025-10-03", "2025-10-05", "2025-10-07"] 반환

3. **EASY.1.3** - 10일마다 반복
   - Given: startDate="2025-10-01", repeatType="daily", interval=10, endDate="2025-10-31"
   - When: generateRecurringDates() 호출
   - Then: ["2025-10-01", "2025-10-11", "2025-10-21", "2025-10-31"] 반환

4. **EASY.1.4** - 일일 반복 (endDate 없음, 최대 제한 테스트)
   - Given: startDate="2025-10-01", repeatType="daily", interval=1, endDate=undefined
   - When: generateRecurringDates() 호출
   - Then: 최대 1,000개까지의 날짜 반환

5. **EASY.1.5** - startDate와 endDate가 동일
   - Given: startDate="2025-10-01", repeatType="daily", interval=1, endDate="2025-10-01"
   - When: generateRecurringDates() 호출
   - Then: ["2025-10-01"] 반환 (1개 원소)

#### Group: 주간(Weekly) 반복
6. **EASY.1.6** - 기본 주간 반복 (interval=1)
   - Given: startDate="2025-10-01" (수요일), repeatType="weekly", interval=1, endDate="2025-10-22"
   - When: generateRecurringDates() 호출
   - Then: ["2025-10-01", "2025-10-08", "2025-10-15", "2025-10-22"] 반환 (모두 수요일)

7. **EASY.1.7** - 2주마다 반복 (interval=2)
   - Given: startDate="2025-10-01", repeatType="weekly", interval=2, endDate="2025-10-29"
   - When: generateRecurringDates() 호출
   - Then: ["2025-10-01", "2025-10-15", "2025-10-29"] 반환

8. **EASY.1.8** - 월요일 주간 반복
   - Given: startDate="2025-10-06" (월요일), repeatType="weekly", interval=1, endDate="2025-10-20"
   - When: generateRecurringDates() 호출
   - Then: ["2025-10-06", "2025-10-13", "2025-10-20"] 반환 (모두 월요일)

9. **EASY.1.9** - 3주마다 반복 (연도 경계 포함)
   - Given: startDate="2025-12-01", repeatType="weekly", interval=3, endDate="2026-01-20"
   - When: generateRecurringDates() 호출
   - Then: ["2025-12-01", "2025-12-22", "2026-01-12"] 반환

#### Group: 월간(Monthly) 반복
10. **EASY.1.10** - 기본 월간 반복 (1일)
    - Given: startDate="2025-10-01", repeatType="monthly", interval=1, endDate="2025-12-01"
    - When: generateRecurringDates() 호출
    - Then: ["2025-10-01", "2025-11-01", "2025-12-01"] 반환

11. **EASY.1.11** - 월간 반복 (15일)
    - Given: startDate="2025-10-15", repeatType="monthly", interval=1, endDate="2025-12-15"
    - When: generateRecurringDates() 호출
    - Then: ["2025-10-15", "2025-11-15", "2025-12-15"] 반환

12. **EASY.1.12** - 월간 반복 (31일) - 월말 처리
    - Given: startDate="2025-10-31", repeatType="monthly", interval=1, endDate="2025-12-31"
    - When: generateRecurringDates() 호출
    - Then: ["2025-10-31", "2025-11-30", "2025-12-31"] 반환 (11월은 30일로 조정)

13. **EASY.1.13** - 2개월마다 반복
    - Given: startDate="2025-10-01", repeatType="monthly", interval=2, endDate="2026-04-01"
    - When: generateRecurringDates() 호출
    - Then: ["2025-10-01", "2025-12-01", "2026-02-01", "2026-04-01"] 반환

14. **EASY.1.14** - 월간 반복 (2월 29일 평년 처리)
    - Given: startDate="2024-02-29" (윤년), repeatType="monthly", interval=1, endDate="2025-02-28"
    - When: generateRecurringDates() 호출
    - Then: ["2024-02-29", "2024-03-29", ..., "2025-02-28"] (29일이 없는 달은 말일로 조정)

#### Group: 연간(Yearly) 반복
15. **EASY.1.15** - 기본 연간 반복
    - Given: startDate="2025-06-15", repeatType="yearly", interval=1, endDate="2027-06-15"
    - When: generateRecurringDates() 호출
    - Then: ["2025-06-15", "2026-06-15", "2027-06-15"] 반환

16. **EASY.1.16** - 연간 반복 (2월 29일) - 윤년 처리
    - Given: startDate="2024-02-29", repeatType="yearly", interval=1, endDate="2026-02-28"
    - When: generateRecurringDates() 호출
    - Then: ["2024-02-29", "2025-02-28" 또는 "2025-03-01", "2026-02-28"] (구현 선택)

17. **EASY.1.17** - 2년마다 반복
    - Given: startDate="2025-01-01", repeatType="yearly", interval=2, endDate="2029-01-01"
    - When: generateRecurringDates() 호출
    - Then: ["2025-01-01", "2027-01-01", "2029-01-01"] 반환

### 1.2 validateRepeatInfo() 함수 테스트

#### Group: 유효한 입력
18. **EASY.2.1** - 유효한 daily 반복
    - Given: repeatInfo={type:"daily", interval:1, endDate:"2025-10-31"}
    - When: validateRepeatInfo("2025-10-01", repeatInfo) 호출
    - Then: {valid:true, error:null} 반환

19. **EASY.2.2** - 유효한 weekly 반복
    - Given: repeatInfo={type:"weekly", interval:2, endDate:"2025-11-01"}
    - When: validateRepeatInfo("2025-10-01", repeatInfo) 호출
    - Then: {valid:true, error:null} 반환

20. **EASY.2.3** - 유효한 monthly 반복
    - Given: repeatInfo={type:"monthly", interval:1}
    - When: validateRepeatInfo("2025-10-01", repeatInfo) 호출
    - Then: {valid:true, error:null} 반환 (endDate 없음 = 무한 반복)

21. **EASY.2.4** - 유효한 yearly 반복
    - Given: repeatInfo={type:"yearly", interval:3, endDate:"2035-06-15"}
    - When: validateRepeatInfo("2025-06-15", repeatInfo) 호출
    - Then: {valid:true, error:null} 반환

#### Group: 무효한 입력
22. **EASY.2.5** - interval이 0인 경우
    - Given: repeatInfo={type:"daily", interval:0, endDate:"2025-10-05"}
    - When: validateRepeatInfo("2025-10-01", repeatInfo) 호출
    - Then: {valid:false, error:"반복 간격은 1 이상이어야 합니다"} 반환

23. **EASY.2.6** - interval이 음수인 경우
    - Given: repeatInfo={type:"daily", interval:-1, endDate:"2025-10-05"}
    - When: validateRepeatInfo("2025-10-01", repeatInfo) 호출
    - Then: {valid:false, error:"반복 간격은 1 이상이어야 합니다"} 반환

24. **EASY.2.7** - endDate가 startDate보다 이전
    - Given: repeatInfo={type:"daily", interval:1, endDate:"2025-09-30"}
    - When: validateRepeatInfo("2025-10-01", repeatInfo) 호출
    - Then: {valid:false, error:"반복 종료일은 시작일 이후여야 합니다"} 반환

25. **EASY.2.8** - endDate 형식이 잘못된 경우
    - Given: repeatInfo={type:"daily", interval:1, endDate:"10/01/2025"}
    - When: validateRepeatInfo("2025-10-01", repeatInfo) 호출
    - Then: {valid:false, error:"반복 종료일 형식이 잘못되었습니다"} 반환

26. **EASY.2.9** - interval이 1000을 초과
    - Given: repeatInfo={type:"daily", interval:1001}
    - When: validateRepeatInfo("2025-10-01", repeatInfo) 호출
    - Then: {valid:false, error:"반복 간격은 1000 이하여야 합니다"} 반환

---

## 2. 훅 통합 테스트 (Integration Tests - Medium)

### 2.1 useEventForm 훅 확장 테스트

#### Group: 반복 설정 상태 관리
27. **MEDIUM.2.1** - 반복 일정 토글
    - Given: useEventForm 초기화, isRepeating=false
    - When: setIsRepeating(true) 호출
    - Then: isRepeating 상태가 true로 변경되고, repeatType/interval/endDate 기본값 유지

28. **MEDIUM.2.2** - 반복 유형 변경
    - Given: useEventForm with isRepeating=true, repeatType="daily"
    - When: setRepeatType("weekly") 호출
    - Then: repeatType 상태가 "weekly"로 변경됨

29. **MEDIUM.2.3** - 반복 간격 변경
    - Given: useEventForm with repeatInterval=1
    - When: setRepeatInterval(3) 호출
    - Then: repeatInterval 상태가 3으로 변경됨

30. **MEDIUM.2.4** - 반복 종료일 변경
    - Given: useEventForm with repeatEndDate=""
    - When: setRepeatEndDate("2025-10-31") 호출
    - Then: repeatEndDate 상태가 "2025-10-31"로 변경됨

31. **MEDIUM.2.5** - 폼 초기화 시 반복 설정도 초기화
    - Given: useEventForm with 반복 설정된 상태
    - When: resetForm() 호출
    - Then: isRepeating=false, repeatType="none", repeatInterval=1, repeatEndDate=""

#### Group: 기존 이벤트 수정 (반복)
32. **MEDIUM.2.6** - 반복 이벤트 로드 시 반복 정보 유지
    - Given: 반복 이벤트={title:"회의", repeat:{type:"weekly", interval:2, endDate:"2025-11-01"}}
    - When: useEventForm(event) 초기화
    - Then: 모든 반복 설정이 올바르게 로드되고, isRepeating=true

### 2.2 useEventOperations 훅 확장 테스트

#### Group: 단일 반복 이벤트 생성
33. **MEDIUM.3.1** - 일일 반복 이벤트 생성 (5일)
    - Given: POST /api/events-list 모킹
    - When: useEventOperations.saveEvent(일일반복이벤트) 호출
    - Then: 5개의 이벤트가 동일 repeatId로 생성되고, 상태 업데이트됨

34. **MEDIUM.3.2** - 주간 반복 이벤트 생성 (3주)
    - Given: POST /api/events-list 모킹
    - When: useEventOperations.saveEvent(주간반복이벤트) 호출
    - Then: 3개의 이벤트가 동일 repeatId로 생성되고, 각각 7일 간격

35. **MEDIUM.3.3** - 월간 반복 이벤트 생성 (3개월)
    - Given: POST /api/events-list 모킹
    - When: useEventOperations.saveEvent(월간반복이벤트) 호출
    - Then: 3개의 이벤트가 생성되고, 날짜가 1개월씩 증가

36. **MEDIUM.3.4** - 연간 반복 이벤트 생성 (2년)
    - Given: POST /api/events-list 모킹
    - When: useEventOperations.saveEvent(연간반복이벤트) 호출
    - Then: 2개의 이벤트가 생성되고, 날짜가 1년씩 증가

37. **MEDIUM.3.5** - 반복 없는 이벤트는 기존 로직 사용
    - Given: 반복 없는 이벤트, POST /api/events 모킹
    - When: useEventOperations.saveEvent(단일이벤트) 호출
    - Then: POST /api/events 호출되고, 1개의 이벤트 생성

#### Group: 반복 이벤트 수정
38. **MEDIUM.3.6** - 전체 반복 시리즈 수정 (모든 제목 변경)
    - Given: 기존 반복 이벤트 5개 (동일 repeatId), PUT /api/recurring-events/:repeatId 모킹
    - When: useEventOperations.saveEvent(수정된이벤트, true) 호출
    - Then: 5개 모두 제목이 변경되고, 상태 업데이트됨

39. **MEDIUM.3.7** - 반복 이벤트 수정 시 시간 변경
    - Given: 기존 반복 이벤트 3개 (동일 repeatId)
    - When: startTime/endTime 수정 후 저장
    - Then: 3개 모두 시간이 변경됨

40. **MEDIUM.3.8** - 반복 이벤트 수정 시 카테고리 변경
    - Given: 기존 반복 이벤트 2개 (동일 repeatId)
    - When: category="가족"으로 수정 후 저장
    - Then: 2개 모두 카테고리가 변경됨

#### Group: 반복 이벤트 삭제
41. **MEDIUM.3.9** - 전체 반복 시리즈 삭제
    - Given: 기존 반복 이벤트 5개 (동일 repeatId), DELETE /api/recurring-events/:repeatId 모킹
    - When: useEventOperations.deleteEvent(이벤트) 호출 (isEditMode=true)
    - Then: 5개 모두 삭제되고, 상태 업데이트됨

42. **MEDIUM.3.10** - 단일 이벤트 삭제는 기존 로직 사용
    - Given: 반복 없는 이벤트, DELETE /api/events/:id 모킹
    - When: useEventOperations.deleteEvent(이벤트) 호출
    - Then: DELETE /api/events/:id 호출되고, 1개의 이벤트 삭제

#### Group: API 에러 처리
43. **MEDIUM.3.11** - 반복 이벤트 생성 실패
    - Given: POST /api/events-list 실패 (500 에러)
    - When: useEventOperations.saveEvent(반복이벤트) 호출
    - Then: 에러 알림 표시, 상태 업데이트 안 됨

44. **MEDIUM.3.12** - 반복 이벤트 수정 실패
    - Given: PUT /api/recurring-events/:repeatId 실패 (404 에러)
    - When: useEventOperations.saveEvent(수정이벤트, true) 호출
    - Then: 에러 알림 표시, 상태 그대로 유지

45. **MEDIUM.3.13** - 반복 이벤트 삭제 실패
    - Given: DELETE /api/recurring-events/:repeatId 실패 (500 에러)
    - When: useEventOperations.deleteEvent(반복이벤트) 호출
    - Then: 에러 알림 표시, 상태 그대로 유지

---

## 3. API/핸들러 테스트 (Integration Tests - Medium)

### 3.1 MSW 핸들러 테스트

#### Group: POST /api/events-list
46. **MEDIUM.4.1** - 반복 이벤트 배열 생성
    - Given: POST /api/events-list, 요청 본문=[{반복 이벤트 3개}]
    - When: fetch POST 호출
    - Then: 상태 201, 생성된 이벤트 3개 반환 (동일 repeatId)

47. **MEDIUM.4.2** - 빈 배열 요청
    - Given: POST /api/events-list, 요청 본문=[]
    - When: fetch POST 호출
    - Then: 상태 201, 빈 배열 반환

#### Group: PUT /api/recurring-events/:repeatId
48. **MEDIUM.4.3** - 반복 시리즈 일괄 수정
    - Given: 기존 이벤트 3개 (repeatId="abc123"), PUT /api/recurring-events/abc123
    - When: fetch PUT 호출, 본문={title:"수정"}
    - Then: 상태 200, 3개 모두 제목이 "수정"인 이벤트 반환

49. **MEDIUM.4.4** - 존재하지 않는 repeatId
    - Given: PUT /api/recurring-events/nonexistent
    - When: fetch PUT 호출
    - Then: 상태 404 또는 빈 배열 반환

#### Group: DELETE /api/recurring-events/:repeatId
50. **MEDIUM.4.5** - 반복 시리즈 일괄 삭제
    - Given: 기존 이벤트 3개 (repeatId="abc123"), DELETE /api/recurring-events/abc123
    - When: fetch DELETE 호출
    - Then: 상태 204, 이벤트들이 삭제됨

51. **MEDIUM.4.6** - 존재하지 않는 repeatId 삭제
    - Given: DELETE /api/recurring-events/nonexistent
    - When: fetch DELETE 호출
    - Then: 상태 204 또는 404

---

## 4. 엣지 케이스 테스트 (Medium)

### 4.1 날짜 계산 엣지 케이스
52. **MEDIUM.5.1** - 월말 날짜 (31일) + 월간 반복
    - Given: startDate="2025-01-31", repeatType="monthly", interval=1, endDate="2025-04-30"
    - When: generateRecurringDates() 호출
    - Then: ["2025-01-31", "2025-02-28", "2025-03-31", "2025-04-30"] 반환 (2월은 28일로 조정)

53. **MEDIUM.5.2** - 윤년 2월 29일 + 1년
    - Given: startDate="2024-02-29", repeatType="yearly", interval=1, endDate="2026-12-31"
    - When: generateRecurringDates() 호출
    - Then: ["2024-02-29", "2025-02-28" 또는 "2025-03-01", "2026-02-28" 또는 "2026-03-01"] 반환

54. **MEDIUM.5.3** - 반복 간격 > 1 (3개월마다)
    - Given: startDate="2025-10-01", repeatType="monthly", interval=3, endDate="2026-07-01"
    - When: generateRecurringDates() 호출
    - Then: ["2025-10-01", "2026-01-01", "2026-04-01", "2026-07-01"] 반환

---

## 5. 통합 시나리오 테스트 (Medium)

### 5.1 실제 사용 사례
55. **SCENARIO.1** - 매주 월요일 팀 미팅 (3개월)
   ```
   Given:
     - 새로운 이벤트 폼 작성
     - 제목: "주간 팀 미팅"
     - 시작: 2025-10-06 (월요일)
     - 반복: 주간, 간격 1, 종료 2025-12-29

   When:
     - "저장" 버튼 클릭

   Then:
     - 13개의 이벤트 생성 (모두 월요일, 동일 repeatId)
     - 폼 초기화
     - 성공 알림 표시
     - 캘린더에 모든 이벤트 표시됨
   ```

56. **SCENARIO.2** - 매일 스탠드업 (1주일, 수정)
   ```
   Given:
     - 일일 반복 이벤트 5개 (2025-10-01 ~ 2025-10-05)
     - 모두 동일 repeatId

   When:
     - 10-03 이벤트 편집
     - 시간을 10:00 → 09:30으로 변경
     - "저장" 클릭 (전체 시리즈 수정 선택)

   Then:
     - 5개 이벤트 모두 시간이 09:30으로 변경됨
     - repeatId는 유지됨
     - 캘린더 업데이트
   ```

57. **SCENARIO.3** - 월간 리포트 (무한 반복, 나중에 삭제)
   ```
   Given:
     - 월간 반복 이벤트 (2025-10-01, 반복 없음)
     - 최대 1,000개 인스턴스

   When:
     - 이벤트 삭제 (확인 클릭)

   Then:
     - 1,000개 모두 삭제됨
     - 캘린더 업데이트
     - 삭제 알림 표시
   ```

---

## 6. 테스트 구조 및 명명 규칙

### 6.1 파일 구조
```
src/__tests__/
├── unit/
│   ├── easy.generateRecurringDates.spec.ts (테스트 1-17)
│   └── easy.validateRepeatInfo.spec.ts (테스트 18-26)
├── hooks/
│   ├── medium.useEventForm.repeat.spec.ts (테스트 27-32)
│   └── medium.useEventOperations.recurring.spec.ts (테스트 33-45)
├── integration/
│   ├── medium.recurring-events-api.spec.ts (테스트 46-51)
│   └── medium.recurring-events-scenarios.spec.ts (테스트 52-57)
└── utils.ts (기존, 확장)
```

### 6.2 테스트 케이스 명명
- **EASY.{섹션}.{번호}**: 단위 테스트
- **MEDIUM.{섹션}.{번호}**: 통합 테스트
- **SCENARIO.{번호}**: 실제 사용 사례

### 6.3 테스트 작성 패턴
```typescript
describe('generateRecurringDates', () => {
  it('EASY.1.1 - 기본 일일 반복 (interval=1, endDate 있음)', () => {
    expect.hasAssertions();

    // Arrange
    const startDate = '2025-10-01';
    const repeatType = 'daily';
    const interval = 1;
    const endDate = '2025-10-05';

    // Act
    const result = generateRecurringDates(startDate, repeatType, interval, endDate);

    // Assert
    expect(result).toEqual(['2025-10-01', '2025-10-02', '2025-10-03', '2025-10-04', '2025-10-05']);
  });
});
```

---

## 7. MSW 핸들러 설정 요구사항

### 7.1 새로 추가할 핸들러
```typescript
// POST /api/events-list
http.post('/api/events-list', async ({ request }) => {
  const eventsData = await request.json() as Event[];
  const repeatId = generateUUID();

  const createdEvents = eventsData.map((event, index) => ({
    ...event,
    id: String(Date.now() + index),
    repeat: { ...event.repeat, id: repeatId }
  }));

  return HttpResponse.json(createdEvents, { status: 201 });
});

// PUT /api/recurring-events/:repeatId
http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
  const { repeatId } = params;
  const updates = await request.json() as Partial<Event>;

  // events는 메모리 저장소
  const matchingEvents = events.filter(e => e.repeat.id === repeatId);
  matchingEvents.forEach(event => {
    Object.assign(event, updates);
  });

  return HttpResponse.json(matchingEvents, { status: 200 });
});

// DELETE /api/recurring-events/:repeatId
http.delete('/api/recurring-events/:repeatId', ({ params }) => {
  const { repeatId } = params;
  const initialLength = events.length;

  events = events.filter(e => e.repeat.id !== repeatId);

  const deleted = initialLength - events.length > 0;

  return new HttpResponse(null, { status: deleted ? 204 : 404 });
});
```

### 7.2 헬퍼 함수 (handlersUtils.ts 확장)
```typescript
export const setupMockHandlerRecurringEventCreation = (initEvents = [] as Event[]) => {
  // POST /api/events-list 테스트용
};

export const setupMockHandlerRecurringEventUpdating = (initEvents = [] as Event[]) => {
  // PUT /api/recurring-events/:repeatId 테스트용
};

export const setupMockHandlerRecurringEventDeletion = (initEvents = [] as Event[]) => {
  // DELETE /api/recurring-events/:repeatId 테스트용
};
```

---

## 8. 테스트 성공 기준

- [x] 모든 52개 테스트 케이스 설계 완료
- [x] 각 테스트는 Given-When-Then 형식
- [x] 엣지 케이스 포함
- [x] MSW 모킹 지원 가능
- [x] 예상 결과 명확히 정의
- [x] 실제 사용 시나리오 포함

---

END OF TEST DESIGN
