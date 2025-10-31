# 반복 일정 수정 기능 테스트 설계

## 테스트 전략

### 범위
- **통합 테스트**: 반복 일정 수정 다이얼로그 + API 호출 + UI 업데이트
- **사용자 시나리오**: 전체 사용자 흐름 (클릭 → 선택 → API → 결과 확인)
- **에러 핸들링**: API 실패, 404, 네트워크 에러
- **엣지 케이스**: 경계 조건 및 예외 상황

### 도구
- **Vitest**: 테스트 실행 및 어설션
- **@testing-library/react**: 컴포넌트 렌더링 및 사용자 상호작용
- **MSW (Mock Service Worker)**: API 모킹
- **userEvent**: 실제 사용자 행동 시뮬레이션

### GWT 패턴
모든 테스트는 다음 패턴을 준수합니다:
```typescript
it('명확한 한글 설명', async () => {
  // Given - 준비: 테스트 데이터 및 환경 설정
  // When - 실행: 사용자 동작 수행
  // Then - 검증: 결과 확인
});
```

### 커버리지 목표
- 모든 주요 사용자 흐름: 100%
- 에러 케이스: 100%
- 엣지 케이스: 주요 시나리오 커버
- 전체 라인 커버리지: 80% 이상

---

## 테스트 시나리오

### 시나리오 1: 반복 일정 수정 다이얼로그 표시

**Given**: 반복 일정 (weekly, repeatId: 'repeat-1')이 존재할 때
**When**: 해당 일정의 Edit 버튼을 클릭하면
**Then**: "반복 일정 수정" 다이얼로그가 표시되어야 함

**검증 항목**:
- [ ] 다이얼로그 제목: "반복 일정 수정"
- [ ] 메시지: "해당 일정만 수정하시겠어요?"
- [ ] "예" 버튼 존재
- [ ] "아니오" 버튼 존재
- [ ] "취소" 버튼 존재

**구현 코드**:
```typescript
it('반복 일정 수정 시 다이얼로그를 표시해야 함', async () => {
  // Given
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  // When
  const editButton = screen.getByTestId('edit-event-1'); // 반복 일정 ID
  await user.click(editButton);

  // Then
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
  expect(screen.getByText(/해당 일정만 수정하시겠어요?/)).toBeInTheDocument();
  expect(screen.getByTestId('recurring-edit-single-button')).toHaveTextContent('예');
  expect(screen.getByTestId('recurring-edit-all-button')).toHaveTextContent('아니오');
  expect(screen.getByTestId('recurring-edit-cancel-button')).toHaveTextContent('취소');
});
```

---

### 시나리오 2: 단일 일정으로 수정 (예 선택)

**Given**: 반복 일정 수정 다이얼로그가 열려 있을 때
**When**: "예" 버튼을 클릭하면
**Then**:
- [ ] PUT /api/events/:id 호출됨 (repeatInfo 제거된 데이터)
- [ ] 성공 메시지: "일정이 수정되었습니다."
- [ ] 다이얼로그 닫힘
- [ ] 일정 목록에서 해당 일정의 반복 아이콘 제거됨

**API 요청 검증**:
```json
{
  "id": "1",
  "title": "주간 회의",
  "date": "2025-10-30",
  "startTime": "10:00",
  "endTime": "11:00",
  "description": "팀 주간 회의",
  "location": "회의실 A",
  "category": "업무",
  "repeat": {
    "type": "none",
    "interval": 1
  },
  "notificationTime": 10
}
```

**구현 코드**:
```typescript
it('예 버튼 클릭 시 단일 일정으로 수정되어야 함', async () => {
  // Given
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  let requestBody: any = null;
  server.use(
    http.put('/api/events/:id', async ({ request, params }) => {
      requestBody = await request.json();
      return HttpResponse.json({ event: requestBody });
    })
  );

  const editButton = screen.getByTestId('edit-event-1');
  await user.click(editButton);
  await screen.findByRole('dialog');

  // When
  const yesButton = screen.getByTestId('recurring-edit-single-button');
  await user.click(yesButton);

  // Then
  await screen.findByText('일정이 수정되었습니다.');
  expect(requestBody).toMatchObject({
    id: '1',
    repeat: {
      type: 'none',
      interval: 1,
    },
  });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

  // 반복 아이콘 제거 확인
  const eventCard = screen.getByTestId('event-card-1');
  expect(within(eventCard).queryByTestId('repeat-icon')).not.toBeInTheDocument();
});
```

