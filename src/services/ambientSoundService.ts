/**
 * Ambient Sound Service - Procedural audio generation using Web Audio API
 * Generates rain, thunder, wind, and other ambient sounds without external APIs
 */

class AmbientSoundService {
  private audioContext: AudioContext | null = null;
  private activeNodes: Map<string, AudioNode[]> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  private isPlaying: Map<string, boolean> = new Map();
  private isAudioSupported: boolean = false;

  constructor() {
    // Check if AudioContext is available (may not be in some environments)
    try {
      this.isAudioSupported = typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined';
    } catch {
      this.isAudioSupported = false;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (!this.isAudioSupported) {
      return null;
    }
    try {
      if (!this.audioContext || this.audioContext.state === 'closed') {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
      }
      return this.audioContext;
    } catch {
      return null;
    }
  }

  private createNoiseBuffer(duration: number, type: 'white' | 'pink' | 'brown' = 'white'): AudioBuffer | null {
    const ctx = this.getAudioContext();
    if (!ctx) return null;
    
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      
      if (type === 'white') {
        data[i] = white * 0.5;
      } else if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else { // brown
        data[i] = (b0 = (b0 + (0.02 * white)) / 1.02) * 3.5;
      }
    }

    return buffer;
  }

  // Rain sound - filtered noise with modulation
  startRain(): void {
    if (this.isPlaying.get('rain')) return;
    
    const ctx = this.getAudioContext();
    if (!ctx) return;
    
    const nodes: AudioNode[] = [];

    // Create noise source
    const noiseBuffer = this.createNoiseBuffer(2, 'pink');
    if (!noiseBuffer) return;
    
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Bandpass filter for rain-like sound
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3000;
    filter.Q.value = 0.5;

    // High shelf for brightness
    const highShelf = ctx.createBiquadFilter();
    highShelf.type = 'highshelf';
    highShelf.frequency.value = 4000;
    highShelf.gain.value = 3;

    // Gain control
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.15;

    // Connect
    noise.connect(filter);
    filter.connect(highShelf);
    highShelf.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start();

    nodes.push(noise, filter, highShelf, gainNode);
    this.activeNodes.set('rain', nodes);
    this.gainNodes.set('rain', gainNode);
    this.isPlaying.set('rain', true);
  }

  // Thunder sound - low frequency rumble with crack
  playThunder(): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    // Thunder crack
    const crackOsc = ctx.createOscillator();
    crackOsc.type = 'sawtooth';
    crackOsc.frequency.value = 100;

    const crackGain = ctx.createGain();
    crackGain.gain.setValueAtTime(0.3, ctx.currentTime);
    crackGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

    // Rumble
    const rumbleBuffer = this.createNoiseBuffer(3, 'brown');
    if (!rumbleBuffer) return;
    
    const rumble = ctx.createBufferSource();
    rumble.buffer = rumbleBuffer;

    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 150;

