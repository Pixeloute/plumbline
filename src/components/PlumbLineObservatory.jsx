import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";

// ─── DATA ────────────────────────────────────────────────────────────────────

const MANIPULATION_TYPES = {
  AFAFF: { label: "Accurate Facts, False Framework", color: "#f59e0b", short: "AFAFF" },
  MOTIVE: { label: "Motive Substitution", color: "#ef4444", short: "Motive Sub." },
  SCALE: { label: "Scale Elision", color: "#8b5cf6", short: "Scale Elision" },
  URGENCY: { label: "Civilisational Urgency Bypass", color: "#f97316", short: "Urgency Bypass" },
  ASYM: { label: "Asymmetric Evidence Standards", color: "#06b6d4", short: "Asym. Evidence" },
  CATEGORY: { label: "Category Expansion", color: "#10b981", short: "Category Expand." },
  FLUENCY: { label: "Fluency Without Transformation", color: "#ec4899", short: "Fluency w/o Change" },
};

const BIBLICAL_PRINCIPLES = {
  IMAGO: { label: "Imago Dei", color: "#fbbf24" },
  PROPHETIC: { label: "Prophetic Precision", color: "#a78bfa" },
  STRUCTURAL: { label: "Structural Sin", color: "#34d399" },
  LIBERTY: { label: "Religious Liberty", color: "#60a5fa" },
  JUBILEE: { label: "Jubilee Economics", color: "#fb7185" },
  GREAT: { label: "Great Controversy", color: "#f472b6" },
  GER: { label: "Ger / Hospitality", color: "#4ade80" },
};

const TRIBES = {
  RIGHT: { label: "Right-leaning Source", color: "#ef4444" },
  LEFT: { label: "Left-leaning Source", color: "#3b82f6" },
  RELIGION: { label: "Religious Sphere", color: "#f59e0b" },
  GEOPOLITICS: { label: "Geopolitics", color: "#8b5cf6" },
};

