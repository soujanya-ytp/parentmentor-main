function toActionItems(response) {
  if (Array.isArray(response?.action_plan) && response.action_plan.length > 0) {
    return response.action_plan;
  }

  if (typeof response?.action_plan === "string" && response.action_plan.trim()) {
    return [response.action_plan.trim()];
  }

  if (typeof response?.tips === "string" && response.tips.trim()) {
    return [response.tips.trim()];
  }

  return [];
}

function isChildAssignableTask(step) {
  const normalized = String(step || "").trim().toLowerCase();
  if (!normalized) {
    return false;
  }

  const parentDirectedStarts = [
    "tell ",
    "say ",
    "keep ",
    "set ",
    "offer ",
    "prepare ",
    "remove ",
    "turn off ",
    "move ",
    "give ",
    "use ",
    "sit ",
    "clear ",
    "start bedtime",
    "start a ",
    "pick one ",
    "practice ",
    "praise ",
  ];

  if (parentDirectedStarts.some((prefix) => normalized.startsWith(prefix))) {
    return false;
  }

  const parentDirectedPhrases = [
    "out of sight",
    "screen time starts",
    "screen time begins",
    "say:",
    "tell ",
    "give one calm choice",
    "praise the exact behavior",
    "keep the ",
    "set a ",
  ];

  if (parentDirectedPhrases.some((phrase) => normalized.includes(phrase))) {
    return false;
  }

  return true;
}

export default function ResponseView({ response, onCreateTask, taskCreatingTitle }) {
  const actionItems = toActionItems(response);
  const explanation = typeof response?.problem_breakdown === "string"
    ? response.problem_breakdown.trim()
    : "";
  const childTaskIndexes = actionItems.reduce((indexes, step, index) => {
    if (isChildAssignableTask(step)) {
      indexes.push(index);
    }
    return indexes;
  }, []);
  const guaranteedTaskIndex = actionItems.length > 0 && childTaskIndexes.length === 0 ? 0 : null;

  if (actionItems.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5">
        <p className="text-sm text-slate-500">No action items available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {explanation ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Why This Helps</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{explanation}</p>
        </div>
      ) : null}

      {actionItems.map((step, index) => (
        <div key={`${index}-${step}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
              {index + 1}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-relaxed text-slate-800 break-words">{step}</p>

              {onCreateTask && (isChildAssignableTask(step) || guaranteedTaskIndex === index) ? (
                <button
                  className="mt-3 inline-flex items-center rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={taskCreatingTitle === step}
                  onClick={() => onCreateTask(step)}
                  type="button"
                >
                  {taskCreatingTitle === step ? "Adding..." : "Add as Task"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
