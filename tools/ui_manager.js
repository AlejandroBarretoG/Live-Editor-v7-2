/**
 * ui_manager.js
 * Este módulo se encarga de construir e inyectar la interfaz de usuario principal,
 * como los paneles de herramientas, en el DOM.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    const getPanelsHTML = () => {
        return `
            <div id="panel-treeview" class="fixed bg-white shadow-2xl rounded-lg flex flex-col border border-gray-300 floating-panel w-96" style="top: 1rem; right: 1rem; z-index: 10005;">
                <div id="treeview-header" class="p-2 bg-gray-100 border-b rounded-t-lg flex justify-between items-center panel-header">
                    <h3 class="text-sm font-bold text-gray-700">DOM</h3>
                    <div class="flex items-center space-x-2">
                        <button id="toggle-inspector-btn" title="Activar/Desactivar inspección" class="p-1 rounded hover:bg-gray-200">
                             <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path><path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.022 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path></svg>
                        </button>
                        <button title="Compactar/Expandir" class="panel-toggle-btn bg-gray-300 hover:bg-gray-400 text-gray-700 font-mono text-sm px-2 rounded">-</button>
                        <button title="Cerrar" class="close-panel-btn text-gray-500 hover:text-gray-800 text-xl leading-none">&times;</button>
                    </div>
                </div>
                <div class="p-2 overflow-auto flex-grow panel-content h-[calc(80vh-40px)]">
                    <ul id="tree-view-root" class="text-sm"></ul>
                </div>
            </div>
            
            <div id="panel-codigo" class="fixed bg-white shadow-2xl rounded-lg flex flex-col border border-gray-300 floating-panel w-96 panel-compactado hidden" style="top: calc(1rem + 40px); right: 1rem; z-index: 10004;">
                <div id="codigo-header" class="p-2 bg-gray-100 border-b rounded-t-lg flex justify-between items-center panel-header">
                    <h3 class="text-sm font-bold text-gray-700">Propiedades</h3>
                    <div class="flex items-center space-x-2">
                        <button title="Compactar/Expandir" class="panel-toggle-btn bg-gray-300 hover:bg-gray-400 text-gray-700 font-mono text-sm px-2 rounded">+</button>
                        <button title="Cerrar" class="close-panel-btn text-gray-500 hover:text-gray-800 text-xl leading-none">&times;</button>
                    </div>
                </div>
                <div class="p-2 overflow-auto flex-grow panel-content">
                     <div>
                        <button id="codigo-html-toggle" class="w-full text-left text-xs font-semibold text-gray-600 p-1 bg-gray-100 rounded hover:bg-gray-200 flex justify-between items-center">
                            <span>HTML</span>
                            <svg class="w-3 h-3 transform transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </button>
                        <div id="codigo-html-content" class="mt-1">
                            <pre id="codigo-html-pre" class="w-full bg-gray-900 text-white p-2 rounded-md text-sm overflow-auto h-32"><code id="contenido-codigo">Selecciona un elemento para ver su código.</code></pre>
                            
                            <button id="element-analysis-toggle" class="w-full text-left text-xs font-semibold text-gray-600 p-1 bg-gray-100 rounded hover:bg-gray-200 flex justify-between items-center mt-2">
                                <span>Análisis del Elemento</span>
                                <svg class="w-3 h-3 transform transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                            </button>
                            <div id="element-analysis-in-code" class="text-xs text-gray-700 mt-1 max-h-56 overflow-y-auto border rounded-md p-2 space-y-4"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div id="panel-estilos" class="fixed bg-white shadow-2xl rounded-lg flex flex-col border border-gray-300 floating-panel w-96 hidden" style="top: 1rem; left: 1rem; z-index: 10003; max-height: 90vh;">
                <div id="estilos-header" class="p-2 bg-gray-100 border-b rounded-t-lg flex justify-between items-center panel-header">
                    <h3 class="text-sm font-bold text-gray-700">Editar Estilos</h3>
                    <div class="flex items-center space-x-2">
                        <button title="Compactar/Expandir" class="panel-toggle-btn bg-gray-300 hover:bg-gray-400 text-gray-700 font-mono text-sm px-2 rounded">-</button>
                        <button title="Cerrar" class="close-panel-btn text-gray-500 hover:text-gray-800 text-xl leading-none">&times;</button>
                    </div>
                </div>
                <div class="overflow-auto flex-grow panel-content">
                    <div class="style-section">
                        <div class="style-section-header p-2 bg-gray-50 border-b cursor-pointer flex justify-between items-center">
                            <span class="text-xs font-semibold">Layout (Tailwind)</span>
                            <svg class="w-4 h-4 transform transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </div>
                        <div class="p-3 border-b hidden">
                            <div id="tailwind-layout-controls-container"></div>
                        </div>
                    </div>
                    <div class="style-section">
                        <div class="style-section-header p-2 bg-gray-50 border-b cursor-pointer flex justify-between items-center">
                            <span class="text-xs font-semibold">Layout (Estilos)</span>
                            <svg class="w-4 h-4 transform transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </div>
                        <div class="p-3 border-b hidden">
                            <div id="layout-controls-container"></div>
                        </div>
                    </div>
                    <div class="style-section">
                        <div class="style-section-header p-2 bg-gray-50 border-b cursor-pointer flex justify-between items-center">
                            <span class="text-xs font-semibold">Posicionamiento</span>
                            <svg class="w-4 h-4 transform transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </div>
                        <div class="p-3 border-b hidden">
                            <div id="positioning-controls-container"></div>
                        </div>
                    </div>
                    <div class="style-section">
                        <div class="style-section-header p-2 bg-gray-50 border-b cursor-pointer flex justify-between items-center">
                            <span class="text-xs font-semibold">Patrones y Texturas</span>
                            <svg class="w-4 h-4 transform transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </div>
                        <div class="p-3 border-b hidden">
                            <div id="pattern-controls-container"></div>
                        </div>
                    </div>
                    <div class="style-section">
                        <div class="style-section-header p-2 bg-gray-50 border-b cursor-pointer flex justify-between items-center">
                            <span class="text-xs font-semibold">Filtros CSS</span>
                            <svg class="w-4 h-4 transform transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </div>
                        <div class="p-3 border-b hidden">
                            <div id="css-filters-controls-container"></div>
                        </div>
                    </div>
                    <div class="style-section">
                        <div class="style-section-header p-2 bg-gray-50 border-b cursor-pointer flex justify-between items-center">
                            <span class="text-xs font-semibold">Fondo</span>
                            <svg class="w-4 h-4 transform transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </div>
                        <div class="p-3 border-b hidden">
                            <div id="gradient-controls-container"></div>
                        </div>
                    </div>
                    <div class="style-section">
                        <div class="style-section-header p-2 bg-gray-50 border-b cursor-pointer flex justify-between items-center">
                            <span class="text-xs font-semibold">Imagen de Fondo</span>
                            <svg class="w-4 h-4 transform transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </div>
                        <div class="p-3 border-b hidden">
                            <div id="img-background-controls-container"></div>
                        </div>
                    </div>
                    <div class="style-section">
                        <div class="style-section-header p-2 bg-gray-50 border-b cursor-pointer flex justify-between items-center">
                            <span class="text-xs font-semibold">Transformaciones</span>
                            <svg class="w-4 h-4 transform transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </div>
                        <div class="p-3 border-b hidden">
                            <div id="transform-controls-container"></div>
                        </div>
                    </div>
                    <div class="style-section">
                        <div class="style-section-header p-2 bg-gray-50 border-b cursor-pointer flex justify-between items-center">
                            <span class="text-xs font-semibold">Tipografía</span>
                            <svg class="w-4 h-4 transform transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </div>
                        <div class="p-3 border-b hidden">
                            <div id="typography-controls-container"></div>
                        </div>
                    </div>
                    <div class="style-section">
                        <div class="style-section-header p-2 bg-gray-50 border-b cursor-pointer flex justify-between items-center">
                            <span class="text-xs font-semibold">Relleno (Padding)</span>
                            <svg class="w-4 h-4 transform transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </div>
                        <div class="p-3 border-b hidden">
                            <div id="padding-controls-container"></div>
                        </div>
                    </div>
                    <div class="style-section">
                        <div class="style-section-header p-2 bg-gray-50 border-b cursor-pointer flex justify-between items-center">
                            <span class="text-xs font-semibold">Margen (Margin)</span>
                            <svg class="w-4 h-4 transform transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </div>
                        <div class="p-3 border-b hidden">
                            <div id="margin-controls-container"></div>
                        </div>
                    </div>
                    <div class="style-section">
                        <div class="style-section-header p-2 bg-gray-50 border-b cursor-pointer flex justify-between items-center">
                            <span class="text-xs font-semibold">Dimensiones</span>
                            <svg class="w-4 h-4 transform transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </div>
                        <div class="p-3 border-b hidden">
                            <div id="dimension-controls-container"></div>
                        </div>
                    </div>
                    <div class="style-section">
                        <div class="style-section-header p-2 bg-gray-50 border-b cursor-pointer flex justify-between items-center">
                            <span class="text-xs font-semibold">Borde y Contorno</span>
                            <svg class="w-4 h-4 transform transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </div>
                        <div class="p-3 border-b hidden">
                            <div id="border-controls-container"></div>
                        </div>
                    </div>
                    <div class="style-section">
                        <div class="style-section-header p-2 bg-gray-50 border-b cursor-pointer flex justify-between items-center">
                            <span class="text-xs font-semibold">Sombra de Caja (Box Shadow)</span>
                            <svg class="w-4 h-4 transform transition-transform" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                        </div>
                        <div class="p-3 border-b hidden">
                            <div id="box-shadow-controls-container"></div>
                        </div>
                    </div>
                </div>
            </div>
            `;
    };

    const init = () => {
        const panelContainer = document.createElement('div');
        panelContainer.id = 'editor-panels-container';
        panelContainer.innerHTML = getPanelsHTML();
        document.body.appendChild(panelContainer);
    };

    window.EditorTools.UIManager = {
        init: init
    };

})();