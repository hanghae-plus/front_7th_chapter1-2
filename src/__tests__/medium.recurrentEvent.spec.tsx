import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';

import { setupMockHandlerCreation } from '../__mocks__/handlersUtils';
import App from '../App';
import { server } from '../setupTests';
import { Event } from '../types';

const theme = createTheme();
// ! Hard 여기 제공 안함
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

describe('반복 종료 조건', () => {
  // RED: non-yearly(매일/매주/매월) 반복 종료일은 해당 년의 말일이어야 한다
  it('[RED] 매일 반복 저장 시 종료일이 해당 년의 말일(2025-12-31)로 지정된다', async () => {
    vi.setSystemTime(new Date('2025-10-01'));
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // 폼 열기 및 입력
    await user.click(screen.getAllByText('일정 추가')[0]);
    await user.type(screen.getByLabelText('제목'), '종료일 강제 이벤트');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '반복 종료일 테스트');
    await user.type(screen.getByLabelText('위치'), '회의실 A');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));

    // 반복 설정 (repeatType 기본 daily)
    await user.click(screen.getByLabelText('반복 일정'));

    // 종료일은 설정하지 않음 -> 저장 시 해당 연말로 지정되어야 함
    await user.click(screen.getByTestId('event-submit-button'));

    // 우측 리스트에서 종료일 텍스트가 렌더되는지 확인 (동일 제목 다중 발생 고려)
    const eventList = within(await screen.findByTestId('event-list'));
    const endDateNodes = eventList.getAllByText(/\(종료: 2025-12-31\)/);
    expect(endDateNodes.length).toBeGreaterThan(0);
  });
});
describe('반복 일정 단일 수정', () => {
  // RED: "해당 일정만 수정"을 선택하면 해당 발생에만 반복 아이콘이 사라져야 한다
  it('[RED] 단일 발생만 수정 시 그 날만 반복 아이콘이 사라진다', async () => {
    setupMockHandlerCreation();

    const { user } = setup(<App />);

    // 반복 일정 생성
    await user.click(screen.getAllByText('일정 추가')[0]);
    await user.type(screen.getByLabelText('제목'), '단일 수정 이벤트');
    await user.type(screen.getByLabelText('날짜'), '2025-10-15');
    await user.type(screen.getByLabelText('시작 시간'), '10:00');
    await user.type(screen.getByLabelText('종료 시간'), '11:00');
    await user.type(screen.getByLabelText('설명'), '단일 수정 테스트');
    await user.type(screen.getByLabelText('위치'), '회의실 A');
    await user.click(screen.getByLabelText('카테고리'));
    await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
    await user.click(screen.getByRole('option', { name: '업무-option' }));
    await user.click(screen.getByLabelText('반복 일정'));
    await user.click(screen.getByTestId('event-submit-button'));

    // 우측 리스트에서 해당 카드의 타이틀로 카드 영역을 특정한 뒤, 그 카드에 속한 편집 버튼 클릭
    const eventList = within(screen.getByTestId('event-list'));
    const titleNode = eventList.getAllByText('단일 수정 이벤트')[0];
    let container: HTMLElement | null = titleNode as HTMLElement;
    let editBtn: HTMLElement | null = null;
    for (let i = 0; i < 10 && container; i++) {
      const candidate = within(container).queryByLabelText('Edit event');
      if (candidate) {
        editBtn = candidate as HTMLElement;
        break;
      }
      container = container.parentElement as HTMLElement | null;
    }
    expect(editBtn).not.toBeNull();
    await user.click(editBtn!);

    // // 기대: 다이얼로그 표시 후 '예' 클릭
    // await screen.findByText('해당 일정만 수정하시겠어요?');
    // await user.click(screen.getByText('예'));
    // 2) 다이얼로그가 열릴 때까지 대기
    const dialog = await screen.findByRole('dialog', { hidden: true });

    // 3) 다이얼로그 내부 텍스트 확인
    await within(dialog).findByText(/해당 일정만 수정하시겠어요\??/);
    await user.click(within(dialog).getByText('예'));

    // 제목 입력 필드가 상호작용 가능해질 때까지 대기 후 수정
    const titleInput = await screen.findByLabelText('제목');
    await user.click(titleInput);
    await user.clear(titleInput);
    await user.type(titleInput, '단일 수정 이벤트 (수정)');
    await user.click(screen.getByTestId('event-submit-button'));

    // 저장 성공 토스트가 뜰 때까지 대기
    // await screen.findByText('일정이 추가되었습니다.');

    // 뷰 전환 없이 우측 리스트에서 직접 검증 (동일 제목 다중 발생 고려)
    const eventListAfterEdit = within(screen.getByTestId('event-list'));
    await eventListAfterEdit.findAllByText('단일 수정 이벤트 (수정)');
    const editedTitles = eventListAfterEdit.getAllByText('단일 수정 이벤트 (수정)');
    editedTitles.forEach((node) => {
      expect(within(node.closest('div')!).queryByTestId('repeat-icon')).toBeNull();
    });
    const otherTitles = eventListAfterEdit.getAllByText('단일 수정 이벤트');
    otherTitles.forEach((node) => {
      expect(within(node.closest('div')!).getByTestId('repeat-icon')).toBeInTheDocument();
    });
  });
});
