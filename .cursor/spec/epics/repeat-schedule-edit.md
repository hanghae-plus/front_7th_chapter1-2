# 반복 일정 수정 (단일/전체 선택)

## 요약 (Summary)

- 반복 일정을 편집할 때 확인 모달로 단일 인스턴스만 수정할지, 전체 반복 일정을 수정할지 선택한다.
- 단일 수정 시 해당 인스턴스는 단일 일정으로 분리되고 반복 아이콘이 사라진다. 전체 수정 시 시리즈 전체가 동일하게 변경되며 반복 아이콘이 유지된다.
- 시리즈는 예외 날짜(exceptions)를 통해 단일 수정된 날짜를 제외한다.

## 배경 (Background)

- 현행 스펙(반복 유형 선택)에서는 “개별 인스턴스만 수정”이 미지원으로 명시되어 있음. 사용자 피드백에 따라 단일/전체 편집 분기 기능이 필요하다.
- 캘린더 UX 표준(Google, Apple 캘린더 등)은 반복 이벤트 편집 시 단일/전체 선택을 제공한다.

## 목표 (Goals)

- 반복 이벤트 편집 시 다음 확인 모달을 노출: “해당 일정만 수정하시겠어요?” [예/아니오/취소]
- 예(단일 수정):
  - 선택한 인스턴스를 단일 일정으로 분리 저장(`repeat.type = 'none'`).
  - 원 시리즈에서는 해당 날짜를 예외로 제외하여 중복 표시를 방지.
  - 분리된 단일 일정에는 반복 아이콘 미표시.
- 아니오(전체 수정):
  - 시리즈 전체 속성(제목/시간/설명/카테고리/알림/반복 설정 등)을 일괄 변경.
  - 반복 아이콘 유지.
- 취소: 아무 변경 없음.
- 충돌(겹침) 검증: 단일 수정은 일반 일정과 동일 규칙 적용, 전체 수정은 기존 스펙에 맞춘 정책 유지.

## 목표가 아닌 것 (Non-Goals)

- 반복 삭제/종료 정책 변경(별도 Epic 범위).
- 반복 생성 로직의 근본적 변경(예: 규칙 엔진 교체).
- 타임존/하루종일(all-day) 이벤트 도입(현 데이터 모델 범위 밖).

## 계획 (Plan)

### 예상 동작 (Expected Behaviors)

#### 1) 확인 모달 노출

동작 명세:
- 사용자가 `repeat.type !== 'none'`인 이벤트를 편집하려고 저장할 때, 확인 모달을 노출한다.
- 모달 텍스트: “해당 일정만 수정하시겠어요?”
- 버튼: “예”(단일), “아니오”(전체), “취소”

검증 포인트:
```
Given: repeat.type = 'weekly'인 이벤트 편집 폼
When: 저장 버튼 클릭
Then: “해당 일정만 수정하시겠어요?” 모달 노출, [예/아니오/취소] 버튼 표시
```

#### 2) 단일 수정(예)

동작 명세:
- 현재 편집 중인 특정 날짜 인스턴스를 단일 일정으로 분리하여 저장한다.
- 분리된 일정은 `repeat.type = 'none'`이며, UI에서 반복 아이콘(`data-testid="repeat-icon"`)이 표시되지 않는다.
- 원본 시리즈는 해당 날짜를 예외(exceptions)로 등록하여 확장(expand) 시 생성되지 않도록 한다.
- 저장 전 겹침 검증을 수행하며 겹침 시 경고 다이얼로그 후 계속 진행 가능.

검증 포인트:
```
Given: 2025-11-05 수요일 09:00-10:00, 매주 반복 일정(제목 "주간 회의")
When: 2025-11-05 인스턴스를 편집 → 제목을 "외부 미팅"으로 변경 → 저장 → 모달에서 "예" 선택
Then: 이벤트 목록에 2025-11-05 날짜에 제목이 "외부 미팅"인 단일 일정 생성, repeat.type = 'none'
And: 같은 날짜에 원 시리즈 인스턴스는 더 이상 표시되지 않음(예외 처리)
And: 단일 일정 카드에 반복 아이콘 미표시

Given: 단일 수정 시 시작/종료 시간을 기존 일정과 겹치도록 변경
When: 저장 → 겹침 검증
Then: "일정 겹침 경고" 다이얼로그가 노출되고, 계속 진행 시 저장됨
```

#### 3) 전체 수정(아니오)

동작 명세:
- 원본 시리즈 전체의 속성(제목/시간/설명/카테고리/알림/반복 설정 등)을 일괄 변경한다.
- 반복 아이콘은 유지된다.
- 겹침 정책은 현 스펙(반복 일정 겹침 검증 비적용)과 동일하게 따른다.

검증 포인트:
```
Given: 매주 반복 일정(제목 "주간 회의")
When: 제목을 "주간 스탠드업"으로 변경 → 저장 → 모달에서 "아니오" 선택
Then: 해당 시리즈의 모든 인스턴스 제목이 "주간 스탠드업"으로 반영됨
And: 인스턴스 카드에 반복 아이콘 유지
```

#### 4) 취소

