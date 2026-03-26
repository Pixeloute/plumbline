import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { TRIBES } from "../../constants/data";

export function ForceGraphView({ nodes, edges, selectedNode, hoveredId, onNodeClick, onNodeHover, clusterByTribe, showLabels }) {
  const svgRef = useRef(null);
  const simulationRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg.append("g");

    // Simulation
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(edges).id(d => d.id).distance(d => 150 / (d.strength || 1)))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(40));

    simulationRef.current = simulation;

    // Tribe clustering force
    if (clusterByTribe) {
      const tribeCenters = {
        RIGHT: { x: width * 0.25, y: height * 0.25 },
        LEFT: { x: width * 0.75, y: height * 0.25 },
        RELIGION: { x: width * 0.25, y: height * 0.75 },
        GEOPOLITICS: { x: width * 0.75, y: height * 0.75 },
      };

      simulation.force("x", d3.forceX(d => tribeCenters[d.tribe].x).strength(0.15));
      simulation.force("y", d3.forceY(d => tribeCenters[d.tribe].y).strength(0.15));
    }

    // Edges
    const link = g.append("g")
      .selectAll("line")
      .data(edges)
      .join("line")
      .attr("stroke", d => d.sharedManip.length > 0 ? "var(--tribe-right)" : "var(--accent)")
      .attr("stroke-opacity", 0.1)
      .attr("stroke-width", d => Math.sqrt(d.strength) * 2);

    // Nodes
    const node = g.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "node-group")
      .attr("cursor", "pointer")
      .on("click", (event, d) => onNodeClick(d))
      .on("mouseenter", (event, d) => onNodeHover(d.id))
      .on("mouseleave", () => onNodeHover(null))
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
      .attr("r", d => 6 + (d.degree * 2))
      .attr("fill", d => TRIBES[d.tribe].color)
      .attr("stroke", "var(--bg-canvas)")
      .attr("stroke-width", 2);

    node.append("text")
      .text(d => d.title)
      .attr("font-family", "var(--font-display)")
      .attr("font-size", "10px")
      .attr("fill", "var(--text-secondary)")
      .attr("dy", d => 14 + (d.degree * 2))
      .attr("text-anchor", "middle")
      .style("visibility", showLabels ? "visible" : "hidden")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      node
        .attr("transform", d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => simulation.stop();
  }, [nodes, edges, clusterByTribe, showLabels]);

  // Handle highlights and Focus Mode
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    
    // Focus logic
    const isFocused = hoveredId !== null;
    
    svg.selectAll("g.node-group").attr("opacity", d => {
      if (!isFocused) return 1;
      const isConnected = edges.some(e => 
        (e.source.id === hoveredId && e.target.id === d.id) || 
        (e.target.id === hoveredId && e.source.id === d.id) ||
        d.id === hoveredId
      );
      return isConnected ? 1 : 0.15;
    });

    svg.selectAll("circle")
      .transition().duration(200)
      .attr("stroke", d => (hoveredId === d.id || selectedNode?.id === d.id) ? "var(--text-primary)" : "var(--bg-canvas)")
      .attr("stroke-width", d => (hoveredId === d.id || selectedNode?.id === d.id) ? 3 : 2);

    svg.selectAll("line")
      .transition().duration(200)
      .attr("stroke-opacity", d => {
        if (!isFocused) return 0.1 + (d.strength * 0.05);
        const isRelevant = d.source.id === hoveredId || d.target.id === hoveredId;
        return isRelevant ? 0.8 : 0.05;
      })
      .attr("stroke-width", d => {
        const base = Math.sqrt(d.strength) * 2;
        if (!isFocused) return base;
        const isRelevant = d.source.id === hoveredId || d.target.id === hoveredId;
        return isRelevant ? base * 1.5 : base;
      });
  }, [hoveredId, selectedNode, edges]);

  return <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />;
}
