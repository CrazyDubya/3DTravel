# Changelog

All notable changes to the 3D Traffic Simulator will be documented in this file.

## [0.2.1] - 2025-11-22

### Added - All Vehicle Types Restored
- **Bus**: Large public transit vehicles
  - Realistic bus model with body, cabin, and windows
  - Follows road paths with proper lane management
  - Configurable speed and density (0-20 buses)
- **Bicycle**: Two-wheeled vehicles
  - Detailed bicycle model with frame and wheels
  - Rides on bike lanes (offset from roads)
  - Fixed speed of 25 km/h
  - Density control (0-30 bicycles)
- **Pedestrian**: Walking individuals
  - Humanoid models with random clothing colors
  - Walk on sidewalks only
  - Walking speed of 5 km/h
  - Density control (0-50 pedestrians)
- **Train**: Surface rail transportation
  - Multi-car trains with locomotive and 2 carriages
  - Follows diagonal rail tracks
  - Realistic windows and wheels
  - Configurable speed (40-200 km/h)
  - Density control (0-10 trains)
- **Subway**: Underground metro system
  - Subway cars on underground tracks
  - Toggle visibility (show/hide underground)
  - Speed of 80 km/h
  - Density control (0-10 subway cars)

### Added - Infrastructure Expansion
- **Rail Tracks**: Diagonal train tracks
  - Realistic sleepers and rails
  - Brown wooden ties, grey metal rails
  - Two parallel tracks at different offsets
- **Subway Tunnels**: Underground infrastructure
  - Transparent tunnel visualization
  - Underground tracks at -5m depth
  - Located at z=80 position

### Added - Street Furniture System
- **Lamp Posts**: Automated street lighting
  - Placed along all roads (every 20 units)
  - Automatic activation at night (6PM-6AM)
  - Point lights for illumination
  - Yellow/warm light color
- **Benches**: Sidewalk seating
  - Wooden benches with metal legs
  - Placed at corners and along sidewalks
  - Proper rotation based on location
- **Bus Stops**: Public transit infrastructure
  - Bus stop signs with shelters
  - Roof and support pillars
  - Blue signage with white icon
  - Placed at strategic locations
- **Traffic Signs**: Road safety signage
  - Stop signs (red octagons) at intersections
  - Speed limit signs (white circles with red border)
  - Proper positioning near intersections

### Added - Traffic Heatmap Visualization
- **HeatmapRenderer**: Real-time traffic visualization
  - Density heatmap mode (vehicles per cell)
  - Speed heatmap mode (average speed per cell)
  - Color gradient: Blue (low) → Green → Yellow → Red (high)
  - Grid-based visualization (10x10 unit cells)
  - Toggle visibility via button
  - Adjustable opacity
  - Updates every second

### UI Improvements
- **Vehicle Density Controls**: All 7 vehicle types
  - Cars, Buses, Bicycles, Pedestrians, Trains, Subway, Emergency
  - Individual sliders for each type
  - Real-time density adjustment
- **Heatmap Toggle**: New button
  - "Show Heatmap" / "Hide Heatmap" button
  - Placed in View Controls section
  - Instant toggle functionality

### Technical Improvements
- **Complete Integration**: All vehicle types work with v0.2 systems
  - Traffic light compliance for road vehicles
  - Collision detection for all types
  - Statistics tracking for all types
  - Weather effects applied uniformly
- **Performance**: Optimized rendering
  - Street furniture uses efficient meshes
  - Heatmap updates throttled to 1Hz
  - Lamp posts use point lights (shadows disabled for performance)

### Files Added
- js/vehicles/Bus.js
- js/vehicles/Bicycle.js
- js/vehicles/Pedestrian.js
- js/vehicles/Train.js
- js/vehicles/Subway.js
- js/analytics/HeatmapRenderer.js
- js/environment/StreetFurniture.js

### Files Modified
- main.js (integrated all new systems)
- index.html (restored all density controls, added heatmap button)
- CHANGELOG.md (this file)

## [0.2.0] - 2025-11-22

### Added - Traffic Intelligence System
- **Traffic Lights**: Fully functional traffic light system at all intersections
  - Red, yellow, green states with configurable timing
  - Synchronized coordination across intersections
  - 3D traffic light models with emissive lighting
