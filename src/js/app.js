/**
 * JS Code Visualizer - Main Application
 * Orchestrates all modules for step-by-step JavaScript execution visualization
 */

import '../css/styles.css';
import '../css/responsive.css';

import { SecureInterpreter } from './interpreter/secureInterpreter.js';
import { StateCapture } from './interpreter/stateCapture.js';
import { RecursionTracker } from './interpreter/recursionTracker.js';
import { Renderer } from './visualization/renderer.js';
import { TreeRenderer } from './visualization/treeRenderer.js';
import { Animator } from './visualization/animator.js';
import { CodeEditor } from './ui/codeEditor.js';
import { Controls } from './ui/controls.js';
import { getPreset, isCustomPreset } from './ui/presets.js';
import { PerformanceAnalyzer } from './analysis/performanceAnalyzer.js';
import { ExecutionManager } from './executionManager.js';
import { VisualizationManager } from './visualizationManager.js';

class App {
  constructor() {
    this.modules = {};
    this.currentPreset = 'bubble-sort';
    this.isCustomMode = false;

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    try {
      this.initModules();
      this.initManagers();
      this.loadPreset(this.currentPreset);
    } catch (error) {
      console.error('Initialization error:', error);
      this.showError('Failed to initialize: ' + error.message);
    }
  }

  initModules() {
    this.modules.interpreter = new SecureInterpreter({
      maxSteps: 100000,
      maxStackSize: 10000,
      onOutput: (output) => this.handleOutput(output),
      onError: (error) => this.handleError(error)
    });

    this.modules.stateCapture = new StateCapture({
      maxHistory: 10000,
      onHistoryLimitReached: (limit) => {
        this.modules.controls?.showToast(`History limit reached (${limit} steps)`, 'warning');
      }
    });

    this.modules.recursionTracker = new RecursionTracker();
    this.modules.performanceAnalyzer = new PerformanceAnalyzer();

    this.modules.renderer = new Renderer({
      variablesContainer: document.getElementById('variables-container'),
      callstackContainer: document.getElementById('callstack-container'),
      arrayCanvas: document.getElementById('array-canvas')
    });

    const treeContainer = document.getElementById('tree-container');
    if (treeContainer) {
      this.modules.treeRenderer = new TreeRenderer(treeContainer);
    }

    this.modules.animator = new Animator({
      speed: 500,
      onStep: () => this.executionManager?.executeStep(),
      onStateChange: (state) => this.handleAnimatorStateChange(state),
      onComplete: () => this.handleExecutionComplete(),
      onError: (error) => this.handleError(error.message)
    });

    const editorContainer = document.getElementById('code-editor');
    if (editorContainer) {
      this.modules.codeEditor = new CodeEditor(editorContainer, {
        initialCode: '// Select a preset or write your own code',
        onChange: () => {}
      });
    }

    this.modules.controls = new Controls({
      onPresetChange: (preset) => this.loadPreset(preset),
      onReset: () => this.executionManager?.reset(),
      onStepBack: () => this.executionManager?.stepBack(),
      onPlayPause: () => this.executionManager?.togglePlayPause(),
      onStepForward: () => this.executionManager?.stepForward(),
      onSpeedChange: (speed) => this.executionManager?.setSpeed(speed),
      onTurboToggle: (enabled) => this.executionManager?.setTurbo(enabled),
      onArrayViewChange: (view) => this.visualizationManager?.setArrayView(view),
      onClearConsole: () => {}
    });
  }

  initManagers() {
    this.visualizationManager = new VisualizationManager({
      renderer: this.modules.renderer,
      treeRenderer: this.modules.treeRenderer,
      codeEditor: this.modules.codeEditor,
      controls: this.modules.controls,
      stateCapture: this.modules.stateCapture,
      recursionTracker: this.modules.recursionTracker,
      interpreter: this.modules.interpreter,
      performanceAnalyzer: this.modules.performanceAnalyzer
    });

    this.executionManager = new ExecutionManager({
      interpreter: this.modules.interpreter,
      stateCapture: this.modules.stateCapture,
      recursionTracker: this.modules.recursionTracker,
      animator: this.modules.animator,
      performanceAnalyzer: this.modules.performanceAnalyzer,
      codeEditor: this.modules.codeEditor,
      controls: this.modules.controls,
      onVisualizationUpdate: (snapshot) => this.visualizationManager.updateVisualizations(snapshot),
      onExecutionComplete: () => this.handleExecutionComplete()
    });
  }

  loadPreset(presetKey) {
    const preset = getPreset(presetKey);
    if (!preset) return;

    this.currentPreset = presetKey;
    this.isCustomMode = isCustomPreset(presetKey);

    if (this.modules.codeEditor) {
      this.modules.codeEditor.setValue(preset.code);
      this.modules.codeEditor.setReadOnly(false);
    }

    this.executionManager?.reset();
    this.visualizationManager?.clearPerformancePanel();
    this.modules.controls?.setPreset(presetKey);
  }

  handleAnimatorStateChange(state) {
    const statusMap = {
      'playing': ['Running', 'running', true],
      'paused': ['Paused', 'paused', false],
      'completed': ['Completed', 'completed', false],
      'stopped': ['Ready', 'default', false],
      'reset': ['Ready', 'default', false]
    };

    const [status, type, isPlaying] = statusMap[state.state] || ['Ready', 'default', false];
    this.modules.controls?.setPlayState(isPlaying);
    this.modules.controls?.setStatus(status, type);
  }

  handleExecutionComplete() {
    this.modules.controls?.setStatus('Completed', 'completed');
    this.modules.controls?.showToast('Execution completed!', 'success');
    this.visualizationManager?.updateExecutionMetrics();

    const code = this.modules.codeEditor?.getValue() || '';
    if (this.modules.performanceAnalyzer) {
      const timeAnalysis = this.modules.performanceAnalyzer.analyzeTimeComplexity(code);
      const spaceAnalysis = this.modules.performanceAnalyzer.analyzeSpaceComplexity(code);
      this.visualizationManager?.updatePerformancePanel(timeAnalysis, spaceAnalysis, code);
    }
  }

  handleOutput(output) {
    this.modules.controls?.addConsoleOutput(output.message, output.type);
  }

  handleError(errorMessage) {
    console.error('Execution error:', errorMessage);
    this.modules.controls?.setStatus('Error', 'error');
    this.modules.controls?.addConsoleOutput(errorMessage, 'error');
    this.modules.controls?.showToast(errorMessage, 'error', 6000);
    
    this.modules.animator?.stop();
    this.modules.codeEditor?.setReadOnly(false);
  }

  showError(message) {
    this.modules.controls?.showToast(message, 'error', 6000) || alert(message);
  }
}

const app = new App();
window.app = app;

export default app;
