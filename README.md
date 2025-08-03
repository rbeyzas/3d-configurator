# 3D Wardrobe Configurator

A modern, interactive 3D wardrobe configurator built with Three.js and JavaScript. This application allows users to create, customize, and visualize modular wardrobe systems in real-time.

## 🎯 Features

### Core Functionality

- **3D Model Creation**: Basic cube models using Three.js
- **OrbitControls**: Interactive camera control (rotate, zoom, pan)
- **Real-time Updates**: Dynamic geometry updates without scaling
- **Modular System**: Automatic module addition based on width requirements

### Dimension Controls

- **Global Controls**: Width, Height, Depth sliders for overall dimensions
- **Individual Module Controls**: Per-module customization
- **Fixed Width Logic**: Each module is 60cm wide (task requirement)
- **Responsive Resizing**: Left side remains fixed during resizing

### Advanced Features

- **PBR Materials**: Realistic physically-based rendering
- **HDRI Environment**: High dynamic range imaging for realistic lighting
- **Shadow System**: Realistic shadows with ground plane
- **Material Options**: Wood, White, Black, Gray materials
- **View Controls**: Perspective, Front, Side, Top views

### Bonus Features

- **Individual Module Configuration**: Each module can have different height/depth settings
- **Realistic Scene Lighting**: HDRI environment maps and PBR materials
- **Memory Management**: Proper disposal of Three.js objects
- **Error Handling**: Comprehensive error checking and debugging

## 🚀 Installation

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Setup

```bash
# Start development server
bun run dev
```

### Dependencies

```json
{
  "three": "^0.160.0",
  "vite": "^5.0.0"
}
```

## 📖 Usage

### Basic Configuration

1. **Global Dimensions**: Use the left panel sliders to set overall width, height, and depth
2. **Module Addition**: When width exceeds 60cm, additional modules are automatically added
3. **Individual Settings**: Expand module controls in the right panel to customize each module

### View Controls

- **Perspective**: Default 3D view
- **Front**: Orthographic front view
- **Side**: Orthographic side view
- **Top**: Orthographic top view

### Export Options

- **Take Screenshot**: Capture current view
- **Reset View**: Return to default camera position

## 🏗️ Architecture

### Code Structure

```
src/
├── main.js          # Main application logic
├── style.css        # Styling and layout
└── index.html       # HTML structure

public/
└── vite.svg         # Vite logo
```

### Key Components

#### WardrobeConfigurator Class

- **Constructor**: Initialize Three.js scene, camera, renderer
- **setupLighting()**: HDRI environment and PBR lighting
- **createModule()**: Generate individual wardrobe modules
- **updateModules()**: Handle module creation and positioning
- **updateSpecifications()**: Calculate and display dimensions

#### Module Management

- **Individual Module Data**: Track per-module settings
- **Dynamic Positioning**: Calculate positions based on module widths
- **Memory Management**: Dispose of old geometries and materials

## 📊 Specifications

### Module Dimensions

- **Width**: Fixed at 60cm per module
- **Height**: 60-240cm (adjustable)
- **Depth**: 60-120cm (adjustable)

### Scene Properties

- **Background**: Sky blue environment
- **Lighting**: Ambient + Directional + Point lights
- **Shadows**: Enabled with ground plane
- **Materials**: PBR with environment mapping

## 🔧 Development

### File Structure

```
3d-configurator/
├── index.html           # Main HTML file
├── package.json         # Dependencies and scripts
├── src/
│   ├── main.js         # Core application logic
│   └── style.css       # Styling
└── public/
    └── vite.svg        # Assets
```

## 🎯 Task Requirements

### 🏆 Bonus Features Implemented

- **Individual Module Controls**: Each module can have different height/depth
- **PBR Materials**: Realistic physically-based rendering
- **HDRI Environment**: High dynamic range imaging
- **Shadow System**: Realistic shadows with ground plane
- **Memory Management**: Proper disposal of Three.js objects

## 🚀 Live Demo

### Local Development

```bash
bun run dev
# Open http://localhost:5173
```

### Production Build

```bash
bun run build
# Deploy dist/ folder to your hosting service

```
