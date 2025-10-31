사용자 스토리: 인스턴스 선택이 가능한 반복 이벤트 수정

📖 스토리
사용자로서 캘린더 사용자
원하는 것은 반복 이벤트를 편집할 때 단일 인스턴스만 수정할지 전체 반복 시리즈를 수정할지 선택하는 것
목적은 반복 일정을 유연하게 관리하고 다른 인스턴스에 영향을 주지 않고 예외를 처리하기 위함

📝 설명
반복 이벤트를 편집할 때, 사용자는 선택한 인스턴스만 수정할지 또는 전체 반복 시리즈를 수정할지 선택할 수 있는 확인 다이얼로그가 표시되어야 합니다. 이 기능은 시리즈의 나머지 부분에 영향을 주지 않고 단일 발생을 수정해야 하는 사용자에게 유연성을 제공합니다.

배경 및 컨텍스트
반복 이벤트는 repeat.type !== 'none'인 이벤트입니다
현재 사용자가 반복 이벤트를 편집할 때, 단일 인스턴스 수정과 전체 시리즈 수정 간의 구분이 없습니다
사용자는 예외를 처리할 방법이 필요합니다 (예: 다른 주간 회의에 영향을 주지 않고 하나의 회의 일정 변경)
단일 인스턴스가 수정되면 반복 시리즈에서 분리되고 더 이상 반복 아이콘이 표시되지 않아야 합니다
사용자 여정
사용자가 반복 이벤트에서 "편집"을 클릭합니다 (예: 2025-11-05의 "주간 팀 회의")
시스템이 반복 이벤트임을 감지하고 확인 다이얼로그를 표시합니다: "이 인스턴스만 수정하시겠습니까?"
사용자 선택:
"예": 이 인스턴스만 수정 → 새 ID로 새로운 단일 이벤트 생성, 반복 아이콘 제거
"아니오": 전체 시리즈 수정 → 시리즈의 모든 인스턴스 수정, 반복 아이콘 유지
시스템이 선택된 작업을 수행하고 그에 따라 캘린더 뷰를 업데이트합니다
관련 기능
반복 이벤트 생성: 수정할 기존 반복 이벤트 필요
이벤트 수정 폼: 기존 useEventForm.editEvent 훅 사용
반복 아이콘 표시: 아이콘 가시성을 위해 기존 RecurringBadge 컴포넌트 사용
✅ 승인 기준
시나리오 1: 단일 인스턴스 수정 (예)
gherkin
Given 매주 월요일로 예정된 반복 이벤트 "주간 회의"가 있고
And 2025-11-05 날짜의 인스턴스에서 "편집"을 클릭하면
When "이 인스턴스만 수정하시겠습니까?"라는 메시지와 함께 확인 다이얼로그가 나타나고
And "예"를 클릭하면
Then 새 UUID로 새로운 단일 이벤트가 생성되고
And 새 이벤트는 repeat.type = 'none'을 가지며
And 원본 반복 시리즈는 변경되지 않고
And 수정된 이벤트는 더 이상 반복 아이콘을 표시하지 않으며
And "이벤트가 수정되었습니다."라는 성공 메시지가 표시된다
시나리오 2: 전체 시리즈 수정 (아니오)
gherkin
Given 매주 월요일로 예정된 반복 이벤트 "주간 회의"가 있고
And 시리즈의 임의의 인스턴스에서 "편집"을 클릭하면
When 확인 다이얼로그가 나타나고
And "아니오"를 클릭하면
Then 시리즈의 모든 이벤트 (같은 repeat.id를 가진)가 수정되고
And 모든 이벤트가 반복 정보를 유지하며 (repeat.type !== 'none')
And 모든 이벤트가 계속 반복 아이콘을 표시하고
And "모든 반복 이벤트가 수정되었습니다."라는 성공 메시지가 표시된다
시나리오 3: 단일 이벤트 수정 (다이얼로그 없음)
gherkin
Given 단일 이벤트 (repeat.type === 'none')가 있고
And "편집"을 클릭하면
When 편집 폼이 열릴 때
Then 확인 다이얼로그가 표시되지 않고
And 이전처럼 즉시 수정이 진행된다
시나리오 4: 반복 이벤트에만 다이얼로그 표시
gherkin
Given 반복 이벤트 (repeat.type !== 'none')가 있고
When "편집"을 클릭하면
Then 확인 다이얼로그가 표시되고
And 다이얼로그에 두 가지 옵션이 표시된다: "예", "아니오"
And 다이얼로그 제목은 "반복 이벤트 수정"이고
And 다이얼로그 메시지는 "이 인스턴스만 수정하시겠습니까?"이다
시나리오 5: 단일 인스턴스 수정 후 반복 아이콘 제거
gherkin
Given 반복 아이콘이 표시된 반복 이벤트가 있고
And 단일 인스턴스만 수정하고 ("예" 선택)
When 수정이 완료되면
Then 수정된 이벤트는 repeat.type = 'none'을 가지며
And isRecurringEvent(updatedEvent)가 false를 반환하고
And 해당 이벤트에 대해 반복 아이콘이 표시되지 않으며
And 시리즈의 다른 인스턴스는 여전히 반복 아이콘을 표시한다
시나리오 6: 시리즈 수정 후 반복 아이콘 유지
gherkin
Given 여러 인스턴스가 있는 반복 이벤트 시리즈가 있고
And 모든 인스턴스가 반복 아이콘을 표시하고 있을 때
When 전체 시리즈를 수정하면 ("아니오" 선택)
Then 모든 인스턴스가 repeat.type !== 'none'을 유지하고
And 모든 인스턴스가 계속 반복 아이콘을 표시한다
시나리오 7: 네트워크 오류 처리
gherkin
Given 반복 이벤트를 수정 중이고
When API 호출 중 네트워크 오류가 발생하면
Then 오류 메시지가 표시되고
And 수정이 저장되지 않으며
And 작업을 다시 시도할 수 있다
시나리오 8: 유효성 검사 오류
gherkin
Given 반복 이벤트를 수정 중이고
And 잘못된 데이터를 입력하면 (예: 빈 제목)
When 수정을 제출하면
Then 유효성 검사 오류가 표시되고
And 수정이 진행되지 않으며
And 오류를 수정하고 다시 시도할 수 있다
📋 작업
🔴 1단계: 테스트 설정
목표: 반복 이벤트 수정 시나리오를 위한 테스트 환경 및 모의 데이터 설정

 MSW 핸들러 설정
 PUT /api/recurring-events/:repeatId 엔드포인트 모의 (시리즈 수정용)
 POST /api/events 엔드포인트 모의 (단일 인스턴스 수정용 - 새 이벤트 생성)
 성공 시나리오 (200, 201 응답)
 오류 시나리오 (400, 404, 500)
 네트워크 오류 시뮬레이션
 테스트 유틸리티 함수
 repeat.id가 있는 createMockRecurringEvent() 헬퍼
 createMockEventSeries() 헬퍼 (같은 repeat.id를 가진 여러 이벤트)
 setupRecurringEventUpdateTests() 헬퍼
 모의 데이터
 repeat.id가 있는 주간 패턴 반복 이벤트
 반복 이벤트 시리즈 (같은 repeat.id를 가진 여러 인스턴스)
 단일 이벤트 (비반복, repeat.type === 'none')
 테스트 환경 구성
 테스트 설정에서 MSW 핸들러 등록
 React Testing Library 구성
