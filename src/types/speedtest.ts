export type TestStage =
  | 'idle'
  | 'initializing'
  | 'choosing_endpoint'
  | 'testing_ping'
  | 'testing_jitter'
  | 'testing_download'
  | 'testing_upload'
  | 'calculating_results'
  | 'completed'
  | 'error';

export interface SpeedTestServer {
  id: string;
  name: string;
  location: string;
  provider: string;
  pingUrl: string;
  downloadUrl: (bytes: number) => string;
  uploadUrl: string;
  isCustom?: boolean;
}

export interface LatencyMetrics {
  samples: number[];
  min: number;
  avg: number;
  median: number;
  jitter: number;
}

export interface StreamProgress {
  bytesLoaded: number;
  instantMbps: number;
  averageMbps: number;
  progressPercent: number;
}

export interface SpeedTestResult {
  id: string;
  timestamp: number;
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
  jitterMs: number;
  server: {
    id: string;
    name: string;
    location: string;
  };
  durationSeconds: number;
  networkInfo?: {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
  deviceInfo?: {
    browser: string;
    os: string;
  };
}

export type ThemeMode = 'dark' | 'light' | 'system';
