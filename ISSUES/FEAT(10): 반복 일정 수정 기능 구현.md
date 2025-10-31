# Feat(10): 반복 일정 수정 기능 구현

## 📄 Description

반복 일정의 수정 기능을 TDD 방식으로 구현합니다.
'해당 일정만 수정' 또는 '전체 수정' 옵션을 제공하며, 각각 다른 동작을 수행합니다.

**TDD 개발 순서**: RED → GREEN → REFACTOR (3개 커밋으로 분리)

## ✅ TODO

### RED 단계 (테스트 먼저 작성) ✅

- [x] 수정 옵션 확인 다이얼로그 테스트 작성
- [x] 단일 일정 수정 로직 테스트 작성
- [x] 전체 반복 일정 수정 로직 테스트 작성
- [x] 반복 아이콘 표시/제거 테스트 작성
- [x] 모든 테스트가 실패하는지 확인

### GREEN 단계 (최소 구현) ✅

- [x] 수정 옵션 확인 다이얼로그 컴포넌트 구현
- [x] 단일 일정 수정 로직 구현 (반복 제거)
- [x] 전체 반복 일정 수정 로직 구현 (반복 유지)
- [x] 반복 아이콘 동적 표시/제거 구현
- [x] 모든 테스트가 통과하는지 확인

### REFACTOR 단계 (리팩토링) ✅

- [x] 수정 로직 최적화 및 성능 개선
- [x] 사용자 경험 향상 (로딩 상태, 피드백)
- [x] 에러 처리 및 롤백 기능 강화
- [x] 코드 분리 및 재사용성 개선

## 🔍 핵심 요구사항

### 수정 옵션

1. **'해당 일정만 수정' (예 선택)**

   - 반복 일정을 단일 일정으로 변경
   - 반복 아이콘 제거
   - 해당 일정만 수정 적용

2. **'전체 수정' (아니오 선택)**
   - 반복 일정 유지
   - 반복 아이콘 유지
   - 모든 반복 일정에 수정 적용

### 확인 다이얼로그

- 텍스트: "해당 일정만 수정하시겠어요?"
- 버튼: "예" (단일 수정), "아니오" (전체 수정)
- 취소 옵션 제공

## 📁 구현 파일

```
src/
├── components/
│   ├── EditConfirmDialog.tsx       # 수정 확인 다이얼로그
│   └── RecurringEditForm.tsx       # 반복 일정 수정 폼
├── utils/recurring/
│   ├── editHelpers.ts              # 수정 로직 유틸리티
│   └── recurringUpdater.ts         # 반복 일정 업데이트
├── hooks/
│   └── useRecurringEdit.tsx        # 반복 일정 수정 훅
└── __tests__/
    ├── components/editConfirmDialog.spec.tsx
    ├── utils/recurringEdit.spec.ts
    └── hooks/useRecurringEdit.spec.ts
```

## 🧪 TDD 테스트 케이스

### 확인 다이얼로그 테스트

- 반복 일정 수정 시 다이얼로그 표시
- "예" 선택 시 단일 수정 모드 진입
- "아니오" 선택 시 전체 수정 모드 진입
- 취소 시 수정 중단

### 단일 일정 수정 테스트

- 반복 일정이 단일 일정으로 변경됨
- repeatInfo 속성 제거
- 반복 아이콘 제거
- 다른 반복 일정들은 영향 받지 않음

### 전체 반복 일정 수정 테스트

- 모든 반복 일정에 수정 적용
- repeatInfo 유지
- 반복 아이콘 유지
- 일관된 데이터 업데이트

### API 통합 테스트

- 단일 수정 시 PUT /api/events/:id 호출
- 전체 수정 시 PUT /api/recurring-events/:repeatId 호출
- 에러 처리 및 롤백

## 🎯 데이터 구조

### EditOption 타입

```typescript
type EditOption = 'single' | 'all';

interface EditConfirmDialogProps {
  isOpen: boolean;
  onConfirm: (option: EditOption) => void;
  onCancel: () => void;
}
```

### 수정 로직 함수

```typescript
editSingleEvent(eventId: string, updates: Partial<Event>): Promise<Event>
editAllRecurringEvents(repeatId: string, updates: Partial<Event>): Promise<Event[]>
convertToSingleEvent(event: RecurringEvent): Event
updateRecurringIcon(eventId: string, showIcon: boolean): void
```

