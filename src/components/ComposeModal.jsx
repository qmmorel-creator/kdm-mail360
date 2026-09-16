import React, { useState } from 'react'

export default function ComposeModal({ onClose, onSend, sending }) {
  const [to, setTo] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const valid = to.trim() && body.trim()

  const submit = async (e) => {
    e.preventDefault()
    if (!valid || sending) return
    await onSend({ to: to.trim(), subject: subject.trim(), body })
  }

  return (
    <div className="modal-overlay" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <form className="compose-modal" role="dialog" aria-modal="true" aria-labelledby="compose-title" onSubmit={submit}>
        <header><h2 id="compose-title">Nouveau message</h2><button type="button" onClick={onClose} aria-label="Fermer">×</button></header>
        <label>À<input type="email" value={to} onChange={(e) => setTo(e.target.value)} required autoFocus /></label>
        <label>Objet<input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} /></label>
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Écrivez votre message…" required />
        <footer><button type="button" className="btn-secondary" onClick={onClose}>Annuler</button><button className="btn-primary" disabled={!valid || sending}>{sending ? 'Envoi…' : 'Envoyer'}</button></footer>
      </form>
    </div>
  )
}