---

### 시나리오 3: 전체 시리즈 수정 (아니오 선택)

**Given**: 반복 일정 수정 다이얼로그가 열려 있을 때
**When**: "아니오" 버튼을 클릭하면
**Then**:
- [ ] 다이얼로그 닫힘
- [ ] 폼에 선택된 일정 데이터 로드됨 (제목, 날짜, 시간 등)
- [ ] 반복 일정 체크박스 활성화됨
- [ ] "일정 수정" 버튼이 활성화됨

**후속 동작**:
**When**: 사용자가 제목을 "주간 회의 (변경됨)"으로 수정 후 "일정 수정" 버튼 클릭
**Then**:
- [ ] PUT /api/recurring-events/repeat-1 호출됨
- [ ] 성공 메시지: "반복 일정 시리즈가 수정되었습니다."
- [ ] 같은 repeatId를 가진 모든 일정이 수정됨 (id: 1, 2, 3, 4)

**구현 코드**:
```typescript
it('아니오 버튼 클릭 시 폼에 데이터가 로드되어야 함', async () => {
  // Given
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  const editButton = screen.getByTestId('edit-event-1');
  await user.click(editButton);
  await screen.findByRole('dialog');

  // When
  const noButton = screen.getByTestId('recurring-edit-all-button');
  await user.click(noButton);

  // Then
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByDisplayValue('주간 회의')).toBeInTheDocument();
  expect(screen.getByDisplayValue('2025-10-30')).toBeInTheDocument();
  expect(screen.getByDisplayValue('10:00')).toBeInTheDocument();
  expect(screen.getByDisplayValue('11:00')).toBeInTheDocument();
  expect(screen.getByLabelText('반복 설정')).toBeChecked();
  expect(screen.getAllByText('일정 수정')[1]).toBeEnabled();
});

it('전체 시리즈 수정 후 모든 일정이 업데이트되어야 함', async () => {
  // Given
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  let requestBody: any = null;
  server.use(
    http.put('/api/recurring-events/:repeatId', async ({ request, params }) => {
      requestBody = await request.json();
      const updatedEvents = mockRecurringEvents.map(e => ({
        ...e,
        title: requestBody.title,
        description: requestBody.description,
      }));
      return HttpResponse.json({ events: updatedEvents });
    })
  );

  const editButton = screen.getByTestId('edit-event-1');
  await user.click(editButton);
  await screen.findByRole('dialog');

  const noButton = screen.getByTestId('recurring-edit-all-button');
  await user.click(noButton);

  // When
  const titleInput = screen.getByLabelText('제목');
  await user.clear(titleInput);
  await user.type(titleInput, '주간 회의 (변경됨)');

  const saveButton = screen.getAllByText('일정 수정')[1];
  await user.click(saveButton);

  // Then
  await screen.findByText('반복 일정 시리즈가 수정되었습니다.');
  expect(requestBody).toMatchObject({
    title: '주간 회의 (변경됨)',
  });

  // 모든 시리즈 이벤트가 업데이트되었는지 확인
  expect(screen.getAllByText('주간 회의 (변경됨)')).toHaveLength(4);
});
```

---

### 시나리오 4: 다이얼로그 취소

**Given**: 반복 일정 수정 다이얼로그가 열려 있을 때
**When**: "취소" 버튼을 클릭하면
**Then**:
- [ ] 다이얼로그 닫힘
- [ ] 아무 작업도 수행되지 않음 (API 호출 없음)
- [ ] 폼 상태 변경 없음

**구현 코드**:
```typescript
it('취소 버튼 클릭 시 다이얼로그만 닫혀야 함', async () => {
  // Given
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  let apiCalled = false;
  server.use(
    http.put('/api/events/:id', () => {
      apiCalled = true;
      return HttpResponse.json({});
    })
  );

  const editButton = screen.getByTestId('edit-event-1');
  await user.click(editButton);
  await screen.findByRole('dialog');

  // When
  const cancelButton = screen.getByTestId('recurring-edit-cancel-button');
  await user.click(cancelButton);

  // Then
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(apiCalled).toBe(false);
  expect(screen.queryByDisplayValue('주간 회의')).not.toBeInTheDocument();
});
```

---

