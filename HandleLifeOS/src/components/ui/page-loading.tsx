export function PageLoading({ label }: { label?: string }) {
  return (
    <div className="flex h-full min-h-[50vh] w-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-[var(--color-gray-200)] border-t-[var(--color-brand-600)] animate-spin" />
        {label && (
          <p className="text-sm text-[var(--color-text-tertiary)] animate-pulse">{label}</p>
        )}
      </div>
    </div>
  )
}
