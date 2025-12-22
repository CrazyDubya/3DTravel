// Train Vehicle Class
import { Vehicle } from './Vehicle.js';

export class Train extends Vehicle {
    constructor(scene, paths, config) {
        super(scene, paths, config, 'train');
        this.baseSpeed = config.get('trainSpeed');
        this.createMesh();
        this.selectPath();
    }

    getBaseSpeed() {
        return this.config.get('trainSpeed');
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

    selectPath() {
        // Trains use rail paths (diagonal)
        if (this.paths && this.paths.length > 0) {
            this.currentPath = this.paths[Math.floor(Math.random() * this.paths.length)];
            this.progress = Math.random();
            this.direction = this.config.get('twoWayTraffic') && Math.random() > 0.5 ? -1 : 1;
        }
    }

    updatePosition() {
        if (this.currentPath && this.currentPath.type === 'diagonal') {
            const angle = this.currentPath.angle;
            const offset = this.currentPath.offset;
            const length = this.currentPath.length;

            const t = (this.progress - 0.5) * length;
            const x = offset + Math.cos(angle) * t * this.direction;
            const z = offset + Math.sin(angle) * t * this.direction;

            this.mesh.position.set(x, 0.4, z);
            this.mesh.rotation.y = angle * this.direction;
        }
    }
}
