import React, { useEffect } from "react";
import { Thumb, Icon } from "../lib/art";

export default function PortfolioModal({ item, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!item) return null;
  return (
    <div className="overlay" onClick={onClose} role="presentation">
      <div className="modal wide" role="dialog" aria-modal="true" aria-label={item.title}
        onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <p className="kicker" style={{ marginBottom: 6 }}>{item.type} · {item.year}</p>
            <h3 style={{ margin: 0 }}>{item.title}</h3>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="Close project details"><Icon name="x" size={16} /></button>
        </div>
        <Thumb seed={item.seed} type={item.type} title={item.title}
          style={{ width: "100%", borderRadius: 4, border: "1px solid var(--line)", marginBottom: 18 }} />
        <div className="two-col">
          <div>
            <h4 style={{ fontSize: 16, marginBottom: 8 }}>How it was made</h4>
            <ol style={{ margin: "0 0 16px", paddingLeft: 20, fontSize: 14.5, color: "var(--ink-soft)" }}>
              {(item.workflow || []).map((step, i) => (
                <li key={i} style={{ marginBottom: 6 }}>{step}</li>
              ))}
            </ol>
            <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0 }}>
              Client: <strong style={{ color: "var(--ink-soft)" }}>{item.client}</strong>
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: 16, marginBottom: 8 }}>Tools used</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 16 }}>
              {(item.tools || []).map((t) => (
                <span key={t} style={{ fontSize: 13, background: "var(--paper-2)", border: "1px solid var(--line)", borderRadius: 999, padding: "4px 12px" }}>{t}</span>
              ))}
            </div>
            <span className="license-badge">{item.license}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
