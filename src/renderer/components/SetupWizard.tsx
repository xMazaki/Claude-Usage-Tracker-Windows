import React, { useState } from 'react';
import { t } from '../i18n/translations';

interface Props {
  onComplete: () => void;
}

type Step = 'input' | 'validating' | 'success' | 'error';

export const SetupWizard: React.FC<Props> = ({ onComplete }) => {
  const [sessionKey, setSessionKey] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');

  const handleValidate = async () => {
    if (!sessionKey.trim()) return;
    setStep('validating');
    setError('');

    try {
      const result = await window.electronAPI.validateSessionKey(sessionKey.trim());
      if (result.valid && result.orgId) {
        setOrgName(result.orgName ?? '');

        // Save to active profile
        const profile = await window.electronAPI.getActiveProfile();
        if (profile) {
          profile.sessionKey = sessionKey.trim();
          profile.organizationId = result.orgId;
          await window.electronAPI.saveProfile(profile);
        }
        setStep('success');
      } else {
        setStep('error');
        setError(t('setup.step2.error'));
      }
    } catch {
      setStep('error');
      setError(t('setup.step2.error'));
    }
  };

  return (
    <div className="setup-wizard">
      <div className="setup-header">
        <div className="setup-logo">C</div>
        <h1>{t('setup.title')}</h1>
        <p className="setup-subtitle">{t('setup.subtitle')}</p>
      </div>

      <div className="setup-content">
        {(step === 'input' || step === 'error') && (
          <div className="setup-step">
            <h2>{t('setup.step1.title')}</h2>
            <p className="setup-description">{t('setup.step1.description')}</p>
            <textarea
              className="input-session-key"
              value={sessionKey}
              onChange={e => setSessionKey(e.target.value)}
              placeholder={t('setup.step1.placeholder')}
              rows={3}
            />
            {error && <p className="setup-error">{error}</p>}
            <button
              className="btn btn-primary btn-lg"
              onClick={handleValidate}
              disabled={!sessionKey.trim()}
            >
              {t('credentials.validate')}
            </button>
          </div>
        )}

        {step === 'validating' && (
          <div className="setup-step setup-center">
            <div className="spinner" />
            <p>{t('setup.validating')}</p>
          </div>
        )}

        {step === 'success' && (
          <div className="setup-step setup-center">
            <div className="success-icon">&#10003;</div>
            <h2>{t('setup.step3.title')}</h2>
            {orgName && (
              <p className="org-name">{t('setup.step2.orgFound')} {orgName}</p>
            )}
            <p className="setup-description">{t('setup.step3.description')}</p>
            <button className="btn btn-primary btn-lg" onClick={onComplete}>
              {t('setup.done')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
