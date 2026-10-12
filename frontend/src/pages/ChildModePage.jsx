import { useEffect, useState } from "react";

import {
  claimReward,
  getActivities,
  getBadges,
  getRewards,
  getRoutines,
  getTasks,
  toggleTask,
} from "../services/api";

export default function ChildModePage({
  token,
  selectedChild,
  children,
  onSelectChild,
  onUnauthorized,
}) {
  const [tasks, setTasks] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [activities, setActivities] = useState([]);
  const [rewardsData, setRewardsData] = useState({ rewards: [], badges: [], points_total: 0 });
  const [loading, setLoading] = useState(false);
  const [celebration, setCelebration] = useState("");

  useEffect(() => {
    if (!selectedChild) {
      setLoading(false);
      setTasks([]);
      setRoutines([]);
      setActivities([]);
      setRewardsData({ rewards: [], badges: [], points_total: 0 });
      return;
    }

    let active = true;
    setLoading(true);

    Promise.all([
      getTasks(token, selectedChild.id),
      getRoutines(token, selectedChild.id),
      getActivities(token, selectedChild.id),
      getRewards(token, selectedChild.id),
      getBadges(token, selectedChild.id),
    ])
      .then(([tasksResponse, routinesResponse, activitiesResponse, rewardsResponse, badgesResponse]) => {
        if (!active) {
          return;
        }
        setTasks(tasksResponse.tasks || []);
        setRoutines(routinesResponse.routines || []);
        setActivities(activitiesResponse.activities || []);
        setRewardsData({
          rewards: rewardsResponse.rewards || [],
          badges: badgesResponse.badges || rewardsResponse.badges || [],
          points_total: rewardsResponse.points_total || 0,
        });
      })
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          onUnauthorized();
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
  }, [selectedChild, token, onUnauthorized]);

  async function handleToggle(task) {
    if (!selectedChild) {
      return;
    }
    const response = await toggleTask(token, task.id, {
      child_id: selectedChild.id,
      completed: !task.completed,
    });
    const updatedTask = response.task;
    setTasks((current) => current.map((item) => (item.id === updatedTask.id ? updatedTask : item)));
    if (updatedTask.completed) {
      setCelebration(`Amazing job! ${selectedChild.name} completed "${updatedTask.title}"!`);
    }
  }

  async function handleClaim(reward) {
    if (!selectedChild || reward.claimed) {
      return;
    }
    const response = await claimReward(token, reward.id, { child_id: selectedChild.id });
    setRewardsData((current) => ({
      ...current,
      rewards: current.rewards.map((item) => (item.id === response.reward.id ? response.reward : item)),
      badges: response.badges || current.badges,
    }));
    setCelebration(`Yay! ${reward.title} has been claimed!`);
  }

  const missions = tasks.filter((task) => !task.completed);
  const completedTasks = tasks.filter((task) => task.completed);

  /* ── Loading state ──────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="animate-fade-in flex justify-center py-16">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-10 py-10 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-base font-semibold text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">

      {/* ── Hero header ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border-l-4 border-l-indigo-600 border border-slate-200 shadow-sm px-6 py-6">
        <div className="flex items-center gap-4">
          {selectedChild && (
            <span className="text-5xl leading-none select-none">
              {selectedChild.avatar || "🌟"}
            </span>
          )}
          <div>
            <h2 className="text-3xl font-bold text-slate-900 leading-tight">
              {selectedChild ? `Hi, ${selectedChild.name}! 👋` : "Hello there! 👋"}
            </h2>
            <p className="mt-1 text-base text-slate-500 font-medium">
              {selectedChild
                ? "You're doing great — let's check your day!"
                : "Pick your name below to see your day!"}
            </p>
          </div>
        </div>

        {/* Celebration banner */}
        {celebration ? (
          <div className="mt-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-5 py-4 text-base font-semibold text-center">
            🎉 {celebration}
          </div>
        ) : null}
      </div>

      {/* ── Child selector ────────────────────────────────────────────── */}
      {children && children.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {children.map((child) => (
            <button
              key={child.id}
              type="button"
              onClick={() => onSelectChild(child.id)}
              className={
                selectedChild?.id === child.id
                  ? "rounded-full px-5 py-2.5 text-sm font-semibold bg-indigo-600 text-white shadow-sm transition-all duration-200"
                  : "rounded-full px-5 py-2.5 text-sm font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all duration-200"
              }
            >
              {child.avatar || "🌟"} {child.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Empty state (no child selected) ──────────────────────────── */}
      {!selectedChild && (
        <div className="flex justify-center py-10">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-10 py-10 text-center max-w-sm w-full">
            <p className="text-5xl mb-4">👆</p>
            <p className="text-lg font-bold text-slate-700">Pick your name above</p>
            <p className="mt-1 text-sm text-slate-500">to see your missions and rewards for today!</p>
          </div>
        </div>
      )}

      {/* ── Main two-column layout ────────────────────────────────────── */}
      {selectedChild && (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">

          {/* ── Left column ─────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Today's Missions */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Today's Missions
              </p>

              {/* Pending missions */}
              {missions.length > 0 ? (
                <div className="space-y-3 mt-3">
                  {missions.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-4 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-slate-800 leading-snug">
                          {task.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          ⭐ {task.points} stars
                          {task.streak > 0 && (
                            <span className="ml-2">🔥 {task.streak}-day streak</span>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle(task)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl px-6 py-3 text-base font-bold transition-all duration-200 hover:shadow-lg active:scale-95 whitespace-nowrap flex-shrink-0"
                      >
                        I did it! ✓
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-5 py-4 text-base font-semibold text-center">
                  🎉 All missions done for today — amazing work!
                </div>
              )}

              {/* Completed missions */}
              {completedTasks.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Completed
                  </p>
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center gap-3 opacity-60"
                    >
                      <span className="text-emerald-500 text-base flex-shrink-0">✓</span>
                      <p className="text-sm font-medium text-slate-500 line-through">{task.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* My Routine Steps */}
            {routines.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  My Routine Steps
                </p>
                <p className="text-base font-bold text-slate-800 mb-3">{routines[0].title}</p>
                <ul className="space-y-2">
                  {(routines[0].items || []).map((item) => (
                    <li
                      key={item}
                      className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm font-medium text-slate-700 flex items-center gap-2"
                    >
                      <span className="h-2 w-2 rounded-full bg-indigo-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* ── Right column ─────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* My Stars */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                My Stars
              </p>
              <p className="text-4xl font-bold text-indigo-600 leading-none">
                ⭐ {rewardsData.points_total}
              </p>
              <p className="mt-1 text-sm text-slate-500 font-medium">stars collected so far</p>
              {rewardsData.points_total > 0 && (
                <p className="mt-2 text-xs text-indigo-500 font-semibold">
                  Keep going — you're on a roll!
                </p>
              )}
            </div>

            {/* My Rewards */}
            {rewardsData.rewards.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  My Rewards
                </p>
                <div className="space-y-3">
                  {rewardsData.rewards.map((reward) => (
                    <div
                      key={reward.id}
                      className={
                        reward.achieved
                          ? "rounded-xl bg-indigo-50 border border-indigo-200 p-4"
                          : "rounded-xl bg-slate-50 border border-slate-200 p-4 opacity-60"
                      }
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 leading-snug">
                            {reward.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {reward.claimed
                              ? "Claimed!"
                              : reward.achieved
                              ? "Ready to claim!"
                              : `${reward.points_required} stars needed`}
                          </p>
                          {/* Progress bar for locked rewards */}
                          {!reward.achieved && (
                            <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-indigo-400 transition-all duration-500"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    Math.round(
                                      (rewardsData.points_total / (reward.points_required || 1)) * 100
                                    )
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                        {reward.achieved && !reward.claimed && (
                          <button
                            type="button"
                            onClick={() => handleClaim(reward)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 active:scale-95 flex-shrink-0"
                          >
                            Claim!
                          </button>
                        )}
                        {reward.claimed && (
                          <span className="flex-shrink-0 rounded-xl bg-emerald-100 text-emerald-700 px-3 py-1.5 text-xs font-bold">
                            ✓ Got it!
                          </span>
                        )}
                        {!reward.achieved && (
                          <span className="flex-shrink-0 text-lg">🔒</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Badges */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                My Badges
              </p>
              {rewardsData.badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {rewardsData.badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="rounded-full bg-indigo-100 text-indigo-800 px-4 py-2 text-sm font-semibold flex items-center gap-2"
                    >
                      <span>{badge.icon || "🏅"}</span>
                      <span>{badge.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Complete missions to earn your first badge!
                </p>
              )}
            </div>

            {/* My Activities */}
            {activities.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                  Fun Activities
                </p>
                <div className="space-y-3">
                  {activities.slice(0, 3).map((activity) => (
                    <div
                      key={activity.id}
                      className="rounded-xl bg-white border border-slate-200 p-4"
                    >
                      <p className="text-sm font-bold text-slate-800">{activity.title}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {activity.duration || "Flexible"} · {activity.category}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
