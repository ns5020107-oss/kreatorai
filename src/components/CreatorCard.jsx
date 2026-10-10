import React from "react";
import { Link } from "react-router-dom";
import { AvatarArt } from "../lib/art";
import { VerifyBadges, TrustMeter, ListedBadge, Stars, RateLine, AvailabilityDot } from "./bits";

export default function CreatorCard({ creator, tilt }) {
  const isDir = creator.source === "directory";
  const vCount = ["tools", "workflow", "pastWork", "commercialSafe"].filter((k) => creator.verify?.[k]).length;
  return (
    <Link
      to={`/creator/${creator.id}`}
      className="card card-hover"
      style={{
        textDecoration: "none", color: "inherit", display: "flex", flexDirection: "column", gap: 12,
        transform: tilt ? `rotate(${tilt}deg)` : undefined,
      }}
      aria-label={`View profile of ${creator.name}, ${creator.headline}`}
    >
      <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
        <AvatarArt name={creator.name} hue={creator.hue} size={58} />
        <div style={{ minWidth: 0 }}>
          <h3 style={{ fontSize: 18, margin: "0 0 2px" }}>{creator.name}</h3>
          <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {creator.headline}
          </p>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
        <AvailabilityDot value={creator.availability} />
        <span style={{ fontSize: 12.5, color: "var(--muted)" }}>{creator.location.split(",")[0]}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
        <span className="chip-sm">{creator.specialization}</span>
        <span className={"source-tag" + (isDir ? "" : " featured")}>
          {isDir ? "Directory entry" : "Featured"}
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {(creator.tools || []).length > 0 ? (
          <>
            {(creator.tools || []).slice(0, 3).map((t) => (
              <span key={t} style={{ fontSize: 12, background: "var(--paper-2)", border: "1px solid var(--line)", borderRadius: 999, padding: "3px 10px" }}>{t}</span>
            ))}
            {(creator.tools || []).length > 3 && (
              <span style={{ fontSize: 12, color: "var(--muted)" }}>+{(creator.tools || []).length - 3} more</span>
            )}
          </>
        ) : (
          <span style={{ fontSize: 12, color: "var(--muted)" }}>Tools not listed</span>
        )}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 6, borderTop: "1px solid var(--line-soft)" }}>
        <RateLine creator={creator} />
        {isDir ? <ListedBadge /> : <TrustMeter score={creator.trustScore} small />}
      </div>
      {isDir ? (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Stars rating={creator.rating} />
          <span style={{ fontSize: 12.5, color: "var(--muted)" }}>
            {creator.websiteUrl ? "Website listed" : "No website listed"}
          </span>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
            <Stars rating={creator.rating} />
            <span style={{ color: "var(--muted)" }}>{creator.rating} ({creator.reviews})</span>
          </span>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--moss)" }}>{vCount}/4 verified</span>
        </div>
      )}
    </Link>
  );
}
