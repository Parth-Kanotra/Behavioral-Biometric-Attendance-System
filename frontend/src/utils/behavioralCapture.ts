import { InteractionData, BehavioralFeatures } from '@/types';

export class BehavioralCapture {
  private interactions: InteractionData[] = [];
  private keyDownTimes: Map<string, number> = new Map();
  private lastKeyTime: number = 0;
  private mousePositions: { x: number; y: number; time: number }[] = [];
  private isCapturing: boolean = false;

  startCapture(): void {
    this.interactions = [];
    this.keyDownTimes.clear();
    this.lastKeyTime = 0;
    this.mousePositions = [];
    this.isCapturing = true;
  }

  stopCapture(): void {
    this.isCapturing = false;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (!this.isCapturing) return;
    
    const timestamp = Date.now();
    const key = event.key;
    
    this.keyDownTimes.set(key, timestamp);
    
    this.interactions.push({
      timestamp,
      eventType: 'keydown',
      key,
    });
  }

  handleKeyUp(event: KeyboardEvent): void {
    if (!this.isCapturing) return;
    
    const timestamp = Date.now();
    const key = event.key;
    const keyDownTime = this.keyDownTimes.get(key);
    
    if (keyDownTime) {
      const duration = timestamp - keyDownTime;
      
      this.interactions.push({
        timestamp,
        eventType: 'keyup',
        key,
        duration,
      });
      
      this.keyDownTimes.delete(key);
    }
    
    this.lastKeyTime = timestamp;
  }

  handleMouseMove(event: MouseEvent): void {
    if (!this.isCapturing) return;
    
    const timestamp = Date.now();
    
    this.mousePositions.push({
      x: event.clientX,
      y: event.clientY,
      time: timestamp,
    });
    
    // Calculate velocity
    if (this.mousePositions.length >= 2) {
      const prev = this.mousePositions[this.mousePositions.length - 2];
      const curr = this.mousePositions[this.mousePositions.length - 1];
      
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const dt = curr.time - prev.time;
      
      const distance = Math.sqrt(dx * dx + dy * dy);
      const velocity = dt > 0 ? distance / dt : 0;
      
      this.interactions.push({
        timestamp,
        eventType: 'mousemove',
        mouseX: event.clientX,
        mouseY: event.clientY,
        velocity,
      });
    }
    
    // Keep only recent positions to avoid memory issues
    if (this.mousePositions.length > 100) {
      this.mousePositions.shift();
    }
  }

