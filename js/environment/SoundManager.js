// Sound Management System using Web Audio API
export class SoundManager {
    constructor(config) {
        this.config = config;
        this.enabled = config.get('soundEnabled');
        this.volume = config.get('soundVolume');

        this.audioContext = null;
        this.sounds = new Map();
        this.playing = new Map();
        this.initialized = false;

        // Don't initialize audio context until user interaction
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Initialize on first user interaction
        const initAudio = () => {
            if (!this.initialized) {
                this.init();
                document.removeEventListener('click', initAudio);
                document.removeEventListener('keydown', initAudio);
            }
        };

        document.addEventListener('click', initAudio);
        document.addEventListener('keydown', initAudio);
    }

    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('Sound system initialized');

            // Create sound buffers (using oscillators for now, can load files later)
            this.createSynthSounds();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
            this.enabled = false;
        }
    }

    createSynthSounds() {
        // We'll create simple synthetic sounds
        // In production, you'd load actual audio files
        this.synthSounds = {
            carEngine: { freq: 100, duration: 0.1 },
            busEngine: { freq: 80, duration: 0.1 },
            horn: { freq: 440, duration: 0.2 },
            siren: { freq: 800, duration: 0.5 },
            trainWhistle: { freq: 600, duration: 0.3 },
            ambient: { freq: 50, duration: 1.0 }
        };
    }

    playSound(soundName, volume = 1.0, loop = false) {
        if (!this.enabled || !this.initialized || !this.audioContext) return null;

        const masterVolume = this.volume * volume;
        if (masterVolume <= 0) return null;

        // Check if sound is already playing
        if (this.playing.has(soundName) && loop) {
            return this.playing.get(soundName);
        }

        const synthSound = this.synthSounds[soundName];
        if (!synthSound) return null;

        // Create oscillator
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.type = soundName.includes('siren') ? 'square' : 'sine';
        oscillator.frequency.value = synthSound.freq;

        gainNode.gain.value = masterVolume;

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.start();

        if (!loop) {
            oscillator.stop(this.audioContext.currentTime + synthSound.duration);
        }

        const soundInstance = { oscillator, gainNode };
        if (loop) {
            this.playing.set(soundName, soundInstance);
        }

        return soundInstance;
    }

    stopSound(soundName) {
        if (this.playing.has(soundName)) {
            const { oscillator } = this.playing.get(soundName);
            oscillator.stop();
            this.playing.delete(soundName);
        }
    }

    playEngineSound(vehicleType, speed) {
        if (!this.enabled || !this.initialized || speed < 1) return;

        const soundName = `${vehicleType}Engine`;
        const pitch = 1 + (speed / 100); // Pitch increases with speed
        const volume = Math.min(1.0, speed / 50);

        // Play short engine burst
        if (Math.random() < 0.01) { // 1% chance per frame
            this.playSound(soundName, volume * 0.3);
        }
    }

    playHorn() {
        if (!this.enabled || !this.initialized) return;
        this.playSound('horn', 0.5);
    }

    playSiren(vehicleType) {
        if (!this.enabled || !this.initialized) return;

        const sirenSound = this.playSound('siren', 0.6, true);
        if (sirenSound && vehicleType === 'emergency') {
            // Modulate siren frequency
            const { oscillator } = sirenSound;
            const now = this.audioContext.currentTime;

            oscillator.frequency.setValueAtTime(800, now);
            oscillator.frequency.linearRampToValueAtTime(1000, now + 0.5);
            oscillator.frequency.linearRampToValueAtTime(800, now + 1.0);
        }

        return sirenSound;
    }

    stopSiren() {
        this.stopSound('siren');
    }

    playAmbientSound() {
        if (!this.enabled || !this.initialized) return;
        if (!this.playing.has('ambient')) {
            this.playSound('ambient', 0.1, true);
        }
    }

    stopAmbientSound() {
        this.stopSound('ambient');
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        this.config.set('soundVolume', this.volume);

        // Update all playing sounds
        this.playing.forEach(({ gainNode }) => {
            gainNode.gain.value = this.volume;
        });
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        this.config.set('soundEnabled', enabled);

        if (!enabled) {
            // Stop all sounds
            this.playing.forEach((sound, name) => {
                this.stopSound(name);
            });
        }
    }

    stopAll() {
        this.playing.forEach((sound, name) => {
            this.stopSound(name);
        });
    }

    // Load actual audio files (for future enhancement)
    async loadAudioFile(name, url) {
        if (!this.initialized) return;

        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
            this.sounds.set(name, audioBuffer);
        } catch (e) {
            console.error(`Failed to load audio file ${name}:`, e);
        }
    }

    playLoadedSound(name, volume = 1.0) {
        if (!this.enabled || !this.initialized || !this.sounds.has(name)) return;

        const buffer = this.sounds.get(name);
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();

        source.buffer = buffer;
        gainNode.gain.value = this.volume * volume;

        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        source.start(0);
    }
}
