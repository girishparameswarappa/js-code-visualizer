/**
 * ExecutionManager - Handles code execution control
 */

export class ExecutionManager {
  constructor(deps) {
    Object.assign(this, deps);
    this.onVisualizationUpdate = deps.onVisualizationUpdate || (() => {});
    this.onExecutionComplete = deps.onExecutionComplete || (() => {});
    this.hasStarted = false;
    this.isExecuting = false;
    this.lastCallStackDepth = undefined;
  }

  togglePlayPause() {
    this.hasStarted ? this.animator.togglePlayPause() : this.startExecution();
  }

  startExecution() {
    const code = this.codeEditor.getValue();
    if (!code.trim()) { this.controls.showToast('Please enter some code', 'warning'); return; }

    this.codeEditor.setReadOnly(true);
    this.performanceAnalyzer?.startExecution();

    if (!this.interpreter.load(code)) { this.codeEditor.setReadOnly(false); return; }

    this.hasStarted = true;
    this.isExecuting = true;
    this.animator.play();
  }

  async executeStep() {
    if (!this.interpreter || this.interpreter.isDone()) {
      this.performanceAnalyzer?.endExecution();
      return { hasMore: false };
    }

    this.performanceAnalyzer?.incrementSteps();
    const result = this.interpreter.stepToNextLine(100);
    const snapshot = this.stateCapture.capture(this.interpreter);

    if (snapshot) {
      this.onVisualizationUpdate(snapshot);
      this.trackRecursion(snapshot);
      if (snapshot.callStack) this.performanceAnalyzer?.updateStackDepth(snapshot.callStack.length);
    }
    return { hasMore: result.hasMore };
  }

  async stepForward() {
    if (!this.hasStarted) { this.startExecution(); this.animator.pause(); return; }
    if (this.stateCapture.canStepForward()) {
      const snapshot = this.stateCapture.stepForward();
      if (snapshot) this.onVisualizationUpdate(snapshot);
    } else {
      await this.animator.stepForward();
    }
  }

  stepBack() {
    if (!this.stateCapture.canStepBack()) return;
    const snapshot = this.stateCapture.stepBack();
    if (snapshot) {
      this.onVisualizationUpdate(snapshot);
      if (this.animator.isComplete) {
        this.animator.isComplete = false;
        this.controls.setStatus('Paused', 'paused');
      }
    }
  }

  reset(isUserInitiated = true) {
    this.animator?.reset();
    this.interpreter?.reset();
    this.stateCapture?.clear();
    this.recursionTracker?.reset();
    this.performanceAnalyzer?.reset();
    this.codeEditor?.clearHighlight();
    this.codeEditor?.setReadOnly(false);
    this.controls?.reset(isUserInitiated);
    this.controls?.clearConsole();
    this.isExecuting = false;
    this.hasStarted = false;
    this.lastCallStackDepth = undefined;
  }

  trackRecursion(snapshot) {
    const stack = snapshot.callStack || [];
    const depth = stack.length;
    
    if (this.lastCallStackDepth === undefined) { this.lastCallStackDepth = depth; return; }

    if (depth > this.lastCallStackDepth && stack.length > 0) {
      const top = stack[0];
      this.performanceAnalyzer?.incrementFunctionCalls();
      if (top.functionName && top.functionName !== '(global)') {
        this.recursionTracker.onFunctionCall(top.functionName, top.arguments || [], snapshot.stepNumber, top.line);
      }
    } else if (depth < this.lastCallStackDepth) {
      this.recursionTracker.onFunctionReturn(this.extractReturnValue(snapshot), snapshot.stepNumber);
    }
    this.lastCallStackDepth = depth;
  }

  extractReturnValue(snapshot) {
    const vars = snapshot.variables?.[0]?.variables || [];
    const names = ['result', 'res', 'ret', 'output', 'value', 'data', 'sorted'];
    for (const n of names) { const v = vars.find(x => x.name === n); if (v?.value !== undefined) return v.value; }
    for (const v of vars) { if (v.type === 'array' && Array.isArray(v.value)) return v.value; }
    for (const v of vars) { if (v.value !== undefined && v.type !== 'function') return v.value; }
    return undefined;
  }

  setSpeed(speed) { this.animator?.setSpeed(speed); }
  setTurbo(enabled) { if (this.animator) this.animator.turboMode = enabled; }
}

export default ExecutionManager;
