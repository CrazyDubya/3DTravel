// Base Vehicle Class with collision awareness
export class Vehicle {
    constructor(scene, paths, config, type) {
        this.scene = scene;
        this.paths = paths;
        this.config = config;
        this.type = type;
        this.mesh = null;
        this.baseSpeed = 0;
        this.currentSpeed = 0;
        this.targetSpeed = 0;
        this.progress = 0;
        this.currentPath = null;
        this.direction = 1;

        // Collision detection properties
        this.isBlocked = false;
        this.isSlowing = false;
        this.blockingVehicle = null;
        this.stoppedAtLight = false;

        // Statistics
        this.totalDistance = 0;
        this.stopCount = 0;
        this.totalStopTime = 0;
        this.lastStopTime = 0;

        // Lane assignment
        this.lane = 0; // 0 = right lane, 1 = left lane (for two-lane roads)

        // Performance optimization: LOD system
        this.updateFrequency = 1; // Update every N frames
        this.frameCounter = 0;
        this.lodLevel = 'high'; // high, medium, low, hidden
    }

    selectPath() {
        if (this.paths && this.paths.length > 0) {
            this.currentPath = this.paths[Math.floor(Math.random() * this.paths.length)];
            this.progress = Math.random();
            this.direction = this.config.get('twoWayTraffic') && Math.random() > 0.5 ? -1 : 1;

            // Assign lane randomly
            this.lane = Math.random() > 0.5 ? 1 : 0;
        }
    }

    getBaseSpeed() {
        // Override in subclasses
        return this.baseSpeed;
    }

    updateLOD(camera) {
        if (!this.mesh || !camera) return;

        // Optimization: Calculate LOD based on distance to camera
        const distanceSq = camera.position.distanceToSquared(this.mesh.position);

        if (distanceSq < 2500) { // < 50 units
            this.lodLevel = 'high';
            this.updateFrequency = 1;
        } else if (distanceSq < 10000) { // < 100 units
            this.lodLevel = 'medium';
            this.updateFrequency = 2;
        } else if (distanceSq < 40000) { // < 200 units
            this.lodLevel = 'low';
            this.updateFrequency = 4;
        } else {
            this.lodLevel = 'hidden';
            this.updateFrequency = 8; // Very infrequent updates
        }
    }

    update(simulationSpeed, deltaTime = 0.016, camera = null) {
        if (!this.mesh || !this.currentPath) return;

        // Performance optimization: LOD-based update throttling
        this.frameCounter++;
        if (this.frameCounter % this.updateFrequency !== 0) return;

        // Update target speed if not blocked
        if (!this.isBlocked && !this.isSlowing) {
            this.targetSpeed = this.getBaseSpeed();
        }

        // Smoothly interpolate current speed to target speed
        const acceleration = this.isBlocked ? 0.95 : 0.05;
        this.currentSpeed += (this.targetSpeed - this.currentSpeed) * acceleration;

        // Track stops
        if (this.currentSpeed < 0.1 && this.targetSpeed === 0) {
            if (this.lastStopTime === 0) {
                this.lastStopTime = Date.now();
                this.stopCount++;
            }
        } else if (this.lastStopTime > 0) {
            this.totalStopTime += Date.now() - this.lastStopTime;
            this.lastStopTime = 0;
        }

        const speedFactor = (this.currentSpeed / 100) * 0.01 * simulationSpeed * this.updateFrequency;
        this.progress += speedFactor * this.direction;

        // Track distance
        this.totalDistance += Math.abs(speedFactor * 100);

        if (this.progress > 1 || this.progress < 0) {
            this.progress = this.progress > 1 ? 0 : 1;
            this.selectPath();
        }

        this.updatePosition();

        // Optimization: Only update wheel rotation for nearby vehicles
        if (this.lodLevel === 'high' || this.lodLevel === 'medium') {
            this.updateWheelRotation(speedFactor);
        }
    }

    updatePosition() {
        // Override in subclasses
    }

    updateWheelRotation(speedFactor) {
        // Override in subclasses if vehicle has wheels
    }

    remove() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
        }
    }

    getStats() {
        return {
            type: this.type,
            speed: this.currentSpeed,
            distance: this.totalDistance,
            stops: this.stopCount,
            stopTime: this.totalStopTime,
            isBlocked: this.isBlocked
        };
    }

    // Helper to get lane offset
    getLaneOffset() {
        const laneWidth = 2;
        return (this.lane - 0.5) * laneWidth;
    }
}