동작 명세:
- 확인 모달에서 취소를 선택하면 저장을 중단하고 폼/화면 상태는 변경하지 않는다.

검증 포인트:
```
Given: 반복 일정 편집 폼에서 변경 사항 존재
When: 저장 → 모달에서 "취소" 선택
Then: 저장 수행되지 않으며 화면 상태는 편집 이전과 동일함(편집 모드 유지 가능)
```

#### 5) 예외 처리 저장 규칙

동작 명세:
- 단일 수정으로 분리 시:
  - 시리즈에 `exceptions`에 해당 날짜(YYYY-MM-DD)를 추가하여 확장에서 제외.
  - 동일 날짜의 단일 이벤트를 신규 생성(`repeat.type = 'none'`).
- 전체 수정 시:
  - `PUT /api/recurring-events/:repeatId`를 통해 시리즈 전체를 갱신.

검증 포인트:
```
Given: repeat.id = "r-123" 시리즈, 2025-11-05 인스턴스 편집 → 단일 수정
When: 저장 완료 후 범위 확장(expandEventsForRange)
Then: 2025-11-05는 시리즈 확장에서 제외되고, 단일 이벤트 1건만 노출됨
```

### 기술 요구사항

#### 1. 데이터 타입

```typescript
// 반복 유형
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

// 반복 정보(예외 날짜 추가)
export interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string;        // YYYY-MM-DD
  exceptions?: string[];   // YYYY-MM-DD 배열, 해당 날짜는 확장에서 제외
}

export interface EventForm {
  title: string;
  date: string;            // YYYY-MM-DD
  startTime: string;       // HH:mm
  endTime: string;         // HH:mm
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;      // 단일 일정은 { type: 'none', interval: 1 }
  notificationTime: number; // 분 단위
}

export interface Event extends EventForm {
  id: string;              // 시리즈 기반 id 사용 시, 단일 분리본은 새로운 고유 id
  // 예: 시리즈 기반 식별을 위해 baseId@YYYY-MM-DD 패턴 허용 (권장)
}
```

#### 2. 유효성 검증 규칙(정확 문자열)

- 단일 수정 시 겹침 경고 문구: "일정 겹침 경고"
- 시리즈 미존재: "시리즈를 찾을 수 없습니다."
- 잘못된 인스턴스 날짜: "유효하지 않은 인스턴스 날짜입니다."
- 저장 실패(공통): "일정 저장 실패"

#### 3. 알고리즘(단일 분리 & 예외)

의사코드:
```
function detachOccurrenceAndSave(seriesEvent, targetDate, updatedFields):
  // 1) 시리즈에 예외 추가
  seriesEvent.repeat.exceptions = uniq([...(seriesEvent.repeat.exceptions || []), targetDate])
  saveSeries(seriesEvent) // PUT /api/recurring-events/:repeatId

  // 2) 단일 일정 생성(반복 없음)
  const detached = {
    ...seriesEvent,
    ...updatedFields,
    id: generateNewId(seriesEvent.id, targetDate), // baseId@YYYY-MM-DD 등
    date: targetDate,
    repeat: { type: 'none', interval: 1 },
  }
  createEvent(detached) // POST /api/events

  return detached
```

확장(expand) 규칙 보완:
```
// expandEventsForRange(events, rangeStart, rangeEnd)
if (event.repeat.type !== 'none') {
  // 생성된 각 occurrenceDate가 exceptions에 포함되면 skip
}
```

### 제약사항 및 에지 케이스

- 예외 날짜가 중복 추가되지 않도록 `uniq` 처리.
- 단일 분리로 동일 날짜에 시리즈+단일이 중복 노출되지 않아야 함.
- 종료일보다 이후 인스턴스 단일 수정은 허용(이미 생성된 가시 범위 내 인스턴스에 한함).
- 시간 변경 시 시작 < 종료 검증 유지, 오류 메시지 현행 규칙 준수.
- UI: 단일 분리된 일정은 반복 아이콘 미표시, 시리즈 인스턴스는 표시.

### 구현 우선순위

1. 높음: 확인 모달 도입 및 분기 처리(예/아니오/취소) + 저장 흐름 분기
2. 높음: 예외 날짜(exceptions) 도입 및 확장 로직 반영
3. 중간: 단일 분리 저장(신규 id 규칙) 및 UI 아이콘 표시 정합성
4. 중간: 겹침 경고 흐름 단일/전체 케이스 검증
5. 낮음: 추가 에지 케이스(월말/윤년) 회귀 테스트

---

## 체크리스트

- [x] 모든 동작에 "동작 명세"와 "검증 포인트" 존재
- [x] 검증 포인트가 Given-When-Then 형식으로 작성됨
- [x] 구체적인 데이터와 값 사용 (추상적 표현 없음)
- [x] 오류 메시지가 정확한 문자열로 명시됨
- [x] 데이터 타입과 검증 규칙 제공됨
- [x] 에지 케이스가 구체적으로 나열됨
- [x] 구현 우선순위 제안됨
- [x] 기존 코드베이스와의 연결점 파악됨(`src/types.ts`, `src/utils/repeat.ts`, `src/App.tsx` 아이콘 표시, 서버의 `/api/recurring-events/:repeatId`)

---
