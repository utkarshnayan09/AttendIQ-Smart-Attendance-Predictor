import { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Percent,
  BookOpen,
  Info,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';
import {
  calculateAttendancePercentage,
  calculateClassesNeededForTarget,
  calculateOverallAttendance,
} from '../utils/calculations';
import type { Subject } from '../types';

type SortField = 'name' | 'totalClasses' | 'attendedClasses' | 'percentage' | 'status';
type SortOrder = 'asc' | 'desc';

const TARGET_THRESHOLD = 75;

export default function ReportsPage() {
  const { subjects, settings } = useApp();

  const [sortField, setSortField] = useState<SortField>('percentage');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Overall attendance metrics
  const overall = useMemo(() => calculateOverallAttendance(subjects), [subjects]);

  // Subjects above and below 75% threshold
  const subjectsAbove75 = useMemo(
    () =>
      subjects.filter(
        (s: Subject) => calculateAttendancePercentage(s.attendedClasses, s.totalClasses) >= TARGET_THRESHOLD
      ),
    [subjects]
  );

  const subjectsBelow75 = useMemo(
    () =>
      subjects.filter(
        (s: Subject) => calculateAttendancePercentage(s.attendedClasses, s.totalClasses) < TARGET_THRESHOLD
      ),
    [subjects]
  );

  // Formatted data for Bar Chart
  const barChartData = useMemo(() => {
    return subjects.map((s: Subject) => {
      const pct = calculateAttendancePercentage(s.attendedClasses, s.totalClasses);
      return {
        id: s.id,
        name: s.name.length > 14 ? `${s.name.substring(0, 14)}…` : s.name,
        fullName: s.name,
        percentage: Number(pct.toFixed(1)),
        attended: s.attendedClasses,
        total: s.totalClasses,
        isSafe: pct >= TARGET_THRESHOLD,
      };
    });
  }, [subjects]);

  // Formatted data for Pie Chart
  const pieChartData = useMemo(() => {
    const safeCount = subjectsAbove75.length;
    const atRiskCount = subjectsBelow75.length;
    const total = subjects.length;

    return [
      {
        name: 'Safe (≥75%)',
        value: safeCount,
        percentage: total > 0 ? ((safeCount / total) * 100).toFixed(0) : '0',
        color: '#22c55e', // green
      },
      {
        name: 'At Risk (<75%)',
        value: atRiskCount,
        percentage: total > 0 ? ((atRiskCount / total) * 100).toFixed(0) : '0',
        color: '#ef4444', // red
      },
    ];
  }, [subjectsAbove75.length, subjectsBelow75.length, subjects.length]);

  // Sorted subjects for table
  const sortedSubjects = useMemo(() => {
    const list = [...subjects].map((s: Subject) => {
      const percentage = calculateAttendancePercentage(s.attendedClasses, s.totalClasses);
      const isSafe = percentage >= TARGET_THRESHOLD;
      return {
        ...s,
        percentage,
        isSafe,
      };
    });

    list.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'totalClasses':
          comparison = a.totalClasses - b.totalClasses;
          break;
        case 'attendedClasses':
          comparison = a.attendedClasses - b.attendedClasses;
          break;
        case 'percentage':
          comparison = a.percentage - b.percentage;
          break;
        case 'status':
          comparison = Number(a.isSafe) - Number(b.isSafe);
          break;
        default:
          comparison = a.percentage - b.percentage;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return list;
  }, [subjects, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  return (
    <div className="space-y-8 animate-fade-in reports-page-container">
      {/* Dynamic Print Stylesheet */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1.2cm;
          }

          /* Hide UI navigation, sidebar, top headers, action buttons, spacer */
          aside,
          nav,
          header,
          button,
          .no-print,
          .lg\\:hidden,
          aside + div {
            display: none !important;
          }

          /* Reset layout wrapper containers for full-width print */
          main,
          main > div,
          .flex.min-h-screen {
            display: block !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            background: #ffffff !important;
          }

          /* Clean background and crisp typography */
          html, body, #root {
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #111827 !important;
            margin: 0 !important;
            padding: 0 !important;
            font-size: 12pt !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .reports-page-container {
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            space-y: 1.5rem !important;
          }

          /* Print transcript banner */
          .print-header-banner {
            display: block !important;
            margin-bottom: 1.5rem !important;
            padding-bottom: 1rem !important;
            border-bottom: 2px solid #111827 !important;
          }

          /* Clean up cards for print */
          .glass-card,
          .stat-card {
            background: #ffffff !important;
            color: #111827 !important;
            border: 1px solid #d1d5db !important;
            box-shadow: none !important;
            backdrop-filter: none !important;
            break-inside: avoid !important;
            page-break-inside: avoid !important;
            border-radius: 0.5rem !important;
            padding: 1rem !important;
            margin-bottom: 1rem !important;
          }

          /* Text colors for print */
          h1, h2, h3, h4, p, span, th, td, label {
            color: #111827 !important;
          }

          .text-dark-400,
          .text-dark-300,
          .text-dark-500 {
            color: #4b5563 !important;
          }

          /* Table print formatting */
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }

          thead {
            display: table-header-group !important;
          }

          thead th {
            background-color: #f3f4f6 !important;
            color: #111827 !important;
            border-bottom: 2px solid #9ca3af !important;
            padding: 8px 12px !important;
          }

          tbody td {
            border-bottom: 1px solid #e5e7eb !important;
            color: #111827 !important;
            padding: 8px 12px !important;
          }

          tbody tr:nth-child(even) td {
            background-color: #f9fafb !important;
          }

          /* Badge styling in print */
          .badge-safe {
            background-color: #dcfce7 !important;
            color: #15803d !important;
            border: 1px solid #86efac !important;
            padding: 2px 8px !important;
            border-radius: 9999px !important;
            display: inline-block !important;
          }

          .badge-danger {
            background-color: #fee2e2 !important;
            color: #b91c1c !important;
            border: 1px solid #fca5a5 !important;
            padding: 2px 8px !important;
            border-radius: 9999px !important;
            display: inline-block !important;
          }

          /* Chart responsiveness in print */
          .chart-container-card {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          .progress-bar-track {
            background-color: #e5e7eb !important;
          }
        }
      `}</style>

      {/* Official Print Header (Visible ONLY when printing) */}
      <div className="hidden print-header-banner">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">AttendIQ Attendance Report</h1>
            <p className="text-xs text-gray-600 mt-1">Official Academic Attendance & Performance Record</p>
          </div>
          <div className="text-right text-xs text-gray-600 space-y-0.5">
            <p><span className="font-semibold text-gray-900">Student:</span> {settings.name || 'Student'}</p>
            {settings.email && <p><span className="font-semibold text-gray-900">Email:</span> {settings.email}</p>}
            <p><span className="font-semibold text-gray-900">Generated:</span> {currentDateFormatted}</p>
            <p><span className="font-semibold text-gray-900">Threshold:</span> {TARGET_THRESHOLD}%</p>
          </div>
        </div>
      </div>

      {/* Screen Header & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 border border-accent-blue/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-accent-blue/10">
            <FileText className="w-6 h-6 text-accent-blue" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Attendance Reports</h1>
            <p className="text-sm text-dark-400 mt-0.5">
              Comprehensive attendance analytics, subject performance, and compliance metrics
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-dark-800/80 border border-dark-700/60 text-xs text-dark-300 no-print">
            <Calendar className="w-3.5 h-3.5 text-accent-blue" />
            <span>{currentDateFormatted}</span>
          </div>
          <button
            onClick={handlePrint}
            className="btn-primary no-print shadow-md shadow-accent-blue/20 hover:shadow-accent-blue/30 cursor-pointer"
            title="Export or print this comprehensive report"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 1. Overall Summary Cards (Top Row) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Subjects Card */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Total Subjects</p>
              <p className="text-3xl font-bold text-white mt-1.5">{subjects.length}</p>
              <p className="text-xs text-dark-400 mt-1 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-accent-blue" />
                <span>Enrolled courses</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-accent-blue" />
            </div>
          </div>
        </div>

        {/* Overall Attendance Card */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Overall Attendance</p>
              <p
                className={`text-3xl font-bold mt-1.5 ${
                  overall.percentage >= TARGET_THRESHOLD ? 'text-accent-green' : 'text-accent-red'
                }`}
              >
                {overall.percentage.toFixed(1)}%
              </p>
              <p className="text-xs text-dark-400 mt-1 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-accent-purple" />
                <span>
                  {overall.totalAttended} / {overall.totalConducted} classes
                </span>
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
                overall.percentage >= TARGET_THRESHOLD
                  ? 'bg-accent-green/10 border-accent-green/20'
                  : 'bg-accent-red/10 border-accent-red/20'
              }`}
            >
              {overall.percentage >= TARGET_THRESHOLD ? (
                <CheckCircle className="w-6 h-6 text-accent-green" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-accent-red" />
              )}
            </div>
          </div>
        </div>

        {/* Subjects Above 75% Card */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Subjects Above 75%</p>
              <p className="text-3xl font-bold text-accent-green mt-1.5">{subjectsAbove75.length}</p>
              <p className="text-xs text-accent-green/80 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>
                  {subjects.length > 0
                    ? `${((subjectsAbove75.length / subjects.length) * 100).toFixed(0)}% safe standing`
                    : 'No subjects'}
                </span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-accent-green" />
            </div>
          </div>
        </div>

        {/* Subjects Below 75% Card */}
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-dark-400 text-sm font-medium">Subjects Below 75%</p>
              <p
                className={`text-3xl font-bold mt-1.5 ${
                  subjectsBelow75.length > 0 ? 'text-accent-red' : 'text-dark-300'
                }`}
              >
                {subjectsBelow75.length}
              </p>
              <p
                className={`text-xs mt-1 flex items-center gap-1 ${
                  subjectsBelow75.length > 0 ? 'text-accent-red/80' : 'text-accent-green/80'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {subjectsBelow75.length > 0
                    ? `${((subjectsBelow75.length / subjects.length) * 100).toFixed(0)}% at risk`
                    : 'Zero critical subjects'}
                </span>
              </p>
            </div>
            <div
              className={`w-12 h-12 rounded-xl border flex items-center justify-center ${
                subjectsBelow75.length > 0
                  ? 'bg-accent-red/10 border-accent-red/20'
                  : 'bg-dark-800 border-dark-700'
              }`}
            >
              <AlertTriangle
                className={`w-6 h-6 ${
                  subjectsBelow75.length > 0 ? 'text-accent-red' : 'text-dark-400'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* a. Bar chart: Attendance Percentage per Subject */}
        <div className="lg:col-span-7 glass-card p-6 chart-container-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-accent-purple/10 border border-accent-purple/20">
                  <BarChart3 className="w-5 h-5 text-accent-purple" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Attendance by Subject</h2>
                  <p className="text-xs text-dark-400">
                    Individual subject percentage compared to the 75% benchmark
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-dark-400 mt-2 mb-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-accent-green" />
                <span>Safe (≥ 75%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-accent-red" />
                <span>At Risk (&lt; 75%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-0.5 bg-amber-400 border border-amber-400" />
                <span className="text-amber-400 font-medium">75% Target Line</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full mt-2">
            {subjects.length === 0 ? (
              <div className="h-full flex items-center justify-center text-dark-400">
                <div className="text-center">
                  <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No subjects available to chart</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 20, right: 20, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis
                    domain={[0, 100]}
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val: number) => `${val}%`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as {
                          fullName: string;
                          percentage: number;
                          attended: number;
                          total: number;
                          isSafe: boolean;
                        };
                        return (
                          <div className="bg-dark-800 border border-dark-600 rounded-xl p-3 shadow-xl text-xs space-y-1 z-50">
                            <p className="font-semibold text-white text-sm">{data.fullName}</p>
                            <p className="text-dark-300">
                              Attended: <span className="text-white font-medium">{data.attended}</span> /{' '}
                              <span className="text-white font-medium">{data.total}</span> classes
                            </p>
                            <div className="flex items-center gap-2 pt-1 border-t border-dark-700 mt-1">
                              <span
                                className={`font-bold text-sm ${
                                  data.isSafe ? 'text-accent-green' : 'text-accent-red'
                                }`}
                              >
                                {data.percentage}%
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  data.isSafe
                                    ? 'bg-accent-green/10 text-accent-green border border-accent-green/20'
                                    : 'bg-accent-red/10 text-accent-red border border-accent-red/20'
                                }`}
                              >
                                {data.isSafe ? 'Safe' : 'At Risk'}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={TARGET_THRESHOLD}
                    stroke="#f59e0b"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: '75% Target',
                      position: 'top',
                      fill: '#f59e0b',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  />
                  <Bar dataKey="percentage" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {barChartData.map((entry) => (
                      <Cell
                        key={`bar-${entry.id}`}
                        fill={entry.percentage >= TARGET_THRESHOLD ? '#22c55e' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* b. Pie chart: Safe vs At-Risk Distribution */}
        <div className="lg:col-span-5 glass-card p-6 chart-container-card flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 rounded-lg bg-accent-blue/10 border border-accent-blue/20">
                <PieChartIcon className="w-5 h-5 text-accent-blue" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Subject Health Status</h2>
                <p className="text-xs text-dark-400">Safe vs at-risk subject distribution</p>
              </div>
            </div>
          </div>

          <div className="h-72 w-full relative flex items-center justify-center">
            {subjects.length === 0 ? (
              <div className="h-full flex items-center justify-center text-dark-400">
                <div className="text-center">
                  <PieChartIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No subject data to display</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="48%"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={pieChartData.every((d) => d.value > 0) ? 5 : 0}
                    dataKey="value"
                    stroke="#0f172a"
                    strokeWidth={2}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as {
                          name: string;
                          value: number;
                          percentage: string;
                          color: string;
                        };
                        return (
                          <div className="bg-dark-800 border border-dark-600 rounded-xl p-2.5 shadow-xl text-xs space-y-1">
                            <p className="font-semibold text-white">{data.name}</p>
                            <p className="text-dark-300">
                              Count:{' '}
                              <span className="font-bold" style={{ color: data.color }}>
                                {data.value}
                              </span>{' '}
                              ({data.percentage}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value, entry) => {
                      const payload = (entry as { payload?: { value?: number; percentage?: string } })
                        ?.payload;
                      return (
                        <span className="text-xs text-dark-300 font-medium ml-1">
                          {value}: <span className="text-white font-semibold">{payload?.value ?? 0}</span>{' '}
                          ({payload?.percentage ?? 0}%)
                        </span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}

            {/* Inner Ring Stat Indicator */}
            {subjects.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-2xl font-bold text-white tracking-tight">
                  {subjects.length}
                </span>
                <span className="text-[11px] uppercase tracking-wider text-dark-400 font-medium">
                  Subjects
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Subjects Below Threshold Warning Section */}
      {subjectsBelow75.length > 0 ? (
        <div className="glass-card p-6 border-accent-red/30 bg-accent-red/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent-red/15 border border-accent-red/30 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-accent-red" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Action Required: Subjects Below 75% Threshold
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-red/20 text-accent-red border border-accent-red/30">
                  {subjectsBelow75.length} At Risk
                </span>
              </h2>
              <p className="text-xs text-dark-400 mt-0.5">
                The following subjects require immediate attendance recovery to avoid academic debarment
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {subjectsBelow75.map((subject) => {
              const currentPct = calculateAttendancePercentage(
                subject.attendedClasses,
                subject.totalClasses
              );
              const classesNeeded = calculateClassesNeededForTarget(
                subject.attendedClasses,
                subject.totalClasses,
                TARGET_THRESHOLD
              );

              return (
                <div
                  key={subject.id}
                  className="p-4 rounded-xl bg-dark-900/80 border border-accent-red/20 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white text-base">{subject.name}</h3>
                      <p className="text-xs text-dark-400 mt-0.5">
                        Current: {subject.attendedClasses} attended of {subject.totalClasses} conducted
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-accent-red">
                        {currentPct.toFixed(1)}%
                      </span>
                      <p className="text-[10px] text-accent-red/70 font-medium uppercase tracking-wide">
                        Deficit: {(TARGET_THRESHOLD - currentPct).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Progress bar showing gap to 75% */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-dark-400">
                      <span>Progress</span>
                      <span>Target: {TARGET_THRESHOLD}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-dark-800 overflow-hidden relative progress-bar-track">
                      <div
                        className="h-full rounded-full bg-accent-red transition-all duration-500"
                        style={{ width: `${Math.min(100, (currentPct / TARGET_THRESHOLD) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Remedial Classes Needed Advice */}
                  <div className="p-2.5 rounded-lg bg-accent-red/10 border border-accent-red/20 flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-accent-red flex-shrink-0" />
                    <p className="text-xs text-white">
                      Must attend next{' '}
                      <span className="font-bold text-accent-red underline decoration-accent-red/40 underline-offset-2">
                        {classesNeeded} consecutive {classesNeeded === 1 ? 'class' : 'classes'}
                      </span>{' '}
                      without absence to reach {TARGET_THRESHOLD}%.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : subjects.length > 0 ? (
        <div className="glass-card p-6 border-accent-green/20 bg-accent-green/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-green/15 border border-accent-green/30 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-accent-green" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                All Subjects Above Threshold! 🎉
              </h2>
              <p className="text-xs text-dark-400 mt-0.5">
                Every registered subject currently meets or exceeds the mandatory {TARGET_THRESHOLD}% attendance benchmark.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* 3. Subject-wise Attendance Table */}
      <div className="glass-card p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-accent-blue/10 border border-accent-blue/20">
              <FileText className="w-5 h-5 text-accent-blue" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Subject-wise Attendance Details</h2>
              <p className="text-xs text-dark-400">
                Detailed breakdown with attendance counts, percentages, and compliance status
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-dark-400 no-print">
            <Info className="w-4 h-4 text-dark-400" />
            <span>Click column headers to sort</span>
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="py-12 text-center text-dark-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-base font-medium text-white">No Subjects Recorded</p>
            <p className="text-xs text-dark-400 mt-1">
              Add subjects and record attendance to view comprehensive reports.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden rounded-xl border border-dark-700/60">
                <table className="min-w-full divide-y divide-dark-700/60">
                  {/* Table Header: dark-800 */}
                  <thead className="bg-dark-800">
                    <tr>
                      <th
                        scope="col"
                        onClick={() => handleSort('name')}
                        className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-dark-200 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Subject</span>
                          {sortField === 'name' ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-accent-blue" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-accent-blue" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-dark-500 opacity-60" />
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort('totalClasses')}
                        className="px-3 py-3.5 text-center text-xs font-semibold text-dark-200 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none"
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span>Classes Conducted</span>
                          {sortField === 'totalClasses' ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-accent-blue" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-accent-blue" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-dark-500 opacity-60" />
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort('attendedClasses')}
                        className="px-3 py-3.5 text-center text-xs font-semibold text-dark-200 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none"
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span>Classes Attended</span>
                          {sortField === 'attendedClasses' ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-accent-blue" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-accent-blue" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-dark-500 opacity-60" />
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort('percentage')}
                        className="px-3 py-3.5 text-left text-xs font-semibold text-dark-200 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>Percentage</span>
                          {sortField === 'percentage' ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-accent-blue" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-accent-blue" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-dark-500 opacity-60" />
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        onClick={() => handleSort('status')}
                        className="py-3.5 pl-3 pr-4 text-center text-xs font-semibold text-dark-200 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none"
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span>Status</span>
                          {sortField === 'status' ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-accent-blue" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-accent-blue" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 text-dark-500 opacity-60" />
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>

                  {/* Alternating rows: dark-900 / dark-850 */}
                  <tbody className="divide-y divide-dark-750">
                    {sortedSubjects.map((subject, index) => {
                      const isSafe = subject.isSafe;
                      const rowBg = index % 2 === 0 ? 'bg-dark-900/90' : 'bg-[#141e33]';

                      return (
                        <tr
                          key={subject.id}
                          className={`${rowBg} hover:bg-dark-700/40 transition-colors duration-150`}
                        >
                          {/* Subject Column */}
                          <td className="py-4 pl-4 pr-3 text-sm font-medium text-white">
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                                  isSafe ? 'bg-accent-green' : 'bg-accent-red animate-pulse'
                                }`}
                              />
                              <div>
                                <span className="font-semibold text-white block">{subject.name}</span>
                                <span className="text-[11px] text-dark-400 sm:hidden">
                                  {subject.attendedClasses}/{subject.totalClasses} classes
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Classes Conducted Column */}
                          <td className="px-3 py-4 text-sm text-center text-dark-200">
                            {subject.totalClasses}
                          </td>

                          {/* Classes Attended Column */}
                          <td className="px-3 py-4 text-sm text-center font-medium text-white">
                            {subject.attendedClasses}
                          </td>

                          {/* Percentage Column with Mini Visual Bar */}
                          <td className="px-3 py-4 text-sm">
                            <div className="flex items-center gap-3 max-w-[200px]">
                              <span
                                className={`font-bold w-14 text-right flex-shrink-0 ${
                                  isSafe ? 'text-accent-green' : 'text-accent-red'
                                }`}
                              >
                                {subject.percentage.toFixed(1)}%
                              </span>
                              <div className="flex-1 h-2 bg-dark-800 rounded-full overflow-hidden progress-bar-track">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isSafe ? 'bg-accent-green' : 'bg-accent-red'
                                  }`}
                                  style={{ width: `${Math.min(100, subject.percentage)}%` }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Status Badge Column */}
                          <td className="py-4 pl-3 pr-4 text-center">
                            {isSafe ? (
                              <span className="badge-safe inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-green/10 text-accent-green border border-accent-green/20">
                                <CheckCircle className="w-3.5 h-3.5" />
                                <span>Safe</span>
                              </span>
                            ) : (
                              <span className="badge-danger inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-accent-red/10 text-accent-red border border-accent-red/20">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>At Risk</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Footer info within table card */}
        {subjects.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-dark-400 pt-3 border-t border-dark-700/50">
            <span>
              Showing {sortedSubjects.length} of {subjects.length} subjects
            </span>
            <div className="flex items-center gap-4 mt-2 sm:mt-0">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent-green" />
                {subjectsAbove75.length} Safe
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-accent-red" />
                {subjectsBelow75.length} At Risk
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Report Footer / Signature Area (Printed and Screen) */}
      <div className="text-center text-xs text-dark-500 pt-4 pb-2 border-t border-dark-800/80">
        <p>AttendIQ • Automated Attendance Monitoring & Analytics System</p>
        <p className="mt-0.5 text-dark-400">
          Generated on {currentDateFormatted} • All calculations adhere to the {TARGET_THRESHOLD}% minimum institutional attendance policy.
        </p>
      </div>
    </div>
  );
}
