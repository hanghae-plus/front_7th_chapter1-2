import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../../App'

// Red test: 반복(Repeat) 관련 필드의 가시성
// - 초기 상태에서는 반복 관련 입력(반복 주기, 횟수/종료일 등)이 보이지 않아야 함
// - 사용자가 반복을 활성화하면 해당 입력들이 화면에 보여야 함

describe('red 1-6: 반복 필드 가시성', () => {
  it('초기에는 반복 필드가 보이지 않고, 반복 활성화 시 보인다', async () => {
    render(<App />)
    const user = userEvent.setup()

    // 반복 토글(체크박스)을 구체적으로 찾는다. 앱에서 checkbox에
    // inputProps={{ 'aria-label': '반복 여부' }} 를 추가했으므로 이를 사용한다.
    const repeatToggle = screen.getByRole('checkbox', { name: /반복 여부/i })

    // 반복 토글이 화면에 존재하는지 확인 (필수 컨트롤)
    expect(repeatToggle).toBeInTheDocument()

    // 반복이 비활성화된 초기 상태에서는 반복 관련 필드들이 보이지 않아야 함
    expect(screen.queryByLabelText('반복 유형')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('반복 간격')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('반복 종료일')).not.toBeInTheDocument()

    // 사용자가 반복을 활성화한다.
    await user.click(repeatToggle)

    // 이제 반복 관련 필드들이 보여야 한다.
    expect(screen.getByLabelText('반복 유형')).toBeInTheDocument()
    expect(screen.getByLabelText('반복 간격')).toBeInTheDocument()
    expect(screen.getByLabelText('반복 종료일')).toBeInTheDocument()
  })
})
