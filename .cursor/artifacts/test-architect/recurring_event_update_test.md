테스트 명세서: 반복 이벤트 수정 - 통합 테스트
테스트 케이스 개수
총 테스트 케이스 수: 10개
다이얼로그 표시: 6개
단일 인스턴스 수정: 2개
전체 시리즈 수정: 2개
우선 순위별 테스트 케이스
1. 다이얼로그 표시 (3개)
반복 이벤트 편집 시 다이얼로그 표시 확인
단일 이벤트 편집 시 다이얼로그 미표시 확인
다이얼로그에 올바른 버튼 표시 ("예", "아니오")
2. 단일 인스턴스 수정 - "예" 선택 (2개)
"예" 선택 시 새 UUID로 새 이벤트 생성 확인
원본 이벤트 시리즈가 변경되지 않음 확인
3. 전체 시리즈 수정 - "아니오" 선택 (2개)
"아니오" 선택 시 PUT /api/recurring-events/:repeatId 호출 확인
모든 이벤트가 수정되고 반복 아이콘이 유지됨 확인
4. 오류 처리 (2개)
단일 인스턴스 수정 시 API 오류 처리 확인
전체 시리즈 수정 시 API 오류 처리 확인
MSW 핸들러 정의
성공 시나리오
POST /api/events (반복 이벤트 생성)
typescript
Response: {
  id: string,
  title: string,
  date: string,
  startTime: string,
  endTime: string,
  repeat: { type: 'weekly', interval: 1, id: 'repeat-123' },
  ...
}
Status: 201
POST /api/events (단일 인스턴스 수정 - 새 이벤트 생성)
typescript
Request: {
  title: string,
  date: string,
  repeat: { type: 'none' },  // 반복 제거
  ...
}
Response: {
  id: 'evt-new-single-instance',  // 새 UUID
  repeat: { type: 'none' },
  ...
}
Status: 201
PUT /api/recurring-events/:repeatId (전체 시리즈 수정)
typescript
Request: {
  title?: string,
  description?: string,
  location?: string,
  category?: string,
  ...
}
Response: Event[]  // 수정된 모든 이벤트 배열
Status: 200
오류 시나리오
POST /api/events (실패)
typescript
Response: { error: 'Internal Server Error' }
Status: 500
PUT /api/recurring-events/:repeatId (실패)
typescript
Response: { error: 'Internal Server Error' }
Status: 500
테스트 구조
파일 위치
src/__tests__/medium.recurringEventUpdate.integration.spec.tsx

테스트 구조
typescript
describe('반복 이벤트 수정 - 통합 테스트', () => {
  describe('다이얼로그 표시', () => {
    it('반복 이벤트 편집 시 확인 다이얼로그 표시됨', () => {
      // Developer가 구현
    });
    
    it('단일 이벤트 편집 시 다이얼로그 표시되지 않음', () => {
      // Developer가 구현
    });
    
    it('다이얼로그에 올바른 버튼 표시됨: "예", "아니오"', () => {
      // Developer가 구현
    });
  });

  describe('단일 인스턴스 수정 (예 선택)', () => {
    it('"예" 선택 시 새로운 단일 이벤트가 생성되고 새 UUID로 새 이벤트 생성됨', () => {
      // Developer가 구현
    });
    
    it('원본 이벤트 시리즈가 변경되지 않음', () => {
      // Developer가 구현
    });
  });

  describe('전체 시리즈 수정 (아니오 선택)', () => {
    it('"아니오" 선택 시 모든 이벤트 수정됨', () => {
      // Developer가 구현
    });
    
    it('모든 이벤트가 수정되고 반복 아이콘이 유지됨', () => {
      // Developer가 구현
    });
  });

  describe('오류 처리', () => {
    it('단일 인스턴스 수정 시 API 오류가 발생하면 오류 메시지 표시됨', () => {
      // Developer가 구현
    });
    
    it('전체 시리즈 수정 시 API 오류가 발생하면 오류 메시지 표시됨', () => {
      // Developer가 구현
    });
  });
});
테스트 헬퍼 함수
기존 함수
formatDate(date: Date): 날짜 포맷팅
getTodayStr(): 오늘 날짜 문자열 반환
fillRequiredFields(args): 필수 필드 입력
activateWeeklyRepeat(options): 주간 반복 활성화
submitAndExpectSuccess(): 제출 및 성공 확인
createRecurringEvent(title, date): 반복 이벤트 생성
테스트 완료 기준
 모든 Acceptance Criteria 충족
 다이얼로그 표시/미표시 동작 검증
 단일 인스턴스 수정 로직 검증
 전체 시리즈 수정 로직 검증
 반복 아이콘 표시/제거 검증
 오류 처리 로직 검증
 MSW 핸들러 정상 작동
 테스트 케이스 구조 명확
 Given-When-Then 패턴 준수
 React Testing Library 베스트 프랙티스 준수
 모든 엣지 케이스 커버
기존 테스트와의 관계
반복 이벤트 생성 테스트 (medium.recurringEvent.integration.spec.tsx)
반복 이벤트 생성 기능 검증
반복 아이콘 표시 검증
반복 이벤트 수정 테스트 (medium.recurringEventUpdate.integration.spec.tsx)
반복 이벤트 수정 다이얼로그 동작 검증
단일 인스턴스 vs 전체 시리즈 수정 구분 검증
수정 후 아이콘 표시/제거 검증
테스트 실행 방법
bash
# 특정 테스트 파일 실행
npm test src/__tests__/medium.recurringEventUpdate.integration.spec.tsx

# 전체 테스트 실행
npm test
개발 순서
현재 단계 완료: 테스트 명세서 작성 (TDD Red 단계) 다음 단계 진행: 개발자 구현 (반복 이벤트 수정 기능)

Status: Test Specification Complete Next Action: 테스트 명세서를 검토하고 승인 후 @developer에게 구현을 요청합니다.

작성자: test-architect
날짜: 2025-11-01
버전: 1.0.0

