import React, { useState, useEffect } from 'react';
import { t } from '../../i18n/translations';
import { useProfiles } from '../../hooks/useAPI';

export const CredentialsTab: React.FC = () => {
  const { activeProfile, reload } = useProfiles();
  const [sessionKey, setSessionKey] = useState('');
  const [validating, setValidating] = useState(false);
  const [status, setStatus] = useState<'none' | 'valid' | 'invalid'>('none');
  const [orgName, setOrgName] = useState('');

  useEffect(() => {
    if (activeProfile?.sessionKey) {
      setSessionKey(activeProfile.sessionKey);
      setStatus('valid');
    }
  }, [activeProfile]);

  const handleValidate = async () => {
    if (!sessionKey.trim()) return;
    setValidating(true);
    setStatus('none');

    const result = await window.electronAPI.validateSessionKey(sessionKey.trim());
    if (result.valid && result.orgId && activeProfile) {
      activeProfile.sessionKey = sessionKey.trim();
      activeProfile.organizationId = result.orgId;
      await window.electronAPI.saveProfile(activeProfile);
      setOrgName(result.orgName ?? '');
      setStatus('valid');
      reload();
    } else {
      setStatus('invalid');
    }
    setValidating(false);
  };

  const maskedKey = sessionKey
    ? sessionKey.substring(0, 15) + '...' + sessionKey.substring(sessionKey.length - 5)
    : '';

  return (
    <div className="tab-content">
      <h2>{t('credentials.sessionKey')}</h2>
      <p className="description">{t('credentials.sessionKey.description')}</p>

      <div className="form-group">
        <label>{t('credentials.sessionKey')}</label>
        <textarea
          className="input-session-key"
          value={sessionKey}
          onChange={e => { setSessionKey(e.target.value); setStatus('none'); }}
          placeholder={t('credentials.sessionKey.placeholder')}
          rows={3}
        />
      </div>

      <div className="form-row">
        <button
          className="btn btn-primary"
          onClick={handleValidate}
          disabled={validating || !sessionKey.trim()}
        >
          {validating ? t('app.loading') : t('credentials.validate')}
        </button>

        {status === 'valid' && (
          <span className="badge badge-success">{t('credentials.connected')}</span>
        )}
        {status === 'invalid' && (
          <span className="badge badge-error">{t('credentials.notConnected')}</span>
        )}
      </div>

      {status === 'valid' && activeProfile && (
        <div className="info-box">
          <div className="info-row">
            <span>{t('credentials.orgId')}:</span>
            <span className="mono">{activeProfile.organizationId}</span>
          </div>
          {orgName && (
            <div className="info-row">
              <span>Organization:</span>
              <span>{orgName}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
