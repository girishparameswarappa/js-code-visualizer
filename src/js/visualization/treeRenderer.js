/**
 * TreeRenderer - D3.js based recursion tree visualization
 */

import * as d3 from 'd3';

export class TreeRenderer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      nodeRadius: 8,
      horizontalSpacing: 120,
      verticalSpacing: 60,
      fontSize: 11,
      ...options
    };
    
    this.svg = null;
    this.g = null;
    this.zoom = null;
    this.currentTree = null;
    
    this.colors = {
      nodeDefault: '#21262d',
      nodeActive: '#58a6ff',
      nodeCompleted: '#3fb950',
      nodeBorder: '#58a6ff',
      link: '#30363d',
      text: '#e6edf3',
      textMuted: '#8b949e',
      returnValue: '#a5d6ff'
    };
    
    this.init();
  }

  init() {
    this.container.innerHTML = '';
    
    this.svg = d3.select(this.container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .style('background', 'transparent');
    
    this.g = this.svg.append('g').attr('class', 'tree-group');
    
    this.zoom = d3.zoom()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => this.g.attr('transform', event.transform));
    
    this.svg.call(this.zoom);
    
    this.resizeObserver = new ResizeObserver(() => {
      if (this.currentTree) this.render(this.currentTree);
    });
    this.resizeObserver.observe(this.container);
  }

  render(treeData) {
    if (!treeData) {
      this.renderEmpty();
      return;
    }

    this.currentTree = treeData;
    
    const rect = this.container.getBoundingClientRect();
    const width = rect.width || 400;
    const height = rect.height || 300;

    const root = d3.hierarchy(treeData);
    const treeLayout = d3.tree().nodeSize([this.options.verticalSpacing, this.options.horizontalSpacing]);
    treeLayout(root);

    const bounds = this.calculateBounds(root);
    this.g.selectAll('*').remove();
    
    this.renderLinks(root);
    this.renderNodes(root);
    this.centerTree(width, height, bounds);
  }

  calculateBounds(root) {
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    root.each(d => {
      x1 = Math.max(x1, d.x);
      x0 = Math.min(x0, d.x);
      y1 = Math.max(y1, d.y);
      y0 = Math.min(y0, d.y);
    });
    return { x0, x1, y0, y1 };
  }

  renderLinks(root) {
    this.g.append('g')
      .attr('class', 'links')
      .selectAll('path')
      .data(root.links())
      .enter()
      .append('path')
      .attr('fill', 'none')
      .attr('stroke', this.colors.link)
      .attr('stroke-width', 1.5)
      .attr('d', d3.linkHorizontal().x(d => d.y).y(d => d.x));
  }

  renderNodes(root) {
    const nodes = this.g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', d => `tree-node${d.data.isActive ? ' tree-node--active' : ''}${d.data.hasReturned ? ' tree-node--completed' : ''}`)
      .attr('transform', d => `translate(${d.y},${d.x})`);

    nodes.append('circle')
      .attr('r', this.options.nodeRadius)
      .attr('fill', d => d.data.isActive ? this.colors.nodeActive : d.data.hasReturned ? this.colors.nodeCompleted : this.colors.nodeDefault)
      .attr('stroke', d => d.data.isActive ? this.colors.nodeActive : d.data.hasReturned ? this.colors.nodeCompleted : this.colors.nodeBorder)
      .attr('stroke-width', 2);

    nodes.append('text')
      .attr('dy', '0.31em')
      .attr('x', d => d.children ? -12 : 12)
      .attr('text-anchor', d => d.children ? 'end' : 'start')
      .attr('fill', this.colors.text)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', `${this.options.fontSize}px`)
      .text(d => `${d.data.name}(${d.data.arguments || ''})`);

    nodes.filter(d => d.data.hasReturned)
      .append('text')
      .attr('dy', '1.5em')
      .attr('x', d => d.children ? -12 : 12)
      .attr('text-anchor', d => d.children ? 'end' : 'start')
      .attr('fill', this.colors.returnValue)
      .attr('font-family', 'JetBrains Mono, monospace')
      .attr('font-size', `${this.options.fontSize - 1}px`)
      .text(d => `→ ${d.data.returnValue}`);
  }

  centerTree(width, height, bounds) {
    const { x0, x1, y0, y1 } = bounds;
    const treeWidth = y1 - y0 + this.options.horizontalSpacing * 2;
    const treeHeight = x1 - x0 + this.options.verticalSpacing * 2;
    
    const scale = Math.min(width / treeWidth, height / treeHeight, 1) * 0.9;
    const translateX = (width - treeWidth * scale) / 2 - y0 * scale + this.options.horizontalSpacing * scale;
    const translateY = (height - treeHeight * scale) / 2 - x0 * scale + this.options.verticalSpacing * scale;

    this.svg.call(this.zoom.transform, d3.zoomIdentity.translate(translateX, translateY).scale(scale));
  }

  renderEmpty() {
    this.g.selectAll('*').remove();
    const rect = this.container.getBoundingClientRect();
    
    this.g.append('text')
      .attr('x', rect.width / 2)
      .attr('y', rect.height / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', this.colors.textMuted)
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-size', '14px')
      .text('Run recursive code to see call tree');
    
    this.svg.call(this.zoom.transform, d3.zoomIdentity);
  }

  clear() {
    this.currentTree = null;
    this.renderEmpty();
  }

  destroy() {
    if (this.resizeObserver) this.resizeObserver.disconnect();
    this.container.innerHTML = '';
  }
}

export default TreeRenderer;
