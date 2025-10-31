import { act, renderHook } from '@testing-library/react';

import { useEventForm } from '../../hooks/useEventForm';
import { Event } from '../../types';

describe('REQ-001: 반복 유형 선택', () => {
  describe('Phase 1: Happy Path - 기본 반복 유형 선택', () => {
    describe('Group 1.1: Non-Recurring Event (가장 간단)', () => {
      it('반복 체크박스가 비활성화된 상태로 일정 생성 시 repeat.type이 "none"으로 저장된다', () => {
        // 명세: REQ-001 - 비반복 일정
        // 설계: TODO-001

        // Arrange
        const { result } = renderHook(() => useEventForm());

        // Act
        act(() => {
          result.current.setTitle('회의');
          result.current.setDate('2025-01-15');
          result.current.setStartTime('09:00');
          result.current.setEndTime('10:00');
          // isRepeating은 기본값이 false
        });

        // Assert
        expect(result.current.isRepeating).toBe(false);
        expect(result.current.repeatType).toBe('none');
      });
    });

    describe('Group 1.2: Enable Repeat Checkbox', () => {
      it('반복 체크박스를 활성화하면 반복 유형 선택 UI가 표시된다', () => {
        // 명세: REQ-001 - 반복 유형 선택 UI
        // 설계: TODO-002

        // Arrange
        const { result } = renderHook(() => useEventForm());

        // Act
        act(() => {
          result.current.setIsRepeating(true);
        });

        // Assert
        expect(result.current.isRepeating).toBe(true);
        // 반복 유형은 'none'에서 사용자가 선택 가능한 상태로 전환
        expect(result.current.repeatType).toBe('none'); // 초기값은 'none'
      });
    });

    describe('Group 1.3: Select Each Repeat Type (Core Feature)', () => {
      it('반복 체크박스 활성화 후 "매일" 반복 유형을 선택하고 일정 생성 시 repeat.type이 "daily"로 저장된다', () => {
        // 명세: REQ-001 - 매일(Daily) 반복
        // 설계: TODO-003

        // Arrange
        const { result } = renderHook(() => useEventForm());

        // Act
        act(() => {
          result.current.setIsRepeating(true);
          result.current.setRepeatType('daily');
        });

        // Assert
        expect(result.current.isRepeating).toBe(true);
        expect(result.current.repeatType).toBe('daily');
      });

      it('반복 체크박스 활성화 후 "매주" 반복 유형을 선택하고 일정 생성 시 repeat.type이 "weekly"로 저장된다', () => {
        // 명세: REQ-001 - 매주(Weekly) 반복
        // 설계: TODO-004

        // Arrange
        const { result } = renderHook(() => useEventForm());

        // Act
        act(() => {
          result.current.setIsRepeating(true);
          result.current.setRepeatType('weekly');
        });

        // Assert
        expect(result.current.isRepeating).toBe(true);
        expect(result.current.repeatType).toBe('weekly');
      });

      it('반복 체크박스 활성화 후 "매월" 반복 유형을 선택하고 일정 생성 시 repeat.type이 "monthly"로 저장된다', () => {
        // 명세: REQ-001 - 매월(Monthly) 반복
        // 설계: TODO-005

        // Arrange
        const { result } = renderHook(() => useEventForm());

        // Act
        act(() => {
          result.current.setIsRepeating(true);
          result.current.setRepeatType('monthly');
        });

        // Assert
        expect(result.current.isRepeating).toBe(true);
        expect(result.current.repeatType).toBe('monthly');
      });

      it('반복 체크박스 활성화 후 "매년" 반복 유형을 선택하고 일정 생성 시 repeat.type이 "yearly"로 저장된다', () => {
        // 명세: REQ-001 - 매년(Yearly) 반복
        // 설계: TODO-006

        // Arrange
        const { result } = renderHook(() => useEventForm());

        // Act
        act(() => {
          result.current.setIsRepeating(true);
          result.current.setRepeatType('yearly');
        });

        // Assert
        expect(result.current.isRepeating).toBe(true);
        expect(result.current.repeatType).toBe('yearly');
      });
    });
  });

  describe('Phase 2: Event Modification - Repeat Type Change', () => {
    describe('Group 2.1: Non-Recurring ↔ Recurring', () => {
      it('비반복 일정을 수정하여 "매일" 반복으로 변경할 수 있다', () => {
        // 명세: REQ-001 - 일정 수정 시 반복 유형 선택
        // 설계: TODO-007

        // Arrange - 비반복 일정
        const nonRecurringEvent: Event = {
          id: '1',
          title: '회의',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '10:00',
          description: '팀 미팅',
          location: '회의실 A',
          category: '업무',
          repeat: { type: 'none', interval: 0 },
          notificationTime: 10,
        };

        const { result } = renderHook(() => useEventForm());

        // Act - 수정 모드 진입 후 반복으로 변경
        act(() => {
          result.current.editEvent(nonRecurringEvent);
          result.current.setIsRepeating(true);
          result.current.setRepeatType('daily');
        });

        // Assert
        expect(result.current.isRepeating).toBe(true);
        expect(result.current.repeatType).toBe('daily');
      });

      it('"매일" 반복 일정을 수정하여 비반복으로 변경할 수 있다', () => {
        // 명세: REQ-001 - 일정 수정 시 반복 유형 선택
        // 설계: TODO-008

        // Arrange - 매일 반복 일정
        const dailyRecurringEvent: Event = {
          id: '1',
          title: '매일 운동',
          date: '2025-01-01',
          startTime: '07:00',
          endTime: '08:00',
          description: '아침 운동',
          location: '헬스장',
          category: '개인',
          repeat: { type: 'daily', interval: 1 },
          notificationTime: 10,
        };

        const { result } = renderHook(() => useEventForm());

        // Act - 수정 모드 진입 후 비반복으로 변경
        act(() => {
          result.current.editEvent(dailyRecurringEvent);
          result.current.setIsRepeating(false);
          result.current.setRepeatType('none');
        });

        // Assert
        expect(result.current.isRepeating).toBe(false);
        expect(result.current.repeatType).toBe('none');
      });
    });

    describe('Group 2.2: Repeat Type Switch', () => {
      it('"매일" 반복 일정을 수정하여 "매주" 반복으로 변경할 수 있다', () => {
        // 명세: REQ-001 - 일정 수정 시 반복 유형 변경
        // 설계: TODO-009

        // Arrange - 매일 반복 일정
        const dailyRecurringEvent: Event = {
          id: '1',
          title: '매일 운동',
          date: '2025-01-01',
          startTime: '07:00',
          endTime: '08:00',
          description: '아침 운동',
          location: '헬스장',
          category: '개인',
          repeat: { type: 'daily', interval: 1 },
          notificationTime: 10,
        };

        const { result } = renderHook(() => useEventForm());

        // Act - 수정 모드 진입 후 매주로 변경
        act(() => {
          result.current.editEvent(dailyRecurringEvent);
          result.current.setRepeatType('weekly');
        });

        // Assert
        expect(result.current.isRepeating).toBe(true);
        expect(result.current.repeatType).toBe('weekly');
      });

      it('"매주" 반복 일정을 수정하여 "매월" 반복으로 변경할 수 있다', () => {
        // 명세: REQ-001 - 일정 수정 시 반복 유형 변경
        // 설계: TODO-010

        // Arrange - 매주 반복 일정
        const weeklyRecurringEvent: Event = {
          id: '1',
          title: '주간 회의',
          date: '2025-01-06',
          startTime: '14:00',
          endTime: '15:00',
          description: '팀 주간 회의',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
        };

        const { result } = renderHook(() => useEventForm());

        // Act - 수정 모드 진입 후 매월로 변경
        act(() => {
          result.current.editEvent(weeklyRecurringEvent);
          result.current.setRepeatType('monthly');
        });

        // Assert
        expect(result.current.isRepeating).toBe(true);
        expect(result.current.repeatType).toBe('monthly');
      });
    });
  });

  describe('Phase 3: UI State Management', () => {
    describe('Group 3.1: Form Reset', () => {
      it('일정 생성 후 폼 초기화 시 반복 체크박스가 해제된다', () => {
        // 명세: REQ-001 - 폼 초기화
        // 설계: TODO-011

        // Arrange - 반복 일정 설정
        const { result } = renderHook(() => useEventForm());

        act(() => {
          result.current.setIsRepeating(true);
          result.current.setRepeatType('daily');
        });

        // Act - 폼 초기화
        act(() => {
          result.current.resetForm();
        });

        // Assert
        expect(result.current.isRepeating).toBe(false);
      });

      it('일정 생성 후 폼 초기화 시 반복 유형이 "none"으로 리셋된다', () => {
        // 명세: REQ-001 - 폼 초기화
        // 설계: TODO-012

        // Arrange - 반복 일정 설정
        const { result } = renderHook(() => useEventForm());

        act(() => {
          result.current.setIsRepeating(true);
          result.current.setRepeatType('weekly');
        });

        // Act - 폼 초기화
        act(() => {
          result.current.resetForm();
        });

        // Assert
        expect(result.current.repeatType).toBe('none');
      });
    });

    describe('Group 3.2: Edit Mode State', () => {
      it('반복 일정 수정 모드 진입 시 반복 체크박스가 활성화된다', () => {
        // 명세: REQ-001 - 일정 수정 시 반복 유형 표시
        // 설계: TODO-013

        // Arrange - 매일 반복 일정
        const dailyRecurringEvent: Event = {
          id: '1',
          title: '매일 운동',
          date: '2025-01-01',
          startTime: '07:00',
          endTime: '08:00',
          description: '아침 운동',
          location: '헬스장',
          category: '개인',
          repeat: { type: 'daily', interval: 1 },
          notificationTime: 10,
        };

        const { result } = renderHook(() => useEventForm());

        // Act - 수정 모드 진입
        act(() => {
          result.current.editEvent(dailyRecurringEvent);
        });

        // Assert
        expect(result.current.isRepeating).toBe(true);
      });

      it('반복 일정 수정 모드 진입 시 기존 반복 유형이 선택된 상태로 표시된다', () => {
        // 명세: REQ-001 - 일정 수정 시 반복 유형 표시
        // 설계: TODO-014

        // Arrange - 매주 반복 일정
        const weeklyRecurringEvent: Event = {
          id: '1',
          title: '주간 회의',
          date: '2025-01-06',
          startTime: '14:00',
          endTime: '15:00',
          description: '팀 주간 회의',
          location: '회의실 B',
          category: '업무',
          repeat: { type: 'weekly', interval: 1 },
          notificationTime: 10,
        };

        const { result } = renderHook(() => useEventForm());

        // Act - 수정 모드 진입
        act(() => {
          result.current.editEvent(weeklyRecurringEvent);
        });

        // Assert
        expect(result.current.repeatType).toBe('weekly');
      });
    });
  });
});
