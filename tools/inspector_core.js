/**
 * inspector_core.js
 * Gestiona el estado y la lógica principal del inspector de elementos,
 * AHORA TAMBIÉN ORQUESTA LOS EDITORES CONTEXTUALES Y EL RESIZER GENÉRICO.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class InspectorCore {
        constructor(options) {
            this.treeViewManager = options.treeViewManager;
            this.historyManager = options.historyManager;
            this.propertiesPanel = options.propertiesPanel; // Panel de análisis
            this.stylePanelManager = options.stylePanelManager; // Panel de edición

            // Instanciar editores y el nuevo resizer
            this.tableEditor = new window.EditorTools.TableEditor({ historyManager: this.historyManager, getSelectedElement: this.getSelectedElement.bind(this) });
            this.gridEditor = new window.EditorTools.GridEditor({ historyManager: this.historyManager, getSelectedElement: this.getSelectedElement.bind(this) });
            this.flexEditor = new window.EditorTools.FlexEditor({ historyManager: this.historyManager, getSelectedElement: this.getSelectedElement.bind(this) });
            this.resizerManager = new window.EditorTools.ResizerManager({
                historyManager: this.historyManager,
                propertiesPanel: this.propertiesPanel
            });
            
            this.elementoInspeccionado = null;
            this.inspectorActivo = false;
            
            this.inspectorClickHandler = this.inspectorClickHandler.bind(this);
        }
        
        init() {
            this._setupInspectorToggle();
        }

        reiniciarInspeccionSimple() {
            if (this.elementoInspeccionado) this.elementoInspeccionado.classList.remove('elemento-inspeccion-seleccionado');
            this.elementoInspeccionado = null;
            if (this.treeViewManager) this.treeViewManager.highlightNodeForElement(null);
            
            this.tableEditor.deselectTable();
            this.gridEditor.deselectGrid();
            this.flexEditor.deselectFlexContainer();
            this.resizerManager.hide();

            // Ocultar ambos paneles
            if (this.propertiesPanel) this.propertiesPanel.panelCodigo.classList.add('hidden');
            if (this.stylePanelManager) this.stylePanelManager.panel.classList.add('hidden');
        }

        inspectorClickHandler(e) {
            if (e.target.closest('.floating-panel') || e.target.className.includes('-resize-handler') || e.target.closest('#resizer-box')) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            this.reiniciarInspeccionSimple();
            this.elementoInspeccionado = e.target;
            this.elementoInspeccionado.classList.add('elemento-inspeccion-seleccionado');
            
            const tablaPadre = this.elementoInspeccionado.closest('table');
            const esGrid = this.elementoInspeccionado.classList.contains('grid');
            const esFlex = this.elementoInspeccionado.classList.contains('flex');
            const esHijoDeGrid = this.elementoInspeccionado.parentElement?.classList.contains('grid');
            const esHijoDeFlex = this.elementoInspeccionado.parentElement?.classList.contains('flex');

            if (tablaPadre) {
                this.tableEditor.selectTable(tablaPadre);
            } else if (esGrid) {
                this.gridEditor.selectGrid(this.elementoInspeccionado);
            } else if (esFlex) {
                this.flexEditor.selectFlexContainer(this.elementoInspeccionado);
            } else if (!esHijoDeGrid && !esHijoDeFlex) {
                this.resizerManager.show(this.elementoInspeccionado);
            }
            
            if (this.treeViewManager) this.treeViewManager.highlightNodeForElement(this.elementoInspeccionado);
            
            // Actualizar ambos paneles
            if (this.propertiesPanel) this.propertiesPanel.show(this.elementoInspeccionado);
            if (this.stylePanelManager) this.stylePanelManager.show(this.elementoInspeccionado);
        }

        _setupInspectorToggle() {
            const inspectorBtn = document.getElementById('toggle-inspector-btn');
            const toggleInspector = (activar) => {
                this.inspectorActivo = activar;
                inspectorBtn.classList.toggle('active', activar);
                document.body.classList.toggle('inspector-activo', activar);
                
                if (activar) {
                    document.body.addEventListener('click', this.inspectorClickHandler, true);
                } else {
                    document.body.removeEventListener('click', this.inspectorClickHandler, true);
                    this.reiniciarInspeccionSimple();
                }
            };
            inspectorBtn.onclick = () => toggleInspector(!this.inspectorActivo);
            toggleInspector(true);
        }

        isInspectorActive() {
            return this.inspectorActivo;
        }
        
        getSelectedElement() {
            return this.elementoInspeccionado;
        }
    }

    window.EditorTools.InspectorCore = InspectorCore;
})();