const NODES = [
  {
    id: "ice-airports",
    label: "ICE Airport\nDeployment",
    shortLabel: "ICE Airports",
    tribe: "RIGHT",
    manipulation: ["AFAFF", "MOTIVE"],
    biblical: ["IMAGO", "GER"],
    plumb: { process: 2, locus: 2, uplift: 1, means: 2, blueprint: 2 },
    summary: "Conservative commentary on ICE agents at airports during TSA shutdown. Tribal epistemology used by both sides to avoid structural accountability.",
    verdict: "Both sides deployed real grievances to evade structural responsibility.",
  },
  {
    id: "dhs-shutdown",
    label: "DHS Shutdown\nDebate",
    shortLabel: "DHS Shutdown",
    tribe: "RIGHT",
    manipulation: ["AFAFF", "URGENCY", "MOTIVE"],
    biblical: ["PROPHETIC", "STRUCTURAL"],
    plumb: { process: 2, locus: 1, uplift: 2, means: 2, blueprint: 1 },
    summary: "Right-wing commentary on partial DHS funding shutdown. Civilisational urgency deployed to bypass scrutiny of Republican procedural consistency.",
    verdict: "Accurate diagnosis of Democrat overreach; silent on Republican blocking of standalone TSA bills.",
  },
  {
    id: "estate-tax",
    label: "NY Estate\nTax Proposal",
    shortLabel: "Estate Tax",
    tribe: "RIGHT",
    manipulation: ["SCALE", "MOTIVE"],
    biblical: ["JUBILEE", "STRUCTURAL"],
    plumb: { process: 3, locus: 1, uplift: 2, means: 2, blueprint: 2 },
    summary: "NY mayoral candidate's estate tax proposal debated. Both the proposal and its critics avoid the structural question: why do modest homes cost estate-tax-level money?",
    verdict: "Debating wealth transfer at death avoids the Jubilee question of why wealth concentrates this way at all.",
  },
  {
    id: "un-veto",
    label: "UN Security\nCouncil Veto",
    shortLabel: "UN Veto System",
    tribe: "GEOPOLITICS",
    manipulation: ["AFAFF", "SCALE"],
    biblical: ["PROPHETIC", "STRUCTURAL", "GREAT"],
    plumb: { process: 1, locus: 1, uplift: 1, means: 2, blueprint: 1 },
    summary: "Video arguing UN veto system was designed by colonial powers to protect economic interests. Strong structural diagnosis, imprecise supporting claims.",
    verdict: "Structural diagnosis strong. Specific figures embellished. The architecture of empire embedded in post-war institutions.",
  },
  {
    id: "michigan-election",
    label: "Michigan\nElection Claims",
    shortLabel: "Michigan Election",
    tribe: "RIGHT",
    manipulation: ["AFAFF", "ASYM", "CATEGORY"],
    biblical: ["PROPHETIC", "LIBERTY"],
    plumb: { process: 2, locus: 1, uplift: 1, means: 2, blueprint: 1 },
    summary: "Claims about Michigan ballot irregularities. Real voter-roll failures leveraged into broad disenfranchisement framework. Scale elision and asymmetric evidence standards throughout.",
    verdict: "Real systemic failures used to build an access-restriction architecture that harms the voters it claims to protect.",
  },
  {
    id: "christian-nationalism",
    label: "UK Christian\nNationalism",
    shortLabel: "Christian Nationalism",
    tribe: "RELIGION",
    manipulation: ["FLUENCY", "URGENCY"],
    biblical: ["LIBERTY", "GREAT", "PROPHETIC"],
    plumb: { process: 1, locus: 2, uplift: 1, means: 1, blueprint: 1 },
    summary: "UK speaker advocating blasphemy laws, mandatory Christianity, inquisition to purge heretics. Classic church-state fusion — the prophetic warning made visible.",
    verdict: "The Revelation 13 architecture in a British accent. Power-seeking through legal coercion is not the kingdom; it is its counterfeit.",
  },
  {
    id: "iran-operation",
    label: "Operation\nEpic Fury",
    shortLabel: "Iran Operation",
    tribe: "GEOPOLITICS",
    manipulation: ["MOTIVE", "SCALE", "URGENCY"],
    biblical: ["PROPHETIC", "GREAT", "STRUCTURAL"],
    plumb: { process: 1, locus: 1, uplift: 1, means: 1, blueprint: 1 },
    summary: "Analysis of US military strikes on Iran. Strong financial analysis, no moral floor. AI integrated into lethal targeting. Anthropic penalised for maintaining ethical constraints.",
    verdict: "Digital and physical warfare domains merging. The successor question: what precedent does this leave for the next administration?",
  },
  {
    id: "liberal-hypocrisy",
    label: "Democratic\nTax Policy",
    shortLabel: "Dem Tax Policy",
    tribe: "RIGHT",
    manipulation: ["AFAFF", "CATEGORY", "MOTIVE"],
    biblical: ["JUBILEE", "STRUCTURAL", "PROPHETIC"],
    plumb: { process: 3, locus: 1, uplift: 2, means: 3, blueprint: 2 },
    summary: "Commentary on Democratic internal tensions and California/NY tax policy. Real data on revenue concentration among top earners weaponised to resist structural redistribution.",
    verdict: "Productivity conflated with compensation. The framework protects concentration while appearing to defend the entrepreneurial class.",
  },
  {
    id: "wes-huff",
    label: "Wes Huff /\nState of Dead",
    shortLabel: "State of Dead",
    tribe: "RELIGION",
    manipulation: ["FLUENCY"],
    biblical: ["PROPHETIC", "GREAT"],
    plumb: { process: 4, locus: 3, uplift: 3, means: 3, blueprint: 3 },
    summary: "Wes Huff's apologetics interview missed soul sleep, annihilationism, and Great Controversy framework on the problem of evil. Platonic immortality embedded in mainstream Christian assumptions.",
    verdict: "Fluent in defending Christianity; insufficient on state of the dead. The Lazarus argument closes the case biblically.",
  },
  {
    id: "british-identity",
    label: "British Identity\nDebate",
    shortLabel: "British Identity",
    tribe: "RIGHT",
    manipulation: ["AFAFF", "CATEGORY"],
    biblical: ["GER", "IMAGO", "PROPHETIC"],
    plumb: { process: 3, locus: 2, uplift: 1, means: 2, blueprint: 2 },
    summary: "Birbalsingh vs Tomlinson on national identity. Tomlinson conflates heritage with lineage, commits gender analogy fallacy. Birbalsingh's school outcomes challenge his premise.",
    verdict: "Covenant, not genealogy, is the biblical criterion. Ruth, the Exodus mixed multitude, Isaiah 56.",
  },
  {
    id: "voter-fraud",
    label: "Voter Registration\nFraud",
    shortLabel: "Voter Fraud",
    tribe: "RIGHT",
    manipulation: ["AFAFF", "MOTIVE", "SCALE"],
    biblical: ["PROPHETIC", "IMAGO"],
    plumb: { process: 2, locus: 1, uplift: 1, means: 2, blueprint: 1 },
    summary: "Undercover footage of petition fraud. Central self-refutation: San Francisco footage showed fraud by billionaire-backed operatives opposing wealth tax — contradicting the video's own premise.",
    verdict: "The most dangerous manipulation uses evidence that disproves its own conclusion. The system protects those whose fraud wasn't named.",
  },
  {
    id: "ndtv-violence",
    label: "Neil deGrasse\nTyson on Violence",
    shortLabel: "NDT Violence",
    tribe: "GEOPOLITICS",
    manipulation: ["AFAFF", "SCALE"],
    biblical: ["IMAGO", "STRUCTURAL", "PROPHETIC"],
    plumb: { process: 3, locus: 3, uplift: 3, means: 2, blueprint: 3 },
    summary: "Tyson correctly identifies violence as internal to human nature, then spends the rest blaming the containers. Conversation and coexistence require a theological foundation science cannot generate.",
    verdict: "The older diagnosis is what Scripture calls sin. The solution Tyson cannot reach from where he's standing is the image of God.",
  },
  {
    id: "pa-terrorism",
    label: "PA Terrorism /\nImmigration Framing",
    shortLabel: "PA Terrorism",
    tribe: "RIGHT",
    manipulation: ["AFAFF", "CATEGORY", "MOTIVE"],
    biblical: ["GER", "IMAGO", "PROPHETIC"],
    plumb: { process: 2, locus: 1, uplift: 1, means: 2, blueprint: 1 },
    summary: "Pennsylvania ISIS-inspired attack by American citizens framed as mass-migration problem. Both suspects are US-born suburban citizens — the mass-migration framing is self-refuted by the commentator's own facts.",
    verdict: "Category error: ISIS is theocratic, not left-wing. The framing protects a policy conclusion the evidence cannot support.",
  },
];

