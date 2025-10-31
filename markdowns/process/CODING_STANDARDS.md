# Coding Standards

# 코딩 표준

This document defines the coding standards and best practices for this project, specifically designed for AI-driven development efficiency and consistency.
이 문서는 본 프로젝트의 코딩 표준과 모범 사례를 정의하며, AI 기반 개발 효율성과 일관성을 위해 특별히 설계되었습니다.

## 개요 / Overview

- **AI-First Approach**: Standards designed for Claude Code instances to maintain consistent quality / Claude Code 인스턴스가 일관된 품질을 유지하도록 설계된 표준
- **Automated Compliance**: Rules that can be automatically verified and enforced / 자동으로 검증하고 적용할 수 있는 규칙
- **Pattern Analysis**: Guidelines derived from actual codebase analysis using Claude / Claude를 활용한 실제 코드베이스 분석에서 도출된 가이드라인
- **Efficiency Focus**: Optimized for rapid development while maintaining high standards / 높은 표준을 유지하면서 신속한 개발에 최적화

## Project Structure / 프로젝트 구조

### Recommended File Structure / 권장 파일 구조

```
├── .github/                    # GitHub 설정 파일
│   ├── issue-templates/       # 이슈 템플릿
│   └── workflows/             # GitHub Actions
├── .husky/                    # Git hooks 설정
├── issues/                    # 프로젝트 이슈 관리
├── code-review/               # 코드 리뷰 가이드
├── markdowns/                 # 마크다운 템플릿
│   ├── templates/             # 템플릿 파일
│   └── process/               # 프로세스 문서
├── public/                    # 정적 파일
├── src/                       # 소스 코드
│   ├── __mocks__/            # Mock 데이터
│   │   └── response/         # API 응답 Mock
│   ├── __tests__/            # 테스트 파일
│   │   ├── hooks/            # 훅 테스트
│   │   ├── unit/             # 단위 테스트
│   │   └── components/       # 컴포넌트 테스트
│   ├── apis/                 # API 함수
│   ├── components/           # React 컴포넌트
│   │   ├── calendars/        # 캘린더 관련 컴포넌트
│   │   ├── event-forms/      # 이벤트 폼 컴포넌트
│   │   └── schedules/        # 스케줄 관련 컴포넌트
│   ├── constants/            # 상수 정의
│   ├── hooks/                # 커스텀 훅
│   ├── styles/               # 스타일 파일
│   ├── types/                # TypeScript 타입 정의
│   └── utils/                # 유틸리티 함수
│       ├── dates/            # 날짜 관련 유틸
│       └── events/           # 이벤트 관련 유틸
│           └── event-utils/  # 이벤트 유틸리티
│               ├── converts/ # 변환 함수
│               ├── filters/  # 필터링 함수
│               ├── overlaps/ # 겹침 검사 함수
│               └── searches/ # 검색 함수
├── package.json              # 의존성 및 스크립트
├── tsconfig.json            # TypeScript 설정
├── vite.config.ts           # Vite 설정
└── vitest.config.ts         # Vitest 설정
```

### Folder and File Naming / 폴더 및 파일 명명

- **폴더명**: kebab-case로 통일
- **파일명**: 기능.타입.확장자 형태
  - `easy.dateUtils.spec.ts` (테스트)
  - `Event.types.ts` (타입)
  - `CalendarHeader.tsx` (컴포넌트)

## Import/Export Standards / Import/Export 표준

### Import Order / Import 순서

Always maintain this specific order for imports:
Import는 항상 다음 순서를 유지합니다:

1. **React related libraries** / React 관련 라이브러리
2. **External libraries** (MUI, etc.) / 외부 라이브러리 (MUI 등)
3. **Internal components** / 내부 컴포넌트
4. **Type definitions** / 타입 정의
5. **Utility functions** / 유틸리티 함수

**Example**:

```typescript
import { useEffect, useState } from 'react';
import { Stack, FormControl } from '@mui/material';
import { CalendarHeader } from './calendars/CalendarHeader';
import { CalendarProps } from '@/types/Calendar.types';
import { fetchHolidays } from '@/apis/fetchHolidays';
```

### Export Standards / Export 표준

- **Prefer named exports** over default exports / default export보다 named export 선호
- **Module-level re-exports** for better organization / 더 나은 구조를 위한 모듈 레벨 re-export

```typescript
// ✅ Individual files with named exports
export const parseDateTime = (date: string, time: string) => { ... }

// ✅ Module-level re-exports (dateUtils.ts)
export { fillZero } from './dates/fillZero';
export { formatDate } from './dates/formatDate';
```

## File Organization Standards / 파일 구조 표준

### File Length / 파일 길이

