export const Skeleton = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />
)

export const SkeletonCard = () => (
  <div className="glass-card rounded-2xl p-6">
    <div className="flex items-center justify-between mb-4">
      <Skeleton className="h-9 w-9 rounded-xl" />
      <Skeleton className="h-4 w-10" />
    </div>
    <Skeleton className="h-7 w-16 mb-2" />
    <Skeleton className="h-3 w-24" />
  </div>
)

export const SkeletonRow = () => (
  <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/[0.05]">
    <div className="space-y-2">
      <Skeleton className="h-3.5 w-40" />
      <Skeleton className="h-3 w-28" />
    </div>
    <Skeleton className="h-6 w-16 rounded-lg" />
  </div>
)

export default Skeleton
