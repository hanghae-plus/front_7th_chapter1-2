# Test Writing Agent

## 역할
테스트 설계를 바탕으로 실제 테스트 코드를 작성하는 에이전트입니다.

## 주요 기능

### 1. 테스트 코드 생성
- 설계된 테스트 케이스를 실제 코드로 변환
- React Testing Library 모범 사례 적용
- Vitest 프레임워크 활용

### 2. 테스트 구조 생성
- Given-When-Then 패턴 적용
- 의미 있는 테스트 이름 작성
- 적절한 어설션 사용

### 3. 모킹 및 테스트 데이터 생성
- MSW를 활용한 API 모킹
- 테스트 데이터 팩토리 생성
- Mock 함수 및 스텁 생성

## 입력 형식

```json
{
  "testDesign": "테스트 설계 문서",
  "targetFile": "useRecurringEventOperations.spec.ts",
  "existingCode": "기존 코드베이스",
  "testFramework": "vitest",
  "testingLibrary": "@testing-library/react"
}
```

## 출력 형식

```typescript
import { act, renderHook } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { useRecurringEventOperations } from '../useRecurringEventOperations';
import { server } from '../../setupTests';

describe('useRecurringEventOperations', () => {
  describe('단일 일정 수정', () => {
    it('단일 수정 선택 시 해당 일정만 수정되어야 한다', async () => {
      // Given: 반복 일정이 존재하는 상태
      const mockRecurringEvent = {
        id: '1',
        title: '주간 회의',
        repeat: { type: 'weekly', interval: 1 },
        // ... 기타 필드
      };

      server.use(
        http.put('/api/events/:id/single', () => {
          return HttpResponse.json({ success: true });
        })
      );

      const { result } = renderHook(() => useRecurringEventOperations());

      // When: 단일 수정 실행
      await act(async () => {
        await result.current.editSingleEvent('1', { title: '수정된 회의' });
      });

      // Then: 해당 일정만 수정되고 반복 일정에서 제외되어야 함
      expect(result.current.events[0]).toMatchObject({
        id: '1',
        title: '수정된 회의',
        repeat: { type: 'none', interval: 0 }
      });
    });

    it('단일 수정 후 반복 일정 아이콘이 제거되어야 한다', async () => {
      // Given: 반복 일정이 존재하는 상태
      const { result } = renderHook(() => useRecurringEventOperations());

      // When: 단일 수정 실행
      await act(async () => {
        await result.current.editSingleEvent('1', { title: '수정된 회의' });
      });

      // Then: 반복 일정 아이콘이 표시되지 않아야 함
      const event = result.current.events.find(e => e.id === '1');
      expect(event?.repeat.type).toBe('none');
    });
  });

  describe('전체 반복 일정 수정', () => {
    it('전체 수정 선택 시 모든 관련 일정이 수정되어야 한다', async () => {
      // Given: 반복 일정이 존재하는 상태
      server.use(
        http.put('/api/events/:id/recurring', () => {
          return HttpResponse.json({ success: true });
        })
      );

      const { result } = renderHook(() => useRecurringEventOperations());

      // When: 전체 수정 실행
      await act(async () => {
        await result.current.editRecurringEvent('1', { title: '수정된 회의' });
      });

      // Then: 모든 관련 일정이 수정되어야 함
      const recurringEvents = result.current.events.filter(e => e.repeat.type !== 'none');
      recurringEvents.forEach(event => {
        expect(event.title).toBe('수정된 회의');
      });
    });

    it('전체 수정 후 반복 일정 아이콘이 유지되어야 한다', async () => {
      // Given: 반복 일정이 존재하는 상태
      const { result } = renderHook(() => useRecurringEventOperations());

      // When: 전체 수정 실행
      await act(async () => {
        await result.current.editRecurringEvent('1', { title: '수정된 회의' });
      });

      // Then: 반복 일정 아이콘이 유지되어야 함
      const event = result.current.events.find(e => e.id === '1');
      expect(event?.repeat.type).toBe('weekly');
    });
  });

  describe('에러 처리', () => {
    it('존재하지 않는 일정 수정 시 에러가 발생해야 한다', async () => {
      // Given: 존재하지 않는 일정 ID
      server.use(
        http.put('/api/events/:id/single', () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      const { result } = renderHook(() => useRecurringEventOperations());

      // When: 존재하지 않는 일정 수정 시도
      // Then: 에러가 발생해야 함
      await expect(
        act(async () => {
          await result.current.editSingleEvent('999', { title: '수정된 회의' });
        })
      ).rejects.toThrow('Event not found');
    });

    it('네트워크 오류 시 적절한 에러 처리가 되어야 한다', async () => {
      // Given: 네트워크 오류 상황
      server.use(
        http.put('/api/events/:id/single', () => {
          return new HttpResponse(null, { status: 500 });
        })
      );

      const { result } = renderHook(() => useRecurringEventOperations());

      // When: 네트워크 오류 발생
      // Then: 적절한 에러 메시지가 표시되어야 함
      await expect(
        act(async () => {
          await result.current.editSingleEvent('1', { title: '수정된 회의' });
        })
      ).rejects.toThrow('Network error');
    });
  });
});
```

## 검증 기준

1. **RED 상태**: 모든 테스트가 실패하는 상태로 작성되었는가?
2. **독립성**: 각 테스트가 독립적으로 실행 가능한가?
3. **명확성**: 테스트 의도가 명확하게 드러나는가?
4. **완전성**: 모든 시나리오가 테스트에 포함되었는가?

## 사용 예시

```bash
# 테스트 코드 생성
node test-writing-agent.js --design="test-design.md" --target="useRecurringEventOperations.spec.ts"

# 기존 테스트 업데이트
node test-writing-agent.js --update --file="existing-test.spec.ts"
```
