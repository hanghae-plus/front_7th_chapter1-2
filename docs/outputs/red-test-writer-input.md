# RED Test Writer Input - Cycle 5

> **메타데이터**
> - Cycle: 5/10
> - Feature: 반복 설정 UI 컴포넌트
> - Agent: tdd-orchestrator → red-test-writer
> - Timestamp: 2025-10-31T05:20:00Z

## 작업 지시

반복 일정 생성을 위한 **UI 컴포넌트**에 대한 **의도적으로 실패하는 통합 테스트**를 작성하세요.

### 구현 대상 UI

App.tsx 또는 useEventForm.ts에 다음 UI 요소 추가:

1. **반복 유형 Select**
   - 옵션: "반복 안함", "매일", "매주", "매월", "매년"
   - label: "반복 유형"

2. **반복 간격 TextField** (반복 유형이 'none'이 아닐 때만 표시)
   - type: number
   - min: 1
   - label: "반복 간격"

3. **반복 종료일 TextField** (반복 유형이 'none'이 아닐 때만 표시)
   - type: date
   - max: "2025-12-31"
   - label: "반복 종료일"

### 테스트 시나리오 (통합 테스트)

파일: `src/__tests__/medium.integration.spec.tsx`

1. **반복 유형 Select 존재 확인**
   - 일정 추가 모달 열기
   - "반복 유형" label이 있는 Select 확인
   - 5개 옵션 확인 (none, daily, weekly, monthly, yearly)

2. **'none' 선택 시 추가 필드 숨김**
   - 반복 유형을 "반복 안함" 선택
   - "반복 간격", "반복 종료일" 필드가 DOM에 없음 확인

3. **'daily' 선택 시 추가 필드 표시**
   - 반복 유형을 "매일" 선택
   - "반복 간격" TextField 표시 확인
   - "반복 종료일" TextField 표시 확인

4. **반복 간격 최소값 1 강제**
   - 반복 유형을 "매일" 선택
   - 간격 필드에 0 입력 시도
   - HTML min 속성으로 인해 1 이하 입력 불가 확인

5. **반복 종료일 최대값 2025-12-31**
   - 반복 유형을 "매일" 선택
   - 종료일 필드의 max 속성이 "2025-12-31"인지 확인

6. **매주 반복 선택 시 UI 표시**
   - 반복 유형을 "매주" 선택
   - 간격 및 종료일 필드 표시 확인

7. **매월 반복 선택 시 UI 표시**
   - 반복 유형을 "매월" 선택
   - 간격 및 종료일 필드 표시 확인

8. **매년 반복 선택 시 UI 표시**
   - 반복 유형을 "매년" 선택
   - 간격 및 종료일 필드 표시 확인

### 파일 위치

- 테스트 파일: `src/__tests__/medium.integration.spec.tsx`
- 구현 파일: `src/App.tsx` 또는 `src/hooks/useEventForm.ts`

### 요구사항

- ✅ 테스트는 Assertion 기반 실패여야 함 (UI 미구현으로 인한)
- ✅ Baseline(152) 대비 실패 수 최소 +1 증가
- ✅ React Testing Library 사용 (screen, user, within)
- ✅ 새로운 describe 블록 "반복 일정 UI" 추가
- ✅ Material-UI Select 접근 방법 참고 (CLAUDE.md)

### 베이스라인

- 현재 통과 테스트: 152개
- 현재 실패 테스트: 0개

### 중요 참고사항

**CLAUDE.md의 Select 컴포넌트 접근 예시:**
```typescript
await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
await user.click(screen.getByRole('option', { name: `${category}-option` }));
```

반복 유형 Select도 동일한 방식으로 접근하세요.
