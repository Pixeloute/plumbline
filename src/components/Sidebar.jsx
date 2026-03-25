import React, { useState } from "react";
import { MANIPULATION_TYPES, BIBLICAL_PRINCIPLES, TRIBES } from "../constants/data";

export function Sidebar({ activeFilters, onToggle, visibleCount, totalCount, visibleNodes }) {
  const [collapsed, setCollapsed] = useState(false);

  const stats = Object.keys(MANIPULATION_TYPES).map(type => ({
    key: type,
    label: MANIPULATION_TYPES[type].label,
    color: MANIPULATION_TYPES[type].color,
    count: visibleNodes.filter(n => n.manipulation.includes(type)).length
  })).filter(s => s.count > 0).sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...stats.map(s => s.count), 1);

  return (
    <div style={{
      position: "fixed",
      left: 24,
      top: "50%",
      transform: "translateY(-50%)",
      width: 240,
      zIndex: 100,
    }}>
      <div style={{
        background: "rgba(10,10,20,0.95)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "20px 18px",
        backdropFilter: "blur(20px)",
        boxShadow: "0 0 40px rgba(0,0,0,0.5)",
      }}>
        {/* Header & Stats */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: "var(--warning)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Signal Density</div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>{visibleCount}/{totalCount}</div>
          </div>
          
          {/* Distribution Sparklines */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 16 }}>
            {stats.slice(0, 4).map(s => (
              <div key={s.key} style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: "var(--text-tertiary)", marginBottom: 2 }}>
                  <span>{s.label}</span>
                  <span>{Math.round((s.count / visibleCount) * 100)}%</span>
                </div>
                <div style={{ height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 1, overflow: "hidden" }}>
                  <div style={{ 
                    height: "100%", width: `${(s.count / maxCount) * 100}%`, 
                    background: s.color, boxShadow: `0 0 4px ${s.color}` 
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: collapsed ? 0 : 18 }}>
          <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Filter Analysis</div>
          <button onClick={() => setCollapsed(!collapsed)} style={{
            background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: 14,
          }}>{collapsed ? "▸" : "▾"}</button>
        </div>

        {!collapsed && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Section title="Manipulation" items={MANIPULATION_TYPES} prefix="m_" activeFilters={activeFilters} onToggle={onToggle} />
            <Section title="Biblical Lens" items={BIBLICAL_PRINCIPLES} prefix="b_" activeFilters={activeFilters} onToggle={onToggle} />
            <Section title="Source Tribe" items={TRIBES} prefix="t_" activeFilters={activeFilters} onToggle={onToggle} />
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, items, prefix, activeFilters, onToggle }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {Object.entries(items).map(([key, val]) => {
          const fk = prefix + key;
          const on = activeFilters.has(fk);
          return (
            <button key={key} onClick={() => onToggle(fk)} style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              background: "none", border: "none", cursor: "pointer",
              padding: "4px 0",
              textAlign: "left"
            }}>
              <div style={{
                width: 10, height: 10, borderRadius: 2,
                background: on ? val.color : "transparent",
                border: `1.5px solid ${val.color}`,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: 10, color: on ? "var(--text-primary)" : "var(--text-secondary)", lineHeight: 1.3 }}>{val.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