- **Collision Detection**: Advanced spatial partitioning collision system
  - Grid-based spatial partitioning for efficient detection
  - Safe distance calculations by vehicle type
  - Vehicle awareness radius (look-ahead distance)
- **Vehicle Behavior**: Realistic traffic behavior
  - Vehicles stop at red lights
  - Safe following distances maintained
  - Smooth acceleration and deceleration
  - Lane discipline with lane assignment
  - Two-way traffic support

### Added - Environment System
- **Day/Night Cycle**: 24-hour time simulation
  - Dynamic sun and moon positioning
  - Realistic lighting transitions (sunrise, day, sunset, night)
  - Sky color changes based on time of day
  - Configurable time speed
  - Time display in UI
- **Weather System**: Multiple weather conditions
  - Clear weather (default)
  - Rain with particle effects
  - Snow with particle effects
  - Fog with reduced visibility
  - Weather affects vehicle speeds
  - Smooth weather transitions
- **Sound System**: Web Audio API integration
  - Engine sounds (varies by vehicle type)
  - Horn sounds
  - Emergency sirens
  - Ambient city sounds
  - Volume controls

### Added - Analytics & Statistics
- **Statistics Tracking**: Real-time data collection
  - Vehicle counts by type
  - Average speeds per vehicle type
  - Congestion level calculation
  - Stop frequency tracking
  - Distance traveled
- **Time-Series Data**: Historical tracking
  - 5-minute rolling window
  - Vehicle count history
  - Speed trends
  - Congestion patterns
- **Heatmap System**: Spatial traffic visualization
  - Density heatmaps
  - Speed heatmaps
  - Grid-based heat calculation
- **Data Export**: Multiple export formats
  - CSV export for spreadsheet analysis
  - JSON export for custom processing
  - Real-time statistics API

### Added - Emergency Vehicles
- **Emergency Vehicle Types**:
  - Ambulances (white with red stripe)
  - Fire trucks (red)
  - Police cars (blue)
- **Emergency Features**:
  - Flashing emergency lights
  - Higher speed limits
  - Animated light patterns
  - Siren sounds

### Changed - Architecture
- **Modular ES6 Structure**: Complete refactoring
  - Separated into logical modules (core, traffic, vehicles, analytics, environment, utils)
  - ES6 module imports/exports
  - Improved code organization and maintainability
- **Configuration Management**: Centralized config system
  - LocalStorage persistence
  - Preset configurations
  - Import/export settings
- **Performance Optimizations**:
  - Spatial grid for collision detection
  - Efficient particle systems
  - Optimized update loops

### UI Improvements
- **New Controls**:
  - Time of day slider (0-24 hours)
  - Weather selector dropdown
  - Emergency vehicle density control
  - Current time display
- **Simplified Controls**:
  - Focused on implemented features (cars and emergency vehicles)
  - Removed placeholder controls for not-yet-implemented vehicles
- **Better Feedback**:
  - Real-time time display
  - Vehicle count updates
  - Responsive sliders and controls

### Technical Details
- **New Files Created**: 15+ modular JavaScript files
- **Lines of Code**: ~2000+ lines of new code
- **Features Implemented**: 20+ major features from roadmap
- **Architecture**: Clean separation of concerns

### Known Limitations
- Bus, bicycle, pedestrian, train, and subway vehicles temporarily removed (will be re-added in v0.2.1)
- Analytics dashboard UI not yet implemented (data collection works)
- Heatmap visualization not yet rendered (data collected)
- Click-to-follow vehicle feature pending
- Time-based charts pending

## [0.1.0] - 2025-11-22

### Added
- Initial 3D traffic simulator
- Basic vehicle types (cars, buses, bicycles, pedestrians, trains, subway)
- Road network with grid pattern
- Sidewalks alongside roads
- Rail tracks (diagonal)
- Elevated highway
- Underground subway tunnels
- Buildings with windows
- Basic camera controls
- Vehicle density controls
- Speed settings
- Two-way traffic toggle
- Pause/resume functionality

### Technical
- Three.js r128 for 3D rendering
- OrbitControls for camera
- Basic animation loop
- Simple vehicle movement along paths

---

## Version Numbering

This project uses semantic versioning (MAJOR.MINOR.PATCH):
- MAJOR: Incompatible API changes
- MINOR: Backward-compatible new features
- PATCH: Backward-compatible bug fixes
