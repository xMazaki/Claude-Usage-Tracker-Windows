import React, { useEffect, useState } from 'react';
import { t } from '../../i18n/translations';
import { useProfiles, useSettings } from '../../hooks/useAPI';
import { IconStyle } from '../../../shared/types';

const ICON_STYLES: { value: IconStyle; labelKey: string }[] = [
  { value: 'battery', labelKey: 'display.iconStyle.battery' },
  { value: 'progressBar', labelKey: 'display.iconStyle.progressBar' },
  { value: 'percentage', labelKey: 'display.iconStyle.percentage' },
  { value: 'iconWithBar', labelKey: 'display.iconStyle.iconWithBar' },
  { value: 'compact', labelKey: 'display.iconStyle.compact' },
];

export const DisplayTab: React.FC = () => {
  const { settings, save } = useSettings();
  const { activeProfile, reload } = useProfiles();
  const [iconStyle, setIconStyle] = useState<IconStyle>('battery');
  const [showRestart, setShowRestart] = useState(false);

  useEffect(() => {
    if (activeProfile) setIconStyle(activeProfile.iconStyle);
  }, [activeProfile]);

  if (!settings) return null;

  const promptRestart = () => setShowRestart(true);

  const handleIconStyleChange = async (style: IconStyle) => {
    setIconStyle(style);
    if (activeProfile) {
      activeProfile.iconStyle = style;
      await window.electronAPI.saveProfile(activeProfile);
      reload();
    }
    promptRestart();
  };

  const handleCheckbox = async (key: 'monochromeIcon' | 'showRemaining', val: boolean) => {
    await save({ ...settings, [key]: val });
    promptRestart();
  };

  const handleDisplayMode = async (mode: 'single' | 'multi') => {
    await save({ ...settings, displayMode: mode });
    promptRestart();
  };

  return (
    <div className="tab-content">
      <h2>{t('display.iconStyle')}</h2>

      <div className="icon-style-grid">
        {ICON_STYLES.map(s => (
          <button
            key={s.value}
            className={`icon-style-option ${iconStyle === s.value ? 'active' : ''}`}
            onClick={() => handleIconStyleChange(s.value)}
          >
            <div className="icon-preview">{renderPreview(s.value)}</div>
            <span>{t(s.labelKey)}</span>
          </button>
        ))}
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.monochromeIcon}
            onChange={e => handleCheckbox('monochromeIcon', e.target.checked)}
          />
          {t('display.monochrome')}
        </label>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={settings.showRemaining}
            onChange={e => handleCheckbox('showRemaining', e.target.checked)}
          />
          {t('display.showRemaining')}
        </label>
      </div>

      <h2>{t('display.displayMode')}</h2>
      <div className="form-group">
        <label className="radio-label">
          <input
            type="radio"
            checked={settings.displayMode === 'single'}
            onChange={() => handleDisplayMode('single')}
          />
          {t('display.displayMode.single')}
        </label>
        <label className="radio-label">
          <input
            type="radio"
            checked={settings.displayMode === 'multi'}
            onChange={() => handleDisplayMode('multi')}
          />
          {t('display.displayMode.multi')}
        </label>
      </div>

      {showRestart && (
        <div className="restart-prompt">
          <p>{t('display.restartRequired')}</p>
          <div className="restart-buttons">
            <button className="btn" onClick={() => setShowRestart(false)}>
              {t('display.restartLater')}
            </button>
            <button className="btn btn-primary" onClick={() => window.electronAPI.relaunchApp()}>
              {t('display.restartNow')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

function renderPreview(style: IconStyle): React.ReactNode {
  const color = '#4caf50';
  switch (style) {
    case 'battery':
      return (
        <svg width="32" height="20" viewBox="0 0 32 20">
          <rect x="1" y="3" width="26" height="14" rx="2" fill="none" stroke={color} strokeWidth="1.5" />
          <rect x="27" y="7" width="3" height="6" rx="1" fill={color} />
          <rect x="3" y="5" width="14" height="10" rx="1" fill={color} />
        </svg>
      );
    case 'progressBar':
      return (
        <svg width="32" height="20" viewBox="0 0 32 20">
          <rect x="1" y="7" width="30" height="6" rx="3" fill="rgba(255,255,255,0.1)" />
          <rect x="1" y="7" width="18" height="6" rx="3" fill={color} />
        </svg>
      );
    case 'percentage':
      return <span style={{ color, fontWeight: 700, fontSize: 14 }}>45%</span>;
    case 'iconWithBar':
      return (
        <svg width="32" height="20" viewBox="0 0 32 20">
          <circle cx="10" cy="10" r="8" fill="none" stroke={color} strokeWidth="1.5" />
          <path d="M10 2 A8 8 0 1 1 5 17" fill="none" stroke={color} strokeWidth="3" />
          <rect x="22" y="4" width="8" height="12" rx="1" fill="none" stroke={color} strokeWidth="1" />
          <rect x="23" y="8" width="6" height="7" rx="0.5" fill={color} />
        </svg>
      );
    case 'compact':
      return (
        <svg width="32" height="20" viewBox="0 0 32 20">
          <circle cx="16" cy="10" r="5" fill={color} />
        </svg>
      );
  }
}
