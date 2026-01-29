import { Profile, AppSettings } from '../../shared/types';
import { saveData, loadData, savePlain, loadPlain } from './storage';
import { randomUUID } from 'crypto';

const PROFILES_FILE = 'profiles.enc';
const SETTINGS_FILE = 'settings.json';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  launchAtLogin: false,
  displayMode: 'single',
  activeProfileId: '',
  showRemaining: true,
  monochromeIcon: false,
};

export function createDefaultProfile(name: string = 'Default'): Profile {
  return {
    id: randomUUID(),
    name,
    sessionKey: '',
    organizationId: '',
    displayInTray: true,
    iconStyle: 'battery',
    refreshInterval: 30,
    notificationThresholds: [75, 90, 95],
    autoStartSession: false,
  };
}

export function getProfiles(): Profile[] {
  return loadData<Profile[]>(PROFILES_FILE, []);
}

export function saveProfiles(profiles: Profile[]): void {
  saveData(PROFILES_FILE, profiles);
}

export function getProfile(id: string): Profile | undefined {
  return getProfiles().find(p => p.id === id);
}

export function saveProfile(profile: Profile): void {
  const profiles = getProfiles();
  const idx = profiles.findIndex(p => p.id === profile.id);
  if (idx >= 0) {
    profiles[idx] = profile;
  } else {
    profiles.push(profile);
  }
  saveProfiles(profiles);
}

export function deleteProfile(id: string): void {
  const profiles = getProfiles().filter(p => p.id !== id);
  saveProfiles(profiles);
}

export function getSettings(): AppSettings {
  return loadPlain<AppSettings>(SETTINGS_FILE, DEFAULT_SETTINGS);
}

export function saveSettings(settings: AppSettings): void {
  savePlain(SETTINGS_FILE, settings);
}

export function getActiveProfile(): Profile | null {
  const settings = getSettings();
  const profiles = getProfiles();
  if (profiles.length === 0) return null;
  const active = profiles.find(p => p.id === settings.activeProfileId);
  return active ?? profiles[0];
}

export function setActiveProfile(id: string): void {
  const settings = getSettings();
  settings.activeProfileId = id;
  saveSettings(settings);
}

export function ensureDefaultProfile(): void {
  const profiles = getProfiles();
  if (profiles.length === 0) {
    const profile = createDefaultProfile();
    saveProfiles([profile]);
    const settings = getSettings();
    settings.activeProfileId = profile.id;
    saveSettings(settings);
  }
}
