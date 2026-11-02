function Logo() {
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
        <defs>
          <linearGradient id="logo-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c4b5fd" />
            <stop offset="1" stopColor="#4fc3f7" />
          </linearGradient>
        </defs>
        <path d="M20 34C8 30 4 18 6 8c10 0 16 6 14 26Z" fill="url(#logo-gradient)" />
        <path d="M20 34c12-4 16-16 14-26-10 0-16 6-14 26Z" fill="#7c5cff" />
      </svg>
      <span className="text-2xl font-bold tracking-tight text-white">
        Career<span className="text-brand-400">Hub</span>
      </span>
    </div>
  )
}

export default Logo