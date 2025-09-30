/**
 * positioning_controls.js
 * Gestiona los controles para el posicionamiento y la visualización de un elemento.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class PositioningControls {
        constructor(options) {
            this.inspectorCore = options.inspectorCore;
            this.historyManager = options.historyManager;
            this.currentElement = null;
            this.inputs = {};
        }

        init(container) {
            this.container = container;
            const html = `
                <div class.space-y-3 text-xs">
                    <div class="flex items-center space-x-2 mb-2">
                        <label for="pos-position" class="w-1/3">Position:</label>
                        <select id="pos-position" data-prop="position" class="w-2/3 p-1 border rounded">
                            <option value="static">Static</option>
                            <option value="relative">Relative</option>
                            <option value="absolute">Absolute</option>
                            <option value="fixed">Fixed</option>
                            <option value="sticky">Sticky</option>
                        </select>
                    </div>
                    <div id="pos-coords-container" class="space-y-2 border-t pt-2 mt-2 hidden">
                        <div class="grid grid-cols-2 gap-2">
                            <div><label>Top:</label><input type="text" data-prop="top" class="w-full p-1 border rounded" placeholder="auto"></div>
                            <div><label>Bottom:</label><input type="text" data-prop="bottom" class="w-full p-1 border rounded" placeholder="auto"></div>
                            <div><label>Left:</label><input type="text" data-prop="left" class="w-full p-1 border rounded" placeholder="auto"></div>
                            <div><label>Right:</label><input type="text" data-prop="right" class="w-full p-1 border rounded" placeholder="auto"></div>
                        </div>
                        <div>
                            <label>Z-Index:</label>
                            <input type="number" data-prop="zIndex" class="w-full p-1 border rounded" placeholder="auto">
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML = html;

            this.inputs.position = container.querySelector('[data-prop="position"]');
            this.coordsContainer = container.querySelector('#pos-coords-container');
            
            ['top', 'bottom', 'left', 'right', 'zIndex'].forEach(prop => {
                this.inputs[prop] = container.querySelector(`[data-prop="${prop}"]`);
                this.inputs[prop].addEventListener('change', (e) => this.applyStyle(prop, e.target.value));
            });

            this.inputs.position.addEventListener('change', (e) => {
                this.applyStyle('position', e.target.value);
                this.toggleCoordsUI(e.target.value);
            });
        }

        toggleCoordsUI(positionValue) {
            if (['relative', 'absolute', 'fixed', 'sticky'].includes(positionValue)) {
                this.coordsContainer.classList.remove('hidden');
            } else {
                this.coordsContainer.classList.add('hidden');
            }
        }

        applyStyle(property, value) {
            if (!this.currentElement) return;
            const finalValue = value.trim();
            this.currentElement.style[property] = finalValue ? (/^\d+$/.test(finalValue) && property !== 'zIndex' ? `${finalValue}px` : finalValue) : '';
            this.historyManager.saveState();
        }

        update(element) {
            this.currentElement = element;
            const style = window.getComputedStyle(element);
            const position = style.position;
            
            this.inputs.position.value = position;
            this.toggleCoordsUI(position);

            ['top', 'bottom', 'left', 'right', 'zIndex'].forEach(prop => {
                this.inputs[prop].value = element.style[prop] || '';
            });
        }
    }

    window.EditorTools.PositioningControls = PositioningControls;
})();
