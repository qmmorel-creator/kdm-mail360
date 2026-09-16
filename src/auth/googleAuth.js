// Authentification Gmail côté client, via Google Identity Services (GIS).
//
// Ce flux "token client" ne nécessite AUCUN secret : seul un Client ID OAuth
// public (créé par l'utilisateur dans Google Cloud Console) est utilisé.
// C'est le seul mécanisme compatible avec un site statique déployé sur
// Netlify (le connecteur Gmail de Claude ne fonctionne que dans les
// conversations Claude — il ne peut pas être embarqué dans ce site).
//
// Le jeton d'accès obtenu n'est JAMAIS persisté (pas de localStorage) :
// il reste en mémoire le temps de la session, et une reconnexion est
// nécessaire après rechargement de la page.

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
].join(' ')

let tokenClient = null
let currentToken = null
let currentClientId = null

export function isGisLoaded() {
  return typeof window !== 'undefined' && !!window.google?.accounts?.oauth2
}

export function getStoredClientId() {
  try {
    return sessionStorage.getItem('mail360_client_id') || ''
  } catch {
    return ''
  }
}

export function setStoredClientId(clientId) {
  try {
    sessionStorage.setItem('mail360_client_id', clientId)
  } catch {
    // ignore — sessionStorage indisponible
  }
}

export function getAccessToken() {
  return currentToken
}

export function requestAccessToken(clientId) {
  return new Promise((resolve, reject) => {
    if (!isGisLoaded()) {
      reject(new Error('Google Identity Services n\u2019a pas pu se charger (bloqué par le réseau ou un bloqueur de scripts).'))
      return
    }
    if (!clientId) {
      reject(new Error('Aucun Client ID OAuth Google n\u2019a été renseigné.'))
      return
    }
    if (!tokenClient || currentClientId !== clientId) {
      currentClientId = clientId
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: () => {},
      })
    }
    tokenClient.callback = (resp) => {
      if (resp.error) {
        reject(new Error(resp.error_description || resp.error))
        return
      }
      currentToken = resp.access_token
      resolve(resp.access_token)
    }
    tokenClient.requestAccessToken({ prompt: currentToken ? '' : 'consent' })
  })
}

export function revokeAccessToken() {
  if (currentToken && window.google?.accounts?.oauth2) {
    window.google.accounts.oauth2.revoke(currentToken, () => {})
  }
  currentToken = null
}
