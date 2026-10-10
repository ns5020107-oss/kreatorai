import React from "react";
import { Link } from "react-router-dom";
import { VERIFY_SIGNALS } from "../data/taxonomy";
import { Icon, Squiggle } from "../lib/art";
import { VerifyLegend } from "../components/bits";

export default function About() {
  return (
    <div className="wrap-narrow" style={{ paddingTop: 32, paddingBottom: 50 }}>
      <p className="kicker">About</p>
      <h1 style={{ fontSize: 38, marginBottom: 12 }}>Why <Squiggle>KreatorAI</Squiggle> exists</h1>

      <p className="dropcap" style={{ fontSize: 17, color: "var(--ink-soft)" }}>
        Hiring an AI creator today is guesswork. Portfolios are screenshots, "AI artist" can mean
        anything, and nobody tells you whether the tools behind the work are even licensed for
        commercial use. Brands either overpay agencies or gamble on strangers.
      </p>
      <p style={{ color: "var(--ink-soft)" }}>
        KreatorAI asks creators to show their work the way a chef shows a kitchen: the tools on
        the counter, the recipe on the wall, and regulars who'll vouch for the food. Every profile
        lists the actual models used, the step-by-step workflow behind each piece, and verification
        badges that say exactly what was checked.
      </p>

      <h2 style={{ fontSize: 26, marginTop: 30 }}>How a brief becomes a delivery</h2>
      <ol style={{ color: "var(--ink-soft)", fontSize: 15.5, paddingLeft: 22, display: "grid", gap: 8 }}>
        <li><strong>Browse honestly.</strong> Filter by craft, tool, budget, language and verification. Counts are real; badges explain themselves.</li>
        <li><strong>Write a brief with teeth.</strong> Usage type, territory, duration and exclusivity are part of the form — not an afterthought in a contract.</li>
        <li><strong>Match with reasons.</strong> Recommended creators come with a score and the why, so you can defend the shortlist in a meeting.</li>
        <li><strong>Track the work.</strong> Discovery to Delivered, with notes at every stage. No more "wait, what did we agree?"</li>
      </ol>

      <h2 style={{ fontSize: 26, marginTop: 30 }}>The honest limitations</h2>
      <ul style={{ color: "var(--ink-soft)", fontSize: 15.5, paddingLeft: 22, display: "grid", gap: 8 }}>
        <li>The 14 <strong>featured</strong> creators are fictional — names, prices, reviews and emails are demo data for a hackathon. The 100 <strong>directory</strong> listings are real public finds, shown unverified with no invented prices, reviews or contact details.</li>
        <li>"Send email" opens <strong>your</strong> email app; KreatorAI runs no mail server.</li>
        <li>The AI brief builder is <strong>rule-based</strong> unless you plug in an Anthropic key — it extracts keywords, it doesn't dream.</li>
        <li>Verification badges are <strong>mock data</strong> illustrating the concept.</li>
      </ul>

      <VerifyLegend />

      <div style={{ marginTop: 28, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Link to="/creators" className="btn"><Icon name="search" size={16} /> Browse creators</Link>
        <Link to="/brief/new" className="btn-line">Post a brief</Link>
      </div>
    </div>
  );
}
