import type { ReactNode } from 'react'

type Tone = 'brand' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'

const toneClasses: Record<Tone, string> = {
  brand: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
  neutral: 'bg-white/[0.06] text-gray-300 border-white/10',
}

interface BadgeProps {
  children: ReactNode
  tone?: Tone
  icon?: ReactNode
  pulse?: boolean
  className?: string
}

const Badge = ({ children, tone = 'neutral', icon, pulse = false, className = '' }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${toneClasses[tone]} ${className}`}
    >
      {pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
      {icon}
      {children}
    </span>
  )
}

export default Badge
