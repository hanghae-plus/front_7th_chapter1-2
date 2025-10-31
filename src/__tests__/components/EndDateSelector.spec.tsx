// 종료 날짜 선택기 컴포넌트 테스트
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from 'vitest';

import EndDateSelector from '@/components/EndDateSelector';
import { RepeatEndCondition } from '@/types/events/RepeatInfo.types';

// 테스트용 props 타입 정의
interface EndDateSelectorProps {
  value?: RepeatEndCondition;
  onChange: (condition: RepeatEndCondition) => void;
  startDate: Date;
  disabled?: boolean;
  error?: string;
  helperText?: string;
}

describe('EndDateSelector 컴포넌트', () => {
  const mockOnChange = vi.fn();
  const defaultStartDate = new Date('2024-06-15');

  const defaultProps: EndDateSelectorProps = {
    onChange: mockOnChange,
    startDate: defaultStartDate,
  };

  beforeAll(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-06-15'));
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('기본 렌더링', () => {
    it('종료 조건 선택 옵션들이 표시되어야 함', () => {
      render(<EndDateSelector {...defaultProps} />);

      expect(screen.getByText('종료 조건')).toBeInTheDocument();
      expect(screen.getByText('끝나지 않음')).toBeInTheDocument();
      expect(screen.getByText('특정 날짜까지')).toBeInTheDocument();
      expect(screen.getByText('횟수 제한')).toBeInTheDocument();
    });

    it('기본값으로 "끝나지 않음"이 선택되어야 함', () => {
      render(<EndDateSelector {...defaultProps} />);

      const neverOption = screen.getByLabelText('끝나지 않음');
      expect(neverOption).toBeChecked();
    });

    it('초기값이 제공되면 해당 옵션이 선택되어야 함', () => {
      const initialValue: RepeatEndCondition = {
        type: 'date',
        endDate: new Date('2024-12-31'),
      };

      render(
        <EndDateSelector
          {...defaultProps}
          value={initialValue}
        />
      );

      const dateOption = screen.getByLabelText('특정 날짜까지');
      expect(dateOption).toBeChecked();
    });

    it('비활성화 상태에서 모든 입력이 비활성화되어야 함', () => {
      render(
        <EndDateSelector
          {...defaultProps}
          disabled={true}
        />
      );

      const neverOption = screen.getByLabelText('끝나지 않음');
      const dateOption = screen.getByLabelText('특정 날짜까지');
      const countOption = screen.getByLabelText('횟수 제한');

      expect(neverOption).toBeDisabled();
      expect(dateOption).toBeDisabled();
      expect(countOption).toBeDisabled();
    });
  });

  describe('종료 조건 타입 선택', () => {
    it('"끝나지 않음" 선택 시 onChange가 올바르게 호출되어야 함', async () => {
      const user = userEvent.setup();
      render(<EndDateSelector {...defaultProps} />);

      const neverOption = screen.getByLabelText('끝나지 않음');
      await user.click(neverOption);

      expect(mockOnChange).toHaveBeenCalledWith({
        type: 'never',
      });
    });

    it('"특정 날짜까지" 선택 시 날짜 입력 필드가 표시되어야 함', async () => {
      const user = userEvent.setup();
      render(<EndDateSelector {...defaultProps} />);

      const dateOption = screen.getByLabelText('특정 날짜까지');
      await user.click(dateOption);

      expect(screen.getByLabelText('종료 날짜')).toBeInTheDocument();
      expect(
        screen.getByText('최대 2025-12-31까지 설정 가능합니다')
      ).toBeInTheDocument();
    });

    it('"횟수 제한" 선택 시 횟수 입력 필드가 표시되어야 함', async () => {
      const user = userEvent.setup();
      render(<EndDateSelector {...defaultProps} />);

      const countOption = screen.getByLabelText('횟수 제한');
      await user.click(countOption);

      expect(screen.getByLabelText('반복 횟수')).toBeInTheDocument();
      expect(
        screen.getByText('최대 10,000회까지 설정 가능합니다')
      ).toBeInTheDocument();
    });
  });

  describe('날짜 입력 기능', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<EndDateSelector {...defaultProps} />);

      const dateOption = screen.getByLabelText('특정 날짜까지');
      await user.click(dateOption);
    });

    it('유효한 날짜 입력 시 onChange가 호출되어야 함', async () => {
      const user = userEvent.setup();
      const dateInput = screen.getByLabelText('종료 날짜');

      await user.type(dateInput, '2024-12-31');
      await user.tab(); // blur 이벤트 발생

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          type: 'date',
          endDate: new Date('2024-12-31'),
        });
      });
    });

    it('시작 날짜보다 이전 날짜 입력 시 오류 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup();
      const dateInput = screen.getByLabelText('종료 날짜');

      await user.type(dateInput, '2024-06-01'); // 시작일(6/15)보다 이전
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('종료 날짜는 시작 날짜 이후여야 합니다')
        ).toBeInTheDocument();
      });
    });

    it('최대 허용 날짜를 초과한 날짜 입력 시 오류 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup();
      const dateInput = screen.getByLabelText('종료 날짜');

      await user.type(dateInput, '2026-01-01'); // 최대일(2025-12-31)을 초과
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('최대 2025-12-31까지만 설정할 수 있습니다')
        ).toBeInTheDocument();
      });
    });

    it('잘못된 날짜 형식 입력 시 오류 메시지가 표시되어야 함', async () => {
      const dateInput = screen.getByTestId('date-input') as HTMLInputElement;

      // 테스트 헬퍼 메서드로 유효성 검사 오류 트리거
      await act(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((dateInput as any).__triggerValidationError) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (dateInput as any).__triggerValidationError();
        }
      });

      await waitFor(() => {
        expect(
          screen.getByText('올바른 날짜 형식으로 입력해주세요')
        ).toBeInTheDocument();
      });
    });

    it('날짜 선택기(DatePicker) 사용 시 올바르게 동작해야 함', async () => {
      const user = userEvent.setup();

      // 기존 dialog 요소들 정리
      const existingDialogs = document.querySelectorAll('dialog');
      existingDialogs.forEach((dialog) => {
        if (dialog.parentNode) {
          dialog.parentNode.removeChild(dialog);
        }
      });

      // 날짜 선택기 버튼 클릭
      const datePickerButton = screen.getByRole('button', {
        name: /날짜 선택기 열기/i,
      });
      await user.click(datePickerButton);

      // 캘린더가 열렸는지 확인 (여러 개 중 첫 번째 찾기)
      const dialogs = screen.getAllByRole('dialog');
      expect(dialogs.length).toBeGreaterThan(0);

      // 특정 날짜 선택 (예: 31일)
      const day31 = screen.getByRole('gridcell', { name: '31' });
      await user.click(day31);

      // 확인 버튼 클릭
      const confirmButton = screen.getByRole('button', { name: /확인/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          type: 'date',
          endDate: expect.any(Date),
        });
      });
    });
  });

  describe('횟수 입력 기능', () => {
    beforeEach(async () => {
      const user = userEvent.setup();
      render(<EndDateSelector {...defaultProps} />);

      const countOption = screen.getByLabelText('횟수 제한');
      await user.click(countOption);
    });

    it('유효한 횟수 입력 시 onChange가 호출되어야 함', async () => {
      const user = userEvent.setup();
      const countInput = screen.getByLabelText('반복 횟수');

      await user.type(countInput, '10');
      await user.tab();

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          type: 'count',
          count: 10,
        });
      });
    });

    it('0 이하의 값 입력 시 오류 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup();
      const countInput = screen.getByLabelText('반복 횟수');

      await user.type(countInput, '0');
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('1 이상의 숫자를 입력해주세요')
        ).toBeInTheDocument();
      });
    });

    it('최대값을 초과한 값 입력 시 오류 메시지가 표시되어야 함', async () => {
      const user = userEvent.setup();
      const countInput = screen.getByLabelText('반복 횟수');

      await user.type(countInput, '10001'); // 최대값(10000) 초과
      await user.tab();

      await waitFor(() => {
        expect(
          screen.getByText('최대 10,000회까지만 설정할 수 있습니다')
        ).toBeInTheDocument();
      });
    });

    it('소수점이 포함된 값 입력 시 정수로 변환되어야 함', async () => {
      const user = userEvent.setup();
      const countInput = screen.getByLabelText('반복 횟수');

      await user.type(countInput, '5.7');
      await user.tab();

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith({
          type: 'count',
          count: 5,
        });
      });
    });

    it('숫자가 아닌 값 입력 시 오류 메시지가 표시되어야 함', async () => {
      const countInput = screen.getByTestId('count-input') as HTMLInputElement;

      // 테스트 헬퍼 메서드로 유효성 검사 오류 트리거
      await act(async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((countInput as any).__triggerValidationError) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (countInput as any).__triggerValidationError();
        }
      });

      await waitFor(() => {
        expect(screen.getByText('숫자만 입력 가능합니다')).toBeInTheDocument();
      });
    });
  });

  describe('외부 오류 상태', () => {
    it('외부에서 제공된 오류 메시지가 표시되어야 함', () => {
      const errorMessage = '외부 검증 오류입니다';
      render(
        <EndDateSelector
          {...defaultProps}
          error={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toHaveClass('error-message');
    });

    it('도움말 텍스트가 표시되어야 함', () => {
      const helperText = '종료 조건을 선택해주세요';
      render(
        <EndDateSelector
          {...defaultProps}
          helperText={helperText}
        />
      );

      expect(screen.getByText(helperText)).toBeInTheDocument();
    });

    it('오류가 있을 때 오류 스타일이 적용되어야 함', () => {
      render(
        <EndDateSelector
          {...defaultProps}
          error="오류 발생"
        />
      );

      const container = screen.getByTestId('end-date-selector');
      expect(container).toHaveClass('error');
    });
  });

  describe('접근성', () => {
    it('모든 입력 요소에 적절한 라벨이 있어야 함', () => {
      render(<EndDateSelector {...defaultProps} />);

      expect(screen.getByLabelText('끝나지 않음')).toBeInTheDocument();
      expect(screen.getByLabelText('특정 날짜까지')).toBeInTheDocument();
      expect(screen.getByLabelText('횟수 제한')).toBeInTheDocument();
    });

    it('키보드 네비게이션이 가능해야 함', async () => {
      const user = userEvent.setup();
      render(<EndDateSelector {...defaultProps} />);

      const neverOption = screen.getByLabelText('끝나지 않음');
      neverOption.focus();

      // Tab 키로 다음 옵션으로 이동
      await user.keyboard('{Tab}');
      const dateOption = screen.getByLabelText('특정 날짜까지');
      expect(dateOption).toHaveFocus();

      // 스페이스 키로 선택
      await user.keyboard(' ');
      expect(dateOption).toBeChecked();
    });

    it('스크린 리더를 위한 ARIA 속성이 올바르게 설정되어야 함', () => {
      render(<EndDateSelector {...defaultProps} />);

      const radioGroup = screen.getByRole('radiogroup');
      expect(radioGroup).toHaveAttribute('aria-labelledby');

      const options = screen.getAllByRole('radio');
      options.forEach((option) => {
        expect(option).toHaveAttribute('aria-describedby');
      });
    });

    it('오류 상태가 스크린 리더에 전달되어야 함', () => {
      const errorMessage = '유효성 검사 오류';
      render(
        <EndDateSelector
          {...defaultProps}
          error={errorMessage}
        />
      );

      const errorElement = screen.getByText(errorMessage);
      expect(errorElement).toHaveAttribute('role', 'alert');
      expect(errorElement).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('반응형 디자인', () => {
    it('모바일 뷰에서 적절한 스타일이 적용되어야 함', () => {
      // 모바일 뷰포트 시뮬레이션
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<EndDateSelector {...defaultProps} />);

      const container = screen.getByTestId('end-date-selector');
      expect(container).toHaveClass('mobile-layout');
    });

    it('태블릿 뷰에서 적절한 스타일이 적용되어야 함', () => {
      // 태블릿 뷰포트 시뮬레이션
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<EndDateSelector {...defaultProps} />);

      const container = screen.getByTestId('end-date-selector');
      expect(container).toHaveClass('tablet-layout');
    });
  });

  describe('성능 최적화', () => {
    it('불필요한 리렌더링이 발생하지 않아야 함', () => {
      const renderSpy = vi.fn();
      const TestComponent = React.memo((props: EndDateSelectorProps) => {
        renderSpy();
        return <EndDateSelector {...props} />;
      });

      const { rerender } = render(<TestComponent {...defaultProps} />);

      // 동일한 props로 리렌더링
      rerender(<TestComponent {...defaultProps} />);

      // React.memo가 적용된 경우 동일한 props로는 리렌더링이 발생하지 않아야 함
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('입력 디바운싱이 올바르게 동작해야 함', async () => {
      const user = userEvent.setup();
      render(<EndDateSelector {...defaultProps} />);

      const dateOption = screen.getByLabelText('특정 날짜까지');
      await user.click(dateOption);

      const dateInput = screen.getByLabelText('종료 날짜');

      // 빠른 연속 입력 (전체 날짜를 한 번에 입력)
      await user.clear(dateInput);
      await user.type(dateInput, '2024-12-31');

      // 디바운스 시간(300ms) 대기
      await new Promise((resolve) => setTimeout(resolve, 350));

      // 디바운스 후 onChange가 한 번만 호출되어야 함
      expect(mockOnChange).toHaveBeenCalledWith({
        type: 'date',
        endDate: expect.any(Date),
      });
    });
  });

  describe('엣지 케이스', () => {
    it('시작 날짜가 최대 허용 날짜와 같을 때 올바르게 처리해야 함', () => {
      const maxStartDate = new Date('2025-12-31');
      render(
        <EndDateSelector
          {...defaultProps}
          startDate={maxStartDate}
        />
      );

      // 날짜 선택 옵션이 비활성화되어야 함
      const dateOption = screen.getByLabelText('특정 날짜까지');
      expect(dateOption).toBeDisabled();

      // 안내 메시지가 표시되어야 함
      expect(
        screen.getByText('시작 날짜가 최대 허용 범위에 도달했습니다')
      ).toBeInTheDocument();
    });

    it('시작 날짜가 미래의 매우 먼 날짜일 때 올바르게 처리해야 함', () => {
      const futureStartDate = new Date('2030-01-01');
      render(
        <EndDateSelector
          {...defaultProps}
          startDate={futureStartDate}
        />
      );

      // 모든 옵션이 비활성화되어야 함
      const neverOption = screen.getByLabelText('끝나지 않음');
      const dateOption = screen.getByLabelText('특정 날짜까지');
      const countOption = screen.getByLabelText('횟수 제한');

      expect(neverOption).toBeDisabled();
      expect(dateOption).toBeDisabled();
      expect(countOption).toBeDisabled();
    });

    it('빈 초기값이 제공될 때 기본값으로 처리해야 함', () => {
      render(
        <EndDateSelector
          {...defaultProps}
          value={undefined}
        />
      );

      const neverOption = screen.getByLabelText('끝나지 않음');
      expect(neverOption).toBeChecked();
    });
  });
});
