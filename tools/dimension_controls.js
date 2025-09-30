/**
 * dimension_controls.js
 * Gestiona los inputs y la lógica para modificar las dimensiones de un elemento.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class DimensionControls {
        constructor(options) {
            this.inspectorCore = options.inspectorCore;
            this.historyManager = options.historyManager;
            this.currentElement = null;
            this.inputs = {};
        }

        init(container) {
            const properties = [
                { id: 'width', name: 'Ancho' },
                { id: 'height', name: 'Alto' },
                { id: 'min-width', name: 'Ancho Mín.' },
                { id: 'max-width', name: 'Ancho Máx.' },
                { id: 'min-height', name: 'Alto Mín.' },
                { id: 'max-height', name: 'Alto Máx.' }
            ];

            let html = '<div class="space-y-2">';
            properties.forEach(prop => {
                html += `
                    <div class="flex items-center space-x-2 text-xs">
                        <label for="dim-${prop.id}" class="w-1/3">${prop.name}:</label>
                        <input type="text" id="dim-${prop.id}" data-prop="${prop.id}" class="w-2/3 border-gray-300 rounded-md shadow-sm p-1 text-center" placeholder="auto">
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;

            properties.forEach(prop => {
                const input = container.querySelector(`#dim-${prop.id}`);
                this.inputs[prop.id] = input;
                input.addEventListener('change', () => this.applyDimension(prop.id));
            });
        }

        applyDimension(property) {
            if (!this.currentElement) return;
            const value = this.inputs[property].value.trim();
            
            if (!value) {
                this.currentElement.style[property] = '';
            } else {
                this.currentElement.style[property] = /^\d+$/.test(value) ? `${value}px` : value;
            }
            
            if (this.historyManager) this.historyManager.saveState();
        }

        update(element) {
            this.currentElement = element;
            
            Object.keys(this.inputs).forEach(prop => {
                // Leemos el estilo en línea para obtener el valor exacto que el usuario ha puesto (ej: '50%'),
                // en lugar del valor computado en píxeles.
                const value = element.style[prop] || ''; 
                this.inputs[prop].value = value;
            });
        }
    }

    window.EditorTools.DimensionControls = DimensionControls;
})();
