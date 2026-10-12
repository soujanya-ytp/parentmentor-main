import { useEffect, useState } from "react";

import ChildForm from "../components/ChildForm";
import {
  deleteChild,
  getChildDetail,
  updateChild,
} from "../services/api";

const blank = {
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

export default function ChildrenPage({
  token,
  children,
  selectedChild,
  selectedChildId,
  onSelectChild,
  onChildrenUpdated,
  onUnauthorized,
}) {
  const [detail, setDetail] = useState(null);
  const [formState, setFormState] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedChildId) {
      setDetail(null);
      return;
    }

    let active = true;
    getChildDetail(token, selectedChildId)
      .then((response) => {
        if (!active) {
          return;
        }
        setDetail(response);
        setFormState({
          ...blank,
          ...response.child,
          age: response.child.age,
        });
      })
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          onUnauthorized();
        }
      });

    return () => {
      active = false;
    };
  }, [selectedChildId, token, onUnauthorized]);

  async function handleSave(event) {
    event.preventDefault();
    if (!selectedChild) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await updateChild(token, selectedChild.id, formState);
      onChildrenUpdated(children.map((child) => (child.id === selectedChild.id ? response.child : child)));
      setDetail((current) => ({ ...current, child: response.child }));
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || "Failed to update child");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedChild) {
      return;
    }
    try {
      await deleteChild(token, selectedChild.id);
      onChildrenUpdated(children.filter((child) => child.id !== selectedChild.id));
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || "Failed to delete child");
    }
  }

  const statItems = detail
    ? [
        { label: "Tasks", value: detail.tasks?.length || 0, unit: "created" },
        { label: "Routines", value: detail.routines?.length || 0, unit: "saved" },
        { label: "Activities", value: detail.activities?.length || 0, unit: "available" },
        { label: "Mood Logs", value: detail.moods?.length || 0, unit: "entries" },
        { label: "Rewards", value: detail.rewards?.length || 0, unit: "set" },
        { label: "Coach Chats", value: detail.history?.length || 0, unit: "sessions" },
      ]
    : [];

  return (
    <div className="animate-fade-in grid gap-6 xl:grid-cols-[280px_1fr]">
      {/* Sidebar */}
      <aside className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 self-start">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
          Child Profiles
        </p>
        <div className="space-y-2">
          {children.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-4">No children added yet.</p>
          ) : (
            children.map((child) => (
              <button
                key={child.id}
                className={
                  selectedChildId === child.id
                    ? "block w-full rounded-xl bg-indigo-600 px-4 py-3 text-left text-sm font-semibold text-white transition-all duration-150"
                    : "block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors duration-150"
                }
                onClick={() => onSelectChild(child.id)}
                type="button"
              >
                <span className="mr-2">{child.avatar || "🌟"}</span>
                {child.name}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Main area */}
      <section className="space-y-6 min-w-0">
        {!selectedChild ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <span className="text-4xl mb-4">👤</span>
            <p className="text-slate-500 text-sm font-medium">
              Select a child from the left panel to view and edit their profile.
            </p>
          </div>
        ) : (
          <>
            {/* Form card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Child Detail
                  </p>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedChild.avatar || "🌟"}{" "}
                    {selectedChild.name}
                  </h2>
                </div>
                <button
                  className="bg-rose-500 hover:bg-rose-600 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 shrink-0"
                  onClick={handleDelete}
                  type="button"
                >
                  Delete Child
                </button>
              </div>

              <ChildForm
                error={error}
                formState={formState}
                loading={saving}
                onChange={setFormState}
                onSubmit={handleSave}
                submitLabel="Update Child"
              />
            </div>

            {/* Stats grid */}
            {detail && (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {statItems.map(({ label, value, unit }) => (
                  <div
                    key={label}
                    className="rounded-xl bg-slate-50 border border-slate-200 p-4"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      {label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {value}
                      <span className="ml-1.5 text-sm font-medium text-slate-400">{unit}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
