import React from 'react'
import { render, screen } from '@testing-library/react'
import { fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { vi } from 'vitest'

import App from '../../App'

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

describe('red 1-9: 비반복(Non-repeating) 저장', () => {
  it('반복을 활성화하지 않고 제출하면 saveEvent 호출 시 repeat.type는 "none" 이어야 한다', async () => {
    const user = userEvent.setup()
    wrappedRender(<App />)

    // 필수 필드 채우기
    const title = screen.getByLabelText('제목') as HTMLInputElement
    await user.type(title, '비반복 테스트')

    const date = screen.getByLabelText('날짜') as HTMLInputElement
    fireEvent.change(date, { target: { value: '2025-11-02' } })

    const start = screen.getByLabelText('시작 시간') as HTMLInputElement
    fireEvent.change(start, { target: { value: '10:00' } })
    const end = screen.getByLabelText('종료 시간') as HTMLInputElement
    fireEvent.change(end, { target: { value: '11:00' } })

    // 기본은 반복 비활성화 상태이므로 바로 제출
    const submit = screen.getByTestId('event-submit-button')
    await user.click(submit)

    // saveEvent가 호출되었는지와 전달된 repeat 타입 검사
    expect(saveEventMock).toHaveBeenCalled()
    const calledWith = saveEventMock.mock.calls[0][0]
    expect(calledWith.repeat).toBeDefined()
    expect(calledWith.repeat.type).toBe('none')
  }, 20000)
})
