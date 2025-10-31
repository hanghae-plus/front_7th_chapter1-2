import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import Modal from '../../components/Modal';

describe('Modal >', () => {
  it('모달이 열려있을 때 "이것은 모달입니다." 텍스트가 렌더링된다', () => {
    const handleClose = vi.fn();

    render(<Modal isOpen={true} onClose={handleClose} />);

    expect(screen.getByText('이것은 모달입니다.')).toBeInTheDocument();
  });

  it('모달에 확인 버튼이 렌더링된다', () => {
    const handleClose = vi.fn();

    render(<Modal isOpen={true} onClose={handleClose} />);

    expect(screen.getByRole('button', { name: /확인/i })).toBeInTheDocument();
  });

  it('확인 버튼을 클릭하면 onClose가 호출된다', async () => {
    const user = userEvent.setup();
    const handleClose = vi.fn();

    render(<Modal isOpen={true} onClose={handleClose} />);
    const confirmButton = screen.getByRole('button', { name: /확인/i });
    await user.click(confirmButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('isOpen이 false일 때 모달이 렌더링되지 않는다', () => {
    const handleClose = vi.fn();

    render(<Modal isOpen={false} onClose={handleClose} />);

    expect(screen.queryByText('이것은 모달입니다.')).not.toBeInTheDocument();
  });
});
