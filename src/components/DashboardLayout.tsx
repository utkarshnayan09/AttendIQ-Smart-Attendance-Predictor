import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import StarfieldBackground from './StarfieldBackground';

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-dark-950 relative overflow-hidden">
      {/* Dynamic Starfield in Motion */}
      <StarfieldBackground />

      {/* Ambient glowing nebulas */}
      <div className="fixed -top-40 -left-40 w-[600px] h-[600px] bg-accent-blue/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse-glow" />
      <div className="fixed top-1/3 -right-40 w-[550px] h-[550px] bg-accent-purple/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed -bottom-40 left-1/3 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      {/* Grid texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <Sidebar />
      <main className="flex-1 min-w-0 pt-14 lg:pt-0 relative z-10">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
