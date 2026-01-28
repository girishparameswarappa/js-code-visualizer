# JS Code Visualizer

An interactive JavaScript code execution visualizer with step-by-step debugging, variable inspection, call stack display, and recursion tree visualization.

## Features

- **Step-by-step execution**: Watch your JavaScript code execute line by line
- **Variable inspection**: See all variables and their values in each scope
- **Call stack display**: Visualize the function call stack in real-time
- **Recursion tree**: D3.js-powered tree visualization for recursive function calls
- **Array visualization**: Toggle between bar chart and indexed box views
- **Preset examples**: Bubble sort, merge sort, quicksort, binary search, fibonacci, factorial, tree traversal
- **Custom code**: Write and visualize your own JavaScript code
- **Responsive design**: Works on desktop and mobile devices
- **Backward stepping**: Navigate back through execution history (up to 10,000 steps)

## Getting Started

### Prerequisites

- Node.js >= 18.x
- npm >= 9.x

### Installation

```bash
cd js-code-visualizer
npm install
```

### Development

```bash
# Start webpack in watch mode
npm run dev

# In another terminal, start the dev server
npm run start
```

### Production Build

```bash
npm run build
```

### Deploy to GitHub Pages

```bash
npm run deploy
```

## Usage

1. Select a preset algorithm from the dropdown, or toggle to "Custom Code" mode
2. Click **Run** to start execution
3. Use playback controls:
   - ⏮️ Step backward
   - ⏸️ Pause / ▶️ Play
   - ⏭️ Step forward
   - 🔄 Reset
4. Adjust speed with the slider
5. Watch the visualization panels update in real-time

## Architecture

```
src/
├── js/
│   ├── app.js                 # Main orchestrator
│   ├── interpreter/
│   │   ├── secureInterpreter.js   # Sandboxed JS execution
│   │   ├── stateCapture.js        # State extraction & history
│   │   └── recursionTracker.js    # Call tree builder
│   ├── visualization/
│   │   ├── renderer.js            # Canvas rendering
│   │   ├── treeRenderer.js        # D3 recursion tree
│   │   └── animator.js            # Playback controls
│   └── ui/
│       ├── codeEditor.js          # CodeMirror integration
│       ├── presets.js             # Example algorithms
│       └── controls.js            # UI control handlers
└── css/
    ├── styles.css                 # Main styles
    └── responsive.css             # Mobile breakpoints
```

## Technologies

- **Execution**: js-interpreter, acorn, @babel/standalone
- **Editor**: CodeMirror 6
- **Visualization**: Canvas API, D3.js
- **Build**: Webpack 5
- **Deployment**: GitHub Pages

## Security

User code runs in a sandboxed js-interpreter environment with:
- No access to DOM, network, or file system
- Execution limited to 100,000 steps
- Stack size monitoring
- Only `console.log` exposed

## License

MIT
