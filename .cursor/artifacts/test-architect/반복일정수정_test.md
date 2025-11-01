# 테스트 명세서: 반복 일정 수정

**Status**: Test Specification Complete
**Next Action**: 테스트 명세를 확인하신 후 승인해주시면 @developer에게 구현을 요청하겠습니다.

---

## 개요

### 테스트 목적

반복 일정 수정 시 단일 수정과 전체 수정을 선택할 수 있는 기능을 검증한다.

### 테스트 범위

- 반복 일정 판별 로직
- 수정 확인 다이얼로그 표시
- 단일 수정 ("예" 선택)
- 전체 수정 ("아니오" 선택)
- 에러 처리 (폼 검증 실패, 네트워크 오류, 404 에러)
- 일반 일정 수정 (기존 동작 유지)
- 반복 일정 아이콘 표시/제거

### 제외 사항

- 반복 설정 자체 변경 (repeat.type 변경)은 별도 기능으로 분리

---

## 테스트 파일 정보

### 파일명

`src/__tests__/medium.recurringEventModification.integration.spec.tsx`

### 테스트 유형

**Integration Test** - App 컴포넌트 렌더링과 실제 수정 다이얼로그, API 호출을 통한 전체 플로우 검증

### 파일 구조

- 파일명: `medium.recurringEventModification.integration.spec.tsx`
- describe: Acceptance Criteria 단위별로 그룹핑
- it: Given-When-Then 패턴으로 시나리오 작성

---

## 테스트 시나리오

### AC-1: 반복 일정 수정 판별 확인

#### 테스트 1.1: 반복 일정 수정 시 다이얼로그 표시

**Given** 반복 일정(`repeat.type !== 'none'`, `repeat.id` 존재)이 일정 목록에 표시되어 있고, 사용자가 수정 폼에서 데이터를 수정한 후 저장 버튼을 클릭했을 때  
**When** 저장 버튼을 클릭하면  
**Then** 수정 선택 다이얼로그가 표시되어야함

**검증 방법**:

- `screen.getByRole('dialog')`로 다이얼로그 존재 확인
- 다이얼로그 제목이 "반복 일정 수정"인지 확인

---

#### 테스트 1.2: 일반 일정 수정 시 다이얼로그 미표시

**Given** 일반 일정(`repeat.type === 'none'`)이 일정 목록에 표시되어 있고, 사용자가 수정 폼에서 데이터를 수정한 후 저장 버튼을 클릭했을 때  
**When** 저장 버튼을 클릭하면  
**Then** 수정 선택 다이얼로그가 표시되지 않아야함  
**And** 기존 수정 로직이 즉시 실행되어야함

**검증 방법**:

- `screen.queryByRole('dialog', { name: /반복 일정 수정/ })`가 `null`인지 확인
- `PUT /api/events/:id` API가 즉시 호출되는지 확인

---

### AC-2: 반복 일정 수정 다이얼로그 표시

#### 테스트 2.1: 다이얼로그 제목 및 내용 표시

**Given** 반복 일정 수정 확인 다이얼로그가 표시되었을 때  
**When** 다이얼로그가 렌더링되면  
**Then** 다이얼로그 제목은 "반복 일정 수정"이어야함  
**And** 다이얼로그 내용은 "해당 일정만 수정하시겠어요?"이어야함

**검증 방법**:

- `screen.getByRole('dialog')`로 다이얼로그 찾기
- `screen.getByText('반복 일정 수정')`로 제목 확인
- `screen.getByText('해당 일정만 수정하시겠어요?')`로 내용 확인

---

#### 테스트 2.2: 버튼 표시

**Given** 반복 일정 수정 확인 다이얼로그가 표시되었을 때  
**When** 다이얼로그가 렌더링되면  
**Then** "예" 버튼이 표시되어야함  
**And** "아니오" 버튼이 표시되어야함

**검증 방법**:

- `screen.getByRole('button', { name: '예' })`로 "예" 버튼 확인
- `screen.getByRole('button', { name: '아니오' })`로 "아니오" 버튼 확인

---

### AC-3: 단일 인스턴스 수정 ("예" 선택)

#### 테스트 3.1: 단일 수정 API 호출 및 반복 정보 제거

**Given** 수정 선택 다이얼로그가 표시된 상태에서  
**When** 사용자가 "예" 버튼을 클릭했을때  
**Then** `PUT /api/events/:id` API가 호출되어야함  
**And** 요청 body에 `repeat.type: 'none'`이 포함되어야함  
**And** 요청 body에 `repeat.id`가 제거되어야함

**검증 방법**:

- MSW 핸들러에서 요청 body 확인
- `repeat.type === 'none'` 확인
- `repeat.id`가 undefined 또는 없음 확인

---

#### 테스트 3.2: 단일 수정 후 반복 아이콘 제거

