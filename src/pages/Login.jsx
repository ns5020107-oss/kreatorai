import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { ApiError } from "../lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login, backendUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Only allow same-origin paths as post-login destinations (blocks open redirects
  // like ?next=https://evil.com).
  const rawNext = new URLSearchParams(location.search).get("next") || "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!EMAIL_RE.test(email.trim())) errs.email = "Enter a valid email address";
    if (!password) errs.password = "Enter your password";
    setErrors(errs);
    setServerError("");
    if (Object.keys(errs).length > 0) return;
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate(next, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setServerError("Incorrect email or password");
      } else if (err instanceof ApiError && err.status === 503) {
        setServerError("Server unavailable right now — you can keep using the demo offline.");
      } else {
        setServerError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="wrap-narrow" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div className="card auth-card">
        <p className="kicker">Welcome back</p>
        <h1 style={{ fontSize: 34, marginBottom: 6 }}>Log in</h1>
        <p style={{ color: "var(--muted)", fontSize: 15 }}>
          Your briefs sync to your account when the server is up.
        </p>
        {!backendUp && (
          <p className="notice" role="note">
            The API server isn't reachable, so logins are paused — everything else works offline.
          </p>
        )}
        <form onSubmit={submit} noValidate>
          {serverError && (
            <p className="form-error" role="alert">{serverError}</p>
          )}
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className={"input" + (errors.email ? " invalid" : "")}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className={"input" + (errors.password ? " invalid" : "")}
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && <p className="field-error">{errors.password}</p>}
          </div>
          <button type="submit" className="btn btn-block" disabled={busy}>
            {busy ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
