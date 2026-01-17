/**
 * Local Storage Utility for Standalone Mode
 * This allows the app to work without Firebase by storing data in browser localStorage
 */

import { BehavioralFeatures, AttendanceRecord } from '@/types';

const STORAGE_KEYS = {
  PROFILE: 'bbas_behavioral_profile',
  ATTENDANCE: 'bbas_attendance_records',
  USER: 'bbas_current_user',
};

export class LocalStorageService {
  /**
   * Save behavioral profile to localStorage
   */
  static saveProfile(userId: string, features: BehavioralFeatures): void {
    try {
      const profile = {
        userId,
        features,
        enrolledAt: new Date().toISOString(),
        sampleCount: 1,
      };
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      console.log('✅ Profile saved to localStorage');
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  }

  /**
   * Get behavioral profile from localStorage
   */
  static getProfile(userId: string): BehavioralFeatures | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (!stored) {
        console.log('❌ No profile found in localStorage');
        return null;
      }

      const profile = JSON.parse(stored);
      if (profile.userId === userId) {
        console.log('✅ Profile loaded from localStorage');
        return profile.features;
      }
      
      console.log('❌ Profile userId mismatch');
      return null;
    } catch (error) {
      console.error('Failed to load profile:', error);
      return null;
    }
  }

  /**
   * Check if user has enrolled
   */
  static hasProfile(userId: string): boolean {
    const profile = this.getProfile(userId);
    return profile !== null;
  }

  /**
   * Save attendance record
   */
  static saveAttendance(record: Omit<AttendanceRecord, 'id'>): void {
    try {
      const records = this.getAttendanceRecords();
      const newRecord = {
        ...record,
        id: Date.now().toString(),
      };
      records.push(newRecord);
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(records));
      console.log('✅ Attendance record saved');
    } catch (error) {
      console.error('Failed to save attendance:', error);
    }
  }

  /**
   * Get all attendance records
   */
  static getAttendanceRecords(): AttendanceRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ATTENDANCE);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load attendance records:', error);
      return [];
    }
  }

  /**
   * Clear all data (for testing)
   */
  static clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.USER);
    console.log('✅ All data cleared');
  }

  /**
   * Set current user (for standalone mode without auth)
   */
  static setCurrentUser(userId: string, name: string): void {
    const user = { userId, name };
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  /**
   * Get current user
   */
  static getCurrentUser(): { userId: string; name: string } | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }
}

// For browser console debugging
if (typeof window !== 'undefined') {
  (window as any).BBASStorage = LocalStorageService;
  console.log('💡 Debug: Type BBASStorage.clearAll() in console to reset data');
}
