/** Refined AI transformation backdrop for the home hero. Decorative only. */
export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1240 640"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <defs>
          <radialGradient id="yh-ai-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2d69aa" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#245a98" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#245a98" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="yh-flow" x1="180" y1="480" x2="1080" y2="130" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#12365f" stopOpacity="0" />
            <stop offset="38%" stopColor="#245a98" stopOpacity="0.2" />
            <stop offset="72%" stopColor="#2d69aa" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#2d69aa" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="yh-pulse" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#12365f" stopOpacity="0" />
            <stop offset="52%" stopColor="#245a98" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#2d69aa" stopOpacity="0" />
          </linearGradient>
          <filter id="yh-soft-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="10" />
          </filter>
        </defs>

        {/* A calm field of intelligence, concentrated away from the copy. */}
        <ellipse cx="1060" cy="250" rx="330" ry="300" fill="url(#yh-ai-glow)" />
        <ellipse cx="205" cy="540" rx="260" ry="220" fill="url(#yh-ai-glow)" opacity="0.38" />

        {/* Human work becoming a precise, scalable flow. */}
        <g stroke="url(#yh-flow)" strokeLinecap="round">
          <path d="M-80 555 C220 520 350 435 515 365 C700 286 846 238 1320 106" strokeWidth="26" opacity="0.08" />
          <path d="M-70 556 C235 522 358 443 522 373 C706 295 858 245 1310 119" strokeWidth="7" opacity="0.18" />
          <path d="M-60 558 C240 530 372 456 535 386 C720 307 876 258 1300 135" strokeWidth="1.6" opacity="0.8" />
          <path d="M35 622 C300 535 430 520 585 438 C760 346 927 310 1285 244" strokeWidth="1" opacity="0.5" />
          <path d="M660 610 C780 505 850 443 966 388 C1082 334 1162 310 1310 286" strokeWidth="1.2" opacity="0.42" />
        </g>

        {/* Structured AI core: deliberate rings, not random connections. */}
        <g transform="translate(1032 245)">
          <circle r="154" fill="#2d69aa" fillOpacity="0.035" />
          <circle r="122" stroke="#245a98" strokeOpacity="0.16" strokeWidth="1" />
          <circle r="88" stroke="#245a98" strokeOpacity="0.22" strokeWidth="1" strokeDasharray="3 10" />
          <circle r="57" stroke="#12365f" strokeOpacity="0.2" strokeWidth="1" />
          <circle r="18" fill="#245a98" fillOpacity="0.1" filter="url(#yh-soft-glow)" />
          <circle r="5" fill="#245a98" fillOpacity="0.5" />
          <path d="M-122 0H-57M57 0H122M0-122V-57M0 57V122" stroke="#245a98" strokeOpacity="0.18" />
          <g fill="#2d69aa" fillOpacity="0.5">
            <circle cx="-122" cy="0" r="3" />
            <circle cx="122" cy="0" r="3" />
            <circle cx="0" cy="-122" r="3" />
            <circle cx="0" cy="122" r="3" />
            <circle cx="-62" cy="-62" r="2.5" />
            <circle cx="62" cy="62" r="2.5" />
          </g>
        </g>

        {/* A single pulse suggests useful automation moving through the system. */}
        <path d="M430 508 C610 430 720 355 895 302 C1010 267 1115 256 1280 236" stroke="url(#yh-pulse)" strokeWidth="2" />
        <g fill="#245a98">
          <circle cx="615" cy="422" r="3" fillOpacity="0.34" />
          <circle cx="760" cy="341" r="4" fillOpacity="0.42" />
          <circle cx="895" cy="302" r="3" fillOpacity="0.46" />
        </g>
      </svg>

      {/* Protects legibility while allowing the visual to remain impactful. */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(237,244,251,0.58)_0%,rgba(237,244,251,0.28)_43%,transparent_72%)]" />
    </div>
  );
}
