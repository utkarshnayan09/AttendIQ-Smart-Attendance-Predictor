import { useMemo } from 'react';
import { History, Calendar, CheckCircle, XCircle, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateAttendancePercentage } from '../utils/calculations';

export default function HistoryPage() {
  const { subjects, settings } = useApp();

  // Generate simulated attendance history for demo
  const historyRecords = useMemo(() => {
    const records: {
      date: string;
      dayName: string;
      entries: { subjectName: string; attended: boolean; percentage: number }[];
    }[] = [];

    const today = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      const dayEntries = subjects
        .filter(() => Math.random() > 0.3) // Not all subjects every day
        .map((subject) => {
          const pct = calculateAttendancePercentage(subject.attendedClasses, subject.totalClasses);
          return {
            subjectName: subject.name,
            attended: Math.random() > 0.25, // ~75% attendance rate
            percentage: pct,
          };
        });

      if (dayEntries.length > 0) {
        records.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          dayName: daysOfWeek[date.getDay()],
          entries: dayEntries,
        });
      }
    }

    return records;
  }, [subjects]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <History className="w-6 h-6 text-accent-blue" />
          Attendance History
        </h1>
        <p className="text-dark-400 mt-1">View your recent attendance records</p>
      </div>

      {/* Info Banner */}
      <div className="glass-card p-4 border-accent-blue/20">
        <p className="text-dark-300 text-sm">
          📋 This is simulated history data for demonstration. In the production version, 
          this will be populated from the C++ backend with actual attendance records.
        </p>
      </div>

      {subjects.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto text-dark-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No attendance history</h3>
          <p className="text-dark-400">Add subjects first to see attendance history.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {historyRecords.map((record, index) => (
            <div key={index} className="glass-card overflow-hidden">
              {/* Day Header */}
              <div className="flex items-center gap-3 px-5 py-3 bg-dark-800/50 border-b border-dark-700/50">
                <Calendar className="w-4 h-4 text-accent-blue" />
                <span className="text-white text-sm font-medium">{record.dayName}</span>
                <span className="text-dark-400 text-sm">{record.date}</span>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-accent-green text-xs">
                    {record.entries.filter((e) => e.attended).length} present
                  </span>
                  <span className="text-dark-600">|</span>
                  <span className="text-accent-red text-xs">
                    {record.entries.filter((e) => !e.attended).length} absent
                  </span>
                </div>
              </div>

              {/* Entries */}
              <div className="divide-y divide-dark-800/50">
                {record.entries.map((entry, entryIndex) => {
                  const isSafe = entry.percentage >= settings.attendanceTarget;
                  return (
                    <div
                      key={entryIndex}
                      className="flex items-center justify-between px-5 py-3 hover:bg-dark-800/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {entry.attended ? (
                          <CheckCircle className="w-4.5 h-4.5 text-accent-green" />
                        ) : (
                          <XCircle className="w-4.5 h-4.5 text-accent-red" />
                        )}
                        <span className="text-white text-sm">{entry.subjectName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                            entry.attended
                              ? 'bg-accent-green/10 text-accent-green'
                              : 'bg-accent-red/10 text-accent-red'
                          }`}
                        >
                          {entry.attended ? 'Present' : 'Absent'}
                        </span>
                        <span className={`text-xs font-semibold ${isSafe ? 'text-dark-400' : 'text-accent-red'}`}>
                          {entry.percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
