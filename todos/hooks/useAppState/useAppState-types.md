# useAppState Hook Types TODO

## 완료된 작업 ✅

- [x] UseAppState.types.ts 타입 파일 생성
- [x] UseAppStateReturn 인터페이스 정의
- [x] NotificationInfo 타입 정의
- [x] useAppState 훅에 명시적 반환 타입 적용
- [x] 기존 훅 타입들을 ReturnType<> 유틸리티로 재사용
- [x] React 네임스페이스 의존성 문제 해결
- [x] 코드 품질 검사 통과

## 타입 구조 분석 📋

### UseAppStateReturn 인터페이스

```typescript
interface UseAppStateReturn {
  // 기존 훅들의 반환 타입 재사용
  eventFormState: ReturnType<
    typeof import('@/hooks/useEventForm').useEventForm
  >;
  calendarState: ReturnType<
    typeof import('@/hooks/useCalendarView').useCalendarView
  >;
  searchState: ReturnType<typeof import('@/hooks/useSearch').useSearch>;
  submissionState: EventSubmissionReturn;

  // 직접 관리되는 상태
  events: EventProps[];
  deleteEvent: (id: string) => void;

  // 알림 관련
  notifications: NotificationInfo[];
  notifiedEvents: string[];
  setNotifications: (
    value:
      | NotificationInfo[]
      | ((prev: NotificationInfo[]) => NotificationInfo[])
  ) => void;

  // 겹침 다이얼로그 상태
  isOverlapDialogOpen: boolean;
  setIsOverlapDialogOpen: (isOpen: boolean) => void;
  overlappingEvents: EventProps[];
}
```

### NotificationInfo 타입

```typescript
interface NotificationInfo {
  id: string;
  message: string;
}
```

## 설계 철학 🏗️

### 타입 재사용 전략

- **ReturnType<> 활용**: 기존 훅의 반환 타입을 그대로 재사용
- **중복 방지**: 이미 정의된 타입들을 다시 정의하지 않음
- **유지보수성**: 개별 훅 타입 변경 시 자동으로 반영

### 새로운 타입만 정의

- **NotificationInfo**: 알림 구조를 위한 새로운 인터페이스
- **Setter 함수들**: useState의 setter 타입을 명시적으로 정의
- **함수 시그니처**: deleteEvent 등 훅에서 새로 생성되는 함수들

## 해결된 문제 🔧

### 컴파일 타임 안전성

- useAppState 반환값의 구조 검증
- 소비자 코드에서 잘못된 프로퍼티 접근 방지
- 리팩토링 시 타입 시스템이 변경 사항 추적

### 개발 경험 개선

- IDE 자동완성 및 IntelliSense 지원 강화
- 함수 시그니처 및 반환값 문서화
- 컴파일 타임 에러로 런타임 오류 사전 방지

### React 타입 호환성

- React 네임스페이스 import 없이 useState setter 타입 정의
- 함수형 업데이트 패턴과 직접 값 설정 모두 지원

## 코딩 표준 준수 ✅

### CODING_STANDARDS.md 요구사항

- [x] 별도 타입 파일에 정의 (`src/types/hooks/`)
- [x] 80줄 제한 준수 (27줄)
- [x] 절대 경로 import 사용
- [x] 이중언어 주석 (영어 + 한국어)
- [x] 명확한 네이밍 규칙

### TypeScript 모범 사례

- [x] 명시적 반환 타입 정의
- [x] 인터페이스 기반 타입 정의
- [x] 기존 타입 재사용으로 일관성 확보
- [x] No `any` 타입 사용

## 아키텍처 분석 📊

### 훅 조합 패턴

- **6개 훅 조합**: 각각 특정 도메인 로직 담당
- **의존성 주입**: events, currentDate 등을 효율적으로 공유
- **상태 격리**: overlap dialog만 로컬 상태로 관리
- **관심사 분리**: form, operations, submission 로직 분리

### 확장성 고려사항

- 새로운 훅 추가 시 타입 시스템이 일관성 보장
- ReturnType<> 패턴으로 개별 훅 변경 시 자동 반영
- 인터페이스 확장을 통한 기능 추가 용이

## 다음 단계 📝

### 우선순위 1: 타입 활용도 확산

- [ ] App.tsx에서 useAppState 반환값 타입 활용
- [ ] 다른 복합 훅들도 동일한 패턴 적용
- [ ] 컴포넌트 props에서 구조분해할당 시 타입 안전성 확보

### 우선순위 2: 문서화 강화

- [ ] JSDoc 주석으로 각 필드 설명 추가
- [ ] 사용 예제 코드 작성
- [ ] 훅 조합 패턴 문서화

### 우선순위 3: 성능 모니터링

- [ ] 타입 체크 성능 영향도 측정
- [ ] 복잡한 타입 추론 최적화 검토
- [ ] 빌드 시간 영향도 분석

## 참고사항

- useAppState는 앱의 핵심 상태 오케스트레이션 훅
- 타입 안전성으로 대규모 리팩토링 시 안정성 확보
- ReturnType<> 패턴은 다른 복합 훅에서도 재사용 가능한 모범 사례
- 향후 상태 관리 라이브러리 도입 시에도 마이그레이션 경로 제공
