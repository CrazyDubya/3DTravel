// Street Furniture System (Lamp Posts, Benches, Bus Stops, Signs)
export class StreetFurniture {
    constructor(scene, timeManager) {
        this.scene = scene;
        this.timeManager = timeManager;
        this.furniture = [];
        this.streetLights = [];
    }

    createAll(intersections, roadPaths, sidewalkPaths) {
        this.createLampPosts(roadPaths);
        this.createBenches(sidewalkPaths);
        this.createBusStops(roadPaths);
        this.createTrafficSigns(intersections);
    }

    createLampPosts(roadPaths) {
        // Place lamp posts along roads
        const positions = [];

        // Along horizontal roads
        for (let z = -60; z <= 60; z += 30) {
            for (let x = -55; x <= 55; x += 20) {
                positions.push({ x, y: 0, z: z + 6 });
                positions.push({ x, y: 0, z: z - 6 });
            }
        }

        // Along vertical roads
        for (let x = -60; x <= 60; x += 30) {
            for (let z = -55; z <= 55; z += 20) {
                positions.push({ x: x + 6, y: 0, z });
                positions.push({ x: x - 6, y: 0, z });
            }
        }

        positions.forEach(pos => {
            const lampPost = this.createLampPost();
            lampPost.position.set(pos.x, pos.y, pos.z);
            this.scene.add(lampPost);
            this.furniture.push(lampPost);

            // Track lights for night-time activation
            const light = lampPost.children.find(child => child.isLight);
            if (light) {
                this.streetLights.push(light);
            }
        });
    }

    createLampPost() {
        const group = new THREE.Group();

        // Pole
        const poleGeometry = new THREE.CylinderGeometry(0.08, 0.1, 4, 8);
        const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x444444 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 2;
        pole.castShadow = true;
        group.add(pole);

        // Lamp head
        const headGeometry = new THREE.CylinderGeometry(0.3, 0.2, 0.4, 8);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 4.2;
        group.add(head);

        // Light bulb (emissive)
        const bulbGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const bulbMaterial = new THREE.MeshBasicMaterial({
            color: 0xFFFF99,
            emissive: 0xFFFF99,
            emissiveIntensity: 0
        });
        const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
        bulb.position.y = 4;
        group.add(bulb);

        // Point light for illumination
        const pointLight = new THREE.PointLight(0xFFFF99, 0, 15);
        pointLight.position.y = 4;
        pointLight.castShadow = false; // Disable for performance
        pointLight.isLight = true; // Mark for identification
        group.add(pointLight);

        return group;
    }

    createBenches(sidewalkPaths) {
        // Place benches along sidewalks
        const positions = [];

        // Sample positions along sidewalks
        for (let i = -50; i <= 50; i += 25) {
            positions.push({ x: i, y: 0, z: -65 });
            positions.push({ x: i, y: 0, z: 65 });
            positions.push({ x: -65, y: 0, z: i });
            positions.push({ x: 65, y: 0, z: i });
        }

        positions.forEach(pos => {
            const bench = this.createBench();
            bench.position.set(pos.x, pos.y, pos.z);
            // Rotate based on position
            if (Math.abs(pos.x) > Math.abs(pos.z)) {
                bench.rotation.y = Math.PI / 2;
            }
            this.scene.add(bench);
            this.furniture.push(bench);
        });
    }

