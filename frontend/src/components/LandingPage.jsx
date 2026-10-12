import { useState } from "react";

import LoginModal from "./LoginModal";

const features = [
  {
    icon: "📊",
    title: "Parent Dashboard",
    description: "Track routines, moods, rewards, and quick recommendations for each child.",
  },
  {
    icon: "🤖",
    title: "AI Parenting Coach",
    description: "Ask child-specific questions and get calm, structured, practical guidance.",
  },
  {
    icon: "⭐",
    title: "Child Mode",
    description: "A playful, simplified space with missions, stars, routines, and celebrations.",
  },
];

export default function LandingPage({ onLogin }) {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-indigo-600">ParentMentor AI</span>
            <span className="rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-semibold text-indigo-600 border border-indigo-100">
              Beta
            </span>
          </div>
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95"
            onClick={() => setIsLoginOpen(true)}
            type="button"
          >
            Login or Sign up
          </button>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-16">
          <div className="animate-fade-in text-center">
            <span className="inline-flex rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-600 border border-indigo-100">
              Calm tools for busy families
            </span>

            <h1 className="mt-6 text-5xl font-bold leading-tight text-slate-900 sm:text-6xl">
              Smart parenting tools for{" "}
              <span className="text-indigo-600">your whole family</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Build routines, track tasks and moods, unlock rewards, and get child-specific AI
              coaching — all inside one clean workspace designed for real family moments.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <button
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-7 py-3 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95"
                onClick={() => setIsLoginOpen(true)}
                type="button"
              >
                Get Started Free
              </button>
              <a
                className="rounded-xl border border-slate-300 bg-white px-7 py-3 text-sm font-semibold text-slate-700 transition-all duration-200 hover:border-slate-400 hover:shadow-sm active:scale-95"
                href="#features"
              >
                Explore Features
              </a>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="mx-auto max-w-6xl px-6 pb-20" id="features">
          <div className="grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 transition-all duration-200 hover:shadow-md hover:border-slate-300"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-slate-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-16 text-center">
            <h2 className="text-3xl font-bold text-slate-900">Ready to get started?</h2>
            <p className="mt-3 text-slate-600">
              Join families using ParentMentor AI to build better daily rhythms.
            </p>
            <button
              className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-3 text-sm font-semibold transition-all duration-200 hover:shadow-md active:scale-95"
              onClick={() => setIsLoginOpen(true)}
              type="button"
            >
              Create your free account
            </button>
          </div>
        </section>
      </main>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLogin={onLogin}
      />
    </div>
  );
}
