// 반복 일정 스타일 정의
// 테마 일관성을 위한 색상 팔레트
const THEME_COLORS = {
  primary: '#1976d2',
  primaryDark: '#1565c0',
  primaryLight: '#42a5f5',
  background: {
    light: 'rgba(25, 118, 210, 0.08)',
    medium: 'rgba(25, 118, 210, 0.1)',
    strong: 'rgba(25, 118, 210, 0.12)',
  },
  text: {
    primary: '#1976d2',
    secondary: '#1565c0',
    disabled: 'rgba(25, 118, 210, 0.5)',
  },
} as const;

// 반응형 브레이크포인트 (향후 확장용)
// const BREAKPOINTS = {
//   mobile: '480px',
//   tablet: '768px',
//   desktop: '1024px',
// } as const;

export const recurringIconStyles = {
  small: {
    fontSize: '14px',
    width: '20px',
    height: '20px',
    color: THEME_COLORS.text.primary,
    backgroundColor: THEME_COLORS.background.light,
    // 모바일 최적화
    '@media (max-width: 480px)': {
      fontSize: '12px',
      width: '18px',
      height: '18px',
    },
  },
  medium: {
    fontSize: '16px',
    width: '24px',
    height: '24px',
    color: THEME_COLORS.text.primary,
    backgroundColor: THEME_COLORS.background.medium,
    // 태블릿 최적화
    '@media (max-width: 768px)': {
      fontSize: '14px',
      width: '22px',
      height: '22px',
    },
  },
  large: {
    fontSize: '20px',
    width: '32px',
    height: '32px',
    color: THEME_COLORS.text.secondary,
    backgroundColor: THEME_COLORS.background.strong,
    // 데스크톱 확대
    '@media (min-width: 1024px)': {
      fontSize: '22px',
      width: '36px',
      height: '36px',
    },
  },
} as const;

// 반복 일정 카드 스타일 (향상된 반응형)
export const recurringCardStyles = {
  border: `1px solid ${THEME_COLORS.primaryLight}`,
  backgroundColor: THEME_COLORS.background.light,
  position: 'relative' as const,
  borderRadius: '8px',
  transition: 'all 0.3s ease-in-out',
  // 호버 효과
  '&:hover': {
    backgroundColor: THEME_COLORS.background.medium,
    borderColor: THEME_COLORS.primary,
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(25, 118, 210, 0.15)',
  },
  // 반응형 패딩 조정
  '@media (max-width: 480px)': {
    borderRadius: '6px',
    padding: '2px',
  },
};

// 반복 일정 배지 위치 (반응형 개선)
export const recurringBadgePosition = {
  position: 'absolute' as const,
  top: '4px',
  right: '4px',
  zIndex: 2, // 더 높은 z-index로 겹침 방지
  // 모바일에서 터치 친화적 크기
  '@media (max-width: 480px)': {
    top: '2px',
    right: '2px',
  },
};

// 고대비 모드 지원
export const highContrastStyles = {
  icon: {
    filter: 'contrast(1.2) brightness(1.1)',
    border: '1px solid currentColor',
  },
  card: {
    border: '2px solid currentColor',
    backgroundColor: 'transparent',
  },
};

// 다크 테마 지원 스타일
export const darkThemeStyles = {
  colors: {
    primary: '#90caf9',
    secondary: '#42a5f5',
    background: {
      light: 'rgba(144, 202, 249, 0.1)',
      medium: 'rgba(144, 202, 249, 0.15)',
      strong: 'rgba(144, 202, 249, 0.2)',
    },
  },
};
