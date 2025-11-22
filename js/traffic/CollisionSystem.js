// Collision Detection and Avoidance System
import { SpatialGrid } from '../utils/SpatialPartitioning.js';

export class CollisionSystem {
    constructor(config) {
        this.config = config;
        this.spatialGrid = new SpatialGrid(200, 200, 10);

        // Safe distances by vehicle type (in units)
        this.safeDistances = {
            car: 5,
            bus: 7,
            bicycle: 3,
            pedestrian: 2,
            train: 15,
            subway: 10,
            emergency: 6
        };

        // Awareness radius (how far ahead vehicles look)
        this.awarenessRadius = {
            car: 10,
            bus: 12,
            bicycle: 6,
            pedestrian: 3,
            train: 25,
            subway: 15,
            emergency: 12
        };
    }

    update(vehicles) {
        if (!this.config.get('collisionDetection')) {
            // Clear all collision states
            vehicles.forEach(v => {
                v.isBlocked = false;
                v.blockingVehicle = null;
            });
            return;
        }

        // Rebuild spatial grid
        this.spatialGrid.clear();
        vehicles.forEach(vehicle => {
            if (vehicle.mesh && vehicle.mesh.visible) {
                this.spatialGrid.insert(vehicle);
            }
        });

        // Check each vehicle for collisions
        vehicles.forEach(vehicle => {
            if (!vehicle.mesh || !vehicle.mesh.visible) return;

            this.checkVehicleCollisions(vehicle);
        });
    }

    checkVehicleCollisions(vehicle) {
        vehicle.isBlocked = false;
        vehicle.blockingVehicle = null;

        const nearby = this.spatialGrid.getNearby(vehicle, 1);
        if (nearby.length === 0) return;

        const myPos = vehicle.mesh.position;
        const myType = vehicle.type;
        const safeDistance = this.safeDistances[myType] || 5;
        const awareness = this.awarenessRadius[myType] || 10;

        // Check vehicles ahead in our path
        nearby.forEach(other => {
            if (!other.mesh || other === vehicle) return;

            const otherPos = other.mesh.position;
            const distance = myPos.distanceTo(otherPos);

            // Only care about vehicles ahead of us
            if (!this.isAheadOfMe(vehicle, other)) return;

            // Check if too close
            if (distance < safeDistance) {
                vehicle.isBlocked = true;
                vehicle.blockingVehicle = other;
                vehicle.targetSpeed = 0; // Full stop
            } else if (distance < awareness) {
                // Slow down proportionally
                const slowFactor = (distance - safeDistance) / (awareness - safeDistance);
                const normalSpeed = vehicle.getBaseSpeed();
                vehicle.targetSpeed = normalSpeed * slowFactor;
                vehicle.isSlowing = true;
            }
        });

        // If not blocked, return to normal speed
        if (!vehicle.isBlocked && !vehicle.isSlowing) {
            vehicle.targetSpeed = vehicle.getBaseSpeed();
        }
        vehicle.isSlowing = false;
    }

    isAheadOfMe(vehicle, other) {
        const myPos = vehicle.mesh.position;
        const otherPos = other.mesh.position;
        const myRot = vehicle.mesh.rotation.y;

        // Calculate direction vector based on rotation
        const forwardX = Math.sin(myRot);
        const forwardZ = Math.cos(myRot);

        // Vector from me to other
        const toOtherX = otherPos.x - myPos.x;
        const toOtherZ = otherPos.z - myPos.z;

        // Dot product tells us if ahead (positive) or behind (negative)
        const dot = forwardX * toOtherX + forwardZ * toOtherZ;

        return dot > 0;
    }

    checkTrafficLightCollision(vehicle, trafficLightManager) {
        if (!vehicle.currentPath) return false;

        const light = trafficLightManager.getLightAt(
            vehicle.mesh.position,
            vehicle.currentPath.type
        );

        if (light && light.shouldVehicleStop()) {
            // Calculate distance to intersection
            const intersection = this.findNearestIntersection(vehicle);
            if (intersection) {
                const distance = vehicle.mesh.position.distanceTo(
                    new THREE.Vector3(intersection.x, 0, intersection.z)
                );

                // Stop if close to intersection
                if (distance < 15) {
                    vehicle.isBlocked = true;
                    vehicle.targetSpeed = 0;
                    vehicle.stoppedAtLight = true;
                    return true;
                }
            }
        } else if (light && light.canVehiclePass()) {
            vehicle.stoppedAtLight = false;
        }

        return false;
    }

    findNearestIntersection(vehicle) {
        const pos = vehicle.mesh.position;
        const intersectionPositions = [
            { x: -60, z: -60 }, { x: -60, z: -30 }, { x: -60, z: 0 }, { x: -60, z: 30 }, { x: -60, z: 60 },
            { x: -30, z: -60 }, { x: -30, z: -30 }, { x: -30, z: 0 }, { x: -30, z: 30 }, { x: -30, z: 60 },
            { x: 0, z: -60 }, { x: 0, z: -30 }, { x: 0, z: 0 }, { x: 0, z: 30 }, { x: 0, z: 60 },
            { x: 30, z: -60 }, { x: 30, z: -30 }, { x: 30, z: 0 }, { x: 30, z: 30 }, { x: 30, z: 60 },
            { x: 60, z: -60 }, { x: 60, z: -30 }, { x: 60, z: 0 }, { x: 60, z: 30 }, { x: 60, z: 60 }
        ];

        let nearest = null;
        let minDist = Infinity;

        intersectionPositions.forEach(intersection => {
            const dist = Math.sqrt(
                Math.pow(pos.x - intersection.x, 2) +
                Math.pow(pos.z - intersection.z, 2)
            );
            if (dist < minDist) {
                minDist = dist;
                nearest = intersection;
            }
        });

        return nearest;
    }

    getStats() {
        return this.spatialGrid.getStats();
    }
}
