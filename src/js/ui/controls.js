/**
 * Controls - UI control handlers for playback and speed management
 */

import { PanelManager } from './panelManager.js';
import { KeyboardShortcuts } from './keyboardShortcuts.js';

export class Controls {
  constructor(options = {}) {
    this.elements = this.getElements();
    this.callbacks = this.setupCallbacks(options);
    this.isPlaying = false;
    this.currentSpeed = 500;
    this.panelManager = new PanelManager();
    
    this.init();
  }

  getElements() {
    return {
      presetSelect: document.getElementById('preset-select'),
      btnReset: document.getElementById('btn-reset'),
      btnStepBack: document.getElementById('btn-step-back'),
      btnPlayPause: document.getElementById('btn-play-pause'),
      btnStepForward: document.getElementById('btn-step-forward'),
      speedSlider: document.getElementById('speed-slider'),
      speedValue: document.getElementById('speed-value'),
      turboToggle: document.getElementById('turbo-toggle'),
      currentStep: document.getElementById('current-step'),
      totalSteps: document.getElementById('total-steps'),
      executionStatus: document.getElementById('execution-status'),
      clearConsole: document.getElementById('clear-console'),
      consoleOutput: document.getElementById('console-output'),
      arrayViewBars: document.getElementById('array-view-bars'),
      arrayViewBoxes: document.getElementById('array-view-boxes'),
      toastContainer: document.getElementById('toast-container')
    };
  }

  setupCallbacks(options) {
    return {
      onPresetChange: options.onPresetChange || (() => {}),
      onReset: options.onReset || (() => {}),
      onStepBack: options.onStepBack || (() => {}),
      onPlayPause: options.onPlayPause || (() => {}),
      onStepForward: options.onStepForward || (() => {}),
      onSpeedChange: options.onSpeedChange || (() => {}),
      onTurboToggle: options.onTurboToggle || (() => {}),
      onArrayViewChange: options.onArrayViewChange || (() => {}),
      onClearConsole: options.onClearConsole || (() => {})
    };
  }

  init() {
    this.setupPresetSelect();
    this.setupPlaybackControls();
    this.setupSpeedControls();
    this.setupArrayViewToggle();
    this.setupConsole();
    this.panelManager.init((msg, type, duration) => this.showToast(msg, type, duration));
    
    this.keyboardShortcuts = new KeyboardShortcuts({
      onPlayPause: this.callbacks.onPlayPause,
      onStepBack: this.callbacks.onStepBack,
      onStepForward: this.callbacks.onStepForward,
      onReset: this.callbacks.onReset,
      onSpeedUp: () => this.adjustSpeed(1),
      onSpeedDown: () => this.adjustSpeed(-1)
    });
    this.keyboardShortcuts.init();
  }

  setupPresetSelect() {
    this.elements.presetSelect?.addEventListener('change', (e) => {
      this.callbacks.onPresetChange(e.target.value);
    });
  }

  setupPlaybackControls() {
    this.elements.btnReset?.addEventListener('click', () => this.callbacks.onReset());
    this.elements.btnStepBack?.addEventListener('click', () => this.callbacks.onStepBack());
    this.elements.btnPlayPause?.addEventListener('click', () => this.callbacks.onPlayPause());
    this.elements.btnStepForward?.addEventListener('click', () => this.callbacks.onStepForward());
  }

  setupSpeedControls() {
    this.elements.speedSlider?.addEventListener('input', (e) => {
      const level = parseInt(e.target.value, 10);
      const speed = this.speedLevelToMs(level);
      this.currentSpeed = speed;
      this.updateSpeedDisplay(level);
      this.callbacks.onSpeedChange(speed);
    });

    this.elements.turboToggle?.addEventListener('click', () => {
      this.elements.turboToggle.classList.toggle('btn--active');
      this.callbacks.onTurboToggle(this.elements.turboToggle.classList.contains('btn--active'));
    });
  }

