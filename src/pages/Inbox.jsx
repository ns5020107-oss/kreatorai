import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "../state/store";
import { EmptyState } from "../components/bits";
import { Icon, Squiggle } from "../lib/art";
import { timeAgo } from "../lib/logic";

export default function Inbox() {
  const { messages } = useStore();

  return (
    <div className="wrap-narrow" style={{ paddingTop: 32, paddingBottom: 50 }}>
      <p className="kicker">Outbox</p>
      <h1 style={{ fontSize: 38, marginBottom: 6 }}>Messages <Squiggle>sent</Squiggle></h1>
      <p style={{ color: "var(--muted)", marginBottom: 22 }}>
        Every email you compose on KreatorAI is logged here — who it went to, and what it said.
      </p>

      {messages.length === 0 ? (
        <EmptyState
          title="Nothing sent yet"
          body="Open any creator's profile and hit “Send email”. Your message will be logged here with the full text, so you always know what you promised."
          action={<Link to="/creators" className="btn">Find a creator</Link>}
        />
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {messages.map((m) => (
            <article className="card" key={m.id}>
              <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap", marginBottom: 6 }}>
                <h3 style={{ fontSize: 17, margin: 0 }}>{m.subject}</h3>
                <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
                  {m.via === "copied" ? "copied" : "via email app"} · {timeAgo(m.at)}
                </span>
              </div>
              <p style={{ fontSize: 13.5, margin: "0 0 8px" }}>
                <strong>To:</strong> {m.creatorName} <span style={{ color: "var(--muted)" }}>&lt;{m.to}&gt;</span>
              </p>
              <details>
                <summary style={{ cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: "var(--accent-deep)" }}>
                  Read message
                </summary>
                <p style={{ fontSize: 14, whiteSpace: "pre-wrap", marginTop: 10, color: "var(--ink-soft)" }}>{m.body}</p>
              </details>
            </article>
          ))}
        </div>
      )}

      <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 18 }}>
        <Icon name="inbox" size={14} style={{ display: "inline", verticalAlign: -2 }} />{" "}
        Stored only in this browser (localStorage). Clearing site data clears the inbox.
      </p>
    </div>
  );
}
