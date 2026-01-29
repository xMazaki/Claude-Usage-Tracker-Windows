import { Notification } from 'electron';
import { Profile, ClaudeUsage } from '../../shared/types';

const firedThresholds: Map<string, Set<number>> = new Map();

export function checkAndNotify(profile: Profile, usage: ClaudeUsage): void {
  if (!profile.notificationThresholds || profile.notificationThresholds.length === 0) return;

  if (!firedThresholds.has(profile.id)) {
    firedThresholds.set(profile.id, new Set());
  }
  const fired = firedThresholds.get(profile.id)!;

  // Reset fired thresholds if usage dropped (new session window)
  if (usage.fiveHour < 10) {
    fired.clear();
  }

  for (const threshold of profile.notificationThresholds) {
    if (usage.fiveHour >= threshold && !fired.has(threshold)) {
      fired.add(threshold);
      showNotification(profile.name, threshold, usage.fiveHour);
    }
  }
}

function showNotification(profileName: string, threshold: number, current: number): void {
  const notification = new Notification({
    title: 'Claude Usage Alert',
    body: `[${profileName}] Session usage at ${current}% (threshold: ${threshold}%)`,
    icon: undefined,
    silent: false,
  });
  notification.show();
}

export function resetNotifications(profileId: string): void {
  firedThresholds.delete(profileId);
}
