import { useEffect, useState } from "react";

import {
  claimReward,
  createReward,
  createTask,
  deleteReward,
  deleteTask,
  getBadges,
  getRewards,
  getTasks,
  toggleTask,
} from "../services/api";

export default function RewardsPage({
  token,
  selectedChild,
  children,
  onSelectChild,
  onUnauthorized,
}) {
  const [tasks, setTasks] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [badges, setBadges] = useState([]);
  const [pointsTotal, setPointsTotal] = useState(0);
  const [taskTitle, setTaskTitle] = useState("");
  const [rewardTitle, setRewardTitle] = useState("");

  useEffect(() => {
    if (!selectedChild) {
      setTasks([]);
      setRewards([]);
      setBadges([]);
      setPointsTotal(0);
      return;
    }

    let active = true;
    Promise.all([getTasks(token, selectedChild.id), getRewards(token, selectedChild.id), getBadges(token, selectedChild.id)])
      .then(([tasksResponse, rewardsResponse, badgesResponse]) => {
        if (!active) return;
        setTasks(tasksResponse.tasks || []);
        setRewards(rewardsResponse.rewards || []);
        setBadges(badgesResponse.badges || []);
        setPointsTotal(rewardsResponse.points_total || 0);
      })
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          onUnauthorized();
        }
      });
    return () => { active = false; };
  }, [selectedChild, token, onUnauthorized]);

  async function handleAddTask(event) {
    event.preventDefault();
    const response = await createTask(token, {
      child_id: selectedChild.id,
      title: taskTitle,
      type: "habit",
      recurring: true,
      points: 15,
    });
    setTasks((current) => [response.task, ...current]);
    setTaskTitle("");
  }

  async function handleToggle(task) {
    const response = await toggleTask(token, task.id, {
      child_id: selectedChild.id,
      completed: !task.completed,
    });
    const updatedTask = response.task;
    const nextTasks = tasks.map((item) => (item.id === updatedTask.id ? updatedTask : item));
    setTasks(nextTasks);
    setPointsTotal(nextTasks.filter((item) => item.completed).reduce((sum, item) => sum + item.points, 0));
    const rewardsResponse = await getRewards(token, selectedChild.id);
    setRewards(rewardsResponse.rewards || []);
    setPointsTotal(rewardsResponse.points_total || 0);
  }

  async function handleDeleteTask(taskId) {
    await deleteTask(token, taskId, selectedChild.id);
    const nextTasks = tasks.filter((item) => item.id !== taskId);
    setTasks(nextTasks);
  }

  async function handleAddReward(event) {
    event.preventDefault();
    const response = await createReward(token, {
      child_id: selectedChild.id,
      title: rewardTitle,
      points_required: 80,
    });
    setRewards((current) => [...current, response.reward]);
    setRewardTitle("");
  }

  async function handleClaim(reward) {
    const response = await claimReward(token, reward.id, { child_id: selectedChild.id });
    setRewards((current) => current.map((item) => (item.id === reward.id ? response.reward : item)));
    setBadges(response.badges || badges);
  }

  async function handleDeleteReward(rewardId) {
    await deleteReward(token, rewardId, selectedChild.id);
    setRewards((current) => current.filter((item) => item.id !== rewardId));
  }

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
        {/* Header — points total */}
        {selectedChild && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-2xl">
              ⭐
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">
                Total Points — {selectedChild.name}
              </p>
              <p className="text-3xl font-bold text-indigo-600">{pointsTotal} pts</p>
            </div>
          </div>
        )}

        {!selectedChild && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 text-center">
            <p className="text-4xl mb-3">👦</p>
            <p className="text-slate-500 text-sm">Select a child from the sidebar to manage their rewards and habits.</p>
          </div>
        )}

        {selectedChild && (
          <>
            {/* Section 1 — Tasks & Habits */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Tasks & Habits</p>
              <h2 className="text-lg font-bold text-slate-900 mb-5">Daily habit tracker</h2>

              {/* Add habit form */}
              <form className="flex gap-3 mb-6" onSubmit={handleAddTask}>
                <input
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400"
                  onChange={(event) => setTaskTitle(event.target.value)}
                  placeholder="e.g. Brush teeth without reminders"
                  value={taskTitle}
                  required
                />
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-60 whitespace-nowrap"
                  type="submit"
                  disabled={!taskTitle.trim()}
                >
                  Add Habit
                </button>
              </form>

              {/* Task list */}
              {tasks.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
                  <p className="text-2xl mb-2">📋</p>
                  <p className="text-sm text-slate-400">No habits added yet. Add one above to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border px-5 py-4 transition-all duration-200 ${
                        task.completed
                          ? "border-slate-100 bg-slate-50 opacity-70"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold text-slate-900 ${task.completed ? "line-through text-slate-400" : ""}`}>
                          {task.title}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-indigo-100 text-indigo-700 px-3 py-0.5 text-xs font-semibold">
                            {task.type || "habit"}
                          </span>
                          <span className="rounded-full bg-slate-100 text-slate-600 px-3 py-0.5 text-xs font-semibold">
                            {task.points} pts
                          </span>
                          {task.streak > 0 && (
                            <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-xs font-semibold">
                              🔥 {task.streak} day streak
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {task.completed ? (
                          <button
                            className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200"
                            onClick={() => handleToggle(task)}
                            type="button"
                          >
                            Undo
                          </button>
                        ) : (
                          <button
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95"
                            onClick={() => handleToggle(task)}
                            type="button"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95"
                          onClick={() => handleDeleteTask(task.id)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Section 2 — Rewards */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Rewards</p>
              <h2 className="text-lg font-bold text-slate-900 mb-5">Redeemable rewards</h2>

              {/* Add reward form */}
              <form className="flex gap-3 mb-6" onSubmit={handleAddReward}>
                <input
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400"
                  onChange={(event) => setRewardTitle(event.target.value)}
                  placeholder="e.g. Weekend ice cream outing"
                  value={rewardTitle}
                  required
                />
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-60 whitespace-nowrap"
                  type="submit"
                  disabled={!rewardTitle.trim()}
                >
                  Add Reward
                </button>
              </form>

              {/* Rewards list */}
              {rewards.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
                  <p className="text-2xl mb-2">🎁</p>
                  <p className="text-sm text-slate-400">No rewards yet. Add one above to motivate your child.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rewards.map((reward) => {
                    const progress = Math.min(100, Math.round((pointsTotal / reward.points_required) * 100));
                    return (
                      <div
                        key={reward.id}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900">{reward.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{reward.points_required} points required</p>
                            {!reward.achieved && (
                              <div className="mt-2">
                                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-indigo-400 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <p className="mt-1 text-xs text-slate-400">{progress}% of the way there</p>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {reward.claimed ? (
                              <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
                                Claimed ✓
                              </span>
                            ) : (
                              <button
                                className={
                                  reward.achieved
                                    ? "bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95"
                                    : "rounded-xl px-4 py-2 text-sm font-semibold bg-slate-100 text-slate-400 cursor-not-allowed"
                                }
                                disabled={!reward.achieved}
                                onClick={() => handleClaim(reward)}
                                type="button"
                              >
                                Claim
                              </button>
                            )}
                            <button
                              className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200 active:scale-95"
                              onClick={() => handleDeleteReward(reward.id)}
                              type="button"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 3 — Badges */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Badges</p>
              <h2 className="text-lg font-bold text-slate-900 mb-5">Earned achievements</h2>
              {badges.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
                  <p className="text-2xl mb-2">🏅</p>
                  <p className="text-sm text-slate-400">Badges unlock from streaks and claimed rewards. Keep going!</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {badges.map((badge) => (
                    <span
                      key={badge.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 text-indigo-700 px-4 py-1.5 text-sm font-semibold"
                    >
                      <span className="text-base">{badge.icon || "🏅"}</span>
                      {badge.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
