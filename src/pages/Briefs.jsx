import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "../state/store";
import { EmptyState } from "../components/bits";
import { Icon, Squiggle } from "../lib/art";
import { timeAgo } from "../lib/logic";

const STATUS_CLASS = {
  Draft: "st-draft", Published: "st-published", "In discussion": "st-discussion",
  "In production": "st-production", Delivered: "st-delivered",
};

export function StatusPill({ status }) {
  return <span className={"status-pill " + (STATUS_CLASS[status] || "st-draft")}>{status}</span>;
}

export default function Briefs() {
  const { briefs, deleteBrief, toast } = useStore();

  const remove = (id, title) => {
    if (window.confirm(`Delete "${title || "this brief"}"? This can't be undone.`)) {
      deleteBrief(id);
      toast("Brief deleted");
    }
  };

  return (
    <div className="wrap" style={{ paddingTop: 32, paddingBottom: 50 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p className="kicker">Brand workspace</p>
          <h1 style={{ fontSize: 38, marginBottom: 4 }}>My <Squiggle>briefs</Squiggle></h1>
          <p style={{ color: "var(--muted)" }}>Drafts live here until you publish them to creators.</p>
        </div>
        <Link to="/brief/new" className="btn"><Icon name="doc" size={16} /> New brief</Link>
      </div>

      {briefs.length === 0 ? (
        <div style={{ marginTop: 24 }}>
          <EmptyState
            title="No briefs yet"
            body="A brief is just a structured ask: what you need, where it'll run, and what usage rights come with it. The AI builder can draft one from a single sentence."
            action={<Link to="/brief/new" className="btn">Write your first brief</Link>}
          />
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14, marginTop: 24 }}>
          {briefs.map((b) => (
            <div className="card card-hover" key={b.id} style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 260px" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
                  <Link to={`/brief/${b.id}`} style={{ fontFamily: "var(--serif)", fontSize: 19, fontWeight: 700, color: "var(--ink)", textDecoration: "none" }}>
                    {b.campaignTitle || "Untitled brief"}
                  </Link>
                  <StatusPill status={b.status} />
                </div>
                <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0 }}>
                  {b.brandName} · {b.contentType} · {b.aspectRatio} · Updated {timeAgo(b.updatedAt)}
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Link to={`/brief/${b.id}`} className="btn-line btn-sm">Open</Link>
                <button className="btn-quiet btn-sm" onClick={() => remove(b.id, b.campaignTitle)}
                  aria-label={`Delete brief ${b.campaignTitle || "untitled"}`}>
                  <Icon name="x" size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
