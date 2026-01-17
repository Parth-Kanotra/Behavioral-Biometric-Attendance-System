// Core Types
export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'faculty';
  createdAt: Date;
}

export interface BehavioralProfile {
  userId: string;
  features: BehavioralFeatures;
  enrolledAt: Date;
  sampleCount: number;
}

export interface BehavioralFeatures {
  // Typing dynamics
  avgKeyPressDuration: number;
  avgInterKeyDelay: number;
  keyPressVariance: number;
  interKeyVariance: number;
  
  // Rhythm patterns
  rhythmPattern: number[];
  burstTypingRate: number;
  pauseFrequency: number;
  
  // Error patterns
  backspaceRate: number;
  correctionTiming: number[];
  
  // Mouse/Touch dynamics
  avgMouseVelocity?: number;
  mouseAcceleration?: number;
  touchPressure?: number[];
  
  // Behavioral signature (normalized feature vector)
  signature: number[];
}

export interface InteractionData {
  timestamp: number;
  eventType: 'keydown' | 'keyup' | 'mousemove' | 'touchmove';
  key?: string;
  duration?: number;
  mouseX?: number;
  mouseY?: number;
  velocity?: number;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  studentName: string;
  timestamp: Date;
  confidenceScore: number;
  status: 'approved' | 'rejected' | 'flagged';
  courseId?: string;
  sessionId?: string;
  features: BehavioralFeatures;
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  courseName: string;
  facultyId: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  attendanceCount: number;
}

export interface VerificationResult {
  isMatch: boolean;
  confidenceScore: number;
  similarityMetrics: {
    typingRhythm: number;
    keyDynamics: number;
    mouseDynamics: number;
    overall: number;
  };
  timestamp: Date;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  students: string[];
}

// Component Props Types
export interface ProgressIndicatorProps {
  progress: number;
  total: number;
  label?: string;
}

export interface ConfidenceScoreProps {
  score: number;
  threshold?: number;
  animated?: boolean;
}

export interface AttendanceChartProps {
  data: AttendanceRecord[];
  timeRange?: 'week' | 'month' | 'semester';
}
