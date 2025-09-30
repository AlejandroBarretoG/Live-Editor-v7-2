/**
 * variables_manager.js
 * Gestiona el panel de "Variables" y la lógica para aplicar etiquetas
 * visuales a los elementos seleccionados del DOM.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class VariablesManager {
        /**
         * @param {object} options Opciones de inicialización.
         * @param {InspectorCore} options.inspectorCore La instancia del inspector para saber qué elemento está seleccionado.
         */
        constructor(options) {
            this.inspectorCore = options.inspectorCore;
            this.labelInput = document.getElementById('variable-label-input');
            this.applyButton = document.getElementById('variable-apply-btn');
            this.removeButton = document.getElementById('variable-remove-btn');
        }

        /**
         * Inicializa los listeners del panel.
         */
        init() {
            if (!this.applyButton || !this.labelInput || !this.removeButton) {
                console.warn('No se encontraron los elementos del panel de Variables. Asegúrate de que el HTML está en ui_manager.js');
                return;
            }

            this.applyButton.addEventListener('click', () => this.applyLabel());
            this.removeButton.addEventListener('click', () => this.removeLabel());

            // Opcional: aplicar también al presionar Enter en el input
            this.labelInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.applyLabel();
                }
            });
        }

        /**
         * Aplica la etiqueta del campo de texto al elemento seleccionado.
         */
        applyLabel() {
            const selectedElement = this.inspectorCore.getSelectedElement();
            if (!selectedElement) {
                alert('Por favor, selecciona un elemento primero con el inspector.');
                return;
            }

            const labelText = this.labelInput.value.trim();
            if (labelText) {
                selectedElement.dataset.label = labelText;
                // Para que el posicionamiento absoluto del pseudo-elemento funcione correctamente
                if (window.getComputedStyle(selectedElement).position === 'static') {
                    selectedElement.style.position = 'relative';
                }
            } else {
                this.removeLabel();
            }
        }

        /**
         * Elimina la etiqueta del elemento seleccionado.
         */
        removeLabel() {
            const selectedElement = this.inspectorCore.getSelectedElement();
            if (selectedElement) {
                delete selectedElement.dataset.label;
                // Opcional: podríamos querer revertir el 'position: relative' si lo añadimos nosotros
                // pero por ahora lo dejamos para no interferir con otros estilos.
            }
        }
    }

    window.EditorTools.VariablesManager = VariablesManager;
})();
