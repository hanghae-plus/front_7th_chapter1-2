import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { vi } from 'vitest'
import { fireEvent } from '@testing-library/react'

// mock icons centralized in setupTests
import App from '../../App'

// prepare a mock for useEventOperations so we can assert saveEvent was called
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

describe('red 1-7: 제출 시 반복 정보가 포함되어 저장되는지', () => {
  it('반복 활성화 후 폼 제출 시 saveEvent에 repeat 정보가 포함되어야 한다', async () => {
    const user = userEvent.setup()

    wrappedRender(<App />)

    // 채워야 할 기본 필수 필드
    const title = screen.getByLabelText('제목') as HTMLInputElement
    await user.type(title, '테스트 일정')

  const date = screen.getByLabelText('날짜') as HTMLInputElement
  fireEvent.change(date, { target: { value: '2025-11-01' } })

  const start = screen.getByLabelText('시작 시간') as HTMLInputElement
  fireEvent.change(start, { target: { value: '09:00' } })
  const end = screen.getByLabelText('종료 시간') as HTMLInputElement
  fireEvent.change(end, { target: { value: '10:00' } })

    // 반복 활성화
    const repeatToggle = screen.getByRole('checkbox', { name: /반복 여부/i })
    await user.click(repeatToggle)

  // 반복 유형 / 간격 / 종료일 설정
  const repeatTypeContainer = screen.getByLabelText('반복 유형') as HTMLElement;
  const nativeRepeatSelect = repeatTypeContainer.querySelector('select') as HTMLSelectElement;
  // MockSelect exposes a native select internally in tests; set its value directly
  fireEvent.change(nativeRepeatSelect, { target: { value: 'weekly' } });

    const interval = screen.getByLabelText('반복 간격') as HTMLInputElement
    await user.clear(interval)
    await user.type(interval, '2')

    const endDate = screen.getByLabelText('반복 종료일') as HTMLInputElement
    await user.type(endDate, '2025-12-31')

    // 제출
    const submit = screen.getByTestId('event-submit-button')
    await user.click(submit)

    // saveEvent가 호출되고, 전달된 객체에 repeat 정보가 올바르게 포함되었는지 검사
    await waitFor(() => {
      expect(saveEventMock).toHaveBeenCalled()
    })

    const calledWith = saveEventMock.mock.calls[0][0]
    expect(calledWith.repeat).toBeDefined()
    expect(calledWith.repeat.type).toBe('weekly')
    expect(calledWith.repeat.interval).toBe(2)
    expect(calledWith.repeat.endDate).toBe('2025-12-31')
  }, 20000)
})
