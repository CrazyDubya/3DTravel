// Pedestrian Vehicle Class
import { Vehicle } from './Vehicle.js';

export class Pedestrian extends Vehicle {
    constructor(scene, paths, config) {
        super(scene, paths, config, 'pedestrian');
        this.baseSpeed = 5; // Walking speed
        this.createMesh();
        this.selectPath();
    }

    getBaseSpeed() {
        return 5;
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

    selectPath() {
        // Pedestrians use sidewalk paths
        if (this.paths && this.paths.length > 0) {
            this.currentPath = this.paths[Math.floor(Math.random() * this.paths.length)];
            this.progress = Math.random();
            this.direction = this.config.get('twoWayTraffic') && Math.random() > 0.5 ? -1 : 1;
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
}
