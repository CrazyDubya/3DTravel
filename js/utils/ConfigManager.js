// Configuration Management System
export class ConfigManager {
    constructor() {
        this.defaultConfig = {
            // Vehicle Density
            carDensity: 5,
            busDensity: 3,
            bicycleDensity: 4,
            pedestrianDensity: 10,
            trainDensity: 2,
            subwayDensity: 2,
            emergencyDensity: 1,

            // Vehicle Speed
            carSpeed: 60,
            busSpeed: 50,
            trainSpeed: 100,
            bicycleSpeed: 25,
            pedestrianSpeed: 5,
            emergencySpeed: 80,

            // Traffic Settings
            twoWayTraffic: true,
            trafficLightsEnabled: true,
            collisionDetection: true,

            // Display Settings
            showSubway: true,
            showPaths: true,
            showAnalytics: false,
            showHeatmap: false,

            // Simulation Settings
            simulationSpeed: 1.0,

            // Environment Settings
            timeOfDay: 12.0, // 0-24 hours
            timeSpeed: 1.0, // 1.0 = 1 sim hour per real minute
            weather: 'clear', // clear, rain, snow, fog
            soundEnabled: true,
            soundVolume: 0.5,

            // Traffic Light Settings
            greenDuration: 30, // seconds
            yellowDuration: 3,
            redDuration: 30,

            // Analytics Settings
            trackStatistics: true,
            heatmapUpdateInterval: 1000, // ms
            chartUpdateInterval: 500
        };

        this.config = this.loadConfig();
    }

    loadConfig() {
        try {
            const saved = localStorage.getItem('trafficSimConfig');
            if (saved) {
                return { ...this.defaultConfig, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.warn('Failed to load config from localStorage:', e);
        }
        return { ...this.defaultConfig };
    }

    saveConfig() {
        try {
            localStorage.setItem('trafficSimConfig', JSON.stringify(this.config));
            return true;
        } catch (e) {
            console.error('Failed to save config to localStorage:', e);
            return false;
        }
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
        this.saveConfig();
    }

    reset() {
        this.config = { ...this.defaultConfig };
        this.saveConfig();
    }

    exportConfig() {
        return JSON.stringify(this.config, null, 2);
    }

    importConfig(jsonString) {
        try {
            const imported = JSON.parse(jsonString);
            this.config = { ...this.defaultConfig, ...imported };
            this.saveConfig();
            return true;
        } catch (e) {
            console.error('Failed to import config:', e);
            return false;
        }
    }

    // Preset configurations
    loadPreset(presetName) {
        const presets = {
            'rush-hour': {
                carDensity: 40,
                busDensity: 15,
                bicycleDensity: 20,
                pedestrianDensity: 40,
                simulationSpeed: 1.5,
                timeOfDay: 8.0
            },
            'night-city': {
                carDensity: 8,
                busDensity: 2,
                bicycleDensity: 1,
                pedestrianDensity: 5,
                timeOfDay: 22.0,
                weather: 'clear'
            },
            'heavy-traffic': {
                carDensity: 50,
                busDensity: 20,
                bicycleDensity: 30,
                pedestrianDensity: 50,
                trainDensity: 5,
                emergencyDensity: 3
            },
            'calm-sunday': {
                carDensity: 3,
                busDensity: 1,
                bicycleDensity: 10,
                pedestrianDensity: 15,
                timeOfDay: 14.0,
                simulationSpeed: 0.8
            }
        };

        if (presets[presetName]) {
            this.config = { ...this.config, ...presets[presetName] };
            this.saveConfig();
            return true;
        }
        return false;
    }
}
