import { useState, useMemo, useEffect } from 'react';
import {
  Calculator,
  TrendingUp,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Percent,
  BookOpen,
  Calendar,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { calculatePrediction, calculateAttendancePercentage } from '../utils/calculations';
import type { Subject } from '../types';

interface CircularProgressProps {
  percentage: number;
  label: string;
  sublabel?: string;
  status: 'safe' | 'warning' | 'danger';
  size?: number;
}

function CircularProgress({
  percentage,
  label,
  sublabel,
  status,
  size = 180,
}: CircularProgressProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, isNaN(percentage) ? 0 : percentage));
  const offset = circumference - (clamped / 100) * circumference;

  const colorConfig = {
    safe: {
      stroke: '#22c55e',
      text: 'text-accent-green',
      badge: 'bg-accent-green/10 text-accent-green border-accent-green/30',
      label: 'Safe (≥75%)',
    },
    warning: {
      stroke: '#f59e0b',
      text: 'text-accent-amber',
      badge: 'bg-accent-amber/10 text-accent-amber border-accent-amber/30',
      label: 'Warning (65-74%)',
    },
    danger: {
      stroke: '#ef4444',
      text: 'text-accent-red',
      badge: 'bg-accent-red/10 text-accent-red border-accent-red/30',
      label: 'Danger (<65%)',
    },
  }[status];

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Foreground progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colorConfig.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
            style={{
              filter: `drop-shadow(0 0 8px ${colorConfig.stroke}44)`,
            }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {percentage.toFixed(1)}%
          </span>
          <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorConfig.badge}`}>
            {colorConfig.label}
          </span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <h4 className="text-sm font-semibold text-white">{label}</h4>
        {sublabel && <p className="text-xs text-dark-400 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}

export default function PredictorPage() {
  const { subjects, settings } = useApp();
  const target = settings?.attendanceTarget || 75;

  // Selected subject or 'custom'
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  // Form input states
  const [totalClasses, setTotalClasses] = useState<string>('30');
  const [attendedClasses, setAttendedClasses] = useState<string>('24');
  const [upcomingClasses, setUpcomingClasses] = useState<string>('10');
  const [plannedAttendance, setPlannedAttendance] = useState<string>('8');

  // Animation trigger for calculate button
  const [isCalculated, setIsCalculated] = useState<boolean>(true);

  // Initialize with first subject from context if available
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubjectId) {
      const firstSubject = subjects[0];
      setSelectedSubjectId(firstSubject.id);
      setTotalClasses(String(firstSubject.totalClasses));
      setAttendedClasses(String(firstSubject.attendedClasses));
      setUpcomingClasses('10');
      setPlannedAttendance('8');
    }
  }, [subjects, selectedSubjectId]);

  // Handle subject change from dropdown
  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);

    if (subjectId === 'custom') {
      // Keep existing values or provide reasonable custom defaults
      return;
    }

    const found = subjects.find((s) => s.id === subjectId);
    if (found) {
      setTotalClasses(String(found.totalClasses));
      setAttendedClasses(String(found.attendedClasses));
      // Keep upcoming classes or default to 10
      if (!upcomingClasses || Number(upcomingClasses) === 0) {
        setUpcomingClasses('10');
        setPlannedAttendance('8');
      } else {
        const up = Number(upcomingClasses);
        const plan = Number(plannedAttendance);
        if (plan > up) {
          setPlannedAttendance(String(up));
        }
      }
    }
  };

  // Selected subject metadata
  const currentSubjectObj = useMemo(() => {
    return subjects.find((s) => s.id === selectedSubjectId) || null;
  }, [subjects, selectedSubjectId]);

  // Validation rules
  const validation = useMemo(() => {
    const errors: {
      totalClasses?: string;
      attendedClasses?: string;
      upcomingClasses?: string;
      plannedAttendance?: string;
    } = {};

    const numTotal = Number(totalClasses);
    const numAttended = Number(attendedClasses);
    const numUpcoming = Number(upcomingClasses);
    const numPlanned = Number(plannedAttendance);

    // Validate totalClasses
    if (totalClasses.trim() === '' || isNaN(numTotal)) {
      errors.totalClasses = 'Classes conducted is required';
    } else if (!Number.isInteger(numTotal) || numTotal < 0) {
      errors.totalClasses = 'Must be a non-negative integer';
    }

    // Validate attendedClasses
    if (attendedClasses.trim() === '' || isNaN(numAttended)) {
      errors.attendedClasses = 'Attended classes is required';
    } else if (!Number.isInteger(numAttended) || numAttended < 0) {
      errors.attendedClasses = 'Must be a non-negative integer';
    } else if (!errors.totalClasses && numAttended > numTotal) {
      errors.attendedClasses = 'Cannot exceed total classes conducted';
    }

    // Validate upcomingClasses
    if (upcomingClasses.trim() === '' || isNaN(numUpcoming)) {
      errors.upcomingClasses = 'Upcoming classes is required';
    } else if (!Number.isInteger(numUpcoming) || numUpcoming < 0) {
      errors.upcomingClasses = 'Must be a non-negative integer';
    }

    // Validate plannedAttendance
    if (plannedAttendance.trim() === '' || isNaN(numPlanned)) {
      errors.plannedAttendance = 'Planned attendance is required';
    } else if (!Number.isInteger(numPlanned) || numPlanned < 0) {
      errors.plannedAttendance = 'Must be a non-negative integer';
    } else if (!errors.upcomingClasses && numPlanned > numUpcoming) {
      errors.plannedAttendance = 'Cannot exceed upcoming classes';
    }

    const isValid = Object.keys(errors).length === 0;

    return {
      isValid,
      errors,
      numTotal: isNaN(numTotal) ? 0 : numTotal,
      numAttended: isNaN(numAttended) ? 0 : numAttended,
      numUpcoming: isNaN(numUpcoming) ? 0 : numUpcoming,
      numPlanned: isNaN(numPlanned) ? 0 : numPlanned,
    };
  }, [totalClasses, attendedClasses, upcomingClasses, plannedAttendance]);

  // Auto-calculate prediction whenever valid inputs exist
  const prediction = useMemo(() => {
    if (!validation.isValid) return null;

    const subjectObj: Subject = {
      id: selectedSubjectId || 'custom',
      name: currentSubjectObj ? currentSubjectObj.name : 'Custom Subject',
      totalClasses: validation.numTotal,
      attendedClasses: validation.numAttended,
      createdAt: currentSubjectObj?.createdAt || new Date().toISOString(),
      updatedAt: currentSubjectObj?.updatedAt || new Date().toISOString(),
    };

    return calculatePrediction(
      subjectObj,
      validation.numUpcoming,
      validation.numPlanned,
      target
    );
  }, [validation, selectedSubjectId, currentSubjectObj, target]);

  // Percentage difference
  const percentageDiff = useMemo(() => {
    if (!prediction) return 0;
    return prediction.predictedPercentage - prediction.currentPercentage;
  }, [prediction]);

  // Quick preset helper
  const applyPreset = (fraction: number) => {
    const up = validation.numUpcoming || 0;
    const val = Math.round(up * fraction);
    setPlannedAttendance(String(val));
  };

  // Reset inputs to selected subject or defaults
  const handleReset = () => {
    if (currentSubjectObj) {
      setTotalClasses(String(currentSubjectObj.totalClasses));
      setAttendedClasses(String(currentSubjectObj.attendedClasses));
    } else {
      setTotalClasses('30');
      setAttendedClasses('24');
    }
    setUpcomingClasses('10');
    setPlannedAttendance('8');
  };

  const handleManualCalculate = () => {
    setIsCalculated(false);
    setTimeout(() => {
      setIsCalculated(true);
    }, 50);
  };

  // Recharts scenario data
  const scenarioData = useMemo(() => {
    if (!validation.isValid || !prediction) return [];

    const totalAfter = validation.numTotal + validation.numUpcoming;
    if (totalAfter <= 0) return [];

    const scenarios = [
      {
        name: 'Miss All (0%)',
        shortName: '0%',
        attended: validation.numAttended,
        percentage: Number(
          calculateAttendancePercentage(validation.numAttended, totalAfter).toFixed(1)
        ),
        isCurrentPlan: validation.numPlanned === 0,
      },
      {
        name: 'Half (50%)',
        shortName: '50%',
        attended: validation.numAttended + Math.round(validation.numUpcoming * 0.5),
        percentage: Number(
          calculateAttendancePercentage(
            validation.numAttended + Math.round(validation.numUpcoming * 0.5),
            totalAfter
          ).toFixed(1)
        ),
        isCurrentPlan:
          validation.numPlanned === Math.round(validation.numUpcoming * 0.5) &&
          validation.numPlanned !== 0 &&
          validation.numPlanned !== validation.numUpcoming,
      },
      {
        name: 'Your Plan',
        shortName: 'Plan',
        attended: validation.numAttended + validation.numPlanned,
        percentage: Number(prediction.predictedPercentage.toFixed(1)),
        isCurrentPlan: true,
      },
      {
        name: 'Attend All (100%)',
        shortName: '100%',
        attended: validation.numAttended + validation.numUpcoming,
        percentage: Number(
          calculateAttendancePercentage(
            validation.numAttended + validation.numUpcoming,
            totalAfter
          ).toFixed(1)
        ),
        isCurrentPlan: validation.numPlanned === validation.numUpcoming,
      },
    ];

    return scenarios;
  }, [validation, prediction]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-blue to-accent-purple flex items-center justify-center shadow-lg shadow-accent-blue/20">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Attendance Predictor</h1>
              <p className="text-dark-400 text-sm mt-0.5">
                Simulate upcoming classes and project your future attendance standing
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-dark-900/80 border border-dark-700/80 px-3.5 py-1.5 rounded-xl text-xs font-medium text-dark-300">
          <Target className="w-4 h-4 text-accent-blue" />
          <span>Attendance Target:</span>
          <span className="text-white font-semibold">{target}%</span>
        </div>
      </div>

      {/* Main Grid: Inputs Form & Interactive Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Prediction Parameters Card */}
        <div className="lg:col-span-5 glass-card p-6 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-dark-700/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-blue" />
                <h2 className="text-base font-semibold text-white">Prediction Parameters</h2>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="text-dark-400 hover:text-white transition-colors text-xs flex items-center gap-1"
                title="Reset to default values"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {/* Subject Selector */}
            <div>
              <label htmlFor="subject-select" className="block text-xs font-medium text-dark-300 mb-1.5">
                Select Subject
              </label>
              <div className="relative">
                <select
                  id="subject-select"
                  value={selectedSubjectId}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  className="w-full bg-dark-800 border border-dark-600 rounded-lg text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors appearance-none cursor-pointer pr-10"
                >
                  {subjects.length === 0 ? (
                    <option value="custom">Custom Subject / Manual Input</option>
                  ) : (
                    <>
                      <option value="" disabled>
                        -- Select a Subject --
                      </option>
                      {subjects.map((subj) => (
                        <option key={subj.id} value={subj.id}>
                          {subj.name} ({subj.attendedClasses}/{subj.totalClasses} classes -{' '}
                          {calculateAttendancePercentage(subj.attendedClasses, subj.totalClasses).toFixed(1)}%)
                        </option>
                      ))}
                      <option value="custom">➕ Custom / Hypothetical Subject</option>
                    </>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-dark-400">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              {selectedSubjectId === 'custom' && (
                <p className="text-xs text-dark-400 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3 text-accent-blue" />
                  Testing custom values not tied to a registered subject.
                </p>
              )}
            </div>

            {/* Current Conducted & Attended */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="total-classes" className="block text-xs font-medium text-dark-300 mb-1.5">
                  Classes Conducted
                </label>
                <div className="relative">
                  <input
                    id="total-classes"
                    type="number"
                    min="0"
                    step="1"
                    value={totalClasses}
                    onChange={(e) => setTotalClasses(e.target.value)}
                    className={`w-full bg-dark-800 border ${
                      validation.errors.totalClasses ? 'border-accent-red' : 'border-dark-600'
                    } rounded-lg text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors`}
                    placeholder="e.g. 30"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-dark-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                {validation.errors.totalClasses && (
                  <p className="text-accent-red text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    {validation.errors.totalClasses}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="attended-classes" className="block text-xs font-medium text-dark-300 mb-1.5">
                  Classes Attended
                </label>
                <div className="relative">
                  <input
                    id="attended-classes"
                    type="number"
                    min="0"
                    step="1"
                    value={attendedClasses}
                    onChange={(e) => setAttendedClasses(e.target.value)}
                    className={`w-full bg-dark-800 border ${
                      validation.errors.attendedClasses ? 'border-accent-red' : 'border-dark-600'
                    } rounded-lg text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors`}
                    placeholder="e.g. 24"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-dark-500">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                </div>
                {validation.errors.attendedClasses && (
                  <p className="text-accent-red text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    {validation.errors.attendedClasses}
                  </p>
                )}
              </div>
            </div>

            {/* Upcoming Classes & Planned Attendance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label htmlFor="upcoming-classes" className="block text-xs font-medium text-dark-300 mb-1.5">
                  Upcoming Classes
                </label>
                <div className="relative">
                  <input
                    id="upcoming-classes"
                    type="number"
                    min="0"
                    step="1"
                    value={upcomingClasses}
                    onChange={(e) => {
                      const newUp = e.target.value;
                      setUpcomingClasses(newUp);
                      // Adjust planned if planned > newUp
                      const upNum = Number(newUp);
                      const planNum = Number(plannedAttendance);
                      if (!isNaN(upNum) && !isNaN(planNum) && planNum > upNum) {
                        setPlannedAttendance(String(upNum));
                      }
                    }}
                    className={`w-full bg-dark-800 border ${
                      validation.errors.upcomingClasses ? 'border-accent-red' : 'border-dark-600'
                    } rounded-lg text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors`}
                    placeholder="e.g. 10"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-dark-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                {validation.errors.upcomingClasses && (
                  <p className="text-accent-red text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    {validation.errors.upcomingClasses}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="planned-attendance" className="block text-xs font-medium text-dark-300 mb-1.5">
                  Plan to Attend
                </label>
                <div className="relative">
                  <input
                    id="planned-attendance"
                    type="number"
                    min="0"
                    step="1"
                    value={plannedAttendance}
                    onChange={(e) => setPlannedAttendance(e.target.value)}
                    className={`w-full bg-dark-800 border ${
                      validation.errors.plannedAttendance ? 'border-accent-red' : 'border-dark-600'
                    } rounded-lg text-white px-3.5 py-2.5 text-sm focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-colors`}
                    placeholder="e.g. 8"
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-dark-500">
                    <Percent className="w-4 h-4" />
                  </div>
                </div>
                {validation.errors.plannedAttendance && (
                  <p className="text-accent-red text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    {validation.errors.plannedAttendance}
                  </p>
                )}
              </div>
            </div>

            {/* Quick Preset Buttons for Planned Attendance */}
            <div className="pt-2">
              <span className="block text-xs font-medium text-dark-400 mb-2">Quick Attendance Presets:</span>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset(1)}
                  disabled={validation.numUpcoming <= 0}
                  className="px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-600 text-xs font-medium text-dark-200 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed text-center"
                >
                  100% (All)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(0.75)}
                  disabled={validation.numUpcoming <= 0}
                  className="px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-600 text-xs font-medium text-dark-200 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed text-center"
                >
                  75% Target
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(0.5)}
                  disabled={validation.numUpcoming <= 0}
                  className="px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-600 text-xs font-medium text-dark-200 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed text-center"
                >
                  50% Half
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(0)}
                  disabled={validation.numUpcoming <= 0}
                  className="px-2.5 py-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 border border-dark-600 text-xs font-medium text-dark-200 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed text-center"
                >
                  0% (None)
                </button>
              </div>
            </div>

            {/* Interactive Slider */}
            {validation.numUpcoming > 0 && (
              <div className="pt-1">
                <div className="flex justify-between items-center text-xs text-dark-400 mb-1.5">
                  <span>Planned Attendance Slider:</span>
                  <span className="text-accent-blue font-semibold">
                    {validation.numPlanned} / {validation.numUpcoming} classes (
                    {((validation.numPlanned / validation.numUpcoming) * 100).toFixed(0)}%)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={validation.numUpcoming}
                  step="1"
                  value={validation.numPlanned}
                  onChange={(e) => setPlannedAttendance(e.target.value)}
                  className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-accent-blue"
                />
              </div>
            )}
          </div>

          {/* Calculate & Action Buttons */}
          <div className="pt-6 mt-6 border-t border-dark-700/50 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={handleManualCalculate}
              disabled={!validation.isValid}
              className="btn-primary w-full flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calculator className="w-4 h-4" />
              <span>Calculate Prediction</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary w-full sm:w-auto"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Right Column: Circular Progress & Comparison Display */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {validation.isValid && prediction && isCalculated ? (
            <div className="glass-card p-6 sm:p-8 flex flex-col justify-between animate-fade-in">
              <div>
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-dark-700/50">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent-green" />
                    <h2 className="text-base font-semibold text-white">Attendance Forecast</h2>
                  </div>
                  <span className="text-xs text-dark-400">
                    Live calculation based on current parameters
                  </span>
                </div>

                {/* Circular Percentage Displays: Current vs Predicted */}
                <div className="flex flex-col md:flex-row items-center justify-around py-4 gap-6">
                  {/* Current Attendance Circle */}
                  <CircularProgress
                    percentage={prediction.currentPercentage}
                    label="Current Attendance"
                    sublabel={`${validation.numAttended} of ${validation.numTotal} classes`}
                    status={prediction.currentStatus}
                  />

                  {/* Comparison Arrow & Delta Indicator */}
                  <div className="flex md:flex-col items-center justify-center my-2 md:my-0 px-2 sm:px-6">
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-0 md:mb-3 mr-3 md:mr-0 transition-all ${
                        percentageDiff > 0
                          ? 'bg-accent-green/10 text-accent-green border border-accent-green/30'
                          : percentageDiff < 0
                          ? 'bg-accent-red/10 text-accent-red border border-accent-red/30'
                          : 'bg-dark-800 text-dark-300 border border-dark-700'
                      }`}
                    >
                      {percentageDiff > 0 ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : percentageDiff < 0 ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : null}
                      <span>
                        {percentageDiff > 0
                          ? `+${percentageDiff.toFixed(1)}%`
                          : `${percentageDiff.toFixed(1)}%`}
                      </span>
                    </div>

                    <div className="w-11 h-11 rounded-full bg-dark-800/90 border border-dark-700 flex items-center justify-center shadow-lg">
                      <ArrowRight className="w-5 h-5 text-accent-blue md:rotate-0 rotate-90 transition-transform duration-300" />
                    </div>

                    <span className="hidden md:block text-xs text-dark-400 mt-2 font-medium">Shift</span>
                  </div>

                  {/* Predicted Attendance Circle */}
                  <CircularProgress
                    percentage={prediction.predictedPercentage}
                    label="Predicted Attendance"
                    sublabel={`${validation.numAttended + validation.numPlanned} of ${
                      validation.numTotal + validation.numUpcoming
                    } classes`}
                    status={prediction.predictedStatus}
                  />
                </div>
              </div>

              {/* Status Outcome Banner */}
              <div
                className={`mt-6 p-4 rounded-xl border flex items-start gap-3 ${
                  prediction.predictedStatus === 'safe'
                    ? 'bg-accent-green/10 border-accent-green/20 text-accent-green'
                    : prediction.predictedStatus === 'warning'
                    ? 'bg-accent-amber/10 border-accent-amber/20 text-accent-amber'
                    : 'bg-accent-red/10 border-accent-red/20 text-accent-red'
                }`}
              >
                {prediction.predictedStatus === 'safe' ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                )}
                <div className="text-xs sm:text-sm leading-relaxed">
                  <p className="font-semibold text-white">
                    {prediction.predictedStatus === 'safe'
                      ? 'You are on track to stay safe!'
                      : prediction.predictedStatus === 'warning'
                      ? 'Warning: Attendance will remain in the danger zone (65-74%).'
                      : 'Critical Alert: Predicted attendance is below 65%!'}
                  </p>
                  <p className="text-dark-300 mt-0.5">
                    {percentageDiff >= 0
                      ? `Attending ${validation.numPlanned} of ${validation.numUpcoming} upcoming classes will raise your attendance by +${percentageDiff.toFixed(
                          1
                        )}%, bringing you to ${prediction.predictedPercentage.toFixed(1)}%.`
                      : `Attending only ${validation.numPlanned} of ${validation.numUpcoming} upcoming classes will pull your attendance down by ${percentageDiff.toFixed(
                          1
                        )}% to ${prediction.predictedPercentage.toFixed(1)}%.`}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center text-dark-400 mb-4">
                <AlertTriangle className="w-7 h-7 text-accent-amber" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1">Incomplete or Invalid Inputs</h3>
              <p className="text-dark-400 text-sm max-w-sm">
                Please ensure all parameter fields contain valid non-negative numbers and attended classes do
                not exceed total conducted classes.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4 Result Cards */}
      {validation.isValid && prediction && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
          {/* Card 1: Current Attendance with status */}
          <div className="glass-card p-5 border-dark-700/60 hover:border-dark-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${
                  prediction.currentStatus === 'safe'
                    ? 'bg-accent-green/10 text-accent-green'
                    : prediction.currentStatus === 'warning'
                    ? 'bg-accent-amber/10 text-accent-amber'
                    : 'bg-accent-red/10 text-accent-red'
                } flex items-center justify-center`}
              >
                {prediction.currentStatus === 'safe' ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  prediction.currentStatus === 'safe'
                    ? 'bg-accent-green/10 text-accent-green border-accent-green/30'
                    : prediction.currentStatus === 'warning'
                    ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/30'
                    : 'bg-accent-red/10 text-accent-red border-accent-red/30'
                }`}
              >
                {prediction.currentStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-dark-400 text-xs font-medium">Current Attendance</p>
            <p className="text-2xl font-bold text-white mt-1">
              {prediction.currentPercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-dark-400 mt-2 leading-relaxed">
              Attended <strong className="text-white">{validation.numAttended}</strong> of{' '}
              <strong className="text-white">{validation.numTotal}</strong> classes conducted so far (
              {validation.numTotal - validation.numAttended} missed).
            </p>
          </div>

          {/* Card 2: Predicted Attendance with status */}
          <div className="glass-card p-5 border-dark-700/60 hover:border-dark-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${
                  prediction.predictedStatus === 'safe'
                    ? 'bg-accent-green/10 text-accent-green'
                    : prediction.predictedStatus === 'warning'
                    ? 'bg-accent-amber/10 text-accent-amber'
                    : 'bg-accent-red/10 text-accent-red'
                } flex items-center justify-center`}
              >
                <TrendingUp className="w-5 h-5" />
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  prediction.predictedStatus === 'safe'
                    ? 'bg-accent-green/10 text-accent-green border-accent-green/30'
                    : prediction.predictedStatus === 'warning'
                    ? 'bg-accent-amber/10 text-accent-amber border-accent-amber/30'
                    : 'bg-accent-red/10 text-accent-red border-accent-red/30'
                }`}
              >
                {prediction.predictedStatus.toUpperCase()}
              </span>
            </div>
            <p className="text-dark-400 text-xs font-medium">Predicted Attendance</p>
            <p className="text-2xl font-bold text-white mt-1">
              {prediction.predictedPercentage.toFixed(1)}%
            </p>
            <p className="text-xs text-dark-400 mt-2 leading-relaxed">
              If you attend <strong className="text-white">{validation.numPlanned}</strong> of the next{' '}
              <strong className="text-white">{validation.numUpcoming}</strong> classes, attendance will shift by{' '}
              <strong className={percentageDiff >= 0 ? 'text-accent-green' : 'text-accent-red'}>
                {percentageDiff >= 0 ? `+${percentageDiff.toFixed(1)}%` : `${percentageDiff.toFixed(1)}%`}
              </strong>
              .
            </p>
          </div>

          {/* Card 3: Classes Needed to Reach 75% */}
          <div className="glass-card p-5 border-dark-700/60 hover:border-dark-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${
                  prediction.classesNeededFor75 === 0
                    ? 'bg-accent-green/10 text-accent-green'
                    : 'bg-accent-amber/10 text-accent-amber'
                } flex items-center justify-center`}
              >
                <Target className="w-5 h-5" />
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  prediction.classesNeededFor75 === 0
                    ? 'bg-accent-green/10 text-accent-green border-accent-green/30'
                    : 'bg-accent-amber/10 text-accent-amber border-accent-amber/30'
                }`}
              >
                {prediction.classesNeededFor75 === 0 ? 'ON TARGET' : 'TARGET GAP'}
              </span>
            </div>
            <p className="text-dark-400 text-xs font-medium">Classes Needed for 75%</p>
            <div className="text-2xl font-bold text-white mt-1">
              {prediction.classesNeededFor75 === 0 ? (
                <span className="text-accent-green flex items-center gap-1.5 text-xl font-bold">
                  <CheckCircle className="w-5 h-5" /> You're safe!
                </span>
              ) : (
                <span>
                  {prediction.classesNeededFor75}{' '}
                  <span className="text-sm font-normal text-dark-300">
                    {prediction.classesNeededFor75 === 1 ? 'class' : 'classes'}
                  </span>
                </span>
              )}
            </div>
            <p className="text-xs text-dark-400 mt-2 leading-relaxed">
              {prediction.classesNeededFor75 === 0
                ? "You're already at or above 75% attendance. Keep up the consistent record!"
                : `Attend the next ${prediction.classesNeededFor75} consecutive classes without missing any to reach 75%.`}
            </p>
          </div>

          {/* Card 4: Classes You Can Miss */}
          <div className="glass-card p-5 border-dark-700/60 hover:border-dark-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-10 h-10 rounded-xl ${
                  prediction.classesCanMiss > 0
                    ? 'bg-accent-blue/10 text-accent-blue'
                    : 'bg-accent-red/10 text-accent-red'
                } flex items-center justify-center`}
              >
                {prediction.classesCanMiss > 0 ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertTriangle className="w-5 h-5" />
                )}
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  prediction.classesCanMiss > 0
                    ? 'bg-accent-blue/10 text-accent-blue border-accent-blue/30'
                    : 'bg-accent-red/10 text-accent-red border-accent-red/30'
                }`}
              >
                {prediction.classesCanMiss > 0 ? 'BUFFER' : 'ZERO MARGIN'}
              </span>
            </div>
            <p className="text-dark-400 text-xs font-medium">Classes You Can Miss</p>
            <div className="text-2xl font-bold text-white mt-1">
              <span>
                {prediction.classesCanMiss}{' '}
                <span className="text-sm font-normal text-dark-300">
                  {prediction.classesCanMiss === 1 ? 'class' : 'classes'}
                </span>
              </span>
            </div>
            <p className="text-xs text-dark-400 mt-2 leading-relaxed">
              {prediction.classesCanMiss > 0
                ? `You can safely miss up to ${prediction.classesCanMiss} upcoming class${
                    prediction.classesCanMiss > 1 ? 'es' : ''
                  } and still maintain 75% overall.`
                : 'You cannot afford to miss any classes without dropping below the 75% threshold!'}
            </p>
          </div>
        </div>
      )}

      {/* Scenario Breakdown Recharts Section */}
      {validation.isValid && prediction && scenarioData.length > 0 && (
        <div className="glass-card p-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-purple" />
              <div>
                <h2 className="text-base font-semibold text-white">Upcoming Attendance Scenarios</h2>
                <p className="text-xs text-dark-400">
                  Compare how different attendance rates for the {validation.numUpcoming} upcoming classes impact your final standing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-accent-green">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-green inline-block" />
                Safe (≥75%)
              </span>
              <span className="flex items-center gap-1.5 text-accent-amber">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-amber inline-block" />
                Warning (65-74%)
              </span>
              <span className="flex items-center gap-1.5 text-accent-red">
                <span className="w-2.5 h-2.5 rounded-full bg-accent-red inline-block" />
                Danger (&lt;65%)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scenarioData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={12} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                  formatter={(
                    value: any,
                    _name: any,
                    props: any
                  ) => [
                    `${value}% (${props.payload?.attended}/${
                      validation.numTotal + validation.numUpcoming
                    } classes attended)`,
                    props.payload?.name || 'Attendance',
                  ]}
                />
                <ReferenceLine
                  y={target}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: `75% Target`,
                    fill: '#ef4444',
                    position: 'top',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="percentage" radius={[8, 8, 0, 0]} maxBarSize={56}>
                  {scenarioData.map((entry, index) => {
                    const isSafe = entry.percentage >= target;
                    const isWarning = entry.percentage >= target - 10;
                    const color = isSafe ? '#22c55e' : isWarning ? '#f59e0b' : '#ef4444';
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={color}
                        stroke={entry.isCurrentPlan ? '#3b82f6' : undefined}
                        strokeWidth={entry.isCurrentPlan ? 3 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
