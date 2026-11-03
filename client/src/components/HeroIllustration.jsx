
function HeroIllustration() {
  return (
    <svg viewBox="0 0 420 280" className="w-full max-w-md" aria-hidden="true">
      <defs>
        <linearGradient id="hero-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f46e5" />
          <stop offset="1" stopColor="#7c5cff" />
        </linearGradient>
        <linearGradient id="hero-leaf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b7cff" />
          <stop offset="1" stopColor="#2a3aa8" />
        </linearGradient>
      </defs>

      <ellipse cx="215" cy="262" rx="175" ry="14" fill="#7c5cff" opacity="0.25" />

      {/* laptop */}
      <path d="M70 232h290l20 20q0 8-8 8H58q-8 0-8-8z" fill="#1d2878" />
      <rect x="92" y="98" width="246" height="136" rx="10" fill="#10185a" stroke="#5b6cf0" strokeWidth="2" />
      <rect x="102" y="108" width="226" height="116" rx="6" fill="url(#hero-screen)" opacity="0.85" />
      <g fill="#ffffff" opacity="0.55">
        <rect x="118" y="126" width="70" height="6" rx="3" />
        <rect x="128" y="142" width="110" height="6" rx="3" />
        <rect x="128" y="158" width="80" height="6" rx="3" />
        <rect x="118" y="174" width="96" height="6" rx="3" />
      </g>

      {/* floating code window */}
      <g transform="translate(210 22)">
        <rect width="160" height="104" rx="10" fill="#1b2470" stroke="#7d8cff" strokeOpacity="0.6" />
        <path d="M0 10a10 10 0 0 1 10-10h140a10 10 0 0 1 10 10v8H0z" fill="#26318f" />
        <circle cx="14" cy="9" r="3" fill="#ff8aa1" />
        <circle cx="26" cy="9" r="3" fill="#ffd27a" />
        <circle cx="38" cy="9" r="3" fill="#7dffb3" />
        <text x="80" y="72" textAnchor="middle" fontSize="40" fontWeight="700" fill="#a9b8ff" fontFamily="monospace">
          &lt;/&gt;
        </text>
      </g>

      {/* plant */}
      <path d="M26 236h46l-7 30H33z" fill="#3b2f9e" />
      <path d="M49 236C30 220 30 190 44 168c14 20 14 48 5 68z" fill="url(#hero-leaf)" />
      <path d="M49 236c10-14 24-28 34-36-2 22-14 34-34 36z" fill="#4a63e8" opacity="0.9" />
      <path d="M47 236C34 226 22 218 14 206c18 0 30 12 33 30z" fill="#3a4fd0" opacity="0.9" />
    </svg>
  )
}

export default HeroIllustration