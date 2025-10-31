import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import EditOptionsDialog from '../../components/EditOptionsDialog';

describe('EditOptionsDialog', () => {
  it('open이 true일 때 다이얼로그가 렌더링된다', () => {
    const mockOnClose = vi.fn();
    const mockOnEditSingle = vi.fn();
    const mockOnEditAll = vi.fn();

    render(
      <EditOptionsDialog
        open={true}
        onClose={mockOnClose}
        onEditSingle={mockOnEditSingle}
        onEditAll={mockOnEditAll}
      />
    );

    expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
    expect(screen.getByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
  });

  it('open이 false일 때 다이얼로그가 렌더링되지 않는다', () => {
    const mockOnClose = vi.fn();
    const mockOnEditSingle = vi.fn();
    const mockOnEditAll = vi.fn();

    render(
      <EditOptionsDialog
        open={false}
        onClose={mockOnClose}
        onEditSingle={mockOnEditSingle}
        onEditAll={mockOnEditAll}
      />
    );

    expect(screen.queryByText('반복 일정 수정')).not.toBeInTheDocument();
  });

  it('"예" 버튼을 클릭하면 onEditSingle이 호출된다', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    const mockOnEditSingle = vi.fn();
    const mockOnEditAll = vi.fn();

    render(
      <EditOptionsDialog
        open={true}
        onClose={mockOnClose}
        onEditSingle={mockOnEditSingle}
        onEditAll={mockOnEditAll}
      />
    );

    const yesButton = screen.getByRole('button', { name: '예' });
    await user.click(yesButton);

    expect(mockOnEditSingle).toHaveBeenCalledTimes(1);
  });

  it('"아니오" 버튼을 클릭하면 onEditAll이 호출된다', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    const mockOnEditSingle = vi.fn();
    const mockOnEditAll = vi.fn();

    render(
      <EditOptionsDialog
        open={true}
        onClose={mockOnClose}
        onEditSingle={mockOnEditSingle}
        onEditAll={mockOnEditAll}
      />
    );

    const noButton = screen.getByRole('button', { name: '아니오' });
    await user.click(noButton);

    expect(mockOnEditAll).toHaveBeenCalledTimes(1);
  });

  it('"취소" 버튼을 클릭하면 onClose가 호출된다', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    const mockOnEditSingle = vi.fn();
    const mockOnEditAll = vi.fn();

    render(
      <EditOptionsDialog
        open={true}
        onClose={mockOnClose}
        onEditSingle={mockOnEditSingle}
        onEditAll={mockOnEditAll}
      />
    );

    const cancelButton = screen.getByRole('button', { name: '취소' });
    await user.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('세 개의 버튼이 올바른 순서로 렌더링된다', () => {
    const mockOnClose = vi.fn();
    const mockOnEditSingle = vi.fn();
    const mockOnEditAll = vi.fn();

    render(
      <EditOptionsDialog
        open={true}
        onClose={mockOnClose}
        onEditSingle={mockOnEditSingle}
        onEditAll={mockOnEditAll}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveTextContent('예');
    expect(buttons[1]).toHaveTextContent('아니오');
    expect(buttons[2]).toHaveTextContent('취소');
  });
});
