// Statistics Tracking System
export class StatisticsTracker {
    constructor(config) {
        this.config = config;
        this.enabled = config.get('trackStatistics');

        // Real-time stats
        this.vehicleCounts = {
            car: 0,
            bus: 0,
            bicycle: 0,
            pedestrian: 0,
            train: 0,
            subway: 0,
            emergency: 0,
            total: 0
        };

        // Speed tracking
        this.averageSpeeds = {
            car: 0,
            bus: 0,
            bicycle: 0,
            train: 0,
            emergency: 0
        };

        // Time-series data (rolling window)
        this.maxDataPoints = 300; // 5 minutes at 1 update/second
        this.timeSeriesData = {
            timestamps: [],
            vehicleCounts: [],
            averageSpeed: [],
            congestionLevel: [],
            stopCount: []
        };

        // Heatmap data
        this.heatmapGrid = this.createHeatmapGrid(200, 200, 10);

        // Per-vehicle tracking
        this.vehicleData = new Map();

        // Aggregate statistics
        this.totalStops = 0;
        this.totalDistance = 0;
        this.totalTripTime = 0;
    }

    createHeatmapGrid(width, height, cellSize) {
        const cols = Math.ceil(width / cellSize);
        const rows = Math.ceil(height / cellSize);
        const grid = [];

        for (let i = 0; i < rows; i++) {
            grid[i] = [];
            for (let j = 0; j < cols; j++) {
                grid[i][j] = { density: 0, speed: 0, count: 0 };
            }
        }

        return { grid, cols, rows, cellSize, width, height };
    }

    update(vehicles) {
        if (!this.enabled) return;

        // Reset counts
        Object.keys(this.vehicleCounts).forEach(key => {
            this.vehicleCounts[key] = 0;
        });

        // Reset average speeds
        Object.keys(this.averageSpeeds).forEach(key => {
            this.averageSpeeds[key] = 0;
        });

        const speedCounts = {};

        // Reset heatmap
        this.resetHeatmapGrid();

        // Update from vehicles
        vehicles.forEach(vehicle => {
            const type = vehicle.type;

            // Count vehicles
            if (this.vehicleCounts[type] !== undefined) {
                this.vehicleCounts[type]++;
            }
            this.vehicleCounts.total++;

            // Track speeds
            if (this.averageSpeeds[type] !== undefined) {
                this.averageSpeeds[type] += vehicle.currentSpeed || 0;
                speedCounts[type] = (speedCounts[type] || 0) + 1;
            }

            // Update heatmap
            if (vehicle.mesh && vehicle.mesh.position) {
                this.updateHeatmapCell(
                    vehicle.mesh.position.x,
                    vehicle.mesh.position.z,
                    vehicle.currentSpeed || 0
                );
            }

            // Track individual vehicle stats
            if (!this.vehicleData.has(vehicle)) {
                this.vehicleData.set(vehicle, {
                    startTime: Date.now(),
                    totalDistance: 0,
                    stops: 0
                });
            }
        });

        // Calculate averages
        Object.keys(this.averageSpeeds).forEach(type => {
            if (speedCounts[type] > 0) {
                this.averageSpeeds[type] /= speedCounts[type];
            }
        });

        // Update time series (every second)
        if (!this.lastTimeSeriesUpdate || Date.now() - this.lastTimeSeriesUpdate > 1000) {
            this.updateTimeSeries();
            this.lastTimeSeriesUpdate = Date.now();
        }
    }

    resetHeatmapGrid() {
        const { grid, rows, cols } = this.heatmapGrid;
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                grid[i][j] = { density: 0, speed: 0, count: 0 };
            }
        }
    }

    updateHeatmapCell(x, z, speed) {
        const { grid, cellSize, width, height, cols, rows } = this.heatmapGrid;

        const col = Math.floor((x + width / 2) / cellSize);
        const row = Math.floor((z + height / 2) / cellSize);

        if (col >= 0 && col < cols && row >= 0 && row < rows) {
            grid[row][col].density++;
            grid[row][col].speed += speed;
            grid[row][col].count++;
        }
    }

    updateTimeSeries() {
        const timestamp = Date.now();
        const avgSpeed = this.getOverallAverageSpeed();
        const congestion = this.calculateCongestion();

        this.timeSeriesData.timestamps.push(timestamp);
        this.timeSeriesData.vehicleCounts.push(this.vehicleCounts.total);
        this.timeSeriesData.averageSpeed.push(avgSpeed);
        this.timeSeriesData.congestionLevel.push(congestion);
        this.timeSeriesData.stopCount.push(this.totalStops);

        // Keep only recent data
        if (this.timeSeriesData.timestamps.length > this.maxDataPoints) {
            Object.keys(this.timeSeriesData).forEach(key => {
                this.timeSeriesData[key].shift();
            });
        }
    }

    getOverallAverageSpeed() {
        let totalSpeed = 0;
        let count = 0;

        Object.keys(this.averageSpeeds).forEach(type => {
            if (this.averageSpeeds[type] > 0) {
                totalSpeed += this.averageSpeeds[type];
                count++;
            }
        });

        return count > 0 ? totalSpeed / count : 0;
    }

    calculateCongestion() {
        // Simple congestion metric: 0-100
        // Based on average speed vs expected speed
        const avgSpeed = this.getOverallAverageSpeed();
        const expectedSpeed = 60; // km/h
        const congestion = Math.max(0, Math.min(100, 100 - (avgSpeed / expectedSpeed * 100)));
        return congestion;
    }

    getHeatmapData(type = 'density') {
        const { grid, rows, cols } = this.heatmapGrid;
        const data = [];

        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const cell = grid[i][j];
                let value = 0;

                if (type === 'density') {
                    value = cell.density;
                } else if (type === 'speed' && cell.count > 0) {
                    value = cell.speed / cell.count;
                }

                if (value > 0) {
                    data.push({
                        x: j,
                        y: i,
                        value: value
                    });
                }
            }
        }

        return data;
    }

    getStats() {
        return {
            vehicleCounts: { ...this.vehicleCounts },
            averageSpeeds: { ...this.averageSpeeds },
            congestion: this.calculateCongestion(),
            totalStops: this.totalStops,
            totalDistance: this.totalDistance
        };
    }

    getTimeSeriesData() {
        return { ...this.timeSeriesData };
    }

    exportToCSV() {
        const headers = ['Timestamp', 'Total Vehicles', 'Avg Speed', 'Congestion', 'Stops'];
        const rows = [headers.join(',')];

        for (let i = 0; i < this.timeSeriesData.timestamps.length; i++) {
            const row = [
                new Date(this.timeSeriesData.timestamps[i]).toISOString(),
                this.timeSeriesData.vehicleCounts[i],
                this.timeSeriesData.averageSpeed[i].toFixed(2),
                this.timeSeriesData.congestionLevel[i].toFixed(2),
                this.timeSeriesData.stopCount[i]
            ];
            rows.push(row.join(','));
        }

        return rows.join('\n');
    }

    exportToJSON() {
        return JSON.stringify({
            summary: this.getStats(),
            timeSeries: this.getTimeSeriesData(),
            heatmap: {
                density: this.getHeatmapData('density'),
                speed: this.getHeatmapData('speed')
            }
        }, null, 2);
    }

    reset() {
        this.vehicleData.clear();
        this.timeSeriesData = {
            timestamps: [],
            vehicleCounts: [],
            averageSpeed: [],
            congestionLevel: [],
            stopCount: []
        };
        this.totalStops = 0;
        this.totalDistance = 0;
        this.totalTripTime = 0;
    }
}
