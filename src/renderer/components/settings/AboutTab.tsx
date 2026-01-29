import React from 'react';
import { t } from '../../i18n/translations';

export const AboutTab: React.FC = () => {
  return (
    <div className="tab-content about-tab">
      <div className="about-header">
        <div className="about-logo">C</div>
        <h1>Claude Usage Tracker</h1>
        <p className="about-subtitle">{t('about.description')}</p>
      </div>

      <div className="about-info">
        <div className="info-row">
          <span>{t('about.version')}</span>
          <span>1.0.0</span>
        </div>
        <div className="info-row">
          <span>{t('about.author')}</span>
          <a
            className="about-link"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.electronAPI.openExternal('https://x.com/mazaki_eth');
            }}
          >
            @mazaki_eth
          </a>
        </div>
      </div>

      <div className="about-inspired">
        <p>{t('about.inspiredBy')}</p>
        <a
          className="about-link"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.electronAPI.openExternal('https://github.com/hamed-elfayome/Claude-Usage-Tracker');
          }}
        >
          Claude-Usage-Tracker (macOS)
        </a>
      </div>

      <div className="about-footer">
        <p>MIT License</p>
      </div>
    </div>
  );
};
