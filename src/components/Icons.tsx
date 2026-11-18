/** One quiet line-icon set: 24px grid, 1.6 stroke, square-ish joins to match the 2px-corner brand. */
const paths: Record<string, React.ReactNode> = {
  home: <path d="M4 10.5 12 4l8 6.5V20h-5v-6h-6v6H4z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" />
    </>
  ),
  moon: <path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z" />,
  playbooks: (
    <>
      <path d="M5 4.5h11.5A2.5 2.5 0 0 1 19 7v12.5H7.5A2.5 2.5 0 0 1 5 17z" />
      <path d="M5 17a2.5 2.5 0 0 1 2.5-2.5H19M9 8.5h6" />
    </>
  ),
  library: (
    <>
      <path d="M5 4h3v16H5zM10 4h3v16h-3z" />
      <path d="m15.2 5.2 2.9-.8 3.9 14.9-2.9.8z" />
    </>
  ),
  "case-studies": (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  swipe: <path d="M4 4h7v9H4zM13 4h7v5h-7zM13 11h7v9h-7zM4 15h7v5H4z" />,
  martech: (
    <>
      <path d="M12 3.5 20 7.5l-8 4-8-4z" />
      <path d="m4 12 8 4 8-4M4 16.5l8 4 8-4" />
    </>
  ),
  canon: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
      <path d="M15.5 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.8c1.6.7 2.7 2.3 3 4.7" />
    </>
  ),
  principles: <path d="M6 10.5h4V17H4v-5.2C4 8 5.6 6 8.5 5.5M16 10.5h4V17h-6v-5.2c0-3.8 1.6-5.8 4.5-6.3" />,
  account: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.8 3.6-6 7-6s6.2 2.2 7 6" />
    </>
  ),
  return: <path d="M9 7 4.5 11.5 9 16M5 11.5h9.5a5 5 0 0 1 0 10H12" />,
  more: (
    <>
      <circle cx="5.5" cy="12" r="1.3" />
      <circle cx="12" cy="12" r="1.3" />
      <circle cx="18.5" cy="12" r="1.3" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />,
  website: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.2-3.5-8.5S9.6 5.9 12 3.5z" />
    </>
  ),
  newsletter: <path d="M3.5 6h17v12h-17zM3.5 6.5 12 13l8.5-6.5" />,
  linkedin: (
    <>
      <path d="M4 4h16v16H4z" />
      <path d="M8 10.5V16M8 8v.01M11.5 16v-5.5M11.5 13c0-1.6 1-2.5 2.3-2.5s2.2.9 2.2 2.5v3" />
    </>
  ),
  x: <path d="M5 4.5h3.8l10.2 15H15.2zM19 4.5 13.4 11M5 19.5l5.6-6.5" />,
  podcast: (
    <>
      <path d="M9.5 4.5h5v9h-5z" />
      <path d="M6.5 11.5a5.5 5.5 0 0 0 11 0M12 17v3.5M9 20.5h6" />
    </>
  ),
  youtube: (
    <>
      <path d="M3.5 6.5h17v11h-17z" />
      <path d="m10.5 9.5 4 2.5-4 2.5z" />
    </>
  ),
  chevron: <path d="m9 6 6 6-6 6" />,
};

export function Icon({ name, size = 18, className }: { name: string; size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinejoin="round"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}
