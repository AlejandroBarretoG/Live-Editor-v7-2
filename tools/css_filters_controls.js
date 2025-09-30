/**
 * css_filters_controls.js
 * Gestiona los controles para la propiedad `filter` de CSS.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class CssFilterControls {
        constructor(options) {
            this.inspectorCore = options.inspectorCore;
            this.historyManager = options.historyManager;
            this.currentElement = null;
            this.activeFilters = {};
            this.filterDefinitions = [
                { name: 'blur', min: 0, max: 20, unit: 'px', defaultValue: 0 },
                { name: 'brightness', min: 0, max: 200, unit: '%', defaultValue: 100 },
                { name: 'contrast', min: 0, max: 200, unit: '%', defaultValue: 100 },
                { name: 'saturate', min: 0, max: 300, unit: '%', defaultValue: 100 },
                { name: 'grayscale', min: 0, max: 100, unit: '%', defaultValue: 0 },
                { name: 'sepia', min: 0, max: 100, unit: '%', defaultValue: 0 },
                { name: 'invert', min: 0, max: 100, unit: '%', defaultValue: 0 },
                { name: 'hue-rotate', min: 0, max: 360, unit: 'deg', defaultValue: 0 },
            ];
        }

        init(container) {
            this.container = container;
            let html = '<div class="space-y-2 text-xs">';
            this.filterDefinitions.forEach(filter => {
                html += `
                    <div class="grid grid-cols-12 gap-2 items-center">
                        <input type="checkbox" data-filter-enable="${filter.name}" class="col-span-1">
                        <label class="col-span-3">${filter.name}</label>
                        <input type="range" data-filter-slider="${filter.name}" min="${filter.min}" max="${filter.max}" value="${filter.defaultValue}" class="col-span-5" disabled>
                        <input type="number" data-filter-number="${filter.name}" min="${filter.min}" max="${filter.max}" value="${filter.defaultValue}" class="col-span-3 p-1 border rounded" disabled>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;

            this.filterDefinitions.forEach(filter => {
                const checkbox = container.querySelector(`[data-filter-enable="${filter.name}"]`);
                const slider = container.querySelector(`[data-filter-slider="${filter.name}"]`);
                const number = container.querySelector(`[data-filter-number="${filter.name}"]`);

                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        slider.disabled = false;
                        number.disabled = false;
                        this.activeFilters[filter.name] = { value: parseFloat(number.value), unit: filter.unit };
                    } else {
                        slider.disabled = true;
                        number.disabled = true;
                        delete this.activeFilters[filter.name];
                    }
                    this.applyFilters();
                });

                const updateValue = (newValue) => {
                    const value = parseFloat(newValue);
                    slider.value = value;
                    number.value = value;
                    if (checkbox.checked) {
                        this.activeFilters[filter.name] = { value, unit: filter.unit };
                        this.applyFilters();
                    }
                };

                slider.addEventListener('input', () => updateValue(slider.value));
                number.addEventListener('change', () => updateValue(number.value));
            });
        }
        
        applyFilters() {
            if (!this.currentElement) return;
            const filterString = Object.entries(this.activeFilters)
                .map(([name, { value, unit }]) => {
                    if (['brightness', 'contrast', 'saturate'].includes(name)) {
                        return `${name}(${(value / 100).toFixed(2)})`;
                    }
                    return `${name}(${value}${unit})`;
                })
                .join(' ');
            
            this.currentElement.style.filter = filterString || 'none';
            this.historyManager.saveState();
        }
        
        update(element) {
            this.currentElement = element;
            this.activeFilters = {};
            const existingFilters = window.getComputedStyle(element).filter;

            this.filterDefinitions.forEach(filter => {
                const checkbox = this.container.querySelector(`[data-filter-enable="${filter.name}"]`);
                const slider = this.container.querySelector(`[data-filter-slider="${filter.name}"]`);
                const number = this.container.querySelector(`[data-filter-number="${filter.name}"]`);

                const regex = new RegExp(`${filter.name}\\(([^\\)]+)\\)`);
                const match = existingFilters.match(regex);
                
                if (match) {
                    let value = parseFloat(match[1]);
                    if (['brightness', 'contrast', 'saturate'].includes(filter.name)) {
                        value *= 100; // Convert back to percentage for UI
                    }
                    
                    checkbox.checked = true;
                    slider.disabled = false;
                    number.disabled = false;
                    slider.value = value;
                    number.value = value;
                    this.activeFilters[filter.name] = { value: value, unit: filter.unit };
                } else {
                    checkbox.checked = false;
                    slider.disabled = true;
                    number.disabled = true;
                    slider.value = filter.defaultValue;
                    number.value = filter.defaultValue;
                }
            });
        }
    }

    window.EditorTools.CssFilterControls = CssFilterControls;
})();
