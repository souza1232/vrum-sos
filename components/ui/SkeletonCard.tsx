export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden animate-pulse">
      {/* Header */}
      <div className="bg-slate-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-300 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-300 rounded w-32" />
            <div className="h-3 bg-slate-300 rounded w-20" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded" />
          <div className="h-3 bg-gray-200 rounded w-40" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
          <div className="h-6 w-14 bg-gray-200 rounded-full" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 w-10 bg-gray-100 rounded-full" />
          <div className="h-5 w-20 bg-gray-100 rounded-full" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="h-3 bg-gray-100 rounded w-3/4" />
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 pb-5 flex gap-2">
        <div className="flex-1 h-10 bg-gray-200 rounded-xl" />
        <div className="flex-1 h-10 bg-gray-100 rounded-xl" />
      </div>
    </div>
  )
}
