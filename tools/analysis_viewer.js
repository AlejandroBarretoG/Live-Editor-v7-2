/**
 * analysis_viewer.js
 * MÓDULO DE SOLO LECTURA
 * Se encarga de mostrar los detalles analizados de un elemento en un contenedor proporcionado.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class AnalysisViewer {
        /**
         * @param {HTMLElement} containerEl El elemento del DOM donde se renderizará el análisis.
         */
        constructor(containerEl) {
            this.analysisContainer = containerEl;
        }

        /**
         * Muestra el análisis del elemento en el contenedor.
         * @param {HTMLElement} element El elemento a analizar y mostrar.
         */
        show(element) {
            if (!element || !window.EditorTools?.analyzeElement) {
                this.hide();
                return;
            };

            this.analysisContainer.innerHTML = '';
            
            const elementsToAnalyze = [element, ...Array.from(element.querySelectorAll('*'))];
            
            elementsToAnalyze.forEach((el, index) => {
                const { analysisData, displayConfig } = window.EditorTools.analyzeElement(el);
                
                const hasContent = displayConfig.some(config => {
                    const data = analysisData[config.key];
                    return data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);
                });
                if (!hasContent) return;

                const elementBlock = document.createElement('div');
                const title = document.createElement('h6');
                title.className = `font-bold font-mono text-gray-800 bg-gray-100 p-1 rounded-md w-full ${index > 0 ? 'mt-3' : ''}`;
                title.textContent = `<${analysisData.tagName}>`;
                elementBlock.appendChild(title);
                
                // --- ✅ FUNCIÓN INTERNA MODIFICADA ---
                const createSection = (titleText, items, isTable = true) => {
                    if (!items || Object.keys(items).length === 0) return;
                    const subTitle = document.createElement('p');
                    subTitle.className = 'text-xs font-semibold text-gray-500 mt-2';
                    subTitle.textContent = titleText;
                    elementBlock.appendChild(subTitle);
                    if (isTable) {
                        const table = document.createElement('table');
                        table.className = 'w-full mt-1';
                        const tbody = table.createTBody();
                        items.forEach(item => {
                            const row = tbody.insertRow();
                            row.insertCell().textContent = item.name || item.property;
                            row.cells[0].className = 'w-1/2 text-gray-500 pr-2 align-top break-all';
                            
                            const valueCell = row.insertCell();
                            valueCell.className = 'w-1/2 font-medium break-all';
                            valueCell.appendChild(document.createTextNode(item.value));

                            // --- ✅ LÓGICA RESTAURADA DE LA VERSIÓN v6-11 ---
                            // Si la sección es de estilos Tailwind y la función de ayuda existe,
                            // intentamos obtener y mostrar el CSS computado.
                            if (titleText === 'Estilos Tailwind' && window.EditorTools.getComputedCssForTailwindClass) {
                                const computedCss = window.EditorTools.getComputedCssForTailwindClass(item.className, el);
                                if (computedCss) {
                                    valueCell.appendChild(document.createTextNode(' '));
                                    const cssBadge = document.createElement('span');
                                    cssBadge.textContent = computedCss;
                                    cssBadge.className = 'bg-green-100 text-green-800 text-xs font-mono px-2 py-0.5 rounded-md ml-1';
                                    valueCell.appendChild(cssBadge);
                                }
                            }
                        });
                        elementBlock.appendChild(table);
                    } else {
                        const div = document.createElement('div');
                        div.className = 'flex flex-wrap gap-1 mt-1';
                        items.forEach(item => {
                            const span = document.createElement('span');
                            span.className = 'bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-xs';
                            span.textContent = item;
                            div.appendChild(span);
                        });
                        elementBlock.appendChild(div);
                    }
                };
                
                displayConfig.forEach(config => {
                    let items = analysisData[config.key];
                    if (config.isObject) {
                        items = Object.entries(items).map(([p, v]) => ({ property: p, value: v }));
                    }
                    createSection(config.title, items, config.isTable);
                });

                this.analysisContainer.appendChild(elementBlock);
            });

            if (this.analysisContainer.children.length === 0) {
                this.analysisContainer.innerHTML = '<p class="text-center text-gray-400 italic">No se encontraron detalles analizables.</p>';
            }
        }
        
        hide() {
            this.analysisContainer.innerHTML = '';
        }
    }

    window.EditorTools.AnalysisViewer = AnalysisViewer;
})();