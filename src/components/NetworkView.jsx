import React, { useMemo } from 'react'

const COLORS = {
  human: '#2563EB', cc: '#8B5CF6', advertising: '#F97316', newsletter: '#EF4444',
  service: '#22A447', automatic: '#7A8499', sent: '#0F9FA5',
}

const CATEGORY_LABELS = {
  human: 'Humain', cc: 'CC : en copie', advertising: 'Publicité', newsletter: 'Newsletters',
  service: 'Services & factures', automatic: 'Notifications automatiques', sent: 'Envoyés par moi',
}

function classify(thread) {
  if (thread.folder === 'sent' || thread.direction === 'sent') return 'sent'
  if (thread.cc?.length) return 'cc'
  const haystack = `${thread.from?.email || ''} ${thread.subject || ''}`.toLowerCase()
  if (/newsletter|digest|medium|substack/.test(haystack)) return 'newsletter'
  if (/no-?reply|notification|github|notion|atlassian/.test(haystack)) return 'automatic'
  if (/promo|offre|airbnb|adobe|amazon|publicit/.test(haystack)) return 'advertising'
  if (/facture|paiement|stripe|edf|google|dropbox/.test(haystack)) return 'service'
  return 'human'
}

export default function NetworkView({ threads, loading, filters, onFiltersChange, labels }) {
  const visibleThreads = useMemo(() => threads.filter((thread) => {
    const category = thread.classification || classify(thread)
    return (!filters.category || category === filters.category) && (thread.messageCount || 1) >= (Number(filters.minMessages) || 1)
  }), [threads, filters.category, filters.minMessages])
  const groups = useMemo(() => {
    const map = new Map()
    for (const thread of visibleThreads) {
      const category = thread.classification || classify(thread)
      if (!map.has(category)) map.set(category, [])
      map.get(category).push(thread)
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length)
  }, [visibleThreads])
  const positions = [
    [30, 26], [72, 22], [79, 52], [68, 78], [34, 78], [20, 55], [51, 14],
  ]
  const total = visibleThreads.reduce((sum, t) => sum + (t.messageCount || 1), 0)
  const human = groups.find(([key]) => key === 'human')?.[1].length || 0
  const automatic = visibleThreads.length - human

  const set = (key, value) => onFiltersChange({ ...filters, [key]: value })
  const reset = () => onFiltersChange({ labelId: '', unread: '', attachment: false, starred: false, after: '', before: '', direction: '', recipientMode: '', category: '', minMessages: 1 })

  return (
    <section className="network-view" aria-label="Réseau des emails">
      <header className="network-head">
        <div><h1>Réseau de vos emails</h1><p>Flux, expéditeurs et modes de réception</p></div>
        <div className="network-metrics">
          <span><b>{total}</b> messages</span><span><b>{human}</b> humains</span><span><b>{automatic}</b> automatisés</span>
        </div>
      </header>
      <div className="network-filters">
        <label>Depuis<input type="date" value={filters.after} onChange={(e) => set('after', e.target.value)} /></label>
        <label>Jusqu’au<input type="date" value={filters.before} onChange={(e) => set('before', e.target.value)} /></label>
        <select aria-label="Période rapide" defaultValue="" onChange={(e) => {
          const days = Number(e.target.value)
          if (!days) return
          const date = new Date(); date.setDate(date.getDate() - days)
          set('after', date.toISOString().slice(0, 10))
        }}><option value="">Période rapide</option><option value="1">Aujourd’hui</option><option value="7">7 jours</option><option value="30">30 jours</option><option value="365">1 an</option></select>
        <select value={filters.unread} onChange={(e) => set('unread', e.target.value)} aria-label="État de lecture"><option value="">Tous</option><option value="unread">Non lus</option><option value="read">Lus</option></select>
        <select value={filters.labelId} onChange={(e) => set('labelId', e.target.value)} aria-label="Libellé"><option value="">Tous les libellés</option>{labels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}</select>
        <select value={filters.attachment ? 'with' : ''} onChange={(e) => set('attachment', e.target.value === 'with')} aria-label="Pièces jointes"><option value="">Toutes les pièces jointes</option><option value="with">Avec pièce jointe</option></select>
        <select value={filters.direction || ''} onChange={(e) => set('direction', e.target.value)} aria-label="Sens du flux"><option value="">Reçus et envoyés</option><option value="received">Reçus</option><option value="sent">Envoyés</option></select>
        <select value={filters.recipientMode || ''} onChange={(e) => set('recipientMode', e.target.value)} aria-label="Mode de réception"><option value="">À et CC</option><option value="to">À : principal</option><option value="cc">CC : en copie</option></select>
        <select value={filters.category || ''} onChange={(e) => set('category', e.target.value)} aria-label="Catégorie"><option value="">Toutes les catégories</option>{Object.entries(CATEGORY_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
        <label>Minimum<input type="number" min="1" max="99" value={filters.minMessages || 1} onChange={(e) => set('minMessages', Number(e.target.value) || 1)} /></label>
        <button onClick={reset}>Réinitialiser</button>
      </div>
      <div className={`network-canvas${loading ? ' is-loading' : ''}`}>
        <svg viewBox="0 0 100 100" role="img" aria-label="Graphe des échanges email">
          {groups.map(([key, items], index) => {
            const [x, y] = positions[index % positions.length]
            const color = COLORS[key] || COLORS.human
            const dashed = key === 'cc'
            return <g key={key}>
              <line x1="50" y1="50" x2={x} y2={y} stroke={color} strokeWidth={Math.min(2.2, .45 + items.length * .16)} strokeDasharray={dashed ? '2 1.5' : undefined} markerEnd="url(#arrow)" />
              {items.slice(0, 5).map((t, childIndex) => {
                const angle = (childIndex - Math.min(items.length, 5) / 2) * .28
                const cx = x + Math.cos(angle) * 12
                const cy = y + Math.sin(angle) * 12
                return <g key={t.id}><line x1={x} y1={y} x2={cx} y2={cy} stroke={color} strokeOpacity=".55" strokeWidth=".35" /><circle cx={cx} cy={cy} r="1.5" fill={color} /><text x={cx + 2} y={cy + .6} className="network-contact">{t.from?.name || t.subject}</text></g>
              })}
              <circle cx={x} cy={y} r={Math.min(7, 3.7 + items.length * .35)} fill={color} />
              <text x={x} y={y + .7} textAnchor="middle" className="network-node-count">{items.length}</text>
              <text x={x} y={y + 8} textAnchor="middle" className="network-node-label">{CATEGORY_LABELS[key] || key}</text>
            </g>
          })}
          <defs><marker id="arrow" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto"><path d="M0,0 L4,2 L0,4 z" fill="#6B7280" /></marker></defs>
          <circle cx="50" cy="50" r="8" fill="#164BDB" /><text x="50" y="49" textAnchor="middle" className="network-me">Moi</text><text x="50" y="53" textAnchor="middle" className="network-me-count">{total}</text>
        </svg>
        {visibleThreads.length === 0 && !loading && <div className="network-empty">Aucun échange ne correspond aux filtres.</div>}
      </div>
      <footer className="network-legend">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => <span key={key}><i style={{ background: COLORS[key] }} />{label}</span>)}
        <span className="legend-line">— lien direct (À)</span><span className="legend-line">- - copie (CC)</span>
      </footer>
    </section>
  )
}
