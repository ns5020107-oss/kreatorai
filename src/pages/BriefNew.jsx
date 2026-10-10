import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CONTENT_TYPES, ASPECT_RATIOS, TONES } from "../data/taxonomy";
import { useStore } from "../state/store";
import AIBuilder from "../components/AIBuilder";
import { Icon } from "../lib/art";

const STEPS = ["Basics", "Content", "Format", "Commercial"];
const USAGE_TYPES = [
  { id: "organic", label: "Organic social" },
  { id: "paid", label: "Paid ads" },
  { id: "broadcast", label: "Broadcast / OTT" },
  { id: "print", label: "Print" },
];

const BLANK = {
  campaignTitle: "", brandName: "", objective: "", audience: "",
  contentType: "Video", style: "", tone: "Friendly", duration: "15s", deliverables: 3,
  platforms: ["Instagram"],
  aspectRatio: "9:16",
  budgetMin: 25000, budgetMax: 60000, deadline: "", referenceLinks: "",
  usageType: "organic", territory: "India", usageDuration: "1 year",
  exclusivity: false, toolsMustBeLicensed: false, aiDisclosureRequired: false,
};

function validateStep(step, d) {
  const e = {};
  if (step === 0) {
    if (!d.campaignTitle.trim()) e.campaignTitle = "Give the campaign a title.";
    if (!d.brandName.trim()) e.brandName = "Which brand is this for?";
  }
  if (step === 3) {
    if (Number(d.budgetMin) < 0) e.budgetMin = "Budget can't be negative.";
    if (Number(d.budgetMax) < Number(d.budgetMin)) e.budgetMax = "Max should be at least the min.";
    if (!d.territory.trim()) e.territory = "Where will this run?";
  }
  return e;
}

