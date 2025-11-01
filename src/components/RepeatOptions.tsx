import { RepeatType } from '../types';

interface RepeatOptionsProps {
  repeatType: RepeatType;
  setRepeatType: (_type: RepeatType) => void;
  repeatInterval: number;
  setRepeatInterval: (_interval: number) => void;
  repeatEndDate: string;
  setRepeatEndDate: (_date: string) => void;
  daysOfWeek: number[];
  setDaysOfWeek: (_days: number[]) => void;
  dayOfMonth: number;
  setDayOfMonth: (_day: number) => void;
  monthOfYear: number;
  setMonthOfYear: (_month: number) => void;
}

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

export const RepeatOptions = ({
  repeatType,
  setRepeatType,
  repeatInterval,
  setRepeatInterval,
  repeatEndDate,
  setRepeatEndDate,
  daysOfWeek,
  setDaysOfWeek,
  dayOfMonth,
  setDayOfMonth,
  monthOfYear,
  setMonthOfYear,
}: RepeatOptionsProps) => {
  const handleDayOfWeekChange = (index: number, checked: boolean) => {
    if (checked) {
      setDaysOfWeek([...daysOfWeek, index]);
    } else {
      setDaysOfWeek(daysOfWeek.filter((d) => d !== index));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <label htmlFor="repeat-type" id="repeat-type-label">
          반복 유형
        </label>
        <select
          id="repeat-type"
          aria-labelledby="repeat-type-label"
          value={repeatType}
          onChange={(e) => setRepeatType(e.target.value as RepeatType)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="none">없음</option>
          <option value="daily">매일</option>
          <option value="weekly">매주</option>
          <option value="monthly">매월</option>
          <option value="yearly">매년</option>
        </select>
      </div>

      {repeatType === 'weekly' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>요일 선택</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            {weekDays.map((day, index) => (
              <label key={day} style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={daysOfWeek.includes(index)}
                  onChange={(e) => handleDayOfWeekChange(index, e.target.checked)}
                  style={{ marginRight: '4px' }}
                />
                {day}
              </label>
            ))}
          </div>
        </div>
      )}

      {(repeatType === 'monthly' || repeatType === 'yearly') && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="day-of-month">일자</label>
          <input
            id="day-of-month"
            type="number"
            value={dayOfMonth}
            onChange={(e) => setDayOfMonth(Number(e.target.value))}
            min={1}
            max={31}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      )}

      {repeatType === 'yearly' && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="month-of-year">월</label>
          <select
            id="month-of-year"
            value={monthOfYear}
            onChange={(e) => setMonthOfYear(Number(e.target.value))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={i}>
                {i + 1}월
              </option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <label htmlFor="repeat-interval">반복 간격</label>
          <input
            id="repeat-interval"
            type="number"
            value={repeatInterval}
            onChange={(e) => setRepeatInterval(Number(e.target.value))}
            min={1}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <label htmlFor="repeat-end-date">반복 종료일</label>
          <input
            id="repeat-end-date"
            type="date"
            value={repeatEndDate}
            onChange={(e) => setRepeatEndDate(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>
      </div>
    </div>
  );
};
