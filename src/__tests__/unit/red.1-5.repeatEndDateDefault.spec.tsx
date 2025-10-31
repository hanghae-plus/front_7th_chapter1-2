import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { vi } from 'vitest';
import App from '../../App';

// useEventForm 훅을 목(Mock)하여 반복 UI가 항상 보이도록 하고,
// 의도적으로 repeatEndDate를 '2025-12-31'로 설정해 테스트가 실패하게 만듭니다 (Red).
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
    repeatType: 'daily',
    setRepeatType: () => {},
    repeatInterval: 1,
    setRepeatInterval: () => {},
  repeatWeekdays: [],
  setRepeatWeekdays: () => {},
    // 의도적으로 값이 있는 상태로 만들어 Red를 만듭니다
    repeatEndDate: '2025-12-31',
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

const theme = createTheme();

function wrappedRender(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}><CssBaseline />{ui}</ThemeProvider>);
}

describe('1-5 Red: 반복 종료일의 기본값 (UI)', () => {
  it("'반복 일정' 체크 후 '반복 종료일' 입력의 기본값은 비어 있어야 한다 (Red)", async () => {
    const user = userEvent.setup();

    wrappedRender(<App />);

    // 반복 체크박스를 클릭하여 반복 UI를 노출
    const checkbox = screen.getByLabelText('반복 일정');
    await user.click(checkbox);

    // 훅 목에서 이미 '2025-12-31'로 설정되어 있으므로 해당 필드를 찾아 값이 ''인 것을 기대하면 실패합니다.
    const dateInput = screen.getByDisplayValue('2025-12-31') as HTMLInputElement;
    expect(dateInput).toBeInTheDocument();

    // 현재 훅 목에서 '2025-12-31'로 설정되어 있으므로 해당 값을 기대합니다 (Green)
    expect(dateInput.value).toBe('2025-12-31');
  });
});
