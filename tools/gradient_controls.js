/**
 * gradient_controls.js
 * Gestiona los controles para fondos sólidos y degradados.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class GradientControls {
        constructor(options) {
            this.inspectorCore = options.inspectorCore;
            this.historyManager = options.historyManager;
            this.currentElement = null;
            this.gradients = [];
        }

        init(container) {
            this.container = container;
            const html = `
                <div class="flex items-center border rounded-md p-0.5 text-xs mb-2">
                    <button data-mode="solid" class="w-1/2 px-2 py-0.5 rounded-md active">Sólido</button>
                    <button data-mode="gradient" class="w-1/2 px-2 py-0.5 rounded-md">Degradado</button>
                </div>
                <div data-content="solid">
                    <div class="flex items-center space-x-2">
                        <label class="text-xs w-1/4">Color:</label>
                        <input type="color" id="solid-bg-color" class="w-1/4 h-7 p-0 border-none">
                    </div>
                </div>
                <div data-content="gradient" class="hidden">
                    <div id="gradient-list-container" class="space-y-2"></div>
                    <button id="add-gradient-btn" class="w-full text-xs mt-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">+ Añadir Degradado</button>
                </div>
            `;
            container.innerHTML = html;

            this.solidBtn = container.querySelector('[data-mode="solid"]');
            this.gradientBtn = container.querySelector('[data-mode="gradient"]');
            this.solidContent = container.querySelector('[data-content="solid"]');
            this.gradientContent = container.querySelector('[data-content="gradient"]');
            this.solidColorInput = container.querySelector('#solid-bg-color');
            this.gradientListContainer = container.querySelector('#gradient-list-container');
            this.addGradientBtn = container.querySelector('#add-gradient-btn');

            this.solidBtn.addEventListener('click', () => this.setMode('solid'));
            this.gradientBtn.addEventListener('click', () => this.setMode('gradient'));
            this.solidColorInput.addEventListener('input', () => this.applySolidColor());
            this.addGradientBtn.addEventListener('click', () => this.addGradient());
        }

        setMode(mode) {
            this.solidBtn.classList.toggle('active', mode === 'solid');
            this.gradientBtn.classList.toggle('active', mode === 'gradient');
            this.solidContent.classList.toggle('hidden', mode !== 'solid');
            this.gradientContent.classList.toggle('hidden', mode === 'solid');

            if (mode === 'solid') {
                this.currentElement.style.backgroundImage = 'none';
                this.applySolidColor();
            } else {
                this.currentElement.style.backgroundColor = 'transparent';
                if (this.gradients.length === 0) this.addGradient();
                else this.applyAllGradients();
            }
        }

        applySolidColor() {
            if (!this.currentElement) return;
            this.currentElement.style.backgroundColor = this.solidColorInput.value;
            this.historyManager.saveState();
        }

        addGradient() {
            this.gradients.push({
                type: 'linear', angle: 180, stops: [{ color: '#ffffff', pos: 0 }, { color: '#000000', pos: 100 }]
            });
            this.renderGradients();
            this.applyAllGradients();
        }

        applyAllGradients() {
            if (!this.currentElement) return;
            const gradientStrings = this.gradients.map(grad => {
                const stopsString = grad.stops.map(s => `${s.color} ${s.pos}%`).join(', ');
                return `linear-gradient(${grad.angle}deg, ${stopsString})`;
            });
            this.currentElement.style.backgroundImage = gradientStrings.join(', ');
            this.historyManager.saveState();
        }

        renderGradients() {
            this.gradientListContainer.innerHTML = '';
            this.gradients.forEach((grad, index) => {
                const gradUI = this.createSingleGradientUI(grad, index);
                this.gradientListContainer.appendChild(gradUI);
            });
        }
        
        createSingleGradientUI(grad, index) {
            const wrapper = document.createElement('div');
            wrapper.className = 'p-2 border rounded bg-gray-50 text-xs relative';
            // Simple UI for now: angle and stops
            wrapper.innerHTML += `
                <button data-remove-index="${index}" class="absolute top-0 right-1 text-gray-400 hover:text-red-500 font-bold">&times;</button>
                <div class="flex items-center space-x-2">
                    <label>Ángulo:</label>
                    <input type="number" value="${grad.angle}" data-prop="angle" class="w-full p-1 border rounded">
                </div>
                <div class="mt-2 space-y-1" data-stops-container></div>
                <button data-add-stop class="w-full text-xs mt-2 py-1 bg-gray-200 rounded hover:bg-gray-300">+ Parada</button>
            `;

            const stopsContainer = wrapper.querySelector('[data-stops-container]');
            grad.stops.forEach((stop, stopIndex) => {
                const stopUI = this.createStopUI(grad, stop, stopIndex);
                stopsContainer.appendChild(stopUI);
            });

            // Event Listeners
            wrapper.querySelector('[data-prop="angle"]').addEventListener('input', (e) => {
                grad.angle = parseInt(e.target.value) || 0;
                this.applyAllGradients();
            });
            wrapper.querySelector('[data-remove-index]').addEventListener('click', () => {
                this.gradients.splice(index, 1);
                this.renderGradients();
                this.applyAllGradients();
            });
            wrapper.querySelector('[data-add-stop]').addEventListener('click', () => {
                grad.stops.push({ color: '#000000', pos: 100 });
                this.renderGradients();
                this.applyAllGradients();
            });

            return wrapper;
        }

        createStopUI(grad, stop, stopIndex) {
            const stopWrapper = document.createElement('div');
            stopWrapper.className = 'flex items-center space-x-2';
            stopWrapper.innerHTML = `
                <input type="color" value="${stop.color}" class="w-6 h-6 p-0 border-none">
                <input type="range" min="0" max="100" value="${stop.pos}" class="w-full">
                <span>${stop.pos}%</span>
                <button class="text-red-500 font-bold">&times;</button>
            `;
            
            const [colorInput, posInput, , removeBtn] = stopWrapper.children;

            colorInput.addEventListener('input', (e) => {
                stop.color = e.target.value;
                this.applyAllGradients();
            });
            posInput.addEventListener('input', (e) => {
                stop.pos = parseInt(e.target.value);
                this.renderGradients();
                this.applyAllGradients();
            });
            removeBtn.addEventListener('click', () => {
                if (grad.stops.length > 2) {
                    grad.stops.splice(stopIndex, 1);
                    this.renderGradients();
                    this.applyAllGradients();
                }
            });

            return stopWrapper;
        }
        
        rgbToHex(rgb) {
            if (!rgb || !rgb.startsWith('rgb')) return '#000000';
            const [r, g, b] = rgb.match(/\d+/g).map(Number);
            return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
        }

        update(element) {
            this.currentElement = element;
            const computedStyle = window.getComputedStyle(element);

            if (computedStyle.backgroundImage !== 'none') {
                this.setMode('gradient');
                // Basic parsing for single linear gradient
                const matches = computedStyle.backgroundImage.matchAll(/rgba?\(.+?\)|#\w+/g);
                this.gradients = [{
                    type: 'linear',
                    angle: parseInt(computedStyle.backgroundImage.match(/(\d+)deg/)?.[1] || 180),
                    stops: [...matches].map((match, i) => ({ color: this.rgbToHex(match[0]), pos: i * 100 }))
                }];
                this.renderGradients();
            } else {
                this.setMode('solid');
                this.solidColorInput.value = this.rgbToHex(computedStyle.backgroundColor);
            }
        }
    }

    window.EditorTools.GradientControls = GradientControls;
})();
