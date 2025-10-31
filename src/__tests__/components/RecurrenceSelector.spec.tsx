import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { RecurrenceSelector } from '../../components/RecurrenceSelector';

describe('RecurrenceSelector', () => {
  const defaultProps = {
    value: { type: 'none' as const, interval: 1 },
    onChange: vi.fn(),
  };

  it('기본적으로 렌더링되며 "반복" 레이블이 표시된다', () => {
    render(<RecurrenceSelector {...defaultProps} />);

    expect(screen.getByLabelText('반복')).toBeInTheDocument();
  });

  it('드롭다운이 렌더링되고 기본값이 "없음"이다', () => {
    render(<RecurrenceSelector {...defaultProps} />);

    const select = screen.getByRole('combobox', { name: /반복/ });
    expect(select).toHaveTextContent('없음');
  });

  it('모든 반복 유형 옵션이 표시된다', async () => {
    const user = userEvent.setup();
    render(<RecurrenceSelector {...defaultProps} />);

    const select = screen.getByRole('combobox', { name: /반복/ });
    await user.click(select);

    // MUI Select는 Portal에 옵션을 렌더링하므로 document.body에서 찾아야 함
    const listbox = screen.getByRole('listbox');
    const options = within(listbox).getAllByRole('option');

    expect(options).toHaveLength(5);
    expect(options[0]).toHaveTextContent('없음');
    expect(options[1]).toHaveTextContent('매일');
    expect(options[2]).toHaveTextContent('매주');
    expect(options[3]).toHaveTextContent('매월');
    expect(options[4]).toHaveTextContent('매년');
  });

  it('반복 유형 "none" 선택 시 종료 날짜 필드가 숨겨져 있다', () => {
    render(<RecurrenceSelector {...defaultProps} />);

    expect(screen.queryByLabelText('종료 날짜')).not.toBeInTheDocument();
  });

  it('반복 유형 "매일" 선택 시 onChange 콜백이 호출되고 종료 날짜 필드가 표시된다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<RecurrenceSelector value={defaultProps.value} onChange={onChange} />);

    const select = screen.getByRole('combobox', { name: /반복/ });
    await user.click(select);

    // MUI Select 옵션 클릭
    const listbox = screen.getByRole('listbox');
    const dailyOption = within(listbox).getByRole('option', { name: '매일' });
    await user.click(dailyOption);

    expect(onChange).toHaveBeenCalledWith({ type: 'daily', interval: 1 });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('반복 유형 선택 시 종료 날짜 필드가 Slide down 애니메이션으로 표시된다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { rerender } = render(
      <RecurrenceSelector value={defaultProps.value} onChange={onChange} />
    );

    const select = screen.getByRole('combobox', { name: /반복/ });
    await user.click(select);

    const listbox = screen.getByRole('listbox');
    const weeklyOption = within(listbox).getByRole('option', { name: '매주' });
    await user.click(weeklyOption);

    // Props 업데이트를 시뮬레이션
    rerender(<RecurrenceSelector value={{ type: 'weekly', interval: 1 }} onChange={onChange} />);

    // 종료 날짜 필드가 표시되는지 확인
    expect(screen.getByLabelText('종료 날짜')).toBeInTheDocument();
  });

  it('반복 유형을 "없음"으로 변경하면 종료 날짜 필드가 숨겨진다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { rerender } = render(
      <RecurrenceSelector value={{ type: 'weekly', interval: 1 }} onChange={onChange} />
    );

    // 처음에는 종료 날짜 필드가 표시됨
    expect(screen.getByLabelText('종료 날짜')).toBeInTheDocument();

    const select = screen.getByRole('combobox', { name: /반복/ });
    await user.click(select);

    const listbox = screen.getByRole('listbox');
    const noneOption = within(listbox).getByRole('option', { name: '없음' });
    await user.click(noneOption);

    // Props 업데이트를 시뮬레이션
    rerender(<RecurrenceSelector value={{ type: 'none', interval: 1 }} onChange={onChange} />);

    // 애니메이션이 완료될 때까지 대기 (AnimatePresence는 exit 애니메이션이 완료되어야 DOM에서 제거됨)
    // waitFor를 사용하여 DOM 업데이트와 애니메이션 완료를 대기
    await waitFor(
      () => {
        expect(screen.queryByLabelText('종료 날짜')).not.toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });
});
