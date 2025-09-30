/**
 * grid_editor.js
 * Este módulo contiene la lógica para las herramientas de edición contextual de layouts con CSS Grid.
 * AHORA ES AUTÓNOMO: Crea y gestiona su propio panel de herramientas.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class GridEditor {
        constructor(options) {
            this.selectedGrid = null;
            this.historyManager = options.historyManager;
            this.handlersContainer = null;
            this.getSelectedElement = options.getSelectedElement;
            this.elementToReselect = null;

            // --- MODIFICACIÓN PRINCIPAL ---
            this._createPanel();
            this.gridControlsPanel = document.getElementById('panel-grid');

            // Binds
            this.doColDrag = this.doColDrag.bind(this);
            this.stopColDrag = this.stopColDrag.bind(this);
            this.doRowDrag = this.doRowDrag.bind(this);
            this.stopRowDrag = this.stopRowDrag.bind(this);
            this.updateHandlerPositions = this.updateHandlerPositions.bind(this);
        }

        /**
         * NUEVO: Construye e inyecta el panel de herramientas de grid en el DOM.
         * @private
         */
        _createPanel() {
            if (document.getElementById('panel-grid')) return;

            const panelHTML = `
                <div id="panel-grid" class="fixed bg-white shadow-2xl rounded-lg flex flex-col border border-gray-300 floating-panel w-96 hidden" style="top: calc(1rem + 120px); right: 1rem; z-index: 10002;">
                    <div id="grid-header" class="p-2 bg-gray-100 border-b rounded-t-lg flex justify-between items-center panel-header">
                        <h3 class="text-sm font-bold text-gray-700">Herramientas de Grid</h3>
                        <div class="flex items-center space-x-2">
                            <button title="Compactar/Expandir" class="panel-toggle-btn bg-gray-300 hover:bg-gray-400 text-gray-700 font-mono text-sm px-2 rounded">-</button>
                            <button title="Cerrar" class="close-panel-btn text-gray-500 hover:text-gray-800 text-xl leading-none">&times;</button>
                        </div>
                    </div>
                    <div class="p-3 flex-grow panel-content space-y-2">
                        <p class="text-xs text-center text-gray-500">Ajusta las filas y columnas arrastrando los manejadores verdes sobre el layout.</p>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', panelHTML);
        }

        // ... (EL RESTO DEL ARCHIVO NO CAMBIA) ...
        selectGrid(gridElement) {
            if (this.selectedGrid === gridElement) return;
            this.deselectGrid();
            this.selectedGrid = gridElement;
            this.activateResizeHandlers();
            this.gridControlsPanel?.classList.remove('hidden');
        }

        deselectGrid() {
            if (!this.selectedGrid) return;
            this.deactivateResizeHandlers();
            this.selectedGrid = null;
            this.gridControlsPanel?.classList.add('hidden');
        }

        activateResizeHandlers() {
            if (!this.selectedGrid) return;
            
            const parent = this.selectedGrid.parentElement;
            if (!parent) return;

            this.handlersContainer = document.createElement('div');
            this.handlersContainer.className = 'resize-handlers-container';
            parent.style.position = parent.style.position || 'relative';
            parent.appendChild(this.handlersContainer);
            
            this.createHandlers();
            this.updateHandlerPositions();

            window.addEventListener('resize', this.updateHandlerPositions);
        }

        deactivateResizeHandlers() {
            if (this.handlersContainer) {
                this.handlersContainer.remove();
                this.handlersContainer = null;
            }
            window.removeEventListener('resize', this.updateHandlerPositions);
        }

        createHandlers() {
            if (!this.selectedGrid) return;
            this.handlersContainer.innerHTML = ''; 

            const computedStyle = window.getComputedStyle(this.selectedGrid);
            const colTracks = computedStyle.gridTemplateColumns.split(' ');
            const rowTracks = computedStyle.gridTemplateRows.split(' ');

            // Crear manejadores de columnas
            for (let i = 0; i < colTracks.length - 1; i++) {
                const handler = document.createElement('div');
                handler.className = 'grid-resize-handler-col';
                handler.dataset.colTrack = i;
                this.handlersContainer.appendChild(handler);
                handler.addEventListener('mousedown', this.initColDrag.bind(this));
            }
            
            // Crear manejadores de filas (uno más para el borde inferior)
            for (let i = 0; i < rowTracks.length; i++) {
                const handler = document.createElement('div');
                handler.className = 'grid-resize-handler-row';
                handler.dataset.rowTrack = i;
                this.handlersContainer.appendChild(handler);
                handler.addEventListener('mousedown', this.initRowDrag.bind(this));
            }
        }
        
        updateHandlerPositions() {
            if (!this.handlersContainer || !this.selectedGrid) return;
            
            const gridRect = this.selectedGrid.getBoundingClientRect();
            const parentRect = this.selectedGrid.parentElement.getBoundingClientRect();
            const computedStyle = window.getComputedStyle(this.selectedGrid);
            
            const colGap = parseFloat(computedStyle.columnGap) || 0;
            const rowGap = parseFloat(computedStyle.rowGap) || 0;
            const colTracks = computedStyle.gridTemplateColumns.split(' ').map(v => parseFloat(v));
            const rowTracks = computedStyle.gridTemplateRows.split(' ').map(v => parseFloat(v));
            
            this.handlersContainer.style.top = `${gridRect.top - parentRect.top}px`;
            this.handlersContainer.style.left = `${gridRect.left - parentRect.left}px`;
            this.handlersContainer.style.width = `${gridRect.width}px`;
            this.handlersContainer.style.height = `${gridRect.height}px`;

            const colHandlers = this.handlersContainer.querySelectorAll('.grid-resize-handler-col');
            let cumulativeWidth = 0;
            for (let i = 0; i < colTracks.length - 1; i++) {
                cumulativeWidth += colTracks[i];
                if (colHandlers[i]) {
                    colHandlers[i].style.left = `${cumulativeWidth + (colGap / 2) - 4}px`;
                }
                cumulativeWidth += colGap;
            }

            const rowHandlers = this.handlersContainer.querySelectorAll('.grid-resize-handler-row');
            let cumulativeHeight = 0;
            for (let i = 0; i < rowTracks.length - 1; i++) {
                cumulativeHeight += rowTracks[i];
                if (rowHandlers[i]) {
                    rowHandlers[i].style.top = `${cumulativeHeight + (rowGap / 2) - 4}px`;
                }
                cumulativeHeight += rowGap;
            }
            if (rowHandlers[rowTracks.length - 1]) {
                rowHandlers[rowTracks.length - 1].style.top = `${gridRect.height - 4}px`;
            }
        }

        initColDrag(e) {
            e.preventDefault(); e.stopPropagation();
            this.elementToReselect = this.getSelectedElement ? this.getSelectedElement() : null;
            this.isDraggingCols = true;
            this.colTrackIndex = parseInt(e.currentTarget.dataset.colTrack);
            
            const template = window.getComputedStyle(this.selectedGrid).gridTemplateColumns;
            this.colTracks = template.split(' ').map(v => parseFloat(v));
            
            this.startX = e.clientX;
            this.startWidth1 = this.colTracks[this.colTrackIndex];
            this.startWidth2 = this.colTracks[this.colTrackIndex + 1];
            
            document.body.style.cursor = 'col-resize';
            document.addEventListener('mousemove', this.doColDrag);
            document.addEventListener('mouseup', this.stopColDrag, { once: true });
        }

        doColDrag(e) {
            if (!this.isDraggingCols) return;
            const deltaX = e.clientX - this.startX;
            const newWidth1 = this.startWidth1 + deltaX;
            const newWidth2 = this.startWidth2 - deltaX;
            if (newWidth1 > 50 && newWidth2 > 50) {
                this.colTracks[this.colTrackIndex] = newWidth1;
                this.colTracks[this.colTrackIndex + 1] = newWidth2;
                this.selectedGrid.style.gridTemplateColumns = this.colTracks.map(v => `${v}px`).join(' ');
                this.updateHandlerPositions();
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

        initRowDrag(e) {
            e.preventDefault(); e.stopPropagation();
            this.elementToReselect = this.getSelectedElement ? this.getSelectedElement() : null;
            this.isDraggingRows = true;
            this.rowTrackIndex = parseInt(e.currentTarget.dataset.rowTrack);

            const template = window.getComputedStyle(this.selectedGrid).gridTemplateRows;
            this.rowTracks = template.split(' ').map(v => parseFloat(v));

            this.startY = e.clientY;
            this.startHeight1 = this.rowTracks[this.rowTrackIndex];
            this.startHeight2 = this.rowTracks[this.rowTrackIndex + 1]; // Undefined for the last handler

            document.body.style.cursor = 'row-resize';
            document.addEventListener('mousemove', this.doRowDrag);
            document.addEventListener('mouseup', this.stopRowDrag, { once: true });
        }

        doRowDrag(e) {
            if (!this.isDraggingRows) return;
            const deltaY = e.clientY - this.startY;
            const newHeight1 = this.startHeight1 + deltaY;

            if (this.startHeight2 !== undefined) {
                const newHeight2 = this.startHeight2 - deltaY;
                if (newHeight1 > 40 && newHeight2 > 40) {
                    this.rowTracks[this.rowTrackIndex] = newHeight1;
                    this.rowTracks[this.rowTrackIndex + 1] = newHeight2;
                }
            } else {
                if (newHeight1 > 40) {
                    this.rowTracks[this.rowTrackIndex] = newHeight1;
                }
            }
            
            this.selectedGrid.style.gridTemplateRows = this.rowTracks.map(v => `${v}px`).join(' ');
            this.updateHandlerPositions();
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

    window.EditorTools.GridEditor = GridEditor;
})();
