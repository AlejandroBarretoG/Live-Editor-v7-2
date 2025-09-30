/**
 * layout_controls.js
 * Gestiona los controles para las propiedades de layout (Display, Flexbox, Grid).
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class LayoutControls {
        constructor(options) {
            this.inspectorCore = options.inspectorCore;
            this.historyManager = options.historyManager;
            this.currentElement = null;
            this.container = null;
        }

        init(container) {
            this.container = container;
        }

        applyStyle(property, value) {
            if (!this.currentElement) return;
            this.currentElement.style[property] = value;
            this.historyManager.saveState();
            // Re-render to show/hide contextual controls
            this.update(this.currentElement);
        }

        createSelect(label, property, options) {
            const currentValue = this.currentElement.style[property] || window.getComputedStyle(this.currentElement)[property];
            let optionsHTML = options.map(opt => `<option value="${opt}" ${currentValue === opt ? 'selected' : ''}>${opt}</option>`).join('');
            
            const wrapper = document.createElement('div');
            wrapper.className = 'flex items-center space-x-2';
            wrapper.innerHTML = `<label class="w-1/3">${label}:</label>`;
            
            const select = document.createElement('select');
            select.className = 'w-2/3 p-1 border rounded';
            select.innerHTML = optionsHTML;
            select.addEventListener('change', (e) => this.applyStyle(property, e.target.value));
            
            wrapper.appendChild(select);
            return wrapper;
        }

        createInput(label, property) {
            const currentValue = this.currentElement.style[property] || 'auto';
            const wrapper = document.createElement('div');
            wrapper.className = 'flex items-center space-x-2';
            wrapper.innerHTML = `<label class="w-1/3">${label}:</label>`;

            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'w-2/3 p-1 border rounded';
            input.value = currentValue;
            input.addEventListener('change', (e) => this.applyStyle(property, e.target.value));

            wrapper.appendChild(input);
            return wrapper;
        }

        update(element) {
            this.currentElement = element;
            this.container.innerHTML = ''; // Clear previous controls
            
            const mainControls = document.createElement('div');
            mainControls.className = 'space-y-2 text-xs';
            
            // --- Display ---
            mainControls.appendChild(this.createSelect('Display', 'display', ['block', 'inline-block', 'flex', 'grid', 'inline-flex', 'none']));
            
            const computedStyle = window.getComputedStyle(element);

            // --- Flex Container ---
            if (computedStyle.display.includes('flex')) {
                const flexGroup = document.createElement('div');
                flexGroup.className = 'mt-3 pt-3 border-t space-y-2';
                flexGroup.innerHTML = `<label class="font-semibold block">Flex Container</label>`;
                flexGroup.appendChild(this.createSelect('Direction', 'flexDirection', ['row', 'row-reverse', 'column', 'column-reverse']));
                flexGroup.appendChild(this.createSelect('Justify', 'justifyContent', ['flex-start', 'flex-end', 'center', 'space-between', 'space-around']));
                flexGroup.appendChild(this.createSelect('Align', 'alignItems', ['flex-start', 'flex-end', 'center', 'baseline', 'stretch']));
                flexGroup.appendChild(this.createInput('Gap', 'gap'));
                mainControls.appendChild(flexGroup);
            }

            // --- Grid Container ---
            if (computedStyle.display.includes('grid')) {
                const gridGroup = document.createElement('div');
                gridGroup.className = 'mt-3 pt-3 border-t space-y-2';
                gridGroup.innerHTML = `<label class="font-semibold block">Grid Container</label>`;
                gridGroup.appendChild(this.createInput('Columns', 'gridTemplateColumns'));
                gridGroup.appendChild(this.createInput('Rows', 'gridTemplateRows'));
                gridGroup.appendChild(this.createInput('Col Gap', 'columnGap'));
                gridGroup.appendChild(this.createInput('Row Gap', 'rowGap'));
                mainControls.appendChild(gridGroup);
            }
            
            const parentStyle = element.parentElement ? window.getComputedStyle(element.parentElement) : null;
            
            // --- Flex Item ---
            if(parentStyle && parentStyle.display.includes('flex')) {
                const flexItemGroup = document.createElement('div');
                flexItemGroup.className = 'mt-3 pt-3 border-t space-y-2';
                flexItemGroup.innerHTML = `<label class="font-semibold block">Flex Item</label>`;
                flexItemGroup.appendChild(this.createInput('Grow', 'flexGrow'));
                flexItemGroup.appendChild(this.createInput('Shrink', 'flexShrink'));
                flexItemGroup.appendChild(this.createInput('Basis', 'flexBasis'));
                mainControls.appendChild(flexItemGroup);
            }
            
            // --- Grid Item ---
            if(parentStyle && parentStyle.display.includes('grid')) {
                 const gridItemGroup = document.createElement('div');
                gridItemGroup.className = 'mt-3 pt-3 border-t space-y-2';
                gridItemGroup.innerHTML = `<label class="font-semibold block">Grid Item</label>`;
                gridItemGroup.appendChild(this.createInput('Col Start', 'gridColumnStart'));
                gridItemGroup.appendChild(this.createInput('Col End', 'gridColumnEnd'));
                gridItemGroup.appendChild(this.createInput('Row Start', 'gridRowStart'));
                gridItemGroup.appendChild(this.createInput('Row End', 'gridRowEnd'));
                mainControls.appendChild(gridItemGroup);
            }

            this.container.appendChild(mainControls);
        }
    }

    window.EditorTools.LayoutControls = LayoutControls;
})();
