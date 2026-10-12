import { useEffect, useState } from "react";

import { getInsights } from "../services/api";

const MOOD_SCORES = {
  happy: 5,
  excited: 5,
  great: 5,
  good: 4,
  okay: 3,
  neutral: 3,
  meh: 2,
  sad: 1,
  upset: 1,
  angry: 1,
  tired: 2,
};

function getMoodScore(mood) {
  if (!mood) return 3;
  const key = mood.toLowerCase().trim();
  return MOOD_SCORES[key] ?? Math.max(1, Math.min(5, Math.round((mood.length % 5) + 1)));
}

const STAT_ACCENT = [
  "border-indigo-400",
  "border-emerald-400",
  "border-amber-400",
  "border-rose-400",
];

export default function AnalyticsPage({ token, selectedChild, children, onSelectChild, onUnauthorized }) {
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    if (!selectedChild) {
      setInsights(null);
      return;
    }
    getInsights(token, selectedChild.id)
      .then(setInsights)
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          onUnauthorized();
        }
      });
  }, [selectedChild, token, onUnauthorized]);

  const moodEntries = (insights?.recent_mood_trend?.recent || []).slice(0, 7).reverse();
  const maxMoodScore = Math.max(...moodEntries.map((e) => getMoodScore(e.mood)), 1);

  const statCards = insights
    ? [
        { label: "Completion Rate", value: `${insights.completion_rate}%`, accent: STAT_ACCENT[0], icon: "✅" },
        { label: "Habit Consistency", value: `${insights.habit_consistency} days`, accent: STAT_ACCENT[1], icon: "📅" },
        { label: "Strongest Habit", value: insights.strongest_habit || "—", accent: STAT_ACCENT[2], icon: "💪" },
        { label: "Challenge Area", value: insights.challenge_area || "—", accent: STAT_ACCENT[3], icon: "🎯" },
      ]
    : [];

  return (
    <div className="animate-fade-in grid gap-6 xl:grid-cols-[280px_1fr]">
      {/* Left sidebar — child selector */}
      <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">Children</p>
        <div className="space-y-2">
          {children.length === 0 && (
            <p className="text-sm text-slate-400">No children added yet.</p>
          )}
          {children.map((child) => (
            <button
              key={child.id}
              className={
                selectedChild?.id === child.id
                  ? "block w-full rounded-xl bg-indigo-600 px-4 py-3 text-left text-sm font-semibold text-white"
                  : "block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              }
              onClick={() => onSelectChild(child.id)}
              type="button"
            >
              {child.avatar || "🌟"} {child.name}
            </button>
          ))}
        </div>
      </aside>

      {/* Right main content */}
      <section className="space-y-6">
        {/* Empty state — no child selected */}
        {!selectedChild && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <p className="text-5xl mb-4">📊</p>
            <p className="text-slate-900 font-semibold text-lg mb-1">No child selected</p>
            <p className="text-slate-500 text-sm">Select a child from the sidebar to view their weekly analytics.</p>
          </div>
        )}

        {selectedChild && (
          <>
            {/* Page heading */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Weekly Analytics</p>
              <h2 className="text-xl font-bold text-slate-900">{selectedChild.name}&apos;s Progress Report</h2>
            </div>

            {/* Empty state — no insights yet */}
            {!insights && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
                <p className="text-4xl mb-3">⏳</p>
                <p className="text-slate-500 text-sm">Insights are being generated. Keep logging habits to see progress here.</p>
              </div>
            )}

            {insights && (
              <>
                {/* Summary stat cards row */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {statCards.map((card) => (
                    <div
                      key={card.label}
                      className={`bg-white rounded-2xl border border-slate-200 shadow-sm p-5 border-l-4 ${card.accent}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base">{card.icon}</span>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.label}</p>
                      </div>
                      <p className="text-xl font-bold text-slate-900 truncate">{card.value}</p>
                    </div>
                  ))}
                </div>

                {/* Weekly Summary card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Weekly Summary</p>
                  <h3 className="text-base font-bold text-slate-900 mb-4">AI-generated analysis</h3>
                  <p className="text-sm leading-7 text-slate-600 mb-5">{insights.weekly_summary}</p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Focus area box */}
                    <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1.5">
                        Next Week Focus
                      </p>
                      <p className="text-sm leading-6 text-slate-700">{insights.focus_area_next_week || "—"}</p>
                    </div>

                    {/* Recommendation box */}
                    <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1.5">
                        AI Recommendation
                      </p>
                      <p className="text-sm leading-6 text-slate-700">{insights.recommendation || "—"}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom two cards row */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Mood Trend card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Mood Trend</p>
                    <h3 className="text-base font-bold text-slate-900 mb-6">Recent mood history</h3>

                    {moodEntries.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-3xl mb-2">😶</p>
                        <p className="text-sm text-slate-400">No mood data recorded yet.</p>
                      </div>
                    ) : (
                      <div className="flex items-end gap-2 h-32">
                        {moodEntries.map((entry, index) => {
                          const score = getMoodScore(entry.mood);
                          const heightPct = Math.round((score / maxMoodScore) * 100);
                          return (
                            <div key={entry.id ?? index} className="flex flex-1 flex-col items-center gap-1">
                              <div className="w-full flex items-end" style={{ height: "96px" }}>
                                <div
                                  className="w-full rounded-t-lg bg-indigo-500 transition-all duration-500"
                                  style={{ height: `${Math.max(12, heightPct)}%` }}
                                  title={`${entry.mood} (${score}/5)`}
                                />
                              </div>
                              <p className="text-center text-[10px] font-semibold text-slate-500 capitalize leading-tight">
                                {entry.mood}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Streak Highlights card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Streak Highlights</p>
                    <h3 className="text-base font-bold text-slate-900 mb-5">Top performing habits</h3>

                    {!insights.streak_highlights?.length ? (
                      <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-3xl mb-2">🔥</p>
                        <p className="text-sm text-slate-400">Keep logging habits to build streak highlights here.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {insights.streak_highlights.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-base">🔥</span>
                              <p className="text-sm font-semibold text-slate-700">{item}</p>
                            </div>
                            <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-semibold">
                              On a streak
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
