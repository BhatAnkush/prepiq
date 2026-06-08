export function Logo({ size = 32, className = "w-4 h-4" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="36" height="36" rx="10" fill="#7C3AED" />
      <path
        d="M10 13C10 11.9 10.9 11 12 11H20C21.1 11 22 11.9 22 13V18C22 19.1 21.1 20 20 20H16L12 25V20H12C10.9 20 10 19.1 10 18V13Z"
        fill="white"
        opacity="0.9"
      />
      <circle cx="24" cy="13" r="4" fill="#A78BFA" />
      <path
        d="M22 13L26 13M24 11L24 15"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
