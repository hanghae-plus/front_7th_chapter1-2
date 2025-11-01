---
epic: repeat-schedule-indicator
test_suite: 반복 아이콘 접근성 및 툴팁
---

# Story: 접근성 및 툴팁

## 개요

반복 아이콘에 접근성 라벨과 툴팁을 제공하여 스크린 리더 및 마우스/키보드 사용자에게 반복 일정을 명확히 전달합니다.

## Epic 연결

- **Epic**: 반복 일정 아이콘 표시 (Calendar Repeat Indicator)
- **Epic 파일**: `.cursor/spec/epics/repeat-schedule-indicator.md`
- **검증 포인트**: Epic의 "예상 동작" 섹션 3)에서 추출

## 테스트 구조 및 범위

- **테스트 스위트 (Describe Block):** '반복 아이콘 접근성 및 툴팁'
  - **테스트 케이스 1:** '반복 아이콘에 aria-label="반복 일정"이 존재한다'
  - **테스트 케이스 2:** '마우스 오버 시 "반복 일정" 툴팁이 노출된다'
  - **테스트 케이스 3:** '키보드 포커스 시에도 같은 툴팁이 노출된다'

## 검증 포인트 (Given-When-Then)

```
Given: 반복 일정 칩의 아이콘
When: 마우스 오버 또는 포커스 진입
Then: "반복 일정" 툴팁 노출, 스크린 리더에서 aria-label 인식
```

## 테스트 데이터

| title       | repeat.type | interval | expected                                       |
| ----------- | ----------- | -------- | ---------------------------------------------- |
| 정기 점검   | weekly      | 1        | aria-label 존재, hover/focus 툴팁 "반복 일정" |

## 기술 참고사항

- 접근성: `aria-label="반복 일정"`
- 툴팁: MUI `Tooltip` 또는 `title` 속성으로 "반복 일정"
- 테스트 셀렉터: `data-testid="repeat-icon"`

