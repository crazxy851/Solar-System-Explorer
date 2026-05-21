import React, { useState, useCallback } from "react";
import SolarSystem from "./components/SolarSystem";
import InfoPanel from "./components/InfoPanel";
import HUD from "./components/HUD";
import "./App.css";

export default function App() {
  const [selected, setSelected] = useState(null);
  const [paused, setPaused] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [cameraMode, setCameraMode] = useState("free"); // free | follow

  const handleSelect = useCallback((body) => {
    setSelected(body);
    if (body) setCameraMode("follow");
  }, []);

  const handleClose = useCallback(() => {
    setSelected(null);
    setCameraMode("free");
  }, []);

  return (
    <div className="app">
      <SolarSystem
        selected={selected}
        onSelect={handleSelect}
        paused={paused}
        speedMultiplier={speedMultiplier}
        showOrbits={showOrbits}
        showLabels={showLabels}
        cameraMode={cameraMode}
      />
      <HUD
        paused={paused}
        onTogglePause={() => setPaused((p) => !p)}
        speedMultiplier={speedMultiplier}
        onSpeedChange={setSpeedMultiplier}
        showOrbits={showOrbits}
        onToggleOrbits={() => setShowOrbits((o) => !o)}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((l) => !l)}
        selected={selected}
        onClose={handleClose}
      />
      {selected && <InfoPanel body={selected} onClose={handleClose} />}
    </div>
  );
}