**Given** 수정 선택 다이얼로그에서 "예"를 선택하여 단일 수정이 완료된 후  
**When** 일정 목록이 새로고침되면  
**Then** 수정된 일정의 반복 일정 아이콘이 사라져야함  
**And** 동일한 `repeat.id`를 가진 다른 일정들은 반복 아이콘이 유지되어야함

**검증 방법**:

- 수정된 일정에서 `screen.queryByLabelText('반복 일정')`이 `null`인지 확인
- 다른 반복 일정의 아이콘은 여전히 표시되는지 확인

---

#### 테스트 3.3: 단일 수정 성공 메시지

**Given** 수정 선택 다이얼로그에서 "예"를 선택하여 단일 수정이 완료된 후  
**When** API 호출이 성공하면  
**Then** "일정이 수정되었습니다." 성공 메시지가 표시되어야함  
**And** 다이얼로그가 닫혀야함  
**And** 폼이 닫혀야함

**검증 방법**:

- `screen.getByText('일정이 수정되었습니다.')` 확인
- 다이얼로그가 DOM에서 제거되었는지 확인

---

### AC-4: 전체 반복 시리즈 수정 ("아니오" 선택)

#### 테스트 4.1: 전체 수정 API 호출 및 반복 정보 유지

**Given** 수정 선택 다이얼로그가 표시된 상태에서  
**When** 사용자가 "아니오" 버튼을 클릭했을때  
**Then** `PUT /api/recurring-events/:repeatId` API가 호출되어야함  
**And** 요청 body에 반복 정보가 포함되어야함 (`repeat.type !== 'none'`)  
**And** 요청 body에 수정된 필드가 포함되어야함 (title, description, location, category, notificationTime)

**검증 방법**:

- MSW 핸들러에서 `PUT /api/recurring-events/:repeatId` 호출 확인
- 요청 body에 `repeat.type !== 'none'` 확인
- 수정된 필드 값 확인

---

#### 테스트 4.2: 전체 수정 후 반복 아이콘 유지

**Given** 수정 선택 다이얼로그에서 "아니오"를 선택하여 전체 수정이 완료된 후  
**When** 일정 목록이 새로고침되면  
**Then** 모든 반복 시리즈 일정에 반복 일정 아이콘이 유지되어야함

**검증 방법**:

- 모든 반복 일정에서 `screen.getAllByLabelText('반복 일정')`이 표시되는지 확인

---

#### 테스트 4.3: 전체 수정 성공 메시지

**Given** 수정 선택 다이얼로그에서 "아니오"를 선택하여 전체 수정이 완료된 후  
**When** API 호출이 성공하면  
**Then** "일정이 수정되었습니다." 성공 메시지가 표시되어야함  
**And** 다이얼로그가 닫혀야함  
**And** 폼이 닫혀야함

**검증 방법**:

- `screen.getByText('일정이 수정되었습니다.')` 확인
- 다이얼로그가 DOM에서 제거되었는지 확인

---

### AC-5: 일반 일정 수정 (기존 동작 유지)

#### 테스트 5.1: 일반 일정 수정 시 다이얼로그 미표시

**Given** 일반 일정(`repeat.type === 'none'`)의 수정 버튼을 클릭하고 폼에서 데이터를 수정한 후 저장 버튼을 클릭했을 때  
**When** 저장 버튼을 클릭하면  
**Then** 다이얼로그가 표시되지 않아야함  
**And** `PUT /api/events/:id` API가 즉시 호출되어야함

**검증 방법**:

- 다이얼로그가 표시되지 않는지 확인
- MSW 핸들러에서 즉시 API 호출 확인

---

### AC-6: 폼 검증 실패 시 다이얼로그 미표시

#### 테스트 6.1: 필수 필드 누락 시 검증

**Given** 반복 일정 수정 폼에서 필수 필드(제목)가 비어있는 상태에서  
**When** 저장 버튼을 클릭하면  
**Then** 다이얼로그가 표시되지 않아야함  
**And** 해당 필드의 에러 메시지가 토스트로 표시되어야함  
**And** 폼은 열린 상태로 유지되어야함

**검증 방법**:

- 다이얼로그가 표시되지 않는지 확인
- 에러 토스트 메시지 확인

---

### AC-7: 전체 수정 시 반복 설정 검증

#### 테스트 7.1: 반복 설정 검증 실패

**Given** 반복 일정 수정 폼에서 반복 설정을 "없음"으로 변경한 후 "아니오"를 선택하여 전체 수정을 시도할 때  
**When** 반복 설정 검증이 실패하면  
**Then** 에러 메시지가 토스트로 표시되어야함  
**And** 다이얼로그는 닫혀야함  
**And** 폼은 열린 상태로 유지되어야함

**검증 방법**:

- 에러 토스트 메시지 확인
- 다이얼로그가 닫혔는지 확인
- 폼이 여전히 열려있는지 확인

---

### AC-8: 네트워크 오류 처리

#### 테스트 8.1: 단일 수정 시 네트워크 오류

