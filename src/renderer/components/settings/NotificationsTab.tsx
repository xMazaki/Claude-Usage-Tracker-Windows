import React, { useEffect, useState } from 'react';
import { t } from '../../i18n/translations';
import { useProfiles } from '../../hooks/useAPI';

export const NotificationsTab: React.FC = () => {
  const { activeProfile, reload } = useProfiles();
  const [thresholds, setThresholds] = useState<number[]>([75, 90, 95]);

  useEffect(() => {
    if (activeProfile?.notificationThresholds) {
      setThresholds(activeProfile.notificationThresholds);
    }
  }, [activeProfile]);

  const toggleThreshold = async (value: number) => {
    if (!activeProfile) return;
    let newThresholds: number[];
    if (thresholds.includes(value)) {
      newThresholds = thresholds.filter(t => t !== value);
    } else {
      newThresholds = [...thresholds, value].sort((a, b) => a - b);
    }
    setThresholds(newThresholds);
    activeProfile.notificationThresholds = newThresholds;
    await window.electronAPI.saveProfile(activeProfile);
    reload();
  };

  return (
    <div className="tab-content">
      <h2>{t('notifications.thresholds')}</h2>
      <p className="description">
        {t('notifications.enable')}
      </p>

      <div className="threshold-list">
        {[75, 90, 95].map(val => (
          <label key={val} className="checkbox-label">
            <input
              type="checkbox"
              checked={thresholds.includes(val)}
              onChange={() => toggleThreshold(val)}
            />
            {t(`notifications.threshold${val}`)}
          </label>
        ))}
      </div>
    </div>
  );
};
