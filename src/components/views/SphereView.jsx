import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { TRIBES, MANIPULATION_TYPES, BIBLICAL_PRINCIPLES } from "../../constants/data";

export function SphereView({ nodes, edges, selectedNode, hoveredId, onNodeClick, onNodeHover }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const groupRef = useRef(null);
  const meshesRef = useRef({});
  const edgeLinesRef = useRef([]);
  const frameRef = useRef(null);
  const autoRotateRef = useRef(true);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouse3DRef = useRef(new THREE.Vector2());

  useEffect(() => {
    if (!mountRef.current) return;
    const W = mountRef.current.clientWidth;
    const H = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
    camera.position.set(0, 0, 16);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.setClearColor(0x00000, 0);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1200;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 120;
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.06, transparent: true, opacity: 0.5 });
    scene.add(new THREE.Points(starGeo, starMat));

    // Nodes (Spherical distribution)
    nodes.forEach((node, i) => {
      const phi = Math.acos(-1 + (2 * i) / nodes.length);
      const theta = Math.sqrt(nodes.length * Math.PI) * phi;
      const r = 5;
      const x = r * Math.cos(theta) * Math.sin(phi);
      const y = r * Math.sin(theta) * Math.sin(phi);
      const z = r * Math.cos(phi);

      const color = new THREE.Color(TRIBES[node.tribe].color);
      const geo = new THREE.SphereGeometry(0.22, 32, 32);
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9 });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, z);
      mesh.userData = { nodeId: node.id };
      group.add(mesh);
      meshesRef.current[node.id] = mesh;

      const ringGeo = new THREE.RingGeometry(0.28, 0.34, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(x, y, z);
      group.add(ring);
    });

    // Edges
    edges.forEach((edge) => {
      const srcNode = nodes.find(n => n.id === edge.source);
      const tgtNode = nodes.find(n => n.id === edge.target);
      if (!srcNode || !tgtNode) return;

      const srcIdx = nodes.indexOf(srcNode);
      const tgtIdx = nodes.indexOf(tgtNode);

      const getPos = (i) => {
        const phi = Math.acos(-1 + (2 * i) / nodes.length);
        const theta = Math.sqrt(nodes.length * Math.PI) * phi;
        const r = 5;
        return new THREE.Vector3(
          r * Math.cos(theta) * Math.sin(phi),
          r * Math.sin(theta) * Math.sin(phi),
          r * Math.cos(phi)
        );
      };

      const points = [getPos(srcIdx), getPos(tgtIdx)];
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

    let t = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      t += 0.005;
      if (autoRotateRef.current) {
        group.rotation.y += 0.0015;
        group.rotation.x = Math.sin(t * 0.3) * 0.04;
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (mountRef.current) mountRef.current.removeChild(renderer.domElement);
    };
  }, [nodes, edges]);

  // Update opacity based on hover/selection
  useEffect(() => {
    Object.entries(meshesRef.current).forEach(([id, mesh]) => {
      const isVisible = nodes.some(n => n.id === id);
      mesh.visible = isVisible;
      if (isVisible) {
        mesh.material.opacity = (hoveredId === id || selectedNode?.id === id) ? 1 : 0.8;
      }
    });

    edgeLinesRef.current.forEach(line => {
      const { source, target } = line.userData.edgeData;
      const isVisible = nodes.some(n => n.id === source) && nodes.some(n => n.id === target);
      line.visible = isVisible;
      if (isVisible) {
        line.material.opacity = (hoveredId === source || hoveredId === target) ? 0.55 : 0.18;
      }
    });
  }, [nodes, hoveredId, selectedNode]);

  const handleMouseDown = (e) => {
    autoRotateRef.current = false;
    const startX = e.clientX, startY = e.clientY;
    
    const onMove = (e2) => {
      if (groupRef.current) {
        groupRef.current.rotation.y += (e2.clientX - startX) * 0.0001;
        groupRef.current.rotation.x += (e2.clientY - startY) * 0.0001;
      }
    };
    
    const onUp = (e2) => {
      if (Math.abs(e2.clientX - startX) < 5 && Math.abs(e2.clientY - startY) < 5) {
        // Handle click
        const rect = mountRef.current.getBoundingClientRect();
        mouse3DRef.current.x = ((e2.clientX - rect.left) / rect.width) * 2 - 1;
        mouse3DRef.current.y = -((e2.clientY - rect.top) / rect.height) * 2 + 1;
        
        if (cameraRef.current) {
          raycasterRef.current.setFromCamera(mouse3DRef.current, cameraRef.current);
          const hits = raycasterRef.current.intersectObjects(Object.values(meshesRef.current));
          if (hits.length > 0) onNodeClick(nodes.find(n => n.id === hits[0].object.userData.nodeId));
          else onNodeClick(null);
        }
      }
      setTimeout(() => autoRotateRef.current = true, 2000);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const handleMouseMove = (e) => {
    if (!mountRef.current || !cameraRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    mouse3DRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse3DRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycasterRef.current.setFromCamera(mouse3DRef.current, cameraRef.current);
    const hits = raycasterRef.current.intersectObjects(Object.values(meshesRef.current));
    if (hits.length > 0) onNodeHover(hits[0].object.userData.nodeId);
    else onNodeHover(null);
  };

  return (
    <div 
      ref={mountRef} 
      style={{ width: "100%", height: "100%", cursor: "grab" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    />
  );
}
