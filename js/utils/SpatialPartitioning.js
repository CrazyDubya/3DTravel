// Spatial Partitioning Grid for efficient collision detection
export class SpatialGrid {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.cols = Math.ceil(width / cellSize);
        this.rows = Math.ceil(height / cellSize);
        this.grid = new Map();
    }

    clear() {
        this.grid.clear();
    }

    getCellKey(x, z) {
        const col = Math.floor((x + this.width / 2) / this.cellSize);
        const row = Math.floor((z + this.height / 2) / this.cellSize);
        return `${col},${row}`;
    }

    insert(entity) {
        if (!entity.mesh || !entity.mesh.position) return;

        const key = this.getCellKey(
            entity.mesh.position.x,
            entity.mesh.position.z
        );

        if (!this.grid.has(key)) {
            this.grid.set(key, []);
        }

        this.grid.get(key).push(entity);
    }

    getNearby(entity, radius = 1) {
        if (!entity.mesh || !entity.mesh.position) return [];

        const x = entity.mesh.position.x;
        const z = entity.mesh.position.z;
        const nearby = [];

        // Check current cell and surrounding cells
        for (let dx = -radius; dx <= radius; dx++) {
            for (let dz = -radius; dz <= radius; dz++) {
                const offsetX = x + (dx * this.cellSize);
                const offsetZ = z + (dz * this.cellSize);
                const key = this.getCellKey(offsetX, offsetZ);

                if (this.grid.has(key)) {
                    nearby.push(...this.grid.get(key));
                }
            }
        }

        return nearby.filter(e => e !== entity);
    }

    getAll() {
        const all = [];
        for (const cell of this.grid.values()) {
            all.push(...cell);
        }
        return all;
    }

    getStats() {
        return {
            totalCells: this.cols * this.rows,
            occupiedCells: this.grid.size,
            totalEntities: this.getAll().length,
            avgEntitiesPerCell: this.grid.size > 0
                ? this.getAll().length / this.grid.size
                : 0
        };
    }
}
