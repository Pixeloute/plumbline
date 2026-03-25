import React, { useEffect, lazy, Suspense } from "react";
import { useViewManager } from "../hooks/useViewManager";
import { useNodeData } from "../hooks/useNodeData";
import { VIEW_MODES } from "../constants/data";

// Components
import { ViewSwitcher } from "./ViewSwitcher";
import { Sidebar } from "./Sidebar";
import { NodeDetailPanel } from "./NodeDetailPanel";

// Lazy-loaded Views
const SphereView = lazy(() => import("./views/SphereView").then(m => ({ default: m.SphereView })));
const ForceGraphView = lazy(() => import("./views/ForceGraphView").then(m => ({ default: m.ForceGraphView })));
const RadarView = lazy(() => import("./views/RadarView").then(m => ({ default: m.RadarView })));
const TimelineView = lazy(() => import("./views/TimelineView").then(m => ({ default: m.TimelineView })));

export default function PlumbLineObservatory() {
  const {
    viewMode,
    setViewMode,
    selectedNode,
    setSelectedNode,
    hoveredId,
    setHoveredId,
    activeFilters,
    toggleFilter,
    compareNodeId,
    setCompareNodeId,
    clusterByTribe,
    setClusterByTribe,
    showLabels,
    setShowLabels,
    resetView
  } = useViewManager();

  const { visibleNodes, edges, allNodes } = useNodeData(activeFilters);
  const compareNode = allNodes.find(n => n.id === compareNodeId);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "1") setViewMode(VIEW_MODES.SPHERE);
      if (e.key === "2") setViewMode(VIEW_MODES.FORCE);
      if (e.key === "3") setViewMode(VIEW_MODES.RADAR);
      if (e.key === "4") setViewMode(VIEW_MODES.TIMELINE);
      if (e.key === "Escape") resetView();
      if (e.key === "c" && viewMode === VIEW_MODES.FORCE) setClusterByTribe(prev => !prev);
      if (e.key === "l" && viewMode === VIEW_MODES.FORCE) setShowLabels(prev => !prev);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, setViewMode, resetView, setClusterByTribe]);

  const renderView = () => {
    return (
      <Suspense fallback={
        <div style={{ 
          display: "flex", alignItems: "center", justifyContent: "center", 
          height: "100%", color: "var(--text-tertiary)", fontSize: "10px",
          textTransform: "uppercase", letterSpacing: "0.2em"
        }}>
          Initializing Visualization...
        </div>
      }>
        {(() => {
          switch (viewMode) {
            case VIEW_MODES.SPHERE:
              return (
                <SphereView
                  nodes={visibleNodes}
                  edges={edges}
                  selectedNode={selectedNode}
                  hoveredId={hoveredId}
                  onNodeClick={setSelectedNode}
                  onNodeHover={setHoveredId}
                />
              );
            case VIEW_MODES.FORCE:
              return (
                <ForceGraphView
                  nodes={visibleNodes}
                  edges={edges}
                  selectedNode={selectedNode}
                  hoveredId={hoveredId}
                  onNodeClick={setSelectedNode}
                  onNodeHover={setHoveredId}
                  clusterByTribe={clusterByTribe}
                  showLabels={showLabels}
                />
              );
            case VIEW_MODES.RADAR:
              return (
                <RadarView
                  nodes={allNodes}
                  selectedNode={selectedNode}
                  compareNode={compareNode}
                  onNodeClick={setSelectedNode}
                  onCompareSelect={setCompareNodeId}
                />
              );
            case VIEW_MODES.TIMELINE:
              return (
                <TimelineView
                  nodes={visibleNodes}
                  selectedNode={selectedNode}
                  hoveredId={hoveredId}
                  onNodeClick={setSelectedNode}
                  onNodeHover={setHoveredId}
                />
              );
            default:
              return null;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      background: "var(--bg-canvas)",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background radial glow */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(circle at 50% 50%, rgba(79, 127, 255, 0.05) 0%, transparent 70%)",
        pointerEvents: "none"
      }} />

      {/* Floating Application Title */}
      <div style={{
        position: "absolute",
        top: 24,
        left: 24,
        zIndex: 10,
        pointerEvents: "none"
      }}>
        <h1 style={{
          margin: 0,
          fontSize: "12px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--text-primary)",
          fontWeight: 400,
          opacity: 0.8
        }}>
          The Plumb Line Observatory
        </h1>
        <div style={{
          fontSize: "9px",
          color: "var(--text-tertiary)",
          marginTop: "4px",
          letterSpacing: "0.05em"
        }}>
          STRUCTURAL DISCOURSE ANALYSIS v2.0
        </div>
      </div>

      {/* View Switcher */}
      <ViewSwitcher activeMode={viewMode} setMode={setViewMode} />

      {/* Main content area */}
      <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
        {renderView()}
      </div>

      {/* UI Chrome */}
      <Sidebar
        activeFilters={activeFilters}
        onToggle={toggleFilter}
        visibleCount={visibleNodes.length}
        totalCount={allNodes.length}
        visibleNodes={visibleNodes}
      />

      <NodeDetailPanel
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />

      {/* Interaction Hints */}
      <div style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        pointerEvents: "none",
        textAlign: "center"
      }}>
        <div style={{
          fontSize: "10px",
          color: "var(--text-tertiary)",
          letterSpacing: "0.1em",
          textTransform: "uppercase"
        }}>
          {viewMode === VIEW_MODES.SPHERE && "Drag to rotate · Scroll to zoom · Click to analyze"}
          {viewMode === VIEW_MODES.FORCE && "Drag nodes to organize · 'C' clusters · 'L' labels"}
          {viewMode === VIEW_MODES.RADAR && "Compare structural fingerprints"}
          {viewMode === VIEW_MODES.TIMELINE && "Scrub through discourse history"}
        </div>
      </div>
    </div>
  );
}
