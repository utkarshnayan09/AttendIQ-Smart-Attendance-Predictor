import { useState } from 'react';
import {
  Settings,
  User,
  Target,
  Palette,
  RotateCcw,
  Save,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SettingsPage() {
  const { settings, updateSettings, resetData, addNotification } = useApp();
  const [name, setName] = useState(settings.name);
  const [email, setEmail] = useState(settings.email);
  const [target, setTarget] = useState(settings.attendanceTarget.toString());
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfile = () => {
    if (!name.trim()) {
      addNotification('error', 'Name cannot be empty.');
      return;
    }
    updateSettings({ name: name.trim(), email: email.trim() });
    addNotification('success', 'Profile updated successfully!');
  };

  const handleSaveTarget = () => {
    const targetNum = parseFloat(target);
    if (isNaN(targetNum) || targetNum < 1 || targetNum > 100) {
      addNotification('error', 'Target must be between 1 and 100.');
      return;
    }
    updateSettings({ attendanceTarget: targetNum });
    addNotification('success', `Attendance target updated to ${targetNum}%.`);
  };

  const handleReset = () => {
    resetData();
    setName('Student');
    setEmail('student@attendiq.demo');
    setTarget('75');
    setShowResetConfirm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-accent-blue" />
          Settings
        </h1>
        <p className="text-dark-400 mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <User className="w-5 h-5 text-accent-blue" />
          <h2 className="text-lg font-semibold text-white">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-dark-300 mb-1.5 block">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all"
            />
          </div>
          <div>
            <label className="text-sm text-dark-300 mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all"
            />
          </div>
          <button onClick={handleSaveProfile} className="btn-primary">
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        </div>
      </div>

      {/* Attendance Target */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Target className="w-5 h-5 text-accent-purple" />
          <h2 className="text-lg font-semibold text-white">Attendance Target</h2>
        </div>
        <p className="text-dark-400 text-sm mb-4">
          Set the minimum attendance percentage you want to maintain. Subjects below this
          threshold will be marked as "At Risk".
        </p>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-[200px]">
            <input
              type="number"
              min="1"
              max="100"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-blue/50 focus:border-accent-blue transition-all pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 text-sm">%</span>
          </div>
          <button onClick={handleSaveTarget} className="btn-primary">
            <Check className="w-4 h-4" />
            Update
          </button>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${settings.attendanceTarget <= 75 ? 'bg-accent-green' : 'bg-accent-amber'}`} />
          <span className="text-dark-400 text-xs">
            Current target: {settings.attendanceTarget}%
          </span>
        </div>
      </div>

      {/* Theme */}
      <div className="glass-card p-6">
        <div className="flex items-center gap-2 mb-5">
          <Palette className="w-5 h-5 text-accent-amber" />
          <h2 className="text-lg font-semibold text-white">Theme</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              updateSettings({ theme: 'dark' });
              addNotification('info', 'Dark theme is active.');
            }}
            className={`flex items-center gap-3 p-4 rounded-xl border transition-all flex-1 ${
              settings.theme === 'dark'
                ? 'border-accent-blue/50 bg-accent-blue/10'
                : 'border-dark-700 bg-dark-800 hover:border-dark-500'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-dark-950 border border-dark-600" />
            <div className="text-left">
              <p className="text-white text-sm font-medium">Dark</p>
              <p className="text-dark-400 text-xs">Navy dark theme</p>
            </div>
          </button>
          <button
            onClick={() => {
              addNotification('info', 'Light theme coming soon!');
            }}
            className="flex items-center gap-3 p-4 rounded-xl border border-dark-700 bg-dark-800 hover:border-dark-500 transition-all flex-1 opacity-60"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-dark-300" />
            <div className="text-left">
              <p className="text-white text-sm font-medium">Light</p>
              <p className="text-dark-400 text-xs">Coming soon</p>
            </div>
          </button>
        </div>
      </div>

      {/* Reset Data */}
      <div className="glass-card p-6 border-accent-red/10">
        <div className="flex items-center gap-2 mb-5">
          <RotateCcw className="w-5 h-5 text-accent-red" />
          <h2 className="text-lg font-semibold text-white">Reset Data</h2>
        </div>
        <p className="text-dark-400 text-sm mb-4">
          Reset all subjects and settings back to the default demo data. This cannot be undone.
        </p>

        {showResetConfirm ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-accent-red/5 border border-accent-red/20">
            <p className="text-accent-red text-sm flex-1">Are you sure you want to reset all data?</p>
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-accent-red text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
            >
              Yes, Reset
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              className="px-4 py-2 bg-dark-700 text-white text-sm font-medium rounded-lg hover:bg-dark-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-4 py-2.5 bg-accent-red/10 text-accent-red text-sm font-medium rounded-xl border border-accent-red/20 hover:bg-accent-red/20 transition-all"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Reset All Data
          </button>
        )}
      </div>

      {/* Info */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-3">About AttendIQ</h2>
        <div className="space-y-2 text-dark-400 text-sm">
          <p><span className="text-dark-300 font-medium">Version:</span> 1.0.0 (Frontend Demo)</p>
          <p><span className="text-dark-300 font-medium">Project:</span> B.Tech CSE – Smart Attendance Predictor</p>
          <p><span className="text-dark-300 font-medium">Backend:</span> C++ (Integration Pending)</p>
          <p><span className="text-dark-300 font-medium">Frontend:</span> React + TypeScript + Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
}