- **Target**: Keep code files (.ts, .tsx, .js, .jsx) under 80 lines including comments when possible / 코드 파일을 주석 포함하여 가능한 80줄 이하로 유지
- **Exception handling**: If code files exceed 80 lines, add comment at the top explaining the reason / 코드 파일이 80줄 초과 시 최상단에 주석으로 이유 설명
- **Exemptions**: Documentation files (.md, .json, .yaml) are exempt from 80-line limit / 문서 파일들은 80줄 제한에서 제외

### File Documentation / 파일 문서화

- **Bilingual descriptions**: Add file description at the top in both English and Korean / 파일 상단에 영어와 한국어로 파일 설명 추가
- **File paths should complement the utility/component name** to clearly indicate its role / 파일 경로는 유틸리티/컴포넌트명을 보완하여 역할을 명확히 표시

```typescript
// Calendar component managing the display of week and month views
// 주간 및 월간 뷰 표시를 관리하는 캘린더 컴포넌트
```

### Test File Structure / 테스트 파일 구조

Test files follow flat structure with difficulty prefix:
테스트 파일은 난이도 접두사가 있는 플랫 구조를 따름:

- `src/utils/dateUtils.ts` → `src/__tests__/unit/easy.dateUtils.spec.ts`
- `src/hooks/useSearch.ts` → `src/__tests__/hooks/easy.useSearch.spec.ts`
- `src/components/Calendar.tsx` → `src/__tests__/components/easy.Calendar.spec.tsx`

## Naming Conventions / 네이밍 규칙

### Functions / 함수

- **Use full names** instead of abbreviations / 축약형 대신 풀네임 사용
- **Verb + Noun pattern** for clear action expression / 명확한 동작 표현을 위한 동사 + 명사 패턴

```typescript
// ✅ Good
getDaysInMonth, formatWeek, convertEventToDateRange;

// ❌ Avoid
monthDays, weekFormat, eventToRange;
```

**Example naming patterns**:

- 🙆🏻‍♂️: `aespaKarina`
- 🙅🏻‍♂️: `aspKrna`

### Components / 컴포넌트

- **PascalCase** with clear functionality / 명확한 기능을 가진 PascalCase
- **Descriptive names** that indicate purpose / 목적을 나타내는 설명적 이름

```typescript
// ✅ Good
CalendarHeader, EventForm, ScheduleCard, BasicFields;

// ❌ Avoid
Header, Form, Card, Fields;
```

### Constants / 상수

- **UPPER_SNAKE_CASE** for constants / 상수는 UPPER_SNAKE_CASE 사용

```typescript
// ✅ Good
AESPA_MEMBERS, NOTIFICATION_OPTIONS;

// ❌ Avoid
aespaMembers, notificationOptions;
```

### Types / 타입

- **PascalCase** with clear naming / 명확한 네이밍의 PascalCase

```typescript
// ✅ Good
EventForm.types, Calendar.types, RepeatType;

// ❌ Avoid
eventform, calendar, repeat;
```

## TypeScript Standards / TypeScript 표준

### Type Safety / 타입 안전성

- **Strict mode enabled** / strict 모드 활성화
- **No `any` types** (enforced by ESLint rule) / `any` 타입 금지 (ESLint 규칙으로 강제)
- **All props must be defined in `src/types/ComponentName.types.ts`** (never inside component files) / 모든 props는 컴포넌트 파일 내부가 아닌 별도 타입 파일에 정의
- **Use path aliases** `@/*` for imports / import에 경로 별칭 `@/*` 사용

### Type Definition Style / 타입 정의 스타일

- **파일 헤더**: 영어 + 한국어 병기 주석 필수

```typescript
// Core event-related type definitions
// 핵심 이벤트 관련 타입 정의
```

- **유니온 타입**: 리터럴 타입으로 명확하게 정의

```typescript
// ✅ 명확한 리터럴 타입
export type RepeatType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

// ❌ 모호한 문자열 타입
export type RepeatType = string;
```

- **인터페이스 확장**: 상속을 통한 타입 재사용

```typescript
export interface EventForm {
  title: string;
  // ...
}

export interface Event extends EventForm {
  id: string;
}
```

- **타입 주석**: 단위나 형식이 명확하지 않은 필드에 주석 추가

```typescript
notificationTime: number; // 분 단위로 저장
```

### Type Definitions / 타입 정의

```typescript
// ✅ Separate type files for reusability
// types/EventForm.types.ts
export interface BasicFieldsProps {
  title: string;
  description: string;
  // ... other properties
}

// ✅ Clear interface names
export interface CalendarViewProps {
  events: Event[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}
```

## Function and Logic Standards / 함수 및 로직 표준

### Function Length / 함수 길이