  setupArrayViewToggle() {
    this.elements.arrayViewBars?.addEventListener('click', () => {
      this.setArrayView('bars');
      this.callbacks.onArrayViewChange('bars');
    });

    this.elements.arrayViewBoxes?.addEventListener('click', () => {
      this.setArrayView('boxes');
      this.callbacks.onArrayViewChange('boxes');
    });
  }

  setupConsole() {
    this.elements.clearConsole?.addEventListener('click', () => {
      this.clearConsole();
      this.callbacks.onClearConsole();
    });
  }

  setPlayState(isPlaying) {
    this.isPlaying = isPlaying;
    const btn = this.elements.btnPlayPause;
    if (!btn) return;

    const icon = btn.querySelector('.btn__icon');
    const label = btn.querySelector('.btn__label');
    
    if (icon) icon.textContent = isPlaying ? '⏸️' : '▶️';
    if (label) label.textContent = isPlaying ? 'Pause' : 'Run';
  }

  updateStepDisplay(current, total) {
    if (this.elements.currentStep) {
      this.elements.currentStep.textContent = `Step: ${current}`;
    }
    if (this.elements.totalSteps) {
      this.elements.totalSteps.textContent = String(total);
    }
  }

  speedLevelToMs(level) {
    return { 1: 2000, 2: 1000, 3: 500, 4: 200, 5: 50 }[level] || 500;
  }

  updateSpeedDisplay(level) {
    if (this.elements.speedValue) {
      const labels = { 1: 'Very Slow', 2: 'Slow', 3: 'Normal', 4: 'Fast', 5: 'Very Fast' };
      this.elements.speedValue.textContent = labels[level] || 'Normal';
    }
  }

  adjustSpeed(delta) {
    if (!this.elements.speedSlider) return;
    
    const current = parseInt(this.elements.speedSlider.value, 10);
    const newLevel = Math.max(1, Math.min(5, current + delta));
    this.elements.speedSlider.value = newLevel;
    
    const speed = this.speedLevelToMs(newLevel);
    this.currentSpeed = speed;
    this.updateSpeedDisplay(newLevel);
    this.callbacks.onSpeedChange(speed);
  }

  setStatus(status, type = 'default') {
    if (!this.elements.executionStatus) return;
    
    this.elements.executionStatus.textContent = status;
    this.elements.executionStatus.className = 'execution-status';
    if (type !== 'default') {
      this.elements.executionStatus.classList.add(`execution-status--${type}`);
    }
  }

  setStepButtonsState(canBack, canForward) {
    if (this.elements.btnStepBack) this.elements.btnStepBack.disabled = !canBack;
    if (this.elements.btnStepForward) this.elements.btnStepForward.disabled = !canForward;
  }

  setArrayView(mode) {
    if (!this.elements.arrayViewBars || !this.elements.arrayViewBoxes) return;
    
    this.elements.arrayViewBars.classList.toggle('btn--active', mode === 'bars');
    this.elements.arrayViewBoxes.classList.toggle('btn--active', mode === 'boxes');
  }

  addConsoleOutput(message, type = 'log') {
    if (!this.elements.consoleOutput) return;

    const placeholder = this.elements.consoleOutput.querySelector('.placeholder');
    if (placeholder) placeholder.remove();

    const line = document.createElement('div');
    line.className = `console-line console-line--${type}`;
    line.textContent = message;
    this.elements.consoleOutput.appendChild(line);
    this.elements.consoleOutput.scrollTop = this.elements.consoleOutput.scrollHeight;
  }

  clearConsole() {
    if (this.elements.consoleOutput) {
      this.elements.consoleOutput.innerHTML = '<p class="placeholder">Console output will appear here</p>';
    }
  }

  showToast(message, type = 'info', duration = 4000) {
    if (!this.elements.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    this.elements.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideIn 0.25s ease reverse';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  setPreset(presetKey) {
    if (this.elements.presetSelect) {
      this.elements.presetSelect.value = presetKey;
    }
  }

  reset(resetSteps = true) {
    this.setPlayState(false);
    if (resetSteps) this.updateStepDisplay(0, 0);
    this.setStatus('Ready');
    this.setStepButtonsState(false, true);
  }
}

export default Controls;
