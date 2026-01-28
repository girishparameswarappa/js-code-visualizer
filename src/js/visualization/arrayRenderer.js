/**
 * ArrayRenderer - Canvas-based array visualization
 */

export class ArrayRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas?.getContext('2d');
    this.viewMode = 'bars';
    this.highlightedIndices = new Set();
    this.comparedIndices = new Set();
    
    this.colors = {
      bar: '#58a6ff',
      barActive: '#3fb950',
      barCompare: '#f85149',
      boxBg: '#21262d',
      boxBorder: '#30363d',
      text: '#e6edf3',
      textMuted: '#8b949e'
    };

    this.canvasWidth = 0;
    this.canvasHeight = 0;
    
    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (!this.canvas) return;
    
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    
    this.canvasWidth = rect.width;
    this.canvasHeight = rect.height;
  }

  render(arrays, options = {}) {
    if (!this.ctx) return;
    
    this.highlightedIndices = new Set(options.highlightedIndices || []);
    this.comparedIndices = new Set(options.comparedIndices || []);
    
    this.clear();
    
    if (!arrays || arrays.length === 0) {
      this.renderEmpty();
      return;
    }

    const arr = arrays[0];
    if (this.viewMode === 'bars') {
      this.renderBars(arr.value, arr.name);
    } else {
      this.renderBoxes(arr.value, arr.name);
    }
  }

  renderBars(arr, name) {
    if (!arr || arr.length === 0) return;

    const padding = 40;
    const labelHeight = 30;
    const width = this.canvasWidth - padding * 2;
    const height = this.canvasHeight - padding - labelHeight;

    const numericArr = arr.map(v => Number(v) || 0);
    const maxVal = Math.max(...numericArr, 1);
    const minVal = Math.min(...numericArr, 0);
    const range = maxVal - minVal || 1;

    const gap = Math.max(2, Math.min(8, width / arr.length / 4));
    const barWidth = (width - gap * (arr.length - 1)) / arr.length;

    this.ctx.font = '14px Inter, sans-serif';
    this.ctx.fillStyle = this.colors.textMuted;
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`${name} (${arr.length} items)`, padding, 20);

    const baseline = padding + labelHeight + height;
    this.ctx.strokeStyle = this.colors.boxBorder;
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(padding, baseline);
    this.ctx.lineTo(padding + width, baseline);
    this.ctx.stroke();

    for (let i = 0; i < arr.length; i++) {
      const value = numericArr[i];
      const barHeight = ((value - minVal) / range) * (height - 20);
      const x = padding + i * (barWidth + gap);
      const y = baseline - barHeight;

      let color = this.colors.bar;
      if (this.comparedIndices.has(i)) color = this.colors.barCompare;
      else if (this.highlightedIndices.has(i)) color = this.colors.barActive;

      this.ctx.fillStyle = color;
      this.ctx.fillRect(x, y, barWidth, barHeight);

      if (barWidth > 20) {
        this.ctx.font = '11px JetBrains Mono, monospace';
        this.ctx.fillStyle = this.colors.text;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(String(value), x + barWidth / 2, y - 5);
      }

      if (barWidth > 15) {
        this.ctx.font = '10px JetBrains Mono, monospace';
        this.ctx.fillStyle = this.colors.textMuted;
        this.ctx.fillText(String(i), x + barWidth / 2, baseline + 15);
      }
    }
  }

  renderBoxes(arr, name) {
    if (!arr || arr.length === 0) return;

    const padding = 20;
    const labelHeight = 30;
    
    const maxBoxesPerRow = Math.min(arr.length, Math.floor((this.canvasWidth - padding * 2) / 60));
    const boxSize = Math.min(50, (this.canvasWidth - padding * 2) / maxBoxesPerRow - 10);
    const gap = 10;

    this.ctx.font = '14px Inter, sans-serif';
    this.ctx.fillStyle = this.colors.textMuted;
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`${name} (${arr.length} items)`, padding, 20);

    for (let i = 0; i < arr.length; i++) {
      const row = Math.floor(i / maxBoxesPerRow);
      const col = i % maxBoxesPerRow;
      const x = padding + col * (boxSize + gap);
      const y = labelHeight + padding + row * (boxSize + gap + 20);

      let bgColor = this.colors.boxBg;
      let borderColor = this.colors.boxBorder;
      
      if (this.comparedIndices.has(i)) {
        bgColor = 'rgba(248, 81, 73, 0.2)';
        borderColor = this.colors.barCompare;
      } else if (this.highlightedIndices.has(i)) {
        bgColor = 'rgba(63, 185, 80, 0.2)';
        borderColor = this.colors.barActive;
      }

      this.ctx.fillStyle = bgColor;
      this.ctx.fillRect(x, y, boxSize, boxSize);
      this.ctx.strokeStyle = borderColor;
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(x, y, boxSize, boxSize);

      const displayValue = this.truncateValue(arr[i], boxSize);
      this.ctx.font = `${boxSize > 40 ? 14 : 11}px JetBrains Mono, monospace`;
      this.ctx.fillStyle = this.colors.text;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(displayValue, x + boxSize / 2, y + boxSize / 2);

      this.ctx.font = '10px JetBrains Mono, monospace';
      this.ctx.fillStyle = this.colors.textMuted;
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(String(i), x + boxSize / 2, y + boxSize + 3);
    }
  }

  renderEmpty() {
    this.ctx.font = '14px Inter, sans-serif';
    this.ctx.fillStyle = this.colors.textMuted;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('No arrays to visualize', this.canvasWidth / 2, this.canvasHeight / 2);
  }

  truncateValue(value, boxSize) {
    const str = String(value);
    const maxChars = Math.floor(boxSize / 8);
    return str.length > maxChars ? str.substring(0, maxChars - 1) + '…' : str;
  }

  clear() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
  }

  setViewMode(mode) {
    this.viewMode = mode;
  }

  setHighlights(highlighted = [], compared = []) {
    this.highlightedIndices = new Set(highlighted);
    this.comparedIndices = new Set(compared);
  }
}

export default ArrayRenderer;
