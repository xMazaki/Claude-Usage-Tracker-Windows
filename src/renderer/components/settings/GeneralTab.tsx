import React, { useEffect, useState } from 'react';
import { t, LangKey } from '../../i18n/translations';
import { useProfiles, useSettings } from '../../hooks/useAPI';

export const GeneralTab: React.FC = () => {
  const { settings, save } = useSettings();
  const { activeProfile, reload } = useProfiles();
  const [refreshInterval, setRefreshInterval] = useState(30);

  useEffect(() => {
    if (activeProfile) setRefreshInterval(activeProfile.refreshInterval);
  }, [activeProfile]);

  if (!settings) return null;

  const handleLanguageChange = (lang: LangKey) => {
    save({ ...settings, language: lang });
    // Force re-render by reloading
    window.location.reload();
  };

  const handleRefreshChange = async (val: number) => {
    const clamped = Math.max(5, Math.min(300, val));
    setRefreshInterval(clamped);
    if (activeProfile) {
      activeProfile.refreshInterval = clamped;
      await window.electronAPI.saveProfile(activeProfile);
      reload();
    }
  };

  const handleAutoStart = async (enabled: boolean) => {
    if (!activeProfile) return;
    activeProfile.autoStartSession = enabled;
    await window.electronAPI.saveProfile(activeProfile);
    reload();
  };

  return (
    <div className="tab-content">
      <h2>{t('settings.tab.general')}</h2>

      <div className="form-group">
        <label>{t('general.language')}</label>
        <select
          value={settings.language}
          onChange={e => handleLanguageChange(e.target.value as LangKey)}
        >
          <option value="en">English</option>
          <option value="fr">Français</option>
        </select>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.launchAtLogin}
            onChange={e => save({ ...settings, launchAtLogin: e.target.checked })}
          />
          {t('general.launchAtLogin')}
        </label>
      </div>

      <div className="form-group">
        <label>{t('general.refreshInterval')}</label>
        <div className="range-input">
          <input
            type="range"
            min={5}
            max={300}
            step={5}
            value={refreshInterval}
            onChange={e => handleRefreshChange(parseInt(e.target.value))}
          />
          <span className="range-value">{refreshInterval}s</span>
        </div>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={activeProfile?.autoStartSession ?? false}
            onChange={e => handleAutoStart(e.target.checked)}
          />
          {t('general.autoStartSession')}
        </label>
      </div>
    </div>
  );
};