예상 노력: 중간

🔴 2단계: Red - 테스트 우선
목표: TDD 방법론에 따라 실패하는 테스트 작성

2.1 단위 테스트
 다이얼로그 컴포넌트 테스트
 RecurringEventUpdateDialog가 이벤트가 반복일 때 렌더링됨
 이벤트가 반복이 아닐 때 (repeat.type === 'none') 다이얼로그가 렌더링되지 않음
 다이얼로그가 올바른 제목을 표시함: "반복 이벤트 수정"
 다이얼로그가 올바른 메시지를 표시함: "이 인스턴스만 수정하시겠습니까?"
 다이얼로그에 두 개의 버튼이 있음: "예", "아니오"
 "예"를 클릭하면 다이얼로그가 닫힘
 "아니오"를 클릭하면 다이얼로그가 닫힘
 수정 로직 테스트
 updateSingleInstance()가 새 UUID로 새 이벤트를 생성함
 updateSingleInstance()가 repeat.type을 'none'으로 설정함
 updateSingleInstance()가 updateData의 모든 필드를 복사함
 updateSingleInstance()가 원본 이벤트를 변경하지 않음
 updateRecurringSeries()가 같은 repeat.id를 가진 모든 이벤트를 찾음
 updateRecurringSeries()가 공통 필드를 수정함 (title, description, location, category)
 updateRecurringSeries()가 반복 정보를 보존함
 updateRecurringSeries()가 시리즈의 모든 인스턴스를 수정함
 아이콘 표시 로직 테스트
 isRecurringEvent()가 반복 이벤트에 대해 true를 반환함
 isRecurringEvent()가 단일 인스턴스 수정 후 false를 반환함
 RecurringBadge가 이벤트가 반복일 때 렌더링됨
 RecurringBadge가 이벤트가 반복이 아닐 때 렌더링되지 않음
