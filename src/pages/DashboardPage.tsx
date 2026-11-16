import { useMemo } from 'react';
import {
  BookOpen,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Users,
  Calendar,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { calculateAttendancePercentage, calculateOverallAttendance } from '../utils/calculations';

export default function DashboardPage() {
  const { subjects, settings } = useApp();

  const overall = useMemo(() => calculateOverallAttendance(subjects), [subjects]);

  const subjectData = useMemo(
    () =>
      subjects.map((s) => ({
        name: s.name.length > 12 ? s.name.substring(0, 12) + '…' : s.name,
        fullName: s.name,
        percentage: Number(calculateAttendancePercentage(s.attendedClasses, s.totalClasses).toFixed(1)),
        attended: s.attendedClasses,
        total: s.totalClasses,
      })),
    [subjects]
  );

  const belowThreshold = useMemo(
    () =>
      subjects.filter(
        (s) => calculateAttendancePercentage(s.attendedClasses, s.totalClasses) < settings.attendanceTarget
      ),
    [subjects, settings.attendanceTarget]
  );

  // Simulated trend data for the area chart
  const trendData = useMemo(() => {
    const months = ['Aug', 'Sep', 'Oct', 'Nov'];
    return months.map((month, i) => {
      const factor = 0.85 + (i * 0.05 * (Math.random() > 0.3 ? 1 : -1));
      return {
        month,
        attendance: Math.min(100, Math.max(50, overall.percentage * factor + (Math.random() * 5 - 2.5))).toFixed(1),
      };
    });
  }, [overall.percentage]);

  const statCards = [
    {
      label: 'Total Subjects',
      value: subjects.length,
      icon: BookOpen,
      color: 'text-accent-blue',
      bg: 'bg-accent-blue/10',
    },
    {
      label: 'Overall Attendance',
      value: `${overall.percentage.toFixed(1)}%`,
      icon: TrendingUp,
      color: overall.percentage >= settings.attendanceTarget ? 'text-accent-green' : 'text-accent-red',
      bg: overall.percentage >= settings.attendanceTarget ? 'bg-accent-green/10' : 'bg-accent-red/10',
    },
    {
      label: 'Classes Attended',
      value: overall.totalAttended,
      icon: CheckCircle,
      color: 'text-accent-green',
      bg: 'bg-accent-green/10',
    },
    {
      label: 'Classes Conducted',
      value: overall.totalConducted,
      icon: Calendar,
      color: 'text-accent-purple',
      bg: 'bg-accent-purple/10',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome & Status Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-card p-6 border-dark-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-accent-blue/10 via-accent-purple/5 to-transparent pointer-events-none" />
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-blue/15 border border-accent-blue/30 text-accent-blue text-xs font-semibold mb-2">
            <span className="w-2 h-2 rounded-full bg-accent-blue animate-ping" />
            Active Session &bull; Attendance Target: {settings.attendanceTarget}%
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-gradient-shimmer">{settings.name || 'Student'}</span>! 👋
          </h1>
          <p className="text-dark-300 text-sm mt-1">
            Real-time analytics & predictive compliance for your current semester
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-dark-400">Current Status</p>
            <p className={`text-sm font-bold ${overall.percentage >= settings.attendanceTarget ? 'text-accent-green' : 'text-accent-red'}`}>
              {overall.percentage >= settings.attendanceTarget ? 'Eligible for Exams' : 'Action Required'}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-inner ${
            overall.percentage >= settings.attendanceTarget
              ? 'bg-accent-green/20 text-accent-green border border-accent-green/40'
              : 'bg-accent-red/20 text-accent-red border border-accent-red/40'
          }`}>
            {overall.percentage.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="stat-card group">
              <div className="flex items-center justify-between relative z-10">
                <div>
                  <p className="text-dark-400 text-xs uppercase tracking-wider font-semibold">{card.label}</p>
                  <p className="text-3xl font-extrabold text-white mt-1.5 tracking-tight group-hover:scale-105 transition-transform origin-left">
                    {card.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center group-hover:rotate-6 group-hover:scale-110 transition-all shadow-lg`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Trend */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-accent-blue" />
            <h2 className="text-lg font-semibold text-white">Attendance Trend</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '0.875rem',
                  }}
                  formatter={(value: any) => [`${value}%`, 'Attendance']}
                />
                <ReferenceLine y={settings.attendanceTarget} stroke="#ef4444" strokeDasharray="5 5" label={{ value: `${settings.attendanceTarget}%`, fill: '#ef4444', fontSize: 11 }} />
                <Area
                  type="monotone"
                  dataKey="attendance"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#attendanceGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject-wise Attendance */}
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-accent-purple" />
            <h2 className="text-lg font-semibold text-white">Subject-wise Attendance</h2>
          </div>
          <div className="h-64">
            {subjects.length === 0 ? (
              <div className="h-full flex items-center justify-center text-dark-400">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No subjects added yet</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '0.875rem',
                    }}
                    formatter={(value: any, _name: any, props: any) => [
                      `${value}% (${props.payload?.attended}/${props.payload?.total})`,
                      props.payload?.fullName || 'Attendance',
                    ]}
                  />
                  <ReferenceLine x={settings.attendanceTarget} stroke="#ef4444" strokeDasharray="5 5" />
                  <Bar dataKey="percentage" radius={[0, 6, 6, 0]} barSize={20}>
                    {subjectData.map((entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.percentage >= settings.attendanceTarget ? '#22c55e' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Below Threshold Warning */}
      {belowThreshold.length > 0 && (
        <div className="glass-card p-6 border-amber-500/20">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-accent-amber" />
            <h2 className="text-lg font-semibold text-white">Attendance Warning</h2>
          </div>
          <div className="space-y-3">
            {belowThreshold.map((subject) => {
              const pct = calculateAttendancePercentage(subject.attendedClasses, subject.totalClasses);
              return (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent-amber" />
                    <span className="text-white text-sm font-medium">{subject.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-amber-400 text-sm font-semibold">{pct.toFixed(1)}%</span>
                    <span className="text-dark-400 text-xs">
                      {subject.attendedClasses}/{subject.totalClasses} classes
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Overview - Subject List */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-accent-blue" />
            <h2 className="text-lg font-semibold text-white">Subject Overview</h2>
          </div>
          <span className="text-dark-400 text-sm">{subjects.length} subjects</span>
        </div>
        {subjects.length === 0 ? (
          <div className="py-8 text-center text-dark-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No subjects added yet. Go to My Subjects to add one.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {subjects.map((subject) => {
              const pct = calculateAttendancePercentage(subject.attendedClasses, subject.totalClasses);
              const isSafe = pct >= settings.attendanceTarget;
              return (
                <div
                  key={subject.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-dark-800/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isSafe ? 'bg-accent-green' : 'bg-accent-red'}`} />
                    <span className="text-white text-sm font-medium truncate">{subject.name}</span>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="w-24 h-2 bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isSafe ? 'bg-accent-green' : 'bg-accent-red'}`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-semibold w-14 text-right ${isSafe ? 'text-accent-green' : 'text-accent-red'}`}>
                      {pct.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
