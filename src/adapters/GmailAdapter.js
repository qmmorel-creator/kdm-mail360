// Adaptateur Gmail réel. Utilise directement l'API REST Gmail
// (https://gmail.googleapis.com/gmail/v1) avec le jeton d'accès obtenu via
// Google Identity Services (voir src/auth/googleAuth.js).
//
// Aucun secret client n'est utilisé ni exposé : le flux "token client" GIS
// est un flux public (PKCE-like), adapté à une application 100% front-end.
//
// Cet adaptateur respecte l'interface utilisée par MockAdapter : mêmes noms
// de méthodes, mêmes formes de retour, pour que l'UI puisse basculer de l'un
// à l'autre sans aucune modification.

const API = 'https://gmail.googleapis.com/gmail/v1/users/me'

const FOLDER_TO_LABEL = {
  inbox: 'INBOX',
  sent: 'SENT',
  drafts: 'DRAFT',
  archive: null, // absence de label INBOX = archivé
  trash: 'TRASH',
  followed: 'STARRED',
  snoozed: null, // Gmail ne distingue pas "en attente" dans l'API publique
}

const LABEL_COLORS = ['#4453D6', '#D5484F', '#2E9E77', '#C98A2C', '#E07A4F', '#8B5FBF']

function b64urlDecode(str) {
  try {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = atob(base64)
    // decode UTF-8
    const bytes = Uint8Array.from(decoded, (c) => c.charCodeAt(0))
    return new TextDecoder('utf-8').decode(bytes)
  } catch {
    return ''
  }
}

function headerValue(headers, name) {
  const h = headers.find((x) => x.name.toLowerCase() === name.toLowerCase())
  return h ? h.value : ''
}

function findBody(payload, mimeType) {
  if (!payload) return ''
  if (payload.mimeType === mimeType && payload.body?.data) {
    return b64urlDecode(payload.body.data)
  }
  if (payload.parts) {
    for (const part of payload.parts) {
      const found = findBody(part, mimeType)
      if (found) return found
    }
  }
  return ''
}

function extractAttachments(payload, acc = []) {
  if (!payload) return acc
  if (payload.filename && payload.body?.attachmentId) {
    acc.push({
      name: payload.filename,
      size: formatSize(payload.body.size),
      type: guessType(payload.filename),
      attachmentId: payload.body.attachmentId,
    })
  }
  if (payload.parts) payload.parts.forEach((p) => extractAttachments(p, acc))
  return acc
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' Ko'
  return (bytes / (1024 * 1024)).toFixed(1) + ' Mo'
}

function guessType(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  if (ext === 'pdf') return 'pdf'
  if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'image'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'sheet'
  return 'doc'
}

