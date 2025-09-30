================================
 Live Editor - Editor Visual Web
================================

Este proyecto es una herramienta de edición visual en tiempo real que se ejecuta directamente en el navegador. Permite a los usuarios inspeccionar, analizar y modificar los estilos y el contenido de una página web de forma interactiva, similar a las herramientas de desarrollador del navegador pero con una interfaz más orientada al diseño visual.

-----------------
-- Funcionalidades Principales --
-----------------

* **Inspector de Elementos**: Permite seleccionar cualquier elemento en la página con un clic para ver y editar sus propiedades.
* **Panel de Estilos Avanzado**: Un panel flotante y modular con secciones desplegables para editar una amplia gama de propiedades CSS, incluyendo:
    * Layout (Flexbox y Grid a través de clases de Tailwind y estilos en línea)
    * Posicionamiento (position, top, left, z-index)
    * Dimensiones (width, height, min/max)
    * Tipografía (fuente, tamaño, color, peso, alineación)
    * Modelo de Caja (Padding, Margin, Borde)
    * Efectos Visuales (Sombra de Caja, Transformaciones, Filtros CSS)
    * Fondos (Color sólido, Degradados, Imágenes y Patrones de textura)
* **Panel de Propiedades**: Un panel de solo lectura que muestra el código HTML del elemento seleccionado y un análisis detallado de sus atributos y estilos computados.
* **Edición Contextual**: Muestra herramientas específicas según el elemento seleccionado, como editores visuales para Tablas, CSS Grid y Flexbox.
* **Vista de Árbol del DOM**: Un panel que muestra la estructura jerárquica del documento, permitiendo navegar y seleccionar elementos desde el árbol.
* **Edición de Texto en Vivo**: Permite editar el contenido de texto directamente sobre la página haciendo doble clic.
* **Historial de Cambios**: Soporte completo para deshacer (Ctrl+Z) y rehacer (Ctrl+Y) las modificaciones.
* **Interfaz Modular**: Todos los paneles son flotantes, arrastrables, redimensionables y se pueden compactar o cerrar.

-----------------
-- Estructura del Proyecto --
-----------------

El proyecto está organizado en una estructura modular para facilitar su mantenimiento y expansión.

* `v6-14.html`: El archivo principal que carga la página de demostración y todos los scripts necesarios.
* `styles.css`: Contiene todos los estilos para la interfaz del editor (paneles, botones, etc.).
* `script_manager.js`: Orquesta la carga de todos los módulos de JavaScript en el orden correcto.
* `tools/`: Esta carpeta contiene el núcleo de la aplicación, con cada archivo `.js` encargado de una funcionalidad específica (e.g., `inspector_core.js`, `style_panel_manager.js`, `padding_controls.js`, etc.).

-----------------
-- Cómo Empezar --
-----------------

Para ejecutar el proyecto, simplemente abre el archivo `v6-14.html` en un navegador web moderno (como Chrome, Firefox, o Edge). No se requiere ningún servidor ni proceso de compilación.

-----------------
-- Tecnologías Utilizadas --
-----------------

* JavaScript Vainilla (ES6+)
* Tailwind CSS (cargado a través de CDN para los estilos de la página de demostración y la UI del editor)
* HTML5
* CSS3