2.2 통합 테스트
 이벤트 편집 플로우 테스트
 반복 이벤트에서 "편집" 클릭 시 다이얼로그가 열림
 "예" 선택 시 단일 인스턴스를 수정하고 아이콘을 제거함
 "아니오" 선택 시 전체 시리즈를 수정하고 아이콘을 유지함
 단일 이벤트 (비반복) 수정 시 다이얼로그가 표시되지 않음
 사용자 선택 후 다이얼로그가 닫힘
 API 통합 테스트
 단일 인스턴스 수정 시 POST /api/events 호출 (새 이벤트 생성)
 시리즈 수정 시 PUT /api/recurring-events/:repeatId 호출
 실패한 API 호출에 대한 오류 처리
 API 호출 중 로딩 상태
 성공 메시지가 올바르게 표시됨
2.3 사용자 상호작용 테스트
 사용자가 다이얼로그에서 "예" 버튼을 클릭할 수 있음
 사용자가 다이얼로그에서 "아니오" 버튼을 클릭할 수 있음
 사용자가 다이얼로그 외부를 클릭하여 닫을 수 있음 (해당되는 경우)
 다이얼로그에서 키보드 탐색이 작동함 (Tab, Enter, Escape)
예상 노력: 큼

🟢 3단계: Green - 구현
목표: 모든 테스트를 통과하는 최소한의 코드 구현

3.1 다이얼로그 컴포넌트 구현
 RecurringEventUpdateDialog 컴포넌트 생성
 MUI Dialog 컴포넌트 사용
 제목 표시: "반복 이벤트 수정"
 메시지 표시: "이 인스턴스만 수정하시겠습니까?"
 "예" 버튼 추가 (주요 작업, 단일 인스턴스 수정)
 "아니오" 버튼 추가 (보조 작업, 전체 시리즈 수정)
 버튼 클릭 이벤트 처리
 선택 후 다이얼로그 닫기
 다이얼로그 통합
 반복 이벤트 편집 시 다이얼로그 표시 (repeat.type !== 'none')
 단일 이벤트 편집 시 다이얼로그 숨김 (repeat.type === 'none')
 다이얼로그에 콜백 함수 전달 (onYes, onNo)
 다이얼로그 상태 관리 (열림/닫힘)
