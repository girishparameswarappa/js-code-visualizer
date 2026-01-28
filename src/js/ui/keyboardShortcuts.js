/**
 * KeyboardShortcuts - Handles keyboard shortcuts for playback control
 */

export class KeyboardShortcuts {
  constructor(callbacks) {
    this.callbacks = {
      onPlayPause: callbacks.onPlayPause || (() => {}),
      onStepBack: callbacks.onStepBack || (() => {}),
      onStepForward: callbacks.onStepForward || (() => {}),
      onReset: callbacks.onReset || (() => {}),
      onSpeedUp: callbacks.onSpeedUp || (() => {}),
      onSpeedDown: callbacks.onSpeedDown || (() => {})
    };
  }

  /**
   * Initialize keyboard shortcuts
   */
  init() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  /**
   * Handle keydown events
   */
  handleKeyDown(e) {
    if (this.isInputFocused(e.target)) return;

    const handlers = {
      ' ': () => { e.preventDefault(); this.callbacks.onPlayPause(); },
      'ArrowLeft': () => { e.preventDefault(); this.callbacks.onStepBack(); },
      'ArrowRight': () => { e.preventDefault(); this.callbacks.onStepForward(); },
      'ArrowUp': () => { e.preventDefault(); this.callbacks.onSpeedUp(); },
      'ArrowDown': () => { e.preventDefault(); this.callbacks.onSpeedDown(); }
    };

    if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      this.callbacks.onReset();
      return;
    }

    const handler = handlers[e.key];
    if (handler) handler();
  }

  /**
   * Check if an input element is focused
   */
  isInputFocused(target) {
    return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
  }
}

export default KeyboardShortcuts;
