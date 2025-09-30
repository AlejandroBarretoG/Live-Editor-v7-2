/**
 * transform_controls.js
 * Gestiona los inputs para modificar las transformaciones CSS de un elemento.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class TransformControls {
        constructor(options) {
            this.inspectorCore = options.inspectorCore;
            this.historyManager = options.historyManager;
            this.currentElement = null;
            this.transformState = this.getDefaults();
            this.inputs = {};
        }

        getDefaults() {
            return { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1, rotate: 0, skewX: 0, skewY: 0 };
        }

        init(container) {
            const html = `
                <div class="space-y-3 text-xs">
                    <p class="font-semibold">Trasladar</p>
                    <div class="grid grid-cols-2 gap-2">
                        <div><label class="block">X (px)</label><input type="number" data-prop="translateX" class="w-full p-1 border rounded"></div>
                        <div><label class="block">Y (px)</label><input type="number" data-prop="translateY" class="w-full p-1 border rounded"></div>
                    </div>
                    <p class="font-semibold">Escalar</p>
                    <div class="grid grid-cols-2 gap-2">
                        <div><label class="block">X</label><input type="number" step="0.01" data-prop="scaleX" class="w-full p-1 border rounded"></div>
                        <div><label class="block">Y</label><input type="number" step="0.01" data-prop="scaleY" class="w-full p-1 border rounded"></div>
                    </div>
                    <p class="font-semibold">Rotar</p>
                    <div><label class="block">Z (°)</label><input type="number" data-prop="rotate" class="w-full p-1 border rounded"></div>
                    <p class="font-semibold">Inclinar</p>
                    <div class="grid grid-cols-2 gap-2">
                        <div><label class="block">X (°)</label><input type="number" data-prop="skewX" class="w-full p-1 border rounded"></div>
                        <div><label class="block">Y (°)</label><input type="number" data-prop="skewY" class="w-full p-1 border rounded"></div>
                    </div>
                </div>
            `;
            container.innerHTML = html;

            Object.keys(this.getDefaults()).forEach(prop => {
                const input = container.querySelector(`[data-prop="${prop}"]`);
                this.inputs[prop] = input;
                input.addEventListener('input', () => {
                    const defaultValue = (prop.startsWith('scale')) ? 1 : 0;
                    this.transformState[prop] = parseFloat(input.value) || defaultValue;
                    this.applyTransforms();
                });
            });
        }

        parseTransform(transformString) {
            const state = this.getDefaults();
            if (!transformString || transformString === 'none') return state;

            const regexes = {
                translateX: /translateX\(([^p]+)px\)/,
                translateY: /translateY\(([^p]+)px\)/,
                scaleX: /scaleX\(([^)]+)\)/,
                scaleY: /scaleY\(([^)]+)\)/,
                rotate: /rotate\(([^d]+)deg\)/,
                skewX: /skewX\(([^d]+)deg\)/,
                skewY: /skewY\(([^d]+)deg\)/
            };
            
            for (const [key, regex] of Object.entries(regexes)) {
                const match = transformString.match(regex);
                if (match) state[key] = parseFloat(match[1]);
            }
            return state;
        }

        applyTransforms() {
            if (!this.currentElement) return;
            const { translateX, translateY, scaleX, scaleY, rotate, skewX, skewY } = this.transformState;
            const parts = [];
            if (translateX !== 0 || translateY !== 0) parts.push(`translate(${translateX}px, ${translateY}px)`);
            if (scaleX !== 1 || scaleY !== 1) parts.push(`scale(${scaleX}, ${scaleY})`);
            if (rotate !== 0) parts.push(`rotate(${rotate}deg)`);
            if (skewX !== 0 || skewY !== 0) parts.push(`skew(${skewX}deg, ${skewY}deg)`);
            
            this.currentElement.style.transform = parts.join(' ') || 'none';
            if (this.historyManager) this.historyManager.saveState();
        }

        update(element) {
            this.currentElement = element;
            this.transformState = this.parseTransform(element.style.transform);
            
            Object.keys(this.inputs).forEach(prop => {
                this.inputs[prop].value = this.transformState[prop];
            });
        }
    }

    window.EditorTools.TransformControls = TransformControls;
})();
