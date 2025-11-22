// 3D Traffic Simulator
class TrafficSimulator {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.vehicles = [];
        this.infrastructure = [];
        this.isPaused = false;
        this.simulationSpeed = 1.0;
        this.settings = {
            carDensity: 5,
            busDensity: 3,
            bicycleDensity: 4,
            pedestrianDensity: 10,
            trainDensity: 2,
            subwayDensity: 2,
            carSpeed: 60,
            busSpeed: 50,
            trainSpeed: 100,
            twoWayTraffic: true,
            showSubway: true,
            showPaths: true
        };
        this.init();
    }

    init() {
        this.setupScene();
        this.setupLights();
        this.createInfrastructure();
        this.setupControls();
        this.animate();
        this.updateVehicles();
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

    setupLights() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight.position.set(50, 100, 30);
        dirLight.castShadow = true;
        dirLight.shadow.camera.left = -100;
        dirLight.shadow.camera.right = 100;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.bottom = -100;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        this.scene.add(dirLight);

        // Hemisphere light
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x545454, 0.3);
        this.scene.add(hemiLight);
    }

    createInfrastructure() {
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x3a5f0b });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Create road network
        this.createRoads();
        this.createSidewalks();
        this.createRailTracks();
        this.createHighway();
        this.createSubwayTunnels();
        this.createBuildings();
    }

    createRoads() {
        const roadMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 });
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });

        // Main roads (grid pattern)
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
        }

        // Store road paths for vehicles
        this.roadPaths = [];
        for (let i = -60; i <= 60; i += 30) {
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
            sidewalkH1.receiveShadow = true;
            this.scene.add(sidewalkH1);

            const sidewalkH2 = new THREE.Mesh(
                new THREE.BoxGeometry(120, 0.2, 2),
                sidewalkMaterial
            );
            sidewalkH2.position.set(0, 0.1, i - 5);
            sidewalkH2.receiveShadow = true;
            this.scene.add(sidewalkH2);

            // Vertical sidewalks
            const sidewalkV1 = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.2, 120),
                sidewalkMaterial
            );
            sidewalkV1.position.set(i + 5, 0.1, 0);
            sidewalkV1.receiveShadow = true;
            this.scene.add(sidewalkV1);

            const sidewalkV2 = new THREE.Mesh(
                new THREE.BoxGeometry(2, 0.2, 120),
                sidewalkMaterial
            );
            sidewalkV2.position.set(i - 5, 0.1, 0);
            sidewalkV2.receiveShadow = true;
            this.scene.add(sidewalkV2);
        }

        // Store sidewalk paths for pedestrians
        this.sidewalkPaths = [];
        for (let i = -60; i <= 60; i += 30) {
            this.sidewalkPaths.push({ type: 'horizontal', z: i + 5, xStart: -60, xEnd: 60 });
            this.sidewalkPaths.push({ type: 'horizontal', z: i - 5, xStart: -60, xEnd: 60 });
            this.sidewalkPaths.push({ type: 'vertical', x: i + 5, zStart: -60, zEnd: 60 });
            this.sidewalkPaths.push({ type: 'vertical', x: i - 5, zStart: -60, zEnd: 60 });
        }
    }

    createRailTracks() {
        const railMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const trackMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });

        // Train tracks (diagonal)
        const trackAngle = Math.PI / 4;
        const trackLength = 140;

        for (let offset of [-20, 20]) {
            // Track base
            const trackBase = new THREE.Mesh(
                new THREE.BoxGeometry(trackLength, 0.3, 4),
                railMaterial
            );
            trackBase.rotation.y = trackAngle;
            trackBase.position.set(offset, 0.15, offset);
            this.scene.add(trackBase);

            // Rails
            for (let side of [-1.5, 1.5]) {
                const rail = new THREE.Mesh(
                    new THREE.BoxGeometry(trackLength, 0.4, 0.2),
                    trackMaterial
                );
                rail.rotation.y = trackAngle;
                const offsetX = Math.cos(trackAngle) * side;
                const offsetZ = Math.sin(trackAngle) * side;
                rail.position.set(offset + offsetX, 0.2, offset + offsetZ);
                this.scene.add(rail);
            }

            // Sleepers
            for (let i = -trackLength / 2; i < trackLength / 2; i += 3) {
                const sleeper = new THREE.Mesh(
                    new THREE.BoxGeometry(0.3, 0.25, 5),
                    railMaterial
                );
                sleeper.rotation.y = trackAngle;
                const sleeperX = Math.cos(trackAngle) * i;
                const sleeperZ = Math.sin(trackAngle) * i;
                sleeper.position.set(offset + sleeperX, 0.12, offset + sleeperZ);
                this.scene.add(sleeper);
            }
        }

        // Store rail paths
        this.railPaths = [
            { type: 'diagonal', offset: -20, angle: trackAngle, length: trackLength },
            { type: 'diagonal', offset: 20, angle: trackAngle, length: trackLength }
        ];
    }

    createHighway() {
        const highwayMaterial = new THREE.MeshLambertMaterial({ color: 0x303030 });
        const lineMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

        // Elevated highway
        const highway = new THREE.Mesh(
            new THREE.BoxGeometry(100, 0.5, 12),
            highwayMaterial
        );
        highway.position.set(0, 8, -80);
        highway.castShadow = true;
        highway.receiveShadow = true;
        this.scene.add(highway);

        // Highway supports
        for (let i = -40; i <= 40; i += 20) {
            const support = new THREE.Mesh(
                new THREE.CylinderGeometry(0.8, 1, 8, 8),
                new THREE.MeshLambertMaterial({ color: 0x808080 })
            );
            support.position.set(i, 4, -80);
            support.castShadow = true;
            this.scene.add(support);
        }

        // Highway lines
        for (let i = -45; i <= 45; i += 8) {
            const line = new THREE.Mesh(
                new THREE.BoxGeometry(3, 0.55, 0.3),
                lineMaterial
            );
            line.position.set(i, 8.05, -80);
            this.scene.add(line);
        }

        this.highwayPath = { type: 'highway', y: 8, z: -80, xStart: -50, xEnd: 50 };
    }

    createSubwayTunnels() {
        const tunnelMaterial = new THREE.MeshLambertMaterial({
            color: 0x404040,
            transparent: true,
            opacity: 0.3
        });

        // Subway tunnel (underground)
        const tunnel = new THREE.Mesh(
            new THREE.CylinderGeometry(3, 3, 120, 16, 1, true),
            tunnelMaterial
        );
        tunnel.rotation.z = Math.PI / 2;
        tunnel.position.set(0, -5, 80);
        this.scene.add(tunnel);

        // Subway tracks
        const trackMaterial = new THREE.MeshLambertMaterial({ color: 0x696969 });
        for (let side of [-1, 1]) {
            const track = new THREE.Mesh(
                new THREE.BoxGeometry(120, 0.2, 0.2),
                trackMaterial
            );
            track.position.set(0, -6, 80 + side);
            this.scene.add(track);
        }

        this.subwayPath = { type: 'subway', y: -5, z: 80, xStart: -60, xEnd: 60 };
    }

    createBuildings() {
        const buildingPositions = [
            { x: -45, z: -45, w: 15, h: 25, d: 15 },
            { x: -45, z: -15, w: 15, h: 18, d: 15 },
            { x: -45, z: 15, w: 15, h: 30, d: 15 },
            { x: -45, z: 45, w: 15, h: 22, d: 15 },
            { x: -15, z: -45, w: 15, h: 20, d: 15 },
            { x: -15, z: 45, w: 15, h: 28, d: 15 },
            { x: 15, z: -45, w: 15, h: 24, d: 15 },
            { x: 15, z: 45, w: 15, h: 19, d: 15 },
            { x: 45, z: -45, w: 15, h: 26, d: 15 },
            { x: 45, z: -15, w: 15, h: 21, d: 15 },
            { x: 45, z: 15, w: 15, h: 23, d: 15 },
            { x: 45, z: 45, w: 15, h: 27, d: 15 },
        ];

        buildingPositions.forEach(pos => {
            const buildingMaterial = new THREE.MeshLambertMaterial({
                color: new THREE.Color().setHSL(Math.random() * 0.1 + 0.55, 0.3, 0.6)
            });

            const building = new THREE.Mesh(
                new THREE.BoxGeometry(pos.w, pos.h, pos.d),
                buildingMaterial
            );
            building.position.set(pos.x, pos.h / 2, pos.z);
            building.castShadow = true;
            building.receiveShadow = true;
            this.scene.add(building);

            // Windows
            const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF99 });
            for (let y = 2; y < pos.h; y += 3) {
                for (let x = -pos.w / 2 + 2; x < pos.w / 2; x += 2) {
                    const window1 = new THREE.Mesh(
                        new THREE.BoxGeometry(1, 1.5, 0.1),
                        windowMaterial
                    );
                    window1.position.set(pos.x + x, y, pos.z + pos.d / 2 + 0.1);
                    this.scene.add(window1);

                    const window2 = new THREE.Mesh(
                        new THREE.BoxGeometry(1, 1.5, 0.1),
                        windowMaterial
                    );
                    window2.position.set(pos.x + x, y, pos.z - pos.d / 2 - 0.1);
                    this.scene.add(window2);
                }
            }
        });
    }

    createVehicle(type) {
        let vehicle;
        switch (type) {
            case 'car':
                vehicle = new Car(this.scene, this.roadPaths, this.settings);
                break;
            case 'bus':
                vehicle = new Bus(this.scene, this.roadPaths, this.settings);
                break;
            case 'bicycle':
                vehicle = new Bicycle(this.scene, this.roadPaths, this.settings);
                break;
            case 'pedestrian':
                vehicle = new Pedestrian(this.scene, this.sidewalkPaths, this.settings);
                break;
            case 'train':
                vehicle = new Train(this.scene, this.railPaths, this.settings);
                break;
            case 'subway':
                vehicle = new Subway(this.scene, this.subwayPath, this.settings);
                break;
        }
        return vehicle;
    }

    updateVehicles() {
        // Remove excess vehicles
        const targetCounts = {
            car: this.settings.carDensity,
            bus: this.settings.busDensity,
            bicycle: this.settings.bicycleDensity,
            pedestrian: this.settings.pedestrianDensity,
            train: this.settings.trainDensity,
            subway: this.settings.subwayDensity
        };

        // Count current vehicles by type
        const currentCounts = {
            car: 0, bus: 0, bicycle: 0, pedestrian: 0, train: 0, subway: 0
        };

        this.vehicles.forEach(v => {
            currentCounts[v.type]++;
        });

        // Remove or add vehicles as needed
        Object.keys(targetCounts).forEach(type => {
            const current = currentCounts[type];
            const target = targetCounts[type];

            if (current > target) {
                // Remove vehicles
                const toRemove = current - target;
                for (let i = 0; i < toRemove; i++) {
                    const index = this.vehicles.findIndex(v => v.type === type);
                    if (index !== -1) {
                        this.vehicles[index].remove();
                        this.vehicles.splice(index, 1);
                    }
                }
            } else if (current < target) {
                // Add vehicles
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
        // Density controls
        ['car', 'bus', 'bicycle', 'pedestrian', 'train', 'subway'].forEach(type => {
            const slider = document.getElementById(`${type}-density`);
            const valueSpan = document.getElementById(`${type}-density-value`);

            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                valueSpan.textContent = value;
                this.settings[`${type}Density`] = value;
                this.updateVehicles();
            });
        });

        // Speed controls
        document.getElementById('sim-speed').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            document.getElementById('sim-speed-value').textContent = value.toFixed(1) + 'x';
            this.simulationSpeed = value;
        });

        ['car', 'bus', 'train'].forEach(type => {
            const slider = document.getElementById(`${type}-speed`);
            const valueSpan = document.getElementById(`${type}-speed-value`);

            slider.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                valueSpan.textContent = value;
                this.settings[`${type}Speed`] = value;
            });
        });

        // Checkbox controls
        document.getElementById('two-way-traffic').addEventListener('change', (e) => {
            this.settings.twoWayTraffic = e.target.checked;
        });

        document.getElementById('show-subway').addEventListener('change', (e) => {
            this.settings.showSubway = e.target.checked;
            this.vehicles.forEach(v => {
                if (v.type === 'subway') {
                    v.mesh.visible = e.target.checked;
                }
            });
        });

        document.getElementById('show-paths').addEventListener('change', (e) => {
            this.settings.showPaths = e.target.checked;
        });

        // Button controls
        document.getElementById('reset-camera').addEventListener('click', () => {
            this.camera.position.set(50, 60, 50);
            this.controls.target.set(0, 0, 0);
            this.controls.update();
        });

        document.getElementById('toggle-pause').addEventListener('click', (e) => {
            this.isPaused = !this.isPaused;
            e.target.textContent = this.isPaused ? 'Resume' : 'Pause';
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (!this.isPaused) {
            // Update all vehicles
            this.vehicles.forEach(vehicle => {
                vehicle.update(this.simulationSpeed);
            });
        }

        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

// Vehicle Base Class
class Vehicle {
    constructor(scene, paths, settings, type) {
        this.scene = scene;
        this.paths = paths;
        this.settings = settings;
        this.type = type;
        this.mesh = null;
        this.speed = 0;
        this.progress = 0;
        this.currentPath = null;
        this.direction = 1;
    }

    selectPath() {
        if (this.paths && this.paths.length > 0) {
            this.currentPath = this.paths[Math.floor(Math.random() * this.paths.length)];
            this.progress = Math.random();
            this.direction = this.settings.twoWayTraffic && Math.random() > 0.5 ? -1 : 1;
        }
    }

    update(simulationSpeed) {
        if (!this.mesh || !this.currentPath) return;

        const speedFactor = (this.speed / 100) * 0.01 * simulationSpeed;
        this.progress += speedFactor * this.direction;

        if (this.progress > 1 || this.progress < 0) {
            this.progress = this.progress > 1 ? 0 : 1;
            this.selectPath();
        }

        this.updatePosition();
    }

    updatePosition() {
        // Override in subclasses
    }

    remove() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
    }
}

// Car Class
class Car extends Vehicle {
    constructor(scene, paths, settings) {
        super(scene, paths, settings, 'car');
        this.speed = settings.carSpeed;
        this.createMesh();
        this.selectPath();
    }

    createMesh() {
        const colors = [0xFF0000, 0x0000FF, 0x00FF00, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFFFFF];
        const color = colors[Math.floor(Math.random() * colors.length)];

        const carGroup = new THREE.Group();

        // Car body
        const bodyGeometry = new THREE.BoxGeometry(1.8, 0.8, 3.5);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.6;
        body.castShadow = true;
        carGroup.add(body);

        // Car cabin
        const cabinGeometry = new THREE.BoxGeometry(1.6, 0.7, 2);
        const cabinMaterial = new THREE.MeshLambertMaterial({ color: color });
        const cabin = new THREE.Mesh(cabinGeometry, cabinMaterial);
        cabin.position.y = 1.2;
        cabin.position.z = -0.3;
        cabin.castShadow = true;
        carGroup.add(cabin);

        // Windows
        const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x000033 });
        const windowGeometry = new THREE.BoxGeometry(1.65, 0.6, 1.8);
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.y = 1.2;
        window.position.z = -0.3;
        carGroup.add(window);

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });

        const wheelPositions = [
            { x: -0.8, z: 1.2 },
            { x: 0.8, z: 1.2 },
            { x: -0.8, z: -1.2 },
            { x: 0.8, z: -1.2 }
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, 0.3, pos.z);
            carGroup.add(wheel);
        });

        this.mesh = carGroup;
        this.scene.add(this.mesh);
    }

    updatePosition() {
        if (this.currentPath.type === 'horizontal') {
            const range = this.currentPath.xEnd - this.currentPath.xStart;
            this.mesh.position.x = this.currentPath.xStart + range * this.progress;
            this.mesh.position.z = this.currentPath.z;
            this.mesh.position.y = 0.2;
            this.mesh.rotation.y = this.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else if (this.currentPath.type === 'vertical') {
            const range = this.currentPath.zEnd - this.currentPath.zStart;
            this.mesh.position.z = this.currentPath.zStart + range * this.progress;
            this.mesh.position.x = this.currentPath.x;
            this.mesh.position.y = 0.2;
            this.mesh.rotation.y = this.direction > 0 ? 0 : Math.PI;
        }
        this.speed = this.settings.carSpeed;
    }
}

