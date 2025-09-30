/**
 * flex_editor.js
 * Este módulo contiene la lógica para las herramientas de edición contextual de layouts con CSS Flexbox.
 * AHORA ES AUTÓNOMO: Crea y gestiona su propio panel de herramientas.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class FlexEditor {
        constructor(options) {
            this.selectedFlexContainer = null;
            this.historyManager = options.historyManager;
            this.getSelectedElement = options.getSelectedElement;
            this.elementToReselect = null;

            // --- MODIFICACIÓN PRINCIPAL ---
            this._createPanel();
            this.flexControlsPanel = document.getElementById('panel-flex');

            // Binds
            this.doColDrag = this.doColDrag.bind(this);
            this.stopColDrag = this.stopColDrag.bind(this);
            this.doRowDrag = this.doRowDrag.bind(this);
            this.stopRowDrag = this.stopRowDrag.bind(this);
        }

        /**
         * NUEVO: Construye e inyecta el panel de herramientas de flexbox en el DOM.
         * @private
         */
        _createPanel() {
            if (document.getElementById('panel-flex')) return;

            const panelHTML = `
                <div id="panel-flex" class="fixed bg-white shadow-2xl rounded-lg flex flex-col border border-gray-300 floating-panel w-96 hidden" style="top: calc(1rem + 160px); right: 1rem; z-index: 10001;">
                    <div id="flex-header" class="p-2 bg-gray-100 border-b rounded-t-lg flex justify-between items-center panel-header">
                        <h3 class="text-sm font-bold text-gray-700">Herramientas de Flexbox</h3>
                        <div class="flex items-center space-x-2">
                            <button title="Compactar/Expandir" class="panel-toggle-btn bg-gray-300 hover:bg-gray-400 text-gray-700 font-mono text-sm px-2 rounded">-</button>
                            <button title="Cerrar" class="close-panel-btn text-gray-500 hover:text-gray-800 text-xl leading-none">&times;</button>
                        </div>
                    </div>
                    <div class="p-3 flex-grow panel-content space-y-2">
                        <p class="text-xs text-center text-gray-500">Ajusta las columnas y filas arrastrando los manejadores naranjas.</p>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', panelHTML);
        }

        // ... (EL RESTO DEL ARCHIVO NO CAMBIA) ...
        selectFlexContainer(element) {
            const flexContainer = element.closest('.flex');
            if (this.selectedFlexContainer === flexContainer) return;

            this.deselectFlexContainer();
            this.selectedFlexContainer = flexContainer;
            this.activateResizeHandlers();
            this.flexControlsPanel?.classList.remove('hidden');
        }

        deselectFlexContainer() {
            if (!this.selectedFlexContainer) return;
            this.deactivateResizeHandlers();
            this.selectedFlexContainer = null;
            this.flexControlsPanel?.classList.add('hidden');
        }

        activateResizeHandlers() {
            if (!this.selectedFlexContainer) return;

            // Contenedor para los manejadores
            const parent = this.selectedFlexContainer.parentElement;
            this.handlersContainer = document.createElement('div');
            this.handlersContainer.className = 'resize-handlers-container';
            parent.style.position = parent.style.position || 'relative';
            parent.appendChild(this.handlersContainer);
            
            this.createHandlers(this.selectedFlexContainer);
        }
        
        createHandlers(container) {
            // Manejadores de columnas (verticales)
            const children = Array.from(container.children);
            children.forEach((child, index) => {
                if (index < children.length - 1) {
                    const handler = document.createElement('div');
                    handler.className = 'flex-resize-handler-col';
                    child.style.position = 'relative';
                    child.appendChild(handler);
                    handler.addEventListener('mousedown', (e) => this.initColDrag(e, child, children[index + 1]));
                }
            });

            // Manejadores de filas (horizontales) si el contenedor principal es flex-col
            if(container.parentElement?.classList.contains('flex-col')) {
                const rows = Array.from(container.parentElement.children);
                 rows.forEach((row, index) => {
                    if (index < rows.length - 1) {
                        const handler = document.createElement('div');
                        handler.className = 'flex-resize-handler-row';
                        row.style.position = 'relative';
                        row.appendChild(handler);
                        handler.addEventListener('mousedown', (e) => this.initRowDrag(e, row, rows[index+1]));
                    }
                });
            }
        }

        deactivateResizeHandlers() {
            const handlers = document.querySelectorAll('.flex-resize-handler-col, .flex-resize-handler-row');
            handlers.forEach(h => h.remove());
        }
        
        initColDrag(e, leftEl, rightEl) {
            e.preventDefault(); e.stopPropagation();
            this.elementToReselect = this.getSelectedElement ? this.getSelectedElement() : null;
            
            this.isDraggingCols = true;
            this.leftEl = leftEl;
            this.rightEl = rightEl;
            this.startX = e.clientX;
            this.startWidthLeft = leftEl.offsetWidth;
            this.startWidthRight = rightEl.offsetWidth;

            document.body.style.cursor = 'col-resize';
            document.addEventListener('mousemove', this.doColDrag);
            document.addEventListener('mouseup', this.stopColDrag, { once: true });
        }

        doColDrag(e) {
            if (!this.isDraggingCols) return;
            const deltaX = e.clientX - this.startX;
            const newWidthLeft = this.startWidthLeft + deltaX;
            const newWidthRight = this.startWidthRight - deltaX;
            
            if (newWidthLeft > 50 && newWidthRight > 50) {
                const parentWidth = this.leftEl.parentElement.offsetWidth;
                this.leftEl.style.width = `${(newWidthLeft / parentWidth) * 100}%`;
                this.rightEl.style.width = `${(newWidthRight / parentWidth) * 100}%`;
            }
        }

        stopColDrag(e) {
            e.preventDefault(); e.stopPropagation();
            this.isDraggingCols = false;
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', this.doColDrag);
            if (this.historyManager) this.historyManager.saveState();
            if (this.elementToReselect) {
                this.elementToReselect.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            }
        }

        initRowDrag(e, topEl, bottomEl) {
            e.preventDefault(); e.stopPropagation();
            this.elementToReselect = this.getSelectedElement ? this.getSelectedElement() : null;
            
            this.isDraggingRows = true;
            this.topEl = topEl;
            this.bottomEl = bottomEl;
            this.startY = e.clientY;
            this.startHeightTop = topEl.offsetHeight;
            this.startHeightBottom = bottomEl.offsetHeight;

            document.body.style.cursor = 'row-resize';
            document.addEventListener('mousemove', this.doRowDrag);
            document.addEventListener('mouseup', this.stopRowDrag, { once: true });
        }

        doRowDrag(e) {
            if (!this.isDraggingRows) return;
            const deltaY = e.clientY - this.startY;
            const newHeightTop = this.startHeightTop + deltaY;
            const newHeightBottom = this.startHeightBottom - deltaY;

            if (newHeightTop > 40 && newHeightBottom > 40) {
                 const parentHeight = this.topEl.parentElement.offsetHeight;
                 this.topEl.style.height = `${newHeightTop}px`;
                 this.bottomEl.style.height = `${newHeightBottom}px`;
            }
        }

        stopRowDrag(e) {
            e.preventDefault(); e.stopPropagation();
            this.isDraggingRows = false;
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', this.doRowDrag);
            if (this.historyManager) this.historyManager.saveState();
            if (this.elementToReselect) {
                this.elementToReselect.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
            }
        }
    }

    window.EditorTools.FlexEditor = FlexEditor;
})();
