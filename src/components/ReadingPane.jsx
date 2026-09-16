import React, { useState } from 'react'
import DOMPurify from 'dompurify'
import {
  IconArchive, IconAlert as IconSpam, IconTrash, IconMailOpen, IconChevLeft, IconChevRight,
  IconStar, IconReply, IconReplyAll, IconForward, IconMoreH, IconFile, IconSmile, IconBold,
  IconLink, IconPaperclip, IconSend, IconExternal, IconMail,
} from './Icons'
import { colorFromString } from '../utils/format'
import AttachmentPicker from './AttachmentPicker'

const FILE_COLORS = { pdf: '#D5484F', image: '#4453D6', sheet: '#2E9E77', doc: '#8890A6' }

function AttachmentCard({ file }) {
  return (
    <div className="attachment-card">
      <div className="attachment-card__icon" style={{ background: FILE_COLORS[file.type] || '#8890A6' }}>
        {(file.type || 'doc').slice(0, 3).toUpperCase()}
      </div>
      <div style={{ minWidth: 0 }}>
        <div className="attachment-card__name">{file.name || 'Pièce jointe'}</div>
        <div className="attachment-card__size">{file.size}</div>
      </div>
    </div>
  )
}

export default function ReadingPane({
  thread, loading, mode, onBack, onQuickAction, onToggleStar,
  onSend, contextOpen, onOpenContext, labels = [], onSelectLabel,
}) {
  const labelById = Object.fromEntries(labels.map((l) => [l.id, l.name]))
  const [replyText, setReplyText] = useState('')
  const [confirmSend, setConfirmSend] = useState(false)
  const [replyAttachments, setReplyAttachments] = useState([])
  const [showAttachments, setShowAttachments] = useState(false)

  if (loading) {
    return (
      <section className="reading-pane" aria-label="Lecture du message">
        <div className="loading-state">Chargement du message…</div>
      </section>
    )
  }

  if (!thread) {
    return (
      <section className="reading-pane" aria-label="Lecture du message">
        <div className="empty-state">
          <IconMail />
          <div className="empty-state__title">Sélectionnez un message</div>
          <div className="empty-state__hint">Choisissez un message dans la liste pour l'afficher ici.</div>
        </div>
      </section>
    )
  }

  const handleSend = () => {
    if (!replyText.trim()) return
    if (!confirmSend) { setConfirmSend(true); return }
    onSend(thread.id, replyText, replyAttachments)
    setReplyText('')
    setReplyAttachments([])
    setConfirmSend(false)
  }

  return (
    <section className="reading-pane" aria-label="Lecture du message">
      <div className="reading-pane__toolbar">
        <button className="back-btn" onClick={onBack} aria-label="Retour à la liste">
          <IconChevLeft /> Retour
        </button>
        <button className="rp-action" onClick={() => onQuickAction(thread.id, 'archive')}><IconArchive /> Archiver</button>
        <button className="rp-action danger" onClick={() => onQuickAction(thread.id, 'spam')}><IconSpam /> Spam</button>
        <button className="rp-action danger" onClick={() => onQuickAction(thread.id, 'trash')}><IconTrash /> Supprimer</button>
        <button className="rp-action" onClick={() => onQuickAction(thread.id, 'toggleRead')}><IconMailOpen /> Marquer non lu</button>
        <button className="rp-action" aria-label="Autres actions"><IconMoreH /></button>
        <span className="spacer" />
        <button className="toolbar__ghost" aria-label="Message précédent"><IconChevLeft /></button>
        <button className="toolbar__ghost" aria-label="Message suivant"><IconChevRight /></button>
        {!contextOpen && (
          <button className="rp-action" onClick={onOpenContext}>Panneau intelligent</button>
        )}
      </div>

      <div className="reading-pane__body">
        <div className="rp-header">
          <div className="rp-labels">
            <span className="rp-folder-select">Boîte de réception <span aria-hidden="true">▾</span></span>
            {thread.labels?.map((l) => (
              <button key={l} className="chip chip-button" style={{ background: 'var(--c-accent-soft)', color: 'var(--c-accent)' }} onClick={() => onSelectLabel(l)}>{labelById[l] || l}</button>
            ))}
          </div>
          <h2 className="rp-subject">{thread.subject}</h2>
          <div className="rp-from-row">
            <div className="avatar rp-avatar" style={{ background: colorFromString(thread.from.email || thread.from.name) }} aria-hidden="true">
              {thread.from.initials}
            </div>
            <div>
              <div className="rp-from-name">{thread.from.name}</div>
              <div className="rp-from-meta">
                à {thread.to?.length ? thread.to.join(', ') : 'moi'}
              </div>
            </div>
            <div className="rp-time">
              {new Date(thread.date).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
              <button
                className={`rp-star${thread.starred ? ' is-starred' : ''}`}
                onClick={() => onToggleStar(thread.id, !thread.starred)}
                aria-label={thread.starred ? 'Retirer l\u2019étoile' : 'Ajouter une étoile'}
              >
                <IconStar />
              </button>
              <button className="toolbar__ghost" aria-label="Autres actions du message"><IconMoreH /></button>
            </div>
          </div>
        </div>

        <div className="rp-content">
          {thread.bodyHtml ? (
            <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(thread.bodyHtml, { USE_PROFILES: { html: true } }) }} />
          ) : (
            thread.body?.map((p, i) => <p key={i}>{p}</p>)
          )}
          {thread.signoff && (
            <p className="rp-signoff">{thread.signoff.split('\n').map((l, i) => <React.Fragment key={i}>{l}<br /></React.Fragment>)}</p>
          )}
        </div>

        {thread.statusSteps && (
          <div className="status-card">
            <div className="status-card__head">
              <span className="status-card__title"><IconFile /> Projet Atlas — statut actuel</span>
              <a className="status-card__link" href="#" onClick={(e) => e.preventDefault()}>Voir dans l'espace <IconExternal /></a>
            </div>
            <div className="status-steps">
              {thread.statusSteps.map((s, i) => (
                <div key={i} className={`status-step is-${s.state}`}>
                  <div className="status-step__line" />
                  <div className="status-step__dot">{s.state === 'done' ? '✓' : i + 1}</div>
                  <div className="status-step__label">{s.label}</div>
                  <div className="status-step__sub">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {thread.attachments?.length > 0 && (
          <div className="attachments-row">
            {thread.attachments.map((f, i) => <AttachmentCard key={i} file={f} />)}
          </div>
        )}
      </div>

      <div className="rp-quick-actions">
        <button className="qa-btn" onClick={() => document.getElementById('reply-input')?.focus()}><IconReply /> Répondre</button>
        <button className="qa-btn" onClick={() => document.getElementById('reply-input')?.focus()}><IconReplyAll /> Répondre à tous</button>
        <button className="qa-btn"><IconForward /> Transférer</button>
      </div>

      <div className="compose-bar">
        <div className="avatar compose-bar__avatar" style={{ background: 'var(--c-accent)' }} aria-hidden="true">Q</div>
        <textarea
          id="reply-input"
          className="compose-bar__input"
          rows={1}
          placeholder={`Répondre à ${thread.from.name}…`}
          value={replyText}
          onChange={(e) => { setReplyText(e.target.value); setConfirmSend(false) }}
          aria-label="Répondre"
        />
        <div className="compose-bar__tools">
          <button aria-label="Mise en forme" title="Mise en forme"><IconBold /></button>
          <button aria-label="Insérer un lien" title="Insérer un lien"><IconLink /></button>
          <button onClick={() => setShowAttachments((v) => !v)} aria-label="Joindre un fichier" title="Joindre un fichier"><IconPaperclip /></button>
          <button aria-label="Insérer un émoji" title="Insérer un émoji"><IconSmile /></button>
        </div>
        <button
          className="compose-bar__send"
          onClick={handleSend}
          disabled={!replyText.trim()}
          aria-label={confirmSend ? 'Confirmer l\u2019envoi' : 'Envoyer'}
          title={confirmSend ? 'Cliquez à nouveau pour confirmer l\u2019envoi' : 'Envoyer'}
        >
          <IconSend />
        </button>
      </div>
      {showAttachments && <AttachmentPicker files={replyAttachments} onChange={setReplyAttachments} compact />}
      {confirmSend && (
        <div style={{ padding: '0 24px 12px', fontSize: 12.5, color: 'var(--c-text-faint)' }}>
          Cliquez de nouveau sur Envoyer pour confirmer — le message n'a pas encore été envoyé.
        </div>
      )}
    </section>
  )
}
