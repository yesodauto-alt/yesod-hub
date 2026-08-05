const nodes: { x: number; y: number; r: number }[] = [
  { x: 60, y: 120, r: 3 },
  { x: 150, y: 260, r: 2 },
  { x: 40, y: 420, r: 2.5 },
  { x: 210, y: 90, r: 2 },
  { x: 260, y: 380, r: 3 },
  { x: 120, y: 540, r: 2 },
  { x: 1140, y: 100, r: 3 },
  { x: 1050, y: 240, r: 2 },
  { x: 1180, y: 380, r: 2.5 },
  { x: 960, y: 420, r: 2 },
  { x: 1090, y: 540, r: 3 },
  { x: 900, y: 130, r: 2 },
];

const links: [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 3],
  [1, 4],
  [2, 5],
  [3, 4],
  [6, 7],
  [7, 8],
  [8, 10],
  [7, 9],
  [6, 11],
  [9, 10],
];

/** Abstract network / data-flow backdrop for the home hero. Decorative only. */
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
          <linearGradient id="yh-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#12365f" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#2d69aa" stopOpacity="0.15" />
          </linearGradient>
          <linearGradient id="yh-trail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#2d69aa" stopOpacity="0" />
            <stop offset="50%" stopColor="#2d69aa" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#2d69aa" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="yh-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2d69aa" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2d69aa" stopOpacity="0" />
          </radialGradient>
          <pattern id="yh-grid" width="56" height="56" patternUnits="userSpaceOnUse">
            <path d="M56 0H0V56" stroke="#12365f" strokeOpacity="0.07" strokeWidth="1" />
          </pattern>
        </defs>

        <rect width="1240" height="640" fill="url(#yh-grid)" />
        <circle cx="90" cy="300" r="300" fill="url(#yh-glow)" />
        <circle cx="1150" cy="320" r="320" fill="url(#yh-glow)" />

        {/* soft geometry */}
        <circle cx="1120" cy="300" r="180" stroke="url(#yh-line)" strokeWidth="1" opacity="0.5" />
        <circle cx="1120" cy="300" r="118" stroke="url(#yh-line)" strokeWidth="1" opacity="0.35" />
        <rect
          x="20"
          y="200"
          width="230"
          height="230"
          rx="46"
          stroke="url(#yh-line)"
          strokeWidth="1"
          opacity="0.4"
          transform="rotate(-14 135 315)"
        />

        {/* data trails */}
        <path
          d="M-40 480 C 220 400 320 560 640 470 C 940 385 1040 540 1300 450"
          stroke="url(#yh-trail)"
          strokeWidth="1.2"
        />
        <path
          d="M-40 160 C 200 90 340 220 620 150 C 900 80 1060 210 1300 140"
          stroke="url(#yh-trail)"
          strokeWidth="1.2"
        />

        {/* connections */}
        <g stroke="url(#yh-line)" strokeWidth="1">
          {links.map(([a, b]) => {
            const from = nodes[a]!;
            const to = nodes[b]!;
            return <line key={`${a}-${b}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} />;
          })}
        </g>
        <g fill="#1d4f85" fillOpacity="0.5">
          {nodes.map((node) => (
            <circle key={`${node.x}-${node.y}`} cx={node.x} cy={node.y} r={node.r} />
          ))}
        </g>
        <g fill="none" stroke="#2d69aa" strokeOpacity="0.3" strokeWidth="1">
          {nodes.filter((_, i) => i % 3 === 0).map((node) => (
            <circle key={`ring-${node.x}`} cx={node.x} cy={node.y} r={node.r + 8} />
          ))}
        </g>
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(237,244,251,0.72)_0%,rgba(237,244,251,0.15)_58%,transparent_100%)]" />
    </div>
  );
}
