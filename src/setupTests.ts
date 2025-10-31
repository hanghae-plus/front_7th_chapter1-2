import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';

// 전역 MUI 아이콘 목(Mock)
// 목적: Windows에서 많은 아이콘 파일을 열며 발생하는 EMFILE(too many open files)
// 문제를 완화하고 테스트 실행 안정성을 높입니다.
vi.mock('@mui/icons-material', async () => {
  const React = await import('react');
  const IconStub = (props: any) => React.createElement('span', props, null);
  return {
    Notifications: IconStub,
    ChevronLeft: IconStub,
    ChevronRight: IconStub,
    Delete: IconStub,
    Edit: IconStub,
    Close: IconStub,
  };
});

// 테스트 환경에서 MUI의 Select는 복잡한 내부 구현(포탈, 메뉴 등) 때문에
// testing-library에서 .value를 직접 읽기 어렵습니다. App 컴포넌트에
// NODE_ENV 분기를 두는 대신 여기에서 Select를 테스트 친화적인 wrapper로
// 모킹해 둡니다. 실제 환경에서는 원래 모듈을 그대로 사용합니다.
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  const React = await import('react');

  const MockSelect = ({ value, onChange, children, ...rest }: any) => {
    // 테스트에서 getByRole('combobox') 를 기대하는 경우가 있어,
    // native select만 노출하면 combobox 역할을 찾지 못하는 상황이 발생합니다.
    // 따라서 외부 컨테이너에 role="combobox"를 부여하고 내부에 native select를
    // 둬서 option 요소는 유지하면서 combobox 쿼리가 동작하도록 합니다.
    const options = React.Children.map(children, (child: any) => {
      const props = (child as any)?.props;
      if (React.isValidElement(child) && props && 'value' in props) {
        // Preserve aria-label (e.g., MenuItem aria-label="업무-option") to make
        // option selectable by name in tests that expect aria labels on options.
        // Also, use the aria-label as the option's visible text when present so
        // getByRole('option', { name: '...' }) reliably matches in jsdom.
        const optionProps: any = { value: props.value };
        if (props['aria-label']) optionProps['aria-label'] = props['aria-label'];
        const labelForOption = props['aria-label'] ?? props.children;
  // Attach an onClick so user.click on the option triggers the Select's
  // onChange handler in jsdom (some user-event flows click the option
  // element directly rather than changing the native select value).
  optionProps.onClick = () => onChange && onChange({ target: { value: props.value } });
  return React.createElement('option', optionProps, labelForOption);
      }
      return child;
    });

    // Outer wrapper receives the accessible label (so getByLabelText returns this wrapper),
    // the inner native <select> is visible and has role="combobox" so both integration
    // and unit tests can interact with it reliably.
    return React.createElement(
      'div',
      {
        'data-mock-select-wrapper': 'true',
        ...rest,
      },
      React.createElement(
        'select',
        {
          role: 'combobox',
          'data-mock-select': 'true',
          value,
          onChange: (e: any) => onChange && onChange({ target: { value: e.target.value } }),
        },
        options
      )
    );
  };

  return {
    ...actual,
    Select: MockSelect,
  };
});

import { handlers } from './__mocks__/handlers';

// ! Hard 여기 제공 안함
/* msw */
export const server = setupServer(...handlers);

vi.stubEnv('TZ', 'UTC');

beforeAll(() => {
  server.listen();
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

beforeEach(() => {
  expect.hasAssertions(); // ? Med: 이걸 왜 써야하는지 물어보자

  vi.setSystemTime(new Date('2025-10-01')); // ? Med: 이걸 왜 써야하는지 물어보자
});

afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
  vi.useRealTimers();
  server.close();
});
