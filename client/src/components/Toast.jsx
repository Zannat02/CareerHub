import { useEffect, useRef } from 'react'
import { CircleCheck, CircleX, X } from 'lucide-react'


function Toast({ toast, onClose, duration = 6000 }) {
  const closeRef = useRef(onClose)

  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => closeRef.current(), duration)
    return () => clearTimeout(timer)
  }, [toast, duration])

  if (!toast) return null

  const isError = toast.type === 'error'
  const Icon = isError ? CircleX : CircleCheck

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:justify-end sm:px-6">
      <div
        role={isError ? 'alert' : 'status'}
        className={[
          'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border border-l-4 bg-white p-4 shadow-xl shadow-navy-950/25',
          isError ? 'border-danger-500/30 border-l-danger-500' : 'border-success-500/30 border-l-success-500',
        ].join(' ')}
      >
        <Icon
          className={['mt-0.5 h-5 w-5 shrink-0', isError ? 'text-danger-500' : 'text-success-500'].join(' ')}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-navy-900">{toast.title}</p>
          {toast.message && (
            <p className="mt-0.5 text-sm text-slate-600">{toast.message}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-navy-900 focus:ring-4 focus:ring-brand-500/15 focus:outline-none"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}

export default Toast