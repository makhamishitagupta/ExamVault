export const API_BASE = import.meta.env.VITE_API_BASE || "https://examvault-6tnn.onrender.com";

export const PENDING_ACTION_KEY = "examvault_pending_action";

/**
 * Retries a fetch on 503 (Render cold start) with increasing delays.
 * Gives up after maxAttempts and returns the last response.
 */
export const fetchWithRetry = async (url, options = {}, maxAttempts = 8) => {
  const delays = [3000, 4000, 5000, 6000, 7000, 8000, 10000, 12000];
  let lastRes;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status !== 503) return res; // success or real error — stop retrying
      lastRes = res;
    } catch (err) {
      // network error (server fully down) — keep retrying
    }
    await new Promise((r) => setTimeout(r, delays[attempt] ?? 12000));
  }
  return lastRes; // return last 503 after giving up
};

export const apiFetch = async (path, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = new Headers(options.headers || {});

  // Preferred: JWT cookie (requires credentials: 'include')
  // Compatibility: also send Authorization + legacy x-auth-token if we have one.
  if (token) {
    if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
    if (!headers.has("x-auth-token")) headers.set("x-auth-token", token);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  return res;
};

export const logout = async () => {
  try {
    await apiFetch("/user/logout", { method: "POST" });
  } catch (err) {
    console.error("Logout failed", err);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

export const getAuthUser = async () => {
  try {
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["x-auth-token"] = token;
    }
    // Use retry so 503 cold-start is handled silently
    const res = await fetchWithRetry(`${API_BASE}/user/me`, {
      headers,
      credentials: "include",
    });
    if (!res || !res.ok) {
      if (res?.status === 401) {
        await logout();
        return null;
      }
      return null;
    }

    const data = await res.json();
    return data.user || null;
  } catch (err) {
    // Silent — don't log auth errors on public pages
    return null;
  }
};

export const isAuthenticated = async () => {
  const user = await getAuthUser();
  return user !== null;
};

export const setPendingAction = (action) => {
  try {
    sessionStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(action));
  } catch {
    // ignore
  }
};

export const peekPendingAction = () => {
  try {
    const raw = sessionStorage.getItem(PENDING_ACTION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const consumePendingAction = () => {
  const action = peekPendingAction();
  try {
    sessionStorage.removeItem(PENDING_ACTION_KEY);
  } catch {
    // ignore
  }
  return action;
};
