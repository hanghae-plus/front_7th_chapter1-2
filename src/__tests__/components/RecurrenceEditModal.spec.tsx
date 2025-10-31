import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import { RecurrenceEditModal } from '../../components/RecurrenceEditModal';

describe('RecurrenceEditModal', () => {
  const defaultProps = {
    isOpen: true,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('모달이 열려 있을 때 올바르게 렌더링된다', () => {
    render(<RecurrenceEditModal {...defaultProps} />);

    expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
    expect(screen.getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '예' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '아니오' })).toBeInTheDocument();
  });

  it('모달이 닫혀 있을 때 렌더링되지 않는다', () => {
    render(<RecurrenceEditModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('반복 일정 수정')).not.toBeInTheDocument();
  });

  it('"예" 버튼 클릭 시 onConfirm("single")이 호출된다', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(<RecurrenceEditModal {...defaultProps} onConfirm={onConfirm} />);

    const yesButton = screen.getByRole('button', { name: '예' });
    await user.click(yesButton);

    expect(onConfirm).toHaveBeenCalledWith('single');
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('"아니오" 버튼 클릭 시 onConfirm("all")이 호출된다', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(<RecurrenceEditModal {...defaultProps} onConfirm={onConfirm} />);

    const noButton = screen.getByRole('button', { name: '아니오' });
    await user.click(noButton);

    expect(onConfirm).toHaveBeenCalledWith('all');
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('Esc 키 누르면 onCancel이 호출된다', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();

    render(<RecurrenceEditModal {...defaultProps} onCancel={onCancel} />);

    await user.keyboard('{Escape}');

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('Tab 키로 버튼 간 포커스 이동이 가능하다', async () => {
    const user = userEvent.setup();

    render(<RecurrenceEditModal {...defaultProps} />);

    const yesButton = screen.getByRole('button', { name: '예' });
    const noButton = screen.getByRole('button', { name: '아니오' });

    // 모달이 열리면 autoFocus로 인해 "예" 버튼에 자동 포커스
    // 기다려서 확인
    await vi.waitFor(() => {
      expect(yesButton).toHaveFocus();
    });

    // 첫 번째 Tab: "아니오" 버튼으로 포커스 이동
    await user.tab();
    expect(noButton).toHaveFocus();
  });
});
