---
epic: repeat-schedule-delete
test_suite: 반복 일정 삭제 - 단일 일정(비반복) 삭제 참고
---

# Story: 비반복 일정 삭제(참고)

## 개요
비반복(단일) 일정은 반복 삭제 모달을 거치지 않고 일반 삭제 플로우로 처리되는 것을 검증합니다.

## Epic 연결
- **Epic**: 반복 일정 삭제
- **Epic 파일**: `.cursor/spec/epics/repeat-schedule-delete.md`
- **검증 포인트 출처**: 예상 동작 섹션 4) 비반복 일정 삭제(참고)

## 테스트 구조 및 범위
- **테스트 스위트 (Describe Block):** '반복 일정 삭제 - 단일 일정(비반복) 삭제 참고'
  - **테스트 케이스 1:** DELETE `/api/events/:id` 성공 시 해당 일정 미노출, 성공 토스트
  - **테스트 케이스 2:** 서버 오류 시 실패 토스트 표시 및 목록 보존

## 검증 포인트 (Given-When-Then)
```
Given: repeat.type = 'none'인 단일 일정 id='e-1'
When: 삭제 확인 후 DELETE /api/events/e-1 호출
Then: 목록에서 일정이 사라지고, 토스트 "일정이 삭제되었습니다." 표시
```

## 테스트 데이터
| 필드        | 값          | 비고           |
| ----------- | ------------ | -------------- |
| id          | 'e-1'        | 단일 일정 id   |
| repeat.type | 'none'       | 비반복 일정    |

## 기술 참고사항
- 엔드포인트: DELETE `/api/events/:id`
- 성공 토스트: "일정이 삭제되었습니다." / 실패 토스트: "일정 삭제 실패"
- 본 Story는 반복 모달과 무관한 일반 삭제 플로우를 다룹니다.
