---
epic: repeat-type-selection
story: 05-daily-repeat-generation
status: completed
---

# 리팩토링 결과 보고서 - 매일 반복 생성

## 작업 요약
- 월간 뷰에서 반복 일정이 표시 범위 내 모든 날짜에 전개되도록 구현
- `expandEventsForRange` 유틸 추가(daily/weekly/monthly/yearly 지원)
- 테스트를 위해 서버 초기 데이터에 반복 이벤트를 주입하여 표시 검증

## 주요 개선 사항
1. 표시 범위 기반 전개: 주/월 뷰의 시작~종료 범위를 계산하여 해당 기간에만 전개
2. 일 단위 간격 처리: interval에 따라 N일마다 생성
3. 공통 보일러 제거: 전개 로직을 `utils/repeat.ts`로 분리하여 가독성/재사용성 향상

## 테스트 결과
- 테스트 파일: `src/__tests__/repeat-type-selection/05-daily-repeat-generation.spec.tsx`
- 통과: 1/1 (GREEN 유지)

## 비고
- 이후 스토리(주/월/년 특수 케이스, 29/30/31일, 윤년)에 대해 동일 전개 기반으로 확장 예정.


