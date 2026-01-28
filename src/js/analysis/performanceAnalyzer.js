/**
 * PerformanceAnalyzer - Analyzes code complexity and execution metrics
 */

export class PerformanceAnalyzer {
  constructor() {
    this.reset();
  }

  reset() {
    this.metrics = {
      executionTime: 0,
      totalSteps: 0,
      functionCalls: 0,
      maxStackDepth: 0,
      startTime: null,
      endTime: null
    };
  }

  startExecution() {
    this.metrics.startTime = performance.now();
    this.metrics.totalSteps = 0;
    this.metrics.functionCalls = 0;
    this.metrics.maxStackDepth = 0;
  }

  endExecution() {
    this.metrics.endTime = performance.now();
    this.metrics.executionTime = this.metrics.endTime - this.metrics.startTime;
  }

  incrementSteps() { this.metrics.totalSteps++; }
  incrementFunctionCalls() { this.metrics.functionCalls++; }
  
  updateStackDepth(depth) {
    this.metrics.maxStackDepth = Math.max(this.metrics.maxStackDepth, depth);
  }

  getMetrics() { return this.metrics; }

  analyzeTimeComplexity(code) {
    const loopDepth = this.detectNestedLoops(code);
    const hasRecursion = this.detectRecursion(code);
    const hasArrayMethods = /\.(map|filter|reduce|forEach|sort|find|some|every)/.test(code);

    if (loopDepth >= 3) {
      return this.complexity('O(n³)', 'Triple nested loops detected.', ['Three levels of nested iteration']);
    }
    if (loopDepth === 2) {
      return this.complexity('O(n²)', 'Double nested loops detected.', ['Two levels of nested iteration']);
    }
    if (loopDepth === 1) {
      if (hasArrayMethods) {
        return this.complexity('O(n²)', 'Loop with array method detected.', ['Loop combined with array methods']);
      }
      return this.complexity('O(n)', 'Single loop detected.', ['Single iteration through data']);
    }
    if (hasRecursion) {
      if (/fib/i.test(code)) {
        return this.complexity('O(2ⁿ)', 'Exponential complexity - recursive fibonacci.', ['Recursive calls without memoization']);
      }
      if (/merge|quick/i.test(code)) {
        return this.complexity('O(n log n)', 'Divide and conquer algorithm.', ['Recursive division of problem']);
      }
      return this.complexity('O(n)', 'Linear recursion detected.', ['Linear recursive calls']);
    }
    if (hasArrayMethods) {
      const count = (code.match(/\.(map|filter|reduce|forEach|sort)/g) || []).length;
      if (count > 1) {
        return this.complexity('O(n²)', 'Multiple array methods chained.', [`${count} chained operations`]);
      }
      return this.complexity('O(n)', 'Single array method.', ['Single iteration via array method']);
    }

    return this.complexity('O(1)', 'Constant time complexity.', ['No loops or recursion detected']);
  }

  analyzeSpaceComplexity(code) {
    const hasArrayInLoop = /for.*\{[\s\S]*?(\[|\{|new Array)/.test(code);
    const hasRecursion = this.detectRecursion(code);
    const hasDataStructure = /new (Array|Map|Set|Object)|\[.*\]/.test(code);

    if (hasArrayInLoop) {
      return this.complexity('O(n²)', 'Creating arrays in loops.', ['Data structures in nested loops']);
    }
    if (hasRecursion) {
      const depth = this.metrics.maxStackDepth || 1;
      if (depth > 10) {
        return this.complexity('O(n)', 'Recursive calls use stack space.', [`Max stack depth: ${depth}`]);
      }
      return this.complexity('O(log n)', 'Logarithmic space - divide-and-conquer.', ['Limited stack depth']);
    }
    if (hasDataStructure) {
      return this.complexity('O(n)', 'Creates data structures.', ['Space grows with input']);
    }

    return this.complexity('O(1)', 'Uses constant space.', ['No dynamic data structures']);
  }

  complexity(value, explanation, factors) {
    return { complexity: value, explanation, factors };
  }

  detectNestedLoops(code) {
    let maxDepth = 0, currentDepth = 0;
    for (const line of code.split('\n')) {
      if (/\b(for|while)\s*\(/.test(line)) {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      }
      currentDepth = Math.max(0, currentDepth - (line.match(/}/g) || []).length);
    }
    return maxDepth;
  }

  detectRecursion(code) {
    const functions = [...code.matchAll(/function\s+(\w+)/g)].map(m => m[1]);
    return functions.some(name => new RegExp(`function\\s+${name}[\\s\\S]*?${name}\\s*\\(`).test(code));
  }

  generateDetailedAnalysis(code, timeAnalysis, spaceAnalysis) {
    const tips = timeAnalysis.complexity.includes('n²') || timeAnalysis.complexity.includes('n³')
      ? '<li>Consider more efficient algorithms</li><li>Reduce nested iterations</li>'
      : timeAnalysis.complexity.includes('2ⁿ')
      ? '<li>Consider memoization</li><li>Dynamic programming can help</li>'
      : '<li>Good time efficiency</li><li>Consider space optimizations if needed</li>';

    return `
      <strong>Algorithm Overview:</strong>
      <p>Time: <code>${timeAnalysis.complexity}</code>, Space: <code>${spaceAnalysis.complexity}</code></p>
      <strong>Time Complexity:</strong>
      <p>${timeAnalysis.explanation}</p>
      <strong>Space Complexity:</strong>
      <p>${spaceAnalysis.explanation}</p>
      <strong>Tips:</strong>
      <ul>${tips}</ul>
    `;
  }
}

export default PerformanceAnalyzer;
