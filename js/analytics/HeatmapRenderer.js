// Heatmap Visualization Renderer
export class HeatmapRenderer {
    constructor(scene, statisticsTracker, config) {
        this.scene = scene;
        this.statisticsTracker = statisticsTracker;
        this.config = config;
        this.heatmapMesh = null;
        this.enabled = false;
        this.heatmapType = 'density'; // 'density' or 'speed'
        this.opacity = 0.6;
        this.lastUpdate = 0;
        this.updateInterval = 1000; // Update every second
    }

    createHeatmapMesh() {
        const gridData = this.statisticsTracker.heatmapGrid;
        const { rows, cols, cellSize, width, height } = gridData;

        // Create a plane for each grid cell with data
        const heatmapGroup = new THREE.Group();

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = gridData.grid[i][j];
                let value = 0;

                if (this.heatmapType === 'density') {
                    value = cell.density;
                } else if (this.heatmapType === 'speed' && cell.count > 0) {
                    value = cell.speed / cell.count;
                }

                if (value > 0) {
                    // Calculate position
                    const x = (j * cellSize) - (width / 2) + (cellSize / 2);
                    const z = (i * cellSize) - (height / 2) + (cellSize / 2);

                    // Calculate color based on value
                    const color = this.getHeatColor(value);

                    // Create cell mesh
                    const geometry = new THREE.PlaneGeometry(cellSize, cellSize);
                    const material = new THREE.MeshBasicMaterial({
                        color: color,
                        transparent: true,
                        opacity: this.opacity,
                        side: THREE.DoubleSide
                    });

                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.rotation.x = -Math.PI / 2;
                    mesh.position.set(x, 0.25, z); // Slightly above ground
                    heatmapGroup.add(mesh);
                }
            }
        }

        return heatmapGroup;
    }

    getHeatColor(value) {
        // Color gradient: blue (cold/low) -> green -> yellow -> red (hot/high)
        let normalized;

        if (this.heatmapType === 'density') {
            // Normalize density (0-20 vehicles per cell)
            normalized = Math.min(value / 20, 1);
        } else {
            // Normalize speed (0-100 km/h)
            normalized = Math.min(value / 100, 1);
        }

        const color = new THREE.Color();

        if (normalized < 0.25) {
            // Blue to Cyan
            const t = normalized / 0.25;
            color.setRGB(0, t, 1);
        } else if (normalized < 0.5) {
            // Cyan to Green
            const t = (normalized - 0.25) / 0.25;
            color.setRGB(0, 1, 1 - t);
        } else if (normalized < 0.75) {
            // Green to Yellow
            const t = (normalized - 0.5) / 0.25;
            color.setRGB(t, 1, 0);
        } else {
            // Yellow to Red
            const t = (normalized - 0.75) / 0.25;
            color.setRGB(1, 1 - t, 0);
        }

        return color;
    }

    update() {
        if (!this.enabled) return;

        const now = Date.now();
        if (now - this.lastUpdate < this.updateInterval) return;

        this.lastUpdate = now;
        this.refresh();
    }

    refresh() {
        // Remove old heatmap
        if (this.heatmapMesh) {
            this.scene.remove(this.heatmapMesh);
            this.heatmapMesh.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            });
        }

        // Create new heatmap
        if (this.enabled) {
            this.heatmapMesh = this.createHeatmapMesh();
            this.scene.add(this.heatmapMesh);
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        this.config.set('showHeatmap', enabled);

        if (!enabled && this.heatmapMesh) {
            this.scene.remove(this.heatmapMesh);
            this.heatmapMesh = null;
        } else if (enabled) {
            this.refresh();
        }
    }

    setType(type) {
        if (type === 'density' || type === 'speed') {
            this.heatmapType = type;
            if (this.enabled) {
                this.refresh();
            }
        }
    }

    setOpacity(opacity) {
        this.opacity = Math.max(0, Math.min(1, opacity));
        if (this.heatmapMesh) {
            this.heatmapMesh.traverse(child => {
                if (child.material) {
                    child.material.opacity = this.opacity;
                }
            });
        }
    }

    toggle() {
        this.setEnabled(!this.enabled);
    }
}
