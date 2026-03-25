import React from "react";
import { VIEW_MODES } from "../constants/data";

const MODES = [
  { id: VIEW_MODES.SPHERE, label: "3D Sphere", icon: "◉" },
  { id: VIEW_MODES.FORCE, label: "2D Network", icon: "⬡" },
  { id: VIEW_MODES.RADAR, label: "Fingerprint", icon: "◎" },
  { id: VIEW_MODES.TIMELINE, label: "Timeline", icon: "▬" },
];

export function ViewSwitcher({ activeMode, setMode }) {
  return (
    <div style={{
      position: "fixed",
      top: 24,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1000,
      display: "flex",
      gap: 4,
      background: "rgba(18, 25, 41, 0.8)",
      backdropFilter: "blur(12px)",
      padding: "4px",
      borderRadius: "12px",
      border: "1px solid var(--border-dim)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
    }}>
      {MODES.map((m) => {
        const isActive = activeMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            style={{
              background: isActive ? "var(--bg-surface-elevated)" : "transparent",
              border: isActive ? "1px solid var(--border-glow)" : "1px solid transparent",
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              padding: "8px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: "13px",
              fontWeight: 500,
              fontFamily: "var(--font-display)",
              transition: "all 0.2s ease",
            }}
          >
            <span style={{ fontSize: "16px" }}>{m.icon}</span>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
