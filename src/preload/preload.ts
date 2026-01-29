import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getProfiles: () => ipcRenderer.invoke('get-profiles'),
  getActiveProfile: () => ipcRenderer.invoke('get-active-profile'),
  saveProfile: (profile: any) => ipcRenderer.invoke('save-profile', profile),
  deleteProfile: (id: string) => ipcRenderer.invoke('delete-profile', id),
  setActiveProfile: (id: string) => ipcRenderer.invoke('set-active-profile', id),
  createProfile: (name: string) => ipcRenderer.invoke('create-profile', name),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('save-settings', settings),
  fetchUsage: (profileId: string) => ipcRenderer.invoke('fetch-usage', profileId),
  fetchStatus: () => ipcRenderer.invoke('fetch-status'),
  validateSessionKey: (key: string) => ipcRenderer.invoke('validate-session-key', key),
  openSettings: () => ipcRenderer.invoke('open-settings'),
  getLaunchAtLogin: () => ipcRenderer.invoke('get-launch-at-login'),
  setLaunchAtLogin: (enabled: boolean) => ipcRenderer.invoke('set-launch-at-login', enabled),
  quitApp: () => ipcRenderer.invoke('quit-app'),
  needsSetup: () => ipcRenderer.invoke('needs-setup'),
  minimizePopover: () => ipcRenderer.invoke('minimize-popover'),
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  relaunchApp: () => ipcRenderer.invoke('relaunch-app'),
});