**Given** 수정 선택 다이얼로그에서 "예"를 선택하여 API 호출 시  
**When** 네트워크 오류가 발생하면  
**Then** 에러 토스트 메시지가 표시되어야함 ("일정 수정 실패")  
**And** 다이얼로그는 닫혀야함  
**And** 폼은 열린 상태로 유지되어야함 (재시도 가능)

**검증 방법**:

- MSW 핸들러에서 네트워크 오류 시뮬레이션
- 에러 토스트 메시지 확인
- 폼이 열려있는지 확인

---

#### 테스트 8.2: 전체 수정 시 네트워크 오류

**Given** 수정 선택 다이얼로그에서 "아니오"를 선택하여 API 호출 시  
**When** 네트워크 오류가 발생하면  
**Then** 에러 토스트 메시지가 표시되어야함 ("반복 일정 수정 실패")  
**And** 다이얼로그는 닫혀야함  
**And** 폼은 열린 상태로 유지되어야함 (재시도 가능)

**검증 방법**:

- MSW 핸들러에서 네트워크 오류 시뮬레이션
- 에러 토스트 메시지 확인
- 폼이 열려있는지 확인

---

### AC-9: 404 오류 처리

#### 테스트 9.1: 단일 수정 시 404 오류

**Given** 수정하려는 일정이 이미 삭제된 상태에서  
**When** "예" 선택 후 API 호출 시 404 오류가 발생하면  
**Then** 에러 토스트 메시지가 표시되어야함 ("수정할 일정을 찾을 수 없습니다.")  
**And** 이벤트 목록이 새로고침되어야함  
**And** 폼이 닫혀야함

**검증 방법**:

- MSW 핸들러에서 404 응답 설정
- 에러 토스트 메시지 확인
- 폼이 닫혔는지 확인

---

#### 테스트 9.2: 전체 수정 시 404 오류

**Given** 수정하려는 반복 일정이 이미 삭제된 상태에서  
**When** "아니오" 선택 후 API 호출 시 404 오류가 발생하면  
**Then** 에러 토스트 메시지가 표시되어야함 ("반복 일정을 찾을 수 없습니다.")  
**And** 이벤트 목록이 새로고침되어야함  
**And** 폼이 닫혀야함

**검증 방법**:

- MSW 핸들러에서 404 응답 설정
- 에러 토스트 메시지 확인
- 폼이 닫혔는지 확인

---

### AC-10: 반복 일정 아이콘 표시/제거

#### 테스트 10.1: 단일 수정 후 아이콘 제거

**Given** 반복 일정 수정이 완료된 후  
**When** 일정 목록이 새로고침되면  
**Then** 단일 수정("예" 선택)된 일정은 반복 일정 아이콘이 표시되지 않아야함 (`repeat.type === 'none'`)  
**And** 다른 반복 일정들은 아이콘이 유지되어야함

**검증 방법**:

- 수정된 일정에서 반복 아이콘이 없는지 확인
- 다른 반복 일정에서 아이콘이 있는지 확인

---

#### 테스트 10.2: 전체 수정 후 아이콘 유지

**Given** 반복 일정 전체 수정이 완료된 후  
**When** 일정 목록이 새로고침되면  
**Then** 전체 수정("아니오" 선택)된 일정들은 반복 일정 아이콘이 유지되어야함 (`repeat.type !== 'none'`)

**검증 방법**:

- 모든 반복 일정에서 아이콘이 표시되는지 확인

---

## MSW 핸들러 정의

### 성공 시나리오

```typescript
// 단일 수정 성공
http.put('/api/events/:id', async ({ params, request }) => {
  const { id } = params;
  const updatedEvent = await request.json();
  return HttpResponse.json({ ...updatedEvent, id }, { status: 200 });
});

// 전체 수정 성공
http.put('/api/recurring-events/:repeatId', async ({ params, request }) => {
  const { repeatId } = params;
  const updateData = await request.json();
  // 전체 시리즈 일정 반환
  return HttpResponse.json([
    { id: '1', ...updateData, repeat: { ...updateData.repeat, id: repeatId } },
    { id: '2', ...updateData, repeat: { ...updateData.repeat, id: repeatId } },
  ], { status: 200 });
});
```

### 에러 시나리오

```typescript
// 404 오류
http.put('/api/events/:id', () => {
  return HttpResponse.json({ error: 'Not Found' }, { status: 404 });
});

// 네트워크 오류
http.put('/api/events/:id', () => {
  return HttpResponse.error();
});
```

---

## 테스트 데이터

### 반복 일정 예시

```typescript
const recurringEvent: Event = {
  id: '1',
  title: '팀 회의',
  date: '2025-10-15',
  startTime: '14:00',
  endTime: '15:00',
  description: '팀 미팅',
  location: '회의실 A',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-12-31',
    id: 'repeat-1', // 반복 시리즈 식별자
  },
  notificationTime: 10,
};
```

---

**Version**: 1.0.0
**Last Updated**: 2025-01-31
**Author**: Test Architect Agent
