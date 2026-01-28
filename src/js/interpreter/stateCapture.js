/**
 * StateCapture - Captures and stores execution state history
 */

export class StateCapture {
  constructor(options = {}) {
    this.maxHistory = options.maxHistory || 10000;
    this.history = [];
    this.currentIndex = -1;
    this.onHistoryLimitReached = options.onHistoryLimitReached || (() => {});
    this.historyLimitWarningShown = false;
  }

  capture(interpreter, additionalData = {}) {
    if (!interpreter) return null;

    const state = interpreter.getState();
    if (!state) return null;

    const snapshot = {
      stepNumber: state.stepCount,
      line: state.line,
      column: state.column,
      nodeType: state.nodeType,
      variables: interpreter.getVariables(),
      callStack: interpreter.getCallStack(),
      serialized: this.history.length % 50 === 0 ? interpreter.serialize() : null,
      timestamp: Date.now(),
      ...additionalData
    };

    this.addToHistory(snapshot);
    return snapshot;
  }

  addToHistory(snapshot) {
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    if (this.history.length >= this.maxHistory) {
      this.history.shift();
      if (!this.historyLimitWarningShown) {
        this.historyLimitWarningShown = true;
        this.onHistoryLimitReached(this.maxHistory);
      }
    } else {
      this.currentIndex++;
    }

    this.history.push(snapshot);
    this.currentIndex = this.history.length - 1;
  }

  getCurrent() {
    return (this.currentIndex >= 0 && this.currentIndex < this.history.length) 
      ? this.history[this.currentIndex] : null;
  }

  stepBack() {
    if (this.canStepBack()) {
      this.currentIndex--;
      return this.getCurrent();
    }
    return null;
  }

  stepForward() {
    if (this.canStepForward()) {
      this.currentIndex++;
      return this.getCurrent();
    }
    return null;
  }

  canStepBack() { return this.currentIndex > 0; }
  canStepForward() { return this.currentIndex < this.history.length - 1; }
  getHistoryLength() { return this.history.length; }
  getCurrentIndex() { return this.currentIndex; }

  getArrays() {
    const current = this.getCurrent();
    if (!current?.variables) return [];

    const skipNames = new Set(['arguments', 'callee', 'caller']);
    const arrays = [];

    for (const scope of current.variables) {
      if (!scope.variables) continue;
      for (const v of scope.variables) {
        if (!skipNames.has(v.name) && v.type === 'array' && Array.isArray(v.value)) {
          arrays.push({ name: v.name, value: v.value, scope: scope.name });
        }
      }
    }

    return arrays;
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
    this.historyLimitWarningShown = false;
  }
}

export default StateCapture;
