# Test Architect Templates

테스트 아키텍처 설계를 위한 템플릿 모음입니다. 상황에 맞는 템플릿을 선택하여 사용하세요.

**중요**: 이 템플릿들은 **테스트 구조와 시나리오만** 설계합니다. 실제 테스트 로직 구현은 Developer가 담당합니다.

---

## Template 1: Unit Test Template

**사용 시기**: 단일 함수, 유틸리티, 훅 등 독립적인 단위 테스트

**파일 경로**: 
- Custom Hook: `__tests__/hooks/[hookName].hook.spec.ts`
- Utility: `__tests__/utils/[utilName].util.spec.ts`

### 기본 구조

```typescript
// 파일: __tests__/utils/dateUtils.util.spec.ts
import { describe, it, expect } from 'vitest';

describe('[함수명/훅명]', () => {
  describe('정상 동작', () => {
    it('기본 입력에 대해 올바른 결과를 반환한다', () => {
      // Developer가 구현
    });

    it('[다른 정상 케이스]', () => {
      // Developer가 구현
    });
  });

  describe('엣지 케이스', () => {
    it('빈 값이 입력되면 기본값을 반환한다', () => {
      // Developer가 구현
    });

    it('null이 입력되면 에러를 발생시킨다', () => {
      // Developer가 구현
    });
  });

  describe('경계값', () => {
    it('최솟값에서 정상 동작한다', () => {
      // Developer가 구현
    });

    it('최댓값에서 정상 동작한다', () => {
      // Developer가 구현
    });
  });
});
```

### Custom Hook 테스트

```typescript
// 파일: __tests__/hooks/useCustomHook.hook.spec.ts
import { renderHook, act } from '@testing-library/react';
import { useCustomHook } from './useCustomHook';

describe('useCustomHook', () => {
  it('초기값이 올바르게 설정된다', () => {
    // Developer가 구현
  });

  it('상태 업데이트가 올바르게 동작한다', () => {
    // Developer가 구현
  });
});
```

### 예시: 날짜 포맷 함수

```typescript
// 파일: __tests__/utils/dateFormat.util.spec.ts
import { describe, it } from 'vitest';
import { formatDate } from './dateUtils';

describe('formatDate', () => {
  describe('정상 동작', () => {
    it('유효한 날짜 객체를 YYYY-MM-DD 형식으로 변환한다', () => {
      // Developer가 구현
    });

    it('문자열 날짜를 올바르게 파싱하여 변환한다', () => {
      // Developer가 구현
    });
  });

  describe('엣지 케이스', () => {
    it('잘못된 날짜 형식이면 에러를 발생시킨다', () => {
      // Developer가 구현
    });

    it('null이나 undefined 입력 시 에러를 발생시킨다', () => {
      // Developer가 구현
    });
  });
});
```

---

## Template 2: Component Test Template

**사용 시기**: 개별 React 컴포넌트 테스트

**파일 경로**: `__tests__/components/[ComponentName].component.spec.ts`

### 기본 구조

```typescript
// 파일: __tests__/components/ComponentName.component.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  describe('렌더링', () => {
    it('초기 상태가 올바르게 렌더링된다', () => {
      // Developer가 구현
    });

    it('props에 따라 다르게 렌더링된다', () => {
      // Developer가 구현
    });
  });

  describe('사용자 상호작용', () => {
    it('버튼 클릭 시 콜백이 호출된다', () => {
      // Developer가 구현
    });

    it('입력 필드에 텍스트를 입력할 수 있다', () => {
      // Developer가 구현
    });
  });

  describe('조건부 렌더링', () => {
    it('로딩 중일 때 로딩 인디케이터를 표시한다', () => {
      // Developer가 구현
    });

    it('에러가 있을 때 에러 메시지를 표시한다', () => {
      // Developer가 구현
    });
  });

  describe('접근성', () => {
    it('적절한 ARIA 속성을 가진다', () => {
      // Developer가 구현
    });

    it('키보드 네비게이션이 가능하다', () => {
      // Developer가 구현
    });
  });
});
```

### Form 컴포넌트 테스트

