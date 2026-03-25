import React, { useMemo, useRef, useEffect } from "react";
import * as d3 from "d3";
import { TRIBES } from "../../constants/data";

export function TimelineView({ nodes, selectedNode, onNodeClick, onNodeHover, hoveredId }) {
  const svgRef = useRef(null);

  const sortedNodes = useMemo(() => {
    return [...nodes].sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [nodes]);

  const EVENTS = [
    { date: "2023-10-07", label: "Oct 7 Attack" },
    { date: "2023-11-24", label: "Truce" },
    { date: "2024-01-26", label: "ICJ Ruling" },
    { date: "2024-04-01", label: "WCK Strike" },
  ];

  useEffect(() => {
    if (!svgRef.current) return;
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;
    const margin = { top: 60, right: 60, bottom: 80, left: 80 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // X Scale (Time)
    const timeExtent = d3.extent(sortedNodes, d => new Date(d.date));
    const start = new Date(timeExtent[0] || "2023-10-01"); start.setMonth(start.getMonth() - 1);
    const end = new Date(timeExtent[1] || "2024-05-01"); end.setMonth(end.getMonth() + 1);

    const xScale = d3.scaleTime()
      .domain([start, end])
      .range([0, chartWidth]);

    // Y Scale (Locus Score 1-5)
    const yScale = d3.scaleLinear()
      .domain([0, 5])
      .range([chartHeight, 0]);

    // Density Histogram Calculation
    const histogram = d3.bin()
      .value(d => new Date(d.date))
      .domain(xScale.domain())
      .thresholds(xScale.ticks(d3.timeMonth.every(1)));

    const bins = histogram(sortedNodes);
    const yHist = d3.scaleLinear()
      .domain([0, d3.max(bins, d => d.length)])
      .range([chartHeight, chartHeight - 100]);

    // Draw Histogram
    g.append("path")
      .datum(bins)
      .attr("fill", "var(--accent)")
      .attr("fill-opacity", 0.05)
      .attr("d", d3.area()
        .x(d => xScale(d.x0))
        .y0(chartHeight)
        .y1(d => yHist(d.length))
        .curve(d3.curveBasis)
      );

    // Grid lines (Horizontal for Locus)
    g.selectAll(".gridline")
      .data([1, 2, 3, 4, 5])
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "var(--border)")
      .attr("stroke-dasharray", "4,4")
      .attr("stroke-width", 0.5);

    // Event Markers
    const eventG = g.selectAll(".event")
      .data(EVENTS)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${xScale(new Date(d.date))},0)`);

    eventG.append("line")
      .attr("y1", -20)
      .attr("y2", chartHeight)
      .attr("stroke", "var(--text-tertiary)")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    eventG.append("text")
      .attr("y", -25)
      .attr("text-anchor", "middle")
      .attr("fill", "var(--text-tertiary)")
      .attr("font-size", "9px")
      .attr("font-family", "var(--font-display)")
      .text(d => d.label);

    // Axes
    const xAxis = d3.axisBottom(xScale).ticks(d3.timeMonth.every(1)).tickFormat(d3.timeFormat("%b %y"));
    const yAxis = d3.axisLeft(yScale).ticks(5).tickFormat(d => `L${d}`);

    g.append("g")
      .attr("transform", `translate(0,${chartHeight + 10})`)
      .call(xAxis)
      .selectAll("text")
      .attr("fill", "var(--text-secondary)")
      .attr("font-size", "10px");

    g.append("g")
      .attr("transform", "translate(-10,0)")
      .call(yAxis)
      .selectAll("text")
      .attr("fill", "var(--text-secondary)")
      .attr("font-size", "10px");

    g.selectAll(".domain, .tick line").attr("stroke", "var(--border)");

    // Axis Labels
    g.append("text")
      .attr("x", -margin.left + 15)
      .attr("y", -10)
      .attr("fill", "var(--text-tertiary)")
      .attr("font-size", "9px")
      .attr("text-transform", "uppercase")
      .text("Structural Locus");

    // Nodes
    const nodeG = g.selectAll(".node")
      .data(sortedNodes)
      .enter()
      .append("g")
      .attr("transform", d => `translate(${xScale(new Date(d.date))},${yScale(d.plumb.locus)})`)
      .attr("cursor", "pointer")
      .on("click", (event, d) => onNodeClick(d))
      .on("mouseenter", (event, d) => onNodeHover(d.id))
      .on("mouseleave", () => onNodeHover(null));

    nodeG.append("circle")
      .attr("r", 8)
      .attr("class", d => `node-circle-${d.id}`)
      .attr("fill", d => TRIBES[d.tribe].color)
      .attr("stroke", "var(--bg-canvas)")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.7);

  }, [sortedNodes, width]);

  // Handle highlights
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("circle")
      .transition().duration(200)
      .attr("r", d => (hoveredId === d.id || selectedNode?.id === d.id) ? 14 : 10)
      .attr("stroke", d => (hoveredId === d.id || selectedNode?.id === d.id) ? "var(--text-primary)" : "var(--bg-canvas)")
      .attr("opacity", d => (hoveredId === d.id || selectedNode?.id === d.id) ? 1 : 0.8);
  }, [hoveredId, selectedNode]);

  return <svg ref={svgRef} style={{ width: "100%", height: "100%" }} />;
}
