import { useEffect, useMemo, useState } from "react";

import ChildForm from "../components/ChildForm";
import ChildList from "../components/ChildList";
import {
  createChild,
  createMood,
  createReward,
  createTask,
  getDashboard,
  updateCurrentUser,
} from "../services/api";

const statCards = [
  ["today_tasks", "Today's Tasks", "border-l-indigo-500"],
  ["current_streak", "Current Streak", "border-l-emerald-500"],
  ["reward_points", "Reward Points", "border-l-violet-500"],
  ["mood_trend", "Mood Trend", "border-l-sky-500"],
  ["completion_rate", "Completion Rate", "border-l-indigo-500"],
  ["quick_recommendation", "Quick Recommendation", "border-l-emerald-500"],
];

const emptyChild = {
  name: "",
  age: "",
  avatar: "🌟",
  interests: "",
  favorite_activities: "",
  strengths: "",
  challenges: "",
  goal: "",
  notes: "",
};

export default function DashboardPage({
  token,
  user,
  children,
  selectedChild,
  selectedChildId,
  onSelectChild,
  onChildrenUpdated,
  onOpenChildren,
  onOpenCoach,
  onOpenRoutines,
  onOpenActivities,
  onOpenRewards,
  onOpenInsights,
  onOpenChildMode,
  onUnauthorized,
  setUser,
}) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [childForm, setChildForm] = useState(emptyChild);
  const [savingChild, setSavingChild] = useState(false);
  const [profileName, setProfileName] = useState(user?.name || "");
  const [savingName, setSavingName] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [mood, setMood] = useState("happy");
  const [rewardTitle, setRewardTitle] = useState("");

  useEffect(() => {
    setProfileName(user?.name || "");
  }, [user]);

  useEffect(() => {
    if (!selectedChildId) {
      setDashboard(null);
      setLoading(false);
      setError("");
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    getDashboard(token, selectedChildId)
      .then((response) => {
        if (active) {
          setDashboard(response);
        }
      })
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          onUnauthorized();
          return;
        }
        if (active) {
          setError(requestError.response?.data?.error || requestError.message || "Failed to load dashboard");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedChildId, token, onUnauthorized]);

  const todayTasks = dashboard?.tasks?.today || [];
  const completedTasks = dashboard?.tasks?.completed || [];
  const summary = dashboard?.weekly_summary;

  const showOnboarding = useMemo(() => !user?.name || children.length === 0, [user, children.length]);

  async function refreshAfterQuickAction() {
    const response = await getDashboard(token, selectedChildId);
    setDashboard(response);
  }

  async function handleSaveName(event) {
    event.preventDefault();
    setSavingName(true);
    setError("");

    try {
      const response = await updateCurrentUser(token, { name: profileName });
      setUser(response.user);
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || "Failed to save parent name");
    } finally {
      setSavingName(false);
    }
  }

  async function handleCreateChild(event) {
    event.preventDefault();
    setSavingChild(true);
    setError("");

    try {
      const response = await createChild(token, childForm);
      onChildrenUpdated([response.child, ...children]);
      onSelectChild(response.child.id);
      setChildForm(emptyChild);
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || "Failed to create child");
    } finally {
      setSavingChild(false);
    }
  }

  async function handleCreateTask(event) {
    event.preventDefault();
    if (!selectedChild) {
      return;
    }

    try {
      await createTask(token, {
        child_id: selectedChild.id,
        title: taskTitle,
        type: "daily",
        recurring: true,
        points: 10,
      });
      setTaskTitle("");
      await refreshAfterQuickAction();
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || "Failed to add task");
    }
  }

  async function handleCreateMood(event) {
    event.preventDefault();
    if (!selectedChild) {
      return;
    }

    try {
      await createMood(token, {
        child_id: selectedChild.id,
        mood,
        date: new Date().toISOString().slice(0, 10),
      });
      await refreshAfterQuickAction();
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || "Failed to log mood");
    }
  }

  async function handleCreateReward(event) {
    event.preventDefault();
    if (!selectedChild) {
      return;
    }

    try {
      await createReward(token, {
        child_id: selectedChild.id,
        title: rewardTitle,
        points_required: 60,
      });
      setRewardTitle("");
      await refreshAfterQuickAction();
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || "Failed to create reward");
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* ── Page Header ── */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm px-6 py-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Parent Dashboard
            </p>
            <h2 className="text-2xl font-bold text-slate-900 leading-snug">
              {selectedChild
                ? `${selectedChild.avatar || "🌟"} ${selectedChild.name}'s Day at a Glance`
                : "Build your family dashboard"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Review routines, track mood, and keep your family on track.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <button
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 flex items-center gap-2"
              onClick={onOpenCoach}
              type="button"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
              </svg>
              Coach
            </button>
            <button
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 flex items-center gap-2"
              onClick={onOpenRoutines}
              type="button"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Routines
            </button>
            <button
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 flex items-center gap-2"
              onClick={onOpenActivities}
              type="button"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Activities
            </button>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95 flex items-center gap-2"
              onClick={onOpenChildMode}
              type="button"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Child Mode
            </button>
          </div>
        </div>
      </section>

      {/* ── Onboarding ── */}
      {showOnboarding ? (
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Parent name card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Step 1
            </p>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Set up your parent profile</h3>
            <form className="space-y-4" onSubmit={handleSaveName}>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
                  Your Name
                </label>
                <input
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400"
                  onChange={(event) => setProfileName(event.target.value)}
                  placeholder="e.g. Alex"
                  value={profileName}
                />
              </div>
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={savingName}
                type="submit"
              >
                {savingName ? "Saving..." : "Save Parent Name"}
              </button>
            </form>
          </div>

          {/* First child card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Step 2
            </p>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create your first child profile</h3>
            <ChildForm
              error={error}
              formState={childForm}
              loading={savingChild}
              onChange={setChildForm}
              onSubmit={handleCreateChild}
              submitLabel="Create First Child"
            />
          </div>
        </section>
      ) : null}

      {/* ── Error Banner ── */}
      {error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {/* ── Main Content: 2-column layout ── */}
      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Stat cards grid */}
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {statCards.map(([key, label, accentClass]) => (
              <article
                key={key}
                className={`bg-white rounded-2xl border border-slate-200 shadow-sm border-l-4 ${accentClass} px-5 py-4`}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  {label}
                </p>
                <p className="text-xl font-bold text-slate-900 leading-snug mt-2">
                  {loading ? (
                    <span className="inline-block h-5 w-24 rounded bg-slate-100 animate-pulse" />
                  ) : (
                    dashboard?.stats?.[key] ?? <span className="text-slate-400 text-sm font-normal">No data yet</span>
                  )}
                </p>
              </article>
            ))}
          </div>

          {/* Child switcher */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Switch Child
                </p>
                <h3 className="text-base font-bold text-slate-900">Active Profiles</h3>
              </div>
              <button
                className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200"
                onClick={onOpenChildren}
                type="button"
              >
                Manage Profiles
              </button>
            </div>
            <ChildList
              children={children}
              onOpenChildMode={(childId) => {
                onSelectChild(childId);
                onOpenChildMode();
              }}
              onOpenCoach={(childId) => {
                onSelectChild(childId);
                onOpenCoach();
              }}
              onOpenDetails={(childId) => {
                onSelectChild(childId);
                onOpenChildren();
              }}
              onSelectChild={onSelectChild}
              selectedChildId={selectedChildId}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Today's Checklist */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              Today's Checklist
            </p>
            <h3 className="text-base font-bold text-slate-900 mb-4">Tasks for today</h3>

            <div className="space-y-2">
              {todayTasks.length ? (
                todayTasks.slice(0, 4).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-3"
                  >
                    <p className="text-sm font-medium text-slate-800">{task.title}</p>
                    <span className="ml-3 shrink-0 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-0.5">
                      {task.points} pts
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-4 text-sm text-slate-400 text-center">
                  No pending tasks yet for this child.
                </p>
              )}
            </div>

            <form className="mt-4 flex gap-2" onSubmit={handleCreateTask}>
              <input
                className="flex-1 bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400 text-sm"
                onChange={(event) => setTaskTitle(event.target.value)}
                placeholder="Add a new task..."
                value={taskTitle}
              />
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95"
                type="submit"
              >
                Add
              </button>
            </form>
          </div>

          {/* Mood + Reward side by side */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Mood Check */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Mood Check
              </p>
              <h3 className="text-base font-bold text-slate-900 mb-1">Log a mood</h3>
              <p className="text-sm text-slate-600 mb-4">
                {dashboard?.mood_summary?.trend_label
                  ? `Recent trend: ${dashboard.mood_summary.trend_label}`
                  : "No mood logs yet."}
              </p>
              <form className="space-y-3" onSubmit={handleCreateMood}>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
                    Current Mood
                  </label>
                  <select
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400 text-sm"
                    onChange={(event) => setMood(event.target.value)}
                    value={mood}
                  >
                    {["happy", "calm", "sad", "frustrated", "anxious", "energetic", "tired", "overwhelmed"].map((item) => (
                      <option key={item} value={item}>
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95"
                  type="submit"
                >
                  Log Mood
                </button>
              </form>
            </div>

            {/* Reward Setup */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Reward Setup
              </p>
              <h3 className="text-base font-bold text-slate-900 mb-1">Add a reward</h3>
              <p className="text-sm text-slate-600 mb-4">
                {completedTasks.length > 0
                  ? `${completedTasks.length} task${completedTasks.length === 1 ? "" : "s"} completed today.`
                  : "Complete tasks to unlock rewards."}
              </p>
              <form className="space-y-3" onSubmit={handleCreateReward}>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
                    Reward Title
                  </label>
                  <input
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400 text-sm"
                    onChange={(event) => setRewardTitle(event.target.value)}
                    placeholder="e.g. Movie night"
                    value={rewardTitle}
                  />
                </div>
                <button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95"
                  type="submit"
                >
                  Add Reward
                </button>
              </form>
            </div>
          </div>

          {/* Weekly Summary */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Weekly Summary
                </p>
                <h3 className="text-base font-bold text-slate-900">Insight snapshot</h3>
              </div>
              <button
                className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 shrink-0"
                onClick={onOpenInsights}
                type="button"
              >
                Full Insights
              </button>
            </div>

            {summary ? (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 leading-relaxed">{summary.summary}</p>
                <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-0.5">
                    Next Focus
                  </p>
                  <p className="text-sm text-indigo-800">{summary.focus_area_next_week}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-0.5">
                    Recommendation
                  </p>
                  <p className="text-sm text-emerald-800">{summary.recommendation}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">
                Insights will appear once a child is selected.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
