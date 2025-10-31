import { screen, within } from '@testing-library/react';
import { UserEvent } from '@testing-library/user-event';

import { Event } from '../../types';

/**
 * 일정 추가 폼을 작성하고 제출합니다.
 *
 * "일정 추가" 버튼 클릭부터 폼 제출까지 전체 플로우를 수행합니다.
 * 반복 일정이 아닌 일반 일정을 생성할 때 사용합니다.
 *
 * @param user - userEvent 인스턴스
 * @param eventData - 작성할 일정 데이터 (id, notificationTime, repeat 제외)
 *
 * @example
 * await fillAndSubmitEventForm(user, {
 *   title: '팀 회의',
 *   date: '2025-10-15',
 *   startTime: '14:00',
 *   endTime: '15:00',
 *   description: '주간 미팅',
 *   location: '회의실 A',
 *   category: '업무',
 * });
 */
export const fillAndSubmitEventForm = async (
  user: UserEvent,
  eventData: Omit<Event, 'id' | 'notificationTime' | 'repeat'>
) => {
  const { title, date, startTime, endTime, location, description, category } = eventData;

  // 일정 추가 버튼 클릭
  await user.click(screen.getAllByText('일정 추가')[0]);

  // 폼 필드 작성
  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);

  // 카테고리 선택
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  // 폼 제출
  await user.click(screen.getByTestId('event-submit-button'));
};

/**
 * 반복 일정 폼을 작성하고 제출합니다.
 *
 * 일반 일정 폼 작성 후, 추가로 반복 설정을 입력합니다.
 *
 * @param user - userEvent 인스턴스
 * @param eventData - 작성할 일정 데이터
 * @param repeatType - 반복 유형 ('매일', '매주', '매월', '매년')
 * @param endDate - 반복 종료 날짜
 *
 * @example
 * await fillAndSubmitRecurringEventForm(
 *   user,
 *   { title: '주간 회의', date: '2025-10-01', ... },
 *   '매주',
 *   '2025-12-31'
 * );
 */
export const fillAndSubmitRecurringEventForm = async (
  user: UserEvent,
  eventData: Omit<Event, 'id' | 'notificationTime' | 'repeat'>,
  repeatType: '매일' | '매주' | '매월' | '매년',
  endDate: string
) => {
  const { title, date, startTime, endTime, location, description, category } = eventData;

  // 일정 추가 버튼 클릭
  await user.click(screen.getAllByText('일정 추가')[0]);

  // 기본 필드 작성
  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);

  // 카테고리 선택
  await user.click(screen.getByLabelText('카테고리'));
  await user.click(within(screen.getByLabelText('카테고리')).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: `${category}-option` }));

  // 반복 일정 설정
  const checkbox = screen.getByRole('checkbox', { name: '반복 일정' });
  // 체크박스가 이미 선택되어 있지 않은 경우에만 클릭
  if (!checkbox.hasAttribute('checked') || checkbox.getAttribute('checked') === 'false') {
    await user.click(checkbox);
  }

  // 반복 유형 선택
  const repeatSelect = await screen.findByLabelText('반복');
  await user.click(within(repeatSelect).getByRole('combobox'));
  await user.click(screen.getByRole('option', { name: repeatType }));

  // 반복 종료 날짜 입력
  const repeatEndDateInput = document.querySelector('#repeat-end-date') as HTMLInputElement;
  await user.type(repeatEndDateInput, endDate);

  // 폼 제출
  await user.click(screen.getByTestId('event-submit-button'));
};
