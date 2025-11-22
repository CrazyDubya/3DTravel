// Main Entry Point for 3D Traffic Simulator v0.2
import { ConfigManager } from './js/utils/ConfigManager.js';
import { SpatialGrid } from './js/utils/SpatialPartitioning.js';
import { TimeManager } from './js/core/TimeManager.js';
import { TrafficLightManager } from './js/traffic/TrafficLight.js';
import { CollisionSystem } from './js/traffic/CollisionSystem.js';
import { WeatherSystem } from './js/environment/WeatherSystem.js';
import { SoundManager } from './js/environment/SoundManager.js';
import { StatisticsTracker } from './js/analytics/StatisticsTracker.js';
import { Car } from './js/vehicles/Car.js';
import { EmergencyVehicle } from './js/vehicles/EmergencyVehicle.js';

class TrafficSimulator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.isPaused = false;
        this.vehicles = [];
        this.lastFrameTime = Date.now();

        // Initialize managers
        this.config = new ConfigManager();
        this.timeManager = null;
        this.trafficLightManager = null;
        this.collisionSystem = null;
        this.weatherSystem = null;
        this.soundManager = null;
        this.statisticsTracker = null;

        // Infrastructure
        this.roadPaths = [];
        this.sidewalkPaths = [];
        this.railPaths = [];
        this.highwayPath = null;
        this.subwayPath = null;
        this.intersections = [];

        this.init();
    }

    init() {
        this.setupScene();
        this.createInfrastructure();

        // Initialize systems
        this.timeManager = new TimeManager(this.scene, this.config);
        this.trafficLightManager = new TrafficLightManager(this.scene, this.config);
        this.trafficLightManager.createLightsForIntersections(this.intersections);
        this.collisionSystem = new CollisionSystem(this.config);
        this.weatherSystem = new WeatherSystem(this.scene, this.config);
        this.soundManager = new SoundManager(this.config);
        this.statisticsTracker = new StatisticsTracker(this.config);

        this.setupControls();
        this.updateVehicles();
        this.animate();
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 500);

        // Camera
        const container = document.getElementById('canvas-container');
        this.camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(50, 60, 50);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(this.renderer.domElement);

        // Orbit Controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2.1;

        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = container.clientWidth / container.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    createInfrastructure() {
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3a5f0b });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        this.createRoads();
        this.createSidewalks();
        this.createBuildings();
    }

    createRoads() {
        const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 });
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });

        for (let i = -60; i <= 60; i += 30) {
            // Horizontal roads
            const roadH = new THREE.Mesh(
                new THREE.BoxGeometry(120, 0.1, 8),
                roadMaterial
            );
            roadH.position.set(0, 0.05, i);
            roadH.receiveShadow = true;
            this.scene.add(roadH);

            // Road lines
            for (let j = -60; j <= 60; j += 10) {
                const line = new THREE.Mesh(
                    new THREE.BoxGeometry(4, 0.15, 0.3),
                    lineMaterial
                );
                line.position.set(j, 0.1, i);
                this.scene.add(line);
            }

            // Vertical roads
            const roadV = new THREE.Mesh(
                new THREE.BoxGeometry(8, 0.1, 120),
                roadMaterial
            );
            roadV.position.set(i, 0.05, 0);
            roadV.receiveShadow = true;
            this.scene.add(roadV);

            // Road lines
            for (let j = -60; j <= 60; j += 10) {
                const line = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.15, 4),
                    lineMaterial
                );
                line.position.set(i, 0.1, j);
                this.scene.add(line);
            }

            // Store paths
            this.roadPaths.push({
                type: 'horizontal',
                z: i,
                xStart: -60,
                xEnd: 60
            });
            this.roadPaths.push({
                type: 'vertical',
                x: i,
                zStart: -60,
                zEnd: 60
            });
        }

        // Store intersections
        for (let i = -60; i <= 60; i += 30) {
            for (let j = -60; j <= 60; j += 30) {
                this.intersections.push({ x: i, z: j });
            }
        }
    }

    createSidewalks() {
        const sidewalkMaterial = new THREE.MeshLambertMaterial({ color: 0xCCCCCC });

        for (let i = -60; i <= 60; i += 30) {
            // Horizontal sidewalks
            const sidewalkH1 = new THREE.Mesh(
                new THREE.BoxGeometry(120, 0.2, 2),
                sidewalkMaterial
            );
            sidewalkH1.position.set(0, 0.1, i + 5);
            this.scene.add(sidewalkH1);

            const sidewalkH2 = new THREE.Mesh(
                new THREE.BoxGeometry(120, 0.2, 2),
                sidewalkMaterial
            );
            sidewalkH2.position.set(0, 0.1, i - 5);
            this.scene.add(sidewalkH2);

            // Vertical sidewalks
            const sidewalkV1 = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.2, 120),
                sidewalkMaterial
            );
            sidewalkV1.position.set(i + 5, 0.1, 0);
            this.scene.add(sidewalkV1);

            const sidewalkV2 = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.2, 120),
                sidewalkMaterial
            );
            sidewalkV2.position.set(i - 5, 0.1, 0);
            this.scene.add(sidewalkV2);

            this.sidewalkPaths.push({ type: 'horizontal', z: i + 5, xStart: -60, xEnd: 60 });
            this.sidewalkPaths.push({ type: 'horizontal', z: i - 5, xStart: -60, xEnd: 60 });
        }
    }

    createBuildings() {
        const buildingPositions = [
            { x: -45, z: -45, w: 15, h: 25, d: 15 },
            { x: -45, z: -15, w: 15, h: 18, d: 15 },
            { x: -45, z: 15, w: 15, h: 30, d: 15 },
            { x: -45, z: 45, w: 15, h: 22, d: 15 },
            { x: 15, z: -45, w: 15, h: 24, d: 15 },
            { x: 15, z: 45, w: 15, h: 19, d: 15 },
            { x: 45, z: -45, w: 15, h: 26, d: 15 },
            { x: 45, z: 15, w: 15, h: 23, d: 15 },
            { x: 45, z: 45, w: 15, h: 27, d: 15 }
        ];

        buildingPositions.forEach(pos => {
            const building = new THREE.Mesh(
                new THREE.BoxGeometry(pos.w, pos.h, pos.d),
                new THREE.MeshLambertMaterial({
                    color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.55, 0.3, 0.6)
                })
            );
            building.position.set(pos.x, pos.h / 2, pos.z);
            building.castShadow = true;
            building.receiveShadow = true;
            this.scene.add(building);
        });
    }

    createVehicle(type) {
        let vehicle;
        switch (type) {
            case 'car':
                vehicle = new Car(this.scene, this.roadPaths, this.config);
                break;
            case 'emergency':
                const emergencyTypes = ['ambulance', 'firetruck', 'police'];
                const emergencyType = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];
                vehicle = new EmergencyVehicle(this.scene, this.roadPaths, this.config, emergencyType);
                break;
            // Add other vehicle types here as we port them
            default:
                vehicle = new Car(this.scene, this.roadPaths, this.config);
        }
        return vehicle;
    }

    updateVehicles() {
        const targetCounts = {
            car: this.config.get('carDensity'),
            emergency: this.config.get('emergencyDensity')
        };

        const currentCounts = { car: 0, emergency: 0 };

        this.vehicles.forEach(v => {
            if (currentCounts[v.type] !== undefined) {
                currentCounts[v.type]++;
            }
        });

        Object.keys(targetCounts).forEach(type => {
            const current = currentCounts[type] || 0;
            const target = targetCounts[type] || 0;

            if (current > target) {
                const toRemove = current - target;
                for (let i = 0; i < toRemove; i++) {
                    const index = this.vehicles.findIndex(v => v.type === type);
                    if (index !== -1) {
                        this.vehicles[index].remove();
                        this.vehicles.splice(index, 1);
                    }
                }
            } else if (current < target) {
                const toAdd = target - current;
                for (let i = 0; i < toAdd; i++) {
                    const vehicle = this.createVehicle(type);
                    if (vehicle) {
                        this.vehicles.push(vehicle);
                    }
                }
            }
        });

        this.updateVehicleCount();
    }

    updateVehicleCount() {
        document.getElementById('vehicle-count').textContent = this.vehicles.length;
    }

    setupControls() {
        // Vehicle density controls
        ['car', 'emergency'].forEach(type => {
            const slider = document.getElementById(`${type}-density`);
            if (slider) {
                slider.addEventListener('input', (e) => {
                    const value = parseInt(e.target.value);
                    document.getElementById(`${type}-density-value`).textContent = value;
                    this.config.set(`${type}Density`, value);
                    this.updateVehicles();
                });
            }
        });

        // Simulation speed
        const simSpeed = document.getElementById('sim-speed');
        if (simSpeed) {
            simSpeed.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                document.getElementById('sim-speed-value').textContent = value.toFixed(1) + 'x';
            });
        }

        // Time of day slider
        const timeSlider = document.getElementById('time-of-day');
        if (timeSlider) {
            timeSlider.addEventListener('input', (e) => {
                const hours = parseFloat(e.target.value);
                this.timeManager.setTime(hours);
                document.getElementById('time-value').textContent = this.timeManager.getTimeString();
            });
        }

        // Weather selector
        const weatherSelect = document.getElementById('weather-select');
        if (weatherSelect) {
            weatherSelect.addEventListener('change', (e) => {
                this.weatherSystem.setWeather(e.target.value);
            });
        }

        // Reset camera button
        const resetBtn = document.getElementById('reset-camera');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.camera.position.set(50, 60, 50);
                this.controls.target.set(0, 0, 0);
                this.controls.update();
            });
        }

        // Pause button
        const pauseBtn = document.getElementById('toggle-pause');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', (e) => {
                this.isPaused = !this.isPaused;
                e.target.textContent = this.isPaused ? 'Resume' : 'Pause';
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const now = Date.now();
        const deltaTime = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;

        if (!this.isPaused) {
            const simSpeed = parseFloat(document.getElementById('sim-speed')?.value || 1.0);

            // Update all systems
            this.timeManager.update(deltaTime);
            this.trafficLightManager.update(deltaTime);
            this.weatherSystem.update(deltaTime);

            // Update vehicles
            this.vehicles.forEach(vehicle => {
                vehicle.update(simSpeed, deltaTime);
            });

            // Collision detection
            this.collisionSystem.update(this.vehicles);

            // Check traffic lights
            this.vehicles.forEach(vehicle => {
                this.collisionSystem.checkTrafficLightCollision(vehicle, this.trafficLightManager);
            });

            // Statistics
            this.statisticsTracker.update(this.vehicles);

            // Update time display
            const timeDisplay = document.getElementById('current-time');
            if (timeDisplay) {
                timeDisplay.textContent = this.timeManager.getTimeString();
            }
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize simulator when page loads
window.addEventListener('DOMContentLoaded', () => {
    new TrafficSimulator();
});
