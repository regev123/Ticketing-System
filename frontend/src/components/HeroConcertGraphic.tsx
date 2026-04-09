/**
 * Decorative hero artwork for the home page — fills the right column on large screens.
 */
export function HeroConcertGraphic() {
  return (
    <div
      className="relative mx-auto flex w-full max-w-[240px] items-center justify-center sm:max-w-[260px] lg:max-w-[280px]"
      aria-hidden
    >
      {/* Soft glow layers */}
      <div className="absolute inset-0 scale-110 rounded-full bg-gradient-to-tr from-violet-500/25 via-fuchsia-500/15 to-transparent blur-2xl" />
      <div className="absolute -right-2 top-1/2 h-48 w-48 -translate-y-1/2 rounded-full bg-violet-600/20 blur-xl" />

      <div className="relative aspect-square w-full max-w-[240px] sm:max-w-[260px] lg:max-w-[280px]">
        {/* Outer ring */}
        <div className="absolute inset-[6%] rounded-full border border-white/10 bg-white/[0.04] shadow-2xl shadow-violet-900/50 backdrop-blur-sm" />
        <div className="absolute inset-[12%] rounded-full border border-violet-400/20 bg-gradient-to-br from-white/10 to-transparent" />

        <svg
          viewBox="0 0 400 400"
          className="relative h-full w-full drop-shadow-lg"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c4b5fd" />
              <stop offset="45%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#e879f9" />
            </linearGradient>
            <linearGradient id="heroGradDark" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Stage arc */}
          <path
            d="M 60 280 Q 200 220 340 280"
            stroke="url(#heroGrad)"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Spotlights */}
          <path d="M 120 80 L 140 240" stroke="url(#heroGrad)" strokeWidth="2" opacity="0.35" />
          <path d="M 200 60 L 200 250" stroke="url(#heroGrad)" strokeWidth="2" opacity="0.45" />
          <path d="M 280 80 L 260 240" stroke="url(#heroGrad)" strokeWidth="2" opacity="0.35" />

          {/* Sound waves */}
          <g filter="url(#glow)" opacity="0.9">
            <path
              d="M 100 200 Q 130 160 160 200 T 220 200"
              stroke="url(#heroGradDark)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 85 200 Q 125 145 165 200 T 245 200"
              stroke="url(#heroGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M 70 200 Q 120 130 170 200 T 270 200"
              stroke="url(#heroGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.45"
            />
          </g>

          {/* Center mark — music / ticket */}
          <circle cx="200" cy="200" r="52" fill="url(#heroGradDark)" opacity="0.95" />
          <circle cx="200" cy="200" r="46" stroke="white" strokeOpacity="0.25" strokeWidth="2" fill="none" />
          <g fill="white">
            <path d="M185 165h8v62h-8z" />
            <path d="M193 165h22a8 8 0 018 8v38a6 6 0 11-12 0v-28h-18v-18z" />
          </g>

          {/* Floating notes */}
          <circle cx="110" cy="130" r="4" fill="#f0abfc" opacity="0.9" />
          <circle cx="290" cy="150" r="3" fill="#c4b5fd" opacity="0.8" />
          <circle cx="320" cy="220" r="5" fill="#e879f9" opacity="0.6" />
          <circle cx="90" cy="240" r="3" fill="#a78bfa" opacity="0.7" />

          {/* Ticket stub hint */}
          <rect
            x="255"
            y="295"
            width="88"
            height="44"
            rx="6"
            fill="white"
            fillOpacity="0.08"
            stroke="url(#heroGrad)"
            strokeWidth="1.5"
            strokeOpacity="0.5"
          />
          <line x1="275" y1="295" x2="275" y2="339" stroke="white" strokeOpacity="0.15" strokeDasharray="4 3" />
          <text
            x="290"
            y="322"
            fill="white"
            fillOpacity="0.5"
            fontSize="11"
            fontFamily="system-ui, sans-serif"
            fontWeight="600"
            letterSpacing="0.15em"
          >
            LIVE
          </text>
        </svg>

        {/* Floating badge */}
        <div className="absolute -bottom-0.5 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet-200 backdrop-blur-md sm:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          StagePass
        </div>
      </div>
    </div>
  );
}