```typescript
// 파일: __tests__/components/EventForm.component.spec.ts
import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { EventForm } from './EventForm';

describe('EventForm', () => {
  describe('정상 제출', () => {
    it('유효한 데이터 제출 시 onSubmit이 올바른 데이터와 함께 호출된다', () => {
      // Developer가 구현
      // 힌트: 제목='팀 미팅', 날짜='2025-11-01', 시간='14:00' 입력
    });
  });

  describe('유효성 검증', () => {
    it('필수 필드가 비어있으면 에러 메시지를 표시한다', () => {
      // Developer가 구현
    });

    it('유효하지 않은 날짜 형식이면 에러를 표시한다', () => {
      // Developer가 구현
    });

    it('시작 시간이 종료 시간보다 늦으면 에러를 표시한다', () => {
      // Developer가 구현
    });
  });

  describe('초기화', () => {
    it('취소 버튼 클릭 시 폼이 초기화된다', () => {
      // Developer가 구현
    });
  });
});
```

### 예시: Calendar 컴포넌트

```typescript
// 파일: __tests__/components/Calendar.component.spec.ts
import { describe, it } from 'vitest';
import { render } from '@testing-library/react';
import { Calendar } from './Calendar';

describe('Calendar', () => {
  describe('렌더링', () => {
    it('현재 월의 캘린더가 표시된다', () => {
      // Developer가 구현
    });

    it('전달받은 일정들이 해당 날짜에 표시된다', () => {
      // Developer가 구현
    });

    it('오늘 날짜가 하이라이트된다', () => {
      // Developer가 구현
    });
  });

  describe('네비게이션', () => {
    it('이전 달 버튼 클릭 시 이전 달로 이동한다', () => {
      // Developer가 구현
    });

    it('다음 달 버튼 클릭 시 다음 달로 이동한다', () => {
      // Developer가 구현
    });

    it('오늘 버튼 클릭 시 현재 월로 돌아온다', () => {
      // Developer가 구현
    });
  });

  describe('날짜 선택', () => {
    it('날짜 셀 클릭 시 onDateClick 콜백이 호출된다', () => {
      // Developer가 구현
    });

    it('선택된 날짜가 시각적으로 구분된다', () => {
      // Developer가 구현
    });
  });

  describe('일정 표시', () => {
    it('하루에 여러 일정이 있을 때 모두 표시된다', () => {
      // Developer가 구현
    });

    it('일정이 없는 날은 비어있다', () => {
      // Developer가 구현
    });
  });
});
```

---

## Template 3: Integration Test Template

**사용 시기**: 여러 컴포넌트가 함께 동작하는 시나리오 테스트

**파일 경로**: `__tests__/[featureName].spec.ts` (루트에 위치)

### 기본 구조

```typescript
// 파일: __tests__/eventManagement.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import App from './App';

describe('일정 관리 통합 테스트', () => {
  beforeEach(() => {
    // MSW 핸들러 초기화는 Developer가 구현
  });

  describe('일정 CRUD 플로우', () => {
    it('일정 추가-조회-수정-삭제 전체 플로우가 정상 동작한다', () => {
      // Developer가 구현
      // 힌트: 
      // 1. 기존 일정 로딩 확인
      // 2. 새 일정 추가
      // 3. 일정 수정
      // 4. 일정 삭제
    });
  });

  describe('여러 컴포넌트 간 상호작용', () => {
    it('캘린더에서 날짜 클릭 시 해당 날짜의 일정이 사이드바에 표시된다', () => {
      // Developer가 구현
    });

    it('사이드바에서 일정 클릭 시 상세 모달이 열린다', () => {
      // Developer가 구현
    });
  });

  describe('데이터 동기화', () => {
    it('한 컴포넌트에서 일정을 추가하면 다른 모든 뷰에 반영된다', () => {
      // Developer가 구현
    });

    it('일정 수정 시 모든 관련 컴포넌트가 업데이트된다', () => {
      // Developer가 구현
    });
  });
});
```

### 에러 처리 통합 테스트

```typescript
// 파일: __tests__/errorHandling.spec.ts
describe('에러 처리 통합 시나리오', () => {
  it('API 에러 발생 시 적절한 에러 메시지를 표시하고 복구할 수 있다', () => {
    // Developer가 구현
    // 힌트:
    // 1. API 에러 발생 (500)
    // 2. 에러 메시지 표시 확인
    // 3. 재시도 버튼 클릭
    // 4. 정상 데이터 로딩 확인
  });

  it('네트워크 오프라인 시 적절한 메시지를 표시한다', () => {
    // Developer가 구현
  });

  it('부분 실패 시 성공한 데이터는 표시하고 실패한 부분만 에러 처리한다', () => {
    // Developer가 구현
  });
});
```

---

## Template 4: E2E Scenario Template

**사용 시기**: 완전한 사용자 플로우 테스트

**파일 경로**: `__tests__/[scenarioName].spec.ts` (루트에 위치)

