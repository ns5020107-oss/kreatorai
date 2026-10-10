import React from "react";

/* Deterministic pseudo-random from a string seed */
export function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Muted editorial palettes — warm, never neon */
const PALETTES = [
  ["#d8b48c", "#8a5a33", "#f2e3cd"],
  ["#a9b795", "#4c5b3f", "#eef0e4"],
  ["#d99a6c", "#96380f", "#f7e3d4"],
  ["#9db4b8", "#33565c", "#e6efef"],
  ["#c9a24b", "#7a5c14", "#f4e9cf"],
  ["#b7838f", "#6e3a44", "#f3e2e6"],
  ["#8f9bb0", "#3c4456", "#e8ebf1"],
  ["#c2b280", "#6b5b2e", "#f0e9d2"],
];

function pickPalette(rnd) {
  return PALETTES[Math.floor(rnd() * PALETTES.length)];
}

/* Inline SVG thumbnail for a portfolio item. Deterministic per seed. */
export function Thumb({ seed, type, title, className, style }) {
  const rnd = mulberry32(hashSeed(seed + "|" + type));
  const [c1, c2, c3] = pickPalette(rnd);
  const gid = "g" + hashSeed(seed).toString(36);
  const nid = "n" + hashSeed(seed + "n").toString(36);

  const shapes = [];
  const n = 3 + Math.floor(rnd() * 3);
  for (let i = 0; i < n; i++) {
    const x = rnd() * 400, y = rnd() * 225, r = 24 + rnd() * 90;
    const op = 0.25 + rnd() * 0.5;
    if (rnd() > 0.45) {
      shapes.push(
        <circle key={"c" + i} cx={x} cy={y} r={r} fill={i % 2 ? c2 : c3} opacity={op} />
      );
    } else {
      shapes.push(
        <rect key={"r" + i} x={x - r} y={y - r / 2} width={r * 2} height={r}
          rx={rnd() * 20} fill={i % 2 ? c3 : c2} opacity={op}
          transform={`rotate(${Math.floor(rnd() * 60 - 30)} ${x} ${y})`} />
      );
    }
  }
  // a horizon-ish band for depth
  shapes.push(
    <rect key="band" x="0" y={150 + rnd() * 40} width="400" height="90" fill={c2} opacity="0.28" />
  );

  return (
    <svg viewBox="0 0 400 225" className={className} style={style} role="img"
      aria-label={title ? `Artwork thumbnail for ${title}` : "Artwork thumbnail"} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={c1} />
          <stop offset="1" stopColor={c3} />
        </linearGradient>
        <filter id={nid}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.06 0" />
          <feComposite operator="over" in2="SourceGraphic" />
        </filter>
      </defs>
      <g filter={`url(#${nid})`}>
        <rect width="400" height="225" fill={`url(#${gid})`} />
        {shapes}
      </g>
      {type === "video" || type === "animation" ? (
        <g opacity="0.92">
          <circle cx="200" cy="112" r="30" fill="#1d1912" opacity="0.72" />
          <path d="M192 96 L216 112 L192 128 Z" fill="#f6f1e9" />
        </g>
      ) : null}
      {type === "audio" ? (
        <g stroke="#1d1912" strokeWidth="5" strokeLinecap="round" opacity="0.7">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => {
            const h = 18 + rnd() * 60;
            const x = 150 + i * 17;
            return <line key={i} x1={x} y1={112 - h / 2} x2={x} y2={112 + h / 2} />;
          })}
        </g>
      ) : null}
    </svg>
  );
}

/* Avatar: warm gradient disc + initials + grain */
export function AvatarArt({ name, hue, size }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("");
  const gid = "a" + hashSeed(name).toString(36);
  const s = size || 56;
  return (
    <span className="avatar" style={{ width: s, height: s, fontSize: Math.round(s * 0.36) }} aria-hidden="true">
      <svg viewBox="0 0 64 64" width={s} height={s} style={{ borderRadius: "50%", display: "block" }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={`hsl(${hue}, 38%, 52%)`} />
            <stop offset="1" stopColor={`hsl(${(hue + 34) % 360}, 42%, 34%)`} />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="32" fill={`url(#${gid})`} />
        <circle cx="46" cy="18" r="14" fill="#ffffff" opacity="0.12" />
        <text x="32" y="41" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700"
          fontSize="24" fill="#fdfbf6">{initials}</text>
      </svg>
    </span>
  );
}

/* Hand-drawn style underline for headings */
export function Squiggle({ children, color }) {
  return (
    <span className="squiggle">
      {children}
      <svg className="absolute" viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden="true"
        style={{ position: "absolute", left: 0, bottom: "-0.16em", width: "100%", height: "0.3em" }}>
        <path d="M2 8 Q 14 2, 26 7 T 50 7 T 74 7 T 98 7 T 118 6" fill="none"
          stroke={color || "#bc4a22"} strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/* Small inline SVG icon set — no emoji */
const P = {
  search: <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  x: <><path d="M6 6l12 12M18 6L6 18" /></>,
  check: <><path d="M4.5 12.5l5 5 10-11" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  star: <><path d="M12 3l2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6L3.2 9.4l6.1-.8z" /></>,
  arrow: <><path d="M4 12h15M13 6l6 6-6 6" /></>,
  chevD: <><path d="M6 9l6 6 6-6" /></>,
  chevR: <><path d="M9 6l6 6-6 6" /></>,
  filter: <><path d="M4 5h16l-6 7v5l-4 2v-7z" /></>,
  copy: <><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15V5a2 2 0 012-2h10" /></>,
  shield: <><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" /><path d="M9 12l2 2 4-4.5" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5l3.5 2" /></>,
  pin: <><path d="M12 21s-7-5.5-7-11a7 7 0 0114 0c0 5.5-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  inbox: <><path d="M3 13l2.5-8h13L21 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><path d="M3 13h6l1.5 2h3L15 13h6" /></>,
  spark: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" /></>,
  doc: <><path d="M6 3h8l4 4v14H6z" /><path d="M14 3v4h4M9 12h6M9 16h6" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 4.5a3.5 3.5 0 010 7M18 14.5c2 .8 3 2.6 3 5.5" /></>,
};

export function Icon({ name, size, className, style }) {
  const s = size || 18;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
      className={className} style={style} aria-hidden="true">
      {P[name] || null}
    </svg>
  );
}
