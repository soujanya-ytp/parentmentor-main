export default function ChildList({
  children,
  onSelectChild,
  selectedChildId,
  onOpenDetails,
  onOpenCoach,
  onOpenChildMode,
}) {
  if (!children.length) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <span className="text-4xl mb-3">👶</span>
        <p className="text-sm font-semibold text-slate-500 mb-1">No children added yet</p>
        <p className="text-sm text-slate-400 max-w-xs">
          Start by creating a child profile to unlock coaching, routines, and dashboard data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {children.map((child) => {
        const selected = child.id === selectedChildId;

        return (
          <article
            key={child.id}
            className={
              selected
                ? "bg-white rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500 bg-indigo-50/30 transition-all duration-150"
                : "bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-150"
            }
          >
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              {/* Avatar + Info */}
              <button
                className="flex items-center gap-4 text-left flex-1 min-w-0"
                onClick={() => onSelectChild(child.id)}
                type="button"
              >
                <div
                  className={
                    selected
                      ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-2xl"
                      : "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-2xl"
                  }
                >
                  {child.avatar || "🌈"}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 truncate">{child.name}</h3>
                    {selected && (
                      <span className="shrink-0 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-semibold text-white">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">Age {child.age}</p>
                  {child.goal && (
                    <p className="text-sm text-slate-600 mt-1 truncate max-w-sm">{child.goal}</p>
                  )}
                </div>
              </button>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 shrink-0">
                <button
                  className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200"
                  onClick={() => onOpenDetails(child.id)}
                  type="button"
                >
                  Details
                </button>
                <button
                  className="border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200"
                  onClick={() => onOpenCoach(child.id)}
                  type="button"
                >
                  Coach
                </button>
                <button
                  className="border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200"
                  onClick={() => onOpenChildMode(child.id)}
                  type="button"
                >
                  Child Mode
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