### 기본 구조

```typescript
// 파일: __tests__/userJourney.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import App from './App';

describe('E2E: 사용자 시나리오', () => {
  beforeEach(() => {
    // 초기 데이터 설정은 Developer가 구현
  });

  it('신규 사용자가 첫 일정을 등록하고 관리하는 전체 플로우', () => {
    // Developer가 구현
    // Scenario:
    // 1. 빈 캘린더 확인
    // 2. 일정 추가 모달 열기
    // 3. 일정 정보 입력 (제목, 날짜, 시간, 메모)
    // 4. 일정 저장
    // 5. 캘린더에 일정 표시 확인
    // 6. 일정 클릭하여 상세보기
    // 7. 일정 수정
    // 8. 수정 내용 확인
  });

  it('반복 일정을 설정하고 특정 일정만 수정하는 플로우', () => {
    // Developer가 구현
    // Scenario:
    // 1. 반복 일정 추가 (매주 월요일)
    // 2. 여러 인스턴스 생성 확인
    // 3. 특정 날짜의 일정만 수정
    // 4. 해당 날짜만 변경, 다른 일정은 유지 확인
  });

  it('일정 검색 및 필터링 플로우', () => {
    // Developer가 구현
    // Scenario:
    // 1. 여러 일정 추가
    // 2. 검색어로 일정 필터링
    // 3. 날짜 범위로 일정 필터링
    // 4. 카테고리로 일정 필터링
  });
});
```

---

## Template 5: MSW Handler Template

**사용 시기**: API 모킹 정의

### REST API Handlers

```typescript
import { http, HttpResponse, delay } from 'msw';

export const handlers = [
  // GET: 목록 조회
  http.get('/api/events', async () => {
    await delay(100); // 네트워크 지연 시뮬레이션
    
    return HttpResponse.json([
      {
        id: 1,
        title: '팀 미팅',
        date: '2025-11-01',
        startTime: '14:00',
        endTime: '15:00',
        description: '주간 회의'
      },
      {
        id: 2,
        title: '프로젝트 리뷰',
        date: '2025-11-03',
        startTime: '10:00',
        endTime: '11:00',
        description: ''
      }
    ]);
  }),

  // GET: 단일 조회
  http.get('/api/events/:id', async ({ params }) => {
    const { id } = params;
    
    return HttpResponse.json({
      id: Number(id),
      title: '일정 상세',
      date: '2025-11-01',
      startTime: '14:00',
      endTime: '15:00',
      description: '상세 내용'
    });
  }),

  // POST: 생성
  http.post('/api/events', async ({ request }) => {
    const body = await request.json();
    
    // 유효성 검증 시뮬레이션
    if (!body.title) {
      return HttpResponse.json(
        { error: '제목은 필수입니다' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json(
      { 
        id: Date.now(), 
        ...body,
        createdAt: new Date().toISOString()
      },
      { status: 201 }
    );
  }),

  // PUT: 수정
  http.put('/api/events/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json();
    
    return HttpResponse.json({
      id: Number(id),
      ...body,
      updatedAt: new Date().toISOString()
    });
  }),

  // DELETE: 삭제
  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    
    // 존재하지 않는 ID 시뮬레이션
    if (Number(id) === 999) {
      return HttpResponse.json(
        { error: '일정을 찾을 수 없습니다' },
        { status: 404 }
      );
    }
    
    return new HttpResponse(null, { status: 204 });
  }),
];
```

### 에러 시나리오 Handlers

```typescript
// 특정 테스트를 위한 에러 핸들러
export const errorHandlers = {
  serverError: http.get('/api/events', () => {
    return HttpResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }),

  networkError: http.get('/api/events', () => {
    return HttpResponse.error();
  }),

  timeout: http.get('/api/events', async () => {
    await delay('infinite');
  }),

  unauthorized: http.get('/api/events', () => {
    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }),

  validationError: http.post('/api/events', () => {
    return HttpResponse.json(
      { 
        error: 'Validation Error',
        details: {
          title: '제목은 최대 100자까지 입력 가능합니다',
          date: '유효한 날짜 형식이 아닙니다'
        }
      },
      { status: 422 }
    );
  }),
};
```

### 동적 데이터 관리 (선택)

