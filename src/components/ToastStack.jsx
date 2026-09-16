import React from 'react'

export default function ToastStack({ toasts, onUndo }) {
  if (!toasts.length) return null
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((t) => (
        <div className="toast" key={t.id}>
          <span>{t.message}</span>
          {t.undoable && (
            <button className="toast__undo" onClick={() => onUndo(t.id)}>Annuler</button>
          )}
        </div>
      ))}
    </div>
  )
}
