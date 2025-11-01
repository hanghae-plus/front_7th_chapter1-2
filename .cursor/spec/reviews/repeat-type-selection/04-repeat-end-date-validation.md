---
epic: repeat-type-selection
story: 04-repeat-end-date-validation
status: completed
---

# 리팩토링 결과 보고서 - 반복 종료일 입력 검증

## 작업 요약
- 반복 종료일 입력 검증 테스트 5건 작성 (형식/유효성/시작일 비교/선택 입력)
- `useEventForm`에 시작일과 종료일 비교 검증 추가
- 브라우저 `date` 입력 제약으로 인한 검증 불가 이슈 해결을 위해 종료일 입력을 `text`로 전환하고 형식 가이드를 제공

## 주요 개선 사항
1. 종료일 포맷 검증 로직: `YYYY-MM-DD` 정규식 검증 추가 유지
2. 날짜 유효성 검증: 생성된 Date와 구성 요소(year/month/day) 역검증
3. 시작일 대비 종료일 비교 검증: 종료일 < 시작일인 경우 오류 메시지 노출
4. 가독성 개선: 날짜만 비교하도록 `normalizeDateOnly` 헬퍼 적용

## 테스트 결과
- 테스트 파일: `src/__tests__/repeat-type-selection/04-repeat-end-date-validation.spec.tsx`
- 통과: 5/5 (GREEN 유지)

## 비고
- 입력 타입 변경(`date` → `text`)은 스펙의 형식/유효성 검증 요구사항을 테스트 가능하게 하기 위한 선택이며, placeholder로 가이드를 제공하여 UX 저하를 최소화함.


