/**
 * typography_controls.js
 * Gestiona los inputs y la lógica para modificar la tipografía de un elemento.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class TypographyControls {
        constructor(options) {
            this.inspectorCore = options.inspectorCore;
            this.historyManager = options.historyManager;
            this.currentElement = null;
            this.inputs = {};
            this.buttons = {};
        }

        init(container) {
            const html = `
                <div class="space-y-3 text-xs">
                    <div class="flex items-center space-x-2">
                        <label for="typo-color" class="w-1/4">Color:</label>
                        <input type="color" id="typo-color" class="w-1/4 border-gray-300 rounded-md shadow-sm">
                        <label for="typo-size" class="w-1/4 text-right pr-2">Tamaño:</label>
                        <input type="number" id="typo-size" class="w-1/4 border-gray-300 rounded-md shadow-sm p-1 text-center" min="0">
                    </div>
                    <div class="flex items-center space-x-2">
                        <label for="typo-family" class="w-1/4">Fuente:</label>
                        <select id="typo-family" class="w-3/4 border-gray-300 rounded-md shadow-sm p-1">
                            <option value="sans-serif">Sans-Serif</option>
                            <option value="serif">Serif</option>
                            <option value="monospace">Monospace</option>
                            <option value="Arial">Arial</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Times New Roman">Times New Roman</option>
                        </select>
                    </div>
                    <div class="flex items-center justify-between">
                        <div id="typo-style-group" class="flex items-center space-x-1">
                            <button data-style="fontWeight" data-value="bold" class="px-2 py-1 border rounded font-bold">B</button>
                            <button data-style="fontStyle" data-value="italic" class="px-2 py-1 border rounded italic">I</button>
                            <button data-style="textDecoration" data-value="underline" class="px-2 py-1 border rounded underline">U</button>
                        </div>
                        <div id="typo-align-group" class="flex items-center space-x-1">
                            <button data-align="left" class="px-2 py-1 border rounded">L</button>
                            <button data-align="center" class="px-2 py-1 border rounded">C</button>
                            <button data-align="right" class="px-2 py-1 border rounded">R</button>
                            <button data-align="justify" class="px-2 py-1 border rounded">J</button>
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML = html;

            // Inputs
            this.inputs.color = container.querySelector('#typo-color');
            this.inputs.size = container.querySelector('#typo-size');
            this.inputs.family = container.querySelector('#typo-family');

            // Listeners para inputs
            this.inputs.color.addEventListener('input', () => this.applyStyle('color', this.inputs.color.value));
            this.inputs.size.addEventListener('input', () => this.applyStyle('fontSize', `${this.inputs.size.value}px`));
            this.inputs.family.addEventListener('change', () => this.applyStyle('fontFamily', this.inputs.family.value));

            // Listeners para botones de estilo (Bold, Italic, Underline)
            container.querySelectorAll('#typo-style-group button').forEach(btn => {
                btn.addEventListener('click', () => {
                    const style = btn.dataset.style;
                    const value = btn.dataset.value;
                    const isActive = btn.classList.contains('active');
                    const newValue = isActive ? 'normal' : value;
                    
                    this.applyStyle(style, newValue);
                    this.update(); // Re-evaluar estado
                });
            });

            // Listeners para botones de alineación
            container.querySelectorAll('#typo-align-group button').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.applyStyle('textAlign', btn.dataset.align);
                    this.update(); // Re-evaluar estado
                });
            });
        }

        applyStyle(property, value) {
            if (!this.currentElement) return;
            this.currentElement.style[property] = value;
            
            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => {
                if (this.historyManager) this.historyManager.saveState();
            }, 300);
        }

        rgbToHex(rgb) {
            if (!rgb || rgb.indexOf('rgb') === -1) return '#000000';
            const [r, g, b] = rgb.match(/\d+/g).map(Number);
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        update(element) {
            if (element) this.currentElement = element;
            if (!this.currentElement) return;

            const computedStyle = window.getComputedStyle(this.currentElement);

            // Actualizar inputs
            this.inputs.color.value = this.rgbToHex(computedStyle.color);
            this.inputs.size.value = parseInt(computedStyle.fontSize, 10) || 16;
            this.inputs.family.value = computedStyle.fontFamily.split(',')[0].replace(/"/g, '').trim();

            // Actualizar botones de estilo
            document.querySelectorAll('#typo-style-group button').forEach(btn => {
                const style = btn.dataset.style;
                const value = btn.dataset.value;
                let isActive = false;
                if (style === 'fontWeight') isActive = (computedStyle[style] === 'bold' || parseInt(computedStyle[style]) >= 700);
                else if (style === 'fontStyle') isActive = (computedStyle[style] === 'italic');
                else if (style === 'textDecoration') isActive = computedStyle[style].includes('underline');
                btn.classList.toggle('active', isActive);
            });
            
            // Actualizar botones de alineación
            document.querySelectorAll('#typo-align-group button').forEach(btn => {
                const align = btn.dataset.align;
                btn.classList.toggle('active', computedStyle.textAlign === align);
            });
        }
    }

    window.EditorTools.TypographyControls = TypographyControls;
})();
