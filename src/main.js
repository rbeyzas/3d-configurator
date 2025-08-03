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
    this.moduleWidth = 60; // Base module width
    this.currentMaterial = 'wood'; // Track current material
    this.individualModuleData = []; // Track individual module settings

    this.init();
    this.setupControls();
    this.animate();
  }

  init() {
    // Get canvas element
    const canvas = document.getElementById('scene');

    // Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      1000,
    );
    this.camera.position.set(200, 150, 200);

    // Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
    });

    // Force canvas to fill container
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    this.renderer.setSize(containerWidth, containerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;

    // Lighting
    this.setupLighting();

    // Create initial module
    this.createModule(0, 0, 0);

    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
  }

  setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
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
    this.scene.add(directionalLight);

    // Point light for additional illumination
    const pointLight = new THREE.PointLight(0xffffff, 0.5);
    pointLight.position.set(-50, 100, -50);
    this.scene.add(pointLight);
  }

  createModule(x, y, z, moduleIndex = null) {
    const moduleGroup = new THREE.Group();

    // Get individual module settings or use global settings
    let moduleSettings;
    if (moduleIndex !== null && this.individualModuleData[moduleIndex]) {
      moduleSettings = this.individualModuleData[moduleIndex];
    } else {
      moduleSettings = {
        width: this.currentDimensions.width,
        height: this.currentDimensions.height,
        depth: this.currentDimensions.depth,
        material: this.currentMaterial,
      };
    }

    // Create wardrobe geometry
    const geometry = new THREE.BoxGeometry(
      moduleSettings.width,
      moduleSettings.height,
      moduleSettings.depth,
    );

    // Get material color
    const colors = {
      wood: 0x8b4513,
      white: 0xffffff,
      black: 0x000000,
      gray: 0x808080,
    };

    // Create material with module's material color
    const material = new THREE.MeshPhongMaterial({
      color: colors[moduleSettings.material] || 0x8b4513,
      shininess: 30,
      transparent: true,
      opacity: 0.9,
    });

    const wardrobe = new THREE.Mesh(geometry, material);
    wardrobe.castShadow = true;
    wardrobe.receiveShadow = true;
    wardrobe.position.set(x, y, z);

    // Add wardrobe to module group
    moduleGroup.add(wardrobe);

    // Add door details with individual dimensions
    this.addDoorDetails(moduleGroup, x, y, z, moduleSettings);

    // Store module data
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
    // Create door frame
    const doorFrameGeometry = new THREE.BoxGeometry(
      moduleSettings.width - 4,
      moduleSettings.height - 4,
      2,
    );
    const doorFrameMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
    const doorFrame = new THREE.Mesh(doorFrameGeometry, doorFrameMaterial);
    doorFrame.position.set(x, y, z + moduleSettings.depth / 2 + 1);
    doorFrame.castShadow = true;
    moduleGroup.add(doorFrame);

    // Create door panels
    const panelWidth = (moduleSettings.width - 8) / 2;
    const panelGeometry = new THREE.BoxGeometry(panelWidth, moduleSettings.height - 8, 1);
    const panelMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });

    // Left panel
    const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    leftPanel.position.set(x - panelWidth / 2 - 2, y, z + moduleSettings.depth / 2 + 1.5);
    leftPanel.castShadow = true;
    moduleGroup.add(leftPanel);

    // Right panel
    const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    rightPanel.position.set(x + panelWidth / 2 + 2, y, z + moduleSettings.depth / 2 + 1.5);
    rightPanel.castShadow = true;
    moduleGroup.add(rightPanel);

    // Add single door handle in the center of the module
    const handleGeometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
    const handleMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 });

    const centerHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    centerHandle.rotation.z = Math.PI / 2;
    centerHandle.position.set(x, y, z + moduleSettings.depth / 2 + 2.5);
    moduleGroup.add(centerHandle);
  }

  updateModules() {
    // Clear existing modules
    this.modules.forEach((module) => {
      this.scene.remove(module.group);
    });
    this.modules = [];

    // Calculate number of modules needed
    const totalWidth = this.currentDimensions.width;
    const numModules = Math.ceil(totalWidth / this.moduleWidth);

    // Create modules with proper positioning
    let currentX = 0;
    for (let i = 0; i < numModules; i++) {
      // For automatic module creation, each module should be 60cm wide
      let moduleWidth = 60; // Fixed width for automatic modules

      // If individual settings exist, use them
      if (this.individualModuleData[i]) {
        moduleWidth = this.individualModuleData[i].width;
      }

      this.createModule(currentX, 0, 0, i);
      currentX += moduleWidth; // Position next module after current module's width
    }

    // Update module counter and controls
    this.updateModuleCounter();
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

    // Update specifications panel
    this.updateSpecifications();
  }

  updateSpecifications() {
    document.getElementById('total-width').textContent = `${this.currentDimensions.width} cm`;
    document.getElementById('total-height').textContent = `${this.currentDimensions.height} cm`;
    document.getElementById('total-depth').textContent = `${this.currentDimensions.depth} cm`;
    document.getElementById('module-count').textContent = this.modules.length;
  }

  updateIndividualModuleControls() {
    const container = document.getElementById('module-controls');
    container.innerHTML = '';

    this.modules.forEach((module, index) => {
      const moduleControl = this.createModuleControl(index, module);
      container.appendChild(moduleControl);
    });
  }

  createModuleControl(moduleIndex, module) {
    const moduleDiv = document.createElement('div');
    moduleDiv.className = 'module-control';
    moduleDiv.dataset.moduleIndex = moduleIndex;

    // Get module settings or create default
    if (!this.individualModuleData[moduleIndex]) {
      this.individualModuleData[moduleIndex] = {
        width: this.currentDimensions.width,
        height: this.currentDimensions.height,
        depth: this.currentDimensions.depth,
        material: this.currentMaterial,
      };
    }

    const settings = this.individualModuleData[moduleIndex];

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
            <label>Width: <span class="module-width-value">${settings.width}</span> cm</label>
            <input type="range" class="module-width" min="60" max="120" value="${
              settings.width
            }" step="10">
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

    // Add event listeners
    this.setupModuleControlEvents(moduleDiv, moduleIndex);

    return moduleDiv;
  }

  setupModuleControlEvents(moduleDiv, moduleIndex) {
    // Toggle module content
    const header = moduleDiv.querySelector('.module-header');
    const content = moduleDiv.querySelector('.module-content');

    header.addEventListener('click', () => {
      content.classList.toggle('active');
      const arrow = header.querySelector('span:last-child');
      arrow.textContent = content.classList.contains('active') ? '▲' : '▼';
    });

    // Width control
    const widthSlider = moduleDiv.querySelector('.module-width');
    const widthValue = moduleDiv.querySelector('.module-width-value');
    widthSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      widthValue.textContent = value;
      this.individualModuleData[moduleIndex].width = value;
      this.updateSingleModule(moduleIndex);
    });

    // Height control
    const heightSlider = moduleDiv.querySelector('.module-height');
    const heightValue = moduleDiv.querySelector('.module-height-value');
    heightSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      heightValue.textContent = value;
      this.individualModuleData[moduleIndex].height = value;
      this.updateSingleModule(moduleIndex);
    });

    // Depth control
    const depthSlider = moduleDiv.querySelector('.module-depth');
    const depthValue = moduleDiv.querySelector('.module-depth-value');
    depthSlider.addEventListener('input', (e) => {
      const value = parseInt(e.target.value);
      depthValue.textContent = value;
      this.individualModuleData[moduleIndex].depth = value;
      this.updateSingleModule(moduleIndex);
    });
  }

  updateSingleModule(moduleIndex) {
    // Remove the specific module and dispose of geometries
    if (this.modules[moduleIndex]) {
      const oldModule = this.modules[moduleIndex];

      // Dispose of all geometries and materials in the module group
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

    // Calculate new position based on all modules
    let currentX = 0;
    for (let i = 0; i < moduleIndex; i++) {
      if (this.individualModuleData[i]) {
        currentX += this.individualModuleData[i].width;
      } else {
        currentX += 60; // Default module width
      }
    }

    // Recreate the module with new settings and position
    const newModule = this.createModule(currentX, 0, 0, moduleIndex);
    this.modules[moduleIndex] = newModule;

    // Force render update
    this.renderer.render(this.scene, this.camera);
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

      // Clear individual module data when global width changes
      this.individualModuleData = [];

      this.updateModules();
      this.updateSpecifications();
    });

    // Height control
    heightSlider.addEventListener('input', (e) => {
      this.currentDimensions.height = parseInt(e.target.value);
      heightValue.textContent = e.target.value;
      this.updateModules();
      this.updateSpecifications();
    });

    // Depth control
    depthSlider.addEventListener('input', (e) => {
      this.currentDimensions.depth = parseInt(e.target.value);
      depthValue.textContent = e.target.value;
      this.updateModules();
      this.updateSpecifications();
    });

    // Material options
    this.setupMaterialControls();

    // View options
    this.setupViewControls();

    // Export options
    this.setupExportControls();
  }

  setupMaterialControls() {
    const materialBtns = document.querySelectorAll('.material-btn');
    materialBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        // Remove active class from all buttons
        materialBtns.forEach((b) => b.classList.remove('active'));
        // Add active class to clicked button
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
        // Remove active class from all buttons
        viewBtns.forEach((b) => b.classList.remove('active'));
        // Add active class to clicked button
        e.target.classList.add('active');

        const view = e.target.dataset.view;
        this.changeView(view);
      });
    });
  }

  setupExportControls() {
    // Screenshot button
    const screenshotBtn = document.getElementById('screenshot');
    if (screenshotBtn) {
      screenshotBtn.addEventListener('click', () => {
        this.takeScreenshot();
      });
    } else {
      console.error('Screenshot button not found');
    }

    // Reset view button
    const resetViewBtn = document.getElementById('reset-view');
    if (resetViewBtn) {
      resetViewBtn.addEventListener('click', () => {
        console.log('Reset view button clicked');
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
      // Update current material
      this.currentMaterial = material;

      // Update all existing modules
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
    console.log('Resetting all customizations to default');

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

    // Update modules with default settings
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

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new WardrobeConfigurator();
});
