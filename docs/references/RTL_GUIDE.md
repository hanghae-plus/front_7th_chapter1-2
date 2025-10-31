# Testing Library Queries 가이드

## 📌 개요

Testing Library의 Query는 페이지에서 요소를 찾기 위한 메서드입니다. 세 가지 주요 쿼리 타입(`get`, `find`, `query`)이 있으며, 각각 요소를 찾지 못했을 때의 동작이 다릅니다.

## 🎯 핵심 개념

### 기본 사용 예시

```javascript
import { render, screen } from '@testing-library/react';

test('should show login form', () => {
  render();
  const input = screen.getByLabelText('Username');
  // 이벤트와 검증 로직...
});
```

## 📊 쿼리 타입별 비교

### 단일 요소 쿼리

| 쿼리 타입   | 0개 매치           | 1개 매치           | 2개 이상 매치 | 비동기 지원 |
| ----------- | ------------------ | ------------------ | ------------- | ----------- |
| **getBy**   | 에러 발생          | 요소 반환          | 에러 발생     | ❌          |
| **queryBy** | `null` 반환        | 요소 반환          | 에러 발생     | ❌          |
| **findBy**  | 에러 발생 (1초 후) | Promise<요소> 반환 | 에러 발생     | ✅          |

### 다중 요소 쿼리

| 쿼리 타입      | 0개 매치           | 1개 매치           | 2개 이상 매치      | 비동기 지원 |
| -------------- | ------------------ | ------------------ | ------------------ | ----------- |
| **getAllBy**   | 에러 발생          | 배열 반환          | 배열 반환          | ❌          |
| **queryAllBy** | `[]` 반환          | 배열 반환          | 배열 반환          | ❌          |
| **findAllBy**  | 에러 발생 (1초 후) | Promise<배열> 반환 | Promise<배열> 반환 | ✅          |

## 🔍 쿼리 선택 가이드 (우선순위)

### 1️⃣ 최우선: 접근성 기반 쿼리

#### `getByRole`

- **용도**: 접근성 트리에 노출된 모든 요소 검색
- **예시**: `getByRole('button', {name: /submit/i})`
- **추천도**: ⭐⭐⭐⭐⭐

#### `getByLabelText`

- **용도**: 폼 필드 검색에 최적
- **예시**: `getByLabelText('Username')`
- **추천도**: ⭐⭐⭐⭐⭐ (폼 요소)

#### `getByPlaceholderText`

- **용도**: placeholder 텍스트로 검색
- **주의**: label의 대체가 아님
- **추천도**: ⭐⭐⭐

#### `getByText`

- **용도**: 텍스트 컨텐츠로 요소 검색
- **대상**: div, span, paragraph 등 비대화형 요소
- **추천도**: ⭐⭐⭐⭐

#### `getByDisplayValue`

- **용도**: 폼 요소의 현재 값으로 검색
- **추천도**: ⭐⭐⭐

### 2️⃣ 차선: 시맨틱 쿼리

#### `getByAltText`

- **용도**: alt 텍스트 지원 요소 검색 (img, area, input)
- **추천도**: ⭐⭐

#### `getByTitle`

- **주의**: 스크린리더 지원 불안정
- **추천도**: ⭐

### 3️⃣ 최후 수단: Test ID

#### `getByTestId`

- **용도**: 다른 방법이 불가능한 경우
- **예시**: 동적 텍스트, 복잡한 컴포넌트
- **추천도**: ⭐

## 💡 TextMatch 패턴

### 문자열 매칭

```javascript
// 완전 일치
screen.getByText('Hello World');

// 부분 일치
screen.getByText('llo Worl', { exact: false });

// 대소문자 무시
screen.getByText('hello world', { exact: false });
```

### 정규식 매칭

```javascript
// 부분 일치
screen.getByText(/World/);

// 대소문자 무시
screen.getByText(/world/i);

// 전체 문자열 일치 + 대소문자 무시
screen.getByText(/^hello world$/i);
```

### 함수 매칭

```javascript
screen.getByText((content, element) => {
  return content.startsWith('Hello');
});
```

## ⚙️ 쿼리 옵션

### exact 옵션

- **기본값**: `true`
- **true**: 완전 일치, 대소문자 구분
- **false**: 부분 일치, 대소문자 무시

### normalizer 옵션

텍스트 정규화 동작 커스터마이징

```javascript
// 공백 제거 비활성화
screen.getByText('text', {
  normalizer: getDefaultNormalizer({ trim: false }),
});

// 커스텀 정규화
screen.getByText('text', {
  normalizer: (str) => str.replace(/[\u200E-\u200F]*/g, ''),
});
```

## 🖥️ screen 객체

`document.body`에 자동 바인딩된 쿼리 제공

```javascript
import { screen } from '@testing-library/react';

// container 불필요
const input = screen.getByLabelText('Username');

// container 필요한 경우
const container = document.querySelector('#app');
const input2 = getByLabelText(container, 'Username');
```

## 🚀 실전 활용 팁

### 1. 쿼리 선택 플로우차트

```
사용자가 볼 수 있는가?
  ├─ YES → getByRole, getByLabelText, getByText
  └─ NO → 의미론적 속성이 있는가?
           ├─ YES → getByAltText, getByTitle
           └─ NO → getByTestId (최후 수단)
```

### 2. 비동기 처리

```javascript
// 요소가 나타날 때까지 대기 (최대 1초)
const element = await screen.findByText('Loading complete');

// 커스텀 타임아웃
const element = await screen.findByText('Slow load', {}, { timeout: 3000 });
```

### 3. 부재 확인

```javascript
// 요소가 없음을 확인
expect(screen.queryByText('Error message')).toBeNull();

// getAllBy 대신 queryAllBy 사용
const items = screen.queryAllBy('listitem');
expect(items).toHaveLength(0);
```

## 🛠️ 유용한 도구

### Testing Playground

- **Chrome 확장**: 최적의 쿼리 선택 도우미
- **온라인**: [testing-playground.com](https://testing-playground.com)

### Manual Queries (비추천)

```javascript
// 피해야 할 패턴
const foo = container.querySelector('.class-name'); // ❌
const bar = container.querySelector('#id'); // ❌

// 불가피한 경우
const baz = container.querySelector('[data-testid="custom"]'); // ⚠️
```

## 📝 체크리스트

- [ ] 접근성 기반 쿼리 우선 사용
- [ ] 적절한 쿼리 타입 선택 (get/query/find)
- [ ] 비동기 요소는 findBy 사용
- [ ] 부재 확인은 queryBy 사용
- [ ] Test ID는 최후의 수단으로만 사용
- [ ] TextMatch 옵션 적절히 활용
