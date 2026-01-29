import { exec } from 'child_process';

const REG_KEY = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run';
const APP_NAME = 'ClaudeUsageTracker';

export function setLaunchAtLogin(enabled: boolean): void {
  const exePath = process.execPath.replace(/\//g, '\\');

  if (enabled) {
    exec(`reg add "${REG_KEY}" /v "${APP_NAME}" /t REG_SZ /d "\\"${exePath}\\"" /f`);
  } else {
    exec(`reg delete "${REG_KEY}" /v "${APP_NAME}" /f`);
  }
}

export function getLaunchAtLogin(): boolean {
  // Synchronous check not practical with reg query; we track via settings instead.
  // The actual registry entry is the source of truth at OS level.
  // Return value from settings will be used by the UI.
  return false;
}
