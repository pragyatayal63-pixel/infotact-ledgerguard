interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      width="40"
      height="40"
      role="img"
      aria-label="LedgerGuard logo"
    >
      <rect width="32" height="32" rx="8" fill="#2563eb" />
      <path
        d="M16 6.5 8.5 9.4v6.2c0 4.6 3 8.1 7.5 9.9 4.5-1.8 7.5-5.3 7.5-9.9V9.4L16 6.5Z"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m12.6 16 2.6 2.6 4.4-4.9"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
