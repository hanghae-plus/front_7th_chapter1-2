---
epic: repeat-schedule-delete
test_suite: 반복 일정 삭제 - 시리즈 전체 삭제(아니오)
---

# Story: '아니오' 선택 - 시리즈 전체 삭제

## 개요
확인 모달에서 '아니오'를 선택하면 반복 시리즈 전체가 삭제되어 해당 시리즈의 모든 인스턴스가 목록/달력에서 사라지는지 검증합니다.

## Epic 연결
- **Epic**: 반복 일정 삭제
- **Epic 파일**: `.cursor/spec/epics/repeat-schedule-delete.md`
- **검증 포인트 출처**: 예상 동작 섹션 3) '아니오' 선택 - 시리즈 전체 삭제

## 테스트 구조 및 범위
- **테스트 스위트 (Describe Block):** '반복 일정 삭제 - 시리즈 전체 삭제(아니오)'
  - **테스트 케이스 1:** DELETE `/api/recurring-events/:repeatId` 성공 시 모든 인스턴스 미노출, 성공 토스트
  - **테스트 케이스 2:** 시리즈 미존재(404) 시 실패 토스트 및 목록 보존

## 검증 포인트 (Given-When-Then)
```
Given: repeat.id = "r-456"인 매일 반복 일정
When: 삭제 클릭 → 모달에서 '아니오' 선택 → 서버에 DELETE /api/recurring-events/r-456 호출
Then: 목록/달력에서 해당 시리즈의 모든 인스턴스가 더 이상 표시되지 않음
And: 토스트 "일정이 삭제되었습니다." 표시
```

## 테스트 데이터
| 필드      | 값       | 비고             |
| --------- | -------- | ---------------- |
| repeat.id | 'r-456'  | 시리즈 식별자    |
| type      | 'daily'  | 매일 반복        |

## 기술 참고사항
- 엔드포인트: DELETE `/api/recurring-events/:repeatId`
- 성공 토스트: "일정이 삭제되었습니다." / 실패 토스트: "일정 삭제 실패"
- 404 메시지(서버): "Recurring series not found" → 사용자 문구: "시리즈를 찾을 수 없습니다."
