import { CircleAlert } from 'lucide-react'


function FormField({
  id,
  label,
  icon: LabelIcon,
  leadingIcon: LeadingIcon,
  required = false,
  error,
  counter,
  children,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 flex items-center gap-2 text-[15px] font-semibold text-navy-900"
      >
        {LabelIcon && (
          <LabelIcon className="h-5 w-5 text-brand-600" aria-hidden="true" />
        )}
        <span>
          {label}
          {required && (
            <span className="ml-1 text-danger-500" aria-hidden="true">
              *
            </span>
          )}
        </span>
      </label>

      <div className="relative">
        {LeadingIcon && (
          <LeadingIcon
            className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
        )}
        {children}
      </div>

      <div className="mt-2 flex min-h-5 items-start justify-between gap-3">
        {error ? (
          <p
            id={`${id}-error`}
            role="alert"
            className="flex items-start gap-2 text-sm text-danger-500"
          >
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : (
          <span />
        )}
        {counter && (
          <span className="ml-auto shrink-0 text-sm text-slate-500">{counter}</span>
        )}
      </div>
    </div>
  )
}

export default FormField