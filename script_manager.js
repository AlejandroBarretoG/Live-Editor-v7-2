// script_manager.js
(function() {
    'use strict';
    const scripts = [
        'ui_manager.js',
        'analysis_engine.js',
        'history_manager.js',
        'panel_manager.js',
        'dom_tree_view.js',
        'editor_tools.js',
        'properties_panel.js', // ✅ SCRIPT RESTAURADO
        'analysis_viewer.js',
        'padding_controls.js',
	'margin_controls.js', // ✅ AÑADIDO
    	'dimension_controls.js', // ✅ AÑADIDO
	'border_controls.js', // ✅ AÑADIDO
	'typography_controls.js', // ✅ AÑADIDO
	'box_shadow_controls.js', // ✅ AÑADIDO
	'transform_controls.js', // ✅ AÑADIDO
	'gradient_controls.js', // ✅ AÑADIDO
	'img_background_controls.js', // ✅ AÑADIDO
	'css_filters_controls.js', // ✅ AÑADIDO
	'pattern_controls.js', // ✅ AÑADIDO
	'positioning_controls.js', // ✅ AÑADIDO
	'tailwind_layout_controls.js', // ✅ AÑADIDO
	'layout_controls.js', // ✅ AÑADIDO
        'style_panel_manager.js',
        'table_editor.js',
        'grid_editor.js',
        'flex_editor.js',
        'resizer.js',
        'variables_manager.js', // He movido este script antes del inspector
        'inspector_core.js'
    ];

    const base_path = document.currentScript.src.substring(0, document.currentScript.src.lastIndexOf("/") + 1) + 'tools/';
    let scriptsLoaded = 0;

    const onScriptLoad = () => {
        scriptsLoaded++;
        if (scriptsLoaded === scripts.length) {
            document.dispatchEvent(new CustomEvent('modulesLoaded'));
        }
    };

    scripts.forEach(script_name => {
        const script = document.createElement('script');
        script.src = base_path + script_name;
        script.onload = onScriptLoad;
        script.onerror = () => console.error(`Error loading script: ${script_name}`);
        document.head.appendChild(script);
    });
})();