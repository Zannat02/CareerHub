import { useRef, useState } from 'react'
import { CloudUpload, FileText, X } from 'lucide-react'
import { MAX_RESUME_SIZE, RESUME_EXTENSIONS } from '../utils/constants'

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

const typesLabel = RESUME_EXTENSIONS.map((ext) => ext.slice(1).toUpperCase()).join(', ')
const maxLabel = `${MAX_RESUME_SIZE / 1024 / 1024}MB`


function FileUpload({ id, file, onChange, error, disabled = false }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const openPicker = () => {
    if (!disabled) inputRef.current?.click()
  }

  const handleSelect = (e) => {
    onChange(e.target.files?.[0] || null)
  }

  const handleRemove = () => {
    if (inputRef.current) inputRef.current.value = '' 
    onChange(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    if (disabled) return
    const dropped = e.dataTransfer?.files?.[0]
    if (dropped) onChange(dropped)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        if (!disabled) setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={[
        'rounded-xl border-2 border-dashed p-4 transition',
        error ? 'border-danger-500' : 'border-slate-300',
        dragging ? 'border-brand-500 bg-brand-500/5' : 'bg-slate-50/70',
        disabled ? 'opacity-60' : '',
      ].join(' ')}
    >
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={RESUME_EXTENSIONS.join(',')}
        onChange={handleSelect}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        tabIndex={-1}
        className="sr-only"
      />

      {file ? (
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-600">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-navy-900">{file.name}</p>
            <p className="text-xs text-slate-500">{formatSize(file.size)}</p>
          </div>
          <button
            id={`${id}-button`}
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            aria-label="Remove file"
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-navy-900 focus:ring-4 focus:ring-brand-500/15 focus:outline-none disabled:cursor-not-allowed"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          id={`${id}-button`}
          type="button"
          onClick={openPicker}
          disabled={disabled}
          className="flex w-full flex-col items-center gap-1 rounded-lg py-3 text-center focus:ring-4 focus:ring-brand-500/15 focus:outline-none disabled:cursor-not-allowed"
        >
          <CloudUpload className="h-7 w-7 text-slate-500" aria-hidden="true" />
          <span className="text-sm text-slate-600">
            <span className="font-semibold text-navy-900">Click to upload</span> or
            drag and drop
          </span>
          <span className="text-xs text-slate-500">
            {typesLabel} (Max {maxLabel})
          </span>
        </button>
      )}
    </div>
  )
}

export default FileUpload