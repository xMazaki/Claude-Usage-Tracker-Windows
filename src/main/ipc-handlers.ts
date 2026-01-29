import { ipcMain } from 'electron';
import * as profileService from './services/profiles';
import * as api from './services/api';
import * as autostart from './services/autostart';
import { checkAndNotify } from './services/notifications';
import { updateTrayIcon, openSettings } from './tray';
import { Profile, AppSettings } from '../shared/types';

export function registerIPCHandlers(): void {
  ipcMain.handle('get-profiles', () => {
    return profileService.getProfiles();
  });

  ipcMain.handle('get-active-profile', () => {
    return profileService.getActiveProfile();
  });

  ipcMain.handle('save-profile', (_event, profile: Profile) => {
    profileService.saveProfile(profile);
    return true;
  });

  ipcMain.handle('delete-profile', (_event, id: string) => {
    profileService.deleteProfile(id);
    return true;
  });

  ipcMain.handle('set-active-profile', (_event, id: string) => {
    profileService.setActiveProfile(id);
    return true;
  });

  ipcMain.handle('get-settings', () => {
    return profileService.getSettings();
  });

  ipcMain.handle('save-settings', (_event, settings: AppSettings) => {
    profileService.saveSettings(settings);
    autostart.setLaunchAtLogin(settings.launchAtLogin);
    return true;
  });

  ipcMain.handle('fetch-usage', async (_event, profileId: string) => {
    const profile = profileService.getProfile(profileId);
    if (!profile) return null;

    const usage = await api.fetchUsage(profile);
    if (usage) {
      // Cache usage in profile
      profile.cachedUsage = usage;
      profile.lastUpdated = new Date().toISOString();
      profileService.saveProfile(profile);

      // Check notification thresholds
      checkAndNotify(profile, usage);

      // Update tray icon for active profile
      const active = profileService.getActiveProfile();
      const settings = profileService.getSettings();
      if (active && active.id === profile.id) {
        updateTrayIcon(
          usage.fiveHour,
          profile.iconStyle,
          settings.monochromeIcon,
          settings.showRemaining
        );
      }
    }
    return usage;
  });

  ipcMain.handle('fetch-status', async () => {
    return api.fetchClaudeStatus();
  });

  ipcMain.handle('validate-session-key', async (_event, key: string) => {
    return api.validateSessionKey(key);
  });

  ipcMain.handle('create-profile', (_event, name: string) => {
    const profile = profileService.createDefaultProfile(name);
    profileService.saveProfile(profile);
    return profile;
  });

  ipcMain.handle('open-settings', () => {
    openSettings();
    return true;
  });

  ipcMain.handle('get-launch-at-login', () => {
    return autostart.getLaunchAtLogin();
  });

  ipcMain.handle('set-launch-at-login', (_event, enabled: boolean) => {
    autostart.setLaunchAtLogin(enabled);
    return true;
  });

  ipcMain.handle('quit-app', () => {
    const { app } = require('electron');
    app.quit();
  });

  ipcMain.handle('open-external', (_event, url: string) => {
    const { shell } = require('electron');
    shell.openExternal(url);
  });

  ipcMain.handle('relaunch-app', () => {
    const { app } = require('electron');
    app.relaunch();
    app.exit(0);
  });

  ipcMain.handle('needs-setup', () => {
    const profiles = profileService.getProfiles();
    if (profiles.length === 0) return true;
    const active = profileService.getActiveProfile();
    return !active || !active.sessionKey;
  });
}
