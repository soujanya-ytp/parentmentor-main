import { useEffect, useState } from "react";

import {
  createRoutine,
  deleteRoutine,
  generateRoutine,
  getRoutines,
  updateRoutine,
} from "../services/api";

const blankRoutine = {
  title: "",
  routine_type: "morning",
  goal: "",
  time_of_day: "",
  estimated_duration: "",
  structure_level: "balanced",
  items: "",
  parent_tips: "",
  child_phrase: "",
  recurring: true,
  archived: false,
};

export default function RoutineSetupPage({
  token,
  selectedChild,
  children,
  onSelectChild,
  onUnauthorized,
}) {
  const [routines, setRoutines] = useState([]);
  const [formState, setFormState] = useState(blankRoutine);
  const [generatedRoutine, setGeneratedRoutine] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedChild) {
      setRoutines([]);
      return;
    }

    let active = true;
    setLoading(true);
    getRoutines(token, selectedChild.id)
      .then((response) => {
        if (active) {
          setRoutines(response.routines || []);
        }
      })
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          onUnauthorized();
          return;
        }
        if (active) {
          setError(requestError.response?.data?.error || requestError.message || "Failed to load routines");
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

  function updateField(field, value) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  async function handleGenerate(event) {
    event.preventDefault();
    if (!selectedChild) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await generateRoutine(token, {
        child_id: selectedChild.id,
        routine_type: formState.routine_type,
        goal: formState.goal,
        time_of_day: formState.time_of_day,
        estimated_duration: formState.estimated_duration,
        structure_level: formState.structure_level,
      });
      setGeneratedRoutine(response.routine);
      setFormState((current) => ({
        ...current,
        ...response.routine,
        items: (response.routine.items || []).join("\n"),
      }));
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || "Failed to generate routine");
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!selectedChild) {
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      ...formState,
      child_id: selectedChild.id,
      items: formState.items,
    };

    try {
      const response = editingId
        ? await updateRoutine(token, editingId, payload)
        : await createRoutine(token, payload);

      const routine = response.routine;
      setRoutines((current) =>
        editingId ? current.map((item) => (item.id === routine.id ? routine : item)) : [routine, ...current]
      );
      setFormState(blankRoutine);
      setGeneratedRoutine(null);
      setEditingId(null);
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || "Failed to save routine");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(routineId) {
    if (!selectedChild) {
      return;
    }

    try {
      await deleteRoutine(token, routineId, selectedChild.id);
      setRoutines((current) => current.filter((item) => item.id !== routineId));
      if (editingId === routineId) {
        setFormState(blankRoutine);
        setEditingId(null);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || "Failed to delete routine");
    }
  }

  function startEditing(routine) {
    setEditingId(routine.id);
    setGeneratedRoutine(null);
    setFormState({
      ...routine,
      items: (routine.items || []).join("\n"),
    });
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

        {/* Generate Routine Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Routine Generator</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            {selectedChild ? `Build for ${selectedChild.name}` : "Select a child first"}
          </h2>

          {error && (
            <div className="mt-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form className="mt-5 space-y-4" onSubmit={handleGenerate}>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
                Routine Type
              </label>
              <select
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                onChange={(event) => updateField("routine_type", event.target.value)}
                value={formState.routine_type}
              >
                {["morning", "bedtime", "homework", "after-school", "healthy eating", "exercise", "calm-down"].map((item) => (
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
                placeholder="e.g. Easier evenings"
                value={formState.goal}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
                Time of Day
              </label>
              <input
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400"
                onChange={(event) => updateField("time_of_day", event.target.value)}
                placeholder="e.g. 7:30 PM"
                value={formState.time_of_day}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
                Estimated Duration
              </label>
              <input
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400"
                onChange={(event) => updateField("estimated_duration", event.target.value)}
                placeholder="e.g. 25 minutes"
                value={formState.estimated_duration}
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">
                Structure Level
              </label>
              <select
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                onChange={(event) => updateField("structure_level", event.target.value)}
                value={formState.structure_level}
              >
                {["gentle", "balanced", "high"].map((item) => (
                  <option key={item} value={item}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-60"
              disabled={saving || !selectedChild}
              type="submit"
            >
              {saving ? "Generating..." : "Generate Routine"}
            </button>
          </form>
        </div>
      </aside>

      {/* Right Main */}
      <section className="space-y-6">
        {/* Generated Routine Preview */}
        {generatedRoutine && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-1">Generated Preview</p>
                <h3 className="text-xl font-bold text-slate-900">{formState.title || "Untitled Routine"}</h3>
              </div>
              <span className="rounded-full bg-indigo-100 text-indigo-700 px-3 py-0.5 text-xs font-semibold">
                {formState.routine_type}
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              {formState.time_of_day && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Time of Day</p>
                  <p className="text-sm text-slate-700">{formState.time_of_day}</p>
                </div>
              )}
              {formState.estimated_duration && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Duration</p>
                  <p className="text-sm text-slate-700">{formState.estimated_duration}</p>
                </div>
              )}
              {formState.goal && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Goal</p>
                  <p className="text-sm text-slate-700">{formState.goal}</p>
                </div>
              )}
            </div>

            {formState.items && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Routine Steps</p>
                <div className="space-y-1.5">
                  {formState.items.split("\n").filter(Boolean).map((step, index) => (
                    <div key={index} className="flex items-start gap-2.5 bg-white/70 rounded-xl px-3.5 py-2.5">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                        {index + 1}
                      </span>
                      <span className="text-sm text-slate-700">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formState.parent_tips && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Parent Tips</p>
                <p className="text-sm text-slate-600">{formState.parent_tips}</p>
              </div>
            )}

            {formState.child_phrase && (
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Child-Friendly Phrase</p>
                <p className="text-sm text-slate-600 italic">"{formState.child_phrase}"</p>
              </div>
            )}

            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-60"
              disabled={saving || !selectedChild}
              onClick={handleSave}
              type="button"
            >
              {saving ? "Saving..." : "Save Routine"}
            </button>
          </div>
        )}

        {/* Editing Form */}
        {editingId && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-1">Editing Routine</p>
            <h3 className="text-lg font-bold text-slate-900 mb-5">{formState.title || "Untitled Routine"}</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Title</label>
                <input
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400"
                  onChange={(event) => updateField("title", event.target.value)}
                  placeholder="Routine title"
                  value={formState.title}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Routine Type</label>
                <select
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  onChange={(event) => updateField("routine_type", event.target.value)}
                  value={formState.routine_type}
                >
                  {["morning", "bedtime", "homework", "after-school", "healthy eating", "exercise", "calm-down"].map((item) => (
                    <option key={item} value={item}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Goal</label>
                <input
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400"
                  onChange={(event) => updateField("goal", event.target.value)}
                  placeholder="e.g. Easier evenings"
                  value={formState.goal}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Time of Day</label>
                <input
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400"
                  onChange={(event) => updateField("time_of_day", event.target.value)}
                  placeholder="e.g. 7:30 PM"
                  value={formState.time_of_day}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Estimated Duration</label>
                <input
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400"
                  onChange={(event) => updateField("estimated_duration", event.target.value)}
                  placeholder="e.g. 25 minutes"
                  value={formState.estimated_duration}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Structure Level</label>
                <select
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                  onChange={(event) => updateField("structure_level", event.target.value)}
                  value={formState.structure_level}
                >
                  {["gentle", "balanced", "high"].map((item) => (
                    <option key={item} value={item}>
                      {item.charAt(0).toUpperCase() + item.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Routine Items</label>
                <textarea
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400 min-h-[100px] resize-none"
                  onChange={(event) => updateField("items", event.target.value)}
                  placeholder="One step per line"
                  value={formState.items}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Parent Tips</label>
                <textarea
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400 min-h-[100px] resize-none"
                  onChange={(event) => updateField("parent_tips", event.target.value)}
                  value={formState.parent_tips}
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1 block">Child-Friendly Phrase</label>
                <textarea
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400 min-h-[100px] resize-none"
                  onChange={(event) => updateField("child_phrase", event.target.value)}
                  value={formState.child_phrase}
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-60"
                disabled={saving || !selectedChild}
                onClick={handleSave}
                type="button"
              >
                {saving ? "Saving..." : "Update Routine"}
              </button>
              <button
                className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200"
                onClick={() => { setEditingId(null); setFormState(blankRoutine); setGeneratedRoutine(null); }}
                type="button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Saved Routines */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Library</p>
              <h3 className="text-xl font-bold text-slate-900">Saved Routines</h3>
            </div>
            {loading && (
              <span className="text-sm text-slate-400">Loading...</span>
            )}
          </div>

          {!loading && routines.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
              <p className="text-sm font-medium text-slate-500">No routines saved yet.</p>
              <p className="mt-1 text-xs text-slate-400">Use the generator on the left to create your first routine.</p>
            </div>
          )}

          <div className="space-y-4">
            {routines.map((routine) => (
              <article key={routine.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h4 className="text-base font-bold text-slate-900">{routine.title}</h4>
                      <span className="rounded-full bg-indigo-100 text-indigo-700 px-3 py-0.5 text-xs font-semibold">
                        {routine.routine_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mb-3">
                      {routine.estimated_duration || "Flexible"} &bull; {routine.structure_level} structure
                      {routine.time_of_day ? ` \u00b7 ${routine.time_of_day}` : ""}
                    </p>
                    {(routine.items || []).length > 0 && (
                      <div className="space-y-1.5">
                        {(routine.items || []).slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                            <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                              {index + 1}
                            </span>
                            <span className="truncate">{item}</span>
                          </div>
                        ))}
                        {(routine.items || []).length > 3 && (
                          <p className="text-xs text-slate-400 pl-6">
                            +{routine.items.length - 3} more steps
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200"
                      onClick={() => startEditing(routine)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95"
                      onClick={() => handleDelete(routine.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