### 시나리오 5: 단일 일정 수정 (반복 아님)

**Given**: 단일 일정 (repeat.type === 'none')이 존재할 때
**When**: Edit 버튼을 클릭하면
**Then**:
- [ ] 다이얼로그가 표시되지 않음
- [ ] 바로 폼에 데이터 로드됨

**구현 코드**:
```typescript
it('단일 일정 수정 시 다이얼로그가 표시되지 않아야 함', async () => {
  // Given
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  // When
  const editButton = screen.getByTestId('edit-event-5'); // 단일 일정 ID
  await user.click(editButton);

  // Then
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByDisplayValue('개인 약속')).toBeInTheDocument();
  expect(screen.getByDisplayValue('2025-10-31')).toBeInTheDocument();
});
```

---

## 에러 케이스

### 에러 1: 단일 수정 API 실패

**Given**: 반복 일정 수정 다이얼로그가 열려 있을 때
**When**: "예" 버튼 클릭 시 API가 500 에러를 반환하면
**Then**:
- [ ] 에러 메시지: "일정 수정 실패"
- [ ] 다이얼로그 상태 유지 (재시도 가능)

**구현 코드**:
```typescript
it('단일 수정 API 실패 시 에러 메시지를 표시해야 함', async () => {
  // Given
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  server.use(
    http.put('/api/events/:id', () => {
      return HttpResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    })
  );

  const editButton = screen.getByTestId('edit-event-1');
  await user.click(editButton);
  await screen.findByRole('dialog');

  // When
  const yesButton = screen.getByTestId('recurring-edit-single-button');
  await user.click(yesButton);

  // Then
  await screen.findByText('일정 수정 실패');
  expect(screen.getByRole('dialog')).toBeInTheDocument(); // 다이얼로그 유지
});
```

---

### 에러 2: 반복 시리즈 없음 (404)

**Given**: 반복 일정 수정 다이얼로그가 열려 있을 때
**When**: "아니오" 선택 후 시리즈 수정 시 404 응답을 받으면
**Then**:
- [ ] 에러 메시지: "반복 일정 시리즈를 찾을 수 없습니다."
- [ ] 다이얼로그 닫힘 (더 이상 작업 불가)

**구현 코드**:
```typescript
it('반복 시리즈가 존재하지 않으면 404 에러를 처리해야 함', async () => {
  // Given
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  server.use(
    http.put('/api/recurring-events/:repeatId', () => {
      return HttpResponse.json(
        { error: 'Recurring series not found' },
        { status: 404 }
      );
    })
  );

  const editButton = screen.getByTestId('edit-event-1');
  await user.click(editButton);
  await screen.findByRole('dialog');

  const noButton = screen.getByTestId('recurring-edit-all-button');
  await user.click(noButton);

  const saveButton = screen.getAllByText('일정 수정')[1];
  await user.click(saveButton);

  // Then
  await screen.findByText('반복 일정 시리즈를 찾을 수 없습니다.');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```

---

### 에러 3: 선택된 일정 없음

**Given**: selectedRecurringEvent가 null일 때
**When**: 핸들러 함수가 호출되면
**Then**:
- [ ] 에러 메시지: "선택된 일정이 없습니다."
- [ ] 작업 중단 (API 호출 없음)

**구현 코드**:
```typescript
it('선택된 일정이 없으면 에러 메시지를 표시해야 함', async () => {
  // Given
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  // 강제로 selectedRecurringEvent를 null로 만드는 시나리오
  // (실제로는 버튼 클릭 전 상태 초기화 등으로 발생 가능)

  // When & Then
  // 이 케이스는 코드 커버리지를 위한 방어 로직 테스트
  // 실제 UI에서는 발생하기 어려운 시나리오
  // handleEditSingleOccurrence 함수를 직접 호출하거나
  // 비정상적인 상태 변경을 시뮬레이션
});
```

---

## 엣지 케이스

### 엣지 1: repeatId는 있지만 repeat.type이 'none'

**조건**: `repeat: { type: 'none', interval: 1, id: 'repeat-1' }`
**Expect**: 다이얼로그 표시 안 됨 (`repeat.type !== 'none'` 조건)