  extractFeatures(): BehavioralFeatures {
    const keyEvents = this.interactions.filter(i => 
      i.eventType === 'keydown' || i.eventType === 'keyup'
    );
    
    const keyUpEvents = this.interactions.filter(i => 
      i.eventType === 'keyup' && i.duration !== undefined
    );
    
    const mouseEvents = this.interactions.filter(i => 
      i.eventType === 'mousemove'
    );

    // Calculate typing dynamics
    const keyPressDurations = keyUpEvents
      .map(e => e.duration!)
      .filter(d => d > 0 && d < 1000);
    
    const avgKeyPressDuration = keyPressDurations.length > 0
      ? keyPressDurations.reduce((a, b) => a + b, 0) / keyPressDurations.length
      : 0;
    
    const keyPressVariance = this.calculateVariance(keyPressDurations);

    // Calculate inter-key delays
    const interKeyDelays: number[] = [];
    for (let i = 1; i < keyEvents.length; i++) {
      const delay = keyEvents[i].timestamp - keyEvents[i - 1].timestamp;
      if (delay > 0 && delay < 2000) {
        interKeyDelays.push(delay);
      }
    }
    
    const avgInterKeyDelay = interKeyDelays.length > 0
      ? interKeyDelays.reduce((a, b) => a + b, 0) / interKeyDelays.length
      : 0;
    
    const interKeyVariance = this.calculateVariance(interKeyDelays);

    // Calculate rhythm pattern (histogram of inter-key delays)
    const rhythmPattern = this.createHistogram(interKeyDelays, 10);

    // Calculate burst typing rate
    const shortDelays = interKeyDelays.filter(d => d < 100);
    const burstTypingRate = shortDelays.length / Math.max(interKeyDelays.length, 1);

    // Calculate pause frequency
    const pauses = interKeyDelays.filter(d => d > 500);
    const pauseFrequency = pauses.length / Math.max(interKeyDelays.length, 1);

    // Calculate error patterns
    const backspaceCount = keyEvents.filter(e => 
      e.key === 'Backspace' || e.key === 'Delete'
    ).length;
    const backspaceRate = backspaceCount / Math.max(keyEvents.length, 1);

    const correctionTiming = this.findCorrectionPatterns(keyEvents);

    // Calculate mouse dynamics
    const mouseVelocities = mouseEvents
      .map(e => e.velocity!)
      .filter(v => v !== undefined && v > 0);
    
    const avgMouseVelocity = mouseVelocities.length > 0
      ? mouseVelocities.reduce((a, b) => a + b, 0) / mouseVelocities.length
      : 0;

    const mouseAcceleration = this.calculateMouseAcceleration(mouseEvents);

    // Create normalized feature vector (signature)
    const signature = this.normalizeFeatures([
      avgKeyPressDuration,
      avgInterKeyDelay,
      keyPressVariance,
      interKeyVariance,
      burstTypingRate,
      pauseFrequency,
      backspaceRate,
      avgMouseVelocity,
      mouseAcceleration,
      ...rhythmPattern,
    ]);

    return {
      avgKeyPressDuration,
      avgInterKeyDelay,
      keyPressVariance,
      interKeyVariance,
      rhythmPattern,
      burstTypingRate,
      pauseFrequency,
      backspaceRate,
      correctionTiming,
      avgMouseVelocity,
      mouseAcceleration,
      signature,
    };
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  private createHistogram(values: number[], bins: number): number[] {
    if (values.length === 0) return new Array(bins).fill(0);
    
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / bins;
    
    const histogram = new Array(bins).fill(0);
    
    values.forEach(value => {
      const binIndex = Math.min(
        Math.floor((value - min) / binSize),
        bins - 1
      );
      histogram[binIndex]++;
    });
    
    // Normalize
    const total = values.length;
    return histogram.map(count => count / total);
  }

  private findCorrectionPatterns(keyEvents: InteractionData[]): number[] {
    const corrections: number[] = [];
    
    for (let i = 1; i < keyEvents.length; i++) {
      if (keyEvents[i].key === 'Backspace' || keyEvents[i].key === 'Delete') {
        const timeSinceLast = keyEvents[i].timestamp - keyEvents[i - 1].timestamp;
        corrections.push(timeSinceLast);
      }
    }
    
    return corrections;
  }

  private calculateMouseAcceleration(mouseEvents: InteractionData[]): number {
    if (mouseEvents.length < 3) return 0;
    
    const velocities = mouseEvents
      .map(e => e.velocity!)
      .filter(v => v !== undefined);
    
    const accelerations: number[] = [];
    
    for (let i = 1; i < velocities.length; i++) {
      const dv = velocities[i] - velocities[i - 1];
      accelerations.push(Math.abs(dv));
    }
    
    return accelerations.length > 0
      ? accelerations.reduce((a, b) => a + b, 0) / accelerations.length
      : 0;
  }

  private normalizeFeatures(features: number[]): number[] {
    const mean = features.reduce((a, b) => a + b, 0) / features.length;
    const variance = this.calculateVariance(features);
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return features.map(() => 0);
    
    return features.map(f => (f - mean) / stdDev);
  }

  getInteractionCount(): number {
    return this.interactions.length;
  }

  getKeyEventCount(): number {
    return this.interactions.filter(i => 
      i.eventType === 'keydown' || i.eventType === 'keyup'
    ).length;
  }
}

export const behavioralCapture = new BehavioralCapture();
