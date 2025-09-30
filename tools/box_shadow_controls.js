/**
 * box_shadow_controls.js
 * Gestiona los inputs y la lógica para la propiedad CSS `box-shadow`.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class BoxShadowControls {
        constructor(options) {
            this.inspectorCore = options.inspectorCore;
            this.historyManager = options.historyManager;
            this.currentElement = null;
            this.shadows = [];
            this.maxShadows = 5;
            this.container = null;
        }

        init(container) {
            this.container = container;
            const html = `
                <button id="box-shadow-add-btn" class="bg-blue-100 text-blue-700 text-xs font-semibold py-1 px-2 rounded hover:bg-blue-200 mb-2">+ Añadir Sombra</button>
                <div id="box-shadow-list" class="space-y-2"></div>
            `;
            container.innerHTML = html;

            this.addButton = container.querySelector('#box-shadow-add-btn');
            this.shadowListContainer = container.querySelector('#box-shadow-list');

            this.addButton.addEventListener('click', () => this.addShadow());
        }

        applyAllShadows() {
            if (!this.currentElement) return;
            const shadowStrings = this.shadows.map(s => {
                const inset = s.isInset ? 'inset ' : '';
                return `${inset}${s.offsetX}px ${s.offsetY}px ${s.blur}px ${s.spread}px ${s.color}`;
            });
            this.currentElement.style.boxShadow = shadowStrings.length > 0 ? shadowStrings.join(', ') : 'none';
            
            if (this.historyManager) this.historyManager.saveState();
        }
        
        addShadow() {
            if (this.shadows.length < this.maxShadows) {
                this.shadows.push({ offsetX: 0, offsetY: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.5)', isInset: false });
                this.renderShadows();
                this.applyAllShadows();
            }
        }

        renderShadows() {
            this.shadowListContainer.innerHTML = '';
            this.shadows.forEach((shadow, index) => {
                const shadowUI = this.createSingleShadowUI(shadow, index);
                this.shadowListContainer.appendChild(shadowUI);
            });
            this.addButton.disabled = this.shadows.length >= this.maxShadows;
            this.addButton.style.opacity = this.shadows.length >= this.maxShadows ? '0.5' : '1';
        }

        createSingleShadowUI(shadow, index) {
            const wrapper = document.createElement('div');
            wrapper.className = 'p-2 border rounded bg-gray-50 relative text-xs';
            
            wrapper.innerHTML = `
                <button class="absolute top-0 right-1 text-gray-400 hover:text-red-500 font-bold" data-remove-index="${index}">&times;</button>
                <div class="grid grid-cols-2 gap-2 mb-2">
                    <div>
                        <label class="block">Tipo</label>
                        <select data-prop="isInset" class="w-full p-1 border rounded">
                            <option value="exterior">Exterior</option>
                            <option value="interior">Interior</option>
                        </select>
                    </div>
                    <div>
                        <label class="block">Color</label>
                        <input type="color" data-prop="color-picker" class="w-full h-7 p-0 border-none cursor-pointer">
                    </div>
                </div>
                <div class="grid grid-cols-4 gap-2">
                    <div><label class="block">X</label><input type="number" data-prop="offsetX" value="${shadow.offsetX}" class="w-full p-1 border rounded"></div>
                    <div><label class="block">Y</label><input type="number" data-prop="offsetY" value="${shadow.offsetY}" class="w-full p-1 border rounded"></div>
                    <div><label class="block">Blur</label><input type="number" data-prop="blur" value="${shadow.blur}" class="w-full p-1 border rounded"></div>
                    <div><label class="block">Spread</label><input type="number" data-prop="spread" value="${shadow.spread}" class="w-full p-1 border rounded"></div>
                </div>
            `;

            const typeSelect = wrapper.querySelector('[data-prop="isInset"]');
            typeSelect.value = shadow.isInset ? 'interior' : 'exterior';
            typeSelect.addEventListener('change', (e) => {
                shadow.isInset = e.target.value === 'interior';
                this.applyAllShadows();
            });
            
            const colorPicker = wrapper.querySelector('[data-prop="color-picker"]');
            colorPicker.value = this.rgbToHex(shadow.color);
            colorPicker.addEventListener('input', (e) => {
                shadow.color = e.target.value;
                this.applyAllShadows();
            });

            ['offsetX', 'offsetY', 'blur', 'spread'].forEach(prop => {
                const input = wrapper.querySelector(`[data-prop="${prop}"]`);
                input.addEventListener('input', (e) => {
                    shadow[prop] = parseInt(e.target.value) || 0;
                    this.applyAllShadows();
                });
            });

            wrapper.querySelector('[data-remove-index]').addEventListener('click', () => {
                this.shadows.splice(index, 1);
                this.renderShadows();
                this.applyAllShadows();
            });

            return wrapper;
        }

        rgbToHex(rgb) {
            if (!rgb || rgb.indexOf('rgb') === -1) return '#000000';
            const [r, g, b] = rgb.match(/\d+/g).map(Number);
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        }

        update(element) {
            this.currentElement = element;
            const computedBoxShadow = window.getComputedStyle(element).boxShadow;
            
            this.shadows = [];
            if (computedBoxShadow && computedBoxShadow !== 'none') {
                const allBoxShadows = computedBoxShadow.split(/,(?![^\(]*\))/);
                this.shadows = allBoxShadows.map(s => {
                    const isInset = s.includes('inset');
                    const cleanShadow = s.replace('inset', '').trim();
                    const colorMatch = cleanShadow.match(/(rgba?\(.+?\))\s*$/);
                    let color = 'rgb(0, 0, 0)';
                    let valuesStr = cleanShadow;
                    if (colorMatch) {
                        color = colorMatch[0];
                        valuesStr = cleanShadow.substring(0, colorMatch.index).trim();
                    }
                    const values = valuesStr.split(/\s+/).map(v => parseInt(v, 10));
                    return { offsetX: values[0] || 0, offsetY: values[1] || 0, blur: values[2] || 0, spread: values[3] || 0, color: color, isInset: isInset };
                });
            }
            this.renderShadows();
        }
    }

    window.EditorTools.BoxShadowControls = BoxShadowControls;
})();
