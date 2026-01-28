/**
 * VisualizationManager - Coordinates visualization updates
 */

export class VisualizationManager {
  constructor(deps) {
    Object.assign(this, deps);
  }

  updateVisualizations(snapshot) {
    if (snapshot.line && this.codeEditor) this.codeEditor.highlightLine(snapshot.line);
    if (this.renderer) {
      this.renderer.renderVariables(snapshot.variables);
      this.renderer.renderCallStack(snapshot.callStack);
      this.renderer.renderArray(this.extractArrays(snapshot.variables));
    }
    this.updateTree();
    this.updateStepDisplay();
  }

  updateTree() {
    if (!this.treeRenderer) return;
    if (this.recursionTracker.hasRecursion()) {
      this.treeRenderer.render(this.recursionTracker.toD3Hierarchy());
    } else {
      this.treeRenderer.clear();
    }
    this.updatePanelVisibility('tree');
  }

  updatePanelVisibility(type) {
    const panel = document.querySelector(`[data-panel="${type}"]`);
    if (panel && !panel.classList.contains('panel--maximized')) {
      panel.classList.toggle('panel--hidden', !this.isPanelUserSelected(type));
    }
  }

  updateStepDisplay() {
    const current = this.stateCapture.getCurrentIndex() + 1;
    const total = this.stateCapture.getHistoryLength();
    if (total === 0 && this.interpreter?.isDone()) return;
    
    this.controls.updateStepDisplay(current, this.interpreter?.isDone() ? total : current);
    this.controls.setStepButtonsState(
      this.stateCapture.canStepBack(),
      !this.interpreter?.isDone() || this.stateCapture.canStepForward()
    );
  }

  extractArrays(scopes) {
    if (!scopes?.length) return [];
    const skip = new Set(['arguments', 'callee', 'caller']);
    return scopes.flatMap(s => (s.variables || [])
      .filter(v => !skip.has(v.name) && v.type === 'array' && Array.isArray(v.value))
      .map(v => ({ name: v.name, value: v.value, scope: s.name })));
  }

  isPanelUserSelected(type) {
    return document.querySelector(`#panel-selector-dropdown input[value="${type}"]`)?.checked ?? false;
  }

  setArrayView(mode) {
    if (!this.renderer) return;
    this.renderer.setArrayViewMode(mode);
    const arrays = this.stateCapture?.getArrays();
    if (arrays?.length) this.renderer.renderArray(arrays);
  }

  updatePerformancePanel(time, space, code) {
    this.updateComplexity('time-complexity', time);
    this.updateComplexity('space-complexity', space);
    const el = document.getElementById('detailed-analysis');
    if (el && this.performanceAnalyzer) {
      el.innerHTML = this.performanceAnalyzer.generateDetailedAnalysis(code, time, space);
    }
  }

  updateComplexity(id, analysis) {
    const el = document.getElementById(id);
    if (!el) return;
    const val = el.querySelector('.complexity-value');
    const exp = el.querySelector('.complexity-explanation');
    if (val) {
      val.textContent = analysis.complexity;
      val.className = 'complexity-value';
      if (analysis.complexity.includes('n²') || analysis.complexity.includes('n³')) val.classList.add('complexity-value--warning');
      else if (analysis.complexity.includes('2ⁿ')) val.classList.add('complexity-value--danger');
    }
    if (exp) {
      exp.innerHTML = `<p>${analysis.explanation}</p>` + 
        (analysis.factors.length ? '<ul>' + analysis.factors.map(f => `<li>${f}</li>`).join('') + '</ul>' : '');
    }
  }

  updateExecutionMetrics() {
    if (!this.performanceAnalyzer) return;
    const m = this.performanceAnalyzer.getMetrics();
    this.setEl('execution-time', m.executionTime > 0 ? `${m.executionTime.toFixed(2)}ms` : '-');
    this.setEl('total-steps', m.totalSteps > 0 ? m.totalSteps.toLocaleString() : '-');
    this.setEl('function-calls', m.functionCalls > 0 ? m.functionCalls.toLocaleString() : '-');
    this.setEl('max-stack-depth', m.maxStackDepth > 0 ? m.maxStackDepth.toString() : '-');
  }

  setEl(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }

  clearPerformancePanel() {
    ['time-complexity', 'space-complexity'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const v = el.querySelector('.complexity-value');
        const e = el.querySelector('.complexity-explanation');
        if (v) v.textContent = 'O(n)';
        if (e) e.innerHTML = '<p class="placeholder">Run code to see analysis</p>';
      }
    });
    ['execution-time', 'total-steps', 'function-calls', 'max-stack-depth'].forEach(id => this.setEl(id, '-'));
    this.setEl('detailed-analysis', '<p class="placeholder">Run code to see detailed analysis</p>');
  }

  clearAll() {
    this.renderer?.clearAll();
    this.treeRenderer?.clear();
    this.codeEditor?.clearHighlight();
    this.clearPerformancePanel();
  }
}

export default VisualizationManager;
