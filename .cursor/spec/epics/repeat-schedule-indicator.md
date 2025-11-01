# 반복 일정 아이콘 표시 (Calendar Repeat Indicator)

## 요약 (Summary)

- 달력 주/월 뷰에서 반복 일정에는 반복 아이콘을 표시해 단일 일정과 시각적으로 구분한다.
- 아이콘은 이벤트 타이틀 좌측에 노출되며 접근성 라벨과 툴팁을 제공한다.
- 기존 데이터 구조 변경 없이 `repeat.type !== 'none'`인 모든 발생 인스턴스에 적용한다.

## 배경 (Background)

- 현재 시스템은 반복 규칙을 `repeat` 필드로 보유하고, `expandEventsForRange`로 주/월 뷰 범위 내 발생 인스턴스를 전개한다.
- 주/월 뷰의 이벤트 칩은 알림 여부를 `Notifications` 아이콘으로 표시하지만, 반복 여부는 텍스트 목록 영역에서만 노출된다.
- 사용자는 달력 셀에서도 반복 일정을 즉시 식별할 수 있어야 하며, 최소한의 UI 변화로 일관된 인지적 힌트를 제공할 필요가 있다.

## 목표 (Goals)

- 반복 일정(전개된 발생 인스턴스 포함)을 캘린더(주/월) 뷰에서 반복 아이콘으로 시각 구분한다.
- 알림 아이콘과 함께 표시되더라도 레이아웃이 깨지지 않도록 일관된 정렬과 크기를 정의한다.
- 접근성(aria-label)과 툴팁을 제공한다.
- 테스트 가능하도록 명확한 셀렉터(`data-testid`)와 검증 규칙을 정의한다.

## 목표가 아닌 것 (Non-Goals)

- 반복 규칙 생성/수정/삭제 UX 변경
- RRULE 고도화, 예외/건너뛰기(exdates) 처리 모델 확장
- 다일정 스택/오버플로 레이아웃 변경, 드래그/리사이즈 상호작용 추가
- 달력 외 목록/상세 화면의 비주얼 개편(단, 현행 유지)

## 계획 (Plan)

### 예상 동작 (Expected Behaviors)

각 동작은 "동작 명세"와 "검증 포인트"로 기술한다.

#### 1) 주간 뷰: 반복 아이콘 표시

- 동작 명세:

  - 주간 뷰의 각 날짜 셀에서, 전개된 이벤트 중 `event.repeat.type !== 'none'` 인 경우 타이틀 좌측에 반복 아이콘을 표시한다.
  - 아이콘 순서는 [알림 아이콘] → [반복 아이콘] → [타이틀] 이다.
  - 아이콘 크기는 텍스트 `caption` 라인 높이에 맞춰 14~16px(소형)로 고정한다.
  - 아이콘에는 `aria-label="반복 일정"`, 툴팁 텍스트는 "반복 일정"을 사용한다.

- 검증 포인트:

```
Given: 2025-01-06(월) 시작, 매주 반복, 간격 1, 타이틀 "주간 회의"
When: 해당 주(2025-01-05~2025-01-11) 주간 뷰 진입
Then: 월요일 셀의 "주간 회의" 칩 좌측에 반복 아이콘 표시, aria-label="반복 일정"

Given: 단일 일정(반복 아님), 타이틀 "1회 미팅"
When: 동일 주간 뷰 확인
Then: 해당 칩에 반복 아이콘 미표시

Given: 반복 + 알림 활성 일정
When: 동일 주간 뷰 확인
Then: 한 칩 내 아이콘 순서가 [알림] → [반복] → [타이틀] 임을 확인
```

#### 2) 월간 뷰: 반복 아이콘 표시

- 동작 명세:

  - 월간 뷰의 각 날짜 셀에서, `getEventsForDay` 결과 중 반복 일정에는 반복 아이콘을 타이틀 좌측에 표시한다.
  - 휴일 텍스트, 알림 아이콘과 함께 표시되어도 높이/간격이 일관적으로 유지된다.
  - 타이틀이 말줄임 처리되더라도 아이콘은 항상 표시된다.

- 검증 포인트:

```
Given: 2025-01-01 시작, 매일 반복, 간격 1, 타이틀 "데일리 체크"
When: 2025-01 월간 뷰 진입
Then: 해당 월의 각 날짜 셀 내 "데일리 체크" 칩 좌측에 반복 아이콘 표시

Given: 31일 매월 반복 일정, 시작일 2025-01-31
When: 2025-02 월간 뷰 진입
Then: 2월에는 일정이 표시되지 않으며(31일 없음), 따라서 반복 아이콘도 표시되지 않음
```

#### 3) 접근성 및 툴팁

- 동작 명세:

  - 반복 아이콘 요소에 `aria-label="반복 일정"`, `title` 또는 MUI `Tooltip`으로 "반복 일정"을 제공한다.
  - 키보드 포커스 시에도 동일 툴팁이 노출된다.

- 검증 포인트:

```
Given: 반복 일정 칩의 아이콘
When: 마우스 오버 또는 포커스 진입
Then: "반복 일정" 툴팁 노출, 스크린 리더에서 aria-label 인식
```

#### 4) 아이콘 우선순위/레이아웃

- 동작 명세:

  - 동일 칩에서 알림/반복 아이콘이 함께 있으면 좌→우 순으로 [알림][반복] 배치한다.
  - 두 아이콘 모두 `fontSize="small"` 동급으로 렌더링한다.
  - 수직 정렬은 `alignItems="center"`, 간격은 `spacing=1`(MUI) 기준을 준수한다.

- 검증 포인트:

