// Minimal JSON API client for the KreatorAI backend.
// Base URL comes from VITE_API_URL (see .env.example); defaults to localhost.
export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields || null;
  }
}

export const API_BASE = (import.meta.env.VITE_API_URL || "https://kreatorai.onrender.com").replace(/\/+$/, "");

export async function api(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new ApiError(0, "Could not reach the server. Check your connection or continue offline.");
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const message = (data && data.error) || `Request failed (HTTP ${res.status})`;
    throw new ApiError(res.status, message, data && data.fields);
  }
  return data;
}
