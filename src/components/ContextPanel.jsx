import React from 'react'
import {
  IconX, IconSparkle, IconCheckSquare, IconUser, IconMail, IconPhone, IconMapPin, IconExternal,
} from './Icons'
import { colorFromString } from '../utils/format'

const TABS = [
  { id: 'summary', label: 'Résumé' },
  { id: 'tasks', label: 'Tâches' },
  { id: 'contact', label: 'Contact' },
]

export default function ContextPanel({ thread, tab, onTabChange, onClose, onCreateTask, isOpen }) {
  return (
    <aside className={`context-panel${isOpen ? ' is-open' : ''}`} aria-label="Panneau contextuel intelligent">
      <div className="context-panel__tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={`ctx-tab${tab === t.id ? ' is-active' : ''}`}
            onClick={() => onTabChange(t.id)}
          >
            {t.label}
          </button>
        ))}
        <button className="context-panel__close" onClick={onClose} aria-label="Fermer le panneau">
          <IconX />
        </button>
      </div>

      <div className="context-panel__body">
        {!thread ? (
          <div className="empty-state">
            <div className="empty-state__hint">Sélectionnez un message pour voir son résumé, ses tâches et le contact associé.</div>
          </div>
        ) : tab === 'summary' ? (
          <SummaryTab thread={thread} />
        ) : tab === 'tasks' ? (
          <TasksTab thread={thread} onCreateTask={onCreateTask} />
        ) : (
          <ContactTab thread={thread} />
        )}
      </div>
    </aside>
  )
}

function SummaryTab({ thread }) {
  return (
    <div className="panel-card">
      <div className="panel-card__head">
        <span className="panel-card__icon"><IconSparkle /></span>
        <span className="panel-card__title">Résumé par IA</span>
      </div>
      {thread.summary?.length ? (
        <ul className="summary-list">
          {thread.summary.map((s, i) => <li key={i}>{s}</li>)}
        </ul>
      ) : (
        <p className="summary-empty">
          Résumé non disponible pour ce mode. La génération de résumé nécessite un appel à un modèle
          d'analyse qui n'est pas connecté dans cette configuration — aucune information n'est inventée.
        </p>
      )}
    </div>
  )
}

function TasksTab({ thread, onCreateTask }) {
  return (
    <div className="panel-card">
      <div className="panel-card__head">
        <span className="panel-card__icon"><IconCheckSquare /></span>
        <span className="panel-card__title">Actions détectées</span>
        {!!thread.tasks?.length && <span className="panel-card__badge">{thread.tasks.length}</span>}
      </div>
      {thread.tasks?.length ? (
        thread.tasks.map((t) => (
          <div className="task-item" key={t.id}>
            <button className="checkbox task-item__check" aria-label="Marquer la tâche comme faite" />
            <div style={{ flex: 1 }}>
              <div className="task-item__title">{t.title}</div>
              {t.due && <span className="task-item__due">{t.due}</span>}
              {!t.due && !t.owner && (
                <button className="task-create-btn" style={{ marginTop: 6 }} onClick={() => onCreateTask(thread, t)}>
                  Créer la tâche dans Nexora
                </button>
              )}
            </div>
            {t.owner && (
              <div className="task-item__owner" style={{ background: colorFromString(t.owner) }} aria-hidden="true" />
            )}
          </div>
        ))
      ) : (
        <p className="summary-empty">Aucune action explicitement demandée n'a été détectée dans ce message.</p>
      )}
      {thread.tasks?.length > 0 && (
        <button className="task-create-btn" onClick={() => onCreateTask(thread, null)}>
          Créer toutes les tâches dans Nexora
        </button>
      )}
    </div>
  )
}

function ContactTab({ thread }) {
  const from = thread.from
  return (
    <>
      <div className="panel-card">
        <div className="contact-block">
          <div className="avatar contact-avatar" style={{ background: colorFromString(from.email || from.name) }} aria-hidden="true">
            {from.initials}
          </div>
          <div className="contact-name">
            {from.name}
            {from.online && <span className="online-dot" aria-label="En ligne" />}
          </div>
          {from.role && <div className="contact-role">{from.role}{from.org ? ` — ${from.org}` : ''}</div>}
          {from.location && (
            <div className="contact-loc"><IconMapPin /> {from.location}</div>
          )}
        </div>
        <div className="contact-field"><IconMail /> <a href={`mailto:${from.email}`}>{from.email}</a></div>
        {from.phone && (
          <div className="contact-field"><IconPhone /> {from.phone}</div>
        )}
        <button className="contact-full-btn">Filtrer les messages de ce contact</button>
      </div>
    </>
  )
}
