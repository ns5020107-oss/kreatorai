import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="wrap-narrow" style={{ paddingTop: 80, paddingBottom: 80, textAlign: "center" }}>
      <p style={{ fontFamily: "var(--serif)", fontSize: 90, margin: 0, color: "var(--accent)" }}>404</p>
      <h1 style={{ fontSize: 32 }}>This page took the day off</h1>
      <p style={{ color: "var(--muted)", maxWidth: 420, margin: "0 auto 22px" }}>
        The link might have a typo, or the page moved. The creators, meanwhile, are all still here.
      </p>
      <Link to="/" className="btn">Back home</Link>
    </div>
  );
}
