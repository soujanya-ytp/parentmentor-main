import ActivitiesPage from "../pages/ActivitiesPage";
import AnalyticsPage from "../pages/AnalyticsPage";
import ChatPage from "../pages/ChatPage";
import ChildModePage from "../pages/ChildModePage";
import ChildrenPage from "../pages/ChildrenPage";
import DashboardPage from "../pages/DashboardPage";
import RewardsPage from "../pages/RewardsPage";
import RoutineSetupPage from "../pages/RoutineSetupPage";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "🏠" },
  { id: "children", label: "Children", icon: "👦" },
  { id: "chat", label: "Coach", icon: "🤖" },
  { id: "routine", label: "Routines", icon: "📋" },
  { id: "activities", label: "Activities", icon: "⚡" },
  { id: "rewards", label: "Rewards", icon: "🏆" },
  { id: "analytics", label: "Insights", icon: "📊" },
  { id: "child-mode", label: "Child Mode", icon: "🌟" },
];

const pageTitles = {
  dashboard: "Dashboard",
  children: "Children",
  chat: "AI Coach",
  routine: "Routines",
  activities: "Activities",
  rewards: "Rewards",
  analytics: "Insights",
  "child-mode": "Child Mode",
};

export default function AppShell(props) {
  const {
    activeView,
    children,
    childrenError,
    loadingApp,
    onChildrenUpdated,
    onLogout,
    onSelectChild,
    onUnauthorized,
    selectedChild,
    selectedChildId,
    setActiveView,
    token,
    user,
    setUser,
  } = props;

  const currentPageTitle = pageTitles[activeView] ?? "Dashboard";

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* ── Sidebar ── */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-56 flex-col bg-white border-r border-slate-200">
        {/* Logo area */}
        <div className="px-5 pt-6 pb-5 border-b border-slate-100">
          <p className="text-base font-bold text-indigo-600 leading-tight tracking-tight">
            ParentMentor AI
          </p>
          <p className="mt-0.5 text-xs text-slate-400">Your family dashboard</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={
                  isActive
                    ? "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold transition-colors duration-150"
                    : "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors duration-150"
                }
              >
                <span className="text-base leading-none">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom: user info + logout */}
        <div className="px-4 py-4 border-t border-slate-100">
          {user?.name ? (
            <p className="mb-3 text-xs font-medium text-slate-500 truncate">
              Welcome,{" "}
              <span className="font-semibold text-slate-700">{user.name}</span>
            </p>
          ) : null}
          <button
            type="button"
            onClick={onLogout}
            className="w-full rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-100 transition-all duration-200 hover:shadow-md active:scale-95"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-col flex-1 ml-56 min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center gap-4 bg-white border-b border-slate-200 px-6 py-3 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900 leading-tight">
            {currentPageTitle}
          </h1>

          {selectedChild ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-100">
              <span className="text-sm">👦</span>
              {selectedChild.name}
            </span>
          ) : null}

          {loadingApp ? (
            <span className="ml-auto text-xs text-slate-400 animate-pulse-soft">
              Loading workspace…
            </span>
          ) : null}
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 py-6 animate-fade-in">
          {childrenError ? (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
              {childrenError}
            </div>
          ) : null}

          {activeView === "dashboard" ? (
            <DashboardPage
              children={children}
              onChildrenUpdated={onChildrenUpdated}
              onOpenActivities={() => setActiveView("activities")}
              onOpenChildMode={() => setActiveView("child-mode")}
              onOpenChildren={() => setActiveView("children")}
              onOpenCoach={() => setActiveView("chat")}
              onOpenInsights={() => setActiveView("analytics")}
              onOpenRewards={() => setActiveView("rewards")}
              onOpenRoutines={() => setActiveView("routine")}
              onSelectChild={onSelectChild}
              onUnauthorized={onUnauthorized}
              selectedChild={selectedChild}
              selectedChildId={selectedChildId}
              setUser={setUser}
              token={token}
              user={user}
            />
          ) : null}

          {activeView === "children" ? (
            <ChildrenPage
              children={children}
              onChildrenUpdated={onChildrenUpdated}
              onSelectChild={onSelectChild}
              onUnauthorized={onUnauthorized}
              selectedChild={selectedChild}
              selectedChildId={selectedChildId}
              token={token}
            />
          ) : null}

          {activeView === "chat" ? (
            <ChatPage
              children={children}
              onSelectChild={onSelectChild}
              onUnauthorized={onUnauthorized}
              selectedChild={selectedChild}
              token={token}
            />
          ) : null}

          {activeView === "routine" ? (
            <RoutineSetupPage
              children={children}
              onSelectChild={onSelectChild}
              onUnauthorized={onUnauthorized}
              selectedChild={selectedChild}
              token={token}
            />
          ) : null}

          {activeView === "activities" ? (
            <ActivitiesPage
              children={children}
              onSelectChild={onSelectChild}
              onUnauthorized={onUnauthorized}
              selectedChild={selectedChild}
              token={token}
            />
          ) : null}

          {activeView === "rewards" ? (
            <RewardsPage
              children={children}
              onSelectChild={onSelectChild}
              onUnauthorized={onUnauthorized}
              selectedChild={selectedChild}
              token={token}
            />
          ) : null}

          {activeView === "analytics" ? (
            <AnalyticsPage
              children={children}
              onSelectChild={onSelectChild}
              onUnauthorized={onUnauthorized}
              selectedChild={selectedChild}
              token={token}
            />
          ) : null}

          {activeView === "child-mode" ? (
            <ChildModePage
              children={children}
              onSelectChild={onSelectChild}
              onUnauthorized={onUnauthorized}
              selectedChild={selectedChild}
              token={token}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
