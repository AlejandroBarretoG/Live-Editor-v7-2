/**
 * style_panel_manager.js
 * Orquesta el nuevo panel "Editar Estilos", gestionando sus secciones
 * y delegando la lógica de cada una a módulos de control específicos.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class StylePanelManager {
        constructor(options) {
            this.inspectorCore = options.inspectorCore;
            this.historyManager = options.historyManager;
            this.panel = document.getElementById('panel-estilos');
            
            // Instanciar todos los módulos de control
            this.paddingControls = new window.EditorTools.PaddingControls({ inspectorCore: this.inspectorCore, historyManager: this.historyManager });
            this.marginControls = new window.EditorTools.MarginControls({ inspectorCore: this.inspectorCore, historyManager: this.historyManager });
            this.dimensionControls = new window.EditorTools.DimensionControls({ inspectorCore: this.inspectorCore, historyManager: this.historyManager });
            this.borderControls = new window.EditorTools.BorderControls({ inspectorCore: this.inspectorCore, historyManager: this.historyManager });
            this.typographyControls = new window.EditorTools.TypographyControls({ inspectorCore: this.inspectorCore, historyManager: this.historyManager });
            this.boxShadowControls = new window.EditorTools.BoxShadowControls({ inspectorCore: this.inspectorCore, historyManager: this.historyManager });
            this.transformControls = new window.EditorTools.TransformControls({ inspectorCore: this.inspectorCore, historyManager: this.historyManager });
            this.gradientControls = new window.EditorTools.GradientControls({ inspectorCore: this.inspectorCore, historyManager: this.historyManager });
            this.imageBackgroundControls = new window.EditorTools.ImageBackgroundControls({ inspectorCore: this.inspectorCore, historyManager: this.historyManager });
            this.cssFilterControls = new window.EditorTools.CssFilterControls({ inspectorCore: this.inspectorCore, historyManager: this.historyManager });
            this.patternControls = new window.EditorTools.PatternControls({ inspectorCore: this.inspectorCore, historyManager: this.historyManager });
            this.positioningControls = new window.EditorTools.PositioningControls({ inspectorCore: this.inspectorCore, historyManager: this.historyManager });
            this.tailwindLayoutControls = new window.EditorTools.TailwindLayoutControls({ inspectorCore: this.inspectorCore, historyManager: this.historyManager });
            this.layoutControls = new window.EditorTools.LayoutControls({ inspectorCore: this.inspectorCore, historyManager: this.historyManager });
        }

        init() {
            if (!this.panel) return;

            // Inicializar todos los módulos de control
            this.paddingControls.init(document.getElementById('padding-controls-container'));
            this.marginControls.init(document.getElementById('margin-controls-container'));
            this.dimensionControls.init(document.getElementById('dimension-controls-container'));
            this.borderControls.init(document.getElementById('border-controls-container'));
            this.typographyControls.init(document.getElementById('typography-controls-container'));
            this.boxShadowControls.init(document.getElementById('box-shadow-controls-container'));
            this.transformControls.init(document.getElementById('transform-controls-container'));
            this.gradientControls.init(document.getElementById('gradient-controls-container'));
            this.imageBackgroundControls.init(document.getElementById('img-background-controls-container'));
            this.cssFilterControls.init(document.getElementById('css-filters-controls-container'));
            this.patternControls.init(document.getElementById('pattern-controls-container'));
            this.positioningControls.init(document.getElementById('positioning-controls-container'));
            this.tailwindLayoutControls.init(document.getElementById('tailwind-layout-controls-container'));
            this.layoutControls.init(document.getElementById('layout-controls-container'));

            // Lógica para manejar los acordeones (desplegables)
            this.panel.querySelectorAll('.style-section-header').forEach(header => {
                header.addEventListener('click', () => {
                    const content = header.nextElementSibling;
                    const icon = header.querySelector('svg');
                    content.classList.toggle('hidden');
                    icon.classList.toggle('rotate-180');
                });
            });
        }

        show(element) {
            if (!element) {
                if(this.panel) this.panel.classList.add('hidden');
                return;
            }
            
            if(this.panel) this.panel.classList.remove('hidden');
            
            // Actualizar todos los módulos de control con la información del elemento seleccionado
            this.paddingControls.update(element);
            this.marginControls.update(element);
            this.dimensionControls.update(element);
            this.borderControls.update(element);
            this.typographyControls.update(element);
            this.boxShadowControls.update(element);
            this.transformControls.update(element);
            this.gradientControls.update(element);
            this.imageBackgroundControls.update(element);
            this.cssFilterControls.update(element);
            this.patternControls.update(element);
            this.positioningControls.update(element);
            this.tailwindLayoutControls.update(element);
            this.layoutControls.update(element);
        }
    }

    window.EditorTools.StylePanelManager = StylePanelManager;
})();