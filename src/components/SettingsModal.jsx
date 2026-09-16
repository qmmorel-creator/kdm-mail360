import React, { useState } from 'react'

export default function SettingsModal({ mode, clientId, onClose, onSwitchDemo, onConnectGmail, connecting, error }) {
  const [localClientId, setLocalClientId] = useState(clientId || '')

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Paramètres de connexion" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Source des données</h2>
        <p>
          Mail360 peut fonctionner en mode démonstration (données fictives) ou connecté à votre vrai
          compte Gmail. Le connecteur Gmail de Claude ne fonctionne que dans les conversations Claude :
          une fois ce site déployé sur Netlify, la connexion Gmail passe par votre propre identifiant
          OAuth Google (aucun secret n'est nécessaire ni stocké).
        </p>

        <div className="mode-toggle">
          <button className={mode === 'demo' ? 'is-active' : ''} onClick={onSwitchDemo}>Mode démonstration</button>
          <button className={mode === 'live' ? 'is-active' : ''} onClick={() => {}} disabled>
            Gmail réel
          </button>
        </div>

        <label htmlFor="client-id">Client ID OAuth Google (créé dans Google Cloud Console)</label>
        <input
          id="client-id"
          type="text"
          placeholder="xxxxxxxx.apps.googleusercontent.com"
          value={localClientId}
          onChange={(e) => setLocalClientId(e.target.value)}
        />
        {error && (
          <p style={{ color: 'var(--c-danger)', marginTop: -8 }}>{error}</p>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Fermer</button>
          <button
            className="btn-primary"
            onClick={() => onConnectGmail(localClientId.trim())}
            disabled={connecting || !localClientId.trim()}
          >
            {connecting ? 'Connexion…' : 'Connecter Gmail'}
          </button>
        </div>
      </div>
    </div>
  )
}