    const rumbleGain = ctx.createGain();
    rumbleGain.gain.setValueAtTime(0.4, ctx.currentTime);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);

    crackOsc.connect(crackGain);
    crackGain.connect(ctx.destination);
    
    rumble.connect(lowpass);
    lowpass.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);

    crackOsc.start();
    crackOsc.stop(ctx.currentTime + 0.1);
    rumble.start();
    rumble.stop(ctx.currentTime + 3);
  }

  // Wind sound - modulated filtered noise
  startWind(): void {
    if (this.isPlaying.get('wind')) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;
    
    const nodes: AudioNode[] = [];

    const noiseBuffer = this.createNoiseBuffer(4, 'brown');
    if (!noiseBuffer) return;
    
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Bandpass for wind howl
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 400;
    filter.Q.value = 2;

    // LFO for modulation
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.2;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.12;

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start();
    lfo.start();

    nodes.push(noise, filter, lfo, lfoGain, gainNode);
    this.activeNodes.set('wind', nodes);
    this.gainNodes.set('wind', gainNode);
    this.isPlaying.set('wind', true);
  }

  // Night crickets/ambient
  startNightAmbient(): void {
    if (this.isPlaying.get('night')) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;
    
    const nodes: AudioNode[] = [];

    // Create chirping oscillators
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.08;

    const createChirp = (baseFreq: number, delay: number) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = baseFreq;

      const chirpGain = ctx.createGain();
      chirpGain.gain.value = 0;

      // Chirp pattern
      const now = ctx.currentTime + delay;
      const chirp = () => {
        const t = ctx.currentTime;
        chirpGain.gain.setValueAtTime(0.3, t);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
        chirpGain.gain.setValueAtTime(0.3, t + 0.08);
        chirpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
      };

      osc.connect(chirpGain);
      chirpGain.connect(masterGain);
      osc.start(now);

      // Schedule chirps
      const interval = setInterval(chirp, 800 + Math.random() * 1500);
      return { osc, interval };
    };

    const chirp1 = createChirp(4200, 0);
    const chirp2 = createChirp(4800, 0.3);
    const chirp3 = createChirp(3800, 0.6);

    masterGain.connect(ctx.destination);

    nodes.push(chirp1.osc, chirp2.osc, chirp3.osc, masterGain);
    this.activeNodes.set('night', nodes);
    this.gainNodes.set('night', masterGain);
    this.isPlaying.set('night', true);

    // Store intervals for cleanup
    (this.activeNodes.get('night') as any).intervals = [chirp1.interval, chirp2.interval, chirp3.interval];
  }

  // Fire crackling
  startFireCrackling(): void {
    if (this.isPlaying.get('fire')) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;
    
    const nodes: AudioNode[] = [];

    const noiseBuffer = this.createNoiseBuffer(1, 'white');
    if (!noiseBuffer) return;
    
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;

    // Bandpass for crackling
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000;
    filter.Q.value = 1;

    // Random modulation for crackle effect
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 8;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 500;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.06;

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start();
    lfo.start();

    nodes.push(noise, filter, lfo, lfoGain, gainNode);
    this.activeNodes.set('fire', nodes);
    this.gainNodes.set('fire', gainNode);
    this.isPlaying.set('fire', true);
  }

  // Sparkle/twinkle sound for stars
  startSparkle(): void {
    if (this.isPlaying.get('sparkle')) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;
    
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.05;
    masterGain.connect(ctx.destination);

    const playTwinkle = () => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 2000 + Math.random() * 3000;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    };

    const interval = setInterval(playTwinkle, 500 + Math.random() * 1000);

    this.activeNodes.set('sparkle', [masterGain]);
    this.gainNodes.set('sparkle', masterGain);
    this.isPlaying.set('sparkle', true);
    (this.activeNodes.get('sparkle') as any).interval = interval;
  }

  // Heartbeat sound
  startHeartbeat(): void {
    if (this.isPlaying.get('heartbeat')) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;
    
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.15;
    masterGain.connect(ctx.destination);

    const playBeat = () => {
      // First beat (lub)
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = 60;
      const gain1 = ctx.createGain();
      gain1.gain.setValueAtTime(0.5, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc1.connect(gain1);
      gain1.connect(masterGain);
      osc1.start();
      osc1.stop(ctx.currentTime + 0.15);

      // Second beat (dub)
      setTimeout(() => {
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = 50;
        const gain2 = ctx.createGain();
        gain2.gain.setValueAtTime(0.3, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc2.connect(gain2);
        gain2.connect(masterGain);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.1);
      }, 150);
    };

    const interval = setInterval(playBeat, 800);
    playBeat();

    this.activeNodes.set('heartbeat', [masterGain]);
    this.gainNodes.set('heartbeat', masterGain);
    this.isPlaying.set('heartbeat', true);
    (this.activeNodes.get('heartbeat') as any).interval = interval;
  }

  // Party/celebration sounds
  startParty(): void {
    if (this.isPlaying.get('party')) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;
    
    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.08;
    masterGain.connect(ctx.destination);

    const playChime = () => {
      const freq = [523, 659, 784, 1047][Math.floor(Math.random() * 4)];
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = freq;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    };

    const interval = setInterval(playChime, 300 + Math.random() * 500);

    this.activeNodes.set('party', [masterGain]);
    this.gainNodes.set('party', masterGain);
    this.isPlaying.set('party', true);
    (this.activeNodes.get('party') as any).interval = interval;
  }

  // Spooky ambient for Halloween
  startSpooky(): void {
    if (this.isPlaying.get('spooky')) return;

    const ctx = this.getAudioContext();
    if (!ctx) return;
    
    const nodes: AudioNode[] = [];

    // Low drone
    const drone = ctx.createOscillator();
    drone.type = 'sawtooth';
    drone.frequency.value = 55;

    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 200;

    // LFO for eerie modulation
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.1;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 20;
    lfo.connect(lfoGain);
    lfoGain.connect(drone.frequency);

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.06;

    drone.connect(droneFilter);
    droneFilter.connect(gainNode);
    gainNode.connect(ctx.destination);

    drone.start();
    lfo.start();

    nodes.push(drone, droneFilter, lfo, lfoGain, gainNode);
    this.activeNodes.set('spooky', nodes);
    this.gainNodes.set('spooky', gainNode);
    this.isPlaying.set('spooky', true);
  }

  stop(effectId: string): void {
    const nodes = this.activeNodes.get(effectId);
    if (nodes) {
      // Clear any intervals
      const intervalsObj = nodes as any;
      if (intervalsObj.interval) clearInterval(intervalsObj.interval);
      if (intervalsObj.intervals) intervalsObj.intervals.forEach((i: number) => clearInterval(i));

      nodes.forEach(node => {
        try {
          if (node instanceof AudioBufferSourceNode || node instanceof OscillatorNode) {
            node.stop();
          }
          node.disconnect();
        } catch (e) {
          // Node already stopped
        }
      });
    }
    this.activeNodes.delete(effectId);
    this.gainNodes.delete(effectId);
    this.isPlaying.set(effectId, false);
  }

  stopAll(): void {
    ['rain', 'wind', 'night', 'fire', 'sparkle', 'heartbeat', 'party', 'spooky'].forEach(id => {
      this.stop(id);
    });
  }

  setVolume(effectId: string, volume: number): void {
    const gainNode = this.gainNodes.get(effectId);
    if (gainNode) {
      gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  isEffectPlaying(effectId: string): boolean {
    return this.isPlaying.get(effectId) || false;
  }
}

export const ambientSoundService = new AmbientSoundService();