function Field({ id, label, error, hint, children }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="field-error" role="alert">{error}</p>}
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export default function BriefNew() {
  const nav = useNavigate();
  const { saveBrief, toast } = useStore();
  const [step, setStep] = useState(0);
  const [d, setD] = useState(BLANK);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setD((prev) => ({ ...prev, [k]: v }));
  const togglePlatform = (p) =>
    set("platforms", d.platforms.includes(p) ? d.platforms.filter((x) => x !== p) : [...d.platforms, p]);

  const next = () => {
    const e = validateStep(step, d);
    setErrors(e);
    if (Object.keys(e).length === 0) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const finish = (status) => {
    const e = { ...validateStep(0, d), ...validateStep(3, d) };
    setErrors(e);
    if (Object.keys(e).length > 0) {
      if (e.campaignTitle || e.brandName) setStep(0);
      else setStep(3);
      toast("A couple of fields need attention first");
      return;
    }
    const saved = saveBrief({ ...d, status });
    toast(status === "Published" ? "Brief published — here are your matches" : "Draft saved");
    nav(`/brief/${saved.id}`);
  };

  const applyAI = (patch) => {
    // never let an empty AI field (title, brand, deadline, links…) wipe what the person already typed
    const clean = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== "" && v !== null && v !== undefined)
    );
    setD((prev) => ({ ...prev, ...clean }));
    toast("Brief filled in — review and tweak anything");
  };

  const inputCls = (k) => "input" + (errors[k] ? " invalid" : "");

  return (
    <div className="wrap-narrow" style={{ paddingTop: 32, paddingBottom: 50 }}>
      <p className="kicker">New brief</p>
      <h1 style={{ fontSize: 36, marginBottom: 6 }}>Tell us what you need</h1>
      <p style={{ color: "var(--muted)", marginBottom: 18 }}>
        Four short steps. Creators see the structured version — usage rights included, so nobody guesses.
      </p>

      <AIBuilder onApply={applyAI} />

      <div className="steps-bar" aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
        {STEPS.map((s, i) => (
          <div key={s} className={"seg" + (i <= step ? " on" : "")} title={s} />
        ))}
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 18 }}>
        Step {step + 1} of {STEPS.length} — {STEPS[step]}
      </p>

      {step === 0 && (
        <>
          <Field id="b-title" label="Campaign title *" error={errors.campaignTitle}>
            <input id="b-title" className={inputCls("campaignTitle")} value={d.campaignTitle}
              onChange={(e) => set("campaignTitle", e.target.value)} placeholder="e.g. Monsoon Sneaker Drop" />
          </Field>
          <Field id="b-brand" label="Brand name *" error={errors.brandName}>
            <input id="b-brand" className={inputCls("brandName")} value={d.brandName}
              onChange={(e) => set("brandName", e.target.value)} placeholder="e.g. StrideLab" />
          </Field>
          <Field id="b-obj" label="Objective">
            <input id="b-obj" className="input" value={d.objective}
              onChange={(e) => set("objective", e.target.value)} placeholder="e.g. Drive festive-season sales" />
          </Field>
          <Field id="b-aud" label="Target audience">
            <input id="b-aud" className="input" value={d.audience}
              onChange={(e) => set("audience", e.target.value)} placeholder="e.g. Gen Z sneakerheads in metros" />
          </Field>
        </>
      )}

      {step === 1 && (
        <>
          <Field id="b-type" label="Content type">
            <div className="radio-row" role="radiogroup" aria-label="Content type">
              {CONTENT_TYPES.map((t) => (
                <label key={t} className="radio-pill">
                  <input type="radio" name="ctype" checked={d.contentType === t} onChange={() => set("contentType", t)} />
                  <span>{t}</span>
                </label>
              ))}
            </div>
          </Field>
          <div className="two-col">
            <Field id="b-style" label="Style / mood">
              <input id="b-style" className="input" value={d.style}
                onChange={(e) => set("style", e.target.value)} placeholder="e.g. Cinematic, warm light" />
            </Field>
            <Field id="b-tone" label="Tone">
              <select id="b-tone" className="select" value={d.tone}
                onChange={(e) => set("tone", e.target.value)}>
                {TONES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="two-col">
            <Field id="b-dur" label="Duration">
              <input id="b-dur" className="input" value={d.duration}
                onChange={(e) => set("duration", e.target.value)} placeholder="e.g. 15s" />
            </Field>
            <Field id="b-del" label="Deliverables (count)">
              <input id="b-del" type="number" min="1" max="50" className="input" value={d.deliverables}
                onChange={(e) => set("deliverables", Math.max(1, Number(e.target.value) || 1))} />
            </Field>
          </div>
          <fieldset style={{ border: "none", padding: 0, margin: "0 0 18px" }}>
            <legend className="legend-label" style={{ padding: 0 }}>Platforms</legend>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["Instagram", "TikTok", "YouTube", "LinkedIn", "X", "TV"].map((p) => (
                <label key={p} className="radio-pill">
                  <input type="checkbox" checked={d.platforms.includes(p)} onChange={() => togglePlatform(p)} />
                  <span>{p}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </>
      )}

      {step === 2 && (
        <>
          <Field id="b-aspect" label="Aspect ratio">
            <div className="radio-row" role="radiogroup" aria-label="Aspect ratio">
              {ASPECT_RATIOS.map((a) => (
                <label key={a} className="radio-pill">
                  <input type="radio" name="aspect" checked={d.aspectRatio === a} onChange={() => set("aspectRatio", a)} />
                  <span>{a}</span>
                </label>
              ))}
            </div>
          </Field>
          <p className="hint" style={{ fontSize: 13.5, color: "var(--muted)" }}>
            9:16 suits reels and Shorts · 1:1 suits feeds · 16:9 suits YouTube and TV · 4:5 suits portrait posts.
          </p>
        </>
      )}

      {step === 3 && (
        <>
          <div className="two-col">
            <Field id="b-bmin" label="Budget min (₹)" error={errors.budgetMin}>
              <input id="b-bmin" type="number" min="0" step="1000" className={inputCls("budgetMin")}
                value={d.budgetMin} onChange={(e) => set("budgetMin", Number(e.target.value))} />
            </Field>
            <Field id="b-bmax" label="Budget max (₹)" error={errors.budgetMax}>
              <input id="b-bmax" type="number" min="0" step="1000" className={inputCls("budgetMax")}
                value={d.budgetMax} onChange={(e) => set("budgetMax", Number(e.target.value))} />
            </Field>
          </div>
          <div className="two-col">
            <Field id="b-deadline" label="Deadline">
              <input id="b-deadline" type="date" className="input" value={d.deadline}
                onChange={(e) => set("deadline", e.target.value)} />
            </Field>
            <Field id="b-terr" label="Territory *" error={errors.territory}>
              <input id="b-terr" className={inputCls("territory")} value={d.territory}
                onChange={(e) => set("territory", e.target.value)} placeholder="e.g. India" />
            </Field>
          </div>
          <Field id="b-usage" label="Usage type">
            <div className="radio-row" role="radiogroup" aria-label="Usage type">
              {USAGE_TYPES.map((u) => (
                <label key={u.id} className="radio-pill">
                  <input type="radio" name="usage" checked={d.usageType === u.id} onChange={() => set("usageType", u.id)} />
                  <span>{u.label}</span>
                </label>
              ))}
            </div>
          </Field>
          <div className="two-col">
            <Field id="b-usedur" label="Usage duration">
              <select id="b-usedur" className="select" value={d.usageDuration}
                onChange={(e) => set("usageDuration", e.target.value)}>
                {["3 months", "6 months", "1 year", "2 years", "Perpetuity"].map((x) => <option key={x}>{x}</option>)}
              </select>
            </Field>
            <Field id="b-links" label="Reference links">
              <input id="b-links" className="input" value={d.referenceLinks}
                onChange={(e) => set("referenceLinks", e.target.value)} placeholder="https://…" />
            </Field>
          </div>
          <label className="check-row" htmlFor="b-excl">
            <input id="b-excl" type="checkbox" checked={d.exclusivity} onChange={(e) => set("exclusivity", e.target.checked)} />
            <span>Category exclusivity <span style={{ color: "var(--muted)" }}>(creator won't work with competitors during usage)</span></span>
          </label>
          <label className="check-row" htmlFor="b-lic">
            <input id="b-lic" type="checkbox" checked={d.toolsMustBeLicensed} onChange={(e) => set("toolsMustBeLicensed", e.target.checked)} />
            <span>AI tools used must be commercially licensed</span>
          </label>
          <label className="check-row" htmlFor="b-disc">
            <input id="b-disc" type="checkbox" checked={d.aiDisclosureRequired} onChange={(e) => set("aiDisclosureRequired", e.target.checked)} />
            <span>Disclosure of AI use required in the final creative</span>
          </label>
        </>
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
        {step > 0 && <button className="btn-line" onClick={back}>← Back</button>}
        {step < STEPS.length - 1 && <button className="btn" onClick={next}>Continue <Icon name="arrow" size={15} /></button>}
        {step === STEPS.length - 1 && (
          <>
            <button className="btn-line" onClick={() => finish("Draft")}>Save as draft</button>
            <button className="btn" onClick={() => finish("Published")}><Icon name="check" size={15} /> Publish brief</button>
          </>
        )}
      </div>
    </div>
  );
}
