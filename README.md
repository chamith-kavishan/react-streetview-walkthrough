## React 360° Street View Walkthrough

A small React app that demonstrates a Google Maps Street View–style 360° walkthrough using [Photo Sphere Viewer](https://photo-sphere-viewer.js.org/) and its Virtual Tour plugin.

This standalone project mirrors the walkthrough logic from your main Lotus project, but uses the public Key Biscayne demo panoramas provided by Photo Sphere Viewer.

---

### Features

- **Full‑screen 360° viewer** (no modal, fills the page)
- **Virtual tour navigation** with arrows between multiple panorama nodes
- **Data‑driven configuration** for panoramas and links (`walkthroughConfig.js`)
- **React-friendly wrapper** (`Walkthrough.jsx`) around Photo Sphere Viewer’s Virtual Tour plugin

---

### Tech stack

- React (JavaScript, via Vite)
- `react-photo-sphere-viewer`
- `@photo-sphere-viewer/virtual-tour-plugin`

---

### Getting started

```bash
git clone <this-repo-url>
cd walkthrough-streetview-clone
npm install
npm run dev
```

Then open the printed local URL (usually `http://localhost:5173`) in your browser.

---

### Key files

- `src/Walkthrough.jsx`  
  React component that:
  - Instantiates the Photo Sphere Viewer instance
  - Configures and attaches the Virtual Tour plugin
  - Builds nodes from the config and wires up zoom / transitions

- `src/walkthroughConfig.js`  
  Data model for the tour:
  - `images`: list of panorama URLs
  - `nodeConfigs`: per‑image navigation config (`targetNodeIds`, arrow positions, optional camera data)

- `src/App.jsx`  
  Minimal shell that renders the `Walkthrough` full‑screen.

---

### How the tour works (high level)

1. **Data layer** (`walkthroughConfig.js`) defines:
   - Which panoramas exist
   - How they are connected (graph of nodes with links)
2. **Viewer setup** (`Walkthrough.jsx`):
   - Renders `ReactPhotoSphereViewer`
   - On `onReady`, converts the config into Virtual Tour `nodes`
   - Calls `virtualTour.setNodes(nodes)` to register the graph
3. **Navigation**:
   - Clicking arrows moves between nodes
   - Custom logic resets zoom and (optionally) adjusts yaw when transitioning

This structure makes it easy to later swap in your own 360° images or change the node graph without touching the viewer logic.

---

### Adapting for your own images

To plug in your own panoramas:

1. Replace the URLs in `images` inside `src/walkthroughConfig.js` with your own 360° images.
2. Adjust `nodeConfigs` so that:
   - Each entry corresponds to one image (same index)
   - `targetNodeIds` refer to other image indexes
   - `arrowPositions` place navigation arrows in sensible positions for that panorama
3. (Optional) Add `cameraPosition` and `transitionYaws` to fine‑tune camera orientation between nodes.

---

### License / assets

The Key Biscayne panoramas used here come from the official Photo Sphere Viewer demo and are not owned by this repository’s author. They are used purely for demonstration. For production, replace them with your own licensed 360° images.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
