import React, { useRef, useState } from 'react'
import { IconPaperclip, IconTrash } from './Icons'

const MAX_TOTAL_BYTES = 25 * 1024 * 1024

export default function AttachmentPicker({ files, onChange, compact = false }) {
  const inputRef = useRef(null)
  const [error, setError] = useState('')

  const addFiles = (incoming) => {
    const next = [...files]
    for (const file of Array.from(incoming || [])) {
      if (!next.some((f) => f.name === file.name && f.size === file.size)) next.push(file)
    }
    if (next.reduce((sum, f) => sum + f.size, 0) > MAX_TOTAL_BYTES) {
      setError('La taille totale des pièces jointes dépasse 25 Mo.')
      return
    }
    setError('')
    onChange(next)
  }

  return (
    <div
      className={`attachment-picker${compact ? ' is-compact' : ''}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files) }}
    >
      <input ref={inputRef} type="file" multiple hidden onChange={(e) => { addFiles(e.target.files); e.target.value = '' }} />
      <button type="button" className="attachment-add" onClick={() => inputRef.current?.click()}>
        <IconPaperclip /> Ajouter des pièces jointes
      </button>
      {files.length > 0 && (
        <div className="attachment-selection">
          {files.map((file, index) => (
            <span className="attachment-selection__item" key={`${file.name}-${file.size}`}>
              <span>{file.name}</span><small>{formatBytes(file.size)}</small>
              <button type="button" aria-label={`Retirer ${file.name}`} onClick={() => onChange(files.filter((_, i) => i !== index))}><IconTrash /></button>
            </span>
          ))}
        </div>
      )}
      {error && <div className="attachment-error" role="alert">{error}</div>}
    </div>
  )
}

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}
