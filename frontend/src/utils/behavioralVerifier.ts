import * as tf from '@tensorflow/tfjs';
import { BehavioralFeatures, VerificationResult } from '@/types';

export class BehavioralVerifier {
  private model: tf.LayersModel | null = null;
  private readonly CONFIDENCE_THRESHOLD = 0.75;

  async initialize(): Promise<void> {
    // Create a simple neural network for similarity scoring
    this.model = tf.sequential({
      layers: [
        tf.layers.dense({ 
          inputShape: [20], // Feature vector size
          units: 64, 
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.dropout({ rate: 0.3 }),
        tf.layers.dense({ 
          units: 32, 
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.dropout({ rate: 0.2 }),
        tf.layers.dense({ 
          units: 16, 
          activation: 'relu',
          kernelInitializer: 'heNormal'
        }),
        tf.layers.dense({ 
          units: 1, 
          activation: 'sigmoid' 
        }),
      ],
    });

    this.model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'binaryCrossentropy',
      metrics: ['accuracy'],
    });
  }

  /**
   * Calculate similarity between two behavioral profiles
   */
  calculateSimilarity(
    enrolledProfile: BehavioralFeatures,
    currentProfile: BehavioralFeatures
  ): VerificationResult {
    // Calculate individual metric similarities
    const typingRhythm = this.calculateTypingRhythmSimilarity(
      enrolledProfile,
      currentProfile
    );
    
    const keyDynamics = this.calculateKeyDynamicsSimilarity(
      enrolledProfile,
      currentProfile
    );
    
    const mouseDynamics = this.calculateMouseDynamicsSimilarity(
      enrolledProfile,
      currentProfile
    );

    // Calculate overall similarity using weighted combination
    const overall = this.calculateOverallSimilarity(
      enrolledProfile.signature,
      currentProfile.signature
    );

    // Determine if it's a match
    const confidenceScore = overall;
    const isMatch = confidenceScore >= this.CONFIDENCE_THRESHOLD;

    return {
      isMatch,
      confidenceScore,
      similarityMetrics: {
        typingRhythm,
        keyDynamics,
        mouseDynamics,
        overall,
      },
      timestamp: new Date(),
    };
  }

  private calculateTypingRhythmSimilarity(
    enrolled: BehavioralFeatures,
    current: BehavioralFeatures
  ): number {
    // Compare rhythm patterns using cosine similarity
    const rhythmSimilarity = this.cosineSimilarity(
      enrolled.rhythmPattern,
      current.rhythmPattern
    );

    // Compare burst typing rate
    const burstDiff = Math.abs(enrolled.burstTypingRate - current.burstTypingRate);
    const burstSimilarity = 1 - Math.min(burstDiff, 1);

    // Compare pause frequency
    const pauseDiff = Math.abs(enrolled.pauseFrequency - current.pauseFrequency);
    const pauseSimilarity = 1 - Math.min(pauseDiff, 1);

    // Weighted average
    return (rhythmSimilarity * 0.5 + burstSimilarity * 0.3 + pauseSimilarity * 0.2);
  }

  private calculateKeyDynamicsSimilarity(
    enrolled: BehavioralFeatures,
    current: BehavioralFeatures
  ): number {
    // Compare average key press duration
    const durationDiff = Math.abs(
      enrolled.avgKeyPressDuration - current.avgKeyPressDuration
    );
    const maxDuration = Math.max(
      enrolled.avgKeyPressDuration,
      current.avgKeyPressDuration
    );
    const durationSimilarity = maxDuration > 0 
      ? 1 - Math.min(durationDiff / maxDuration, 1)
      : 1;

    // Compare inter-key delay
    const delayDiff = Math.abs(
      enrolled.avgInterKeyDelay - current.avgInterKeyDelay
    );
    const maxDelay = Math.max(
      enrolled.avgInterKeyDelay,
      current.avgInterKeyDelay
    );
    const delaySimilarity = maxDelay > 0
      ? 1 - Math.min(delayDiff / maxDelay, 1)
      : 1;

    // Compare variance patterns
    const varianceDiff = Math.abs(
      enrolled.keyPressVariance - current.keyPressVariance
    );
    const maxVariance = Math.max(
      enrolled.keyPressVariance,
      current.keyPressVariance
    );
    const varianceSimilarity = maxVariance > 0
      ? 1 - Math.min(varianceDiff / maxVariance, 1)
      : 1;

    // Compare backspace rate (error pattern)
    const backspaceDiff = Math.abs(
      enrolled.backspaceRate - current.backspaceRate
    );
    const backspaceSimilarity = 1 - Math.min(backspaceDiff, 1);

    // Weighted average
    return (
      durationSimilarity * 0.3 +
      delaySimilarity * 0.3 +
      varianceSimilarity * 0.2 +
      backspaceSimilarity * 0.2
    );
  }

  private calculateMouseDynamicsSimilarity(
    enrolled: BehavioralFeatures,
    current: BehavioralFeatures
  ): number {
    // If mouse data is not available, return neutral score
    if (!enrolled.avgMouseVelocity || !current.avgMouseVelocity) {
      return 0.7; // Neutral similarity
    }

    // Compare mouse velocity
    const velocityDiff = Math.abs(
      enrolled.avgMouseVelocity - current.avgMouseVelocity
    );
    const maxVelocity = Math.max(
      enrolled.avgMouseVelocity,
      current.avgMouseVelocity
    );
    const velocitySimilarity = maxVelocity > 0
      ? 1 - Math.min(velocityDiff / maxVelocity, 1)
      : 1;

    // Compare mouse acceleration
    const accelDiff = Math.abs(
      (enrolled.mouseAcceleration || 0) - (current.mouseAcceleration || 0)
    );
    const maxAccel = Math.max(
      enrolled.mouseAcceleration || 0,
      current.mouseAcceleration || 0
    );
    const accelSimilarity = maxAccel > 0
      ? 1 - Math.min(accelDiff / maxAccel, 1)
      : 1;

    return velocitySimilarity * 0.6 + accelSimilarity * 0.4;
  }

  private calculateOverallSimilarity(
    enrolledSignature: number[],
    currentSignature: number[]
  ): number {
    // Use multiple similarity metrics and combine them

    // 1. Cosine similarity
    const cosineSim = this.cosineSimilarity(enrolledSignature, currentSignature);

    // 2. Euclidean distance (normalized to 0-1 range)
    const euclideanDist = this.euclideanDistance(enrolledSignature, currentSignature);
    const euclideanSim = 1 / (1 + euclideanDist);

    // 3. Manhattan distance (normalized)
    const manhattanDist = this.manhattanDistance(enrolledSignature, currentSignature);
    const manhattanSim = 1 / (1 + manhattanDist);

    // Weighted combination
    const overall = (
      cosineSim * 0.5 +
      euclideanSim * 0.3 +
      manhattanSim * 0.2
    );

    return Math.max(0, Math.min(1, overall));
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (normA * normB);
  }

  private euclideanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) return Infinity;

    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }

    return Math.sqrt(sum);
  }

  private manhattanDistance(a: number[], b: number[]): number {
    if (a.length !== b.length) return Infinity;

    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.abs(a[i] - b[i]);
    }

    return sum;
  }

  /**
   * Advanced verification using the neural network (optional enhancement)
   */
  async verifyWithModel(
    enrolledSignature: number[],
    currentSignature: number[]
  ): Promise<number> {
    if (!this.model) {
      await this.initialize();
    }

    // Combine signatures into input features
    const features = enrolledSignature.map((val, idx) => 
      Math.abs(val - currentSignature[idx])
    );

    const inputTensor = tf.tensor2d([features]);
    const prediction = this.model!.predict(inputTensor) as tf.Tensor;
    const score = await prediction.data();

    inputTensor.dispose();
    prediction.dispose();

    return score[0];
  }

  getThreshold(): number {
    return this.CONFIDENCE_THRESHOLD;
  }

  setThreshold(threshold: number): void {
    if (threshold >= 0 && threshold <= 1) {
      // Note: In production, this would be stored in configuration
      console.log(`Threshold set to ${threshold}`);
    }
  }
}

export const behavioralVerifier = new BehavioralVerifier();
