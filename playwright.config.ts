import { defineConfig, devices } from '@playwright/test';

/**
 * E2E 테스트 설정
 * 
 * Playwright를 사용한 End-to-End 테스트 설정
 * - Sequential execution: MSW와의 호환성을 위해 순차 실행
 * - Single worker: 테스트 간 간섭 방지
 * - Vite dev server: 자동 서버 시작
 */
export default defineConfig({
  testDir: './src/__tests__/e2e',
  
  // MSW와의 호환성을 위해 병렬 실행 비활성화
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  
  // 리포트 설정
  reporter: 'html',
  
  // 공통 설정
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // 시간 초과 설정
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  
  // 브라우저 프로젝트
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // 필요시 다른 브라우저도 추가 가능
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
  
  // 웹 서버 설정 (Vite)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 서버 시작 대기 시간 (2분)
  },
});

