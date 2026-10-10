import React, { useEffect, useRef, useState } from "react";
import { buildMailto, composeEmailBody } from "../lib/logic";
import { Icon } from "../lib/art";
import { useStore } from "../state/store";

/* Compose-and-send email modal. "Send" opens a mailto: link;
   the message is logged to /inbox regardless (demo data). */
export default function EmailModal({ creator, onClose, defaultBriefId }) {
  const { briefs, logMessage, toast } = useStore();
  // drafts can't be attached, except the brief this modal was opened from
  const published = briefs.filter((b) => b.status !== "Draft" || b.id === defaultBriefId);
  const [briefId, setBriefId] = useState(defaultBriefId || (published[0]?.id || ""));
  const brief = briefs.find((b) => b.id === briefId);
  const [to, setTo] = useState(creator.email || ""); // directory creators have no email on file
  const [subject, setSubject] = useState(
    `Collaboration inquiry: ${brief?.campaignTitle || "a new project"}`
  );
  const [body, setBody] = useState(() => composeEmailBody(creator, brief));
  const [copied, setCopied] = useState(false);
  const firstRef = useRef(null);
  // keep the latest onClose in a ref so the effects below run once. Parents pass an
  // inline arrow, and re-subscribing every render re-focused the "To" field whenever
  // a toast appeared (stealing focus from whatever the person was typing in).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => { firstRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onCloseRef.current(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const attachBrief = (id) => {
    setBriefId(id);
    const b = briefs.find((x) => x.id === id);
    setBody(composeEmailBody(creator, b || null));
    setSubject(`Collaboration inquiry: ${b?.campaignTitle || "a new project"}`);
  };

  const record = (via) => {
    logMessage({ to, subject, body, creatorId: creator.id, creatorName: creator.name, briefId: briefId || null, via });
  };

  const send = () => {
    if (!to.trim()) { toast("Add a recipient email first"); return; }
    record("mailto");
    window.location.href = buildMailto(to.trim(), subject, body);
    toast("Opening your email app — message saved to Inbox");
    onClose();
  };

  const copy = async () => {
    const text = `To: ${to}\nSubject: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch { /* noop */ }
      document.body.removeChild(ta);
    }
    record("copied");
    setCopied(true);
    toast("Message copied — and saved to Inbox");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="overlay" onClick={onClose} role="presentation">
      <div className="modal" role="dialog" aria-modal="true" aria-label={`Email ${creator.name}`}
        onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Send email</h3>
          <button className="x-btn" onClick={onClose} aria-label="Close email composer"><Icon name="x" size={16} /></button>
        </div>

        <div className="field">
          <label htmlFor="em-to">To</label>
          <input id="em-to" ref={firstRef} className="input" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="em-subject">Subject</label>
          <input id="em-subject" className="input" value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        {published.length > 0 && (
          <div className="field">
            <label htmlFor="em-brief">Attach a brief <span style={{ fontWeight: 400, color: "var(--muted)" }}>(optional)</span></label>
            <select id="em-brief" className="select" value={briefId} onChange={(e) => attachBrief(e.target.value)}>
              <option value="">No brief — just saying hello</option>
              {published.map((b) => (
                <option key={b.id} value={b.id}>{b.campaignTitle || "Untitled brief"} ({b.status})</option>
              ))}
            </select>
          </div>
        )}
        <div className="field">
          <label htmlFor="em-body">Message <span style={{ fontWeight: 400, color: "var(--muted)" }}>(edit freely)</span></label>
          <textarea id="em-body" className="textarea" style={{ minHeight: 220 }} value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button className="btn" onClick={send}><Icon name="mail" size={16} /> Send via email app</button>
          <button className="btn-line" onClick={copy}><Icon name="copy" size={16} /> {copied ? "Copied!" : "Copy message"}</button>
          <button className="btn-quiet" onClick={onClose}>Cancel</button>
        </div>
        <p style={{ fontSize: 12.5, color: "var(--muted)", marginTop: 12, marginBottom: 0 }}>
          Demo note: "Send" opens your own email app with this text filled in — KreatorAI doesn't run a mail server.
        </p>
      </div>
    </div>
  );
}
