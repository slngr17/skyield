export default function Logo({ className = "w-10 h-10", withText = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className={`relative flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_4px_12px_rgba(16,185,129,0.35)]"
        >
          <defs>
            <linearGradient id="skyield-sun" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FBBF24" />
              <stop offset="60%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#065F46" />
            </linearGradient>
            <linearGradient id="skyield-ray" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>
            <linearGradient id="skyield-shield" x1="50" y1="5" x2="50" y2="95" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#34D399" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#047857" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Outer Shield / Microclimate Shell */}
          <path
            d="M50 8L88 22V52C88 74 71.5 90 50 96C28.5 90 12 74 12 52V22L50 8Z"
            fill="url(#skyield-shield)"
            stroke="url(#skyield-ray)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Rising Sun Disc with Solar Geometry */}
          <circle cx="50" cy="48" r="18" fill="url(#skyield-sun)" />

          {/* Solar Concentric Grid / PV Rooftop Angles */}
          <path
            d="M36 64L50 54L64 64"
            stroke="#ECFDF5"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M42 72L50 66L58 72"
            stroke="#A7F3D0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Radiating Light Beams */}
          <line x1="50" y1="20" x2="50" y2="26" stroke="#FDE047" strokeWidth="3" strokeLinecap="round" />
          <line x1="30" y1="28" x2="35" y2="33" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="70" y1="28" x2="65" y2="33" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="22" y1="48" x2="28" y2="48" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="78" y1="48" x2="72" y2="48" stroke="#FDE047" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {withText && (
        <div className="flex flex-col">
          <span className="text-xl md:text-2xl font-black text-white tracking-tight leading-none">
            Skyield
          </span>
          <span className="text-emerald-100/80 text-xs font-medium tracking-wide mt-1">
            Hyperlocal Microclimate &amp; Solar Intelligence
          </span>
        </div>
      )}
    </div>
  );
}