```typescript
// 테스트 중 상태 관리
let mockDatabase = {
  events: [
    { id: 1, title: '초기 일정', date: '2025-11-01' }
  ],
  nextId: 2
};

export const dynamicHandlers = [
  http.get('/api/events', () => {
    return HttpResponse.json(mockDatabase.events);
  }),

  http.post('/api/events', async ({ request }) => {
    const body = await request.json();
    const newEvent = {
      id: mockDatabase.nextId++,
      ...body,
      createdAt: new Date().toISOString()
    };
    mockDatabase.events.push(newEvent);
    
    return HttpResponse.json(newEvent, { status: 201 });
  }),

  http.delete('/api/events/:id', ({ params }) => {
    const { id } = params;
    mockDatabase.events = mockDatabase.events.filter(
      e => e.id !== Number(id)
    );
    return new HttpResponse(null, { status: 204 });
  })
];

// 테스트 간 데이터 초기화 헬퍼
export const resetMockDatabase = () => {
  mockDatabase = {
    events: [{ id: 1, title: '초기 일정', date: '2025-11-01' }],
    nextId: 2
  };
};
```

---

## Template 6: Accessibility Test Template

**사용 시기**: 접근성 테스트

**파일 경로**: `__tests__/components/[ComponentName].a11y.spec.ts` 또는 `__tests__/accessibility.spec.ts`

```typescript
// 파일: __tests__/components/Calendar.a11y.spec.ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ComponentName } from './ComponentName';

expect.extend(toHaveNoViolations);

describe('접근성 테스트', () => {
  describe('ARIA 속성', () => {
    it('버튼이 적절한 aria-label을 가진다', () => {
      // Developer가 구현
    });

    it('다이얼로그가 aria-modal 속성을 가진다', () => {
      // Developer가 구현
    });

    it('폼 필드가 aria-required를 가진다', () => {
      // Developer가 구현
    });
  });

  describe('키보드 네비게이션', () => {
    it('Tab 키로 모든 상호작용 요소에 접근할 수 있다', () => {
      // Developer가 구현
    });

    it('Shift+Tab으로 역순 이동이 가능하다', () => {
      // Developer가 구현
    });

    it('Enter 키로 버튼을 활성화할 수 있다', () => {
      // Developer가 구현
    });

    it('Escape 키로 모달을 닫을 수 있다', () => {
      // Developer가 구현
    });
  });

  describe('스크린 리더 지원', () => {
    it('모든 폼 요소가 레이블을 가진다', () => {
      // Developer가 구현
    });

    it('이미지가 alt 텍스트를 가진다', () => {
      // Developer가 구현
    });

    it('에러 메시지가 aria-live로 전달된다', () => {
      // Developer가 구현
    });
  });

  describe('자동 접근성 검사', () => {
    it('axe 접근성 검사를 통과한다', () => {
      // Developer가 구현
    });
  });
});
```

---

## 설계 가이드

### 코드베이스 분석 먼저

**테스트 설계 전 필수 확인**:
1. 기존 테스트 파일 검토
2. 중복 케이스 확인
3. 유사 패턴 참조

### 테스트 케이스 설명 작성 원칙

**좋은 설명 ✅**:
```typescript
it('유효한 날짜 입력 시 일정이 추가된다', () => {});
it('제목이 100자를 초과하면 에러 메시지를 표시한다', () => {});
it('ESC 키로 모달을 닫을 수 있다', () => {});
```

**나쁜 설명 ❌**:
```typescript
it('동작한다', () => {});
it('테스트', () => {});
it('성공 케이스', () => {});
it('폼 검증과 제출이 동작한다', () => {}); // 여러 동작을 함께 테스트
```

### 단일 책임 원칙

**하나의 테스트 = 하나의 동작**

**좋은 예시 ✅**:
```typescript
describe('이메일 유효성 검증', () => {
  it('유효한 이메일 입력 시 에러가 없다', () => {
    // Developer가 구현
  });

  it('잘못된 이메일 형식 입력 시 에러 메시지를 표시한다', () => {
    // Developer가 구현
  });

  it('빈 이메일 입력 시 필수 입력 메시지를 표시한다', () => {
    // Developer가 구현
  });
});
```

**나쁜 예시 ❌**:
```typescript
describe('이메일 유효성 검증', () => {
  it('이메일 검증이 올바르게 동작한다', () => {
    // 유효한 이메일 + 잘못된 이메일 + 빈 이메일을 모두 테스트
    // 어느 부분이 실패했는지 알기 어려움
  });
});
```

### 중복 제거

**기존 테스트 확인 후 설계**:

