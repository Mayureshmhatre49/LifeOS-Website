export default function ImplementationLoading() {
  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10 animate-pulse">
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-40 bg-indigo-100 rounded-full" />
          <div className="h-8 w-64 bg-gray-200 rounded-xl" />
          <div className="h-4 w-96 bg-gray-100 rounded-full" />
        </div>
        {/* Banner skeleton */}
        <div className="h-36 w-full rounded-3xl bg-indigo-100" />
        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-white border border-gray-100 shadow-sm" />
          ))}
        </div>
      </div>
    </div>
  )
}
