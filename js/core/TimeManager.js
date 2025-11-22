// Day/Night Cycle Management
export class TimeManager {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.currentTime = config.get('timeOfDay'); // 0-24 hours
        this.timeSpeed = config.get('timeSpeed'); // sim hours per real minute
        this.isPaused = false;

        this.sunLight = null;
        this.moonLight = null;
        this.ambientLight = null;

        this.setupLights();
    }

    setupLights() {
        // Remove old lights if they exist
        if (this.sunLight) this.scene.remove(this.sunLight);
        if (this.moonLight) this.scene.remove(this.moonLight);
        if (this.ambientLight) this.scene.remove(this.ambientLight);

        // Sun (directional light)
        this.sunLight = new THREE.DirectionalLight(0xffffff, 1);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.camera.left = -100;
        this.sunLight.shadow.camera.right = 100;
        this.sunLight.shadow.camera.top = 100;
        this.sunLight.shadow.camera.bottom = -100;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.scene.add(this.sunLight);

        // Moon (subtle light)
        this.moonLight = new THREE.DirectionalLight(0x8888ff, 0.1);
        this.moonLight.castShadow = false;
        this.scene.add(this.moonLight);

        // Ambient light
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambientLight);

        this.updateLighting();
    }

    update(deltaTime) {
        if (this.isPaused) return;

        // Update time (deltaTime is in seconds)
        const hoursPerSecond = this.timeSpeed / 60;
        this.currentTime += hoursPerSecond * deltaTime;

        // Wrap around 24 hours
        if (this.currentTime >= 24) {
            this.currentTime -= 24;
        }

        this.updateLighting();
    }

    updateLighting() {
        const time = this.currentTime;

        // Calculate sun position (0-24 hours)
        const sunAngle = ((time - 6) / 12) * Math.PI; // -PI to PI
        const sunX = Math.sin(sunAngle) * 100;
        const sunY = Math.cos(sunAngle) * 100;

        this.sunLight.position.set(sunX, Math.max(sunY, -30), 30);

        // Calculate lighting intensity based on time of day
        let sunIntensity, ambientIntensity, skyColor;

        if (time >= 6 && time < 8) {
            // Sunrise (6-8am)
            const t = (time - 6) / 2;
            sunIntensity = 0.3 + (t * 0.5);
            ambientIntensity = 0.4 + (t * 0.2);
            skyColor = this.lerpColor(0x1a1a2e, 0xFFA07A, t); // Dark to orange
        } else if (time >= 8 && time < 18) {
            // Daytime (8am-6pm)
            sunIntensity = 0.8;
            ambientIntensity = 0.6;
            skyColor = 0x87CEEB; // Sky blue
        } else if (time >= 18 && time < 20) {
            // Sunset (6-8pm)
            const t = (time - 18) / 2;
            sunIntensity = 0.8 - (t * 0.5);
            ambientIntensity = 0.6 - (t * 0.4);
            skyColor = this.lerpColor(0x87CEEB, 0xFF6B35, t); // Blue to orange
        } else {
            // Nighttime (8pm-6am)
            sunIntensity = 0.1;
            ambientIntensity = 0.2;
            skyColor = 0x1a1a2e; // Dark blue/purple
        }

        // Apply lighting
        this.sunLight.intensity = sunIntensity;
        this.ambientLight.intensity = ambientIntensity;

        // Update sky color
        this.scene.background = new THREE.Color(skyColor);
        if (this.scene.fog) {
            this.scene.fog.color = new THREE.Color(skyColor);
        }

        // Moon is visible at night
        this.moonLight.intensity = time >= 20 || time < 6 ? 0.15 : 0;
        const moonAngle = sunAngle + Math.PI;
        this.moonLight.position.set(
            Math.sin(moonAngle) * 100,
            Math.cos(moonAngle) * 100,
            30
        );
    }

    lerpColor(color1, color2, t) {
        const c1 = new THREE.Color(color1);
        const c2 = new THREE.Color(color2);
        return c1.lerp(c2, t).getHex();
    }

    setTime(hours) {
        this.currentTime = Math.max(0, Math.min(24, hours));
        this.updateLighting();
    }

    setTimeSpeed(speed) {
        this.timeSpeed = speed;
        this.config.set('timeSpeed', speed);
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    getTime() {
        return this.currentTime;
    }

    getTimeString() {
        const hours = Math.floor(this.currentTime);
        const minutes = Math.floor((this.currentTime - hours) * 60);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    }

    isDaytime() {
        return this.currentTime >= 6 && this.currentTime < 20;
    }

    isNighttime() {
        return !this.isDaytime();
    }
}
