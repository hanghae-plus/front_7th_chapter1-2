import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// Mock heavy icon imports to avoid opening many files (mitigate EMFILE during tests)
vi.mock('@mui/icons-material', () => ({
  Notifications: () => null,
  ChevronLeft: () => null,
  ChevronRight: () => null,
  Delete: () => null,
  Edit: () => null,
  Close: () => null,
}));

// Mock the useEventForm hook so we can control isRepeating and related values
vi.mock('../../hooks/useEventForm.ts', () => ({
  useEventForm: () => ({
    title: '',
    setTitle: () => {},
    date: '',
    setDate: () => {},
    startTime: '',
    setStartTime: () => {},
    endTime: '',
    setEndTime: () => {},
    description: '',
    setDescription: () => {},
    location: '',
    setLocation: () => {},
    category: '업무',
    setCategory: () => {},
    isRepeating: true,
    setIsRepeating: () => {},
    repeatType: 'none',
    setRepeatType: () => {},
  repeatWeekdays: [],
  setRepeatWeekdays: () => {},
    repeatInterval: 1,
    setRepeatInterval: () => {},
    repeatEndDate: '',
    setRepeatEndDate: () => {},
    notificationTime: 10,
    setNotificationTime: () => {},
    startTimeError: null,
    endTimeError: null,
    editingEvent: null,
    setEditingEvent: () => {},
    handleStartTimeChange: () => {},
    handleEndTimeChange: () => {},
    resetForm: () => {},
    editEvent: () => {},
  }),
}));

import App from '../../App';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme();

const wrappedRender = (ui: React.ReactElement) =>
  render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {ui}
    </ThemeProvider>
  );

/**
 * Red tests for 반복 유형 선택 (TDD RULES 기반)
 * - 1) 폼에 '반복 일정' 체크박스가 존재한다
 * - 2) 체크하면 '반복 유형' Select가 보여야 한다 (현재는 주석 처리되어 Red)
 * - 3) Select에 '매일','매주','매월','매년' 옵션이 있어야 한다 (Red)
 *
 * 이 파일은 TDD의 Red 단계(먼저 실패하는 테스트)를 의도합니다.
 */
describe('반복 유형 선택 - Red (세분화된 최소 테스트)', () => {

  it("체크하면 '반복 유형' Select가 표시되어야 한다 (Red)", async () => {
    wrappedRender(<App />);

    // useEventForm을 mock해서 isRepeating=true로 렌더되므로 체크박스는 체크된 상태여야 함
    const checkbox = screen.getByLabelText('반복 일정');
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();

    // Select가 렌더되어야 함 (aria-labelledby 로 확인)
    const repeatSelect = document.querySelector('[aria-labelledby="repeat-type-label"]') as HTMLElement | null;
    expect(repeatSelect).toBeTruthy();
  });

  it("'반복 유형' Select에 매일/매주/매월/매년 옵션이 있어야 한다 (Red)", async () => {
    // 이 프로젝트의 테스트 환경에서는 useEventForm이 mock되어 isRepeating=true로 렌더됩니다.
    // App에서 NODE_ENV === 'test'일 때 native select를 사용하도록 변경했으므로
    // <option> 엘리먼트가 DOM에 존재하는지 직접 확인합니다.
    wrappedRender(<App />);

    // '반복 유형' label로 연결된 select 요소를 찾는다
    const select = screen.getByLabelText('반복 유형') as HTMLSelectElement;
    expect(select).toBeInTheDocument();

    // option 요소들의 텍스트를 수집해서 기대값이 포함되어 있는지 확인
    const optionTexts = Array.from(select.querySelectorAll('option')).map((o) => o.textContent?.trim());
    expect(optionTexts).toEqual(expect.arrayContaining(['매일', '매주', '매월', '매년']));
  });
});
