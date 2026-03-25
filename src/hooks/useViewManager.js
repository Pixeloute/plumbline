import { useState, useCallback } from "react";
import { VIEW_MODES } from "../constants/data";

export function useViewManager() {
  const [viewMode, setViewMode] = useState(VIEW_MODES.SPHERE);
  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [compareNodeId, setCompareNodeId] = useState(null);
  const [timeRange, setTimeRange] = useState(null); // [Date, Date]
  const [clusterByTribe, setClusterByTribe] = useState(false);
  const [showLabels, setShowLabels] = useState(true);

  const toggleFilter = useCallback((key) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const resetView = useCallback(() => {
    setActiveFilters(new Set());
    setSelectedNode(null);
    setCompareNodeId(null);
    setHoveredId(null);
  }, []);

  return {
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
    timeRange,
    setTimeRange,
    clusterByTribe,
    setClusterByTribe,
    showLabels,
    setShowLabels,
    resetView,
  };
}
