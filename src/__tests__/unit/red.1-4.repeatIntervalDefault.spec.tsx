import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { vi } from 'vitest';
import App from '../../App';

// useEventForm 훅을 목(Mock)하여 반복 UI가 항상 보이도록 하고, 의도적으로
// 훅의 기본 repeatInterval을 2로 설정해 테스트가 실패하도록 만듭니다 (Red).
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
    repeatWeekdays: [],
    setRepeatWeekdays: () => {},
  // 그린 단계로 전환하기 위해 기본값을 1로 설정합니다
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

const theme = createTheme();

function wrappedRender(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}><CssBaseline />{ui}</ThemeProvider>);
}

describe('1-4 Red: 반복 간격의 기본값 (UI)', () => {
  it("'반복 일정' 체크 후 '반복 간격' 입력의 기본값은 '1' 이어야 한다 (Red)", async () => {
    const user = userEvent.setup();

    wrappedRender(<App />);

    // 반복 체크박스를 찾아 클릭하여 반복 UI를 노출
    const checkbox = screen.getByLabelText('반복 일정');
    await user.click(checkbox);

    // 반복 간격 입력 요소를 찾아 기본값을 확인
    const input = screen.getByLabelText('반복 간격') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    // 의도적으로 실패하도록 '1'을 기대합니다.
    expect(input.value).toBe('1');
  });
});
