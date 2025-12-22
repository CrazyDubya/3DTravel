// Bus Vehicle Class
import { Vehicle } from './Vehicle.js';

export class Bus extends Vehicle {
    constructor(scene, paths, config) {
        super(scene, paths, config, 'bus');
        this.baseSpeed = config.get('busSpeed');
        this.wheels = [];
        this.createMesh();
        this.selectPath();
    }

    getBaseSpeed() {
        return this.config.get('busSpeed');
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
            this.wheels.push(wheel);
        });

        this.mesh = busGroup;
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
