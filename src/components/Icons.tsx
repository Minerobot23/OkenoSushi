/** Small line icons (inline SVG, 24px grid). Decorative: the text next to them carries the meaning. */
type IconProps = { className?: string };
const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export const PhoneIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6.6 3.5h-2a1.6 1.6 0 0 0-1.6 1.8 17 17 0 0 0 15.7 15.7 1.6 1.6 0 0 0 1.8-1.6v-2a1.6 1.6 0 0 0-1.2-1.6l-3-.8a1.6 1.6 0 0 0-1.6.5l-1 1.2a13 13 0 0 1-6-6l1.2-1a1.6 1.6 0 0 0 .5-1.6l-.8-3A1.6 1.6 0 0 0 6.6 3.5Z" />
  </svg>
);
export const PinIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);
export const BagIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </svg>
);
export const ArrowIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const ExternalIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M14 5h5v5M19 5l-8 8M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4" />
  </svg>
);
export const CloseIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const MenuIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const SearchIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </svg>
);
export const ChevronIcon = ({ className = "", flip = false }: IconProps & { flip?: boolean }) => (
  <svg {...base} className={className} style={flip ? { transform: "scaleX(-1)" } : undefined}>
    <path d="m9 5 7 7-7 7" />
  </svg>
);
export const StarIcon = (p: IconProps) => (
  <svg {...base} {...p} fill="currentColor" stroke="none">
    <path d="m12 3.6 2.5 5.3 5.8.7-4.3 4 1.1 5.8L12 16.6l-5.1 2.8L8 13.6l-4.3-4 5.8-.7L12 3.6Z" />
  </svg>
);
export const HomeIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 11.5 12 5l8 6.5" />
    <path d="M6.5 10v9h11v-9" />
  </svg>
);
export const MenuBookIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 4.5h10a2 2 0 0 1 2 2V20H7a2 2 0 0 1-2-2V4.5Z" />
    <path d="M8.5 9h5M8.5 12.5h5M17 7h2v13h-2" />
  </svg>
);
export const PlatterIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <ellipse cx="12" cy="13" rx="9" ry="6.5" />
    <circle cx="9" cy="12" r="1.8" />
    <circle cx="13.5" cy="11" r="1.8" />
    <circle cx="13" cy="15" r="1.8" />
  </svg>
);
export const GridIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4" y="4" width="7" height="9" rx="1" />
    <rect x="13" y="4" width="7" height="6" rx="1" />
    <rect x="4" y="15" width="7" height="5" rx="1" />
    <rect x="13" y="12" width="7" height="8" rx="1" />
  </svg>
);
export const PauseIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M9 6v12M15 6v12" />
  </svg>
);
export const PlayIcon = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M8 5.5v13l10-6.5-10-6.5Z" />
  </svg>
);