- **Target**: 15-20 lines maximum per function / 함수당 최대 15-20줄
- **Single Responsibility Principle**: Each function should have one clear purpose / 단일 책임 원칙: 각 함수는 하나의 명확한 목적을 가져야 함

### Function Signature / 함수 시그니처

- **기본값 활용**: 선택적 매개변수에 합리적인 기본값 제공

```typescript
// ✅ 기본값으로 사용성 향상
export function fillZero(value: number, size = 2) {
  return String(value).padStart(size, '0');
}
```

- **타입 안전성**: 제네릭보다는 명확한 타입 지정 선호

```typescript
// ✅ 명확한 타입 지정
export function findOverlappingEvents(
  newEvent: Event | EventForm,
  events: Event[]
): Event[] { ... }
```

### Function Internal Logic / 함수 내부 로직

- **불변성 유지**: 원본 데이터 변경 금지, spread operator 적극 활용

```typescript
// ✅ 불변성 보장
getEvents(): Event[] {
  return [...this.events];
}

// ✅ 객체 업데이트
this.events[index] = { ...this.events[index], ...updates };
```

- **Early Return**: 조건부 로직에서 빠른 반환

```typescript
// ✅ Early return 패턴
updateEvent(id: string, updates: Partial<Event>): Event | null {
  const index = this.events.findIndex((e) => e.id === id);
  if (index === -1) return null; // 빠른 반환

  // 메인 로직
  this.events[index] = { ...this.events[index], ...updates };
  return this.events[index];
}
```

### Function Structure / 함수 구조

```typescript
// ✅ Good - Clear, focused function
export const formatEventDate = (event: Event): string => {
  const date = new Date(event.date);
  return date.toLocaleDateString('ko-KR');
};

// ✅ Good - Proper error handling
export const validateEventTime = (
  startTime: string,
  endTime: string
): boolean => {
  if (!startTime || !endTime) {
    throw new Error('Start time and end time are required');
  }

  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);

  return start < end;
};
```

## Component Standards / 컴포넌트 표준

### Component Structure / 컴포넌트 구조

```typescript
// ✅ Proper component structure with separate type file
import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Event } from '@/types';
import { EventCardProps } from '@/types/EventCard.types';
import { formatEventDate } from '@/utils/dateUtils';

export const EventCard = ({ event, onClick }: EventCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    onClick(event.id);
  };

  return (
    <Box
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Typography variant="h6">{event.title}</Typography>
      <Typography variant="body2">
        {formatEventDate(event)}
      </Typography>
    </Box>
  );
};
```

### Props Pattern / Props 패턴

- **Separate type files**: All props must be defined in `src/types/` directory / 별도 타입 파일: 모든 props는 `src/types/` 디렉토리에 정의해야 함
- **Naming convention**: `src/types/ComponentName.types.ts` (e.g., `src/types/Event.types.ts`, `src/types/Calendar.types.ts`) / 네이밍 규칙: `src/types/ComponentName.types.ts`
- **Never define props inside component files** / 컴포넌트 파일 내부에 props 정의 금지
- **Interface-based props** / 인터페이스 기반 props
- **Clear prop names** / 명확한 prop 이름
- **Proper default values** when applicable / 해당하는 경우 적절한 기본값

### Accessibility Considerations / 접근성 고려

- **Aria-label**: 스크린 리더를 위한 명확한 레이블

```typescript
// ✅ 접근성 고려
<IconButton aria-label="Previous" onClick={() => onNavigate('prev')}>
  <ChevronLeft />
</IconButton>
```

## Class Writing Patterns / 클래스 작성 패턴

### Access Modifiers / 접근 제어자

- **Private 멤버**: 내부 상태를 외부에서 직접 접근 불가하도록 보호

```typescript
export class TestEventStore {
  private events: Event[] = []; // private 멤버

  constructor(initEvents: Event[] = []) {
    this.events = [...initEvents]; // 불변성 보장
  }
}
```

### Method Design / 메서드 설계

- **명확한 메서드명**: 동작을 정확히 표현하는 이름 사용
- **일관된 반환 타입**: null 반환을 통한 명시적 실패 처리

```typescript
// ✅ 명확한 메서드명과 null 반환
updateEvent(id: string, updates: Partial<Event>): Event | null {
  // 실패 시 null 반환
  // 성공 시 업데이트된 객체 반환
}
```

## Async Processing Patterns / 비동기 처리 패턴

### Async/Await Style / Async/Await 스타일

- **일관된 async/await 사용**: Promise.then() 체이닝 대신 async/await 선호

