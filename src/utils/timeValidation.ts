export interface TimeValidationResult {
  startTimeError: string | null;
  endTimeError: string | null;
}

export function getTimeErrorMessage(start: string, end: string): TimeValidationResult {
  if (!start || !end) {
    return { startTimeError: null, endTimeError: null };
  }

  const startDate = new Date(`2000-01-01T${start}`);
  const endDate = new Date(`2000-01-01T${end}`);

  if (startDate >= endDate) {
    return {
      startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
      endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
    };
  }

  return { startTimeError: null, endTimeError: null };
}

/**
 * 시작, 종료 시간이 같거나 종료가 더 빠를 때 endTime을 자동 보정 (기본 +1h, 23:00~00:00 등 자정 넘김 지원)
 * @returns 조정된 endTime ("HH:mm" string)
 */
export function adjustEndTime(startTime: string, endTime: string): string {
  const [sh, sm] = startTime.split(':').map(Number);
  const [eh, em] = endTime.split(':').map(Number);
  let start = new Date(2000, 0, 1, sh, sm);
  let end = new Date(2000, 0, 1, eh, em);
  if (end <= start) {
    end = new Date(start.getTime() + 60 * 60 * 1000); // +1h
  }
  return `${end.getHours().toString().padStart(2,'0')}:${end.getMinutes().toString().padStart(2,'0')}`;
}
