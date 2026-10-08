type MarkProps = { className?: string; strokeWidth?: number };

/** The Codifykit "C + chevron" mark, redrawn as a crisp SVG. */
export function LogoMark({ className }: MarkProps) {
  return (
    <svg
      viewBox="190 155 270 345"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M421.3 223.7 A115 115 0 0 0 258.7 386.3"
        stroke="currentColor"
        strokeWidth="50"
      />
      <path
        d="M396 294 L311 379 L397 465"
        stroke="currentColor"
        strokeWidth="46"
        strokeLinejoin="miter"
        strokeMiterlimit="4"
      />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="h-7 w-auto text-white" />
      <span className="font-display text-[1.35rem] font-medium tracking-tight text-white">
        Codifykit
      </span>
    </span>
  );
}
