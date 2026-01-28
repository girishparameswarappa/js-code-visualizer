/**
 * VariableExtractor - Extracts variables from interpreter scope chain
 */

const SKIP_NAMES = new Set([
  'NaN', 'Infinity', 'undefined', 'eval', 'parseInt', 'parseFloat',
  'isNaN', 'isFinite', 'decodeURI', 'decodeURIComponent', 'encodeURI',
  'encodeURIComponent', 'escape', 'unescape', 'Object', 'Function',
  'Array', 'String', 'Boolean', 'Number', 'Date', 'RegExp', 'Error',
  'EvalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError',
  'URIError', 'Math', 'JSON', 'console', 'alert',
  'window', 'global', '__proto__', 'constructor', 'prototype', 'document',
  'navigator', 'location', 'self', 'top', 'parent', 'frames', 'opener',
  'closed', 'status', 'statusbar', 'menubar', 'toolbar', 'personalbar',
  'scrollbars', 'locationbar', 'history', 'localStorage', 'sessionStorage'
]);

export class VariableExtractor {
  constructor(interpreter) {
    this.interpreter = interpreter;
  }

  /**
   * Get all variables in the current scope chain
   */
  getVariables() {
    if (!this.interpreter) return [];

    const scopes = [];
    const stateStack = this.interpreter.stateStack;
    
    if (!stateStack || stateStack.length === 0) return scopes;

    const globalScope = this.interpreter.globalScope;
    const currentState = stateStack[stateStack.length - 1];
    let scope = currentState?.scope || globalScope;
    let scopeIndex = 0;
    const seenScopes = new Set();

    while (scope && !seenScopes.has(scope)) {
      seenScopes.add(scope);
      const variables = this.extractScopeVariables(scope);

      if (variables.length > 0) {
        const name = scopeIndex === 0 ? 'Local' : 
                     (!scope.parentScope ? 'Global' : `Scope ${scopeIndex}`);
        scopes.push({ name, variables: variables.sort((a, b) => a.name.localeCompare(b.name)) });
      }

      scope = scope.parentScope;
      scopeIndex++;
    }

    return scopes;
  }

  /**
   * Extract variables from a single scope
   */
  extractScopeVariables(scope) {
    const variables = [];
    const properties = scope.object?.properties || scope.properties;

    if (!properties || typeof properties !== 'object') return variables;

    for (const name of Object.keys(properties)) {
      if (name.startsWith('__') || SKIP_NAMES.has(name)) continue;

      const variable = this.processVariable(name, properties[name]);
      if (variable) variables.push(variable);
    }

    return variables;
  }

  /**
   * Process a single variable
   */
  processVariable(name, value) {
    try {
      const { nativeValue, type } = this.convertValue(value);
      if (type === 'function') return null;

      return {
        name,
        value: nativeValue,
        type,
        displayValue: this.formatValue(nativeValue)
      };
    } catch {
      return null;
    }
  }

  /**
   * Convert pseudo value to native
   */
  convertValue(value) {
    if (value === null) return { nativeValue: null, type: 'null' };
    if (value === undefined) return { nativeValue: undefined, type: 'undefined' };
    
    if (typeof value === 'object' && value.class) {
      const native = this.interpreter.pseudoToNative(value);
      return { nativeValue: native, type: Array.isArray(native) ? 'array' : typeof native };
    }
    
    if (typeof value === 'object' && value.type === 'function') {
      return { nativeValue: '[Function]', type: 'function' };
    }
    
    if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
      return { nativeValue: value, type: typeof value };
    }
    
    if (typeof value === 'object') {
      const native = this.interpreter.pseudoToNative(value);
      return { nativeValue: native, type: Array.isArray(native) ? 'array' : typeof native };
    }
    
    return { nativeValue: value, type: typeof value };
  }

  /**
   * Format a value for display
   */
  formatValue(value) {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    
    if (Array.isArray(value)) {
      if (value.length > 10) {
        return `[${value.slice(0, 10).join(', ')}, ... (${value.length} items)]`;
      }
      return `[${value.join(', ')}]`;
    }
    
    if (typeof value === 'object') {
      if (value.hasOwnProperty('value') && value.hasOwnProperty('left') && value.hasOwnProperty('right')) {
        return `Node(${value.value})`;
      }
      
      try {
        const str = JSON.stringify(value);
        return str.length > 50 ? str.substring(0, 50) + '...' : str;
      } catch {
        return '[Object]';
      }
    }
    
    if (typeof value === 'string') {
      return `"${value.length > 30 ? value.substring(0, 30) + '...' : value}"`;
    }
    
    return String(value);
  }
}

export default VariableExtractor;
