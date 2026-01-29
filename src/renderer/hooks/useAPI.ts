import { useState, useEffect, useCallback, useRef } from 'react';
import { Profile, ClaudeUsage, ClaudeStatus, AppSettings } from '../../shared/types';

const api = window.electronAPI;

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);

  const reload = useCallback(async () => {
    const p = await api.getProfiles();
    setProfiles(p);
    const active = await api.getActiveProfile();
    setActiveProfile(active);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { profiles, activeProfile, reload };
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const reload = useCallback(async () => {
    const s = await api.getSettings();
    setSettings(s);
  }, []);

  const save = useCallback(async (s: AppSettings) => {
    await api.saveSettings(s);
    setSettings(s);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  return { settings, reload, save };
}

export function useUsage(profileId: string | undefined, refreshInterval: number = 30) {
  const [usage, setUsage] = useState<ClaudeUsage | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetch = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const u = await api.fetchUsage(profileId);
      setUsage(u);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => {
    fetch();
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (profileId && refreshInterval > 0) {
      intervalRef.current = setInterval(fetch, refreshInterval * 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetch, profileId, refreshInterval]);

  return { usage, loading, refresh: fetch };
}

export function useClaudeStatus() {
  const [status, setStatus] = useState<ClaudeStatus>({ status: 'operational', description: '' });

  useEffect(() => {
    api.fetchStatus().then(setStatus);
    const interval = setInterval(() => {
      api.fetchStatus().then(setStatus);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return status;
}
