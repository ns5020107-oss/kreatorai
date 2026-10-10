import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ALL_CREATORS } from "../data/creators";
import { CHIPS, VERIFY_SIGNALS } from "../data/taxonomy";
import { Icon, Squiggle } from "../lib/art";
import CreatorCard from "../components/CreatorCard";

export default function Home() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const featured = [...ALL_CREATORS].sort((a, b) => (b.trustScore ?? 0) - (a.trustScore ?? 0)).slice(0, 3);

  const submitSearch = (e) => {
    e.preventDefault();
    nav(`/creators?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <>
      {/* hero */}
      <section className="wrap" style={{ paddingTop: 56, paddingBottom: 40 }}>
        <div className="two-col" style={{ alignItems: "center", gap: 40 }}>
          <div>
            <p className="kicker">The AI creator marketplace</p>
            <h1 style={{ fontSize: 52, marginBottom: 14 }}>
              Find someone who <Squiggle>gets your brand.</Squiggle>
            </h1>
            <p className="dropcap" style={{ color: "var(--ink-soft)", fontSize: 17, maxWidth: 480 }}>
              KreatorAI connects brands with AI-native creators — filmmakers, animators,
              illustrators and composers who ship real client work with tools like Runway,
              Midjourney and ElevenLabs. See the tools, the workflow, and the proof before you say hello.
            </p>
            <form onSubmit={submitSearch} role="search" aria-label="Search creators"
              style={{ display: "flex", gap: 8, marginTop: 20, maxWidth: 480 }}>
              <input
                className="input" value={q} onChange={(e) => setQ(e.target.value)}
                placeholder="Try &quot;runway ads&quot; or &quot;festive illustrator&quot;"
                aria-label="Search creators" style={{ flex: 1 }}
              />
              <button className="btn" type="submit"><Icon name="search" size={16} /> Search</button>
            </form>
            <div style={{ marginTop: 14 }}>
              <span className="stamp">Demo prototype · 14 fictional profiles + 100 real directory listings</span>
            </div>
          </div>
          <div className="card" style={{ position: "relative", transform: "rotate(1.2deg)" }}>
            <span className="tape" style={{ top: -13, left: 40, transform: "rotate(-7deg)" }} aria-hidden="true" />
            <p style={{ fontSize: 12, fontWeight: 800, letterSpacing: "0.14em", color: "var(--muted)", margin: "0 0 12px" }}>
              WHAT A VERIFIED PROFILE SHOWS
            </p>
            <dl className="kv">
              <dt>Tools</dt><dd>Runway, Sora, Premiere Pro</dd>
              <dt>Workflow</dt><dd>Prompt → generate → upscale → edit</dd>
              <dt>Proof</dt><dd>3 client pieces confirmed</dd>
              <dt>Licence</dt><dd>Full buyout available</dd>
            </dl>
            <div className="divider" />
            <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: 0 }}>
              "Aarav delivered our launch film in nine days. The rain shots looked properly
              shot, not generated." <br />
              <span style={{ color: "var(--muted)", fontSize: 13 }}>— Ritu Malhotra, CMO (fictional client)</span>
            </p>
          </div>
        </div>
      </section>

      {/* classification chips */}
      <section className="wrap" style={{ paddingBottom: 8 }}>
        <p className="kicker">Browse by craft</p>
        <div className="chipbar" role="list" aria-label="Creator categories">
          {CHIPS.map((c) => (
            <button key={c} role="listitem" className="chip"
              onClick={() => nav(`/creators?chip=${encodeURIComponent(c)}`)}>
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* featured */}
      <section className="wrap" style={{ paddingTop: 26 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontSize: 30, margin: 0 }}>Most trusted this week</h2>
          <Link to="/creators">See all {ALL_CREATORS.length} →</Link>
        </div>
        <div className="creator-grid">
          {featured.map((c, i) => (
            <CreatorCard key={c.id} creator={c} tilt={i === 1 ? -0.6 : i === 2 ? 0.5 : 0} />
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="wrap" style={{ paddingTop: 54 }}>
        <p className="kicker">How it works</p>
        <h2 style={{ fontSize: 30, marginBottom: 20 }}>Three steps, no mystery</h2>
        <div className="two-col" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          {[
            { t: "Find your person", d: "Search by craft, tool or vibe. Filter by budget, language and verification — every filter is honest about what it checks." },
            { t: "Post a structured brief", d: "A four-step form (or the AI builder) turns a rough idea into a brief with usage rights spelled out. Creators get matched with reasons, not magic." },
            { t: "Track it to delivery", d: "Shortlist, propose, contract, produce, review — each stage lives on the brief page with notes, so nothing gets lost in chat." },
          ].map((s, i) => (
            <div className="card" key={s.t} style={{ transform: `rotate(${i === 1 ? 0.5 : -0.4}deg)` }}>
              <p style={{ fontFamily: "var(--serif)", fontSize: 34, color: "var(--accent)", margin: "0 0 8px" }}>{i + 1}.</p>
              <h3 style={{ fontSize: 19 }}>{s.t}</h3>
              <p style={{ fontSize: 14.5, color: "var(--ink-soft)", margin: 0 }}>{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* trust signals */}
      <section className="wrap" style={{ paddingTop: 54 }}>
        <p className="kicker">Trust, spelled out</p>
        <h2 style={{ fontSize: 30, marginBottom: 8 }}>Verification you can actually read</h2>
        <p style={{ color: "var(--ink-soft)", maxWidth: 640, marginBottom: 20 }}>
          Every badge has a plain-English explanation. In this demo the checks are mock data —
          in production they'd be backed by receipts, docs and client confirmations.
        </p>
        <div className="two-col" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {VERIFY_SIGNALS.map((s) => (
            <div className="card" key={s.id} style={{ display: "flex", gap: 14 }}>
              <span style={{ color: "var(--moss)", flex: "none", marginTop: 2 }}><Icon name="shield" size={22} /></span>
              <div>
                <h3 style={{ fontSize: 17, margin: "0 0 4px" }}>{s.label}</h3>
                <p style={{ fontSize: 14, color: "var(--ink-soft)", margin: 0 }}>{s.expl}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 26, textAlign: "center" }}>
          <Link to="/creators" className="btn" style={{ fontSize: 16, padding: "13px 28px" }}>
            Browse all creators <Icon name="arrow" size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
