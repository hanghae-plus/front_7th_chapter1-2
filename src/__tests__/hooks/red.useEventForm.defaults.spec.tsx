import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { vi } from 'vitest';

// 아이콘 목(Mock) - 테스트 환경에서 불필요한 파일 오픈을 줄이기 위함
vi.mock('@mui/icons-material', () => ({
  Notifications: () => null,
  ChevronLeft: () => null,
  ChevronRight: () => null,
  Delete: () => null,
  Edit: () => null,
  Close: () => null,
}));

import { useEventForm } from '../../hooks/useEventForm';

// 간단한 테스트 컴포넌트: 훅을 호출하고 초기값을 DOM에 노출
const theme = createTheme();
function HookInspector() {
  const { repeatType, repeatInterval } = useEventForm();
  return (
    <div>
      <span data-testid="repeat-type">{String(repeatType)}</span>
      <span data-testid="repeat-interval">{String(repeatInterval)}</span>
    </div>
  );
}

function WrappedRender(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}><CssBaseline />{ui}</ThemeProvider>);
}

describe('Red: useEventForm 기본 repeat값 검증 (훅 레벨)', () => {
  it("기본 repeat 값은 type='none' 및 interval=1 이어야 한다 (Red)", async () => {
    // Red 테스트: 훅의 기본 동작(계약)을 명세합니다.
    WrappedRender(<HookInspector />);

    const typeNode = await screen.findByTestId('repeat-type');
    const intervalNode = await screen.findByTestId('repeat-interval');

    expect(typeNode).toBeInTheDocument();
    expect(intervalNode).toBeInTheDocument();

    // Green 단계: 올바른 기대값으로 수정하여 테스트가 통과하도록 합니다.
    expect(typeNode.textContent).toBe('none');
    expect(intervalNode.textContent).toBe('1');
  });
});
