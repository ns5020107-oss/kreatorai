import React from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../state/auth";

// Redirects anonymous visitors to /login?next=<where they were going>.
export function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="wrap-narrow" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <p>Loading…</p>
      </div>
    );
  }
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}

// Admins only. Non-admins get a friendly panel (never a blank page).
export function RequireAdmin({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="wrap-narrow" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <p>Loading…</p>
      </div>
    );
  }
  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  if (user.role !== "admin") {
    return (
      <div className="wrap-narrow" style={{ paddingTop: 60, paddingBottom: 80, textAlign: "center" }}>
        <h1 style={{ fontSize: 34 }}>Admins only</h1>
        <p style={{ color: "var(--muted)" }}>
          This area is restricted to admin accounts. You're signed in as {user.email}.
        </p>
        <Link to="/" className="btn" style={{ marginTop: 12, display: "inline-block" }}>
          Back to home
        </Link>
      </div>
    );
  }
  return children;
}
