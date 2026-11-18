/** The brand mark: the transformation arrow as a right-angle bracket, not a default glyph. */
export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="3" fill="var(--pine)" />
      <path d="M8 16h14" stroke="var(--pine-ink)" strokeWidth="2.2" strokeLinecap="square" />
      <path d="M17 10.5h5.5V16" stroke="var(--pine-ink)" strokeWidth="2.2" fill="none" strokeLinecap="square" />
      <path d="M22.5 16v5.5H17" stroke="var(--brass)" strokeWidth="2.2" fill="none" strokeLinecap="square" opacity="0.9" />
    </svg>
  );
}

export function Arrow() {
  return <span className="arrow" aria-hidden="true" />;
}

