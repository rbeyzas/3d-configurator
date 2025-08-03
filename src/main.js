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

  createModule(x, y, z) {
    const moduleGroup = new THREE.Group();

    // Create wardrobe geometry
    const geometry = new THREE.BoxGeometry(
      this.currentDimensions.width,
      this.currentDimensions.height,
      this.currentDimensions.depth,
    );

    // Get current material color
    const colors = {
      wood: 0x8b4513,
      white: 0xffffff,
      black: 0x000000,
      gray: 0x808080,
    };

    // Create material with current material color
    const material = new THREE.MeshPhongMaterial({
      color: colors[this.currentMaterial] || 0x8b4513,
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

    // Add door details
    this.addDoorDetails(moduleGroup, x, y, z);

    // Store module data
    const moduleData = {
      group: moduleGroup,
      wardrobe: wardrobe,
      position: { x, y, z },
      dimensions: { ...this.currentDimensions },
    };

    this.modules.push(moduleData);
    this.scene.add(moduleGroup);

    return moduleData;
  }

  addDoorDetails(moduleGroup, x, y, z) {
    // Create door frame
    const doorFrameGeometry = new THREE.BoxGeometry(
      this.currentDimensions.width - 4,
      this.currentDimensions.height - 4,
      2,
    );
    const doorFrameMaterial = new THREE.MeshPhongMaterial({ color: 0x654321 });
    const doorFrame = new THREE.Mesh(doorFrameGeometry, doorFrameMaterial);
    doorFrame.position.set(x, y, z + this.currentDimensions.depth / 2 + 1);
    doorFrame.castShadow = true;
    moduleGroup.add(doorFrame);

    // Create door panels
    const panelWidth = (this.currentDimensions.width - 8) / 2;
    const panelGeometry = new THREE.BoxGeometry(panelWidth, this.currentDimensions.height - 8, 1);
    const panelMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });

    // Left panel
    const leftPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    leftPanel.position.set(x - panelWidth / 2 - 2, y, z + this.currentDimensions.depth / 2 + 1.5);
    leftPanel.castShadow = true;
    moduleGroup.add(leftPanel);

    // Right panel
    const rightPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    rightPanel.position.set(x + panelWidth / 2 + 2, y, z + this.currentDimensions.depth / 2 + 1.5);
    rightPanel.castShadow = true;
    moduleGroup.add(rightPanel);

    // Add single door handle in the center of the module
    const handleGeometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
    const handleMaterial = new THREE.MeshPhongMaterial({ color: 0xffd700 });

    const centerHandle = new THREE.Mesh(handleGeometry, handleMaterial);
    centerHandle.rotation.z = Math.PI / 2;
    centerHandle.position.set(x, y, z + this.currentDimensions.depth / 2 + 2.5);
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

    // Create modules
    for (let i = 0; i < numModules; i++) {
      const x = i * this.moduleWidth;
      this.createModule(x, 0, 0);
    }

    // Update module counter
    this.updateModuleCounter();
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