    createBench() {
        const group = new THREE.Group();
        const woodMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const metalMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });

        // Seat
        const seat = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.1, 0.5),
            woodMaterial
        );
        seat.position.y = 0.5;
        group.add(seat);

        // Backrest
        const backrest = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.6, 0.1),
            woodMaterial
        );
        backrest.position.set(0, 0.8, -0.2);
        group.add(backrest);

        // Legs
        const legPositions = [
            { x: -0.6, z: 0.15 },
            { x: 0.6, z: 0.15 },
            { x: -0.6, z: -0.15 },
            { x: 0.6, z: -0.15 }
        ];

        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 0.5, 8),
                metalMaterial
            );
            leg.position.set(pos.x, 0.25, pos.z);
            group.add(leg);
        });

        return group;
    }

    createBusStops(roadPaths) {
        // Place bus stops at select locations
        const positions = [
            { x: -30, y: 0, z: -66, rotation: 0 },
            { x: 30, y: 0, z: 66, rotation: Math.PI },
            { x: -66, y: 0, z: -30, rotation: Math.PI / 2 },
            { x: 66, y: 0, z: 30, rotation: -Math.PI / 2 }
        ];

        positions.forEach(pos => {
            const busStop = this.createBusStop();
            busStop.position.set(pos.x, pos.y, pos.z);
            busStop.rotation.y = pos.rotation;
            this.scene.add(busStop);
            this.furniture.push(busStop);
        });
    }

    createBusStop() {
        const group = new THREE.Group();

        // Pole
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 3, 8),
            new THREE.MeshLambertMaterial({ color: 0x666666 })
        );
        pole.position.y = 1.5;
        group.add(pole);

        // Sign
        const sign = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.6, 0.05),
            new THREE.MeshLambertMaterial({ color: 0x0066CC })
        );
        sign.position.set(0, 3, 0);
        group.add(sign);

        // Bus icon (simplified white square)
        const icon = new THREE.Mesh(
            new THREE.BoxGeometry(0.4, 0.3, 0.06),
            new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
        );
        icon.position.set(0, 3, 0.06);
        group.add(icon);

        // Shelter roof
        const roof = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.1, 1.5),
            new THREE.MeshLambertMaterial({ color: 0x888888 })
        );
        roof.position.set(0, 2.5, -0.5);
        group.add(roof);

        // Shelter supports
        const supportPositions = [
            { x: -0.9, z: -1.2 },
            { x: 0.9, z: -1.2 }
        ];

        supportPositions.forEach(pos => {
            const support = new THREE.Mesh(
                new THREE.CylinderGeometry(0.05, 0.05, 2.5, 8),
                new THREE.MeshLambertMaterial({ color: 0x888888 })
            );
            support.position.set(pos.x, 1.25, pos.z);
            group.add(support);
        });

        return group;
    }

    createTrafficSigns(intersections) {
        // Place stop signs and speed limit signs near intersections
        intersections.forEach(intersection => {
            // Stop sign on one corner
            const stopSign = this.createStopSign();
            stopSign.position.set(intersection.x + 8, 0, intersection.z + 8);
            this.scene.add(stopSign);
            this.furniture.push(stopSign);

            // Speed limit sign on opposite corner
            const speedSign = this.createSpeedLimitSign(60);
            speedSign.position.set(intersection.x - 8, 0, intersection.z - 8);
            this.scene.add(speedSign);
            this.furniture.push(speedSign);
        });
    }

    createStopSign() {
        const group = new THREE.Group();

        // Pole
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 2, 8),
            new THREE.MeshLambertMaterial({ color: 0x666666 })
        );
        pole.position.y = 1;
        group.add(pole);

        // Octagonal sign
        const signShape = new THREE.Shape();
        const radius = 0.3;
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            if (i === 0) {
                signShape.moveTo(x, y);
            } else {
                signShape.lineTo(x, y);
            }
        }
        signShape.lineTo(Math.cos(0) * radius, Math.sin(0) * radius);

        const signGeometry = new THREE.ShapeGeometry(signShape);
        const sign = new THREE.Mesh(
            signGeometry,
            new THREE.MeshBasicMaterial({ color: 0xFF0000 })
        );
        sign.position.set(0, 2, 0);
        sign.rotation.y = Math.PI / 4;
        group.add(sign);

        return group;
    }

    createSpeedLimitSign(speed) {
        const group = new THREE.Group();

        // Pole
        const pole = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.05, 2, 8),
            new THREE.MeshLambertMaterial({ color: 0x666666 })
        );
        pole.position.y = 1;
        group.add(pole);

        // Circular sign
        const sign = new THREE.Mesh(
            new THREE.CircleGeometry(0.25, 16),
            new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
        );
        sign.position.set(0, 2, 0);
        group.add(sign);

        // Red border
        const border = new THREE.Mesh(
            new THREE.RingGeometry(0.25, 0.28, 16),
            new THREE.MeshBasicMaterial({ color: 0xFF0000 })
        );
        border.position.set(0, 2, 0.01);
        group.add(border);

        return group;
    }

    update() {
        // Update street lights based on time of day
        if (this.timeManager) {
            const isNight = this.timeManager.isNighttime();
            const intensity = isNight ? 0.5 : 0;

            this.streetLights.forEach(light => {
                light.intensity = intensity;
                // Update bulb emissive intensity
                const bulb = light.parent.children.find(child =>
                    child.material && child.material.emissive
                );
                if (bulb) {
                    bulb.material.emissiveIntensity = isNight ? 0.8 : 0;
                }
            });
        }
    }

    removeAll() {
        this.furniture.forEach(item => {
            this.scene.remove(item);
        });
        this.furniture = [];
        this.streetLights = [];
    }
}
