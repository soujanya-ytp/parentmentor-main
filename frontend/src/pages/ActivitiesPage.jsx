import { useEffect, useState } from "react";

import {
  createActivity,
  deleteActivity,
  generateActivity,
  getActivities,
} from "../services/api";

const blank = {
  current_mood: "calm",
  goal: "",
  available_time: "15 minutes",
  setting: "indoor",
  interests: "",
  category: "learning",
};

export default function ActivitiesPage({
  token,
  selectedChild,
  children,
  onSelectChild,
  onUnauthorized,
}) {
  const [activities, setActivities] = useState([]);
  const [generator, setGenerator] = useState(blank);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedChild) {
      setActivities([]);
      return;
    }
    getActivities(token, selectedChild.id)
      .then((response) => setActivities(response.activities || []))
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          onUnauthorized();
        }
      });
  }, [selectedChild, token, onUnauthorized]);

  function updateField(field, value) {
    setGenerator((current) => ({ ...current, [field]: value }));
  }

  async function handleGenerate(event) {
    event.preventDefault();
    if (!selectedChild) {
      return;
    }
    try {
      const response = await generateActivity(token, {
        child_id: selectedChild.id,
        ...generator,
      });
      setPreview(response.activity);
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || "Failed to generate activity");
    }
  }

  async function handleSavePreview() {
    if (!selectedChild || !preview) {
      return;
    }
    const response = await createActivity(token, { child_id: selectedChild.id, ...preview });
    setActivities((current) => [response.activity, ...current]);
    setPreview(null);
  }

  async function handleDelete(activityId) {
    if (!selectedChild) {
      return;
    }
    await deleteActivity(token, activityId, selectedChild.id);
    setActivities((current) => current.filter((item) => item.id !== activityId));
  }

  return (
    <div className="animate-fade-in grid gap-6 xl:grid-cols-[300px_1fr]">
      {/* Left Sidebar */}
      <aside className="space-y-5">
        {/* Child Selector */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Children</p>
          <div className="mt-3 space-y-2">
            {children.length === 0 && (
              <p className="text-sm text-slate-400 italic">No children added yet.</p>
            )}
            {children.map((child) => (
              <button
                key={child.id}
                className={
                  selectedChild?.id === child.id
                    ? "block w-full rounded-xl bg-indigo-600 px-4 py-3 text-left text-sm font-semibold text-white"
                    : "block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors duration-150"
                }
                onClick={() => onSelectChild(child.id)}
                type="button"
              >
                {child.avatar || "🌟"} {child.name}
              </button>
            ))}
          </div>
        </div>

        {/* Generate Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Activity Generator</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            {selectedChild ? `Suggest for ${selectedChild.name}` : "Select a child first"}
          </h2>

          {error && (
            <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form className="mt-5 space-y-4" onSubmit={handleGenerate}>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
                Current Mood
              </label>
              <select
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                onChange={(event) => updateField("current_mood", event.target.value)}
                value={generator.current_mood}
              >
                {["happy", "calm", "sad", "frustrated", "anxious", "energetic", "tired", "overwhelmed"].map((item) => (
                  <option key={item} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
                Goal
              </label>
              <input
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400"
                onChange={(event) => updateField("goal", event.target.value)}
                placeholder="e.g. Build focus"
                value={generator.goal}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
                Available Time
              </label>
              <input
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400"
                onChange={(event) => updateField("available_time", event.target.value)}
                placeholder="e.g. 15 minutes"
                value={generator.available_time}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
                Category
              </label>
              <select
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                onChange={(event) => updateField("category", event.target.value)}
                value={generator.category}
              >
                {[
                  "learning",
                  "emotional regulation",
                  "physical activity",
                  "creativity",
                  "family bonding",
                  "screen-free fun",
                  "healthy eating challenge",
                  "focus / concentration",
                ].map((item) => (
                  <option key={item} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
                Interests
              </label>
              <input
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400"
                onChange={(event) => updateField("interests", event.target.value)}
                placeholder="e.g. dinosaurs, painting"
                value={generator.interests}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
                Setting
              </label>
              <select
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                onChange={(event) => updateField("setting", event.target.value)}
                value={generator.setting}
              >
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
              </select>
            </div>

            <button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-60"
              disabled={!selectedChild}
              type="submit"
            >
              Generate Activity
            </button>
          </form>
        </div>
      </aside>

      {/* Right Main */}
      <section className="space-y-6">
        {/* Generated Preview */}
        {preview && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">Generated Preview</p>
                <h3 className="text-xl font-bold text-slate-900">{preview.title}</h3>
              </div>
              {preview.category && (
                <span className="rounded-full bg-emerald-100 text-emerald-700 px-3 py-0.5 text-xs font-semibold shrink-0">
                  {preview.category}
                </span>
              )}
            </div>

            {preview.description && (
              <p className="text-sm text-slate-600 leading-relaxed mb-4">{preview.description}</p>
            )}

            <div className="grid gap-3 sm:grid-cols-2 mb-4">
              {preview.duration && (
                <div className="bg-white/70 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Duration</p>
                  <p className="text-sm font-medium text-slate-800">{preview.duration}</p>
                </div>
              )}
              {preview.benefits && (
                <div className="bg-white/70 rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Benefits</p>
                  <p className="text-sm text-slate-700">{preview.benefits}</p>
                </div>
              )}
            </div>

            {preview.parent_tip && (
              <div className="bg-white/70 rounded-xl px-4 py-3 mb-4 flex gap-2.5">
                <span className="text-base shrink-0">💡</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-0.5">Parent Tip</p>
                  <p className="text-sm text-slate-700">{preview.parent_tip}</p>
                </div>
              </div>
            )}

            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95"
              onClick={handleSavePreview}
              type="button"
            >
              Save Activity
            </button>
          </div>
        )}

        {/* Saved Activities Library */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Library</p>
            <h3 className="text-xl font-bold text-slate-900">Saved Activities</h3>
          </div>

          {activities.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm font-medium text-slate-500">No activities saved yet.</p>
              <p className="mt-1 text-xs text-slate-400">Generate and save activities to build your library.</p>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {activities.map((activity) => (
              <article key={activity.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="text-base font-bold text-slate-900 leading-snug">{activity.title}</h4>
                  {activity.category && (
                    <span className="rounded-full bg-indigo-100 text-indigo-700 px-3 py-0.5 text-xs font-semibold shrink-0">
                      {activity.category}
                    </span>
                  )}
                </div>

                {activity.description && (
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-3 flex-1">
                    {activity.description}
                  </p>
                )}

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
                  {activity.duration && (
                    <span className="text-xs font-medium text-slate-500">{activity.duration}</span>
                  )}
                  <button
                    className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 ml-auto"
                    onClick={() => handleDelete(activity.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
