import React, { useMemo } from "react";
import * as d3 from "d3";
import { TRIBES } from "../../constants/data";

const AXES = [
  { key: "process", label: "Process" },
  { key: "locus", label: "Locus" },
  { key: "uplift", label: "Uplift" },
  { key: "means", label: "Means" },
  { key: "blueprint", label: "Blueprint" },
];

export function RadarView({ nodes, selectedNode, compareNode, onNodeClick, onCompareSelect }) {
  const width = 600;
  const height = 500;
  const radius = 180;
  const center = { x: width / 2, y: height / 2 };

  const angleSlice = (Math.PI * 2) / AXES.length;

  const getPath = (node) => {
    if (!node) return "";
    const points = AXES.map((axis, i) => {
      const val = node.plumb[axis.key];
      const r = (val / 5) * radius;
      const x = center.x + r * Math.sin(i * angleSlice);
      const y = center.y - r * Math.cos(i * angleSlice);
      return [x, y];
    });
    return d3.line().curve(d3.curveLinearClosed)(points);
  };

  const getInterpretation = (node) => {
    if (!node) return null;
    const scores = node.plumb;
    const high = Object.entries(scores).filter(([k, v]) => v >= 4).map(([k]) => k);
    const low = Object.entries(scores).filter(([k, v]) => v <= 2).map(([k]) => k);
    
    return {
      strength: high.length > 0 ? `Heavy emphasis on ${high.join(" & ")}.` : "Balanced structural approach.",
      weakness: low.length > 0 ? `Structural vulnerability in ${low.join(" & ")}.` : "No major structural elisions."
    };
  };

  const selectedInterp = getInterpretation(selectedNode);

  return (
    <div style={{ width: "100%", height: "100%", display: "flex", gap: 32, padding: 40, overflowY: "auto" }}>
      {/* Chart Section */}
      <div style={{ flex: 1, position: "relative" }}>
        <svg width={width} height={height} style={{ overflow: "visible" }}>
          {/* Radar Background Grids */}
          {d3.range(1, 6).map(level => {
            const r = (level / 5) * radius;
            const points = AXES.map((_, i) => {
              const x = center.x + r * Math.sin(i * angleSlice);
              const y = center.y - r * Math.cos(i * angleSlice);
              return `${x},${y}`;
            }).join(" ");
            return (
              <polygon
                key={`grid-${level}`}
                points={points}
                fill="none"
                stroke="var(--border)"
                strokeWidth="0.5"
              />
            );
          })}

          {/* Axes */}
          {AXES.map((axis, i) => {
            const x = center.x + radius * Math.sin(i * angleSlice);
            const y = center.y - radius * Math.cos(i * angleSlice);
            const labelDist = 36;
            const lx = center.x + (radius + labelDist) * Math.sin(i * angleSlice);
            const ly = center.y - (radius + labelDist) * Math.cos(i * angleSlice);

            return (
              <g key={`axis-${axis.key}`}>
                <line x1={center.x} y1={center.y} x2={x} y2={y} stroke="var(--border)" />
                <text
                  x={lx} y={ly}
                  fill="var(--text-secondary)"
                  fontSize="10"
                  fontFamily="var(--font-display)"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{ textTransform: "uppercase", letterSpacing: "0.1em" }}
                >
                  {axis.label}
                </text>
              </g>
            );
          })}

          {/* Compare Node (Background Layer) */}
          {compareNode && (
            <path
              d={getPath(compareNode)}
              fill="none"
              stroke="var(--text-tertiary)"
              strokeWidth="2"
              strokeDasharray="4,4"
              opacity="0.6"
            />
          )}

          {/* Render Selected Node */}
          {selectedNode && (
            <g>
              <path
                d={getPath(selectedNode)}
                fill={TRIBES[selectedNode.tribe].color}
                fillOpacity="0.2"
                stroke={TRIBES[selectedNode.tribe].color}
                strokeWidth="3"
                filter="drop-shadow(0 0 8px rgba(255,255,255,0.1))"
              />
              {AXES.map((axis, i) => {
                const val = selectedNode.plumb[axis.key];
                const r = (val / 5) * radius;
                const x = center.x + r * Math.sin(i * angleSlice);
                const y = center.y - r * Math.cos(i * angleSlice);
                return (
                  <circle
                    key={`marker-${axis.key}`}
                    cx={x} cy={y} r="4"
                    fill="var(--text-primary)"
                    stroke={TRIBES[selectedNode.tribe].color}
                    strokeWidth="2"
                  />
                );
              })}
            </g>
          )}

          {/* All nodes as tiny markers if nothing selected */}
          {!selectedNode && nodes.map(node => (
            <circle
              key={node.id}
              cx={center.x + (node.plumb.process / 5) * radius * Math.sin(0)}
              cy={center.y - (node.plumb.process / 5) * radius * Math.cos(0)}
              r="3"
              fill={TRIBES[node.tribe].color}
              opacity="0.3"
              style={{ cursor: "pointer" }}
              onClick={() => onNodeClick(node)}
            />
          ))}
        </svg>
      </div>

      {/* Info Section */}
      <div style={{ width: 340, display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Selection / Comparison Controls */}
        <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
            Fingerprint Comparison
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: selectedNode ? TRIBES[selectedNode.tribe].color : "var(--text-tertiary)", marginBottom: 4 }}>Primary Node</div>
            <div style={{ fontSize: 14, color: "var(--text-primary)" }}>{selectedNode?.title || "None selected"}</div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 8 }}>Compare With</div>
            <select 
              value={compareNode?.id || ""} 
              onChange={(e) => onCompareSelect(e.target.value)}
              style={{
                width: "100%", background: "var(--bg-canvas)", border: "1px solid var(--border)",
                color: "var(--text-primary)", borderRadius: 4, padding: "6px 8px", fontSize: 12,
                fontFamily: "var(--font-body)"
              }}
            >
              <option value="">(Select node)</option>
              {nodes.filter(n => n.id !== selectedNode?.id).map(n => (
                <option key={n.id} value={n.id}>{n.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Interpretation */}
        {selectedNode && (
          <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
              Structural Interpretation
            </div>
            <div style={{ fontSize: 13, color: "var(--text-primary)", lineHeight: 1.5, marginBottom: 12 }}>
              {selectedInterp.strength}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", fontStyle: "italic" }}>
              {selectedInterp.weakness}
            </div>
          </div>
        )}

        {/* Manipulation Tag Cloud (Placeholder for now) */}
        {selectedNode && (
          <div style={{ background: "var(--bg-canvas)", border: "1px dashed var(--border)", borderRadius: 12, padding: 20 }}>
             <div style={{ fontSize: 10, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
              Manipulation Intensity
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {selectedNode.manipulation.map(m => (
                <span key={m} style={{ fontSize: 11, color: "var(--text-mono)", opacity: 0.8 }}>#{m}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
