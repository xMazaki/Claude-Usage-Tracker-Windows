export interface ClaudeUsage {
  fiveHour: number;       // 0-100 session usage %
  sevenDay: number;       // 0-100 weekly usage %
  sevenDayOpus: number;
  sevenDaySonnet: number;
  extraUsage: number;
  resetTime?: string;     // ISO timestamp for next reset
}

export interface APIUsage {
  totalSpent: number;
  dailySpend: number;
  monthlyBudget: number;
}

export interface Profile {
  id: string;
  name: string;
  sessionKey: string;
  organizationId: string;
  displayInTray: boolean;
  iconStyle: IconStyle;
  refreshInterval: number;  // seconds
  notificationThresholds: number[];
  autoStartSession: boolean;
  apiSessionKey?: string;
  apiOrgId?: string;
  cachedUsage?: ClaudeUsage;
  cachedAPIUsage?: APIUsage;
  lastUpdated?: string;
}

export type IconStyle = 'battery' | 'progressBar' | 'percentage' | 'iconWithBar' | 'compact';

export type ProfileDisplayMode = 'single' | 'multi';

export interface AppSettings {
  language: 'en' | 'fr';
  launchAtLogin: boolean;
  displayMode: ProfileDisplayMode;
  activeProfileId: string;
  showRemaining: boolean;
  monochromeIcon: boolean;
}

export interface ClaudeStatus {
  status: 'operational' | 'degraded' | 'major_outage' | 'maintenance';
  description: string;
}

export interface NotificationSettings {
  enabled: boolean;
  thresholds: number[];
  firedThresholds: number[];
}

export type ViewType = 'popover' | 'settings' | 'setup' | 'credentials' | 'profiles' | 'about';

export interface IPCChannels {
  'get-profiles': () => Profile[];
  'get-active-profile': () => Profile | null;
  'save-profile': (profile: Profile) => void;
  'delete-profile': (id: string) => void;
  'set-active-profile': (id: string) => void;
  'get-settings': () => AppSettings;
  'save-settings': (settings: AppSettings) => void;
  'fetch-usage': (profileId: string) => ClaudeUsage | null;
  'fetch-status': () => ClaudeStatus;
  'validate-session-key': (key: string) => { valid: boolean; orgId?: string; orgName?: string };
  'open-settings': () => void;
  'quit-app': () => void;
}
