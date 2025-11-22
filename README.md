# 3D Traffic Simulator

A comprehensive 3D JavaScript traffic simulation environment featuring multiple vehicle types, diverse infrastructure, and real-time controls.

## Features

### Vehicle Types
- **Cars** - Standard passenger vehicles with customizable density and speed
- **Buses** - Public transit buses on road networks
- **Bicycles** - Two-wheeled vehicles on bike lanes
- **Pedestrians** - Walking individuals on sidewalks
- **Trains** - Surface rail transportation on dedicated tracks
- **Subway** - Underground metro system

### Infrastructure
- **Roads** - Grid-pattern road network with lane markings
- **Sidewalks** - Pedestrian walkways alongside roads
- **Rail Tracks** - Diagonal train tracks with realistic sleepers and rails
- **Highway** - Elevated expressway with support pillars
- **Subway Tunnels** - Underground tunnel system for metro trains
- **Buildings** - City buildings with illuminated windows

### Control Settings

#### Density Controls
Adjust the number of each vehicle type in the simulation:
- Cars: 0-50 vehicles
- Buses: 0-20 vehicles
- Bicycles: 0-30 vehicles
- Pedestrians: 0-50 individuals
- Trains: 0-10 trains
- Subway: 0-10 subway cars

#### Speed Settings
- **Simulation Speed**: 0.1x - 3.0x (controls overall simulation speed)
- **Car Speed**: 20-120 km/h
- **Bus Speed**: 20-80 km/h
- **Train Speed**: 40-200 km/h

#### Traffic Flow Options
- **Two-Way Traffic**: Enable/disable bidirectional vehicle movement
- **Show Subway**: Toggle underground subway visibility
- **Show Vehicle Paths**: Display vehicle movement paths

#### View Controls
- **Reset Camera**: Return camera to default position
- **Pause/Resume**: Freeze or resume simulation
- **Mouse Controls**:
  - Left click + drag: Rotate view
  - Right click + drag: Pan view
  - Scroll wheel: Zoom in/out

## Setup Instructions

### Option 1: Direct File Opening (Recommended for Testing)
1. Clone or download this repository
2. Open `index.html` directly in a modern web browser
   - Note: Some browsers may block CDN resources when opening local files
   - If you see a blank screen, use Option 2 below

### Option 2: Using a Local Server (Recommended for Development)

#### Using Python (Python 3)
```bash
# Navigate to the project directory
cd 3DTravel

# Start a simple HTTP server
python -m http.server 8000

# Open browser to http://localhost:8000
```

#### Using Node.js (http-server)
```bash
# Install http-server globally (one-time setup)
npm install -g http-server

# Navigate to the project directory
cd 3DTravel

# Start the server
http-server -p 8000

# Open browser to http://localhost:8000
```

#### Using PHP
```bash
# Navigate to the project directory
cd 3DTravel

# Start PHP built-in server
php -S localhost:8000

# Open browser to http://localhost:8000
```

## Technology Stack

- **Three.js** (r128) - 3D graphics library
- **OrbitControls** - Camera navigation controls
- **Vanilla JavaScript** - No framework dependencies
- **CSS3** - Modern styling with gradients and shadows

## Project Structure

```
3DTravel/
├── index.html       # Main HTML structure
├── styles.css       # UI styling and layout
├── simulator.js     # Core simulation logic and 3D rendering
└── README.md        # This file
```

## Architecture

### Main Classes

#### TrafficSimulator
The main controller class that:
- Initializes the Three.js scene, camera, and renderer
- Creates infrastructure (roads, buildings, tracks)
- Manages vehicle creation and destruction
- Handles user controls and settings
- Runs the animation loop

#### Vehicle Base Class
Abstract base class for all vehicle types with:
- Position and movement tracking
- Path selection logic
- Speed management
- Scene integration

#### Specialized Vehicle Classes
- **Car**: Standard 4-wheeled vehicles on roads
- **Bus**: Larger public transit vehicles
- **Bicycle**: Two-wheeled vehicles on bike lanes
- **Pedestrian**: Walking individuals on sidewalks
- **Train**: Multi-car trains on diagonal tracks
- **Subway**: Underground metro cars

### Infrastructure Components
- Grid-based road network (horizontal and vertical)
- Sidewalks parallel to roads
- Diagonal rail tracks with realistic details
- Elevated highway with support structures
- Underground subway tunnel system
- Procedurally placed buildings with windows

## Performance Considerations

- Optimized mesh creation with geometry reuse
- Shadow mapping for realistic lighting
- Fog effect for distant object culling
- Adjustable simulation speed for performance tuning
- Dynamic vehicle spawning/despawning based on density settings

## Browser Compatibility

Tested and working on:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

Requires WebGL support and modern JavaScript (ES6+).

## Future Enhancements

Potential features for future development:
- Traffic lights and intersection management
- Vehicle collision detection
- Route planning and navigation
- Day/night cycle
- Weather effects
- Traffic analytics and statistics
- Customizable city layouts
- Import/export of configurations

## Contributing

Feel free to fork this project and submit pull requests for improvements!

## License

MIT License - feel free to use this project for learning and development.

## Credits

Created with Three.js and modern web technologies.
