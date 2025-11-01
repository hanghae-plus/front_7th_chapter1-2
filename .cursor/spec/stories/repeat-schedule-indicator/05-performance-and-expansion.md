---
epic: repeat-schedule-indicator
test_suite: 성능 및 전개 범위
---

# Story: 성능 및 범위 전개

## 개요

전개된 발생 인스턴스에서도 반복 메타가 유지되어 동일 조건으로 아이콘을 표시하며, 많은 수의 인스턴스가 있어도 성능 저하가 없는지 확인합니다.

## Epic 연결

- **Epic**: 반복 일정 아이콘 표시 (Calendar Repeat Indicator)
- **Epic 파일**: `.cursor/spec/epics/repeat-schedule-indicator.md`
- **검증 포인트**: Epic의 "예상 동작" 섹션 5)에서 추출

## 테스트 구조 및 범위

- **테스트 스위트 (Describe Block):** '성능 및 전개 범위'
  - **테스트 케이스 1:** '전개 인스턴스에도 반복 아이콘 표시 조건이 일관 적용된다'
  - **테스트 케이스 2:** '월간 뷰에서 대량 인스턴스 렌더링 시 UI 렌더가 완료된다'

## 검증 포인트 (Given-When-Then)

```
Given: 월간 뷰에서 100개 이상의 반복 발생 인스턴스 렌더링
When: 초기 진입 및 탐색
Then: 프레임 드랍 또는 비정상 지연 없음(주관 테스트 기준)
```

## 테스트 데이터

| title           | repeat.type | interval | count (approx) | expected                      |
| --------------- | ----------- | -------- | -------------- | ----------------------------- |
| 데일리 브리핑   | daily       | 1        | 100+           | 렌더 완료, 아이콘 조건 일관   |

## 기술 참고사항

- 전개 유틸: `expandEventsForRange`
- 표시 조건: `event.repeat?.type && event.repeat.type !== 'none'`
- 성능 평가는 테스트 러너 상 렌더 완료/지연 여부 관찰로 대체

