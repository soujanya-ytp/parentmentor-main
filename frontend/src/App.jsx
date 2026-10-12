import { useEffect, useState } from "react";

import AppShell from "./components/AppShell";
import LandingPage from "./components/LandingPage";
import { getChildren, getCurrentUser } from "./services/api";

const TOKEN_KEY = "parentmentor_token";
const CHILD_KEY = "parentmentor_selected_child";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(
    Number(localStorage.getItem(CHILD_KEY) || 0) || null
  );
  const [loadingApp, setLoadingApp] = useState(false);
  const [childrenError, setChildrenError] = useState("");
  const [activeView, setActiveView] = useState("dashboard");

  useEffect(() => {
    if (!token) {
      setUser(null);
      setChildren([]);
      setSelectedChildId(null);
      setChildrenError("");
      return;
    }

    let active = true;
    setLoadingApp(true);

    Promise.all([getCurrentUser(token), getChildren(token)])
      .then(([userResponse, childrenResponse]) => {
        if (!active) {
          return;
        }
        const childList = childrenResponse.children || [];
        setUser(userResponse.user);
        setChildren(childList);
        setSelectedChildId((currentId) => {
          if (!childList.length) {
            localStorage.removeItem(CHILD_KEY);
            return null;
          }

          const fallback = childList[0].id;
          const nextId = childList.some((child) => child.id === currentId) ? currentId : fallback;
          localStorage.setItem(CHILD_KEY, String(nextId));
          return nextId;
        });
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        if (error.response?.status === 401) {
          handleLogout();
          return;
        }
        setChildrenError(error.response?.data?.error || error.message || "Failed to load app data");
      })
      .finally(() => {
        if (active) {
          setLoadingApp(false);
        }
      });

    return () => {
      active = false;
    };
  }, [token]);

  function handleLogin(nextToken) {
    localStorage.setItem(TOKEN_KEY, nextToken);
    setToken(nextToken);
    setActiveView("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(CHILD_KEY);
    setToken("");
    setUser(null);
    setChildren([]);
    setSelectedChildId(null);
  }

  function handleSelectChild(nextId) {
    setSelectedChildId(nextId);
    if (nextId) {
      localStorage.setItem(CHILD_KEY, String(nextId));
    } else {
      localStorage.removeItem(CHILD_KEY);
    }
  }

  function handleChildrenUpdated(nextChildren) {
    setChildren(nextChildren);
    if (!nextChildren.length) {
      handleSelectChild(null);
      return;
    }

    setSelectedChildId((currentId) => {
      const nextId = nextChildren.some((child) => child.id === currentId) ? currentId : nextChildren[0].id;
      localStorage.setItem(CHILD_KEY, String(nextId));
      return nextId;
    });
  }

  const selectedChild = children.find((child) => child.id === selectedChildId) || null;

  if (!token) {
    return <LandingPage onLogin={handleLogin} />;
  }

  return (
    <AppShell
      activeView={activeView}
      children={children}
      childrenError={childrenError}
      loadingApp={loadingApp}
      onChildrenUpdated={handleChildrenUpdated}
      onLogout={handleLogout}
      onSelectChild={handleSelectChild}
      onUnauthorized={handleLogout}
      selectedChild={selectedChild}
      selectedChildId={selectedChildId}
      setActiveView={setActiveView}
      token={token}
      user={user}
      setUser={setUser}
    />
  );
}
