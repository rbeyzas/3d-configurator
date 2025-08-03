import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import './style.css';

class WardrobeConfigurator {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.modules = [];
    this.currentDimensions = { width: 60, height: 60, depth: 60 };
    this.moduleWidth = 60;
    this.currentMaterial = 'wood';
    this.individualModuleData = [];

    this.init();
    this.setupControls();
    this.animate();
  }

  init() {
    const canvas = document.getElementById('scene');

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000,
    );
    this.camera.position.set(200, 150, 200);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });

    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    this.renderer.setSize(containerWidth, containerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    this.setupLighting();

    this.createModule(0, 0, 0);

    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupLighting() {
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    pmremGenerator.compileEquirectangularShader();

    const envTexture = new THREE.CubeTextureLoader().load([
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // right
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // left
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // top
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // bottom
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // front
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', // back
    ]);

    this.scene.environment = envTexture;
    this.scene.background = new THREE.Color(0x87ceeb);

    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -200;
    directionalLight.shadow.camera.right = 200;
    directionalLight.shadow.camera.top = 200;
    directionalLight.shadow.camera.bottom = -200;
    directionalLight.shadow.bias = -0.0001;
    this.scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 0.3);
    pointLight.position.set(-50, 100, -50);
    this.scene.add(pointLight);

    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0xcccccc });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -30;
    ground.receiveShadow = true;
    this.scene.add(ground);
  }

  createModule(x, y, z, moduleIndex = null) {
    const moduleGroup = new THREE.Group();

    let moduleSettings;
    if (moduleIndex !== null && this.individualModuleData[moduleIndex]) {
      moduleSettings = {
        width: 60,
        height: this.individualModuleData[moduleIndex].height,
        depth: this.individualModuleData[moduleIndex].depth,
        material: this.currentMaterial,
      };
    } else {
      moduleSettings = {
        width: 60,
        height: 60,
        depth: 60,
        material: this.currentMaterial,
      };
    }

    const geometry = new THREE.BoxGeometry(
      moduleSettings.width,
      moduleSettings.height,
      moduleSettings.depth,
    );

    console.log(`Creating module ${moduleIndex} with settings:`, moduleSettings);

    const materialProperties = {
      wood: {
        color: 0x8b4513,
        metalness: 0.0,
        roughness: 0.8,
      },
      white: {
        color: 0xffffff,
        metalness: 0.0,
        roughness: 0.3,
      },

      gray: {
        color: 0x808080,
        metalness: 0.0,
        roughness: 0.5,
      },
    };

    const materialType = moduleSettings.material || 'wood';
    const properties = materialProperties[materialType];
    const material = new THREE.MeshStandardMaterial({
      color: properties.color,
      metalness: properties.metalness,
      roughness: properties.roughness,
      envMapIntensity: 1.0,
    });

    const wardrobe = new THREE.Mesh(geometry, material);
    wardrobe.castShadow = true;
    wardrobe.receiveShadow = true;
    wardrobe.position.set(x, y, z);

    moduleGroup.add(wardrobe);

    this.addDoorDetails(moduleGroup, x, y, z, moduleSettings);

    const moduleData = {
      group: moduleGroup,
      wardrobe: wardrobe,
      position: { x, y, z },
      dimensions: { ...moduleSettings },
      moduleIndex: moduleIndex,
    };

    this.modules.push(moduleData);
    this.scene.add(moduleGroup);

    return moduleData;
  }

  addDoorDetails(moduleGroup, x, y, z, moduleSettings) {
    const doorFrameGeometry = new THREE.BoxGeometry(
      moduleSettings.width - 4,
      moduleSettings.height - 4,
      2,
    );
    const doorFrameMaterial = new THREE.MeshStandardMaterial({
      color: 0x654321,
      metalness: 0.0,
      roughness: 0.9,
    });
    const doorFrame = new THREE.Mesh(doorFrameGeometry, doorFrameMaterial);
    doorFrame.position.set(x, y, z + moduleSettings.depth / 2 + 1);
    doorFrame.castShadow = true;
    moduleGroup.add(doorFrame);

    const panelWidth = (moduleSettings.width - 8) / 2;
    const panelGeometry = new THREE.BoxGeometry(panelWidth, moduleSettings.height - 8, 1);
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      metalness: 0.0,
      roughness: 0.8,
    });

    const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    leftPanel.position.set(x - panelWidth / 2 - 2, y, z + moduleSettings.depth / 2 + 1.5);
    leftPanel.castShadow = true;
    moduleGroup.add(leftPanel);

    const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    rightPanel.position.set(x + panelWidth / 2 + 2, y, z + moduleSettings.depth / 2 + 1.5);
    rightPanel.castShadow = true;
    moduleGroup.add(rightPanel);

    const handleGeometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
    const handleMaterial = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 0.9,
      roughness: 0.1,
    });

    const centerHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    centerHandle.rotation.z = Math.PI / 2;
    centerHandle.position.set(x, y, z + moduleSettings.depth / 2 + 2.5);
    moduleGroup.add(centerHandle);
  }

  updateModules() {
    console.log(`Updating modules - current width: ${this.currentDimensions.width}`);

    this.modules.forEach((module) => {
      this.scene.remove(module.group);
    });
    this.modules = [];

    const totalWidth = this.currentDimensions.width;
    const numModules = Math.ceil(totalWidth / 60);
    console.log(`Creating ${numModules} modules`);

    let currentX = 0;
    for (let i = 0; i < numModules; i++) {
      console.log(`Creating module ${i} at position ${currentX}`);

      if (!this.individualModuleData[i]) {
        this.individualModuleData[i] = {
          width: 60,
          height: 60,
          depth: 60,
          material: this.currentMaterial,
        };
      }

      this.createModule(currentX, 0, 0, i);
      currentX += 60;
    }

    this.updateModuleCounter();

    this.updateSpecifications();

    this.updateIndividualModuleControls();
  }

  updateModuleCounter() {
    let counter = document.querySelector('.module-counter');
    if (!counter) {
      counter = document.createElement('div');
      counter.className = 'module-counter';
      document.querySelector('.scene-container').appendChild(counter);
    }
    counter.textContent = `${this.modules.length} Module${this.modules.length > 1 ? 's' : ''}`;
  }

  updateSpecifications() {
    let actualTotalWidth = 0;
    let maxHeight = 0;
    let maxDepth = 0;

    console.log('Calculating specifications for modules:', this.modules.length);

    this.modules.forEach((module, index) => {
      const moduleWidth = module.dimensions.width;
      const moduleHeight = module.dimensions.height;
      const moduleDepth = module.dimensions.depth;

      actualTotalWidth += moduleWidth;
      maxHeight = Math.max(maxHeight, moduleHeight);
      maxDepth = Math.max(maxDepth, moduleDepth);

      console.log(
        `Module ${index}: width=${moduleWidth}, height=${moduleHeight}, depth=${moduleDepth}`,
      );
    });

    console.log(`Final specs: width=${actualTotalWidth}, height=${maxHeight}, depth=${maxDepth}`);

    document.getElementById('total-width').textContent = `${actualTotalWidth} cm`;
    document.getElementById('total-height').textContent = `${maxHeight} cm`;
    document.getElementById('total-depth').textContent = `${maxDepth} cm`;
    document.getElementById('module-count').textContent = this.modules.length;
  }

  updateIndividualModuleControls() {
    const container = document.getElementById('module-controls');
    if (!container) {
      console.error('Module controls container not found');
      return;
    }

    if (this._updatingControls) {
      return;
    }

    this._updatingControls = true;
    console.log(`Updating ${this.modules.length} module controls`);

    container.innerHTML = '';

    this.modules.forEach((module, index) => {
      const moduleControl = this.createModuleControl(index, module);
      container.appendChild(moduleControl);
    });

    this._updatingControls = false;
    console.log(`Updated ${this.modules.length} module controls`);
  }

  createModuleControl(moduleIndex, module) {
    const moduleDiv = document.createElement('div');
    moduleDiv.className = 'module-control';
    moduleDiv.dataset.moduleIndex = moduleIndex;

    if (!this.individualModuleData[moduleIndex]) {
      this.individualModuleData[moduleIndex] = {
        width: 60,
        height: 60,
        depth: 60,
        material: this.currentMaterial,
      };
    }

    const settings = this.individualModuleData[moduleIndex];

    console.log(`Creating control for module ${moduleIndex} with settings:`, settings);

    moduleDiv.innerHTML = `
      <div class="module-header">
        <div class="module-title">
          <span class="module-number">${moduleIndex + 1}</span>
          Module ${moduleIndex + 1}
        </div>
        <span>▼</span>
      </div>
      <div class="module-content">
        <div class="module-dimensions">
          <div class="module-dimension">
            <label>Width: <span class="module-width-value">60</span> cm (Fixed)</label>
            <input type="range" class="module-width" min="60" max="60" value="60" step="10" disabled>
          </div>
          <div class="module-dimension">
            <label>Height: <span class="module-height-value">${settings.height}</span> cm</label>
            <input type="range" class="module-height" min="60" max="240" value="${
              settings.height
            }" step="10">
          </div>
          <div class="module-dimension">
            <label>Depth: <span class="module-depth-value">${settings.depth}</span> cm</label>
            <input type="range" class="module-depth" min="60" max="120" value="${
              settings.depth
            }" step="10">
          </div>
        </div>
      </div>
    `;

    this.setupModuleControlEvents(moduleDiv, moduleIndex);

    console.log(
      `Created control for module ${moduleIndex} with ${
        moduleDiv.querySelectorAll('input').length
      } inputs`,
    );

    return moduleDiv;
  }

  setupModuleControlEvents(moduleDiv, moduleIndex) {
    console.log(`Setting up events for module ${moduleIndex}`);

    const header = moduleDiv.querySelector('.module-header');
    const content = moduleDiv.querySelector('.module-content');

    if (header && content) {
      header.addEventListener('click', () => {
        content.classList.toggle('active');
        const arrow = header.querySelector('span:last-child');
        if (arrow) {
          arrow.textContent = content.classList.contains('active') ? '▲' : '▼';
        }
      });
    } else {
      console.error(`Header or content not found for module ${moduleIndex}`);
    }

    // Height control
    const heightSlider = moduleDiv.querySelector('.module-height');
    const heightValue = moduleDiv.querySelector('.module-height-value');
    console.log(
      `Module ${moduleIndex}: heightSlider=${!!heightSlider}, heightValue=${!!heightValue}`,
    );

    if (heightSlider && heightValue) {
      heightSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        console.log(`Height slider changed for module ${moduleIndex}: ${value}`);
        heightValue.textContent = value;
        if (!this.individualModuleData[moduleIndex]) {
          this.individualModuleData[moduleIndex] = {};
        }
        this.individualModuleData[moduleIndex].height = value;
        console.log(`Module ${moduleIndex} height changed to: ${value}`);
        this.updateSingleModule(moduleIndex);
      });
    } else {
      console.error(`Height slider or value not found for module ${moduleIndex}`);
    }

    // Depth control
    const depthSlider = moduleDiv.querySelector('.module-depth');
    const depthValue = moduleDiv.querySelector('.module-depth-value');
    console.log(`Module ${moduleIndex}: depthSlider=${!!depthSlider}, depthValue=${!!depthValue}`);

    if (depthSlider && depthValue) {
      depthSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        console.log(`Depth slider changed for module ${moduleIndex}: ${value}`);
        depthValue.textContent = value;
        if (!this.individualModuleData[moduleIndex]) {
          this.individualModuleData[moduleIndex] = {};
        }
        this.individualModuleData[moduleIndex].depth = value;
        console.log(`Module ${moduleIndex} depth changed to: ${value}`);
        this.updateSingleModule(moduleIndex);
      });
    } else {
      console.error(`Depth slider or value not found for module ${moduleIndex}`);
    }
  }

  updateSingleModule(moduleIndex) {
    console.log(`Updating single module ${moduleIndex}`);

    if (this.modules[moduleIndex]) {
      const oldModule = this.modules[moduleIndex];
      console.log(`Removing old module ${moduleIndex}`);

      oldModule.group.traverse((child) => {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          child.material.dispose();
        }
      });

      this.scene.remove(oldModule.group);
    } else {
      console.error(`Module ${moduleIndex} not found in modules array`);
    }

    let currentX = moduleIndex * 60;

    const newModule = this.createModule(currentX, 0, 0, moduleIndex);
    this.modules[moduleIndex] = newModule;

    this.renderer.render(this.scene, this.camera);

    this.updateSpecifications();
  }

  updateSubsequentModules(startIndex) {
    console.log(`Updating subsequent modules from index ${startIndex}`);

    for (let i = startIndex; i < this.modules.length; i++) {
      if (this.modules[i]) {
        const oldModule = this.modules[i];
        oldModule.group.traverse((child) => {
          if (child.geometry) {
            child.geometry.dispose();
          }
          if (child.material) {
            child.material.dispose();
          }
        });
        this.scene.remove(oldModule.group);
      }

      const currentX = i * 60;
      console.log(`Creating subsequent module ${i} at position ${currentX}`);
      const newModule = this.createModule(currentX, 0, 0, i);
      this.modules[i] = newModule;
    }
  }

  setupControls() {
    const widthSlider = document.getElementById('width');
    const heightSlider = document.getElementById('height');
    const depthSlider = document.getElementById('depth');
    const widthValue = document.getElementById('width-value');
    const heightValue = document.getElementById('height-value');
    const depthValue = document.getElementById('depth-value');

    // Width control
    widthSlider.addEventListener('input', (e) => {
      this.currentDimensions.width = parseInt(e.target.value);
      widthValue.textContent = e.target.value;

      this.updateModules();
      this.updateSpecifications();
    });

    // Height control
    heightSlider.addEventListener('input', (e) => {
      this.currentDimensions.height = parseInt(e.target.value);
      heightValue.textContent = e.target.value;

      this.modules.forEach((module, index) => {
        if (!this.individualModuleData[index] || !this.individualModuleData[index].height) {
          if (this.individualModuleData[index]) {
            this.individualModuleData[index].height = this.currentDimensions.height;
          }
          this.updateSingleModule(index);
        }
      });

      this.updateSpecifications();

      if (this.modules.length > 0) {
        this.updateIndividualModuleControls();
      }
    });

    // Depth control
    depthSlider.addEventListener('input', (e) => {
      this.currentDimensions.depth = parseInt(e.target.value);
      depthValue.textContent = e.target.value;

      this.modules.forEach((module, index) => {
        if (!this.individualModuleData[index] || !this.individualModuleData[index].depth) {
          if (this.individualModuleData[index]) {
            this.individualModuleData[index].depth = this.currentDimensions.depth;
          }
          this.updateSingleModule(index);
        }
      });

      this.updateSpecifications();

      if (this.modules.length > 0) {
        this.updateIndividualModuleControls();
      }
    });

    this.setupMaterialControls();

    this.setupViewControls();

    this.setupExportControls();
  }

  setupMaterialControls() {
    const materialBtns = document.querySelectorAll('.material-btn');
    materialBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        materialBtns.forEach((b) => b.classList.remove('active'));
        e.target.classList.add('active');

        const material = e.target.dataset.material;
        this.changeMaterial(material);
      });
    });
  }

  setupViewControls() {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        viewBtns.forEach((b) => b.classList.remove('active'));
        e.target.classList.add('active');

        const view = e.target.dataset.view;
        this.changeView(view);
      });
    });
  }

  setupExportControls() {
    const screenshotBtn = document.getElementById('screenshot');
    if (screenshotBtn) {
      screenshotBtn.addEventListener('click', () => {
        this.takeScreenshot();
      });
    } else {
      console.error('Screenshot button not found');
    }

    const resetViewBtn = document.getElementById('reset-view');
    if (resetViewBtn) {
      resetViewBtn.addEventListener('click', () => {
        this.resetView();
      });
    } else {
      console.error('Reset view button not found');
    }
  }

  changeMaterial(material) {
    const colors = {
      wood: 0x8b4513,
      white: 0xffffff,
      black: 0x000000,
      gray: 0x808080,
    };

    const color = colors[material];
    if (color) {
      this.currentMaterial = material;

      this.modules.forEach((module) => {
        module.wardrobe.material.color.setHex(color);
      });
    }
  }

  changeView(view) {
    const positions = {
      perspective: { x: 200, y: 150, z: 200 },
      front: { x: 0, y: 0, z: 300 },
      side: { x: 300, y: 0, z: 0 },
      top: { x: 0, y: 300, z: 0 },
    };

    const position = positions[view];
    if (position) {
      this.camera.position.set(position.x, position.y, position.z);
      this.controls.target.set(0, 0, 0);
      this.controls.update();
    }
  }

  takeScreenshot() {
    this.renderer.render(this.scene, this.camera);
    const canvas = this.renderer.domElement;
    const link = document.createElement('a');
    link.download = 'wardrobe-configurator.png';
    link.href = canvas.toDataURL();
    link.click();
  }

  resetView() {
    // Reset camera position
    this.camera.position.set(200, 150, 200);
    this.controls.target.set(0, 0, 0);
    this.controls.update();

    // Reset dimensions to default
    this.currentDimensions = { width: 60, height: 60, depth: 60 };

    // Reset material to wood
    this.currentMaterial = 'wood';

    // Update sliders to default values
    const widthSlider = document.getElementById('width');
    const heightSlider = document.getElementById('height');
    const depthSlider = document.getElementById('depth');
    const widthValue = document.getElementById('width-value');
    const heightValue = document.getElementById('height-value');
    const depthValue = document.getElementById('depth-value');

    if (widthSlider) widthSlider.value = 60;
    if (heightSlider) heightSlider.value = 60;
    if (depthSlider) depthSlider.value = 60;
    if (widthValue) widthValue.textContent = '60';
    if (heightValue) heightValue.textContent = '60';
    if (depthValue) depthValue.textContent = '60';

    // Reset material buttons
    const materialBtns = document.querySelectorAll('.material-btn');
    materialBtns.forEach((btn) => {
      btn.classList.remove('active');
      if (btn.dataset.material === 'wood') {
        btn.classList.add('active');
      }
    });

    // Reset view buttons
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach((btn) => {
      btn.classList.remove('active');
      if (btn.dataset.view === 'perspective') {
        btn.classList.add('active');
      }
    });

    this.updateModules();

    console.log('All customizations reset to default');
  }

  onWindowResize() {
    const canvas = document.getElementById('scene');
    const container = canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new WardrobeConfigurator();
});
