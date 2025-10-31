# Notification Utilities Migration TODO

## 완료된 작업 ✅

- [x] notificationUtils.ts 알림 유틸리티 업데이트
- [x] getUpcomingEvents 함수 - 임박한 이벤트 필터링 로직
- [x] createNotificationMessage 함수 - 알림 메시지 생성 로직
- [x] 시간 계산 상수 정의 (초, 분) - 가독성 향상
- [x] TypeScript strict 모드 준수
- [x] 80줄 제한 준수 (28줄로 간결)
- [x] EventProps 타입 안전성 보장

## 핵심 기능 분석 📋

- **getUpcomingEvents**: 현재 시간 기준으로 알림 시간 내 이벤트 필터링
  - 시간 차이 계산 (분 단위)
  - 알림 시간 범위 검증
  - 이미 알림된 이벤트 제외
- **createNotificationMessage**: 사용자 친화적 알림 메시지 생성
  - 알림 시간과 이벤트 제목 조합
  - 한국어 메시지 포맷

## 아키텍처 개선사항 ✅

- [x] 순수 함수로 구현 - 사이드 이펙트 없음
- [x] 명확한 함수 책임 분리
- [x] 한국어 상수 사용으로 가독성 향상
- [x] 타입 안전성 100% 보장
- [x] 효율적인 시간 계산 알고리즘

## 시간 계산 로직 🕐

- **상수 정의**: `초 = 1000ms`, `분 = 초 * 60`
- **시간 차이**: `(eventStart - now) / 분`
- **알림 조건**: `0 < timeDiff <= notificationTime`
- **중복 방지**: `!notifiedEvents.includes(event.id)`

## 완료된 테스트 작업 ✅

- [x] 알림 유틸리티 테스트 모듈화 완료
  - [x] getUpcomingEvents.spec.ts - 임박한 이벤트 필터링 테스트
    - 알림 시간 도래 이벤트 반환 검증
    - 이미 알림된 이벤트 제외 로직 테스트
    - 알림 시간 미도래/지난 이벤트 처리 검증
  - [x] createNotificationMessage.spec.ts - 알림 메시지 생성 테스트
    - 정확한 메시지 형식 검증
- [x] src/**tests**/unit/notifications/ 디렉토리 구조화
- [x] 통합 테스트 파일 (easy.notificationUtils.spec.ts) 리팩토링

## 다음 단계 📝

- [ ] 알림 시스템 통합 테스트 작성
- [ ] 성능 최적화 검토 (대량 이벤트 처리)

## 참고사항

- 모든 함수는 순수 함수로 구현되어 테스트 용이
- 시간 계산 로직이 정확하고 효율적
- 한국어 상수 사용으로 코드 가독성 향상
- 알림 시스템의 핵심 로직을 안정적으로 지원
