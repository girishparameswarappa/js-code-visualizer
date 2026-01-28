/**
 * PanelManager - Handles panel visibility, selection, and maximize/minimize
 */

export class PanelManager {
  constructor() {
    this.maxPanels = 4;
  }

  /**
   * Initialize panel management
   */
  init(showToast) {
    this.showToast = showToast || (() => {});
    this.setupPanelSelector();
    this.setupPanelToggles();
    this.setupPanelMaximize();
  }

  /**
   * Setup panel selector dropdown
   */
  setupPanelSelector() {
    const selectorBtn = document.getElementById('panel-selector-btn');
    const dropdown = document.getElementById('panel-selector-dropdown');
    const checkboxes = dropdown?.querySelectorAll('input[type="checkbox"]');
    
    if (!selectorBtn || !dropdown || !checkboxes) return;

    this.updateSelectorText();
    this.updatePanelVisibility();

    selectorBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== selectorBtn) {
        dropdown.style.display = 'none';
      }
    });

    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const checked = Array.from(checkboxes).filter(cb => cb.checked);
        
        if (checked.length > this.maxPanels) {
          checkbox.checked = false;
          this.showToast(`Maximum ${this.maxPanels} panels can be displayed`, 'warning', 2000);
          return;
        }

        this.updatePanelVisibility();
        this.updateSelectorText();
      });
    });
  }

  /**
   * Update panel visibility based on checkboxes
   */
  updatePanelVisibility() {
    const checkboxes = document.querySelectorAll('#panel-selector-dropdown input[type="checkbox"]');
    const visualizationGrid = document.querySelector('.visualization-grid');
    
    if (!visualizationGrid) return;

    checkboxes.forEach(checkbox => {
      const panel = document.querySelector(`[data-panel="${checkbox.value}"]`);
      if (panel) {
        panel.classList.toggle('panel--hidden', !checkbox.checked);
      }
    });

    if (visualizationGrid.classList.contains('visualization-grid--maximized')) {
      visualizationGrid.style.gridTemplateColumns = '1fr';
      visualizationGrid.style.gridTemplateRows = '1fr';
    } else {
      visualizationGrid.style.gridTemplateColumns = '1fr 1fr';
      visualizationGrid.style.gridTemplateRows = '1fr 1fr';
    }
  }

  /**
   * Update selector button text
   */
  updateSelectorText() {
    const selectorText = document.getElementById('panel-selector-text');
    const checkboxes = document.querySelectorAll('#panel-selector-dropdown input[type="checkbox"]');
    
    if (!selectorText) return;

    const checked = Array.from(checkboxes).filter(cb => cb.checked);
    
    if (checked.length === 0) {
      selectorText.textContent = 'No panels selected';
    } else if (checked.length <= 2) {
      const names = checked.map(cb => {
        const label = cb.nextElementSibling.textContent.trim();
        return label.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, '');
      });
      selectorText.textContent = names.join(' + ');
    } else {
      selectorText.textContent = `${checked.length} panels`;
    }
  }

  /**
   * Setup panel collapse toggles
   */
  setupPanelToggles() {
    document.querySelectorAll('.panel-toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const panelType = btn.getAttribute('data-panel');
        const panel = btn.closest('.panel');
        
        if (!panel) return;

        if (panel.classList.contains('panel--collapsed')) {
          panel.classList.remove('panel--collapsed');
          btn.textContent = '−';
        } else {
          this.closePanel(panel, panelType);
        }
      });
    });
  }

  /**
   * Close a panel completely
   */
  closePanel(panel, panelType) {
    const checkbox = document.querySelector(`#panel-selector-dropdown input[value="${panelType}"]`);
    
    if (!checkbox) return;

    if (panel.classList.contains('panel--maximized')) {
      this.minimizePanel(panel);
    }
    
    checkbox.checked = false;
    this.updatePanelVisibility();
    this.updateSelectorText();
  }

  /**
   * Minimize a panel
   */
  minimizePanel(panel) {
    panel.classList.remove('panel--maximized');
    const grid = document.querySelector('.visualization-grid');
    if (grid) grid.classList.remove('visualization-grid--maximized');
    
    const btn = panel.querySelector('.panel-maximize-btn');
    if (btn) {
      btn.textContent = '⛶';
      btn.title = 'Maximize';
    }
  }

  /**
   * Setup panel maximize/minimize
   */
  setupPanelMaximize() {
    const buttons = document.querySelectorAll('.panel-maximize-btn');
    const grid = document.querySelector('.visualization-grid');

    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const panel = btn.closest('.panel');
        
        if (!panel || !grid) return;

        if (panel.classList.contains('panel--maximized')) {
          panel.classList.remove('panel--maximized');
          grid.classList.remove('visualization-grid--maximized');
          btn.textContent = '⛶';
          btn.title = 'Maximize';
          this.updatePanelVisibility();
        } else {
          document.querySelectorAll('.panel--maximized').forEach(p => p.classList.remove('panel--maximized'));
          document.querySelectorAll('.panel-maximize-btn').forEach(b => {
            b.textContent = '⛶';
            b.title = 'Maximize';
          });
          
          panel.classList.remove('panel--hidden');
          panel.classList.add('panel--maximized');
          grid.classList.add('visualization-grid--maximized');
          btn.textContent = '◱';
          btn.title = 'Minimize';
        }
      });
    });

    buttons.forEach(btn => {
      const panel = btn.closest('.panel');
      if (panel?.classList.contains('panel--maximized')) {
        btn.textContent = '◱';
        btn.title = 'Minimize';
      }
    });
  }
}

export default PanelManager;
