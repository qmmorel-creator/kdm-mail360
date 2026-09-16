import React from 'react'
import {
  IconSearch, IconFilter, IconRefresh, IconCheckSquare, IconStar, IconPaperclip,
  IconArchive, IconTrash, IconClock, IconMailOpen, IconInbox,
} from './Icons'
import { timeLabel, groupLabel, colorFromString } from '../utils/format'

const TABS = [
  { id: 'priority', label: 'Prioritaire' },
  { id: 'all', label: 'Tous' },
  { id: 'unread', label: 'Non lus' },
  { id: 'attachments', label: 'Pièces jointes' },
]

function Skeleton() {
  return (
    <div aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="skeleton-row" key={i}>
          <div className="skeleton avatar-sk" />
          <div className="skeleton-lines">
            <div className="skeleton" style={{ height: 11, width: '45%' }} />
            <div className="skeleton" style={{ height: 11, width: '70%' }} />
            <div className="skeleton" style={{ height: 10, width: '55%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function MessageList({
  threads, loading, selectedThreadId, onSelectThread,
  searchQuery, onSearchChange, onSubmitSearch,
  tab, onTabChange, unreadCount, onRefresh,
  selectedIds, onToggleSelect, onToggleStar, onQuickAction,
  activeFolderLabel,
}) {
  const groups = []
  let lastLabel = null
  for (const t of threads) {
    const label = groupLabel(t.date)
    if (label !== lastLabel) {
      groups.push({ label, items: [] })
      lastLabel = label
    }
    groups[groups.length - 1].items.push(t)
  }

  return (
    <section className="message-pane" aria-label="Liste des messages">
      <div className="message-pane__search" role="search">
        <IconSearch />
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSubmitSearch() }}
          placeholder="Rechercher dans les messages"
          aria-label="Rechercher dans les messages"
        />
        <span className="kbd">⌘K</span>
      </div>

      <div className="message-pane__tabs" role="tablist" aria-label="Filtrer les messages">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`tab-btn${tab === t.id ? ' is-active' : ''}`}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
            {t.id === 'priority' && unreadCount > 0 && <span className="tab-btn__badge">{unreadCount}</span>}
          </button>
        ))}
        <button className="toolbar__ghost" style={{ marginLeft: 'auto' }} aria-label="Filtres avancés" title="Filtres avancés">
          <IconFilter />
        </button>
      </div>

      <div className="message-pane__toolbar">
        <div className="toolbar__left">
          <button className="toolbar__ghost" aria-label="Tout sélectionner" title="Tout sélectionner">
            <IconCheckSquare />
          </button>
          <button className="toolbar__ghost" onClick={onRefresh} aria-label="Actualiser" title="Actualiser">
            <IconRefresh />
          </button>
        </div>
        <div className="sort-select">Les plus récents</div>
      </div>

      <div className="message-list" role="list">
        {loading ? (
          <Skeleton />
        ) : threads.length === 0 ? (
          <div className="empty-state">
            <IconInbox />
            <div className="empty-state__title">Aucun message ici</div>
            <div className="empty-state__hint">
              {searchQuery ? 'Aucun résultat pour cette recherche.' : `${activeFolderLabel} est vide pour le moment.`}
            </div>
          </div>
        ) : (
          groups.map((g) => (
            <div key={g.label}>
              <div className="message-list__group-label">{g.label}</div>
              {g.items.map((t) => (
                <div
                  key={t.id}
                  role="listitem"
                  tabIndex={0}
                  className={`message-row${t.unread ? ' is-unread' : ''}${selectedThreadId === t.id ? ' is-selected' : ''}`}
                  onClick={() => onSelectThread(t.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSelectThread(t.id) }}
                >
                  <div className="message-row__check-star">
                    <button
                      className={`checkbox${selectedIds.has(t.id) ? ' is-checked' : ''}`}
                      onClick={(e) => { e.stopPropagation(); onToggleSelect(t.id) }}
                      aria-label="Sélectionner le message"
                    >
                      {selectedIds.has(t.id) && <IconCheckSquare />}
                    </button>
                    <button
                      className={`star-btn${t.starred ? ' is-starred' : ''}`}
                      onClick={(e) => { e.stopPropagation(); onToggleStar(t.id, !t.starred) }}
                      aria-label={t.starred ? 'Retirer l\u2019étoile' : 'Ajouter une étoile'}
                    >
                      <IconStar />
                    </button>
                  </div>

                  <div className="avatar" style={{ background: colorFromString(t.from.email || t.from.name) }} aria-hidden="true">
                    {t.from.initials}
                  </div>

                  <div className="message-row__body">
                    <div className="message-row__top">
                      <span className="message-row__sender">{t.from.name}</span>
                      {t.unread && <span className="unread-dot" aria-label="Non lu" />}
                      {t.messageCount > 1 && <span className="message-row__thread-count">({t.messageCount})</span>}
                      <span className="message-row__time">{timeLabel(t.date)}</span>
                    </div>
                    <div className="message-row__subject">{t.subject}</div>
                    <div className="message-row__preview">
                      {t.preview}
                      {t.attachments?.length > 0 && (
                        <span className="attach-pill"><IconPaperclip /> {t.attachments.length}</span>
                      )}
                    </div>
                    {t.labels?.length > 0 && (
                      <div className="message-row__meta-row">
                        {t.labels.map((lid) => (
                          <span key={lid} className="chip" style={{ background: 'var(--c-accent-soft)', color: 'var(--c-accent)' }}>{lid}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="message-row__actions" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => onQuickAction(t.id, 'archive')} aria-label="Archiver" title="Archiver"><IconArchive /></button>
                    <button onClick={() => onQuickAction(t.id, 'toggleRead')} aria-label="Marquer comme lu ou non lu" title="Marquer comme lu/non lu"><IconMailOpen /></button>
                    <button onClick={() => onQuickAction(t.id, 'snooze')} aria-label="Mettre en attente" title="Mettre en attente"><IconClock /></button>
                    <button onClick={() => onQuickAction(t.id, 'trash')} aria-label="Supprimer" title="Supprimer"><IconTrash /></button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
