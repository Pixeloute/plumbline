import React from "react";
import { MANIPULATION_TYPES, BIBLICAL_PRINCIPLES, TRIBES } from "../constants/data";

function PlumbBar({ label, value, max = 5 }) {
  const pct = (value / max) * 100;
  const color = value <= 2 ? "var(--danger)" : value === 3 ? "var(--warning)" : "var(--success)";
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <span style={{ fontSize: 11, color, fontWeight: 700 }}>{value}/5</span>
      </div>
      <div style={{ height: 3, background: "var(--bg-elevated)", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

export function NodeDetailPanel({ node, onClose }) {
  if (!node) return null;
  const tribe = TRIBES[node.tribe];
  
  return (
    <div style={{
      position: "fixed", right: 24, top: "50%", transform: "translateY(-50%)",
      width: 320, background: "rgba(18,25,41,0.97)", border: "1px solid var(--border)",
      borderRadius: 16, padding: "28px 24px", backdropFilter: "blur(20px)",
      boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
      zIndex: 100,
      animation: "slideInRight 0.3s ease-out",
      maxHeight: "90vh",
      overflowY: "auto"
    }}>
      <button onClick={onClose} style={{
        position: "absolute", top: 16, right: 16, background: "none", border: "none",
        color: "var(--text-secondary)", cursor: "pointer", fontSize: 18,
      }}>✕</button>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: tribe.color }} />
        <span style={{ fontSize: 10, color: tribe.color, textTransform: "uppercase", letterSpacing: "0.12em" }}>{tribe.label}</span>
      </div>

      <h2 style={{ fontSize: 20, color: "var(--text-primary)", marginBottom: 12, lineHeight: 1.3 }}>
        {node.title}
      </h2>

      <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 20 }}>{node.description}</p>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "var(--warning)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Structural Plumb Score</div>
        <PlumbBar label="Process" value={node.plumb.process} />
        <PlumbBar label="Locus" value={node.plumb.locus} />
        <PlumbBar label="Uplift" value={node.plumb.uplift} />
        <PlumbBar label="Means" value={node.plumb.means} />
        <PlumbBar label="Blueprint" value={node.plumb.blueprint} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "var(--warning)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Manipulation Patterns</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {node.manipulation.map((m) => (
            <span key={m} title={MANIPULATION_TYPES[m].label} style={{
              fontSize: 10, padding: "3px 8px", borderRadius: 4,
              background: `${MANIPULATION_TYPES[m].color}18`,
              border: `1px solid ${MANIPULATION_TYPES[m].color}40`,
              color: MANIPULATION_TYPES[m].color,
            }}>{MANIPULATION_TYPES[m].short}</span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Biblical Principles</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {node.biblical.map((p) => (
            <span key={p} style={{
              fontSize: 10, padding: "3px 8px", borderRadius: 4,
              background: `${BIBLICAL_PRINCIPLES[p].color}18`,
              border: `1px solid ${BIBLICAL_PRINCIPLES[p].color}40`,
              color: BIBLICAL_PRINCIPLES[p].color,
            }}>{BIBLICAL_PRINCIPLES[p].label}</span>
          ))}
        </div>
      </div>

      <div style={{ background: "rgba(79, 127, 255, 0.06)", border: "1px solid var(--border-hover)", borderRadius: 8, padding: "10px 12px" }}>
        <div style={{ fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Verdict</div>
        <p style={{ fontSize: 12, color: "var(--text-primary)", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{node.verdict}</p>
      </div>
    </div>
  );
}