// ─── FORCE LAYOUT ─────────────────────────────────────────────────────────────

function buildEdges(nodes) {
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const sharedManip = a.manipulation.filter((m) => b.manipulation.includes(m));
      const sharedBiblical = a.biblical.filter((p) => b.biblical.includes(p));
      if (sharedManip.length > 0 || sharedBiblical.length > 0) {
        edges.push({
          source: a.id,
          target: b.id,
          sharedManip,
          sharedBiblical,
          strength: sharedManip.length + sharedBiblical.length,
        });
      }
    }
  }
  return edges;
}

function initPositions(nodes) {
  return nodes.map((n, i) => {
    const phi = Math.acos(-1 + (2 * i) / nodes.length);
    const theta = Math.sqrt(nodes.length * Math.PI) * phi;
    const r = 5;
    return {
      ...n,
      x: r * Math.cos(theta) * Math.sin(phi),
      y: r * Math.sin(theta) * Math.sin(phi),
      z: r * Math.cos(phi),
      vx: 0, vy: 0, vz: 0,
    };
  });
}

// ─── PLUMB SCORE DISPLAY ─────────────────────────────────────────────────────

function PlumbBar({ label, value, max = 5 }) {
  const pct = (value / max) * 100;
  const color = value <= 2 ? "#ef4444" : value === 3 ? "#f59e0b" : "#10b981";
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <span style={{ fontSize: 11, color, fontWeight: 700 }}>{value}/5</span>
      </div>
      <div style={{ height: 3, background: "#1f2937", borderRadius: 2 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

function NodePanel({ node, onClose }) {
  if (!node) return null;
  const tribe = TRIBES[node.tribe];
  return (
    <div style={{
      position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)",
      width: 320, background: "rgba(10,10,20,0.97)", border: "1px solid rgba(245,158,11,0.3)",
      borderRadius: 16, padding: "28px 24px", backdropFilter: "blur(20px)",
      boxShadow: "0 0 60px rgba(245,158,11,0.08), 0 32px 64px rgba(0,0,0,0.6)",
      zIndex: 100,
      animation: "fadeIn 0.3s ease",
    }}>
      <button onClick={onClose} style={{
        position: "absolute", top: 16, right: 16, background: "none", border: "none",
        color: "#6b7280", cursor: "pointer", fontSize: 18, lineHeight: 1,
      }}>✕</button>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: tribe.color }} />
        <span style={{ fontSize: 10, color: tribe.color, textTransform: "uppercase", letterSpacing: "0.12em" }}>{tribe.label}</span>
      </div>

      <h2 style={{ fontSize: 18, fontFamily: "'Playfair Display', Georgia, serif", color: "#f9fafb", marginBottom: 4, lineHeight: 1.3, whiteSpace: "pre-line" }}>
        {node.label}
      </h2>

      <p style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6, marginBottom: 20 }}>{node.summary}</p>

      <div style={{ borderTop: "1px solid rgba(245,158,11,0.15)", paddingTop: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Plumb Line Score</div>
        <PlumbBar label="Process" value={node.plumb.process} />
        <PlumbBar label="Locus of Benefit" value={node.plumb.locus} />
        <PlumbBar label="Uplift of Affected" value={node.plumb.uplift} />
        <PlumbBar label="Means vs Mission" value={node.plumb.means} />
        <PlumbBar label="Blueprint" value={node.plumb.blueprint} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Manipulation Patterns</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {node.manipulation.map((m) => (
            <span key={m} style={{
              fontSize: 10, padding: "3px 8px", borderRadius: 4,
              background: `${MANIPULATION_TYPES[m].color}18`,
              border: `1px solid ${MANIPULATION_TYPES[m].color}40`,
              color: MANIPULATION_TYPES[m].color,
            }}>{MANIPULATION_TYPES[m].short}</span>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Biblical Principles</div>
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

      <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)", borderRadius: 8, padding: "10px 12px" }}>
        <div style={{ fontSize: 10, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Verdict</div>
        <p style={{ fontSize: 12, color: "#d1d5db", lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{node.verdict}</p>
      </div>
    </div>
  );
}

// ─── LEGEND / FILTERS ────────────────────────────────────────────────────────

function Sidebar({ activeFilters, onToggle, visibleCount, totalCount }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div style={{
      position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)",
      width: 224, zIndex: 100,
    }}>
      <div style={{
        background: "rgba(10,10,20,0.95)", border: "1px solid rgba(245,158,11,0.2)",
        borderRadius: 14, padding: "20px 18px", backdropFilter: "blur(20px)",
        boxShadow: "0 0 40px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: collapsed ? 0 : 18 }}>
          <div>
            <div style={{ fontSize: 10, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.14em" }}>Filter</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 1 }}>{visibleCount}/{totalCount} analyses</div>
          </div>
          <button onClick={() => setCollapsed(!collapsed)} style={{
            background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 14,
          }}>{collapsed ? "▸" : "▾"}</button>
        </div>

        {!collapsed && (
          <>
            <Section title="Manipulation" items={MANIPULATION_TYPES} prefix="m_" activeFilters={activeFilters} onToggle={onToggle} />
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "12px 0" }} />
            <Section title="Biblical Lens" items={BIBLICAL_PRINCIPLES} prefix="b_" activeFilters={activeFilters} onToggle={onToggle} />
            <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "12px 0" }} />
            <Section title="Source Tribe" items={TRIBES} prefix="t_" activeFilters={activeFilters} onToggle={onToggle} />
          </>
        )}
      </div>
    </div>
  );
}

function Section({ title, items, prefix, activeFilters, onToggle }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 9, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 8 }}>{title}</div>
      {Object.entries(items).map(([key, val]) => {
        const fk = prefix + key;
        const on = activeFilters.has(fk);
        return (
          <button key={key} onClick={() => onToggle(fk)} style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            background: "none", border: "none", cursor: "pointer",
            padding: "4px 0", marginBottom: 1,
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: 2,
              background: on ? val.color : "transparent",
              border: `1.5px solid ${val.color}`,
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 10, color: on ? "#f9fafb" : "#6b7280", textAlign: "left", lineHeight: 1.3 }}>{val.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function PlumbLineObservatory() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const meshesRef = useRef({});
  const edgeLinesRef = useRef([]);
  const particlesRef = useRef(null);
  const positionsRef = useRef([]);
  const frameRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const rotationRef = useRef({ x: 0.1, y: 0 });
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const autoRotateRef = useRef(true);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouse3DRef = useRef(new THREE.Vector2());

  const [selectedNode, setSelectedNode] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [activeFilters, setActiveFilters] = useState(new Set());
  const [loaded, setLoaded] = useState(false);

  // Filtered nodes
  const visibleNodes = useCallback(() => {
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

  const toggleFilter = (key) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const W = mountRef.current.clientWidth;
    const H = mountRef.current.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    camera.position.set(0, 0, 16);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x00000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 120;
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0.5 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Nodes
    const positions = initPositions(NODES);
    positionsRef.current = positions;

    const group = new THREE.Group();
    scene.add(group);
    sceneRef.current.group = group;

    positions.forEach((p) => {
      const node = NODES.find((n) => n.id === p.id);
      const tribeColor = new THREE.Color(TRIBES[node.tribe].color);

      // Glow sphere
      const geo = new THREE.SphereGeometry(0.22, 32, 32);
      const mat = new THREE.MeshBasicMaterial({ color: tribeColor, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(p.x, p.y, p.z);
      mesh.userData = { nodeId: p.id };
      group.add(mesh);
      meshesRef.current[p.id] = mesh;

      // Halo ring
      const ringGeo = new THREE.RingGeometry(0.28, 0.34, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: tribeColor, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(p.x, p.y, p.z);
      ring.userData = { isRing: true };
      group.add(ring);
    });

    // Edges
    const edges = buildEdges(NODES);
    edges.forEach((edge) => {
      const src = positions.find((p) => p.id === edge.source);
      const tgt = positions.find((p) => p.id === edge.target);
      if (!src || !tgt) return;

      const points = [new THREE.Vector3(src.x, src.y, src.z), new THREE.Vector3(tgt.x, tgt.y, tgt.z)];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const primaryColor = edge.sharedManip.length > 0
        ? new THREE.Color(MANIPULATION_TYPES[edge.sharedManip[0]].color)
        : new THREE.Color(BIBLICAL_PRINCIPLES[edge.sharedBiblical[0]]?.color || "#ffffff");
      const mat = new THREE.LineBasicMaterial({ color: primaryColor, transparent: true, opacity: 0.18 });
      const line = new THREE.Line(geo, mat);
      line.userData = { edgeData: edge };
      group.add(line);
      edgeLinesRef.current.push(line);
    });

    // Ambient pulse particles
    const pGeo = new THREE.BufferGeometry();
    const pCount = 60;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      const phi = Math.random() * Math.PI * 2;
      const theta = Math.random() * Math.PI;
      const r = 5 + Math.random() * 3;
      pPos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
      pPos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      pPos[i * 3 + 2] = r * Math.cos(theta);
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xf59e0b, size: 0.04, transparent: true, opacity: 0.4 });
    const particles = new THREE.Points(pGeo, pMat);
    group.add(particles);
    particlesRef.current = particles;

    // Animate
    let t = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      t += 0.005;
      if (autoRotateRef.current && !isDraggingRef.current) {
        group.rotation.y += 0.0015;
        group.rotation.x = Math.sin(t * 0.3) * 0.04;
      }
      particles.rotation.y -= 0.001;
      renderer.render(scene, camera);
    };
    animate();
    setLoaded(true);

    // Resize
    const onResize = () => {
      const w = mountRef.current?.clientWidth || W;
      const h = mountRef.current?.clientHeight || H;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  // Mouse interaction
  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const onMouseDown = (e) => {
      isDraggingRef.current = false;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      autoRotateRef.current = false;
      el.style.cursor = "grabbing";

      const startX = e.clientX, startY = e.clientY;
      const onMove = (e2) => {
        const dx = e2.clientX - lastMouseRef.current.x;
        const dy = e2.clientY - lastMouseRef.current.y;
        if (Math.abs(e2.clientX - startX) > 4 || Math.abs(e2.clientY - startY) > 4) isDraggingRef.current = true;
        if (sceneRef.current?.group) {
          sceneRef.current.group.rotation.y += dx * 0.005;
          sceneRef.current.group.rotation.x += dy * 0.005;
        }
        lastMouseRef.current = { x: e2.clientX, y: e2.clientY };
      };
      const onUp = (e2) => {
        el.style.cursor = "grab";
        if (!isDraggingRef.current) {
          // Click — raycast
          const rect = el.getBoundingClientRect();
          mouse3DRef.current.x = ((e2.clientX - rect.left) / rect.width) * 2 - 1;
          mouse3DRef.current.y = -((e2.clientY - rect.top) / rect.height) * 2 + 1;
          raycasterRef.current.setFromCamera(mouse3DRef.current, cameraRef.current);
          const meshes = Object.values(meshesRef.current);
          const hits = raycasterRef.current.intersectObjects(meshes);
          if (hits.length > 0) {
            const nid = hits[0].object.userData.nodeId;
            const node = NODES.find((n) => n.id === nid);
            setSelectedNode((prev) => prev?.id === nid ? null : node);
          } else {
            setSelectedNode(null);
          }
        }
        setTimeout(() => { autoRotateRef.current = true; }, 2500);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    };

    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      mouse3DRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse3DRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycasterRef.current.setFromCamera(mouse3DRef.current, cameraRef.current);
      const meshes = Object.values(meshesRef.current);
      const hits = raycasterRef.current.intersectObjects(meshes);
      if (hits.length > 0) {
        setHoveredId(hits[0].object.userData.nodeId);
        el.style.cursor = "pointer";
      } else {
        setHoveredId(null);
        el.style.cursor = "grab";
      }
    };

    const onWheel = (e) => {
      if (cameraRef.current) {
        cameraRef.current.position.z = Math.max(8, Math.min(28, cameraRef.current.position.z + e.deltaY * 0.02));
      }
    };

    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  // Update node visibility from filters
  useEffect(() => {
    const visible = new Set(visibleNodes().map((n) => n.id));
    Object.entries(meshesRef.current).forEach(([id, mesh]) => {
      mesh.visible = visible.has(id);
      mesh.material.opacity = visible.has(id) ? (hoveredId === id ? 1 : 0.9) : 0;
    });
    edgeLinesRef.current.forEach((line) => {
      const { source, target } = line.userData.edgeData || {};
      const show = visible.has(source) && visible.has(target);
      line.visible = show;
      if (show) line.material.opacity = hoveredId === source || hoveredId === target ? 0.55 : 0.18;
    });
  }, [activeFilters, hoveredId, visibleNodes]);

  const vNodes = visibleNodes();

  return (
    <div style={{
      width: "100%", height: "100vh", background: "radial-gradient(ellipse at 40% 30%, #0a0a1a 0%, #050508 60%, #000000 100%)",
      position: "relative", overflow: "hidden", fontFamily: "'Crimson Text', Georgia, serif",
      cursor: "grab",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-50%) translateX(12px); } to { opacity: 1; transform: translateY(-50%) translateX(0); } }
        @keyframes pulseGold { 0%,100% { opacity: 0.7 } 50% { opacity: 1 } }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #374151; border-radius: 2px; }
      `}</style>

      {/* 3D Canvas */}
      <div ref={mountRef} style={{ position: "absolute", inset: 0 }} />

      {/* Header */}
      <div style={{ position: "absolute", top: 32, left: "50%", transform: "translateX(-50%)", textAlign: "center", zIndex: 10, pointerEvents: "none" }}>
        <div style={{ fontSize: 10, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 6, animation: "pulseGold 3s ease infinite" }}>
          ┄┄ Amos 7:7–8 ┄┄
        </div>
        <h1 style={{ fontSize: 28, color: "#f9fafb", fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 400, margin: 0, letterSpacing: "0.02em" }}>
          The Plumb Line Observatory
        </h1>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "6px 0 0", letterSpacing: "0.04em" }}>
          Connecting the patterns behind the narratives
        </p>
      </div>

      {/* Filters */}
      <Sidebar activeFilters={activeFilters} onToggle={toggleFilter} visibleCount={vNodes.length} totalCount={NODES.length} />

      {/* Node panel */}
      {selectedNode && <NodePanel node={selectedNode} onClose={() => setSelectedNode(null)} />}

      {/* Hover tooltip */}
      {hoveredId && !selectedNode && (() => {
        const n = NODES.find((x) => x.id === hoveredId);
        if (!n) return null;
        return (
          <div style={{
            position: "absolute", bottom: 40, left: "50%", transform: "translateX(-50%)",
            background: "rgba(10,10,20,0.95)", border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: 8, padding: "8px 16px", pointerEvents: "none", zIndex: 50,
            backdropFilter: "blur(16px)",
          }}>
            <span style={{ fontSize: 13, color: "#f9fafb", fontFamily: "'Playfair Display', serif" }}>{n.shortLabel}</span>
            <span style={{ fontSize: 11, color: "#6b7280", marginLeft: 10 }}>Click to analyse</span>
          </div>
        );
      })()}

      {/* Legend dots bottom right */}
      <div style={{
        position: "absolute", bottom: 28, right: 24, zIndex: 10,
        display: "flex", gap: 16, alignItems: "center",
      }}>
        {Object.entries(TRIBES).map(([k, v]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: v.color }} />
            <span style={{ fontSize: 9, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>{v.label}</span>
          </div>
        ))}
      </div>

      {/* Instructions */}
      {loaded && (
        <div style={{ position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 10, pointerEvents: "none" }}>
          <span style={{ fontSize: 10, color: "#374151", letterSpacing: "0.1em" }}>Drag to rotate · Scroll to zoom · Click node to analyse</span>
        </div>
      )}
    </div>
  );
}
