/**
 * pattern_controls.js
 * Gestiona los controles para aplicar patrones de fondo (texturas) a los elementos.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    const PATTERNS = {
        'none': { name: 'Ninguno' },
        'lines-diagonal': { name: 'Líneas Diagonales', generator: (c) => `repeating-linear-gradient(45deg, ${c}, ${c} 1px, transparent 1px, transparent 5px)` },
        'dots': { name: 'Puntos', generator: (c) => `repeating-radial-gradient(circle at center, ${c} 0, ${c} 1px, transparent 1px, transparent 100%)` },
        'checkers': { name: 'Cuadrícula', generator: (c) => `repeating-linear-gradient(0deg, ${c}, ${c} 1px, transparent 1px, transparent 10px), repeating-linear-gradient(90deg, ${c}, ${c} 1px, transparent 1px, transparent 10px)`},
        'zigzag': { name: 'ZigZag', generator: (c) => `repeating-linear-gradient(135deg, transparent, transparent 4px, ${c} 4px, ${c} 8px), repeating-linear-gradient(45deg, transparent, transparent 4px, ${c} 4px, ${c} 8px)`},
        'triangles': { name: 'Triángulos', generator: (c) => `repeating-linear-gradient(60deg, transparent, transparent 9px, ${c} 9px, ${c} 10px), repeating-linear-gradient(120deg, transparent, transparent 9px, ${c} 9px, ${c} 10px)` },
    };

    class PatternControls {
        constructor(options) {
            this.inspectorCore = options.inspectorCore;
            this.historyManager = options.historyManager;
            this.currentElement = null;
            this.state = this.getDefaults();
            this.ensureStyleTagExists();
        }

        getDefaults() {
            return { patternName: 'none', scale: 20, rotation: 0, patternColor: 'rgba(0,0,0,0.1)', bgColor: 'rgba(255,255,255,0)' };
        }

        ensureStyleTagExists() {
            if (!document.getElementById('dynamic-pseudo-styles')) {
                const styleTag = document.createElement('style');
                styleTag.id = 'dynamic-pseudo-styles';
                document.head.appendChild(styleTag);
            }
            this.dynamicStyleSheet = document.getElementById('dynamic-pseudo-styles').sheet;
        }

        init(container) {
            this.container = container;
            let patternButtonsHTML = '';
            Object.keys(PATTERNS).forEach(key => {
                patternButtonsHTML += `<button data-pattern="${key}" title="${PATTERNS[key].name}" class="h-10 border-2 border-transparent rounded-md"></button>`;
            });

            const html = `
                <div class="space-y-3 text-xs">
                    <label class="font-semibold block">Biblioteca de Patrones</label>
                    <div class="grid grid-cols-5 gap-1" id="pattern-grid">${patternButtonsHTML}</div>
                    <div id="pattern-settings" class="space-y-2">
                        <div><label>Escala:</label><input type="range" data-prop="scale" min="5" max="100" class="w-full"></div>
                        <div><label>Rotación:</label><input type="range" data-prop="rotation" min="0" max="359" class="w-full"></div>
                        <div><label>Color Patrón:</label><input type="color" data-prop="patternColor"></div>
                        <div><label>Color Fondo:</label><input type="color" data-prop="bgColor"></div>
                    </div>
                </div>`;
            container.innerHTML = html;

            // Setup pattern buttons
            container.querySelectorAll('#pattern-grid button').forEach(btn => {
                const key = btn.dataset.pattern;
                if (key === 'none') {
                    btn.innerHTML = `X`; // Simple 'none' representation
                    btn.style.backgroundColor = '#f3f4f6';
                } else {
                    btn.style.backgroundImage = PATTERNS[key].generator('rgba(0,0,0,0.2)');
                    btn.style.backgroundSize = '20px 20px';
                }
                btn.addEventListener('click', () => {
                    this.state.patternName = key;
                    this.updatePseudoElementStyle();
                    this.updateUI();
                });
            });

            // Setup sliders and colors
            ['scale', 'rotation', 'patternColor', 'bgColor'].forEach(prop => {
                const input = container.querySelector(`[data-prop="${prop}"]`);
                input.addEventListener('input', (e) => {
                    this.state[prop] = e.target.type === 'range' ? parseFloat(e.target.value) : e.target.value;
                    this.updatePseudoElementStyle();
                });
            });
        }
        
        updatePseudoElementStyle() {
            if (!this.currentElement) return;
            
            const selector = `[data-inspector-id="${this.currentElement.dataset.inspectorId}"]::before`;
            
            // Remove previous rule for this element
            try {
                const rules = Array.from(this.dynamicStyleSheet.cssRules);
                const ruleIndex = rules.findIndex(r => r.selectorText === selector);
                if (ruleIndex > -1) {
                    this.dynamicStyleSheet.deleteRule(ruleIndex);
                }
            } catch (e) { /* Fails on cross-origin, ignore */ }

            if (this.state.patternName === 'none') {
                this.currentElement.style.backgroundColor = '';
                this.historyManager.saveState();
                return;
            }

            const pattern = PATTERNS[this.state.patternName];
            if (!pattern) return;

            const newRule = `
                ${selector} {
                    content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 0;
                    background-image: ${pattern.generator(this.state.patternColor)};
                    background-size: ${this.state.scale}px;
                    transform: rotate(${this.state.rotation}deg);
                }`;
            this.dynamicStyleSheet.insertRule(newRule, this.dynamicStyleSheet.cssRules.length);
            this.currentElement.style.backgroundColor = this.state.bgColor;
            
            if (!['relative', 'absolute', 'fixed', 'sticky'].includes(window.getComputedStyle(this.currentElement).position)) {
                this.currentElement.style.position = 'relative';
            }
             this.currentElement.style.zIndex =  window.getComputedStyle(this.currentElement).zIndex === 'auto' ? 1:  window.getComputedStyle(this.currentElement).zIndex;

            this.historyManager.saveState();
        }

        updateUI() {
            // Update sliders and colors based on state
            this.container.querySelector('[data-prop="scale"]').value = this.state.scale;
            this.container.querySelector('[data-prop="rotation"]').value = this.state.rotation;
            this.container.querySelector('[data-prop="patternColor"]').value = this.state.patternColor;
            this.container.querySelector('[data-prop="bgColor"]').value = this.state.bgColor;

            // Highlight active pattern
            this.container.querySelectorAll('#pattern-grid button').forEach(btn => {
                btn.classList.toggle('border-indigo-500', btn.dataset.pattern === this.state.patternName);
            });
        }
        
        update(element) {
            this.currentElement = element;
            this.state = this.getDefaults(); // Reset to defaults
            
            // Simple parsing for now. A more robust solution would parse the dynamic stylesheet.
            if (window.getComputedStyle(element).backgroundImage.includes('gradient')) {
                // This is a basic check. Your full parsing logic from the uploaded file is more robust.
                // For now, we assume if a gradient exists, we don't show a pattern.
            }
            this.updateUI();
        }
    }

    window.EditorTools.PatternControls = PatternControls;
})();