// Bus Class
class Bus extends Vehicle {
    constructor(scene, paths, settings) {
        super(scene, paths, settings, 'bus');
        this.speed = settings.busSpeed;
        this.createMesh();
        this.selectPath();
    }

    createMesh() {
        const busGroup = new THREE.Group();
        const color = 0xFFA500;

        // Bus body
        const bodyGeometry = new THREE.BoxGeometry(2.5, 1.5, 6);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: color });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1;
        body.castShadow = true;
        busGroup.add(body);

        // Bus top
        const topGeometry = new THREE.BoxGeometry(2.3, 1, 4.5);
        const top = new THREE.Mesh(topGeometry, bodyMaterial);
        top.position.y = 2;
        top.castShadow = true;
        busGroup.add(top);

        // Windows
        const windowMaterial = new THREE.MeshBasicMaterial({ color: 0x000033 });
        for (let i = -2; i <= 2; i += 1.2) {
            const window = new THREE.Mesh(
                new THREE.BoxGeometry(2.35, 0.8, 0.9),
                windowMaterial
            );
            window.position.set(0, 2, i);
            busGroup.add(window);
        }

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });

        const wheelPositions = [
            { x: -1.1, z: 2 },
            { x: 1.1, z: 2 },
            { x: -1.1, z: -2 },
            { x: 1.1, z: -2 }
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, 0.4, pos.z);
            busGroup.add(wheel);
        });

        this.mesh = busGroup;
        this.scene.add(this.mesh);
    }

    updatePosition() {
        if (this.currentPath.type === 'horizontal') {
            const range = this.currentPath.xEnd - this.currentPath.xStart;
            this.mesh.position.x = this.currentPath.xStart + range * this.progress;
            this.mesh.position.z = this.currentPath.z;
            this.mesh.position.y = 0.2;
            this.mesh.rotation.y = this.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else if (this.currentPath.type === 'vertical') {
            const range = this.currentPath.zEnd - this.currentPath.zStart;
            this.mesh.position.z = this.currentPath.zStart + range * this.progress;
            this.mesh.position.x = this.currentPath.x;
            this.mesh.position.y = 0.2;
            this.mesh.rotation.y = this.direction > 0 ? 0 : Math.PI;
        }
        this.speed = this.settings.busSpeed;
    }
}

