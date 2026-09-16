import React from 'react'
import { IconInbox, IconStar, IconClock, IconSend, IconFile, IconArchive, IconTrash, IconSettings } from './Icons'
import { colorFromString } from '../utils/format'

const items = [
  { id: 'inbox', label: 'Boîte de réception', icon: IconInbox },
  { id: 'followed', label: 'Messages suivis', icon: IconStar },
  { id: 'snoozed', label: 'En attente', icon: IconClock },
  { id: 'sent', label: 'Messages envoyés', icon: IconSend },
  { id: 'drafts', label: 'Brouillons', icon: IconFile },
  { id: 'archive', label: 'Archives', icon: IconArchive },
  { id: 'trash', label: 'Corbeille', icon: IconTrash },
]

export default function IconRail({ activeFolder, onSelectFolder, onOpenSettings, profile }) {
  return (
    <nav className="icon-rail" aria-label="Navigation principale">
      <div className="icon-rail__logo" aria-hidden="true">M</div>
      {items.map((it) => (
        <button
          key={it.id}
          className={`icon-btn${activeFolder === it.id ? ' is-active' : ''}`}
          onClick={() => onSelectFolder(it.id)}
          aria-label={it.label}
          aria-current={activeFolder === it.id ? 'page' : undefined}
          title={it.label}
        >
          <it.icon />
        </button>
      ))}
      <div className="icon-rail__spacer" />
      <button className="icon-btn" onClick={onOpenSettings} aria-label="Paramètres" title="Paramètres">
        <IconSettings />
      </button>
      <div className="icon-rail__avatar" aria-hidden="true">
        {profile ? (
          <div style={{ width: '100%', height: '100%', background: colorFromString(profile.email || profile.name), display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 700 }}>
            {(profile.name || '?').slice(0, 1).toUpperCase()}
          </div>
        ) : null}
      </div>
    </nav>
  )
}
