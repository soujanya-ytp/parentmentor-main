import { useEffect, useState } from "react";

import { loginUser, registerUser } from "../services/api";

const initialState = {
  name: "",
  email: "",
  password: "",
};

export default function LoginModal({ isOpen, onClose, onLogin }) {
  const [mode, setMode] = useState("login");
  const [formState, setFormState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setMode("login");
      setFormState(initialState);
      setLoading(false);
      setError("");
      setSuccess("");
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  function updateField(field, value) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  function switchMode(next) {
    setMode(next);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (mode === "signup") {
        await registerUser(formState);
        setSuccess("Account created! Please log in with your credentials.");
        setFormState((current) => ({ ...current, password: "" }));
        setMode("login");
        return;
      }

      const response = await loginUser({
        email: formState.email,
        password: formState.password,
      });
      onLogin(response.token);
      onClose();
    } catch (requestError) {
      setError(requestError.response?.data?.error || requestError.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm px-4">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl animate-fade-in">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600">
                ParentMentor AI
              </span>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {mode === "login"
                  ? "Sign in to access your family dashboard."
                  : "Get started with your parent workspace."}
              </p>
            </div>

            {/* Close button */}
            <button
              className="ml-4 mt-0.5 text-slate-400 hover:text-slate-600 transition-all duration-200 p-1 rounded-lg hover:bg-slate-100"
              onClick={onClose}
              type="button"
              aria-label="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Tab switcher */}
          <div className="mt-5 inline-flex rounded-xl bg-slate-100 p-1">
            {[
              ["login", "Login"],
              ["signup", "Sign up"],
            ].map(([value, label]) => (
              <button
                key={value}
                className={
                  mode === value
                    ? "rounded-lg bg-white px-5 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition-all duration-200"
                    : "rounded-lg px-5 py-2 text-sm font-semibold text-slate-500 transition-all duration-200 hover:text-slate-700"
                }
                onClick={() => switchMode(value)}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form className="px-8 py-6 space-y-4" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">
                Parent Name
              </span>
              <input
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Priya"
                type="text"
                value={formState.name}
              />
            </label>
          ) : null}

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Email</span>
            <input
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              onChange={(event) => updateField("email", event.target.value)}
              placeholder="parent@parentmentor.ai"
              required
              type="email"
              value={formState.email}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Password</span>
            <input
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              onChange={(event) => updateField("password", event.target.value)}
              placeholder={mode === "signup" ? "Create a password" : "Enter your password"}
              required
              type="password"
              value={formState.password}
            />
          </label>

          {success ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm">
              {success}
            </div>
          ) : null}

          {error ? (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 rounded-xl px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}

          <button
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            disabled={loading}
            type="submit"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign in to Dashboard"
              : "Create Parent Account"}
          </button>

          <p className="text-center text-xs text-slate-400 pt-1">
            {mode === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  className="text-indigo-600 font-semibold hover:underline"
                  onClick={() => switchMode("signup")}
                  type="button"
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  className="text-indigo-600 font-semibold hover:underline"
                  onClick={() => switchMode("login")}
                  type="button"
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