```
Given: 알림 + 반복이 모두 활성인 일정 칩
When: 주/월 뷰에서 렌더링 확인
Then: [알림][반복][타이틀] 순서, 아이콘 크기/정렬/간격이 일관적임
```

#### 5) 성능 및 범위 전개

- 동작 명세:

  - 전개된 발생 인스턴스(예: `id@YYYY-MM-DD`)에도 원본의 `repeat` 메타가 유지되므로 동일 조건(`repeat.type !== 'none'`)으로 판별한다.
  - 전개 비용은 기존과 동일하며, 아이콘 표시는 O(1) 조건 체크만 추가한다.

- 검증 포인트:

```
Given: 월간 뷰에서 100개 이상의 반복 발생 인스턴스 렌더링
When: 초기 진입 및 탐색
Then: 프레임 드랍 또는 비정상 지연 없음(주관 테스트 기준)
```

### 기술 요구사항

#### 1. 데이터 타입

- 기존 타입을 재사용한다. 데이터 스키마 변경 없음.

```typescript
// 기존 정의 재사용
type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

interface RepeatInfo {
  type: RepeatType;
  interval: number;
  endDate?: string; // YYYY-MM-DD
}

interface EventForm {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  location: string;
  category: string;
  repeat: RepeatInfo;
  notificationTime: number;
}

interface Event extends EventForm {
  id: string;
}
```

#### 2. UI 구성/아이콘

- 아이콘: MUI `@mui/icons-material/Repeat`
- 크기: `fontSize="small"` (약 14~16px), 캡션 라인 높이와 시각적 일치
- 색상: 기본(테마 `action.active` 수준), 알림 오류 색상과 충돌하지 않음
- 배치: `Stack direction="row" spacing={1} alignItems="center"` 내 [알림][반복][타이틀]
- 테스트 셀렉터: 반복 아이콘 요소에 `data-testid="repeat-icon"` 부여
- 접근성: `aria-label="반복 일정"`, Tooltip("반복 일정")

#### 3. 조건 로직

- 표시 조건: `event.repeat?.type && event.repeat.type !== 'none'`
- 주간 뷰: `renderWeekView`의 이벤트 칩 Stack 내부에 조건부 Repeat 아이콘 삽입
- 월간 뷰: `renderMonthView`의 이벤트 칩 Stack 내부에 조건부 Repeat 아이콘 삽입

#### 4. 회귀 위험/호환성

- 알림 아이콘(Notifications)과 동시 노출 시 순서만 정의. 기존 스타일 변경 최소화.
- 타이틀 말줄임 처리(`noWrap`)는 유지, 아이콘은 항상 보이도록 텍스트 영역만 축소.

### 제약사항 및 에지 케이스

| 케이스              | 예상 동작                  | 비고                    |
| ------------------- | -------------------------- | ----------------------- |
| 단일 일정           | 아이콘 미표시              | repeat.type === 'none'  |
| 매월 31일 반복, 2월 | 발생 없음, 아이콘도 미표시 | 전개 유틸 동작 준수     |
| 윤년 2/29 매년 반복 | 윤년에만 표시              | 기존 스펙/유틸 준수     |
| 알림 + 반복 동시    | [알림][반복][타이틀]       | 우선순위/정렬 규칙 준수 |
| 말줄임 발생         | 아이콘 유지, 타이틀만 축소 | `noWrap` 유지           |

### 구현 우선순위

1. 높음: 주/월 뷰 이벤트 칩에 반복 아이콘 조건부 표시 + 접근성/툴팁 + 테스트 셀렉터
2. 중간: 아이콘/텍스트 오버플로 시 레이아웃 검증(캡션 라인 높이 일치)
3. 낮음: 전역 Legend(설명) 추가는 본 Epic 범위 외(Non-Goal)

---

## 검증 포인트 모음 (Given-When-Then)

```
Given: repeat.type = 'weekly', interval = 1, 2025-01-06 시작
When: 2025-01-05~2025-01-11 주간 뷰 진입
Then: 1/6(월) 칩에 반복 아이콘(data-testid='repeat-icon', aria-label='반복 일정') 표시

Given: repeat.type = 'none' 인 단일 일정
When: 주/월 뷰 진입
Then: 반복 아이콘 미표시

Given: repeat.type = 'daily', interval = 1, 2025-01 전체 범위
When: 2025-01 월간 뷰 진입
Then: 매 날짜 칩에서 해당 이벤트 칩 좌측에 반복 아이콘 표시

Given: 알림 활성 + 반복 활성 일정
When: 주/월 뷰 진입
Then: 아이콘 순서 [알림][반복] 확인, Tooltip "반복 일정" 노출
```

---

## 기존 코드베이스 연결점

- 이벤트 전개: `utils/repeat.ts`의 `expandEventsForRange` 결과 사용
- 주간 뷰: `App.tsx`의 `renderWeekView()` 이벤트 칩 Stack 내부
- 월간 뷰: `App.tsx`의 `renderMonthView()` 이벤트 칩 Stack 내부
- 아이콘 시스템: MUI Icons(Material), 알림 아이콘과 동일한 스타일 체계 재사용

---

## 체크리스트

- [x] 의도/가치 명확화 및 테스트 가능성 확보
- [x] 데이터 타입/검증 규칙 명시(변경 없음)
- [x] Given-When-Then 검증 포인트 다수 제공
- [x] 접근성/툴팁/테스트 셀렉터 정의
- [x] 에지 케이스 명시(31일, 윤년 등 기존 전개 로직과 정합)
- [x] 저장 경로 준수: `.cursor/spec/epics/repeat-schedule-indicator.md`
