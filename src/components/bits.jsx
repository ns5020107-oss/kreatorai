import React from "react";
import { Link } from "react-router-dom";
import { VERIFY_SIGNALS, inr } from "../data/taxonomy";
import { Icon } from "../lib/art";

export function VerifyBadges({ verify, compact }) {
  const v = verify || {};
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }} aria-label="Verification signals">
      {VERIFY_SIGNALS.map((s) => {
        const on = !!v[s.id];
        return (
          <span key={s.id} className={"vbadge " + (on ? "on" : "off")} title={s.expl + " (Demo data)"}>
            <Icon name="shield" size={13} />
            {compact ? s.label.replace("Verified ", "").replace("Commercial-safe", "Comm-safe") : s.label}
          </span>
        );
      })}
    </div>
  );
}

/* Neutral state for real public-directory listings: found, not vetted.
   Never show numeric trust scores or verification badges for these. */
export function ListedBadge() {
  return (
    <span
      className="vbadge listed"
      title="Found in a public directory. Identity, availability and willingness to join are not confirmed."
    >
      <Icon name="doc" size={13} />
      Directory listed — not yet verified
    </span>
  );
}

export function VerifyLegend() {
  return (
    <div className="card" style={{ marginTop: 22 }}>
      <h4 style={{ fontSize: 17, marginBottom: 6 }}>What these badges mean</h4>
      <p style={{ fontSize: 13.5, color: "var(--muted)", marginBottom: 14 }}>
        Demo data — in production these would be checked against receipts, docs and client confirmations.
        Directory listings below are public finds, not vetted profiles.
      </p>
      <dl className="kv">
        {VERIFY_SIGNALS.map((s) => (
          <React.Fragment key={s.id}>
            <dt>{s.label}</dt>
            <dd style={{ color: "var(--ink-soft)" }}>{s.expl}</dd>
          </React.Fragment>
        ))}
      </dl>
    </div>
  );
}

export function TrustMeter({ score, small }) {
  return (
    <div style={{ minWidth: small ? 90 : 130 }} title={`Trust score ${score} of 100 (demo data)`}
      role="img" aria-label={`Trust score ${score} out of 100`}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "var(--muted)" }}>TRUST</span>
        <span style={{ fontSize: small ? 12 : 13, fontWeight: 800 }}>{score}</span>
      </div>
      <div className="trustbar"><i style={{ width: `${score}%` }} /></div>
    </div>
  );
}

export function Stars({ rating }) {
  if (rating == null) {
    return <span style={{ fontSize: 13, color: "var(--muted)" }}>No ratings yet</span>;
  }
  const full = Math.round(rating);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "var(--gold)" }} aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" size={14} style={{ opacity: i <= full ? 1 : 0.3, fill: i <= full ? "currentColor" : "none" }} />
      ))}
    </span>
  );
}

export function EmptyState({ title, body, action }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p style={{ maxWidth: 420, margin: "0 auto 16px" }}>{body}</p>
      {action}
    </div>
  );
}

export function RateLine({ creator }) {
  if (creator.rateMin == null || creator.rateMax == null) {
    return <span style={{ fontWeight: 600, color: "var(--muted)" }}>Pricing on request — not listed</span>;
  }
  return (
    <span style={{ fontWeight: 700 }}>
      {inr(creator.rateMin)}–{inr(creator.rateMax)}
      <span style={{ fontWeight: 400, color: "var(--muted)", fontSize: "0.85em" }}> / project</span>
    </span>
  );
}

export function AvailabilityDot({ value }) {
  const color = value === "Available now" ? "var(--moss)" : value === "Booking ahead" ? "var(--gold)" : "var(--faint)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 600 }}>
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, display: "inline-block" }} aria-hidden="true" />
      {value}
    </span>
  );
}

export function NotFoundCard({ what }) {
  return (
    <div className="wrap-narrow" style={{ paddingTop: 60, paddingBottom: 60 }}>
      <EmptyState
        title={what || "Hmm, that page wandered off"}
        body="The thing you're looking for isn't here. It may have been a draft that was deleted, or the link has a typo."
        action={<Link to="/" className="btn">Back home</Link>}
      />
    </div>
  );
}
