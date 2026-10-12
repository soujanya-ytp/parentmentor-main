import { useEffect, useState } from "react";

import ResponseView from "../components/ResponseView";
import { createTask, deleteChatThread, getHistory, sendChat } from "../services/api";

const prompts = [
  "How do I reduce screen time after school?",
  "How can I improve bedtime without a daily battle?",
  "What should I do when my child feels frustrated after school?",
  "How can I improve homework focus gently?",
];

export default function ChatPage({
  token,
  selectedChild,
  children,
  onSelectChild,
  onUnauthorized,
}) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState(null);
  const [history, setHistory] = useState([]);
  const [threads, setThreads] = useState([]);
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");
  const [taskCreatingTitle, setTaskCreatingTitle] = useState("");
  const [threadDeletingId, setThreadDeletingId] = useState(null);

  useEffect(() => {
    if (!selectedChild) {
      setHistory([]);
      setThreads([]);
      setActiveThreadId(null);
      setResponse(null);
      return;
    }

    let active = true;
    setHistoryLoading(true);

    getHistory(token, selectedChild.id)
      .then((data) => {
        if (active) {
          setHistory(data.history || []);
          setThreads(data.threads || []);
          const firstThreadId = data.threads?.[0]?.id || null;
          setActiveThreadId(firstThreadId);
          const firstMessage = (data.history || []).find((item) => item.thread_id === firstThreadId);
          setResponse(firstMessage?.response || null);
        }
      })
      .catch((requestError) => {
        if (requestError.response?.status === 401) {
          onUnauthorized();
        }
      })
      .finally(() => {
        if (active) {
          setHistoryLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedChild, token, onUnauthorized]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedChild) {
      setError("Select a child first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const apiResponse = await sendChat(token, {
        child_id: selectedChild.id,
        thread_id: activeThreadId,
        question,
      });
      setResponse(apiResponse.response);
      setHistory((current) => [
        {
          child_id: selectedChild.id,
          thread_id: apiResponse.thread_id,
          id: apiResponse.chat_id,
          question,
          response: apiResponse.response,
        },
        ...current,
      ]);
      setThreads((current) => {
        const withoutCurrent = current.filter((thread) => thread.id !== apiResponse.thread_id);
        return [{ id: apiResponse.thread_id, title: apiResponse.thread_title }, ...withoutCurrent];
      });
      setActiveThreadId(apiResponse.thread_id);
      setQuestion("");
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        onUnauthorized();
        return;
      }
      setError(requestError.response?.data?.error || requestError.message || "Failed to get response");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTaskFromStep(step) {
    if (!selectedChild) {
      setError("Select a child first");
      return;
    }

    setTaskCreatingTitle(step);
    setError("");

    try {
      await createTask(token, {
        child_id: selectedChild.id,
        title: step.length > 80 ? `${step.slice(0, 77).trim()}...` : step,
        description: step,
        type: "daily",
        recurring: true,
        points: 10,
      });
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        onUnauthorized();
        return;
      }
      setError(requestError.response?.data?.error || requestError.message || "Failed to create task");
    } finally {
      setTaskCreatingTitle("");
    }
  }

  async function handleDeleteThread(threadId) {
    setThreadDeletingId(threadId);
    setError("");

    try {
      await deleteChatThread(token, threadId);
      let nextThreadId = null;
      setThreads((current) => {
        const updatedThreads = current.filter((thread) => thread.id !== threadId);
        nextThreadId = updatedThreads[0]?.id || null;
        return updatedThreads;
      });
      setHistory((current) => current.filter((item) => item.thread_id !== threadId));

      if (activeThreadId === threadId) {
        setActiveThreadId(nextThreadId);
        setResponse(null);
      }
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        onUnauthorized();
        return;
      }
      setError(requestError.response?.data?.error || requestError.message || "Failed to delete chat");
    } finally {
      setThreadDeletingId(null);
    }
  }

  const activeMessages = activeThreadId
    ? history.filter((item) => item.thread_id === activeThreadId)
    : [];

  return (
    <div className="animate-fade-in flex gap-6 items-start">
      {/* Left Sidebar */}
      <aside className="w-[300px] shrink-0 space-y-4">
        {/* Selected Child Profile Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Selected Child
          </p>
          {selectedChild ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-2xl">
                  {selectedChild.avatar || "🌈"}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900 leading-tight">
                    {selectedChild.name}
                  </h2>
                  <p className="text-sm text-slate-500">Age {selectedChild.age}</p>
                </div>
              </div>
              {selectedChild.goal && (
                <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mb-1">
                    Goal
                  </p>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedChild.goal}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center">
              <p className="text-sm text-slate-500">Select a child below to get started.</p>
            </div>
          )}
        </div>

        {/* Child Switcher */}
        {children && children.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Switch Child
            </p>
            <div className="space-y-1.5">
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
                  <span className="mr-2">{child.avatar || "🌟"}</span>
                  {child.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Threads */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Chat Threads
            </p>
            <button
              className="rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700"
              onClick={() => {
                setActiveThreadId(null);
                setQuestion("");
                setResponse(null);
                setError("");
              }}
              type="button"
            >
              <span className="inline-flex items-center gap-1">
                <span>+</span>
                <span>New</span>
              </span>
            </button>
          </div>
          {historyLoading ? (
            <p className="text-sm text-slate-400">Loading history...</p>
          ) : threads.length > 0 ? (
            <div className="space-y-2">
              {threads.slice(0, 8).map((thread) => (
                <div
                  key={thread.id}
                  className={
                    activeThreadId === thread.id
                      ? "rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 transition-colors duration-150"
                      : "rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors duration-150 hover:bg-indigo-50"
                  }
                >
                  <div className="flex items-start gap-2">
                    <button
                      className="min-w-0 flex-1 text-left"
                      onClick={() => {
                        setActiveThreadId(thread.id);
                        const latestMessage = history.find((item) => item.thread_id === thread.id);
                        setResponse(latestMessage?.response || null);
                      }}
                      type="button"
                    >
                      <p className="text-sm font-medium text-slate-800 truncate leading-snug">
                        {thread.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">Open thread</p>
                    </button>
                    <button
                      aria-label="Delete thread"
                      className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-400 transition hover:bg-white hover:text-rose-500"
                      disabled={threadDeletingId === thread.id}
                      onClick={() => handleDeleteThread(thread.id)}
                      type="button"
                    >
                      {threadDeletingId === thread.id ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No threads yet.</p>
          )}
        </div>
      </aside>

      {/* Right Main */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Header + Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="mb-5">
            <h1 className="text-xl font-semibold text-slate-900 leading-snug">
              AI Parenting Coach
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Ask a child-specific question. Responses are structured, supportive, and tuned to the selected child.
            </p>
          </div>

          {/* Prompt Chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                className="rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-700 px-3 py-2 text-xs font-medium transition-all duration-150"
                onClick={() => setQuestion(prompt)}
                type="button"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Form */}
          {!selectedChild ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center">
              <p className="text-sm font-medium text-slate-500">
                Please select a child from the sidebar to start asking questions.
              </p>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Your Question
                </p>
                <textarea
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-slate-400 resize-none min-h-[140px]"
                  disabled={loading}
                  onChange={(event) => setQuestion(event.target.value)}
                  placeholder="Describe the parenting challenge you want help with..."
                  required
                  value={question}
                />
              </div>

              {error ? (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              ) : null}

              <div className="flex justify-end">
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                  disabled={loading || !question.trim()}
                  type="submit"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Generating guidance...
                    </span>
                  ) : (
                    "Ask ParentMentor"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Thread Display Area */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
            {activeThreadId ? "Conversation Thread" : "Response"}
          </p>
          {activeMessages.length > 0 ? (
            <div className="space-y-5">
              {activeMessages
                .slice()
                .reverse()
                .map((item) => (
                  <article key={item.id} className="space-y-3">
                    <div className="ml-auto max-w-2xl rounded-2xl bg-slate-900 px-4 py-3 text-white shadow-sm">
                      <p className="text-sm leading-relaxed">{item.question}</p>
                    </div>
                    <div className="max-w-3xl rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 shadow-sm">
                      <ResponseView
                        onCreateTask={handleCreateTaskFromStep}
                        response={item.response}
                        taskCreatingTitle={taskCreatingTitle}
                      />
                    </div>
                  </article>
                ))}
            </div>
          ) : response ? (
            <ResponseView
              onCreateTask={handleCreateTaskFromStep}
              response={response}
              taskCreatingTitle={taskCreatingTitle}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <p className="text-sm text-slate-400">
                No response yet. Ask a question above or start a new thread from the sidebar.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
