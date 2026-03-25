# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # Production build → dist/
npm run lint     # ESLint (flat config)
npm run preview  # Preview production build locally
```

No test framework is configured.

## Architecture

**Stack:** React 19 + Three.js + Vite. No TypeScript, no component library, no routing, no backend — purely client-side SPA.

**Entry point:** `src/App.jsx` → renders `src/components/PlumbLineObservatory.jsx`, which is the entire application in a single large component file.

### PlumbLineObservatory.jsx

Everything lives here: data definitions, 3D rendering, state management, and all UI. Key sections:

- **Static data** at the top of the file: `NODES` (13 discourse analysis cases), `TRIBES` (RIGHT/LEFT/RELIGION/GEOPOLITICS color mapping), `MANIPULATION_TYPES`, `BIBLICAL_PRINCIPLES`
- **Edges** built dynamically from shared manipulation types and biblical principles between nodes
- **Three.js canvas** rendered imperatively via `useEffect` with `useRef` — not via React-Three-Fiber. The canvas handles: force-directed node positioning on a sphere (golden spiral), star field, glow spheres, halo rings, connecting lines, mouse drag/zoom/click/hover
- **React state**: `selectedNode`, `hoveredId`, `activeFilters`, `loaded`
- **UI overlays** rendered as React JSX over the canvas: header, left sidebar (filters), right panel (node details), hover tooltip

### Styling

All styles are inline React `style` props — no CSS modules, no Tailwind. Global styles in `src/index.css` (dark background, full-viewport body). `src/App.css` is minimal.

### Data Model

Each node has:
- `manipulation[]` — array of manipulation pattern keys (AFAFF, MOTIVE, SCALE, URGENCY, ASYM, CATEGORY, FLUENCY)
- `biblical[]` — array of biblical principle keys (IMAGO, PROPHETIC, STRUCTURAL, LIBERTY, JUBILEE, GREAT, GER)
- `plumb{}` — scores 1–5 for: process, locus, uplift, means, blueprint
- `tribe` — one of the four tribe keys (determines node color)

Edges are computed at render time — two nodes are connected if they share at least one manipulation type or biblical principle.

## Deployment

Vercel — automatic deploy on push to `main`.
