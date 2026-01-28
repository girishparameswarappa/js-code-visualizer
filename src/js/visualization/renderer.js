/**
 * Renderer - Renders variables, call stack, and arrays
 */

import { ArrayRenderer } from './arrayRenderer.js';

export class Renderer {
  constructor(options = {}) {
    this.variablesContainer = options.variablesContainer;
    this.callstackContainer = options.callstackContainer;
    
    this.arrayRenderer = new ArrayRenderer(options.arrayCanvas);
  }

  /**
   * Render variables panel
   */
  renderVariables(scopes) {
    if (!this.variablesContainer) return;

    if (!scopes || scopes.length === 0) {
      this.variablesContainer.innerHTML = '<p class="placeholder">No variables in scope</p>';
      return;
    }

    this.variablesContainer.innerHTML = scopes.map(scope => `
      <div class="scope-block">
        <div class="scope-header">${this.escapeHtml(scope.name)}</div>
        <div class="scope-variables">
          ${scope.variables.map(v => `
            <div class="variable-row">
              <span class="variable-name">${this.escapeHtml(v.name)}</span>
              <span class="variable-value ${this.getTypeClass(v.type)}">${this.escapeHtml(v.displayValue)}</span>
              <span class="variable-type">${v.type}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  /**
   * Render call stack panel
   */
  renderCallStack(callStack) {
    if (!this.callstackContainer) return;

    if (!callStack || callStack.length === 0) {
      this.callstackContainer.innerHTML = '<p class="placeholder">Call stack empty</p>';
      return;
    }

    this.callstackContainer.innerHTML = callStack.slice().reverse().map((frame, i, arr) => {
      const isTop = i === arr.length - 1;
      const depth = i;
      const indent = depth * 20;
      const connector = depth > 0 ? '└─ ' : '';
      const statusIcon = isTop ? '▶' : '●';
      const statusClass = isTop ? 'active' : 'completed';
      const argsDisplay = frame.arguments.join(', ');

      return `
        <div class="stack-frame ${isTop ? 'stack-frame--active' : ''}" style="margin-left: ${indent}px;">
          <div class="stack-frame__connector">${connector}</div>
          <div class="stack-frame__content">
            <span class="stack-frame__status stack-frame__status--${statusClass}">${statusIcon}</span>
            <span class="stack-frame__label">Function:</span>
            <span class="stack-frame__name">${this.escapeHtml(frame.functionName)}</span>
            ${argsDisplay ? `<span class="stack-frame__label">with</span>` : ''}
            ${argsDisplay ? `<span class="stack-frame__args">${this.escapeHtml(argsDisplay)}</span>` : '<span class="stack-frame__args">(no arguments)</span>'}
            ${frame.line ? `<span class="stack-frame__location">at line ${frame.line}</span>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Render array visualization
   */
  renderArray(arrays, options = {}) {
    this.arrayRenderer.render(arrays, options);
  }

  /**
   * Set array view mode
   */
  setArrayViewMode(mode) {
    this.arrayRenderer.setViewMode(mode);
  }

  /**
   * Get CSS class for variable type
   */
  getTypeClass(type) {
    const classes = {
      number: 'variable-value--number',
      string: 'variable-value--string',
      boolean: 'variable-value--boolean',
      array: 'variable-value--array',
      object: 'variable-value--object'
    };
    return classes[type] || '';
  }

  /**
   * Escape HTML
   */
  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = String(str);
    return div.innerHTML;
  }

  /**
   * Clear all panels
   */
  clearAll() {
    if (this.variablesContainer) {
      this.variablesContainer.innerHTML = '<p class="placeholder">Run code to see variables</p>';
    }
    if (this.callstackContainer) {
      this.callstackContainer.innerHTML = '<p class="placeholder">Run code to see call stack</p>';
    }
    this.arrayRenderer.clear();
    this.arrayRenderer.renderEmpty();
  }
}

export default Renderer;
