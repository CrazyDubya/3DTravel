// Weather System with particle effects
export class WeatherSystem {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.currentWeather = config.get('weather');
        this.particles = null;
        this.particleSystem = null;

        this.weatherEffects = {
            clear: { visibility: 500, speedModifier: 1.0 },
            rain: { visibility: 200, speedModifier: 0.8 },
            snow: { visibility: 150, speedModifier: 0.6 },
            fog: { visibility: 100, speedModifier: 0.9 }
        };

        this.setupWeather();
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
        const particleCount = 5000;
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
            opacity: 0.6
        });

        this.particleSystem = new THREE.Points(particles, material);
        this.particles = particles;
        this.scene.add(this.particleSystem);
    }

    createSnow() {
        const particleCount = 3000;
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
            opacity: 0.8
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

        const positions = this.particles.attributes.position.array;
        const velocities = this.particles.attributes.velocity.array;

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
                positions[idx] += Math.sin(Date.now() * 0.001) * 0.02;
            } else if (this.currentWeather === 'snow') {
                positions[idx] += Math.sin(Date.now() * 0.001 + i) * 0.05;
                positions[idx + 2] += Math.cos(Date.now() * 0.001 + i) * 0.05;
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
