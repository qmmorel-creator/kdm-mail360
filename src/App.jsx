import React, { useEffect, useMemo, useState, useCallback } from 'react'
import IconRail from './components/IconRail'
import NavSidebar from './components/NavSidebar'
import MessageList from './components/MessageList'
import ReadingPane from './components/ReadingPane'
import ContextPanel from './components/ContextPanel'
import SettingsModal from './components/SettingsModal'
import ToastStack from './components/ToastStack'
import { MockAdapter } from './adapters/MockAdapter'
import { GmailAdapter } from './adapters/GmailAdapter'
import { requestAccessToken, getStoredClientId, setStoredClientId } from './auth/googleAuth'

const FOLDER_LABELS = {
  inbox: 'La boîte de réception',
  followed: 'Les messages suivis',
  snoozed: 'Les messages en attente',
  sent: 'Les messages envoyés',
  drafts: 'Les brouillons',
  archive: 'Les archives',
  trash: 'La corbeille',
}

let toastSeq = 1

export default function App() {
  const [mode, setMode] = useState('demo')
  const [adapter, setAdapter] = useState(() => new MockAdapter())

  const [profile, setProfile] = useState(null)
  const [labels, setLabels] = useState([])
  const [folderCounts, setFolderCounts] = useState({})

  const [activeFolder, setActiveFolder] = useState('inbox')
  const [tab, setTab] = useState('priority')
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [threads, setThreads] = useState([])
  const [threadsLoading, setThreadsLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState(new Set())

  const [selectedThreadId, setSelectedThreadId] = useState(null)
  const [selectedThread, setSelectedThread] = useState(null)
  const [threadLoading, setThreadLoading] = useState(false)

  const [contextTab, setContextTab] = useState('summary')
  const [contextOpen, setContextOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [mobileView, setMobileView] = useState('list')

  const [settingsOpen, setSettingsOpen] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [authError, setAuthError] = useState('')

  const [toasts, setToasts] = useState([])

  const pushToast = useCallback((message, undoable, onUndo) => {
    const id = toastSeq++
    setToasts((prev) => [...prev, { id, message, undoable, onUndo }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000)
  }, [])

  const undoToast = (id) => {
    const t = toasts.find((x) => x.id === id)
    if (t?.onUndo) t.onUndo()
    setToasts((prev) => prev.filter((x) => x.id !== id))
  }

  // ---------- Chargement initial / changement de mode ----------
  useEffect(() => {
    let cancelled = false
    async function loadShell() {
      try {
        const [p, l, c] = await Promise.all([
          adapter.getProfile(),
          adapter.listLabels(),
          adapter.listFolderCounts(),
        ])
        if (cancelled) return
        setProfile(p)
        setLabels(l)
        setFolderCounts(c)
      } catch (e) {
        pushToast("Impossible de charger le compte Gmail : " + e.message, false)
      }
    }
    loadShell()
    return () => { cancelled = true }
  }, [adapter])

  // ---------- Chargement de la liste des fils ----------
  const loadThreads = useCallback(async () => {
    setThreadsLoading(true)
    try {
      const list = await adapter.listThreads({ folder: activeFolder, query: searchQuery, tab })
      setThreads(list)
    } catch (e) {
      pushToast('Erreur de chargement des messages : ' + e.message, false)
      setThreads([])
    } finally {
      setThreadsLoading(false)
    }
  }, [adapter, activeFolder, searchQuery, tab, pushToast])

  useEffect(() => { loadThreads() }, [loadThreads])

  // ---------- Sélection d'un fil ----------
  const openThread = useCallback(async (id) => {
    setSelectedThreadId(id)
    setMobileView('read')
    setThreadLoading(true)
    setContextTab('summary')
    try {
      const t = await adapter.getThread(id)
      setSelectedThread(t)
      if (t.unread) {
        adapter.setUnread(id, false).catch(() => {})
        setThreads((prev) => prev.map((x) => (x.id === id ? { ...x, unread: false } : x)))
      }
    } catch (e) {
      pushToast('Impossible d\u2019ouvrir ce message : ' + e.message, false)
    } finally {
      setThreadLoading(false)
    }
  }, [adapter, pushToast])

  // ---------- Actions optimistes ----------
  const applyLocal = (id, patch) => {
    setThreads((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
    setSelectedThread((prev) => (prev?.id === id ? { ...prev, ...patch } : prev))
  }

  const toggleStar = async (id, starred) => {
    applyLocal(id, { starred })
    try {
      await adapter.setStarred(id, starred)
    } catch (e) {
      applyLocal(id, { starred: !starred })
      pushToast('L\u2019étoile n\u2019a pas pu être mise à jour.', false)
    }
  }

  const quickAction = async (id, action) => {
    const before = threads.find((t) => t.id === id)
    try {
      if (action === 'archive') {
        setThreads((prev) => prev.filter((t) => t.id !== id))
        await adapter.archiveThread(id)
        pushToast('Message archivé.', true, () => loadThreads())
      } else if (action === 'trash' || action === 'spam') {
        setThreads((prev) => prev.filter((t) => t.id !== id))
        await adapter.trashThread(id)
        pushToast(action === 'spam' ? 'Message signalé comme indésirable.' : 'Message supprimé.', true, () => loadThreads())
      } else if (action === 'snooze') {
        setThreads((prev) => prev.filter((t) => t.id !== id))
        await adapter.snoozeThread(id)
        pushToast('Message mis en attente.', true, () => loadThreads())
      } else if (action === 'toggleRead') {
        const nextUnread = !(before?.unread)
        applyLocal(id, { unread: nextUnread })
        await adapter.setUnread(id, nextUnread)
      }
    } catch (e) {
      if (before) setThreads((prev) => (prev.some((t) => t.id === id) ? prev : [...prev, before]))
      pushToast('Gmail a refusé cette action, retour en arrière.', false)
    }
  }

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const sendReply = async (threadId, body) => {
    try {
      await adapter.sendReply({ threadId, to: selectedThread?.from?.email, subject: 'Re: ' + (selectedThread?.subject || ''), body })
      pushToast('Message envoyé.', false)
    } catch (e) {
      pushToast('L\u2019envoi a échoué : ' + e.message, false)
    }
  }

  const createNexoraTask = (thread, task) => {
    // La création réelle dans Nexora nécessite le connecteur Nexora, disponible
    // uniquement dans une conversation Claude — pas depuis ce site statique déployé.
    // Aucune tâche n'est créée silencieusement : on informe clairement l'utilisateur.
    pushToast(
      task ? `« ${task.title} » n\u2019a pas pu être créée : Nexora n\u2019est pas connecté sur ce déploiement.`
        : 'Nexora n\u2019est pas connecté sur ce déploiement.',
      false
    )
  }

  const handleSelectFolder = (folder, labelId) => {
    if (folder === '__compose__') { pushToast('Ouverture d\u2019un nouveau message…', false); return }
    setActiveFolder(folder)
    setTab('priority')
    setSelectedThreadId(null)
    setSelectedThread(null)
    setNavOpen(false)
  }

  const handleConnectGmail = async (clientId) => {
    setAuthError('')
    setConnecting(true)
    try {
      const token = await requestAccessToken(clientId)
      setStoredClientId(clientId)
      const gmail = new GmailAdapter(token)
      // Vérifie que le jeton fonctionne avant de basculer réellement
      await gmail.getProfile()
      setAdapter(gmail)
      setMode('live')
      setSelectedThreadId(null)
      setSelectedThread(null)
      setSettingsOpen(false)
    } catch (e) {
      setAuthError(e.message || 'La connexion à Gmail a échoué.')
    } finally {
      setConnecting(false)
    }
  }

  const switchToDemo = () => {
    setAdapter(new MockAdapter())
    setMode('demo')
    setSelectedThreadId(null)
    setSelectedThread(null)
  }

  const unreadCount = useMemo(() => threads.filter((t) => t.unread).length, [threads])

  return (
    <div className={`app-shell${contextOpen ? '' : ''} view-${mobileView}`}>
      <IconRail
        activeFolder={activeFolder}
        onSelectFolder={handleSelectFolder}
        onOpenSettings={() => setSettingsOpen(true)}
        profile={profile}
      />

      <NavSidebar
        mode={mode}
        activeFolder={activeFolder}
        onSelectFolder={handleSelectFolder}
        folderCounts={folderCounts}
        labels={labels}
        profile={profile}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      <MessageList
        threads={threads}
        loading={threadsLoading}
        selectedThreadId={selectedThreadId}
        onSelectThread={openThread}
        searchQuery={searchInput}
        onSearchChange={setSearchInput}
        onSubmitSearch={() => setSearchQuery(searchInput)}
        tab={tab}
        onTabChange={setTab}
        unreadCount={unreadCount}
        onRefresh={loadThreads}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onToggleStar={toggleStar}
        onQuickAction={quickAction}
        activeFolderLabel={FOLDER_LABELS[activeFolder] || 'Ce dossier'}
      />

      <ReadingPane
        thread={selectedThread}
        loading={threadLoading}
        mode={mode}
        onBack={() => setMobileView('list')}
        onQuickAction={quickAction}
        onToggleStar={toggleStar}
        onSend={sendReply}
        contextOpen={contextOpen}
        onOpenContext={() => setContextOpen(true)}
      />

      <ContextPanel
        thread={selectedThread}
        tab={contextTab}
        onTabChange={setContextTab}
        onClose={() => setContextOpen(false)}
        onCreateTask={createNexoraTask}
        isOpen={contextOpen}
      />

      {settingsOpen && (
        <SettingsModal
          mode={mode}
          clientId={getStoredClientId()}
          onClose={() => setSettingsOpen(false)}
          onSwitchDemo={switchToDemo}
          onConnectGmail={handleConnectGmail}
          connecting={connecting}
          error={authError}
        />
      )}

      <ToastStack toasts={toasts} onUndo={undoToast} />
    </div>
  )
}
