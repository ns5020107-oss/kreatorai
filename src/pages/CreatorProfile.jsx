import React, { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ALL_CREATORS } from "../data/creators";
import { AvatarArt, Thumb, Icon } from "../lib/art";
import { VerifyBadges, VerifyLegend, TrustMeter, ListedBadge, Stars, RateLine, AvailabilityDot, NotFoundCard } from "../components/bits";
import CreatorCard from "../components/CreatorCard";
import EmailModal from "../components/EmailModal";
import PortfolioModal from "../components/PortfolioModal";
import { useStore } from "../state/store";

export default function CreatorProfile() {
  const { id } = useParams();
  const creator = ALL_CREATORS.find((c) => c.id === id);
  const [workOpen, setWorkOpen] = useState(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const { toast } = useStore();

  const similar = useMemo(() => {
    if (!creator) return [];
    return ALL_CREATORS.filter((c) => c.id !== creator.id)
      .map((c) => ({
        c,
        s: (c.specialization === creator.specialization ? 3 : 0) +
           (c.tools || []).filter((t) => (creator.tools || []).includes(t)).length +
           (c.contentTypes || []).filter((t) => (creator.contentTypes || []).includes(t)).length,
      }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 3)
      .map((x) => x.c);
  }, [creator]);

  if (!creator) return <NotFoundCard what="This creator isn't here" />;

  const isDir = creator.source === "directory";
  const vCount = ["tools", "workflow", "pastWork", "commercialSafe"].filter((k) => creator.verify?.[k]).length;
  const portfolio = creator.portfolio || [];

  return (
    <div className="wrap" style={{ paddingTop: 30, paddingBottom: 40 }}>
      <Link to="/creators" style={{ fontSize: 14, fontWeight: 600 }}>← All creators</Link>

      {/* header card */}
      <div className="card" style={{ marginTop: 14, padding: 26 }}>
        <div className="two-col" style={{ gridTemplateColumns: "auto 1fr", gap: 26, alignItems: "start" }}>
          <AvatarArt name={creator.name} hue={creator.hue} size={110} />
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <h1 style={{ fontSize: 36, margin: "0 0 4px" }}>{creator.name}</h1>
                <p style={{ fontSize: 16, color: "var(--ink-soft)", margin: "0 0 8px" }}>{creator.headline}</p>
                <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="pin" size={14} /> {creator.location}</span>
                  {creator.responseTime && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icon name="clock" size={14} /> Responds in {creator.responseTime}</span>
                  )}
                </p>
              </div>
              {isDir ? <ListedBadge /> : <TrustMeter score={creator.trustScore} />}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 14, alignItems: "center" }}>
              <AvailabilityDot value={creator.availability} />
              <span style={{ fontSize: 15 }}><RateLine creator={creator} /></span>
              {!isDir && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14 }}>
                  <Stars rating={creator.rating} /> <span style={{ color: "var(--muted)" }}>{creator.rating} · {creator.reviews} reviews</span>
                </span>
              )}
            </div>
            <div style={{ marginTop: 14 }}>
              {isDir ? (
                <>
                  <ListedBadge />
                  <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "6px 0 0" }}>
                    Public directory listing — not vetted by KreatorAI. Details below come from the public listing.
                  </p>
                </>
              ) : (
                <>
                  <VerifyBadges verify={creator.verify} />
                  <p style={{ fontSize: 12.5, color: "var(--muted)", margin: "6px 0 0" }}>{vCount} of 4 checks verified · demo data</p>
                </>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
              {isDir ? (
                creator.websiteUrl ? (
                  <a className="btn" href={creator.websiteUrl} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 16, padding: "12px 26px", textDecoration: "none" }}>
                    Visit website <Icon name="arrow" size={16} />
                  </a>
                ) : (
                  <button className="btn" disabled style={{ fontSize: 16, padding: "12px 26px", opacity: 0.55, cursor: "not-allowed" }}>
                    Website not listed
                  </button>
                )
              ) : (
                <>
                  <button className="btn" onClick={() => setEmailOpen(true)} style={{ fontSize: 16, padding: "12px 26px" }}>
                    <Icon name="mail" size={17} /> Send email
                  </button>
                  <button className="btn-line" onClick={() => toast("Shortlist lives on a brief — open a brief to shortlist creators")}>
                    How shortlisting works
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* bio + facts */}
      <div className="two-col" style={{ marginTop: 22 }}>
        <div>
          <p className="kicker">About</p>
          <p className="dropcap" style={{ fontSize: 16, color: "var(--ink-soft)" }}>{creator.bio}</p>
          {!isDir && (
            <>
              <p className="kicker" style={{ marginTop: 24 }}>Languages</p>
              <p style={{ margin: 0 }}>{(creator.languages || []).join(" · ")}</p>
            </>
          )}
        </div>
        {isDir ? (
          <div className="card">
            <p className="kicker">Listing details</p>
            <dl className="kv">
              <dt>Specialization</dt><dd>{creator.specialization}</dd>
              <dt>Platform</dt><dd>{creator.platform}</dd>
              <dt>Website</dt>
              <dd>{creator.websiteUrl
                ? <a href={creator.websiteUrl} target="_blank" rel="noopener noreferrer">{creator.websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}</a>
                : "Not listed"}</dd>
              {creator.portfolioUrl && (
                <><dt>Portfolio</dt>
                <dd><a href={creator.portfolioUrl} target="_blank" rel="noopener noreferrer">View portfolio</a></dd></>
              )}
              <dt>Listed via</dt>
              <dd><a href={creator.sourceUrl} target="_blank" rel="noopener noreferrer">{creator.sourceName}</a></dd>
              <dt>Directory note</dt><dd>{creator.sourceNote}</dd>
              <dt>Tools</dt><dd>Not listed</dd>
              <dt>Languages</dt><dd>Not listed</dd>
              <dt>Pricing</dt><dd>Pricing on request — not listed</dd>
            </dl>
          </div>
        ) : (
          <div className="card">
            <p className="kicker">The toolkit</p>
            <dl className="kv">
              <dt>Specialization</dt><dd>{creator.specialization}</dd>
              <dt>Skills</dt><dd>{(creator.skills || []).join(", ")}</dd>
              <dt>Tools & models</dt><dd>{(creator.tools || []).join(", ")}</dd>
              <dt>Content types</dt><dd>{(creator.contentTypes || []).join(", ")}</dd>
              <dt>Aspect ratios</dt><dd>{(creator.aspectRatios || []).join(", ")}</dd>
              <dt>Licence level</dt><dd style={{ textTransform: "capitalize" }}>{creator.licenseLevel === "buyout" ? "Full buyout available" : creator.licenseLevel}</dd>
            </dl>
          </div>
        )}
      </div>

      {/* portfolio */}
      <div style={{ marginTop: 34 }}>
        <p className="kicker">AI Portfolio</p>
        <h2 style={{ fontSize: 28, marginBottom: 6 }}>Selected work</h2>
        {isDir ? (
          creator.portfolioUrl ? (
            <div className="card" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
              <p style={{ margin: 0, flex: "1 1 240px", color: "var(--ink-soft)" }}>
                This creator's work lives on their own site — KreatorAI doesn't host directory portfolios.
              </p>
              <a className="btn-line" href={creator.portfolioUrl} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: "none" }}>
                View portfolio <Icon name="arrow" size={15} />
              </a>
            </div>
          ) : (
            <p style={{ color: "var(--muted)" }}>No portfolio link listed for this directory entry.</p>
          )
        ) : (
          <>
            <p style={{ color: "var(--muted)", fontSize: 14.5, marginBottom: 18 }}>
              Click any piece to see how it was made — tools, steps, client and licence.
            </p>
            {portfolio.length === 0 ? (
              <p style={{ color: "var(--muted)" }}>No portfolio pieces yet — this creator is still uploading.</p>
            ) : (
              <div className="portfolio-grid">
                {portfolio.map((p, i) => (
                  <button key={p.id} className={"work-card card-hover" + (i % 4 === 0 ? " tall" : "")}
                    onClick={() => setWorkOpen(p)} aria-label={`Open details for ${p.title}`}>
                    <Thumb seed={p.seed} type={p.type} title={p.title} style={{ width: "100%", aspectRatio: i % 4 === 0 ? "4/5" : "16/9" }} />
                    <span className="meta">
                      <h4>{p.title}</h4>
                      <p>{p.type} · {p.client} · {p.year}</p>
                      <span className="license-badge">{p.license}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* reviews */}
      <div style={{ marginTop: 34 }}>
        <p className="kicker">Word of mouth</p>
        <h2 style={{ fontSize: 28, marginBottom: 14 }}>What clients say</h2>
        {isDir ? (
          <p style={{ color: "var(--muted)" }}>No reviews on file — directory listings aren't vetted profiles.</p>
        ) : (creator.testimonials || []).length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No written reviews yet — {creator.name.split(" ")[0]} is new here. The verification badges above are the best signal for now.</p>
        ) : (
          (creator.testimonials || []).map((t, i) => (
            <blockquote key={i} className="card" style={{ borderLeft: "3px solid var(--accent)", margin: "0 0 14px" }}>
              <p style={{ fontFamily: "var(--serif)", fontSize: 17, fontStyle: "italic", margin: "0 0 8px" }}>"{t.text}"</p>
              <cite style={{ fontSize: 13.5, color: "var(--muted)", fontStyle: "normal" }}>— {t.name}, {t.role}</cite>
            </blockquote>
          ))
        )}
      </div>

      <VerifyLegend />

      {/* similar */}
      <div style={{ marginTop: 34 }}>
        <p className="kicker">Keep looking</p>
        <h2 style={{ fontSize: 28, marginBottom: 14 }}>Similar creators</h2>
        <div className="creator-grid">
          {similar.map((c) => <CreatorCard key={c.id} creator={c} />)}
        </div>
      </div>

      {workOpen && <PortfolioModal item={workOpen} onClose={() => setWorkOpen(null)} />}
      {emailOpen && !isDir && <EmailModal creator={creator} onClose={() => setEmailOpen(false)} />}
    </div>
  );
}
