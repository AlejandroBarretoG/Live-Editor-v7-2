/**
 * table_editor.js
 * Este módulo contiene la lógica para las herramientas de edición contextual de tablas.
 * AHORA ES AUTÓNOMO: Crea y gestiona su propio panel de herramientas.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class TableEditor {
        constructor(options) {
            this.selectedTable = null;
            this.historyManager = options.historyManager;
            this.handlersContainer = null;
            this.getSelectedElement = options.getSelectedElement;
            this.elementToReselect = null;
            
            // --- MODIFICACIÓN PRINCIPAL ---
            // 1. Crear el panel de herramientas al instanciar la clase.
            this._createPanel(); 
            // 2. Obtener la referencia al panel recién creado.
            this.tableControlsPanel = document.getElementById('panel-tabla');

            // Binds
            this.doColResize = this.doColResize.bind(this);
            this.stopColResize = this.stopColResize.bind(this);
            this.doRowResize = this.doRowResize.bind(this);
            this.stopRowResize = this.stopRowResize.bind(this);
            this.updateHandlerPositions = this.updateHandlerPositions.bind(this);
            
            this.init();
        }

        /**
         * NUEVO: Construye e inyecta el panel de herramientas de tabla en el DOM.
         * @private
         */
        _createPanel() {
            // No crear el panel si ya existe
            if (document.getElementById('panel-tabla')) return;

            const panelHTML = `
                <div id="panel-tabla" class="fixed bg-white shadow-2xl rounded-lg flex flex-col border border-gray-300 floating-panel w-96 hidden" style="top: calc(1rem + 80px); right: 1rem; z-index: 10003;">
                    <div id="tabla-header" class="p-2 bg-gray-100 border-b rounded-t-lg flex justify-between items-center panel-header">
                        <h3 class="text-sm font-bold text-gray-700">Herramientas de Tabla</h3>
                        <div class="flex items-center space-x-2">
                            <button title="Compactar/Expandir" class="panel-toggle-btn bg-gray-300 hover:bg-gray-400 text-gray-700 font-mono text-sm px-2 rounded">-</button>
                            <button title="Cerrar" class="close-panel-btn text-gray-500 hover:text-gray-800 text-xl leading-none">&times;</button>
                        </div>
                    </div>
                    <div class="p-3 flex-grow panel-content space-y-2">
                        <button id="btn-add-row" class="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 text-sm">Añadir Fila</button>
                        <button id="btn-add-col" class="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300 text-sm">Añadir Columna</button>
                    </div>
                </div>
            `;
            // Añadir el panel al body. Otros scripts (como panel_manager) lo encontrarán y le añadirán funcionalidad.
            document.body.insertAdjacentHTML('beforeend', panelHTML);
        }

        init() {
            // Ahora los botones existen, podemos añadirles listeners.
            document.getElementById('btn-add-row')?.addEventListener('click', () => this.addRow());
            document.getElementById('btn-add-col')?.addEventListener('click', () => this.addColumn());
        }
        
        // ... (EL RESTO DEL ARCHIVO NO CAMBIA) ...
        selectTable(tableElement) {
            if (this.selectedTable === tableElement) return;
            this.deselectTable();
            this.selectedTable = tableElement;
            this.activateResizeHandlers();
            this.tableControlsPanel?.classList.remove('hidden');
        }

        deselectTable() {
            if (!this.selectedTable) return;
            this.deactivateResizeHandlers();
            this.selectedTable = null;
            this.tableControlsPanel?.classList.add('hidden');
        }

        activateResizeHandlers() {
            if (!this.selectedTable) return;
            this.selectedTable.style.tableLayout = 'fixed';
            this.selectedTable.classList.add('resizable-table');

            const parent = this.selectedTable.parentElement;
            if (!parent) return;

            this.handlersContainer = document.createElement('div');
            this.handlersContainer.className = 'resize-handlers-container';
            parent.style.position = 'relative';
            parent.appendChild(this.handlersContainer);
            
            this.createHandlers();
            this.updateHandlerPositions();
            window.addEventListener('resize', this.updateHandlerPositions);
        }

        deactivateResizeHandlers() {
            if (this.selectedTable) {
                this.selectedTable.classList.remove('resizable-table');
            }
            if (this.handlersContainer) {
                this.handlersContainer.remove();
                this.handlersContainer = null;
            }
            window.removeEventListener('resize', this.updateHandlerPositions);
        }

        createHandlers() {
            this.handlersContainer.innerHTML = '';
            const colCount = this.selectedTable.rows[0]?.cells.length || 0;
            for (let i = 0; i < colCount - 1; i++) {
                const handler = document.createElement('div');
                handler.className = 'col-resize-handler';
                this.handlersContainer.appendChild(handler);
                handler.addEventListener('mousedown', (e) => this.startColResize(e, i));
            }
            
            const rowCount = this.selectedTable.rows.length;
            for (let i = 0; i < rowCount; i++) {
                const handler = document.createElement('div');
                handler.className = 'row-resize-handler';
                this.handlersContainer.appendChild(handler);
                handler.addEventListener('mousedown', (e) => this.startRowResize(e, i));
            }
        }

        updateHandlerPositions() {
            if (!this.handlersContainer || !this.selectedTable) return;
            
            const tableRect = this.selectedTable.getBoundingClientRect();
            const parentRect = this.selectedTable.parentElement.getBoundingClientRect();

            this.handlersContainer.style.top = `${tableRect.top - parentRect.top}px`;
            this.handlersContainer.style.left = `${tableRect.left - parentRect.left}px`;
            this.handlersContainer.style.width = `${tableRect.width}px`;
            this.handlersContainer.style.height = `${tableRect.height}px`;

            const firstRowCells = this.selectedTable.rows[0]?.cells;
            const colHandlers = this.handlersContainer.querySelectorAll('.col-resize-handler');
            let cumulativeWidth = 0;
            if (firstRowCells) {
                for(let i = 0; i < firstRowCells.length - 1; i++) {
                    cumulativeWidth += firstRowCells[i].offsetWidth;
                    if (colHandlers[i]) {
                        colHandlers[i].style.left = `${cumulativeWidth - 4}px`;
                    }
                }
            }

            const rows = this.selectedTable.rows;
            const rowHandlers = this.handlersContainer.querySelectorAll('.row-resize-handler');
            let cumulativeHeight = 0;
            for (let i = 0; i < rows.length; i++) {
                cumulativeHeight += rows[i].offsetHeight;
                if (rowHandlers[i]) {
                    rowHandlers[i].style.top = `${cumulativeHeight - 4}px`;
                }
            }
        }

        startColResize(e, index) {
            e.preventDefault(); e.stopPropagation();
            this.elementToReselect = this.getSelectedElement ? this.getSelectedElement() : null;
            this.activeColIndex = index;
            this.colStartX = e.clientX;
            document.body.style.cursor = 'col-resize';
            document.addEventListener('mousemove', this.doColResize);
            document.addEventListener('mouseup', this.stopColResize, { once: true });
        }

        doColResize(e) {
            const deltaX = e.clientX - this.colStartX;
            this.colStartX = e.clientX;
            for (let row of this.selectedTable.rows) {
                const activeCell = row.cells[this.activeColIndex];
                const nextCell = row.cells[this.activeColIndex + 1];
                if (activeCell && nextCell) {
                    const newWidth = activeCell.offsetWidth + deltaX;
                    const nextNewWidth = nextCell.offsetWidth - deltaX;
                    if (newWidth > 40 && nextNewWidth > 40) {
                        activeCell.style.width = `${newWidth}px`;
                        nextCell.style.width = `${nextNewWidth}px`;
                    }
                }
            }
            this.updateHandlerPositions();
        }

        stopColResize(e) {
            e.preventDefault(); e.stopPropagation();
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', this.doColResize);
            if (this.historyManager) this.historyManager.saveState();
            if (this.elementToReselect) {
                this.elementToReselect.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                this.elementToReselect = null;
            }
        }
        
        startRowResize(e, index) {
            e.preventDefault(); e.stopPropagation();
            this.elementToReselect = this.getSelectedElement ? this.getSelectedElement() : null;
            this.activeRow = this.selectedTable.rows[index];
            this.rowStartY = e.clientY;
            this.rowStartHeight = this.activeRow.offsetHeight;
            document.body.style.cursor = 'row-resize';
            document.addEventListener('mousemove', this.doRowResize);
            document.addEventListener('mouseup', this.stopRowResize, { once: true });
        }

        doRowResize(e) {
            const deltaY = e.clientY - this.rowStartY;
            const newHeight = this.rowStartHeight + deltaY;
            if (newHeight > 30) {
                this.activeRow.style.height = `${newHeight}px`;
                this.updateHandlerPositions();
            }
        }

        stopRowResize(e) {
            e.preventDefault(); e.stopPropagation();
            document.body.style.cursor = '';
            document.removeEventListener('mousemove', this.doRowResize);
            if (this.historyManager) this.historyManager.saveState();
            if (this.elementToReselect) {
                this.elementToReselect.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
                this.elementToReselect = null;
            }
        }
        
        addRow() {
            if (!this.selectedTable) return;
            const tBody = this.selectedTable.querySelector('tbody') || this.selectedTable;
            const newRow = tBody.insertRow(-1);
            const numCols = this.selectedTable.rows[0]?.cells.length || 1;
            for (let i = 0; i < numCols; i++) {
                const newCell = newRow.insertCell(i);
                newCell.textContent = 'Nueva celda';
                newCell.className = 'px-6 py-4 border border-slate-300';
            }
            this.createHandlers();
            this.updateHandlerPositions();
            if (this.historyManager) this.historyManager.saveState();
        }

        addColumn() {
            if (!this.selectedTable) return;
            for (let row of this.selectedTable.rows) {
                const newCell = row.parentElement.tagName === 'THEAD' ? document.createElement('th') : document.createElement('td');
                row.appendChild(newCell);
                newCell.textContent = 'Nueva celda';
                newCell.className = row.parentElement.tagName === 'THEAD' 
                    ? 'px-6 py-3 border border-slate-300' 
                    : 'px-6 py-4 border border-slate-300';
                if (newCell.tagName === 'TH') newCell.scope = 'col';
            }
            this.createHandlers();
            this.updateHandlerPositions();
            if (this.historyManager) this.historyManager.saveState();
        }
    }

    window.EditorTools.TableEditor = TableEditor;
})();