// Bicycle Class
class Bicycle extends Vehicle {
    constructor(scene, paths, settings) {
        super(scene, paths, settings, 'bicycle');
        this.speed = 25;
        this.createMesh();
        this.selectPath();
    }

    createMesh() {
        const bikeGroup = new THREE.Group();

        // Frame
        const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x0088FF });
        const frame1 = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8),
            frameMaterial
        );
        frame1.position.y = 0.6;
        frame1.rotation.z = Math.PI / 4;
        bikeGroup.add(frame1);

        // Wheels
        const wheelGeometry = new THREE.TorusGeometry(0.3, 0.05, 8, 16);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });

        const frontWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        frontWheel.rotation.y = Math.PI / 2;
        frontWheel.position.set(0, 0.3, 0.6);
        bikeGroup.add(frontWheel);

        const backWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        backWheel.rotation.y = Math.PI / 2;
        backWheel.position.set(0, 0.3, -0.6);
        bikeGroup.add(backWheel);

        // Seat
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.1, 0.15),
            new THREE.MeshLambertMaterial({ color: 0x000000 })
        );
        seat.position.y = 0.9;
        bikeGroup.add(seat);

        this.mesh = bikeGroup;
        this.scene.add(this.mesh);
    }

    updatePosition() {
        if (this.currentPath.type === 'horizontal') {
            const range = this.currentPath.xEnd - this.currentPath.xStart;
            this.mesh.position.x = this.currentPath.xStart + range * this.progress;
            this.mesh.position.z = this.currentPath.z - 3;
            this.mesh.position.y = 0.1;
            this.mesh.rotation.y = this.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else if (this.currentPath.type === 'vertical') {
            const range = this.currentPath.zEnd - this.currentPath.zStart;
            this.mesh.position.z = this.currentPath.zStart + range * this.progress;
            this.mesh.position.x = this.currentPath.x - 3;
            this.mesh.position.y = 0.1;
            this.mesh.rotation.y = this.direction > 0 ? 0 : Math.PI;
        }
    }
}

