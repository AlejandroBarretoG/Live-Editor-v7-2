/**
 * resizer.js
 * Este módulo gestiona un recuadro de redimensionamiento visual que se superpone
 * a cualquier elemento seleccionado, permitiendo modificar su ancho y alto.
 * VERSIÓN SIMPLIFICADA: Solo con manejadores laterales.
 * --- ✅ MODIFICADO: Ahora ajusta el padding en lugar del width/height ---
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class ResizerManager {
        constructor(options) {
            this.historyManager = options.historyManager;
            this.propertiesPanel = options.propertiesPanel;
            this.resizerBox = this._createResizerBox();
            
            this.isResizing = false;
            this.currentElement = null;
            this.currentHandle = null;
            
            // Almacenaremos los paddings originales al iniciar el arrastre
            this.originalPadding = {}; 
            this.originalMouse = {};
            
            this.resize = this.resize.bind(this);
            this.stopResize = this.stopResize.bind(this);
        }
        
        _createResizerBox() {
            let box = document.getElementById('resizer-box');
            if (box) {
                box.innerHTML = '';
            } else {
                box = document.createElement('div');
                box.id = 'resizer-box';
                box.style.display = 'none';
                document.body.appendChild(box);
            }

            const boxHTML = `
                <div class="resizer-handle top-center"></div>
                <div class="resizer-handle bottom-center"></div>
                <div class="resizer-handle left-center"></div>
                <div class="resizer-handle right-center"></div>
            `;
            box.innerHTML = boxHTML;
            
            box.querySelectorAll('.resizer-handle').forEach(handle => {
                handle.addEventListener('mousedown', this.startResize.bind(this));
            });
            
            return box;
        }

        show(element) {
            if (!element) {
                this.hide();
                return;
            }
            this.currentElement = element;
            const rect = this.currentElement.getBoundingClientRect();
            
            this.resizerBox.style.left = `${rect.left + window.scrollX}px`;
            this.resizerBox.style.top = `${rect.top + window.scrollY}px`;
            this.resizerBox.style.width = `${rect.width}px`;
            this.resizerBox.style.height = `${rect.height}px`;
            this.resizerBox.style.display = 'block';
        }

        hide() {
            this.currentElement = null;
            this.resizerBox.style.display = 'none';
        }

        startResize(e) {
            e.preventDefault();
            e.stopPropagation();
            
            this.isResizing = true;
            this.currentHandle = e.target;
            this.originalMouse = { x: e.clientX, y: e.clientY };

            // ✅ Guardamos los valores de padding actuales del elemento
            const computedStyle = window.getComputedStyle(this.currentElement);
            this.originalPadding = {
                top: parseInt(computedStyle.paddingTop, 10) || 0,
                right: parseInt(computedStyle.paddingRight, 10) || 0,
                bottom: parseInt(computedStyle.paddingBottom, 10) || 0,
                left: parseInt(computedStyle.paddingLeft, 10) || 0
            };
            
            document.addEventListener('mousemove', this.resize);
            document.addEventListener('mouseup', this.stopResize, { once: true });
        }

        resize(e) {
            if (!this.isResizing) return;
            
            const dx = e.clientX - this.originalMouse.x;
            const dy = e.clientY - this.originalMouse.y;

            // ✅ LÓGICA MODIFICADA: Calculamos y aplicamos el nuevo padding
            if (this.currentHandle.classList.contains('right-center')) {
                const newPadding = this.originalPadding.right + dx;
                if (newPadding >= 0) this.currentElement.style.paddingRight = `${newPadding}px`;
            }
            if (this.currentHandle.classList.contains('left-center')) {
                const newPadding = this.originalPadding.left - dx;
                if (newPadding >= 0) this.currentElement.style.paddingLeft = `${newPadding}px`;
            }
            if (this.currentHandle.classList.contains('bottom-center')) {
                const newPadding = this.originalPadding.bottom + dy;
                if (newPadding >= 0) this.currentElement.style.paddingBottom = `${newPadding}px`;
            }
            if (this.currentHandle.classList.contains('top-center')) {
                const newPadding = this.originalPadding.top - dy;
                if (newPadding >= 0) this.currentElement.style.paddingTop = `${newPadding}px`;
            }

            // No es necesario actualizar el resizer box durante el arrastre de padding
            // this.show(this.currentElement); 
        }

        stopResize() {
            this.isResizing = false;
            document.removeEventListener('mousemove', this.resize);
            
            // Actualizamos la posición del resizer box al finalizar
            this.show(this.currentElement);

            if (this.historyManager) this.historyManager.saveState();
            if (this.propertiesPanel) this.propertiesPanel.show(this.currentElement);
        }
    }

    window.EditorTools.ResizerManager = ResizerManager;
})();