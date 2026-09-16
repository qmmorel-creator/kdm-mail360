import { demoProfile, demoLabels, demoThreads, demoFolderCounts, demoDrafts } from '../data/mockData'

// Adaptateur de démonstration. Implémente exactement la même interface que
// GmailAdapter afin que l'UI n'ait jamais besoin de savoir laquelle des deux
// est active. Utilisé par défaut, et en repli si la connexion Gmail échoue.

function clone(obj) { return JSON.parse(JSON.stringify(obj)) }
function delay(ms = 260) { return new Promise((r) => setTimeout(r, ms)) }

export class MockAdapter {
  constructor() {
    this.mode = 'demo'
    this.threads = clone(demoThreads)
  }

  async getProfile() {
    await delay(150)
    return clone(demoProfile)
  }

  async listLabels() {
    await delay(150)
    return clone(demoLabels)
  }

  async listFolderCounts() {
    await delay(100)
    const counts = { ...demoFolderCounts }
    counts.inbox = this.threads.filter((t) => t.folder === 'inbox' && t.unread).length
    counts.drafts = demoDrafts.length
    return counts
  }

  async listThreads({ folder = 'inbox', query = '', tab = 'priority', filters = {} } = {}) {
    await delay(320)
    let list = this.threads.filter((t) => t.folder === folder)
    if (tab === 'unread') list = list.filter((t) => t.unread)
    if (tab === 'attachments') list = list.filter((t) => t.attachments?.length)
    if (filters.labelId) list = list.filter((t) => t.labels?.includes(filters.labelId))
    if (filters.unread === 'unread') list = list.filter((t) => t.unread)
    if (filters.unread === 'read') list = list.filter((t) => !t.unread)
    if (filters.attachment) list = list.filter((t) => t.attachments?.length)
    if (filters.starred) list = list.filter((t) => t.starred)
    if (filters.after) list = list.filter((t) => t.date.slice(0, 10) >= filters.after)
    if (filters.before) list = list.filter((t) => t.date.slice(0, 10) <= filters.before)
    if (query) {
      const q = query.toLowerCase()
      list = this.parseSearch(list, q)
    }
    return list.sort((a, b) => new Date(b.date) - new Date(a.date)).map(clone)
  }

  parseSearch(list, q) {
    // Prend en charge un sous-ensemble de la syntaxe Gmail (from:, subject:, is:unread, has:attachment)
    const tokens = q.split(/\s+/).filter(Boolean)
    return list.filter((t) => {
      return tokens.every((tok) => {
        if (tok.startsWith('from:')) return t.from.email.toLowerCase().includes(tok.slice(5)) || t.from.name.toLowerCase().includes(tok.slice(5))
        if (tok.startsWith('subject:')) return t.subject.toLowerCase().includes(tok.slice(8))
        if (tok === 'is:unread') return t.unread
        if (tok === 'has:attachment') return t.attachments?.length > 0
        return (t.subject + ' ' + t.preview + ' ' + t.from.name).toLowerCase().includes(tok)
      })
    })
  }

  async getThread(id) {
    await delay(220)
    const t = this.threads.find((x) => x.id === id)
    if (!t) throw new Error('Fil introuvable')
    return clone(t)
  }

  async setStarred(id, starred) {
    await delay(120)
    const t = this.threads.find((x) => x.id === id)
    if (t) t.starred = starred
    return { ok: true }
  }

  async setUnread(id, unread) {
    await delay(120)
    const t = this.threads.find((x) => x.id === id)
    if (t) t.unread = unread
    return { ok: true }
  }

  async archiveThread(id) {
    await delay(180)
    const t = this.threads.find((x) => x.id === id)
    if (t) t.folder = 'archive'
    return { ok: true }
  }

  async trashThread(id) {
    await delay(180)
    const t = this.threads.find((x) => x.id === id)
    if (t) t.folder = 'trash'
    return { ok: true }
  }

  async snoozeThread(id) {
    await delay(180)
    const t = this.threads.find((x) => x.id === id)
    if (t) t.folder = 'snoozed'
    return { ok: true }
  }

  async createDraft({ to, subject, body }) {
    await delay(200)
    return { ok: true, draftId: 'draft_' + Date.now() }
  }

  async sendReply({ threadId, body }) {
    await delay(400)
    return { ok: true }
  }

  async sendMessage() {
    await delay(400)
    return { ok: true, demo: true }
  }
}
