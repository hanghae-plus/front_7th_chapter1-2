# Worklog

- 작성자: Test First Engineer
- 업무 지시 내용: 반복 일정 기능에 대한 테스트 코드를 작성하고 RED 상태로 만들기
- 참고자료: docs/worklog/worklog-qa-engineer-v1.md, docs/prd/prd-recurring-events-v3.md
- 산출물: src/**tests**/recurring-events.spec.ts, src/features/recurring-events/repeatText.ts

# 업무 과정

- QA Engineer가 작성한 90개의 ONLY_TC 형식 테스트 케이스 분석
- 필요한 함수 및 타입 파악:
  - generateRecurringInstances: 반복 일정의 날짜별 인스턴스 생성
  - splitRecurringEvent: 반복 일정 분할 (단일 수정/삭제 시)
  - generateRepeatGroupId: 고유한 반복 그룹 ID 생성
  - getRepeatText: 반복 정보 텍스트 생성
- getRepeatText 함수 스켈레톤 추가 생성
- 90개 테스트 케이스를 실제 Vitest 테스트 코드로 변환:
  - 반복 일정 생성 테스트 (14개)
  - 특수 날짜 처리 테스트 (23개 - 매월 31일, 윤년 2/29)
  - 반복 일정 표시 테스트 (11개)
  - 반복 일정 수정 테스트 (15개)
  - 반복 일정 삭제 테스트 (12개)
  - 반복 일정 UI 테스트 (12개)
  - 경계 케이스 테스트 (7개)
  - 데이터 모델 검증 테스트 (6개)
- import 경로를 상대 경로로 수정 (프로젝트 설정에 맞춤)
- 테스트 실행하여 RED 상태 확인:
  - 총 111개 테스트 실행
  - 57개 실패 (예상대로)
  - 54개 통과 (데이터 모델 검증 등 간단한 assertion)
- 실패 이유 분석:
  - generateRecurringInstances: 빈 배열 반환 → 날짜 생성 로직 구현 필요
  - generateRepeatGroupId: 빈 문자열 반환 → 고유 ID 생성 로직 필요
  - splitRecurringEvent: 빈 객체 반환 → 분할 로직 구현 필요
  - getRepeatText: 빈 문자열 반환 → 텍스트 포맷팅 로직 필요

# 참고 파일

- docs/worklog/worklog-qa-engineer-v1.md
- docs/prd/prd-recurring-events-v3.md
- src/types.ts
- src/features/recurring-events/types.ts
- src/features/recurring-events/generateInstances.ts
- src/features/recurring-events/splitRecurrence.ts
- src/features/recurring-events/repeatGroupId.ts
- src/features/recurring-events/repeatText.ts
- templates/testcases/{{테스트_유닛_혹은_통합명}}.spec.ts.hbs

# 다음 작업자에게 남기는 코멘트

Implementation Engineer는 다음 함수들을 구현하여 모든 테스트를 통과(GREEN)시켜주세요:

1. **generateRecurringInstances** (우선순위: 최고)

   - 매일/매주/매월/매년 반복 패턴 구현
   - 특수 날짜 처리 필수:
     - 매월 31일: 31일이 없는 달(2,4,6,9,11월) 제외
     - 매년 2/29: 윤년이 아닌 경우 제외
   - 반복 종료일 검사
   - 뷰 범위 내 날짜만 생성

2. **splitRecurringEvent** (우선순위: 높음)

   - 반복 일정 분할 로직 구현
   - before: 수정/삭제 날짜 이전의 반복 일정
   - modified: 수정된 단일 일정 (수정 시에만)
   - after: 수정/삭제 날짜 이후의 반복 일정
   - 경계 케이스 주의: 첫/마지막 일정 처리
   - repeatGroupId 유지 필수

3. **generateRepeatGroupId** (우선순위: 중간)

   - UUID 또는 타임스탬프 기반 고유 ID 생성
   - 매번 다른 ID 생성 보장

4. **getRepeatText** (우선순위: 낮음)
   - "반복: 1일마다", "반복: 1주마다" 등 형식
   - 종료일이 있으면 "(종료: YYYY-MM-DD)" 추가

현재 111개 테스트 중 57개가 실패 상태입니다. 모든 테스트를 통과시키면 GREEN 단계 완료입니다.
