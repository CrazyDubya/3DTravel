# 3D Traffic Simulator v0.2

A comprehensive 3D JavaScript traffic simulation environment featuring intelligent traffic management, dynamic environments, and real-time analytics.

## What's New in v0.2

🚦 **Traffic Intelligence** - Functional traffic lights, collision detection, and realistic vehicle behavior
🌆 **Day/Night Cycle** - 24-hour time simulation with dynamic lighting
🌧️ **Weather System** - Rain, snow, and fog with particle effects
🚑 **Emergency Vehicles** - Ambulances, fire trucks, and police cars with sirens
📊 **Analytics** - Real-time statistics tracking and data export
🔧 **Modular Architecture** - Clean ES6 modules for maintainability

## Features

### Vehicle Types (v0.2)
- **Cars** - Standard passenger vehicles with collision avoidance and traffic light compliance
- **Emergency Vehicles** - Ambulances, fire trucks, and police cars with:
  - Flashing emergency lights
  - Sirens (when sound enabled)
  - Higher speed capabilities
  - Priority navigation

*Note: Buses, bicycles, pedestrians, trains, and subway will be re-added in v0.2.1*

### Infrastructure
- **Roads** - Grid-pattern road network with yellow lane markings and lane discipline
- **Traffic Lights** - Functional traffic signals at all intersections
  - Red, yellow, green states
  - Synchronized timing
  - Configurable durations
- **Sidewalks** - Pedestrian walkways alongside roads
- **Buildings** - City buildings with illuminated windows (brightness varies with time of day)

### Traffic Intelligence 🚦
- **Collision Detection** - Spatial grid-based collision avoidance
- **Safe Distances** - Vehicles maintain appropriate following distances
- **Traffic Light Compliance** - Vehicles stop at red lights, proceed on green
- **Lane Management** - Vehicles assigned to lanes with lane-keeping behavior
- **Smart Deceleration** - Smooth braking when approaching obstacles
- **Two-Way Traffic** - Configurable bidirectional traffic flow

### Environment System 🌍
- **Day/Night Cycle**
  - 24-hour time simulation
  - Dynamic sun and moon positioning
  - Realistic lighting (sunrise, day, sunset, night)
  - Sky color transitions
  - Adjustable time speed
- **Weather Conditions**
  - Clear, Rain, Snow, Fog
  - Particle effects for precipitation
  - Visibility reduction in fog
  - Weather affects vehicle speeds
- **Sound System**
  - Engine sounds (varies by speed)
  - Horn effects
  - Emergency sirens
  - Ambient city sounds
  - Volume control

### Analytics & Statistics 📊
- **Real-Time Tracking**
  - Vehicle counts by type
  - Average speeds
  - Congestion levels
  - Stop frequency
  - Distance traveled
- **Data Export**
  - CSV format for spreadsheets
  - JSON format for processing
  - Time-series data
  - Heatmap data
- **Performance Metrics**
  - 5-minute rolling history
  - Trend analysis ready
  - Configurable update intervals

### Control Settings (v0.2)

#### Density Controls
- **Cars**: 0-50 vehicles
- **Emergency Vehicles**: 0-10 vehicles (ambulances, fire trucks, police)

#### Speed Settings
- **Simulation Speed**: 0.1x - 3.0x (controls overall simulation speed)
- **Car Speed**: 20-120 km/h (configurable via code)
- **Bus Speed**: 20-80 km/h (configurable via code)
- **Train Speed**: 40-200 km/h (configurable via code)

#### Environment Controls
- **Time of Day**: 0-24 hours (slider control)
- **Weather**: Select from Clear, Rain, Snow, or Fog

#### Traffic Flow Options
- **Two-Way Traffic**: Enable/disable bidirectional vehicle movement

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

## Project Structure (v0.2)

```
3DTravel/
├── index.html              # Main HTML structure
├── styles.css              # UI styling and layout
├── main.js                 # Entry point (ES6 module)
├── simulator.js            # Legacy v0.1 (kept for reference)
├── js/
│   ├── core/
│   │   └── TimeManager.js          # Day/night cycle system
│   ├── traffic/
│   │   ├── TrafficLight.js         # Traffic light system
│   │   └── CollisionSystem.js      # Collision detection
│   ├── vehicles/
│   │   ├── Vehicle.js              # Base vehicle class
│   │   ├── Car.js                  # Car implementation
│   │   └── EmergencyVehicle.js     # Emergency vehicles
│   ├── analytics/
│   │   └── StatisticsTracker.js    # Analytics & stats
│   ├── environment/
│   │   ├── WeatherSystem.js        # Weather effects
│   │   └── SoundManager.js         # Audio system
│   └── utils/
│       ├── ConfigManager.js        # Configuration management
│       └── SpatialPartitioning.js  # Collision grid
├── assets/
│   ├── sounds/      # Audio files (placeholder)
│   └── textures/    # Texture files (placeholder)
├── README.md        # This file
├── CHANGELOG.md     # Version history
├── ROADMAP_V0.2.md  # Development roadmap
└── package.json     # Project metadata
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
