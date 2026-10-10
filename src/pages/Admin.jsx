import React, { useEffect, useState } from "react";
import { api, ApiError } from "../lib/api";
import { useAuth } from "../state/auth";

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  } catch {
    return "—";
  }
}

export default function Admin() {
  const { token } = useAuth();
  const [users, setUsers] = useState(null);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    Promise.all([
      api("/api/admin/users", { token }),
      api("/api/admin/stats", { token }),
    ]).then(
      ([u, s]) => {
        if (alive) {
          setUsers(u.users);
          setStats(s);
        }
      },
      (err) => {
        if (alive) {
          if (err instanceof ApiError && err.status === 403) {
            setError("You don't have admin access.");
          } else if (err instanceof ApiError && err.status === 503) {
            setError("Server unavailable right now. Please try again later.");
          } else {
            setError(err.message || "Could not load admin data.");
          }
        }
      }
    ).finally(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [token]);

  return (
    <div className="wrap" style={{ paddingTop: 40, paddingBottom: 70 }}>
      <p className="kicker">Administration</p>
      <h1 style={{ fontSize: 36, marginBottom: 6 }}>Admin panel</h1>
      <p style={{ color: "var(--muted)", fontSize: 15, marginBottom: 26 }}>
        Users and usage across the marketplace. Restricted to admins.
      </p>

      {loading && <p>Loading…</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {!loading && !error && (
        <>
          <div className="stat-row">
            <div className="card stat-card">
              <p className="stat-num">{stats.users}</p>
              <p className="stat-label">Registered users</p>
            </div>
            <div className="card stat-card">
              <p className="stat-num">{stats.briefs}</p>
              <p className="stat-label">Briefs created</p>
            </div>
          </div>

          <h2 style={{ fontSize: 22, marginTop: 34, marginBottom: 12 }}>Users</h2>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Role</th>
                  <th scope="col">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={"pill" + (u.role === "admin" ? " pill-accent" : "")}>
                        {u.role}
                      </span>
                    </td>
                    <td>{fmtDate(u.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
