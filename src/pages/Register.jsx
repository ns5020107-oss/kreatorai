import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../state/auth";
import { ApiError } from "../lib/api";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const { register, backendUp } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = "Please enter your name";
    if (!EMAIL_RE.test(email.trim())) errs.email = "Enter a valid email address";
    if (password.length < 8) errs.password = "Password must be at least 8 characters";
    if (confirm !== password) errs.confirm = "Passwords don't match";
    setErrors(errs);
    setServerError("");
    if (Object.keys(errs).length > 0) return;
    setBusy(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setServerError("An account with this email already exists");
      } else if (err instanceof ApiError && err.status === 400 && err.fields) {
        setErrors(err.fields);
      } else if (err instanceof ApiError && err.status === 503) {
        setServerError("Server unavailable right now — you can keep using the demo offline.");
      } else {
        setServerError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  };

  const invalid = (k) => (errors[k] ? " invalid" : "");

  return (
    <div className="wrap-narrow" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div className="card auth-card">
        <p className="kicker">Join KreatorAI</p>
        <h1 style={{ fontSize: 34, marginBottom: 6 }}>Create an account</h1>
        <p style={{ color: "var(--muted)", fontSize: 15 }}>
          Free for the demo. Your briefs stay private to your account.
        </p>
        {!backendUp && (
          <p className="notice" role="note">
            The API server isn't reachable, so registration is paused — everything else works offline.
          </p>
        )}
        <form onSubmit={submit} noValidate>
          {serverError && (
            <p className="form-error" role="alert">{serverError}</p>
          )}
          <div className="field">
            <label htmlFor="reg-name">Name</label>
            <input
              id="reg-name"
              className={"input" + invalid("name")}
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>
          <div className="field">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              className={"input" + invalid("email")}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>
          <div className="field">
            <label htmlFor="reg-password">Password</label>
            <input
              id="reg-password"
              className={"input" + invalid("password")}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password ? (
              <p className="field-error">{errors.password}</p>
            ) : (
              <p className="hint">At least 8 characters.</p>
            )}
          </div>
          <div className="field">
            <label htmlFor="reg-confirm">Confirm password</label>
            <input
              id="reg-confirm"
              className={"input" + invalid("confirm")}
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            {errors.confirm && <p className="field-error">{errors.confirm}</p>}
          </div>
          <button type="submit" className="btn btn-block" disabled={busy}>
            {busy ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
