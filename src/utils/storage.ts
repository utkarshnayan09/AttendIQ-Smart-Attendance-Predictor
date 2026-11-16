/**
 * AttendIQ - Multi-User Storage & Authentication Layer
 * 
 * Handles user accounts and stores subjects & settings per user ID:
 * - attendiq_users: List of registered accounts
 * - attendiq_current_user: Active logged-in user
 * - attendiq_subjects_<userId>: Isolated subjects list for each user
 * - attendiq_settings_<userId>: Isolated settings for each user
 */

import type { Subject, UserSettings, UserAccount } from '../types';

const STORAGE_KEYS = {
  USERS: 'attendiq_users',
  CURRENT_USER: 'attendiq_current_user',
} as const;

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/**
 * Get all registered accounts
 */
export function getUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save user accounts
 */
function saveUsers(users: UserAccount[]): void {
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

/**
 * Get currently authenticated user account
 */
export function getCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Register a brand new user account
 * Returns error message if registration fails, or null on success
 */
export function registerUser(name: string, email: string, password: string): { success: boolean; error?: string; user?: UserAccount } {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName) return { success: false, error: 'Full name is required.' };
  if (!cleanEmail || !cleanEmail.includes('@')) return { success: false, error: 'Valid email is required.' };
  if (!password || password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

  const users = getUsers();
  const exists = users.some(u => u.email.toLowerCase() === cleanEmail);
  if (exists) {
    return { success: false, error: 'An account with this email already exists. Please Sign In.' };
  }

  const newUser: UserAccount = {
    id: generateId(),
    name: cleanName,
    email: cleanEmail,
    passwordHash: password, // In client-side prototype; replace with hashed token in production
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Automatically log in the new user
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));

  // Initialize their isolated settings and clean empty subjects
  saveSettingsForUser(newUser.id, {
    name: cleanName,
    email: cleanEmail,
    attendanceTarget: 75,
    theme: 'dark',
  });
  saveSubjectsForUser(newUser.id, []);

  return { success: true, user: newUser };
}

/**
 * Login existing registered user
 */
export function loginUser(email: string, password: string): { success: boolean; error?: string; user?: UserAccount } {
  const cleanEmail = email.trim().toLowerCase();
  const users = getUsers();

  if (users.length === 0) {
    return {
      success: false,
      error: 'No registered accounts found. Please click "Register" to create an account first.',
    };
  }

  const user = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return {
      success: false,
      error: 'No account found with this email. Please register first.',
    };
  }

  if (user.passwordHash !== password) {
    return {
      success: false,
      error: 'Incorrect password. Please try again.',
    };
  }

  // Set active user
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  return { success: true, user };
}

/**
 * Logout
 */
export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

// ----------------- Per-User Subjects Storage -----------------

function getSubjectsKey(userId: string): string {
  return `attendiq_subjects_${userId}`;
}

export function getSubjectsForUser(userId: string): Subject[] {
  try {
    const data = localStorage.getItem(getSubjectsKey(userId));
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch {
    return [];
  }
}

export function saveSubjectsForUser(userId: string, subjects: Subject[]): void {
  localStorage.setItem(getSubjectsKey(userId), JSON.stringify(subjects));
}

export function addSubjectForUser(userId: string, subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>): Subject {
  const subjects = getSubjectsForUser(userId);
  const newSubject: Subject = {
    ...subject,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  subjects.push(newSubject);
  saveSubjectsForUser(userId, subjects);
  return newSubject;
}

export function bulkAddSubjectsForUser(
  userId: string,
  newSubjects: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>[],
  replaceExisting: boolean = false
): Subject[] {
  const existing = replaceExisting ? [] : getSubjectsForUser(userId);
  const created: Subject[] = newSubjects.map((s) => ({
    ...s,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
  const updatedList = [...existing, ...created];
  saveSubjectsForUser(userId, updatedList);
  return updatedList;
}

export function updateSubjectForUser(userId: string, subjectId: string, updates: Partial<Subject>): Subject | null {
  const subjects = getSubjectsForUser(userId);
  const index = subjects.findIndex(s => s.id === subjectId);
  if (index === -1) return null;

  subjects[index] = {
    ...subjects[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  saveSubjectsForUser(userId, subjects);
  return subjects[index];
}

export function deleteSubjectForUser(userId: string, subjectId: string): boolean {
  const subjects = getSubjectsForUser(userId);
  const filtered = subjects.filter(s => s.id !== subjectId);
  if (filtered.length === subjects.length) return false;
  saveSubjectsForUser(userId, filtered);
  return true;
}

// ----------------- Per-User Settings Storage -----------------

function getSettingsKey(userId: string): string {
  return `attendiq_settings_${userId}`;
}

export function getSettingsForUser(userId: string, fallbackUser?: UserAccount | null): UserSettings {
  try {
    const data = localStorage.getItem(getSettingsKey(userId));
    if (data) {
      return JSON.parse(data);
    }
    const defaultSettings: UserSettings = {
      name: fallbackUser?.name || 'Student',
      email: fallbackUser?.email || '',
      attendanceTarget: 75,
      theme: 'dark',
    };
    saveSettingsForUser(userId, defaultSettings);
    return defaultSettings;
  } catch {
    return {
      name: fallbackUser?.name || 'Student',
      email: fallbackUser?.email || '',
      attendanceTarget: 75,
      theme: 'dark',
    };
  }
}

export function saveSettingsForUser(userId: string, settings: UserSettings): void {
  localStorage.setItem(getSettingsKey(userId), JSON.stringify(settings));
}

/**
 * Reset all data for current active user
 */
export function resetCurrentUserData(userId: string): void {
  localStorage.removeItem(getSubjectsKey(userId));
  localStorage.removeItem(getSettingsKey(userId));
}