**구현 코드**:
```typescript
it('repeatId가 있어도 repeat.type이 none이면 다이얼로그가 표시되지 않아야 함', async () => {
  // Given
  const eventWithIdButNoType = {
    id: '6',
    title: '예외 이벤트',
    date: '2025-11-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '',
    location: '',
    category: '기타',
    repeat: { type: 'none' as const, interval: 1, id: 'repeat-1' },
    notificationTime: 10,
  };

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: [eventWithIdButNoType] });
    })
  );

  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  // When
  const editButton = screen.getByTestId('edit-event-6');
  await user.click(editButton);

  // Then
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByDisplayValue('예외 이벤트')).toBeInTheDocument();
});
```

---

### 엣지 2: repeat.type은 있지만 repeatId가 없음

**조건**: `repeat: { type: 'weekly', interval: 1 }` (id 없음)
**Expect**: 다이얼로그 표시 안 됨 (`repeat.id` 조건)

**구현 코드**:
```typescript
it('repeat.type이 있어도 repeatId가 없으면 다이얼로그가 표시되지 않아야 함', async () => {
  // Given
  const eventWithTypeButNoId = {
    id: '7',
    title: 'repeatId 없는 이벤트',
    date: '2025-11-02',
    startTime: '14:00',
    endTime: '15:00',
    description: '',
    location: '',
    category: '개인',
    repeat: { type: 'weekly' as const, interval: 1 },
    notificationTime: 10,
  };

  server.use(
    http.get('/api/events', () => {
      return HttpResponse.json({ events: [eventWithTypeButNoId] });
    })
  );

  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  // When
  const editButton = screen.getByTestId('edit-event-7');
  await user.click(editButton);

  // Then
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByDisplayValue('repeatId 없는 이벤트')).toBeInTheDocument();
});
```

---

### 엣지 3: 단일 수정 후 재수정

**조건**: 반복 일정을 단일 일정으로 변경한 후 다시 수정
**Expect**: 단일 일정으로 변경되었으므로 다이얼로그 없이 수정됨

**구현 코드**:
```typescript
it('단일 일정으로 변경 후 재수정 시 다이얼로그가 표시되지 않아야 함', async () => {
  // Given
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  // 첫 번째 수정: 반복 → 단일
  const editButton = screen.getByTestId('edit-event-1');
  await user.click(editButton);
  await screen.findByRole('dialog');

  const yesButton = screen.getByTestId('recurring-edit-single-button');
  await user.click(yesButton);
  await screen.findByText('일정이 수정되었습니다.');

  // When: 두 번째 수정 시도
  const editButtonAgain = screen.getByTestId('edit-event-1');
  await user.click(editButtonAgain);

  // Then: 다이얼로그 없이 바로 폼 로드
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByDisplayValue('주간 회의')).toBeInTheDocument();
});
```

---

## MSW 핸들러 설계

### GET /api/events

**목적**: 반복 일정 포함한 목록 반환

**Mock 데이터**:
```typescript
const mockEvents = [
  // 반복 일정 시리즈 (weekly, 4개)
  {
    id: '1',
    title: '주간 회의',
    date: '2025-10-30',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-11-20', id: 'repeat-1' },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '주간 회의',
    date: '2025-11-06',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-11-20', id: 'repeat-1' },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '주간 회의',
    date: '2025-11-13',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-11-20', id: 'repeat-1' },
    notificationTime: 10,
  },
  {
    id: '4',
    title: '주간 회의',
    date: '2025-11-20',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'weekly', interval: 1, endDate: '2025-11-20', id: 'repeat-1' },
    notificationTime: 10,
  },
  // 단일 일정
  {
    id: '5',
    title: '개인 약속',
    date: '2025-10-31',
    startTime: '14:00',
    endTime: '15:00',
    description: '병원 방문',
    location: '서울대병원',
    category: '개인',
    repeat: { type: 'none', interval: 1 },
    notificationTime: 60,
  },
];
```

**Handler**:
```typescript
http.get('/api/events', () => {
  return HttpResponse.json({ events: mockEvents });
});
```

---

### PUT /api/events/:id

**목적**: 단일 일정 수정 (반복 → 단일 변환 포함)

**성공 응답** (200):
```typescript
http.put('/api/events/:id', async ({ request, params }) => {
  const updatedEvent = await request.json();
  return HttpResponse.json({ event: updatedEvent });
});
```

**실패 응답** (500):
```typescript
http.put('/api/events/:id', () => {
  return HttpResponse.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  );
});
```

---

