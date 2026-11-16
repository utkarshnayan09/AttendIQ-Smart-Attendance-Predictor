import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Eye, EyeOff, Mail, Lock, User, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import StarfieldBackground from '../components/StarfieldBackground';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, addNotification } = useApp();

  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setErrors({});
    setConfirmPassword('');
  };

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (mode === 'register') {
      if (!name.trim()) {
        newErrors.name = 'Full name is required';
      }
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'register') {
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Confirm password is required';
      } else if (confirmPassword !== password) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        const res = register(name, email, password);
        if (res.success) {
          addNotification('success', `Welcome ${name.trim()}! Account created successfully.`);
          navigate('/dashboard');
        } else {
          setErrors({ general: res.error || 'Registration failed.' });
        }
      } else {
        const res = login(email, password);
        if (res.success) {
          addNotification('success', 'Welcome back! Signed in successfully.');
          navigate('/dashboard');
        } else {
          setErrors({ general: res.error || 'Invalid email or password.' });
        }
      }
    } catch {
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-dark-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Starfield in Motion */}
      <StarfieldBackground />

      {/* Subtle ambient gradient blobs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-accent-blue/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-purple/15 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-accent-blue/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-[420px] glass-card p-6 sm:p-8 relative z-10 animate-fade-in shadow-2xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-accent-blue to-accent-purple flex items-center justify-center shadow-lg shadow-accent-blue/25 mb-3">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AttendIQ</h1>
          <p className="text-xs text-dark-400 mt-1">
            {mode === 'register'
              ? 'Create your personal account to track attendance'
              : 'Sign in to access your personal dashboard'}
          </p>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-dark-900/90 p-1 rounded-xl border border-dark-700/60 mb-6">
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-dark-800 text-white shadow-sm border border-dark-600/50'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Create Account
          </button>
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-dark-800 text-white shadow-sm border border-dark-600/50'
                : 'text-dark-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>
        </div>

        {/* General Error Message */}
        {errors.general && (
          <div className="mb-4 p-3 rounded-lg bg-accent-red/10 border border-accent-red/20 text-accent-red text-xs flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errors.general}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Name Field (Register only) */}
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-medium text-dark-300">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. Alex Sharma"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  className={`w-full bg-dark-800 border ${
                    errors.name
                      ? 'border-accent-red focus:border-accent-red focus:ring-accent-red'
                      : 'border-dark-600 focus:border-accent-blue focus:ring-accent-blue'
                  } rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-1 transition-colors`}
                />
              </div>
              {errors.name && <p className="text-xs text-accent-red animate-fade-in">{errors.name}</p>}
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-medium text-dark-300">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="student@srm.edu"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`w-full bg-dark-800 border ${
                  errors.email
                    ? 'border-accent-red focus:border-accent-red focus:ring-accent-red'
                    : 'border-dark-600 focus:border-accent-blue focus:ring-accent-blue'
                } rounded-lg pl-10 pr-3 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-1 transition-colors`}
              />
            </div>
            {errors.email && <p className="text-xs text-accent-red animate-fade-in">{errors.email}</p>}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-medium text-dark-300">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                className={`w-full bg-dark-800 border ${
                  errors.password
                    ? 'border-accent-red focus:border-accent-red focus:ring-accent-red'
                    : 'border-dark-600 focus:border-accent-blue focus:ring-accent-blue'
                } rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-1 transition-colors`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-400 hover:text-white transition-colors cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-accent-red animate-fade-in">{errors.password}</p>}
          </div>

          {/* Confirm Password Field (Register only) */}
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-dark-300">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-dark-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword)
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }}
                  className={`w-full bg-dark-800 border ${
                    errors.confirmPassword
                      ? 'border-accent-red focus:border-accent-red focus:ring-accent-red'
                      : 'border-dark-600 focus:border-accent-blue focus:ring-accent-blue'
                  } rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-dark-500 focus:outline-none focus:ring-1 transition-colors`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-dark-400 hover:text-white transition-colors cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-accent-red animate-fade-in">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-primary py-2.5 text-sm font-semibold shadow-lg shadow-accent-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? 'Processing...'
                : mode === 'register'
                ? 'Create My Account'
                : 'Sign In to My Dashboard'}
            </button>
          </div>
        </form>

        {/* Bottom Switch Link */}
        <div className="text-center mt-5 pt-4 border-t border-dark-800">
          <p className="text-xs text-dark-400">
            {mode === 'register' ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={() => switchMode(mode === 'register' ? 'login' : 'register')}
              className="text-accent-blue hover:underline font-semibold cursor-pointer"
            >
              {mode === 'register' ? 'Sign In here' : 'Create an Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