function initials(name) {
  return (name || '?').split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

function parseFrom(headerVal) {
  const match = headerVal.match(/^(.*)<(.+)>$/)
  if (match) {
    const name = match[1].trim().replace(/^"|"$/g, '') || match[2]
    return { name, email: match[2].trim(), initials: initials(name) }
  }
  return { name: headerVal, email: headerVal, initials: initials(headerVal) }
}

export class GmailAdapter {
  constructor(accessToken) {
    this.mode = 'live'
    this.token = accessToken
    this._labelCache = null
  }

  async _fetch(path, opts = {}) {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...(opts.headers || {}),
      },
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Gmail API ${res.status}: ${text || res.statusText}`)
    }
    if (res.status === 204) return null
    return res.json()
  }

  async getProfile() {
    const data = await this._fetch('/profile')
    return {
      name: data.emailAddress,
      email: data.emailAddress,
      avatarColor: '#4453D6',
      storageUsedGb: null,
      storageTotalGb: null,
      messagesTotal: data.messagesTotal,
    }
  }

  async listLabels() {
    const data = await this._fetch('/labels')
    const userLabels = (data.labels || []).filter((l) => l.type === 'user')
    this._labelCache = userLabels
    return userLabels.map((l, i) => ({
      id: l.id,
      name: l.name,
      color: LABEL_COLORS[i % LABEL_COLORS.length],
      count: undefined, // nécessiterait un appel labels.get par libellé (coûteux) — chargé à la demande si besoin
    }))
  }

  async listFolderCounts() {
    const data = await this._fetch('/labels')
    const byId = {}
    for (const l of data.labels || []) byId[l.id] = l
    return {
      inbox: byId.INBOX?.messagesUnread ?? 0,
      followed: byId.STARRED?.messagesTotal ?? 0,
      snoozed: 0,
      sent: 0,
      drafts: byId.DRAFT?.messagesTotal ?? 0,
      archive: 0,
      trash: byId.TRASH?.messagesTotal ?? 0,
    }
  }

  async listThreads({ folder = 'inbox', query = '', tab = 'priority', filters = {}, pageToken } = {}) {
    const labelId = FOLDER_TO_LABEL[folder]
    let q = query || ''
    if (tab === 'unread') q += ' is:unread'
    if (tab === 'attachments') q += ' has:attachment'
    if (filters.unread === 'unread') q += ' is:unread'
    if (filters.unread === 'read') q += ' is:read'
    if (filters.attachment) q += ' has:attachment'
    if (filters.starred) q += ' is:starred'
    if (filters.after) q += ` after:${filters.after.replaceAll('-', '/')}`
    if (filters.before) q += ` before:${filters.before.replaceAll('-', '/')}`
    if (filters.direction === 'sent') q += ' in:sent'
    if (filters.direction === 'received') q += ' -in:sent'
    if (filters.recipientMode === 'cc') q += ' cc:me'
    if (filters.recipientMode === 'to') q += ' to:me'
    const params = new URLSearchParams({ maxResults: '25' })
    if (labelId) params.set('labelIds', labelId)
    if (filters.labelId) params.append('labelIds', filters.labelId)
    if (folder === 'archive') q += ' -in:inbox -in:trash -in:spam'
    if (q.trim()) params.set('q', q.trim())
    if (pageToken) params.set('pageToken', pageToken)

    const list = await this._fetch(`/threads?${params.toString()}`)
    if (!list.threads) return []

    // Charge chaque fil en mode "metadata" pour construire la liste (léger, pas le corps complet)
    const threads = await Promise.all(
      list.threads.map((t) =>
        this._fetch(`/threads/${t.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=To&metadataHeaders=Cc&metadataHeaders=Date`)
      )
    )
    return threads.map((t) => this._threadToSummary(t))
  }

  _threadToSummary(t) {
    const last = t.messages[t.messages.length - 1]
    const headers = last.payload.headers
    const from = parseFrom(headerValue(headers, 'From'))
    const to = splitAddresses(headerValue(headers, 'To'))
    const cc = splitAddresses(headerValue(headers, 'Cc'))
    const unread = t.messages.some((m) => m.labelIds?.includes('UNREAD'))
    const starred = t.messages.some((m) => m.labelIds?.includes('STARRED'))
    const hasAttachment = t.messages.some((m) => (m.payload.parts || []).some((p) => p.filename))
    return {
      id: t.id,
      folder: last.labelIds?.includes('TRASH') ? 'trash' : last.labelIds?.includes('INBOX') ? 'inbox' : 'archive',
      starred,
      unread,
      from,
      to,
      cc,
      direction: last.labelIds?.includes('SENT') ? 'sent' : 'received',
      subject: headerValue(headers, 'Subject') || '(sans objet)',
      preview: last.snippet || '',
      date: new Date(parseInt(last.internalDate, 10)).toISOString(),
      messageCount: t.messages.length,
      labels: (last.labelIds || []).filter((l) => this._labelCache?.some((label) => label.id === l)),
      attachments: hasAttachment ? [{ name: '', size: '', type: 'doc' }] : [],
    }
  }

  async getThread(id) {
    const t = await this._fetch(`/threads/${id}?format=full`)
    const last = t.messages[t.messages.length - 1]
    const headers = last.payload.headers
    const from = parseFrom(headerValue(headers, 'From'))
    const html = findBody(last.payload, 'text/html')
    const text = html ? null : findBody(last.payload, 'text/plain')
    const attachments = extractAttachments(last.payload)
    return {
      id: t.id,
      folder: last.labelIds?.includes('TRASH') ? 'trash' : 'inbox',
      starred: last.labelIds?.includes('STARRED'),
      unread: last.labelIds?.includes('UNREAD'),
      from,
      to: (headerValue(headers, 'To') || '').split(',').map((s) => s.trim()).filter(Boolean),
      cc: splitAddresses(headerValue(headers, 'Cc')),
      direction: last.labelIds?.includes('SENT') ? 'sent' : 'received',
      subject: headerValue(headers, 'Subject') || '(sans objet)',
      preview: last.snippet || '',
      date: new Date(parseInt(last.internalDate, 10)).toISOString(),
      messageCount: t.messages.length,
      labels: (last.labelIds || []).filter((l) => this._labelCache?.some((label) => label.id === l)),
      attachments,
      bodyHtml: html || null,
      body: text ? text.split(/\n{2,}/) : (html ? null : [last.snippet || '']),
      signoff: '',
      statusSteps: null,
      summary: null, // le résumé IA nécessite un appel séparé (voir README) — jamais inventé côté client
      tasks: [], // idem : la détection de tâches nécessite une analyse du contenu, non inventée ici
    }
  }

  async setStarred(id, starred) {
    return this._modifyThread(id, starred ? { addLabelIds: ['STARRED'] } : { removeLabelIds: ['STARRED'] })
  }

  async setUnread(id, unread) {
    return this._modifyThread(id, unread ? { addLabelIds: ['UNREAD'] } : { removeLabelIds: ['UNREAD'] })
  }

  async archiveThread(id) {
    return this._modifyThread(id, { removeLabelIds: ['INBOX'] })
  }

  async trashThread(id) {
    await this._fetch(`/threads/${id}/trash`, { method: 'POST' })
    return { ok: true }
  }

  async snoozeThread(id) {
    // L'API Gmail publique n'expose pas la fonctionnalité "Mettre en attente" de l'interface Gmail.
    // On retire simplement de la boîte de réception à titre d'approximation ; à affiner selon besoin.
    return this._modifyThread(id, { removeLabelIds: ['INBOX'] })
  }

  async _modifyThread(id, body) {
    await this._fetch(`/threads/${id}/modify`, { method: 'POST', body: JSON.stringify(body) })
    return { ok: true }
  }

  async createDraft({ to, subject, body, threadId, attachments = [] }) {
    const raw = await this._buildRawMessage({ to, subject, body, attachments })
    const res = await this._fetch('/drafts', {
      method: 'POST',
      body: JSON.stringify({ message: { raw, threadId } }),
    })
    return { ok: true, draftId: res.id }
  }

  async sendReply({ to, subject, body, threadId, attachments = [] }) {
    const raw = await this._buildRawMessage({ to, subject, body, attachments })
    const res = await this._fetch('/messages/send', {
      method: 'POST',
      body: JSON.stringify({ raw, threadId }),
    })
    return { ok: true, id: res.id }
  }

  async sendMessage({ to, subject, body, attachments = [] }) {
    return this.sendReply({ to, subject, body, attachments })
  }

  async _buildRawMessage({ to, subject, body, attachments = [] }) {
    let str
    if (attachments.length === 0) {
      str = [`To: ${to || ''}`, `Subject: ${encodeHeader(subject || '')}`, 'MIME-Version: 1.0', 'Content-Type: text/plain; charset="UTF-8"', '', body || ''].join('\r\n')
    } else {
      const boundary = `mail360_${Date.now()}_${Math.random().toString(36).slice(2)}`
      const parts = [`To: ${to || ''}`, `Subject: ${encodeHeader(subject || '')}`, 'MIME-Version: 1.0', `Content-Type: multipart/mixed; boundary="${boundary}"`, '', `--${boundary}`, 'Content-Type: text/plain; charset="UTF-8"', 'Content-Transfer-Encoding: 8bit', '', body || '']
      for (const file of attachments) {
        const bytes = new Uint8Array(await file.arrayBuffer())
        parts.push(`--${boundary}`, `Content-Type: ${file.type || 'application/octet-stream'}; name="${file.name}"`, 'Content-Transfer-Encoding: base64', `Content-Disposition: attachment; filename="${file.name}"`, '', bytesToBase64(bytes).replace(/.{1,76}/g, '$&\r\n'))
      }
      parts.push(`--${boundary}--`, '')
      str = parts.join('\r\n')
    }
    const bytes = new TextEncoder().encode(str)
    return bytesToBase64(bytes).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }
}

function splitAddresses(value) {
  return (value || '').split(',').map((s) => s.trim()).filter(Boolean)
}

function bytesToBase64(bytes) {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  return btoa(binary)
}

function encodeHeader(value) {
  const bytes = new TextEncoder().encode(value)
  return `=?UTF-8?B?${bytesToBase64(bytes)}?=`
}
