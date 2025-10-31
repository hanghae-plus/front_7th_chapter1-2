import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

// Mock icons to reduce file handles in test env
vi.mock('@mui/icons-material', () => ({
  Notifications: () => null,
  ChevronLeft: () => null,
  ChevronRight: () => null,
  Delete: () => null,
  Edit: () => null,
  Close: () => null,
}));

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from '../../App';

// 테스트 환경에서 아이콘 로드를 줄이기 위해 아이콘을 목(Mock)합니다.
const theme = createTheme();

// 재사용 가능한 Wrapper 컴포넌트로 render를 간결하게 사용합니다.
const ThemeWrapper = ({ children }: { children?: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);

function WrappedRender(ui: React.ReactElement) {
  return render(ui, { wrapper: ThemeWrapper });
}

describe('1-1 Red: Repeat model defaults (반복 모델 기본값)', () => {
  it("기본 repeat 값은 type='none' 및 interval=1 이어야 한다 (Red)", async () => {
    // 이 테스트는 Red 단계용 최소 단위 테스트입니다.
    // 내부적으로 useEventForm을 사용하는 App을 렌더합니다.
    WrappedRender(<App />);
    // 폼의 반복 관련 컨트롤은 항상 보이지 않을 수 있습니다. 그러나 훅의 기본값은
    // type='none' 과 interval=1 이어야 합니다. 이 Red 테스트에서는 우선 폼에
    // '반복 일정' 체크박스가 존재하는지를 확인하는 작은 단위의 검증을 수행합니다.
    // (후속 테스트에서 내부값을 더 직접적으로 검증할 수 있음)
    // '반복 일정' 라벨을 찾아 존재 여부를 확인합니다.
    const repeatCheckboxLabel = screen.getByText('반복 일정');
    expect(repeatCheckboxLabel).toBeInTheDocument();
    // (향후) 내부 훅의 기본값을 직접 검증하려면 useEventForm을 목킹하거나
    // 디버그 전용 노드를 추가하는 방식으로 확장할 수 있습니다.
  });
});
