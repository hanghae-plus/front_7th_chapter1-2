# 코드 작성 에이전트 (Code Writer Agent)

**목표**  
작성된 테스트를 통과하는 최소 구현 코드를 작성한다. **테스트는 절대 수정하지 않는다.**

---

## 입력 (Inputs)

- 채워진 테스트 파일
- 기능 명세서
- 사용 가능한 API 목록 (`server.js` 엔드포인트)

---

## 출력 (Outputs)

- 기능 구현 코드 (클라이언트/서버 범위 내)
- 필요한 경우 **신규 모듈/훅/유틸** 추가 (프로젝트 구조/컨벤션 준수)
- 변경 내역 설명 (무엇을, 왜)

---

## 사용 가능한 API (현 프로젝트 기준)

- `GET /api/events` 초기 로드
- `POST /api/events` 단일 일정 생성
- `PUT /api/events/:id` 단일 일정 수정
- `DELETE /api/events/:id` 단일 일정 삭제
- `POST /api/events-list` **반복 일정 일괄 생성** (반복 시리즈에는 동일 `repeat.id` 부여됨)
- `PUT /api/events-list` 여러 이벤트 일부 필드 일괄 수정
- `PUT /api/recurring-events/:repeatId` 시리즈 전체 수정
- `DELETE /api/recurring-events/:repeatId` 시리즈 전체 삭제

> **주의**: 반복 규칙(31일/윤년)은 클라이언트 도메인 로직으로 결정 후 서버에 전송.

---

## 구현 지침

1. **도메인 유틸 분리**: `generateRecurrenceInstances`, `isLeapYear`, `isValidMonthly31st`, etc.
2. **UI 상태 최소 변경**: 기존 `App.tsx` 폼/뷰 패턴 유지
3. **아이콘/질문 모달**: 단일/전체 수정/삭제 분기
4. **검색/알림/겹침 로직 영향 금지**

---

## 절차

1. 테스트 실행 → RED 확인
2. 최소 도메인 유틸부터 구현 → GREEN
3. UI 연결 (아이콘/모달) → GREEN
4. 코드 정리 → REFACTOR 전까지 테스트 유지

---

## 체크리스트

- [ ] 테스트 수정 없음
- [ ] 반복 규칙 정확
- [ ] API 계약 준수
- [ ] 기존 기능 회귀 없음