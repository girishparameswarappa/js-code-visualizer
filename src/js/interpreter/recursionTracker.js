/**
 * RecursionTracker - Builds and tracks function call tree for recursion visualization
 */

export class RecursionTracker {
  constructor() {
    this.root = null;
    this.currentNode = null;
    this.nodeStack = [];
    this.nodeIdCounter = 0;
    this.allNodes = new Map();
  }

  onFunctionCall(functionName, args, stepNumber, line) {
    const newNode = {
      id: `node-${this.nodeIdCounter++}`,
      functionName,
      arguments: this.formatArgs(args),
      argumentsRaw: args,
      returnValue: undefined,
      hasReturned: false,
      children: [],
      depth: this.nodeStack.length,
      startStep: stepNumber,
      endStep: null,
      line,
      isActive: true
    };

    this.allNodes.set(newNode.id, newNode);

    if (!this.root) {
      this.root = newNode;
    } else if (this.currentNode) {
      this.currentNode.children.push(newNode);
      newNode.parent = this.currentNode;
    }

    this.nodeStack.push(newNode);
    this.currentNode = newNode;

    if (newNode.parent) newNode.parent.isActive = false;

    return newNode;
  }

  onFunctionReturn(returnValue, stepNumber) {
    if (!this.currentNode) return null;

    this.currentNode.returnValue = this.formatValue(returnValue);
    this.currentNode.returnValueRaw = returnValue;
    this.currentNode.hasReturned = true;
    this.currentNode.endStep = stepNumber;
    this.currentNode.isActive = false;

    const returnedNode = this.currentNode;

    this.nodeStack.pop();
    this.currentNode = this.nodeStack[this.nodeStack.length - 1] || null;

    if (this.currentNode) this.currentNode.isActive = true;

    return returnedNode;
  }

  formatArgs(args) {
    if (!args || !Array.isArray(args)) return '';
    return args.map(arg => typeof arg === 'string' ? arg : this.formatValue(arg)).join(', ');
  }

  formatValue(value) {
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    
    if (Array.isArray(value)) {
      const formatted = value.map(item => {
        if (item?.hasOwnProperty?.('value') && item?.hasOwnProperty?.('left')) return item.value;
        if (item === null) return 'null';
        if (item === undefined) return 'undefined';
        return item;
      });
      return formatted.length > 5 ? `[${formatted.slice(0, 5).join(', ')}, ...]` : `[${formatted.join(', ')}]`;
    }
    
    if (typeof value === 'object') {
      if (value.hasOwnProperty('value') && value.hasOwnProperty('left')) {
        return `Tree Node (value: ${value.value})`;
      }
      try {
        const str = JSON.stringify(value);
        return str.length > 20 ? str.substring(0, 20) + '...' : str;
      } catch { return '{...}'; }
    }
    
    if (typeof value === 'string') {
      return `"${value.length > 15 ? value.substring(0, 15) + '...' : value}"`;
    }
    
    return String(value);
  }

  toD3Hierarchy() {
    if (!this.root) return null;

    const convert = (node) => ({
      id: node.id,
      name: node.functionName,
      arguments: node.arguments,
      returnValue: node.returnValue,
      hasReturned: node.hasReturned,
      isActive: node.isActive,
      depth: node.depth,
      children: node.children.map(convert)
    });

    return convert(this.root);
  }

  getTree() { return this.root; }
  getCurrentNode() { return this.currentNode; }
  getTotalCalls() { return this.allNodes.size; }
  getMaxDepth() {
    if (!this.root) return 0;
    let maxDepth = 0;
    this.allNodes.forEach(node => { maxDepth = Math.max(maxDepth, node.depth); });
    return maxDepth;
  }

  hasRecursion() { return this.root !== null; }

  reset() {
    this.root = null;
    this.currentNode = null;
    this.nodeStack = [];
    this.nodeIdCounter = 0;
    this.allNodes.clear();
  }
}

export default RecursionTracker;
