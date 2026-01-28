/**
 * SecureInterpreter - Sandboxed JavaScript execution with step-by-step control
 */

import Interpreter from 'js-interpreter';
import * as Babel from '@babel/standalone';
import { VariableExtractor } from './variableExtractor.js';
import { CallStackExtractor } from './callStackExtractor.js';

export class SecureInterpreter {
  constructor(options = {}) {
    this.maxSteps = options.maxSteps || 100000;
    this.maxStackSize = options.maxStackSize || 10000;
    this.stepCount = 0;
    this.interpreter = null;
    this.output = [];
    this.isRunning = false;
    this.hasError = false;
    this.errorMessage = null;
    
    this.onOutput = options.onOutput || (() => {});
    this.onError = options.onError || (() => {});
  }

  /**
   * Transpile ES6+ code to ES5
   */
  transpile(code) {
    try {
      const result = Babel.transform(code, {
        presets: ['env'],
        sourceType: 'script',
        plugins: []
      });
      return result.code;
    } catch (error) {
      throw new Error(`Syntax Error: ${error.message}`);
    }
  }

  /**
   * Initialize the interpreter sandbox
   */
  initSandbox(interpreter, globalObject) {
    const consoleObj = interpreter.nativeToPseudo({});
    
    ['log', 'warn', 'error'].forEach(method => {
      interpreter.setProperty(consoleObj, method,
        interpreter.createNativeFunction((...args) => {
          const msg = args.map(a => this.pseudoToString(interpreter, a)).join(' ');
          this.output.push({ type: method, message: msg, step: this.stepCount });
          this.onOutput({ type: method, message: msg, step: this.stepCount });
        })
      );
    });

    interpreter.setProperty(globalObject, 'console', consoleObj);
    interpreter.setProperty(globalObject, 'alert',
      interpreter.createNativeFunction((msg) => {
        const output = this.pseudoToString(interpreter, msg);
        this.output.push({ type: 'log', message: `[alert] ${output}`, step: this.stepCount });
        this.onOutput({ type: 'log', message: `[alert] ${output}`, step: this.stepCount });
      })
    );
  }

  /**
   * Convert pseudo object to string
   */
  pseudoToString(interpreter, pseudo) {
    if (pseudo === undefined) return 'undefined';
    if (pseudo === null) return 'null';
    
    const native = interpreter.pseudoToNative(pseudo);
    if (typeof native === 'object') {
      try { return JSON.stringify(native, null, 2); } 
      catch { return String(native); }
    }
    return String(native);
  }

  /**
   * Load code for execution
   */
  load(code) {
    this.reset();
    
    try {
      const es5Code = this.transpile(code);
      this.interpreter = new Interpreter(es5Code, this.initSandbox.bind(this));
      this.isRunning = true;
      return true;
    } catch (error) {
      this.hasError = true;
      this.errorMessage = error.message;
      this.onError(error.message);
      return false;
    }
  }

  /**
   * Execute a single step
   */
  step() {
    if (!this.interpreter || !this.isRunning || this.hasError) return false;

    if (this.stepCount >= this.maxSteps) {
      return this.setError(`Execution limit exceeded (${this.maxSteps} steps)`);
    }

    try {
      const stateStack = this.interpreter.stateStack;
      if (stateStack?.length > this.maxStackSize) {
        return this.setError('Stack size limit exceeded');
      }

      const hasMore = this.interpreter.step();
      if (hasMore) {
        this.stepCount++;
        return true;
      }
      
      this.isRunning = false;
      return false;
    } catch (error) {
      return this.setError(`Runtime Error: ${error.message}`);
    }
  }

  /**
   * Step to next line
   */
  stepToNextLine(maxMicroSteps = 100) {
    if (!this.interpreter || !this.isRunning || this.hasError) {
      return { hasMore: false, lineChanged: false, newLine: null };
    }

    const startLine = this.getCurrentLine();
    let microSteps = 0;
    let hasMore = true;

    while (hasMore && microSteps < maxMicroSteps) {
      hasMore = this.step();
      microSteps++;
      if (!hasMore) break;

      const currentLine = this.getCurrentLine();
      if (currentLine && currentLine !== startLine) {
        return { hasMore: true, lineChanged: true, newLine: currentLine };
      }
    }

    return { hasMore, lineChanged: microSteps > 0, newLine: this.getCurrentLine() };
  }

  /**
   * Set error state
   */
  setError(message) {
    this.hasError = true;
    this.errorMessage = message;
    this.onError(message);
    return false;
  }

  /**
   * Get current execution state
   */
  getState() {
    if (!this.interpreter) return null;

    const stateStack = this.interpreter.stateStack;
    if (!stateStack || stateStack.length === 0) return null;

    const currentState = stateStack[stateStack.length - 1];
    const node = currentState.node;

    return {
      stepCount: this.stepCount,
      node,
      nodeType: node?.type || null,
      line: node?.loc?.start?.line || null,
      column: node?.loc?.start?.column || null,
      stateStack,
      scope: currentState.scope
    };
  }

  getCurrentLine() {
    return this.getState()?.line || null;
  }

  getVariables() {
    return new VariableExtractor(this.interpreter).getVariables();
  }

  getCallStack() {
    return new CallStackExtractor(this.interpreter).getCallStack();
  }

  serialize() {
    try {
      return this.interpreter ? JSON.stringify(this.interpreter.serialize()) : null;
    } catch { return null; }
  }

  reset() {
    this.interpreter = null;
    this.stepCount = 0;
    this.output = [];
    this.isRunning = false;
    this.hasError = false;
    this.errorMessage = null;
  }

  isDone() {
    return !this.isRunning || this.hasError;
  }

  getOutput() { return this.output; }
  getError() { return this.errorMessage; }
}

export default SecureInterpreter;
