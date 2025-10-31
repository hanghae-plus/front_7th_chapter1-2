// 반복 일정 수정 확인 다이얼로그 컴포넌트 테스트
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import EditConfirmDialog from '@/components/EditConfirmDialog';

// 테스트용 props 타입 정의
interface EditConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onEditSingle: () => void;
  onEditAll: () => void;
  eventTitle: string;
  loading?: boolean;
}

describe('EditConfirmDialog 컴포넌트', () => {
  const mockOnClose = vi.fn();
  const mockOnEditSingle = vi.fn();
  const mockOnEditAll = vi.fn();

  const defaultProps: EditConfirmDialogProps = {
    open: true,
    onClose: mockOnClose,
    onEditSingle: mockOnEditSingle,
    onEditAll: mockOnEditAll,
    eventTitle: '반복 회의',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('다이얼로그가 열린 상태에서 제목과 메시지가 표시되어야 함', () => {
      render(<EditConfirmDialog {...defaultProps} />);

      expect(screen.getByText('반복 일정 수정')).toBeInTheDocument();
      expect(
        screen.getByText('해당 일정만 수정하시겠어요?')
      ).toBeInTheDocument();
      expect(
        screen.getByText('"반복 회의"의 수정 범위를 선택해주세요.')
      ).toBeInTheDocument();
    });

    it('선택 옵션 버튼들이 표시되어야 함', () => {
      render(<EditConfirmDialog {...defaultProps} />);

      expect(
        screen.getByRole('button', { name: '예 (해당 일정만)' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: '아니오 (전체 일정)' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });

    it('다이얼로그가 닫힌 상태에서는 렌더링되지 않아야 함', () => {
      render(
        <EditConfirmDialog
          {...defaultProps}
          open={false}
        />
      );

      expect(screen.queryByText('반복 일정 수정')).not.toBeInTheDocument();
    });
  });

  describe('사용자 상호작용', () => {
    it('"예" 버튼 클릭 시 단일 수정 콜백이 호출되어야 함', async () => {
      const user = userEvent.setup();
      render(<EditConfirmDialog {...defaultProps} />);

      const singleEditButton = screen.getByRole('button', {
        name: '예 (해당 일정만)',
      });
      await user.click(singleEditButton);

      expect(mockOnEditSingle).toHaveBeenCalledTimes(1);
      expect(mockOnEditAll).not.toHaveBeenCalled();
    });

    it('"아니오" 버튼 클릭 시 전체 수정 콜백이 호출되어야 함', async () => {
      const user = userEvent.setup();
      render(<EditConfirmDialog {...defaultProps} />);

      const allEditButton = screen.getByRole('button', {
        name: '아니오 (전체 일정)',
      });
      await user.click(allEditButton);

      expect(mockOnEditAll).toHaveBeenCalledTimes(1);
      expect(mockOnEditSingle).not.toHaveBeenCalled();
    });

    it('취소 버튼 클릭 시 onClose 콜백이 호출되어야 함', async () => {
      const user = userEvent.setup();
      render(<EditConfirmDialog {...defaultProps} />);

      const cancelButton = screen.getByRole('button', { name: '취소' });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnEditSingle).not.toHaveBeenCalled();
      expect(mockOnEditAll).not.toHaveBeenCalled();
    });

    it('ESC 키 누를 시 onClose 콜백이 호출되어야 함', async () => {
      const user = userEvent.setup();
      render(<EditConfirmDialog {...defaultProps} />);

      await user.keyboard('{Escape}');

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('로딩 상태', () => {
    it('로딩 중일 때 버튼들이 비활성화되어야 함', () => {
      render(
        <EditConfirmDialog
          {...defaultProps}
          loading={true}
        />
      );

      expect(
        screen.getByRole('button', { name: '예 (해당 일정만)' })
      ).toBeDisabled();
      expect(
        screen.getByRole('button', { name: '아니오 (전체 일정)' })
      ).toBeDisabled();
      expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
    });

    it('로딩 인디케이터가 표시되어야 함', () => {
      render(
        <EditConfirmDialog
          {...defaultProps}
          loading={true}
        />
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('다이얼로그에 적절한 ARIA 속성이 설정되어야 함', () => {
      render(<EditConfirmDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('포커스 트랩이 올바르게 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<EditConfirmDialog {...defaultProps} />);

      const firstButton = screen.getByRole('button', {
        name: '예 (해당 일정만)',
      });
      const lastButton = screen.getByRole('button', { name: '취소' });

      // 첫 번째 버튼에 포커스가 있어야 함
      expect(firstButton).toHaveFocus();

      // Shift+Tab으로 마지막 버튼으로 이동
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(lastButton).toHaveFocus();

      // Tab으로 다시 첫 번째 버튼으로 이동
      await user.keyboard('{Tab}');
      expect(firstButton).toHaveFocus();
    });
  });
});
