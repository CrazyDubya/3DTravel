// Performance Monitoring and Optimization System
export class PerformanceMonitor {
    constructor() {
        this.enabled = false;
        this.metrics = {
            fps: 0,
            frameTime: 0,
            vehicleCount: 0,
            renderTime: 0,
            updateTime: 0,
            memoryUsage: 0
        };

        this.frameCount = 0;
        this.lastTime = performance.now();
        this.lastFpsUpdate = this.lastTime;

        // Performance history for averaging
        this.history = {
            fps: [],
            frameTime: []
        };
        this.historySize = 60; // 1 second at 60fps
    }

    startFrame() {
        this.frameStartTime = performance.now();
    }

    endFrame() {
        const now = performance.now();
        const frameTime = now - this.frameStartTime;

        this.metrics.frameTime = frameTime;
        this.frameCount++;

        // Update FPS every second
        if (now - this.lastFpsUpdate >= 1000) {
            this.metrics.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
            this.frameCount = 0;
            this.lastFpsUpdate = now;
        }

        // Track history
        this.history.frameTime.push(frameTime);
        if (this.history.frameTime.length > this.historySize) {
            this.history.frameTime.shift();
        }

        // Memory usage (if available)
        if (performance.memory) {
            this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576); // MB
        }
    }

    setVehicleCount(count) {
        this.metrics.vehicleCount = count;
    }

    getMetrics() {
        return { ...this.metrics };
    }

    getAverageFrameTime() {
        if (this.history.frameTime.length === 0) return 0;
        const sum = this.history.frameTime.reduce((a, b) => a + b, 0);
        return sum / this.history.frameTime.length;
    }

    shouldReduceQuality() {
        // Suggest quality reduction if FPS drops below 30
        return this.metrics.fps > 0 && this.metrics.fps < 30;
    }

    shouldIncreaseQuality() {
        // Suggest quality increase if FPS is consistently above 55
        return this.metrics.fps > 55 && this.getAverageFrameTime() < 16;
    }

    getPerformanceLevel() {
        const fps = this.metrics.fps;
        if (fps >= 55) return 'high';
        if (fps >= 40) return 'medium';
        if (fps >= 25) return 'low';
        return 'critical';
    }

    displayStats(container) {
        if (!this.enabled || !container) return;

        const stats = `
FPS: ${this.metrics.fps}
Frame Time: ${this.metrics.frameTime.toFixed(2)}ms
Vehicles: ${this.metrics.vehicleCount}
Memory: ${this.metrics.memoryUsage}MB
Performance: ${this.getPerformanceLevel().toUpperCase()}
        `.trim();

        container.textContent = stats;
    }
}

// Level of Detail (LOD) System
export class LODSystem {
    constructor(camera) {
        this.camera = camera;
        this.lodLevels = {
            high: 50,    // Distance threshold for high detail
            medium: 100, // Distance threshold for medium detail
            low: 200     // Distance threshold for low detail
        };
    }

    getLODLevel(object) {
        if (!object || !object.position || !this.camera) {
            return 'high';
        }

        const distance = this.camera.position.distanceTo(object.position);

        if (distance < this.lodLevels.high) return 'high';
        if (distance < this.lodLevels.medium) return 'medium';
        if (distance < this.lodLevels.low) return 'low';
        return 'hidden';
    }

    shouldUpdate(object) {
        const level = this.getLODLevel(object);
        return level !== 'hidden';
    }

    getUpdateFrequency(object) {
        const level = this.getLODLevel(object);
        switch (level) {
            case 'high': return 1;    // Update every frame
            case 'medium': return 2;  // Update every 2 frames
            case 'low': return 4;     // Update every 4 frames
            default: return 0;        // Don't update
        }
    }
}

// Object Pool for efficient object reuse
export class ObjectPool {
    constructor(createFn, resetFn, initialSize = 10) {
        this.createFn = createFn;
        this.resetFn = resetFn;
        this.available = [];
        this.inUse = new Set();

        // Pre-create initial objects
        for (let i = 0; i < initialSize; i++) {
            this.available.push(this.createFn());
        }
    }

    acquire() {
        let obj;
        if (this.available.length > 0) {
            obj = this.available.pop();
        } else {
            obj = this.createFn();
        }
        this.inUse.add(obj);
        return obj;
    }

    release(obj) {
        if (this.inUse.has(obj)) {
            this.inUse.delete(obj);
            this.resetFn(obj);
            this.available.push(obj);
        }
    }

    releaseAll() {
        this.inUse.forEach(obj => {
            this.resetFn(obj);
            this.available.push(obj);
        });
        this.inUse.clear();
    }

    getStats() {
        return {
            available: this.available.length,
            inUse: this.inUse.size,
            total: this.available.length + this.inUse.size
        };
    }
}

// Batch update system for efficient processing
export class BatchUpdateSystem {
    constructor() {
        this.batches = new Map();
        this.frameCounter = 0;
    }

    register(name, updateFn, frequency = 1) {
        this.batches.set(name, {
            updateFn,
            frequency,
            lastUpdate: 0
        });
    }

    update() {
        this.frameCounter++;

        for (const [name, batch] of this.batches) {
            if (this.frameCounter % batch.frequency === 0) {
                batch.updateFn();
                batch.lastUpdate = this.frameCounter;
            }
        }
    }

    unregister(name) {
        this.batches.delete(name);
    }

    clear() {
        this.batches.clear();
    }
}
