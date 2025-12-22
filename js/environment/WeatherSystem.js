// Weather System with particle effects and optimizations
export class WeatherSystem {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.currentWeather = config.get('weather');
        this.particles = null;
        this.particleSystem = null;

        // Performance optimization: reduce particle count on lower performance
        this.performanceLevel = 'high'; // high, medium, low

        this.weatherEffects = {
            clear: { visibility: 500, speedModifier: 1.0, particles: 0 },
            rain: { visibility: 200, speedModifier: 0.8, particles: 5000 },
            snow: { visibility: 150, speedModifier: 0.6, particles: 3000 },
            fog: { visibility: 100, speedModifier: 0.9, particles: 0 }
        };

        // Optimization: Only update visible particles
        this.updateCounter = 0;
        this.updateFrequency = 1; // Update every N frames

        this.setupWeather();
    }

    setPerformanceLevel(level) {
        this.performanceLevel = level;
        if (this.currentWeather !== 'clear' && this.currentWeather !== 'fog') {
            this.setupWeather(); // Recreate with new particle count
        }
    }

    getParticleCount(baseCount) {
        switch (this.performanceLevel) {
            case 'high': return baseCount;
            case 'medium': return Math.floor(baseCount * 0.6);
            case 'low': return Math.floor(baseCount * 0.3);
            default: return baseCount;
        }
    }

    setupWeather() {
        this.removeCurrentWeather();

        switch (this.currentWeather) {
            case 'rain':
                this.createRain();
                break;
            case 'snow':
                this.createSnow();
                break;
            case 'fog':
                this.createFog();
                break;
            case 'clear':
            default:
                this.createClear();
                break;
        }

        this.updateSceneVisibility();
    }

    createRain() {
        const baseCount = this.weatherEffects.rain.particles;
        const particleCount = this.getParticleCount(baseCount);
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = Math.random() * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
            velocities[i] = Math.random() * 0.5 + 0.5;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

        const material = new THREE.PointsMaterial({
            color: 0xaaaaaa,
            size: 0.2,
            transparent: true,
            opacity: 0.6,
            sizeAttenuation: true // Optimization: proper size handling
        });

        this.particleSystem = new THREE.Points(particles, material);
        this.particles = particles;
        this.scene.add(this.particleSystem);
    }

    createSnow() {
        const baseCount = this.weatherEffects.snow.particles;
        const particleCount = this.getParticleCount(baseCount);
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = Math.random() * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
            velocities[i] = Math.random() * 0.2 + 0.1;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('velocity', new THREE.BufferAttribute(velocities, 1));

        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.4,
            transparent: true,
            opacity: 0.8,
            sizeAttenuation: true
        });

        this.particleSystem = new THREE.Points(particles, material);
        this.particles = particles;
        this.scene.add(this.particleSystem);
    }

    createFog() {
        // Fog is handled by scene fog property
        this.scene.fog = new THREE.Fog(0xcccccc, 50, 100);
    }

    createClear() {
        // Clear weather - restore normal fog
        this.scene.fog = new THREE.Fog(0x87CEEB, 100, 500);
    }

    update(deltaTime) {
        if (!this.particleSystem) return;

        // Optimization: Skip updates on some frames for better performance
        this.updateCounter++;
        if (this.updateCounter % this.updateFrequency !== 0) return;

        const positions = this.particles.attributes.position.array;
        const velocities = this.particles.attributes.velocity.array;
        const time = Date.now() * 0.001;

        // Optimization: Batch update particles
        for (let i = 0; i < positions.length / 3; i++) {
            const idx = i * 3;

            // Update Y position based on velocity
            positions[idx + 1] -= velocities[i];

            // Reset particle if it hits the ground
            if (positions[idx + 1] < 0) {
                positions[idx + 1] = 100;
                positions[idx] = (Math.random() - 0.5) * 200;
                positions[idx + 2] = (Math.random() - 0.5) * 200;
            }

            // Slight horizontal movement for realism
            if (this.currentWeather === 'rain') {
                positions[idx] += Math.sin(time) * 0.02;
            } else if (this.currentWeather === 'snow') {
                // Optimization: Use pre-computed offset
                const offset = i * 0.1;
                positions[idx] += Math.sin(time + offset) * 0.05;
                positions[idx + 2] += Math.cos(time + offset) * 0.05;
            }
        }

        this.particles.attributes.position.needsUpdate = true;
    }

    setWeather(weatherType) {
        if (this.weatherEffects[weatherType]) {
            this.currentWeather = weatherType;
            this.config.set('weather', weatherType);
            this.setupWeather();
        }
    }

    getWeather() {
        return this.currentWeather;
    }

    getSpeedModifier() {
        return this.weatherEffects[this.currentWeather].speedModifier;
    }

    updateSceneVisibility() {
        const effect = this.weatherEffects[this.currentWeather];
        if (this.scene.fog) {
            this.scene.fog.far = effect.visibility;
        }
    }

    removeCurrentWeather() {
        if (this.particleSystem) {
            this.scene.remove(this.particleSystem);
            this.particleSystem = null;
            this.particles = null;
        }
    }
}
