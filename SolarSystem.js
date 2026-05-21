import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars, OrbitControls, Html, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { PLANETS, SUN_DATA } from "../data/planets";

/* ── Animated Sun ── */
function Sun({ onClick, showLabels }) {
  const meshRef = useRef();
  const glowRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.001;
    }
    if (glowRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
      glowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group onClick={(e) => { e.stopPropagation(); onClick(SUN_DATA); }}>
      {/* Corona glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[4.2, 32, 32]} />
        <meshBasicMaterial
          color="#ff8800"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[3.8, 32, 32]} />
        <meshBasicMaterial
          color="#ffaa00"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Sun body */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[SUN_DATA.radius, 64, 64]} />
        <meshStandardMaterial
          color="#ff9500"
          emissive="#ff6600"
          emissiveIntensity={1.5}
          roughness={1}
          metalness={0}
        />
      </mesh>
      {/* Sun label */}
      {showLabels && (
        <Billboard position={[0, SUN_DATA.radius + 1.2, 0]}>
          <Html center>
            <div style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "9px",
              fontWeight: "700",
              letterSpacing: "0.2em",
              color: "#ffaa44",
              textTransform: "uppercase",
              textShadow: "0 0 10px rgba(255,170,0,0.8)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
              userSelect: "none",
            }}>
              THE SUN
            </div>
          </Html>
        </Billboard>
      )}
      {/* Point light from sun */}
      <pointLight color="#fff8e0" intensity={3} distance={200} decay={1} />
    </group>
  );
}

/* ── Orbit Ring ── */
function OrbitRing({ distance }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 128; i++) {
      const angle = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance));
    }
    return pts;
  }, [distance]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return geo;
  }, [points]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#1a3a5a" transparent opacity={0.4} />
    </line>
  );
}

/* ── Saturn Rings ── */
function PlanetRings({ planet }) {
  const geometry = useMemo(() => {
    const inner = planet.ringInner;
    const outer = planet.ringOuter;
    const geo = new THREE.RingGeometry(inner, outer, 128);
    // Fix UV for ring texture
    const pos = geo.attributes.position;
    const uv = geo.attributes.uv;
    const v3 = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v3.fromBufferAttribute(pos, i);
      uv.setXY(i, v3.length() < (inner + outer) / 2 ? 0 : 1, 1);
    }
    return geo;
  }, [planet]);

  return (
    <mesh geometry={geometry} rotation={[Math.PI / 2, 0, 0.3]}>
      <meshBasicMaterial
        color={planet.ringColor}
        side={THREE.DoubleSide}
        transparent
        opacity={planet.ringOpacity}
      />
    </mesh>
  );
}

/* ── Individual Planet ── */
function Planet({ planet, paused, speedMultiplier, showOrbits, showLabels, isSelected, onClick }) {
  const groupRef = useRef(); // orbit group
  const meshRef = useRef();  // planet mesh
  const angleRef = useRef(Math.random() * Math.PI * 2);

  useFrame((_, delta) => {
    if (paused) return;
    const speed = (planet.orbitSpeed / 100) * speedMultiplier;
    angleRef.current += speed * delta;
    if (groupRef.current) {
      groupRef.current.position.x = Math.cos(angleRef.current) * planet.distance;
      groupRef.current.position.z = Math.sin(angleRef.current) * planet.distance;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += planet.rotationSpeed * speedMultiplier * delta * 10;
    }
  });

  const color1 = new THREE.Color(planet.color);
  const color2 = new THREE.Color(planet.color2);

  return (
    <>
      {showOrbits && <OrbitRing distance={planet.distance} />}
      <group ref={groupRef}>
        {/* Selection glow */}
        {isSelected && (
          <mesh>
            <sphereGeometry args={[planet.radius * 1.4, 32, 32]} />
            <meshBasicMaterial color={planet.color} transparent opacity={0.12} />
          </mesh>
        )}
        {/* Planet mesh */}
        <mesh
          ref={meshRef}
          onClick={(e) => { e.stopPropagation(); onClick(planet); }}
          onPointerOver={() => { document.body.style.cursor = "pointer"; }}
          onPointerOut={() => { document.body.style.cursor = "auto"; }}
        >
          <sphereGeometry args={[planet.radius, 64, 64]} />
          <meshStandardMaterial
            color={color1}
            emissive={new THREE.Color(planet.emissive)}
            emissiveIntensity={0.3}
            roughness={planet.roughness}
            metalness={planet.metalness}
          />
        </mesh>
        {/* Rings */}
        {planet.rings && <PlanetRings planet={planet} />}
        {/* Label */}
        {showLabels && (
          <Billboard position={[0, planet.radius + 0.6, 0]}>
            <Html center>
              <div style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: "8px",
                fontWeight: isSelected ? "700" : "400",
                letterSpacing: "0.2em",
                color: isSelected ? planet.color : "rgba(180,220,255,0.6)",
                textTransform: "uppercase",
                textShadow: isSelected ? `0 0 10px ${planet.color}` : "none",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                userSelect: "none",
                transition: "color 0.3s, text-shadow 0.3s",
              }}>
                {planet.name}
              </div>
            </Html>
          </Billboard>
        )}
      </group>
    </>
  );
}

/* ── Camera Controller ── */
function CameraController({ selected, paused, speedMultiplier }) {
  const { camera } = useThree();
  const angleRef = useRef(0);

  useFrame((_, delta) => {
    if (!selected || selected.id === "sun") return;
    if (paused) return;
    const planet = PLANETS.find((p) => p.id === selected.id);
    if (!planet) return;
    const speed = (planet.orbitSpeed / 100) * speedMultiplier;
    angleRef.current += speed * delta;
  });

  useEffect(() => {
    if (!selected) return;
    if (selected.id === "sun") {
      camera.position.set(0, 30, 60);
      camera.lookAt(0, 0, 0);
    }
  }, [selected, camera]);

  return null;
}

/* ── Asteroid Belt ── */
function AsteroidBelt() {
  const count = 300;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 19 + Math.random() * 3;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    return pos;
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#8a8a8a" size={0.08} transparent opacity={0.6} />
    </points>
  );
}

/* ── Main Scene ── */
export default function SolarSystem({
  selected,
  onSelect,
  paused,
  speedMultiplier,
  showOrbits,
  showLabels,
  cameraMode,
}) {
  return (
    <Canvas
      camera={{ position: [0, 35, 75], fov: 50, near: 0.1, far: 2000 }}
      style={{ background: "#000508" }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      {/* Ambient lighting */}
      <ambientLight color="#0a1020" intensity={0.5} />
      <hemisphereLight color="#ffffff" groundColor="#000814" intensity={0.2} />

      {/* Deep space stars */}
      <Stars radius={500} depth={100} count={8000} factor={4} fade speed={0.3} />

      {/* Camera controller */}
      <CameraController selected={selected} paused={paused} speedMultiplier={speedMultiplier} />

      {/* Sun */}
      <Sun onClick={onSelect} showLabels={showLabels} />

      {/* Asteroid belt */}
      <AsteroidBelt />

      {/* Planets */}
      {PLANETS.map((planet) => (
        <Planet
          key={planet.id}
          planet={planet}
          paused={paused}
          speedMultiplier={speedMultiplier}
          showOrbits={showOrbits}
          showLabels={showLabels}
          isSelected={selected?.id === planet.id}
          onClick={onSelect}
        />
      ))}

      {/* Orbit controls */}
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        minDistance={5}
        maxDistance={300}
        zoomSpeed={0.8}
        panSpeed={0.8}
        rotateSpeed={0.5}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN,
        }}
      />
    </Canvas>
  );
}
