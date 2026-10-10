// JWT storage helpers. Only the token lives here — never user data,
// never passwords. All access is try/catch guarded.
const KEY = "kreatorai_token";

export function getToken() {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    window.localStorage.setItem(KEY, token);
  } catch {
    /* storage blocked — session just won't persist */
  }
}

export function clearToken() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
