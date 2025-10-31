export const CALENDAR_STYLES = {
  table: {
    tableLayout: 'fixed' as const,
    width: '100%',
  },

  headerCell: {
    width: '14.28%',
    padding: 1,
    textAlign: 'center' as const,
  },

  dayCell: {
    height: '120px',
    verticalAlign: 'top' as const,
    width: '14.28%',
    padding: 1,
    border: '1px solid #e0e0e0',
    overflow: 'hidden',
  },

  monthDayCell: {
    height: '120px',
    verticalAlign: 'top' as const,
    width: '14.28%',
    padding: 1,
    border: '1px solid #e0e0e0',
    overflow: 'hidden',
    position: 'relative' as const,
  },
};