// Pedestrian Class
class Pedestrian extends Vehicle {
    constructor(scene, paths, settings) {
        super(scene, paths, settings, 'pedestrian');
        this.speed = 5;
        this.createMesh();
        this.selectPath();
    }

    createMesh() {
        const personGroup = new THREE.Group();
        const colors = [0xFF6B6B, 0x4ECDC4, 0x45B7D1, 0xFFA07A, 0x98D8C8];
        const color = colors[Math.floor(Math.random() * colors.length)];

        // Head
        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 8, 8),
            new THREE.MeshLambertMaterial({ color: 0xFFDBAC })
        );
        head.position.y = 0.9;
        personGroup.add(head);

        // Body
        const body = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.15, 0.5, 8),
            new THREE.MeshLambertMaterial({ color: color })
        );
        body.position.y = 0.55;
        personGroup.add(body);

        // Legs
        const legGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x2C3E50 });

        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.08, 0.2, 0);
        personGroup.add(leftLeg);

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.08, 0.2, 0);
        personGroup.add(rightLeg);

        this.mesh = personGroup;
        this.scene.add(this.mesh);
    }

    updatePosition() {
        if (this.currentPath.type === 'horizontal') {
            const range = this.currentPath.xEnd - this.currentPath.xStart;
            this.mesh.position.x = this.currentPath.xStart + range * this.progress;
            this.mesh.position.z = this.currentPath.z;
            this.mesh.position.y = 0.2;
            this.mesh.rotation.y = this.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else if (this.currentPath.type === 'vertical') {
            const range = this.currentPath.zEnd - this.currentPath.zStart;
            this.mesh.position.z = this.currentPath.zStart + range * this.progress;
            this.mesh.position.x = this.currentPath.x;
            this.mesh.position.y = 0.2;
            this.mesh.rotation.y = this.direction > 0 ? 0 : Math.PI;
        }
    }
}

