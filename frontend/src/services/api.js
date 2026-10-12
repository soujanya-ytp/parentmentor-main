import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5005";

const api = axios.create({
  baseURL: API_BASE_URL,
});

function unwrapResponse(response) {
  const payload = response.data;

  if (!payload.success) {
    throw new Error(payload.error || "Request failed");
  }

  return payload.data;
}

function authHeaders(token) {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export async function registerUser(payload) {
  const response = await api.post("/auth/register", payload);
  return unwrapResponse(response);
}

export async function loginUser(payload) {
  const response = await api.post("/auth/login", payload);
  return unwrapResponse(response);
}

export async function getCurrentUser(token) {
  const response = await api.get("/auth/me", authHeaders(token));
  return unwrapResponse(response);
}

export async function updateCurrentUser(token, payload) {
  const response = await api.patch("/auth/me", payload, authHeaders(token));
  return unwrapResponse(response);
}

export async function getChildren(token) {
  const response = await api.get("/children", authHeaders(token));
  return unwrapResponse(response);
}

export async function createChild(token, payload) {
  const response = await api.post("/children", payload, authHeaders(token));
  return unwrapResponse(response);
}

export async function updateChild(token, childId, payload) {
  const response = await api.put(`/children/${childId}`, payload, authHeaders(token));
  return unwrapResponse(response);
}

export async function deleteChild(token, childId) {
  const response = await api.delete(`/children/${childId}`, authHeaders(token));
  return unwrapResponse(response);
}

export async function getChildDetail(token, childId) {
  const response = await api.get(`/children/${childId}`, authHeaders(token));
  return unwrapResponse(response);
}

export async function updateChildMode(token, payload) {
  const response = await api.patch("/child/mode", payload, authHeaders(token));
  return unwrapResponse(response);
}

export async function getDashboard(token, childId) {
  const response = await api.get(`/dashboard?child_id=${childId}`, authHeaders(token));
  return unwrapResponse(response);
}

export async function getInsights(token, childId) {
  const response = await api.get(`/insights?child_id=${childId}`, authHeaders(token));
  return unwrapResponse(response);
}

export async function getAnalytics(token, childId) {
  const response = await api.get(`/analytics?child_id=${childId}`, authHeaders(token));
  return unwrapResponse(response);
}

export async function sendChat(token, payload) {
  const response = await api.post("/coach/chat", payload, authHeaders(token));
  return unwrapResponse(response);
}

export async function getHistory(token, childId, threadId = null) {
  const suffix = threadId ? `&thread_id=${threadId}` : "";
  const response = await api.get(`/history?child_id=${childId}${suffix}`, authHeaders(token));
  return unwrapResponse(response);
}

export async function deleteChatThread(token, threadId) {
  const response = await api.delete(`/history/${threadId}`, authHeaders(token));
  return unwrapResponse(response);
}

export async function getTasks(token, childId) {
  const response = await api.get(`/tasks?child_id=${childId}`, authHeaders(token));
  return unwrapResponse(response);
}

export async function createTask(token, payload) {
  const response = await api.post("/tasks", payload, authHeaders(token));
  return unwrapResponse(response);
}

export async function updateTask(token, taskId, payload) {
  const response = await api.put(`/tasks/${taskId}`, payload, authHeaders(token));
  return unwrapResponse(response);
}

export async function toggleTask(token, taskId, payload) {
  const response = await api.patch(`/tasks/${taskId}/toggle`, payload, authHeaders(token));
  return unwrapResponse(response);
}

export async function deleteTask(token, taskId, childId) {
  const response = await api.delete(`/tasks/${taskId}?child_id=${childId}`, authHeaders(token));
  return unwrapResponse(response);
}

export async function getRoutines(token, childId) {
  const response = await api.get(`/routines?child_id=${childId}`, authHeaders(token));
  return unwrapResponse(response);
}

export async function createRoutine(token, payload) {
  const response = await api.post("/routines", payload, authHeaders(token));
  return unwrapResponse(response);
}

export async function updateRoutine(token, routineId, payload) {
  const response = await api.put(`/routines/${routineId}`, payload, authHeaders(token));
  return unwrapResponse(response);
}

export async function deleteRoutine(token, routineId, childId) {
  const response = await api.delete(`/routines/${routineId}?child_id=${childId}`, authHeaders(token));
  return unwrapResponse(response);
}

export async function generateRoutine(token, payload) {
  const response = await api.post("/coach/routine", payload, authHeaders(token));
  return unwrapResponse(response);
}

export async function getActivities(token, childId) {
  const response = await api.get(`/activities?child_id=${childId}`, authHeaders(token));
  return unwrapResponse(response);
}

export async function createActivity(token, payload) {
  const response = await api.post("/activities", payload, authHeaders(token));
  return unwrapResponse(response);
}

export async function deleteActivity(token, activityId, childId) {
  const response = await api.delete(
    `/activities/${activityId}?child_id=${childId}`,
    authHeaders(token)
  );
  return unwrapResponse(response);
}

export async function generateActivity(token, payload) {
  const response = await api.post("/coach/activities", payload, authHeaders(token));
  return unwrapResponse(response);
}

export async function getMoods(token, childId) {
  const response = await api.get(`/moods?child_id=${childId}`, authHeaders(token));
  return unwrapResponse(response);
}

export async function createMood(token, payload) {
  const response = await api.post("/moods", payload, authHeaders(token));
  return unwrapResponse(response);
}

export async function deleteMood(token, moodId, childId) {
  const response = await api.delete(`/moods/${moodId}?child_id=${childId}`, authHeaders(token));
  return unwrapResponse(response);
}

export async function getRewards(token, childId) {
  const response = await api.get(`/rewards?child_id=${childId}`, authHeaders(token));
  return unwrapResponse(response);
}

export async function createReward(token, payload) {
  const response = await api.post("/rewards", payload, authHeaders(token));
  return unwrapResponse(response);
}

export async function updateReward(token, rewardId, payload) {
  const response = await api.put(`/rewards/${rewardId}`, payload, authHeaders(token));
  return unwrapResponse(response);
}

export async function claimReward(token, rewardId, payload) {
  const response = await api.patch(`/rewards/${rewardId}/claim`, payload, authHeaders(token));
  return unwrapResponse(response);
}

export async function deleteReward(token, rewardId, childId) {
  const response = await api.delete(`/rewards/${rewardId}?child_id=${childId}`, authHeaders(token));
  return unwrapResponse(response);
}

export async function getBadges(token, childId) {
  const response = await api.get(`/badges?child_id=${childId}`, authHeaders(token));
  return unwrapResponse(response);
}
