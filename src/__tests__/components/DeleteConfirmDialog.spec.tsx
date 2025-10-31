// 반복 일정 삭제 확인 다이얼로그 테스트
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

import { DeleteConfirmDialog } from '@/components/DeleteConfirmDialog';

describe('DeleteConfirmDialog 컴포넌트', () => {
  const mockProps = {
    open: true,
    eventTitle: '팀 회의',
    onDeleteSingle: vi.fn(),
    onDeleteAll: vi.fn(),
    onClose: vi.fn(),
    loading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('다이얼로그가 열린 상태에서 제목과 메시지가 표시되어야 함', () => {
      render(<DeleteConfirmDialog {...mockProps} />);

      expect(screen.getByText('일정 삭제')).toBeInTheDocument();
      expect(
        screen.getByText('해당 일정만 삭제하시겠어요?')
      ).toBeInTheDocument();
      expect(
        screen.getByText('전체 반복 일정을 삭제하려면 "아니오"를 선택해주세요.')
      ).toBeInTheDocument();
    });

    it('이벤트 제목이 표시되어야 함', () => {
      render(<DeleteConfirmDialog {...mockProps} />);

      expect(screen.getByText('"팀 회의"')).toBeInTheDocument();
    });

    it('삭제 옵션 버튼들이 표시되어야 함', () => {
      render(<DeleteConfirmDialog {...mockProps} />);

      expect(screen.getByText('예 (이 일정만)')).toBeInTheDocument();
      expect(screen.getByText('아니오 (전체 반복 일정)')).toBeInTheDocument();
      expect(screen.getByText('취소')).toBeInTheDocument();
    });
  });

  describe('사용자 상호작용', () => {
    it('단일 삭제 버튼 클릭 시 onDeleteSingle이 호출되어야 함', () => {
      render(<DeleteConfirmDialog {...mockProps} />);

      fireEvent.click(screen.getByText('예 (이 일정만)'));

      expect(mockProps.onDeleteSingle).toHaveBeenCalledTimes(1);
    });

    it('전체 삭제 버튼 클릭 시 onDeleteAll이 호출되어야 함', () => {
      render(<DeleteConfirmDialog {...mockProps} />);

      fireEvent.click(screen.getByText('아니오 (전체 반복 일정)'));

      expect(mockProps.onDeleteAll).toHaveBeenCalledTimes(1);
    });

    it('취소 버튼 클릭 시 onClose가 호출되어야 함', () => {
      render(<DeleteConfirmDialog {...mockProps} />);

      fireEvent.click(screen.getByText('취소'));

      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('ESC 키 누를 시 다이얼로그가 닫혀야 함', () => {
      render(<DeleteConfirmDialog {...mockProps} />);

      const dialog = screen.getByRole('dialog');
      fireEvent.keyDown(dialog, { key: 'Escape' });

      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('로딩 상태', () => {
    it('로딩 중일 때 버튼들이 비활성화되어야 함', () => {
      render(
        <DeleteConfirmDialog
          {...mockProps}
          loading={true}
        />
      );

      expect(screen.getByText('예 (이 일정만)')).toBeDisabled();
      expect(screen.getByText('아니오 (전체 반복 일정)')).toBeDisabled();
      expect(screen.getByText('취소')).toBeDisabled();
    });

    it('로딩 중일 때 로딩 스피너가 표시되어야 함', () => {
      render(
        <DeleteConfirmDialog
          {...mockProps}
          loading={true}
        />
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  describe('접근성', () => {
    it('다이얼로그에 적절한 ARIA 속성이 설정되어야 함', () => {
      render(<DeleteConfirmDialog {...mockProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('포커스가 첫 번째 버튼으로 이동해야 함', () => {
      render(<DeleteConfirmDialog {...mockProps} />);

      expect(screen.getByText('예 (이 일정만)')).toHaveFocus();
    });
  });

  describe('닫힌 상태', () => {
    it('open이 false일 때 다이얼로그가 렌더링되지 않아야 함', () => {
      render(
        <DeleteConfirmDialog
          {...mockProps}
          open={false}
        />
      );

      expect(screen.queryByText('일정 삭제')).not.toBeInTheDocument();
    });
  });
});
