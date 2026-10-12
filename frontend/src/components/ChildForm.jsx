const avatars = ["🌟", "🦊", "🐼", "🦄", "🚀", "🌈"];

const inputClass =
  "w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400";

const textareaClass =
  "w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400 min-h-[90px] resize-none";

const labelClass = "text-sm font-semibold text-slate-700 mb-1.5 block";

export default function ChildForm({ formState, onChange, onSubmit, loading, error, submitLabel }) {
  function updateField(field, value) {
    onChange({ ...formState, [field]: value });
  }

  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={onSubmit}>
      {/* Name */}
      <label className="block">
        <span className={labelClass}>Name</span>
        <input
          className={inputClass}
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="Aarav"
          required
          type="text"
          value={formState.name}
        />
      </label>

      {/* Age */}
      <label className="block">
        <span className={labelClass}>Age</span>
        <input
          className={inputClass}
          min="1"
          onChange={(event) => updateField("age", event.target.value)}
          placeholder="7"
          required
          type="number"
          value={formState.age}
        />
      </label>

      {/* Avatar selector */}
      <div className="md:col-span-2">
        <span className={labelClass}>Avatar</span>
        <div className="flex flex-wrap gap-2">
          {avatars.map((avatar) => (
            <button
              key={avatar}
              className={
                formState.avatar === avatar
                  ? "rounded-xl border-2 border-indigo-500 bg-indigo-50 px-3 py-2 text-2xl transition-all duration-150"
                  : "rounded-xl border-2 border-slate-200 hover:border-slate-300 px-3 py-2 text-2xl transition-all duration-150"
              }
              onClick={() => updateField("avatar", avatar)}
              type="button"
            >
              {avatar}
            </button>
          ))}
        </div>
      </div>

      {/* Goal */}
      <label className="block">
        <span className={labelClass}>Current Goal</span>
        <input
          className={inputClass}
          onChange={(event) => updateField("goal", event.target.value)}
          placeholder="Build better bedtime routines"
          type="text"
          value={formState.goal || ""}
        />
      </label>

      {/* Interests */}
      <label className="block">
        <span className={labelClass}>Interests</span>
        <input
          className={inputClass}
          onChange={(event) => updateField("interests", event.target.value)}
          placeholder="Dinosaurs, drawing, puzzles"
          type="text"
          value={formState.interests || ""}
        />
      </label>

      {/* Favorite Activities */}
      <label className="block">
        <span className={labelClass}>Favorite Activities</span>
        <input
          className={inputClass}
          onChange={(event) => updateField("favorite_activities", event.target.value)}
          placeholder="Dance games, building blocks"
          type="text"
          value={formState.favorite_activities || ""}
        />
      </label>

      {/* Strengths */}
      <label className="block">
        <span className={labelClass}>Strengths</span>
        <input
          className={inputClass}
          onChange={(event) => updateField("strengths", event.target.value)}
          placeholder="Curious, affectionate, loves helping"
          type="text"
          value={formState.strengths || ""}
        />
      </label>

      {/* Challenges */}
      <label className="block md:col-span-2">
        <span className={labelClass}>Challenges</span>
        <input
          className={inputClass}
          onChange={(event) => updateField("challenges", event.target.value)}
          placeholder="Screen transitions, homework focus"
          type="text"
          value={formState.challenges || ""}
        />
      </label>

      {/* Notes */}
      <label className="block md:col-span-2">
        <span className={labelClass}>Notes</span>
        <textarea
          className={textareaClass}
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="Responds well to visual routines and praise"
          value={formState.notes || ""}
        />
      </label>

      {/* Error banner */}
      {error ? (
        <div className="md:col-span-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">
          {error}
        </div>
      ) : null}

      {/* Submit */}
      <div className="md:col-span-2">
        <button
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
          type="submit"
        >
          {loading ? "Saving…" : submitLabel || "Save Child"}
        </button>
      </div>
    </form>
  );
}