// Train Class
class Train extends Vehicle {
    constructor(scene, paths, settings) {
        super(scene, paths, settings, 'train');
        this.speed = settings.trainSpeed;
        this.createMesh();
        this.selectPath();
    }

    createMesh() {
        const trainGroup = new THREE.Group();

        // Locomotive
        const locoBody = new THREE.Mesh(
            new THREE.BoxGeometry(3, 2.5, 4),
            new THREE.MeshLambertMaterial({ color: 0xCC0000 })
        );
        locoBody.position.y = 1.5;
        locoBody.castShadow = true;
        trainGroup.add(locoBody);

        // Cabin
        const cabin = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 1.5, 2.5),
            new THREE.MeshLambertMaterial({ color: 0xCC0000 })
        );
        cabin.position.y = 3.3;
        cabin.position.z = -0.5;
        cabin.castShadow = true;
        trainGroup.add(cabin);

        // Windows
        const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF99 });
        for (let i = 0; i < 2; i++) {
            const window = new THREE.Mesh(
                new THREE.BoxGeometry(2.6, 1, 1),
                windowMaterial
            );
            window.position.set(0, 3.3, -0.5 + i * 1.5);
            trainGroup.add(window);
        }

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });

        const wheelPositions = [
            { x: -1.2, z: 1.5 },
            { x: 1.2, z: 1.5 },
            { x: -1.2, z: -1.5 },
            { x: 1.2, z: -1.5 }
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, 0.5, pos.z);
            trainGroup.add(wheel);
        });

        // Carriages
        for (let i = 1; i <= 2; i++) {
            const carriage = new THREE.Mesh(
                new THREE.BoxGeometry(3, 2.5, 4),
                new THREE.MeshLambertMaterial({ color: 0x0066CC })
            );
            carriage.position.set(0, 1.5, -4 * i - 2);
            carriage.castShadow = true;
            trainGroup.add(carriage);

            // Carriage windows
            for (let j = 0; j < 3; j++) {
                const window = new THREE.Mesh(
                    new THREE.BoxGeometry(3.1, 1.5, 0.9),
                    windowMaterial
                );
                window.position.set(0, 2, -4 * i - 2 + j * 1.2 - 1.2);
                trainGroup.add(window);
            }
        }

        this.mesh = trainGroup;
        this.scene.add(this.mesh);
    }

    updatePosition() {
        if (this.currentPath) {
            const angle = this.currentPath.angle;
            const offset = this.currentPath.offset;
            const length = this.currentPath.length;

            const t = (this.progress - 0.5) * length;
            const x = offset + Math.cos(angle) * t * this.direction;
            const z = offset + Math.sin(angle) * t * this.direction;

            this.mesh.position.set(x, 0.4, z);
            this.mesh.rotation.y = angle * this.direction;
            this.speed = this.settings.trainSpeed;
        }
    }
}

