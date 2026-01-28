/**
 * CallStackExtractor - Extracts call stack from interpreter state
 */

export class CallStackExtractor {
  constructor(interpreter) {
    this.interpreter = interpreter;
  }

  /**
   * Get the current call stack
   */
  getCallStack() {
    if (!this.interpreter) return [];

    const stateStack = this.interpreter.stateStack;
    if (!stateStack || stateStack.length === 0) return [];

    const callStack = [];
    const seenFrames = new Set();
    
    for (let i = stateStack.length - 1; i >= 0; i--) {
      const frame = this.extractFrame(stateStack[i], i, seenFrames);
      if (frame) callStack.push(frame);
    }

    if (callStack.length === 0) {
      callStack.push(this.createGlobalFrame());
    }

    return callStack;
  }

  /**
   * Extract a frame from state
   */
  extractFrame(state, index, seenFrames) {
    const node = state.node;
    if (!node) return null;

    if (node.type !== 'CallExpression' && 
        !(node.type === 'BlockStatement' && state.scope?.parentScope)) {
      return null;
    }

    const { functionName, args, line } = this.parseNode(node, state);
    const frameKey = `${functionName}-${line}-${index}`;

    if (seenFrames.has(frameKey) || functionName === 'anonymous') {
      return null;
    }

    seenFrames.add(frameKey);
    
    return {
      functionName,
      arguments: args,
      line,
      column: node.loc?.start?.column
    };
  }

  /**
   * Parse node to extract function info
   */
  parseNode(node, state) {
    let functionName = 'anonymous';
    let args = [];
    const line = node.loc?.start?.line;

    if (node.type === 'CallExpression') {
      functionName = this.getFunctionName(node.callee);
      args = this.getArguments(state, node);
    }

    return { functionName, args, line };
  }

  /**
   * Get function name from callee
   */
  getFunctionName(callee) {
    if (callee?.type === 'Identifier') return callee.name;
    if (callee?.type === 'MemberExpression') return callee.property?.name || 'method';
    return 'anonymous';
  }

  /**
   * Get formatted arguments
   */
  getArguments(state, node) {
    if (state.arguments_) {
      return state.arguments_.map(arg => {
        try {
          const native = this.interpreter.pseudoToNative(arg);
          return this.formatArgument(native);
        } catch {
          return '?';
        }
      });
    }
    
    if (node.arguments) {
      return node.arguments.map(() => '...');
    }
    
    return [];
  }

  /**
   * Format an argument for display
   */
  formatArgument(value) {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    
    if (Array.isArray(value)) {
      if (value.length > 5) return `[${value.slice(0, 5).join(', ')}, ...]`;
      return `[${value.join(', ')}]`;
    }
    
    if (typeof value === 'object') {
      try {
        const str = JSON.stringify(value);
        return str.length > 30 ? str.substring(0, 30) + '...' : str;
      } catch {
        return '{...}';
      }
    }
    
    if (typeof value === 'string') {
      return `"${value.length > 20 ? value.substring(0, 20) + '...' : value}"`;
    }
    
    return String(value);
  }

  /**
   * Create a global frame
   */
  createGlobalFrame() {
    const state = this.interpreter.stateStack;
    const currentState = state?.[state.length - 1];
    
    return {
      functionName: '(global)',
      arguments: [],
      line: currentState?.node?.loc?.start?.line || null,
      column: 0
    };
  }
}

export default CallStackExtractor;