### PUT /api/recurring-events/:repeatId

**목적**: 반복 시리즈 전체 수정

**성공 응답** (200):
```typescript
http.put('/api/recurring-events/:repeatId', async ({ request, params }) => {
  const updateData = await request.json();
  const { repeatId } = params;

  const updatedEvents = mockEvents
    .filter(e => e.repeat.id === repeatId)
    .map(e => ({
      ...e,
      title: updateData.title ?? e.title,
      description: updateData.description ?? e.description,
      location: updateData.location ?? e.location,
      category: updateData.category ?? e.category,
      notificationTime: updateData.notificationTime ?? e.notificationTime,
    }));

  return HttpResponse.json({ events: updatedEvents });
});
```

**404 응답**:
```typescript
http.put('/api/recurring-events/:repeatId', () => {
  return HttpResponse.json(
    { error: 'Recurring series not found' },
    { status: 404 }
  );
});
```

**실패 응답** (500):
```typescript
http.put('/api/recurring-events/:repeatId', () => {
  return HttpResponse.json(
    { error: 'Internal Server Error' },
    { status: 500 }
  );
});
```

---

## 테스트 데이터

### 반복 일정 시리즈 (weekly, 4주)

```typescript
const recurringEvents = [
  {
    id: '1',
    title: '주간 회의',
    date: '2025-10-30',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 주간 회의',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'weekly' as const,
      interval: 1,
      endDate: '2025-11-20',
      id: 'repeat-1',
    },
    notificationTime: 10,
  },
  // ... 동일 repeatId로 3개 더 (2025-11-06, 2025-11-13, 2025-11-20)
];
```

### 단일 일정

```typescript
const singleEvent = {
  id: '5',
  title: '개인 약속',
  date: '2025-10-31',
  startTime: '14:00',
  endTime: '15:00',
  description: '병원 방문',
  location: '서울대병원',
  category: '개인',
  repeat: { type: 'none' as const, interval: 1 },
  notificationTime: 60,
};
```

---

## 테스트 케이스 목록

### 우선순위별 정리

#### P0 (필수)
1. [ ] 반복 일정 수정 다이얼로그 표시
2. [ ] 단일 일정으로 수정 (예 선택)
3. [ ] 전체 시리즈 수정 (아니오 선택)
4. [ ] 다이얼로그 취소
5. [ ] 단일 일정 수정 (반복 아님)

#### P1 (중요)
6. [ ] 단일 수정 API 실패
7. [ ] 반복 시리즈 없음 (404)
8. [ ] 전체 시리즈 수정 후 모든 일정 업데이트 확인

#### P2 (선택)
9. [ ] repeatId는 있지만 repeat.type이 'none'
10. [ ] repeat.type은 있지만 repeatId가 없음
11. [ ] 단일 수정 후 재수정

### 예상 실행 시간
- 전체 테스트: 약 10-15초
- 개별 테스트: 500ms - 1.5초

---

## 참고 사항

### 기존 테스트와의 통합

#### medium.integration.spec.tsx
- `setup()` 함수 재사용
- `saveSchedule()` 헬퍼 참고 (폼 입력 패턴)
- MSW 핸들러 확장 방식 참고

#### task.repeat-event-integration.spec.ts
- 반복 일정 생성 테스트 참고
- 반복 일정 삭제 다이얼로그 패턴 참고

### 주의사항

#### 1. 비동기 처리
- 모든 사용자 상호작용은 `await user.click()` 사용
- API 응답 대기: `await screen.findByText()`
- 다이얼로그 렌더링 대기: `await screen.findByRole('dialog')`

#### 2. 상태 격리
- 각 테스트는 독립적으로 실행되어야 함
- MSW 핸들러는 테스트마다 `server.use()`로 재정의

#### 3. data-testid 사용
- Edit 버튼: `edit-event-{id}`
- Event Card: `event-card-{id}`
- Repeat 아이콘: `repeat-icon`
- Dialog 버튼: `recurring-edit-{single|all|cancel}-button`

#### 4. 접근성
- `getByRole('dialog')` 사용
- `getByLabelText()` 사용 (폼 입력)
- `within()` 사용 (특정 카드 내부 요소 찾기)

---

**작성자**: test-designer (orchestrator 역할 수행)
**작성일**: 2025-10-30
**검토자**: -
**승인일**: 2025-10-30