```typescript
// ✅ 일관된 async/await
const fetchEvents = async () => {
  try {
    const response = await fetch('/api/events');
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    const { events } = await response.json();
    setEvents(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    enqueueSnackbar('이벤트 로딩 실패', { variant: 'error' });
  }
};
```

## Code Quality Standards / 코드 품질 표준

### Pre-commit Requirements / 커밋 전 요구사항

- **ESLint validation** must pass / ESLint 검증 통과 필수
- **Prettier formatting** applied / Prettier 포맷팅 적용
- **TypeScript compilation** successful / TypeScript 컴파일 성공

### Documentation Requirements / 문서화 요구사항

- **Complex logic**: Add comments explaining the approach / 복잡한 로직: 접근 방법을 설명하는 주석 추가
- **Business logic**: Document why decisions were made / 비즈니스 로직: 결정을 내린 이유 문서화
- **API interfaces**: Clear JSDoc comments for public functions / API 인터페이스: 공개 함수에 대한 명확한 JSDoc 주석

### Performance Considerations / 성능 고려사항

- **Avoid unnecessary re-renders** / 불필요한 리렌더링 방지
- **Proper dependency arrays** in useEffect / useEffect에서 적절한 의존성 배열
- **Memoization** for expensive computations / 비용이 큰 계산에 대한 메모이제이션

## Error Handling Standards / 에러 처리 표준

### Error Boundaries / 에러 경계

- Implement proper error boundaries for React components / React 컴포넌트에 적절한 에러 경계 구현
- Provide meaningful error messages to users / 사용자에게 의미 있는 에러 메시지 제공

### Async Operations / 비동기 작업

- Always handle loading states / 항상 로딩 상태 처리
- Implement proper error handling for API calls / API 호출에 대한 적절한 에러 처리
- Provide user feedback for long-running operations / 장시간 실행되는 작업에 대한 사용자 피드백 제공
- **Try-Catch + 사용자 피드백**: 에러 로깅과 사용자 알림 병행
- **명확한 에러 메시지**: 사용자가 이해하기 쉬운 한국어 메시지

```typescript
// ✅ Good async function with proper error handling
export const fetchEvents = async (): Promise<Event[]> => {
  try {
    const response = await fetch('/api/events');

    if (!response.ok) {
      throw new Error(`Failed to fetch events: ${response.statusText}`);
    }

    const data = await response.json();
    return data.events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('이벤트를 불러오는데 실패했습니다.');
  }
};
```

## Constants and Configuration Patterns / 상수 및 설정 패턴

- **명확한 상수명**: 사용 목적이 분명한 이름 사용
- **타입 안전한 상수**: 리터럴 타입으로 컴파일 타임 검증

```typescript
// ✅ 타입 안전한 상수 정의
export const NOTIFICATION_OPTIONS = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  // ...
] as const;
```

## Language Usage / 언어 사용

### Code Comments / 코드 주석

- **Prefer Korean** for code comments / 코드 주석은 한국어 선호
- **English acceptable** for technical terms / 기술 용어는 영어 허용
- **파일 상단 주석**: 영어 + 한국어 병기

```typescript
// Calendar component managing the display of week and month views
// 주간 및 월간 뷰 표시를 관리하는 캘린더 컴포넌트
```

### Commit Messages / 커밋 메시지

- **English titles** with Korean body text / 영어 제목과 한국어 본문
- **Clear and descriptive** commit messages / 명확하고 설명적인 커밋 메시지

### Documentation / 문서화

- **Bilingual approach** for important documentation / 중요한 문서에 대한 이중 언어 접근

## AI Efficiency Guidelines / AI 효율성 가이드라인

### Claude Code Integration / Claude Code 통합

- **Context Preservation**: Maintain project context through comprehensive documentation / 포괄적인 문서화를 통한 프로젝트 컨텍스트 유지
- **Pattern Recognition**: Consistent patterns enable AI to understand and extend codebase efficiently / 일관된 패턴으로 AI가 코드베이스를 효율적으로 이해하고 확장 가능
- **Automated Verification**: Standards designed for automatic compliance checking / 자동 준수 검사를 위해 설계된 표준
- **Token Optimization**: English responses with Korean comments for optimal AI communication / 최적의 AI 커뮤니케이션을 위한 영어 응답과 한국어 주석

### Quality Automation / 품질 자동화

- **Pre-commit Standards**: Automated checks before each commit / 각 커밋 전 자동 검사
- **Code Review Automation**: AI-driven code quality analysis / AI 기반 코드 품질 분석
- **Documentation Generation**: Automated documentation updates / 자동화된 문서 업데이트
- **Test Coverage Verification**: Automated test coverage tracking / 자동화된 테스트 커버리지 추적
- **Consistent terminology** across the project / 프로젝트 전반의 일관된 용어 사용
