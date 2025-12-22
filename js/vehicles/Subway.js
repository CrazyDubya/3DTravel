// Subway Vehicle Class
import { Vehicle } from './Vehicle.js';

export class Subway extends Vehicle {
    constructor(scene, path, config) {
        super(scene, [path], config, 'subway');
        this.baseSpeed = 80;
        this.createMesh();
        this.selectPath();
        this.mesh.visible = config.get('showSubway');
    }

    getBaseSpeed() {
        return 80;
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
