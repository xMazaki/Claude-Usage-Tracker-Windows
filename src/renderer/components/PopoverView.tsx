import React, { useState, useEffect } from 'react';
import { t } from '../i18n/translations';
import { useProfiles, useUsage, useClaudeStatus, useSettings } from '../hooks/useAPI';

interface Props {
  onOpenSettings: () => void;
}

function StatusIcon({ value }: { value: number }) {
  if (value < 75) return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="#5cb85c" strokeWidth="2"/>
      <path d="M6 10l3 3 5-5" stroke="#5cb85c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
      <path d="M10 1l2.245 6.91h7.266l-5.878 4.272 2.245 6.91L10 14.82l-5.878 4.272 2.245-6.91L.49 7.91h7.266z" fill="#e8a04e"/>
    </svg>
  );
}

function getBarColor(value: number): string {
  if (value < 50) return '#5cb85c';
  if (value < 75) return '#7bc67b';
  if (value < 85) return '#e8a04e';
  return '#d45230';
}

function formatResetDate(resetTime?: string): string | null {
  if (!resetTime) return null;
  const d = new Date(resetTime);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
  if (isToday) return `Today ${time}`;
  const month = d.toLocaleString('en', { month: 'short' });
  return `${month} ${d.getDate()}, ${time}`;
}

