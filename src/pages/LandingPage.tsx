import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  BarChart3,
  TrendingUp,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Menu,
  X,
  Shield,
  Sparkles,
  Calendar,
  Check,
  ChevronRight,
  Calculator,
  GraduationCap
} from 'lucide-react';
import StarfieldBackground from '../components/StarfieldBackground';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Features', href: '#features' },
    { name: 'Dashboard', href: '#preview' },
    { name: 'About', href: '#about' },
  ];

  const features = [
    {
      title: 'Smart Tracking',
      description:
        'Monitor attendance across all subjects with real-time percentage calculations and status indicators.',
      icon: BarChart3,
      tag: 'Real-Time Insights',
      highlights: [
        'Instant percentage calculations per subject',
        'Automatic Safe vs Warning color coding',
        'Tracks lectures, tutorials, and practical labs',
        'Account for medical exemptions and duty leaves'
      ],
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      title: 'Attendance Predictor',
      description:
        'Plan ahead by predicting your attendance and knowing exactly how many classes you can afford to miss.',
      icon: TrendingUp,
      tag: 'Predictive Engine',
      highlights: [
        'Safe Bunk Calculator with zero guesswork',
        'Exact count of classes needed to reach 75% or 80%',
        'Future semester scenario simulation',
        'Automated alert before you fall into detention zone'
      ],
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    },
    {
      title: 'Detailed Reports',
      description:
        'Get comprehensive attendance reports with visual charts and export capabilities.',
      icon: FileText,
      tag: 'Analytics & Export',
      highlights: [
        'Subject-wise monthly attendance trends',
        'PDF and CSV export for faculty and mentor reviews',
        'Breakdown of missed vs attended sessions',
        'Semester-wide historical archive'
      ],
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    }
  ];

  const mockSubjects = [
    {
      code: 'CS301',
      name: 'Design & Analysis of Algorithms',
      attended: 42,
      total: 48,
      percentage: 87.5,
      status: 'Safe',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      action: 'Safe to miss 8 classes',
      progressColor: 'bg-emerald-500'
    },
    {
      code: 'CS302',
      name: 'Database Management Systems',
      attended: 37,
      total: 45,
      percentage: 82.2,
      status: 'Safe',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      action: 'Safe to miss 4 classes',
      progressColor: 'bg-blue-500'
    },
    {
      code: 'CS303',
      name: 'Computer Networks',
      attended: 34,
      total: 45,
      percentage: 75.6,
      status: 'Warning',
      statusColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      action: 'Cannot miss next class',
      progressColor: 'bg-amber-500'
    },
    {
      code: 'CS304',
      name: 'Theory of Computation',
      attended: 36,
      total: 40,
      percentage: 90.0,
      status: 'Safe',
      statusColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      action: 'Safe to miss 7 classes',
      progressColor: 'bg-indigo-500'
    }
  ];

  return (
    <div id="home" className="min-h-screen bg-[#020617] text-white selection:bg-blue-600/30 selection:text-blue-200 relative overflow-hidden">
      {/* Living Cosmic Starfield in Motion */}
      <StarfieldBackground />

      {/* ===================== Navigation ===================== */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#020617]/85 border-b border-slate-800/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <a href="#home" className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center">
                  Attend<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">IQ</span>
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-sm font-medium text-slate-300 hover:text-white transition-colors duration-150"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                to="/login"
                className="btn-primary text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm hover:shadow-blue-500/20"
              >
                <span>Login</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Toggle Navigation Menu"
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-2 pb-6 border-b border-slate-800/80 bg-[#020617]/95 backdrop-blur-2xl animate-fade-in">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <div className="pt-2 mt-2 border-t border-slate-800">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-center py-3 text-sm font-semibold rounded-lg justify-center"
                >
                  <span>Login to AttendIQ</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ===================== Hero Section ===================== */}
      <section className="relative pt-32 sm:pt-40 pb-20 lg:pb-32 overflow-hidden flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8">
        {/* Subtle Gradient Mesh Background Blobs */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] sm:w-[850px] h-[380px] sm:h-[480px] bg-gradient-to-tr from-blue-600/20 via-purple-600/15 to-indigo-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/4 left-10 w-[280px] sm:w-[420px] h-[280px] sm:h-[420px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-purple-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Ambient Grid Accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto flex flex-col items-center animate-fade-in">
          {/* Tag Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs sm:text-sm font-medium text-blue-400 mb-8 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Smart Academic Attendance Intelligence</span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.12]">
            Stay Ahead of Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              Attendance
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300/90 max-w-2xl sm:max-w-3xl mb-10 leading-relaxed font-normal">
            Track your subject-wise attendance, predict future attendance, and know exactly how many
            classes you need to attend or can miss — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <Link
              to="/login"
              className="btn-primary w-full sm:w-auto px-8 py-3.5 text-base font-semibold group shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#features"
              className="btn-secondary w-full sm:w-auto px-8 py-3.5 text-base font-semibold hover:border-slate-400/50"
            >
              Explore Features
            </a>
          </div>

          {/* Trust Highlights */}
          <div className="mt-14 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8 max-w-3xl w-full text-center">
            <div>
              <p className="text-2xl font-bold text-white tracking-tight">75% / 80%</p>
              <p className="text-xs text-slate-400 mt-1">Rule Automation</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400 tracking-tight">Real-Time</p>
              <p className="text-xs text-slate-400 mt-1">Bunk Calculator</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400 tracking-tight">Zero</p>
              <p className="text-xs text-slate-400 mt-1">Spreadsheet Hassle</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400 tracking-tight">100%</p>
              <p className="text-xs text-slate-400 mt-1">Free for Students</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Dashboard Preview Section ===================== */}
      <section id="preview" className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-28">
        {/* Ambient Glow behind preview */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 via-indigo-600/20 to-purple-600/30 rounded-3xl blur-2xl opacity-40 -z-10" />

        {/* Dashboard Mock Container */}
        <div className="glass-card border border-slate-700/60 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl bg-[#0b1329]/90">
          {/* Mock Browser / Window Chrome */}
          <div className="px-4 py-3 bg-[#0a0f1d] border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>

            <div className="hidden sm:flex items-center gap-2 px-4 py-1 rounded-md bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-mono">
              <span>https://attendiq.app/dashboard</span>
              <span className="text-slate-600">•</span>
              <span className="text-blue-400">CSE 6th Semester</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Tracker
              </span>
            </div>
          </div>

          {/* Mock Dashboard Content */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Header Greeting within dashboard */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  Welcome back, Alex Kumar
                  <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    B.Tech CSE
                  </span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  Semester Week 11 • Target threshold: <span className="text-white font-medium">75% minimum</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Eligible for End-Sem Exams</span>
                </div>
              </div>
            </div>

            {/* Dashboard Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat 1 */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Overall Attendance</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    Safe Zone
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-white">84.2%</span>
                  <span className="text-xs text-slate-400">149/177 classes</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-1.5 rounded-full w-[84.2%]" />
                </div>
              </div>

              {/* Stat 2 */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Safe Bunks Available</span>
                  <Calculator className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-blue-400">6 Classes</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Can miss without falling below 75%</p>
              </div>

              {/* Stat 3 */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Next Target: 85%</span>
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-purple-400">5 Classes</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">Attend 5 consecutive sessions</p>
              </div>

              {/* Stat 4 */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 hover:border-slate-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Subjects In Danger</span>
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400">0 Subjects</span>
                </div>
                <p className="text-xs text-slate-400 mt-2">All 4 active subjects &gt;= 75%</p>
              </div>
            </div>

            {/* Subject Overview Table / Mock Cards */}
            <div className="rounded-xl border border-slate-800/80 bg-slate-900/50 overflow-hidden">
              <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Subject-Wise Attendance Breakdown
                </span>
                <span className="text-xs text-slate-400">Spring 2026 Semester</span>
              </div>

              <div className="divide-y divide-slate-800/60">
                {mockSubjects.map((sub) => (
                  <div
                    key={sub.code}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                          {sub.code}
                        </span>
                        <h4 className="text-sm font-semibold text-white">{sub.name}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Attended: {sub.attended}/{sub.total} classes</span>
                        <span>•</span>
                        <span className="text-slate-300 font-medium">{sub.action}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="w-32 hidden sm:block">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Current</span>
                          <span className="text-white font-bold">{sub.percentage}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`${sub.progressColor} h-1.5 rounded-full`}
                            style={{ width: `${sub.percentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="sm:hidden text-sm font-bold text-white mr-2">
                          {sub.percentage}%
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${sub.statusColor}`}
                        >
                          {sub.status === 'Safe' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          {sub.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Smart Simulation Banner inside Preview */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-900/30 via-purple-900/20 to-slate-900/40 border border-blue-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  <strong>Predictive Simulation:</strong> Attending the next 4 lectures will elevate Computer Networks from 75.6% to 81.6%.
                </span>
              </div>
              <span className="text-blue-400 font-semibold cursor-default shrink-0">
                Auto-calculated live ✨
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Features Section ===================== */}
      <section id="features" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-400 mb-4">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Built For University Students</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Engineered For Academic Peace of Mind
          </h2>
          <p className="text-base sm:text-lg text-slate-400 leading-relaxed">
            Eliminate attendance anxiety with intelligent tracking, predictive calculations,
            and automated safety margins.
          </p>
        </div>

        {/* 3 Core Features Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.title}
                className="glass-card p-6 sm:p-8 flex flex-col justify-between border-slate-800 hover:border-slate-700/80 transition-all duration-300 group hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/60 text-white group-hover:scale-105 group-hover:border-blue-500/40 transition-all shadow-md">
                      <IconComponent className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${feature.badgeColor}`}>
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-300 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-slate-300 leading-relaxed mb-6">
                    {feature.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                  {feature.highlights.map((highlight) => (
                    <div key={highlight} className="flex items-start gap-2.5 text-xs text-slate-400">
                      <Check className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===================== About Section ===================== */}
      <section id="about" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-slate-800/80">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-400">
              <Shield className="w-3.5 h-3.5" />
              <span>Academic Capstone Initiative</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              About AttendIQ — Built to Solve the 75% Attendance Struggle
            </h2>

            <p className="text-base text-slate-300 leading-relaxed">
              Every semester, thousands of engineering and university students face the constant anxiety of falling short
              of mandatory attendance requirements. Traditional methods like manual notebook tallying or clunky
              spreadsheets are prone to errors and don&apos;t offer predictive insights.
            </p>

            <p className="text-base text-slate-300 leading-relaxed">
              <strong>AttendIQ</strong> was conceived and developed as a <strong>B.Tech Computer Science and Engineering Capstone Project</strong> to
              provide students with algorithmic clarity. By combining real-time tracking with accurate bunk forecasting, AttendIQ
              helps students balance academics, extracurriculars, exam preparation, and medical leaves without panic.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  Timetable Synchronized
                </h4>
                <p className="text-xs text-slate-400">
                  Aligns with your weekly class routine so logging attendance takes only 5 seconds a day.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80">
                <h4 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-purple-400" />
                  Zero-Error Mathematics
                </h4>
                <p className="text-xs text-slate-400">
                  Strict floor and ceiling formulas ensure you never receive a surprise attendance shortage notice.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="glass-card p-6 sm:p-8 border-slate-800 relative overflow-hidden bg-gradient-to-b from-slate-900/70 to-slate-950/70">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl pointer-events-none" />
              
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-400" />
                Project Specifications
              </h3>

              <dl className="space-y-4 text-xs sm:text-sm">
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <dt className="text-slate-400">Project Type</dt>
                  <dd className="font-semibold text-white">B.Tech CSE Capstone</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <dt className="text-slate-400">Stack</dt>
                  <dd className="font-semibold text-slate-200">React • TypeScript • Tailwind CSS</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <dt className="text-slate-400">Target Criteria</dt>
                  <dd className="font-semibold text-emerald-400">Customizable (75% / 80% / 85%)</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-800">
                  <dt className="text-slate-400">Prediction Engine</dt>
                  <dd className="font-semibold text-blue-400">Inverse Threshold Formula</dd>
                </div>
                <div className="flex justify-between py-2">
                  <dt className="text-slate-400">Deployment</dt>
                  <dd className="font-semibold text-purple-400">Client-First Architecture</dd>
                </div>
              </dl>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <Link
                  to="/login"
                  className="btn-primary w-full text-center py-2.5 text-xs font-semibold rounded-lg justify-center"
                >
                  <span>Experience The Project</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== Pre-Footer CTA Section ===================== */}
      <section className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
        <div className="glass-card p-8 sm:p-14 border border-blue-500/20 bg-gradient-to-b from-blue-950/20 via-[#0f172a]/70 to-[#020617] relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-blue-500/15 blur-3xl pointer-events-none" />

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
            Take Control of Your Semester Attendance Today
          </h2>
          <p className="text-slate-300 max-w-xl mx-auto mb-8 text-sm sm:text-base leading-relaxed">
            Never guess whether you can afford to skip a class. Join AttendIQ and experience total academic clarity.
          </p>

          <Link
            to="/login"
            className="btn-primary px-8 py-3.5 text-base font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
          >
            <span>Get Started for Free</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </section>

      {/* ===================== Footer ===================== */}
      <footer className="border-t border-slate-800/80 bg-[#020617] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo & Project Tagline */}
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-base">AttendIQ</span>
            </div>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="text-xs sm:text-sm text-slate-400 font-medium">
              AttendIQ — B.Tech CSE Project
            </span>
          </div>

          {/* Quick Footer Links */}
          <div className="flex items-center gap-6 text-xs sm:text-sm text-slate-400">
            <a href="#home" className="hover:text-white transition-colors">Home</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#preview" className="hover:text-white transition-colors">Dashboard</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <Link to="/login" className="hover:text-blue-400 transition-colors font-medium">Login</Link>
          </div>

          {/* Copyright */}
          <div className="text-xs text-slate-400 text-center sm:text-right">
            &copy; {new Date().getFullYear()} AttendIQ. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
