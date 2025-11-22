// Traffic Light System
export class TrafficLight {
    constructor(scene, position, direction, config) {
        this.scene = scene;
        this.position = position;
        this.direction = direction; // 'NS' (north-south) or 'EW' (east-west)
        this.config = config;

        this.state = 'red'; // red, yellow, green
        this.timer = 0;
        this.mesh = null;
        this.lights = {
            red: null,
            yellow: null,
            green: null
        };

        this.greenDuration = config.get('greenDuration');
        this.yellowDuration = config.get('yellowDuration');
        this.redDuration = config.get('redDuration');

        this.createMesh();
    }

    createMesh() {
        const group = new THREE.Group();

        // Traffic light pole
        const poleGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
        const poleMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 2;
        pole.castShadow = true;
        group.add(pole);

        // Light box
        const boxGeometry = new THREE.BoxGeometry(0.4, 1.2, 0.3);
        const boxMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        const box = new THREE.Mesh(boxGeometry, boxMaterial);
        box.position.y = 4.3;
        box.castShadow = true;
        group.add(box);

        // Light lenses
        const lensGeometry = new THREE.CircleGeometry(0.15, 16);

        // Red light
        const redMaterial = new THREE.MeshBasicMaterial({
            color: 0x330000,
            side: THREE.DoubleSide
        });
        this.lights.red = new THREE.Mesh(lensGeometry, redMaterial);
        this.lights.red.position.set(0, 4.7, 0.16);
        this.lights.red.rotation.y = this.direction === 'NS' ? 0 : Math.PI / 2;
        group.add(this.lights.red);

        // Yellow light
        const yellowMaterial = new THREE.MeshBasicMaterial({
            color: 0x333300,
            side: THREE.DoubleSide
        });
        this.lights.yellow = new THREE.Mesh(lensGeometry, yellowMaterial);
        this.lights.yellow.position.set(0, 4.3, 0.16);
        this.lights.yellow.rotation.y = this.direction === 'NS' ? 0 : Math.PI / 2;
        group.add(this.lights.yellow);

        // Green light
        const greenMaterial = new THREE.MeshBasicMaterial({
            color: 0x003300,
            side: THREE.DoubleSide
        });
        this.lights.green = new THREE.Mesh(lensGeometry, greenMaterial);
        this.lights.green.position.set(0, 3.9, 0.16);
        this.lights.green.rotation.y = this.direction === 'NS' ? 0 : Math.PI / 2;
        group.add(this.lights.green);

        // Position the group
        group.position.copy(this.position);

        this.mesh = group;
        this.scene.add(this.mesh);

        // Set initial state
        this.updateLightAppearance();
    }

    update(deltaTime) {
        if (!this.config.get('trafficLightsEnabled')) {
            this.setState('green'); // All lights green when disabled
            return;
        }

        this.timer += deltaTime;

        switch (this.state) {
            case 'green':
                if (this.timer >= this.greenDuration) {
                    this.setState('yellow');
                    this.timer = 0;
                }
                break;
            case 'yellow':
                if (this.timer >= this.yellowDuration) {
                    this.setState('red');
                    this.timer = 0;
                }
                break;
            case 'red':
                if (this.timer >= this.redDuration) {
                    this.setState('green');
                    this.timer = 0;
                }
                break;
        }
    }

    setState(newState) {
        this.state = newState;
        this.updateLightAppearance();
    }

    updateLightAppearance() {
        // Dim all lights
        this.lights.red.material.color.setHex(0x330000);
        this.lights.yellow.material.color.setHex(0x333300);
        this.lights.green.material.color.setHex(0x003300);

        // Brighten active light
        switch (this.state) {
            case 'red':
                this.lights.red.material.color.setHex(0xFF0000);
                this.lights.red.material.emissive = new THREE.Color(0xFF0000);
                this.lights.red.material.emissiveIntensity = 0.5;
                break;
            case 'yellow':
                this.lights.yellow.material.color.setHex(0xFFFF00);
                this.lights.yellow.material.emissive = new THREE.Color(0xFFFF00);
                this.lights.yellow.material.emissiveIntensity = 0.5;
                break;
            case 'green':
                this.lights.green.material.color.setHex(0x00FF00);
                this.lights.green.material.emissive = new THREE.Color(0x00FF00);
                this.lights.green.material.emissiveIntensity = 0.5;
                break;
        }
    }

    getState() {
        return this.state;
    }

    canVehiclePass() {
        return this.state === 'green' || this.state === 'yellow';
    }

    shouldVehicleStop() {
        return this.state === 'red';
    }

    shouldVehiclePrepareToStop() {
        return this.state === 'yellow';
    }

    remove() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
    }
}

// Traffic Light Manager for coordinating all lights
export class TrafficLightManager {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.lights = [];
        this.intersections = [];
    }

    createLightsForIntersections(intersections) {
        this.intersections = intersections;

        intersections.forEach(intersection => {
            // Create lights for each direction
            const nsLight = new TrafficLight(
                this.scene,
                new THREE.Vector3(
                    intersection.x + 6,
                    0,
                    intersection.z
                ),
                'NS',
                this.config
            );

            const ewLight = new TrafficLight(
                this.scene,
                new THREE.Vector3(
                    intersection.x,
                    0,
                    intersection.z + 6
                ),
                'EW',
                this.config
            );

            // Offset timing so they don't both turn green
            ewLight.timer = this.config.get('greenDuration') + this.config.get('yellowDuration');
            ewLight.setState('red');

            this.lights.push({ intersection, nsLight, ewLight });
        });
    }

    update(deltaTime) {
        this.lights.forEach(({ nsLight, ewLight }) => {
            nsLight.update(deltaTime);
            ewLight.update(deltaTime);
        });
    }

    getLightAt(position, direction) {
        const tolerance = 15;

        for (const { intersection, nsLight, ewLight } of this.lights) {
            const dx = Math.abs(position.x - intersection.x);
            const dz = Math.abs(position.z - intersection.z);

            if (dx < tolerance && dz < tolerance) {
                // Determine which light applies based on direction
                if (direction === 'vertical' || direction === 'NS') {
                    return nsLight;
                } else if (direction === 'horizontal' || direction === 'EW') {
                    return ewLight;
                }
            }
        }

        return null;
    }

    removeAll() {
        this.lights.forEach(({ nsLight, ewLight }) => {
            nsLight.remove();
            ewLight.remove();
        });
        this.lights = [];
    }
}
