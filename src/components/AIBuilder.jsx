import React, { useState } from "react";
import { buildBriefFromText, enhanceWithAnthropic } from "../lib/logic";
import { Icon } from "../lib/art";

/* Rule-based brief builder. Works with no API key. If VITE_ANTHROPIC_API_KEY
   is set, tries Anthropic first and falls back to rules on any failure. */
export default function AIBuilder({ onApply }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [source, setSource] = useState("");

  const run = async () => {
    if (!text.trim()) { setError("Type a rough idea first — even one sentence works."); return; }
    setBusy(true);
    setError("");
    setPreview(null);
    try {
      const key = import.meta.env.VITE_ANTHROPIC_API_KEY;
      if (key) {
        try {
          const out = await enhanceWithAnthropic(text, key);
          setPreview(out);
          setSource("anthropic");
        } catch (e) {
          setPreview(buildBriefFromText(text));
          setSource("rule-based");
          setError("The AI service didn't respond, so I used the built-in rule-based builder instead. Nothing broke.");
        }
      } else {
        // small beat so the loading state is visible and honest
        await new Promise((r) => setTimeout(r, 700));
        setPreview(buildBriefFromText(text));
        setSource("rule-based");
      }
    } catch (e) {
      setError("Something went wrong generating the brief. Try rephrasing, or fill the form by hand — it works fine either way.");
    } finally {
      setBusy(false);
    }
  };

  const accept = () => {
    if (preview) {
      const { _source, ...clean } = preview;
      onApply(clean);
      setPreview(null);
      setText("");
    }
  };

  return (
    <div className="card" style={{ borderLeft: "3px solid var(--accent)", marginBottom: 24 }}>
      <h3 style={{ fontSize: 19, margin: "0 0 6px", display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="spark" size={19} style={{ color: "var(--accent)" }} /> Build with AI
      </h3>
      <p style={{ fontSize: 14, color: "var(--muted)", margin: "0 0 12px" }}>
        Describe the idea roughly — e.g. "short ad for our eco sneakers, young audience, Instagram".
        I'll turn it into a structured brief you can edit.
      </p>
      <div className="field" style={{ marginBottom: 10 }}>
        <label htmlFor="ai-idea">Your rough idea</label>
        <textarea id="ai-idea" className="textarea" style={{ minHeight: 80 }} value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="short ad for our eco sneakers, young audience, Instagram" />
      </div>
      {error && <p className="field-error" role="alert">{error}</p>}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <button className="btn" onClick={run} disabled={busy}>
          {busy ? "Thinking…" : <><Icon name="spark" size={15} /> Generate brief</>}
        </button>
        {source && !preview && <span style={{ fontSize: 12.5, color: "var(--muted)" }}>Built with the {source} engine</span>}
      </div>

      {preview && (
        <div style={{ marginTop: 16, borderTop: "1px solid var(--line)", paddingTop: 14 }}>
          <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            Here's what I understood <span style={{ fontWeight: 400, color: "var(--muted)" }}>({source})</span>:
          </p>
          <dl className="kv" style={{ fontSize: 13.5, marginBottom: 14 }}>
            <dt>Content type</dt><dd>{preview.contentType}</dd>
            <dt>Aspect ratio</dt><dd>{preview.aspectRatio}</dd>
            <dt>Tone</dt><dd>{preview.tone}</dd>
            <dt>Audience</dt><dd>{preview.audience}</dd>
            <dt>Platforms</dt><dd>{(preview.platforms || []).join(", ")}</dd>
            <dt>Budget</dt><dd>₹{Number(preview.budgetMin).toLocaleString("en-IN")} – ₹{Number(preview.budgetMax).toLocaleString("en-IN")}</dd>
            <dt>Usage</dt><dd>{preview.usageType === "paid" ? "Paid ads" : "Organic"}</dd>
          </dl>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-sm" onClick={accept}><Icon name="check" size={14} /> Use this brief</button>
            <button className="btn-line btn-sm" onClick={run}>Regenerate</button>
          </div>
        </div>
      )}
    </div>
  );
}
