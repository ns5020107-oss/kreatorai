import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ALL_CREATORS } from "../data/creators";
import { STAGES } from "../data/taxonomy";
import { recommendCreators, timeAgo } from "../lib/logic";
import { AvatarArt, Icon } from "../lib/art";
import { useStore } from "../state/store";
import { NotFoundCard } from "../components/bits";
import { StatusPill } from "./Briefs";
import EmailModal from "../components/EmailModal";

function StageTracker({ stageIndex, onAdvance }) {
  return (
    <div>
      <div className="stages" role="list" aria-label="Engagement stages">
        {STAGES.map((s, i) => (
          <div key={s} role="listitem" aria-current={i === stageIndex ? "step" : undefined}
            className={"stage" + (i < stageIndex ? " done" : i === stageIndex ? " now" : "")}>
            <span className="dot">{i < stageIndex ? <Icon name="check" size={14} /> : i + 1}</span>
            <span className="lbl">{s}</span>
          </div>
        ))}
      </div>
      {stageIndex < STAGES.length - 1 ? (
        <button className="btn btn-sm" style={{ marginTop: 14 }} onClick={onAdvance}>
          Move to {STAGES[stageIndex + 1]} <Icon name="arrow" size={14} />
        </button>
      ) : (
        <p style={{ marginTop: 14, fontWeight: 700, color: "var(--moss)" }}>
          <Icon name="check" size={15} style={{ display: "inline", verticalAlign: -2 }} /> Delivered — nicely done.
        </p>
      )}
    </div>
  );
}