```typescript
// 파일: __tests__/components/EventForm.component.spec.ts
// 이미 존재하는 테스트:
describe('EventForm', () => {
  it('제목 입력이 가능하다', () => {}); // 이미 있음
});

// 새로운 테스트 설계 시:
describe('EventForm', () => {
  // ❌ 중복: it('제목을 입력할 수 있다', () => {});
  // ✅ 새로운 케이스: it('제목이 100자를 초과하면 에러를 표시한다', () => {});
});
```

### 주석 활용 (선택)

복잡한 시나리오의 경우 힌트를 주석으로 제공할 수 있습니다:

```typescript
it('반복 일정 중 특정 일정만 수정할 수 있다', () => {
  // Developer가 구현
  // 힌트:
  // 1. 반복 일정 생성 (매주 월요일)
  // 2. 특정 날짜 선택 (11월 15일)
  // 3. "이 일정만" 옵션 선택
  // 4. 제목 수정
  // 5. 해당 날짜만 변경 확인
});
```

### describe 블록 구조화

```typescript
describe('컴포넌트/기능명', () => {
  describe('정상 시나리오', () => {
    it('케이스 1', () => {});
    it('케이스 2', () => {});
  });

  describe('엣지 케이스', () => {
    it('케이스 3', () => {});
  });

  describe('에러 처리', () => {
    it('케이스 4', () => {});
  });

  describe('접근성', () => {
    it('케이스 5', () => {});
  });
});
```

---

## Template 사용 가이드

### 템플릿 선택 플로우

```
1. 무엇을 테스트하는가?
   ├─ 단일 함수/훅 → Unit Test Template
   ├─ 개별 컴포넌트 → Component Test Template
   ├─ 여러 컴포넌트 통합 → Integration Test Template
   ├─ 전체 사용자 플로우 → E2E Scenario Template
   └─ 접근성 → Accessibility Test Template

2. API 모킹이 필요한가?
   └─ 필요 → MSW Handler Template 참조

3. 복잡도는?
   ├─ 단순 → 기본 구조만 사용
   ├─ 보통 → describe 블록으로 그룹화
   └─ 복잡 → 주석 힌트 추가
```

### test-architect의 역할

**test-architect가 하는 것** ✅:
- 테스트 구조 설계 (describe, it 블록)
- 테스트 시나리오 식별
- MSW 핸들러 정의 (데이터 구조)
- 테스트 케이스 설명 작성
- 필요시 힌트 주석 제공

**test-architect가 하지 않는 것** ❌:
- 테스트 로직 구현 (Given-When-Then)
- render, screen, userEvent 등 실제 코드 작성
- assertion 작성
- 구체적인 쿼리 선택

**Developer가 하는 것**:
- 모든 테스트 로직 구현
- React Testing Library 쿼리 사용
- userEvent로 상호작용 구현
- assertion 작성
- MSW 핸들러 적용

### 예시 비교

**test-architect 설계**:
```typescript
describe('EventForm', () => {
  it('유효한 데이터 제출 시 onSubmit이 호출된다', () => {
    // Developer가 구현
  });
});
```

**Developer 구현**:
```typescript
describe('EventForm', () => {
  it('유효한 데이터 제출 시 onSubmit이 호출된다', async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render();
    
    await user.type(screen.getByLabelText('제목'), '팀 미팅');
    await user.type(screen.getByLabelText('날짜'), '2025-11-01');
    await user.click(screen.getByRole('button', { name: '저장' }));
    
    expect(handleSubmit).toHaveBeenCalledWith({
      title: '팀 미팅',
      date: '2025-11-01'
    });
  });
});
```

---

**버전**: 2.3.0
**최종 수정**: 2025-10-29
**변경사항**: 
- v2.3.0: 명세 파일 정보 추가
  - agent.mdc에 상세한 명세 파일 템플릿 포함
  - 명세 파일 형식: `us[번호]-[기능명]-test-spec.md`
  - Developer 전달 프로세스 참조
- v2.2.0: 중복 방지 및 단일 책임 가이드 추가
  - 코드베이스 분석 먼저 강조
  - 단일 책임 원칙 예시 추가
  - 중복 제거 가이드
  - 좋은/나쁜 예시 확장
- v2.1.0: 모든 템플릿에 파일 경로 예시 추가
  - `__tests__/[카테고리]/[기능명].[타입].spec.ts` 형식
  - 카테고리별 파일 위치 명시
- v2.0.0: Agent 이름 변경 (test-writer → test-architect)
  - 테스트 로직 제거, 구조와 시나리오만 설계
  - 역할 명확화: 테스트 아키텍처 설계 전문가

**Note**: 명세 파일의 상세 템플릿은 agent.mdc의 "명세 파일 내용" 섹션을 참조하세요.