import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Subject, UserSettings, UserAccount, Notification } from '../types';
import * as storage from '../utils/storage';

interface AppContextType {
  // Current user
  currentUser: UserAccount | null;

  // Subjects (isolated to current user)
  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => void;
  bulkAddSubjects: (subjects: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>[], replaceExisting?: boolean) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  refreshSubjects: () => void;

  // Settings (isolated to current user)
  settings: UserSettings;
  updateSettings: (settings: Partial<UserSettings>) => void;

  // Auth & Account Creation
  isAuthenticated: boolean;
  register: (name: string, email: string, password: string) => { success: boolean; error?: string };
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;

  // Notifications
  notifications: Notification[];
  addNotification: (type: Notification['type'], message: string) => void;
  removeNotification: (id: string) => void;

  // Reset
  resetData: () => void;
}

const defaultSettings: UserSettings = {
  name: 'Student',
  email: '',
  attendanceTarget: 75,
  theme: 'dark',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(storage.getCurrentUser());
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Sync state whenever currentUser changes
  useEffect(() => {
    if (currentUser) {
      setSubjects(storage.getSubjectsForUser(currentUser.id));
      setSettings(storage.getSettingsForUser(currentUser.id, currentUser));
    } else {
      setSubjects([]);
      setSettings(defaultSettings);
    }
  }, [currentUser]);

  const refreshSubjects = useCallback(() => {
    if (currentUser) {
      setSubjects(storage.getSubjectsForUser(currentUser.id));
    }
  }, [currentUser]);

  const handleAddSubject = useCallback((subject: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!currentUser) return;
    storage.addSubjectForUser(currentUser.id, subject);
    setSubjects(storage.getSubjectsForUser(currentUser.id));
  }, [currentUser]);

  const handleBulkAddSubjects = useCallback(
    (newSubjects: Omit<Subject, 'id' | 'createdAt' | 'updatedAt'>[], replaceExisting: boolean = false) => {
      if (!currentUser) return;
      const updated = storage.bulkAddSubjectsForUser(currentUser.id, newSubjects, replaceExisting);
      setSubjects(updated);
    },
    [currentUser]
  );

  const handleUpdateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    if (!currentUser) return;
    storage.updateSubjectForUser(currentUser.id, id, updates);
    setSubjects(storage.getSubjectsForUser(currentUser.id));
  }, [currentUser]);

  const handleDeleteSubject = useCallback((id: string) => {
    if (!currentUser) return;
    storage.deleteSubjectForUser(currentUser.id, id);
    setSubjects(storage.getSubjectsForUser(currentUser.id));
  }, [currentUser]);

  const handleUpdateSettings = useCallback((updates: Partial<UserSettings>) => {
    if (!currentUser) return;
    const newSettings = { ...settings, ...updates };
    storage.saveSettingsForUser(currentUser.id, newSettings);
    setSettings(newSettings);
  }, [currentUser, settings]);

  const handleRegister = useCallback((name: string, email: string, password: string) => {
    const res = storage.registerUser(name, email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setSubjects([]);
      setSettings(storage.getSettingsForUser(res.user.id, res.user));
    }
    return res;
  }, []);

  const handleLogin = useCallback((email: string, password: string) => {
    const res = storage.loginUser(email, password);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setSubjects(storage.getSubjectsForUser(res.user.id));
      setSettings(storage.getSettingsForUser(res.user.id, res.user));
    }
    return res;
  }, []);

  const handleLogout = useCallback(() => {
    storage.logout();
    setCurrentUser(null);
    setSubjects([]);
    setSettings(defaultSettings);
  }, []);

  const addNotification = useCallback((type: Notification['type'], message: string) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substring(2);
    const notification: Notification = { id, type, message };
    setNotifications(prev => [...prev, notification]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const resetData = useCallback(() => {
    if (!currentUser) return;
    storage.resetCurrentUserData(currentUser.id);
    setSubjects(storage.getSubjectsForUser(currentUser.id));
    setSettings(storage.getSettingsForUser(currentUser.id, currentUser));
    addNotification('success', 'Your attendance data has been reset.');
  }, [currentUser, addNotification]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        subjects,
        addSubject: handleAddSubject,
        bulkAddSubjects: handleBulkAddSubjects,
        updateSubject: handleUpdateSubject,
        deleteSubject: handleDeleteSubject,
        refreshSubjects,
        settings,
        updateSettings: handleUpdateSettings,
        isAuthenticated: currentUser !== null,
        register: handleRegister,
        login: handleLogin,
        logout: handleLogout,
        notifications,
        addNotification,
        removeNotification,
        resetData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
