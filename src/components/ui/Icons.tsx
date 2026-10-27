/**
 * The site's few icons, drawn on one 24px grid with one 1.75 stroke, so they read as a set.
 * Decorative by default (aria-hidden); give the parent control its accessible name.
 */
type P = { size?: number; className?: string };

const svg = (size: number, className: string | undefined, children: React.ReactNode) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

/** Ideate: a bulb */
export const IconIdea = ({ size = 16, className }: P) =>
  svg(size, className, <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.2h5c0-.9.4-1.7 1.1-2.2A6 6 0 0 0 12 3Z" /></>);
/** Design: a pen nib */
export const IconPen = ({ size = 16, className }: P) =>
  svg(size, className, <><path d="m14.5 4.5 5 5L9 20H4v-5Z" /><path d="m12.5 6.5 5 5" /></>);
/** Build: code brackets */
export const IconCode = ({ size = 16, className }: P) =>
  svg(size, className, <><path d="m8 7-5 5 5 5M16 7l5 5-5 5" /><path d="m13.5 4-3 16" /></>);
/** Launch: an arrow leaving */
export const IconLaunch = ({ size = 16, className }: P) =>
  svg(size, className, <><path d="M7 17 17 7" /><path d="M8 7h9v9" /></>);
/** Grow: a rising line */
export const IconGrow = ({ size = 16, className }: P) =>
  svg(size, className, <><path d="m3 17 6-6 4 4 8-8" /><path d="M15 7h6v6" /></>);
/** A padlock, for the browser address bar */
export const IconLock = ({ size = 12, className }: P) =>
  svg(size, className, <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>);
/** The six-armed asterisk the reference sets beside its headings */
export const IconAsterisk = ({ size = 24, className }: P) =>
  svg(size, className, <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" />);
