import { app, BrowserWindow, Menu } from 'electron';
import { createTray } from './tray';
import { registerIPCHandlers } from './ipc-handlers';
import { ensureDefaultProfile } from './services/profiles';

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

app.on('ready', () => {
  // Remove default menu bar (File, Edit, View, Window, Help)
  Menu.setApplicationMenu(null);

  ensureDefaultProfile();
  registerIPCHandlers();
  createTray();
});

app.on('window-all-closed', (e: Event) => {
  e.preventDefault();
});
