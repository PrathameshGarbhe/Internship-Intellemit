import { ReactNode } from "react";

type CardColor = "blue" | "green" | "amber" | "red" | "purple" | "teal";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: ReactNode;
  color: CardColor;
  trend?: {
    value: number;
    label?: string;
  };
}

const colorMap: Record<CardColor, { bg: string; iconBg: string; iconText: string; accent: string }> = {
  blue:   { bg: "glass-card", iconBg: "bg-indigo-500/15",   iconText: "text-indigo-400",   accent: "text-indigo-400" },
  green:  { bg: "glass-card", iconBg: "bg-emerald-500/15", iconText: "text-emerald-400", accent: "text-emerald-400" },
  amber:  { bg: "glass-card", iconBg: "bg-amber-500/15",  iconText: "text-amber-400",  accent: "text-amber-400" },
  red:    { bg: "glass-card", iconBg: "bg-red-500/15",    iconText: "text-red-400",    accent: "text-red-400" },
  purple: { bg: "glass-card", iconBg: "bg-violet-500/15", iconText: "text-violet-400", accent: "text-violet-400" },
  teal:   { bg: "glass-card", iconBg: "bg-cyan-500/15",   iconText: "text-cyan-400",   accent: "text-cyan-400" },
};

export function StatsCard({ title, value, subtitle, icon, color, trend }: StatsCardProps) {
  const c = colorMap[color];
  const trendPositive = trend && trend.value >= 0;

  return (
    <div
      className={`
        ${c.bg}
        relative overflow-hidden
        rounded-2xl
        p-5
        flex flex-col gap-4
        transition-all duration-200
        hover:border-white/[0.12] hover:shadow-xl hover:shadow-black/30
        group
      `}
    >
      {/* Top row: icon + trend badge */}
      <div className="flex items-start justify-between">
        <div
          className={`
            ${c.iconBg} ${c.iconText}
            w-11 h-11 rounded-xl
            flex items-center justify-center
            text-xl
            transition-transform duration-200
            group-hover:scale-110
          `}
        >
          {icon}
        </div>

        {trend !== undefined && (
          <span
            className={`
              text-xs font-medium px-2 py-1 rounded-lg
              ${trendPositive
                ? "bg-emerald-500/10 text-emerald-400"
                : "bg-red-500/10 text-red-400"}
            `}
          >
            {trendPositive ? "+" : ""}
            {trend.value}%
            {trend.label ? ` ${trend.label}` : ""}
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <p className="text-3xl font-semibold tracking-tight text-white leading-none">
          {value}
        </p>
      </div>

      {/* Title + subtitle */}
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-white/80">{title}</p>
        <p className="text-xs text-white/40">{subtitle}</p>
      </div>

      {/* Subtle colored glow strip at bottom */}
      <div
        className={`
          absolute bottom-0 left-0 right-0 h-[2px]
          ${c.iconBg}
          opacity-0 group-hover:opacity-100
          transition-opacity duration-300
        `}
      />
    </div>
  );
}