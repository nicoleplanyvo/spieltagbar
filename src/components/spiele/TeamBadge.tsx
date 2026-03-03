import { getTeamBadge } from "@/lib/teams";

interface TeamBadgeProps {
  team: string;
  liga?: string;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  nameClass?: string;
}

const sizeMap = {
  sm: { img: 20, flag: "text-base" },
  md: { img: 28, flag: "text-xl" },
  lg: { img: 36, flag: "text-2xl" },
};

export function TeamBadge({
  team,
  liga,
  size = "md",
  showName = true,
  nameClass = "",
}: TeamBadgeProps) {
  const badge = getTeamBadge(team, liga);
  const s = sizeMap[size];

  return (
    <span className="inline-flex items-center gap-1.5">
      {badge?.type === "logo" ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={badge.url}
          alt={team}
          width={s.img}
          height={s.img}
          className="object-contain flex-shrink-0"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      ) : badge?.type === "flag" ? (
        <span className={`${s.flag} leading-none flex-shrink-0`}>
          {badge.emoji}
        </span>
      ) : (
        <span
          className="flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500"
          style={{ width: s.img, height: s.img }}
        >
          {team.charAt(0)}
        </span>
      )}
      {showName && <span className={nameClass}>{team}</span>}
    </span>
  );
}
