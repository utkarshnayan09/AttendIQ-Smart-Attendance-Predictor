export interface Subject {
  id: string;
  name: string;
  totalClasses: number;
  attendedClasses: number;
  createdAt: string;
  updatedAt: string;
}

export interface PredictionInput {
  subjectId: string;
  upcomingClasses: number;
  plannedAttendance: number;
}

export interface PredictionResult {
  currentPercentage: number;
  predictedPercentage: number;
  classesNeededFor75: number;
  classesCanMiss: number;
  currentStatus: 'safe' | 'warning' | 'danger';
  predictedStatus: 'safe' | 'warning' | 'danger';
}

export interface AttendanceRecord {
  date: string;
  subjectId: string;
  attended: boolean;
}

export interface UserSettings {
  name: string;
  email: string;
  attendanceTarget: number;
  theme: 'dark' | 'light';
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

export interface AppState {
  subjects: Subject[];
  settings: UserSettings;
  isAuthenticated: boolean;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}
