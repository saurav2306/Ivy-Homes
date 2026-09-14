const BASE_URL = "https://solve.ivy.homes";
const API_KEY = "IVY26-8E65AAA09A9A";

export function getTokens() {
  const access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");
  return { access, refresh };
}

export function setTokens(access, refresh) {
  localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
}

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  const data = await res.json();
  setTokens(data.access_token, data.refresh_token);
  return data;
}

async function refreshToken() {
  const { refresh } = getTokens();
  if (!refresh) throw new Error("No refresh token");
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
    },
    body: JSON.stringify({ refresh_token: refresh }),
  });
  if (!res.ok) {
    clearTokens();
    throw new Error("Refresh failed");
  }
  const data = await res.json();
  setTokens(data.access_token, data.refresh_token);
  return data.access_token;
}

export async function apiRequest(endpoint, options = {}) {
  let { access } = getTokens();
  const headers = {
    "X-API-Key": API_KEY,
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  if (access) headers["Authorization"] = `Bearer ${access}`;

  let res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  
  if (res.status === 401 && access) {
    try {
      access = await refreshToken();
      headers["Authorization"] = `Bearer ${access}`;
      res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    } catch (e) {
      window.location.href = "/login";
      return null;
    }
  }
  
  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }
  return res.json();
}
