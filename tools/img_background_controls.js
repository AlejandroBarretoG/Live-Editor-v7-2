/**
 * img_background_controls.js
 * Gestiona los controles para las propiedades de la imagen de fondo.
 */
(function() {
    'use strict';
    window.EditorTools = window.EditorTools || {};

    class ImageBackgroundControls {
        constructor(options) {
            this.inspectorCore = options.inspectorCore;
            this.historyManager = options.historyManager;
            this.currentElement = null;
            this.inputs = {};
        }

        init(container) {
            const html = `
                <div class="space-y-3 text-xs">
                    <div>
                        <label class="block font-semibold">Imagen (URL)</label>
                        <div class="flex items-center space-x-1 mt-1">
                            <input type="text" data-prop="backgroundImage" placeholder="https://..." class="w-full p-1 border rounded">
                            <button data-action="upload" class="bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">Subir</button>
                            <input type="file" accept="image/*" class="hidden">
                        </div>
                    </div>
                    <div>
                        <label class="block">Tamaño (Size)</label>
                        <select data-prop="backgroundSize" class="w-full p-1 border rounded mt-1">
                            <option value="auto">Auto</option>
                            <option value="cover">Cover</option>
                            <option value="contain">Contain</option>
                        </select>
                    </div>
                    <div>
                        <label class="block">Repetir (Repeat)</label>
                        <select data-prop="backgroundRepeat" class="w-full p-1 border rounded mt-1">
                            <option value="repeat">Repeat</option>
                            <option value="repeat-x">Repeat X</option>
                            <option value="repeat-y">Repeat Y</option>
                            <option value="no-repeat">No Repeat</option>
                        </select>
                    </div>
                     <div>
                        <label class="block">Posición (X / Y)</label>
                        <div class="flex items-center space-x-2 mt-1">
                            <input type="text" data-prop="backgroundPositionX" placeholder="50%" class="w-1/2 p-1 border rounded">
                            <input type="text" data-prop="backgroundPositionY" placeholder="50%" class="w-1/2 p-1 border rounded">
                        </div>
                    </div>
                </div>
            `;
            container.innerHTML = html;

            // Cache inputs
            this.inputs.backgroundImage = container.querySelector('[data-prop="backgroundImage"]');
            this.inputs.backgroundSize = container.querySelector('[data-prop="backgroundSize"]');
            this.inputs.backgroundRepeat = container.querySelector('[data-prop="backgroundRepeat"]');
            this.inputs.backgroundPositionX = container.querySelector('[data-prop="backgroundPositionX"]');
            this.inputs.backgroundPositionY = container.querySelector('[data-prop="backgroundPositionY"]');
            this.fileInput = container.querySelector('input[type="file"]');
            
            // Event Listeners
            container.querySelector('[data-action="upload"]').addEventListener('click', () => this.fileInput.click());
            
            this.inputs.backgroundImage.addEventListener('change', (e) => this.applyStyle('backgroundImage', `url('${e.target.value}')`));
            this.inputs.backgroundSize.addEventListener('change', (e) => this.applyStyle('backgroundSize', e.target.value));
            this.inputs.backgroundRepeat.addEventListener('change', (e) => this.applyStyle('backgroundRepeat', e.target.value));
            
            const updatePosition = () => {
                const posX = this.inputs.backgroundPositionX.value || '50%';
                const posY = this.inputs.backgroundPositionY.value || '50%';
                this.applyStyle('backgroundPosition', `${posX} ${posY}`);
            };
            this.inputs.backgroundPositionX.addEventListener('change', updatePosition);
            this.inputs.backgroundPositionY.addEventListener('change', updatePosition);

            this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        }

        handleFileUpload(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const dataUrl = e.target.result;
                this.inputs.backgroundImage.value = 'local_file'; // Placeholder
                this.applyStyle('backgroundImage', `url('${dataUrl}')`);
            };
            reader.readAsDataURL(file);
        }

        applyStyle(property, value) {
            if (!this.currentElement) return;
            this.currentElement.style[property] = value;
            this.historyManager.saveState();
        }

        update(element) {
            this.currentElement = element;
            const style = window.getComputedStyle(element);

            const bgImage = style.backgroundImage;
            if (bgImage && bgImage !== 'none') {
                this.inputs.backgroundImage.value = bgImage.replace(/url\(['"]?(.*?)['"]?\)/i, '$1');
            } else {
                this.inputs.backgroundImage.value = '';
            }

            this.inputs.backgroundSize.value = style.backgroundSize;
            this.inputs.backgroundRepeat.value = style.backgroundRepeat;

            const [posX, posY] = style.backgroundPosition.split(' ');
            this.inputs.backgroundPositionX.value = posX;
            this.inputs.backgroundPositionY.value = posY;
        }
    }

    window.EditorTools.ImageBackgroundControls = ImageBackgroundControls;
})();
