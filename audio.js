// Audio System using Web Audio API
class AudioSystem {
    constructor() {
        this.context = null;
        this.sounds = {};
        this.enabled = true;
        this.masterVolume = 0.3;
    }

    init() {
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.createSounds();
        } catch (e) {
            console.warn('Web Audio API not supported');
            this.enabled = false;
        }
    }

    createSounds() {
        // Sound effect configurations
        this.sounds = {
            shoot: { freq: 150, duration: 0.1, type: 'sawtooth', volume: 0.3 },
            hit: { freq: 800, duration: 0.15, type: 'sine', volume: 0.4 },
            targetDestroy: { freq: 200, duration: 0.3, type: 'square', volume: 0.5 },
            reload: { freq: 300, duration: 0.2, type: 'triangle', volume: 0.2 },
            damage: { freq: 100, duration: 0.2, type: 'sawtooth', volume: 0.4 }
        };
    }

    play(soundName) {
        if (!this.enabled || !this.context || !this.sounds[soundName]) return;

        const sound = this.sounds[soundName];
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.type = sound.type;
        oscillator.frequency.setValueAtTime(sound.freq, this.context.currentTime);
        
        gainNode.gain.setValueAtTime(sound.volume * this.masterVolume, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + sound.duration);

        oscillator.connect(gainNode);
        gainNode.connect(this.context.destination);

        oscillator.start(this.context.currentTime);
        oscillator.stop(this.context.currentTime + sound.duration);
    }

    playShoot() {
        this.play('shoot');
    }

    playHit() {
        this.play('hit');
    }

    playTargetDestroy() {
        this.play('targetDestroy');
    }

    playReload() {
        this.play('reload');
    }

    playDamage() {
        this.play('damage');
    }
}

// Global audio instance
const audioSystem = new AudioSystem();
