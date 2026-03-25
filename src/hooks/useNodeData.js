import { useMemo } from "react";
import { NODES } from "../constants/nodes";

export function useNodeData(activeFilters) {
  const visibleNodes = useMemo(() => {
    if (activeFilters.size === 0) return NODES;
    return NODES.filter((n) => {
      for (const f of activeFilters) {
        const [type, key] = [f.slice(0, 2), f.slice(2)];
        if (type === "m_" && !n.manipulation.includes(key)) return false;
        if (type === "b_" && !n.biblical.includes(key)) return false;
        if (type === "t_" && n.tribe !== key) return false;
      }
      return true;
    });
  }, [activeFilters]);

  const { nodesWithConnectivity, edges } = useMemo(() => {
    const results = [];
    const nodes = visibleNodes;
    const degrees = {};
    nodes.forEach(n => degrees[n.id] = 0);

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const sharedManip = a.manipulation.filter((m) => b.manipulation.includes(m));
        const sharedBiblical = a.biblical.filter((p) => b.biblical.includes(p));
        if (sharedManip.length > 0 || sharedBiblical.length > 0) {
          results.push({
            id: `${a.id}-${b.id}`,
            source: a.id,
            target: b.id,
            sharedManip,
            sharedBiblical,
            strength: sharedManip.length + sharedBiblical.length,
          });
          degrees[a.id]++;
          degrees[b.id]++;
        }
      }
    }
    
    const finalNodes = nodes.map(n => ({
      ...n,
      degree: degrees[n.id] || 0
    }));

    return { nodesWithConnectivity: finalNodes, edges: results };
  }, [visibleNodes]);

  return { visibleNodes: nodesWithConnectivity, edges, allNodes: NODES };
}
