import React from 'react'
import { render, screen, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { vi } from 'vitest'

import App from '../../App'

// mock saveEvent so we can assert payload when submitting
const saveEventMock = vi.fn()
vi.mock('../../hooks/useEventOperations.ts', () => ({
  useEventOperations: () => ({
    events: [],
    saveEvent: saveEventMock,
    deleteEvent: () => {},
  }),
}))

const theme = createTheme()
function wrappedRender(ui: React.ReactElement) {
  return render(
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {ui}
    </ThemeProvider>
  )
}

describe('red 1-8: weekly 요일 선택 UI', () => {
  it('반복 유형을 weekly로 변경하면 요일 선택 UI가 나타나고 선택 가능한 상태여야 한다', async () => {
    const user = userEvent.setup()
    wrappedRender(<App />)

    // 반복 활성화
    const repeatToggle = screen.getByRole('checkbox', { name: /반복 여부/i })
    await user.click(repeatToggle)

  // 반복 유형을 'weekly'로 설정
  const repeatTypeContainer = screen.getByLabelText('반복 유형') as HTMLElement;
  const nativeRepeatSelect = repeatTypeContainer.querySelector('select') as HTMLSelectElement;
  fireEvent.change(nativeRepeatSelect, { target: { value: 'weekly' } });

    // 요일 선택 UI(그룹)가 보여야 함
    const group = screen.getByRole('group', { name: /요일 선택/i })
    expect(group).toBeInTheDocument()

    // 그룹 내부에 '월' 체크박스가 있어야 한다
    expect(within(group).getByRole('checkbox', { name: /월/ })).toBeInTheDocument()

    // 요일을 선택할 수 있어야 함 (실제 선택 동작은 이후 테스트에서 검증 예정)
  })
})
