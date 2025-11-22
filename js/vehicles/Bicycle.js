// Bicycle Vehicle Class
import { Vehicle } from './Vehicle.js';

export class Bicycle extends Vehicle {
    constructor(scene, paths, config) {
        super(scene, paths, config, 'bicycle');
        this.baseSpeed = 25; // Fixed speed for bicycles
        this.createMesh();
        this.selectPath();
    }

    getBaseSpeed() {
        return 25;
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
            this.mesh.position.z = this.currentPath.z - 3; // Offset for bike lane
            this.mesh.position.y = 0.1;
            this.mesh.rotation.y = this.direction > 0 ? Math.PI / 2 : -Math.PI / 2;
        } else if (this.currentPath.type === 'vertical') {
            const range = this.currentPath.zEnd - this.currentPath.zStart;
            this.mesh.position.z = this.currentPath.zStart + range * this.progress;
            this.mesh.position.x = this.currentPath.x - 3; // Offset for bike lane
            this.mesh.position.y = 0.1;
            this.mesh.rotation.y = this.direction > 0 ? 0 : Math.PI;
        }
    }
}
