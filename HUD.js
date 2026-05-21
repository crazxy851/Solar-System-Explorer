import React, { useEffect, useRef } from "react";
import { PLANETS, SUN_DATA } from "../data/planets";

/* Icons */
const PauseIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <rect x="3" y="2" width="4" height="12" rx="1" />
    <rect x="9" y="2" width="4" height="12" rx="1" />
  </svg>
);

const PlayIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path d="M4 2l10 6-10 6V2z" />
  </svg>
);

const OrbitIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <circle cx="8" cy="8" r="5" />
    <ellipse cx="8" cy="8" rx="8" ry="3" />
  </svg>
);

const LabelIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <path d="M2 4h9l3 4-3 4H2V4zm2 2v4h6.5l2-2-2-2H4z" />
  </svg>
);

const ResetIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M2 8a6 6 0 1 0 1.5-3.9" strokeLinecap="round" />
    <path d="M2 3v5h5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function HUD({
  paused,
  onTogglePause,
  speedMultiplier,
  onSpeedChange,
  showOrbits,
  onToggleOrbits,
  showLabels,
  onToggleLabels,
  selected,
  onClose,
}) {
  const rangeRef = useRef();

  // Update CSS variable for range fill
  useEffect(() => {
    if (rangeRef.current) {
      const pct = ((speedMultiplier - 0.1) / (5 - 0.1)) * 100;
      rangeRef.current.style.setProperty("--val", `${pct}%`);
    }
  }, [speedMultiplier]);

  const allBodies = [SUN_DATA, ...PLANETS];

  return (
    <>
      {/* Title */}
      <div className="hud-title">
        <h1>Solar Explorer</h1>
        <p>Interactive 3D Solar System</p>
      </div>

      {/* Controls — bottom left */}
      <div className="hud-controls">
        <div className="hud-controls-row">
          <button
            className={`hud-btn ${paused ? "" : "active"}`}
            onClick={onTogglePause}
            title={paused ? "Resume" : "Pause"}
          >
            {paused ? <PlayIcon /> : <PauseIcon />}
            {paused ? "Resume" : "Pause"}
          </button>

          <button
            className={`hud-btn ${showOrbits ? "active" : ""}`}
            onClick={onToggleOrbits}
            title="Toggle orbit rings"
          >
            <OrbitIcon />
            Orbits
          </button>

          <button
            className={`hud-btn ${showLabels ? "active" : ""}`}
            onClick={onToggleLabels}
            title="Toggle labels"
          >
            <LabelIcon />
            Labels
          </button>
        </div>

        <div className="hud-controls-row">
          <div className="speed-control">
            <label>Speed</label>
            <input
              ref={rangeRef}
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={speedMultiplier}
              onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            />
            <span>{speedMultiplier.toFixed(1)}×</span>
          </div>

          {selected && (
            <button className="hud-btn danger" onClick={onClose} title="Deselect">
              <ResetIcon />
              Free cam
            </button>
          )}
        </div>
      </div>

      {/* Planet navigation — right side */}
      <div className="hud-planet-nav">
        {allBodies.map((body) => {
          const isSun = !body.id;
          const color = isSun ? "#ff9500" : body.color;
          const isSelected = selected?.name === body.name;
          return (
            <button
              key={body.name}
              className={`planet-nav-btn ${isSelected ? "selected" : ""}`}
              style={{
                borderColor: isSelected ? `${color}88` : undefined,
                color: isSelected ? color : undefined,
              }}
              onClick={() => {
                if (isSelected) {
                  onClose();
                }
                // Clicking from nav — trigger a custom event picked up by App
                window.dispatchEvent(
                  new CustomEvent("selectBody", { detail: body })
                );
              }}
            >
              <span>{body.name}</span>
              <span
                className="planet-dot"
                style={{
                  background: color,
                  boxShadow: isSelected ? `0 0 8px ${color}` : "none",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* Instructions */}
      {!selected && (
        <div className="instructions">
          <div className="instruction-item">
            <span className="key">drag</span>
            <span>rotate</span>
          </div>
          <div className="instruction-item">
            <span className="key">scroll</span>
            <span>zoom</span>
          </div>
          <div className="instruction-item">
            <span className="key">right drag</span>
            <span>pan</span>
          </div>
          <div className="instruction-item">
            <span className="key">click</span>
            <span>select body</span>
          </div>
        </div>
      )}
    </>
  );
}
