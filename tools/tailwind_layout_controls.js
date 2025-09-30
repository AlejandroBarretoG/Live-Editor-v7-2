/**
 * tailwind_layout_controls.js
 * Gestiona los controles para editar clases de layout de Tailwind CSS.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class TailwindLayoutControls {
        constructor(options) {
            this.inspectorCore = options.inspectorCore;
            this.historyManager = options.historyManager;
            this.currentElement = null;
            this.container = null;
        }

        init(container) {
            this.container = container;
        }

        // Helper para gestionar clases
        classManager(element) {
            return {
                hasClass: (className) => element.classList.contains(className),
                findWithPrefix: (prefix) => Array.from(element.classList).find(c => c.startsWith(prefix)),
                replaceWithPrefix(prefix, newClass) {
                    const toRemove = Array.from(element.classList).filter(c => c.startsWith(prefix));
                    if (toRemove.length > 0) element.classList.remove(...toRemove);
                    if (newClass) element.classList.add(newClass);
                }
            };
        }

        applyChanges() {
            this.historyManager.saveState();
            this.update(this.currentElement); // Re-render controls
        }

        createDisplayControls() {
            const displayOptions = ['block', 'flex', 'grid', 'inline-block', 'hidden'];
            let currentDisplay = displayOptions.find(opt => this.classManager(this.currentElement).hasClass(opt)) || 'block';
            
            let html = `<label class="font-semibold block mb-1">Display</label><div class="grid grid-cols-3 gap-1">`;
            displayOptions.forEach(opt => {
                const isActive = currentDisplay === opt;
                html += `<button data-display="${opt}" class="px-2 py-1 border rounded ${isActive ? 'active' : ''}">${opt}</button>`;
            });
            html += `</div>`;
            return html;
        }

        createFlexControls() {
            const mgr = this.classManager(this.currentElement);
            const direction = mgr.findWithPrefix('flex-') || 'flex-row';
            const alignItems = mgr.findWithPrefix('items-') || 'items-stretch';
            const justifyContent = mgr.findWithPrefix('justify-') || 'justify-start';

            return `
                <div class="mt-3 space-y-2">
                    <label class="font-semibold block">Contenedor Flex</label>
                    <div>
                        <label>Dirección:</label>
                        <select data-tailwind-prop="flex-" class="w-full p-1 border rounded">
                            <option value="flex-row" ${direction === 'flex-row' ? 'selected' : ''}>Row</option>
                            <option value="flex-col" ${direction === 'flex-col' ? 'selected' : ''}>Column</option>
                        </select>
                    </div>
                    <div>
                        <label>Alinear:</label>
                        <select data-tailwind-prop="items-" class="w-full p-1 border rounded">
                            <option value="items-start" ${alignItems === 'items-start' ? 'selected' : ''}>Start</option>
                            <option value="items-center" ${alignItems === 'items-center' ? 'selected' : ''}>Center</option>
                            <option value="items-end" ${alignItems === 'items-end' ? 'selected' : ''}>End</option>
                            <option value="items-stretch" ${alignItems === 'items-stretch' ? 'selected' : ''}>Stretch</option>
                        </select>
                    </div>
                    <div>
                        <label>Justificar:</label>
                        <select data-tailwind-prop="justify-" class="w-full p-1 border rounded">
                            <option value="justify-start" ${justifyContent === 'justify-start' ? 'selected' : ''}>Start</option>
                            <option value="justify-center" ${justifyContent === 'justify-center' ? 'selected' : ''}>Center</option>
                            <option value="justify-end" ${justifyContent === 'justify-end' ? 'selected' : ''}>End</option>
                            <option value="justify-between" ${justifyContent === 'justify-between' ? 'selected' : ''}>Between</option>
                        </select>
                    </div>
                </div>`;
        }

        update(element) {
            this.currentElement = element;
            let html = '<div class="space-y-3 text-xs">';
            html += this.createDisplayControls();
            
            if (this.classManager(element).hasClass('flex')) {
                html += this.createFlexControls();
            }
            // Aquí iría la lógica para `grid`
            
            html += '</div>';
            this.container.innerHTML = html;

            // Add event listeners
            this.container.querySelectorAll('[data-display]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const newDisplay = btn.dataset.display;
                    ['block', 'flex', 'grid', 'inline-block', 'hidden'].forEach(opt => {
                        if (this.currentElement.classList.contains(opt)) {
                            this.currentElement.classList.remove(opt);
                        }
                    });
                    if (newDisplay !== 'block') {
                        this.currentElement.classList.add(newDisplay);
                    }
                    this.applyChanges();
                });
            });

            this.container.querySelectorAll('[data-tailwind-prop]').forEach(select => {
                select.addEventListener('change', () => {
                    const prefix = select.dataset.tailwindProp;
                    const newClass = select.value;
                    this.classManager(this.currentElement).replaceWithPrefix(prefix, newClass);
                    this.applyChanges();
                });
            });
        }
    }

    window.EditorTools.TailwindLayoutControls = TailwindLayoutControls;
})();
