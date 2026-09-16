export function timeLabel(iso) {
  const date = new Date(iso)
  const now = new Date()
  const sameDay = date.toDateString() === now.toDateString()
  if (sameDay) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
}

export function groupLabel(iso) {
  const date = new Date(iso)
  const now = new Date()
  const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const diffDays = Math.round((startOf(now) - startOf(date)) / (24 * 3600 * 1000))
  if (diffDays <= 0) return "Aujourd'hui"
  if (diffDays === 1) return 'Hier'
  if (diffDays < 7) return date.toLocaleDateString('fr-FR', { weekday: 'long' })
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })
}

export function relativeLabel(iso) {
  const date = new Date(iso)
  const now = new Date()
  const diffH = Math.round((now - date) / 3600000)
  if (diffH < 1) return "à l'instant"
  if (diffH < 24) return `il y a ${diffH} heure${diffH > 1 ? 's' : ''}`
  const diffD = Math.round(diffH / 24)
  return `il y a ${diffD} jour${diffD > 1 ? 's' : ''}`
}

export function colorFromString(str) {
  const palette = ['#4453D6', '#2E9E77', '#C98A2C', '#D5484F', '#8B5FBF', '#2C8FC9', '#C9648A']
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}
