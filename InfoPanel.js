import React from "react";
import { PLANETS } from "../data/planets";

export default function InfoPanel({ body, onClose }) {
  if (!body) return null;

  const isSun = !body.id || body.id === "sun";
  const accentColor = isSun ? "#ff9500" : body.color;

  const stats = body.stats || {};
  const statEntries = Object.entries(stats);

  return (
    <div className="info-panel" style={{ borderColor: `${accentColor}33` }}>
      {/* Header */}
      <div
        className="info-panel-header"
        style={{
          background: `linear-gradient(135deg, ${accentColor}12 0%, transparent 100%)`,
        }}
      >
        <div
          className="info-panel-planet-icon"
          style={{
            background: isSun
              ? "radial-gradient(circle at 35% 35%, #ffdd88, #ff8800, #cc4400)"
              : `radial-gradient(circle at 35% 35%, ${body.color2 || body.color}, ${body.color}, ${body.emissive || "#000"})`,
            borderColor: `${accentColor}44`,
            boxShadow: `0 0 12px ${accentColor}44`,
          }}
        />
        <button className="info-panel-close" onClick={onClose}>✕</button>
        <div className="info-panel-title" style={{ color: accentColor }}>
          {body.name}
        </div>
        <div className="info-panel-subtitle">
          {isSun ? "G-type Main Sequence Star" : "Solar System Planet"}
        </div>
      </div>

      {/* Body */}
      <div className="info-panel-body">
        <p className="info-panel-desc">{body.description}</p>

        {/* Stats grid */}
        <div className="info-stats-grid">
          {statEntries.map(([key, value]) => (
            <div
              className="stat-card"
              key={key}
              style={{
                borderColor: `${accentColor}22`,
                background: `${accentColor}06`,
              }}
            >
              <div className="stat-label">{formatLabel(key)}</div>
              <div className="stat-value" style={{ color: accentColor }}>
                {value !== undefined && value !== null ? String(value) : "—"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatLabel(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}