// Subway Class
class Subway extends Vehicle {
    constructor(scene, path, settings) {
        super(scene, [path], settings, 'subway');
        this.speed = 80;
        this.createMesh();
        this.selectPath();
        this.mesh.visible = settings.showSubway;
    }

    createMesh() {
        const subwayGroup = new THREE.Group();

        // Subway car
        const carBody = new THREE.Mesh(
            new THREE.BoxGeometry(2.8, 2.8, 8),
            new THREE.MeshLambertMaterial({ color: 0x666666 })
        );
        carBody.castShadow = true;
        subwayGroup.add(carBody);

        // Windows
        const windowMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFF99 });
        for (let i = -3; i <= 3; i += 1.5) {
            const window = new THREE.Mesh(
                new THREE.BoxGeometry(2.85, 1.2, 1),
                windowMaterial
            );
            window.position.z = i;
            subwayGroup.add(window);
        }

        // Stripe
        const stripe = new THREE.Mesh(
            new THREE.BoxGeometry(2.85, 0.3, 8.1),
            new THREE.MeshLambertMaterial({ color: 0xFF0000 })
        );
        stripe.position.y = 0.8;
        subwayGroup.add(stripe);

        this.mesh = subwayGroup;
        this.scene.add(this.mesh);
    }

    updatePosition() {
        if (this.currentPath) {
            const range = this.currentPath.xEnd - this.currentPath.xStart;
            this.mesh.position.x = this.currentPath.xStart + range * this.progress;
            this.mesh.position.y = this.currentPath.y;
            this.mesh.position.z = this.currentPath.z;
            this.mesh.rotation.y = this.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
        }
    }
}

// Initialize simulator when page loads
window.addEventListener('DOMContentLoaded', () => {
    new TrafficSimulator();
});
