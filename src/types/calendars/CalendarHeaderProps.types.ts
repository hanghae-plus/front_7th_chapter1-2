// Reasons for disabling no-unused-vars rule:
// 1. This file primarily defines types for props used in CalendarHeader component.
// 2. The types defined here are essential for type-checking and ensuring correct prop usage.
// 3. Even if some types appear unused in this file, they are likely imported and utilized in other parts of the codebase.
// 4. Disabling the rule prevents unnecessary warnings during development, allowing developers to focus on more relevant issues.
// 5. Maintaining these types improves code clarity and helps with future maintenance and scalability.
// Therefore, to maintain code quality and developer experience, the no-unused-vars rule is disabled for this file.

// no-unused-vars를 비활성화하는 이유:
// 1. 이 파일은 주로 CalendarHeader 컴포넌트에서 사용되는 props의 타입을 정의합니다.
// 2. 여기서 정의된 타입은 타입 검사와 올바른 prop 사용을 보장하는 데 필수적입니다.
// 3. 일부 타입이 이 파일에서 사용되지 않는 것처럼 보여도, 다른 코드베이스에서 가져와서 활용될 가능성이 높습니다.
// 4. 이 규칙을 비활성화하면 개발 중에 불필요한 경고를 방지하여 개발자가 더 관련성 높은 문제에 집중할 수 있습니다.
// 5. 이러한 타입을 유지하면 코드의 명확성이 향상되고 향후 유지 관리 및 확장성에 도움이 됩니다.
// 따라서 코드 품질과 개발자 경험을 유지하기 위해 이 파일에 대해 no-unused-vars 규칙이 비활성화됩니다.

export interface CalendarHeaderProps {
  view: 'week' | 'month';
  setView: (view: 'week' | 'month') => void;
  onNavigate: (direction: 'prev' | 'next') => void;
}