3.2 수정 로직 구현
 updateSingleInstance() 함수
 수정된 이벤트에 대한 새 UUID 생성 (crypto.randomUUID())
 repeat.type = 'none' 설정 (반복 정보 제거)
 updateData의 모든 필드를 새 이벤트로 복사
 POST /api/events 호출하여 새 이벤트 생성
 원본 이벤트는 변경하지 않음 (시리즈의 다른 인스턴스 보존)
 수정된 이벤트 반환
 성공 메시지 표시: "이벤트가 수정되었습니다."
 updateRecurringSeries() 함수
 originalEvent에서 repeat.id 추출
 같은 repeat.id를 가진 모든 이벤트 찾기
 공통 필드 수정: title, description, location, category
 반복 정보 보존 (repeat 객체 변경 없음)
 PUT /api/recurring-events/:repeatId 호출
 시리즈의 모든 이벤트 수정
 수정된 이벤트 배열 반환
 성공 메시지 표시: "모든 반복 이벤트가 수정되었습니다."
 useEventForm과 통합
 editEvent()를 수정하여 반복 이벤트 확인
 editingEvent.repeat.type !== 'none' 확인
 반복 이벤트에 대한 다이얼로그 표시
 사용자 선택에 따라 적절한 수정 함수로 라우팅
 폼 훅에서 다이얼로그 상태 처리
3.3 아이콘 표시 구현
 isRecurringEvent() 헬퍼 업데이트
 event.repeat.type !== 'none' 확인
 부울 결과 반환
 RecurringBadge 컴포넌트 업데이트
 isRecurringEvent()를 사용하여 가시성 결정
 이벤트가 반복일 때만 아이콘 렌더링
 이벤트가 반복이 아닐 때 아이콘 숨김 (repeat.type === 'none')
3.4 API 통합
 단일 인스턴스 수정 API
 POST /api/events 엔드포인트 사용
 요청 페이로드 형식 (repeat.type = 'none'인 새 이벤트)
 응답 처리
 오류 처리
 시리즈 수정 API
 PUT /api/recurring-events/:repeatId 엔드포인트 (기존 확인)
 이벤트에서 repeat.id 추출
 요청 페이로드 형식 (공통 필드만)
 응답 처리 (수정된 이벤트 배열)
 오류 처리
 API 클라이언트 함수
 단일 인스턴스용 createEvent(eventData) (POST /api/events)
 시리즈용 updateRecurringSeries(repeatId, updateData) (PUT /api/recurring-events/:repeatId)
 오류 처리 및 재시도 로직
 로딩 상태 관리
예상 노력: 큼
의존성: 2단계 완료 필요

🔵 4단계: 리팩토링
목표: 기능을 유지하면서 코드 품질 개선

4.1 코드 구조화
 다이얼로그 로직을 커스텀 훅 useRecurringEventUpdateDialog()로 추출
 다이얼로그 상태 관리
 핸들러 함수
 수정 함수를 유틸리티 모듈 recurringEventUtils.ts로 분리
 updateSingleInstance() 함수
 updateRecurringSeries() 함수
 repeat.id 추출을 위한 헬퍼 함수
 API 호출을 서비스 모듈 eventApiService.ts로 추출
 단일 인스턴스용 createEvent()
 시리즈용 updateRecurringSeries()
 코드 중복 제거
 함수 이름 및 구조 개선
4.2 성능 최적화
 필요한 경우 React.memo()로 다이얼로그 컴포넌트 메모이제이션
 핸들러에 useCallback()으로 리렌더링 최적화
 비용이 많이 드는 계산에 useMemo() 사용 (repeat.id 추출, 이벤트 필터링)
 필요한 경우 API 호출 디바운스
4.3 타입 안전성
 수정 작업에 대한 TypeScript 인터페이스 정의
 SingleInstanceUpdate
 SeriesUpdate
 UpdateDialogProps
 RecurringEventUpdateResponse
 이벤트 유효성 검사를 위한 타입 가드 추가
 isRecurringEvent() 타입 가드
 hasRepeatId() 타입 가드
 타입 추론 개선
