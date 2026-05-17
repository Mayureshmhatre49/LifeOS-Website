export default function RenewalsLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6" aria-busy="true" aria-label="Loading renewals">
      {/* Header skeleton */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-52 rounded-lg bg-[var(--color-surface-hover)] animate-pulse" />
          <div className="h-4 w-72 rounded bg-[var(--color-surface-hover)] animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 rounded-lg bg-[var(--color-surface-hover)] animate-pulse" />
          <div className="h-9 w-32 rounded-lg bg-[var(--color-surface-hover)] animate-pulse" />
        </div>
      </div>

      {/* Stats bar skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-[var(--color-border)] p-4 bg-[var(--color-surface-raised)]">
            <div className="h-3 w-20 rounded bg-[var(--color-surface-hover)] animate-pulse mb-2" />
            <div className="h-7 w-12 rounded bg-[var(--color-surface-hover)] animate-pulse" />
          </div>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="flex gap-4 border-b border-[var(--color-border)] pb-px">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-6 w-20 rounded bg-[var(--color-surface-hover)] animate-pulse mb-2" />
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid sm:grid-cols-2 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex rounded-xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface-raised)] h-32 animate-pulse">
            <div className="w-1.5 bg-[var(--color-surface-hover)]" />
            <div className="flex-1 p-4 space-y-2">
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-lg bg-[var(--color-surface-hover)]" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-3/4 rounded bg-[var(--color-surface-hover)]" />
                  <div className="h-3 w-1/2 rounded bg-[var(--color-surface-hover)]" />
                </div>
              </div>
              <div className="h-3 w-24 rounded-full bg-[var(--color-surface-hover)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
