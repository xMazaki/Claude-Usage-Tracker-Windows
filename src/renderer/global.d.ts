interface ElectronAPI {
  getProfiles(): Promise<import('../shared/types').Profile[]>;
  getActiveProfile(): Promise<import('../shared/types').Profile | null>;
  saveProfile(profile: import('../shared/types').Profile): Promise<boolean>;
  deleteProfile(id: string): Promise<boolean>;
  setActiveProfile(id: string): Promise<boolean>;
  createProfile(name: string): Promise<import('../shared/types').Profile>;
  getSettings(): Promise<import('../shared/types').AppSettings>;
  saveSettings(settings: import('../shared/types').AppSettings): Promise<boolean>;
  fetchUsage(profileId: string): Promise<import('../shared/types').ClaudeUsage | null>;
  fetchStatus(): Promise<import('../shared/types').ClaudeStatus>;
  validateSessionKey(key: string): Promise<{ valid: boolean; orgId?: string; orgName?: string }>;
  openSettings(): Promise<boolean>;
  getLaunchAtLogin(): Promise<boolean>;
  setLaunchAtLogin(enabled: boolean): Promise<boolean>;
  quitApp(): Promise<void>;
  needsSetup(): Promise<boolean>;
  minimizePopover(): Promise<void>;
  openExternal(url: string): Promise<void>;
  relaunchApp(): Promise<void>;
}

interface Window {
  electronAPI: ElectronAPI;
}
