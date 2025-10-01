/**
 * properties_panel.js
 * Gestiona la visualización de las propiedades de un elemento en su panel dedicado.
 * AHORA ORQUESTA el AnalysisViewer para mostrar los detalles.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class PropertiesPanelManager {
        constructor(options) {
            this.panelCodigo = options.panelCodigo;
            this.contenidoCodigo = options.contenidoCodigo;
            this.analysisContainer = options.analysisContainer;
            this.codigoHtmlToggle = options.codigoHtmlToggle;
            this.elementAnalysisToggle = options.elementAnalysisToggle;
            this.codigoHtmlPre = document.getElementById('codigo-html-pre');

            // ✅ Instanciar el visor de análisis, pasándole su contenedor.
            this.analysisViewer = new window.EditorTools.AnalysisViewer(this.analysisContainer);
            this.inspectorCore = null; // Se inyectará más tarde.
        }

        init() {
            this.codigoHtmlToggle.addEventListener('click', (e) => {
                this.codigoHtmlPre.classList.toggle('hidden');
                e.currentTarget.querySelector('svg').classList.toggle('-rotate-90', this.codigoHtmlPre.classList.contains('hidden'));
            });

            this.elementAnalysisToggle.addEventListener('click', (e) => {
                this.analysisContainer.classList.toggle('hidden');
                e.currentTarget.querySelector('svg').classList.toggle('-rotate-90', this.analysisContainer.classList.contains('hidden'));
            });
        }

        show(element) {
            if (!element) return;
            
            // Lógica para mostrar el código HTML
            const escapedHtml = element.outerHTML.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            this.contenidoCodigo.innerHTML = escapedHtml;
            
            // ✅ Delegar la muestra del análisis al visor, asegurando que tenga la referencia al inspector.
            this.analysisViewer.inspectorCore = this.inspectorCore;
            this.analysisViewer.show(element);
            
            // --- ✅ LÓGICA MODIFICADA ---

            // Solo mostramos el panel si estaba oculto, pero no lo expandimos si ya estaba compactado.
            if (this.panelCodigo.classList.contains('hidden')) {
                this.panelCodigo.classList.remove('hidden');
            }
        
            // No alteramos el estado de los toggles internos si el panel principal está compactado.
            if (this.panelCodigo.classList.contains('panel-compactado')) {
                return; 
            }
        
            // Si el panel de código NO está compactado, nos aseguramos de que las secciones internas no se oculten
            // al seleccionar un nuevo elemento, respetando su estado previo (que gestionan sus propios toggles).
            // Esta es una corrección a la lógica anterior para asegurar que si el usuario las colapsa, permanezcan así.
            // La lógica original forzaba la expansión, esta es más respetuosa con la interacción del usuario.
            if (!this.codigoHtmlPre.classList.contains('hidden')) {
                 this.codigoHtmlToggle.querySelector('svg').classList.remove('-rotate-90');
            }
            if (!this.analysisContainer.classList.contains('hidden')) {
                 this.elementAnalysisToggle.querySelector('svg').classList.remove('-rotate-90');
            }
        }
    }

    window.EditorTools.PropertiesPanelManager = PropertiesPanelManager;
})();