/**
 * border_controls.js
 * Gestiona los inputs y la lógica para modificar el borde y radio de un elemento.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class BorderControls {
        constructor(options) {
            this.inspectorCore = options.inspectorCore;
            this.historyManager = options.historyManager;
            this.currentElement = null;
            this.inputs = {};
        }

        init(container) {
            const html = `
                <div class="space-y-3 text-xs">
                    <div class="flex items-center space-x-2">
                        <label for="border-width" class="w-1/3">Ancho:</label>
                        <input type="number" id="border-width" class="w-2/3 border-gray-300 rounded-md shadow-sm p-1 text-center" min="0">
                    </div>
                    <div class="flex items-center space-x-2">
                        <label for="border-radius" class="w-1/3">Radio:</label>
                        <input type="number" id="border-radius" class="w-2/3 border-gray-300 rounded-md shadow-sm p-1 text-center" min="0">
                    </div>
                    <div class="flex items-center space-x-2">
                        <label for="border-style" class="w-1/3">Estilo:</label>
                        <select id="border-style" class="w-2/3 border-gray-300 rounded-md shadow-sm p-1">
                            <option value="none">None</option>
                            <option value="solid">Solid</option>
                            <option value="dashed">Dashed</option>
                            <option value="dotted">Dotted</option>
                            <option value="double">Double</option>
                        </select>
                    </div>
                    <div class="flex items-center space-x-2">
                        <label for="border-color" class="w-1/3">Color:</label>
                        <input type="color" id="border-color" class="w-2/3 border-gray-300 rounded-md shadow-sm">
                    </div>
                </div>
            `;
            container.innerHTML = html;

            this.inputs.width = container.querySelector('#border-width');
            this.inputs.radius = container.querySelector('#border-radius');
            this.inputs.style = container.querySelector('#border-style');
            this.inputs.color = container.querySelector('#border-color');

            this.inputs.width.addEventListener('input', () => this.applyStyle('borderWidth', `${this.inputs.width.value}px`));
            this.inputs.radius.addEventListener('input', () => this.applyStyle('borderRadius', `${this.inputs.radius.value}px`));
            this.inputs.style.addEventListener('change', () => this.applyStyle('borderStyle', this.inputs.style.value));
            this.inputs.color.addEventListener('input', () => this.applyStyle('borderColor', this.inputs.color.value));
        }

        applyStyle(property, value) {
            if (!this.currentElement) return;
            this.currentElement.style[property] = value;
            
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => {
                if (this.historyManager) this.historyManager.saveState();
            }, 300);
        }

        // Función de utilidad para convertir RGB a Hex
        rgbToHex(rgb) {
            if (!rgb || rgb.indexOf('rgb') === -1) return '#000000';
            const [r, g, b] = rgb.match(/\d+/g).map(Number);
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        update(element) {
            this.currentElement = element;
            const computedStyle = window.getComputedStyle(element);
            
            this.inputs.width.value = parseInt(computedStyle.borderWidth, 10) || 0;
            this.inputs.radius.value = parseInt(computedStyle.borderRadius, 10) || 0;
            this.inputs.style.value = computedStyle.borderStyle || 'none';
            this.inputs.color.value = this.rgbToHex(computedStyle.borderColor);
        }
    }

    window.EditorTools.BorderControls = BorderControls;
})();
