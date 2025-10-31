import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, it, expect } from 'vitest';

import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import App from '../App';

const theme = createTheme();

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

describe('반복 일정 UI 통합 테스트', () => {
  describe('반복 일정 생성 폼', () => {
    it('반복 설정 체크박스를 활성화하면 반복 유형 선택 드롭다운이 표시된다', async () => {
      // 1. Arrange: 일정 추가 모달 렌더링
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);

      // 2. Act: 반복 설정 체크박스 클릭
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);

      // 3. Assert
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      expect(repeatTypeSelect).toBeInTheDocument();
      
      // 드롭다운 열기
      await user.click(repeatTypeSelect);
      
      // 옵션 확인
      expect(screen.getByRole('option', { name: '매일' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '매주' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '매월' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: '매년' })).toBeInTheDocument();
    });

    it('반복 유형을 선택하면 종료 날짜 입력 필드가 표시된다', async () => {
      // 1. Arrange: 일정 추가 모달에서 반복 설정 활성화
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);

      // 2. Act: 반복 유형 '매일' 선택
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매일' }));

      // 3. Assert: 반복 종료 날짜 입력 필드가 표시되는지 검증
      const endDateInput = screen.getByLabelText('반복 종료 날짜');
      expect(endDateInput).toBeInTheDocument();
    });

    it('반복 종료 날짜 선택기에서 2025-12-31 이후 날짜는 선택할 수 없다', async () => {
      // 1. Arrange: 반복 일정 생성 폼에서 반복 유형 '매일' 선택
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매일' }));

      // 2. Act: 종료 날짜 선택기 확인
      const endDateInput = screen.getByLabelText('반복 종료 날짜');
      
      // 3. Assert: max 속성이 2025-12-31로 설정되어 있는지 검증
      expect(endDateInput).toHaveAttribute('max', '2025-12-31');
    });

    it('반복 종료 날짜가 시작 날짜보다 이전이면 에러 메시지가 표시된다', async () => {
      // 1. Arrange: 반복 일정 생성 폼, 시작 날짜 2025-11-15
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);
      
      await user.type(screen.getByLabelText('제목'), '테스트');
      await user.type(screen.getByLabelText('날짜'), '2025-11-15');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매일' }));

      // 2. Act: 종료 날짜를 2025-11-10으로 입력하고 저장 시도
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-11-10');
      await user.click(screen.getByTestId('event-submit-button'));

      // 3. Assert: '반복 종료 날짜는 시작 날짜 이후여야 합니다.' 에러 메시지 표시
      expect(await screen.findByText('반복 종료 날짜는 시작 날짜 이후여야 합니다.')).toBeInTheDocument();
    });

    it('반복 종료 날짜가 없으면 에러 메시지가 표시된다', async () => {
      // 1. Arrange: 반복 일정 생성 폼에서 반복 유형 '매주' 선택
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);
      
      await user.type(screen.getByLabelText('제목'), '테스트');
      await user.type(screen.getByLabelText('날짜'), '2025-11-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매주' }));

      // 2. Act: 종료 날짜를 입력하지 않고 저장 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // 3. Assert: '반복 종료 날짜를 입력해주세요.' 에러 메시지 표시
      expect(await screen.findByText('반복 종료 날짜를 입력해주세요.')).toBeInTheDocument();
    });

    it('반복 유형이 선택되지 않으면 에러 메시지가 표시된다', async () => {
      // 1. Arrange: 일정 추가 모달에서 반복 설정 체크박스만 활성화
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);
      
      await user.type(screen.getByLabelText('제목'), '테스트');
      await user.type(screen.getByLabelText('날짜'), '2025-11-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);

      // 2. Act: 반복 유형을 선택하지 않고 저장 버튼 클릭
      await user.click(screen.getByTestId('event-submit-button'));

      // 3. Assert: '반복 유형을 선택해주세요.' 에러 메시지 표시
      expect(await screen.findByText('반복 유형을 선택해주세요.')).toBeInTheDocument();
    });
  });

  describe('반복 일정 생성 동작', () => {
    it('매일 반복 일정을 생성하면 캘린더에 여러 일정이 표시된다', async () => {
      // 1. Arrange: 일정 추가 모달 열기
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);

      // 2. Act
      await user.type(screen.getByLabelText('제목'), '매일 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-11-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매일' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-11-05');
      await user.click(screen.getByTestId('event-submit-button'));

      // 3. Assert
      const eventList = within(screen.getByTestId('event-list'));
      const events = await eventList.findAllByText('매일 회의');
      expect(events).toHaveLength(5);
      
      // 각 일정에 반복 아이콘 표시 확인
      const repeatIcons = eventList.getAllByText('🔁');
      expect(repeatIcons).toHaveLength(5);
    });

    it('매주 반복 일정을 생성하면 동일한 요일에만 일정이 표시된다', async () => {
      // 1. Arrange
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);

      // 2. Act
      await user.type(screen.getByLabelText('제목'), '주간 리뷰');
      await user.type(screen.getByLabelText('날짜'), '2025-11-03'); // 월요일
      await user.type(screen.getByLabelText('시작 시간'), '14:00');
      await user.type(screen.getByLabelText('종료 시간'), '15:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매주' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-11-24');
      await user.click(screen.getByTestId('event-submit-button'));

      // 3. Assert
      const eventList = within(screen.getByTestId('event-list'));
      const events = await eventList.findAllByText('주간 리뷰');
      expect(events).toHaveLength(4);
      
      // 11-03, 11-10, 11-17, 11-24 확인
      expect(eventList.getByText('2025-11-03')).toBeInTheDocument();
      expect(eventList.getByText('2025-11-10')).toBeInTheDocument();
      expect(eventList.getByText('2025-11-17')).toBeInTheDocument();
      expect(eventList.getByText('2025-11-24')).toBeInTheDocument();
    });

    it('매월 반복 일정을 생성하면 동일한 일(日)에만 일정이 표시된다', async () => {
      // 1. Arrange
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);

      // 2. Act
      await user.type(screen.getByLabelText('제목'), '월간 보고');
      await user.type(screen.getByLabelText('날짜'), '2025-11-15');
      await user.type(screen.getByLabelText('시작 시간'), '09:00');
      await user.type(screen.getByLabelText('종료 시간'), '10:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매월' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-12-31');
      await user.click(screen.getByTestId('event-submit-button'));

      // 3. Assert
      const eventList = within(screen.getByTestId('event-list'));
      const events = await eventList.findAllByText('월간 보고');
      expect(events).toHaveLength(2);
      
      expect(eventList.getByText('2025-11-15')).toBeInTheDocument();
      expect(eventList.getByText('2025-12-15')).toBeInTheDocument();
    });

    it('매년 반복 일정을 생성하면 동일한 월/일에만 일정이 표시된다', async () => {
      // 1. Arrange
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);

      // 2. Act
      await user.type(screen.getByLabelText('제목'), '연례 행사');
      await user.type(screen.getByLabelText('날짜'), '2024-11-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '12:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매년' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-12-31');
      await user.click(screen.getByTestId('event-submit-button'));

      // 3. Assert
      const eventList = within(screen.getByTestId('event-list'));
      const events = await eventList.findAllByText('연례 행사');
      expect(events).toHaveLength(2);
      
      expect(eventList.getByText('2024-11-01')).toBeInTheDocument();
      expect(eventList.getByText('2025-11-01')).toBeInTheDocument();
    });

    it('반복 일정은 일정 겹침 경고가 표시되지 않는다', async () => {
      // 1. Arrange: 2025-11-01 10:00-11:00에 기존 일정 존재
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      
      // 먼저 단일 일정 생성
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '기존 일정');
      await user.type(screen.getByLabelText('날짜'), '2025-11-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      await user.click(screen.getByTestId('event-submit-button'));

      // 2. Act: 겹치는 시간에 반복 일정 생성
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '반복 일정');
      await user.type(screen.getByLabelText('날짜'), '2025-11-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매일' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-11-05');
      await user.click(screen.getByTestId('event-submit-button'));

      // 3. Assert: 일정 겹침 경고 모달이 표시되지 않음
      expect(screen.queryByText('일정 겹침 경고')).not.toBeInTheDocument();
      
      // 반복 일정이 정상적으로 생성됨
      const eventList = within(screen.getByTestId('event-list'));
      expect(await eventList.findAllByText('반복 일정')).toHaveLength(5);
    });
  });

  describe('반복 일정 아이콘 표시', () => {
    it('월간 뷰에서 반복 일정에 반복 아이콘이 표시된다', async () => {
      // 1. Arrange: 반복 유형 'weekly'인 일정이 캘린더에 존재
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '주간 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-11-03');
      await user.type(screen.getByLabelText('시작 시간'), '14:00');
      await user.type(screen.getByLabelText('종료 시간'), '15:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매주' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-11-10');
      await user.click(screen.getByTestId('event-submit-button'));

      // 2. Act: 월간 캘린더 뷰 확인 (기본 뷰)
      // 3. Assert: 해당 일정 제목 앞에 🔁 아이콘이 표시되는지 검증
      const monthView = screen.getByTestId('month-view');
      expect(within(monthView).getAllByText('🔁')).toHaveLength(2);
    });

    it('주간 뷰에서 반복 일정에 반복 아이콘이 표시된다', async () => {
      // 1. Arrange: 반복 유형 'daily'인 일정이 캘린더에 존재
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '매일 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-10-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매일' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-10-07');
      await user.click(screen.getByTestId('event-submit-button'));

      // 2. Act: 주간 캘린더 뷰로 전환
      await user.click(within(screen.getByLabelText('뷰 타입 선택')).getByRole('combobox'));
      await user.click(screen.getByRole('option', { name: 'week-option' }));

      // 3. Assert
      const weekView = await screen.findByTestId('week-view');
      const repeatIcons = within(weekView).getAllByText('🔁');
      expect(repeatIcons.length).toBeGreaterThan(0);
    });

    it('단일 일정에는 반복 아이콘이 표시되지 않는다', async () => {
      // 1. Arrange: repeat.type이 'none'인 단일 일정이 캘린더에 존재
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '단일 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-10-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      await user.click(screen.getByTestId('event-submit-button'));

      // 2. Act: 월간 또는 주간 캘린더 뷰 확인
      // 3. Assert: 🔁 아이콘이 표시되지 않는지 검증
      const monthView = screen.getByTestId('month-view');
      expect(within(monthView).queryByText('🔁')).not.toBeInTheDocument();
    });

    it('반복 일정을 단일 일정으로 수정하면 반복 아이콘이 제거된다', async () => {
      // 1. Arrange: 반복 일정이 캘린더에 존재
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '반복 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-10-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매일' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-10-03');
      await user.click(screen.getByTestId('event-submit-button'));

      // 2. Act: 일정 수정 - 단일 일정으로 변경
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);
      
      // 모달에서 '예' 선택 (단일 일정만 수정)
      await user.click(screen.getByRole('button', { name: '예' }));
      
      // 제목 수정
      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '수정된 회의');
      await user.click(screen.getByTestId('event-submit-button'));

      // 3. Assert: 수정된 일정에서 🔁 아이콘이 제거되었는지 검증
      const eventList = within(screen.getByTestId('event-list'));
      const modifiedEvent = eventList.getByText('수정된 회의');
      const modifiedEventRow = modifiedEvent.closest('tr');
      expect(within(modifiedEventRow!).queryByText('🔁')).not.toBeInTheDocument();
    });
  });

  describe('반복 일정 수정 모달', () => {
    it('반복 일정 수정 버튼 클릭 시 확인 모달이 표시된다', async () => {
      // 1. Arrange: 반복 일정이 캘린더에 존재
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '반복 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-10-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매일' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-10-03');
      await user.click(screen.getByTestId('event-submit-button'));

      // 2. Act: 반복 일정의 수정 버튼 클릭
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);

      // 3. Assert
      expect(await screen.findByText('해당 일정만 수정하시겠어요?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '예' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '아니오' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });

    it('단일 일정 수정 버튼 클릭 시 확인 모달이 표시되지 않는다', async () => {
      // 1. Arrange: repeat.type이 'none'인 단일 일정이 캘린더에 존재
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '단일 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-10-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      await user.click(screen.getByTestId('event-submit-button'));

      // 2. Act: 단일 일정의 수정 버튼 클릭
      const editButton = await screen.findByLabelText('Edit event');
      await user.click(editButton);

      // 3. Assert
      expect(screen.queryByText('해당 일정만 수정하시겠어요?')).not.toBeInTheDocument();
      expect(screen.getByLabelText('제목')).toBeInTheDocument();
    });

    it('수정 모달에서 예 선택 시 해당 일정만 수정된다', async () => {
      // 1. Arrange: 매주 반복으로 4개의 일정이 생성되어 있음
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '주간 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-11-03');
      await user.type(screen.getByLabelText('시작 시간'), '14:00');
      await user.type(screen.getByLabelText('종료 시간'), '15:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매주' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-11-24');
      await user.click(screen.getByTestId('event-submit-button'));

      // 2. Act
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[1]); // 두 번째 일정
      
      await user.click(screen.getByRole('button', { name: '예' }));
      
      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '수정된 제목');
      await user.click(screen.getByTestId('event-submit-button'));

      // 3. Assert
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getByText('수정된 제목')).toBeInTheDocument();
      expect(eventList.getAllByText('주간 회의')).toHaveLength(3);
      
      // 수정된 일정의 repeat.type이 'none'으로 변경되었는지 확인
      const modifiedEvent = eventList.getByText('수정된 제목');
      const modifiedEventRow = modifiedEvent.closest('tr');
      expect(within(modifiedEventRow!).queryByText('🔁')).not.toBeInTheDocument();
    });

    it('수정 모달에서 아니오 선택 시 전체 반복 일정이 수정된다', async () => {
      // 1. Arrange: 매주 반복으로 4개의 일정이 생성되어 있음
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '주간 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-11-03');
      await user.type(screen.getByLabelText('시작 시간'), '14:00');
      await user.type(screen.getByLabelText('종료 시간'), '15:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매주' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-11-24');
      await user.click(screen.getByTestId('event-submit-button'));

      // 2. Act
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);
      
      await user.click(screen.getByRole('button', { name: '아니오' }));
      
      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '전체 수정');
      await user.click(screen.getByTestId('event-submit-button'));

      // 3. Assert
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getAllByText('전체 수정')).toHaveLength(4);
      expect(eventList.queryByText('주간 회의')).not.toBeInTheDocument();
      
      // 모든 일정의 반복 아이콘 유지 확인
      expect(eventList.getAllByText('🔁')).toHaveLength(4);
    });

    it('수정 모달에서 취소 선택 시 모달이 닫히고 수정되지 않는다', async () => {
      // 1. Arrange: 반복 일정이 캘린더에 존재
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '반복 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-10-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매일' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-10-03');
      await user.click(screen.getByTestId('event-submit-button'));

      // 2. Act
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);
      
      await user.click(screen.getByRole('button', { name: '취소' }));

      // 3. Assert
      expect(screen.queryByText('해당 일정만 수정하시겠어요?')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('제목')).not.toBeInTheDocument();
      
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getAllByText('반복 회의')).toHaveLength(3);
    });

    it('단일 수정된 일정을 다시 수정할 때는 모달이 표시되지 않는다', async () => {
      // 1. Arrange: 반복 일정 중 하나를 단일 수정하여 repeat.type을 'none'으로 변경
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '반복 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-10-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매일' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-10-03');
      await user.click(screen.getByTestId('event-submit-button'));
      
      // 첫 번째 일정을 단일 수정
      const editButtons = await screen.findAllByLabelText('Edit event');
      await user.click(editButtons[0]);
      await user.click(screen.getByRole('button', { name: '예' }));
      
      const titleInput = screen.getByLabelText('제목');
      await user.clear(titleInput);
      await user.type(titleInput, '단일 수정됨');
      await user.click(screen.getByTestId('event-submit-button'));

      // 2. Act: 해당 일정의 수정 버튼 다시 클릭
      const singleEventEdit = screen.getAllByLabelText('Edit event')[0];
      await user.click(singleEventEdit);

      // 3. Assert
      expect(screen.queryByText('해당 일정만 수정하시겠어요?')).not.toBeInTheDocument();
      expect(screen.getByLabelText('제목')).toHaveValue('단일 수정됨');
    });
  });

  describe('반복 일정 삭제 모달', () => {
    it('반복 일정 삭제 버튼 클릭 시 확인 모달이 표시된다', async () => {
      // 1. Arrange: 반복 일정이 캘린더에 존재
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '반복 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-10-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매일' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-10-03');
      await user.click(screen.getByTestId('event-submit-button'));

      // 2. Act: 반복 일정의 삭제 버튼 클릭
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);

      // 3. Assert
      expect(await screen.findByText('해당 일정만 삭제하시겠어요?')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '예' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '아니오' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });

    it('단일 일정 삭제 버튼 클릭 시 확인 모달 없이 바로 삭제된다', async () => {
      // 1. Arrange: repeat.type이 'none'인 단일 일정이 캘린더에 존재
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '단일 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-10-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      await user.click(screen.getByTestId('event-submit-button'));

      // 2. Act: 단일 일정의 삭제 버튼 클릭
      const deleteButton = await screen.findByLabelText('Delete event');
      await user.click(deleteButton);

      // 3. Assert
      expect(screen.queryByText('해당 일정만 삭제하시겠어요?')).not.toBeInTheDocument();
      
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.queryByText('단일 회의')).not.toBeInTheDocument();
    });

    it('삭제 모달에서 예 선택 시 해당 일정만 삭제된다', async () => {
      // 1. Arrange: 매일 반복으로 5개의 일정이 생성되어 있음 (11-01 ~ 11-05)
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '매일 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-11-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매일' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-11-05');
      await user.click(screen.getByTestId('event-submit-button'));

      // 2. Act: 11-03 일정의 삭제 버튼 클릭
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[2]); // 세 번째 일정 (11-03)
      
      await user.click(screen.getByRole('button', { name: '예' }));

      // 3. Assert
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getAllByText('매일 회의')).toHaveLength(4);
      expect(eventList.queryByText('2025-11-03')).not.toBeInTheDocument();
    });

    it('삭제 모달에서 아니오 선택 시 전체 반복 일정이 삭제된다', async () => {
      // 1. Arrange: 매주 반복으로 4개의 일정이 생성되어 있음
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '주간 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-11-03');
      await user.type(screen.getByLabelText('시작 시간'), '14:00');
      await user.type(screen.getByLabelText('종료 시간'), '15:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매주' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-11-24');
      await user.click(screen.getByTestId('event-submit-button'));

      // 2. Act: 첫 번째 일정의 삭제 버튼 클릭
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);
      
      await user.click(screen.getByRole('button', { name: '아니오' }));

      // 3. Assert
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.queryByText('주간 회의')).not.toBeInTheDocument();
      expect(eventList.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    });

    it('삭제 모달에서 취소 선택 시 모달이 닫히고 삭제되지 않는다', async () => {
      // 1. Arrange: 반복 일정이 캘린더에 존재
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '반복 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-10-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매일' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-10-03');
      await user.click(screen.getByTestId('event-submit-button'));

      // 2. Act
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);
      
      await user.click(screen.getByRole('button', { name: '취소' }));

      // 3. Assert
      expect(screen.queryByText('해당 일정만 삭제하시겠어요?')).not.toBeInTheDocument();
      
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getAllByText('반복 회의')).toHaveLength(3);
    });
  });

  describe('엣지 케이스 및 에러 처리', () => {
    it('31일 매월 반복 일정 생성 시 31일이 없는 달은 건너뛴다', async () => {
      // 1. Arrange: 일정 추가 모달 열기
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);

      // 2. Act
      await user.type(screen.getByLabelText('제목'), '월말 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-10-31');
      await user.type(screen.getByLabelText('시작 시간'), '17:00');
      await user.type(screen.getByLabelText('종료 시간'), '18:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매월' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-12-31');
      await user.click(screen.getByTestId('event-submit-button'));

      // 3. Assert
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getAllByText('월말 회의')).toHaveLength(2);
      expect(eventList.getByText('2025-10-31')).toBeInTheDocument();
      expect(eventList.getByText('2025-12-31')).toBeInTheDocument();
      expect(eventList.queryByText('2025-11-31')).not.toBeInTheDocument();
    });

    it('윤년 2월 29일 매년 반복 일정 생성 시 윤년에만 생성된다', async () => {
      // 1. Arrange: 일정 추가 모달 열기
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);

      // 2. Act
      await user.type(screen.getByLabelText('제목'), '윤년 기념일');
      await user.type(screen.getByLabelText('날짜'), '2024-02-29');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매년' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2028-02-29');
      await user.click(screen.getByTestId('event-submit-button'));

      // 3. Assert
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getAllByText('윤년 기념일')).toHaveLength(2);
      expect(eventList.getByText('2024-02-29')).toBeInTheDocument();
      expect(eventList.getByText('2028-02-29')).toBeInTheDocument();
      // 2025, 2026, 2027년 확인
      expect(eventList.queryByText('2025-02-29')).not.toBeInTheDocument();
      expect(eventList.queryByText('2026-02-29')).not.toBeInTheDocument();
      expect(eventList.queryByText('2027-02-29')).not.toBeInTheDocument();
    });

    it('반복 일정 생성 중 서버 오류 시 에러 메시지가 표시된다', async () => {
      // 1. Arrange: 서버가 500 에러를 반환하도록 설정
      // Note: MSW handler를 통해 서버 에러 시뮬레이션 필요
      const { user } = setup(<App />);
      await user.click(screen.getAllByText('일정 추가')[0]);

      // 2. Act: 반복 일정 데이터 입력 후 저장 버튼 클릭
      await user.type(screen.getByLabelText('제목'), '테스트');
      await user.type(screen.getByLabelText('날짜'), '2025-11-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매일' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-11-05');
      await user.click(screen.getByTestId('event-submit-button'));

      // 3. Assert: '일정 저장에 실패했습니다. 다시 시도해주세요.' 에러 메시지 표시
      expect(
        await screen.findByText('일정 저장에 실패했습니다. 다시 시도해주세요.')
      ).toBeInTheDocument();
    });

    it('반복 일정 삭제 중 네트워크 오류 시 에러 메시지가 표시된다', async () => {
      // 1. Arrange: 네트워크 오류를 시뮬레이션하도록 설정, 반복 일정이 캘린더에 존재
      setupMockHandlerCreation();
      const { user } = setup(<App />);
      
      await user.click(screen.getAllByText('일정 추가')[0]);
      await user.type(screen.getByLabelText('제목'), '반복 회의');
      await user.type(screen.getByLabelText('날짜'), '2025-10-01');
      await user.type(screen.getByLabelText('시작 시간'), '10:00');
      await user.type(screen.getByLabelText('종료 시간'), '11:00');
      
      const repeatCheckbox = screen.getByLabelText('반복 일정');
      await user.click(repeatCheckbox);
      
      const repeatTypeSelect = screen.getByLabelText('반복 유형');
      await user.click(repeatTypeSelect);
      await user.click(screen.getByRole('option', { name: '매일' }));
      
      await user.type(screen.getByLabelText('반복 종료 날짜'), '2025-10-03');
      await user.click(screen.getByTestId('event-submit-button'));

      // 2. Act: 전체 반복 일정 삭제 시도 (모달에서 '아니오' 선택)
      const deleteButtons = await screen.findAllByLabelText('Delete event');
      await user.click(deleteButtons[0]);
      await user.click(screen.getByRole('button', { name: '아니오' }));

      // 3. Assert
      expect(
        await screen.findByText('일정 삭제에 실패했습니다. 네트워크 연결을 확인해주세요.')
      ).toBeInTheDocument();
      
      // 일정이 삭제되지 않고 유지되는지 검증
      const eventList = within(screen.getByTestId('event-list'));
      expect(eventList.getAllByText('반복 회의')).toHaveLength(3);
    });
  });
});
