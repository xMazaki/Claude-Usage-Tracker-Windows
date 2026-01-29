import React, { useState } from 'react';
import { t } from '../../i18n/translations';
import { useProfiles } from '../../hooks/useAPI';
import { Profile } from '../../../shared/types';

export const ProfilesTab: React.FC = () => {
  const { profiles, activeProfile, reload } = useProfiles();
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    await window.electronAPI.createProfile(newName.trim());
    setNewName('');
    reload();
  };

  const handleDelete = async (id: string) => {
    if (profiles.length <= 1) return;
    if (confirm(t('profiles.deleteConfirm'))) {
      await window.electronAPI.deleteProfile(id);
      reload();
    }
  };

  const handleSetActive = async (id: string) => {
    await window.electronAPI.setActiveProfile(id);
    reload();
  };

  const handleRename = async (profile: Profile) => {
    if (!editName.trim()) return;
    profile.name = editName.trim();
    await window.electronAPI.saveProfile(profile);
    setEditingId(null);
    reload();
  };

  const handleToggleTray = async (profile: Profile) => {
    profile.displayInTray = !profile.displayInTray;
    await window.electronAPI.saveProfile(profile);
    reload();
  };

  return (
    <div className="tab-content">
      <h2>{t('profiles.title')}</h2>

      <div className="profiles-list">
        {profiles.map(p => (
          <div key={p.id} className={`profile-card ${p.id === activeProfile?.id ? 'active' : ''}`}>
            <div className="profile-card-header">
              {editingId === p.id ? (
                <div className="profile-edit-name">
                  <input
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRename(p)}
                    autoFocus
                  />
                  <button className="btn btn-sm" onClick={() => handleRename(p)}>{t('app.save')}</button>
                  <button className="btn btn-sm" onClick={() => setEditingId(null)}>{t('app.cancel')}</button>
                </div>
              ) : (
                <div className="profile-name-row">
                  <span className="profile-name" onDoubleClick={() => { setEditingId(p.id); setEditName(p.name); }}>
                    {p.name}
                  </span>
                  {p.id === activeProfile?.id && <span className="badge badge-success">{t('profiles.active')}</span>}
                </div>
              )}
            </div>

            <div className="profile-card-actions">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={p.displayInTray}
                  onChange={() => handleToggleTray(p)}
                />
                {t('profiles.showInTray')}
              </label>

              <div className="profile-btns">
                {p.id !== activeProfile?.id && (
                  <button className="btn btn-sm btn-primary" onClick={() => handleSetActive(p.id)}>
                    {t('profiles.setActive')}
                  </button>
                )}
                {profiles.length > 1 && (
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p.id)}>
                    {t('app.delete')}
                  </button>
                )}
              </div>
            </div>

            <div className="profile-status">
              <span className={`status-indicator ${p.sessionKey ? 'connected' : 'disconnected'}`} />
              <span>{p.sessionKey ? t('credentials.connected') : t('credentials.notConnected')}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="add-profile">
        <input
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          placeholder={t('profiles.name')}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button className="btn btn-primary" onClick={handleAdd} disabled={!newName.trim()}>
          {t('profiles.add')}
        </button>
      </div>
    </div>
  );
};
