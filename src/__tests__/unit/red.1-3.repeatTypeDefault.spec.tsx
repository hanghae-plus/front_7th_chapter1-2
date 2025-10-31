import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 간단한 MUI 아이콘 목은 setupTests에서 중앙화되어 있으므로 여기서는 별도 목 불필요

import { vi } from 'vitest';
import App from '../../App';

// useEventForm 훅을 목(Mock)하여 반복 UI가 항상 보이도록 함
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

const theme = createTheme();

function wrappedRender(ui: React.ReactElement) {
  return render(<ThemeProvider theme={theme}><CssBaseline />{ui}</ThemeProvider>);
}

describe('1-3 Red: 반복 유형의 기본값 (UI)', () => {
  it("'반복 일정' 체크 후 '반복 유형' Select의 기본값은 'daily' 이어야 한다 (Red)", async () => {
    const { user } = (() => {
      const u = userEvent.setup();
      return { user: u };
    })();

    wrappedRender(<App />);

    // 반복 체크박스를 찾아 클릭하여 반복 UI를 노출
    const checkbox = screen.getByLabelText('반복 일정');
    await user.click(checkbox);

  // '반복 유형' Select 요소를 찾아 기본값을 확인
  const selectWrapper = screen.getByLabelText('반복 유형') as HTMLElement;
  const nativeSelect = selectWrapper.querySelector('select') as HTMLSelectElement;
  expect(nativeSelect).toBeInTheDocument();

  // 의도적으로 실패하도록 'daily'를 기대합니다.
  expect(nativeSelect.value).toBe('daily');
  });
});
