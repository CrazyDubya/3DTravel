// Car Vehicle Class
import { Vehicle } from './Vehicle.js';

export class Car extends Vehicle {
    constructor(scene, paths, config) {
        super(scene, paths, config, 'car');
        this.baseSpeed = config.get('carSpeed');
        this.wheels = [];
        this.createMesh();
        this.selectPath();
    }

    getBaseSpeed() {
        return this.config.get('carSpeed');
    }

    createMesh() {
        const colors = [0xFF0000, 0x0000FF, 0x00FF00, 0xFFFF00, 0xFF00FF, 0x00FFFF, 0xFFFFFF, 0x000000];
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
            this.wheels.push(wheel);
        });

        this.mesh = carGroup;
        this.scene.add(this.mesh);
    }

    updatePosition() {
        if (this.currentPath.type === 'horizontal') {
            const range = this.currentPath.xEnd - this.currentPath.xStart;
            this.mesh.position.x = this.currentPath.xStart + range * this.progress;
            this.mesh.position.z = this.currentPath.z + this.getLaneOffset();
            this.mesh.position.y = 0.2;
            this.mesh.rotation.y = this.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else if (this.currentPath.type === 'vertical') {
            const range = this.currentPath.zEnd - this.currentPath.zStart;
            this.mesh.position.z = this.currentPath.zStart + range * this.progress;
            this.mesh.position.x = this.currentPath.x + this.getLaneOffset();
            this.mesh.position.y = 0.2;
            this.mesh.rotation.y = this.direction > 0 ? 0 : Math.PI;
        }
    }

    updateWheelRotation(speedFactor) {
        if (this.wheels.length > 0) {
            const rotation = speedFactor * 5;
            this.wheels.forEach(wheel => {
                wheel.rotation.x += rotation * this.direction;
            });
        }
    }
}
