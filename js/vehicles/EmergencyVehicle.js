// Emergency Vehicle Class (Ambulance, Fire Truck, Police)
import { Vehicle } from './Vehicle.js';

export class EmergencyVehicle extends Vehicle {
    constructor(scene, paths, config, emergencyType = 'ambulance') {
        super(scene, paths, config, 'emergency');
        this.emergencyType = emergencyType; // ambulance, firetruck, police
        this.baseSpeed = config.get('emergencySpeed');
        this.sirenActive = true;
        this.lightPhase = 0;
        this.lights = [];
        this.createMesh();
        this.selectPath();
    }

    getBaseSpeed() {
        return this.config.get('emergencySpeed');
    }

    createMesh() {
        const vehicleGroup = new THREE.Group();

        let bodyColor, lightColor1, lightColor2;

        switch (this.emergencyType) {
            case 'ambulance':
                bodyColor = 0xFFFFFF;
                lightColor1 = 0xFF0000;
                lightColor2 = 0xFF0000;
                break;
            case 'firetruck':
                bodyColor = 0xFF0000;
                lightColor1 = 0xFF0000;
                lightColor2 = 0xFFFFFF;
                break;
            case 'police':
                bodyColor = 0x0000FF;
                lightColor1 = 0x0000FF;
                lightColor2 = 0xFF0000;
                break;
            default:
                bodyColor = 0xFFFFFF;
                lightColor1 = 0xFF0000;
                lightColor2 = 0x0000FF;
        }

        // Vehicle body
        const bodyGeometry = new THREE.BoxGeometry(2.2, 1.2, 4.5);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: bodyColor });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.8;
        body.castShadow = true;
        vehicleGroup.add(body);

        // Cabin
        const cabinGeometry = new THREE.BoxGeometry(2.0, 1.0, 2.2);
        const cabin = new THREE.Mesh(cabinGeometry, bodyMaterial);
        cabin.position.y = 1.6;
        cabin.position.z = 0.5;
        cabin.castShadow = true;
        vehicleGroup.add(cabin);

        // Emergency stripe
        const stripeGeometry = new THREE.BoxGeometry(2.25, 0.3, 4.55);
        const stripeMaterial = new THREE.MeshLambertMaterial({
            color: this.emergencyType === 'ambulance' ? 0xFF0000 : 0xFFFFFF
        });
        const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
        stripe.position.y = 1.0;
        vehicleGroup.add(stripe);

        // Emergency lights on top
        const lightGeometry = new THREE.BoxGeometry(0.4, 0.3, 0.4);

        const light1Material = new THREE.MeshBasicMaterial({
            color: lightColor1,
            emissive: lightColor1,
            emissiveIntensity: 0.5
        });
        const light1 = new THREE.Mesh(lightGeometry, light1Material);
        light1.position.set(-0.5, 2.2, 0.5);
        vehicleGroup.add(light1);
        this.lights.push({ mesh: light1, baseColor: lightColor1 });

        const light2Material = new THREE.MeshBasicMaterial({
            color: lightColor2,
            emissive: lightColor2,
            emissiveIntensity: 0.5
        });
        const light2 = new THREE.Mesh(lightGeometry, light2Material);
        light2.position.set(0.5, 2.2, 0.5);
        vehicleGroup.add(light2);
        this.lights.push({ mesh: light2, baseColor: lightColor2 });

        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });

        const wheelPositions = [
            { x: -1.0, z: 1.5 },
            { x: 1.0, z: 1.5 },
            { x: -1.0, z: -1.5 },
            { x: 1.0, z: -1.5 }
        ];

        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(pos.x, 0.4, pos.z);
            vehicleGroup.add(wheel);
        });

        this.mesh = vehicleGroup;
        this.scene.add(this.mesh);
    }

    update(simulationSpeed, deltaTime = 0.016) {
        super.update(simulationSpeed, deltaTime);

        // Animate emergency lights
        if (this.sirenActive) {
            this.lightPhase += deltaTime * 10;
            this.lights.forEach((light, index) => {
                const intensity = Math.abs(Math.sin(this.lightPhase + index * Math.PI));
                light.mesh.material.emissiveIntensity = intensity;

                if (intensity > 0.7) {
                    light.mesh.material.color.setHex(light.baseColor);
                } else {
                    light.mesh.material.color.setHex(0x330000);
                }
            });
        }
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

    setSiren(active) {
        this.sirenActive = active;
    }
}
