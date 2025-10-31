import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { RecurrenceDeleteModal } from '../../components/RecurrenceDeleteModal';

describe('RecurrenceDeleteModal', () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('모달이 열려 있을 때 올바르게 렌더링된다', () => {
    render(<RecurrenceDeleteModal {...defaultProps} />);

    expect(screen.getByText('반복 일정 삭제')).toBeInTheDocument();
    expect(screen.getByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '예' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '아니오' })).toBeInTheDocument();
  });

  it('모달이 닫혀 있을 때 렌더링되지 않는다', () => {
    render(<RecurrenceDeleteModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('반복 일정 삭제')).not.toBeInTheDocument();
  });

  it('"예" 버튼 클릭 시 onConfirm("single")이 호출된다', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(<RecurrenceDeleteModal {...defaultProps} onConfirm={onConfirm} />);

    const yesButton = screen.getByRole('button', { name: '예' });
    await user.click(yesButton);

    expect(onConfirm).toHaveBeenCalledWith('single');
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('"아니오" 버튼 클릭 시 onConfirm("all")이 호출된다', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(<RecurrenceDeleteModal {...defaultProps} onConfirm={onConfirm} />);

    const noButton = screen.getByRole('button', { name: '아니오' });
    await user.click(noButton);

    expect(onConfirm).toHaveBeenCalledWith('all');
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('Esc 키 누르면 onCancel이 호출된다', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<RecurrenceDeleteModal {...defaultProps} onCancel={onCancel} />);

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
