---
phase: 3
agent: test-writer
timestamp: 2025-10-30T22:08:00Z
status: ready
previous_phase: 2

inputs:
  requirement: "반복 일정 수정 기능의 실패하는 테스트 작성 (TDD RED Phase)"
  context_files:
    - ./phase0-plan.md
    - .claude/agent-docs/feature-designer/logs/spec.md
    - .claude/agent-docs/test-designer/logs/test-strategy.md
    - /Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/__tests__/medium.integration.spec.tsx

references:
  agent_definition: ../../agents/test-writer.md
  agent_prompt: ../test-writer/prompt.md
  shared_docs:
    - ../../docs/folder-tree.md
    - ../../docs/rule-of-make-good-test.md

output_requirements:
  path: /Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/__tests__/integration/task.recurring-edit.spec.tsx
  required_sections:
    - Import statements
    - Setup function
    - Mock data
    - Test suites with GWT pattern
  format: typescript
  additional:
    - logs/YYYY-MM-DD_test-writing-log.md

constraints:
  - 테스트는 반드시 실패해야 함 (RED Phase)
  - GWT 패턴 준수
  - MSW로 API 모킹
  - 접근성 테스트 포함
  - 한글 describe/it 사용

validation_criteria:
  - 모든 테스트가 실패해야 함
  - 실패 이유가 명확해야 함
  - 테스트 코드가 올바르게 작성되어야 함
  - MSW 핸들러가 올바르게 설정되어야 함
---

# Phase 3 Handoff: RED - Test Writing

## 에이전트 정보
**수신자**: test-writer
**발신자**: orchestrator
**Phase**: 3/6 - RED (Test Writing)
**생성일**: 2025-10-30

---

## 작업 목표

반복 일정 수정 기능의 실패하는 테스트를 작성합니다 (TDD RED Phase).

### 입력 산출물
- [계획 문서](./phase0-plan.md)
- [기능 설계](.claude/agent-docs/feature-designer/logs/spec.md)
- [테스트 설계](.claude/agent-docs/test-designer/logs/test-strategy.md)
- 기존 테스트 참고: `/Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/__tests__/medium.integration.spec.tsx`

### 출력 산출물
- `/Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/__tests__/integration/task.recurring-edit.spec.tsx` 파일 생성
- `.claude/agent-docs/test-writer/logs/YYYY-MM-DD_test-writing-log.md` 작성 (테스트 실패 결과 기록)

---

## 요구사항

### 1. 테스트 파일 구조

다음 구조로 테스트 파일을 작성하세요:

```typescript
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';

import App from '../../App';
import { server } from '../../setupTests';
import { Event } from '../../types';

const theme = createTheme();

const setup = (element: React.ReactElement) => {
  const user = userEvent.setup();
  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

// Mock 데이터
const mockRecurringEvents: Event[] = [
  // ... (테스트 설계 문서 참고)
];

describe('반복 일정 수정', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.json({ events: mockRecurringEvents });
      })
    );
  });

  describe('반복 일정 수정 다이얼로그', () => {
    it('반복 일정 수정 시 다이얼로그를 표시해야 함', async () => {
      // Given
      // When
      // Then
    });

    // ... 나머지 테스트 케이스
  });

  describe('단일 일정으로 수정', () => {
    // ...
  });

  describe('전체 시리즈 수정', () => {
    // ...
  });

  describe('에러 핸들링', () => {
    // ...
  });

  describe('엣지 케이스', () => {
    // ...
  });
});
```

### 2. 필수 테스트 케이스 (P0)

다음 5개의 테스트 케이스를 반드시 작성하세요:

#### TC-1: 반복 일정 수정 다이얼로그 표시
```typescript
it('반복 일정 수정 시 다이얼로그를 표시해야 함', async () => {
  // Given: 반복 일정이 로드됨
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  // When: Edit 버튼 클릭
  const editButton = screen.getByTestId('edit-event-1');
  await user.click(editButton);

  // Then: 다이얼로그 표시 확인
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
  expect(screen.getByText(/해당 일정만 수정하시겠어요?/)).toBeInTheDocument();
  expect(screen.getByTestId('recurring-edit-single-button')).toHaveTextContent('예');
  expect(screen.getByTestId('recurring-edit-all-button')).toHaveTextContent('아니오');
  expect(screen.getByTestId('recurring-edit-cancel-button')).toHaveTextContent('취소');
});
```

#### TC-2: 단일 일정으로 수정 (예 선택)
```typescript
it('예 버튼 클릭 시 단일 일정으로 수정되어야 함', async () => {
  // Given: 다이얼로그가 열려 있음
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  let requestBody: any = null;
  server.use(
    http.put('/api/events/:id', async ({ request }) => {
      requestBody = await request.json();
      return HttpResponse.json({ event: requestBody });
    })
  );

  const editButton = screen.getByTestId('edit-event-1');
  await user.click(editButton);
  await screen.findByRole('dialog');

  // When: "예" 버튼 클릭
  const yesButton = screen.getByTestId('recurring-edit-single-button');
  await user.click(yesButton);

  // Then: API 호출 및 성공 메시지 확인
  await screen.findByText('일정이 수정되었습니다.');
  expect(requestBody).toMatchObject({
    id: '1',
    repeat: {
      type: 'none',
      interval: 1,
    },
  });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
```