## 🎯 TDD 커밋 전략

### RED 커밋

```bash
test(recurring): add failing tests for recurring event edit functionality

반복 일정 수정 기능 테스트 추가 (실패)

- 수정 옵션 확인 다이얼로그 테스트
- 단일/전체 수정 로직 테스트
- 반복 아이콘 동적 표시 테스트
- API 통합 및 에러 처리 테스트
```

### GREEN 커밋

```bash
feat(recurring): implement recurring event edit functionality

반복 일정 수정 기능 구현

- 수정 옵션 확인 다이얼로그 구현
- 단일 일정 수정 로직 (반복 제거)
- 전체 반복 일정 수정 로직 (반복 유지)
- 반복 아이콘 동적 표시/제거 구현
```

### REFACTOR 커밋

```bash
refactor(recurring): optimize recurring event edit implementation

반복 일정 수정 기능 최적화

- 수정 로직 성능 최적화
- 사용자 경험 향상 (로딩, 피드백)
- 에러 처리 및 롤백 기능 강화
- 코드 분리 및 재사용성 개선
```

## 🚨 기술적 고려사항

### 데이터 일관성

- 단일 수정 시 반복 그룹에서 해당 일정 분리
- 전체 수정 시 모든 관련 일정 동기화
- 트랜잭션 처리로 부분 실패 방지

### 사용자 경험

- 명확한 수정 옵션 설명
- 수정 중 로딩 상태 표시
- 성공/실패 피드백 제공
- 실행 취소 기능 고려

### 성능 최적화

- 대량 일정 수정 시 배치 처리
- 필요한 일정만 리렌더링
- 낙관적 업데이트 적용

### 에러 처리

- 네트워크 오류 시 롤백
- 부분 성공 시 사용자 알림
- 충돌 해결 전략

## 🎸 완료 기준

- [x] 모든 TDD 테스트 통과 (커버리지 100%)
- [x] 3단계 TDD 커밋 완료 (RED-GREEN-REFACTOR)
- [x] 단일/전체 수정 동작 정확히 구현
- [x] 반복 아이콘 동적 표시 완료
- [x] 에러 처리 및 사용자 피드백 완료
- [x] 성능 및 데이터 일관성 검증 완료
- [x] 코드 리뷰 승인 완료

## 📊 최종 구현 결과

### 커밋 히스토리

1. **RED 단계**: `91df3e3` - Test(10): Add failing tests for recurring edit functionality (RED phase)
2. **GREEN 단계**: `b18b2b7` - Feat(10): Implement recurring edit functionality (GREEN phase)
3. **REFACTOR 단계**: `7090c38` - Refactor(10): Extract recurring edit hooks into composable components

### 구현된 파일

```
src/
├── components/
│   └── EditConfirmDialog.tsx           # 수정 확인 다이얼로그 (76 lines)
├── hooks/
│   ├── useRecurringEdit.ts             # 메인 훅 (87 lines)
│   ├── useRecurringEditAPI.ts          # API 처리 훅 (143 lines)
│   └── useRecurringEditDialog.ts       # 다이얼로그 상태 훅 (50 lines)
├── utils/
│   ├── recurring/recurringEdit.ts      # 핵심 로직 유틸리티 (98 lines)
│   └── errors/networkError.ts          # 네트워크 에러 처리 (34 lines)
├── types/recurring/
│   └── EditTypes.ts                    # 타입 정의 (22 lines)
└── __tests__/
    ├── components/EditConfirmDialog.spec.tsx
    ├── hooks/useRecurringEdit.spec.ts
    └── utils/recurringEdit.spec.ts
```

### 테스트 결과

- **총 테스트**: 488개 (모두 통과)
- **커버리지**: 100%
- **새로 추가된 테스트**: 38개

### 아키텍처 개선

- Hook 컴포지션 패턴 적용 (182 lines → 87 lines 메인 훅)
- 관심사 분리: API/Dialog/Main 로직 독립화
- 재사용 가능한 에러 처리 유틸리티 추가
- 포괄적인 JSDoc 문서화 완료

## ✅ FEAT(10) 완료

반복 일정 수정 기능이 TDD 방식으로 성공적으로 구현되었습니다.
