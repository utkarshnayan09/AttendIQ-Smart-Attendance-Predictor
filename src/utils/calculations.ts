/**
 * AttendIQ - Attendance Calculation Logic
 * 
 * This module contains all attendance calculation functions.
 * These are separated from UI components so they can eventually
 * be replaced with C++ backend API calls.
 */

import type { Subject, PredictionResult } from '../types';

/**
 * Calculate attendance percentage for a subject.
 * Returns 0 if totalClasses is 0 to avoid division by zero.
 */
export function calculateAttendancePercentage(attended: number, total: number): number {
  if (total <= 0) return 0;
  return (attended / total) * 100;
}

/**
 * Calculate predicted attendance after upcoming classes.
 */
export function calculatePredictedAttendance(
  currentAttended: number,
  currentTotal: number,
  upcomingClasses: number,
  plannedAttendance: number
): number {
  const newTotal = currentTotal + upcomingClasses;
  if (newTotal <= 0) return 0;
  const newAttended = currentAttended + plannedAttendance;
  return (newAttended / newTotal) * 100;
}

/**
 * Calculate how many consecutive classes need to be attended
 * to reach the target attendance percentage (default 75%).
 * Returns 0 if already at or above target.
 */
export function calculateClassesNeededForTarget(
  attended: number,
  total: number,
  target: number = 75
): number {
  if (total <= 0) return 0;
  const currentPercentage = (attended / total) * 100;
  if (currentPercentage >= target) return 0;

  // We need: (attended + x) / (total + x) >= target / 100
  // attended + x >= (target / 100) * (total + x)
  // attended + x >= (target * total / 100) + (target * x / 100)
  // x - (target * x / 100) >= (target * total / 100) - attended
  // x * (1 - target / 100) >= (target * total / 100) - attended
  // x >= ((target * total / 100) - attended) / (1 - target / 100)

  const targetFraction = target / 100;
  const numerator = targetFraction * total - attended;
  const denominator = 1 - targetFraction;

  if (denominator <= 0) return Infinity;

  const classesNeeded = Math.ceil(numerator / denominator);
  return Math.max(0, classesNeeded);
}

/**
 * Calculate maximum classes that can be missed while maintaining
 * at least the target attendance percentage.
 * Considers upcoming classes that haven't happened yet.
 */
export function calculateClassesCanMiss(
  attended: number,
  total: number,
  upcomingClasses: number,
  target: number = 75
): number {
  if (total + upcomingClasses <= 0) return 0;

  // If we attend 'attended' out of 'total + upcomingClasses - x' wait, 
  // Actually: if we miss x out of upcoming classes:
  // (attended + (upcomingClasses - x)) / (total + upcomingClasses) >= target/100
  // attended + upcomingClasses - x >= target * (total + upcomingClasses) / 100
  // x <= attended + upcomingClasses - target * (total + upcomingClasses) / 100

  const targetFraction = target / 100;
  const totalAfter = total + upcomingClasses;
  const maxMiss = attended + upcomingClasses - targetFraction * totalAfter;

  return Math.max(0, Math.floor(maxMiss));
}

/**
 * Get attendance status based on percentage and target.
 */
export function getAttendanceStatus(percentage: number, target: number = 75): 'safe' | 'warning' | 'danger' {
  if (percentage >= target) return 'safe';
  if (percentage >= target - 10) return 'warning';
  return 'danger';
}

/**
 * Full prediction calculation for a subject.
 */
export function calculatePrediction(
  subject: Subject,
  upcomingClasses: number,
  plannedAttendance: number,
  target: number = 75
): PredictionResult {
  const currentPercentage = calculateAttendancePercentage(
    subject.attendedClasses,
    subject.totalClasses
  );

  const predictedPercentage = calculatePredictedAttendance(
    subject.attendedClasses,
    subject.totalClasses,
    upcomingClasses,
    plannedAttendance
  );

  const classesNeededFor75 = calculateClassesNeededForTarget(
    subject.attendedClasses,
    subject.totalClasses,
    target
  );

  const classesCanMiss = calculateClassesCanMiss(
    subject.attendedClasses,
    subject.totalClasses,
    upcomingClasses,
    target
  );

  return {
    currentPercentage,
    predictedPercentage,
    classesNeededFor75,
    classesCanMiss,
    currentStatus: getAttendanceStatus(currentPercentage, target),
    predictedStatus: getAttendanceStatus(predictedPercentage, target),
  };
}

/**
 * Calculate overall attendance across all subjects.
 */
export function calculateOverallAttendance(subjects: Subject[]): {
  totalAttended: number;
  totalConducted: number;
  percentage: number;
} {
  const totalAttended = subjects.reduce((sum, s) => sum + s.attendedClasses, 0);
  const totalConducted = subjects.reduce((sum, s) => sum + s.totalClasses, 0);
  const percentage = calculateAttendancePercentage(totalAttended, totalConducted);

  return { totalAttended, totalConducted, percentage };
}
