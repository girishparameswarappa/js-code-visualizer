/**
 * Animator - Controls playback of code execution visualization
 */

export class Animator {
  constructor(options = {}) {
    this.onStep = options.onStep || (() => {});
    this.onStateChange = options.onStateChange || (() => {});
    this.onComplete = options.onComplete || (() => {});
    this.onError = options.onError || (() => {});
    
    this.isPlaying = false;
    this.isPaused = false;
    this.isComplete = false;
    this.currentStepIndex = 0;
    this.totalSteps = 0;
    
    this.speed = options.speed || 100;
    this.minSpeed = 10;
    this.maxSpeed = 2000;
    this.turboMode = false;
    
    this.animationTimeout = null;
    this.abortController = null;
  }

  async play() {
    if (this.isComplete) return;

    this.isPlaying = true;
    this.isPaused = false;
    this.abortController = new AbortController();
    this.emitStateChange('playing');

    try {
      await this.runLoop();
    } catch (error) {
      if (error.name !== 'AbortError') this.onError(error);
    }
  }

  async runLoop() {
    while (this.isPlaying && !this.isPaused && !this.isComplete) {
      if (this.abortController?.signal.aborted) break;

      const result = await this.executeStep();
      if (!result.hasMore) {
        this.complete();
        break;
      }

      await this.delay(this.getDelay());
      
      while (this.isPaused && this.isPlaying) {
        await this.delay(50);
      }
    }
  }

  getDelay() {
    let delay = Math.max(this.minSpeed, Math.min(this.maxSpeed, this.speed));
    return this.turboMode ? Math.max(this.minSpeed, delay / 2) : delay;
  }

  async executeStep() {
    const result = await this.onStep(this.currentStepIndex);
    if (result.hasMore) {
      this.currentStepIndex++;
      this.totalSteps = Math.max(this.totalSteps, this.currentStepIndex);
    }
    return result;
  }

  pause() {
    this.isPaused = true;
    this.emitStateChange('paused');
  }

  togglePlayPause() {
    if (this.isComplete) {
      this.reset();
      this.play();
    } else if (this.isPlaying && !this.isPaused) {
      this.pause();
    } else {
      this.play();
    }
  }

  async stepForward() {
    if (this.isComplete) return false;

    if (this.isPlaying && !this.isPaused) this.pause();

    const result = await this.executeStep();
    if (!result.hasMore) this.complete();
    
    return result.hasMore;
  }

  stop() {
    this.isPlaying = false;
    this.isPaused = false;
    
    if (this.abortController) this.abortController.abort();
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
      this.animationTimeout = null;
    }
    
    this.emitStateChange('stopped');
  }

  reset() {
    this.stop();
    this.currentStepIndex = 0;
    this.totalSteps = 0;
    this.isComplete = false;
    this.emitStateChange('reset');
  }

  complete() {
    this.isPlaying = false;
    this.isPaused = false;
    this.isComplete = true;
    this.emitStateChange('completed');
    this.onComplete();
  }

  setSpeed(speed) {
    this.speed = Math.max(this.minSpeed, Math.min(this.maxSpeed, speed));
  }

  delay(ms) {
    return new Promise((resolve, reject) => {
      this.animationTimeout = setTimeout(resolve, ms);
      
      if (this.abortController) {
        this.abortController.signal.addEventListener('abort', () => {
          clearTimeout(this.animationTimeout);
          reject(new DOMException('Aborted', 'AbortError'));
        });
      }
    });
  }

  emitStateChange(state) {
    this.onStateChange({
      state,
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      isComplete: this.isComplete,
      currentStep: this.currentStepIndex,
      totalSteps: this.totalSteps,
      speed: this.speed
    });
  }
}

export default Animator;