export default function BriefDetail() {
  const { id } = useParams();
  const { briefs, saveBrief, shortlists, toggleShortlist, stages, setStage, notes, addNote, toast } = useStore();
  const [noteText, setNoteText] = useState("");
  const [emailFor, setEmailFor] = useState(null);

  const brief = briefs.find((b) => b.id === id);
  const stageIndex = stages[id] ?? 0;
  const shortlisted = shortlists[id] || [];

  const recommended = useMemo(
    () => (brief ? recommendCreators(ALL_CREATORS, brief, 5) : []),
    [brief]
  );

  if (!brief) return <NotFoundCard what="This brief isn't here" />;

  const shortlistedCreators = shortlisted
    .map((cid) => ALL_CREATORS.find((c) => c.id === cid))
    .filter(Boolean);

  const addStageNote = (next) => {
    setStage(id, next);
    addNote(id, `Moved to "${STAGES[next]}"`);
    toast(`Stage: ${STAGES[next]}`);
  };

  const submitNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    addNote(id, noteText.trim());
    setNoteText("");
    toast("Note added");
  };

  const changeStatus = (status) => {
    saveBrief({ ...brief, status });
    addNote(id, `Status set to "${status}"`);
    toast(`Status: ${status}`);
  };

  return (
    <div className="wrap" style={{ paddingTop: 30, paddingBottom: 50 }}>
      <Link to="/briefs" style={{ fontSize: 14, fontWeight: 600 }}>← All briefs</Link>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 12 }}>
        <h1 style={{ fontSize: 36, margin: 0 }}>{brief.campaignTitle || "Untitled brief"}</h1>
        <StatusPill status={brief.status} />
      </div>
      <p style={{ color: "var(--muted)", fontSize: 14.5 }}>
        {brief.brandName} · {brief.contentType} · {brief.aspectRatio} · Updated {timeAgo(brief.updatedAt)}
      </p>

      {/* stage tracker */}
      <div className="card" style={{ marginTop: 18 }}>
        <p className="kicker">Engagement tracker</p>
        <StageTracker stageIndex={stageIndex} onAdvance={() => addStageNote(stageIndex + 1)} />
        <div style={{ marginTop: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--muted)", alignSelf: "center" }}>Mark as:</span>
          {["In discussion", "In production", "Delivered"].map((s) => (
            <button key={s} className="btn-line btn-sm" onClick={() => changeStatus(s)}>{s}</button>
          ))}
        </div>
      </div>

      <div className="two-col" style={{ marginTop: 22 }}>
        {/* brief summary */}
        <div className="card">
          <p className="kicker">The brief</p>
          <dl className="kv">
            <dt>Objective</dt><dd>{brief.objective || "—"}</dd>
            <dt>Audience</dt><dd>{brief.audience || "—"}</dd>
            <dt>Style</dt><dd>{brief.style || "—"} · {brief.tone}</dd>
            <dt>Format</dt><dd>{brief.aspectRatio} · {brief.duration} · {brief.deliverables} deliverables</dd>
            <dt>Platforms</dt><dd>{(brief.platforms || []).join(", ") || "—"}</dd>
            <dt>Budget</dt><dd>₹{Number(brief.budgetMin || 0).toLocaleString("en-IN")} – ₹{Number(brief.budgetMax || 0).toLocaleString("en-IN")}</dd>
            <dt>Deadline</dt><dd>{brief.deadline || "Flexible"}</dd>
            <dt>Usage</dt><dd style={{ textTransform: "capitalize" }}>{brief.usageType} · {brief.territory} · {brief.usageDuration}</dd>
            <dt>Exclusivity</dt><dd>{brief.exclusivity ? "Yes" : "No"}</dd>
            <dt>Licensed tools</dt><dd>{brief.toolsMustBeLicensed ? "Required" : "Not required"}</dd>
            <dt>AI disclosure</dt><dd>{brief.aiDisclosureRequired ? "Required" : "Not required"}</dd>
          </dl>
          {brief.referenceLinks && (
            <p style={{ fontSize: 13.5, marginTop: 10 }}>References: <span style={{ color: "var(--muted)" }}>{brief.referenceLinks}</span></p>
          )}
        </div>

        {/* notes */}
        <div className="card">
          <p className="kicker">Notes</p>
          <form onSubmit={submitNote} style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <input className="input" value={noteText} onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note — call summary, decision…" aria-label="Add a note" />
            <button className="btn btn-sm" type="submit">Add</button>
          </form>
          {(notes[id] || []).length === 0 ? (
            <p style={{ fontSize: 13.5, color: "var(--muted)", margin: 0 }}>No notes yet. Stage moves are logged here automatically.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 10 }}>
              {(notes[id] || []).map((n) => (
                <li key={n.id} style={{ fontSize: 14, borderLeft: "2px solid var(--line)", paddingLeft: 10 }}>
                  {n.text}
                  <span style={{ display: "block", fontSize: 12, color: "var(--muted)" }}>{timeAgo(n.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* recommended creators */}
      <div style={{ marginTop: 30 }}>
        <p className="kicker">Matched for this brief</p>
        <h2 style={{ fontSize: 28, marginBottom: 6 }}>Recommended creators</h2>
        <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 16, maxWidth: 640 }}>
          Scored out of 100 — content type 25, skills 20, tools 15, specialization 10,
          licence fit 10, verification 10, budget fit 10. Demo matching, shown honestly.
        </p>
        <div style={{ display: "grid", gap: 12 }}>
          {recommended.map(({ creator: c, score, reasons }) => {
            const inList = shortlisted.includes(c.id);
            return (
              <div className="card" key={c.id} style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                <AvatarArt name={c.name} hue={c.hue} size={52} />
                <div style={{ flex: "1 1 240px" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "baseline", flexWrap: "wrap" }}>
                    <Link to={`/creator/${c.id}`} style={{ fontFamily: "var(--serif)", fontSize: 18, fontWeight: 700, color: "var(--ink)", textDecoration: "none" }}>
                      {c.name}
                    </Link>
                    <span style={{ fontSize: 13, fontWeight: 800, color: score >= 70 ? "var(--moss)" : "var(--gold)" }}>{score}% match</span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>{reasons.join(" · ")}</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <button className={inList ? "btn btn-sm" : "btn-line btn-sm"}
                    onClick={() => { toggleShortlist(id, c.id); toast(inList ? "Removed from shortlist" : "Shortlisted"); }}>
                    {inList ? <><Icon name="check" size={14} /> Shortlisted</> : "Shortlist"}
                  </button>
                  {c.email ? (
                    <button className="btn-line btn-sm" onClick={() => setEmailFor(c)}>
                      <Icon name="mail" size={14} /> Email
                    </button>
                  ) : c.websiteUrl ? (
                    // directory listings have no email on file — website-first contact, as on their profile
                    <a className="btn-line btn-sm" href={c.websiteUrl} target="_blank" rel="noopener noreferrer"
                      style={{ textDecoration: "none" }}>
                      Visit website <Icon name="arrow" size={14} />
                    </a>
                  ) : (
                    <Link className="btn-line btn-sm" to={`/creator/${c.id}`} style={{ textDecoration: "none" }}>
                      View profile
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* shortlisted */}
      {shortlistedCreators.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <h3 style={{ fontSize: 20 }}>Shortlisted ({shortlistedCreators.length})</h3>
          <div className="creator-grid">
            {shortlistedCreators.map((c) => (
              <div className="card" key={c.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <AvatarArt name={c.name} hue={c.hue} size={46} />
                <div style={{ flex: 1 }}>
                  <Link to={`/creator/${c.id}`} style={{ fontWeight: 700, color: "var(--ink)", textDecoration: "none" }}>{c.name}</Link>
                  <p style={{ fontSize: 12.5, color: "var(--muted)", margin: 0 }}>{c.specialization}</p>
                </div>
                <button className="btn-quiet btn-sm" onClick={() => toggleShortlist(id, c.id)} aria-label={`Remove ${c.name} from shortlist`}>
                  <Icon name="x" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {emailFor && <EmailModal creator={emailFor} defaultBriefId={id} onClose={() => setEmailFor(null)} />}
    </div>
  );
}
