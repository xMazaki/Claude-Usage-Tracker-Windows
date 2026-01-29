import React, { useState } from 'react';
import { t } from '../i18n/translations';
import { CredentialsTab } from './settings/CredentialsTab';
import { ProfilesTab } from './settings/ProfilesTab';
import { DisplayTab } from './settings/DisplayTab';
import { NotificationsTab } from './settings/NotificationsTab';
import { GeneralTab } from './settings/GeneralTab';
import { AboutTab } from './settings/AboutTab';

type Tab = 'credentials' | 'profiles' | 'display' | 'notifications' | 'general' | 'about';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('credentials');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'credentials', label: t('settings.tab.credentials') },
    { key: 'profiles', label: t('settings.tab.profiles') },
    { key: 'display', label: t('settings.tab.display') },
    { key: 'notifications', label: t('settings.tab.notifications') },
    { key: 'general', label: t('settings.tab.general') },
    { key: 'about', label: t('settings.tab.about') },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'credentials': return <CredentialsTab />;
      case 'profiles': return <ProfilesTab />;
      case 'display': return <DisplayTab />;
      case 'notifications': return <NotificationsTab />;
      case 'general': return <GeneralTab />;
      case 'about': return <AboutTab />;
    }
  };

  return (
    <div className="settings">
      <div className="settings-sidebar">
        <div className="settings-sidebar-header">
          <div className="settings-logo">C</div>
          <span>{t('settings.title')}</span>
        </div>
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`settings-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="settings-content">
        {renderTab()}
      </div>
    </div>
  );
};
