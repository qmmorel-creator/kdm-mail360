import React from 'react'
import { IconInbox, IconStar, IconClock, IconSend, IconFile, IconArchive, IconTrash, IconPlus, IconAlert, IconCheckCircle } from './Icons'

const folderItems = [
  { id: 'inbox', label: 'Boîte de réception', icon: IconInbox, countKey: 'inbox' },
  { id: 'followed', label: 'Messages suivis', icon: IconStar, countKey: 'followed' },
  { id: 'snoozed', label: 'En attente', icon: IconClock, countKey: 'snoozed' },
  { id: 'sent', label: 'Messages envoyés', icon: IconSend, countKey: 'sent' },
  { id: 'drafts', label: 'Brouillons', icon: IconFile, countKey: 'drafts' },
  { id: 'archive', label: 'Archives', icon: IconArchive, countKey: 'archive' },
  { id: 'trash', label: 'Corbeille', icon: IconTrash, countKey: 'trash' },
]

export default function NavSidebar({ mode, activeFolder, onSelectFolder, folderCounts, labels, profile, onOpenSettings }) {
  const usedRatio = profile?.storageUsedGb && profile?.storageTotalGb
    ? Math.min(100, (profile.storageUsedGb / profile.storageTotalGb) * 100)
    : null

  return (
    <aside className="nav-sidebar" aria-label="Dossiers et libellés">
      <h1 className="nav-sidebar__title">Mail360</h1>

      <button
        className={`mode-banner ${mode === 'demo' ? 'demo' : 'live'}`}
        onClick={onOpenSettings}
        title={mode === 'demo' ? 'Mode démonstration — cliquez pour connecter Gmail' : 'Connecté à Gmail'}
      >
        {mode === 'demo' ? <IconAlert /> : <IconCheckCircle />}
        {mode === 'demo' ? 'Mode démonstration' : 'Gmail connecté'}
      </button>

      <button className="btn-compose" onClick={() => onSelectFolder('__compose__')}>
        <IconPlus /> Nouveau message
      </button>

      <ul className="nav-list">
        {folderItems.map((it) => (
          <li key={it.id}>
            <button
              className={`nav-item${activeFolder === it.id ? ' is-active' : ''}`}
              onClick={() => onSelectFolder(it.id)}
              aria-current={activeFolder === it.id ? 'page' : undefined}
            >
              <it.icon />
              <span className="nav-item__label">{it.label}</span>
              {!!folderCounts?.[it.countKey] && (
                <span className="nav-item__count">{folderCounts[it.countKey]}</span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="nav-section">
        <span className="nav-section__title">Libellés</span>
        <button className="nav-section__add" aria-label="Créer ou gérer les libellés" title="Créer ou gérer les libellés">
          <IconPlus />
        </button>
      </div>
      <ul className="nav-list">
        {labels?.map((l) => (
          <li key={l.id}>
            <button className="nav-item" onClick={() => onSelectFolder('inbox', l.id)}>
              <span className="label-dot" style={{ background: l.color }} />
              <span className="nav-item__label">{l.name}</span>
              {!!l.count && <span className="nav-item__count">{l.count}</span>}
            </button>
          </li>
        ))}
      </ul>

      <div className="nav-sidebar__spacer" />

      {profile && (
        <div className="storage">
          {usedRatio !== null ? (
            <>
              <div className="storage__bar"><div className="storage__fill" style={{ width: `${usedRatio}%` }} /></div>
              {profile.storageUsedGb} Go sur {profile.storageTotalGb} Go utilisés
            </>
          ) : (
            <>{profile.messagesTotal ? `${profile.messagesTotal} messages` : profile.email}</>
          )}
        </div>
      )}
    </aside>
  )
}
