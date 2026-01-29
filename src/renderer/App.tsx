import React, { useState, useEffect } from 'react';
import { setLanguage, LangKey } from './i18n/translations';
import { PopoverView } from './components/PopoverView';
import { SettingsView } from './components/SettingsView';
import { SetupWizard } from './components/SetupWizard';
import { useSettings } from './hooks/useAPI';

type View = 'popover' | 'settings' | 'setup';

const App: React.FC = () => {
  const [view, setView] = useState<View>('popover');
  const [lang, setLang] = useState<LangKey>('en');
  const { settings } = useSettings();

  useEffect(() => {
    if (settings) {
      setLanguage(settings.language);
      setLang(settings.language); // trigger re-render for all components
    }
  }, [settings?.language]);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'settings') {
      setView('settings');
      return;
    }
    window.electronAPI.needsSetup().then((needs) => {
      if (needs) setView('setup');
    });
  }, []);

  const onSetupComplete = () => setView('popover');
  const onOpenSettings = () => window.electronAPI.openSettings();

  // key={lang} forces full re-render when language changes
  switch (view) {
    case 'setup':
      return <SetupWizard key={lang} onComplete={onSetupComplete} />;
    case 'settings':
      return <SettingsView key={lang} />;
    default:
      return <PopoverView key={lang} onOpenSettings={onOpenSettings} />;
  }
};

export default App;
