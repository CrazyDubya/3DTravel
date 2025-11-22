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

        // Performance optimization: Cache intersection positions
        this.cachedIntersections = this.generateIntersectionPositions();
    }

    generateIntersectionPositions() {
        const positions = [];
        for (let x = -60; x <= 60; x += 30) {
            for (let z = -60; z <= 60; z += 30) {
                positions.push({ x, z });
            }
        }
        return positions;
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

        // Optimization: Early exit if no collision detection
        const nearby = this.spatialGrid.getNearby(vehicle, 1);
        if (nearby.length === 0) return;

        const myPos = vehicle.mesh.position;
        const myType = vehicle.type;
        const safeDistance = this.safeDistances[myType] || 5;
        const awareness = this.awarenessRadius[myType] || 10;

        // Performance optimization: Use squared distances to avoid sqrt
        const safeDistanceSq = safeDistance * safeDistance;
        const awarenessSq = awareness * awareness;

        // Check vehicles ahead in our path
        for (let i = 0; i < nearby.length; i++) {
            const other = nearby[i];

            // Optimization: Early exit for invalid vehicles
            if (!other.mesh || other === vehicle) continue;

            // Optimization: Quick check if ahead before calculating distance
            if (!this.isAheadOfMe(vehicle, other)) continue;

            const otherPos = other.mesh.position;

            // Optimization: Use distanceToSquared instead of distanceTo
            const distanceSq = myPos.distanceToSquared(otherPos);

            // Check if too close
            if (distanceSq < safeDistanceSq) {
                vehicle.isBlocked = true;
                vehicle.blockingVehicle = other;
                vehicle.targetSpeed = 0; // Full stop
                break; // Early exit - already blocked
            } else if (distanceSq < awarenessSq) {
                // Slow down proportionally - now need actual distance
                const distance = Math.sqrt(distanceSq);
                const slowFactor = (distance - safeDistance) / (awareness - safeDistance);
                const normalSpeed = vehicle.getBaseSpeed();
                vehicle.targetSpeed = normalSpeed * slowFactor;
                vehicle.isSlowing = true;
            }
        }

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

        // Optimization: Use cached intersection positions
        let nearest = null;
        let minDistSq = Infinity;

        // Optimization: Use squared distances to avoid sqrt
        for (let i = 0; i < this.cachedIntersections.length; i++) {
            const intersection = this.cachedIntersections[i];
            const dx = pos.x - intersection.x;
            const dz = pos.z - intersection.z;
            const distSq = dx * dx + dz * dz;

            if (distSq < minDistSq) {
                minDistSq = distSq;
                nearest = intersection;
            }
        }

        return nearest;
    }

    getStats() {
        return this.spatialGrid.getStats();
    }
}
