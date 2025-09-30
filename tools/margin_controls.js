/**
 * margin_controls.js
 * Gestiona los inputs y la lógica para modificar el margen de un elemento.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class MarginControls {
        constructor(options) {
            this.inspectorCore = options.inspectorCore;
            this.historyManager = options.historyManager;
            this.currentElement = null;
            this.inputs = {};
            this.linkButtons = {};
            this.isLinked = true;
        }

        init(container) {
            const sides = [
                { id: 'top', name: 'Superior' },
                { id: 'right', name: 'Derecha' },
                { id: 'bottom', name: 'Inferior' },
                { id: 'left', name: 'Izquierda' }
            ];

            let html = '<div class="space-y-2">';
            sides.forEach(side => {
                html += `
                    <div class="flex items-center space-x-2 text-xs">
                        <label for="margin-${side.id}" class="w-1/4">${side.name}:</label>
                        <input type="number" id="margin-${side.id}" data-side="${side.id}" class="w-full border-gray-300 rounded-md shadow-sm p-1 text-center">
                        <button id="margin-link-${side.id}" data-side="${side.id}" class="margin-link-btn p-1 rounded-md hover:bg-gray-200 is-linked">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                        </button>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;

            sides.forEach(side => {
                const input = container.querySelector(`#margin-${side.id}`);
                const linkButton = container.querySelector(`#margin-link-${side.id}`);
                this.inputs[side.id] = input;
                this.linkButtons[side.id] = linkButton;

                input.addEventListener('input', () => this.handleInputChange(side.id));
                linkButton.addEventListener('click', () => this.toggleLink());
            });
        }
        
        toggleLink() {
            this.isLinked = !this.isLinked;
            this.updateLinkButtonsUI();
        }
        
        updateLinkButtonsUI() {
            Object.values(this.linkButtons).forEach(button => {
                button.classList.toggle('is-linked', this.isLinked);
            });
        }

        handleInputChange(changedSide) {
            if (!this.currentElement) return;
            const newValue = this.inputs[changedSide].value;

            if (this.isLinked) {
                Object.keys(this.inputs).forEach(side => {
                    if (side !== changedSide) {
                        this.inputs[side].value = newValue;
                    }
                });
                this.currentElement.style.margin = `${newValue}px`;
            } else {
                this.currentElement.style[`margin-${changedSide}`] = `${newValue}px`;
            }

            clearTimeout(this.saveTimeout);
            this.saveTimeout = setTimeout(() => {
                if (this.historyManager) this.historyManager.saveState();
            }, 300);
        }

        update(element) {
            this.currentElement = element;
            const computedStyle = window.getComputedStyle(element);
            
            let firstValue = null;
            let allSame = true;

            Object.keys(this.inputs).forEach((side, index) => {
                const value = parseInt(computedStyle[`margin-${side}`], 10) || 0;
                this.inputs[side].value = value;
                
                if (index === 0) {
                    firstValue = value;
                } else if (value !== firstValue) {
                    allSame = false;
                }
            });

            this.isLinked = allSame;
            this.updateLinkButtonsUI();
        }
    }

    window.EditorTools.MarginControls = MarginControls;
})();
