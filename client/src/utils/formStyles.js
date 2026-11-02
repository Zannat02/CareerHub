
export function controlClass(hasError, hasIcon = false) {
  return [
    'w-full rounded-xl border bg-white py-3 pr-4 text-[15px] text-navy-900 outline-none transition',
    'placeholder:text-slate-400',
    'focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15',
    'disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500',
    hasIcon ? 'pl-11' : 'pl-4',
    hasError
      ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/15'
      : 'border-slate-200',
  ].join(' ')
}