export const PopoverView: React.FC<Props> = ({ onOpenSettings }) => {
  const { profiles, activeProfile, reload: reloadProfiles } = useProfiles();
  const { settings } = useSettings();
  const claudeStatus = useClaudeStatus();
  const { usage, loading, refresh } = useUsage(
    activeProfile?.id,
    activeProfile?.refreshInterval ?? 30
  );

  const [selectedProfileId, setSelectedProfileId] = useState('');

  useEffect(() => {
    if (activeProfile) setSelectedProfileId(activeProfile.id);
  }, [activeProfile?.id]);

  const handleProfileChange = async (id: string) => {
    setSelectedProfileId(id);
    await window.electronAPI.setActiveProfile(id);
    reloadProfiles();
  };

  const handleMinimize = () => window.electronAPI.minimizePopover();
  const showRemaining = settings?.showRemaining ?? true;
  const hasKey = activeProfile && activeProfile.sessionKey;

  const getStatusColor = () => {
    switch (claudeStatus.status) {
      case 'operational': return '#5cb85c';
      case 'degraded': return '#e8a04e';
      case 'major_outage': return '#d45230';
      default: return '#8a8a8a';
    }
  };

  const safeVal = (v?: number) => (v == null || isNaN(v)) ? 0 : Math.max(0, Math.min(100, v));
  const displayVal = (v: number) => showRemaining ? Math.max(0, 100 - v) : v;

  return (
    <div className="popover">
      {/* Header */}
      <div className="popover-header">
        <div className="popover-header-left">
          <div className="popover-logo">C</div>
          <div>
            <div className="popover-app-name">{t('app.title')}</div>
            <div className="popover-status-row">
              <span className="status-dot" style={{ backgroundColor: getStatusColor() }} />
              <span className="popover-status-text">{t(`popover.status.${claudeStatus.status}`)}</span>
            </div>
          </div>
        </div>
        <div className="popover-header-right">
          <button className="btn-refresh" onClick={refresh} disabled={loading} title={t('app.refresh')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={loading ? 'spin' : ''}>
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          </button>
          <button className="btn-window" onClick={handleMinimize} title="Minimize">
            <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1" y="4.5" width="8" height="1.2" rx="0.6" fill="currentColor"/></svg>
          </button>
        </div>
      </div>

      {/* Profile Selector */}
      {profiles.length > 1 && (
        <div className="profile-selector">
          <select value={selectedProfileId} onChange={e => handleProfileChange(e.target.value)}>
            {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
      )}

      {/* Content */}
      <div className="popover-content">
        {!hasKey ? (
          <div className="no-data">
            <div className="no-data-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d98f40" strokeWidth="1.5">
                <path d="M12 15h.01M12 9v3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
              </svg>
            </div>
            <p>{t('popover.configureFirst')}</p>
            <button className="btn btn-primary" onClick={onOpenSettings}>{t('app.settings')}</button>
          </div>
        ) : loading && !usage ? (
          <div className="no-data"><div className="spinner"/><p>{t('app.loading')}</p></div>
        ) : usage ? (
          <>
            {/* Session Usage Card */}
            <div className="usage-card">
              <div className="usage-card-header">
                <div>
                  <div className="usage-card-title">{t('popover.sessionUsage')}</div>
                  <div className="usage-card-sub">{t('popover.sessionSub')}</div>
                </div>
                <div className="usage-card-pct">
                  <StatusIcon value={safeVal(usage.fiveHour)} />
                  <span className="pct-value" style={{ color: getBarColor(safeVal(usage.fiveHour)) }}>
                    {displayVal(safeVal(usage.fiveHour))}%
                  </span>
                </div>
              </div>
              <div className="usage-bar-track">
                <div className="usage-bar-fill" style={{ width: `${safeVal(usage.fiveHour)}%`, backgroundColor: getBarColor(safeVal(usage.fiveHour)) }}/>
              </div>
              {usage.resetTime && (
                <div className="usage-card-reset">
                  {t('popover.resetsToday')} {formatResetDate(usage.resetTime)?.replace('Today ', '')}
                </div>
              )}
            </div>

            {/* Weekly Card */}
            <div className="usage-card">
              <div className="usage-card-header">
                <div>
                  <div className="usage-card-title">{t('popover.weekly')}</div>
                  <div className="usage-card-sub">{t('popover.weeklySub')}</div>
                </div>
                <div className="usage-card-pct">
                  <StatusIcon value={safeVal(usage.sevenDay)} />
                  <span className="pct-value" style={{ color: getBarColor(safeVal(usage.sevenDay)) }}>
                    {displayVal(safeVal(usage.sevenDay))}%
                  </span>
                </div>
              </div>
              <div className="usage-bar-track">
                <div className="usage-bar-fill" style={{ width: `${safeVal(usage.sevenDay)}%`, backgroundColor: getBarColor(safeVal(usage.sevenDay)) }}/>
              </div>
              {usage.resetTime && (
                <div className="usage-card-reset">
                  {t('popover.resets')} {formatResetDate(usage.resetTime)}
                </div>
              )}
            </div>

            {/* Extra Usage Card */}
            <div className="usage-card usage-card-extra">
              <div className="usage-card-header">
                <div>
                  <div className="usage-card-title">{t('popover.extra')}</div>
                  <div className="usage-card-sub">
                    {safeVal(usage.extraUsage) > 0
                      ? `${(safeVal(usage.extraUsage) * 0.25).toFixed(2)} / 25.00 EUR`
                      : '0.00 / 25.00 EUR'}
                  </div>
                </div>
                <div className="usage-card-pct">
                  {safeVal(usage.extraUsage) >= 50 && (
                    <svg width="14" height="14" viewBox="0 0 20 20" fill="#e8a04e">
                      <path d="M10 0L12 7h7l-5.5 4.5 2 7L10 14l-5.5 4.5 2-7L1 7h7z"/>
                    </svg>
                  )}
                  <span className="pct-value" style={{ color: safeVal(usage.extraUsage) > 50 ? '#e8a04e' : '#5cb85c' }}>
                    {displayVal(safeVal(usage.extraUsage))}%
                  </span>
                </div>
              </div>
              <div className="usage-bar-track">
                <div className="usage-bar-fill" style={{ width: `${safeVal(usage.extraUsage)}%`, backgroundColor: safeVal(usage.extraUsage) > 50 ? '#e8a04e' : '#5cb85c' }}/>
              </div>
            </div>

            {/* API Credits Card */}
            <div className="usage-card usage-card-api">
              <div className="usage-card-header">
                <div>
                  <div className="usage-card-title">{t('popover.apiCredits')}</div>
                  <div className="usage-card-sub">{t('popover.apiSub')}</div>
                </div>
                <div className="usage-card-pct">
                  <span className="pct-value" style={{ color: '#5cb85c' }}>0%</span>
                </div>
              </div>
              <div className="usage-bar-track">
                <div className="usage-bar-fill" style={{ width: '0%', backgroundColor: '#5cb85c' }}/>
              </div>
              <div className="api-credits-row">
                <div className="api-credits-col">
                  <span className="api-credits-label">{t('popover.used')}</span>
                  <span className="api-credits-amount">US$0.00</span>
                </div>
                <div className="api-credits-col api-credits-right">
                  <span className="api-credits-label">{t('popover.remaining')}</span>
                  <span className="api-credits-amount">US$0.00</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="no-data"><p>{t('popover.noData')}</p></div>
        )}
      </div>

      {/* Footer */}
      <div className="popover-footer">
        <button className="footer-btn" onClick={onOpenSettings}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          <span>{t('app.settings')}</span>
        </button>
        <button className="footer-btn footer-btn-quit" onClick={() => window.electronAPI.quitApp()}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/>
          </svg>
          <span>{t('app.quit')}</span>
        </button>
      </div>
    </div>
  );
};