#### TC-3: 전체 시리즈 수정 (아니오 선택) - 폼 로드
```typescript
it('아니오 버튼 클릭 시 폼에 데이터가 로드되어야 함', async () => {
  // Given: 다이얼로그가 열려 있음
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  const editButton = screen.getByTestId('edit-event-1');
  await user.click(editButton);
  await screen.findByRole('dialog');

  // When: "아니오" 버튼 클릭
  const noButton = screen.getByTestId('recurring-edit-all-button');
  await user.click(noButton);

  // Then: 폼에 데이터 로드 확인
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByDisplayValue('주간 회의')).toBeInTheDocument();
  expect(screen.getByDisplayValue('2025-10-30')).toBeInTheDocument();
  expect(screen.getByDisplayValue('10:00')).toBeInTheDocument();
  expect(screen.getByDisplayValue('11:00')).toBeInTheDocument();
  expect(screen.getByLabelText('반복 설정')).toBeChecked();
});
```

#### TC-4: 다이얼로그 취소
```typescript
it('취소 버튼 클릭 시 다이얼로그만 닫혀야 함', async () => {
  // Given: 다이얼로그가 열려 있음
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

  // When: "취소" 버튼 클릭
  const cancelButton = screen.getByTestId('recurring-edit-cancel-button');
  await user.click(cancelButton);

  // Then: 다이얼로그만 닫히고 API 호출 없음
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(apiCalled).toBe(false);
});
```

#### TC-5: 단일 일정 수정 (반복 아님)
```typescript
it('단일 일정 수정 시 다이얼로그가 표시되지 않아야 함', async () => {
  // Given: 단일 일정이 존재함
  const { user } = setup(<App />);
  await screen.findByText('일정 로딩 완료!');

  // When: Edit 버튼 클릭
  const editButton = screen.getByTestId('edit-event-5');
  await user.click(editButton);

  // Then: 다이얼로그 없이 바로 폼 로드
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByDisplayValue('개인 약속')).toBeInTheDocument();
});
```

### 3. 에러 케이스 (P1)

다음 2개의 에러 케이스를 작성하세요:

#### EC-1: 단일 수정 API 실패
```typescript
it('단일 수정 API 실패 시 에러 메시지를 표시해야 함', async () => {
  // Given
  // When: API 500 에러
  // Then: 에러 메시지 + 다이얼로그 유지
});
```

#### EC-2: 반복 시리즈 없음 (404)
```typescript
it('반복 시리즈가 존재하지 않으면 404 에러를 처리해야 함', async () => {
  // Given
  // When: API 404 응답
  // Then: 에러 메시지 + 다이얼로그 닫힘
});
```

### 4. Mock 데이터

다음 데이터를 파일 상단에 정의하세요:

```typescript
const mockRecurringEvents: Event[] = [
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
      type: 'weekly',
      interval: 1,
      endDate: '2025-11-20',
      id: 'repeat-1',
    },
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
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-11-20',
      id: 'repeat-1',
    },
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
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-11-20',
      id: 'repeat-1',
    },
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
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-11-20',
      id: 'repeat-1',
    },
    notificationTime: 10,
  },
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

---

## 제약 조건

### TDD RED Phase 원칙
- **테스트가 실패해야 함**: 기능이 아직 구현되지 않았으므로 모든 테스트가 실패해야 함
- **명확한 실패 메시지**: 무엇이 없는지 명확하게 표시
- **최소 구현 목표**: 테스트가 통과하기 위해 필요한 최소 요구사항 정의

### 파일 위치
- **경로**: `/Users/daehyun/Desktop/hh99_fe_7th/front_7th_chapter1-2/src/__tests__/integration/`
- **파일명**: `task.recurring-edit.spec.tsx`

### GWT 패턴 준수
- 모든 테스트는 Given-When-Then 주석 포함
- 한글 설명 사용
- 논리적 그룹화 (describe 블록)

### data-testid 사용
- Edit 버튼: `edit-event-{id}`
- Event Card: `event-card-{id}`
- Dialog 버튼: `recurring-edit-{single|all|cancel}-button`

---

## 검증 체크리스트

완료 시 다음 항목을 확인하세요:

- [ ] 테스트 파일 생성 (`task.recurring-edit.spec.tsx`)
- [ ] P0 테스트 케이스 5개 작성
- [ ] P1 에러 케이스 2개 작성
- [ ] Mock 데이터 정의
- [ ] GWT 패턴 적용
- [ ] 모든 테스트가 실패함 (RED Phase)
- [ ] 실패 메시지가 명확함
- [ ] TypeScript 에러 없음
- [ ] ESLint 경고 없음

---

## 실행 방법

### 테스트 실행
```bash
# 전체 테스트
pnpm test

# 특정 파일만
pnpm test task.recurring-edit

# UI 모드
pnpm test:ui
```

### 예상 결과
```
❌ 반복 일정 수정 시 다이얼로그를 표시해야 함
   Expected: dialog to be in the document
   Received: null

❌ 예 버튼 클릭 시 단일 일정으로 수정되어야 함
   Expected: button with data-testid "recurring-edit-single-button"
   Received: element not found

... (7개 테스트 모두 실패)
```

---

## 다음 Phase

Phase 4로 전달할 내용:
- `src/__tests__/integration/task.recurring-edit.spec.tsx` (이번 Phase 산출물)
- 실패하는 테스트 목록
- 구현 가이드 (테스트를 통과시키기 위한 요구사항)

**다음 에이전트**: code-writer
**다음 작업**: 기능 구현 (GREEN Phase)

---

**생성자**: orchestrator
**최종 수정**: 2025-10-30
