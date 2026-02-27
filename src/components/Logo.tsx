interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "wordmark";
}

const sizes = {
  sm: { icon: 28, text: "text-lg" },
  md: { icon: 36, text: "text-2xl" },
  lg: { icon: 44, text: "text-3xl" },
  xl: { icon: 56, text: "text-5xl" },
};

function LogoIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Stadium / Shield shape */}
      <rect x="2" y="2" width="44" height="44" rx="12" fill="#1A1A2E" />

      {/* Pitch lines - subtle football field */}
      <rect
        x="6" y="6" width="36" height="36" rx="8"
        fill="none" stroke="#00D26A" strokeWidth="1" opacity="0.2"
      />
      <line x1="24" y1="6" x2="24" y2="42" stroke="#00D26A" strokeWidth="1" opacity="0.15" />

      {/* Football (center, prominent) */}
      <circle cx="20" cy="20" r="10" fill="#00D26A" />
      {/* Pentagon pattern on ball */}
      <path
        d="M20 11.5l2.8 2-1 3.2h-3.6l-1-3.2L20 11.5z"
        fill="#1A1A2E" opacity="0.25"
      />
      <path
        d="M20 15l3 2.2-1.2 3.5H18.2L17 17.2 20 15z"
        fill="white" opacity="0.15"
      />
      {/* Ball seam lines */}
      <circle cx="20" cy="20" r="10" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3" />
      <path
        d="M13 15.5c2 1.5 4 3 7 3.5m0 0c3-.5 5-2 7-3.5M15 27c1.5-2 3-3.5 5-4m0 0c2 .5 3.5 2 5 4"
        stroke="white" strokeWidth="0.5" opacity="0.25" fill="none"
      />

      {/* Small beer glass accent (bottom-right) */}
      <path
        d="M31 28h8l-.8 11a1.2 1.2 0 01-1.2 1.1h-3a1.2 1.2 0 01-1.2-1.1L31 28z"
        fill="url(#beerGradient)"
        opacity="0.9"
      />
      {/* Beer foam */}
      <path
        d="M30.5 28.3c0-.9.6-1.5 1.5-1.5h5.5c.9 0 1.5.6 1.5 1.5s-.3.9-.3.9h-8s-.2 0-.2-.9z"
        fill="white"
        opacity="0.95"
      />
      {/* Tiny bubble */}
      <circle cx="34" cy="32" r="0.5" fill="white" opacity="0.4" />
      <circle cx="36" cy="34" r="0.4" fill="white" opacity="0.3" />

      <defs>
        <linearGradient
          id="beerGradient"
          x1="35" y1="28" x2="35" y2="40"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F5A623" />
          <stop offset="1" stopColor="#D4900E" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function Logo({
  className = "",
  size = "md",
  variant = "full",
}: LogoProps) {
  const s = sizes[size];

  if (variant === "icon") {
    return (
      <div className={className}>
        <LogoIcon size={s.icon} />
      </div>
    );
  }

  if (variant === "wordmark") {
    return (
      <span
        className={`font-[family-name:var(--font-display)] ${s.text} tracking-wider ${className}`}
      >
        SPIELTAG<span className="text-[#F5A623]">BAR</span>
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <LogoIcon size={s.icon} />
      <div className="flex flex-col leading-none">
        <span
          className={`font-[family-name:var(--font-display)] ${s.text} tracking-wider leading-none`}
        >
          SPIELTAG<span className="text-[#F5A623]">BAR</span>
        </span>
        {(size === "lg" || size === "xl") && (
          <span className="text-[10px] tracking-[0.3em] text-gray-400 uppercase mt-0.5">
            Wo läuft dein Spiel?
          </span>
        )}
      </div>
    </div>
  );
}
