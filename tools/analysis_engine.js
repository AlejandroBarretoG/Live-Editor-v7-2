/**
 * analysis_engine.js
 * * Este módulo se encarga de analizar un elemento del DOM y extraer
 * información detallada sobre sus propiedades, estilos y atributos.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    // --- BLOQUE DE CONFIGURACIÓN ---
    const TAILWIND_CLASS_TO_CSS_MAP = {
        'font-bold': 'font-weight', 'font-semibold': 'font-weight', 'font-normal': 'font-weight',
        'text-xs': 'font-size', 'text-sm': 'font-size', 'text-base': 'font-size', 'text-lg': 'font-size', 'text-xl': 'font-size', 'text-2xl': 'font-size',
        'text-center': 'text-align', 'text-left': 'text-align', 'text-right': 'text-align',
        'uppercase': 'text-transform', 'lowercase': 'text-transform', 'capitalize': 'text-transform',
        'p-': 'padding', 'pt-': 'padding-top', 'pr-': 'padding-right', 'pb-': 'padding-bottom', 'pl-': 'padding-left',
        'm-': 'margin', 'mt-': 'margin-top', 'mr-': 'margin-right', 'mb-': 'margin-bottom', 'ml-': 'margin-left',
        'w-': 'width', 'h-': 'height', 'max-w-': 'max-width',
        'bg-': 'background-color',
        'flex': 'display', 'grid': 'display', 'block': 'display', 'inline-block': 'display', 'hidden': 'display',
        'rounded': 'border-radius', 'rounded-md': 'border-radius', 'rounded-lg': 'border-radius', 'rounded-full': 'border-radius',
        'shadow': 'box-shadow', 'shadow-md': 'box-shadow', 'shadow-lg': 'box-shadow',
        'items-center': 'align-items', 'justify-center': 'justify-content',
        'gap-': 'gap'
    };
    // --- FIN DEL BLOQUE DE CONFIGURACIÓN ---

    /**
     * Analiza un elemento del DOM y devuelve un objeto con su información estructurada.
     * @param {HTMLElement} element - El elemento del DOM a analizar.
     * @returns {object} Un objeto con los datos del análisis y la configuración de visualización.
     */
    const analyzeElement = (element) => {
        const analysisData = {
            tagName: element.tagName.toLowerCase(),
            allAttributes: [],
            rawClasses: [],
            textContent: '',
            tailwindStyles: [],
            computedStyles: [],
            backgrounds: [],
            boxModel: {},
            positioning: {}
        };

        const computed = window.getComputedStyle(element);

        // ... (Toda la lógica de análisis para rellenar analysisData sigue aquí, sin cambios) ...
        // 1. All Attributes
        for (const attr of element.attributes) {
            if (!['class', 'style', 'data-inspector-id'].includes(attr.name)) {
                analysisData.allAttributes.push({ name: attr.name, value: attr.value });
            }
        }
        // 2. Raw Classes
        if (element.className && typeof element.className === 'string') {
            analysisData.rawClasses = element.className.split(' ').filter(c => c && !c.startsWith('elemento-'));
        }
        // 3. Direct Text Content
        const directText = Array.from(element.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.nodeValue.trim());
        if (directText) {
            analysisData.textContent = [{name: 'Contenido', value: directText.nodeValue.trim()}];
        }
        // 4. Parse Tailwind Classes
        const parseTailwindClasses = () => {
            const properties = [];
            const classes = analysisData.rawClasses;
            const classMap = {
                'bg-': 'Color de Fondo', 'font-': 'Fuente', 'p-': 'Relleno (Padding)',
                'px-': 'Padding (X)', 'py-': 'Padding (Y)', 'pt-': 'Padding (Top)', 'pr-': 'Padding (Right)',
                'pb-': 'Padding (Bottom)', 'pl-': 'Padding (Left)', 'm-': 'Margen', 'mx-': 'Margen (X)',
                'my-': 'Margen (Y)', 'mt-': 'Margen (Top)', 'mr-': 'Margen (Right)', 'mb-': 'Margen (Bottom)',
                'ml-': 'Margen (Left)', 'w-': 'Ancho', 'h-': 'Alto', 'gap-': 'Espaciado (Gap)',
                'rounded': 'Bordes Redondeados', 'shadow': 'Sombra', 'border': 'Borde', 'items-': 'Alinear Items',
                'justify-': 'Justificar Contenido'
            };
            const standaloneClasses = {
                'flex': { property: 'Display', value: 'flex' }, 'grid': { property: 'Display', value: 'grid' },
                'hidden': { property: 'Display', value: 'hidden' }, 'block': { property: 'Display', value: 'block' },
                'inline-block': { property: 'Display', value: 'inline-block' }, 'absolute': { property: 'Posición', value: 'absolute' },
                'relative': { property: 'Posición', value: 'relative' }, 'fixed': { property: 'Posición', value: 'fixed' },
                'uppercase': { property: 'Transformación Texto', value: 'uppercase' },
                'whitespace-nowrap': { property: 'Espacio en Blanco', value: 'nowrap' },
                'table-fixed': { property: 'Layout de Tabla', value: 'fixed' }, 'list-disc': { property: 'Estilo de Lista', value: 'disc' },
                'list-inside': { property: 'Posición de Lista', value: 'inside' },
            };

            for (const cls of classes) {
                if (standaloneClasses[cls]) {
                    properties.push({ ...standaloneClasses[cls], className: cls });
                    continue;
                }
                if (cls.startsWith('hover:')) {
                    const baseClass = cls.substring(6);
                    if (baseClass === 'underline') properties.push({ property: 'Hover', value: 'Subrayado', className: cls });
                    else if (baseClass.startsWith('bg-')) properties.push({ property: 'Hover Color Fondo', value: baseClass.substring(3), className: cls });
                    continue;
                }
                if (cls.startsWith('text-')) {
                    const value = cls.substring(5);
                    if (value.includes('-') && !isNaN(parseInt(value.split('-')[1], 10))) properties.push({ property: 'Color de Texto', value, className: cls });
                    else if (['left', 'center', 'right', 'justify'].includes(value)) properties.push({ property: 'Alineación de Texto', value, className: cls });
                    else properties.push({ property: 'Tamaño de Texto', value, className: cls });
                    continue;
                }
                for (const prefix in classMap) {
                    if (cls.startsWith(prefix)) {
                        let value = cls.substring(prefix.length);
                        if (value === '' && ['rounded', 'shadow', 'border'].includes(prefix)) value = 'default';
                        if (value) properties.push({ property: classMap[prefix], value, className: cls });
                        break;
                    }
                }
            }
            return properties;
        };
        analysisData.tailwindStyles = parseTailwindClasses();
        // 5. Key Computed Styles & Backgrounds
        const importantStyles = ['color', 'font-size', 'font-weight', 'font-family', 'background-color', 'background-image', 'background-blend-mode'];
        importantStyles.forEach(prop => {
            const value = computed.getPropertyValue(prop);
            if (value && value !== '0px' && value !== 'auto' && value !== 'normal' && !value.startsWith('rgba(0, 0, 0, 0)') && value !== 'none') {
                if (prop.startsWith('background')) {
                    analysisData.backgrounds.push({ property: prop, value });
                } else {
                    analysisData.computedStyles.push({ property: prop, value });
                }
            }
        });
        // 6. Box Model
        const boxModelProps = ['margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left', 'width', 'height'];
        boxModelProps.forEach(prop => {
            const value = computed.getPropertyValue(prop);
            if (value && value !== '0px') {
                analysisData.boxModel[prop] = value;
            }
        });
        // 7. Positioning
        if (computed.getPropertyValue('position') !== 'static') {
            const posProps = ['position', 'top', 'right', 'bottom', 'left', 'z-index'];
            posProps.forEach(prop => {
                const value = computed.getPropertyValue(prop);
                if (value && value !== 'auto') {
                     analysisData.positioning[prop] = value;
                }
            });
        }
        
        // --- NUEVA SECCIÓN DE PROTECCIÓN ---
        // Este es el "manual de instrucciones" para el panel de propiedades.
        // Define qué campos mostrar y cómo.
        const displayConfig = [
            { key: 'textContent', title: 'Texto', isTable: true },
            { key: 'rawClasses', title: 'Clases', isTable: false },
            { key: 'allAttributes', title: 'Atributos', isTable: true },
            { key: 'tailwindStyles', title: 'Estilos Tailwind', isTable: true },
            { key: 'backgrounds', title: 'Fondos y Degradados', isTable: true },
            { key: 'computedStyles', title: 'Estilos Tipográficos', isTable: true },
            { key: 'boxModel', title: 'Modelo de Caja', isTable: true, isObject: true },
            { key: 'positioning', title: 'Posicionamiento', isTable: true, isObject: true }
        ];

        return { analysisData, displayConfig };
    };

    // ... (El resto del archivo, como getComputedCssForTailwindClass, no cambia) ...
    const getComputedCssForTailwindClass = (className, element) => {
        const classToCssMap = TAILWIND_CLASS_TO_CSS_MAP; // Usa la constante definida arriba

        let cssProperty = null;
        if (classToCssMap[className]) {
            cssProperty = classToCssMap[className];
        } else {
            const prefix = Object.keys(classToCssMap).find(p => className.startsWith(p) && p.endsWith('-'));
            if (prefix) cssProperty = classToCssMap[prefix];
        }

        if (cssProperty) {
            const computed = window.getComputedStyle(element);
            const value = computed.getPropertyValue(cssProperty);
            if (value && value !== '0px' && value !== 'normal' && !value.startsWith('rgba(0, 0, 0, 0)')) {
                return `${cssProperty}: ${value}`;
            }
        }
        return null;
    };
    
    window.EditorTools.analyzeElement = analyzeElement;
    window.EditorTools.getComputedCssForTailwindClass = getComputedCssForTailwindClass;

})();