예상 노력: 중간
의존성: 3단계 완료 필요

📝 5단계: 문서화
목표: 기능을 문서화하고 최종 구현 검증

 모든 새 함수 및 컴포넌트에 JSDoc 주석 추가
 RecurringEventUpdateDialog 컴포넌트
 updateSingleInstance() 함수
 updateRecurringSeries() 함수
 useRecurringEventUpdateDialog() 훅
 기능 설명으로 README 업데이트
 API 엔드포인트 문서화
 POST /api/events (단일 인스턴스 수정)
 PUT /api/recurring-events/:repeatId (시리즈 수정)
 코드 리뷰 준비
 최종 테스트 실행 및 커버리지 확인 (목표: 80%+)
예상 노력: 작음

📊 스토리 포인트
복잡도: 8 포인트 (큼)

추정 근거:

구현 복잡도: 높음
한글 텍스트가 있는 새 다이얼로그 컴포넌트
두 가지 다른 수정 경로 (단일 인스턴스 vs. 시리즈)
두 경로 모두에 대한 API 통합 (POST 및 PUT)
아이콘 표시 로직 업데이트
새 이벤트를 위한 UUID 생성
repeat.id 추출 및 시리즈 관리
테스트 복잡도: 높음
여러 시나리오 (단일 인스턴스, 시리즈)
다이얼로그 상호작용 테스트
API 통합 테스트 (두 개의 다른 엔드포인트)
아이콘 가시성 테스트
엣지 케이스 (이미 수정된 인스턴스, 하나의 인스턴스만 있는 시리즈)
UI 복잡도: 중간
한글 로컬라이제이션이 있는 다이얼로그 컴포넌트
버튼 상호작용
아이콘 가시성 로직
다이얼로그 상태 관리
기술적 불확실성: 중간
기존 API 엔드포인트 호환성 (PUT /api/recurring-events/:repeatId)
이벤트 시리즈 관리 (repeat.id 처리)
다이얼로그 상태 관리
UUID 생성 및 이벤트 생성 플로우
🛠️ 기술 노트
기술 스택
프론트엔드: React + TypeScript
백엔드: Express.js REST API (이미 구현됨)
데이터베이스: JSON 파일 기반 (서버 측)
UI 라이브러리: MUI (Material-UI) - 이미 구현됨
상태 관리: React hooks (useState, useCallback, useMemo)
테스팅: Vitest + Testing Library
모킹: MSW (Express API 모의)
구현 고려사항
API 엔드포인트
typescript
// 단일 인스턴스 수정 (새 이벤트 생성)
POST /api/events
Request: {
  title: string,
  date: string,
  startTime: string,
  endTime: string,
  description: string,
  location: string,
  category: string,
  repeat: { type: 'none' },  // 단일 인스턴스 수정 시 항상 'none'
  notificationTime: number
}
Response: {
  id: string,  // 생성된 새 UUID
  ...eventData
}

// 시리즈 수정 (시리즈의 모든 이벤트 수정)
PUT /api/recurring-events/:repeatId
Request: {
  title?: string,
  description?: string,
  location?: string,
  category?: string,
  // 참고: repeat 객체는 수정되지 않음 (보존됨)
  // 참고: date, startTime, endTime은 수정되지 않음 (반복 규칙에 의해 결정됨)
}
Response: {
  events: Event[]  // 시리즈의 모든 수정된 이벤트 배열
}
데이터 모델
typescript
interface Event {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number;
}

interface RepeatInfo {
  id?: string;  // 시리즈 식별용 (시리즈 수정에 필수)
  type: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number;
  count?: number;
  endDate?: string;
  startDate?: string;
}

// 단일 인스턴스 수정 후
interface UpdatedSingleEvent extends Event {
  id: string;  // 새 UUID
  repeat: { type: 'none' };  // 반복 제거
}

// 시리즈 수정 후
interface UpdatedSeriesEvent extends Event {
  id: string;  // 같은 ID (보존됨)
  repeat: RepeatInfo;  // 반복 정보 보존 (같은 repeat.id)
}
다이얼로그 상태 관리
typescript
interface UpdateDialogState {
  isOpen: boolean;
  event: Event | null;
  onConfirm: (choice: 'single' | 'series') => void;
}

// 컴포넌트에서의 사용
const [dialogState, setDialogState] = useState<UpdateDialogState>({
  isOpen: false,
  event: null,
  onConfirm: (choice) => {
    if (choice === 'single') {
      updateSingleInstance(dialogState.event, updateData);
    } else {
      updateRecurringSeries(dialogState.event, updateData);
    }
    setDialogState({ ...dialogState, isOpen: false });
  }
});
컴포넌트 구조
App.tsx
├─ RecurringEventUpdateDialog (신규)
│   ├─ Dialog
│   ├─ DialogTitle ("반복 이벤트 수정")
│   ├─ DialogContent ("이 인스턴스만 수정하시겠습니까?")
│   ├─ DialogActions
│   └─ Buttons (예, 아니오)
└─ EventList
    └─ RecurringBadge (업데이트됨)
        └─ 아이콘 표시 로직 (repeat.type 기반)
오류 처리
유효성 검사 오류: 폼에 인라인 오류 표시
API 오류: 오류 메시지와 함께 토스트 알림 표시
오류 메시지: "이벤트 저장에 실패했습니다"
네트워크 오류: 재시도 버튼 표시
동시 수정: 마지막 쓰기 우선 (서버 우선순위)
접근성
 다이얼로그에 적절한 ARIA 레이블 있음
 한글 텍스트 지원 (반복 이벤트 수정)
 키보드 탐색 (Tab, Enter, Escape)
 포커스 관리 (다이얼로그의 포커스 트랩)
 스크린 리더 알림
로컬라이제이션 참고사항
다이얼로그는 한글 텍스트를 사용합니다:

제목: "반복 이벤트 수정"
메시지: "이 인스턴스만 수정하시겠습니까?"
버튼: "예", "아니오"
성공 메시지: "이벤트가 수정되었습니다.", "모든 반복 이벤트가 수정되었습니다."
✔️ 완료 조건
 모든 승인 기준이 충족됨
 단위 테스트 커버리지 ≥ 80%
 통합 테스트 통과
 코드 리뷰 승인
 문서화 완료 (JSDoc, README)
 수동 테스트 완료
 다이얼로그 접근성 검증됨
 아이콘 표시/제거가 올바르게 작동함
 두 수정 경로 (단일 인스턴스 및 시리즈) 모두 올바르게 작동함
 오류 처리 테스트 완료 및 작동 중
 한글 텍스트가 올바르게 표시됨
 UUID 생성이 올바르게 작동함
 repeat.id 추출 및 시리즈 관리가 올바르게 작동함
🔗 관련 항목
명세서: .cursor/artifacts/spec-writer/recurring_event_update_spec.md
의존성:
기존 반복 이벤트 생성 기능
기존 이벤트 수정 폼 (useEventForm)
기존 반복 아이콘 표시 (RecurringBadge)
관련 스토리:
반복 이벤트 생성
이벤트 삭제 (향후: 유사한 인스턴스 선택을 통한 삭제)
작성일: 2025-11-01
우선순위: 높음
상태: 사용자 스토리 완료 ✅
다음 작업: 사용자 스토리를 검토하고 승인해주세요. 승인되면 저장하고 @test-architect에게 테스트 케이스 작성을 요청하겠습니다.

승인 필요: 승인 후 .cursor/artifacts/po/recurring_event_update_story.md로 저장됩니다

